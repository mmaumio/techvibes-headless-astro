<?php
/**
 * Plugin Name:       TechVibes Contact Endpoint
 * Description:       Receives contact form enquiries from the TechVibes Astro website and emails them using this WordPress site's mail setup. Keeps a copy of every enquiry in the admin.
 * Version:           1.0.0
 * Requires at least: 6.0
 * Requires PHP:      7.4
 * Author:            TechVibes IT Ltd
 * License:           GPL-2.0-or-later
 * Text Domain:       techvibes-contact
 */

defined( 'ABSPATH' ) || exit;

final class TechVibes_Contact_Endpoint {

	const OPT_KEY       = 'tvce_api_key';
	const OPT_TO        = 'tvce_recipient';
	const OPT_FROM      = 'tvce_from_email';
	const POST_TYPE     = 'tv_enquiry';
	const RATE_LIMIT    = 5;   // enquiries per visitor...
	const RATE_WINDOW   = 600; // ...per 10 minutes
	const MAX_FIELD_LEN = 5000;

	public static function init() {
		add_action( 'init', array( __CLASS__, 'register_post_type' ) );
		add_action( 'rest_api_init', array( __CLASS__, 'register_route' ) );
		add_action( 'admin_menu', array( __CLASS__, 'admin_menu' ) );
		add_action( 'admin_post_tvce_save', array( __CLASS__, 'handle_save' ) );
		add_action( 'admin_post_tvce_test', array( __CLASS__, 'handle_test' ) );
		add_action( 'admin_post_tvce_regenerate', array( __CLASS__, 'handle_regenerate' ) );
		add_filter( 'manage_' . self::POST_TYPE . '_posts_columns', array( __CLASS__, 'columns' ) );
		add_action( 'manage_' . self::POST_TYPE . '_posts_custom_column', array( __CLASS__, 'column_content' ), 10, 2 );
		add_filter( 'plugin_action_links_' . plugin_basename( __FILE__ ), array( __CLASS__, 'action_links' ) );
	}

	/* ---------------------------------------------------------------------
	 * Settings
	 * ------------------------------------------------------------------- */

	public static function activate() {
		if ( ! get_option( self::OPT_KEY ) ) {
			update_option( self::OPT_KEY, self::new_key(), false );
		}
		if ( ! get_option( self::OPT_TO ) ) {
			update_option( self::OPT_TO, get_option( 'admin_email' ), false );
		}
		self::register_post_type();
	}

	private static function new_key() {
		return wp_generate_password( 48, false, false );
	}

	private static function api_key() {
		return defined( 'TECHVIBES_CONTACT_KEY' ) ? TECHVIBES_CONTACT_KEY : (string) get_option( self::OPT_KEY, '' );
	}

	private static function recipient() {
		$to = (string) get_option( self::OPT_TO, '' );
		return is_email( $to ) ? $to : get_option( 'admin_email' );
	}

	private static function from_email() {
		$from = (string) get_option( self::OPT_FROM, '' );
		if ( is_email( $from ) ) {
			return $from;
		}
		// Hostinger (and most hosts) only deliver mail "from" a real mailbox on
		// the site's domain, so default to the recipient when it is on that domain.
		$to        = self::recipient();
		$site_host = wp_parse_url( home_url(), PHP_URL_HOST );
		$site_host = preg_replace( '/^(www|cms)\./', '', (string) $site_host );
		if ( $site_host && substr( strtolower( $to ), -strlen( '@' . $site_host ) ) === strtolower( '@' . $site_host ) ) {
			return $to;
		}
		return '';
	}

	/* ---------------------------------------------------------------------
	 * Enquiry storage (a private admin-only list, so nothing is ever lost)
	 * ------------------------------------------------------------------- */

