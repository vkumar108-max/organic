<?php
/** Newsletter block. Uses the configured shortcode, else a real admin-post handler that emails the site owner. */
defined( 'ABSPATH' ) || exit;
$vr_sc     = trim( (string) vr_opt( 'newsletter_sc', '' ) );
$vr_status = isset( $_GET['vr_newsletter'] ) ? sanitize_key( wp_unslash( $_GET['vr_newsletter'] ) ) : ''; // phpcs:ignore WordPress.Security.NonceVerification
?>
<section aria-labelledby="newsletter-title" class="section">
	<div class="container-page">
		<div class="rounded-3xl bg-brand-700 px-6 py-12 text-center text-white sm:px-12">
			<h2 id="newsletter-title" class="text-3xl font-semibold text-white"><?php esc_html_e( 'Stay Connected With Us', 'verdant-roots' ); ?></h2>
			<p class="mx-auto mt-2 max-w-md text-brand-100"><?php esc_html_e( 'Get product updates, offers and useful information.', 'verdant-roots' ); ?></p>
			<?php if ( $vr_sc ) : ?>
				<div class="mx-auto mt-6 max-w-lg"><?php echo do_shortcode( $vr_sc ); ?></div>
			<?php else : ?>
				<form method="post" action="<?php echo esc_url( admin_url( 'admin-post.php' ) ); ?>" class="mx-auto mt-6 flex max-w-lg flex-col gap-3 sm:flex-row">
					<input type="hidden" name="action" value="vr_newsletter">
					<?php wp_nonce_field( 'vr_newsletter', 'vr_nl_nonce' ); ?>
					<input type="hidden" name="_wp_http_referer" value="<?php echo esc_attr( home_url( '/' ) ); ?>">
					<input type="text" name="website" value="" tabindex="-1" autocomplete="off" class="sr-only" aria-hidden="true">
					<label for="newsletter-email" class="sr-only"><?php esc_html_e( 'Email address', 'verdant-roots' ); ?></label>
					<input id="newsletter-email" type="email" name="email" required autocomplete="email" placeholder="<?php esc_attr_e( 'Enter your email', 'verdant-roots' ); ?>" class="min-h-12 flex-1 rounded-full border-0 bg-white px-5 text-ink placeholder:text-ink-soft/70">
					<button type="submit" class="vr-btn vr-btn--secondary vr-btn--lg"><?php esc_html_e( 'Subscribe', 'verdant-roots' ); ?></button>
				</form>
				<p role="status" class="mt-3 min-h-6 text-sm <?php echo 'error' === $vr_status ? 'text-red-200' : 'text-brand-100'; ?>">
					<?php echo 'ok' === $vr_status ? esc_html__( 'Thanks for subscribing!', 'verdant-roots' ) : ( 'error' === $vr_status ? esc_html__( 'Please enter a valid email address.', 'verdant-roots' ) : '' ); ?>
				</p>
			<?php endif; ?>
		</div>
	</div>
</section>
