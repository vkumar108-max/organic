<?php
/**
 * WooCommerce integration: we style WooCommerce, we do not replace it — payment
 * gateways, shipping, tax, coupons, stock and orders all stay native.
 *
 * @package VerdantRoots
 */

defined( 'ABSPATH' ) || exit;

// Theme provides all styling.
add_filter( 'woocommerce_enqueue_styles', '__return_empty_array' );

// Layout wrappers come from our own templates.
remove_action( 'woocommerce_before_main_content', 'woocommerce_output_content_wrapper', 10 );
remove_action( 'woocommerce_after_main_content', 'woocommerce_output_content_wrapper_end', 10 );
remove_action( 'woocommerce_sidebar', 'woocommerce_get_sidebar', 10 );
remove_action( 'woocommerce_before_main_content', 'woocommerce_breadcrumb', 20 );
// The theme renders its own result count + sort control in archive-product.php.
remove_action( 'woocommerce_before_shop_loop', 'woocommerce_result_count', 20 );
remove_action( 'woocommerce_before_shop_loop', 'woocommerce_catalog_ordering', 30 );

// Prices without trailing .00 (₹199, not ₹199.00).
add_filter( 'woocommerce_price_trim_zeros', '__return_true' );
add_filter( 'loop_shop_per_page', static fn() => 12 );
add_filter( 'loop_shop_columns', static fn() => 3 );
add_filter( 'woocommerce_output_related_products_args', static fn( $args ) => array_merge( $args, array( 'posts_per_page' => 4, 'columns' => 4 ) ) );
add_filter( 'woocommerce_breadcrumb_defaults', static fn( $d ) => array_merge( $d, array( 'delimiter' => '', 'wrap_before' => '<nav aria-label="Breadcrumb" class="py-3 text-sm"><ol class="flex flex-wrap items-center gap-1 text-ink-soft">', 'wrap_after' => '</ol></nav>', 'before' => '<li class="flex items-center gap-1">', 'after' => '</li>' ) ) );

/** Placeholder artwork instead of WooCommerce's grey box (works wherever WooCommerce asks for a placeholder). */
function vr_placeholder_img_html( string $tone, $size = 'woocommerce_thumbnail', string $class = '' ): string {
	$dimensions = wc_get_image_size( $size );
	return sprintf(
		'<img src="%1$s" alt="%2$s" class="woocommerce-placeholder wp-post-image %3$s" width="%4$d" height="%5$d" decoding="async">',
		esc_url( vr_art_url( $tone ) ),
		esc_attr__( 'Placeholder image', 'verdant-roots' ),
		esc_attr( $class ),
		(int) ( $dimensions['width'] ?? 300 ),
		(int) ( $dimensions['height'] ?? 300 )
	);
}

add_filter(
	'woocommerce_placeholder_img',
	static function ( $html, $size = 'woocommerce_thumbnail' ) {
		$id = get_the_ID();
		return vr_placeholder_img_html( $id && 'product' === get_post_type( $id ) ? vr_product_tone( $id ) : 'leaf', $size );
	},
	10,
	2
);

/** Cart & checkout rows know their product, so the artwork can match its category. */
add_filter(
	'woocommerce_cart_item_thumbnail',
	static function ( $thumbnail, $cart_item ) {
		$product = $cart_item['data'] ?? null;
		if ( $product instanceof WC_Product && ! $product->get_image_id() ) {
			$parent = $product->get_parent_id() ?: $product->get_id();
			$parent_product = wc_get_product( $parent );
			if ( $parent_product && $parent_product->get_image_id() ) {
				return $thumbnail; // variation inherits parent image via WooCommerce.
			}
			return vr_placeholder_img_html( vr_product_tone( $parent ) );
		}
		return $thumbnail;
	},
	10,
	2
);