	public static function register_post_type() {
		register_post_type(
			self::POST_TYPE,
			array(
				'labels'              => array(
					'name'          => __( 'Enquiries', 'techvibes-contact' ),
					'singular_name' => __( 'Enquiry', 'techvibes-contact' ),
					'menu_name'     => __( 'Enquiries', 'techvibes-contact' ),
					'all_items'     => __( 'All enquiries', 'techvibes-contact' ),
					'edit_item'     => __( 'Enquiry', 'techvibes-contact' ),
					'search_items'  => __( 'Search enquiries', 'techvibes-contact' ),
					'not_found'     => __( 'No enquiries yet.', 'techvibes-contact' ),
				),
				'public'              => false,
				'show_ui'             => true,
				'show_in_menu'        => true,
				'show_in_rest'        => false,
				'exclude_from_search' => true,
				'publicly_queryable'  => false,
				'menu_icon'           => 'dashicons-email-alt',
				'menu_position'       => 26,
				'supports'            => array( 'title', 'editor' ),
				'capability_type'     => 'post',
				'capabilities'        => array( 'create_posts' => 'do_not_allow' ),
				'map_meta_cap'        => true,
			)
		);
	}

	public static function columns( $columns ) {
		return array(
			'cb'        => $columns['cb'],
			'title'     => __( 'Enquiry', 'techvibes-contact' ),
			'tv_email'  => __( 'Email', 'techvibes-contact' ),
			'tv_mailed' => __( 'Email sent', 'techvibes-contact' ),
			'date'      => $columns['date'],
		);
	}

	public static function column_content( $column, $post_id ) {
		if ( 'tv_email' === $column ) {
			$email = get_post_meta( $post_id, '_tv_email', true );
			echo $email ? '<a href="mailto:' . esc_attr( $email ) . '">' . esc_html( $email ) . '</a>' : '';
		}
		if ( 'tv_mailed' === $column ) {
			echo get_post_meta( $post_id, '_tv_mailed', true ) ? esc_html__( 'Yes', 'techvibes-contact' ) : '<strong style="color:#b32d2e">' . esc_html__( 'No', 'techvibes-contact' ) . '</strong>';
		}
	}

	/* ---------------------------------------------------------------------
	 * REST endpoint: POST /wp-json/techvibes/v1/contact
	 * ------------------------------------------------------------------- */

	public static function register_route() {
		register_rest_route(
			'techvibes/v1',
			'/contact',
			array(
				array(
					'methods'             => 'POST',
					'callback'            => array( __CLASS__, 'handle_enquiry' ),
					'permission_callback' => array( __CLASS__, 'check_key' ),
				),
				array(
					// Lets the website confirm the plugin is installed and the key matches.
					'methods'             => 'GET',
					'callback'            => array( __CLASS__, 'handle_ping' ),
					'permission_callback' => array( __CLASS__, 'check_key' ),
				),
			)
		);
	}

	public static function check_key( WP_REST_Request $request ) {
		$expected = self::api_key();
		$given    = (string) $request->get_header( 'x_techvibes_key' );
		if ( '' === $expected || '' === $given || ! hash_equals( $expected, $given ) ) {
			return new WP_Error( 'tvce_forbidden', 'Invalid or missing key.', array( 'status' => 401 ) );
		}
		return true;
	}

	public static function handle_ping() {
		return rest_ensure_response(
			array(
				'ok'        => true,
				'plugin'    => '1.0.0',
				'recipient' => self::mask_email( self::recipient() ),
			)
		);
	}

	private static function mask_email( $email ) {
		$parts = explode( '@', (string) $email );
		return 2 === count( $parts ) ? substr( $parts[0], 0, 1 ) . '***@' . $parts[1] : '';
	}

