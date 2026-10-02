<?php
/**
 * Bulk order enquiry form ([vr_bulk_order], page "Bulk Order") and the mobile-menu category tiles.
 *
 * The form emails the request to you AND saves it under "Bulk enquiries" in wp-admin (so a mail problem never loses a lead).
 * Protection: honeypot field, signed timestamp (too-fast submissions are dropped), 5 requests / hour / visitor, strict
 * server-side validation, nothing is ever echoed back unescaped. Recipient and request types are in Customize → Bulk order form.
 *
 * @package VerdantRoots
 */

defined( 'ABSPATH' ) || exit;

/* ------------------------------------------------------------------ data */

function vr_bulk_states(): array {
	return array( 'Andaman and Nicobar Islands', 'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chandigarh', 'Chhattisgarh', 'Dadra and Nagar Haveli and Daman and Diu', 'Delhi', 'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jammu and Kashmir', 'Jharkhand', 'Karnataka', 'Kerala', 'Ladakh', 'Lakshadweep', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Puducherry', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal' );
}

function vr_bulk_default_types(): string {
	return "Corporate gifting\nWedding / event\nFestival gifting\nRetail / shop\nRestaurant / café / catering\nPersonal bulk purchase\nOther";
}

/** Request types from the Customizer (one per line). */
function vr_bulk_types(): array {
	$lines = array_filter( array_map( 'trim', preg_split( '/\r\n|\r|\n/', (string) vr_opt( 'bulk_types', vr_bulk_default_types() ) ) ) );
	return array_values( array_unique( $lines ) );
}

/** Who gets the enquiry emails: the Customizer address, else the site admin email. */
function vr_bulk_recipient(): string {
	$to = sanitize_email( (string) vr_opt( 'bulk_email', '' ) );
	return $to && is_email( $to ) ? $to : (string) get_option( 'admin_email' );
}

/* ------------------------------------------------------------ Customizer */

add_action(
	'customize_register',
	static function ( WP_Customize_Manager $wp_customize ) {
		$wp_customize->add_section( 'vr_bulk', array( 'title' => __( 'Bulk order form', 'verdant-roots' ), 'priority' => 36, 'description' => __( 'Settings for the Bulk Order page. Every request is also saved in wp-admin → Bulk enquiries.', 'verdant-roots' ) ) );
		$wp_customize->add_setting( 'vr_bulk_email', array( 'default' => '', 'sanitize_callback' => 'sanitize_email' ) );
		$wp_customize->add_control( 'vr_bulk_email', array( 'label' => __( 'Send bulk enquiries to (empty = the site admin email)', 'verdant-roots' ), 'section' => 'vr_bulk', 'type' => 'email' ) );
		$wp_customize->add_setting( 'vr_bulk_types', array( 'default' => vr_bulk_default_types(), 'sanitize_callback' => 'sanitize_textarea_field' ) );
		$wp_customize->add_control( 'vr_bulk_types', array( 'label' => __( 'Event / requirement types (one per line)', 'verdant-roots' ), 'section' => 'vr_bulk', 'type' => 'textarea' ) );
		$wp_customize->add_setting( 'vr_menu_icons', array( 'default' => 'herbal-powder, superfood-powder, immunity-products, nutrition-products', 'sanitize_callback' => 'sanitize_text_field' ) );
		$wp_customize->add_control( 'vr_menu_icons', array( 'label' => __( 'Mobile menu: 4 category icons under the logo (comma-separated category slugs)', 'verdant-roots' ), 'section' => 'vr_bulk', 'type' => 'text' ) );
	}
);

/* --------------------------------------------------- mobile-menu tiles */

