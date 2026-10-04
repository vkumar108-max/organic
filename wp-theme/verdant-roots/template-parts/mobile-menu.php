<?php
/** Hamburger drawer: native <dialog> (focus trap + Escape for free). */
defined( 'ABSPATH' ) || exit;
$vr_cats = function_exists( 'vr_nav_categories' ) && taxonomy_exists( 'product_cat' ) ? vr_nav_categories() : array();
?>
<dialog id="vr-menu" class="vr-drawer m-0 h-dvh max-h-dvh w-[88vw] max-w-sm overflow-y-auto rounded-none bg-white p-0 text-ink shadow-lift" aria-labelledby="vr-menu-title">
	<div class="p-5">
		<div class="mb-4 flex items-center justify-between gap-4">
			<h2 id="vr-menu-title" class="text-xl font-semibold"><?php esc_html_e( 'Menu', 'verdant-roots' ); ?></h2>
			<button type="button" data-close class="grid h-10 w-10 place-items-center rounded-full hover:bg-brand-50" aria-label="<?php esc_attr_e( 'Close', 'verdant-roots' ); ?>"><?php vr_e_icon( 'close' ); ?></button>
		</div>
		<nav aria-label="<?php esc_attr_e( 'Mobile', 'verdant-roots' ); ?>" class="flex flex-col gap-5">
			<?php echo vr_logo(); // phpcs:ignore WordPress.Security.EscapeOutput ?>
			<?php get_template_part( 'template-parts/menu-tiles' ); ?>
			<ul class="divide-y divide-line">
				<?php foreach ( vr_menu_items( 'primary' ) as [ $vr_l, $vr_u ] ) : ?>
					<li><a href="<?php echo esc_url( $vr_u ); ?>" class="block py-3 font-medium"><?php echo esc_html( $vr_l ); ?></a></li>
				<?php endforeach; ?>
			</ul>
			<?php if ( $vr_cats ) : ?>
				<div>
					<p class="mb-1 text-xs font-bold uppercase tracking-wider text-clay-500"><?php esc_html_e( 'Shop by category', 'verdant-roots' ); ?></p>
					<ul>
						<?php foreach ( $vr_cats as $vr_term ) : ?>
							<li><a href="<?php echo esc_url( get_term_link( $vr_term ) ); ?>" class="flex items-center justify-between py-2.5"><?php echo esc_html( $vr_term->name ); ?><?php vr_e_icon( 'chevronRight', 16 ); ?></a></li>
						<?php endforeach; ?>
					</ul>
				</div>
			<?php endif; ?>
			<ul class="grid grid-cols-2 gap-2 text-sm text-ink-soft">
				<?php foreach ( array_slice( vr_menu_items( 'support' ), 0, 3 ) as [ $vr_l, $vr_u ] ) : ?>
					<li><a href="<?php echo esc_url( $vr_u ); ?>" class="block rounded-lg bg-brand-50 px-3 py-2"><?php echo esc_html( $vr_l ); ?></a></li>
				<?php endforeach; ?>
				<li><a href="<?php echo esc_url( vr_page_url( 'bulk-order' ) ); ?>" class="block rounded-lg bg-brand-100 px-3 py-2 font-semibold text-brand-800"><?php esc_html_e( 'Bulk Order', 'verdant-roots' ); ?></a></li>
			</ul>
		</nav>
	</div>
</dialog>