	public static function handle_enquiry( WP_REST_Request $request ) {
		$body = $request->get_json_params();
		if ( ! is_array( $body ) ) {
			return new WP_Error( 'tvce_bad_request', 'Expected a JSON body.', array( 'status' => 400 ) );
		}

		$text  = function ( $key ) use ( $body ) {
			$value = isset( $body[ $key ] ) && is_scalar( $body[ $key ] ) ? (string) $body[ $key ] : '';
			return trim( sanitize_text_field( $value ) );
		};
		$data  = array(
			'firstName'    => $text( 'firstName' ),
			'lastName'     => $text( 'lastName' ),
			'email'        => sanitize_email( isset( $body['email'] ) ? (string) $body['email'] : '' ),
			'phone'        => $text( 'phone' ),
			'service'      => $text( 'service' ),
			'budget'       => $text( 'budget' ),
			'requirements' => trim( sanitize_textarea_field( isset( $body['requirements'] ) ? (string) $body['requirements'] : '' ) ),
			'page'         => esc_url_raw( isset( $body['page'] ) ? (string) $body['page'] : '' ),
		);

		if ( '' === $data['firstName'] || '' === $data['lastName'] || ! is_email( $data['email'] ) ) {
			return new WP_Error( 'tvce_invalid', 'Please fill in your name and a valid email address.', array( 'status' => 422 ) );
		}
		foreach ( $data as $value ) {
			if ( strlen( $value ) > self::MAX_FIELD_LEN ) {
				return new WP_Error( 'tvce_too_long', 'Message too long.', array( 'status' => 422 ) );
			}
		}

		// Simple flood protection per visitor (the website forwards the visitor's IP).
		$ip = (string) $request->get_header( 'x_visitor_ip' );
		if ( $ip ) {
			$bucket = 'tvce_rl_' . md5( $ip );
			$count  = (int) get_transient( $bucket );
			if ( $count >= self::RATE_LIMIT ) {
				return new WP_Error( 'tvce_rate_limited', 'Too many enquiries, please try again later.', array( 'status' => 429 ) );
			}
			set_transient( $bucket, $count + 1, self::RATE_WINDOW );
		}

		$name    = $data['firstName'] . ' ' . $data['lastName'];
		$subject = sprintf( 'New enquiry: %s%s', $name, $data['service'] ? ' (' . $data['service'] . ')' : '' );

		$rows = array(
			'Name'    => $name,
			'Email'   => $data['email'],
			'Phone'   => $data['phone'],
			'Service' => $data['service'],
			'Budget'  => $data['budget'],
			'Page'    => $data['page'],
		);
		$lines = array();
		foreach ( $rows as $label => $value ) {
			if ( '' !== $value ) {
				$lines[] = $label . ': ' . $value;
			}
		}
		$plain = "New enquiry from the TechVibes website\n\n" . implode( "\n", $lines );
		if ( '' !== $data['requirements'] ) {
			$plain .= "\n\nRequirements:\n" . $data['requirements'];
		}

		// Keep a copy first, so the enquiry is safe even if email fails.
		$post_id = wp_insert_post(
			array(
				'post_type'    => self::POST_TYPE,
				'post_status'  => 'private',
				'post_title'   => $subject,
				'post_content' => $plain,
			),
			true
		);
		if ( ! is_wp_error( $post_id ) ) {
			update_post_meta( $post_id, '_tv_email', $data['email'] );
		}

		$sent = self::send( $subject, $plain, $data['email'], $name );

		if ( ! is_wp_error( $post_id ) ) {
			update_post_meta( $post_id, '_tv_mailed', $sent ? 1 : 0 );
		}

		if ( ! $sent ) {
			$error = get_transient( 'tvce_last_mail_error' );
			return new WP_Error(
				'tvce_mail_failed',
				'WordPress could not send the email' . ( $error ? ': ' . $error : '.' ) . ' The enquiry was saved under Enquiries in WordPress.',
				array( 'status' => 502 )
			);
		}

		return rest_ensure_response( array( 'ok' => true ) );
	}

