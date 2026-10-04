<?php
/** Fixed bottom navigation (mobile only). */
defined( 'ABSPATH' ) || exit;
$vr_woo = function_exists( 'wc_get_page_permalink' );
$vr_tab = 'relative flex flex-1 flex-col items-center gap-0.5 py-2 text-[0.7rem] font-medium text-ink-soft';
$vr_cur = static function ( bool $on ): string { return $on ? ' text-brand-700' : ''; };
$vr_is_cart    = $vr_woo && is_cart();
$vr_is_account = $vr_woo && is_account_page();
?>
<nav aria-label="<?php esc_attr_e( 'Quick navigation', 'verdant-roots' ); ?>" class="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden">
	<ul class="mx-auto flex max-w-lg items-stretch">
		<li class="flex flex-1"><a href="<?php echo esc_url( home_url( '/' ) ); ?>" class="<?php echo esc_attr( $vr_tab . $vr_cur( is_front_page() ) ); ?>" <?php echo is_front_page() ? 'aria-current="page"' : ''; ?>><?php vr_e_icon( 'home', 22 ); esc_html_e( 'Home', 'verdant-roots' ); ?></a></li>
		<li class="flex flex-1"><a href="<?php echo esc_url( vr_page_url( 'categories', $vr_woo ? wc_get_page_permalink( 'shop' ) : home_url( '/' ) ) ); ?>" class="<?php echo esc_attr( $vr_tab . $vr_cur( is_page( 'categories' ) ) ); ?>"><?php vr_e_icon( 'grid', 22 ); esc_html_e( 'Categories', 'verdant-roots' ); ?></a></li>
		<li class="flex flex-1"><button type="button" data-open="vr-search" class="<?php echo esc_attr( $vr_tab ); ?>"><?php vr_e_icon( 'search', 22 ); esc_html_e( 'Search', 'verdant-roots' ); ?></button></li>
		<li class="flex flex-1"><a href="<?php echo esc_url( $vr_woo ? wc_get_cart_url() : '#' ); ?>" class="<?php echo esc_attr( $vr_tab . $vr_cur( $vr_is_cart ) ); ?>"><span class="relative"><?php vr_e_icon( 'cart', 22 ); echo $vr_woo ? vr_cart_count_html() : ''; // phpcs:ignore WordPress.Security.EscapeOutput ?></span><?php esc_html_e( 'Cart', 'verdant-roots' ); ?></a></li>
		<li class="flex flex-1"><a href="<?php echo esc_url( $vr_woo ? wc_get_page_permalink( 'myaccount' ) : wp_login_url() ); ?>" class="<?php echo esc_attr( $vr_tab . $vr_cur( $vr_is_account ) ); ?>"><?php vr_e_icon( 'user', 22 ); esc_html_e( 'Account', 'verdant-roots' ); ?></a></li>
	</ul>
</nav>
