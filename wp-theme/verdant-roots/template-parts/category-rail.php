<?php
/**
 * "Categories" rail: round category icons that slide on their own.
 * Without JS it is a normal swipeable row; theme.js upgrades it to a continuous loop that pauses on
 * hover/focus/touch, has a pause button and prev/next arrows, and never autoplays with reduced motion.
 * Args: cats (WP_Term[]), href, link_label.
 *
 * @package VerdantRoots
 */

defined( 'ABSPATH' ) || exit;

$vr_rail = $args['cats'] ?? array();
if ( ! $vr_rail ) {
	return;
}
?>
<section aria-labelledby="cat-rail-title" class="vr-crail pt-8 pb-4 sm:pt-10" data-crail>
	<div class="container-page">
		<div class="relative mb-6 flex items-center justify-center">
			<div class="text-center">
				<h2 id="cat-rail-title" class="text-2xl font-semibold sm:text-3xl"><?php esc_html_e( 'Categories', 'verdant-roots' ); ?></h2>
				<span class="mx-auto mt-2 block h-0.5 w-16 rounded-full bg-clay-500/70" aria-hidden="true"></span>
			</div>
			<?php if ( ! empty( $args['href'] ) ) : ?>
				<a href="<?php echo esc_url( $args['href'] ); ?>" class="vr-btn vr-btn--sm absolute right-0 top-0"><?php echo esc_html( $args['link_label'] ?? __( 'See all', 'verdant-roots' ) ); ?> <?php vr_e_icon( 'arrowRight', 16 ); ?></a>
			<?php endif; ?>
		</div>

		<div class="vr-crail-wrap">
			<button type="button" class="vr-crail-nav vr-crail-nav--prev" data-crail-prev aria-label="<?php esc_attr_e( 'Previous categories', 'verdant-roots' ); ?>" hidden><?php vr_e_icon( 'chevronLeft', 20 ); ?></button>
			<div class="vr-crail-viewport" data-crail-view tabindex="-1">
				<div class="vr-crail-track" data-crail-track>
					<ul class="vr-crail-group" data-crail-group>
						<?php foreach ( $vr_rail as $vr_i => $vr_t ) :
							$vr_thumb = (int) get_term_meta( $vr_t->term_id, 'thumbnail_id', true );
							?>
							<li class="vr-crail-item">
								<a href="<?php echo esc_url( get_term_link( $vr_t ) ); ?>" class="vr-crail-link">
									<span class="vr-crail-circle"><?php echo $vr_thumb ? wp_get_attachment_image( $vr_thumb, 'medium', false, array( 'alt' => '', 'loading' => 'lazy' ) ) : vr_art( vr_tone_for_slug( $vr_t->slug ), '', $vr_i ); // phpcs:ignore WordPress.Security.EscapeOutput ?></span>
									<span class="vr-crail-name"><?php echo esc_html( $vr_t->name ); ?></span>
								</a>
							</li>
						<?php endforeach; ?>
					</ul>
				</div>
			</div>
			<button type="button" class="vr-crail-nav vr-crail-nav--next" data-crail-next aria-label="<?php esc_attr_e( 'Next categories', 'verdant-roots' ); ?>" hidden><?php vr_e_icon( 'chevronRight', 20 ); ?></button>
		</div>
		<div class="mt-3 flex justify-center">
			<button type="button" class="vr-hs-play" data-crail-play aria-pressed="false" aria-label="<?php esc_attr_e( 'Pause automatic sliding', 'verdant-roots' ); ?>" hidden><span data-crail-icon aria-hidden="true">❚❚</span></button>
		</div>
	</div>
</section>
