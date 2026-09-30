<?php
/**
 * Hero 3D coverflow slider: one card per category (max 5).
 * Without JS it is a swipeable scroll-snap row; theme.js upgrades it to a 3D carousel with
 * drag/swipe, arrow keys, dots, tilt and a pausable autoplay.
 *
 * @package VerdantRoots
 */

defined( 'ABSPATH' ) || exit;

$vr_slides = vr_hero_categories();
if ( ! $vr_slides ) {
	return;
}
$vr_n = count( $vr_slides );
?>
<div class="vr-hs-wrap">
	<div class="vr-hs" role="group" aria-roledescription="carousel" aria-label="<?php esc_attr_e( 'Product categories', 'verdant-roots' ); ?>" tabindex="0" data-hs>
		<ul class="vr-hs-track">
			<?php foreach ( $vr_slides as $vr_i => $vr_t ) :
				$vr_thumb = (int) get_term_meta( $vr_t->term_id, 'thumbnail_id', true );
				$vr_tone  = vr_tone_for_slug( $vr_t->slug );
				?>
				<li class="vr-hs-slide" role="group" aria-roledescription="slide" aria-label="<?php echo esc_attr( sprintf( '%d / %d', $vr_i + 1, $vr_n ) ); ?>" data-slide="<?php echo (int) $vr_i; ?>">
					<a href="<?php echo esc_url( get_term_link( $vr_t ) ); ?>" class="vr-hs-card" data-tilt aria-label="<?php echo esc_attr( sprintf( /* translators: %s category */ __( 'Shop %s', 'verdant-roots' ), $vr_t->name ) ); ?>">
						<span class="vr-hs-art"><?php echo $vr_thumb ? wp_get_attachment_image( $vr_thumb, 'large', false, array( 'class' => 'h-full w-full object-cover', 'alt' => '', 'loading' => 0 === $vr_i ? 'eager' : 'lazy' ) ) : vr_art( $vr_tone, '', $vr_i ); // phpcs:ignore WordPress.Security.EscapeOutput ?></span>
						<span class="vr-hs-label">
							<span class="vr-hs-num"><?php echo esc_html( str_pad( (string) ( $vr_i + 1 ), 2, '0', STR_PAD_LEFT ) ); ?></span>
							<span class="vr-hs-name"><?php echo esc_html( $vr_t->name ); ?></span>
							<span class="vr-hs-count"><?php echo esc_html( sprintf( /* translators: %d products */ _n( '%d product', '%d products', (int) $vr_t->count, 'verdant-roots' ), (int) $vr_t->count ) ); ?></span>
						</span>
						<span class="vr-hs-gloss" aria-hidden="true"></span>
					</a>
					<span class="vr-hs-shadow" aria-hidden="true"></span>
				</li>
			<?php endforeach; ?>
		</ul>
		<button type="button" class="vr-hs-nav vr-hs-nav--prev" data-hs-prev aria-label="<?php esc_attr_e( 'Previous category', 'verdant-roots' ); ?>" hidden><?php vr_e_icon( 'chevronLeft', 22 ); ?></button>
		<button type="button" class="vr-hs-nav vr-hs-nav--next" data-hs-next aria-label="<?php esc_attr_e( 'Next category', 'verdant-roots' ); ?>" hidden><?php vr_e_icon( 'chevronRight', 22 ); ?></button>
	</div>

	<div class="vr-hs-panels" aria-live="polite" data-hs-panels>
		<?php foreach ( $vr_slides as $vr_i => $vr_t ) :
			$vr_desc = wp_trim_words( wp_strip_all_tags( term_description( $vr_t->term_id, 'product_cat' ) ), 22 );
			?>
			<div class="vr-hs-panel" data-panel="<?php echo (int) $vr_i; ?>" <?php echo 0 === $vr_i ? '' : 'hidden'; ?>>
				<?php if ( $vr_desc ) : ?><p class="text-sm text-ink-soft"><?php echo esc_html( $vr_desc ); ?></p><?php endif; ?>
				<a class="vr-btn vr-btn--sm mt-3" href="<?php echo esc_url( get_term_link( $vr_t ) ); ?>"><?php echo esc_html( sprintf( /* translators: %s category */ __( 'Shop %s', 'verdant-roots' ), $vr_t->name ) ); ?> <?php vr_e_icon( 'arrowRight', 16 ); ?></a>
			</div>
		<?php endforeach; ?>
	</div>

	<div class="mt-4 flex items-center justify-center gap-3">
		<ul class="flex gap-2" aria-label="<?php esc_attr_e( 'Choose category', 'verdant-roots' ); ?>">
			<?php foreach ( $vr_slides as $vr_i => $vr_t ) : ?><li><button type="button" class="vr-hs-dot" data-hs-dot="<?php echo (int) $vr_i; ?>" aria-label="<?php echo esc_attr( $vr_t->name ); ?>"></button></li><?php endforeach; ?>
		</ul>
		<button type="button" class="vr-hs-play" data-hs-play aria-pressed="false" aria-label="<?php esc_attr_e( 'Pause automatic sliding', 'verdant-roots' ); ?>" hidden><span data-hs-play-icon aria-hidden="true">❚❚</span></button>
	</div>
</div>
