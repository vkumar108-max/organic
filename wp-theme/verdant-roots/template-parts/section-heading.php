<?php
/** Args: id, title, eyebrow, description, href, link_label. */
defined( 'ABSPATH' ) || exit;
?>
<div class="mb-7 flex flex-wrap items-end justify-between gap-3">
	<div class="max-w-2xl">
		<?php if ( ! empty( $args['eyebrow'] ) ) : ?><p class="mb-1 text-xs font-bold uppercase tracking-[0.14em] text-clay-500"><?php echo esc_html( $args['eyebrow'] ); ?></p><?php endif; ?>
		<h2 id="<?php echo esc_attr( $args['id'] ?? '' ); ?>" class="text-2xl font-semibold sm:text-3xl"><?php echo esc_html( $args['title'] ?? '' ); ?></h2>
		<?php if ( ! empty( $args['description'] ) ) : ?><p class="mt-2 text-ink-soft"><?php echo esc_html( $args['description'] ); ?></p><?php endif; ?>
	</div>
	<?php if ( ! empty( $args['href'] ) && ! empty( $args['link_label'] ) ) : ?>
		<a href="<?php echo esc_url( $args['href'] ); ?>" class="inline-flex items-center gap-1 text-sm font-semibold text-brand-700 hover:underline"><?php echo esc_html( $args['link_label'] ); vr_e_icon( 'arrowRight', 16 ); ?></a>
	<?php endif; ?>
</div>