/** Up to 4 categories for the icon row in the mobile menu (Customizer slugs, topped up with the first top-level categories). */
function vr_menu_tile_cats(): array {
	if ( ! taxonomy_exists( 'product_cat' ) ) {
		return array();
	}
	$terms = array();
	foreach ( array_slice( array_filter( array_map( 'sanitize_title', explode( ',', (string) vr_opt( 'menu_icons', 'herbal-powder, superfood-powder, immunity-products, nutrition-products' ) ) ) ), 0, 4 ) as $slug ) {
		$t = get_term_by( 'slug', $slug, 'product_cat' );
		if ( $t instanceof WP_Term ) {
			$terms[ $t->term_id ] = $t;
		}
	}
	if ( count( $terms ) < 4 && function_exists( 'vr_top_categories' ) ) {
		foreach ( vr_top_categories() as $t ) {
			if ( count( $terms ) >= 4 ) {
				break;
			}
			$terms[ $t->term_id ] = $terms[ $t->term_id ] ?? $t;
		}
	}
	return array_values( $terms );
}

/* ---------------------------------------------------- enquiry storage */

add_action(
	'init',
	static function () {
		$cap = 'manage_options'; // customer details: administrators only.
		register_post_type(
			'vr_bulk_enquiry',
			array(
				'labels'          => array( 'name' => __( 'Bulk enquiries', 'verdant-roots' ), 'singular_name' => __( 'Bulk enquiry', 'verdant-roots' ), 'menu_name' => __( 'Bulk enquiries', 'verdant-roots' ), 'edit_item' => __( 'Bulk enquiry', 'verdant-roots' ), 'not_found' => __( 'No bulk enquiries yet.', 'verdant-roots' ) ),
				'public'          => false,
				'show_ui'         => true,
				'show_in_menu'    => true,
				'menu_icon'       => 'dashicons-clipboard',
				'menu_position'   => 26,
				'supports'        => array( 'title', 'editor' ),
				'map_meta_cap'    => true,
				'capabilities'    => array(
					'edit_post' => $cap, 'read_post' => $cap, 'delete_post' => $cap, 'edit_posts' => $cap, 'edit_others_posts' => $cap, 'delete_posts' => $cap, 'publish_posts' => $cap,
					'read_private_posts' => $cap, 'delete_private_posts' => $cap, 'delete_published_posts' => $cap, 'delete_others_posts' => $cap, 'edit_private_posts' => $cap, 'edit_published_posts' => $cap,
					'create_posts' => 'do_not_allow',
				),
			)
		);
	}
);

add_filter(
	'manage_vr_bulk_enquiry_posts_columns',
	static function ( array $cols ): array {
		return array( 'cb' => $cols['cb'] ?? '', 'title' => __( 'Business', 'verdant-roots' ), 'vr_contact' => __( 'Contact', 'verdant-roots' ), 'vr_need' => __( 'Needs', 'verdant-roots' ), 'date' => $cols['date'] ?? __( 'Received', 'verdant-roots' ) );
	}
);
add_action(
	'manage_vr_bulk_enquiry_posts_custom_column',
	static function ( string $col, int $id ) {
		if ( 'vr_contact' === $col ) {
			echo esc_html( get_post_meta( $id, '_vrb_contact', true ) ) . '<br>' . esc_html( get_post_meta( $id, '_vrb_mobile', true ) ) . '<br>' . esc_html( get_post_meta( $id, '_vrb_email', true ) ) . '<br><em>' . esc_html( sprintf( /* translators: %s WhatsApp/Email */ __( 'Prefers %s', 'verdant-roots' ), get_post_meta( $id, '_vrb_via', true ) ) ) . '</em>';
		} elseif ( 'vr_need' === $col ) {
			echo esc_html( get_post_meta( $id, '_vrb_type', true ) ) . '<br>' . esc_html( get_post_meta( $id, '_vrb_qty', true ) ) . '<br>' . esc_html( sprintf( /* translators: %s date */ __( 'Needed by %s', 'verdant-roots' ), get_post_meta( $id, '_vrb_date', true ) ) );
		}
	},
	10,
	2
);

/* ------------------------------------------------------------ validation */

