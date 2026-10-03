<?php
/** Mobile search overlay. */
defined( 'ABSPATH' ) || exit;
?>
<dialog id="vr-search" class="vr-modal m-auto w-[calc(100vw-1.5rem)] max-w-lg max-h-[90dvh] rounded-2xl bg-white p-0 text-ink shadow-lift" aria-labelledby="vr-search-title">
	<div class="p-5">
		<div class="mb-4 flex items-center justify-between gap-4">
			<h2 id="vr-search-title" class="text-xl font-semibold"><?php esc_html_e( 'Search', 'verdant-roots' ); ?></h2>
			<button type="button" data-close class="grid h-10 w-10 place-items-center rounded-full hover:bg-brand-50" aria-label="<?php esc_attr_e( 'Close', 'verdant-roots' ); ?>"><?php vr_e_icon( 'close' ); ?></button>
		</div>
		<?php echo vr_search_form( 'overlay' ); // phpcs:ignore WordPress.Security.EscapeOutput ?>
	</div>
</dialog>
