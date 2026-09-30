<?php
/** Single product wrapper. */
defined( 'ABSPATH' ) || exit;
get_header( 'shop' );
?>
<div class="container-page pb-10">
	<?php woocommerce_breadcrumb(); ?>
	<?php while ( have_posts() ) : the_post(); wc_get_template_part( 'content', 'single-product' ); endwhile; ?>
</div>
<?php get_footer( 'shop' );
