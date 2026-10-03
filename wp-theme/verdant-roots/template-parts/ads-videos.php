<?php
/**
 * "Product ads": up to 3 videos managed in Customize → Product ads (videos).
 * Muted, looping and only playing while on screen (theme.js); swipeable row on phones, side by side on desktop.
 * Without JS the native video controls are shown. Visitors see nothing until a video is set; admins get a preview note.
 *
 * @package VerdantRoots
 */

defined( 'ABSPATH' ) || exit;

$vr_ads = vr_ad_videos();
if ( ! $vr_ads ) {
	if ( ! current_user_can( 'edit_theme_options' ) ) {
		return;
	}
	?>
	<section class="px-3 py-4 sm:px-0" aria-label="<?php esc_attr_e( 'Product ads (admin preview)', 'verdant-roots' ); ?>">
		<div class="container-page"><p class="vr-bsl-note" role="note"><?php esc_html_e( 'Only you (admin) can see this note. Product ads: upload up to 3 videos in', 'verdant-roots' ); ?> <a href="<?php echo esc_url( admin_url( 'customize.php?autofocus[section]=vr_ads' ) ); ?>"><?php esc_html_e( 'Appearance → Customize → Product ads (videos)', 'verdant-roots' ); ?></a>.</p></div>
	</section>
	<?php
	return;
}
$vr_shape = vr_ad_shape( $vr_ads );
$vr_title = (string) vr_opt( 'ads_title', '' );
?>
<section class="px-3 py-6 sm:px-0 sm:py-8" <?php echo $vr_title ? 'aria-labelledby="ads-title"' : 'aria-label="' . esc_attr__( 'Product videos', 'verdant-roots' ) . '"'; ?> data-ads>
	<div class="container-page">
		<?php if ( $vr_title ) : ?><h2 id="ads-title" class="mb-5 text-2xl font-semibold sm:text-3xl"><?php echo esc_html( $vr_title ); ?></h2><?php endif; ?>
		<ul class="vr-ads" data-n="<?php echo (int) count( $vr_ads ); ?>" data-shape="<?php echo esc_attr( $vr_shape ); ?>">
			<?php foreach ( $vr_ads as $vr_ad ) :
				$vr_label = $vr_ad['text'] ?: sprintf( /* translators: %d slot number */ __( 'Product video %d', 'verdant-roots' ), $vr_ad['n'] );
				?>
				<li class="vr-ad">
					<div class="vr-ad-frame">
						<video class="vr-ad-video" data-ad-video controls muted loop playsinline preload="<?php echo $vr_ad['poster'] ? 'none' : 'metadata'; ?>"<?php echo $vr_ad['poster'] ? ' poster="' . esc_url( $vr_ad['poster'] ) . '"' : ''; ?> aria-label="<?php echo esc_attr( $vr_label ); ?>">
							<source src="<?php echo esc_url( $vr_ad['url'] . ( $vr_ad['poster'] ? '' : '#t=0.1' ) ); ?>" type="<?php echo esc_attr( $vr_ad['type'] ); ?>">
						</video>
						<div class="vr-ad-ui" data-ad-ui hidden>
							<button type="button" class="vr-ad-btn" data-ad-play aria-label="<?php esc_attr_e( 'Pause video', 'verdant-roots' ); ?>"><span data-ad-play-icon aria-hidden="true">❚❚</span></button>
							<button type="button" class="vr-ad-btn" data-ad-sound aria-pressed="false" aria-label="<?php esc_attr_e( 'Turn sound on', 'verdant-roots' ); ?>">
								<svg class="vr-ad-ico vr-ad-ico--off" viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 5 6 9H3v6h3l5 4V5Z"/><path d="m16 9 5 6m0-6-5 6"/></svg>
								<svg class="vr-ad-ico vr-ad-ico--on" viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 5 6 9H3v6h3l5 4V5Z"/><path d="M15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13"/></svg>
							</button>
						</div>
						<?php if ( $vr_ad['text'] || $vr_ad['link'] ) : ?>
							<div class="vr-ad-cap">
								<?php if ( $vr_ad['text'] ) : ?><span class="vr-ad-text"><?php echo esc_html( $vr_ad['text'] ); ?></span><?php endif; ?>
								<?php if ( $vr_ad['link'] ) : ?><a href="<?php echo esc_url( $vr_ad['link'] ); ?>" class="vr-btn vr-btn--sm"><?php esc_html_e( 'Shop now', 'verdant-roots' ); ?> <?php vr_e_icon( 'arrowRight', 16 ); ?></a><?php endif; ?>
							</div>
						<?php endif; ?>
					</div>
				</li>
			<?php endforeach; ?>
		</ul>
	</div>
</section>
