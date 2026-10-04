<?php
/** Args: id, title, description, products (WC_Product[]), href, link_label, tinted. */
defined( 'ABSPATH' ) || exit;
if ( empty( $args['products'] ) ) {
	return;
}
?>
<section aria-labelledby="<?php echo esc_attr( $args['id'] ); ?>" class="section <?php echo ! empty( $args['tinted'] ) ? 'bg-brand-50/70' : ''; ?><?php echo ! empty( $args['sand'] ) ? 'bg-sand-50' : ''; ?>">
	<div class="container-page">
		<?php get_template_part( 'template-parts/section-heading', null, array( 'id' => $args['id'], 'title' => $args['title'], 'description' => $args['description'] ?? '', 'eyebrow' => $args['eyebrow'] ?? '', 'href' => $args['href'], 'link_label' => $args['link_label'] ) ); ?>
		<?php vr_render_product_grid( array_slice( $args['products'], 0, 4 ) ); ?>
	</div>
</section>
