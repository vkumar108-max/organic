<?php
/**
 * "Product ads": up to 3 uploaded videos shown under Featured Products.
 * Everything is managed in Appearance → Customize → "Product ads (videos)".
 * Limits are enforced here: 3 slots, MP4/WebM only, a maximum file size (15 MB, filter `vr_ad_video_max_mb`).
 *
 * @package VerdantRoots
 */

defined( 'ABSPATH' ) || exit;

const VR_AD_SLOTS = 3;

/** Largest allowed video file, in bytes. Keep it small: phones load these over mobile data. */
function vr_ad_max_bytes(): int {
	return (int) apply_filters( 'vr_ad_video_max_mb', 15 ) * MB_IN_BYTES;
}

/** Customizer validation for a video slot: must be an MP4/WebM attachment under the size limit. */
function vr_validate_ad_video( WP_Error $validity, $value ): WP_Error {
	$id = absint( $value );
	if ( ! $id ) {
		return $validity; // empty slot is fine.
	}
	if ( 'attachment' !== get_post_type( $id ) || ! in_array( get_post_mime_type( $id ), array( 'video/mp4', 'video/webm' ), true ) ) {
		$validity->add( 'vr_ad_type', __( 'Please choose an MP4 (H.264) or WebM video. Other formats (such as .mov) do not play on every phone.', 'verdant-roots' ) );
		return $validity;
	}
	$file = get_attached_file( $id );
	$size = $file && file_exists( $file ) ? (int) filesize( $file ) : 0;
	if ( $size > vr_ad_max_bytes() ) {
		/* translators: 1: file size, 2: limit */
		$validity->add( 'vr_ad_size', sprintf( __( 'This video is %1$s, which is over the %2$s limit. Compress it (for example 720p, 15–30 seconds, no audio or low-bitrate audio) and upload it again.', 'verdant-roots' ), size_format( $size ), size_format( vr_ad_max_bytes() ) ) );
	}
	return $validity;
}

