<?php
/**
 * Single blog article: author, date, reading time, share, related posts.
 *
 * @package VerdantRoots
 */

defined( 'ABSPATH' ) || exit;
get_header();
while ( have_posts() ) :
	the_post();
	$vr_url   = rawurlencode( get_permalink() );
	$vr_title = rawurlencode( get_the_title() );
	$vr_cats  = get_the_category();
	$vr_rel   = get_posts( array( 'numberposts' => 3, 'post__not_in' => array( get_the_ID() ), 'category__in' => wp_list_pluck( $vr_cats, 'term_id' ) ) );
	?>
	<article class="container-page pb-10" itemscope itemtype="https://schema.org/Article">
		<nav aria-label="Breadcrumb" class="py-3 text-sm"><ol class="flex flex-wrap items-center gap-1 text-ink-soft"><li><a class="hover:underline" href="<?php echo esc_url( home_url( '/' ) ); ?>"><?php esc_html_e( 'Home', 'verdant-roots' ); ?></a></li><li class="flex items-center gap-1"><?php vr_e_icon( 'chevronRight', 14 ); ?><a class="hover:underline" href="<?php echo esc_url( vr_blog_url() ); ?>"><?php esc_html_e( 'Blog', 'verdant-roots' ); ?></a></li><li class="flex items-center gap-1"><?php vr_e_icon( 'chevronRight', 14 ); ?><span aria-current="page" class="font-medium text-ink"><?php the_title(); ?></span></li></ol></nav>
		<header class="max-w-3xl">
			<?php if ( $vr_cats ) : ?><p class="text-xs font-bold uppercase tracking-wider text-clay-500"><?php echo esc_html( $vr_cats[0]->name ); ?></p><?php endif; ?>
			<h1 class="mt-2 text-3xl font-semibold sm:text-5xl" itemprop="headline"><?php the_title(); ?></h1>
			<p class="mt-4 text-sm text-ink-soft"><?php esc_html_e( 'By', 'verdant-roots' ); ?> <span class="font-medium text-ink" itemprop="author"><?php the_author(); ?></span> · <time datetime="<?php echo esc_attr( get_the_date( 'c' ) ); ?>" itemprop="datePublished"><?php echo esc_html( get_the_date() ); ?></time> · <?php echo esc_html( sprintf( /* translators: %d minutes */ __( '%d min read', 'verdant-roots' ), vr_reading_minutes() ) ); ?></p>
		</header>
		<div class="my-8 aspect-[16/8] max-w-4xl overflow-hidden rounded-3xl"><?php echo has_post_thumbnail() ? get_the_post_thumbnail( null, 'full', array( 'class' => 'h-full w-full object-cover', 'itemprop' => 'image' ) ) : vr_art( 'leaf', '' ); // phpcs:ignore WordPress.Security.EscapeOutput ?></div>
		<div class="prose-content" itemprop="articleBody"><?php the_content(); ?>
			<p class="rounded-lg bg-sand-50 p-4 text-sm"><?php echo wp_kses_post( sprintf( /* translators: %s link */ __( 'This article is general information about food products, not medical advice. See our %s.', 'verdant-roots' ), '<a href="' . esc_url( vr_page_url( 'disclaimer' ) ) . '">' . esc_html__( 'Disclaimer', 'verdant-roots' ) . '</a>' ) ); ?></p>
		</div>
		<div class="mt-8 flex flex-wrap items-center gap-3">
			<span class="text-sm font-semibold"><?php esc_html_e( 'Share:', 'verdant-roots' ); ?></span>
			<?php foreach ( array( 'Facebook' => "https://www.facebook.com/sharer/sharer.php?u={$vr_url}", 'X' => "https://x.com/intent/post?url={$vr_url}&text={$vr_title}", 'WhatsApp' => "https://wa.me/?text={$vr_title}%20{$vr_url}" ) as $vr_l => $vr_u ) : ?>
				<a href="<?php echo esc_url( $vr_u ); ?>" target="_blank" rel="noopener noreferrer" class="rounded-full border border-line px-4 py-1.5 text-sm hover:bg-brand-50"><?php echo esc_html( $vr_l ); ?><span class="sr-only"> (<?php esc_html_e( 'opens in a new tab', 'verdant-roots' ); ?>)</span></a>
			<?php endforeach; ?>
		</div>
		<?php if ( $vr_rel ) : ?>
			<section aria-labelledby="related-posts" class="mt-14">
				<h2 id="related-posts" class="mb-5 text-2xl font-semibold"><?php esc_html_e( 'Related articles', 'verdant-roots' ); ?></h2>
				<ul class="grid gap-5 sm:grid-cols-2 lg:grid-cols-3"><?php global $post; foreach ( $vr_rel as $post ) : setup_postdata( $post ); ?><li><?php get_template_part( 'template-parts/blog-card' ); ?></li><?php endforeach; wp_reset_postdata(); ?></ul>
			</section>
		<?php endif; ?>
	</article>
<?php endwhile;
get_footer();
