<?php
/**
 * Offer banner ("Limited Time Offer! … use code …"): text, code, button, colour and optional end date are Customizer settings.
 * It only advertises a code; the discount itself is a WooCommerce coupon. Admins who have not created the coupon yet get a note
 * and a one-click "Create coupon" button on the banner (visitors never see either).
 *
 * @package VerdantRoots
 */

defined( 'ABSPATH' ) || exit;

/** Defaults live in one place: the Customizer only applies its own defaults inside the Customizer, the front end needs them passed in. */
function vr_offer_defaults(): array {
	return array(
		'show'    => true,
		'eyebrow' => 'Limited Time Offer!',
		'text'    => 'Get 5% OFF on your first order — use code',
		'code'    => 'DHANVANTARI108',
		'btn'     => 'Start Snacking Smart',
		'link'    => '',
		'end'     => '',
		'bg'      => '#f2b134',
	);
}

/** One banner setting, with its default. */
function vr_offer_opt( string $key ) {
	$defaults = vr_offer_defaults();
	return vr_opt( 'offer_' . $key, $defaults[ $key ] ?? '' );
}

/** Readable text colour (white or deep green) for a background hex colour, by WCAG contrast. */
function vr_text_on( string $hex ): string {
	$h = ltrim( (string) ( sanitize_hex_color( $hex ) ?: vr_offer_defaults()['bg'] ), '#' );
	if ( 3 === strlen( $h ) ) {
		$h = $h[0] . $h[0] . $h[1] . $h[1] . $h[2] . $h[2];
	}
	$lin = static function ( int $v ): float {
		$c = $v / 255;
		return $c <= 0.03928 ? $c / 12.92 : ( ( $c + 0.055 ) / 1.055 ) ** 2.4;
	};
	$l = 0.2126 * $lin( hexdec( substr( $h, 0, 2 ) ) ) + 0.7152 * $lin( hexdec( substr( $h, 2, 2 ) ) ) + 0.0722 * $lin( hexdec( substr( $h, 4, 2 ) ) );
	$on_white = 1.05 / ( $l + 0.05 );
	$on_dark  = ( $l + 0.05 ) / ( 0.0356 + 0.05 ); // #173b20 has luminance ~0.036.
	return $on_white >= $on_dark ? '#ffffff' : '#173b20';
}

add_action(
	'customize_register',
	static function ( WP_Customize_Manager $wp_customize ) {
		$wp_customize->add_section(
			'vr_offer',
			array(
				'title'       => __( 'Offer banner', 'verdant-roots' ),
				'priority'    => 34,
				'description' => __( 'The coloured offer banner under "From Our Feed". The code you show must exist as a WooCommerce coupon (Marketing → Coupons) — admins get a one-click button on the banner to create it. Set an end date so "Limited time" is true; the banner hides itself afterwards.', 'verdant-roots' ),
			)
		);
		$fields = array(
			'offer_show'    => array( __( 'Show the offer banner', 'verdant-roots' ), 'checkbox', vr_offer_defaults()['show'], 'wp_validate_boolean' ),
			'offer_eyebrow' => array( __( 'Small heading', 'verdant-roots' ), 'text', vr_offer_defaults()['eyebrow'], 'sanitize_text_field' ),
			'offer_text'    => array( __( 'Offer text (the code is shown right after it)', 'verdant-roots' ), 'text', vr_offer_defaults()['text'], 'sanitize_text_field' ),
			'offer_code'    => array( __( 'Coupon code', 'verdant-roots' ), 'text', vr_offer_defaults()['code'], 'sanitize_text_field' ),
			'offer_btn'     => array( __( 'Button text', 'verdant-roots' ), 'text', vr_offer_defaults()['btn'], 'sanitize_text_field' ),
			'offer_link'    => array( __( 'Button link (empty = your Shop page)', 'verdant-roots' ), 'url', '', 'esc_url_raw' ),
			'offer_end'     => array( __( 'Offer ends on (optional — the banner hides itself after this date)', 'verdant-roots' ), 'date', '', static fn( $v ) => preg_match( '/^\d{4}-\d{2}-\d{2}$/', (string) $v ) ? $v : '' ),
		);
		foreach ( $fields as $key => [ $label, $type, $default, $sanitize ] ) {
			$wp_customize->add_setting( 'vr_' . $key, array( 'default' => $default, 'sanitize_callback' => $sanitize ) );
			$wp_customize->add_control( 'vr_' . $key, array( 'label' => $label, 'section' => 'vr_offer', 'type' => $type ) );
		}
		$wp_customize->add_setting( 'vr_offer_bg', array( 'default' => vr_offer_defaults()['bg'], 'sanitize_callback' => 'sanitize_hex_color' ) );
		$wp_customize->add_control( new WP_Customize_Color_Control( $wp_customize, 'vr_offer_bg', array( 'label' => __( 'Banner colour (text colour adjusts automatically)', 'verdant-roots' ), 'section' => 'vr_offer' ) ) );
	}
);

/** Is the banner active (switched on, has text, not past its end date)? */
function vr_offer_active(): bool {
	if ( ! wp_validate_boolean( vr_offer_opt( 'show' ) ) || '' === trim( (string) vr_offer_opt( 'text' ) . (string) vr_offer_opt( 'eyebrow' ) ) ) {
		return false;
	}
	$end = (string) vr_offer_opt( 'end' );
	if ( $end ) {
		$deadline = date_create_immutable( $end . ' 23:59:59', wp_timezone() );
		if ( $deadline && $deadline->getTimestamp() < time() ) {
			return false;
		}
	}
	return true;
}

/** Percentage mentioned in the offer text (e.g. "5% OFF"), used only when creating the coupon. */
function vr_offer_percent(): float {
	return preg_match( '/(\d{1,2}(?:\.\d+)?)\s*%/', (string) vr_offer_opt( 'text' ) . ' ' . (string) vr_offer_opt( 'eyebrow' ), $m ) ? (float) $m[1] : 5.0;
}

/** Admin-only: create the coupon the banner advertises (percent off, one use per customer). */
add_action(
	'admin_post_vr_create_offer_coupon',
	static function () {
		if ( ! class_exists( 'WC_Coupon' ) || ! current_user_can( 'manage_woocommerce' ) ) {
			wp_die( esc_html__( 'You are not allowed to do this.', 'verdant-roots' ), 403 );
		}
		check_admin_referer( 'vr_offer_coupon' );
		$code = strtolower( trim( (string) vr_offer_opt( 'code' ) ) );
		if ( $code && ! wc_get_coupon_id_by_code( $code ) ) {
			$coupon = new WC_Coupon();
			$coupon->set_code( $code );
			$coupon->set_discount_type( 'percent' );
			$coupon->set_amount( (string) vr_offer_percent() );
			$coupon->set_individual_use( true );
			$coupon->set_usage_limit_per_user( 1 );
			$coupon->save();
		}
		if ( 'yes' !== get_option( 'woocommerce_enable_coupons' ) ) {
			update_option( 'woocommerce_enable_coupons', 'yes' ); // a coupon does nothing while coupons are switched off.
		}
		wp_safe_redirect( wp_get_referer() ?: home_url( '/' ) );
		exit;
	}
);
