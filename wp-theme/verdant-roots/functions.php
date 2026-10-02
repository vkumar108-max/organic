<?php
/**
 * Verdant Roots theme bootstrap.
 *
 * @package VerdantRoots
 */

defined( 'ABSPATH' ) || exit;

define( 'VR_VERSION', '1.0.12' );
define( 'VR_DIR', get_template_directory() );
define( 'VR_URI', get_template_directory_uri() );

foreach ( array( 'icon-paths', 'helpers', 'art', 'setup', 'customizer', 'ads', 'search', 'wishlist', 'starter' ) as $vr_file ) {
	require_once VR_DIR . "/inc/{$vr_file}.php";
}

if ( class_exists( 'WooCommerce' ) ) {
	foreach ( array( 'woocommerce', 'product-fields', 'catalog', 'quick-view', 'wellness' ) as $vr_file ) {
		require_once VR_DIR . "/inc/{$vr_file}.php";
	}
}
