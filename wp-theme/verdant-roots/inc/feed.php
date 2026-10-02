<?php
/**
 * "From Our Feed": up to 6 videos set by pasting a YouTube or Instagram link (Customize → From Our Feed).
 * Links are parsed into provider + id and the player URL is rebuilt from those parts only, so nothing
 * but youtube-nocookie.com / instagram.com embeds can ever be loaded. Nothing is fetched from YouTube or
 * Instagram until a visitor taps a card (YouTube thumbnails excepted: they come from i.ytimg.com).
 *
 * @package VerdantRoots
 */

defined( 'ABSPATH' ) || exit;

const VR_FEED_SLOTS = 6;

/**
 * Parse a YouTube (watch, youtu.be, shorts, embed, live) or Instagram (reel, p, tv) link.
 *
 * @return array{provider:string,id:string,kind:string,url:string}|null
 */
function vr_feed_parse( string $url ): ?array {
	$parts = wp_parse_url( trim( $url ) );
	if ( empty( $parts['host'] ) ) {
		return null;
	}
	$host = strtolower( (string) preg_replace( '/^(www\.|m\.)/i', '', $parts['host'] ) );
	$path = (string) ( $parts['path'] ?? '' );
	$yt   = static fn( string $id ): array => array( 'provider' => 'youtube', 'id' => $id, 'kind' => 'video', 'url' => 'https://www.youtube.com/watch?v=' . $id );

	if ( in_array( $host, array( 'youtube.com', 'youtube-nocookie.com' ), true ) ) {
		if ( preg_match( '#^/(?:shorts|embed|live|v)/([A-Za-z0-9_-]{11})(?:[/?]|$)#', $path, $m ) ) {
			return $yt( $m[1] );
		}
		parse_str( (string) ( $parts['query'] ?? '' ), $q );
		if ( isset( $q['v'] ) && is_string( $q['v'] ) && preg_match( '/^[A-Za-z0-9_-]{11}$/', $q['v'] ) ) {
			return $yt( $q['v'] );
		}
	} elseif ( 'youtu.be' === $host && preg_match( '#^/([A-Za-z0-9_-]{11})(?:[/?]|$)#', $path, $m ) ) {
		return $yt( $m[1] );
	} elseif ( 'instagram.com' === $host && preg_match( '#^/(?:[A-Za-z0-9_.]+/)?(reel|p|tv)/([A-Za-z0-9_-]{5,})#', $path, $m ) ) {
		return array( 'provider' => 'instagram', 'id' => $m[2], 'kind' => $m[1], 'url' => 'https://www.instagram.com/' . $m[1] . '/' . $m[2] . '/' );
	}
	return null;
}

/** Customizer validation: empty is fine, otherwise it must be a recognisable YouTube / Instagram link. */
function vr_validate_feed_url( WP_Error $validity, $value ): WP_Error {
	$value = trim( (string) $value );
	if ( '' !== $value && ! vr_feed_parse( $value ) ) {
		$validity->add( 'vr_feed_url', __( 'Please paste a public YouTube link (watch, youtu.be or Shorts) or an Instagram reel / post link.', 'verdant-roots' ) );
	}
	return $validity;
}

add_action(
	'customize_register',
	static function ( WP_Customize_Manager $wp_customize ) {
		$wp_customize->add_section(
			'vr_feed',
			array(
				'title'       => __( 'From Our Feed (YouTube / Instagram)', 'verdant-roots' ),
				'priority'    => 33,
				'description' => sprintf(
					/* translators: %d number of slots */
					__( 'Paste up to %d public YouTube or Instagram links (videos, Shorts, reels, posts). Cards open the video in a pop-up player. YouTube covers load automatically; for Instagram upload a cover image (Instagram does not share covers). Leave all empty to hide the section.', 'verdant-roots' ),
					VR_FEED_SLOTS
				),
			)
		);
		$wp_customize->add_setting( 'vr_feed_title', array( 'default' => 'From Our Feed', 'sanitize_callback' => 'sanitize_text_field' ) );
		$wp_customize->add_control( 'vr_feed_title', array( 'label' => __( 'Heading', 'verdant-roots' ), 'section' => 'vr_feed', 'type' => 'text' ) );

		for ( $n = 1; $n <= VR_FEED_SLOTS; $n++ ) {
			$wp_customize->add_setting( "vr_feed_url_$n", array( 'default' => '', 'sanitize_callback' => 'esc_url_raw', 'validate_callback' => 'vr_validate_feed_url' ) );
			$wp_customize->add_control( "vr_feed_url_$n", array( /* translators: %d slot number */ 'label' => sprintf( __( 'Video %d — YouTube or Instagram link', 'verdant-roots' ), $n ), 'section' => 'vr_feed', 'type' => 'url', 'input_attrs' => array( 'placeholder' => 'https://www.youtube.com/watch?v=… or https://www.instagram.com/reel/…' ) ) );

			$wp_customize->add_setting( "vr_feed_cover_$n", array( 'default' => 0, 'sanitize_callback' => 'absint' ) );
			$wp_customize->add_control( new WP_Customize_Media_Control( $wp_customize, "vr_feed_cover_$n", array( /* translators: %d slot number */ 'label' => sprintf( __( 'Cover image for video %d (needed for Instagram, optional for YouTube; portrait 9:16 looks best)', 'verdant-roots' ), $n ), 'section' => 'vr_feed', 'mime_type' => 'image' ) ) );

			$wp_customize->add_setting( "vr_feed_text_$n", array( 'default' => '', 'sanitize_callback' => 'sanitize_text_field' ) );
			$wp_customize->add_control( "vr_feed_text_$n", array( /* translators: %d slot number */ 'label' => sprintf( __( 'Caption for video %d (optional)', 'verdant-roots' ), $n ), 'section' => 'vr_feed', 'type' => 'text' ) );
		}
	}
);

/** The configured feed items (max 6), skipping empty or unrecognised slots. */
function vr_feed_items(): array {
	$out = array();
	for ( $n = 1; $n <= VR_FEED_SLOTS; $n++ ) {
		$parsed = vr_feed_parse( (string) get_theme_mod( "vr_feed_url_$n", '' ) );
		if ( ! $parsed ) {
			continue;
		}
		$cover_id = absint( get_theme_mod( "vr_feed_cover_$n", 0 ) );
		$cover    = $cover_id ? (string) wp_get_attachment_image_url( $cover_id, 'large' ) : '';
		if ( ! $cover && 'youtube' === $parsed['provider'] ) {
			$cover = 'https://i.ytimg.com/vi/' . $parsed['id'] . '/hqdefault.jpg';
		}
		$out[] = $parsed + array( 'n' => $n, 'cover' => $cover, 'text' => (string) get_theme_mod( "vr_feed_text_$n", '' ) );
	}
	return $out;
}
