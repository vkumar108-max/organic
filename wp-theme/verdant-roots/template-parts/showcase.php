<?php
/**
 * 3D coverflow showcase (up to 5 products of one category, default "makhana").
 * Progressive: without JS it is a swipeable scroll-snap row; with JS it becomes a 3D carousel.
 * Each card shows the product photo (or generated pouch artwork); an optional .glb model
 * (product field "3D model file URL") turns the card into a rotatable <model-viewer>.
 *
 * @package VerdantRoots
 */

defined( 'ABSPATH' ) || exit;
if ( ! function_exists( 'vr_get_products' ) ) {
	return;
}

$vr_slug  = (string) vr_opt( 'showcase_slug', 'makhana' );
$vr_term  = get_term_by( 'slug', $vr_slug, 'product_cat' );
$vr_items = $vr_term ? vr_get_products( array( 'category' => $vr_slug, 'limit' => 5, 'orderby' => 'menu_order', 'order' => 'ASC' ) ) : array();
if ( ! $vr_items ) {
	if ( current_user_can( 'manage_woocommerce' ) ) {
		echo '<p class="container-page my-6 rounded-lg border border-dashed border-clay-500/50 bg-sand-50 p-4 text-sm text-clay-600">' . esc_html( sprintf( /* translators: %s slug */ __( 'Shop manager note: the 3D showcase slider is hidden because the category "%s" has no published products. Add up to 5 products to it (or change the slug in Customizer → Verdant Roots).', 'verdant-roots' ), $vr_slug ) ) . '</p>';
	}
	return;
}
$vr_tone  = vr_tone_for_slug( $vr_slug );
$vr_title = (string) vr_opt( 'showcase_title', 'The Makhana Collection' );
$vr_total = count( $vr_items );
$vr_glb   = false;
?>
<section class="vr-showcase relative isolate overflow-hidden text-white" aria-labelledby="showcase-title" data-showcase>
	<div class="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_30%_20%,var(--color-brand-600),var(--color-brand-900)_65%)]"></div>
	<div class="vr-puffs" aria-hidden="true"><?php for ( $vr_p = 0; $vr_p < 9; $vr_p++ ) : ?><span style="--s:<?php echo (int) ( 14 + ( $vr_p * 7 ) % 26 ); ?>px;--x:<?php echo (int) ( 4 + ( $vr_p * 11 ) % 92 ); ?>%;--d:<?php echo (int) ( 6 + ( $vr_p * 3 ) % 9 ); ?>s;--delay:-<?php echo (int) ( $vr_p * 2 ); ?>s"></span><?php endfor; ?></div>

	<div class="container-page py-14 md:py-20">
		<div class="mx-auto mb-8 max-w-2xl text-center md:mb-10">
			<p class="mb-2 text-xs font-bold uppercase tracking-[0.16em] text-brand-200"><?php echo esc_html( $vr_term->name ); ?></p>
			<h2 id="showcase-title" class="text-3xl font-semibold text-white sm:text-4xl"><?php echo esc_html( $vr_title ); ?></h2>
			<p class="mt-2 text-brand-100"><?php echo esc_html( sprintf( /* translators: %d products */ _n( 'Explore our %d product.', 'Swipe through our %d products.', $vr_total, 'verdant-roots' ), $vr_total ) ); ?></p>
		</div>

		<div class="vr-cf" role="group" aria-roledescription="carousel" aria-label="<?php echo esc_attr( $vr_title ); ?>" tabindex="0" data-cf>
			<ul class="vr-cf-track">
				<?php foreach ( $vr_items as $vr_i => $vr_p ) :
					$vr_id  = $vr_p->get_id();
					$vr_url = trim( (string) get_post_meta( $vr_id, '_vr_model_glb', true ) );
					$vr_has3d = $vr_url && preg_match( '/\.glb(\?.*)?$/i', $vr_url );
					$vr_glb   = $vr_glb || $vr_has3d;
					?>
					<li class="vr-cf-slide" role="group" aria-roledescription="slide" aria-label="<?php echo esc_attr( sprintf( '%d / %d', $vr_i + 1, $vr_total ) ); ?>" data-slide="<?php echo (int) $vr_i; ?>">
						<div class="vr-cf-card" data-tilt>
							<?php if ( $vr_has3d ) : ?>
								<model-viewer src="<?php echo esc_url( $vr_url ); ?>" alt="<?php echo esc_attr( sprintf( /* translators: %s product */ __( '3D model of %s', 'verdant-roots' ), $vr_p->get_name() ) ); ?>" camera-controls auto-rotate shadow-intensity="1" loading="lazy" class="h-full w-full" style="--poster-color:transparent"></model-viewer>
							<?php elseif ( $vr_p->get_image_id() ) : echo vr_product_thumb( $vr_p, 'large', 'h-full w-full object-cover' ); // phpcs:ignore WordPress.Security.EscapeOutput
							else : echo vr_art( $vr_tone, $vr_p->get_name() . ' — ' . __( 'placeholder image', 'verdant-roots' ), $vr_i ); // phpcs:ignore WordPress.Security.EscapeOutput
							endif; ?>
							<span class="vr-cf-gloss" aria-hidden="true"></span>
						</div>
						<span class="vr-cf-shadow" aria-hidden="true"></span>
					</li>
				<?php endforeach; ?>
			</ul>

			<button type="button" class="vr-cf-nav vr-cf-nav--prev" data-cf-prev aria-label="<?php esc_attr_e( 'Previous product', 'verdant-roots' ); ?>"><?php vr_e_icon( 'chevronLeft', 22 ); ?></button>
			<button type="button" class="vr-cf-nav vr-cf-nav--next" data-cf-next aria-label="<?php esc_attr_e( 'Next product', 'verdant-roots' ); ?>"><?php vr_e_icon( 'chevronRight', 22 ); ?></button>
		</div>

		<div class="mx-auto mt-8 max-w-xl text-center" aria-live="polite" data-cf-panels>
			<?php foreach ( $vr_items as $vr_i => $vr_p ) :
				global $post, $product;
				$post    = get_post( $vr_p->get_id() ); // phpcs:ignore WordPress.WP.GlobalVariablesOverride
				$product = $vr_p; // phpcs:ignore WordPress.WP.GlobalVariablesOverride
				setup_postdata( $post );
				?>
				<div class="vr-cf-panel" data-panel="<?php echo (int) $vr_i; ?>" <?php echo 0 === $vr_i ? '' : 'hidden'; ?>>
					<h3 class="font-display text-2xl font-semibold text-white sm:text-3xl"><a href="<?php echo esc_url( get_permalink( $vr_p->get_id() ) ); ?>" class="hover:underline"><?php echo esc_html( $vr_p->get_name() ); ?></a></h3>
					<div class="mt-2 flex flex-wrap items-center justify-center gap-3"><?php echo vr_rating_html( (float) $vr_p->get_average_rating(), (int) $vr_p->get_review_count() ); // phpcs:ignore WordPress.Security.EscapeOutput ?><span class="vr-price-on-dark text-lg font-bold"><?php echo vr_card_price_html( $vr_p ); // phpcs:ignore WordPress.Security.EscapeOutput ?></span></div>
					<?php if ( $vr_p->get_short_description() ) : ?><p class="mx-auto mt-3 max-w-md text-brand-100"><?php echo esc_html( wp_strip_all_tags( $vr_p->get_short_description() ) ); ?></p><?php endif; ?>
					<div class="mx-auto mt-5 flex max-w-xs flex-col gap-2 sm:max-w-none sm:flex-row sm:justify-center">
						<div class="sm:w-56"><?php woocommerce_template_loop_add_to_cart(); ?></div>
						<a class="vr-btn vr-btn--ghost !text-white ring-1 ring-white/40 hover:!bg-white/10" href="<?php echo esc_url( get_permalink( $vr_p->get_id() ) ); ?>"><?php esc_html_e( 'View details', 'verdant-roots' ); ?></a>
					</div>
				</div>
			<?php endforeach; wp_reset_postdata(); ?>
		</div>

		<div class="mt-6 flex items-center justify-center gap-3">
			<ul class="flex gap-2" aria-label="<?php esc_attr_e( 'Choose product', 'verdant-roots' ); ?>">
				<?php foreach ( $vr_items as $vr_i => $vr_p ) : ?>
					<li><button type="button" class="vr-cf-dot" data-cf-dot="<?php echo (int) $vr_i; ?>" aria-label="<?php echo esc_attr( $vr_p->get_name() ); ?>"></button></li>
				<?php endforeach; ?>
			</ul>
			<button type="button" class="vr-cf-play" data-cf-play aria-pressed="false" aria-label="<?php esc_attr_e( 'Pause automatic sliding', 'verdant-roots' ); ?>" hidden><?php vr_e_icon( 'clock', 18 ); ?></button>
		</div>
	</div>
</section>
<?php
if ( $vr_glb ) {
	wp_enqueue_script( 'vr-model-viewer', 'https://ajax.googleapis.com/ajax/libs/model-viewer/4.0.0/model-viewer.min.js', array(), '4.0.0', array( 'in_footer' => true ) );
}
