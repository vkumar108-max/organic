<?php
/**
 * Theme supports, menus, assets.
 *
 * @package VerdantRoots
 */

defined( 'ABSPATH' ) || exit;

add_action(
	'after_setup_theme',
	static function () {
		load_theme_textdomain( 'verdant-roots', VR_DIR . '/languages' );
		add_theme_support( 'title-tag' );
		add_theme_support( 'post-thumbnails' );
		add_theme_support( 'automatic-feed-links' );
		add_theme_support( 'html5', array( 'search-form', 'comment-form', 'comment-list', 'gallery', 'caption', 'style', 'script' ) );
		add_theme_support( 'custom-logo', array( 'height' => 60, 'width' => 240, 'flex-width' => true, 'flex-height' => true ) );
		add_theme_support( 'responsive-embeds' );
		add_theme_support( 'woocommerce' );
		add_theme_support( 'wc-product-gallery-zoom' );
		add_theme_support( 'wc-product-gallery-lightbox' );
		add_theme_support( 'wc-product-gallery-slider' );
		add_image_size( 'vr-card', 480, 480, true );
		register_nav_menus(
			array(
				'primary' => __( 'Primary menu (desktop)', 'verdant-roots' ),
				'footer'  => __( 'Footer: quick links', 'verdant-roots' ),
				'support' => __( 'Footer: customer support', 'verdant-roots' ),
				'policy'  => __( 'Footer: policies', 'verdant-roots' ),
			)
		);
	}
);

add_action(
	'wp_enqueue_scripts',
	static function () {
		// Same fonts as the Next.js storefront. Swap for self-hosted files if GDPR requires.
		wp_enqueue_style(
			'vr-fonts',
			'https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600;9..144,700&family=Inter:wght@400;500;600;700&display=swap',
			array(),
			null
		);
		wp_enqueue_style( 'vr-main', VR_URI . '/assets/css/main.css', array( 'vr-fonts' ), VR_VERSION );
		wp_enqueue_script( 'vr-theme', VR_URI . '/assets/js/theme.js', array(), VR_VERSION, array( 'in_footer' => true, 'strategy' => 'defer' ) );
		wp_localize_script(
			'vr-theme',
			'vrData',
			array(
				'ajaxUrl'  => admin_url( 'admin-ajax.php' ),
				'restUrl'  => esc_url_raw( rest_url( 'wc/store/v1/' ) ),
				'shopUrl'  => function_exists( 'wc_get_page_permalink' ) ? wc_get_page_permalink( 'shop' ) : home_url( '/' ),
				'nonce'    => wp_create_nonce( 'vr_ajax' ),
				'loggedIn' => is_user_logged_in(),
				'wishlist' => function_exists( 'vr_wishlist_ids' ) ? vr_wishlist_ids() : array(),
				'i18n'     => array(
					'added'       => __( 'Added to wishlist', 'verdant-roots' ),
					'removed'     => __( 'Removed from wishlist', 'verdant-roots' ),
					'recent'      => __( 'Recent searches', 'verdant-roots' ),
					'clear'       => __( 'Clear all', 'verdant-roots' ),
					'seeAll'      => __( 'See all results for', 'verdant-roots' ),
					'noMatches'   => __( 'No matches for', 'verdant-roots' ),
					'category'    => __( 'Category', 'verdant-roots' ),
					'loadFailed'  => __( 'We could not load this product. Please try again.', 'verdant-roots' ),
				),
			)
		);
	}
);

/** Preconnect for fonts. */
add_filter(
	'wp_resource_hints',
	static function ( $urls, $relation ) {
		if ( 'preconnect' === $relation ) {
			$urls[] = 'https://fonts.gstatic.com';
		}
		return $urls;
	},
	10,
	2
);

/** Body classes used by the CSS. */
add_filter(
	'body_class',
	static function ( $classes ) {
		$classes[] = 'vr-theme';
		return $classes;
	}
);

/** Excerpts. */
add_filter( 'excerpt_length', static fn() => 24 );
add_filter( 'excerpt_more', static fn() => '…' );

