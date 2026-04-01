/* global ASOHideAdminNoticesCollector, jQuery */
(function($) {
    'use strict';

    var cfg = window.ASOHideAdminNoticesCollector || {};
    var selectors = cfg.selectors || '.notice, .updated, .error, .update-nag, .update-message';
    var noHiddenText = cfg.noHiddenText || 'No hidden notifications.';
    var shouldHideNotices = cfg.shouldHideNotices !== false;

    var isPluginScreen = $('body').hasClass('plugins-php') || $('body').hasClass('plugins-network');
    var $panel = $('#azad-hidden-notices');
    var $bell = $('#wp-admin-bar-azad-admin-notify');

    if (!$panel.length || !$bell.length) {
        return;
    }

    function getCount() {
        var $count = $bell.find('.count');
        if (!$count.length) {
            return 0;
        }
        var val = parseInt($count.text(), 10);
        return isNaN(val) ? 0 : val;
    }

    function setCount(value) {
        var $count = $bell.find('.count');
        if (value <= 0) {
            $count.remove();
            return;
        }
        if (!$count.length) {
            $count = $('<span class="count"></span>').prependTo($bell.find('> .ab-item'));
        }
        $count.text(value);
    }

    function refreshCountFromPanel() {
        var total = $panel.find('.notice, .updated, .error, .update-message').length;
        setCount(total);
        if (total === 0) {
            if (!$panel.find('.aso-notices-empty').length) {
                $panel.append('<p class="aso-notices-empty" style="padding: 20px; text-align: center; color: #666;">' + noHiddenText + '</p>');
            }
        } else {
            $panel.find('.aso-notices-empty').remove();
        }
    }

    function removeEmptyState() {
        $panel.find('.aso-notices-empty').remove();
    }

    function shouldSkipPluginUpdate($notice) {
        if (!isPluginScreen) {
            return false;
        }
        if ($notice.hasClass('plugin-update-message')) {
            return true;
        }
        return $notice.closest('.plugin-update-tr').length > 0;
    }

    function buildNoticeHash($notice) {
        var existing = $notice.attr('data-aso-notice-hash');
        if (existing) {
            return existing;
        }
        var txt = $.trim($notice.text()).replace(/\s+/g, ' ');
        var hash = String(txt).toLowerCase();
        $notice.attr('data-aso-notice-hash', hash);
        return hash;
    }

    function moveNotice($notice) {
        if (!shouldHideNotices) {
            return 0;
        }
        if (!$notice.length || $notice.closest('#azad-hidden-notices').length) {
            return 0;
        }
        if (shouldSkipPluginUpdate($notice)) {
            return 0;
        }

        removeEmptyState();
        var noticeHash = buildNoticeHash($notice);
        if ($panel.find('.aso-notice-wrapper[data-notice-hash="' + noticeHash.replace(/"/g, '\\"') + '"]').length) {
            $notice.addClass('aso-notice-hidden');
            if ($notice[0]) {
                $notice[0].style.setProperty('display', 'none', 'important');
            }
            return 0;
        }

        var $clone = $notice.clone(true, true);
        $clone.find('.aso-notice-dismiss-row, .aso-notice-dismiss-btn, .notice-dismiss').remove();
        $clone.removeClass('aso-notice-hidden');
        if ($clone[0]) {
            $clone[0].style.removeProperty('display');
        }
        $clone.removeAttr('id');
        var cloneText = $.trim($clone.text()).replace(/\s+/g, ' ');
        if (!cloneText.length) {
            return 0;
        }

        var duplicateFound = false;
        $panel.find('.notice, .updated, .error, .update-message').each(function() {
            var existing = $.trim($(this).text()).replace(/\s+/g, ' ');
            if (existing === cloneText) {
                duplicateFound = true;
                return false;
            }
            return true;
        });

        if (duplicateFound) {
            $notice.addClass('aso-notice-hidden');
            if ($notice[0]) {
                $notice[0].style.setProperty('display', 'none', 'important');
            }
            return 0;
        }

        if (!$clone.find('.notice-dismiss').length) {
            $clone.append('<div class="aso-notice-dismiss-row"><button class="aso-notice-dismiss-btn" data-notice-hash="' + noticeHash + '" type="button">Dismiss</button></div>');
        }

        var $wrapper = $('<div class="aso-notice-wrapper" data-notice-hash="' + noticeHash + '"></div>');
        $wrapper.append($clone);
        $panel.append($wrapper);

        $notice.addClass('aso-notice-hidden');
        if ($notice[0]) {
            $notice[0].style.setProperty('display', 'none', 'important');
        }
        return 1;
    }

    function collectWithin($scope, options) {
        options = options || {};
        if (!$scope || !$scope.length) {
            return;
        }
        var moved = 0;
        var $targets = $();
        $scope.each(function() {
            var $el = $(this);
            if ($el.is(selectors)) {
                $targets = $targets.add($el);
            }
            $targets = $targets.add($el.find(selectors));
        });
        $targets = $targets.not('#azad-hidden-notices *');
        $targets.each(function() {
            moved += moveNotice($(this));
        });
        if (moved && !options.skipCount) {
            refreshCountFromPanel();
        }
    }

    function collectExisting() {
        var $root = $('#wpbody-content');
        if (!$root.length) {
            $root = $('body');
        }
        collectWithin($root, { skipCount: true });
    }

    if (shouldHideNotices) {
        collectExisting();
        refreshCountFromPanel();
    } else {
        refreshCountFromPanel();
    }

    var target = document.getElementById('wpbody-content') || document.body;
    if (!target) {
        return;
    }

    var pendingNodes = [];
    var flushTimer = null;

    function enqueueNode(node) {
        if (!node || node.nodeType !== 1 || node.id === 'azad-admin-notice-panel') {
            return;
        }
        pendingNodes.push(node);
    }

    function flushQueuedNodes() {
        if (!pendingNodes.length) {
            flushTimer = null;
            return;
        }
        var batch = pendingNodes.slice(0);
        pendingNodes = [];
        flushTimer = null;
        var movedAny = false;

        batch.forEach(function(node) {
            var $node = $(node);
            if ($node.is(selectors) || $node.find(selectors).length) {
                collectWithin($node, { skipCount: true });
                movedAny = true;
            }
        });

        if (movedAny) {
            refreshCountFromPanel();
        }
    }

    var observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(record) {
            record.addedNodes.forEach(function(node) {
                enqueueNode(node);
            });
        });
        if (!flushTimer) {
            flushTimer = window.setTimeout(flushQueuedNodes, 80);
        }
    });

    observer.observe(target, { childList: true, subtree: true });

    $(document).on('aso-hide-notices-toggle', function(event, isEnabled) {
        shouldHideNotices = !!isEnabled;
        if (shouldHideNotices) {
            collectExisting();
            refreshCountFromPanel();
        } else {
            setCount(0);
        }
    });
}(jQuery));