/**
 * Validate a submission (already unslashed).
 *
 * @return array{0:array<string,string>,1:array<string,string>} [clean values, errors by field]
 */
function vr_bulk_validate( array $in ): array {
	$s    = static fn( string $k, int $max ): string => mb_substr( trim( sanitize_text_field( (string) ( $in[ $k ] ?? '' ) ) ), 0, $max );
	$c    = array(
		'business' => $s( 'business', 120 ),
		'contact'  => $s( 'contact', 100 ),
		'mobile'   => '',
		'email'    => sanitize_email( (string) ( $in['email'] ?? '' ) ),
		'state'    => $s( 'state', 60 ),
		'city'     => $s( 'city', 80 ),
		'type'     => $s( 'type', 80 ),
		'qty'      => $s( 'qty', 60 ),
		'date'     => $s( 'date', 10 ),
		'details'  => mb_substr( trim( sanitize_textarea_field( (string) ( $in['details'] ?? '' ) ) ), 0, 2000 ),
		'via'      => $s( 'via', 10 ),
	);
	$err  = array();
	$need = __( 'This field is required.', 'verdant-roots' );

	foreach ( array( 'business', 'contact' ) as $k ) {
		if ( '' === $c[ $k ] ) {
			$err[ $k ] = $need;
		}
	}
	// Indian mobile number: accept +91 / 91 / 0 prefixes, spaces and dashes.
	$digits = preg_replace( '/\D+/', '', (string) ( $in['mobile'] ?? '' ) );
	if ( 12 === strlen( $digits ) && str_starts_with( $digits, '91' ) ) {
		$digits = substr( $digits, 2 );
	} elseif ( 11 === strlen( $digits ) && str_starts_with( $digits, '0' ) ) {
		$digits = substr( $digits, 1 );
	}
	if ( '' === $digits ) {
		$err['mobile'] = $need;
	} elseif ( ! preg_match( '/^[6-9]\d{9}$/', $digits ) ) {
		$err['mobile'] = __( 'Enter a valid 10-digit mobile number.', 'verdant-roots' );
	} else {
		$c['mobile'] = '+91 ' . $digits;
	}
	if ( '' === $c['email'] ) {
		$err['email'] = '' === trim( (string) ( $in['email'] ?? '' ) ) ? $need : __( 'Enter a valid email address.', 'verdant-roots' );
	} elseif ( ! is_email( $c['email'] ) ) {
		$err['email'] = __( 'Enter a valid email address.', 'verdant-roots' );
	}
	if ( '' !== $c['state'] && ! in_array( $c['state'], vr_bulk_states(), true ) ) {
		$err['state'] = __( 'Please choose a state from the list.', 'verdant-roots' );
	}
	if ( '' === $c['type'] ) {
		$err['type'] = $need;
	} elseif ( ! in_array( $c['type'], vr_bulk_types(), true ) ) {
		$err['type'] = __( 'Please choose a type from the list.', 'verdant-roots' );
	}
	if ( '' === $c['qty'] ) {
		$err['qty'] = $need;
	} elseif ( ! preg_match( '/\d/', $c['qty'] ) ) {
		$err['qty'] = __( 'Include a number, for example 50 or 25 kg.', 'verdant-roots' );
	}
	$d = '' === $c['date'] ? false : date_create_immutable( $c['date'] . ' 00:00:00', wp_timezone() );
	if ( '' === $c['date'] ) {
		$err['date'] = $need;
	} elseif ( ! $d || $d->format( 'Y-m-d' ) !== $c['date'] ) {
		$err['date'] = __( 'Enter a valid date.', 'verdant-roots' );
	} elseif ( $c['date'] < wp_date( 'Y-m-d' ) ) {
		$err['date'] = __( 'The required date cannot be in the past.', 'verdant-roots' );
	} elseif ( $d->getTimestamp() > time() + 2 * YEAR_IN_SECONDS ) {
		$err['date'] = __( 'Please choose a date within the next two years.', 'verdant-roots' );
	}
	if ( ! in_array( $c['via'], array( 'whatsapp', 'email' ), true ) ) {
		$err['via'] = __( 'Please choose how we should contact you.', 'verdant-roots' );
	}
	return array( $c, $err );
}

