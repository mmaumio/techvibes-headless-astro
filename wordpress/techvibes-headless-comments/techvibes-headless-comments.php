<?php
/**
 * Plugin Name:       TechVibes Headless Comments
 * Description:       Lets the TechVibes website (Astro) show and accept blog comments. New comments go through WordPress's normal comment handling, so Discussion settings, moderation, Akismet and email notifications work exactly as with the built-in comment form.
 * Version:           1.0.0
 * Requires at least: 6.0
 * Requires PHP:      7.4
 * Author:            TechVibes IT Ltd
 * License:           GPL-2.0-or-later
 */

defined( 'ABSPATH' ) || exit;

/*
 * Endpoints (the website calls these from the visitor's browser):
 *   GET  /wp-json/techvibes/v1/comments?post=123   approved comments + discussion settings
 *   POST /wp-json/techvibes/v1/comments            submit a comment (form-encoded)
 */
add_action(
	'rest_api_init',
	function () {
		register_rest_route(
			'techvibes/v1',
			'/comments',
			array(
				array(
					'methods'             => 'GET',
					'callback'            => 'tvhc_get_comments',
					'permission_callback' => '__return_true',
					'args'                => array(
						'post' => array( 'required' => true, 'type' => 'integer', 'minimum' => 1 ),
					),
				),
				array(
					'methods'             => 'POST',
					'callback'            => 'tvhc_submit_comment',
					'permission_callback' => '__return_true',
					'args'                => array(
						'post'         => array( 'required' => true, 'type' => 'integer', 'minimum' => 1 ),
						'parent'       => array( 'type' => 'integer', 'default' => 0 ),
						'author_name'  => array( 'type' => 'string', 'default' => '' ),
						'author_email' => array( 'type' => 'string', 'default' => '' ),
						'author_url'   => array( 'type' => 'string', 'default' => '' ),
						'content'      => array( 'type' => 'string', 'default' => '' ),
						'tv_hp'        => array( 'type' => 'string', 'default' => '' ),
					),
				),
			)
		);
	}
);

/** A published post whose comments the public may see. */
function tvhc_public_post( $post_id ) {
	$post = get_post( $post_id );
	if ( ! $post || 'publish' !== $post->post_status || post_password_required( $post ) || ! is_post_type_viewable( $post->post_type ) ) {
		return null;
	}
	return $post;
}

/** Shape a comment for the website (same output WordPress shows on the post). */
function tvhc_format_comment( WP_Comment $c ) {
	$show_avatars = (bool) get_option( 'show_avatars' );
	return array(
		'id'      => (int) $c->comment_ID,
		'parent'  => (int) $c->comment_parent,
		'author'  => get_comment_author( $c ),
		'url'     => get_comment_author_url( $c ),
		'date'    => mysql_to_rfc3339( $c->comment_date_gmt ),
		'content' => apply_filters( 'comment_text', get_comment_text( $c ), $c, array() ),
		'avatar'  => $show_avatars ? get_avatar_url( $c, array( 'size' => 96 ) ) : '',
		'byAuthor' => ( (int) $c->user_id && (int) $c->user_id === (int) get_post_field( 'post_author', $c->comment_post_ID ) ),
	);
}

function tvhc_get_comments( WP_REST_Request $request ) {
	$post = tvhc_public_post( (int) $request['post'] );
	if ( ! $post ) {
		return new WP_Error( 'tvhc_not_found', 'Post not found.', array( 'status' => 404 ) );
	}

	$comments = get_comments(
		array(
			'post_id' => $post->ID,
			'status'  => 'approve',
			'type'    => 'comment',
			'orderby' => 'comment_date_gmt',
			'order'   => 'ASC',
		)
	);

	$response = rest_ensure_response(
		array(
			'open'             => comments_open( $post ),
			'threaded'         => (bool) get_option( 'thread_comments' ),
			'depth'            => max( 1, (int) get_option( 'thread_comments_depth', 5 ) ),
			'requireNameEmail' => (bool) get_option( 'require_name_email' ),
			'mustLogIn'        => (bool) get_option( 'comment_registration' ),
			'count'            => count( $comments ),
			'comments'         => array_map( 'tvhc_format_comment', $comments ),
		)
	);
	// Short cache so new approvals show quickly.
	$response->header( 'Cache-Control', 'public, max-age=30' );
	return $response;
}

function tvhc_submit_comment( WP_REST_Request $request ) {
	// Hidden field only bots fill in: pretend it worked, store nothing.
	if ( '' !== trim( (string) $request['tv_hp'] ) ) {
		return rest_ensure_response( array( 'status' => 'hold' ) );
	}

	if ( ! tvhc_public_post( (int) $request['post'] ) ) {
		return new WP_Error( 'tvhc_not_found', 'Post not found.', array( 'status' => 404 ) );
	}

	// Exactly what wp-comments-post.php does for the classic comment form.
	$comment = wp_handle_comment_submission(
		array(
			'comment_post_ID' => (int) $request['post'],
			'comment_parent'  => (int) $request['parent'],
			'author'          => (string) $request['author_name'],
			'email'           => (string) $request['author_email'],
			'url'             => (string) $request['author_url'],
			'comment'         => (string) $request['content'],
		)
	);

	if ( is_wp_error( $comment ) ) {
		$status = $comment->get_error_data();
		$status = is_numeric( $status ) ? (int) $status : 400;
		$message = trim( preg_replace( '/^\s*Error:\s*/i', '', wp_strip_all_tags( $comment->get_error_message() ) ) );
		return new WP_Error( $comment->get_error_code(), $message, array( 'status' => $status ) );
	}

	if ( '1' === (string) $comment->comment_approved ) {
		return rest_ensure_response( array( 'status' => 'approved', 'comment' => tvhc_format_comment( $comment ) ) );
	}

	// Held for moderation (or caught as spam, which we don't reveal).
	return rest_ensure_response( array( 'status' => 'hold' ) );
}
