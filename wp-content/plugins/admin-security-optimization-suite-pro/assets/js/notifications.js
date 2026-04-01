/**
 * Global Notification System - ASO Suite
 * 
 * Provides a unified, themed toast notification system across all plugin modules.
 * Replaces browser alert() with professional, non-blocking notifications.
 * 
 * Usage:
 *   ASONotifications.success('Settings saved!');
 *   ASONotifications.error('Failed to save');
 *   ASONotifications.warning('Are you sure?');
 *   ASONotifications.info('Processing...');
 * 
 * @since 1.5.0
 */

(function() {
    'use strict';

    window.ASONotifications = {
        // Configuration
        config: {
            defaultDuration: 3200,      // 3.2 seconds
            position: 'top-right',      // top-right, top-center, bottom-right, bottom-center
            maxStack: 5,                // Maximum notifications to show at once
            animationDuration: 300      // Animation speed in ms
        },

        // Container reference
        container: null,
        notificationQueue: [],
        notificationCount: 0,

        /**
         * Initialize the notification system
         */
        init: function() {
            if (this.container) {
                return; // Already initialized
            }

            // Create container
            this.container = document.createElement('div');
            this.container.className = 'aso-notification-container aso-notification-' + this.config.position;
            this.container.setAttribute('aria-live', 'polite');
            this.container.setAttribute('aria-atomic', 'true');
            document.body.appendChild(this.container);

            console.log('[ASO Notifications] System initialized with position:', this.config.position);
            console.log('[ASO Notifications] Container element:', this.container);
        },

        /**
         * Show a notification
         * 
         * @param {string} message The notification message (can include HTML)
         * @param {string} type Type: success, error, warning, info
         * @param {number} duration Auto-dismiss time in ms (null for no auto-dismiss)
         * @param {object} options Additional options
         */
        show: function(message, type = 'info', duration = null, options = {}) {
            // Initialize if needed
            if (!this.container) {
                console.log('[ASO Notifications] Container not initialized, initializing now...');
                this.init();
            }

            console.log('[ASO Notifications] Showing notification:', { type: type, message: message, duration: duration });

            // Use default duration if not specified
            if (duration === undefined || duration === null) {
                duration = this.config.defaultDuration;
            }

            // Create notification element
            var notificationId = 'aso-notification-' + (++this.notificationCount);
            var notification = document.createElement('div');
            notification.id = notificationId;
            notification.className = 'aso-notification aso-notification-' + type;
            notification.setAttribute('role', 'alert');

            // Build HTML
            var html = '<div class="aso-notification-content">';

            // Add icon based on type
            var icons = {
                'success': '\u2713',
                'error': '\u2715',
                'warning': '\u26A0',
                'info': '\u2139'
            };
            html += '<span class="aso-notification-icon">' + icons[type] + '</span>';

            // Add message
            html += '<span class="aso-notification-message">' + this.escapeHtml(message) + '</span>';

            html += '</div>';

            notification.innerHTML = html;

            // Add to container
            this.container.appendChild(notification);

            // Trigger animation
            setTimeout(function() {
                notification.classList.add('aso-notification-show');
            }, 10);

            // Auto-dismiss if duration is set
            if (duration > 0) {
                var self = this;
                var timeoutId = setTimeout(function() {
                    self.dismiss(notificationId);
                }, duration);

                notification.dataset.timeoutId = timeoutId;
            }

            // Keep only max notifications
            if (this.container.children.length > this.config.maxStack) {
                var firstNotif = this.container.firstChild;
                if (firstNotif) {
                    this.dismiss(firstNotif.id);
                }
            }

            return notificationId;
        },

        /**
         * Show success notification
         */
        success: function(message, duration) {
            return this.show(message, 'success', duration !== undefined ? duration : this.config.defaultDuration);
        },

        /**
         * Show error notification
         */
        error: function(message, duration) {
            return this.show(message, 'error', duration !== undefined ? duration : this.config.defaultDuration);
        },

        /**
         * Show warning notification
         */
        warning: function(message, duration) {
            return this.show(message, 'warning', duration !== undefined ? duration : this.config.defaultDuration);
        },

        /**
         * Show info notification
         */
        info: function(message, duration) {
            return this.show(message, 'info', duration !== undefined ? duration : this.config.defaultDuration);
        },

        /**
         * Dismiss a specific notification
         */
        dismiss: function(notificationId) {
            if (!this.container) {
                return;
            }

            var notification = document.getElementById(notificationId);
            if (!notification) {
                return;
            }

            // Clear timeout if exists
            if (notification.dataset.timeoutId) {
                clearTimeout(notification.dataset.timeoutId);
            }

            // Trigger exit animation
            notification.classList.remove('aso-notification-show');

            // Remove from DOM after animation
            var self = this;
            setTimeout(function() {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, this.config.animationDuration);
        },

        /**
         * Clear all notifications
         */
        clearAll: function() {
            if (!this.container) {
                return;
            }

            var notifications = Array.from(this.container.querySelectorAll('.aso-notification'));
            var self = this;

            notifications.forEach(function(notif) {
                self.dismiss(notif.id);
            });
        },

        /**
         * Escape HTML to prevent XSS
         */
        escapeHtml: function(text) {
            var map = {
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                "'": '&#039;'
            };
            return text.replace(/[&<>"']/g, function(m) {
                return map[m];
            });
        },

        /**
         * Update configuration
         */
        setConfig: function(options) {
            Object.assign(this.config, options);
        }
    };

    // Backward-compatibility alias for legacy calls.
    window.ASONotification = window.ASONotifications;

    // Auto-initialize when the DOM is ready. If the script loaded after DOMContentLoaded,
    // init immediately; otherwise wait for the event. This avoids calling
    // document.body.appendChild when document.body is not yet available.
    if (document.body) {
        ASONotifications.init();
        console.log('[ASO Notifications] Library loaded and initialized (immediate)');
    } else {
        document.addEventListener('DOMContentLoaded', function() {
            ASONotifications.init();
            console.log('[ASO Notifications] Library loaded and initialized (DOMContentLoaded)');
        });
    }
})();
