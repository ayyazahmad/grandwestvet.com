(function($){
    /*
     Developer notes:
     - Place at `assets/js/menu-icon-manager-pro-settings.js`.
     - Localize a global `mimProSettings` object with `ajax_url` and `nonce_save_settings`.
    */

    var MIMProSettings = {
        init: init,
        openModal: openModal,
        bindEvents: bindEvents,
        submitForm: submitForm,
        showMessage: showMessage
    };

    function getPremiumBlockedMessage() {
        return 'Premium module requires an active license. Settings were not saved.';
    }

    function parseAjaxPayload(jqXHR) {
        if (!jqXHR) return null;
        if (jqXHR.responseJSON && typeof jqXHR.responseJSON === 'object') {
            return jqXHR.responseJSON;
        }
        if (jqXHR.responseText && typeof jqXHR.responseText === 'string') {
            try {
                return JSON.parse(jqXHR.responseText);
            } catch (e) {
                return null;
            }
        }
        return null;
    }

    function init() {
        bindEvents();
    }

    function bindEvents() {
        $(document).on('click', '[data-mimp-open-settings]', function(e){
            e.preventDefault();
            openModal();
        });

        $(document).on('click', '[data-mimp-close]', function(e){
            e.preventDefault();
            var $modal = $('[data-mimp-modal]');
            $modal.css('display', 'none');
            $modal.removeClass('visible');
        });

        $(document).on('click', '[data-mimp-tab]', function(e){
            var $btn = $(this);
            var tab = $btn.data('mimp-tab');

            // Panels
            $('[data-mimp-panel]').hide();
            $('[data-mimp-panel="' + tab + '"]').show();

            // Tabs: update active state and aria-selected
            $('[data-mimp-tab]').removeClass('active').attr('aria-selected', 'false');
            $btn.addClass('active').attr('aria-selected', 'true');
        });

        // Update preview when relevant fields change (icons, button and badge fields)
        $(document).on('input change', '[data-mimp-field="default_font_size"], [data-mimp-field^="icon_margin_"], [data-mimp-field="default_position"], input[name="icon_types[]"], [data-mimp-field^="button_"], [data-mimp-field^="badge_"]', function(){
            updatePreview();
        });

        $(document).on('click', '[data-mimp-save]', function(e){
            e.preventDefault();
            submitForm();
        });
    }

    function openModal() {
        var $modal = $('[data-mimp-modal]');
        $modal.css('display', 'flex');
        $modal.addClass('visible');
        
        // Load saved settings into form fields
        if ( window.mimProSettings && window.mimProSettings.currentOptions ) {
            var opts = window.mimProSettings.currentOptions;
            var $form = $('[data-mimp-form]');
            
            // Load simple fields
            if ( opts.default_position ) {
                $form.find('[data-mimp-field="default_position"]').val( opts.default_position );
            }
            if ( opts.default_font_size ) {
                $form.find('[data-mimp-field="default_font_size"]').val( opts.default_font_size );
            }
            
            // Load icon margins
            if ( typeof opts.icon_margin_top !== 'undefined' ) {
                $form.find('[data-mimp-field="icon_margin_top"]').val( opts.icon_margin_top );
            }
            if ( typeof opts.icon_margin_right !== 'undefined' ) {
                $form.find('[data-mimp-field="icon_margin_right"]').val( opts.icon_margin_right );
            }
            if ( typeof opts.icon_margin_bottom !== 'undefined' ) {
                $form.find('[data-mimp-field="icon_margin_bottom"]').val( opts.icon_margin_bottom );
            }
            if ( typeof opts.icon_margin_left !== 'undefined' ) {
                $form.find('[data-mimp-field="icon_margin_left"]').val( opts.icon_margin_left );
            }
            
            // Load icon types
            if ( opts.icon_types && Array.isArray(opts.icon_types) ) {
                $form.find('[name="icon_types[]"]').prop('checked', false);
                opts.icon_types.forEach(function(type){
                    $form.find('[name="icon_types[]"][value="' + type + '"]').prop('checked', true);
                });
            }
            
            // Load button colors
            if ( opts.button ) {
                if ( opts.button.text_color ) {
                    $form.find('[data-mimp-field="button_text_color"]').val( opts.button.text_color );
                }
                if ( opts.button.background_color ) {
                    $form.find('[data-mimp-field="button_bg_color"]').val( opts.button.background_color );
                }
                if ( opts.button.border_color ) {
                    $form.find('[data-mimp-field="button_border_color"]').val( opts.button.border_color );
                }
                if ( opts.button.border_size ) {
                    $form.find('[data-mimp-field="button_border"]').val( opts.button.border_size );
                }
                if ( opts.button.border_radius ) {
                    $form.find('[data-mimp-field="button_border_radius"]').val( opts.button.border_radius );
                }
                if ( opts.button.padding ) {
                    $form.find('[data-mimp-field="button_padding"]').val( opts.button.padding );
                }
                if ( opts.button.hover_text_color ) {
                    $form.find('[data-mimp-field="button_hover_text_color"]').val( opts.button.hover_text_color );
                }
                if ( opts.button.hover_background ) {
                    $form.find('[data-mimp-field="button_hover_bg"]').val( opts.button.hover_background );
                }
                if ( opts.button.hover_border_color ) {
                    $form.find('[data-mimp-field="button_hover_border_color"]').val( opts.button.hover_border_color );
                }
            }
            
            // Load badge settings
            if ( opts.badge ) {
                if ( opts.badge.text ) {
                    $form.find('[data-mimp-field="badge_text"]').val( opts.badge.text );
                }
                if ( opts.badge.position ) {
                    $form.find('[data-mimp-field="badge_position"]').val( opts.badge.position );
                }
                if ( opts.badge.background_color ) {
                    $form.find('[data-mimp-field="badge_bg_color"]').val( opts.badge.background_color );
                }
                if ( opts.badge.font_size ) {
                    $form.find('[data-mimp-field="badge_font_size"]').val( opts.badge.font_size );
                }
            }
        }
        
        // ensure preview reflects current values when opening
        setTimeout(function(){ updatePreview(); }, 10);
    }

    function updatePreview() {
        var $form = $('[data-mimp-form]');
        var $preview = $('[data-mimp-preview]');
        if ( $preview.length === 0 ) {
            return;
        }

        var size = $form.find('[data-mimp-field="default_font_size"]').val() || '1.2';
        var pos = $form.find('[data-mimp-field="default_position"]').val() || 'before';
        var mt = $form.find('[data-mimp-field="icon_margin_top"]').val();
        var mr = $form.find('[data-mimp-field="icon_margin_right"]').val();
        var mb = $form.find('[data-mimp-field="icon_margin_bottom"]').val();
        var ml = $form.find('[data-mimp-field="icon_margin_left"]').val();
        mt = ( typeof mt === 'undefined' || mt === null || mt === '' ) ? '0' : String(mt);
        mr = ( typeof mr === 'undefined' || mr === null || mr === '' ) ? '0' : String(mr);
        mb = ( typeof mb === 'undefined' || mb === null || mb === '' ) ? '0' : String(mb);
        ml = ( typeof ml === 'undefined' || ml === null || ml === '' ) ? '0' : String(ml);

        // If margins are numeric (no unit), treat as px
        var numRE = /^-?\d+(?:\.\d+)?$/;
        if ( numRE.test(mt) ) { mt = mt + 'px'; }
        if ( numRE.test(mr) ) { mr = mr + 'px'; }
        if ( numRE.test(mb) ) { mb = mb + 'px'; }
        if ( numRE.test(ml) ) { ml = ml + 'px'; }

        // icon type selection: prefer fontawesome, then genericons, then dashicons, then image
        var iconTypes = [];
        $form.find('input[name="icon_types[]"]:checked').each(function(){ iconTypes.push( $(this).val() ); });

        var $icon = $preview.find('.mimp-preview-icon');
        var $label = $preview.find('.mimp-preview-label');

        // set size (use em on icon)
        var sizeFloat = parseFloat( size ) || 1.2;
        $icon.css({ 'font-size': sizeFloat + 'em', 'display': 'inline-block' });

        // set margins (ensure valid CSS units)
        $icon.css({ 'margin-top': mt, 'margin-right': mr, 'margin-bottom': mb, 'margin-left': ml });

        // position handling - ensure icon is visible unless explicitly hidden
        $preview.css({ 'display': 'flex', 'align-items': 'center' });
        $label.css({ 'display': 'inline-block' });
        $icon.css({ 'display': 'inline-block', 'visibility': 'visible' });

        if ( pos === 'before' ) {
            $preview.css({ 'flex-direction': 'row' });
            $icon.insertBefore( $label );
        } else if ( pos === 'after' ) {
            $preview.css({ 'flex-direction': 'row' });
            $icon.insertAfter( $label );
        } else if ( pos === 'above' ) {
            $preview.css({ 'flex-direction': 'column' });
            $icon.insertBefore( $label );
        } else if ( pos === 'below' ) {
            $preview.css({ 'flex-direction': 'column' });
            $icon.insertAfter( $label );
        } else if ( pos === 'hide' ) {
            $icon.css({ 'display': 'none' });
        }

        // choose icon type: render either a font icon or an inline image
        // normalize container
        $icon.removeClass();
        $icon.addClass('mimp-preview-icon');
        // keep image node present but remove other children (prevents duplicates)
        $icon.children().not('img.mimp-preview-svg').remove();

        // helper: ensure child icon node for font icons
        function ensureChildIcon( html ) {
            // remove any existing font-icon children
            $icon.children().not('img.mimp-preview-svg').remove();
            $icon.append( html );
        }

        if ( iconTypes.indexOf('image') !== -1 ) {
            // image-based: ensure an <img> exists and set its src from data attribute
            var $img = $icon.find('img.mimp-preview-svg');
            var svgUrl = $icon.data('mimp-svg-url') || ($img.length ? $img.data('mimp-svg-url') : null);
            if ( $img.length ) {
                if ( svgUrl ) {
                    // attach handlers to reliably show/hide fallback
                    $img.off('load.mimp error.mimp').on('load.mimp', function(){
                        $(this).show();
                        $icon.find('.mimp-inline-fallback').hide();
                    }).on('error.mimp', function(){
                        $(this).hide();
                        $icon.find('.mimp-inline-fallback').css('display','inline-block');
                    });
                    $img.attr('src', svgUrl);
                } else {
                    $img.hide();
                    $icon.find('.mimp-inline-fallback').css('display','inline-block');
                }
                // ensure fallback visibility if image already broken
                if ( $img.length && $img.prop('naturalWidth') === 0 ) {
                    $img.hide();
                    $icon.find('.mimp-inline-fallback').css('display','inline-block');
                }
            } else if ( svgUrl ) {
                $icon.append( $('<img>').addClass('mimp-preview-svg').attr('src', svgUrl).css({ 'display':'inline-block' }) );
            } else {
                // fallback to emoji if no svg URL available
                $icon.children().not('img.mimp-preview-svg').remove();
                $icon.append('<span class="mimp-fallback-icon">\\uFE0F</span>');
            }
        } else if ( iconTypes.indexOf('fontawesome') !== -1 ) {
            $icon.find('img.mimp-preview-svg').hide();
            if ( $icon.find('.fa-solid').length === 0 ) {
                ensureChildIcon('<i class="fa-solid fa-house" aria-hidden="true"></i>');
            }
        } else if ( iconTypes.indexOf('dashicons') !== -1 ) {
            // font-based dashicon (inject child span)
            $icon.find('img.mimp-preview-svg').hide();
            if ( $icon.find('.dashicons').length === 0 ) {
                ensureChildIcon('<span class="dashicons dashicons-admin-home" aria-hidden="true"></span>');
            }
        } else if ( iconTypes.indexOf('genericons') !== -1 ) {
            // font-based genericon (inject child span)
            $icon.find('img.mimp-preview-svg').hide();
            if ( $icon.find('.genericon').length === 0 ) {
                ensureChildIcon('<span class="genericon genericon-home" aria-hidden="true"></span>');
            }
        } else {
            // default to dashicon (inject child span)
            $icon.find('img.mimp-preview-svg').hide();
            if ( $icon.find('.dashicons').length === 0 ) {
                ensureChildIcon('<span class="dashicons dashicons-admin-home" aria-hidden="true"></span>');
            }
        }

        // ensure label text
        $label.text('HOME');

        // --- Button preview update ---
        var $btnWrap = $('[data-mimp-preview-button]');
        var $btn = $btnWrap.find('.mimp-btn-preview');
        if ( $btn.length ) {
            var btnTextColor = $form.find('[data-mimp-field="button_text_color"]').val() || '#002d72';
            var btnBg = $form.find('[data-mimp-field="button_bg_color"]').val() || '#ffe4b2';
            var btnBorderColor = $form.find('[data-mimp-field="button_border_color"]').val() || '#b45309';
            var btnHoverText = $form.find('[data-mimp-field="button_hover_text_color"]').val() || '#ffffff';
            var btnHoverBg = $form.find('[data-mimp-field="button_hover_bg"]').val() || '#0073aa';
            var btnHoverBorder = $form.find('[data-mimp-field="button_hover_border_color"]').val() || '#005a87';

            var borderSizeVal = $form.find('[data-mimp-field="button_border"]').val();
            borderSizeVal = ( typeof borderSizeVal === 'undefined' || borderSizeVal === null || borderSizeVal === '' ) ? '1' : String(borderSizeVal);
            if ( /^-?\d+(?:\.\d+)?$/.test(borderSizeVal) ) { borderSizeVal = borderSizeVal + 'px'; }

            var borderRadiusVal = $form.find('[data-mimp-field="button_border_radius"]').val();
            borderRadiusVal = ( typeof borderRadiusVal === 'undefined' || borderRadiusVal === null || borderRadiusVal === '' ) ? '4' : String(borderRadiusVal);
            if ( /^-?\d+(?:\.\d+)?$/.test(borderRadiusVal) ) { borderRadiusVal = borderRadiusVal + 'px'; }
            var btnPaddingVal = $form.find('[data-mimp-field="button_padding"]').val();
            btnPaddingVal = ( typeof btnPaddingVal === 'undefined' || btnPaddingVal === null || btnPaddingVal === '' ) ? '5' : String(btnPaddingVal);
            if ( /^-?\d+(?:\.\d+)?$/.test(btnPaddingVal) ) { btnPaddingVal = btnPaddingVal + 'px'; }

            $btn.css({
                'color': btnTextColor,
                'background-color': btnBg,
                'border': borderSizeVal + ' solid ' + btnBorderColor,
                'border-radius': borderRadiusVal,
                'padding': btnPaddingVal,
                'font-weight': 600,
                'cursor': 'pointer'
            });

            // Update hover styles by injecting/updating a small style tag
            var styleId = 'mimp-preview-button-styles';
            var cssText = '[data-mimp-preview-button] .mimp-btn-preview:hover, [data-mimp-preview-button] .mimp-btn-preview:focus { color: ' + btnHoverText + ' !important; background-color: ' + btnHoverBg + ' !important; border-color: ' + btnHoverBorder + ' !important; }';
            var $style = $('#' + styleId);
            if ( $style.length === 0 ) {
                $style = $('<style id="' + styleId + '" type="text/css"></style>').appendTo('head');
            }

        // --- Badge previews update ---
        var badgeText = $form.find('[data-mimp-field="badge_text"]').val() || 'New';
        var badgePos = $form.find('[data-mimp-field="badge_position"]').val() || 'top-right';
        var badgeBg = $form.find('[data-mimp-field="badge_bg_color"]').val() || '#d11e14';
        var badgeFontSize = $form.find('[data-mimp-field="badge_font_size"]').val() || '8';
        if ( /^-?\d+(?:\.\d+)?$/.test(badgeFontSize) ) { badgeFontSize = badgeFontSize + 'px'; }

        // Menu preview
        var $menuPreview = $('[data-mimp-badge-menu-preview]');
        var $menuBadge = $menuPreview.find('.mimp-badge');
        if ( $menuBadge.length ) {
            $menuBadge.text( badgeText );
            $menuBadge.css({ 'background-color': badgeBg, 'font-size': badgeFontSize });
            // position classes: top-right, top-left, bottom-right, bottom-left
            $menuPreview.removeClass('mimp-badge-pos-top-right mimp-badge-pos-top-left mimp-badge-pos-bottom-right mimp-badge-pos-bottom-left');
            $menuPreview.addClass('mimp-badge-pos-' + badgePos.replace(/_/g,'-'));
        }

        // Copy live Icon & Label preview into the Menu badge preview so it matches exactly
        try {
            var $mainPreview = $('[data-mimp-preview]');
            var $mainIcon = $mainPreview.find('.mimp-preview-icon').first().clone(true);
            var $mainLabel = $mainPreview.find('.mimp-preview-label').first().clone(true);
            if ( $mainIcon.length && $mainLabel.length ) {
                // replace existing nodes but preserve badge element
                $menuPreview.find('.mimp-preview-icon').replaceWith( $mainIcon );
                $menuPreview.find('.mimp-preview-label').replaceWith( $mainLabel );
            }
        } catch(e) { /* silent */ }

        // Button-with-badge preview
        var $btnPreviewWrap = $('[data-mimp-badge-button-preview]');
        var $btnBadge = $btnPreviewWrap.find('.mimp-badge');
        if ( $btnBadge.length ) {
            $btnBadge.text( badgeText );
            $btnBadge.css({ 'background-color': badgeBg, 'font-size': badgeFontSize });
            $btnPreviewWrap.removeClass('mimp-badge-pos-top-right mimp-badge-pos-top-left mimp-badge-pos-bottom-right mimp-badge-pos-bottom-left');
            $btnPreviewWrap.addClass('mimp-badge-pos-' + badgePos.replace(/_/g,'-'));

            // Copy live button styles from main Button preview so badge-button preview matches
            var $mainBtn = $('[data-mimp-preview-button] .mimp-btn-preview');
            var $badgeBtn = $btnPreviewWrap.find('.mimp-btn-preview');
            if ( $mainBtn.length && $badgeBtn.length ) {
                var props = ['color','background-color','border','border-radius','padding','font-weight','font-size','box-shadow'];
                var cssObj = {};
                for ( var i=0;i<props.length;i++ ) {
                    cssObj[ props[i] ] = $mainBtn.css( props[i] ) || '';
                }
                $badgeBtn.css(cssObj);
            }
            // ensure button DOM matches main preview to keep exact alignment
            try {
                var $mainBtnClone = $('[data-mimp-preview-button] .mimp-btn-preview').first().clone(true);
                if ( $mainBtnClone.length ) {
                    // replace the badge preview's button with a clone of the live preview
                    var $existing = $btnPreviewWrap.find('.mimp-btn-preview');
                    if ( $existing.length ) {
                        $existing.replaceWith( $mainBtnClone );
                    } else {
                        $btnPreviewWrap.prepend( $mainBtnClone );
                    }
                    // ensure vertical centering
                    $btnPreviewWrap.find('.mimp-btn-preview').css({ 'display':'inline-flex', 'align-items':'center' });
                }
            } catch(e) { /* silent */ }
        }
            $style.text(cssText);
        }
    }

    function submitForm() {
        var $form = $('[data-mimp-form]');
        var data = {};

        // Collect simple fields
        data.default_position = $form.find('[data-mimp-field="default_position"]').val();
        data.default_font_size = $form.find('[data-mimp-field="default_font_size"]').val();

        // Collect icon margins
        data.icon_margin_top = $form.find('[data-mimp-field="icon_margin_top"]').val();
        data.icon_margin_right = $form.find('[data-mimp-field="icon_margin_right"]').val();
        data.icon_margin_bottom = $form.find('[data-mimp-field="icon_margin_bottom"]').val();
        data.icon_margin_left = $form.find('[data-mimp-field="icon_margin_left"]').val();

        // Collect checkbox arrays
        data.icon_types = [];
        $form.find('[name="icon_types[]"]:checked').each(function(){
            data.icon_types.push( $(this).val() );
        });

        // Button defaults
        data.button_text_color = $form.find('[data-mimp-field="button_text_color"]').val();
        data.button_bg_color = $form.find('[data-mimp-field="button_bg_color"]').val();
        data.button_border_color = $form.find('[data-mimp-field="button_border_color"]').val();
        data.button_border = $form.find('[data-mimp-field="button_border"]').val();
        data.button_border_radius = $form.find('[data-mimp-field="button_border_radius"]').val();
        data.button_padding = $form.find('[data-mimp-field="button_padding"]').val();
        data.button_hover_text_color = $form.find('[data-mimp-field="button_hover_text_color"]').val();
        data.button_hover_bg = $form.find('[data-mimp-field="button_hover_bg"]').val();
        data.button_hover_border_color = $form.find('[data-mimp-field="button_hover_border_color"]').val();

        // Badge defaults
        data.badge_text = $form.find('[data-mimp-field="badge_text"]').val();
        data.badge_position = $form.find('[data-mimp-field="badge_position"]').val();
        data.badge_bg_color = $form.find('[data-mimp-field="badge_bg_color"]').val();
        data.badge_font_size = $form.find('[data-mimp-field="badge_font_size"]').val();

        // AJAX save
        var payload = {
            action: 'mimp_save_settings',
            nonce: ( window.mimProSettings && mimProSettings.nonce_save_settings ) ? mimProSettings.nonce_save_settings : '',
            settings: data
        };

        console.log('MIMP: Saving settings with payload:', payload);

        $.post( (window.mimProSettings && mimProSettings.ajax_url) ? mimProSettings.ajax_url : ajaxurl, payload, function( response ){
            console.log('MIMP: AJAX response received:', response);
            if ( response && response.success ) {
                MIMProSettings.showMessage('\\u2713 Menu Icon Manager Settings saved', 'success');
                // Update global options for admin scripts so per-item fields can inherit immediately
                try {
                    if ( window.mimProSettings ) {
                        window.mimProSettings.currentOptions = response.data.settings || window.mimProSettings.currentOptions;
                    }
                    if ( window.mimProAdmin ) {
                        window.mimProAdmin.currentOptions = response.data.settings || window.mimProAdmin.currentOptions;
                    }
                    // Broadcast an update event for other scripts to react to
                    jQuery(document).trigger('mimp:settings:updated', [ response.data.settings ]);
                } catch (e) { /* silent */ }
                // Close modal after save
                setTimeout(function(){
                    $('[data-mimp-modal]').css('display', 'none').removeClass('visible');
                }, 1000);
            } else {
                var msg = (response && response.data && response.data.message) ? response.data.message : 'Save failed';
                if (response && response.data && response.data.code === 'premium_license_required') {
                    msg = getPremiumBlockedMessage();
                }
                MIMProSettings.showMessage(msg, 'error');
            }
        }, 'json').fail(function(jqXHR, textStatus, errorThrown){
            console.log('MIMP: AJAX failed - Status:', textStatus, 'Error:', errorThrown, 'Response:', jqXHR.responseText);
            var payload = parseAjaxPayload(jqXHR);
            var msg = getPremiumBlockedMessage();
            if (payload && payload.data && payload.data.message) {
                msg = payload.data.message;
            } else if (!(jqXHR && jqXHR.status === 403)) {
                msg = 'Save failed';
            }
            MIMProSettings.showMessage(msg, 'error');
        });
    }

    function showMessage( text, type ) {
        var $box = $('[data-mimp-messages]');
        var color = '#374151';
        if (type === 'error') {
            color = '#dc2626';
        } else if (type === 'success') {
            color = '#28a745';
        }
        $box.text(text).css({
            color: color,
            display: 'block',
            fontWeight: '500'
        });
        setTimeout(function(){ $box.empty(); }, 4000);
    }

    // Auto-init if jQuery is ready
    $(function(){
        if ( typeof $ !== 'undefined' ) {
            init();
        }
    });

    // Expose to global for debugging if desired
    window.MIMProSettings = MIMProSettings;

})(jQuery);
