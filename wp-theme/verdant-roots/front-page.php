<?php
/**
 * Home page: sections in the same order as the Next.js storefront.
 *
 * @package VerdantRoots
 */

defined( 'ABSPATH' ) || exit;
get_header();

$vr_woo   = function_exists( 'vr_get_products' );
$vr_cats  = $vr_woo ? vr_top_categories() : array();
$vr_best  = $vr_woo ? vr_get_products( array( 'tag' => (string) vr_opt( 'best_tag', 'best-seller' ) ) ) : array();
if ( $vr_woo && ! $vr_best ) {
	$vr_best = vr_get_products(); // no tagged products yet: fall back to the most popular.
}
$vr_sections = array(
	array( 'id' => 'sec-1', 'slug' => (string) vr_opt( 'section_1', 'fruit-powder' ), 'tinted' => false ),
	array( 'id' => 'sec-2', 'slug' => (string) vr_opt( 'section_2', 'leaf-powder' ), 'tinted' => true ),
	array( 'id' => 'sec-3', 'slug' => (string) vr_opt( 'section_3', 'vegetable-powder' ), 'tinted' => false ),
);
$vr_reviews = get_comments( array( 'type' => 'review', 'status' => 'approve', 'number' => 3, 'post_type' => 'product', 'meta_key' => 'rating', 'meta_value' => '4', 'meta_compare' => '>=' ) ); // real customer reviews only.
$vr_posts   = new WP_Query( array( 'post_type' => 'post', 'posts_per_page' => 3, 'ignore_sticky_posts' => true, 'no_found_rows' => true ) );
?>

<section aria-labelledby="hero-title" class="vr-hero relative isolate overflow-hidden bg-gradient-to-br from-brand-50 via-white to-sand-50" data-parallax>
	<div class="vr-blob vr-blob--a" aria-hidden="true" data-depth="-14"></div>
	<div class="vr-blob vr-blob--b" aria-hidden="true" data-depth="10"></div>
	<svg class="pointer-events-none absolute inset-0 -z-10 h-full w-full opacity-[.05]" aria-hidden="true"><defs><pattern id="vr-leaves" width="70" height="70" patternUnits="userSpaceOnUse" patternTransform="rotate(20)"><path d="M12 42c0-14 8-22 26-22 0 15-9 24-23 24" fill="#2d7439"/></pattern></defs><rect width="100%" height="100%" fill="url(#vr-leaves)"/></svg>

	<div class="container-page grid items-center gap-10 py-10 md:py-16 lg:grid-cols-[1.05fr_1fr] lg:gap-14 lg:py-24">
		<div class="vr-rise">
			<p class="mb-4 inline-flex items-center gap-2 rounded-full bg-white/80 px-3.5 py-1.5 text-xs font-bold uppercase tracking-[0.14em] text-brand-800 shadow-sm ring-1 ring-brand-200 backdrop-blur"><span class="vr-pulse h-2 w-2 rounded-full bg-brand-500"></span> <?php echo esc_html( get_bloginfo( 'name' ) ); ?></p>
			<h1 id="hero-title" class="text-[2.3rem] font-semibold leading-[1.08] sm:text-5xl lg:text-[3.75rem]">
				<?php
				$vr_title = (string) vr_opt( 'hero_title', 'Natural Goodness, Made Simple' );
				$vr_parts = explode( ',', $vr_title, 2 );
				if ( 2 === count( $vr_parts ) ) {
					echo esc_html( trim( $vr_parts[0] ) ) . ', <span class="relative inline-block text-brand-600">' . esc_html( trim( $vr_parts[1] ) ) . '<svg class="vr-draw absolute -bottom-2 left-0 h-3 w-full text-clay-500/70" viewBox="0 0 200 12" preserveAspectRatio="none" aria-hidden="true"><path d="M2 8c30-8 60-8 95-3s65 4 101-2" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round"/></svg></span>'; // phpcs:ignore WordPress.Security.EscapeOutput -- parts escaped above, markup is static.
				} else {
					echo esc_html( $vr_title );
				}
				?>
			</h1>
			<p class="mt-5 max-w-xl text-lg text-ink-soft"><?php echo esc_html( vr_opt( 'hero_text', 'Discover quality fruit, leaf and vegetable products for everyday living.' ) ); ?></p>
			<div class="mt-8 flex flex-wrap gap-3">
				<a class="vr-btn vr-btn--lg vr-shine" href="<?php echo esc_url( $vr_woo ? wc_get_page_permalink( 'shop' ) : '#' ); ?>"><?php esc_html_e( 'Shop Now', 'verdant-roots' ); ?> <?php vr_e_icon( 'arrowRight', 18 ); ?></a>
				<a class="vr-btn vr-btn--outline vr-btn--lg" href="<?php echo esc_url( vr_page_url( 'categories' ) ); ?>"><?php esc_html_e( 'Explore Categories', 'verdant-roots' ); ?></a>
			</div>
			<ul class="mt-9 grid max-w-md grid-cols-3 gap-3 text-sm">
				<?php foreach ( array( array( 'leaf', __( 'Simple ingredient lists', 'verdant-roots' ) ), array( 'package', __( 'Multiple pack sizes', 'verdant-roots' ) ), array( 'lock', __( 'Secure checkout', 'verdant-roots' ) ) ) as [ $vr_i, $vr_t ] ) : ?>
					<li class="flex flex-col gap-2 rounded-2xl bg-white/70 p-3 ring-1 ring-line backdrop-blur"><span class="grid h-9 w-9 place-items-center rounded-full bg-brand-100 text-brand-700"><?php vr_e_icon( $vr_i, 18 ); ?></span><span class="text-ink-soft"><?php echo esc_html( $vr_t ); ?></span></li>
				<?php endforeach; ?>
			</ul>
		</div>

		<div class="vr-stage relative mx-auto w-full max-w-xl lg:max-w-none">
			<div class="vr-arch-ring" aria-hidden="true" data-depth="-8"></div>
			<?php get_template_part( 'template-parts/hero-slider' ); ?>
		</div>
	</div>
