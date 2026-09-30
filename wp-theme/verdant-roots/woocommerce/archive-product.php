<?php
/**
 * Shop, category, tag and search results.
 *
 * @package VerdantRoots
 */

defined( 'ABSPATH' ) || exit;

get_header( 'shop' );

$vr_term     = is_product_taxonomy() ? get_queried_object() : null;
$vr_is_cat   = $vr_term instanceof WP_Term && 'product_cat' === $vr_term->taxonomy;
$vr_search   = is_search();
$vr_title    = $vr_search ? sprintf( /* translators: %s query */ __( 'Results for “%s”', 'verdant-roots' ), get_search_query() ) : ( $vr_term ? $vr_term->name : woocommerce_page_title( false ) );
$vr_total    = (int) wc_get_loop_prop( 'total', 0 );
$vr_faqs     = $vr_is_cat ? vr_parse_pairs( (string) get_term_meta( $vr_term->term_id, 'vr_faqs', true ) ) : array();
$vr_orderby  = isset( $_GET['orderby'] ) ? wc_clean( wp_unslash( $_GET['orderby'] ) ) : apply_filters( 'woocommerce_default_catalog_orderby', 'popularity' ); // phpcs:ignore WordPress.Security.NonceVerification
$vr_options  = apply_filters( 'woocommerce_catalog_orderby', array() );
?>
<div class="container-page pb-10">
	<?php woocommerce_breadcrumb(); ?>

	<?php if ( $vr_is_cat ) : ?>
		<header class="mb-8 grid items-center gap-6 overflow-hidden rounded-3xl bg-gradient-to-r from-brand-50 to-sand-50 md:grid-cols-[1.4fr_1fr]">
			<div class="p-6 sm:p-10">
				<h1 class="text-3xl font-semibold sm:text-4xl"><?php echo esc_html( $vr_title ); ?></h1>
				<?php if ( term_description() ) : ?><div class="mt-3 max-w-xl text-ink-soft"><?php echo wp_kses_post( term_description() ); ?></div><?php endif; ?>
			</div>
			<div class="hidden h-full min-h-48 md:block" aria-hidden="true">
				<?php $vr_thumb = (int) get_term_meta( $vr_term->term_id, 'thumbnail_id', true );
				echo $vr_thumb ? wp_get_attachment_image( $vr_thumb, 'large', false, array( 'class' => 'h-full w-full object-cover', 'alt' => '' ) ) : vr_art( vr_tone_for_slug( $vr_term->slug ), '' ); // phpcs:ignore WordPress.Security.EscapeOutput ?>
			</div>
		</header>
	<?php else : ?>
		<h1 class="mb-6 text-3xl font-semibold sm:text-4xl"><?php echo esc_html( $vr_title ); ?></h1>
	<?php endif; ?>

	<?php do_action( 'woocommerce_before_shop_loop' ); ?>

	<div class="grid gap-6 lg:grid-cols-[17rem_1fr] lg:gap-10">
		<div>
			<div class="lg:hidden"><button type="button" data-open="vr-filters" class="vr-btn vr-btn--outline vr-btn--sm" aria-haspopup="dialog"><?php vr_e_icon( 'filter', 16 ); esc_html_e( 'Filters', 'verdant-roots' ); ?></button></div>
			<aside aria-label="<?php esc_attr_e( 'Product filters', 'verdant-roots' ); ?>" class="hidden lg:sticky lg:top-40 lg:block lg:self-start">
				<?php get_template_part( 'template-parts/filter-sidebar', null, array( 'show_categories' => ! $vr_is_cat ) ); ?>
			</aside>
		</div>

		<div>
			<div class="mb-5 flex flex-wrap items-center justify-between gap-3">
				<p class="text-sm text-ink-soft" role="status"><span class="font-semibold text-ink"><?php echo (int) $vr_total; ?></span> <?php echo esc_html( _n( 'product', 'products', $vr_total, 'verdant-roots' ) ); ?></p>
				<form method="get" class="flex items-center gap-2 text-sm" data-sort-form>
					<?php foreach ( $_GET as $vr_k => $vr_v ) { if ( 'orderby' === $vr_k || 'paged' === $vr_k || is_array( $vr_v ) ) { continue; } echo '<input type="hidden" name="' . esc_attr( $vr_k ) . '" value="' . esc_attr( wp_unslash( $vr_v ) ) . '">'; } // phpcs:ignore WordPress.Security ?>
					<label for="orderby" class="whitespace-nowrap text-ink-soft"><?php esc_html_e( 'Sort by', 'verdant-roots' ); ?></label>
					<select id="orderby" name="orderby" class="min-h-10 rounded-full border border-line bg-white px-4 font-medium" data-autosubmit>
						<?php foreach ( $vr_options as $vr_id => $vr_label ) : ?><option value="<?php echo esc_attr( $vr_id ); ?>" <?php selected( $vr_orderby, $vr_id ); ?>><?php echo esc_html( $vr_label ); ?></option><?php endforeach; ?>
					</select>
					<noscript><button class="vr-btn vr-btn--sm" type="submit"><?php esc_html_e( 'Apply', 'verdant-roots' ); ?></button></noscript>
				</form>
			</div>

			<?php if ( woocommerce_product_loop() ) : ?>
				<ul class="products grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3">
					<?php while ( have_posts() ) : the_post(); ?>
						<li><?php wc_get_template_part( 'content', 'product' ); ?></li>
					<?php endwhile; ?>
				</ul>
				<?php woocommerce_pagination(); ?>
			<?php else : ?>
				<div class="mx-auto flex max-w-md flex-col items-center px-4 py-14 text-center">
					<div class="mb-5 grid h-16 w-16 place-items-center rounded-full bg-brand-100 text-brand-700"><?php vr_e_icon( 'search', 30 ); ?></div>
					<h2 class="text-2xl font-semibold"><?php echo $vr_search ? esc_html( sprintf( /* translators: %s query */ __( 'No results for “%s”', 'verdant-roots' ), get_search_query() ) ) : esc_html__( 'No products match these filters', 'verdant-roots' ); ?></h2>
					<p class="mt-2 text-ink-soft"><?php esc_html_e( 'Check the spelling, try a more general word, remove a filter, or browse our categories.', 'verdant-roots' ); ?></p>
					<div class="mt-6 flex flex-wrap justify-center gap-3"><a class="vr-btn" href="<?php echo esc_url( wc_get_page_permalink( 'shop' ) ); ?>"><?php esc_html_e( 'Shop all', 'verdant-roots' ); ?></a><a class="vr-btn vr-btn--outline" href="<?php echo esc_url( vr_page_url( 'categories' ) ); ?>"><?php esc_html_e( 'Browse categories', 'verdant-roots' ); ?></a></div>
				</div>
			<?php endif; ?>
		</div>
	</div>

	<?php if ( $vr_faqs ) : ?>
		<section aria-labelledby="category-faq" class="mt-16 max-w-3xl">
			<h2 id="category-faq" class="mb-4 text-2xl font-semibold"><?php echo esc_html( sprintf( /* translators: %s category */ __( 'Useful information about %s', 'verdant-roots' ), $vr_term->name ) ); ?></h2>
			<?php vr_render_accordion( array_map( static fn( $p ) => array( $p[0], '<p class="text-ink-soft">' . esc_html( $p[1] ) . '</p>' ), $vr_faqs ) ); ?>
			<?php vr_faq_schema( $vr_faqs ); ?>
		</section>
	<?php endif; ?>

	<?php if ( $vr_is_cat ) :
		$vr_related = array_filter( vr_top_categories(), static fn( $t ) => $t->term_id !== $vr_term->term_id );
		if ( $vr_related ) : ?>
			<section aria-labelledby="related-categories" class="mt-16">
				<h2 id="related-categories" class="mb-4 text-2xl font-semibold"><?php esc_html_e( 'Related categories', 'verdant-roots' ); ?></h2>
				<ul class="flex flex-wrap gap-3">
					<?php foreach ( array_slice( $vr_related, 0, 3 ) as $vr_t ) : ?><li><a href="<?php echo esc_url( get_term_link( $vr_t ) ); ?>" class="inline-block rounded-full border border-line px-5 py-2.5 font-medium hover:border-brand-500 hover:bg-brand-50"><?php echo esc_html( $vr_t->name ); ?></a></li><?php endforeach; ?>
				</ul>
			</section>
		<?php endif; endif; ?>
</div>

<dialog id="vr-filters" class="vr-drawer m-0 h-dvh max-h-dvh w-[88vw] max-w-sm overflow-y-auto rounded-none bg-white p-0 text-ink shadow-lift" aria-labelledby="vr-filters-title">
	<div class="p-5">
		<div class="mb-4 flex items-center justify-between gap-4"><h2 id="vr-filters-title" class="text-xl font-semibold"><?php esc_html_e( 'Filters', 'verdant-roots' ); ?></h2><button type="button" data-close class="grid h-10 w-10 place-items-center rounded-full hover:bg-brand-50" aria-label="<?php esc_attr_e( 'Close', 'verdant-roots' ); ?>"><?php vr_e_icon( 'close' ); ?></button></div>
		<?php get_template_part( 'template-parts/filter-sidebar', null, array( 'show_categories' => ! $vr_is_cat ) ); ?>
	</div>
</dialog>
<?php
get_footer( 'shop' );
