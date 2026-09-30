<?php
/** 404. */
defined( 'ABSPATH' ) || exit;
get_header();
?>
<div class="container-page py-10">
	<p class="text-center text-sm font-bold uppercase tracking-widest text-clay-500"><?php esc_html_e( 'Error 404', 'verdant-roots' ); ?></p>
	<div class="mx-auto flex max-w-md flex-col items-center px-4 py-10 text-center">
		<div class="mb-5 grid h-16 w-16 place-items-center rounded-full bg-brand-100 text-brand-700"><?php vr_e_icon( 'search', 30 ); ?></div>
		<h1 class="text-2xl font-semibold"><?php esc_html_e( 'We couldn’t find that page', 'verdant-roots' ); ?></h1>
		<p class="mt-2 text-ink-soft"><?php esc_html_e( 'The page may have moved or the link may be incorrect. Try searching, or head back to the shop.', 'verdant-roots' ); ?></p>
		<div class="mt-6 flex flex-wrap justify-center gap-3"><a class="vr-btn" href="<?php echo esc_url( home_url( '/' ) ); ?>"><?php esc_html_e( 'Go to home', 'verdant-roots' ); ?></a><a class="vr-btn vr-btn--outline" href="<?php echo esc_url( vr_page_url( 'categories' ) ); ?>"><?php esc_html_e( 'Browse categories', 'verdant-roots' ); ?></a></div>
	</div>
</div>
<?php get_footer();
