/**
 * Premium Module Card Interactions
 *
 * Handles premium card interaction fallback in Free edition.
 */
(function () {
    'use strict';

    function getPremiumModuleData(element) {
        var card = element && element.closest ? element.closest('.was-module-card') : null;
        if (!card) {
            return { key: '', title: 'Premium Feature', desc: '' };
        }

        return {
            key: card.getAttribute('data-premium-module') || card.getAttribute('data-module-key') || '',
            title: card.getAttribute('data-module-title') || 'Premium Feature',
            desc: card.getAttribute('data-module-desc') || ''
        };
    }

    function openOverlayById(id) {
        var overlay = document.getElementById(id);
        if (!overlay) {
            return false;
        }
        forceOverlayPopup(overlay);
        overlay.style.display = 'flex';
        overlay.setAttribute('aria-hidden', 'false');
        overlay.classList.add('is-active');
        return true;
    }

    function openMimpModal() {
        var modal = document.querySelector('[data-mimp-modal]');
        if (!modal) {
            return false;
        }
        forceOverlayPopup(modal);
        modal.style.display = 'flex';
        modal.classList.add('visible');
        modal.setAttribute('aria-hidden', 'false');
        return true;
    }

    function forceOverlayPopup(overlay) {
        if (!overlay) {
            return;
        }
        overlay.style.position = 'fixed';
        overlay.style.top = '0';
        overlay.style.right = '0';
        overlay.style.bottom = '0';
        overlay.style.left = '0';
        overlay.style.display = overlay.style.display || 'flex';
        overlay.style.alignItems = 'center';
        overlay.style.justifyContent = 'center';
        overlay.style.padding = overlay.style.padding || '16px';
        overlay.style.background = overlay.style.background || 'rgba(15, 23, 42, 0.55)';
        overlay.style.zIndex = overlay.style.zIndex || '100000';
    }

    function openPremiumFallback(trigger) {
        var moduleData = getPremiumModuleData(trigger);
        if (typeof window.openPremiumUnlockModal === 'function') {
            window.openPremiumUnlockModal(moduleData);
            return true;
        }
        return false;
    }

    // Locked premium toggle behavior.
    document.addEventListener('click', function (e) {
        var target = e.target;
        if (target && target.nodeType === 3) {
            target = target.parentNode;
        }

        var toggle = null;
        if (target && target.classList && target.classList.contains('was-switch')) {
            toggle = target;
        } else if (target && target.closest && target.closest('.was-switch')) {
            toggle = target.closest('.was-switch');
        }

        if (!toggle) {
            return;
        }

        var card = toggle.closest ? toggle.closest('.was-module-card') : null;
        if (!card || !card.classList.contains('locked')) {
            return;
        }

        e.preventDefault();
        e.stopPropagation();
        openPremiumFallback(toggle);
    }, true);

    // IMPORTANT:
    // Do not hijack premium settings/customize button clicks here.
    // Module-specific handlers in class-plugin.php must open each modal first,
    // then free-edition locking logic applies inside those modals.

    window.getPremiumModuleData = getPremiumModuleData;
})();
