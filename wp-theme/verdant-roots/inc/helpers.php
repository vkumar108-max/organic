<?php
/**
 * Small template helpers shared by every template.
 *
 * @package VerdantRoots
 */

defined( 'ABSPATH' ) || exit;

/** Inline SVG icon (decorative). */
function vr_icon( string $name, int $size = 20, string $class = '' ): string {
	$paths = vr_icon_paths();
	if ( ! isset( $paths[ $name ] ) ) {
		return '';
	}
	$fill = in_array( $name, array( 'star' ), true ) ? 'currentColor' : 'none';
	return sprintf(
		'<svg width="%1$d" height="%1$d" viewBox="0 0 24 24" fill="%2$s" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false" class="%3$s"><path d="%4$s"/></svg>',
		$size,
		esc_attr( $fill ),
		esc_attr( $class ),
		esc_attr( $paths[ $name ] )
	);
}

function vr_e_icon( string $name, int $size = 20, string $class = '' ): void {
	// Output is a fixed SVG built from our own path table and escaped attributes.
	echo vr_icon( $name, $size, $class ); // phpcs:ignore WordPress.Security.EscapeOutput
}

/** Theme mod with default. */
function vr_opt( string $key, $default = '' ) {
	return get_theme_mod( 'vr_' . $key, $default );
}

/** Announcement messages: one per line in the Customizer. */
function vr_announcements(): array {
	$raw   = (string) vr_opt( 'announcements', vr_default_announcements() );
	$lines = array_filter( array_map( 'trim', preg_split( '/\r\n|\r|\n/', $raw ) ) );
	return array_values( $lines );
}

function vr_default_announcements(): string {
	return implode(
		"\n",
		array(
			'🚚 Free shipping on orders above ₹' . vr_free_shipping_threshold(),
			'🌿 Natural products, carefully packed',
			'🔒 Secure checkout',
			'📦 Delivery across India',
		)
	);
}

function vr_free_shipping_threshold(): int {
	return (int) vr_opt( 'free_shipping', 499 );
}

/** Rating stars (read-only), accessible text included. */
function vr_rating_html( float $rating, int $count = 0, int $size = 14 ): string {
	if ( $rating <= 0 ) {
		return '';
	}
	$rounded = round( $rating * 2 ) / 2;
	$html    = '<span class="inline-flex items-center gap-1.5 text-sm text-ink-soft"><span class="sr-only">' . esc_html( sprintf( /* translators: %s rating */ __( 'Rated %s out of 5', 'verdant-roots' ), number_format_i18n( $rating, 1 ) ) ) . '</span><span class="inline-flex" aria-hidden="true">';
	for ( $i = 1; $i <= 5; $i++ ) {
		$w     = $rounded >= $i ? '100%' : ( $rounded >= $i - 0.5 ? '50%' : '0%' );
		$html .= '<span class="relative inline-block" style="width:' . (int) $size . 'px;height:' . (int) $size . 'px">'
			. vr_icon( 'star', $size, 'absolute inset-0 text-line' )
			. '<span class="absolute inset-0 overflow-hidden" style="width:' . esc_attr( $w ) . '">' . vr_icon( 'star', $size, 'text-turmeric-500' ) . '</span></span>';
	}
	$html .= '</span>';
	if ( $count > 0 ) {
		$html .= '<span aria-hidden="true">(' . (int) $count . ')</span>';
	}
	return $html . '</span>';
}

/** Discount percentage for a WC product (sale vs regular). */
function vr_discount_percent( WC_Product $product ): int {
	if ( ! $product->is_on_sale() ) {
		return 0;
	}
	if ( $product->is_type( 'variable' ) ) {
		$regular = (float) $product->get_variation_regular_price( 'min' );
		$sale    = (float) $product->get_variation_sale_price( 'min' );
	} else {
		$regular = (float) $product->get_regular_price();
		$sale    = (float) $product->get_sale_price();
	}
	return ( $regular > 0 && $sale < $regular ) ? (int) round( ( $regular - $sale ) / $regular * 100 ) : 0;
}

/** Max word count based reading time. */
function vr_reading_minutes( $post = null ): int {
	$words = str_word_count( wp_strip_all_tags( get_post_field( 'post_content', $post ) ) );
	return max( 1, (int) ceil( $words / 200 ) );
}

/** Tone (artwork colour set) for a term slug. */
function vr_tone_for_slug( string $slug ): string {
	$map = array(
		'fruit-powder'     => 'fruit',
		'leaf-powder'      => 'leaf',
		'vegetable-powder' => 'vegetable',
		'combos'           => 'combo',
		'tablet'           => 'tablet',
		'dry-vegetable'    => 'dry',
		'dry-vegetables'   => 'dry',
		'tablets'          => 'tablet',
	);
	return $map[ $slug ] ?? 'leaf';
}

