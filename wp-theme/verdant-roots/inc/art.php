<?php
/**
 * Generated placeholder artwork (port of ProductArt.tsx). Used whenever a
 * product / category / post has no real image, so nothing looks broken.
 *
 * @package VerdantRoots
 */

defined( 'ABSPATH' ) || exit;

function vr_art_palettes(): array {
	return array(
		'fruit'     => array( '#fff3e0', '#ffe0b2', '#f6b04a', '#7a4a1d', '#e8743b' ),
		'leaf'      => array( '#e8f5e9', '#c8e6c9', '#5fa564', '#245c2f', '#2d7439' ),
		'vegetable' => array( '#fdeaf1', '#f8c9db', '#c2456f', '#5a1f36', '#8c2d4f' ),
		'combo'     => array( '#f3ece0', '#e6d9c2', '#b7794a', '#4a3320', '#3f8f4a' ),
		'tablet'    => array( '#e8f1f7', '#c7dcea', '#4d8fb5', '#1f4a66', '#f2f2ec' ),
		'dry'       => array( '#f4efe0', '#e5dbb8', '#a8874a', '#4b3a18', '#6f8f3a' ),
		'makhana'   => array( '#fbf3e2', '#efdcb8', '#d9b26a', '#5a3d1a', '#c0562f' ),
	);
}

/** Raw SVG markup for a tone. */
function vr_art_svg( string $tone = 'leaf', string $label = '', int $variant = 0 ): string {
	$palettes = vr_art_palettes();
	[ $bg1, $bg2, $body, $lid, $accent ] = $palettes[ $tone ] ?? $palettes['leaf'];
	$id    = 'a' . $tone . $variant;
	$shift = array( 0, 14, -10, 6 )[ $variant % 4 ];
	$role  = $label ? 'role="img" aria-label="' . esc_attr( $label ) . '"' : 'aria-hidden="true"';

	$svg  = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" ' . $role . ' preserveAspectRatio="xMidYMid slice">';
	$svg .= '<defs><linearGradient id="' . $id . '" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="' . $bg1 . '"/><stop offset="1" stop-color="' . $bg2 . '"/></linearGradient></defs>';
	$svg .= '<rect width="400" height="400" fill="url(#' . $id . ')"/>';
	$svg .= '<circle cx="' . ( 320 + $shift ) . '" cy="90" r="70" fill="#fff" opacity=".35"/>';
	$svg .= '<ellipse cx="200" cy="345" rx="112" ry="16" fill="#000" opacity=".1"/>';
	if ( 'makhana' === $tone ) {
		// Standing pouch with a zig-zag seal, label and puffed makhana around it.
		$svg .= '<path d="M120 112h160l14 236c1 12-8 22-20 22H126c-12 0-21-10-20-22L120 112Z" fill="' . $body . '"/>';
		$svg .= '<path d="M120 112h160v22l-13-9-13 9-13-9-13 9-13-9-13 9-13-9-13 9-13-9-13 9-13-9-13 9-14-9Z" fill="' . $lid . '" opacity=".85"/>';
		$svg .= '<path d="M140 150c14 60 6 150 4 200" stroke="#fff" stroke-width="10" stroke-linecap="round" opacity=".18" fill="none"/>';
		$svg .= '<rect x="142" y="196" width="116" height="92" rx="14" fill="#fff" opacity=".93"/>';
		$svg .= '<circle cx="180" cy="238" r="20" fill="#fbf3e2" stroke="' . $body . '" stroke-width="3"/><circle cx="174" cy="232" r="6" fill="#fff"/><circle cx="212" cy="246" r="14" fill="#fbf3e2" stroke="' . $body . '" stroke-width="3"/>';
		$svg .= '<rect x="196" y="214" width="46" height="6" rx="3" fill="' . $lid . '" opacity=".55"/><rect x="216" y="264" width="30" height="6" rx="3" fill="' . $lid . '" opacity=".3"/>';
		foreach ( array( array( 70, 320, 22 ), array( 96, 352, 14 ), array( 318, 330, 24 ), array( 340, 300, 13 ), array( 300, 362, 12 ), array( 52, 268, 11 ) ) as [ $px, $py, $pr ] ) {
			$svg .= '<circle cx="' . ( $px + $shift ) . '" cy="' . $py . '" r="' . $pr . '" fill="#fff8ea" stroke="' . $body . '" stroke-width="2.5"/><circle cx="' . ( $px + $shift - $pr / 3 ) . '" cy="' . ( $py - $pr / 3 ) . '" r="' . ( $pr / 4 ) . '" fill="#fff"/>';
		}
	} elseif ( 'tablet' === $tone ) {
		$svg .= '<rect x="130" y="130" width="140" height="205" rx="22" fill="' . $body . '"/><rect x="140" y="92" width="120" height="48" rx="12" fill="' . $lid . '"/><rect x="150" y="192" width="100" height="70" rx="10" fill="#fff" opacity=".9"/>';
		$svg .= '<circle cx="86" cy="330" r="16" fill="#fff" stroke="' . $lid . '" stroke-width="3"/><circle cx="322" cy="322" r="16" fill="#fff" stroke="' . $lid . '" stroke-width="3"/>';
	} else {
		$svg .= '<path d="M112 150c0-14 10-24 24-24h128c14 0 24 10 24 24l-14 178c-1 12-11 20-23 20H149c-12 0-22-8-23-20L112 150Z" fill="' . $body . '"/>';
		$svg .= '<rect x="128" y="92" width="144" height="40" rx="10" fill="' . $lid . '"/><rect x="136" y="180" width="128" height="94" rx="12" fill="#fff" opacity=".92"/>';
		$svg .= '<path d="M170 240c0-22 14-36 36-36 0 24-14 38-36 38Z" fill="' . $accent . '"/><path d="M172 244c6-10 14-18 24-24" stroke="#fff" stroke-width="3" stroke-linecap="round" fill="none"/>';
		$svg .= '<rect x="216" y="204" width="34" height="6" rx="3" fill="' . $lid . '" opacity=".6"/><rect x="216" y="220" width="26" height="6" rx="3" fill="' . $lid . '" opacity=".35"/>';
	}
	if ( 'combo' === $tone ) {
		$svg .= '<rect x="50" y="215" width="64" height="120" rx="12" fill="' . $accent . '"/><rect x="290" y="230" width="64" height="105" rx="12" fill="' . $lid . '"/>';
	}
	return $svg . '</svg>';
}