/** Checkout fields tuned for the design: mobile is required, no company, "Landmark" label. */
add_filter(
	'woocommerce_checkout_fields',
	static function ( $fields ) {
		unset( $fields['billing']['billing_company'], $fields['shipping']['shipping_company'] );
		if ( isset( $fields['billing']['billing_phone'] ) ) {
			$fields['billing']['billing_phone']['required'] = true;
			$fields['billing']['billing_phone']['label']    = __( 'Mobile number', 'verdant-roots' );
		}
		if ( isset( $fields['billing']['billing_address_2'] ) ) {
			$fields['billing']['billing_address_2']['label']       = __( 'Landmark (optional)', 'verdant-roots' );
			$fields['billing']['billing_address_2']['placeholder'] = '';
		}
		return $fields;
	}
);

/**
 * When free shipping is available, offer only that (the "free above ₹X, else flat rate" rule the
 * storefront promises). Turn off with: add_filter( 'vr_hide_paid_shipping_when_free', '__return_false' );
 */
add_filter(
	'woocommerce_package_rates',
	static function ( $rates ) {
		if ( ! apply_filters( 'vr_hide_paid_shipping_when_free', true ) ) {
			return $rates;
		}
		$free = array();
		foreach ( $rates as $rate_id => $rate ) {
			if ( 'free_shipping' === $rate->get_method_id() ) {
				$free[ $rate_id ] = $rate;
			}
		}
		return $free ?: $rates;
	},
	100
);

/** Cart count badge kept fresh by WooCommerce cart fragments (also after AJAX add to cart). */
function vr_cart_count_html(): string {
	$count = WC()->cart ? WC()->cart->get_cart_contents_count() : 0;
	$label = $count > 0 ? sprintf( /* translators: %d items */ _n( 'Cart, %d item', 'Cart, %d items', $count, 'verdant-roots' ), $count ) : __( 'Cart', 'verdant-roots' );
	return '<span class="vr-cart-count" data-count="' . (int) $count . '" data-label="' . esc_attr( $label ) . '">' . ( $count > 0 ? '<span class="absolute -right-1.5 -top-1.5 grid h-5 min-w-5 place-items-center rounded-full bg-clay-500 px-1 text-[0.7rem] font-bold text-white" aria-hidden="true">' . ( $count > 99 ? '99+' : (int) $count ) . '</span>' : '' ) . '</span>';
}

add_filter(
	'woocommerce_add_to_cart_fragments',
	static function ( $fragments ) {
		$fragments['span.vr-cart-count'] = vr_cart_count_html();
		return $fragments;
	}
);

/** "Buy Now" sends the shopper straight to checkout after adding. */
add_filter(
	'woocommerce_add_to_cart_redirect',
	static function ( $url ) {
		return ! empty( $_REQUEST['vr_buy_now'] ) ? wc_get_checkout_url() : $url; // phpcs:ignore WordPress.Security.NonceVerification
	}
);

/** Ordering labels match the storefront. */
add_filter(
	'woocommerce_catalog_orderby',
	static fn() => array(
		'menu_order' => __( 'Recommended', 'verdant-roots' ),
		'popularity' => __( 'Popular', 'verdant-roots' ),
		'date'       => __( 'Newest', 'verdant-roots' ),
		'price'      => __( 'Price: Low to High', 'verdant-roots' ),
		'price-desc' => __( 'Price: High to Low', 'verdant-roots' ),
		'rating'     => __( 'Rating', 'verdant-roots' ),
	)
);
// Default ordering stays WooCommerce's own (menu_order). Popularity/price sorts rely on the product lookup table.