	/** Send via wp_mail(), so any SMTP plugin (e.g. WP Mail SMTP) is used automatically. */
	private static function send( $subject, $plain, $reply_email = '', $reply_name = '' ) {
		$headers = array( 'Content-Type: text/plain; charset=UTF-8' );
		$from    = self::from_email();
		if ( $from ) {
			$headers[] = 'From: TechVibes Website <' . $from . '>';
		}
		if ( $reply_email ) {
			$reply_name = str_replace( array( '"', "\r", "\n" ), '', $reply_name );
			$headers[]  = 'Reply-To: "' . $reply_name . '" <' . $reply_email . '>';
		}

		delete_transient( 'tvce_last_mail_error' );
		$capture = function ( $error ) {
			if ( is_wp_error( $error ) ) {
				set_transient( 'tvce_last_mail_error', $error->get_error_message(), 300 );
			}
		};
		add_action( 'wp_mail_failed', $capture );
		$sent = wp_mail( self::recipient(), $subject, $plain, $headers );
		remove_action( 'wp_mail_failed', $capture );

		return (bool) $sent;
	}

	/* ---------------------------------------------------------------------
	 * Admin: Settings > TechVibes Contact
	 * ------------------------------------------------------------------- */

	public static function admin_menu() {
		add_options_page( 'TechVibes Contact', 'TechVibes Contact', 'manage_options', 'techvibes-contact', array( __CLASS__, 'settings_page' ) );
	}

	public static function action_links( $links ) {
		array_unshift( $links, '<a href="' . esc_url( admin_url( 'options-general.php?page=techvibes-contact' ) ) . '">' . esc_html__( 'Settings', 'techvibes-contact' ) . '</a>' );
		return $links;
	}

	public static function settings_page() {
		if ( ! current_user_can( 'manage_options' ) ) {
			return;
		}
		$endpoint = rest_url( 'techvibes/v1/contact' );
		$notice   = isset( $_GET['tvce'] ) ? sanitize_key( wp_unslash( $_GET['tvce'] ) ) : '';
		?>
		<div class="wrap">
			<h1>TechVibes Contact</h1>

			<?php if ( 'saved' === $notice ) : ?>
				<div class="notice notice-success is-dismissible"><p>Settings saved.</p></div>
			<?php elseif ( 'sent' === $notice ) : ?>
				<div class="notice notice-success is-dismissible"><p>Test email sent to <?php echo esc_html( self::recipient() ); ?>. Check that inbox (and spam).</p></div>
			<?php elseif ( 'failed' === $notice ) : ?>
				<div class="notice notice-error is-dismissible"><p>The test email could not be sent<?php $e = get_transient( 'tvce_last_mail_error' ); echo $e ? ': ' . esc_html( $e ) : '.'; ?> Install and configure <strong>WP Mail SMTP</strong> with your Hostinger mailbox, then try again.</p></div>
			<?php elseif ( 'regenerated' === $notice ) : ?>
				<div class="notice notice-warning is-dismissible"><p>New key created. Update <code>CONTACT_KEY</code> in Cloudflare, otherwise the website form will stop working.</p></div>
			<?php endif; ?>

			<h2>Connect the website</h2>
			<p>Add these two runtime variables to the Cloudflare Worker <strong>techvibes-headless-astro</strong> (Settings &rarr; Variables and Secrets):</p>
			<table class="form-table" role="presentation">
				<tr>
					<th scope="row"><code>CONTACT_KEY</code> <em>(Secret)</em></th>
					<td>
						<?php if ( defined( 'TECHVIBES_CONTACT_KEY' ) ) : ?>
							<p>Set in <code>wp-config.php</code> (<code>TECHVIBES_CONTACT_KEY</code>).</p>
						<?php else : ?>
							<input type="text" class="large-text code" readonly value="<?php echo esc_attr( self::api_key() ); ?>" onclick="this.select()">
							<p class="description">Click to select, then copy. Treat it like a password.</p>
						<?php endif; ?>
					</td>
				</tr>
				<tr>
					<th scope="row"><code>WP_CONTACT_URL</code> <em>(Text)</em></th>
					<td>
						<input type="text" class="large-text code" readonly value="<?php echo esc_attr( $endpoint ); ?>" onclick="this.select()">
						<p class="description">Only needed if WordPress is not at https://techvibesit.com (for example after moving it to cms.techvibesit.com).</p>
					</td>
				</tr>
			</table>

			<h2>Email</h2>
			<form method="post" action="<?php echo esc_url( admin_url( 'admin-post.php' ) ); ?>">
				<?php wp_nonce_field( 'tvce_save' ); ?>
				<input type="hidden" name="action" value="tvce_save">
				<table class="form-table" role="presentation">
					<tr>
						<th scope="row"><label for="tvce_to">Send enquiries to</label></th>
						<td><input name="tvce_to" id="tvce_to" type="email" class="regular-text" value="<?php echo esc_attr( self::recipient() ); ?>"></td>
					</tr>
					<tr>
						<th scope="row"><label for="tvce_from">Send from</label></th>
						<td>
							<input name="tvce_from" id="tvce_from" type="email" class="regular-text" value="<?php echo esc_attr( (string) get_option( self::OPT_FROM, '' ) ); ?>" placeholder="<?php echo esc_attr( self::from_email() ); ?>">
							<p class="description">A real mailbox on your domain, e.g. hello@techvibesit.com. Leave empty to use the address above. If WP Mail SMTP is active, its "From" setting takes priority.</p>
						</td>
					</tr>
				</table>
				<?php submit_button( 'Save' ); ?>
			</form>

			<form method="post" action="<?php echo esc_url( admin_url( 'admin-post.php' ) ); ?>" style="display:inline-block;margin-right:8px">
				<?php wp_nonce_field( 'tvce_test' ); ?>
				<input type="hidden" name="action" value="tvce_test">
				<?php submit_button( 'Send test email', 'secondary', 'submit', false ); ?>
			</form>

			<?php if ( ! defined( 'TECHVIBES_CONTACT_KEY' ) ) : ?>
				<form method="post" action="<?php echo esc_url( admin_url( 'admin-post.php' ) ); ?>" style="display:inline-block" onsubmit="return confirm('The website form will stop working until you paste the new key into Cloudflare. Continue?')">
					<?php wp_nonce_field( 'tvce_regenerate' ); ?>
					<input type="hidden" name="action" value="tvce_regenerate">
					<?php submit_button( 'Create a new key', 'delete', 'submit', false ); ?>
				</form>
			<?php endif; ?>

			<p style="margin-top:24px">Every enquiry is also saved under <a href="<?php echo esc_url( admin_url( 'edit.php?post_type=' . self::POST_TYPE ) ); ?>">Enquiries</a>, even if the email fails.</p>
		</div>
		<?php
	}

