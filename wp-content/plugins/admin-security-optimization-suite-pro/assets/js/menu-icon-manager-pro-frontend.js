/**
 * Menu Icon Manager Pro - Frontend Script
 * Handles button hover styles and badge positioning on the frontend
 */

(function() {
    'use strict';

    // Apply hover styles to menu buttons
    function initButtonHoverStyles() {
        var buttons = document.querySelectorAll('.mimp-menu-button[data-mimp-hover-styles]');
        
        buttons.forEach(function(button) {
            var hoverStyles = button.getAttribute('data-mimp-hover-styles');
            if (!hoverStyles) return;

            // store original inline styles to restore
            var originalStyle = button.getAttribute('style') || '';

            // Parse rules like 'color: #fff; background-color: #000'
            var stylePairs = hoverStyles.split(';').map(function(s){ return s.trim(); }).filter(Boolean);

            button.addEventListener('mouseenter', function() {
                stylePairs.forEach(function(pair) {
                    var parts = pair.split(':');
                    if (parts.length >= 2) {
                        var prop = parts[0].trim();
                        var val = parts.slice(1).join(':').trim();
                        button.style[ toCamelCase(prop) ] = val;
                    }
                });
            });

            button.addEventListener('mouseleave', function() {
                // restore original inline style (may be empty)
                if ( originalStyle ) {
                    button.setAttribute('style', originalStyle);
                } else {
                    button.removeAttribute('style');
                }
            });
        });
    }

    // Ensure badges positioned relative to parent menu item
    function initBadgePositioning() {
        var badges = document.querySelectorAll('.mimp-badge');
        badges.forEach(function(badge){
            // Prefer anchoring badges to the nearest link (<a>) so position
            // calculations align with the visible menu label. Fall back to
            // the parent <li.menu-item> when no anchor is present.
            var anchor = badge.closest('a');
            if ( anchor ) {
                var compA = window.getComputedStyle(anchor).position;
                if ( ! compA || compA === 'static' ) {
                    anchor.style.position = 'relative';
                }
                return;
            }

            var li = badge.closest('li.menu-item');
            if ( li ) {
                var comp = window.getComputedStyle(li).position;
                if ( ! comp || comp === 'static' ) {
                    li.style.position = 'relative';
                }
            }
        });
    }

    function toCamelCase(str) {
        return str.replace(/-([a-z])/g, function(m, c){ return c.toUpperCase(); });
    }

    if ( document.readyState === 'loading' ) {
        document.addEventListener('DOMContentLoaded', function(){
            initButtonHoverStyles();
            initBadgePositioning();
        });
    } else {
        initButtonHoverStyles();
        initBadgePositioning();
    }
})();
