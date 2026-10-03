<?php
/** Desktop navigation + accessible mega menu (categories are read live from WooCommerce). */
defined( 'ABSPATH' ) || exit;

$vr_cats     = function_exists( 'vr_nav_categories' ) && taxonomy_exists( 'product_cat' ) ? vr_nav_categories() : array();
$vr_featured = null;
if ( function_exists( 'wc_get_featured_product_ids' ) ) {
	$vr_fids     = wc_get_featured_product_ids();
	$vr_featured = $vr_fids ? wc_get_product( $vr_fids[0] ) : null;
}

/** Menu links per category; the last two categories in the design have a single "All" link. */
if ( ! function_exists( 'vr_mega_links' ) ) :
function vr_mega_links( WP_Term $term ): array {
	$url  = get_term_link( $term );
	$all  = array( sprintf( /* translators: %s category */ __( 'All %s', 'verdant-roots' ), $term->name ), $url );
	if ( in_array( $term->slug, array( 'tablet', 'dry-vegetable' ), true ) ) {
		return array( $all );
	}
	if ( 'combos' === $term->slug ) {
		return array( $all, array( __( 'Best Combos', 'verdant-roots' ), add_query_arg( 'orderby', 'popularity', $url ) ), array( __( 'Value Combos', 'verdant-roots' ), add_query_arg( 'orderby', 'price', $url ) ) );
	}
	return array( $all, array( __( 'Popular Products', 'verdant-roots' ), add_query_arg( 'orderby', 'popularity', $url ) ), array( __( 'New Arrivals', 'verdant-roots' ), add_query_arg( 'orderby', 'date', $url ) ) );
}
endif;

$vr_current = untrailingslashit( strtok( ( is_ssl() ? 'https://' : 'http://' ) . ( $_SERVER['HTTP_HOST'] ?? '' ) . ( $_SERVER['REQUEST_URI'] ?? '' ), '?' ) ); // phpcs:ignore WordPress.Security
?>
<nav aria-label="<?php esc_attr_e( 'Main', 'verdant-roots' ); ?>" class="hidden border-t border-line md:block">
	<ul class="container-page flex items-center gap-1 text-[0.95rem] font-medium">
		<?php foreach ( vr_menu_items( 'primary' ) as $vr_item ) :
			[ $vr_label, $vr_url ] = $vr_item;
			$vr_mega   = ! empty( $vr_item[2] ) && $vr_cats;
			$vr_active = untrailingslashit( $vr_url ) === $vr_current || ( is_front_page() && untrailingslashit( home_url( '/' ) ) === untrailingslashit( $vr_url ) );
			if ( ! $vr_mega ) : ?>
				<li><a href="<?php echo esc_url( $vr_url ); ?>" <?php echo $vr_active ? 'aria-current="page"' : ''; ?> class="relative block px-4 py-3 hover:text-brand-700 <?php echo $vr_active ? 'text-brand-700' : ''; ?>"><?php echo esc_html( $vr_label ); ?><?php if ( $vr_active ) : ?><span class="absolute inset-x-4 bottom-0 h-0.5 rounded bg-brand-600"></span><?php endif; ?></a></li>
			<?php else : ?>
				<li class="static" data-mega>
					<div class="flex items-center">
						<a href="<?php echo esc_url( $vr_url ); ?>" class="py-3 pl-4 hover:text-brand-700"><?php echo esc_html( $vr_label ); ?></a>
						<button type="button" aria-expanded="false" aria-controls="mega-menu" aria-label="<?php esc_attr_e( 'Show shop categories', 'verdant-roots' ); ?>" class="px-2 py-3 hover:text-brand-700" data-mega-toggle><?php vr_e_icon( 'chevronDown', 16, 'transition-transform' ); ?></button>
					</div>
					<div id="mega-menu" hidden class="absolute inset-x-0 top-full z-40 border-b border-line bg-white shadow-lift">
						<div class="container-page grid gap-8 py-8 lg:grid-cols-[1fr_17rem]">
							<div class="grid grid-cols-2 gap-x-6 gap-y-6 lg:grid-cols-3">
								<?php foreach ( $vr_cats as $vr_term ) : ?>
									<div>
										<a href="<?php echo esc_url( get_term_link( $vr_term ) ); ?>" class="font-display text-sm font-bold uppercase tracking-wide text-brand-800 hover:underline"><?php echo esc_html( $vr_term->name ); ?></a>
										<ul class="mt-2 space-y-1.5">
											<?php foreach ( vr_mega_links( $vr_term ) as [ $vr_l, $vr_u ] ) : ?>
												<li><a href="<?php echo esc_url( $vr_u ); ?>" class="text-sm text-ink-soft hover:text-brand-700 hover:underline"><?php echo esc_html( $vr_l ); ?></a></li>
											<?php endforeach; ?>
										</ul>
									</div>
								<?php endforeach; ?>
							</div>
							<?php if ( $vr_featured ) : ?>
								<a href="<?php echo esc_url( get_permalink( $vr_featured->get_id() ) ); ?>" class="group flex flex-col overflow-hidden rounded-card border border-line bg-brand-50/60 hover:shadow-card">
									<div class="relative aspect-[4/3] overflow-hidden"><?php echo vr_product_thumb( $vr_featured, 'woocommerce_thumbnail' ); // phpcs:ignore WordPress.Security.EscapeOutput ?></div>
									<div class="space-y-1 p-4">
										<p class="text-xs font-bold uppercase tracking-wider text-clay-500"><?php esc_html_e( 'Featured product', 'verdant-roots' ); ?></p>
										<p class="font-semibold group-hover:text-brand-700"><?php echo esc_html( $vr_featured->get_name() ); ?></p>
										<p class="text-sm font-bold"><?php echo vr_card_price_html( $vr_featured ); // phpcs:ignore WordPress.Security.EscapeOutput ?></p>
									</div>
								</a>
							<?php endif; ?>
						</div>
					</div>
				</li>
			<?php endif;
		endforeach; ?>
	</ul>
</nav>
