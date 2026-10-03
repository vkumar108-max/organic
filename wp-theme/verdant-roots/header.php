<?php
/**
 * Site header: announcement bar, sticky header, mega menu, mobile drawer + search.
 *
 * @package VerdantRoots
 */

defined( 'ABSPATH' ) || exit;

$vr_woo = class_exists( 'WooCommerce' );
?>
<!doctype html>
<html <?php language_attributes(); ?>>
<head>
	<meta charset="<?php bloginfo( 'charset' ); ?>">
	<meta name="viewport" content="width=device-width, initial-scale=1">
	<meta name="theme-color" content="#2d7439">
	<?php wp_head(); ?>
</head>
<body <?php body_class(); ?>>
<?php wp_body_open(); ?>
<a href="#main" class="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-white focus:px-4 focus:py-2 focus:shadow-lift"><?php esc_html_e( 'Skip to main content', 'verdant-roots' ); ?></a>

<?php get_template_part( 'template-parts/announcement-bar' ); ?>

<header class="sticky top-0 z-50 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/85" id="site-header">
	<div class="container-page flex items-center gap-3 py-2.5 md:gap-6 md:py-4">
		<button type="button" class="rounded-full p-2 hover:bg-brand-50 md:hidden" data-open="vr-menu" aria-haspopup="dialog" aria-label="<?php esc_attr_e( 'Open menu', 'verdant-roots' ); ?>"><?php vr_e_icon( 'menu', 26 ); ?></button>
		<div class="mr-auto md:mr-0"><?php echo vr_logo(); // phpcs:ignore WordPress.Security.EscapeOutput -- built and escaped in vr_logo(). ?></div>
		<div class="mx-auto hidden max-w-2xl flex-1 md:block"><?php echo vr_search_form( 'header' ); // phpcs:ignore WordPress.Security.EscapeOutput ?></div>
		<?php get_template_part( 'template-parts/header-actions' ); ?>
	</div>
	<?php get_template_part( 'template-parts/mega-menu' ); ?>
	<div class="border-b border-line md:hidden"></div>
</header>

<?php get_template_part( 'template-parts/mobile-menu' ); ?>
<?php get_template_part( 'template-parts/search-overlay' ); ?>

<main id="main" class="min-h-[60vh]">
