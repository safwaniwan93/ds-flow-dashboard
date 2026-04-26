<?php
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

class DS_Flow_Sync {

    public function __construct() {
        // Hooks for config fetch
        add_action( 'ds_flow_trigger_fetch', array( $this, 'fetch_config' ) );
        add_action( 'admin_post_ds_flow_manual_fetch', array( $this, 'manual_fetch_config' ) );

        // Hooks for WooCommerce product sync
        add_action( 'admin_post_ds_flow_manual_sync', array( $this, 'manual_sync_products' ) );
        add_action( 'woocommerce_update_product', array( $this, 'event_driven_sync' ), 10, 2 );

        // Fallback scheduled sync events
        if ( ! wp_next_scheduled( 'ds_flow_scheduled_config_refresh' ) ) {
            wp_schedule_event( time(), 'hourly', 'ds_flow_scheduled_config_refresh' ); // Actually we want 15-30m, but hourly is safe fallback
        }
        add_action( 'ds_flow_scheduled_config_refresh', array( $this, 'fetch_config' ) );

        // Webhook for instant cache clear
        add_action( 'rest_api_init', array( $this, 'register_webhook' ) );
    }

    public function register_webhook() {
        register_rest_route( 'ds-flow/v1', '/webhook', array(
            'methods' => 'POST',
            'callback' => array( $this, 'handle_webhook' ),
            'permission_callback' => '__return_true'
        ) );
    }

    public function handle_webhook( WP_REST_Request $request ) {
        $auth_header = $request->get_header('authorization');
        $site_token = get_option( 'ds_flow_site_token' );
        $provided_hash = str_replace('Bearer ', '', $auth_header);
        
        if ( ! $site_token || ! $auth_header || hash('sha256', $site_token) !== $provided_hash ) {
            return new WP_Error( 'unauthorized', 'Invalid or missing token', array( 'status' => 401 ) );
        }

        $body = $request->get_json_params();
        if ( isset($body['action']) && $body['action'] === 'clear_config_cache' ) {
            delete_transient( 'ds_flow_config' );
            // Optionally auto-fetch here, or let the next page load fetch it
            $this->fetch_config();
            return new WP_REST_Response( array( 'success' => true, 'message' => 'Cache cleared and config refetched.' ), 200 );
        }

        return new WP_REST_Response( array( 'success' => false, 'message' => 'Unknown action' ), 400 );
    }

    public function fetch_config() {
        $site_token = get_option( 'ds_flow_site_token' );
        if ( ! $site_token ) return false;

        $api_base_url = get_option('ds_flow_api_base_url', 'https://ds-flow-dashboard.vercel.app/api/v1');
        $response = wp_remote_get( $api_base_url . '/site/config', array(
            'headers' => array(
                'Authorization' => 'Bearer ' . $site_token,
                'Content-Type'  => 'application/json',
            ),
            'timeout' => 15,
        ) );

        if ( ! is_wp_error( $response ) && wp_remote_retrieve_response_code( $response ) === 200 ) {
            $body = wp_remote_retrieve_body( $response );
            $data = json_decode( $body, true );

            if ( isset( $data['config'] ) ) {
                // Cache for 30 minutes
                set_transient( 'ds_flow_config', $data['config'], 30 * MINUTE_IN_SECONDS );
                update_option( 'ds_flow_config_version', isset($data['version']) ? sanitize_text_field($data['version']) : '' );
                update_option( 'ds_flow_last_fetch', current_time( 'mysql' ) );
                return true;
            }
        }
        return false;
    }

    public function manual_fetch_config() {
        if ( ! isset( $_POST['ds_flow_nonce'] ) || ! wp_verify_nonce( $_POST['ds_flow_nonce'], 'ds_flow_manual_fetch_action' ) ) {
            wp_die( 'Invalid nonce' );
        }
        if ( ! current_user_can( 'manage_options' ) ) wp_die( 'Unauthorized' );

        $success = $this->fetch_config();
        
        if ( $success ) {
            add_settings_error( 'ds_flow_messages', 'ds_flow_message', 'Config fetched successfully.', 'updated' );
        } else {
            add_settings_error( 'ds_flow_messages', 'ds_flow_message', 'Config fetch failed.', 'error' );
        }
        
        set_transient( 'settings_errors', get_settings_errors(), 30 );
        wp_redirect( admin_url( 'admin.php?page=ds-flow' ) );
        exit;
    }

    public function sync_products( $product_ids = array() ) {
        $site_token = get_option( 'ds_flow_site_token' );
        if ( ! $site_token || ! class_exists( 'WooCommerce' ) ) return false;

        // Fetch products
        $args = array(
            'status' => 'publish',
            'type'   => 'simple',
            'limit'  => -1,
        );

        if ( ! empty( $product_ids ) ) {
            $args['include'] = $product_ids;
        }

        $products = wc_get_products( $args );
        $payload = array();

        foreach ( $products as $product ) {
            $image_id = $product->get_image_id();
            $image_url = $image_id ? wp_get_attachment_image_url( $image_id, 'full' ) : '';

            $payload[] = array(
                'wcProductId'  => (string) $product->get_id(),
                'sku'          => $product->get_sku(),
                'name'         => $product->get_name(),
                'price'        => $product->get_price(), // Legacy support
                'regularPrice' => $product->get_regular_price() ? $product->get_regular_price() : $product->get_price(),
                'activePrice'  => $product->get_price(),
                'stockStatus'  => $product->get_stock_status(),
                'image'        => $image_url,
            );
        }

        if ( empty( $payload ) ) return true; // Nothing to sync

        $api_base_url = get_option('ds_flow_api_base_url', 'https://ds-flow-dashboard.vercel.app/api/v1');
        $response = wp_remote_post( $api_base_url . '/site/sync/products', array( // Dashboard endpoint (needs implementation in phase 3)
            'headers' => array(
                'Authorization' => 'Bearer ' . $site_token,
                'Content-Type'  => 'application/json',
            ),
            'body'    => wp_json_encode( array( 'products' => $payload ) ),
            'timeout' => 30,
        ) );

        if ( ! is_wp_error( $response ) && wp_remote_retrieve_response_code( $response ) === 200 ) {
            update_option( 'ds_flow_last_sync', current_time( 'mysql' ) );
            return true;
        }
        return false;
    }

    public function manual_sync_products() {
        if ( ! isset( $_POST['ds_flow_nonce'] ) || ! wp_verify_nonce( $_POST['ds_flow_nonce'], 'ds_flow_manual_sync_action' ) ) {
            wp_die( 'Invalid nonce' );
        }
        if ( ! current_user_can( 'manage_options' ) ) wp_die( 'Unauthorized' );

        $success = $this->sync_products();
        
        if ( $success ) {
            add_settings_error( 'ds_flow_messages', 'ds_flow_message', 'Products synced successfully.', 'updated' );
        } else {
            add_settings_error( 'ds_flow_messages', 'ds_flow_message', 'Product sync failed.', 'error' );
        }

        set_transient( 'settings_errors', get_settings_errors(), 30 );
        wp_redirect( admin_url( 'admin.php?page=ds-flow' ) );
        exit;
    }

    public function event_driven_sync( $product_id, $product ) {
        if ( $product->is_type( 'simple' ) ) {
            // Background sync ideally, but synchronous for MVP
            $this->sync_products( array( $product_id ) );
        }
    }
}
