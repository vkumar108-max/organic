<?php
/**
 * Imports the SAMPLE catalogue through WooCommerce's own CSV importer.
 * Run from the WordPress root:  wp eval-file wp-content/themes/verdant-roots/demo/import-demo.php
 * Sample products carry the "demo" tag — delete them (Products → Tags → demo) before going live.
 */
if ( ! class_exists( 'WooCommerce' ) ) {
	WP_CLI::error( 'WooCommerce is not active.' );
}
require_once WC_ABSPATH . 'includes/import/class-wc-product-csv-importer.php';

// The importer only assigns categories/tags when run by a user who may manage product terms.
if ( ! current_user_can( 'manage_product_terms' ) ) {
	$admins = get_users( array( 'role' => 'administrator', 'number' => 1 ) );
	if ( $admins ) {
		wp_set_current_user( $admins[0]->ID );
	}
}

$dir = __DIR__;
foreach ( json_decode( file_get_contents( "$dir/categories.json" ), true ) as $cat ) {
	if ( ! term_exists( $cat['slug'], 'product_cat' ) ) {
		$res = wp_insert_term( $cat['name'], 'product_cat', array( 'slug' => $cat['slug'], 'description' => $cat['description'] ) );
		if ( ! is_wp_error( $res ) ) {
			update_term_meta( $res['term_id'], 'order', (int) $cat['sortOrder'] );
		}
	}
}

// Same header → field mapping WooCommerce's admin importer applies.
$mapping = array(
	'Type' => 'type', 'SKU' => 'sku', 'Name' => 'name', 'Published' => 'published', 'Is featured?' => 'featured',
	'Visibility in catalog' => 'catalog_visibility', 'Short description' => 'short_description', 'Description' => 'description',
	'In stock?' => 'stock_status', 'Stock' => 'stock_quantity', 'Regular price' => 'regular_price', 'Sale price' => 'sale_price',
	'Categories' => 'category_ids', 'Tags' => 'tag_ids', 'Images' => 'images', 'Parent' => 'parent_id',
	'Meta: _vr_highlights' => 'meta:_vr_highlights', 'Meta: _vr_storage' => 'meta:_vr_storage',
);
foreach ( array( 1, 2 ) as $n ) {
	$mapping[ "Attribute $n name" ]      = "attributes:name$n";
	$mapping[ "Attribute $n value(s)" ]  = "attributes:value$n";
	$mapping[ "Attribute $n visible" ]   = "attributes:visible$n";
	$mapping[ "Attribute $n global" ]    = "attributes:taxonomy$n";
	$mapping[ "Attribute $n default" ]   = "attributes:default$n";
}
$importer = new WC_Product_CSV_Importer( "$dir/sample-products.csv", array( 'parse' => true, 'update_existing' => false, 'delimiter' => ',', 'mapping' => array( 'from' => array_keys( $mapping ), 'to' => array_values( $mapping ) ) ) );
$results  = $importer->import();
WP_CLI::log( sprintf( 'Imported %d, updated %d, failed %d', count( $results['imported'] ), count( $results['updated'] ), count( $results['failed'] ) ) );

// Spread creation dates so "New" badges / "Newest" sorting look realistic.
$ages = json_decode( file_get_contents( "$dir/product-ages.json" ), true );
foreach ( $ages as $sku => $days ) {
	$id = wc_get_product_id_by_sku( $sku );
	if ( $id ) {
		$p = wc_get_product( $id );
		$p->set_date_created( time() - ( (int) $days * DAY_IN_SECONDS ) );
		$p->save();
	}
}
WP_CLI::success( 'Sample catalogue ready.' );
