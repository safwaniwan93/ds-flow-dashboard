<?php
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

class DS_Flow_Shortcode {

    public function __construct() {
        add_shortcode( 'ds_flow', array( $this, 'render_shortcode' ) );
        add_action( 'wp_enqueue_scripts', array( $this, 'enqueue_styles' ) );
    }

    public function enqueue_styles() {
        wp_register_style( 'ds-flow-styles', false );
        wp_enqueue_style( 'ds-flow-styles' );
        
        $custom_css = "
            /* Layout & Section Typography */
            .ds-flow-container { font-family: 'Georgia', serif; margin: 40px auto; max-width: 1200px; padding: 0 20px; box-sizing: border-box; }
            .ds-flow-header-block { text-align: center; margin-bottom: 50px; font-family: sans-serif; }
            .ds-flow-label-pill { display: inline-block; padding: 6px 16px; background-color: #e6f4ea; border: 1px solid #bbf7d0; color: #166534; border-radius: 50px; font-size: 11px; font-weight: bold; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 24px; }
            .ds-flow-title-1 { font-family: 'Georgia', serif; font-size: 42px; font-weight: bold; color: #1e293b; margin: 0 0 12px 0; letter-spacing: -0.5px; }
            .ds-flow-title-2 { font-size: 26px; font-weight: bold; color: #1a7f37; margin: 0 0 24px 0; text-transform: uppercase; letter-spacing: 1px; }
            .ds-flow-desc { font-size: 15px; color: #64748b; max-width: 600px; margin: 0 auto; line-height: 1.6; }
            
            /* Grid */
            .ds-flow-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 24px; align-items: stretch; font-family: sans-serif; }
            
            /* Card Design */
            .ds-flow-card { background: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.05); border: 1px solid #e2e8f0; display: flex; flex-direction: column; transition: transform 0.3s ease, box-shadow 0.3s ease; }
            .ds-flow-card:hover { transform: translateY(-4px); box-shadow: 0 20px 40px rgba(0,0,0,0.08); }
            
            /* Green Header Block */
            .ds-flow-card-head { background-color: #1a7f37; position: relative; padding: 30px 20px; text-align: center; color: white; display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 120px; }
            .ds-flow-promo-chip { position: absolute; top: 0; left: 50%; transform: translateX(-50%); background-color: #fbbf24; color: #78350f; font-size: 10px; font-weight: bold; padding: 4px 16px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); white-space: nowrap; }
            .ds-flow-top-label { font-size: 10px; font-weight: bold; color: #a7f3d0; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 8px; margin-top: 10px; }
            .ds-flow-card-title { font-family: 'Georgia', serif; font-size: 24px; font-weight: bold; margin: 0 0 12px 0; line-height: 1.2; color: #ffffff; }
            .ds-flow-mini-offer { border: 1px solid #4ade80; color: #dcfce7; border-radius: 50px; padding: 4px 16px; font-size: 13px; font-weight: bold; display: inline-block; white-space: nowrap; }
            
            /* Image Block */
            .ds-flow-card-image-wrap { width: 100%; height: 260px; background-color: #ffffff; border-bottom: 1px solid #f1f5f9; display: flex; align-items: center; justify-content: center; padding: 0; box-sizing: border-box; overflow: hidden; position: relative; }
            .ds-flow-card-image { width: 100%; height: 100%; object-fit: cover; display: block; margin: 0; padding: 0; }
            
            /* Content Block */
            .ds-flow-card-content { padding: 24px; flex-grow: 1; display: flex; flex-direction: column; background: #fff; position: relative; z-index: 2; }
            
            /* Price Block */
            .ds-flow-price-block { margin: 0 0 24px 0; padding: 0 0 24px 0; border-bottom: 1px solid #f1f5f9; }
            .ds-flow-price-row { display: flex; align-items: flex-end; gap: 4px; margin: 0 0 8px 0; padding: 0; line-height: 1; }
            .ds-flow-currency { font-size: 14px; font-weight: bold; color: #1a7f37; margin: 0; padding: 0; margin-bottom: 4px; }
            .ds-flow-price-active { font-size: 46px; font-weight: 900; color: #1a7f37; letter-spacing: -1px; line-height: 0.9; margin: 0; padding: 0; }
            .ds-flow-price-regular { font-size: 14px; color: #94a3b8; text-decoration: line-through; font-weight: 500; margin-left: 8px; margin-bottom: 4px; }
            .ds-flow-savings-pill { display: inline-block; background-color: #f0fdf4; border: 1px solid #bbf7d0; color: #166534; font-size: 11px; font-weight: bold; padding: 4px 8px; border-radius: 4px; }
            
            /* Features */
            .ds-flow-features { list-style: none; padding: 0; margin: 0 0 24px 0; flex-grow: 1; }
            .ds-flow-features li { display: flex; align-items: flex-start; gap: 8px; margin-bottom: 12px; font-size: 13px; color: #475569; line-height: 1.5; }
            .ds-flow-features li .tick { color: #94a3b8; font-weight: bold; margin-top: 2px; }
            .ds-flow-free-tag { background-color: #1a7f37; color: white; font-size: 10px; font-weight: bold; padding: 2px 6px; border-radius: 4px; text-transform: uppercase; letter-spacing: 1px; display: inline-block; margin-right: 4px; }
            
            /* Button */
            .ds-flow-btn { display: flex; align-items: center; justify-content: center; gap: 8px; width: 100%; background-color: #1a7f37; color: #ffffff; padding: 16px; border-radius: 12px; text-decoration: none; font-weight: bold; font-size: 15px; transition: all 0.2s ease; box-shadow: 0 4px 6px rgba(26,127,55,0.2); margin-top: auto; box-sizing: border-box; }
            .ds-flow-btn:hover { background-color: #166534; color: #ffffff; box-shadow: 0 6px 12px rgba(26,127,55,0.3); }
        ";
        wp_add_inline_style( 'ds-flow-styles', $custom_css );
    }

    public function render_shortcode( $atts ) {
        $atts = shortcode_atts( array(
            'slot' => '',
        ), $atts, 'ds_flow' );

        $slot = sanitize_text_field( $atts['slot'] );
        if ( empty( $slot ) ) {
            return '<p>DS Flow: Error - Missing slot parameter.</p>';
        }

        $config = get_transient( 'ds_flow_config' );

        if ( false === $config ) {
            $backup_config = get_option( 'ds_flow_config_backup' );
            if ( $backup_config ) {
                $config = $backup_config;
            } else {
                return '<p>DS Flow: Error - Config not available.</p>';
            }
        } else {
            update_option( 'ds_flow_config_backup', $config, false );
        }

        if ( ! isset( $config[ $slot ] ) ) {
            return ''; 
        }

        $section = $config[ $slot ];

        ob_start();
        ?>
        <div class="ds-flow-container">
            <div class="ds-flow-header-block">
                <?php if ( ! empty( $section['labelText'] ) ) : ?>
                    <div class="ds-flow-label-pill"><?php echo esc_html( $section['labelText'] ); ?></div>
                <?php endif; ?>
                
                <?php if ( ! empty( $section['titleLine1'] ) ) : ?>
                    <h2 class="ds-flow-title-1"><?php echo esc_html( $section['titleLine1'] ); ?></h2>
                <?php endif; ?>

                <?php if ( ! empty( $section['titleLine2'] ) ) : ?>
                    <h3 class="ds-flow-title-2"><?php echo esc_html( $section['titleLine2'] ); ?></h3>
                <?php endif; ?>

                <?php if ( ! empty( $section['description'] ) ) : ?>
                    <p class="ds-flow-desc"><?php echo esc_html( $section['description'] ); ?></p>
                <?php endif; ?>
            </div>

            <?php if ( ! empty( $section['cards'] ) && is_array( $section['cards'] ) ) : ?>
                <div class="ds-flow-grid">
                    <?php foreach ( $section['cards'] as $card ) : ?>
                        <div class="ds-flow-card">
                            
                            <!-- Green Header Block -->
                            <div class="ds-flow-card-head">
                                <?php if ( ! empty( $card['promoChip'] ) ) : ?>
                                    <div class="ds-flow-promo-chip"><?php echo esc_html( $card['promoChip'] ); ?></div>
                                <?php endif; ?>

                                <?php if ( ! empty( $card['topLabel'] ) ) : ?>
                                    <div class="ds-flow-top-label"><?php echo esc_html( $card['topLabel'] ); ?></div>
                                <?php endif; ?>

                                <?php if ( ! empty( $card['cardTitle'] ) ) : ?>
                                    <h4 class="ds-flow-card-title"><?php echo esc_html( $card['cardTitle'] ); ?></h4>
                                <?php endif; ?>

                                <?php if ( ! empty( $card['miniOfferText'] ) ) : ?>
                                    <div class="ds-flow-mini-offer"><?php echo esc_html( $card['miniOfferText'] ); ?></div>
                                <?php endif; ?>
                            </div>

                            <!-- Image Block -->
                            <?php if ( ! empty( $card['poster'] ) ) : ?>
                            <div class="ds-flow-card-image-wrap">
                                <img src="<?php echo esc_url( $card['poster'] ); ?>" alt="<?php echo esc_attr( $card['cardTitle'] ); ?>" class="ds-flow-card-image">
                            </div>
                            <?php endif; ?>
                            
                            <!-- Content Block -->
                            <div class="ds-flow-card-content">
                                
                                <!-- Price Block -->
                                <?php if ( isset( $card['activePrice'] ) ) : 
                                    $active_price = $card['activePrice'];
                                    $regular_price = isset($card['regularPrice']) ? $card['regularPrice'] : '';
                                    $savings = isset($card['savingsAmount']) ? $card['savingsAmount'] : null;
                                ?>
                                <div class="ds-flow-price-block">
                                    <div class="ds-flow-price-row">
                                        <span class="ds-flow-currency">RM</span>
                                        <span class="ds-flow-price-active"><?php echo esc_html( $active_price ); ?></span>
                                        <?php if ( $savings > 0 && $regular_price ) : ?>
                                            <span class="ds-flow-price-regular">RM<?php echo esc_html( $regular_price ); ?></span>
                                        <?php endif; ?>
                                    </div>
                                    <?php if ( $savings > 0 ) : ?>
                                        <div class="ds-flow-savings-pill">Jimat RM<?php echo esc_html( $savings ); ?></div>
                                    <?php endif; ?>
                                </div>
                                <?php endif; ?>

                                <!-- Features -->
                                <?php if ( ! empty( $card['featureList'] ) && is_array( $card['featureList'] ) ) : ?>
                                    <ul class="ds-flow-features">
                                        <?php foreach ( $card['featureList'] as $feature ) : 
                                            // Handle [FREE] tag replacement
                                            $has_free = strpos( $feature, '[FREE]' ) !== false;
                                            $clean_feature = str_replace( array('[FREE]', '✓'), '', $feature );
                                            $clean_feature = trim( $clean_feature );
                                        ?>
                                            <li>
                                                <span class="tick">✓</span>
                                                <span class="feature-text">
                                                    <?php if ( $has_free ) : ?>
                                                        <span class="ds-flow-free-tag">FREE</span>
                                                    <?php endif; ?>
                                                    <?php echo esc_html( $clean_feature ); ?>
                                                </span>
                                            </li>
                                        <?php endforeach; ?>
                                    </ul>
                                <?php endif; ?>

                                <!-- Button -->
                                <?php 
                                $btn_text = ! empty( $card['buttonText'] ) ? $card['buttonText'] : 'Beli Sekarang 🛒';
                                $checkout_url = ! empty( $card['checkoutUrl'] ) ? $card['checkoutUrl'] : '#';
                                ?>
                                <a href="<?php echo esc_url( $checkout_url ); ?>" class="ds-flow-btn">
                                    <?php echo esc_html( $btn_text ); ?>
                                </a>
                            </div>

                        </div>
                    <?php endforeach; ?>
                </div>
            <?php endif; ?>
        </div>
        <?php
        return ob_get_clean();
    }
}
