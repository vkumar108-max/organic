<?php
/** Category card. Args: term (WP_Term). */
defined( 'ABSPATH' ) || exit;
$vr_term  = $args['term'] ?? null;
if ( ! $vr_term instanceof WP_Term ) {
	return;
}
$vr_thumb = (int) get_term_meta( $vr_term->term_id, 'thumbnail_id', true );
$vr_desc  = wp_strip_all_tags( term_description( $vr_term->term_id, 'product_cat' ) );
?>
<article class="group relative overflow-hidden rounded-card border border-line bg-white transition duration-200 hover:-translate-y-0.5 hover:shadow-lift">
	<div class="relative aspect-[16/10] overflow-hidden">
		<?php if ( $vr_thumb ) : echo wp_get_attachment_image( $vr_thumb, 'large', false, array( 'class' => 'h-full w-full object-cover transition duration-500 group-hover:scale-105', 'alt' => '', 'loading' => 'lazy' ) ); // phpcs:ignore WordPress.Security.EscapeOutput
		else : ?><span class="block h-full w-full transition duration-500 group-hover:scale-105"><?php echo vr_art( vr_tone_for_slug( $vr_term->slug ), '' ); // phpcs:ignore WordPress.Security.EscapeOutput ?></span><?php endif; ?>
	</div>
	<div class="flex flex-col gap-1.5 p-5">
		<h3 class="text-xl font-semibold"><a href="<?php echo esc_url( get_term_link( $vr_term ) ); ?>" class="after:absolute after:inset-0 after:content-['']"><?php echo esc_html( $vr_term->name ); ?></a></h3>
		<?php if ( $vr_desc ) : ?><p class="line-clamp-2 text-sm text-ink-soft"><?php echo esc_html( $vr_desc ); ?></p><?php endif; ?>
		<span class="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-brand-700" aria-hidden="true"><?php esc_html_e( 'Explore', 'verdant-roots' ); vr_e_icon( 'arrowRight', 16, 'transition group-hover:translate-x-1' ); ?></span>
	</div>
</article>
