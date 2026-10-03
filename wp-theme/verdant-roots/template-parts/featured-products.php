<?php
/**
 * "Our Featured Products": deep-green side panel + a product carousel that slides on its own every 2 seconds.
 * Products are the ones starred as Featured in WooCommerce (Products list → ☆, or Quick Edit / product → Catalog visibility → Featured).
 * Args: products (WC_Product[]), href.
 *
 * @package VerdantRoots
 */

defined( 'ABSPATH' ) || exit;

$vr_fp      = $args['products'] ?? array();
$vr_preview = false;
if ( ! $vr_fp ) {
	if ( ! current_user_can( 'manage_options' ) ) {
		return; // visitors never see an empty section.
	}
	$vr_preview = true;
}
global $post;
?>
<section aria-labelledby="featured-products" class="px-3 py-6 sm:px-0 sm:py-8" data-fp>
	<div class="container-page">
		<div class="vr-fp">
			<div class="vr-fp-side">
				<h2 id="featured-products" class="vr-fp-title"><?php echo esc_html( (string) vr_opt( 'featured_title', 'Our Featured Products' ) ); ?></h2>
				<span class="mt-3 block h-0.5 w-14 rounded-full bg-clay-500" aria-hidden="true"></span>
				<svg class="vr-fp-art" viewBox="0 0 240 240" aria-hidden="true" focusable="false">
					<circle cx="70" cy="190" r="86" fill="#fff" opacity=".07"/><circle cx="170" cy="70" r="42" fill="#f6b04a" opacity=".25"/>
					<path d="M30 220c0-62 36-98 112-98 0 66-40 104-102 98" fill="#5fa564" opacity=".9"/><path d="M40 218c26-50 58-76 98-92" fill="none" stroke="#e8f5e9" stroke-width="3" stroke-linecap="round"/>
					<path d="M120 236c0-42 24-66 76-66 0 44-26 70-68 66" fill="#3f8f4a" opacity=".95"/><path d="M128 234c18-34 38-50 64-60" fill="none" stroke="#e8f5e9" stroke-width="2.5" stroke-linecap="round"/>
				</svg>
			</div>

			<div class="vr-fp-main">
				<div class="mb-3 flex items-center justify-end gap-3">
					<?php if ( ! $vr_preview ) : ?>
						<button type="button" class="vr-hs-play" data-fp-play aria-pressed="false" aria-label="<?php esc_attr_e( 'Pause automatic sliding', 'verdant-roots' ); ?>" hidden><span data-fp-icon aria-hidden="true">❚❚</span></button>
					<?php endif; ?>
					<?php if ( ! empty( $args['href'] ) ) : ?>
						<a href="<?php echo esc_url( $args['href'] ); ?>" class="vr-btn vr-btn--sm"><?php esc_html_e( 'See all', 'verdant-roots' ); ?> <?php vr_e_icon( 'arrowRight', 16 ); ?></a>
					<?php endif; ?>
				</div>

				<?php if ( $vr_preview ) : ?>
					<p class="vr-bsl-note" role="note"><?php esc_html_e( 'Only you (admin) can see this preview. No product is marked Featured yet: open Products and click the star (☆) in the Featured column of any published product.', 'verdant-roots' ); ?> <?php if ( function_exists( 'wc_get_page_id' ) ) : ?><a href="<?php echo esc_url( admin_url( 'edit.php?post_type=product' ) ); ?>"><?php esc_html_e( 'Go to Products', 'verdant-roots' ); ?></a><?php endif; ?></p>
				<?php endif; ?>

				<div class="vr-fp-wrap">
					<button type="button" class="vr-fp-nav vr-fp-nav--prev" data-fp-prev aria-label="<?php esc_attr_e( 'Previous products', 'verdant-roots' ); ?>" hidden><?php vr_e_icon( 'chevronLeft', 22 ); ?></button>
					<ul class="vr-fp-track products" data-fp-track>
						<?php if ( $vr_preview ) : foreach ( range( 1, 4 ) as $vr_n ) : ?>
							<li class="vr-fp-slide" aria-hidden="true"><div class="vr-bsl-ph"><span class="vr-bsl-ph-img"></span><span class="vr-bsl-ph-line"></span><span class="vr-bsl-ph-line vr-bsl-ph-line--s"></span><span class="vr-bsl-ph-btn"></span></div></li>
						<?php endforeach; endif; ?>
						<?php foreach ( $vr_fp as $product ) :
							$post = get_post( $product->get_id() ); // phpcs:ignore WordPress.WP.GlobalVariablesOverride
							setup_postdata( $post );
							$GLOBALS['product'] = $product;
							?>
							<li class="vr-fp-slide"><?php wc_get_template_part( 'content', 'product' ); ?></li>
						<?php endforeach; wp_reset_postdata(); ?>
					</ul>
					<button type="button" class="vr-fp-nav vr-fp-nav--next" data-fp-next aria-label="<?php esc_attr_e( 'Next products', 'verdant-roots' ); ?>" hidden><?php vr_e_icon( 'chevronRight', 22 ); ?></button>
				</div>
			</div>
		</div>
	</div>
</section>