/** Menu fallback used by templates when no menu is assigned. */
function vr_menu_fallback_items( string $location ): array {
	$defaults = array(
		'primary' => array(
			array( __( 'Home', 'verdant-roots' ), home_url( '/' ) ),
			array( __( 'Shop', 'verdant-roots' ), function_exists( 'wc_get_page_permalink' ) ? wc_get_page_permalink( 'shop' ) : home_url( '/' ), 'mega' ),
			array( __( 'Categories', 'verdant-roots' ), vr_page_url( 'categories', home_url( '/' ) ) ),
			array( __( 'Combos', 'verdant-roots' ), vr_term_url( 'combos' ) ),
			array( __( 'About Us', 'verdant-roots' ), vr_page_url( 'about' ) ),
			array( __( 'Blog', 'verdant-roots' ), vr_blog_url() ),
			array( __( 'Contact Us', 'verdant-roots' ), vr_page_url( 'contact' ) ),
		),
		'footer'  => array(
			array( __( 'Home', 'verdant-roots' ), home_url( '/' ) ),
			array( __( 'Shop', 'verdant-roots' ), function_exists( 'wc_get_page_permalink' ) ? wc_get_page_permalink( 'shop' ) : home_url( '/' ) ),
			array( __( 'About Us', 'verdant-roots' ), vr_page_url( 'about' ) ),
			array( __( 'Blog', 'verdant-roots' ), vr_blog_url() ),
			array( __( 'Contact Us', 'verdant-roots' ), vr_page_url( 'contact' ) ),
		),
		'support' => array(
			array( __( 'My Account', 'verdant-roots' ), function_exists( 'wc_get_page_permalink' ) ? wc_get_page_permalink( 'myaccount' ) : home_url( '/' ) ),
			array( __( 'Track Order', 'verdant-roots' ), vr_page_url( 'track-order' ) ),
			array( __( 'FAQ', 'verdant-roots' ), vr_page_url( 'faq' ) ),
			array( __( 'Contact Us', 'verdant-roots' ), vr_page_url( 'contact' ) ),
		),
		'policy'  => array(
			array( __( 'Privacy Policy', 'verdant-roots' ), vr_page_url( 'privacy-policy' ) ),
			array( __( 'Terms & Conditions', 'verdant-roots' ), vr_page_url( 'terms-and-conditions' ) ),
			array( __( 'Refund Policy', 'verdant-roots' ), vr_page_url( 'refund-policy' ) ),
			array( __( 'Shipping Policy', 'verdant-roots' ), vr_page_url( 'shipping-policy' ) ),
			array( __( 'Disclaimer', 'verdant-roots' ), vr_page_url( 'disclaimer' ) ),
		),
	);
	return $defaults[ $location ] ?? array();
}

/** URL of a page by slug; falls back to home. */
function vr_page_url( string $slug, string $fallback = '' ): string {
	$page = get_page_by_path( $slug );
	return $page ? get_permalink( $page ) : ( $fallback ?: home_url( '/' ) );
}

function vr_blog_url(): string {
	$id = (int) get_option( 'page_for_posts' );
	return $id ? get_permalink( $id ) : home_url( '/?post_type=post' );
}

function vr_term_url( string $slug ): string {
	$term = get_term_by( 'slug', $slug, 'product_cat' );
	return ( $term && ! is_wp_error( $term ) ) ? get_term_link( $term ) : home_url( '/' );
}

/** Render menu items for a location as <li><a> (own markup keeps classes minimal). */
function vr_menu_items( string $location ): array {
	$locations = get_nav_menu_locations();
	if ( ! empty( $locations[ $location ] ) ) {
		$items = wp_get_nav_menu_items( $locations[ $location ] );
		if ( $items ) {
			$out = array();
			foreach ( $items as $item ) {
				if ( (int) $item->menu_item_parent > 0 ) {
					continue;
				}
				$out[] = array( $item->title, $item->url, in_array( 'vr-mega', (array) $item->classes, true ) ? 'mega' : '' );
			}
			return $out;
		}
	}
	return vr_menu_fallback_items( $location );
}

/** Newsletter fallback handler: validates, rate-limits per IP and emails the site owner. */
function vr_handle_newsletter(): void {
	$back = wp_get_referer() ?: home_url( '/' );
	if ( ! isset( $_POST['vr_nl_nonce'] ) || ! wp_verify_nonce( sanitize_text_field( wp_unslash( $_POST['vr_nl_nonce'] ) ), 'vr_newsletter' ) || ! empty( $_POST['website'] ) ) {
		wp_safe_redirect( add_query_arg( 'vr_newsletter', 'error', $back ) );
		exit;
	}
	$email = isset( $_POST['email'] ) ? sanitize_email( wp_unslash( $_POST['email'] ) ) : '';
	$key   = 'vr_nl_' . md5( $_SERVER['REMOTE_ADDR'] ?? '' ); // phpcs:ignore WordPress.Security
	if ( ! is_email( $email ) || get_transient( $key ) ) {
		wp_safe_redirect( add_query_arg( 'vr_newsletter', 'error', $back ) );
		exit;
	}
	set_transient( $key, 1, 30 );
	wp_mail( get_option( 'admin_email' ), sprintf( '[%s] Newsletter sign-up', get_bloginfo( 'name' ) ), "New subscriber: {$email}" );
	wp_safe_redirect( add_query_arg( 'vr_newsletter', 'ok', $back ) );
	exit;
}
add_action( 'admin_post_nopriv_vr_newsletter', 'vr_handle_newsletter' );
add_action( 'admin_post_vr_newsletter', 'vr_handle_newsletter' );

/** Native emoji are fine: drop WordPress' emoji script/styles (faster, no twemoji <img> swaps). */
add_action(
	'init',
	static function () {
		remove_action( 'wp_head', 'print_emoji_detection_script', 7 );
		remove_action( 'admin_print_scripts', 'print_emoji_detection_script' );
		remove_action( 'wp_print_styles', 'print_emoji_styles' );
		remove_action( 'admin_print_styles', 'print_emoji_styles' );
		remove_filter( 'the_content_feed', 'wp_staticize_emoji' );
		remove_filter( 'comment_text_rss', 'wp_staticize_emoji' );
		remove_filter( 'wp_mail', 'wp_staticize_emoji_for_email' );
	}
);

/** <model-viewer> is an ES module; only loaded when a showcase product has a .glb model. */
add_filter(
	'script_loader_tag',
	static function ( $tag, $handle, $src ) {
		return 'vr-model-viewer' === $handle ? '<script type="module" src="' . esc_url( $src ) . '"></script>' . "\n" : $tag;
	},
	10,
	3
);
