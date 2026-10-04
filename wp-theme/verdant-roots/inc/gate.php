<?php
/**
 * "Account needed": guests get a Create-account / Sign-in pop-up when they try to add to cart or buy, and the server refuses
 * guest orders (add to cart, checkout and order placement) so the rule cannot be bypassed.
 * Switch it on/off in Customize → Account needed to order.
 *
 * @package VerdantRoots
 */

defined( 'ABSPATH' ) || exit;

function vr_gate_defaults(): array {
	return array(
		'on'    => true,
		'title' => 'Create an account to continue',
		'text'  => 'Sign in or create a free account to add items to your cart and place your order.',
	);
}

function vr_gate_opt( string $key ) {
	$d = vr_gate_defaults();
	return get_theme_mod( 'vr_gate_' . $key, $d[ $key ] ?? '' );
}

/** True while visitors must have an account to shop. */
function vr_gate_on(): bool {
	return (bool) vr_gate_opt( 'on' );
}

/** Sign-in / sign-up address that returns the shopper to $back afterwards. */
function vr_gate_url( string $state, string $back = '' ): string {
	$url = add_query_arg( 'vr_auth', 'signup' === $state ? 'signup' : 'signin', wc_get_page_permalink( 'myaccount' ) );
	return $back ? add_query_arg( 'redirect_to', rawurlencode( $back ), $url ) : $url;
}

add_action(
	'customize_register',
	static function ( WP_Customize_Manager $c ) {
		$d = vr_gate_defaults();
		$c->add_section( 'vr_gate', array( 'title' => __( 'Account needed to order', 'verdant-roots' ), 'description' => __( 'When on, visitors who are not signed in see a Create account pop-up on Add to cart / Buy Now, and cannot check out as a guest.', 'verdant-roots' ), 'priority' => 32 ) );
		$c->add_setting( 'vr_gate_on', array( 'default' => $d['on'], 'sanitize_callback' => 'rest_sanitize_boolean' ) );
		$c->add_control( 'vr_gate_on', array( 'label' => __( 'Require an account to add to cart and order', 'verdant-roots' ), 'section' => 'vr_gate', 'type' => 'checkbox' ) );
		$c->add_setting( 'vr_gate_title', array( 'default' => $d['title'], 'sanitize_callback' => 'sanitize_text_field' ) );
		$c->add_control( 'vr_gate_title', array( 'label' => __( 'Pop-up heading', 'verdant-roots' ), 'section' => 'vr_gate', 'type' => 'text' ) );
		$c->add_setting( 'vr_gate_text', array( 'default' => $d['text'], 'sanitize_callback' => 'sanitize_textarea_field' ) );
		$c->add_control( 'vr_gate_text', array( 'label' => __( 'Pop-up text', 'verdant-roots' ), 'section' => 'vr_gate', 'type' => 'textarea' ) );
	}
);

/* ---- Server-side rules (front end only, so WooCommerce → Settings still shows your saved values) ---- */

// No guest checkout, and account creation must be possible on My account.
foreach ( array( 'woocommerce_enable_guest_checkout' => 'no', 'woocommerce_enable_myaccount_registration' => 'yes' ) as $vr_opt_name => $vr_forced ) {
	add_filter(
		'pre_option_' . $vr_opt_name,
		static function ( $pre ) use ( $vr_forced ) {
			return ! is_admin() && vr_gate_on() ? $vr_forced : $pre;
		}
	);
}

// Adding to cart as a guest is refused (covers links, forms and anything that bypasses the pop-up).
add_filter(
	'woocommerce_add_to_cart_validation',
	static function ( $passed ) {
		if ( vr_gate_on() && ! is_user_logged_in() ) {
			wc_add_notice( __( 'Please create an account or sign in to add items to your cart.', 'verdant-roots' ), 'error' );
			return false;
		}
		return $passed;
	},
	1
);

// Guests are sent to the sign-up page instead of the checkout (they come back to the checkout afterwards).
add_action(
	'template_redirect',
	static function () {
		if ( ! vr_gate_on() || is_user_logged_in() || ! function_exists( 'is_checkout' ) || ! is_checkout() ) {
			return;
		}
		if ( is_wc_endpoint_url( 'order-received' ) || is_wc_endpoint_url( 'order-pay' ) ) {
			return;
		}
		wp_safe_redirect( vr_gate_url( 'signup', wc_get_checkout_url() ) );
		exit;
	}
);

// Last line of defence: an order cannot be placed without being signed in.
add_action(
	'woocommerce_checkout_process',
	static function () {
		if ( vr_gate_on() && ! is_user_logged_in() ) {
			wc_add_notice( __( 'Please create an account or sign in to place your order.', 'verdant-roots' ), 'error' );
		}
	}
);

/* ---- The pop-up (printed for guests only; hrefs get the current page added by JS) ---- */
add_action(
	'wp_footer',
	static function () {
		if ( ! vr_gate_on() || is_user_logged_in() || ( function_exists( 'is_account_page' ) && is_account_page() ) ) {
			return;
		}
		?>
		<dialog class="vr-gate" data-gate data-signup="<?php echo esc_url( vr_gate_url( 'signup' ) ); ?>" data-signin="<?php echo esc_url( vr_gate_url( 'signin' ) ); ?>" aria-labelledby="vr-gate-title">
			<button type="button" class="vr-gate-close" data-gate-close aria-label="<?php esc_attr_e( 'Close', 'verdant-roots' ); ?>"><span aria-hidden="true">✕</span></button>
			<span class="vr-gate-ico" aria-hidden="true"><?php vr_e_icon( 'user', 28 ); ?></span>
			<h2 id="vr-gate-title" class="vr-gate-title"><?php echo esc_html( (string) vr_gate_opt( 'title' ) ); ?></h2>
			<p class="vr-gate-text"><?php echo esc_html( (string) vr_gate_opt( 'text' ) ); ?></p>
			<a class="vr-btn vr-btn--full" href="<?php echo esc_url( vr_gate_url( 'signup' ) ); ?>" data-gate-signup><?php esc_html_e( 'Create account', 'verdant-roots' ); ?></a>
			<p class="vr-gate-alt"><?php esc_html_e( 'Already have an account?', 'verdant-roots' ); ?> <a class="vr-auth-link" href="<?php echo esc_url( vr_gate_url( 'signin' ) ); ?>" data-gate-signin><?php esc_html_e( 'Sign in', 'verdant-roots' ); ?></a></p>
		</dialog>
		<?php
	},
	21
);