add_action(
	'customize_register',
	static function ( WP_Customize_Manager $wp_customize ) {
		$limit = size_format( vr_ad_max_bytes() );
		$wp_customize->add_section(
			'vr_ads',
			array(
				'title'       => __( 'Product ads (videos)', 'verdant-roots' ),
				'priority'    => 31,
				'description' => sprintf(
					/* translators: 1: slots, 2: size limit, 3: server upload limit */
					__( 'Shows up to %1$d short videos under "Our Featured Products". Use MP4 (H.264) or WebM, each up to %2$s (your server allows uploads up to %3$s). Tips: 15–30 seconds, 720p is enough, little or no sound — they play muted and loop, and only while on screen. Leave all slots empty to hide the section.', 'verdant-roots' ),
					VR_AD_SLOTS,
					$limit,
					size_format( wp_max_upload_size() )
				),
			)
		);

		$wp_customize->add_setting( 'vr_ads_title', array( 'default' => '', 'sanitize_callback' => 'sanitize_text_field' ) );
		$wp_customize->add_control( 'vr_ads_title', array( 'label' => __( 'Heading above the videos (optional)', 'verdant-roots' ), 'section' => 'vr_ads', 'type' => 'text' ) );

		$wp_customize->add_setting( 'vr_ads_shape', array( 'default' => 'auto', 'sanitize_callback' => static fn( $v ) => in_array( $v, array( 'auto', 'landscape', 'portrait', 'square' ), true ) ? $v : 'auto' ) );
		$wp_customize->add_control(
			'vr_ads_shape',
			array(
				'label'       => __( 'Video shape', 'verdant-roots' ),
				'description' => __( 'Auto follows your first video. On phones the videos are swipeable; on desktop they sit side by side.', 'verdant-roots' ),
				'section'     => 'vr_ads',
				'type'        => 'select',
				'choices'     => array(
					'auto'      => __( 'Auto (match the first video)', 'verdant-roots' ),
					'landscape' => __( 'Landscape 16:9', 'verdant-roots' ),
					'portrait'  => __( 'Portrait 4:5 (reels / stories)', 'verdant-roots' ),
					'square'    => __( 'Square 1:1', 'verdant-roots' ),
				),
			)
		);

		for ( $n = 1; $n <= VR_AD_SLOTS; $n++ ) {
			$wp_customize->add_setting( "vr_ad_video_$n", array( 'default' => 0, 'sanitize_callback' => 'absint', 'validate_callback' => 'vr_validate_ad_video' ) );
			$wp_customize->add_control( new WP_Customize_Media_Control( $wp_customize, "vr_ad_video_$n", array( /* translators: %d slot number */ 'label' => sprintf( __( 'Video %d', 'verdant-roots' ), $n ), 'section' => 'vr_ads', 'mime_type' => 'video' ) ) );

			$wp_customize->add_setting( "vr_ad_poster_$n", array( 'default' => 0, 'sanitize_callback' => 'absint' ) );
			$wp_customize->add_control( new WP_Customize_Media_Control( $wp_customize, "vr_ad_poster_$n", array( /* translators: %d slot number */ 'label' => sprintf( __( 'Cover image for video %d (optional, loads first and saves data)', 'verdant-roots' ), $n ), 'section' => 'vr_ads', 'mime_type' => 'image' ) ) );

			$wp_customize->add_setting( "vr_ad_text_$n", array( 'default' => '', 'sanitize_callback' => 'sanitize_text_field' ) );
			$wp_customize->add_control( "vr_ad_text_$n", array( /* translators: %d slot number */ 'label' => sprintf( __( 'Caption for video %d (optional)', 'verdant-roots' ), $n ), 'section' => 'vr_ads', 'type' => 'text' ) );

			$wp_customize->add_setting( "vr_ad_link_$n", array( 'default' => '', 'sanitize_callback' => 'esc_url_raw' ) );
			$wp_customize->add_control( "vr_ad_link_$n", array( /* translators: %d slot number */ 'label' => sprintf( __( 'Product / page link for video %d (optional — adds a "Shop now" button)', 'verdant-roots' ), $n ), 'section' => 'vr_ads', 'type' => 'url' ) );
		}
	}
);

/** The configured videos (max 3), skipping empty or invalid slots. */
function vr_ad_videos(): array {
	$out = array();
	for ( $n = 1; $n <= VR_AD_SLOTS; $n++ ) {
		$id = absint( get_theme_mod( "vr_ad_video_$n", 0 ) );
		if ( ! $id || ! in_array( get_post_mime_type( $id ), array( 'video/mp4', 'video/webm' ), true ) ) {
			continue;
		}
		$url = wp_get_attachment_url( $id );
		if ( ! $url ) {
			continue;
		}
		$meta     = wp_get_attachment_metadata( $id );
		$poster   = absint( get_theme_mod( "vr_ad_poster_$n", 0 ) );
		$out[]    = array(
			'n'      => $n,
			'url'    => $url,
			'type'   => get_post_mime_type( $id ),
			'poster' => $poster ? (string) wp_get_attachment_image_url( $poster, 'large' ) : '',
			'text'   => (string) get_theme_mod( "vr_ad_text_$n", '' ),
			'link'   => (string) get_theme_mod( "vr_ad_link_$n", '' ),
			'w'      => is_array( $meta ) ? (int) ( $meta['width'] ?? 0 ) : 0,
			'h'      => is_array( $meta ) ? (int) ( $meta['height'] ?? 0 ) : 0,
		);
	}
	return $out;
}

/** landscape | portrait | square — the Customizer choice, or the first video's own shape for "auto". */
function vr_ad_shape( array $videos ): string {
	$shape = (string) vr_opt( 'ads_shape', 'auto' );
	if ( 'auto' !== $shape ) {
		return $shape;
	}
	foreach ( $videos as $v ) {
		if ( $v['w'] && $v['h'] ) {
			$ratio = $v['w'] / $v['h'];
			return $ratio > 1.15 ? 'landscape' : ( $ratio < 0.9 ? 'portrait' : 'square' );
		}
	}
	return 'landscape';
}
