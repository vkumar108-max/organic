<?php
/**
 * Single product layout (same structure as the Next.js product page).
 * Gallery = WooCommerce's own (swipe, zoom, fullscreen lightbox via theme support).
 *
 * @package VerdantRoots
 */

defined( 'ABSPATH' ) || exit;

global $product;
$vr_id   = $product->get_id();
$vr_high = vr_meta_lines( $vr_id, '_vr_highlights' );
$vr_ing  = trim( (string) get_post_meta( $vr_id, '_vr_ingredients', true ) );
$vr_use  = trim( (string) get_post_meta( $vr_id, '_vr_usage', true ) );
$vr_stor = trim( (string) get_post_meta( $vr_id, '_vr_storage', true ) );
$vr_nut  = vr_meta_pairs( $vr_id, '_vr_nutrition' );
$vr_faqs = vr_meta_pairs( $vr_id, '_vr_faqs' );
$vr_cats = get_the_terms( $vr_id, 'product_cat' );
$vr_cat  = ( $vr_cats && ! is_wp_error( $vr_cats ) ) ? $vr_cats[0] : null;

$vr_placeholder = static fn( string $text ): string => '<p class="rounded-lg border border-dashed border-clay-500/50 bg-sand-50 px-4 py-3 text-sm text-clay-600"><strong class="font-semibold">' . esc_html__( 'Placeholder:', 'verdant-roots' ) . '</strong> ' . esc_html( $text ) . '</p>';