</section>

<?php get_template_part( 'template-parts/trust-strip' ); ?>

<?php if ( $vr_cats ) : ?>
<section aria-labelledby="shop-by-category" class="section">
	<div class="container-page">
		<?php get_template_part( 'template-parts/section-heading', null, array( 'id' => 'shop-by-category', 'eyebrow' => __( 'Browse', 'verdant-roots' ), 'title' => __( 'Shop by Category', 'verdant-roots' ), 'href' => vr_page_url( 'categories' ), 'link_label' => __( 'All categories', 'verdant-roots' ) ) ); ?>
		<ul class="grid gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3"><?php foreach ( $vr_cats as $vr_t ) : ?><li><?php get_template_part( 'template-parts/category-card', null, array( 'term' => $vr_t ) ); ?></li><?php endforeach; ?></ul>
	</div>
</section>
<?php endif; ?>

<?php
get_template_part( 'template-parts/product-section', null, array( 'id' => 'best-sellers', 'title' => __( 'Best Sellers', 'verdant-roots' ), 'description' => __( 'Our most popular products right now.', 'verdant-roots' ), 'products' => $vr_best, 'href' => $vr_woo ? add_query_arg( 'orderby', 'popularity', wc_get_page_permalink( 'shop' ) ) : '#', 'link_label' => __( 'View all', 'verdant-roots' ), 'tinted' => true ) );

foreach ( $vr_sections as $vr_s ) {
	$vr_term = get_term_by( 'slug', $vr_s['slug'], 'product_cat' );
	if ( ! $vr_term || ! $vr_woo ) {
		continue;
	}
	get_template_part( 'template-parts/product-section', null, array( 'id' => $vr_s['id'], 'title' => $vr_term->name, 'description' => wp_strip_all_tags( term_description( $vr_term->term_id, 'product_cat' ) ), 'products' => vr_get_products( array( 'category' => $vr_term->slug ) ), 'href' => get_term_link( $vr_term ), 'link_label' => sprintf( /* translators: %s category */ __( 'View All %s', 'verdant-roots' ), $vr_term->name ), 'tinted' => $vr_s['tinted'] ) );
}

