<?php
/**
 * Extra product & category content fields. Empty fields render an honest
 * "to be provided" placeholder on the storefront — nothing is invented.
 *
 * @package VerdantRoots
 */

defined( 'ABSPATH' ) || exit;

function vr_product_field_defs(): array {
	return array(
		'_vr_highlights'  => array( __( 'Product highlights (one per line)', 'verdant-roots' ), 4 ),
		'_vr_ingredients' => array( __( 'Ingredients (verified against the pack label)', 'verdant-roots' ), 3 ),
		'_vr_usage'       => array( __( 'How to use', 'verdant-roots' ), 3 ),
		'_vr_nutrition'   => array( __( 'Nutritional information — one row per line: Nutrient | Per serving', 'verdant-roots' ), 4 ),
		'_vr_storage'     => array( __( 'Storage information', 'verdant-roots' ), 3 ),
		'_vr_faqs'        => array( __( 'FAQs — one per line: Question | Answer', 'verdant-roots' ), 4 ),
	);
}

add_action(
	'add_meta_boxes',
	static function () {
		add_meta_box( 'vr-product-details', __( 'Verdant Roots: product details', 'verdant-roots' ), 'vr_render_product_metabox', 'product', 'normal', 'default' );
	}
);

function vr_render_product_metabox( WP_Post $post ): void {
	wp_nonce_field( 'vr_product_meta', 'vr_product_meta_nonce' );
	foreach ( vr_product_field_defs() as $key => [ $label, $rows ] ) {
		printf(
			'<p><label for="%1$s"><strong>%2$s</strong></label><br><textarea id="%1$s" name="%1$s" rows="%3$d" class="large-text">%4$s</textarea></p>',
			esc_attr( $key ),
			esc_html( $label ),
			(int) $rows,
			esc_textarea( (string) get_post_meta( $post->ID, $key, true ) )
		);
	}
}

add_action(
	'save_post_product',
	static function ( int $post_id ) {
		if ( ! isset( $_POST['vr_product_meta_nonce'] ) || ! wp_verify_nonce( sanitize_text_field( wp_unslash( $_POST['vr_product_meta_nonce'] ) ), 'vr_product_meta' ) ) {
			return;
		}
		if ( defined( 'DOING_AUTOSAVE' ) && DOING_AUTOSAVE || ! current_user_can( 'edit_post', $post_id ) ) {
			return;
		}
		foreach ( array_keys( vr_product_field_defs() ) as $key ) {
			if ( isset( $_POST[ $key ] ) ) {
				update_post_meta( $post_id, $key, sanitize_textarea_field( wp_unslash( $_POST[ $key ] ) ) );
			}
		}
	}
);

/** Lines of a textarea field. */
function vr_meta_lines( int $post_id, string $key ): array {
	return array_values( array_filter( array_map( 'trim', preg_split( '/\r\n|\r|\n/', (string) get_post_meta( $post_id, $key, true ) ) ) ) );
}

/** "A | B" lines → array of [A, B]. */
function vr_meta_pairs( int $post_id, string $key ): array {
	return vr_parse_pairs( (string) get_post_meta( $post_id, $key, true ) );
}

function vr_parse_pairs( string $text ): array {
	$pairs = array();
	foreach ( array_filter( array_map( 'trim', preg_split( '/\r\n|\r|\n/', $text ) ) ) as $line ) {
		$parts = array_map( 'trim', explode( '|', $line, 2 ) );
		if ( 2 === count( $parts ) && '' !== $parts[0] && '' !== $parts[1] ) {
			$pairs[] = $parts;
		}
	}
	return $pairs;
}

/* -------- Category FAQ field -------- */

add_action(
	'product_cat_add_form_fields',
	static function () {
		echo '<div class="form-field"><label for="vr_faqs">' . esc_html__( 'FAQs (Question | Answer per line)', 'verdant-roots' ) . '</label><textarea name="vr_faqs" id="vr_faqs" rows="4"></textarea></div>';
	}
);
add_action(
	'product_cat_edit_form_fields',
	static function ( WP_Term $term ) {
		echo '<tr class="form-field"><th scope="row"><label for="vr_faqs">' . esc_html__( 'FAQs (Question | Answer per line)', 'verdant-roots' ) . '</label></th><td><textarea name="vr_faqs" id="vr_faqs" rows="5" class="large-text">' . esc_textarea( (string) get_term_meta( $term->term_id, 'vr_faqs', true ) ) . '</textarea></td></tr>';
	}
);
add_action(
	'created_product_cat',
	static function ( int $term_id ) {
		if ( current_user_can( 'manage_product_terms' ) && isset( $_POST['vr_faqs'] ) ) { // phpcs:ignore WordPress.Security.NonceVerification -- core term screens verify their own nonce.
			update_term_meta( $term_id, 'vr_faqs', sanitize_textarea_field( wp_unslash( $_POST['vr_faqs'] ) ) );
		}
	}
);
add_action( 'edited_product_cat', 'vr_save_cat_faqs' );
function vr_save_cat_faqs( int $term_id ): void {
	if ( current_user_can( 'manage_product_terms' ) && isset( $_POST['vr_faqs'] ) ) { // phpcs:ignore WordPress.Security.NonceVerification
		update_term_meta( $term_id, 'vr_faqs', sanitize_textarea_field( wp_unslash( $_POST['vr_faqs'] ) ) );
	}
}

/** Is the product "new"? (published in the last N days) */
function vr_is_new_product( WC_Product $product ): bool {
	$created = $product->get_date_created();
	return $created && ( time() - $created->getTimestamp() ) < DAY_IN_SECONDS * (int) apply_filters( 'vr_new_days', 30 );
}

/** Best seller = carries the configured tag. */
function vr_is_best_seller( int $product_id ): bool {
	return has_term( (string) vr_opt( 'best_tag', 'best-seller' ), 'product_tag', $product_id );
}
