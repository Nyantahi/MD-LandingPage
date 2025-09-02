<?php
/**
 * Plugin Name: MarketDope Landing Block (Full + Typeform, v3)
 * Description: Full landing page Gutenberg block with Typeform popup on all CTAs. Robust ID detection + strong CTA styling. No CLI required.
 * Version: 1.1.2
 * Author: Market Dope
 * License: GPL-2.0-or-later
 */

if ( ! defined( 'ABSPATH' ) ) { exit; }

add_action( 'init', function () {
    wp_register_script(
        'marketdope-landing-editor',
        plugins_url( 'index.js', __FILE__ ),
        array( 'wp-blocks', 'wp-element', 'wp-i18n', 'wp-block-editor', 'wp-components' ),
        '1.1.2',
        true
    );

    wp_register_style(
        'marketdope-landing-style',
        plugins_url( 'style.css', __FILE__ ),
        array(),
        '1.1.2'
    );

    wp_register_script(
        'marketdope-landing-view',
        plugins_url( 'view.js', __FILE__ ),
        array(),
        '1.1.2',
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

    register_block_type( __DIR__, array(
        'editor_script' => 'marketdope-landing-editor',
        'style'         => 'marketdope-landing-style',
        'view_script'   => 'marketdope-landing-view',
        'script'        => 'typeform-embed',
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
