<?php
/**
 * Verdant Roots (Astra child) bootstrap.
 *
 * @package VerdantRootsChild
 */

defined( 'ABSPATH' ) || exit;

define( 'VRC_VERSION', wp_get_theme()->get( 'Version' ) );
define( 'VRC_DIR', get_stylesheet_directory() );
define( 'VRC_URI', get_stylesheet_directory_uri() );

require_once VRC_DIR . '/inc/enqueue.php';
require_once VRC_DIR . '/inc/announcement-bar.php';
