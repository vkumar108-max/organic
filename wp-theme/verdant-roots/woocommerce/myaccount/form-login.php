<?php
/**
 * Login & Sign-up card. Same fields, names, nonces and hooks as WooCommerce's own form-login.php (version 9.x),
 * laid out as a split card with a sliding blade. The Sign-in ↔ Create-account switch is enhanced by theme.js;
 * without JS the "Create an account" link reloads the page in sign-up state (?vr_auth=signup).
 *
 * @package VerdantRoots
 */

defined( 'ABSPATH' ) || exit;

$vr_reg      = 'yes' === get_option( 'woocommerce_enable_myaccount_registration' );
$vr_gen_user = 'no' !== get_option( 'woocommerce_registration_generate_username' );
$vr_gen_pass = 'no' !== get_option( 'woocommerce_registration_generate_password' );
$vr_up       = $vr_reg && ( isset( $_POST['register'] ) || ( isset( $_GET['vr_auth'] ) && 'signup' === $_GET['vr_auth'] ) ); // phpcs:ignore WordPress.Security.NonceVerification
$vr_state    = $vr_up ? 'signup' : 'signin';
$vr_brand    = vr_brand_name( 'header' );
$vr_val      = static fn( string $k ): string => ( ! empty( $_POST[ $k ] ) && is_string( $_POST[ $k ] ) ) ? esc_attr( wp_unslash( $_POST[ $k ] ) ) : ''; // phpcs:ignore WordPress.Security.NonceVerification
$vr_url      = wc_get_page_permalink( 'myaccount' );
$vr_field    = static function ( string $id, string $name, string $type, string $label, string $icon, array $o = array() ): void {
	$auto = $o['autocomplete'] ?? 'off';
	$val  = $o['value'] ?? '';
	?>
	<div class="vr-auth-field" data-field="<?php echo esc_attr( $name ); ?>">
		<input class="vr-auth-input" type="<?php echo esc_attr( $type ); ?>" name="<?php echo esc_attr( $name ); ?>" id="<?php echo esc_attr( $id ); ?>" placeholder=" " autocomplete="<?php echo esc_attr( $auto ); ?>" value="<?php echo $val; // phpcs:ignore WordPress.Security.EscapeOutput -- escaped by the caller. ?>" required aria-required="true"<?php echo ! empty( $o['minlength'] ) ? ' minlength="' . (int) $o['minlength'] . '"' : ''; ?>>
		<label class="vr-auth-label" for="<?php echo esc_attr( $id ); ?>"><?php echo esc_html( $label ); ?></label>
		<?php if ( 'eye' === $icon ) : ?>
			<button type="button" class="vr-auth-eye" data-auth-eye aria-pressed="false" aria-label="<?php esc_attr_e( 'Show password', 'verdant-roots' ); ?>"><?php vr_e_icon( 'eye', 20, 'vr-auth-eye-on' ); vr_e_icon( 'eyeOff', 20, 'vr-auth-eye-off' ); ?></button>
		<?php else : ?>
			<span class="vr-auth-ico" aria-hidden="true"><?php vr_e_icon( $icon, 20 ); ?></span>
		<?php endif; ?>
		<p class="vr-auth-err" id="<?php echo esc_attr( $id ); ?>_err" role="alert" hidden></p>
	</div>
	<?php
};

