<?php
/**
 * "Best Selling Products": a tinted band with a swipeable row of product cards and big rank numbers.
 * Which products appear is controlled on each product (Best Selling Products box) — see vr_best_sellers().
 * Args: products (WC_Product[]), href.
 *
 * @package VerdantRoots
 */

defined( 'ABSPATH' ) || exit;

$vr_bsl     = $args['products'] ?? array();
$vr_preview = false;
if ( ! $vr_bsl ) {
	if ( ! current_user_can( 'manage_options' ) ) {
		return; // visitors never see an empty section.
	}
	$vr_preview = true; // admins see where it goes and how to fill it.
}
global $post;
?>
<section aria-labelledby="best-sellers" class="vr-bsl-sec px-3 py-6 sm:px-0 sm:py-8" data-bsl>
	<div class="container-page">
		<div class="vr-bsl">
			<div class="relative mb-6 flex items-center justify-center">
				<div class="text-center">
					<h2 id="best-sellers" class="text-2xl font-semibold sm:text-3xl"><?php esc_html_e( 'Best Selling Products', 'verdant-roots' ); ?></h2>
					<span class="mx-auto mt-2 block h-0.5 w-16 rounded-full bg-clay-500/70" aria-hidden="true"></span>
				</div>
				<?php if ( ! empty( $args['href'] ) ) : ?>
					<a href="<?php echo esc_url( $args['href'] ); ?>" class="vr-btn vr-btn--sm absolute right-0 top-0"><?php esc_html_e( 'See all', 'verdant-roots' ); ?> <?php vr_e_icon( 'arrowRight', 16 ); ?></a>
				<?php endif; ?>
			</div>

			<?php if ( $vr_preview ) : ?>
				<p class="vr-bsl-note" role="note"><?php esc_html_e( 'Only you (admin) can see this preview. There are no published products yet: publish a product, then tick “Show in Best Selling Products” on its edit screen (right-hand box).', 'verdant-roots' ); ?> <?php if ( function_exists( 'wc_get_page_id' ) ) : ?><a href="<?php echo esc_url( admin_url( 'edit.php?post_type=product' ) ); ?>"><?php esc_html_e( 'Go to Products', 'verdant-roots' ); ?></a><?php endif; ?></p>
			<?php endif; ?>

			<div class="vr-bsl-wrap">
				<button type="button" class="vr-bsl-nav vr-bsl-nav--prev" data-bsl-prev aria-label="<?php esc_attr_e( 'Previous products', 'verdant-roots' ); ?>" hidden><?php vr_e_icon( 'chevronLeft', 22 ); ?></button>
				<ul class="vr-bsl-track products" data-bsl-track>
					<?php if ( $vr_preview ) : foreach ( range( 1, 4 ) as $vr_n ) : ?>
						<li class="vr-bsl-slide" data-rank="<?php echo (int) $vr_n; ?>" aria-hidden="true">
							<div class="vr-bsl-ph"><span class="vr-bsl-ph-img"></span><span class="vr-bsl-ph-line"></span><span class="vr-bsl-ph-line vr-bsl-ph-line--s"></span><span class="vr-bsl-ph-btn"></span></div>
						</li>
					<?php endforeach; endif; ?>
					<?php foreach ( $vr_bsl as $vr_i => $product ) :
						$post = get_post( $product->get_id() ); // phpcs:ignore WordPress.WP.GlobalVariablesOverride
						setup_postdata( $post );
						$GLOBALS['product'] = $product;
						?>
						<li class="vr-bsl-slide" data-rank="<?php echo (int) ( $vr_i + 1 ); ?>"><?php wc_get_template_part( 'content', 'product' ); ?></li>
					<?php endforeach; wp_reset_postdata(); ?>
				</ul>
				<button type="button" class="vr-bsl-nav vr-bsl-nav--next" data-bsl-next aria-label="<?php esc_attr_e( 'Next products', 'verdant-roots' ); ?>" hidden><?php vr_e_icon( 'chevronRight', 22 ); ?></button>
			</div>
		</div>
	</div>
</section>
