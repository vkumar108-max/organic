<?php
/**
 * Basics: meta description, social preview tags, favicon fallback and a simple cookie notice.
 * Meta tags are skipped when an SEO plugin (Yoast, Rank Math, AIOSEO, SEOPress) is active, so nothing is output twice.
 *
 * @package VerdantRoots
 */

defined( 'ABSPATH' ) || exit;

function vr_seo_defaults(): array {
	return array(
		'desc'        => 'Quality fruit, leaf and vegetable powders, dry vegetables and herbal wellness products for everyday living.',
		'cookie_on'   => true,
		'cookie_text' => 'We use essential cookies to keep your cart and sign-in working.',
	);
}

function vr_seo_opt( string $key ) {
	$d = vr_seo_defaults();
	return get_theme_mod( 'vr_seo_' . $key, $d[ $key ] ?? '' );
}

function vr_seo_plugin_active(): bool {
	return defined( 'WPSEO_VERSION' ) || class_exists( 'RankMath' ) || defined( 'AIOSEO_VERSION' ) || defined( 'SEOPRESS_VERSION' );
}

add_action(
	'customize_register',
	static function ( WP_Customize_Manager $c ) {
		$c->add_section( 'vr_seo', array( 'title' => __( 'SEO & cookie notice', 'verdant-roots' ), 'priority' => 31 ) );
		$c->add_setting( 'vr_seo_desc', array( 'default' => vr_seo_defaults()['desc'], 'sanitize_callback' => 'sanitize_textarea_field' ) );
		$c->add_control( 'vr_seo_desc', array( 'label' => __( 'Home page description (shown in Google results, about 150 characters)', 'verdant-roots' ), 'section' => 'vr_seo', 'type' => 'textarea' ) );
		$c->add_setting( 'vr_seo_image', array( 'default' => 0, 'sanitize_callback' => 'absint' ) );
		$c->add_control( new WP_Customize_Media_Control( $c, 'vr_seo_image', array( 'label' => __( 'Social preview image (1200×630 recommended, used when WhatsApp/Facebook show a link)', 'verdant-roots' ), 'section' => 'vr_seo', 'mime_type' => 'image' ) ) );
		$c->add_setting( 'vr_seo_cookie_on', array( 'default' => true, 'sanitize_callback' => 'rest_sanitize_boolean' ) );
		$c->add_control( 'vr_seo_cookie_on', array( 'label' => __( 'Show the cookie notice', 'verdant-roots' ), 'section' => 'vr_seo', 'type' => 'checkbox' ) );
		$c->add_setting( 'vr_seo_cookie_text', array( 'default' => vr_seo_defaults()['cookie_text'], 'sanitize_callback' => 'sanitize_text_field' ) );
		$c->add_control( 'vr_seo_cookie_text', array( 'label' => __( 'Cookie notice text', 'verdant-roots' ), 'section' => 'vr_seo', 'type' => 'text' ) );
	}
);

function vr_seo_description(): string {
	$text = '';
	if ( is_front_page() ) {
		$text = (string) vr_seo_opt( 'desc' );
	} elseif ( is_singular() ) {
		$post = get_queried_object();
		$text = $post instanceof WP_Post ? ( $post->post_excerpt ?: $post->post_content ) : '';
	} elseif ( is_category() || is_tag() || is_tax() ) {
		$text = term_description();
	}
	$text = trim( preg_replace( '/\s+/', ' ', wp_strip_all_tags( strip_shortcodes( (string) $text ) ) ) );
	return '' !== $text ? wp_trim_words( $text, 28, '…' ) : (string) vr_seo_opt( 'desc' );
}

function vr_seo_image_url(): string {
	$id = 0;
	if ( is_singular() && has_post_thumbnail() ) {
		$id = get_post_thumbnail_id();
	} elseif ( is_tax( 'product_cat' ) ) {
		$id = (int) get_term_meta( get_queried_object_id(), 'thumbnail_id', true );
	}
	$id = $id ?: (int) vr_seo_opt( 'image' ) ?: (int) get_theme_mod( 'custom_logo' );
	$url = $id ? wp_get_attachment_image_url( $id, 'large' ) : '';
	return $url ?: '';
}

