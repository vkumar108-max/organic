<?php
/** Blog card inside the loop. */
defined( 'ABSPATH' ) || exit;
$vr_cat = get_the_category();
?>
<article class="group flex h-full flex-col overflow-hidden rounded-card border border-line bg-white transition hover:shadow-lift">
	<div class="relative aspect-[16/10] overflow-hidden">
		<?php if ( has_post_thumbnail() ) : the_post_thumbnail( 'large', array( 'class' => 'h-full w-full object-cover', 'alt' => '' ) ); else : echo vr_art( array( 'leaf', 'fruit', 'combo', 'dry', 'vegetable', 'tablet' )[ get_the_ID() % 6 ], '' ); // phpcs:ignore WordPress.Security.EscapeOutput
		endif; ?>
	</div>
	<div class="flex flex-1 flex-col gap-2 p-5">
		<?php if ( $vr_cat ) : ?><p class="text-xs font-bold uppercase tracking-wider text-clay-500"><?php echo esc_html( $vr_cat[0]->name ); ?></p><?php endif; ?>
		<h3 class="text-lg font-semibold leading-snug"><a href="<?php the_permalink(); ?>" class="hover:text-brand-700"><?php the_title(); ?></a></h3>
		<p class="line-clamp-3 text-sm text-ink-soft"><?php echo esc_html( wp_strip_all_tags( get_the_excerpt() ) ); ?></p>
		<div class="mt-auto flex items-center justify-between pt-3 text-sm">
			<time datetime="<?php echo esc_attr( get_the_date( 'c' ) ); ?>" class="text-ink-soft"><?php echo esc_html( get_the_date() ); ?></time>
			<a href="<?php the_permalink(); ?>" class="font-semibold text-brand-700 hover:underline" aria-label="<?php echo esc_attr( sprintf( /* translators: %s title */ __( 'Read more: %s', 'verdant-roots' ), get_the_title() ) ); ?>"><?php esc_html_e( 'Read More →', 'verdant-roots' ); ?></a>
		</div>
	</div>
</article>
