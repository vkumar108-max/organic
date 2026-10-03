<?php
/**
 * Product card (listing + home + wishlist). Same design as ProductCard.tsx.
 *
 * @package VerdantRoots
 */

defined( 'ABSPATH' ) || exit;

global $product;
if ( ! $product instanceof WC_Product || ! $product->is_visible() ) {
	return;
}
$vr_id       = $product->get_id();
$vr_name     = $product->get_name();
$vr_link     = get_permalink( $vr_id );
$vr_sold_out = ! $product->is_in_stock();
$vr_reviews  = (int) $product->get_review_count();
?>
<article class="group relative flex h-full flex-col overflow-hidden rounded-card border border-line bg-white transition duration-200 hover:-translate-y-0.5 hover:shadow-lift">
	<div class="relative aspect-square overflow-hidden bg-brand-50">
		<a href="<?php echo esc_url( $vr_link ); ?>" tabindex="-1" aria-hidden="true" class="block h-full transition duration-500 group-hover:scale-105"><?php echo vr_product_thumb( $product, 'woocommerce_thumbnail' ); // phpcs:ignore WordPress.Security.EscapeOutput ?></a>
		<div class="absolute left-2 top-2 flex flex-col gap-1">
			<?php if ( vr_is_new_product( $product ) ) : ?><span class="rounded-full bg-clay-500 px-2 py-0.5 text-[0.7rem] font-bold uppercase text-white"><?php esc_html_e( 'New', 'verdant-roots' ); ?></span><?php endif; ?>
			<?php if ( vr_is_best_seller( $vr_id ) ) : ?><span class="rounded-full bg-brand-700 px-2 py-0.5 text-[0.7rem] font-bold uppercase text-white"><?php esc_html_e( 'Best seller', 'verdant-roots' ); ?></span><?php endif; ?>
		</div>
		<div class="absolute right-2 top-2"><?php echo vr_wishlist_button( $vr_id, $vr_name ); // phpcs:ignore WordPress.Security.EscapeOutput ?></div>
		<div class="absolute inset-x-2 bottom-2 hidden justify-center opacity-0 transition group-hover:opacity-100 group-focus-within:opacity-100 md:flex">
			<button type="button" data-quick-view="<?php echo (int) $vr_id; ?>" class="inline-flex items-center gap-1.5 rounded-full bg-white/95 px-4 py-2 text-sm font-semibold text-ink shadow-md hover:bg-white" aria-label="<?php echo esc_attr( sprintf( /* translators: %s product */ __( 'Quick view %s', 'verdant-roots' ), $vr_name ) ); ?>"><?php vr_e_icon( 'eye', 16 ); esc_html_e( 'Quick view', 'verdant-roots' ); ?></button>
		</div>
		<?php if ( $vr_sold_out ) : ?><div class="absolute inset-0 grid place-items-center bg-white/70 text-sm font-bold text-ink"><?php esc_html_e( 'Out of stock', 'verdant-roots' ); ?></div><?php endif; ?>
	</div>
	<div class="flex flex-1 flex-col gap-1.5 p-3 sm:p-4">
		<h3 class="line-clamp-2 min-h-[2.6em] font-sans text-[0.95rem] font-semibold leading-snug"><a href="<?php echo esc_url( $vr_link ); ?>" class="hover:text-brand-700"><?php echo esc_html( $vr_name ); ?></a></h3>
		<?php echo vr_rating_html( (float) $product->get_average_rating(), $vr_reviews ); // phpcs:ignore WordPress.Security.EscapeOutput ?>
		<div class="vr-price flex flex-wrap items-baseline gap-x-2 gap-y-0.5 text-base font-bold text-ink"><?php echo vr_card_price_html( $product ); // phpcs:ignore WordPress.Security.EscapeOutput -- escaped inside the helper. ?></div>
		<div class="mt-auto pt-2"><?php woocommerce_template_loop_add_to_cart(); ?></div>
	</div>
</article>