add_action(
	'wp_head',
	static function () {
		if ( vr_seo_plugin_active() || is_admin() ) {
			return;
		}
		$title = wp_get_document_title();
		$desc  = vr_seo_description();
		$img   = vr_seo_image_url();
		$url   = is_singular() ? get_permalink() : ( is_front_page() ? home_url( '/' ) : '' );
		echo "\n";
		if ( $desc ) {
			echo '<meta name="description" content="' . esc_attr( $desc ) . '">' . "\n";
		}
		echo '<meta property="og:site_name" content="' . esc_attr( get_bloginfo( 'name' ) ) . '">' . "\n";
		echo '<meta property="og:type" content="' . esc_attr( function_exists( 'is_product' ) && is_product() ? 'product' : ( is_singular( 'post' ) ? 'article' : 'website' ) ) . '">' . "\n";
		echo '<meta property="og:title" content="' . esc_attr( $title ) . '">' . "\n";
		if ( $desc ) {
			echo '<meta property="og:description" content="' . esc_attr( $desc ) . '">' . "\n";
		}
		if ( $url ) {
			echo '<meta property="og:url" content="' . esc_url( $url ) . '">' . "\n";
		}
		if ( $img ) {
			echo '<meta property="og:image" content="' . esc_url( $img ) . '">' . "\n";
		}
		echo '<meta name="twitter:card" content="' . ( $img ? 'summary_large_image' : 'summary' ) . '">' . "\n";
	},
	5
);

/** A simple leaf favicon until a Site Icon is set in Customize → Site Identity. */
add_action(
	'wp_head',
	static function () {
		if ( has_site_icon() ) {
			return;
		}
		$icon = (int) get_theme_mod( 'vr_brand_favicon', 0 );
		$url  = $icon ? wp_get_attachment_image_url( $icon, 'full' ) : '';
		if ( $url ) {
			$small = wp_get_attachment_image_url( $icon, array( 192, 192 ) ) ?: $url;
			echo '<link rel="icon" href="' . esc_url( $small ) . '" sizes="192x192">' . "\n";
			echo '<link rel="apple-touch-icon" href="' . esc_url( $small ) . '">' . "\n";
			return;
		}
		$svg = "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'><rect width='64' height='64' rx='14' fill='#1f5c33'/><path d='M46 16C26 16 16 28 16 40c0 4 2 8 6 8 14 0 24-10 24-32Z' fill='#e8b350'/></svg>";
		echo '<link rel="icon" href="data:image/svg+xml,' . rawurlencode( $svg ) . '">' . "\n"; // phpcs:ignore WordPress.Security.EscapeOutput
	},
	6
);

/** Cookie notice: informs only, it does not block anything. Hidden until JS confirms it was not dismissed before. */
add_action(
	'wp_footer',
	static function () {
		if ( ! vr_seo_opt( 'cookie_on' ) ) {
			return;
		}
		$policy = function_exists( 'get_privacy_policy_url' ) && get_privacy_policy_url() ? get_privacy_policy_url() : vr_page_url( 'privacy-policy', '' );
		?>
		<div class="vr-cookie" data-cookie hidden role="region" aria-label="<?php esc_attr_e( 'Cookie notice', 'verdant-roots' ); ?>">
			<p><?php echo esc_html( (string) vr_seo_opt( 'cookie_text' ) ); ?>
				<?php if ( $policy && $policy !== home_url( '/' ) ) : ?><a href="<?php echo esc_url( $policy ); ?>"><?php esc_html_e( 'Privacy Policy', 'verdant-roots' ); ?></a><?php endif; ?></p>
			<button type="button" class="vr-btn vr-btn--sm" data-cookie-ok><?php esc_html_e( 'OK', 'verdant-roots' ); ?></button>
		</div>
		<?php
	},
	20
);
