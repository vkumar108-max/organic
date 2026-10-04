<?php
/** Related products grid. */
defined( 'ABSPATH' ) || exit;
if ( empty( $related_products ) ) {
	return;
}
?>
<section aria-labelledby="related-title">
	<h2 id="related-title" class="mb-5 text-2xl font-semibold"><?php esc_html_e( 'You may also like', 'verdant-roots' ); ?></h2>
	<?php vr_render_product_grid( array_filter( array_map( static fn( $item ) => $item instanceof WC_Product ? $item : wc_get_product( is_object( $item ) ? $item->ID : $item ), $related_products ) ) ); ?>
</section>
