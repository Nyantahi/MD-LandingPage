<?php
/**
 * Plugin Name: MarketDope Landing Block (Full + Typeform, v3)
 * Description: Full landing page Gutenberg block with Typeform popup on all CTAs. Robust ID detection + strong CTA styling. No CLI required.
 * Version: 1.1.3
 * Author: Market Dope
 * License: GPL-2.0-or-later
 */

if ( ! defined( 'ABSPATH' ) ) { exit; }

add_action( 'init', function () {
    wp_register_script(
        'marketdope-landing-editor',
        plugins_url( 'index.js', __FILE__ ),
        array( 'wp-blocks', 'wp-element', 'wp-i18n', 'wp-block-editor', 'wp-components' ),
        '1.1.3',
        true
    );

    wp_register_style(
        'marketdope-landing-style',
        plugins_url( 'style.css', __FILE__ ),
        array(),
        '1.1.3'
    );

    wp_register_script(
        'marketdope-landing-view',
        plugins_url( 'view.js', __FILE__ ),
        array(),
        '1.1.3',
        true
    );

    // Typeform assets
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

    // Register block with render callback
    register_block_type( __DIR__, array(
        'editor_script' => 'marketdope-landing-editor',
        'style'         => 'marketdope-landing-style',
        'view_script'   => 'marketdope-landing-view',
        'script'        => 'typeform-embed',
        'render_callback' => 'marketdope_landing_render',
    ) );
} );

// Safety: force enqueue on front end and in editor
add_action( 'wp_enqueue_scripts', function(){
    wp_enqueue_script( 'typeform-embed' );
    wp_enqueue_style( 'typeform-popup-css' );
    wp_enqueue_script( 'marketdope-landing-view' );
    wp_enqueue_style( 'marketdope-landing-style' );
}, 20 );

add_action( 'enqueue_block_editor_assets', function(){
    wp_enqueue_script( 'typeform-embed' );
    wp_enqueue_style( 'typeform-popup-css' );
    wp_enqueue_script( 'marketdope-landing-view' );
    wp_enqueue_style( 'marketdope-landing-style' );
}, 20 );

/**
 * Extract a valid Typeform ID from either a raw ID or a full URL.
 */
function marketdope_extract_typeform_id( $value ) {
    $value = trim( (string) $value );

    // Full URL variants we commonly see:
    // https://form.typeform.com/to/ABC123
    // https://typeform.com/to/ABC123
    // https://admin.typeform.com/form/ABC123
    if ( preg_match( '~typeform\.com/(?:to|form|forms)/([A-Za-z0-9]+)~', $value, $m ) ) {
        return $m[1];
    }

    // Raw ID (safe heuristic)
    if ( preg_match( '~^[A-Za-z0-9]{6,}$~', $value ) ) {
        return $value;
    }

    return '';
}

/**
 * Server-render: inject data-tf-popup on the primary CTA if we have an ID.
 * Assumes your block stores the form value under `typeformUrlOrId`.
 */
function marketdope_landing_render( $attributes, $content ) {
    $raw = isset( $attributes['typeformUrlOrId'] ) ? $attributes['typeformUrlOrId'] : '';
    $id  = marketdope_extract_typeform_id( $raw );

    if ( $id ) {
        // Add Typeform popup attributes to the first anchor with class md-cta.
        $content = preg_replace(
            '/(<a\b[^>]*class="[^"]*\bmd-cta\b[^"]*"[^>]*)(>)/i',
            '$1 data-tf-popup="' . esc_attr( $id ) . '" data-tf-size="70" data-tf-medium="wordpress" data-tf-iframe-props="title=Market Dope" data-tf-transitive-search-params="utm_source,utm_medium,utm_campaign"$2',
            $content,
            1 // only the first CTA gets the popup by default
        );

        // If nothing matched (wrong class), append a hidden activator
        if ( strpos( $content, 'data-tf-popup="' . $id . '"' ) === false ) {
            $content .= '<a style="display:none" data-tf-popup="' . esc_attr($id) . '"></a>';
        }
    } else {
        $content .= "\n<!-- Typeform ID missing: set block attribute `typeformUrlOrId` to a full URL or raw ID. -->\n";
    }

    return $content;
}
