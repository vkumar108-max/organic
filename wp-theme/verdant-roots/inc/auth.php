<?php
/**
 * Login & Sign-up card (My Account page for logged-out visitors): a split card whose angled "blade" slides between
 * "Sign in" and "Create account". Both are the real WooCommerce forms (same fields, nonces and hooks), so logins,
 * registrations, password resets and plugins keep working. Texts are in Customize → Login & Sign-up.
 *
 * @package VerdantRoots
 */

defined( 'ABSPATH' ) || exit;

/** Defaults live here once (the Customizer only applies its own defaults inside the Customizer). "|" splits a heading into plain + italic-gold part. */
function vr_auth_defaults(): array {
	return array(
		'title_in' => 'Welcome|back.',
		'text_in'  => 'Your orders, saved items and addresses are right where you left them.',
		'title_up' => 'Start the|first page.',
		'text_up'  => 'One account for your orders, saved items and addresses.',
	);
}

function vr_auth_opt( string $key ): string {
	$d = vr_auth_defaults();
	return (string) vr_opt( 'auth_' . $key, $d[ $key ] ?? '' );
}

/** "Welcome|back." → Welcome<br><em>back.</em> */
function vr_auth_title_html( string $title ): string {
	$parts = explode( '|', $title, 2 );
	return esc_html( trim( $parts[0] ) ) . ( isset( $parts[1] ) && '' !== trim( $parts[1] ) ? '<br><em>' . esc_html( trim( $parts[1] ) ) . '</em>' : '' );
}

add_action(
	'customize_register',
	static function ( WP_Customize_Manager $wp_customize ) {
		$d = vr_auth_defaults();
		$wp_customize->add_section( 'vr_auth', array( 'title' => __( 'Login & Sign-up', 'verdant-roots' ), 'priority' => 37, 'description' => __( 'Texts on the green panel of the My Account login / sign-up card. In a heading, type "|" to start the italic gold part (e.g. Welcome|back.). Sign-up must be switched on in WooCommerce → Settings → Accounts & Privacy ("Allow customers to create an account on the My account page").', 'verdant-roots' ) ) );
		foreach ( array(
			'title_in' => array( __( 'Sign-in heading', 'verdant-roots' ), 'text' ),
			'text_in'  => array( __( 'Sign-in text', 'verdant-roots' ), 'textarea' ),
			'title_up' => array( __( 'Create-account heading', 'verdant-roots' ), 'text' ),
			'text_up'  => array( __( 'Create-account text', 'verdant-roots' ), 'textarea' ),
		) as $key => [ $label, $type ] ) {
			$wp_customize->add_setting( 'vr_auth_' . $key, array( 'default' => $d[ $key ], 'sanitize_callback' => 'textarea' === $type ? 'sanitize_textarea_field' : 'sanitize_text_field' ) );
			$wp_customize->add_control( 'vr_auth_' . $key, array( 'label' => $label, 'section' => 'vr_auth', 'type' => $type ) );
		}
	}
);

/*
 * Server-side rules for the sign-up form of this card (WooCommerce's own handler has already verified the nonce when these run).
 * They only act when the card's "Full name" field was posted, so other register forms are untouched.
 */
add_filter(
	'woocommerce_process_registration_errors',
	static function ( $errors, $username, $password ) {
		if ( ! isset( $_POST['vr_full_name'] ) ) { // phpcs:ignore WordPress.Security.NonceVerification
			return $errors;
		}
		if ( '' === trim( sanitize_text_field( wp_unslash( $_POST['vr_full_name'] ) ) ) ) { // phpcs:ignore WordPress.Security.NonceVerification
			$errors->add( 'vr_name_required', __( 'Please enter your full name.', 'verdant-roots' ) );
		}
		if ( '' !== (string) $password && strlen( (string) $password ) < 8 ) {
			$errors->add( 'vr_password_short', __( 'Please use a password with at least 8 characters.', 'verdant-roots' ) );
		}
		return $errors;
	},
	10,
	3
);

/** Save the Full name as first / last name on the new customer. */
add_action(
	'woocommerce_created_customer',
	static function ( $customer_id ) {
		if ( ! isset( $_POST['register'], $_POST['vr_full_name'] ) ) { // phpcs:ignore WordPress.Security.NonceVerification
			return;
		}
		$name  = trim( preg_replace( '/\s+/', ' ', sanitize_text_field( wp_unslash( $_POST['vr_full_name'] ) ) ) ); // phpcs:ignore WordPress.Security.NonceVerification
		if ( '' === $name ) {
			return;
		}
		$parts = explode( ' ', $name, 2 );
		wp_update_user( array( 'ID' => (int) $customer_id, 'first_name' => $parts[0], 'last_name' => $parts[1] ?? '', 'display_name' => $name ) );
	}
);
