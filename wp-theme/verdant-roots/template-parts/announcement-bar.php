<?php
/** Thin announcement bar. Desktop shows every message; mobile rotates (theme.js). */
defined( 'ABSPATH' ) || exit;
$vr_msgs = vr_announcements();
if ( ! $vr_msgs ) {
	return;
}
?>
<div class="bg-brand-800 text-[0.8rem] text-brand-50" role="region" aria-label="<?php esc_attr_e( 'Announcements', 'verdant-roots' ); ?>" data-announce>
	<div class="container-page flex min-h-9 items-center justify-center">
		<ul class="hidden w-full items-center justify-center gap-x-8 md:flex">
			<?php foreach ( $vr_msgs as $vr_m ) : ?><li><?php echo esc_html( $vr_m ); ?></li><?php endforeach; ?>
		</ul>
		<p class="py-2 text-center md:hidden" data-announce-mobile data-messages="<?php echo esc_attr( wp_json_encode( $vr_msgs ) ); ?>"><?php echo esc_html( $vr_msgs[0] ); ?></p>
	</div>
</div>
