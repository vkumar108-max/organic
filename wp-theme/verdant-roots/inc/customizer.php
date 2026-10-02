<?php
/**
 * Customizer: everything a shop owner edits without code.
 *
 * @package VerdantRoots
 */

defined( 'ABSPATH' ) || exit;

add_action(
	'customize_register',
	static function ( WP_Customize_Manager $wp_customize ) {
		$wp_customize->add_section( 'vr_store', array( 'title' => __( 'Verdant Roots store settings', 'verdant-roots' ), 'priority' => 30 ) );

		$fields = array(
			'announcements' => array( __( 'Announcement bar (one message per line)', 'verdant-roots' ), 'textarea', vr_default_announcements() ),
			'free_shipping' => array( __( 'Free shipping threshold (₹, display only — configure the real rule in WooCommerce → Shipping)', 'verdant-roots' ), 'number', 499 ),
			'hero_title'    => array( __( 'Hero headline', 'verdant-roots' ), 'text', 'Natural Goodness, Made Simple' ),
			'hero_text'     => array( __( 'Hero sub-heading', 'verdant-roots' ), 'textarea', 'Discover quality fruit, leaf and vegetable products for everyday living.' ),
			'hero_cats'     => array( __( 'Hero 3D slider — categories (up to 5, comma-separated slugs or names)', 'verdant-roots' ), 'text', 'fruit-powder, leaf-powder, vegetable-powder, dry-vegetables, tablets' ),
			'trust_items'   => array( __( 'Trust strip under the hero — one per line: Label | Detail | Logo URL. Add ONLY licences/certificates you really hold, e.g. FSSAI | Lic. No. 1234… | https://…/fssai.png (upload logos in Media). Leave empty to hide the strip.', 'verdant-roots' ), 'textarea', '' ),
			'wellness_title' => array( __( 'Herbal & Wellness section — heading', 'verdant-roots' ), 'text', 'Herbal & Wellness' ),
			'wellness_cats'  => array( __( 'Herbal & Wellness section — categories (up to 4, comma-separated slugs, in order)', 'verdant-roots' ), 'text', 'herbal-powder, superfood-powder, immunity-products, nutrition-products' ),
			'featured_title' => array( __( 'Featured products section — heading', 'verdant-roots' ), 'text', 'Our Featured Products' ),
			'section_1'     => array( __( 'Home section 1 — product category slug', 'verdant-roots' ), 'text', 'fruit-powder' ),
			'section_2'     => array( __( 'Home section 2 — product category slug', 'verdant-roots' ), 'text', 'leaf-powder' ),
			'section_3'     => array( __( 'Home section 3 — product category slug', 'verdant-roots' ), 'text', 'vegetable-powder' ),
			'combo_slug'    => array( __( 'Combos category slug', 'verdant-roots' ), 'text', 'combos' ),
			'best_tag'      => array( __( 'Best-seller product tag slug', 'verdant-roots' ), 'text', 'best-seller' ),
			'email'         => array( __( 'Contact email', 'verdant-roots' ), 'text', get_option( 'admin_email' ) ),
			'phone'         => array( __( 'Contact phone', 'verdant-roots' ), 'text', '' ),
			'address'       => array( __( 'Business address', 'verdant-roots' ), 'textarea', '' ),
			'hours'         => array( __( 'Support hours', 'verdant-roots' ), 'text', 'Mon–Sat, 10:00 AM – 6:00 PM IST' ),
			'instagram'     => array( __( 'Instagram URL', 'verdant-roots' ), 'url', '' ),
			'facebook'      => array( __( 'Facebook URL', 'verdant-roots' ), 'url', '' ),
			'youtube'       => array( __( 'YouTube URL', 'verdant-roots' ), 'url', '' ),
			'x'             => array( __( 'X (Twitter) URL', 'verdant-roots' ), 'url', '' ),
			'newsletter_sc' => array( __( 'Newsletter form shortcode (optional — e.g. from your email plugin). Leave blank to email sign-ups to the admin.', 'verdant-roots' ), 'text', '' ),
		);

		foreach ( $fields as $key => [ $label, $type, $default ] ) {
			$sanitize = 'url' === $type ? 'esc_url_raw' : ( 'number' === $type ? 'absint' : ( 'textarea' === $type ? 'sanitize_textarea_field' : 'sanitize_text_field' ) );
			$wp_customize->add_setting( 'vr_' . $key, array( 'default' => $default, 'sanitize_callback' => $sanitize ) );
			$wp_customize->add_control( 'vr_' . $key, array( 'label' => $label, 'section' => 'vr_store', 'type' => $type ) );
		}
	}
);
