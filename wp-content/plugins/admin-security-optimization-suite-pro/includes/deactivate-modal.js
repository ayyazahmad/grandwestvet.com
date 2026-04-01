// Show a modal on plugin deactivation to ask if user wants to keep or remove plugin data
jQuery(document).ready(function($) {
    // Only run on plugins.php
    if (window.location.pathname.indexOf('plugins.php') === -1) return;

    // Intercept deactivate links for this plugin
    $(document).on('click', 'tr[data-slug="admin-security-optimization-suite-pro"] .deactivate a', function(e) {
        e.preventDefault();
        var $link = $(this);
        // Modal HTML
        var modal = $('<div id="aso-deactivate-modal" style="position:fixed;z-index:99999;top:0;left:0;width:100vw;height:100vh;background:rgba(0,0,0,0.4);display:flex;align-items:center;justify-content:center;"><div style="background:#fff;padding:32px 28px 24px 28px;border-radius:8px;max-width:400px;width:100%;box-shadow:0 8px 32px rgba(0,0,0,0.18);text-align:center;"><h2 style="margin-top:0;">Remove all plugin data?</h2><p>Data, settings, and files will only be removed if you delete the plugin after deactivation. Do you want to keep or remove all plugin data on deletion?</p><button id="aso-keep-data" style="margin:8px 12px 0 0;padding:8px 18px;">Keep Data</button><button id="aso-remove-data" style="margin:8px 0 0 0;padding:8px 18px;background:#d32f2f;color:#fff;">Remove Data</button><br><button id="aso-cancel-deactivate" style="margin:18px 0 0 0;padding:6px 18px;background:#eee;">Cancel</button></div></div>');
        $('body').append(modal);
        $('#aso-cancel-deactivate').on('click', function() { $('#aso-deactivate-modal').remove(); });
        $('#aso-keep-data, #aso-remove-data').on('click', function() {
            var keep = $(this).attr('id') === 'aso-keep-data' ? '1' : '0';
            // Store choice in AJAX (option/transient)
            $.post(ajaxurl, {
                action: 'aso_set_deactivate_choice',
                keep_data: keep,
                security: asoDeactivate.nonce
            }, function() {
                // Proceed with original deactivate
                window.location = $link.attr('href');
            });
        });
    });
});