do_action( 'woocommerce_before_customer_login_form' ); // notices (login / registration errors).
?>
<div class="vr-auth" id="customer_login" data-auth data-state="<?php echo esc_attr( $vr_state ); ?>" data-reg="<?php echo $vr_reg ? '1' : '0'; ?>">
	<div class="vr-auth-panes">

		<section class="vr-auth-pane vr-auth-pane--signin" aria-labelledby="vr-auth-h-in" data-pane="signin"<?php echo $vr_up ? ' inert aria-hidden="true"' : ''; ?>>
			<h2 class="vr-auth-h" id="vr-auth-h-in"><?php esc_html_e( 'Sign in', 'verdant-roots' ); ?></h2>
			<span class="vr-auth-rule" aria-hidden="true"></span>
			<form class="vr-auth-form woocommerce-form woocommerce-form-login login" method="post" novalidate data-auth-form="signin">
				<?php do_action( 'woocommerce_login_form_start' ); ?>
				<?php $vr_field( 'username', 'username', 'text', __( 'Username or email', 'verdant-roots' ), 'user', array( 'autocomplete' => 'username', 'value' => $vr_val( 'username' ) ) ); ?>
				<?php $vr_field( 'password', 'password', 'password', __( 'Password', 'verdant-roots' ), 'eye', array( 'autocomplete' => 'current-password' ) ); ?>
				<?php do_action( 'woocommerce_login_form' ); ?>
				<div class="vr-auth-row">
					<label class="vr-auth-check"><input name="rememberme" type="checkbox" id="rememberme" value="forever" checked><span class="vr-auth-box" aria-hidden="true"><?php vr_e_icon( 'check', 14 ); ?></span> <?php esc_html_e( 'Keep me signed in', 'verdant-roots' ); ?></label>
					<a class="vr-auth-link" href="<?php echo esc_url( wp_lostpassword_url() ); ?>"><?php esc_html_e( 'Forgot password?', 'verdant-roots' ); ?></a>
				</div>
				<?php wp_nonce_field( 'woocommerce-login', 'woocommerce-login-nonce' ); ?>
				<button type="submit" class="vr-auth-btn woocommerce-button woocommerce-form-login__submit" name="login" value="<?php esc_attr_e( 'Log in', 'woocommerce' ); ?>"><span><?php esc_html_e( 'Sign in', 'verdant-roots' ); ?></span></button>
				<?php do_action( 'woocommerce_login_form_end' ); ?>
			</form>
			<?php if ( $vr_reg ) : ?>
				<p class="vr-auth-switch"><?php echo esc_html( sprintf( /* translators: %s shop name */ __( 'New to %s?', 'verdant-roots' ), $vr_brand ) ); ?> <a class="vr-auth-link vr-auth-link--strong" href="<?php echo esc_url( add_query_arg( 'vr_auth', 'signup', $vr_url ) ); ?>" data-auth-go="signup"><?php esc_html_e( 'Create an account', 'verdant-roots' ); ?></a></p>
			<?php endif; ?>
		</section>

		<?php if ( $vr_reg ) : ?>
		<section class="vr-auth-pane vr-auth-pane--signup" aria-labelledby="vr-auth-h-up" data-pane="signup"<?php echo ! $vr_up ? ' inert aria-hidden="true"' : ''; ?>>
			<h2 class="vr-auth-h" id="vr-auth-h-up"><?php esc_html_e( 'Create account', 'verdant-roots' ); ?></h2>
			<span class="vr-auth-rule" aria-hidden="true"></span>
			<form method="post" class="vr-auth-form woocommerce-form woocommerce-form-register register" novalidate data-auth-form="signup" <?php do_action( 'woocommerce_register_form_tag' ); ?>>
				<?php do_action( 'woocommerce_register_form_start' ); ?>
				<?php $vr_field( 'vr_reg_name', 'vr_full_name', 'text', __( 'Full name', 'verdant-roots' ), 'user', array( 'autocomplete' => 'name', 'value' => $vr_val( 'vr_full_name' ) ) ); ?>
				<?php if ( ! $vr_gen_user ) : ?><?php $vr_field( 'reg_username', 'username', 'text', __( 'Username', 'verdant-roots' ), 'user', array( 'autocomplete' => 'username', 'value' => $vr_up ? $vr_val( 'username' ) : '' ) ); ?><?php endif; ?>
				<?php $vr_field( 'reg_email', 'email', 'email', __( 'Email address', 'verdant-roots' ), 'mail', array( 'autocomplete' => 'email', 'value' => $vr_val( 'email' ) ) ); ?>
				<?php if ( ! $vr_gen_pass ) : ?>
					<?php $vr_field( 'reg_password', 'password', 'password', __( 'Password', 'verdant-roots' ), 'eye', array( 'autocomplete' => 'new-password', 'minlength' => 8 ) ); ?>
					<div class="vr-auth-meter" data-meter aria-live="polite"><span class="vr-auth-seg"></span><span class="vr-auth-seg"></span><span class="vr-auth-seg"></span><span class="vr-auth-seg"></span><span class="vr-auth-hint" data-meter-hint><?php esc_html_e( 'Use 8 characters or more.', 'verdant-roots' ); ?></span></div>
				<?php else : ?>
					<p class="vr-auth-note"><?php esc_html_e( 'A link to set a new password will be sent to your email address.', 'woocommerce' ); ?></p>
				<?php endif; ?>
				<?php do_action( 'woocommerce_register_form' ); // privacy policy text, spam-protection plugins… ?>
				<?php wp_nonce_field( 'woocommerce-register', 'woocommerce-register-nonce' ); ?>
				<button type="submit" class="vr-auth-btn woocommerce-Button woocommerce-button woocommerce-form-register__submit" name="register" value="<?php esc_attr_e( 'Register', 'woocommerce' ); ?>"><span><?php esc_html_e( 'Create account', 'verdant-roots' ); ?></span></button>
				<?php do_action( 'woocommerce_register_form_end' ); ?>
			</form>
			<p class="vr-auth-switch"><?php esc_html_e( 'Already have an account?', 'verdant-roots' ); ?> <a class="vr-auth-link vr-auth-link--strong" href="<?php echo esc_url( $vr_url ); ?>" data-auth-go="signin"><?php esc_html_e( 'Sign in', 'verdant-roots' ); ?></a></p>
		</section>
		<?php endif; ?>
	</div>

	<div class="vr-auth-bladewrap" aria-hidden="true">
		<div class="vr-auth-blade">
			<div class="vr-auth-copy vr-auth-copy--in">
				<span class="vr-auth-brand"><?php echo esc_html( $vr_brand ); ?></span>
				<p class="vr-auth-title"><?php echo vr_auth_title_html( vr_auth_opt( 'title_in' ) ); // phpcs:ignore WordPress.Security.EscapeOutput -- escaped inside. ?></p>
				<p class="vr-auth-text"><?php echo esc_html( vr_auth_opt( 'text_in' ) ); ?></p>
			</div>
			<?php if ( $vr_reg ) : ?>
			<div class="vr-auth-copy vr-auth-copy--up">
				<span class="vr-auth-brand"><?php echo esc_html( $vr_brand ); ?></span>
				<p class="vr-auth-title"><?php echo vr_auth_title_html( vr_auth_opt( 'title_up' ) ); // phpcs:ignore WordPress.Security.EscapeOutput ?></p>
				<p class="vr-auth-text"><?php echo esc_html( vr_auth_opt( 'text_up' ) ); ?></p>
			</div>
			<?php endif; ?>
		</div>
	</div>
</div>
<?php do_action( 'woocommerce_after_customer_login_form' ); ?>
