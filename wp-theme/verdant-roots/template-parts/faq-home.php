<?php
/**
 * Home FAQs: heading + contact prompt on the left, accordion on the right (stacked on phones).
 * Content from Customize → Home FAQs (see inc/faq.php). Hidden when there are no pairs.
 *
 * @package VerdantRoots
 */

defined( 'ABSPATH' ) || exit;

$vr_pairs = vr_faq_pairs();
if ( ! $vr_pairs ) {
	return;
}
$vr_faq_page = get_page_by_path( 'faq' );
$vr_contact  = get_page_by_path( 'contact' );
$vr_intro    = (string) vr_opt( 'faq_intro', 'Quick answers about ordering, payment and your products.' );
?>
<section aria-labelledby="home-faq" class="section bg-brand-50/70">
	<div class="container-page grid gap-8 lg:grid-cols-[minmax(0,20rem)_minmax(0,1fr)] lg:gap-12">
		<div class="lg:sticky lg:top-28 lg:self-start">
			<p class="mb-1 text-xs font-bold uppercase tracking-[0.14em] text-clay-500"><?php esc_html_e( 'FAQ', 'verdant-roots' ); ?></p>
			<h2 id="home-faq" class="text-2xl font-semibold sm:text-3xl"><?php echo esc_html( (string) vr_opt( 'faq_title', 'Frequently asked questions' ) ); ?></h2>
			<?php if ( $vr_intro ) : ?><p class="mt-3 text-ink-soft"><?php echo esc_html( $vr_intro ); ?></p><?php endif; ?>
			<?php if ( $vr_contact || $vr_faq_page ) : ?>
				<div class="mt-5 flex flex-wrap gap-3">
					<?php if ( $vr_contact ) : ?><a class="vr-btn" href="<?php echo esc_url( get_permalink( $vr_contact ) ); ?>"><?php esc_html_e( 'Contact us', 'verdant-roots' ); ?></a><?php endif; ?>
					<?php if ( $vr_faq_page ) : ?><a class="vr-btn vr-btn--outline" href="<?php echo esc_url( get_permalink( $vr_faq_page ) ); ?>"><?php esc_html_e( 'All FAQs', 'verdant-roots' ); ?></a><?php endif; ?>
				</div>
			<?php endif; ?>
		</div>
		<div>
			<?php vr_render_accordion( array_map( static fn( $p ) => array( $p[0], '<p class="text-ink-soft">' . nl2br( esc_html( $p[1] ) ) . '</p>' ), $vr_pairs ), '0' ); ?>
			<?php vr_faq_schema( $vr_pairs ); ?>
		</div>
	</div>
</section>
