<?php
/**
 * Lightweight wishlist. Guests: cookie. Logged-in customers: user meta (cookie is
 * merged in at login). No third-party plugin required.
 *
 * @package VerdantRoots
 */

defined( 'ABSPATH' ) || exit;

const VR_WISHLIST_COOKIE = 'vr_wishlist';
const VR_WISHLIST_META   = '_vr_wishlist';

function vr_wishlist_cookie_ids(): array {
	$raw = isset( $_COOKIE[ VR_WISHLIST_COOKIE ] ) ? sanitize_text_field( wp_unslash( $_COOKIE[ VR_WISHLIST_COOKIE ] ) ) : '';
	return array_values( array_unique( array_filter( array_map( 'absint', explode( ',', $raw ) ) ) ) );
}

function vr_wishlist_ids(): array {
	if ( is_user_logged_in() ) {
		$ids = get_user_meta( get_current_user_id(), VR_WISHLIST_META, true );
		return is_array( $ids ) ? array_values( array_map( 'absint', $ids ) ) : array();
	}
	return vr_wishlist_cookie_ids();
}

add_action(
	'wp_login',
	static function ( $login, WP_User $user ) {
		$merged = array_values( array_unique( array_merge( (array) get_user_meta( $user->ID, VR_WISHLIST_META, true ), vr_wishlist_cookie_ids() ) ) );
		update_user_meta( $user->ID, VR_WISHLIST_META, array_slice( array_filter( $merged ), 0, 100 ) );
	},
	10,
	2
);

/** AJAX: sync a toggle to the account (guests keep state in the cookie set by JS). */
function vr_ajax_wishlist_toggle(): void {
	check_ajax_referer( 'vr_ajax', 'nonce' );
	$product_id = isset( $_POST['product_id'] ) ? absint( $_POST['product_id'] ) : 0;
	if ( ! $product_id || 'product' !== get_post_type( $product_id ) ) {
		wp_send_json_error( array( 'message' => 'Invalid product' ), 400 );
	}
	$saved = false;
	if ( is_user_logged_in() ) {
		$ids = vr_wishlist_ids();
		if ( in_array( $product_id, $ids, true ) ) {
			$ids = array_values( array_diff( $ids, array( $product_id ) ) );
		} else {
			array_unshift( $ids, $product_id );
			$saved = true;
		}
		update_user_meta( get_current_user_id(), VR_WISHLIST_META, array_slice( $ids, 0, 100 ) );
	} else {
		$saved = ! in_array( $product_id, vr_wishlist_cookie_ids(), true );
	}
	wp_send_json_success( array( 'saved' => $saved, 'ids' => vr_wishlist_ids() ) );
}
add_action( 'wp_ajax_vr_wishlist_toggle', 'vr_ajax_wishlist_toggle' );
add_action( 'wp_ajax_nopriv_vr_wishlist_toggle', 'vr_ajax_wishlist_toggle' );

/** Heart button markup. */
function vr_wishlist_button( int $product_id, string $name, string $variant = 'icon' ): string {
	$saved = in_array( $product_id, vr_wishlist_ids(), true );
	$label = $saved ? sprintf( /* translators: %s product */ __( 'Remove %s from wishlist', 'verdant-roots' ), $name ) : sprintf( __( 'Add %s to wishlist', 'verdant-roots' ), $name );
	if ( 'full' === $variant ) {
		return sprintf(
			'<button type="button" class="vr-wish vr-wish--full inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-line px-5 text-sm font-semibold hover:bg-brand-50" data-product-id="%1$d" data-name="%2$s" aria-pressed="%3$s">%4$s<span data-wish-label>%5$s</span></button>',
			$product_id,
			esc_attr( $name ),
			$saved ? 'true' : 'false',
			vr_icon( 'heart', 18, 'vr-heart' ),
			esc_html( $saved ? __( 'Saved to wishlist', 'verdant-roots' ) : __( 'Add to wishlist', 'verdant-roots' ) )
		);
	}
	return sprintf(
		'<button type="button" class="vr-wish grid h-9 w-9 place-items-center rounded-full bg-white/95 text-ink shadow-sm transition hover:scale-105" data-product-id="%1$d" data-name="%2$s" aria-pressed="%3$s" aria-label="%4$s">%5$s</button>',
		$product_id,
		esc_attr( $name ),
		$saved ? 'true' : 'false',
		esc_attr( $label ),
		vr_icon( 'heart', 18, 'vr-heart' )
	);
}

/** [vr_wishlist] page. */
add_shortcode(
	'vr_wishlist',
	static function () {
		if ( ! class_exists( 'WooCommerce' ) ) {
			return '';
		}
		$ids = vr_wishlist_ids();
		ob_start();
		echo '<div id="vr-wishlist" data-empty="' . esc_attr__( 'Your wishlist is empty', 'verdant-roots' ) . '">';
		if ( $ids ) {
			$query = new WP_Query( array( 'post_type' => 'product', 'post__in' => $ids, 'orderby' => 'post__in', 'posts_per_page' => 50, 'no_found_rows' => true ) );
			echo '<ul class="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 xl:grid-cols-4 products">';
			while ( $query->have_posts() ) {
				$query->the_post();
				echo '<li class="flex flex-col gap-2">';
				wc_get_template_part( 'content', 'product' );
				echo '<button type="button" class="vr-wish-remove inline-flex min-h-9 items-center justify-center rounded-full border border-brand-600 px-3 text-sm font-semibold text-brand-700 hover:bg-brand-50" data-product-id="' . (int) get_the_ID() . '">' . esc_html__( 'Remove', 'verdant-roots' ) . '</button>';
				echo '</li>';
			}
			echo '</ul>';
			wp_reset_postdata();
		}
		$show_empty = $ids ? ' hidden' : '';
		echo '<div class="vr-wishlist-empty mx-auto max-w-md py-14 text-center"' . ( $ids ? ' hidden' : '' ) . '>'; // phpcs:ignore
		echo '<div class="mx-auto mb-5 grid h-16 w-16 place-items-center rounded-full bg-brand-100 text-brand-700">' . vr_icon( 'heart', 30 ) . '</div>'; // phpcs:ignore
		echo '<h2 class="text-2xl font-semibold">' . esc_html__( 'Your wishlist is empty', 'verdant-roots' ) . '</h2>';
		echo '<p class="mt-2 text-ink-soft">' . esc_html__( 'Tap the heart on any product to save it here for later.', 'verdant-roots' ) . '</p>';
		echo '<a class="vr-btn mt-6" href="' . esc_url( wc_get_page_permalink( 'shop' ) ) . '">' . esc_html__( 'Discover products', 'verdant-roots' ) . '</a></div>';
		unset( $show_empty );
		echo '</div>';
		return ob_get_clean();
	}
);
