<?php
/**
 * Footer.
 *
 * @package VerdantRoots
 */

defined( 'ABSPATH' ) || exit;

$vr_socials = array(
	'instagram' => 'Instagram',
	'facebook'  => 'Facebook',
	'youtube'   => 'YouTube',
	'x'         => 'X',
);
$vr_cols    = array(
	__( 'Quick links', 'verdant-roots' )       => 'footer',
	__( 'Customer support', 'verdant-roots' )  => 'support',
	__( 'Policies', 'verdant-roots' )          => 'policy',
);
?>
</main>

<footer class="mt-16 bg-brand-900 pb-20 text-brand-100 md:pb-0">
	<div class="container-page grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-[1.6fr_1fr_1fr_1fr_1fr]">
		<div class="sm:col-span-2 lg:col-span-1">
			<?php echo vr_logo( true ); // phpcs:ignore WordPress.Security.EscapeOutput ?>
			<p class="mt-4 max-w-xs text-sm text-brand-100/80"><?php echo esc_html( get_bloginfo( 'description' ) ?: __( 'Fruit, leaf and vegetable powders, tablets, dry vegetables and value combos.', 'verdant-roots' ) ); ?></p>
			<ul class="mt-5 flex gap-2">
				<?php foreach ( $vr_socials as $vr_key => $vr_label ) : $vr_url = vr_opt( $vr_key, '' ); if ( ! $vr_url ) { continue; } ?>
					<li><a href="<?php echo esc_url( $vr_url ); ?>" target="_blank" rel="noopener noreferrer" aria-label="<?php echo esc_attr( sprintf( /* translators: 1 site 2 network */ __( '%1$s on %2$s', 'verdant-roots' ), get_bloginfo( 'name' ), $vr_label ) ); ?>" class="grid h-10 w-10 place-items-center rounded-full bg-white/10 hover:bg-white/20"><?php vr_e_icon( $vr_key, 18 ); ?></a></li>
				<?php endforeach; ?>
			</ul>
		</div>

		<?php
		// Column: Shop (from product categories).
		?>
		<div>
			<h2 class="mb-3 font-sans text-sm font-bold uppercase tracking-wider text-white"><?php esc_html_e( 'Shop', 'verdant-roots' ); ?></h2>
			<ul class="space-y-2 text-sm">
				<?php foreach ( function_exists( 'vr_top_categories' ) ? vr_top_categories() : array() as $vr_term ) : ?>
					<li><a class="text-brand-100/80 hover:text-white hover:underline" href="<?php echo esc_url( get_term_link( $vr_term ) ); ?>"><?php echo esc_html( $vr_term->name ); ?></a></li>
				<?php endforeach; ?>
			</ul>
		</div>

		<?php foreach ( $vr_cols as $vr_title => $vr_loc ) : ?>
			<div>
				<h2 class="mb-3 font-sans text-sm font-bold uppercase tracking-wider text-white"><?php echo esc_html( $vr_title ); ?></h2>
				<ul class="space-y-2 text-sm">
					<?php foreach ( vr_menu_items( $vr_loc ) as [ $vr_label, $vr_url ] ) : ?>
						<li><a class="text-brand-100/80 hover:text-white hover:underline" href="<?php echo esc_url( $vr_url ); ?>"><?php echo esc_html( $vr_label ); ?></a></li>
					<?php endforeach; ?>
				</ul>
			</div>
		<?php endforeach; ?>
	</div>

	<div class="border-t border-white/10">
		<div class="container-page flex flex-col items-center justify-between gap-3 py-5 text-xs text-brand-100/70 sm:flex-row">
			<p>© <?php echo esc_html( gmdate( 'Y' ) ); ?> <?php echo esc_html( vr_brand_name( 'footer' ) ); ?>. <?php esc_html_e( 'All Rights Reserved.', 'verdant-roots' ); ?></p>
			<?php
			// Only methods that are actually enabled in WooCommerce are shown.
			if ( function_exists( 'WC' ) && WC()->payment_gateways() ) :
				$vr_gateways = WC()->payment_gateways()->get_available_payment_gateways();
				if ( $vr_gateways ) :
					?>
					<ul class="flex flex-wrap items-center justify-center gap-2" aria-label="<?php esc_attr_e( 'Accepted payment methods', 'verdant-roots' ); ?>">
						<?php foreach ( $vr_gateways as $vr_gw ) : ?>
							<li class="rounded border border-white/20 px-2 py-0.5 text-[0.7rem]"><?php echo esc_html( wp_strip_all_tags( $vr_gw->get_title() ) ); ?></li>
						<?php endforeach; ?>
					</ul>
				<?php endif; endif; ?>
		</div>
	</div>
</footer>

<?php get_template_part( 'template-parts/mobile-bottom-nav' ); ?>
<div class="vr-toasts" aria-live="polite" role="status"></div>
<?php wp_footer(); ?>
<!-- Verdant Roots theme <?php echo esc_html( VR_VERSION ); ?> -->
</body>
</html>
