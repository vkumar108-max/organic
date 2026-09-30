<?php
/**
 * Search: header form always searches products (name, category, tags via WooCommerce).
 *
 * @package VerdantRoots
 */

defined( 'ABSPATH' ) || exit;

/** Header search form searches the shop by default. */
add_filter(
	'pre_get_posts',
	static function ( WP_Query $query ) {
		if ( ! is_admin() && $query->is_main_query() && $query->is_search() && ! $query->get( 'post_type' ) && function_exists( 'wc_get_page_id' ) && ! isset( $_GET['post_type'] ) ) { // phpcs:ignore WordPress.Security.NonceVerification
			$query->set( 'post_type', array( 'product' ) );
		}
	}
);

/** Also match product categories and tags (WordPress only searches title/content by default). */
add_filter(
	'posts_search',
	static function ( string $search, WP_Query $query ) {
		global $wpdb;
		if ( is_admin() || ! $query->is_main_query() || ! $query->is_search() || '' === $search || 'product' !== ( (array) $query->get( 'post_type' ) )[0] ) {
			return $search;
		}
		$term = trim( (string) $query->get( 's' ) );
		if ( '' === $term ) {
			return $search;
		}
		$like = '%' . $wpdb->esc_like( $term ) . '%';
		$extra = $wpdb->prepare(
			" OR {$wpdb->posts}.ID IN (
				SELECT tr.object_id FROM {$wpdb->term_relationships} tr
				INNER JOIN {$wpdb->term_taxonomy} tt ON tt.term_taxonomy_id = tr.term_taxonomy_id AND tt.taxonomy IN ('product_cat','product_tag')
				INNER JOIN {$wpdb->terms} t ON t.term_id = tt.term_id
				WHERE t.name LIKE %s
			)",
			$like
		);
		// Insert the extra OR clause just inside the outer parentheses WordPress builds.
		return preg_replace( '/\)\)\s*$|\)\s*$/', $extra . ')', $search, 1 ) ?: $search;
	},
	10,
	2
);
