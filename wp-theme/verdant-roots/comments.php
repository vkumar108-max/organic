<?php
/** Comments for posts (product reviews use WooCommerce's own template). */
defined( 'ABSPATH' ) || exit;
if ( post_password_required() ) {
	return;
}
?>
<section id="comments" class="mt-12 max-w-3xl">
	<?php if ( have_comments() ) : ?>
		<h2 class="mb-4 text-xl font-semibold"><?php echo esc_html( sprintf( /* translators: %d comments */ _n( '%d comment', '%d comments', get_comments_number(), 'verdant-roots' ), get_comments_number() ) ); ?></h2>
		<ol class="space-y-4"><?php wp_list_comments( array( 'style' => 'ol', 'avatar_size' => 40 ) ); ?></ol>
	<?php endif; ?>
	<?php comment_form(); ?>
</section>
