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
            .ds-flow-container { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 60px auto; max-width: 1200px; padding: 0 24px; box-sizing: border-box; color: #1e293b; }
            .ds-flow-header-block { text-align: center; margin-bottom: 60px; }
            .ds-flow-label-pill { display: inline-block; padding: 8px 20px; background-color: #f0fdf4; border: 1px solid #dcfce7; color: #154200; border-radius: 100px; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 24px; }
            .ds-flow-title-1 { font-family: 'Georgia', serif; font-size: 48px; font-weight: 800; color: #0f172a; margin: 0 0 16px 0; letter-spacing: -0.02em; line-height: 1.1; }
            .ds-flow-title-2 { font-size: 28px; font-weight: 800; color: #154200; margin: 0 0 28px 0; text-transform: uppercase; letter-spacing: 0.05em; line-height: 1.2; }
            .ds-flow-desc { font-size: 17px; color: #475569; max-width: 640px; margin: 0 auto; line-height: 1.6; font-weight: 400; }
            
            /* Grid */
            .ds-flow-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(340px, 1fr)); gap: 32px; align-items: stretch; }
            
            /* Card Design */
            .ds-flow-card { background: #ffffff; border-radius: 32px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05), 0 20px 40px -10px rgba(0,0,0,0.08); border: 1px solid #f1f5f9; display: flex; flex-direction: column; transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1); position: relative; }
            .ds-flow-card:hover { transform: translateY(-8px); box-shadow: 0 30px 60px -12px rgba(0,0,0,0.12); border-color: #e2e8f0; }
            
            /* Premium Header Block */
            .ds-flow-card-head { background-color: #154200; background-image: radial-gradient(circle at top right, #1a5200, #154200); position: relative; padding: 20px; text-align: center; color: white; display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100px; z-index: 10; }
            .ds-flow-promo-chip { position: absolute; top: 0; left: 50%; transform: translateX(-50%); background: linear-gradient(135deg, #fbbf24, #f59e0b); color: #451a03; font-size: 11px; font-weight: 800; padding: 6px 20px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 10px rgba(0,0,0,0.15); white-space: nowrap; text-transform: uppercase; letter-spacing: 0.05em; }
            .ds-flow-top-label { font-size: 11px; font-weight: 700; color: #86efac; text-transform: uppercase; letter-spacing: 0.2em; margin-bottom: 6px; margin-top: 10px; opacity: 0.9; }
            .ds-flow-card-title { font-family: 'Georgia', serif; font-size: 28px; font-weight: 800; margin: 0 0 10px 0; line-height: 1.1; color: #ffffff; letter-spacing: -0.01em; }
            .ds-flow-mini-offer { background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); backdrop-filter: blur(4px); color: #ffffff; border-radius: 100px; padding: 6px 20px; font-size: 13px; font-weight: 600; display: inline-block; white-space: nowrap; }
            
            /* Image Block - 1:1 ASPECT RATIO */
            .ds-flow-card-image-wrap { width: 100%; aspect-ratio: 1 / 1; background-color: #f8fafc; border-bottom: 1px solid #f1f5f9; display: flex; align-items: center; justify-content: center; padding: 0; box-sizing: border-box; overflow: hidden; position: relative; }
            .ds-flow-card-image { width: 100%; height: 100%; object-fit: cover; display: block; margin: 0; padding: 0; box-sizing: border-box; transition: transform 0.6s ease; }
            .ds-flow-card:hover .ds-flow-card-image { transform: scale(1.05); }
            
            /* Content Block */
            .ds-flow-card-content { padding: 32px; flex-grow: 1; display: flex; flex-direction: column; background: #fff; position: relative; z-index: 5; }
            
            /* Price Block */
            .ds-flow-price-block { margin: 0 0 28px 0; padding: 0 0 28px 0; border-bottom: 1px solid #f1f5f9; display: flex; flex-direction: column; gap: 8px; }
            .ds-flow-price-row { display: flex; align-items: baseline; gap: 6px; margin: 0; padding: 0; line-height: 1; }
            .ds-flow-currency { font-size: 16px; font-weight: 800; color: #154200; margin: 0; padding: 0; align-self: flex-start; margin-top: 4px; }
            .ds-flow-price-active { font-size: 40px; font-weight: 900; color: #154200; letter-spacing: -0.03em; line-height: 0.8; margin: 0; padding: 0; }
            .ds-flow-price-regular { font-size: 16px; color: #94a3b8; text-decoration: line-through; font-weight: 500; margin-left: 8px; }
            .ds-flow-savings-pill { display: inline-flex; align-items: center; background-color: #154200; color: #ffffff; font-size: 12px; font-weight: 700; padding: 6px 14px; border-radius: 8px; box-shadow: 0 4px 12px rgba(21,66,0,0.2); width: fit-content; }
            
            /* Features */
            .ds-flow-features { list-style: none; padding: 0; margin: 0 0 32px 0; flex-grow: 1; }
            .ds-flow-features li { display: flex; align-items: flex-start; gap: 12px; margin-bottom: 16px; font-size: 15px; color: #334155; line-height: 1.5; font-weight: 500; }
            .ds-flow-features li .tick { color: #154200; font-weight: 900; font-size: 16px; line-height: 1; }
            .ds-flow-free-tag { background: linear-gradient(135deg, #154200, #1a5200); color: white; font-size: 10px; font-weight: 800; padding: 2px 8px; border-radius: 4px; text-transform: uppercase; letter-spacing: 0.05em; display: inline-block; margin-right: 6px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
            
            /* Premium Button */
            .ds-flow-btn { display: flex; align-items: center; justify-content: center; gap: 10px; width: 100%; background: linear-gradient(135deg, #154200, #1a5200); color: #ffffff; padding: 18px 24px; border-radius: 16px; text-decoration: none !important; font-weight: 700; font-size: 16px; transition: all 0.3s ease; box-shadow: 0 10px 20px -5px rgba(21,66,0,0.4); margin-top: auto; box-sizing: border-box; border: none; outline: none; }
            .ds-flow-btn:hover { background: linear-gradient(135deg, #1a5200, #154200); color: #ffffff; transform: translateY(-2px); box-shadow: 0 15px 30px -5px rgba(21,66,0,0.5); }
            .ds-flow-btn:active { transform: translateY(0); }
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
