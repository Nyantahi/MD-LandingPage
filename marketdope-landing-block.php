<?php
/**
 * Plugin Name: MarketDope Landing Block (Full + Typeform, v4)
 * Description: Landing page Gutenberg block with reliable Typeform popup. Normalizes URL→ID server-side and opens via JS API on selected CTAs.
 * Version: 1.1.4
 * Author: Market Dope
 * License: GPL-2.0-or-later
 */

if ( ! defined( 'ABSPATH' ) ) { exit; }

add_action( 'init', function () {
    wp_register_script(
        'marketdope-landing-editor',
        plugins_url( 'index.js', __FILE__ ),
        array( 'wp-blocks', 'wp-element', 'wp-i18n', 'wp-block-editor', 'wp-components' ),
        '1.1.4',
        true
    );

    wp_register_style(
        'marketdope-landing-style',
        plugins_url( 'style.css', __FILE__ ),
        array(),
        '1.1.4'
    );

    wp_register_script(
        'marketdope-landing-view',
        plugins_url( 'view.js', __FILE__ ),
        array(),
        '1.1.4',
        true
    );

    // Typeform assets (HTML/data-tf & JS API both come from this script)
    wp_register_script(
        'typeform-embed',
        'https://embed.typeform.com/next/embed.js',
        array(),
        'next',
        true
    );
    wp_register_style(
        'typeform-popup-css',
        'https://embed.typeform.com/next/css/popup.css',
        array(),
        'next'
    );

    register_block_type( __DIR__, array(
        'editor_script'   => 'marketdope-landing-editor',
        'style'           => 'marketdope-landing-style',
        'view_script'     => 'marketdope-landing-view',
        'script'          => 'typeform-embed',      // ensure SDK present on pages using this block
        'render_callback' => 'marketdope_landing_render',
    ) );
} );

// Frontend + editor: enqueue styles/JS once (avoid double-loading conflicts)
add_action( 'wp_enqueue_scripts', function(){
    wp_enqueue_style( 'marketdope-landing-style' );
    wp_enqueue_style( 'typeform-popup-css' );
    wp_enqueue_script( 'typeform-embed' );
    wp_enqueue_script( 'marketdope-landing-view' );
}, 20 );

add_action( 'enqueue_block_editor_assets', function(){
    wp_enqueue_style( 'marketdope-landing-style' );
    wp_enqueue_style( 'typeform-popup-css' );
    wp_enqueue_script( 'typeform-embed' );
    wp_enqueue_script( 'marketdope-landing-view' );
}, 20 );

/** Extract a valid Typeform ID from either a raw ID or a full URL. */
function marketdope_extract_typeform_id( $value ) {
    $value = trim( (string) $value );

    // Common full URL patterns:
    // https://form.typeform.com/to/ABC123
    // https://typeform.com/to/ABC123
    // https://admin.typeform.com/form/ABC123
    // also support custom domains pointing at typeform (domain.tld/to/ABC123)
    if ( preg_match( '~/(?:to|form|forms)/([A-Za-z0-9]+)(?:[/?#]|$)~', $value, $m ) ) {
        return $m[1];
    }

    // Raw ID heuristic
    if ( preg_match( '~^[A-Za-z0-9]{6,}$~', $value ) ) {
        return $value;
    }

    return '';
}

/**
 * Server-render: expose the normalized ID to the front-end.
 * Assumes your block attribute key is using `typeformUrlOrId` (update if different).
 * The front-end `view.js` will open a popup with this ID on your chosen CTAs.
 */
function marketdope_landing_render( $attributes, $content ) {
    $raw = isset( $attributes['typeformUrlOrId'] ) ? $attributes['typeformUrlOrId'] : '';
    $id  = marketdope_extract_typeform_id( $raw );

    // Make the ID available to view.js
    $inline = 'window.MD_TF_ID = ' . wp_json_encode( $id ) . ';';
    wp_add_inline_script( 'marketdope-landing-view', $inline, 'before' );

    // Optional: add a hidden activator using the HTML embed as a fallback (not clicked by users)
    if ( $id ) {
        $content .= '<a style="display:none" aria-hidden="true" data-tf-popup="' . esc_attr( $id ) . '"></a>';
    } else {
        $content .= "\n<!-- Typeform ID missing: set the block field to a full URL like https://form.typeform.com/to/ABC123 or just ABC123 -->\n";
    }

    return $content;
}