/** Signed timestamp for the form: submissions faster than 3 s after the page was built are treated as bots. */
function vr_bulk_token(): string {
	$ts = (string) time();
	return $ts . '.' . wp_hash( 'vr_bulk' . $ts );
}
function vr_bulk_token_ok( string $token ): bool {
	[ $ts, $hash ] = array_pad( explode( '.', $token, 2 ), 2, '' );
	return ctype_digit( $ts ) && hash_equals( wp_hash( 'vr_bulk' . $ts ), $hash ) && ( time() - (int) $ts ) >= 3;
}

/** 5 enquiries per hour per visitor. */
function vr_bulk_rate_ok(): bool {
	$key = 'vr_bulk_rl_' . md5( (string) ( $_SERVER['REMOTE_ADDR'] ?? 'x' ) ); // phpcs:ignore WordPress.Security.ValidatedSanitizedInput
	$n   = (int) get_transient( $key );
	if ( $n >= 5 ) {
		return false;
	}
	set_transient( $key, $n + 1, HOUR_IN_SECONDS );
	return true;
}

/* --------------------------------------------------------------- handler */

function vr_bulk_handle(): void {
	$json = false !== stripos( (string) ( $_SERVER['HTTP_ACCEPT'] ?? '' ), 'application/json' ); // phpcs:ignore WordPress.Security.ValidatedSanitizedInput
	$back = wp_get_referer() ?: home_url( '/' );
	$reply = static function ( bool $ok, string $message, array $errors = array(), int $status = 200 ) use ( $json, $back ) {
		if ( $json ) {
			wp_send_json( array( 'ok' => $ok, 'message' => $message, 'errors' => (object) $errors ), $status );
		}
		wp_safe_redirect( add_query_arg( 'vr_bulk', $ok ? 'ok' : 'err', remove_query_arg( 'vr_bulk', $back ) ) . '#bulk-form' );
		exit;
	};

	$in = wp_unslash( $_POST ); // phpcs:ignore WordPress.Security.NonceVerification -- public form: honeypot + signed timestamp + rate limit instead (a nonce would expire on cached pages).
	$f  = array();
	foreach ( array( 'business', 'contact', 'mobile', 'email', 'state', 'city', 'type', 'qty', 'date', 'details', 'via' ) as $k ) {
		$f[ $k ] = is_scalar( $in[ "vrb_$k" ] ?? '' ) ? (string) $in[ "vrb_$k" ] : '';
	}
	if ( '' !== trim( (string) ( $in['vrb_website'] ?? '' ) ) ) {
		$reply( true, __( 'Thank you!', 'verdant-roots' ) ); // honeypot: pretend success, store nothing.
	}
	if ( ! vr_bulk_token_ok( (string) ( $in['vrb_ts'] ?? '' ) ) ) {
		$reply( false, __( 'Please wait a moment, then press the button again.', 'verdant-roots' ), array(), 400 );
	}
	[ $c, $errors ] = vr_bulk_validate( $f );
	if ( $errors ) {
		$reply( false, __( 'Please check the highlighted fields.', 'verdant-roots' ), $errors, 422 );
	}
	if ( ! vr_bulk_rate_ok() ) {
		$reply( false, __( 'Too many requests from this device. Please try again in an hour.', 'verdant-roots' ), array(), 429 );
	}

	$via   = 'whatsapp' === $c['via'] ? 'WhatsApp' : 'Email';
	$lines = array(
		'Business'          => $c['business'],
		'Contact person'    => $c['contact'],
		'Mobile'            => $c['mobile'],
		'Email'             => $c['email'],
		'State / City'      => trim( $c['state'] . ' / ' . $c['city'], ' /' ),
		'Requirement type'  => $c['type'],
		'Approx. quantity'  => $c['qty'],
		'Required by'       => $c['date'],
		'Prefers contact on' => $via,
		'Details'           => $c['details'],
	);
	$body = '';
	foreach ( $lines as $label => $value ) {
		$body .= $label . ': ' . ( '' === $value ? '-' : $value ) . "\n";
	}

	$id = wp_insert_post( array( 'post_type' => 'vr_bulk_enquiry', 'post_status' => 'publish', 'post_title' => wp_strip_all_tags( $c['business'] . ' — ' . $c['qty'] . ' — ' . $c['date'] ), 'post_content' => $body ), true );
	if ( ! is_wp_error( $id ) ) {
		foreach ( array( 'contact', 'mobile', 'email', 'type', 'qty', 'date' ) as $k ) {
			update_post_meta( $id, '_vrb_' . $k, $c[ $k ] );
		}
		update_post_meta( $id, '_vrb_via', $via );
	}
	$sent = wp_mail( vr_bulk_recipient(), sprintf( '[%s] Bulk order request: %s', wp_specialchars_decode( get_bloginfo( 'name' ), ENT_QUOTES ), $c['business'] ), $body, array( 'Reply-To: ' . $c['email'] ) );
	if ( is_wp_error( $id ) && ! $sent ) {
		$reply( false, __( 'Sorry, we could not send your request. Please try again or contact us directly.', 'verdant-roots' ), array(), 500 );
	}
	$reply( true, 'whatsapp' === $c['via'] ? __( 'Thank you! We have received your request and will contact you on WhatsApp.', 'verdant-roots' ) : __( 'Thank you! We have received your request and will reply to your email.', 'verdant-roots' ) );
}
add_action( 'admin_post_nopriv_vr_bulk_order', 'vr_bulk_handle' );
add_action( 'admin_post_vr_bulk_order', 'vr_bulk_handle' );

