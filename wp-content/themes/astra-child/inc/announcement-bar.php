<?php
/**
 * Announcement bar: a one-line notice above the header, editable in the Customizer.
 *
 * Rendered on wp_body_open (core hook, fired by Astra's header), so no Astra
 * template is touched. Nothing is shown until text is entered.
 *
 * @package VerdantRootsChild
 */

defined( 'ABSPATH' ) || exit;

/**
 * Registers the Customizer section and settings.
 *
 * @param WP_Customize_Manager $wp_customize Customizer manager.
 */
function vrc_announcement_customize_register( WP_Customize_Manager $wp_customize ): void {
	$wp_customize->add_section(
		'vrc_announcement',
		array(
			'title'    => __( 'Announcement Bar', 'verdant-roots-child' ),
			'priority' => 30,
		)
	);

	$fields = array(
		'vrc_announcement_enabled'   => array(
			'label'    => __( 'Show announcement bar', 'verdant-roots-child' ),
			'type'     => 'checkbox',
			'default'  => true,
			'sanitize' => 'rest_sanitize_boolean',
		),
		'vrc_announcement_text'      => array(
			'label'    => __( 'Message', 'verdant-roots-child' ),
			'type'     => 'text',
			'default'  => '',
			'sanitize' => 'sanitize_text_field',
		),
		'vrc_announcement_link_text' => array(
			'label'    => __( 'Link text (optional)', 'verdant-roots-child' ),
			'type'     => 'text',
			'default'  => '',
			'sanitize' => 'sanitize_text_field',
		),
		'vrc_announcement_link_url'  => array(
			'label'    => __( 'Link URL (optional)', 'verdant-roots-child' ),
			'type'     => 'url',
			'default'  => '',
			'sanitize' => 'esc_url_raw',
		),
	);

	foreach ( $fields as $id => $field ) {
		$wp_customize->add_setting(
			$id,
			array(
				'default'           => $field['default'],
				'sanitize_callback' => $field['sanitize'],
			)
		);
		$wp_customize->add_control(
			$id,
			array(
				'section' => 'vrc_announcement',
				'label'   => $field['label'],
				'type'    => $field['type'],
			)
		);
	}
}
add_action( 'customize_register', 'vrc_announcement_customize_register' );

/**
 * Outputs the bar at the top of <body>.
 */
function vrc_announcement_render(): void {
	if ( ! get_theme_mod( 'vrc_announcement_enabled', true ) ) {
		return;
	}

	$text = (string) get_theme_mod( 'vrc_announcement_text', '' );
	if ( '' === $text ) {
		return;
	}

	$link_text = (string) get_theme_mod( 'vrc_announcement_link_text', '' );
	$link_url  = (string) get_theme_mod( 'vrc_announcement_link_url', '' );
	?>
	<div class="vrc-announcement" role="region" aria-label="<?php esc_attr_e( 'Announcement', 'verdant-roots-child' ); ?>">
		<p class="vrc-announcement-text">
			<?php echo esc_html( $text ); ?>
			<?php if ( '' !== $link_text && '' !== $link_url ) : ?>
				<a class="vrc-announcement-link" href="<?php echo esc_url( $link_url ); ?>"><?php echo esc_html( $link_text ); ?></a>
			<?php endif; ?>
		</p>
	</div>
	<?php
}
add_action( 'wp_body_open', 'vrc_announcement_render', 5 );
