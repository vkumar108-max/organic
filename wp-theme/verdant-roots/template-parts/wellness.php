<?php
/**
 * "Herbal & Wellness": four tinted category cards (name, short text, Explore, category image).
 * Categories come from Customizer → "Herbal & Wellness section"; the card image is the category image,
 * or generated placeholder art until you add one.
 *
 * @package VerdantRoots
 */

defined( 'ABSPATH' ) || exit;

$vr_wl = function_exists( 'vr_wellness_cats' ) ? vr_wellness_cats() : array();
if ( ! $vr_wl ) {
	return;
}
?>
<section aria-labelledby="wellness-title" class="section pt-2">
	<div class="container-page">
		<h2 id="wellness-title" class="mb-6 text-2xl font-semibold sm:text-3xl"><?php echo esc_html( (string) vr_opt( 'wellness_title', 'Herbal & Wellness' ) ); ?></h2>
		<ul class="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-4">
			<?php foreach ( $vr_wl as $vr_i => $vr_t ) :
				$vr_tone  = vr_tone_for_slug( $vr_t->slug );
				$vr_thumb = (int) get_term_meta( $vr_t->term_id, 'thumbnail_id', true );
				$vr_desc  = wp_strip_all_tags( term_description( $vr_t->term_id, 'product_cat' ) );
				?>
				<li>
					<a href="<?php echo esc_url( get_term_link( $vr_t ) ); ?>" class="vr-wl-card vr-wl-card--<?php echo esc_attr( $vr_tone ); ?>">
						<span class="vr-wl-title"><?php echo esc_html( $vr_t->name ); ?></span>
						<?php if ( $vr_desc ) : ?><span class="vr-wl-desc"><?php echo esc_html( $vr_desc ); ?></span><?php endif; ?>
						<span class="vr-wl-cta"><?php esc_html_e( 'Explore', 'verdant-roots' ); ?> <?php vr_e_icon( 'arrowRight', 14 ); ?></span>
						<span class="vr-wl-art" aria-hidden="true"><?php echo $vr_thumb ? wp_get_attachment_image( $vr_thumb, 'medium', false, array( 'alt' => '', 'loading' => 'lazy' ) ) : vr_art( $vr_tone, '', $vr_i ); // phpcs:ignore WordPress.Security.EscapeOutput ?></span>
					</a>
				</li>
			<?php endforeach; ?>
		</ul>
	</div>
</section>