function vr_product_tone( int $product_id ): string {
	$known = array( 'fruit-powder', 'leaf-powder', 'vegetable-powder', 'combos', 'tablet', 'tablets', 'dry-vegetable', 'dry-vegetables' );
	$terms = get_the_terms( $product_id, 'product_cat' );
	if ( $terms && ! is_wp_error( $terms ) ) {
		foreach ( $terms as $term ) {
			if ( in_array( $term->slug, $known, true ) ) {
				return vr_tone_for_slug( $term->slug );
			}
		}
	}
	return 'leaf';
}

/** Logo: custom logo if set, else the leaf mark + site name (same as the Next.js storefront). */
function vr_logo( bool $light = false ): string {
	$name = get_bloginfo( 'name' );
	if ( ! $light && has_custom_logo() ) {
		return get_custom_logo();
	}
	$bg   = $light ? '#fff' : 'var(--color-brand-600)';
	$leaf = $light ? 'var(--color-brand-600)' : '#fff';
	$vein = $light ? '#fff' : 'var(--color-brand-600)';
	$text = $light ? 'text-white' : 'text-brand-800';
	return '<a href="' . esc_url( home_url( '/' ) ) . '" class="inline-flex items-center gap-2 font-display" aria-label="' . esc_attr( sprintf( /* translators: %s site */ __( '%s — home', 'verdant-roots' ), $name ) ) . '">'
		. '<svg width="34" height="34" viewBox="0 0 34 34" aria-hidden="true"><rect width="34" height="34" rx="10" fill="' . $bg . '"/><path d="M9 24c0-8 4.500-13 15-13 0 9-5 14-13 14" fill="' . $leaf . '" opacity=".95"/><path d="M9 25c2.500-4 5.500-7 9-9" stroke="' . $vein . '" stroke-width="1.600" stroke-linecap="round" fill="none"/></svg>'
		. '<span class="whitespace-nowrap text-lg font-semibold leading-none tracking-tight sm:text-xl ' . $text . '">' . esc_html( $name ) . '</span></a>';
}

/** Search form markup (products). $id makes ids unique when used twice. */
function vr_search_form( string $id = 'header' ): string {
	$q = get_search_query();
	ob_start();
	?>
	<div class="vr-search relative w-full" data-search>
		<form role="search" method="get" action="<?php echo esc_url( home_url( '/' ) ); ?>" class="relative">
			<input type="hidden" name="post_type" value="product">
			<label for="vr-s-<?php echo esc_attr( $id ); ?>" class="sr-only"><?php esc_html_e( 'Search products', 'verdant-roots' ); ?></label>
			<?php vr_e_icon( 'search', 20, 'pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-soft' ); ?>
			<input id="vr-s-<?php echo esc_attr( $id ); ?>" type="search" name="s" value="<?php echo esc_attr( $q ); ?>" autocomplete="off" enterkeyhint="search" role="combobox" aria-expanded="false" aria-controls="vr-sl-<?php echo esc_attr( $id ); ?>" aria-autocomplete="list" placeholder="<?php esc_attr_e( 'Search for products, categories…', 'verdant-roots' ); ?>" class="w-full rounded-full border border-line bg-brand-50/60 py-3 pl-12 pr-24 text-[0.95rem] placeholder:text-ink-soft/70 focus:border-brand-500 focus:bg-white [&::-webkit-search-cancel-button]:hidden" data-search-input>
			<button type="button" hidden data-search-clear aria-label="<?php esc_attr_e( 'Clear search', 'verdant-roots' ); ?>" class="absolute right-14 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-full text-ink-soft hover:bg-brand-100"><?php vr_e_icon( 'close', 16 ); ?></button>
			<button type="submit" aria-label="<?php esc_attr_e( 'Search', 'verdant-roots' ); ?>" class="absolute right-1.5 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-brand-600 text-white hover:bg-brand-700"><?php vr_e_icon( 'search', 18 ); ?></button>
		</form>
		<div hidden data-search-panel class="vr-search-panel z-50 mt-2 overflow-hidden rounded-2xl border border-line bg-white shadow-lift">
			<ul id="vr-sl-<?php echo esc_attr( $id ); ?>" role="listbox" aria-label="<?php esc_attr_e( 'Search suggestions', 'verdant-roots' ); ?>" class="max-h-80 overflow-y-auto py-2" data-search-list></ul>
		</div>
	</div>
	<?php
	return ob_get_clean();
}

