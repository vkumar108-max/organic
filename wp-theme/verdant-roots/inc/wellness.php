<?php
/**
 * "Herbal & Wellness" home section: four category cards, plus the four WooCommerce product categories
 * behind them (created once, so they show up under Products → Categories and can hold products).
 *
 * @package VerdantRoots
 */

defined( 'ABSPATH' ) || exit;

/** slug => [ name, short neutral description ]. Edit or delete them freely in Products → Categories. */
function vr_wellness_defaults(): array {
	return array(
		'herbal-powder'      => array( 'Herbal Powder', 'Herbal and leaf powders for everyday use.' ),
		'superfood-powder'   => array( 'Superfood Powder', 'Fruit, leaf and vegetable powder blends.' ),
		'immunity-products'  => array( 'Immunity Products', 'Products grouped for everyday wellness routines.' ),
		'nutrition-products' => array( 'Nutrition Products', 'Everyday nutrition products for your pantry.' ),
	);
}

/**
 * Create the four categories once (admin only). Flagged afterwards, so a category you delete or rename stays that way.
 */
add_action(
	'admin_init',
	static function () {
		if ( get_option( 'vr_wellness_cats_created' ) || ! current_user_can( 'manage_product_terms' ) || ! taxonomy_exists( 'product_cat' ) ) {
			return;
		}
		$order = 20;
		foreach ( vr_wellness_defaults() as $slug => [ $name, $desc ] ) {
			if ( ! term_exists( $slug, 'product_cat' ) ) {
				$res = wp_insert_term( $name, 'product_cat', array( 'slug' => $slug, 'description' => $desc ) );
				if ( ! is_wp_error( $res ) ) {
					update_term_meta( $res['term_id'], 'order', $order );
				}
			}
			++$order;
		}
		update_option( 'vr_wellness_cats_created', 1, false );
	}
);

/** Terms for the section, in the Customizer order (max 4); missing slugs are skipped. */
function vr_wellness_cats(): array {
	$slugs = array_filter( array_map( 'sanitize_title', explode( ',', (string) vr_opt( 'wellness_cats', 'herbal-powder, superfood-powder, immunity-products, nutrition-products' ) ) ) );
	$terms = array();
	foreach ( array_slice( $slugs, 0, 4 ) as $slug ) {
		$term = get_term_by( 'slug', $slug, 'product_cat' );
		if ( $term instanceof WP_Term ) {
			$terms[] = $term;
		}
	}
	return $terms;
}
