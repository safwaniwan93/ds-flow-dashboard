<?php
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

class DS_Flow_Settings {

    public function __construct() {
        add_action( 'admin_menu', array( $this, 'add_plugin_page' ) );
        add_action( 'admin_init', array( $this, 'page_init' ) );
        add_action( 'admin_post_ds_flow_connect', array( $this, 'handle_connect' ) );
        add_action( 'admin_post_ds_flow_disconnect', array( $this, 'handle_disconnect' ) );
    }

    public function add_plugin_page() {
        add_menu_page(
            'DS Flow Settings', 
            'DS Flow', 
            'manage_options', 
            'ds-flow', 
            array( $this, 'create_admin_page' ), 
            'dashicons-superhero', 
            81
        );
    }

    public function create_admin_page() {
        $site_token = get_option( 'ds_flow_site_token' );
        $last_sync = get_option( 'ds_flow_last_sync', 'Never' );
        $last_fetch = get_option( 'ds_flow_last_fetch', 'Never' );
        ?>
        <div class="wrap">
            <h1>DS Flow Settings</h1>

            <?php settings_errors(); ?>

            <div style="display: flex; gap: 20px;">
                <div style="flex: 2;">
                    <?php if ( ! $site_token ) : ?>
                        <div class="card" style="max-width: 100%;">
                            <h2>Connect to Dashboard</h2>
                            <p>Generate a connection key in your DS Flow dashboard and paste it here.</p>
                            <form method="post" action="<?php echo esc_url( admin_url( 'admin-post.php' ) ); ?>">
                                <input type="hidden" name="action" value="ds_flow_connect">
                                <?php wp_nonce_field( 'ds_flow_connect_action', 'ds_flow_nonce' ); ?>
                                <table class="form-table">
                                    <tr valign="top">
                                        <th scope="row">Connection Key</th>
                                        <td><input type="text" name="connection_key" style="width: 100%; max-width: 400px;" required /></td>
                                    </tr>
                                    <tr valign="top">
                                        <th scope="row">Dashboard API Base URL</th>
                                        <td>
                                            <input type="url" name="api_base_url" value="<?php echo esc_attr( get_option('ds_flow_api_base_url', 'https://ds-flow-dashboard.vercel.app/api/v1') ); ?>" style="width: 100%; max-width: 400px;" required />
                                            <p class="description">Default is https://ds-flow-dashboard.vercel.app/api/v1</p>
                                        </td>
                                    </tr>
                                </table>
                                <?php submit_button( 'Connect' ); ?>
                            </form>
                        </div>
                    <?php else : ?>
                        <div class="notice notice-success inline" style="margin-top: 20px;"><p><strong>Status:</strong> Connected to DS Flow Dashboard.</p></div>
                        
                        <div class="card" style="max-width: 100%; margin-top: 20px;">
                            <h2>Manage Connection</h2>
                            <form method="post" action="<?php echo esc_url( admin_url( 'admin-post.php' ) ); ?>" style="display: inline-block;">
                                <input type="hidden" name="action" value="ds_flow_disconnect">
                                <?php wp_nonce_field( 'ds_flow_disconnect_action', 'ds_flow_nonce' ); ?>
                                <?php submit_button( 'Disconnect', 'delete' ); ?>
                            </form>
                        </div>

                        <div class="card" style="max-width: 100%; margin-top: 20px;">
                            <h2>Actions</h2>
                            <form method="post" action="<?php echo esc_url( admin_url( 'admin-post.php' ) ); ?>" style="display: inline-block; margin-right: 10px;">
                                <input type="hidden" name="action" value="ds_flow_manual_sync">
                                <?php wp_nonce_field( 'ds_flow_manual_sync_action', 'ds_flow_nonce' ); ?>
                                <?php submit_button( 'Manual WooCommerce Sync', 'primary' ); ?>
                            </form>
                            <form method="post" action="<?php echo esc_url( admin_url( 'admin-post.php' ) ); ?>" style="display: inline-block;">
                                <input type="hidden" name="action" value="ds_flow_manual_fetch">
                                <?php wp_nonce_field( 'ds_flow_manual_fetch_action', 'ds_flow_nonce' ); ?>
                                <?php submit_button( 'Refresh Config Cache', 'secondary' ); ?>
                            </form>
                        </div>
                    <?php endif; ?>
                </div>

                <?php if ( $site_token ) : ?>
                <div style="flex: 1;">
                    <div class="card" style="max-width: 100%;">
                        <h2>Debug Panel</h2>
                        <ul>
                            <li><strong>Site Token:</strong> <code><?php echo esc_html( substr( $site_token, 0, 8 ) . '...' ); ?></code></li>
                            <li><strong>Domain Detected:</strong> <code><?php echo esc_html( site_url() ); ?></code></li>
                            <li><strong>Last Woo Sync:</strong> <?php echo esc_html( $last_sync ); ?></li>
                            <li><strong>Last Config Fetch:</strong> <?php echo esc_html( $last_fetch ); ?></li>
                            <li><strong>Cached Version:</strong> <code><?php echo esc_html( get_option( 'ds_flow_config_version', 'None' ) ); ?></code></li>
                        </ul>
                    </div>
                </div>
                <?php endif; ?>
            </div>
        </div>
        <?php
    }

