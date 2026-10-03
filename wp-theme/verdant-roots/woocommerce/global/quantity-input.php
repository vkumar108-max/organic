<?php
/** Quantity input with − / + buttons (behaviour in theme.js). */
defined( 'ABSPATH' ) || exit;

$vr_label = ! empty( $args['product_name'] ) ? sprintf( /* translators: %s product */ esc_html__( '%s quantity', 'woocommerce' ), wp_strip_all_tags( $args['product_name'] ) ) : esc_html__( 'Quantity', 'woocommerce' );
if ( $max_value && $min_value === $max_value ) {
	?>
	<div class="quantity hidden"><input type="hidden" id="<?php echo esc_attr( $input_id ); ?>" class="qty" name="<?php echo esc_attr( $input_name ); ?>" value="<?php echo esc_attr( $min_value ); ?>"></div>
	<?php
	return;
}
?>
<div class="quantity vr-qty inline-flex items-center rounded-full border border-line bg-white" role="group" aria-label="<?php echo esc_attr( $vr_label ); ?>">
	<button type="button" class="grid h-11 w-11 place-items-center rounded-full hover:bg-brand-50" data-qty="-1" aria-label="<?php esc_attr_e( 'Decrease quantity', 'verdant-roots' ); ?>"><?php vr_e_icon( 'minus', 16 ); ?></button>
	<input type="number" id="<?php echo esc_attr( $input_id ); ?>" class="qty min-w-8 w-12 border-0 bg-transparent p-0 text-center text-sm font-semibold tabular-nums" name="<?php echo esc_attr( $input_name ); ?>" value="<?php echo esc_attr( $input_value ); ?>" aria-label="<?php echo esc_attr( $vr_label ); ?>" min="<?php echo esc_attr( $min_value ); ?>" <?php echo 0 < $max_value ? 'max="' . esc_attr( $max_value ) . '"' : ''; ?> step="<?php echo esc_attr( $step ); ?>" inputmode="numeric" autocomplete="off">
	<button type="button" class="grid h-11 w-11 place-items-center rounded-full hover:bg-brand-50" data-qty="1" aria-label="<?php esc_attr_e( 'Increase quantity', 'verdant-roots' ); ?>"><?php vr_e_icon( 'plus', 16 ); ?></button>
</div>
