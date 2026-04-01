/* global ASOHideAdminNoticesPanel, jQuery */
(function($) {
    'use strict';

    var cfg = window.ASOHideAdminNoticesPanel || {};
    var ajaxUrl = cfg.ajaxUrl || (typeof ajaxurl !== 'undefined' ? ajaxurl : '');
    var nonce = cfg.nonce || '';
    var moduleOptions = cfg.moduleOptions || {};
    var forceHideOnAsoPage = !!cfg.forceHideOnAsoPage;
    var noHiddenText = cfg.noHiddenText || 'No hidden notifications.';

    var $panel = $('#azad-admin-notice-panel');
    var $trigger = $('#wp-admin-bar-azad-admin-notify');
    var $toggle = $('.aso-notice-hide-toggle');
    var $toggleThumb = $toggle.find('.aso-notice-toggle-thumb');

    if (!$panel.length || !$trigger.length || !$toggle.length) {
        return;
    }

    function updateToggleState(isEnabled) {
        if (isEnabled) {
            $toggle.css('background', '#0ea5e9');
            $toggleThumb.css('left', '22px');
            $toggle.attr('data-state', '1');
        } else {
            $toggle.css('background', '#ccc');
            $toggleThumb.css('left', '2px');
            $toggle.attr('data-state', '0');
        }
    }

    updateToggleState(!!cfg.focusModeEnabled);

    $toggle.on('click', function(e) {
        e.preventDefault();
        e.stopPropagation();

        if (forceHideOnAsoPage) {
            updateToggleState(true);
            return;
        }

        var currentState = String($(this).attr('data-state') || '1') === '1';
        var newState = currentState ? '0' : '1';
        updateToggleState(newState === '1');

        moduleOptions.temporary_show_native_notices = (newState === '1') ? '0' : '1';

        var payloadOptions = {};
        Object.keys(moduleOptions).forEach(function(key) {
            var val = moduleOptions[key];
            payloadOptions[key] = (val === true || val === '1' || val === 1) ? '1' : '0';
        });

        if (!ajaxUrl || !nonce) {
            window.location.reload();
            return;
        }

        $.ajax({
            url: ajaxUrl,
            type: 'POST',
            data: {
                action: 'aso_save_hide_admin_notices_options',
                nonce: nonce,
                options: payloadOptions
            },
            success: function(response) {
                if (response && response.success) {
                    window.location.reload();
                } else {
                    window.location.reload();
                }
            },
            error: function() {
                window.location.reload();
            }
        });
    });

    $trigger.on('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        if ($panel.is(':visible')) {
            $panel.slideUp(200);
        } else {
            $panel.slideDown(200);
        }
    });

    $panel.on('click', 'a, button, .button', function(e) {
        var $this = $(this);
        var href = $this.attr('href');

        if ($this.hasClass('notice-dismiss')) {
            return;
        }

        if ($this.is('a') && href && !href.startsWith('javascript:') && !$this.hasClass('notice-dismiss')) {
            return true;
        }

        if ($this.attr('onclick')) {
            var onclickCode = $this.attr('onclick');
            try {
                // Existing notices may include inline handlers from other plugins.
                // Preserve behavior while still rendering inside dropdown panel.
                // eslint-disable-next-line no-eval
                eval(onclickCode);
            } catch (err) {
                // noop
            }
            e.preventDefault();
            return false;
        }
        return undefined;
    });

    $panel.on('click', 'a[href]', function() {
        return true;
    });

    function updateNoticeCount() {
        var $hiddenNotices = $('#azad-hidden-notices');
        var $remaining = $hiddenNotices.find('.aso-notice-wrapper');
        var $dismissAllBtn = $('#aso-dismiss-all-notices');

        if ($remaining.length === 0) {
            $dismissAllBtn.hide();
            $hiddenNotices.empty();
            $hiddenNotices.append('<p class="aso-notices-empty" style="padding: 20px; text-align: center; color: #666;">' + noHiddenText + '</p>');
            $trigger.find('.count').remove();
        } else {
            $dismissAllBtn.show();
            var count = $remaining.length;
            var $count = $trigger.find('.count');
            if (count > 0) {
                if (!$count.length) {
                    $count = $('<span class="count"></span>').prependTo($trigger.find('> .ab-item'));
                }
                $count.text(count);
            } else {
                $count.remove();
            }
        }
    }

    $panel.on('click', '.notice-dismiss', function(e) {
        e.preventDefault();
        e.stopPropagation();

        var $dismissBtn = $(this);
        var $notice = $dismissBtn.closest('.notice, .updated, .error, .notice-success, .notice-warning, .notice-error, .update-message');
        var noticeHash = $notice.attr('data-aso-notice-hash') || $notice.closest('.aso-notice-wrapper').attr('data-notice-hash') || '';
        var noticeText = $.trim($notice.text()).substring(0, 200);

        if ($notice.length) {
            $notice.fadeOut(200, function() {
                $(this).remove();
                if (ajaxUrl && nonce) {
                    $.ajax({
                        url: ajaxUrl,
                        type: 'POST',
                        data: {
                            action: 'aso_dismiss_notice',
                            nonce: nonce,
                            notice_hash: noticeHash,
                            notice_text: noticeText
                        }
                    });
                }
                updateNoticeCount();
            });
        }
        return false;
    });

    $panel.on('click', '.aso-notice-dismiss-btn', function(e) {
        e.preventDefault();
        e.stopPropagation();

        var $dismissBtn = $(this);
        var noticeHash = $dismissBtn.attr('data-notice-hash') || $dismissBtn.closest('.aso-notice-wrapper').attr('data-notice-hash') || '';
        var $wrapper = $dismissBtn.closest('.aso-notice-wrapper');

        if ($wrapper.length && noticeHash) {
            $wrapper.fadeOut(200, function() {
                $(this).remove();
                if (ajaxUrl && nonce) {
                    $.ajax({
                        url: ajaxUrl,
                        type: 'POST',
                        data: {
                            action: 'aso_dismiss_notice',
                            nonce: nonce,
                            notice_hash: noticeHash,
                            notice_text: ''
                        }
                    });
                }
                updateNoticeCount();
            });
        }
        return false;
    });

    $('#aso-dismiss-all-notices').on('click', function(e) {
        e.preventDefault();
        e.stopPropagation();

        var $hiddenNotices = $('#azad-hidden-notices');
        var $wrappers = $hiddenNotices.find('.aso-notice-wrapper');
        var hashes = [];

        $wrappers.each(function() {
            var hash = $(this).attr('data-notice-hash');
            if (hash) {
                hashes.push(hash);
            }
        });

        $wrappers.fadeOut(200, function() {
            $(this).remove();
        });

        if (hashes.length > 0 && ajaxUrl && nonce) {
            $.ajax({
                url: ajaxUrl,
                type: 'POST',
                data: {
                    action: 'aso_dismiss_all_notices',
                    nonce: nonce,
                    notice_hashes: hashes
                }
            });
        }

        setTimeout(function() {
            updateNoticeCount();
        }, 250);
    });

    if ($('#azad-hidden-notices .aso-notice-wrapper').length > 0) {
        $('#aso-dismiss-all-notices').show();
    }

    $(document).on('click', function(e) {
        var $target = $(e.target);
        if (!$target.closest('#azad-admin-notice-panel, #wp-admin-bar-azad-admin-notify, a, button, .button').length) {
            $panel.slideUp(200);
        }
    });

    // Keep existing diagnostics, but in external asset.
    setTimeout(function() {
        var reported = {};
        $('img').each(function() {
            try {
                if (this.naturalWidth === 0) {
                    var src = this.getAttribute('src') || '';
                    if (src && !reported[src]) {
                        reported[src] = true;
                    }
                }
            } catch (e) {
                // noop
            }
        });
    }, 1000);
}(jQuery));
