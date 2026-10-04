<?php
/**
 * Filter groups as plain links (work without JS, crawlable, shareable).
 * Uses WooCommerce query vars: product_cat, min_price/max_price, rating_filter,
 * filter_{attribute}. Args: show_categories (bool).
 */
defined( 'ABSPATH' ) || exit;

$vr_show_cats = $args['show_categories'] ?? true;
$vr_min       = isset( $_GET['min_price'] ) ? absint( $_GET['min_price'] ) : null; // phpcs:ignore WordPress.Security.NonceVerification
$vr_max       = isset( $_GET['max_price'] ) ? absint( $_GET['max_price'] ) : null; // phpcs:ignore WordPress.Security.NonceVerification
$vr_rating    = isset( $_GET['rating_filter'] ) ? absint( $_GET['rating_filter'] ) : 0; // phpcs:ignore WordPress.Security.NonceVerification
$vr_instock   = ! empty( $_GET['instock'] ); // phpcs:ignore WordPress.Security.NonceVerification
$vr_active    = isset( $_GET['product_cat'] ) ? sanitize_title( wp_unslash( $_GET['product_cat'] ) ) : ''; // phpcs:ignore WordPress.Security.NonceVerification
$vr_has       = $vr_min || $vr_max || $vr_rating || $vr_instock || $vr_active;
$vr_attrs     = vr_sidebar_attributes();
foreach ( $vr_attrs as $vr_a ) {
	if ( isset( $_GET[ 'filter_' . $vr_a['name'] ] ) ) { $vr_has = true; } // phpcs:ignore WordPress.Security.NonceVerification
}

$vr_row = static function ( string $label, string $url, bool $on ): string {
	return '<li><a href="' . esc_url( $url ) . '" class="flex min-h-8 items-center gap-2.5 text-sm ' . ( $on ? 'font-semibold text-brand-800' : 'text-ink hover:text-brand-700' ) . '" ' . ( $on ? 'aria-current="true"' : '' ) . '><span class="grid h-4 w-4 shrink-0 place-items-center rounded-full border ' . ( $on ? 'border-brand-600 bg-brand-600' : 'border-line' ) . '" aria-hidden="true">' . ( $on ? '<span class="h-1.5 w-1.5 rounded-full bg-white"></span>' : '' ) . '</span>' . esc_html( $label ) . '</a></li>';
};
$vr_h = 'mb-2 text-sm font-bold uppercase tracking-wide text-ink';
$vr_g = 'border-b border-line py-4 last:border-0';
?>
<div class="rounded-card lg:border lg:border-line lg:p-5">
	<div class="flex items-center justify-between">
		<h2 class="hidden font-sans text-lg font-semibold lg:block"><?php esc_html_e( 'Filters', 'verdant-roots' ); ?></h2>
		<?php if ( $vr_has ) : ?><a href="<?php echo esc_url( is_search() ? add_query_arg( array( 's' => get_search_query(), 'post_type' => 'product' ), home_url( '/' ) ) : ( is_product_taxonomy() ? get_term_link( get_queried_object() ) : wc_get_page_permalink( 'shop' ) ) ); ?>" class="text-sm font-semibold text-brand-700 hover:underline"><?php esc_html_e( 'Clear all', 'verdant-roots' ); ?></a><?php endif; ?>
	</div>

	<?php if ( $vr_show_cats ) : ?>
		<div class="<?php echo esc_attr( $vr_g ); ?>">
			<h3 class="<?php echo esc_attr( $vr_h ); ?> font-sans"><?php esc_html_e( 'Category', 'verdant-roots' ); ?></h3>
			<ul>
				<?php foreach ( vr_top_categories() as $vr_t ) { echo $vr_row( $vr_t->name, vr_filter_url( array( 'product_cat' => $vr_active === $vr_t->slug ? null : $vr_t->slug ) ), $vr_active === $vr_t->slug ); } // phpcs:ignore WordPress.Security.EscapeOutput ?>
			</ul>
		</div>
	<?php endif; ?>

	<div class="<?php echo esc_attr( $vr_g ); ?>">
		<h3 class="<?php echo esc_attr( $vr_h ); ?> font-sans"><?php esc_html_e( 'Price', 'verdant-roots' ); ?></h3>
		<ul>
			<?php foreach ( VR_PRICE_BUCKETS as [ $vr_l, $vr_lo, $vr_hi ] ) {
				$vr_on = ( $vr_lo ?? 0 ) === ( $vr_min ?? 0 ) && ( $vr_hi ?? 0 ) === ( $vr_max ?? 0 ) && ( $vr_min || $vr_max );
				echo $vr_row( $vr_l, vr_filter_url( array( 'min_price' => $vr_on ? null : $vr_lo, 'max_price' => $vr_on ? null : $vr_hi ) ), $vr_on ); // phpcs:ignore WordPress.Security.EscapeOutput
			} ?>
		</ul>
	</div>

	<div class="<?php echo esc_attr( $vr_g ); ?>">
		<h3 class="<?php echo esc_attr( $vr_h ); ?> font-sans"><?php esc_html_e( 'Availability', 'verdant-roots' ); ?></h3>
		<ul><?php echo $vr_row( __( 'In stock only', 'verdant-roots' ), vr_filter_url( array( 'instock' => $vr_instock ? null : 1 ) ), $vr_instock ); // phpcs:ignore WordPress.Security.EscapeOutput ?></ul>
	</div>

	<div class="<?php echo esc_attr( $vr_g ); ?>">
		<h3 class="<?php echo esc_attr( $vr_h ); ?> font-sans"><?php esc_html_e( 'Rating', 'verdant-roots' ); ?></h3>
		<ul>
			<?php foreach ( array( 4, 3 ) as $vr_s ) { echo $vr_row( sprintf( /* translators: %d stars */ __( '%d★ & above', 'verdant-roots' ), $vr_s ), vr_filter_url( array( 'rating_filter' => $vr_rating === $vr_s ? null : implode( ',', range( $vr_s, 5 ) ) ) ), $vr_rating === $vr_s ); } // phpcs:ignore WordPress.Security.EscapeOutput ?>
		</ul>
	</div>

	<?php foreach ( $vr_attrs as $vr_a ) :
		$vr_cur = isset( $_GET[ 'filter_' . $vr_a['name'] ] ) ? sanitize_title( wp_unslash( $_GET[ 'filter_' . $vr_a['name'] ] ) ) : ''; // phpcs:ignore WordPress.Security.NonceVerification
		?>
		<div class="<?php echo esc_attr( $vr_g ); ?>">
			<h3 class="<?php echo esc_attr( $vr_h ); ?> font-sans"><?php echo esc_html( $vr_a['label'] ); ?></h3>
			<div class="flex flex-wrap gap-2">
				<?php foreach ( $vr_a['terms'] as $vr_t ) : $vr_on = $vr_cur === $vr_t->slug; ?>
					<a href="<?php echo esc_url( vr_filter_url( array( 'filter_' . $vr_a['name'] => $vr_on ? null : $vr_t->slug, 'query_type_' . $vr_a['name'] => $vr_on ? null : 'or' ) ) ); ?>" aria-pressed="<?php echo $vr_on ? 'true' : 'false'; ?>" class="rounded-full border px-3 py-1 text-sm <?php echo $vr_on ? 'border-brand-600 bg-brand-50 font-semibold text-brand-800' : 'border-line hover:border-brand-300'; ?>"><?php echo esc_html( $vr_t->name ); ?></a>
				<?php endforeach; ?>
			</div>
		</div>
	<?php endforeach; ?>
</div>
