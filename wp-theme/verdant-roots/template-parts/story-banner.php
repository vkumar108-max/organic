<?php
/**
 * "Our Story" banner: full-width, responsive (whole banner on desktop, centred crop on phones).
 * Image/alt/link come from Customize → Story banner; defaults to the bundled artwork.
 *
 * @package VerdantRoots
 */

defined( 'ABSPATH' ) || exit;

if ( ! wp_validate_boolean( vr_opt( 'banner_show', true ) ) ) {
	return;
}
$vr_alt   = (string) vr_opt( 'banner_alt', 'Our Story: How Lord Dhanvantari shared the gift of natural healing with the world' );
$vr_img   = absint( vr_opt( 'banner_image', 0 ) );
$vr_link  = (string) vr_opt( 'banner_link', '' );
$vr_about = get_page_by_path( 'about' );
if ( ! $vr_link && $vr_about ) {
	$vr_link = get_permalink( $vr_about );
}
// phones show the centre 11:10 of the banner, so ask for the large file there; desktop uses the same file at full width.
$vr_sizes = '(max-width: 767px) 230vw, 100vw';
if ( $vr_img ) {
	$vr_tag = wp_get_attachment_image( $vr_img, 'full', false, array( 'class' => 'vr-story-img', 'alt' => $vr_alt, 'loading' => 'lazy', 'decoding' => 'async', 'sizes' => $vr_sizes ) );
} else {
	$vr_tag = '<img class="vr-story-img" src="' . esc_url( get_theme_file_uri( 'assets/img/our-story-banner.webp' ) ) . '" width="1983" height="793" alt="' . esc_attr( $vr_alt ) . '" loading="lazy" decoding="async">';
}
if ( ! $vr_tag ) {
	return;
}
?>
<section class="vr-story" aria-label="<?php esc_attr_e( 'Our Story', 'verdant-roots' ); ?>">
	<?php if ( $vr_link ) : ?><a href="<?php echo esc_url( $vr_link ); ?>" class="vr-story-link"><?php echo $vr_tag; // phpcs:ignore WordPress.Security.EscapeOutput -- built above from escaped parts / core helper. ?></a>
	<?php else : echo $vr_tag; // phpcs:ignore WordPress.Security.EscapeOutput
	endif; ?>
</section>
