<?php
/**
 * Quick view: rendered on demand through admin-ajax so listing pages stay light.
 *
 * @package VerdantRoots
 */

defined( 'ABSPATH' ) || exit;

function vr_ajax_quick_view(): void {
	$product_id = isset( $_GET['product_id'] ) ? absint( $_GET['product_id'] ) : 0; // phpcs:ignore WordPress.Security.NonceVerification -- read-only public data.
	$product    = $product_id ? wc_get_product( $product_id ) : null;
	if ( ! $product || 'publish' !== $product->get_status() ) {
		wp_send_json_error( array( 'message' => __( 'Product not found.', 'verdant-roots' ) ), 404 );
	}
	global $post;
	$post = get_post( $product_id ); // phpcs:ignore WordPress.WP.GlobalVariablesOverride
	setup_postdata( $post );
	ob_start();
	?>
	<div class="grid gap-5 sm:grid-cols-2">
		<div class="relative aspect-square overflow-hidden rounded-card bg-brand-50">
			<?php echo wp_kses_post( vr_product_thumb( $product, 'woocommerce_single' ) ); ?>
		</div>
		<div class="flex flex-col gap-3">
			<?php echo wp_kses_post( vr_rating_html( (float) $product->get_average_rating(), (int) $product->get_review_count() ) ); ?>
			<div class="text-lg font-bold"><?php echo wp_kses_post( $product->get_price_html() ); ?></div>
			<div class="text-ink-soft"><?php echo wp_kses_post( wpautop( $product->get_short_description() ) ); ?></div>
			<div class="vr-qv-form"><?php woocommerce_template_single_add_to_cart(); ?></div>
			<a class="vr-btn vr-btn--outline vr-btn--full" href="<?php echo esc_url( get_permalink( $product_id ) ); ?>"><?php esc_html_e( 'View full details', 'verdant-roots' ); ?></a>
		</div>
	</div>
	<?php
	wp_reset_postdata();
	wp_send_json_success( array( 'title' => $product->get_name(), 'html' => ob_get_clean() ) );
}
add_action( 'wp_ajax_vr_quick_view', 'vr_ajax_quick_view' );
add_action( 'wp_ajax_nopriv_vr_quick_view', 'vr_ajax_quick_view' );

/** Product thumbnail, falling back to generated artwork. */
function vr_product_thumb( WC_Product $product, string $size = 'woocommerce_thumbnail', string $class = 'h-full w-full object-cover' ): string {
	if ( $product->get_image_id() ) {
		return wp_get_attachment_image( $product->get_image_id(), $size, false, array( 'class' => $class, 'loading' => 'lazy', 'sizes' => '(min-width:1280px) 22vw, (min-width:768px) 30vw, 46vw' ) );
	}
	return vr_art( vr_product_tone( $product->get_id() ), $product->get_name() . ' — ' . __( 'placeholder image', 'verdant-roots' ) );
}
