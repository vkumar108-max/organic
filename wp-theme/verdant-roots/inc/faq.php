<?php
/**
 * Home page FAQs (under "Helpful guides"). Up to 8 question / answer pairs, edited in
 * Appearance → Customize → "Home FAQs". Six neutral starter answers ship with the theme: they only describe how
 * the shop itself works. Add your own delivery, returns and product answers there — nothing is invented for you.
 * Clear a question to remove it. FAQPage structured data is printed from the same visible content.
 *
 * @package VerdantRoots
 */

defined( 'ABSPATH' ) || exit;

const VR_FAQ_SLOTS = 8;

/** Starter pairs (slot => [question, answer]). Defaults are passed in on the front end, so they live here once. */
function vr_faq_defaults(): array {
	return array(
		1 => array( 'How do I place an order?', 'Browse the shop, choose a pack size, add the product to your cart and follow the checkout steps. You will see the full order total before you pay.' ),
		2 => array( 'Which payment methods can I use?', "The payment options available to you are shown at checkout. Online payments are completed on the payment provider's secure page, so your card details never touch this website." ),
		3 => array( 'How do I use a coupon code?', 'Add your products to the cart, type the code into the coupon box on the cart or checkout page and press Apply. The discount appears in your order total before you pay.' ),
		4 => array( 'How can I track my order?', 'Open the Track Order page from the menu or footer and enter your order number and the email you used at checkout. You can also see your orders under My Account.' ),
		5 => array( 'How should I store the products?', 'Each product page lists storage information. As a general rule, keep powders and dry products in a cool, dry place in a tightly closed container, away from moisture and direct sunlight.' ),
		6 => array( 'Who can I contact if I have a question?', 'Use the Contact page and we will get back to you. Please include your order number if your question is about an order. Our content is general information, not medical advice — please speak to a qualified professional about any health concern.' ),
	);
}

/** One FAQ field with its default (the Customizer only applies its own defaults inside the Customizer). */
function vr_faq_opt( string $type, int $n ): string {
	$defaults = vr_faq_defaults();
	$default  = $defaults[ $n ][ 'q' === $type ? 0 : 1 ] ?? '';
	return (string) vr_opt( "faq_{$type}_{$n}", $default );
}

/** The visible pairs: [question, answer], skipping slots where either part is empty. */
function vr_faq_pairs(): array {
	$out = array();
	for ( $n = 1; $n <= VR_FAQ_SLOTS; $n++ ) {
		$q = trim( vr_faq_opt( 'q', $n ) );
		$a = trim( vr_faq_opt( 'a', $n ) );
		if ( '' !== $q && '' !== $a ) {
			$out[] = array( $q, $a );
		}
	}
	return $out;
}

add_action(
	'customize_register',
	static function ( WP_Customize_Manager $wp_customize ) {
		$wp_customize->add_section(
			'vr_faq',
			array(
				'title'       => __( 'Home FAQs', 'verdant-roots' ),
				'priority'    => 35,
				'description' => sprintf(
					/* translators: %d slots */
					__( 'Questions and answers shown under "Helpful guides" on the home page (up to %d). Edit any text, or clear a question to remove it. Starter answers only describe how the shop works — add your own delivery, returns and product answers, and keep health wording within what you can substantiate.', 'verdant-roots' ),
					VR_FAQ_SLOTS
				),
			)
		);
		$wp_customize->add_setting( 'vr_faq_title', array( 'default' => 'Frequently asked questions', 'sanitize_callback' => 'sanitize_text_field' ) );
		$wp_customize->add_control( 'vr_faq_title', array( 'label' => __( 'Heading', 'verdant-roots' ), 'section' => 'vr_faq', 'type' => 'text' ) );
		$wp_customize->add_setting( 'vr_faq_intro', array( 'default' => 'Quick answers about ordering, payment and your products.', 'sanitize_callback' => 'sanitize_text_field' ) );
		$wp_customize->add_control( 'vr_faq_intro', array( 'label' => __( 'Short intro (optional)', 'verdant-roots' ), 'section' => 'vr_faq', 'type' => 'text' ) );

		$defaults = vr_faq_defaults();
		for ( $n = 1; $n <= VR_FAQ_SLOTS; $n++ ) {
			$wp_customize->add_setting( "vr_faq_q_$n", array( 'default' => $defaults[ $n ][0] ?? '', 'sanitize_callback' => 'sanitize_text_field' ) );
			$wp_customize->add_control( "vr_faq_q_$n", array( /* translators: %d number */ 'label' => sprintf( __( 'Question %d', 'verdant-roots' ), $n ), 'section' => 'vr_faq', 'type' => 'text' ) );
			$wp_customize->add_setting( "vr_faq_a_$n", array( 'default' => $defaults[ $n ][1] ?? '', 'sanitize_callback' => 'sanitize_textarea_field' ) );
			$wp_customize->add_control( "vr_faq_a_$n", array( /* translators: %d number */ 'label' => sprintf( __( 'Answer %d', 'verdant-roots' ), $n ), 'section' => 'vr_faq', 'type' => 'textarea' ) );
		}
	}
);
