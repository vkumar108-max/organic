<?php
/**
 * Thin, always-running strip of licences / trust marks under the hero.
 * Content comes from Customizer → "Trust strip". Visitors see it only when real items are saved;
 * admins with nothing saved get a clearly-labelled sample so they can see where it goes.
 *
 * @package VerdantRoots
 */

defined( 'ABSPATH' ) || exit;

$vr_items  = vr_trust_items();
$vr_sample = false;
if ( ! $vr_items ) {
	if ( ! current_user_can( 'manage_options' ) ) {
		return;
	}
	$vr_sample = true;
	$vr_items  = array(
		array( 'label' => __( 'Sample — upload your logos in Customize → Trust logos', 'verdant-roots' ), 'detail' => '', 'logo' => '' ),
		array( 'label' => __( 'Visitors see this strip only after you add a logo', 'verdant-roots' ), 'detail' => '', 'logo' => '' ),
	);
}

$vr_group = array();
while ( count( $vr_group ) < 8 ) { // enough width to loop without a gap on wide screens.
	$vr_group = array_merge( $vr_group, $vr_items );
}
?>
<section class="vr-trust<?php echo $vr_sample ? ' is-sample' : ''; ?>" aria-label="<?php esc_attr_e( 'Licences and trust marks', 'verdant-roots' ); ?>" data-trust>
	<div class="vr-trust-viewport">
		<div class="vr-trust-track">
			<?php foreach ( array( false, true ) as $vr_dup ) : ?>
				<ul class="vr-trust-group"<?php echo $vr_dup ? ' aria-hidden="true"' : ''; ?>>
					<?php foreach ( $vr_group as $vr_it ) : ?>
						<li class="vr-trust-item">
							<?php if ( $vr_it['logo'] ) : ?>
								<img src="<?php echo esc_url( $vr_it['logo'] ); ?>" alt="<?php echo esc_attr( $vr_it['label'] ); ?>" height="32" loading="lazy" decoding="async" class="vr-trust-logo">
							<?php else : ?>
								<span class="vr-trust-ico"><?php vr_e_icon( 'shield', 16 ); ?></span>
							<?php endif; ?>
							<?php if ( ! $vr_it['logo'] ) : ?><span class="vr-trust-label"><?php echo esc_html( $vr_it['label'] ); ?></span><?php endif; ?>
						</li>
					<?php endforeach; ?>
				</ul>
			<?php endforeach; ?>
		</div>
	</div>
	<button type="button" class="vr-trust-play" data-trust-play aria-pressed="false" aria-label="<?php esc_attr_e( 'Pause scrolling strip', 'verdant-roots' ); ?>"><span data-trust-icon aria-hidden="true">❚❚</span></button>
</section>
