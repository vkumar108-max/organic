<?php
/**
 * "From Our Feed": a centred carousel of portrait video cards. Click a card → pop-up player (YouTube / Instagram embed).
 * Without JS each card is a plain link to the original video. Links are set in Customize → From Our Feed.
 *
 * @package VerdantRoots
 */

defined( 'ABSPATH' ) || exit;

$vr_feed = vr_feed_items();
if ( ! $vr_feed ) {
	if ( ! current_user_can( 'edit_theme_options' ) ) {
		return;
	}
	?>
	<section class="px-3 py-4 sm:px-0" aria-label="<?php esc_attr_e( 'From Our Feed (admin preview)', 'verdant-roots' ); ?>">
		<div class="container-page"><p class="vr-bsl-note" role="note"><?php esc_html_e( 'Only you (admin) can see this note. From Our Feed: paste YouTube or Instagram video links in', 'verdant-roots' ); ?> <a href="<?php echo esc_url( admin_url( 'customize.php?autofocus[section]=vr_feed' ) ); ?>"><?php esc_html_e( 'Appearance → Customize → From Our Feed', 'verdant-roots' ); ?></a>.</p></div>
	</section>
	<?php
	return;
}
$vr_names = array( 'youtube' => 'YouTube', 'instagram' => 'Instagram' );
?>
<section aria-labelledby="feed-title" class="section" data-feed>
	<div class="container-page">
		<h2 id="feed-title" class="mb-7 text-center text-2xl font-semibold sm:text-3xl"><?php echo esc_html( (string) vr_opt( 'feed_title', 'From Our Feed' ) ); ?></h2>
		<div class="vr-feed-wrap">
			<button type="button" class="vr-feed-nav vr-feed-nav--prev" data-feed-prev aria-label="<?php esc_attr_e( 'Previous videos', 'verdant-roots' ); ?>" hidden><?php vr_e_icon( 'chevronLeft', 20 ); ?></button>
			<ul class="vr-feed-track" data-feed-track>
				<?php foreach ( $vr_feed as $vr_it ) :
					$vr_name  = $vr_names[ $vr_it['provider'] ];
					$vr_label = $vr_it['text'] ? sprintf( /* translators: 1: caption 2: YouTube/Instagram */ __( '%1$s — watch on %2$s', 'verdant-roots' ), $vr_it['text'], $vr_name ) : sprintf( /* translators: %s YouTube/Instagram */ __( 'Watch video on %s', 'verdant-roots' ), $vr_name );
					?>
					<li class="vr-feed-slide">
						<a href="<?php echo esc_url( $vr_it['url'] ); ?>" class="vr-feed-card vr-feed-card--<?php echo esc_attr( $vr_it['provider'] ); ?>" target="_blank" rel="noopener noreferrer" data-feed-open data-provider="<?php echo esc_attr( $vr_it['provider'] ); ?>" data-kind="<?php echo esc_attr( $vr_it['kind'] ); ?>" data-id="<?php echo esc_attr( $vr_it['id'] ); ?>" aria-label="<?php echo esc_attr( $vr_label ); ?>">
							<?php if ( $vr_it['cover'] ) : ?><img src="<?php echo esc_url( $vr_it['cover'] ); ?>" alt="" loading="lazy" decoding="async" class="vr-feed-img" referrerpolicy="no-referrer"><?php endif; ?>
							<span class="vr-feed-badge"><?php echo esc_html( $vr_name ); ?></span>
							<span class="vr-feed-play" aria-hidden="true"><svg viewBox="0 0 24 24" width="26" height="26" fill="currentColor"><path d="M8 5.5v13l11-6.5z"/></svg></span>
							<?php if ( $vr_it['text'] ) : ?><span class="vr-feed-cap"><?php echo esc_html( $vr_it['text'] ); ?></span><?php endif; ?>
						</a>
					</li>
				<?php endforeach; ?>
			</ul>
			<button type="button" class="vr-feed-nav vr-feed-nav--next" data-feed-next aria-label="<?php esc_attr_e( 'Next videos', 'verdant-roots' ); ?>" hidden><?php vr_e_icon( 'chevronRight', 20 ); ?></button>
		</div>
	</div>

	<dialog class="vr-feed-dialog" data-feed-dialog aria-label="<?php esc_attr_e( 'Video player', 'verdant-roots' ); ?>">
		<button type="button" class="vr-feed-close" data-feed-close aria-label="<?php esc_attr_e( 'Close video', 'verdant-roots' ); ?>"><span aria-hidden="true">✕</span></button>
		<div class="vr-feed-player" data-feed-player></div>
	</dialog>
</section>