do_action( 'woocommerce_before_single_product' );
if ( post_password_required() ) {
	echo get_the_password_form(); // phpcs:ignore WordPress.Security.EscapeOutput
	return;
}
?>
<div id="product-<?php the_ID(); ?>" <?php wc_product_class( '', $product ); ?>>
	<div class="grid gap-8 lg:grid-cols-2 lg:gap-14">
		<div class="lg:sticky lg:top-40 lg:self-start"><?php woocommerce_show_product_images(); ?></div>

		<div class="summary entry-summary space-y-5">
			<?php if ( $vr_cat ) : ?><a href="<?php echo esc_url( get_term_link( $vr_cat ) ); ?>" class="text-sm font-bold uppercase tracking-wider text-clay-500 hover:underline"><?php echo esc_html( $vr_cat->name ); ?></a><?php endif; ?>
			<h1 class="text-3xl font-semibold sm:text-4xl"><?php the_title(); ?></h1>
			<div class="flex flex-wrap items-center gap-3">
				<?php if ( $product->get_review_count() ) : echo vr_rating_html( (float) $product->get_average_rating(), 0, 18 ); // phpcs:ignore WordPress.Security.EscapeOutput ?>
					<span class="font-medium"><?php echo esc_html( number_format_i18n( (float) $product->get_average_rating(), 1 ) ); ?></span>
					<a href="#reviews" class="text-sm text-ink-soft underline"><?php echo esc_html( sprintf( /* translators: %d reviews */ _n( '%d review', '%d reviews', $product->get_review_count(), 'verdant-roots' ), $product->get_review_count() ) ); ?></a>
				<?php else : ?><a href="#reviews" class="text-sm text-ink-soft underline"><?php esc_html_e( 'No reviews yet', 'verdant-roots' ); ?></a><?php endif; ?>
				<?php if ( $product->get_sku() ) : ?><span class="text-sm text-ink-soft">SKU: <?php echo esc_html( $product->get_sku() ); ?></span><?php endif; ?>
			</div>
			<div class="vr-price flex flex-wrap items-baseline gap-x-2 text-3xl font-bold"><?php echo wp_kses_post( $product->get_price_html() ); ?><?php $vr_d = vr_discount_percent( $product ); if ( $vr_d > 0 ) : ?><span class="rounded-full bg-brand-100 px-2 py-0.5 text-xs font-bold text-brand-800"><?php echo (int) $vr_d; ?>% OFF</span><?php endif; ?></div>
			<div class="text-ink-soft"><?php echo wp_kses_post( wpautop( $product->get_short_description() ) ); ?></div>

			<?php woocommerce_template_single_add_to_cart(); ?>

			<div class="flex flex-wrap items-center gap-3">
				<?php echo vr_wishlist_button( $vr_id, $product->get_name(), 'full' ); // phpcs:ignore WordPress.Security.EscapeOutput ?>
				<button type="button" class="vr-btn vr-btn--ghost" data-share="<?php echo esc_url( get_permalink( $vr_id ) ); ?>" data-title="<?php echo esc_attr( $product->get_name() ); ?>"><?php vr_e_icon( 'share', 18 ); esc_html_e( 'Share', 'verdant-roots' ); ?></button>
			</div>
			<ul class="grid gap-2 rounded-card bg-brand-50 p-4 text-sm text-ink-soft sm:grid-cols-2">
				<li class="flex items-center gap-2"><?php vr_e_icon( 'lock', 16, 'text-brand-700' ); esc_html_e( 'Secure checkout', 'verdant-roots' ); ?></li>
				<li class="flex items-center gap-2"><?php vr_e_icon( 'truck', 16, 'text-brand-700' ); echo esc_html( sprintf( /* translators: %d amount */ __( 'Free shipping over ₹%d', 'verdant-roots' ), vr_free_shipping_threshold() ) ); ?></li>
			</ul>
		</div>
	</div>

	<div class="mt-14 max-w-4xl space-y-4">
		<?php if ( $vr_high ) : ?>
			<section aria-labelledby="highlights" class="rounded-card border border-line p-5">
				<h2 id="highlights" class="mb-3 text-xl font-semibold"><?php esc_html_e( 'Product highlights', 'verdant-roots' ); ?></h2>
				<ul class="list-disc space-y-1.5 pl-5 text-ink-soft"><?php foreach ( $vr_high as $vr_h ) : ?><li><?php echo esc_html( $vr_h ); ?></li><?php endforeach; ?></ul>
			</section>
		<?php endif; ?>
		<?php
		$vr_nut_html = $vr_nut
			? '<table class="w-full max-w-md text-left text-sm"><caption class="sr-only">' . esc_html__( 'Nutritional information', 'verdant-roots' ) . '</caption><thead><tr><th class="border-b border-line py-2">' . esc_html__( 'Nutrient', 'verdant-roots' ) . '</th><th class="border-b border-line py-2">' . esc_html__( 'Per serving', 'verdant-roots' ) . '</th></tr></thead><tbody>' . implode( '', array_map( static fn( $r ) => '<tr><td class="border-b border-line py-2">' . esc_html( $r[0] ) . '</td><td class="border-b border-line py-2">' . esc_html( $r[1] ) . '</td></tr>', $vr_nut ) ) . '</tbody></table>'
			: $vr_placeholder( __( 'Nutritional values to be supplied from lab-verified data. Not shown until available.', 'verdant-roots' ) );
		vr_render_accordion(
			array(
				array( __( 'Description', 'verdant-roots' ), $product->get_description() ? wpautop( $product->get_description() ) : '<p class="text-ink-soft">' . esc_html( $product->get_short_description() ) . '</p>' ),
				array( __( 'Ingredients', 'verdant-roots' ), $vr_ing ? '<p class="text-ink-soft">' . nl2br( esc_html( $vr_ing ) ) . '</p>' : $vr_placeholder( __( 'Ingredient list to be supplied by the business. Do not publish until verified against the pack label.', 'verdant-roots' ) ) ),
				array( __( 'How to use', 'verdant-roots' ), $vr_use ? '<p class="text-ink-soft">' . nl2br( esc_html( $vr_use ) ) . '</p>' : $vr_placeholder( __( 'Usage instructions to be supplied by the business. No dosage or health guidance is provided by default.', 'verdant-roots' ) ) ),
				array( __( 'Nutritional information', 'verdant-roots' ), $vr_nut_html ),
				array( __( 'Storage information', 'verdant-roots' ), $vr_stor ? '<p class="text-ink-soft">' . nl2br( esc_html( $vr_stor ) ) . '</p>' : $vr_placeholder( __( 'Storage instructions to be supplied by the business.', 'verdant-roots' ) ) ),
				array( __( 'Shipping information', 'verdant-roots' ), '<p class="text-ink-soft">' . esc_html( sprintf( /* translators: %d amount */ __( 'Free shipping on orders above ₹%d. Shipping charges and delivery estimates are calculated at checkout.', 'verdant-roots' ), vr_free_shipping_threshold() ) ) . '</p>' ),
			),
			'0'
		);
		?>
	</div>

	<section id="reviews" aria-labelledby="reviews-title" class="mt-14 scroll-mt-40 max-w-4xl">
		<h2 id="reviews-title" class="mb-4 text-2xl font-semibold"><?php esc_html_e( 'Customer reviews', 'verdant-roots' ); ?></h2>
		<?php comments_template(); ?>
	</section>

	<?php if ( $vr_faqs ) : ?>
		<section aria-labelledby="faq-title" class="mt-14 max-w-3xl">
			<h2 id="faq-title" class="mb-4 text-2xl font-semibold"><?php esc_html_e( 'Frequently asked questions', 'verdant-roots' ); ?></h2>
			<?php vr_render_accordion( array_map( static fn( $p ) => array( $p[0], '<p class="text-ink-soft">' . esc_html( $p[1] ) . '</p>' ), $vr_faqs ) ); vr_faq_schema( $vr_faqs ); ?>
		</section>
	<?php endif; ?>

	<div class="mt-14"><?php woocommerce_output_related_products(); ?></div>
</div>
<?php do_action( 'woocommerce_after_single_product' );
