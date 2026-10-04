<?php
/**
 * One-time starter setup on theme activation: creates the pages the design expects,
 * sets the static front page / blog page and switches Cart & Checkout to the classic
 * shortcodes (the theme styles those templates). Idempotent; never overwrites existing pages.
 *
 * @package VerdantRoots
 */

defined( 'ABSPATH' ) || exit;

function vr_policy_notice(): string {
	return '<p><em>' . esc_html__( 'Template text: replace bracketed items and have it reviewed by a qualified professional before publishing.', 'verdant-roots' ) . '</em></p>';
}

function vr_starter_pages(): array {
	$n = vr_policy_notice();
	return array(
		'about'                => array( 'About Us', '<p>[Add your brand story, sourcing and quality processes. Only state certifications or claims you can document.]</p><h2>What we offer</h2><p>A focused range of natural food products in convenient formats, each with clear pack sizes, pricing and product information.</p>' ),
		'contact'              => array( 'Contact Us', '<p>Questions about an order or a product? Email us and we will help.</p><p>Tip: add a form with the Contact Form 7 or WPForms plugin and paste its shortcode here.</p>' ),
		'faq'                  => array( 'FAQ', '<h2>How do I place an order?</h2><p>Open a product, choose a pack size, add it to your cart and check out.</p><h2>Is my payment information safe?</h2><p>Online payments are completed on the payment provider\'s secure page. This site never sees your card details.</p><h2>How can I track my order?</h2><p>Use the Track Order page with your order number and email.</p>' ),
		'track-order'          => array( 'Track Order', '[woocommerce_order_tracking]' ),
		'wishlist'             => array( 'Wishlist', '[vr_wishlist]' ),
		'categories'           => array( 'Categories', '[vr_categories]' ),
		'terms-and-conditions' => array( 'Terms & Conditions', $n . '<h2>Using this website</h2><p>By using this website you agree to these terms. [Complete with your legal terms.]</p>' ),
		'refund-policy'        => array( 'Refund Policy', $n . '<h2>Damaged or incorrect items</h2><p>[State the number of days and how customers should contact you.]</p>' ),
		'shipping-policy'      => array( 'Shipping Policy', $n . '<h2>Shipping charges</h2><p>[Describe your shipping charges and delivery times.]</p>' ),
		'disclaimer'           => array( 'Disclaimer', $n . '<h2>Not medical advice</h2><p>Information on this website is for general education only and is not intended to diagnose, treat, cure or prevent any disease. Our products are food items.</p>' ),
		'privacy-policy'       => array( 'Privacy Policy', $n . '<h2>Information we collect</h2><p>[Describe the data you collect, why, and how customers can contact you.]</p>' ),
	);
}

function vr_run_starter_setup(): void {
	if ( get_option( 'vr_starter_done' ) ) {
		return;
	}
	foreach ( vr_starter_pages() as $slug => [ $title, $content ] ) {
		if ( get_page_by_path( $slug ) ) {
			continue;
		}
		wp_insert_post( array( 'post_type' => 'page', 'post_status' => 'publish', 'post_name' => $slug, 'post_title' => $title, 'post_content' => $content ) );
	}

	$home = get_page_by_path( 'home' );
	if ( ! $home ) {
		$id = wp_insert_post( array( 'post_type' => 'page', 'post_status' => 'publish', 'post_name' => 'home', 'post_title' => 'Home', 'post_content' => '' ) );
		$home = get_post( $id );
	}
	$blog = get_page_by_path( 'blog' );
	if ( ! $blog ) {
		$id   = wp_insert_post( array( 'post_type' => 'page', 'post_status' => 'publish', 'post_name' => 'blog', 'post_title' => 'Blog', 'post_content' => '' ) );
		$blog = get_post( $id );
	}
	update_option( 'show_on_front', 'page' );
	update_option( 'page_on_front', $home->ID );
	update_option( 'page_for_posts', $blog->ID );

	if ( function_exists( 'wc_get_page_id' ) ) {
		foreach ( array( 'cart' => '[woocommerce_cart]', 'checkout' => '[woocommerce_checkout]' ) as $key => $shortcode ) {
			$id = wc_get_page_id( $key );
			if ( $id > 0 ) {
				$post = get_post( $id );
				if ( $post && false !== strpos( $post->post_content, 'wp:woocommerce/' ) ) {
					wp_update_post( array( 'ID' => $id, 'post_content' => $shortcode ) );
				}
			}
		}
	}
	update_option( 'vr_starter_done', 1 );
}
add_action( 'after_switch_theme', 'vr_run_starter_setup' );

/** [vr_categories] — all product categories as cards. */
add_shortcode(
	'vr_categories',
	static function () {
		if ( ! taxonomy_exists( 'product_cat' ) ) {
			return '';
		}
		ob_start();
		echo '<ul class="grid gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">';
		foreach ( vr_top_categories() as $term ) {
			echo '<li>';
			get_template_part( 'template-parts/category-card', null, array( 'term' => $term ) );
			echo '</li>';
		}
		echo '</ul>';
		return ob_get_clean();
	}
);

/** Categories shown in the navigation (mega menu, mobile menu): the Combos category is left out of the menus. */
function vr_nav_categories(): array {
	$combo = (string) vr_opt( 'combo_slug', 'combos' );
	return array_values( array_filter( vr_top_categories(), static fn( $t ) => $t->slug !== $combo && 'combos' !== $t->slug ) );
}

/** Top-level, visible product categories in admin-defined order. */
function vr_top_categories(): array {
	$terms = get_terms( array( 'taxonomy' => 'product_cat', 'parent' => 0, 'hide_empty' => false, 'orderby' => 'menu_order', 'exclude' => array( (int) get_option( 'default_product_cat' ) ) ) );
	return is_wp_error( $terms ) ? array() : array_values( $terms );
}