/** Native <details> accordion. $items: [ [title, html], … ] (html must already be safe). */
function vr_render_accordion( array $items, ?string $open = null ): void {
	echo '<div class="divide-y divide-line overflow-hidden rounded-card border border-line">';
	foreach ( $items as $i => [ $title, $html ] ) {
		echo '<details class="group bg-white"' . ( ( null !== $open && (string) $i === $open ) ? ' open' : '' ) . '><summary class="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 font-semibold hover:bg-brand-50 [&::-webkit-details-marker]:hidden"><h3 class="font-sans text-base font-semibold">' . esc_html( $title ) . '</h3>' . vr_icon( 'chevronDown', 18, 'shrink-0 transition-transform group-open:rotate-180' ) . '</summary><div class="px-5 pb-5">' . wp_kses_post( $html ) . '</div></details>'; // phpcs:ignore WordPress.Security.EscapeOutput -- icon is our own SVG.
	}
	echo '</div>';
}

/** FAQPage JSON-LD from [question, answer] pairs. */
function vr_faq_schema( array $pairs ): void {
	if ( ! $pairs ) {
		return;
	}
	$data = array( '@context' => 'https://schema.org', '@type' => 'FAQPage', 'mainEntity' => array_map( static fn( $p ) => array( '@type' => 'Question', 'name' => $p[0], 'acceptedAnswer' => array( '@type' => 'Answer', 'text' => $p[1] ) ), $pairs ) );
	echo '<script type="application/ld+json">' . wp_json_encode( $data, JSON_UNESCAPED_UNICODE | JSON_HEX_TAG ) . '</script>'; // phpcs:ignore WordPress.Security.EscapeOutput
}

/**
 * Price block for cards/menus. Simple products: sale price + struck MRP.
 * Variable products: the cheapest variation ("From ₹129 ₹160"), matching the
 * Next.js storefront which leads with the first pack size.
 */
function vr_card_price_html( WC_Product $product ): string {
	$regular = null;
	$price   = null;
	$from    = false;
	if ( $product->is_type( 'variable' ) ) {
		$from = count( $product->get_children() ) > 1;
		$min  = $product->get_variation_price( 'min', true );
		foreach ( $product->get_children() as $child_id ) {
			$child = wc_get_product( $child_id );
			if ( $child && $child->is_purchasable() && (float) wc_get_price_to_display( $child ) === (float) $min ) {
				$price   = (float) wc_get_price_to_display( $child );
				$regular = (float) wc_get_price_to_display( $child, array( 'price' => $child->get_regular_price() ) );
				break;
			}
		}
	} else {
		$price   = (float) wc_get_price_to_display( $product );
		$regular = (float) wc_get_price_to_display( $product, array( 'price' => $product->get_regular_price() ) );
	}
	if ( null === $price || '' === $product->get_price() ) {
		return wp_kses_post( $product->get_price_html() );
	}
	$html = '';
	if ( $from ) {
		$html .= '<span class="text-sm font-medium text-ink-soft">' . esc_html__( 'From', 'verdant-roots' ) . '</span> ';
	}
	$html .= '<span class="woocommerce-Price-amount amount">' . wp_kses_post( wc_price( $price ) ) . '</span>';
	if ( $regular && $regular > $price ) {
		$pct   = (int) round( ( $regular - $price ) / $regular * 100 );
		$html .= ' <del class="text-sm font-normal text-ink-soft" aria-hidden="false"><span class="sr-only">MRP </span>' . wp_kses_post( wc_price( $regular ) ) . '</del>';
		$html .= ' <span class="rounded-full bg-brand-100 px-2 py-0.5 text-xs font-bold text-brand-800">' . $pct . '% OFF</span>';
	}
	return $html;
}

/**
 * Categories for the hero slider: the slugs/names listed in Customizer (default: the five
 * storefront categories), falling back to the first top-level categories. Max 5.
 *
 * @return WP_Term[]
 */
function vr_hero_categories(): array {
	if ( ! taxonomy_exists( 'product_cat' ) ) {
		return array();
	}
	$wanted = array_filter( array_map( 'trim', explode( ',', (string) vr_opt( 'hero_cats', 'fruit-powder, leaf-powder, vegetable-powder, dry-vegetables, tablets' ) ) ) );
	$out    = array();
	foreach ( $wanted as $token ) {
		$term = get_term_by( 'slug', sanitize_title( $token ), 'product_cat' ) ?: get_term_by( 'name', $token, 'product_cat' );
		if ( $term && ! is_wp_error( $term ) && ! isset( $out[ $term->term_id ] ) ) {
			$out[ $term->term_id ] = $term;
		}
	}
	if ( count( $out ) < 2 ) {
		foreach ( vr_top_categories() as $term ) {
			$out[ $term->term_id ] = $term;
		}
	}
	return array_slice( array_values( $out ), 0, 5 );
}