$vr_combo = $vr_woo ? get_term_by( 'slug', (string) vr_opt( 'combo_slug', 'combos' ), 'product_cat' ) : null;
if ( $vr_combo ) {
	get_template_part( 'template-parts/product-section', null, array( 'id' => 'combos', 'eyebrow' => __( 'Value packs', 'verdant-roots' ), 'title' => __( 'Save More With Combos', 'verdant-roots' ), 'description' => __( 'Hand-picked bundles priced lower than buying each item separately.', 'verdant-roots' ), 'products' => vr_get_products( array( 'category' => $vr_combo->slug ) ), 'href' => get_term_link( $vr_combo ), 'link_label' => __( 'View All Combos', 'verdant-roots' ), 'sand' => true ) );
}

$vr_trust = array(
	array( 'leaf', __( 'Quality focused', 'verdant-roots' ), __( 'Every product page lists what is inside, so you can decide with confidence.', 'verdant-roots' ) ),
	array( 'check', __( 'Carefully selected', 'verdant-roots' ), __( 'Ingredients and pack details are shown clearly before you buy.', 'verdant-roots' ) ),
	array( 'package', __( 'Careful packaging', 'verdant-roots' ), __( "Packed to protect your order in transit. (Confirm packaging details.)", 'verdant-roots' ) ),
	array( 'lock', __( 'Secure payments', 'verdant-roots' ), __( "Online payments are handled on the payment provider's secure page.", 'verdant-roots' ) ),
	array( 'truck', __( 'Reliable delivery', 'verdant-roots' ), __( 'Track your order from placement to delivery.', 'verdant-roots' ) ),
	array( 'headset', __( 'Customer support', 'verdant-roots' ), __( 'Questions about an order? Reach us through the contact page.', 'verdant-roots' ) ),
);
$vr_guides = array(
	array( 'package', __( 'Product guides', 'verdant-roots' ), __( 'Learn how to store and handle powders so they stay fresh.', 'verdant-roots' ) ),
	array( 'leaf', __( 'Usage ideas', 'verdant-roots' ), __( 'Simple kitchen ideas for fruit, leaf and vegetable powders.', 'verdant-roots' ) ),
	array( 'tag', __( 'Buying guides', 'verdant-roots' ), __( 'Pick the pack size that suits how you cook.', 'verdant-roots' ) ),
	array( 'eye', __( 'Food education', 'verdant-roots' ), __( 'Understand product labels and dried vegetables.', 'verdant-roots' ) ),
);
?>

<section aria-labelledby="why-us" class="section bg-brand-50/70">
	<div class="container-page">
		<div class="mx-auto mb-7 max-w-2xl text-center"><p class="mb-1 text-xs font-bold uppercase tracking-[0.14em] text-clay-500"><?php esc_html_e( 'Why shop with us', 'verdant-roots' ); ?></p><h2 id="why-us" class="text-2xl font-semibold sm:text-3xl"><?php esc_html_e( 'Made easy from browse to doorstep', 'verdant-roots' ); ?></h2></div>
		<ul class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
			<?php foreach ( $vr_trust as [ $vr_i, $vr_t, $vr_x ] ) : ?>
				<li class="flex gap-4 rounded-card bg-white p-5 shadow-card"><span class="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-brand-100 text-brand-700"><?php vr_e_icon( $vr_i, 24 ); ?></span><div><h3 class="font-sans text-base font-semibold"><?php echo esc_html( $vr_t ); ?></h3><p class="mt-1 text-sm text-ink-soft"><?php echo esc_html( $vr_x ); ?></p></div></li>
			<?php endforeach; ?>
		</ul>
	</div>
</section>

