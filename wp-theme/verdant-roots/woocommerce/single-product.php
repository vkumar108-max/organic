<?php
/** Single product wrapper. */
defined( 'ABSPATH' ) || exit;
get_header( 'shop' );
?>
<div class="container-page pb-10">
	<?php woocommerce_breadcrumb(); ?>
	<?php while ( have_posts() ) : the_post(); wc_get_template_part( 'content', 'single-product' ); endwhile; ?>
</div>
<?php
// Keep visitors browsing after the last product section instead of ending at the footer.
$vr_best_tag  = get_term_by( 'slug', (string) vr_opt( 'best_tag', 'best-seller' ), 'product_tag' );
$vr_best_href = $vr_best_tag && $vr_best_tag->count ? get_term_link( $vr_best_tag ) : add_query_arg( 'orderby', 'popularity', wc_get_page_permalink( 'shop' ) );
get_template_part( 'template-parts/best-selling', null, array( 'products' => vr_best_sellers(), 'href' => $vr_best_href ) );
get_template_part( 'template-parts/newsletter' );
get_footer( 'shop' );
