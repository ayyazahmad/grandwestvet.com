(function($){
  $(document).ready(function(){
    $(document).ajaxSuccess(function(event, xhr, settings){
      try{
        if (!settings || !settings.url) return;
        if (settings.url.indexOf('ai1wmge_gdrive_browser') === -1) return;
        var json = xhr.responseJSON || (xhr.responseText ? JSON.parse(xhr.responseText) : null);
        if (!json || !json.current_folder) return;
        var name = json.current_folder.name || '';
        var id = json.current_folder.id || '';

        var $modal = $('#ai1wmge-settings-modal');
        if (!$modal.length) return;

        var $existing = $modal.find('.ai1wmge-current-folder');
        if (!$existing.length) {
          var $node = $('<div/>', { 'class': 'ai1wmge-current-folder', 'style': 'padding:8px 12px; font-weight:600;' });
          $modal.find('.ai1wmge-modal-content').prepend($node);
          $existing = $modal.find('.ai1wmge-current-folder');
        }

        var display = name ? ('Destination: ' + name) : 'Destination: (root)';
        $existing.text(display);
      }catch(e){
        return;
      }
    });
  });
})(jQuery);
