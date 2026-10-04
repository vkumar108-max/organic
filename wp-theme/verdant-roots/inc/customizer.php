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
			'hero_cats'     => array( __( 'Hero 3D slider — categories to show (comma-separated slugs or names, up to 12). Leave BLANK to show all categories.', 'verdant-roots' ), 'text', '' ),
			'trust_items'   => array( __( 'Trust strip (advanced, optional) — one per line: Label | (ignored) | Logo URL. Easier: use Customize → Trust logos strip and upload logos there.', 'verdant-roots' ), 'textarea', '' ),
			'wellness_title' => array( __( 'Herbal & Wellness section — heading', 'verdant-roots' ), 'text', 'Herbal & Wellness' ),
			'wellness_cats'  => array( __( 'Herbal & Wellness section — categories (up to 4, comma-separated slugs, in order)', 'verdant-roots' ), 'text', 'herbal-powder, superfood-powder, seeds, dry-fruits' ),
			'featured_title' => array( __( 'Featured products section — heading', 'verdant-roots' ), 'text', 'Our Featured Products' ),
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

		$wp_customize->add_section( 'vr_brand', array( 'title' => __( 'Header & footer name', 'verdant-roots' ), 'description' => __( 'Replace the shop name text. Leave blank to use the Site Title (Settings → General). A header logo image is set in Site Identity.', 'verdant-roots' ), 'priority' => 29 ) );
		foreach ( array( 'header' => __( 'Header name (also in the mobile menu)', 'verdant-roots' ), 'footer' => __( 'Footer name (also in © line)', 'verdant-roots' ) ) as $where => $label ) {
			$wp_customize->add_setting( 'vr_brand_' . $where, array( 'default' => '', 'sanitize_callback' => 'sanitize_text_field' ) );
			$wp_customize->add_control( 'vr_brand_' . $where, array( 'label' => $label, 'section' => 'vr_brand', 'type' => 'text' ) );
		}
		$wp_customize->add_setting( 'vr_brand_footer_logo', array( 'default' => 0, 'sanitize_callback' => 'absint' ) );
		$wp_customize->add_control( new WP_Customize_Media_Control( $wp_customize, 'vr_brand_footer_logo', array( 'label' => __( 'Footer logo image (optional — replaces the footer name text; use a light/transparent logo on the dark footer)', 'verdant-roots' ), 'section' => 'vr_brand', 'mime_type' => 'image' ) ) );
		$wp_customize->add_setting( 'vr_brand_favicon', array( 'default' => 0, 'sanitize_callback' => 'absint' ) );
		$wp_customize->add_control( new WP_Customize_Media_Control( $wp_customize, 'vr_brand_favicon', array( 'label' => __( 'Favicon / site icon (square PNG, at least 512×512). Used when no WordPress Site Icon is set.', 'verdant-roots' ), 'section' => 'vr_brand', 'mime_type' => 'image' ) ) );

		$wp_customize->add_section( 'vr_trust', array( 'title' => __( 'Trust logos strip', 'verdant-roots' ), 'description' => __( 'Thin always-running strip under the hero. Upload up to 8 logos (only ones you are entitled to show). Add the logo\'s name in its Media "Alt text" for screen readers. Empty = visitors see no strip.', 'verdant-roots' ), 'priority' => 28 ) );
		for ( $i = 1; $i <= 8; $i++ ) {
			$wp_customize->add_setting( 'vr_trust_logo_' . $i, array( 'default' => 0, 'sanitize_callback' => 'absint' ) );
			/* translators: %d slot number */
			$wp_customize->add_control( new WP_Customize_Media_Control( $wp_customize, 'vr_trust_logo_' . $i, array( 'label' => sprintf( __( 'Logo %d', 'verdant-roots' ), $i ), 'section' => 'vr_trust', 'mime_type' => 'image' ) ) );
		}

		foreach ( $fields as $key => [ $label, $type, $default ] ) {
			$sanitize = 'url' === $type ? 'esc_url_raw' : ( 'number' === $type ? 'absint' : ( 'textarea' === $type ? 'sanitize_textarea_field' : 'sanitize_text_field' ) );
			$wp_customize->add_setting( 'vr_' . $key, array( 'default' => $default, 'sanitize_callback' => $sanitize ) );
			$wp_customize->add_control( 'vr_' . $key, array( 'label' => $label, 'section' => 'vr_store', 'type' => $type ) );
		}
	}
);
