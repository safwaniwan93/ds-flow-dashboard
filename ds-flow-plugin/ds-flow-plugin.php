<?php
/**
 * Plugin Name: DS Flow
 * Plugin URI:  https://example.com/ds-flow
 * Description: Connects to the DS Flow Dashboard to render dynamic promo sections.
 * Version:     1.0.1
 * Author:      DS Flow Team
 * Text Domain: ds-flow
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit; // Exit if accessed directly.
}

define( 'DS_FLOW_VERSION', '1.0.1' );
define( 'DS_FLOW_PLUGIN_DIR', plugin_dir_path( __FILE__ ) );
define( 'DS_FLOW_PLUGIN_URL', plugin_dir_url( __FILE__ ) );
// Set to your local Next.js URL for development
// Include necessary files
require_once DS_FLOW_PLUGIN_DIR . 'includes/class-ds-flow-settings.php';
require_once DS_FLOW_PLUGIN_DIR . 'includes/class-ds-flow-sync.php';
require_once DS_FLOW_PLUGIN_DIR . 'includes/class-ds-flow-shortcode.php';

// Initialize the plugin
function ds_flow_init() {
    new DS_Flow_Settings();
    new DS_Flow_Sync();
    new DS_Flow_Shortcode();
}
add_action( 'plugins_loaded', 'ds_flow_init' );
