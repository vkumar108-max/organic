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
	$vr_wide = function_exists( 'is_woocommerce' ) && ( is_cart() || is_checkout() || is_account_page() ) || has_shortcode( get_the_content(), 'vr_wishlist' ) || has_shortcode( get_the_content(), 'vr_categories' ) || has_shortcode( get_the_content(), 'vr_bulk_order' );
	?>
	<div class="container-page pb-12">
		<nav aria-label="Breadcrumb" class="py-3 text-sm"><ol class="flex items-center gap-1 text-ink-soft"><li><a class="hover:underline" href="<?php echo esc_url( home_url( '/' ) ); ?>"><?php esc_html_e( 'Home', 'verdant-roots' ); ?></a></li><li class="flex items-center gap-1"><?php vr_e_icon( 'chevronRight', 14 ); ?><span aria-current="page" class="font-medium text-ink"><?php the_title(); ?></span></li></ol></nav>
		<h1 class="text-3xl font-semibold sm:text-4xl"><?php the_title(); ?></h1>
		<div class="mt-8 <?php echo $vr_wide ? '' : 'prose-content'; ?> entry-content"><?php the_content(); ?></div>
	</div>
	<?php
	// The Categories page would otherwise end right above the footer: carry on with best sellers and the newsletter.
	if ( has_shortcode( get_the_content(), 'vr_categories' ) && function_exists( 'vr_best_sellers' ) ) {
		$vr_best_tag  = get_term_by( 'slug', (string) vr_opt( 'best_tag', 'best-seller' ), 'product_tag' );
		$vr_best_href = $vr_best_tag && $vr_best_tag->count ? get_term_link( $vr_best_tag ) : add_query_arg( 'orderby', 'popularity', wc_get_page_permalink( 'shop' ) );
		get_template_part( 'template-parts/best-selling', null, array( 'products' => vr_best_sellers(), 'href' => $vr_best_href ) );
		get_template_part( 'template-parts/newsletter' );
	}
	?>
<?php endwhile;
get_footer();
