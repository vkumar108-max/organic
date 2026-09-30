<?php
/**
 * Generic page. WooCommerce pages (cart, checkout, account, tracking) render inside this.
 *
 * @package VerdantRoots
 */

defined( 'ABSPATH' ) || exit;
get_header();
while ( have_posts() ) :
	the_post();
	$vr_wide = function_exists( 'is_woocommerce' ) && ( is_cart() || is_checkout() || is_account_page() ) || has_shortcode( get_the_content(), 'vr_wishlist' ) || has_shortcode( get_the_content(), 'vr_categories' );
	?>
	<div class="container-page pb-12">
		<nav aria-label="Breadcrumb" class="py-3 text-sm"><ol class="flex items-center gap-1 text-ink-soft"><li><a class="hover:underline" href="<?php echo esc_url( home_url( '/' ) ); ?>"><?php esc_html_e( 'Home', 'verdant-roots' ); ?></a></li><li class="flex items-center gap-1"><?php vr_e_icon( 'chevronRight', 14 ); ?><span aria-current="page" class="font-medium text-ink"><?php the_title(); ?></span></li></ol></nav>
		<h1 class="text-3xl font-semibold sm:text-4xl"><?php the_title(); ?></h1>
		<div class="mt-8 <?php echo $vr_wide ? '' : 'prose-content'; ?> entry-content"><?php the_content(); ?></div>
	</div>
<?php endwhile;
get_footer();
