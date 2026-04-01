/**
 * Menu Icon Manager Pro - Admin JavaScript
 */

(function($) {
    'use strict';

    var mimProAdmin = window.mimProAdmin || {};

    var MIMProPicker = {
        iconTypes: mimProAdmin.iconTypes || {},
        
        init: function() {
            this.bindEvents();
            // Initialize visibility of per-item button lower fields
            $(document).find('.field-mimp-icon').each(function(){
                var $w = $(this);
                var $cb = $w.find('.mimp-button-toggle-row input[type="checkbox"]');
                var $lower = $w.find('.mimp-button-lower-fields');
                if ( $cb.length && $cb.is(':checked') ) {
                    $lower.show();
                    MIMProPicker.populateButtonDefaults( $w );
                } else {
                    $lower.hide();
                }
            });
        },

        populateButtonDefaults: function( $wrapper ) {
            try {
                var opts = window.mimProAdmin && window.mimProAdmin.currentOptions && window.mimProAdmin.currentOptions.button ? window.mimProAdmin.currentOptions.button : {};
                if ( ! opts ) { return; }
                // map of per-item input selectors to global option keys
                var mapping = {
                    'input[name^="mimp_button_text_color"]': 'text_color',
                    'input[name^="mimp_button_bg_color"]': 'background_color',
                    'input[name^="mimp_button_border_color"]': 'border_color',
                    'input[name^="mimp_button_border_size"]': 'border_size',
                    'input[name^="mimp_button_border_radius"]': 'border_radius',
                    'input[name^="mimp_button_padding"]': 'padding',
                    'input[name^="mimp_button_hover_text_color"]': 'hover_text_color',
                    'input[name^="mimp_button_hover_bg"]': 'hover_background',
                    'input[name^="mimp_button_hover_border_color"]': 'hover_border_color'
                };

                Object.keys(mapping).forEach(function(sel){
                    var key = mapping[sel];
                    var $input = $wrapper.find(sel);
                    if ( $input.length ) {
                        // only set when empty/unset
                        var val = $input.val();
                        if ( typeof val === 'undefined' || val === null || val === '' ) {
                            if ( typeof opts[key] !== 'undefined' && opts[key] !== null ) {
                                $input.val( String(opts[key]) );
                            }
                        }
                    }
                });
            } catch(e) { /* silent */ }
        },

        bindEvents: function() {
            $(document).on('click', '.mimp-select-icon, .mimp-select-image, .mimp-select-dashicons, .mimp-select-genericons, .mimp-select-fontawesome', this.selectIcon.bind(this));
            $(document).on('click', '.mimp-remove-icon', this.removeIcon.bind(this));
            $(document).on('change', '.mimp-icon-settings input, .mimp-icon-settings select', this.updatePreview.bind(this));
            // Inline icon color picker (next to preview) \\u2014 update preview when changed
            $(document).on('input change', '.mimp-icon-color-inline', function(e){
                var $input = $(this);
                var $wrapper = $input.closest('.field-mimp-icon');
                var colorVal = $input.val();
                if ( colorVal ) {
                    // apply color to preview icon (font icons or svg/img)
                    try {
                        var $preview = $wrapper.find('.mimp-preview-icon');
                        $preview.find('img.mimp-preview-svg').css('filter','');
                        $preview.find('span, svg').first().css('color', colorVal).css('fill', colorVal);
                    } catch(e) { /* silent */ }
                }
            });
            // Toggle lower button fields when checkbox changes
            $(document).on('change', '.mimp-button-toggle-row input[type="checkbox"]', function(e){
                var $cb = $(this);
                var $wrapper = $cb.closest('.field-mimp-icon');
                var $lower = $wrapper.find('.mimp-button-lower-fields');
                if ( $cb.is(':checked') ) {
                    $lower.slideDown(160);
                } else {
                    $lower.slideUp(160);
                }
            });

            // Additional delegated click handler to catch UI variations where change may not fire immediately
            $(document).on('click', 'input[name^="mimp_button_enabled"]', function(e){
                var $cb = $(this);
                var $wrapper = $cb.closest('.field-mimp-icon');
                var $lower = $wrapper.find('.mimp-button-lower-fields');
                // debug helper
                if ( window.console && console.log ) { console.log('mimp: button toggle clicked', $cb.is(':checked') ); }
                if ( $cb.is(':checked') ) {
                    $lower.slideDown(160);
                    MIMProPicker.populateButtonDefaults( $wrapper );
                } else {
                    $lower.slideUp(160);
                }
            });
                // per-item tab switching
                $(document).on('click', '.mimp-item-tab', function(e){
                    e.preventDefault();
                    var $btn = $(this);
                    var $wrapper = $btn.closest('.field-mimp-icon');
                    var tab = $btn.data('mimp-tab');
                    $wrapper.find('.mimp-item-tab').removeClass('active');
                    $btn.addClass('active');
                    $wrapper.find('[data-mimp-panel]').hide();
                    $wrapper.find('[data-mimp-panel="' + tab + '"]').show();
                });

                // Reset to global defaults
                $(document).on('click', '.mimp-reset-button', function(e){
                    e.preventDefault();
                    var $btn = $(this);
                    var $wrapper = $btn.closest('.field-mimp-icon');
                    
                    if ( ! window.confirm('Reset all Icon, Button, and Badge settings to global defaults? This cannot be undone.') ) {
                        return;
                    }

                    // Get global defaults
                    var globals = window.mimProAdmin && window.mimProAdmin.currentOptions ? window.mimProAdmin.currentOptions : {};

                    // Reset Icon & Image tab fields
                    $wrapper.find('[name^="mimp_icon_color"]').val( globals.button && globals.button.text_color ? globals.button.text_color : '#002d72' );
                    $wrapper.find('[name^="mimp_icon_bg_color"]').val( globals.icon && globals.icon.background_color ? globals.icon.background_color : '#ffe4b2' );
                    $wrapper.find('[name^="mimp_icon_border_radius"]').val( globals.icon && globals.icon.border_radius ? globals.icon.border_radius : '3px' );
                    $wrapper.find('[name^="mimp_icon_font_size"]').val( globals.icon && globals.icon.font_size ? globals.icon.font_size : '1.2' );
                    $wrapper.find('[name^="mimp_icon_position"]').val( globals.icon && globals.icon.position ? globals.icon.position : 'before' );
                    $wrapper.find('[name^="mimp_icon_hide_label"]').prop('checked', false);
                    
                    // Note: Icon name/type and image URL are NOT reset as they are content-specific, not styling

                    // Reset Button tab fields
                    $wrapper.find('[name^="mimp_button_enabled"]').prop('checked', false);
                    $wrapper.find('[name^="mimp_button_border_size"]').val( globals.button && globals.button.border_size ? globals.button.border_size : '1' );
                    $wrapper.find('[name^="mimp_button_border_radius"]').val( globals.button && globals.button.border_radius ? globals.button.border_radius : '4' );
                    $wrapper.find('[name^="mimp_button_padding"]').val( globals.button && globals.button.padding ? globals.button.padding : '5' );
                    $wrapper.find('[name^="mimp_button_text_color"]').val( globals.button && globals.button.text_color ? globals.button.text_color : '#002d72' );
                    $wrapper.find('[name^="mimp_button_bg_color"]').val( globals.button && globals.button.background_color ? globals.button.background_color : '#ffe4b2' );
                    $wrapper.find('[name^="mimp_button_border_color"]').val( globals.button && globals.button.border_color ? globals.button.border_color : '#b45309' );
                    $wrapper.find('[name^="mimp_button_hover_text_color"]').val( globals.button && globals.button.hover_text_color ? globals.button.hover_text_color : '#ffffff' );
                    $wrapper.find('[name^="mimp_button_hover_bg"]').val( globals.button && globals.button.hover_background ? globals.button.hover_background : '#0073aa' );
                    $wrapper.find('[name^="mimp_button_hover_border_color"]').val( globals.button && globals.button.hover_border_color ? globals.button.hover_border_color : '#005a87' );
                    
                    // Hide button lower fields when reset
                    $wrapper.find('.mimp-button-lower-fields').slideUp(160);

                    // Reset Badges & Bubbles tab fields
                    $wrapper.find('[name^="mimp_badge_text"]').val('');
                    $wrapper.find('[name^="mimp_badge_position"]').val( globals.badge && globals.badge.position ? globals.badge.position : 'top-right' );
                    $wrapper.find('[name^="mimp_badge_bg_color"]').val( globals.badge && globals.badge.background_color ? globals.badge.background_color : '#d11e14' );
                    $wrapper.find('[name^="mimp_badge_font_size"]').val( globals.badge && globals.badge.font_size ? globals.badge.font_size : '8' );

                    // Show feedback
                    alert('All settings reset to global defaults.');
                });

            // React to global settings updates (modal save)
            $(document).on('mimp:settings:updated', function(e, settings){
                // update local copy if available and populate visible fields
                try {
                    if ( window.mimProAdmin ) { window.mimProAdmin.currentOptions = settings || window.mimProAdmin.currentOptions; }
                    $('.field-mimp-icon').each(function(){
                        var $w = $(this);
                        var $lower = $w.find('.mimp-button-lower-fields');
                        if ( $lower && $lower.is(':visible') ) {
                            MIMProPicker.populateButtonDefaults( $w );
                        }
                    });
                } catch(e) { /* silent */ }
            });
        },

        selectIcon: function(e) {
            e.preventDefault();

            var self = this;
            var $trigger = $(e.target).closest('.mimp-select-icon, .mimp-select-image, .mimp-select-dashicons, .mimp-select-genericons, .mimp-select-fontawesome');
            var $wrapper = $trigger.closest('.field-mimp-icon');

            function openMediaImage() {
                // Re-use media frame
                if ( self.frame ) {
                    self.frame.open();
                    return;
                }
                self.frame = wp.media({
                    title: mimProAdmin.text.selectIcon,
                    button: { text: mimProAdmin.text.selectIcon },
                    library: { type: 'image' },
                    multiple: false
                });
                self.frame.on('select', function() {
                    var attachment = self.frame.state().get('selection').first().toJSON();
                    $wrapper.find('.mimp-icon-type').val('image');
                    $wrapper.find('.mimp-icon-name').val( attachment.id );
                    $wrapper.find('.mimp-icon-image-url').val( attachment.url || (attachment.sizes && attachment.sizes.full && attachment.sizes.full.url) || '' );
                    $wrapper.find('.mimp-icon-settings').removeClass('hidden');
                    $wrapper.find('.mimp-remove-icon').removeClass('hidden');
                    var imgSrc = attachment.url || (attachment.sizes && attachment.sizes.full && attachment.sizes.full.url) || '';
                    if ( imgSrc ) {
                        $wrapper.find('.mimp-icon-preview').html('<img src="' + self.escapeHtml( imgSrc ) + '" style="max-width:30px;max-height:30px;" />');
                    }
                });
                self.frame.open();
            }

            function buildIconModal(type) {
                var typeLabel = type === 'genericons' ? 'Genericons' : ( type === 'fontawesome' ? 'Font Awesome' : 'Dashicons' );
                var $chooser = $(
                    '<div class="mimp-chooser-modal" role="dialog" aria-modal="true">' +
                        '<div class="mimp-chooser-inner">' +
                            '<div class="mimp-chooser-actions">' +
                                '<input type="search" class="mimp-chooser-search" placeholder="Search icons..." aria-label="Search icons" />' +
                                '<button type="button" class="button mimp-chooser-close">Close</button>' +
                            '</div>' +
                            '<div class="mimp-chooser-grid" aria-live="polite"></div>' +
                        '</div>' +
                    '</div>'
                );

                // populate grid
                var list = mimProAdmin.iconList && mimProAdmin.iconList[type] ? mimProAdmin.iconList[type] : [];
                var $grid = $chooser.find('.mimp-chooser-grid');
                list.forEach(function(cls){
                    var $icon;
                    if (type === 'dashicons') {
                        $icon = $('<button type="button" class="mimp-picker-icon" data-type="dashicons" data-name="' + cls + '"><span class="dashicons ' + cls + '"></span><span class="mimp-icon-name-label">' + cls + '</span></button>');
                    } else if (type === 'genericons') {
                        $icon = $('<button type="button" class="mimp-picker-icon" data-type="genericons" data-name="' + cls + '"><span class="genericon ' + cls + '"></span><span class="mimp-icon-name-label">' + cls + '</span></button>');
                    } else {
                        $icon = $('<button type="button" class="mimp-picker-icon" data-type="fontawesome" data-name="' + cls + '"><i class="fa-solid ' + cls + '"></i><span class="mimp-icon-name-label">' + cls + '</span></button>');
                    }
                    $grid.append($icon);
                });

                // append and handlers
                $('body').append($chooser);

                // Quick runtime font availability check (logs to console)
                try {
                    if ( window.document && window.document.fonts ) {
                        var hasGenericons = document.fonts.check('1em "Genericons"');
                        var hasDashicons = document.fonts.check('1em "dashicons"') || document.fonts.check('1em dashicons');
                        if ( ! hasGenericons ) {
                            console.warn('MIM Picker: Genericons font not available. Check genericons.css and assets/fonts/Genericons.woff');
                        }
                        if ( ! hasDashicons ) {
                            console.warn('MIM Picker: Dashicons font not available. Ensure `dashicons` stylesheet is enqueued.');
                        }
                    } else {
                        console.info('MIM Picker: Document.fonts API not available in this browser for font checks.');
                    }
                } catch (e) {
                    console.error('MIM Picker: font check failed', e);
                }

                function closeChooser() { $chooser.remove(); }

                $chooser.on('click', '.mimp-chooser-close', function(){ closeChooser(); });

                $chooser.on('click', '.mimp-picker-icon', function(ev){
                    ev.preventDefault();
                    var $btn = $(this);
                    var type = $btn.data('type');
                    var name = $btn.data('name');
                    $wrapper.find('.mimp-icon-type').val(type);
                    $wrapper.find('.mimp-icon-name').val(name);
                    $wrapper.find('.mimp-icon-image-url').val('');
                    $wrapper.find('.mimp-icon-settings').removeClass('hidden');
                    $wrapper.find('.mimp-remove-icon').removeClass('hidden');
                    var previewHtml = '';
                    if ( type === 'dashicons' ) {
                        previewHtml = '<span class="dashicons ' + self.escapeHtml(name) + '"></span>';
                    } else if ( type === 'genericons' ) {
                        previewHtml = '<span class="genericon ' + self.escapeHtml(name) + '"></span>';
                    } else if ( type === 'fontawesome' ) {
                        previewHtml = '<i class="fa-solid ' + self.escapeHtml(name) + '"></i>';
                    }
                    $wrapper.find('.mimp-icon-preview').html(previewHtml);
                    closeChooser();
                });

                // search/filter
                $chooser.on('input', '.mimp-chooser-search', function() {
                    var q = String($(this).val() || '').toLowerCase().trim();
                    var $items = $chooser.find('.mimp-picker-icon');
                    if (!q) { $items.show(); return; }
                    $items.each(function(){
                        var $it = $(this);
                        var name = ($it.data('name') || '').toLowerCase();
                        var label = ($it.find('.mimp-icon-name-label').text() || '').toLowerCase();
                        if (name.indexOf(q) !== -1 || label.indexOf(q) !== -1) {
                            $it.show();
                        } else {
                            $it.hide();
                        }
                    });
                });

                // focus
                $chooser.find('.mimp-chooser-search').val('').focus();
            }

            // Decide which picker to open
            if ($trigger.hasClass('mimp-select-image')) {
                openMediaImage();
                return;
            }

            if ($trigger.hasClass('mimp-select-dashicons')) {
                buildIconModal('dashicons');
                return;
            }

            if ($trigger.hasClass('mimp-select-genericons')) {
                buildIconModal('genericons');
                return;
            }

            if ($trigger.hasClass('mimp-select-fontawesome')) {
                buildIconModal('fontawesome');
                return;
            }

            // fallback to dashicons modal
            buildIconModal('dashicons');
        },

        removeIcon: function(e) {
            e.preventDefault();
            
            var $wrapper = $(e.target).closest('.field-mimp-icon');
            
            $wrapper.find('.mimp-icon-type').val('');
            $wrapper.find('.mimp-icon-name').val('');
            $wrapper.find('.mimp-icon-settings').addClass('hidden');
            $wrapper.find('.mimp-icon-preview').html('');
            $(e.target).addClass('hidden');
        },

        updatePreview: function(e) {
            var $wrapper = $(e.target).closest('.field-mimp-icon');
            var iconType = $wrapper.find('.mimp-icon-type').val();
            var iconName = $wrapper.find('.mimp-icon-name').val();
            var iconUrl = $wrapper.find('.mimp-icon-image-url').val();
            
            if (!iconType || !iconName) {
                return;
            }

            // Show settings
            $wrapper.find('.mimp-icon-settings').removeClass('hidden');
            
            // Update preview based on icon type
            var previewHtml = '';
            switch(iconType) {
                case 'dashicons':
                    previewHtml = '<span class="dashicons ' + this.escapeHtml(iconName) + '"></span>';
                    break;
                case 'genericons':
                    previewHtml = '<span class="genericon ' + this.escapeHtml(iconName) + '"></span>';
                    break;
                case 'fontawesome':
                    previewHtml = '<i class="fa-solid ' + this.escapeHtml(iconName) + '"></i>';
                    break;
                case 'image':
                    // prefer stored image URL for preview (separate hidden field)
                    var src = iconUrl || iconName;
                    previewHtml = '<img src="' + this.escapeHtml(src) + '" style="max-width: 30px; max-height: 30px;" />';
                    break;
            }
            
            if (previewHtml) {
                $wrapper.find('.mimp-icon-preview').html(previewHtml);
            }

            // Apply inline icon color if present
            var colorVal = $wrapper.find('.mimp-icon-color-inline').val();
            try {
                if ( colorVal ) {
                    $wrapper.find('.mimp-preview-icon').find('span, img').first().css('color', colorVal).css('fill', colorVal);
                }
            } catch(e) { /* silent */ }
        },

        escapeHtml: function(text) {
            var map = {
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                "'": '&#039;'
            };
            return text.replace(/[&<>"']/g, function(m) { return map[m]; });
        }
    };

    // Initialize on document ready
    $(document).ready(function() {
        MIMProPicker.init();
    });

    // Re-initialize when new menu items are added
    $(document).on('menu-item-added', function() {
        MIMProPicker.init();
    });

    // Expose MIMProPicker globally so external code can access it
    window.MIMProPicker = MIMProPicker;

})(jQuery);

/* Additional AJAX picker & settings modal helpers added by integration patch */
// Fetch icon list lazily and populate chooser grid
MIMProPicker.fetchIconList = function(type, query, page) {
    var data = {
        action: 'mimp_get_icon_list',
        nonce: ( window.mimProAdmin && mimProAdmin.nonce_get_icon_list ) ? mimProAdmin.nonce_get_icon_list : '',
        type: type || '',
        query: query || '',
        page: page || 1
    };

    jQuery.post( (window.mimProAdmin && mimProAdmin.ajax_url) ? mimProAdmin.ajax_url : ajaxurl, data, function(response){
        var $grid = jQuery('.mimp-chooser-grid');
        $grid.empty();

        if ( response && response.success && response.data && response.data.icons && response.data.icons.length ) {
            jQuery.each( response.data.icons, function( i, icon ){ 
                var inner = icon.html ? icon.html : (icon.title ? icon.title : icon.id);
                var $btn = jQuery('<button type="button" class="mimp-chooser-item" data-icon-id="'+ (icon.id || '') +'" title="'+ (icon.title || '') +'">' + inner + '</button>');
                $grid.append( $btn );
            } );
        } else {
            $grid.append('<div class="mimp-no-results">No icons found</div>');
        }
    }, 'json').fail(function(){
        jQuery('.mimp-chooser-grid').html('<div class="mimp-error">Unable to load icons</div>');
    });
};

// Initialize settings modal open/close bindings
MIMProPicker.initSettingsModal = function() {
    jQuery(document).on('click', '[data-mimp-open-settings]', function(e){
        e.preventDefault();
        var $modal = jQuery('[data-mimp-modal]');
        $modal.css('display', 'flex');
        $modal.addClass('visible');
        // Load first page of icons into the chooser
        MIMProPicker.fetchIconList('', '', 1);
    });

    jQuery(document).on('click', '[data-mimp-close]', function(e){
        e.preventDefault();
        var $modal = jQuery('[data-mimp-modal]');
        $modal.css('display', 'none');
        $modal.removeClass('visible');
    });
};

// Auto-init small pieces if on admin
jQuery(function(){
    if ( typeof mimProAdmin !== 'undefined' ) {
        MIMProPicker.initSettingsModal();
    }
});

// Add Settings button to dashboard module card (if present)
jQuery(function(){
    try {
        jQuery('.was-module-card').each(function(){
            var $card = jQuery(this);
            var title = $card.find('.was-module-title').text() || '';
            if ( title.toLowerCase().indexOf('menu') !== -1 && title.toLowerCase().indexOf('icon') !== -1 ) {
                // avoid adding duplicate button
                if ( $card.find('[data-mimp-open-settings]').length === 0 ) {
                    var $btn = jQuery('<button type="button" class="button button-primary" data-mimp-open-settings>Settings</button>');
                    $card.append( $btn );
                }
            }
        });
    } catch (e) {
        // swallow
    }
});
