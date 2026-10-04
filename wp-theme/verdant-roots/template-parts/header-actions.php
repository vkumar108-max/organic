<?php
/** Account / wishlist / cart (desktop); search / cart / account (mobile). */
defined( 'ABSPATH' ) || exit;
$vr_woo       = function_exists( 'wc_get_page_permalink' );
$vr_account   = $vr_woo ? wc_get_page_permalink( 'myaccount' ) : wp_login_url();
$vr_cart      = $vr_woo ? wc_get_cart_url() : home_url( '/' );
$vr_user      = is_user_logged_in() ? wp_get_current_user() : null;
$vr_acc_label = $vr_user ? ( $vr_user->first_name ?: $vr_user->display_name ) : __( 'Account', 'verdant-roots' );
$vr_link      = 'relative flex items-center gap-2 rounded-full p-2 hover:bg-brand-50';
?>
<div class="flex items-center gap-0.5 sm:gap-1">
	<button type="button" data-open="vr-search" class="rounded-full p-2 hover:bg-brand-50 md:hidden" aria-haspopup="dialog" aria-label="<?php esc_attr_e( 'Open search', 'verdant-roots' ); ?>"><?php vr_e_icon( 'search', 24 ); ?></button>
	<a href="<?php echo esc_url( $vr_account ); ?>" class="<?php echo esc_attr( $vr_link ); ?> hidden md:flex" aria-label="<?php echo esc_attr( $vr_acc_label ); ?>"><?php vr_e_icon( 'user', 24 ); ?><span class="hidden text-sm font-medium xl:inline"><?php echo esc_html( $vr_acc_label ); ?></span></a>
	<a href="<?php echo esc_url( vr_page_url( 'wishlist' ) ); ?>" class="<?php echo esc_attr( $vr_link ); ?> hidden md:flex" aria-label="<?php esc_attr_e( 'Wishlist', 'verdant-roots' ); ?>"><span class="relative"><?php vr_e_icon( 'heart', 24 ); ?><span class="vr-wish-count" data-wish-count></span></span><span class="hidden text-sm font-medium xl:inline"><?php esc_html_e( 'Wishlist', 'verdant-roots' ); ?></span></a>
	<a href="<?php echo esc_url( $vr_cart ); ?>" class="<?php echo esc_attr( $vr_link ); ?>" aria-label="<?php esc_attr_e( 'Cart', 'verdant-roots' ); ?>"><span class="relative"><?php vr_e_icon( 'cart', 24 ); ?><?php echo $vr_woo ? vr_cart_count_html() : ''; // phpcs:ignore WordPress.Security.EscapeOutput ?></span><span class="hidden text-sm font-medium xl:inline"><?php esc_html_e( 'Cart', 'verdant-roots' ); ?></span></a>
	<a href="<?php echo esc_url( $vr_account ); ?>" class="<?php echo esc_attr( $vr_link ); ?> md:hidden" aria-label="<?php esc_attr_e( 'Account', 'verdant-roots' ); ?>"><?php vr_e_icon( 'user', 24 ); ?></a>
</div>
