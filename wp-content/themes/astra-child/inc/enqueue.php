<?php
/**
 * Front-end assets.
 *
 * @package VerdantRootsChild
 */

defined( 'ABSPATH' ) || exit;

/**
 * Loads the child stylesheet after Astra's own stylesheet so our rules win
 * without !important.
 *
 * Priority 20 runs after Astra's enqueue. The dependency is only declared
 * when Astra's handle is actually registered, so a renamed handle in a future
 * Astra release can never silently drop this stylesheet.
 */
function vrc_enqueue_styles(): void {
	$deps = wp_style_is( 'astra-theme-css', 'registered' ) ? array( 'astra-theme-css' ) : array();

	wp_enqueue_style( 'vrc-child-style', get_stylesheet_uri(), $deps, VRC_VERSION );
}
add_action( 'wp_enqueue_scripts', 'vrc_enqueue_styles', 20 );
