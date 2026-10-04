<?php
/** Link-based pagination (same look as Pagination.tsx). */
defined( 'ABSPATH' ) || exit;
$vr_total   = isset( $total ) ? (int) $total : (int) wc_get_loop_prop( 'total_pages' );
$vr_current = isset( $current ) ? (int) $current : (int) wc_get_loop_prop( 'current_page' );
if ( $vr_total <= 1 ) {
	return;
}
$vr_item = 'grid h-10 min-w-10 place-items-center rounded-full border px-3 text-sm font-medium';
$vr_link = static function ( int $p ): string {
	return esc_url( get_pagenum_link( $p ) );
};
$vr_pages = array_filter( range( 1, $vr_total ), static fn( $p ) => 1 === $p || $vr_total === $p || abs( $p - $vr_current ) <= 1 );
?>
<nav aria-label="<?php esc_attr_e( 'Pagination', 'verdant-roots' ); ?>" class="mt-10 flex flex-wrap items-center justify-center gap-2">
	<?php if ( $vr_current > 1 ) : ?><a href="<?php echo $vr_link( $vr_current - 1 ); // phpcs:ignore WordPress.Security.EscapeOutput ?>" rel="prev" class="<?php echo esc_attr( $vr_item ); ?> border-line hover:bg-brand-50" aria-label="<?php esc_attr_e( 'Previous page', 'verdant-roots' ); ?>"><?php vr_e_icon( 'chevronLeft', 16 ); ?></a><?php endif; ?>
	<?php $vr_prev = 0; foreach ( $vr_pages as $vr_p ) : ?>
		<span class="flex items-center gap-2"><?php if ( $vr_prev && $vr_p - $vr_prev > 1 ) : ?><span aria-hidden="true">…</span><?php endif; ?>
			<a href="<?php echo $vr_link( $vr_p ); // phpcs:ignore WordPress.Security.EscapeOutput ?>" <?php echo $vr_p === $vr_current ? 'aria-current="page"' : ''; ?> class="<?php echo esc_attr( $vr_item ); ?> <?php echo $vr_p === $vr_current ? 'border-brand-600 bg-brand-600 text-white' : 'border-line hover:bg-brand-50'; ?>"><span class="sr-only"><?php esc_html_e( 'Page', 'verdant-roots' ); ?> </span><?php echo (int) $vr_p; ?></a></span>
	<?php $vr_prev = $vr_p; endforeach; ?>
	<?php if ( $vr_current < $vr_total ) : ?><a href="<?php echo $vr_link( $vr_current + 1 ); // phpcs:ignore WordPress.Security.EscapeOutput ?>" rel="next" class="<?php echo esc_attr( $vr_item ); ?> border-line hover:bg-brand-50" aria-label="<?php esc_attr_e( 'Next page', 'verdant-roots' ); ?>"><?php vr_e_icon( 'chevronRight', 16 ); ?></a><?php endif; ?>
</nav>