<section aria-labelledby="guides" class="section">
	<div class="container-page">
		<?php get_template_part( 'template-parts/section-heading', null, array( 'id' => 'guides', 'eyebrow' => __( 'Learn', 'verdant-roots' ), 'title' => __( 'Helpful guides for your kitchen', 'verdant-roots' ), 'description' => __( 'Practical, factual information — no medical claims.', 'verdant-roots' ), 'href' => vr_blog_url(), 'link_label' => __( 'All guides', 'verdant-roots' ) ) ); ?>
		<ul class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
			<?php foreach ( $vr_guides as [ $vr_i, $vr_t, $vr_x ] ) : ?>
				<li><a href="<?php echo esc_url( vr_blog_url() ); ?>" class="group flex h-full flex-col gap-3 rounded-card border border-line bg-sand-50 p-5 transition hover:-translate-y-0.5 hover:shadow-card"><span class="grid h-11 w-11 place-items-center rounded-full bg-white text-clay-500"><?php vr_e_icon( $vr_i ); ?></span><h3 class="font-sans text-lg font-semibold group-hover:text-brand-700"><?php echo esc_html( $vr_t ); ?></h3><p class="text-sm text-ink-soft"><?php echo esc_html( $vr_x ); ?></p></a></li>
			<?php endforeach; ?>
		</ul>
	</div>
</section>

<?php if ( $vr_reviews ) : // Only real, approved WooCommerce reviews are ever shown here. ?>
<section aria-labelledby="reviews" class="section bg-sand-50">
	<div class="container-page">
		<div class="mx-auto mb-7 max-w-2xl text-center"><p class="mb-1 text-xs font-bold uppercase tracking-[0.14em] text-clay-500"><?php esc_html_e( 'Customer reviews', 'verdant-roots' ); ?></p><h2 id="reviews" class="text-2xl font-semibold sm:text-3xl"><?php esc_html_e( 'What customers say', 'verdant-roots' ); ?></h2></div>
		<ul class="grid gap-4 md:grid-cols-3">
			<?php foreach ( $vr_reviews as $vr_c ) : $vr_r = (float) get_comment_meta( $vr_c->comment_ID, 'rating', true ); ?>
				<li><figure class="flex h-full flex-col gap-3 rounded-card border border-line bg-white p-5 shadow-card">
					<?php echo vr_rating_html( $vr_r, 0, 16 ); // phpcs:ignore WordPress.Security.EscapeOutput ?>
					<blockquote class="text-ink-soft"><?php echo esc_html( wp_trim_words( $vr_c->comment_content, 40 ) ); ?></blockquote>
					<figcaption class="mt-auto flex flex-wrap items-center gap-x-2 text-sm"><span class="font-semibold"><?php echo esc_html( $vr_c->comment_author ); ?></span><?php if ( function_exists( 'wc_review_is_from_verified_owner' ) && wc_review_is_from_verified_owner( $vr_c->comment_ID ) ) : ?><span class="text-brand-700">✓ <?php esc_html_e( 'Verified purchase', 'verdant-roots' ); ?></span><?php endif; ?></figcaption>
				</figure></li>
			<?php endforeach; ?>
		</ul>
	</div>
</section>
<?php endif; ?>

<?php if ( $vr_posts->have_posts() ) : ?>
<section aria-labelledby="blog" class="section">
	<div class="container-page">
		<?php get_template_part( 'template-parts/section-heading', null, array( 'id' => 'blog', 'eyebrow' => __( 'From the blog', 'verdant-roots' ), 'title' => __( 'Latest articles', 'verdant-roots' ) ) ); ?>
		<ul class="grid gap-5 sm:grid-cols-2 lg:grid-cols-3"><?php while ( $vr_posts->have_posts() ) : $vr_posts->the_post(); ?><li><?php get_template_part( 'template-parts/blog-card' ); ?></li><?php endwhile; wp_reset_postdata(); ?></ul>
		<div class="mt-8 text-center"><a class="vr-btn vr-btn--outline" href="<?php echo esc_url( vr_blog_url() ); ?>"><?php esc_html_e( 'View All Articles', 'verdant-roots' ); ?></a></div>
	</div>
</section>
<?php endif; ?>

<?php get_template_part( 'template-parts/newsletter' ); ?>
<?php get_footer();
