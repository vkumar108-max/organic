<?php
/** Mobile menu: four round category icons under the logo (Customize → Bulk order form → "Mobile menu"). */
defined( 'ABSPATH' ) || exit;

$vr_tiles = function_exists( 'vr_menu_tile_cats' ) ? vr_menu_tile_cats() : array();
if ( ! $vr_tiles ) {
	return;
}
?>
<ul class="vr-mm-tiles" aria-label="<?php esc_attr_e( 'Popular categories', 'verdant-roots' ); ?>">
	<?php foreach ( $vr_tiles as $vr_i => $vr_t ) :
		$vr_thumb = (int) get_term_meta( $vr_t->term_id, 'thumbnail_id', true );
		?>
		<li>
			<a href="<?php echo esc_url( get_term_link( $vr_t ) ); ?>" class="vr-mm-tile">
				<span class="vr-mm-circle"><?php echo $vr_thumb ? wp_get_attachment_image( $vr_thumb, 'thumbnail', false, array( 'alt' => '', 'loading' => 'lazy' ) ) : vr_art( vr_tone_for_slug( $vr_t->slug ), '', $vr_i ); // phpcs:ignore WordPress.Security.EscapeOutput ?></span>
				<span class="vr-mm-name"><?php echo esc_html( $vr_t->name ); ?></span>
			</a>
		</li>
	<?php endforeach; ?>
</ul>
