<?php
/**
 * Catalogue filtering: price / rating / attributes use WooCommerce's own query vars
 * (min_price, max_price, rating_filter, filter_{attribute}); we add "in stock only".
 * Filter links are plain URLs, so they work without JavaScript and are crawlable.
 *
 * @package VerdantRoots
 */

defined( 'ABSPATH' ) || exit;

add_action(
	'woocommerce_product_query',
	static function ( WP_Query $query ) {
		if ( ! empty( $_GET['instock'] ) ) { // phpcs:ignore WordPress.Security.NonceVerification
			$meta   = (array) $query->get( 'meta_query' );
			$meta[] = array( 'key' => '_stock_status', 'value' => 'instock' );
			$query->set( 'meta_query', $meta );
		}
	}
);

/** Current URL with query args changed (null removes). Always resets pagination. */
function vr_filter_url( array $args ): string {
	$base = ( is_shop() || is_product_taxonomy() || is_search() ) ? remove_query_arg( array( 'paged', 'page' ), ( is_paged() ? get_pagenum_link( 1 ) : ( is_search() ? home_url( '/' ) : ( is_shop() ? wc_get_page_permalink( 'shop' ) : get_term_link( get_queried_object() ) ) ) ) ) : wc_get_page_permalink( 'shop' );
	$keep = array();
	foreach ( array( 'post_type', 's', 'orderby', 'min_price', 'max_price', 'instock', 'rating_filter', 'product_cat' ) as $key ) {
		if ( isset( $_GET[ $key ] ) ) { // phpcs:ignore WordPress.Security.NonceVerification
			$keep[ $key ] = sanitize_text_field( wp_unslash( $_GET[ $key ] ) ); // phpcs:ignore WordPress.Security.NonceVerification
		}
	}
	foreach ( wc_get_attribute_taxonomies() as $attribute ) {
		foreach ( array( 'filter_' . $attribute->attribute_name, 'query_type_' . $attribute->attribute_name ) as $key ) {
			if ( isset( $_GET[ $key ] ) ) { // phpcs:ignore WordPress.Security.NonceVerification
				$keep[ $key ] = sanitize_text_field( wp_unslash( $_GET[ $key ] ) ); // phpcs:ignore WordPress.Security.NonceVerification
			}
		}
	}
	$merged = array_merge( $keep, $args );
	$merged = array_filter( $merged, static fn( $v ) => null !== $v && '' !== $v );
	return esc_url_raw( add_query_arg( $merged, $base ) );
}

/** Attribute terms present in the current (unfiltered-by-that-attribute) catalogue, for the sidebar. */
function vr_sidebar_attributes(): array {
	$out = array();
	foreach ( wc_get_attribute_taxonomies() as $attribute ) {
		$taxonomy = wc_attribute_taxonomy_name( $attribute->attribute_name );
		$terms    = get_terms( array( 'taxonomy' => $taxonomy, 'hide_empty' => true ) );
		if ( is_wp_error( $terms ) || count( $terms ) < 2 ) {
			continue;
		}
		$out[] = array( 'label' => $attribute->attribute_label, 'name' => $attribute->attribute_name, 'terms' => $terms );
	}
	return $out;
}

const VR_PRICE_BUCKETS = array(
	array( 'Under ₹200', null, 199 ),
	array( '₹200 – ₹500', 200, 500 ),
	array( '₹500 – ₹1,000', 501, 1000 ),
	array( 'Over ₹1,000', 1001, null ),
);