	private static function guard( $action ) {
		if ( ! current_user_can( 'manage_options' ) ) {
			wp_die( esc_html__( 'Sorry, you are not allowed to do that.', 'techvibes-contact' ) );
		}
		check_admin_referer( $action );
	}

	private static function back( $notice ) {
		wp_safe_redirect( admin_url( 'options-general.php?page=techvibes-contact&tvce=' . $notice ) );
		exit;
	}

	public static function handle_save() {
		self::guard( 'tvce_save' );
		$to   = isset( $_POST['tvce_to'] ) ? sanitize_email( wp_unslash( $_POST['tvce_to'] ) ) : '';
		$from = isset( $_POST['tvce_from'] ) ? sanitize_email( wp_unslash( $_POST['tvce_from'] ) ) : '';
		if ( is_email( $to ) ) {
			update_option( self::OPT_TO, $to, false );
		}
		update_option( self::OPT_FROM, is_email( $from ) ? $from : '', false );
		self::back( 'saved' );
	}

	public static function handle_test() {
		self::guard( 'tvce_test' );
		$ok = self::send( 'Test from TechVibes Contact', "This is a test email from the TechVibes Contact plugin.\n\nIf you can read this, website enquiries will reach this inbox." );
		self::back( $ok ? 'sent' : 'failed' );
	}

	public static function handle_regenerate() {
		self::guard( 'tvce_regenerate' );
		update_option( self::OPT_KEY, self::new_key(), false );
		self::back( 'regenerated' );
	}
}

register_activation_hook( __FILE__, array( 'TechVibes_Contact_Endpoint', 'activate' ) );
TechVibes_Contact_Endpoint::init();
