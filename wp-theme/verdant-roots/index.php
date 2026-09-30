<?php
/**
 * Blog listing (posts page), category/tag/date archives.
 *
 * @package VerdantRoots
 */

defined( 'ABSPATH' ) || exit;
get_header();

$vr_filtered = is_category() || is_tag() || is_search() || is_paged();
$vr_featured = null;
if ( ! $vr_filtered && have_posts() ) {
	$vr_featured = get_posts( array( 'numberposts' => 1, 'post_type' => 'post', 'ignore_sticky_posts' => false, 'post__in' => get_option( 'sticky_posts' ) ?: array( 0 ) ) )[0] ?? null;
}
$vr_popular = get_posts( array( 'numberposts' => 4, 'orderby' => 'comment_count', 'order' => 'DESC' ) );
$vr_title   = is_home() && ! is_front_page() ? get_the_title( (int) get_option( 'page_for_posts' ) ) : ( is_archive() ? get_the_archive_title() : __( 'Blog', 'verdant-roots' ) );
?>
<div class="container-page pb-10">
	<nav aria-label="Breadcrumb" class="py-3 text-sm"><ol class="flex items-center gap-1 text-ink-soft"><li><a class="hover:text-brand-700 hover:underline" href="<?php echo esc_url( home_url( '/' ) ); ?>"><?php esc_html_e( 'Home', 'verdant-roots' ); ?></a></li><li class="flex items-center gap-1"><?php vr_e_icon( 'chevronRight', 14 ); ?><span aria-current="page" class="font-medium text-ink"><?php esc_html_e( 'Blog', 'verdant-roots' ); ?></span></li></ol></nav>
	<h1 class="text-3xl font-semibold sm:text-4xl"><?php echo esc_html( wp_strip_all_tags( $vr_title ) ); ?></h1>
	<p class="mt-2 max-w-2xl text-ink-soft"><?php esc_html_e( 'Guides, buying tips and simple kitchen ideas.', 'verdant-roots' ); ?></p>

	<div class="mt-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
		<form role="search" method="get" action="<?php echo esc_url( vr_blog_url() ); ?>" class="relative w-full md:max-w-sm">
			<input type="hidden" name="post_type" value="post">
			<label for="blog-search" class="sr-only"><?php esc_html_e( 'Search articles', 'verdant-roots' ); ?></label>
			<?php vr_e_icon( 'search', 18, 'pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-soft' ); ?>
			<input id="blog-search" type="search" name="s" value="<?php echo esc_attr( is_search() ? get_search_query() : '' ); ?>" placeholder="<?php esc_attr_e( 'Search articles', 'verdant-roots' ); ?>" class="w-full rounded-full border border-line py-2.5 pl-11 pr-4">
		</form>
		<ul class="flex flex-wrap gap-2" aria-label="<?php esc_attr_e( 'Article categories', 'verdant-roots' ); ?>">
			<li><a href="<?php echo esc_url( vr_blog_url() ); ?>" class="rounded-full border px-4 py-1.5 text-sm <?php echo ! is_category() ? 'border-brand-600 bg-brand-600 text-white' : 'border-line hover:bg-brand-50'; ?>"><?php esc_html_e( 'All', 'verdant-roots' ); ?></a></li>
			<?php foreach ( get_categories( array( 'hide_empty' => true ) ) as $vr_c ) : ?><li><a href="<?php echo esc_url( get_category_link( $vr_c ) ); ?>" class="rounded-full border px-4 py-1.5 text-sm <?php echo is_category( $vr_c->term_id ) ? 'border-brand-600 bg-brand-600 text-white' : 'border-line hover:bg-brand-50'; ?>"><?php echo esc_html( $vr_c->name ); ?></a></li><?php endforeach; ?>
		</ul>
	</div>

	<?php if ( have_posts() ) : ?>
		<?php if ( $vr_featured ) : ?>
			<article class="mt-8 grid overflow-hidden rounded-3xl border border-line bg-brand-50/60 md:grid-cols-2">
				<div class="aspect-[16/10] md:aspect-auto"><?php echo has_post_thumbnail( $vr_featured ) ? get_the_post_thumbnail( $vr_featured, 'large', array( 'class' => 'h-full w-full object-cover', 'alt' => '' ) ) : vr_art( 'leaf', '' ); // phpcs:ignore WordPress.Security.EscapeOutput ?></div>
				<div class="flex flex-col justify-center gap-3 p-6 sm:p-10">
					<p class="text-xs font-bold uppercase tracking-wider text-clay-500"><?php esc_html_e( 'Featured', 'verdant-roots' ); ?></p>
					<h2 class="text-2xl font-semibold sm:text-3xl"><a href="<?php echo esc_url( get_permalink( $vr_featured ) ); ?>" class="hover:text-brand-700"><?php echo esc_html( get_the_title( $vr_featured ) ); ?></a></h2>
					<p class="text-ink-soft"><?php echo esc_html( wp_trim_words( get_the_excerpt( $vr_featured ), 30 ) ); ?></p>
					<p class="text-sm text-ink-soft"><?php echo esc_html( get_the_date( '', $vr_featured ) ); ?> · <?php echo esc_html( sprintf( /* translators: %d minutes */ __( '%d min read', 'verdant-roots' ), vr_reading_minutes( $vr_featured ) ) ); ?></p>
				</div>
			</article>
		<?php endif; ?>
		<div class="mt-10 grid gap-10 lg:grid-cols-[1fr_18rem]">
			<section aria-labelledby="latest">
				<h2 id="latest" class="mb-5 text-2xl font-semibold"><?php echo $vr_filtered ? esc_html__( 'Results', 'verdant-roots' ) : esc_html__( 'Latest articles', 'verdant-roots' ); ?></h2>
				<ul class="grid gap-5 sm:grid-cols-2"><?php while ( have_posts() ) : the_post(); ?><li><?php get_template_part( 'template-parts/blog-card' ); ?></li><?php endwhile; ?></ul>
				<?php the_posts_pagination( array( 'mid_size' => 1, 'prev_text' => vr_icon( 'chevronLeft', 16 ), 'next_text' => vr_icon( 'chevronRight', 16 ), 'class' => 'vr-pagination' ) ); ?>
			</section>
			<aside aria-labelledby="popular" class="lg:sticky lg:top-40 lg:self-start">
				<h2 id="popular" class="mb-4 text-xl font-semibold"><?php esc_html_e( 'Popular articles', 'verdant-roots' ); ?></h2>
				<ol class="space-y-4"><?php foreach ( $vr_popular as $vr_i => $vr_p ) : ?><li class="flex gap-3"><span class="font-display text-2xl text-brand-300" aria-hidden="true"><?php echo (int) $vr_i + 1; ?></span><a href="<?php echo esc_url( get_permalink( $vr_p ) ); ?>" class="font-medium hover:text-brand-700"><?php echo esc_html( get_the_title( $vr_p ) ); ?></a></li><?php endforeach; ?></ol>
			</aside>
		</div>
	<?php else : ?>
		<div class="mx-auto flex max-w-md flex-col items-center px-4 py-14 text-center"><div class="mb-5 grid h-16 w-16 place-items-center rounded-full bg-brand-100 text-brand-700"><?php vr_e_icon( 'search', 30 ); ?></div><h2 class="text-2xl font-semibold"><?php esc_html_e( 'No articles found', 'verdant-roots' ); ?></h2><p class="mt-2 text-ink-soft"><?php esc_html_e( 'Try a different search or category.', 'verdant-roots' ); ?></p><a class="vr-btn mt-6" href="<?php echo esc_url( vr_blog_url() ); ?>"><?php esc_html_e( 'View all articles', 'verdant-roots' ); ?></a></div>
	<?php endif; ?>
</div>
<?php get_footer();