    public function page_init() {
        // ...
    }

    public function handle_connect() {
        if ( ! isset( $_POST['ds_flow_nonce'] ) || ! wp_verify_nonce( $_POST['ds_flow_nonce'], 'ds_flow_connect_action' ) ) {
            wp_die( 'Invalid nonce' );
        }

        if ( ! current_user_can( 'manage_options' ) ) {
            wp_die( 'Unauthorized' );
        }

        $connection_key = sanitize_text_field( $_POST['connection_key'] );
        $api_base_url = esc_url_raw( $_POST['api_base_url'] );
        $domain = site_url();

        update_option('ds_flow_api_base_url', $api_base_url);

        $response = wp_remote_post( $api_base_url . '/site/connect', array(
            'headers'     => array( 'Content-Type' => 'application/json' ),
            'body'        => wp_json_encode( array(
                'connectionKey' => $connection_key,
                'domain'        => $domain,
            ) ),
            'timeout'     => 15,
        ) );

        if ( is_wp_error( $response ) ) {
            wp_die( '<h1>DS Flow Connection Error</h1><p>We could not reach the Next.js server.</p><p><strong>Technical Error:</strong> ' . esc_html($response->get_error_message()) . '</p><p>Please share this error message with your AI assistant.</p><a href="' . admin_url('admin.php?page=ds-flow') . '">Go Back</a>' );
        } else {
            $body = wp_remote_retrieve_body( $response );
            $data = json_decode( $body, true );

            if ( wp_remote_retrieve_response_code( $response ) === 200 && ! empty( $data['siteToken'] ) ) {
                update_option( 'ds_flow_site_token', sanitize_text_field( $data['siteToken'] ) );
                add_settings_error( 'ds_flow_messages', 'ds_flow_message', 'Connected successfully.', 'updated' );
                
                // Immediately trigger a config fetch
                do_action('ds_flow_trigger_fetch');
            } else {
                $error_msg = isset( $data['error'] ) ? $data['error'] : 'Unknown error. HTTP Code: ' . wp_remote_retrieve_response_code( $response ) . ' Body: ' . wp_remote_retrieve_body( $response );
                wp_die( '<h1>DS Flow Connection Error</h1><p>Next.js server rejected the request.</p><p><strong>Error:</strong> ' . esc_html( $error_msg ) . '</p><p>Please share this error message with your AI assistant.</p><a href="' . admin_url('admin.php?page=ds-flow') . '">Go Back</a>' );
            }
        }

        set_transient( 'settings_errors', get_settings_errors(), 30 );
        wp_redirect( admin_url( 'admin.php?page=ds-flow' ) );
        exit;
    }

    public function handle_disconnect() {
        if ( ! isset( $_POST['ds_flow_nonce'] ) || ! wp_verify_nonce( $_POST['ds_flow_nonce'], 'ds_flow_disconnect_action' ) ) {
            wp_die( 'Invalid nonce' );
        }

        if ( ! current_user_can( 'manage_options' ) ) {
            wp_die( 'Unauthorized' );
        }

        delete_option( 'ds_flow_site_token' );
        delete_transient( 'ds_flow_config' );
        update_option( 'ds_flow_config_version', '' );

        add_settings_error( 'ds_flow_messages', 'ds_flow_message', 'Disconnected successfully.', 'updated' );
        set_transient( 'settings_errors', get_settings_errors(), 30 );
        wp_redirect( admin_url( 'admin.php?page=ds-flow' ) );
        exit;
    }
}