/* --------------------------------------------------------- page + shortcode */

/** Create the "Bulk Order" page once (admin only), so the menu link works straight after the theme update. */
add_action(
	'admin_init',
	static function () {
		if ( get_option( 'vr_bulk_page_created' ) || ! current_user_can( 'publish_pages' ) ) {
			return;
		}
		if ( ! get_page_by_path( 'bulk-order' ) ) {
			wp_insert_post( array( 'post_type' => 'page', 'post_status' => 'publish', 'post_name' => 'bulk-order', 'post_title' => 'Bulk Order', 'post_content' => '[vr_bulk_order]' ) );
		}
		update_option( 'vr_bulk_page_created', 1, false );
	}
);

add_shortcode( 'vr_bulk_order', 'vr_bulk_form_html' );

function vr_bulk_form_html(): string {
	$status = isset( $_GET['vr_bulk'] ) ? sanitize_key( wp_unslash( $_GET['vr_bulk'] ) ) : ''; // phpcs:ignore WordPress.Security.NonceVerification
	$field  = static function ( string $name, string $label, string $inner, bool $req = false ): string {
		return '<div class="vr-bf-field" data-field="' . esc_attr( $name ) . '"><label class="vr-bf-label" for="vrb_' . esc_attr( $name ) . '">' . esc_html( $label ) . ( $req ? '<span aria-hidden="true">*</span>' : '' ) . '</label>' . $inner . '<p class="vr-bf-err" id="vrb_' . esc_attr( $name ) . '_err" role="alert" hidden></p></div>';
	};
	$input  = static fn( string $name, string $type, string $ph, bool $req, string $extra = '' ): string => '<input class="vr-bf-input" id="vrb_' . esc_attr( $name ) . '" name="vrb_' . esc_attr( $name ) . '" type="' . esc_attr( $type ) . '" placeholder="' . esc_attr( $ph ) . '"' . ( $req ? ' required' : '' ) . ' ' . $extra . '>';
	$select = static function ( string $name, string $ph, array $opts, bool $req ): string {
		$h = '<select class="vr-bf-input" id="vrb_' . esc_attr( $name ) . '" name="vrb_' . esc_attr( $name ) . '"' . ( $req ? ' required' : '' ) . '><option value="">' . esc_html( $ph ) . '</option>';
		foreach ( $opts as $o ) {
			$h .= '<option value="' . esc_attr( $o ) . '">' . esc_html( $o ) . '</option>';
		}
		return $h . '</select>';
	};
	$step = static fn( int $n, string $t ): string => '<h2 class="vr-bf-step"><span class="vr-bf-num" aria-hidden="true">' . $n . '</span>' . esc_html( $t ) . '</h2>';

	ob_start();
	?>
	<div class="vr-bf" id="bulk-form" data-bulk>
		<?php if ( 'ok' === $status ) : ?><p class="vr-bf-note vr-bf-note--ok" role="status"><?php esc_html_e( 'Thank you! We have received your bulk order request.', 'verdant-roots' ); ?></p><?php elseif ( 'err' === $status ) : ?><p class="vr-bf-note vr-bf-note--err" role="alert"><?php esc_html_e( 'Please check the required fields and try again.', 'verdant-roots' ); ?></p><?php endif; ?>
		<div class="vr-bf-done" data-bulk-done hidden role="status" tabindex="-1"><span class="vr-bf-tick" aria-hidden="true">✓</span><p data-bulk-done-text></p></div>
		<form class="vr-bf-form" data-bulk-form method="post" action="<?php echo esc_url( admin_url( 'admin-post.php' ) ); ?>" novalidate>
			<input type="hidden" name="action" value="vr_bulk_order">
			<input type="hidden" name="vrb_ts" value="<?php echo esc_attr( vr_bulk_token() ); ?>">
			<div class="vr-bf-hp" aria-hidden="true"><label>Website<input type="text" name="vrb_website" tabindex="-1" autocomplete="off"></label></div>

			<section class="vr-bf-card">
				<?php echo $step( 1, __( 'Tell us about your business', 'verdant-roots' ) ); // phpcs:ignore WordPress.Security.EscapeOutput ?>
				<?php
				echo $field( 'business', __( 'Business Name', 'verdant-roots' ), $input( 'business', 'text', __( 'Enter Business Name', 'verdant-roots' ), true, 'autocomplete="organization" maxlength="120"' ), true ); // phpcs:ignore WordPress.Security.EscapeOutput
				echo $field( 'contact', __( 'Contact Person Name', 'verdant-roots' ), $input( 'contact', 'text', __( 'Enter Full Name of Contact Person', 'verdant-roots' ), true, 'autocomplete="name" maxlength="100"' ), true ); // phpcs:ignore WordPress.Security.EscapeOutput
				echo $field( 'mobile', __( 'Mobile Number', 'verdant-roots' ), '<div class="vr-bf-phone"><span class="vr-bf-cc" aria-hidden="true">+91</span>' . $input( 'mobile', 'tel', __( 'Enter Mobile Number', 'verdant-roots' ), true, 'inputmode="numeric" autocomplete="tel-national" maxlength="14" aria-label="' . esc_attr__( 'Mobile number (India, +91)', 'verdant-roots' ) . '"' ) . '</div>', true ); // phpcs:ignore WordPress.Security.EscapeOutput
				echo $field( 'email', __( 'Email Address', 'verdant-roots' ), $input( 'email', 'email', __( 'Enter Email Address', 'verdant-roots' ), true, 'autocomplete="email" maxlength="120"' ), true ); // phpcs:ignore WordPress.Security.EscapeOutput
				?>
				<div class="vr-bf-row">
					<?php
					echo $field( 'state', __( 'State', 'verdant-roots' ), $select( 'state', __( 'Select State', 'verdant-roots' ), vr_bulk_states(), false ) ); // phpcs:ignore WordPress.Security.EscapeOutput
					echo $field( 'city', __( 'City', 'verdant-roots' ), $input( 'city', 'text', __( 'Enter City', 'verdant-roots' ), false, 'autocomplete="address-level2" maxlength="80"' ) ); // phpcs:ignore WordPress.Security.EscapeOutput
					?>
				</div>
			</section>

			<section class="vr-bf-card">
				<?php echo $step( 2, __( 'What do you need?', 'verdant-roots' ) ); // phpcs:ignore WordPress.Security.EscapeOutput ?>
				<?php echo $field( 'type', __( 'Event / Requirement Type', 'verdant-roots' ), $select( 'type', __( 'Select Type', 'verdant-roots' ), vr_bulk_types(), true ), true ); // phpcs:ignore WordPress.Security.EscapeOutput ?>
				<div class="vr-bf-row">
					<?php
					echo $field( 'qty', __( 'Approximate Quantity', 'verdant-roots' ), $input( 'qty', 'text', __( 'e.g. 50 packs or 25 kg', 'verdant-roots' ), true, 'maxlength="60"' ), true ); // phpcs:ignore WordPress.Security.EscapeOutput
					echo $field( 'date', __( 'Required Date', 'verdant-roots' ), $input( 'date', 'date', __( 'Select Date', 'verdant-roots' ), true, 'min="' . esc_attr( wp_date( 'Y-m-d' ) ) . '"' ), true ); // phpcs:ignore WordPress.Security.EscapeOutput
					?>
				</div>
				<?php echo $field( 'details', __( 'Requirement Details', 'verdant-roots' ), '<textarea class="vr-bf-input vr-bf-area" id="vrb_details" name="vrb_details" rows="4" maxlength="2000" placeholder="' . esc_attr__( 'Tell us more about your requirement', 'verdant-roots' ) . '"></textarea>' ); // phpcs:ignore WordPress.Security.EscapeOutput ?>
			</section>

			<section class="vr-bf-card">
				<?php echo $step( 3, __( 'How should we connect with you?', 'verdant-roots' ) ); // phpcs:ignore WordPress.Security.EscapeOutput ?>
				<fieldset class="vr-bf-via" data-field="via">
					<legend class="sr-only"><?php esc_html_e( 'Preferred way to contact you', 'verdant-roots' ); ?></legend>
					<label class="vr-bf-opt"><input type="radio" name="vrb_via" value="whatsapp" checked><span class="vr-bf-opt-body"><?php vr_e_icon( 'phone', 22 ); ?><span><strong><?php esc_html_e( 'WhatsApp', 'verdant-roots' ); ?></strong><small><?php esc_html_e( 'Quick updates & easy chat.', 'verdant-roots' ); ?></small></span></span></label>
					<label class="vr-bf-opt"><input type="radio" name="vrb_via" value="email"><span class="vr-bf-opt-body"><?php vr_e_icon( 'mail', 22 ); ?><span><strong><?php esc_html_e( 'Email', 'verdant-roots' ); ?></strong><small><?php esc_html_e( 'Share details over email.', 'verdant-roots' ); ?></small></span></span></label>
					<p class="vr-bf-err" id="vrb_via_err" role="alert" hidden></p>
				</fieldset>
			</section>

			<p class="vr-bf-fine"><?php esc_html_e( 'We use these details only to reply to your request.', 'verdant-roots' ); ?></p>
			<p class="vr-bf-err vr-bf-err--form" data-bulk-error role="alert" hidden></p>
			<button type="submit" class="vr-bf-submit" data-bulk-submit><?php vr_e_icon( 'send', 20 ); ?> <span><?php esc_html_e( 'GET BULK QUOTE', 'verdant-roots' ); ?></span></button>
		</form>
	</div>
	<?php
	return (string) ob_get_clean();
}