/** Free-shipping progress above cart totals. */
add_action(
	'woocommerce_before_cart_totals',
	static function () {
		$threshold = vr_free_shipping_threshold();
		$subtotal  = (float) WC()->cart->get_displayed_subtotal();
		if ( $threshold <= 0 || WC()->cart->is_empty() ) {
			return;
		}
		$remaining = max( 0, $threshold - $subtotal );
		$percent   = min( 100, (int) round( $subtotal / $threshold * 100 ) );
		echo '<div class="mb-4 rounded-lg bg-brand-50 p-3 text-sm"><p>';
		if ( $remaining > 0 ) {
			echo wp_kses_post( sprintf( /* translators: %s amount */ __( 'Add <strong>%s</strong> more for free shipping', 'verdant-roots' ), wc_price( $remaining ) ) );
		} else {
			esc_html_e( '🎉 You have unlocked free shipping', 'verdant-roots' );
		}
		echo '</p><div class="mt-2 h-1.5 overflow-hidden rounded-full bg-brand-200" role="progressbar" aria-valuenow="' . (int) $percent . '" aria-valuemin="0" aria-valuemax="100" aria-label="' . esc_attr__( 'Progress to free shipping', 'verdant-roots' ) . '"><div class="h-full rounded-full bg-brand-600" style="width:' . (int) $percent . '%"></div></div></div>';
	}
);

/** Wishlist entry in My Account. */
add_filter(
	'woocommerce_account_menu_items',
	static function ( $items ) {
		$logout = $items['customer-logout'] ?? null;
		unset( $items['customer-logout'] );
		$items['vr-wishlist'] = __( 'Wishlist', 'verdant-roots' );
		if ( $logout ) {
			$items['customer-logout'] = $logout;
		}
		return $items;
	}
);
add_filter(
	'woocommerce_get_endpoint_url',
	static function ( $url, $endpoint ) {
		return 'vr-wishlist' === $endpoint ? vr_page_url( 'wishlist' ) : $url;
	},
	10,
	2
);

/** Variation dropdown JS is needed by the quick-view modal on listing pages. */
add_action(
	'wp_enqueue_scripts',
	static function () {
		if ( is_shop() || is_product_taxonomy() || is_front_page() || is_search() || is_page( 'wishlist' ) ) {
			wp_enqueue_script( 'wc-add-to-cart-variation' );
			wp_enqueue_script( 'wc-add-to-cart' );
		}
	},
	20
);

/** Product loop "add to cart" link styling. */
add_filter(
	'woocommerce_loop_add_to_cart_args',
	static function ( $args, $product ) {
		$args['class'] = trim( ( $args['class'] ?? '' ) . ' vr-btn vr-btn--sm vr-btn--full' );
		return $args;
	},
	10,
	2
);

/** Reviews: rating select stays native; we only tidy the labels/markup via CSS. */
add_filter( 'woocommerce_product_review_comment_form_args', static fn( $args ) => $args );

/** Sample-review guard: never render placeholder ratings — WooCommerce only shows real ones. */

/**
 * Fetch products for home sections. $args: category (slug), tag (slug), featured, limit, orderby.
 *
 * @return WC_Product[]
 */
function vr_get_products( array $args = array() ): array {
	$query = array(
		'status'     => 'publish',
		'visibility' => 'catalog',
		'limit'      => 4,
		'orderby'    => 'popularity',
		'order'      => 'DESC',
	);
	foreach ( array( 'category', 'tag', 'featured', 'limit', 'orderby', 'order' ) as $key ) {
		if ( isset( $args[ $key ] ) && '' !== $args[ $key ] ) {
			$query[ $key ] = 'category' === $key || 'tag' === $key ? array( $args[ $key ] ) : $args[ $key ];
		}
	}
	return wc_get_products( $query );
}

/** Renders a responsive grid of product cards for an array of WC_Product. */
function vr_render_product_grid( array $products, int $columns = 4 ): void {
	if ( ! $products ) {
		return;
	}
	global $post;
	$xl = 3 === $columns ? '' : ' xl:grid-cols-4';
	echo '<ul class="products grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3' . esc_attr( $xl ) . '">';
	foreach ( $products as $product ) {
		$post = get_post( $product->get_id() ); // phpcs:ignore WordPress.WP.GlobalVariablesOverride
		setup_postdata( $post );
		$GLOBALS['product'] = $product;
		echo '<li>';
		wc_get_template_part( 'content', 'product' );
		echo '</li>';
	}
	echo '</ul>';
	wp_reset_postdata();
}
