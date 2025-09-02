<?php
/**
 * Plugin Name: MarketDope Landing Block (Full + Typeform, v5)
 * Description: Landing page Gutenberg block with reliable Typeform popup. Detects form ID + domain from pasted URL and opens via SDK.
 * Version: 1.1.5
 * Author: Market Dope
 * License: GPL-2.0-or-later
 */

if ( ! defined( 'ABSPATH' ) ) { exit; }

add_action( 'init', function () {
    wp_register_script(
        'marketdope-landing-editor',
        plugins_url( 'index.js', __FILE__ ),
        array( 'wp-blocks', 'wp-element', 'wp-i18n', 'wp-block-editor', 'wp-components' ),
        '1.1.5',
        true
    );

    wp_register_style(
        'marketdope-landing-style',
        plugins_url( 'style.css', __FILE__ ),
        array(),
        '1.1.5'
    );

    wp_register_script(
        'marketdope-landing-view',
        plugins_url( 'view.js', __FILE__ ),
        array(),
        '1.1.5',
        true
    );

    // Typeform SDK + optional popup CSS
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
        'script'          => 'typeform-embed',
        'render_callback' => 'marketdope_landing_render',
    ) );
} );

// Frontend + editor: enqueue once
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

/**
 * Extract form ID + domain from a Typeform URL or raw ID.
 *
 * Accepts:
 *  - https://form.typeform.com/to/ABC123
 *  - https://yourbrand.typeform.com/to/ABC123
 *  - https://admin.typeform.com/form/ABC123
 *  - ABC123 (raw ID)
 *
 * Returns [ 'id' => 'ABC123', 'domain' => 'https://form.typeform.com' or 'https://yourbrand.typeform.com' ]
 */
function marketdope_extract_typeform_info( $value ) {
    $value = trim( (string) $value );

    // Full URLs
    if ( preg_match( '~^(https?://[^/]+)/(?:to|form|forms)/([A-Za-z0-9]+)(?:[/?#]|$)~', $value, $m ) ) {
        $host = $m[1];                 // e.g. https://form.typeform.com OR https://yourbrand.typeform.com
        $id   = $m[2];                 // e.g. ABC123
        // Normalize protocol to https
        if ( strpos($host, 'http://') === 0 ) {
            $host = 'https://' . substr($host, 7);
        }
        return array(
            'id'     => $id,
            'domain' => $host,
        );
    }

    // admin.typeform.com/form/ID (no host captured above)
    if ( preg_match( '~admin\.typeform\.com/(?:form|forms)/([A-Za-z0-9]+)~', $value, $m ) ) {
        return array(
            'id'     => $m[1],
            'domain' => 'https://form.typeform.com',
        );
    }

    // Raw ID
    if ( preg_match( '~^[A-Za-z0-9]{6,}$~', $value ) ) {
        return array(
            'id'     => $value,
            'domain' => 'https://form.typeform.com',
        );
    }

    return array( 'id' => '', 'domain' => 'https://form.typeform.com' );
}

/**
 * Server-render: expose normalized ID + domain to view.js and add a hidden HTML activator as a fallback.
 * Assumes block attribute key is `typeformUrlOrId`.
 */
function marketdope_landing_render( $attributes, $content ) {
    $raw = isset( $attributes['typeformUrlOrId'] ) ? $attributes['typeformUrlOrId'] : '';
    $info = marketdope_extract_typeform_info( $raw );
    $id   = $info['id'];
    $dom  = $info['domain'];

    // Hand off to front-end before view.js executes.
    $inline = 'window.MD_TF = ' . wp_json_encode( array(
        'id'     => $id,
        'domain' => $dom,
    ) ) . ';';
    wp_add_inline_script( 'marketdope-landing-view', $inline, 'before' );

    // Optional hidden activator (HTML embed fallback)
    if ( $id ) {
        $content .= '<a style="display:none" aria-hidden="true" data-tf-popup="' . esc_attr( $id ) . '"></a>';
    } else {
        $content .= "\n<!-- Typeform ID missing: set the block field to a full URL like https://form.typeform.com/to/ABC123 or just ABC123 -->\n";
    }

    return $content;
}
