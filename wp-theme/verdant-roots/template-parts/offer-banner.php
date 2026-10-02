<?php
/**
 * Coloured offer banner. Settings: Customize → Offer banner. Colour is a picker; text colour is chosen for contrast.
 *
 * @package VerdantRoots
 */

defined( 'ABSPATH' ) || exit;

if ( ! vr_offer_active() ) {
	return;
}
$vr_bg    = (string) ( sanitize_hex_color( (string) vr_opt( 'offer_bg', '#f2b134' ) ) ?: '#f2b134' );
$vr_fg    = vr_text_on( $vr_bg );
$vr_code  = trim( (string) vr_opt( 'offer_code', '' ) );
$vr_link  = (string) vr_opt( 'offer_link', '' );
if ( ! $vr_link ) {
	$vr_link = function_exists( 'wc_get_page_permalink' ) ? wc_get_page_permalink( 'shop' ) : home_url( '/' );
}
$vr_end   = (string) vr_opt( 'offer_end', '' );
$vr_when  = $vr_end && ( $vr_ts = strtotime( $vr_end . ' 12:00:00' ) ) ? wp_date( 'j M Y', $vr_ts ) : '';
$vr_miss  = $vr_code && current_user_can( 'manage_woocommerce' ) && function_exists( 'wc_get_coupon_id_by_code' ) && ! wc_get_coupon_id_by_code( strtolower( $vr_code ) );
?>
<section class="px-3 py-6 sm:px-0 sm:py-8" aria-label="<?php esc_attr_e( 'Offer', 'verdant-roots' ); ?>">
	<div class="container-page">
		<div class="vr-offer" style="--offer-bg: <?php echo esc_attr( $vr_bg ); ?>; --offer-fg: <?php echo esc_attr( $vr_fg ); ?>;">
			<div class="vr-offer-body">
				<?php if ( vr_opt( 'offer_eyebrow', 'Limited Time Offer!' ) ) : ?><p class="vr-offer-eyebrow"><?php echo esc_html( (string) vr_opt( 'offer_eyebrow', 'Limited Time Offer!' ) ); ?><?php if ( $vr_when ) : ?> <span class="vr-offer-when"><?php echo esc_html( sprintf( /* translators: %s date */ __( 'Ends %s', 'verdant-roots' ), $vr_when ) ); ?></span><?php endif; ?></p><?php endif; ?>
				<p class="vr-offer-text">
					<?php echo esc_html( (string) vr_opt( 'offer_text', '' ) ); ?>
					<?php if ( $vr_code ) : ?>
						<span class="vr-offer-code"><code><?php echo esc_html( $vr_code ); ?></code><button type="button" class="vr-offer-copy" data-offer-copy="<?php echo esc_attr( $vr_code ); ?>" hidden><?php esc_html_e( 'Copy', 'verdant-roots' ); ?></button></span>
					<?php endif; ?>
				</p>
			</div>
			<?php if ( vr_opt( 'offer_btn', 'Start Snacking Smart' ) ) : ?>
				<a href="<?php echo esc_url( $vr_link ); ?>" class="vr-offer-btn"><?php echo esc_html( (string) vr_opt( 'offer_btn', 'Start Snacking Smart' ) ); ?> <?php vr_e_icon( 'arrowRight', 18 ); ?></a>
			<?php endif; ?>
		</div>
		<?php if ( $vr_miss ) : ?>
			<form class="vr-bsl-note mt-3" method="post" action="<?php echo esc_url( admin_url( 'admin-post.php' ) ); ?>" role="note">
				<input type="hidden" name="action" value="vr_create_offer_coupon">
				<?php wp_nonce_field( 'vr_offer_coupon' ); ?>
				<?php echo esc_html( sprintf( /* translators: 1: code 2: percent */ __( 'Only you (admin) can see this: the coupon "%1$s" does not exist yet, so customers would get an error. Create it now (%2$s%% off, one use per customer)?', 'verdant-roots' ), $vr_code, rtrim( rtrim( number_format( vr_offer_percent(), 2, '.', '' ), '0' ), '.' ) ) ); ?>
				<button type="submit" class="vr-btn vr-btn--sm ml-2"><?php esc_html_e( 'Create coupon', 'verdant-roots' ); ?></button>
			</form>
		<?php endif; ?>
	</div>
</section>