/** Inline placeholder (no <img>), sized by its parent. */
function vr_art( string $tone = 'leaf', string $label = '', int $variant = 0, string $class = 'h-full w-full' ): string {
	return '<span class="block ' . esc_attr( $class ) . '">' . str_replace( '<svg ', '<svg class="h-full w-full" ', vr_art_svg( $tone, $label, $variant ) ) . '</span>';
}

/** URL of a generated placeholder image (a real SVG response, so esc_url() and caches are happy). */
function vr_art_url( string $tone ): string {
	return add_query_arg( 'vr_art', array_key_exists( $tone, vr_art_palettes() ) ? $tone : 'leaf', home_url( '/' ) );
}

/** Serves /?vr_art=<tone> as an immutable SVG image. */
add_action(
	'template_redirect',
	static function () {
		if ( ! isset( $_GET['vr_art'] ) ) { // phpcs:ignore WordPress.Security.NonceVerification -- public, read-only image.
			return;
		}
		$tone = sanitize_key( wp_unslash( $_GET['vr_art'] ) ); // phpcs:ignore WordPress.Security.NonceVerification
		$tone = array_key_exists( $tone, vr_art_palettes() ) ? $tone : 'leaf';
		nocache_headers();
		header( 'Content-Type: image/svg+xml; charset=utf-8' );
		header( 'Cache-Control: public, max-age=31536000, immutable' );
		header( 'X-Content-Type-Options: nosniff' );
		echo vr_art_svg( $tone, '' ); // phpcs:ignore WordPress.Security.EscapeOutput -- built from a fixed palette table.
		exit;
	},
	0
);
