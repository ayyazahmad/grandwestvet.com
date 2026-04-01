(function($){
    'use strict';

    var data = window.WAS_SHORTCODE_BUILDER_DATA || {};
    var downloads = data.downloads || [];
    var categories = data.categories || [];
    var configs = data.configs || {};
    var nonces = data.nonces || {};
    var ajaxurl = data.ajaxurl || '';
    var translations = data.translations || {};

    function escapeAttr(str){
        if ( typeof str !== 'string' ) return '';
        return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;');
    }

    function buildModalTemplate(){
        var downloadOptions = downloads.map(function(d){
            return '<option value="' + escapeAttr(d.id) + '">' + escapeAttr(d.title) + '</option>';
        }).join('');

        var categoryOptions = categories.map(function(c){
            return '<option value="' + escapeAttr(c.slug) + '">' + escapeAttr(c.name) + '</option>';
        }).join('');

        var configOptions = '<option value="">' + escapeAttr(translations.selectConfig || '-- Select Configuration --') + '</option>';
        Object.keys(configs).forEach(function(key){
            configOptions += '<option value="' + escapeAttr(key) + '">' + escapeAttr(configs[key].name) + '</option>';
        });

        var html = [];
        
        html.push('<div id="was-shortcode-builder-modal" class="was-scroll-modal-overlay">');
        html.push('  <div class="was-scroll-modal-panel" role="dialog" aria-modal="true" aria-labelledby="was-shortcode-builder-title">');
        html.push('    <div class="aso-google-reviews-modal-header" style="display:flex;align-items:center;justify-content:space-between;padding:24px;border-bottom:1px solid #e2e8f0;background:linear-gradient(135deg,#f8fbff 0%,#eef2ff 100%);border-top-left-radius:12px;border-top-right-radius:12px;">');
        html.push('      <div>');
        html.push('        <span style="display:block;font-size:12px;letter-spacing:0.08em;font-weight:500;color:#64748b;text-transform:uppercase;margin-bottom:2px;">DOWNLOAD MANAGER</span>');
        html.push('        <span style="font-size:20px;font-weight:600;color:#0f172a;line-height:1.3;letter-spacing:-0.02em;">Build Shortcode</span>');
        html.push('      </div>');
        html.push('      <button type="button" class="was-shortcode-modal-close-btn" data-shortcode-builder-close aria-label="' + escapeAttr(translations.closeLabel || 'Close') + '" style="background:#ffffff;border:none;width:36px;height:36px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:24px;line-height:1;color:#666;box-shadow:0 1px 3px rgba(0, 0, 0, 0.1);transition:all 0.2s;cursor:pointer;">&times;</button>');
        html.push('    </div>');
        html.push('    <div class="was-scroll-modal-body">');
        html.push('      <div class="was-shortcode-config-row">');
        html.push('        <input type="text" id="was-shortcode-config-name" class="was-mcs-input" placeholder="' + escapeAttr(translations.configName || 'Configuration name') + '" />');
        html.push('        <div class="was-shortcode-config-select">');
        html.push('          <select id="was-shortcode-config-dropdown" class="was-mcs-input">' + configOptions + '</select>');
        html.push('          <button type="button" class="button button-secondary" id="was-shortcode-config-load" style="display:flex;align-items:center;justify-content:center;padding:0 16px;height:32px;line-height:1;white-space:nowrap;">' + escapeAttr(translations.loadBtn || 'Load') + '</button>');
        html.push('          <button type="button" class="button button-danger" id="was-shortcode-config-delete" style="display:flex;align-items:center;justify-content:center;padding:0 16px;height:32px;line-height:1;white-space:nowrap;margin-left:8px;">' + escapeAttr(translations.deleteBtn || 'Delete') + '</button>');
        html.push('        </div>');
        html.push('      </div>');
        html.push('      <div class="was-shortcode-tabs">');
        html.push('        <button type="button" class="was-shortcode-tab-btn was-shortcode-tab-active" data-tab="source">' + escapeAttr(translations.tabSource || 'Source') + '</button>');
        html.push('        <button type="button" class="was-shortcode-tab-btn" data-tab="layout">' + escapeAttr(translations.tabLayout || 'Layout') + '</button>');
        html.push('        <button type="button" class="was-shortcode-tab-btn" data-tab="style">' + escapeAttr(translations.tabStyle || 'Style') + '</button>');
        html.push('        <button type="button" class="was-shortcode-tab-btn" data-tab="button">' + escapeAttr(translations.tabButton || 'Button Style') + '</button>');
        html.push('        <button type="button" class="was-shortcode-tab-btn" data-tab="content">' + escapeAttr(translations.tabContent || 'Content Visibility') + '</button>');
        html.push('        <button type="button" class="was-shortcode-tab-btn" data-tab="advanced">' + escapeAttr(translations.tabAdvanced || 'Advanced') + '</button>');
        html.push('      </div>');
        html.push('      <div class="was-shortcode-tab-panels">');
        
        // SOURCE TAB
        html.push('        <div class="was-shortcode-tab-panel was-shortcode-tab-active" data-tab-panel="source">');
        // Removed intro text for Source tab
        html.push('          <div class="was-shortcode-display-type">');
        html.push('            <label class="was-shortcode-segmented-item">');
        html.push('              <input type="radio" name="was-shortcode-display-type" value="single" /> ' + escapeAttr(translations.singleDownload || 'Single Download'));
        html.push('            </label>');
        html.push('            <label class="was-shortcode-segmented-item">');
        html.push('              <input type="radio" name="was-shortcode-display-type" value="category" /> ' + escapeAttr(translations.categoryDownload || 'Download Category'));
        html.push('            </label>');
        html.push('            <label class="was-shortcode-segmented-item">');
        html.push('              <input type="radio" name="was-shortcode-display-type" value="all" checked /> ' + escapeAttr(translations.allDownloads || 'All Downloads'));
        html.push('            </label>');
        html.push('          </div>');
        html.push('          <div class="was-shortcode-source-single" data-conditional="single" hidden>');
        html.push('            <label style="display:flex;align-items:center;gap:6px;">' + escapeAttr(translations.selectDownload || 'Select Download') + '<span class="dashicons dashicons-editor-help" title="' + escapeAttr(translations.selectDownloadTooltip || 'Choose a specific download to display in the shortcode.') + '" style="color:#0ea5e9;cursor:help;font-size:14px;margin:0;"></span></label>');
        html.push('            <select id="was-shortcode-single-select" class="was-mcs-input">' + downloadOptions + '</select>');
        html.push('          </div>');
        html.push('          <div class="was-shortcode-source-category" data-conditional="category" hidden style="margin-bottom:20px;">');
        html.push('            <label style="display:flex;align-items:center;gap:6px;">' + escapeAttr(translations.selectCategory || 'Select Category') + '<span class="dashicons dashicons-editor-help" title="' + escapeAttr(translations.selectCategoryTooltip || 'Choose a category to display all downloads in that category.') + '" style="color:#0ea5e9;cursor:help;font-size:14px;margin:0;"></span></label>');
        html.push('            <select id="was-shortcode-category-select" class="was-mcs-input">' + categoryOptions + '</select>');
        html.push('          </div>');
        html.push('          <div class="was-shortcode-sorting-options" data-conditional-hide="single">');
        html.push('          <div class="was-shortcode-grid was-shortcode-grid--three">');
        html.push('            <div>');
        html.push('              <label style="display:flex;align-items:center;gap:6px;">' + escapeAttr(translations.orderBy || 'Order By') + '<span class="dashicons dashicons-editor-help" title="' + escapeAttr(translations.orderByTooltip || 'Choose how to sort downloads: by publication date, title, or download count.') + '" style="color:#0ea5e9;cursor:help;font-size:14px;margin:0;"></span></label>');
        html.push('              <select id="was-shortcode-order-by" class="was-mcs-input">');
        html.push('                <option value="date">' + escapeAttr(translations.orderDate || 'Date') + '</option>');
        html.push('                <option value="title">' + escapeAttr(translations.orderTitle || 'Title') + '</option>');
        html.push('                <option value="download_count">' + escapeAttr(translations.orderCount || 'Download Count') + '</option>');
        html.push('              </select>');
        html.push('            </div>');
        html.push('            <div>');
        html.push('              <label style="display:flex;align-items:center;gap:6px;">' + escapeAttr(translations.order || 'Order') + '<span class="dashicons dashicons-editor-help" title="' + escapeAttr(translations.orderTooltip || 'ASC = ascending (oldest first), DESC = descending (newest first).') + '" style="color:#0ea5e9;cursor:help;font-size:14px;margin:0;"></span></label>');
        html.push('              <select id="was-shortcode-order" class="was-mcs-input">');
        html.push('                <option value="ASC">ASC</option>');
        html.push('                <option value="DESC">DESC</option>');
        html.push('              </select>');
        html.push('            </div>');
        html.push('            <div>');
        html.push('              <label style="display:flex;align-items:center;gap:6px;">' + escapeAttr(translations.itemsLimit || 'Items Limit (-1 = all)') + '<span class="dashicons dashicons-editor-help" title="' + escapeAttr(translations.itemsLimitTooltip || 'Maximum number of downloads to display. Use -1 to show all downloads.') + '" style="color:#0ea5e9;cursor:help;font-size:14px;margin:0;"></span></label>');
        html.push('              <input type="number" id="was-shortcode-limit" class="was-mcs-input" value="-1" />');
        html.push('            </div>');
        html.push('          </div>');
        html.push('          </div>');
        html.push('        </div>');
        
        // LAYOUT TAB
        html.push('        <div class="was-shortcode-tab-panel" data-tab-panel="layout">');
        // Removed intro text for Layout tab
        html.push('          <label style="display:flex;align-items:center;gap:6px;">' + escapeAttr(translations.layoutLabel || 'Layout') + '<span class="dashicons dashicons-editor-help" title="Choose how to display downloads: List (rows), Grid (columns), Card (with details), or Compact (minimal)." style="color:#0ea5e9;cursor:help;font-size:14px;margin:0;"></span></label>');
        html.push('          <select id="was-shortcode-layout" class="was-mcs-input">');
        html.push('            <option value="list">List</option>');
        html.push('            <option value="grid">Grid</option>');
        html.push('            <option value="card">Card</option>');
        html.push('            <option value="compact">Compact</option>');
        html.push('          </select>');
        html.push('          <div class="was-shortcode-grid was-shortcode-grid--three">');
        html.push('            <div>');
        html.push('              <label style="display:flex;align-items:center;gap:6px;">' + escapeAttr(translations.desktopColumns || 'Desktop Columns') + '<span class="dashicons dashicons-editor-help" title="Number of columns on desktop screens (1920px and wider)." style="color:#0ea5e9;cursor:help;font-size:12px;margin:0;"></span></label>');
        html.push('              <input type="number" id="was-shortcode-columns-desktop" class="was-mcs-input" min="1" max="6" value="3" />');
        html.push('            </div>');
        html.push('            <div>');
        html.push('              <label style="display:flex;align-items:center;gap:6px;">' + escapeAttr(translations.tabletColumns || 'Tablet Columns') + '<span class="dashicons dashicons-editor-help" title="Number of columns on tablet screens (768px to 1919px)." style="color:#0ea5e9;cursor:help;font-size:12px;margin:0;"></span></label>');
        html.push('              <input type="number" id="was-shortcode-columns-tablet" class="was-mcs-input" min="1" max="4" value="2" />');
        html.push('            </div>');
        html.push('            <div>');
        html.push('              <label style="display:flex;align-items:center;gap:6px;">' + escapeAttr(translations.mobileColumns || 'Mobile Columns') + '<span class="dashicons dashicons-editor-help" title="Number of columns on mobile screens (less than 768px)." style="color:#0ea5e9;cursor:help;font-size:12px;margin:0;"></span></label>');
        html.push('              <input type="number" id="was-shortcode-columns-mobile" class="was-mcs-input" min="1" max="2" value="1" />');
        html.push('            </div>');
        html.push('          </div>');
        html.push('          <div class="was-shortcode-grid was-shortcode-grid--three">');
        html.push('            <div>');
        html.push('              <label style="display:flex;align-items:center;gap:6px;">' + escapeAttr(translations.columnGap || 'Column Gap') + '<span class="dashicons dashicons-editor-help" title="Horizontal spacing between columns (e.g., 24px)." style="color:#0ea5e9;cursor:help;font-size:12px;margin:0;"></span></label>');
        html.push('              <input type="text" id="was-shortcode-column-gap" class="was-mcs-input" value="24px" />');
        html.push('            </div>');
        html.push('            <div>');
        html.push('              <label style="display:flex;align-items:center;gap:6px;">' + escapeAttr(translations.rowGap || 'Row Gap') + '<span class="dashicons dashicons-editor-help" title="Vertical spacing between rows (e.g., 16px)." style="color:#0ea5e9;cursor:help;font-size:12px;margin:0;"></span></label>');
        html.push('              <input type="text" id="was-shortcode-row-gap" class="was-mcs-input" value="16px" />');
        html.push('            </div>');
        html.push('            <div>');
        html.push('              <label style="display:flex;align-items:center;gap:6px;">' + escapeAttr(translations.buttonAlign || 'Button Alignment') + '<span class="dashicons dashicons-editor-help" title="Position of the download button (left, center, or right)." style="color:#0ea5e9;cursor:help;font-size:12px;margin:0;"></span></label>');
        html.push('              <select id="was-shortcode-button-alignment" class="was-mcs-input">');
        html.push('                <option value="left">Left</option>');
        html.push('                <option value="center">Center</option>');
        html.push('                <option value="right">Right</option>');
        html.push('              </select>');
        html.push('            </div>');
        html.push('          </div>');
        html.push('        </div>');
        
        // BUTTON STYLE TAB
        html.push('        <div class="was-shortcode-tab-panel" data-tab-panel="button">');
        // Removed intro text for Button Style tab
        html.push('          <label style="display:flex;align-items:center;gap:6px;">' + escapeAttr(translations.buttonText || 'Button Text') + '<span class="dashicons dashicons-editor-help" title="Text displayed on the download button." style="color:#0ea5e9;cursor:help;font-size:14px;margin:0;"></span></label>');
        html.push('          <input type="text" id="was-shortcode-button-text" class="was-mcs-input" value="' + escapeAttr(translations.buttonTextDefault || 'Download') + '" />');
        html.push('          <div class="was-shortcode-button-states">');
        html.push('            <button type="button" class="was-shortcode-button-state was-shortcode-button-state--active" data-button-state="normal">' + escapeAttr(translations.normalState || 'Normal State') + '</button>');
        html.push('            <button type="button" class="was-shortcode-button-state" data-button-state="hover">' + escapeAttr(translations.hoverState || 'Hover State') + '</button>');
        html.push('          </div>');
        html.push('          <div class="was-shortcode-button-state-panel" data-state-panel="normal">');
        html.push('            <div class="was-shortcode-button-style-2col">');
        html.push('              <div class="was-shortcode-button-style-col-1">');
        html.push('                <div class="aso-color-picker-row">');
        html.push('                  <div class="aso-color-picker-field">');
        html.push('                    <label style="font-weight:500;font-size:13px;color:#0f172a;display:flex;align-items:center;gap:6px;margin:0;text-align:center;white-space:nowrap;">' + escapeAttr(translations.textColor || 'Text Color') + '<span class="dashicons dashicons-editor-help" title="Button text color." style="color:#0ea5e9;cursor:help;font-size:11px;margin:0;"></span></label>');
        html.push('                    <input type="color" class="aso-reviews-color-picker" id="was-shortcode-button-normal-text" value="#ffffff" />');
        html.push('                  </div>');
        html.push('                  <div class="aso-color-picker-field">');
        html.push('                    <label style="font-weight:500;font-size:13px;color:#0f172a;display:flex;align-items:center;gap:6px;margin:0;text-align:center;white-space:nowrap;">' + escapeAttr(translations.backgroundColor || 'Background Color') + '<span class="dashicons dashicons-editor-help" title="Button background color." style="color:#0ea5e9;cursor:help;font-size:11px;margin:0;"></span></label>');
        html.push('                    <input type="color" class="aso-reviews-color-picker" id="was-shortcode-button-normal-bg" value="#0073aa" />');
        html.push('                  </div>');
        html.push('                  <div class="aso-color-picker-field">');
        html.push('                    <label style="font-weight:500;font-size:13px;color:#0f172a;display:flex;align-items:center;gap:6px;margin:0;text-align:center;white-space:nowrap;">' + escapeAttr(translations.borderColor || 'Border Color') + '<span class="dashicons dashicons-editor-help" title="Button border color." style="color:#0ea5e9;cursor:help;font-size:11px;margin:0;"></span></label>');
        html.push('                    <input type="color" class="aso-reviews-color-picker" id="was-shortcode-button-normal-border" value="#0073aa" />');
        html.push('                  </div>');
        html.push('                </div>');
        html.push('              </div>');
        html.push('              <div class="was-shortcode-button-style-col-2">');
        html.push('                <div class="was-shortcode-button-size-fields">');
        html.push('                  <div>');
        html.push('                    <label style="font-weight:500;font-size:13px;color:#0f172a;display:block;margin-bottom:6px;"><span style="display:flex;align-items:center;gap:6px;">' + escapeAttr(translations.borderRadius || 'Border Radius') + '<span class="dashicons dashicons-editor-help" title="Rounded corners of the button." style="color:#0ea5e9;cursor:help;font-size:11px;margin:0;"></span></span></label>');
        html.push('                    <input type="number" id="was-shortcode-button-radius" class="was-mcs-input" value="8" style="height:32px;" />');
        html.push('                  </div>');
        html.push('                  <div>');
        html.push('                    <label style="font-weight:500;font-size:13px;color:#0f172a;display:block;margin-bottom:6px;"><span style="display:flex;align-items:center;gap:6px;">' + escapeAttr(translations.borderWidth || 'Border Width') + '<span class="dashicons dashicons-editor-help" title="Thickness of the button border." style="color:#0ea5e9;cursor:help;font-size:11px;margin:0;"></span></span></label>');
        html.push('                    <input type="number" id="was-shortcode-button-border" class="was-mcs-input" value="1" style="height:32px;" />');
        html.push('                  </div>');
        html.push('                </div>');
        html.push('              </div>');
        html.push('            </div>');
        html.push('          </div>');
        html.push('          <div class="was-shortcode-button-state-panel" data-state-panel="hover" hidden>');
        html.push('            <div class="was-shortcode-button-style-2col">');
        html.push('              <div class="was-shortcode-button-style-col-1">');
        html.push('                <div class="aso-color-picker-row">');
        html.push('                  <div class="aso-color-picker-field">');
        html.push('                    <label style="font-weight:500;font-size:13px;color:#0f172a;display:flex;align-items:center;gap:6px;margin:0;text-align:center;white-space:nowrap;">' + escapeAttr(translations.textColor || 'Text Color') + '<span class="dashicons dashicons-editor-help" title="Button text color on hover." style="color:#0ea5e9;cursor:help;font-size:11px;margin:0;"></span></label>');
        html.push('                    <input type="color" class="aso-reviews-color-picker" id="was-shortcode-button-hover-text" value="#ffffff" />');
        html.push('                  </div>');
        html.push('                  <div class="aso-color-picker-field">');
        html.push('                    <label style="font-weight:500;font-size:13px;color:#0f172a;display:flex;align-items:center;gap:6px;margin:0;text-align:center;white-space:nowrap;">' + escapeAttr(translations.backgroundColor || 'Background Color') + '<span class="dashicons dashicons-editor-help" title="Button background color on hover." style="color:#0ea5e9;cursor:help;font-size:11px;margin:0;"></span></label>');
        html.push('                    <input type="color" class="aso-reviews-color-picker" id="was-shortcode-button-hover-bg" value="#0f172a" />');
        html.push('                  </div>');
        html.push('                  <div class="aso-color-picker-field">');
        html.push('                    <label style="font-weight:500;font-size:13px;color:#0f172a;display:flex;align-items:center;gap:6px;margin:0;text-align:center;white-space:nowrap;">' + escapeAttr(translations.borderColor || 'Border Color') + '<span class="dashicons dashicons-editor-help" title="Button border color on hover." style="color:#0ea5e9;cursor:help;font-size:11px;margin:0;"></span></label>');
        html.push('                    <input type="color" class="aso-reviews-color-picker" id="was-shortcode-button-hover-border" value="#0f172a" />');
        html.push('                  </div>');
        html.push('                </div>');
        html.push('              </div>');
        html.push('            </div>');
        html.push('          </div>');
        html.push('          <div class="was-shortcode-grid was-shortcode-grid--three">');
        html.push('            <div>');
        html.push('              <label>' + escapeAttr(translations.fontSize || 'Font Size') + '</label>');
        html.push('              <input type="number" id="was-shortcode-button-font" class="was-mcs-input" value="14" />');
        html.push('            </div>');
        html.push('            <div>');
        html.push('              <label>' + escapeAttr(translations.paddingVertical || 'Padding (vertical)') + '</label>');
        html.push('              <input type="number" id="was-shortcode-button-padding-vertical" class="was-mcs-input" value="12" />');
        html.push('            </div>');
        html.push('            <div>');
        html.push('              <label>' + escapeAttr(translations.paddingHorizontal || 'Padding (horizontal)') + '</label>');
        html.push('              <input type="number" id="was-shortcode-button-padding-horizontal" class="was-mcs-input" value="24" />');
        html.push('            </div>');
        html.push('          </div>');
        html.push('        </div>');
        
        // CONTENT VISIBILITY TAB
        html.push('        <div class="was-shortcode-tab-panel" data-tab-panel="content">');
        // Removed intro text for Content Visibility tab
        html.push('          <div class="was-shortcode-checkbox-row">');
        html.push('            <label class="was-shortcode-checkbox"><input type="checkbox" id="was-shortcode-show-file-icon" checked /> <span style="display:flex;align-items:center;gap:4px;">' + escapeAttr(translations.showFileIcon || 'Show file icon') + '<span class="dashicons dashicons-editor-help" title="Display file type icon next to each download." style="color:#0ea5e9;cursor:help;font-size:12px;margin:0;"></span></span></label>');
        html.push('            <label class="was-shortcode-checkbox"><input type="checkbox" id="was-shortcode-show-description" checked /> <span style="display:flex;align-items:center;gap:4px;">' + escapeAttr(translations.showDescription || 'Show description') + '<span class="dashicons dashicons-editor-help" title="Display the download description text." style="color:#0ea5e9;cursor:help;font-size:12px;margin:0;"></span></span></label>');
        html.push('            <label class="was-shortcode-checkbox"><input type="checkbox" id="was-shortcode-show-file-size" checked /> <span style="display:flex;align-items:center;gap:4px;">' + escapeAttr(translations.showFileSize || 'Show file size') + '<span class="dashicons dashicons-editor-help" title="Display the file size for each download." style="color:#0ea5e9;cursor:help;font-size:12px;margin:0;"></span></span></label>');
        html.push('            <label class="was-shortcode-checkbox"><input type="checkbox" id="was-shortcode-show-download-count" checked /> <span style="display:flex;align-items:center;gap:4px;">' + escapeAttr(translations.showDownloadCount || 'Show download count') + '<span class="dashicons dashicons-editor-help" title="Display the total number of downloads." style="color:#0ea5e9;cursor:help;font-size:12px;margin:0;"></span></span></label>');
        html.push('            <label class="was-shortcode-checkbox"><input type="checkbox" id="was-shortcode-show-category-label" checked /> <span style="display:flex;align-items:center;gap:4px;">' + escapeAttr(translations.showCategoryLabel || 'Show category label') + '<span class="dashicons dashicons-editor-help" title="Display the download category name." style="color:#0ea5e9;cursor:help;font-size:12px;margin:0;"></span></span></label>');
        html.push('          </div>');
        html.push('          <div class="was-shortcode-grid was-shortcode-grid--two">');
        html.push('            <div>');
        html.push('              <label style="display:flex;align-items:center;gap:6px;">' + escapeAttr(translations.iconSize || 'Icon size') + '<span class="dashicons dashicons-editor-help" title="Set the width and height of the file icon in pixels." style="color:#0ea5e9;cursor:help;font-size:14px;margin:0;"></span></label>');
        html.push('              <input type="number" id="was-shortcode-icon-size" class="was-mcs-input" value="48" min="10" max="80" />');
        html.push('            </div>');
        html.push('            <div>');
        html.push('              <label style="display:flex;align-items:center;gap:6px;">' + escapeAttr(translations.iconPosition || 'Icon position') + '<span class="dashicons dashicons-editor-help" title="Choose whether to display the icon on the left or top of the content." style="color:#0ea5e9;cursor:help;font-size:14px;margin:0;"></span></label>');
        html.push('              <select id="was-shortcode-icon-position" class="was-mcs-input">');
        html.push('                <option value="left">Left</option>');
        html.push('                <option value="top">Top</option>');
        html.push('              </select>');
        html.push('            </div>');
        html.push('          </div>');
        html.push('          <div class="was-shortcode-grid was-shortcode-grid--four">');
        html.push('            <div>');
        html.push('              <label style="display:flex;align-items:center;gap:6px;">' + escapeAttr(translations.iconMarginTop || 'Top') + '<span class="dashicons dashicons-editor-help" title="Space above the icon in pixels." style="color:#0ea5e9;cursor:help;font-size:12px;margin:0;"></span></label>');
        html.push('              <input type="number" id="was-shortcode-icon-margin-top" class="was-mcs-input" value="6" min="0" max="50" />');
        html.push('            </div>');
        html.push('            <div>');
        html.push('              <label style="display:flex;align-items:center;gap:6px;">' + escapeAttr(translations.iconMarginRight || 'Right') + '<span class="dashicons dashicons-editor-help" title="Space to the right of the icon in pixels." style="color:#0ea5e9;cursor:help;font-size:12px;margin:0;"></span></label>');
        html.push('              <input type="number" id="was-shortcode-icon-margin-right" class="was-mcs-input" value="20" min="0" max="50" />');
        html.push('            </div>');
        html.push('            <div>');
        html.push('              <label style="display:flex;align-items:center;gap:6px;">' + escapeAttr(translations.iconMarginBottom || 'Bottom') + '<span class="dashicons dashicons-editor-help" title="Space below the icon in pixels." style="color:#0ea5e9;cursor:help;font-size:12px;margin:0;"></span></label>');
        html.push('              <input type="number" id="was-shortcode-icon-margin-bottom" class="was-mcs-input" value="6" min="0" max="50" />');
        html.push('            </div>');
        html.push('            <div>');
        html.push('              <label style="display:flex;align-items:center;gap:6px;">' + escapeAttr(translations.iconMarginLeft || 'Left') + '<span class="dashicons dashicons-editor-help" title="Space to the left of the icon in pixels." style="color:#0ea5e9;cursor:help;font-size:12px;margin:0;"></span></label>');
        html.push('              <input type="number" id="was-shortcode-icon-margin-left" class="was-mcs-input" value="10" min="0" max="50" />');
        html.push('            </div>');
        html.push('          </div>');
        html.push('        </div>');
        
        // STYLE TAB
        html.push('        <div class="was-shortcode-tab-panel" data-tab-panel="style">');
        // Removed intro text for Style tab
        html.push('          <div class="aso-color-picker-row">');
        html.push('            <div class="aso-color-picker-field">');
        html.push('              <label style="font-weight:500;font-size:13px;color:#0f172a;display:flex;align-items:center;gap:6px;margin:0;text-align:center;white-space:nowrap;">' + escapeAttr(translations.containerBackground || 'Background Color') + '<span class="dashicons dashicons-editor-help" title="Background color of the download container." style="color:#0ea5e9;cursor:help;font-size:12px;margin:0;"></span></label>');
        html.push('              <input type="color" class="aso-reviews-color-picker" id="was-shortcode-container-background" value="#ffffff" />');
        html.push('            </div>');
        html.push('            <div class="aso-color-picker-field">');
        html.push('              <label style="font-weight:500;font-size:13px;color:#0f172a;display:flex;align-items:center;gap:6px;margin:0;text-align:center;white-space:nowrap;">' + escapeAttr(translations.containerBorder || 'Border color') + '<span class="dashicons dashicons-editor-help" title="Border color around the download container." style="color:#0ea5e9;cursor:help;font-size:12px;margin:0;"></span></label>');
        html.push('              <input type="color" class="aso-reviews-color-picker" id="was-shortcode-container-border" value="#e5e7eb" />');
        html.push('            </div>');
        html.push('            <div class="aso-color-picker-field">');
        html.push('              <label style="font-weight:500;font-size:13px;color:#0f172a;display:block;margin-bottom:4px;"><span style="display:flex;align-items:center;gap:6px;">' + escapeAttr(translations.containerRadius || 'Border radius') + '<span class="dashicons dashicons-editor-help" title="Rounded corners of the container (in pixels)." style="color:#0ea5e9;cursor:help;font-size:12px;margin:0;"></span></span></label>');
        html.push('              <input type="number" id="was-shortcode-container-radius" class="was-mcs-input" value="12" style="height:32px;" />');
        html.push('            </div>');
        html.push('            <div class="aso-color-picker-field">');
        html.push('              <label style="font-weight:500;font-size:13px;color:#0f172a;display:block;margin-bottom:4px;"><span style="display:flex;align-items:center;gap:6px;">' + escapeAttr(translations.boxShadow || 'Box shadow') + '<span class="dashicons dashicons-editor-help" title="Shadow effect around the download container." style="color:#0ea5e9;cursor:help;font-size:12px;margin:0;"></span></span></label>');
        html.push('              <select id="was-shortcode-box-shadow" class="was-mcs-input" style="height:32px;">');
        html.push('                <option value="none">None</option>');
        html.push('                <option value="light">Light</option>');
        html.push('                <option value="medium">Medium</option>');
        html.push('              </select>');
        html.push('            </div>');
        html.push('          </div>');
        html.push('          <div class="was-shortcode-grid was-shortcode-grid--three">');
        html.push('            <div>');
        html.push('              <label style="display:flex;align-items:center;gap:6px;">' + escapeAttr(translations.titleFontSize || 'Title font size') + '<span class="dashicons dashicons-editor-help" title="Font size of the download title in pixels." style="color:#0ea5e9;cursor:help;font-size:12px;margin:0;"></span></label>');
        html.push('              <input type="number" id="was-shortcode-title-font" class="was-mcs-input" value="18" />');
        html.push('            </div>');
        html.push('            <div>');
        html.push('              <label style="display:flex;align-items:center;gap:6px;">' + escapeAttr(translations.descriptionFontSize || 'Description font size') + '<span class="dashicons dashicons-editor-help" title="Font size of the description text in pixels." style="color:#0ea5e9;cursor:help;font-size:12px;margin:0;"></span></label>');
        html.push('              <input type="number" id="was-shortcode-description-font" class="was-mcs-input" value="14" />');
        html.push('            </div>');
        html.push('            <div>');
        html.push('              <label style="display:flex;align-items:center;gap:6px;">' + escapeAttr(translations.fontWeight || 'Font weight') + '<span class="dashicons dashicons-editor-help" title="Thickness of the text (400=normal, 700=bold)." style="color:#0ea5e9;cursor:help;font-size:12px;margin:0;"></span></label>');
        html.push('              <select id="was-shortcode-font-weight" class="was-mcs-input">');
        html.push('                <option value="400">400</option>');
        html.push('                <option value="500">500</option>');
        html.push('                <option value="600">600</option>');
        html.push('                <option value="700">700</option>');
        html.push('              </select>');
        html.push('            </div>');
        html.push('          </div>');
        html.push('        </div>');
        
        // ADVANCED TAB
        html.push('        <div class="was-shortcode-tab-panel" data-tab-panel="advanced">');
        // Removed intro text for Advanced tab
        html.push('          <div class="was-shortcode-advanced-row-three">');
        html.push('            <label class="was-shortcode-checkbox">');
        html.push('              <input type="checkbox" id="was-shortcode-open-new-tab" checked /> <span style="display:flex;align-items:center;gap:4px;">' + escapeAttr(translations.openNewTab || 'Open download in new tab') + '<span class="dashicons dashicons-editor-help" title="Open the download link in a new browser tab." style="color:#0ea5e9;cursor:help;font-size:12px;margin:0;"></span></span>');
        html.push('            </label>');
        html.push('            <label class="was-shortcode-checkbox">');
        html.push('              <input type="checkbox" id="was-shortcode-force-download" /> <span style="display:flex;align-items:center;gap:4px;">' + escapeAttr(translations.forceDownload || 'Force download') + '<span class="dashicons dashicons-editor-help" title="Force the file to download instead of opening in the browser." style="color:#0ea5e9;cursor:help;font-size:12px;margin:0;"></span></span>');
        html.push('            </label>');
        html.push('            <label class="was-shortcode-checkbox">');
        html.push('              <input type="checkbox" id="was-shortcode-enable-pagination" /> <span style="display:flex;align-items:center;gap:4px;">' + escapeAttr(translations.enablePagination || 'Enable pagination') + '<span class="dashicons dashicons-editor-help" title="Show pagination controls to browse through downloads." style="color:#0ea5e9;cursor:help;font-size:12px;margin:0;"></span></span>');
        html.push('            </label>');
        html.push('          </div>');
        html.push('          <div class="was-shortcode-advanced-row-pagination">');
        html.push('            <label class="was-shortcode-checkbox">');
        html.push('              <input type="checkbox" id="was-shortcode-disable-counter" /> <span style="display:flex;align-items:center;gap:4px;">' + escapeAttr(translations.disableCounter || 'Disable download counter for this shortcode') + '<span class="dashicons dashicons-editor-help" title="Do not count downloads triggered from this shortcode." style="color:#0ea5e9;cursor:help;font-size:12px;margin:0;"></span></span>');
        html.push('            </label>');
        html.push('            <div class="was-shortcode-pagination-type-row" id="was-shortcode-pagination-type-row" hidden>');
        html.push('              <label style="font-weight:500;font-size:13px;color:#0f172a;display:block;margin-bottom:6px;"><span style="display:flex;align-items:center;gap:6px;">' + escapeAttr(translations.paginationType || 'Pagination type') + '<span class="dashicons dashicons-editor-help" title="Numbers = page numbers, Load More = infinite scroll button." style="color:#0ea5e9;cursor:help;font-size:12px;margin:0;"></span></span></label>');
        html.push('              <select id="was-shortcode-pagination-type" class="was-mcs-input" style="height:32px;width:100%;">');
        html.push('                <option value="numbers">Numbers</option>');
        html.push('                <option value="load_more">Load More</option>');
        html.push('              </select>');
        html.push('            </div>');
        html.push('          </div>');
        html.push('          <label style="display:flex;align-items:center;gap:6px;">' + escapeAttr(translations.customClass || 'Custom CSS class') + '<span class="dashicons dashicons-editor-help" title="Add custom CSS class names for additional styling." style="color:#0ea5e9;cursor:help;font-size:12px;margin:0;"></span></label>');
        html.push('          <input type="text" id="was-shortcode-custom-class" class="was-mcs-input" />');
        html.push('        </div>');
        
        html.push('      </div>');
        html.push('      <div class="was-shortcode-output-row">');
        html.push('        <label>' + escapeAttr(translations.generatedShortcode || 'Generated shortcode') + '</label>');
        html.push('        <div class="was-shortcode-output-container">');
        html.push('          <textarea id="was-shortcode-output" class="was-mcs-input" readonly></textarea>');
        html.push('          <button type="button" class="button button-secondary" id="was-shortcode-copy" style="flex-shrink: 0; margin-top: 0; height: 50px; padding: 0 16px; white-space: nowrap;">' + escapeAttr(translations.copyButton || 'Copy shortcode') + '</button>');
        html.push('        </div>');
        html.push('        <p style="margin: 12px 0 0 0; font-size: 12px; color: #64748b; line-height: 1.5;"> ' + escapeAttr(translations.shortcodeHint || 'Copy the shortcode above and paste it into your page or post content editor to display downloads.') + '</p>');
        html.push('      </div>');
        html.push('    </div>');
        html.push('    <div class="was-scroll-modal-footer">');
        html.push('      <div id="was-shortcode-footer-message" style="flex:1;text-align:left;font-size:13px;color:#28a745;display:none;font-weight:500;"></div>');
        html.push('      <button type="button" class="button button-secondary" data-shortcode-builder-close>' + escapeAttr(translations.cancel || 'Cancel') + '</button>');
        html.push('      <button type="button" class="button button-primary was-shortcode-save" disabled>' + escapeAttr(translations.save || 'Save Shortcode') + '</button>');
        html.push('    </div>');
        html.push('  </div>');
        html.push('</div>');
        
        return html.join('');
    }

    function buildDefaults() {
        return {
            configName: '',
            displayType: 'all',
            downloadId: '',
            categorySlug: '',
            orderBy: 'date',
            order: 'DESC',
            itemsLimit: '-1',
            layout: 'list',
            columnsDesktop: '3',
            columnsTablet: '2',
            columnsMobile: '1',
            columnGap: '24px',
            rowGap: '16px',
            buttonAlignment: 'left',
            buttonText: translations.buttonTextDefault || 'Download',
            buttonNormalTextColor: '#ffffff',
            buttonNormalBackground: '#0073aa',
            buttonNormalBorder: '#0073aa',
            buttonHoverTextColor: '#ffffff',
            buttonHoverBackground: '#0f172a',
            buttonHoverBorder: '#0f172a',
            borderRadius: '8',
            borderWidth: '1',
            fontSize: '14',
            paddingVertical: '12',
            paddingHorizontal: '24',
            showFileIcon: true,
            showDescription: true,
            showFileSize: true,
            showDownloadCount: true,
            showCategoryLabel: true,
            iconSize: '48',
            iconPosition: 'left',
            iconMarginTop: '6',
            iconMarginRight: '20',
            iconMarginBottom: '6',
            iconMarginLeft: '10',
            containerBackground: '#ffffff',
            containerBorderColor: '#e5e7eb',
            containerBorderRadius: '12',
            containerBoxShadow: 'light',
            titleFontSize: '18',
            descriptionFontSize: '14',
            fontWeight: '500',
            customClass: '',
            enablePagination: false,
            paginationType: 'numbers',
            openNewTab: true,
            forceDownload: false,
            disableDownloadCounter: false
        };
    }

    function applyConfig(state, config) {
        Object.keys(config).forEach(function(key){
            if ( key in state ) {
                state[key] = config[key];
            }
        });
    }

    function openShortcodeBuilderModal(){
        var tempContainer = document.createElement('div');
        var modalHTML = buildModalTemplate();
        console.log('[Shortcode Builder] Modal HTML length:', modalHTML.length);
        tempContainer.innerHTML = modalHTML;
        var overlay = tempContainer.firstElementChild;
        
        // Inject comprehensive inline styles for the modal
        var style = document.createElement('style');
        style.textContent = `
            #was-shortcode-builder-modal * {
                box-sizing: border-box;
            }
            
            /* Modal Header - Google Reviews Style */
            #was-shortcode-builder-modal .was-scroll-modal-header {
                background: linear-gradient(135deg, #f8fbff 0%, #eef2ff 100%) !important;
                padding: 24px !important;
                border-bottom: 1px solid #e2e8f0 !important;
                margin-bottom: 0 !important;
            }
            #was-shortcode-builder-modal .aso-google-reviews-modal-header > div {
                display: flex !important;
                align-items: flex-start !important;
                justify-content: space-between !important;
                flex-direction: column !important;
                flex: 1 !important;
            }
            #was-shortcode-builder-modal .aso-google-reviews-modal-header span:first-child {
                display: block !important;
                font-size: 12px !important;
                letter-spacing: 0.08em !important;
                font-weight: 500 !important;
                color: #64748b !important;
                text-transform: uppercase !important;
                margin: 0 0 2px 0 !important;
                line-height: 1.4 !important;
            }
            #was-shortcode-builder-modal .aso-google-reviews-modal-header span:nth-child(2) {
                display: block !important;
                font-size: 20px !important;
                font-weight: 600 !important;
                color: #0f172a !important;
                margin: 0 !important;
                line-height: 1.3 !important;
                letter-spacing: -0.02em !important;
            }
            #was-shortcode-builder-modal .was-scroll-modal-header h2 {
                margin: 0 !important;
                font-size: 20px !important;
                font-weight: 600 !important;
                color: #0f172a !important;
            }
            #was-shortcode-builder-modal .was-scroll-close {
                background: none !important;
                border: none !important;
                font-size: 24px !important;
                cursor: pointer !important;
                color: #666 !important;
                padding: 0 !important;
                width: 32px !important;
                height: 32px !important;
                display: flex !important;
                align-items: center !important;
                justify-content: center !important;
                transition: color 0.2s !important;
            }
            #was-shortcode-builder-modal .was-scroll-close:hover {
                color: #000 !important;
            }
            
            /* Tabs */
            #was-shortcode-builder-modal .was-shortcode-tabs {
                display: flex !important;
                gap: 4px !important;
                margin: 0 0 16px 0 !important;
                border-bottom: 2px solid #e2e8f0 !important;
                padding-bottom: 0 !important;
            }
            #was-shortcode-builder-modal .was-shortcode-tab-btn {
                display: inline-flex !important;
                background: transparent !important;
                border: none !important;
                border-bottom: 3px solid transparent !important;
                padding: 10px 14px !important;
                font-size: 14px !important;
                font-weight: 500 !important;
                color: #666 !important;
                cursor: pointer !important;
                margin: 0 !important;
                transition: all 0.25s ease !important;
                white-space: nowrap !important;
                min-height: 36px !important;
            }
            #was-shortcode-builder-modal .was-shortcode-tab-btn.was-shortcode-tab-active {
                color: #0b82c4 !important;
                border-bottom-color: #0ea5e9 !important;
                font-weight: 700 !important;
            }
            #was-shortcode-builder-modal .was-shortcode-tab-btn:hover {
                color: #0b82c4 !important;
                border-bottom-color: #cbd5e1 !important;
            }
            
            /* Tab Panels */
            #was-shortcode-builder-modal .was-shortcode-tab-panel {
                display: none !important;
                animation: fadeIn 0.2s ease;
            }
            #was-shortcode-builder-modal .was-shortcode-tab-panel.was-shortcode-tab-active {
                display: block !important;
            }
            
            /* Config Row - Single line */
            #was-shortcode-builder-modal .was-shortcode-config-row {
                display: flex !important;
                gap: 8px !important;
                margin-bottom: 12px !important;
                flex-wrap: nowrap !important;
                padding: 0 !important;
                background: transparent !important;
                border: none !important;
                align-items: center !important;
            }
            #was-shortcode-builder-modal .was-shortcode-config-row > input {
                flex: 0 1 200px !important;
                min-width: 150px !important;
                height: 32px !important;
                padding: 6px 10px !important;
                margin-bottom: 0 !important;
            }
            #was-shortcode-builder-modal .was-shortcode-config-select {
                display: flex !important;
                gap: 6px !important;
                flex: 0 1 auto !important;
                align-items: center !important;
            }
            #was-shortcode-builder-modal .was-shortcode-config-select select {
                flex: 0 1 220px !important;
                min-width: 150px !important;
                height: 32px !important;
                padding: 6px 10px !important;
                margin-bottom: 0 !important;
            }
            #was-shortcode-builder-modal .was-shortcode-config-select button {
                height: 32px !important;
                padding: 6px 12px !important;
                font-size: 12px !important;
                margin: 0 !important;
            }
            
            /* Close Button */
            #was-shortcode-builder-modal .was-shortcode-modal-close-btn:hover {
                background: #f1f5f9 !important;
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15) !important;
                color: #000 !important;
            }
            
            /* Form Elements */
            #was-shortcode-builder-modal .was-mcs-input {
                display: block !important;
                width: 100% !important;
                padding: 6px 10px !important;
                border: 1px solid #d1d5db !important;
                border-radius: 6px !important;
                font-size: 12px !important;
                font-family: inherit !important;
                transition: all 0.2s ease !important;
                margin-bottom: 0 !important;
                color: #0f172a !important;
                background: white !important;
                height: 32px !important;
            }
            #was-shortcode-builder-modal .was-mcs-input:focus {
                outline: none !important;
                border-color: #0ea5e9 !important;
                box-shadow: 0 0 0 2px rgba(14, 165, 233, 0.1) !important;
            }
            
            /* Labels */
            #was-shortcode-builder-modal label {
                display: block !important;
                font-size: 13px !important;
                font-weight: 500 !important;
                color: #0f172a !important;
                margin-bottom: 4px !important;
                letter-spacing: 0 !important;
            }
            #was-shortcode-builder-modal .aso-color-picker-field label {
                font-size: 13px !important;
                font-weight: 500 !important;
            }
            
            /* Tab Description */
            #was-shortcode-builder-modal .was-shortcode-tab-description {
                margin: 0 0 12px 0 !important;
                padding: 8px 10px !important;
                font-size: 12px !important;
                color: #6b7280 !important;
                line-height: 1.4 !important;
                background: #f8fafc !important;
                border-left: 3px solid #0ea5e9 !important;
                border-radius: 4px !important;
            }
            
            /* Grids */
            #was-shortcode-builder-modal .was-shortcode-grid {
                display: grid !important;
                gap: 8px !important;
                margin-bottom: 12px !important;
                padding: 0 !important;
                background: transparent !important;
                border: none !important;
            }
            #was-shortcode-builder-modal .was-shortcode-grid--two {
                grid-template-columns: repeat(2, 1fr) !important;
            }
            #was-shortcode-builder-modal .was-shortcode-grid--three {
                grid-template-columns: repeat(3, 1fr) !important;
            }
            #was-shortcode-builder-modal .was-shortcode-grid--four {\n                grid-template-columns: repeat(4, 1fr) !important;\n            }\n            #was-shortcode-builder-modal .was-shortcode-grid > div {
                display: flex !important;
                flex-direction: column !important;
                gap: 4px !important;
            }
            
            /* 2-Column Button Style Layout */
            #was-shortcode-builder-modal .was-shortcode-button-style-2col {
                display: flex !important;
                flex-direction: row !important;
                gap: 40px !important;
                margin-bottom: 20px !important;
                padding: 0 !important;
                background: transparent !important;
                border: none !important;
            }
            #was-shortcode-builder-modal .was-shortcode-button-style-col-1 {
                flex: 1.5 !important;
                min-width: 0 !important;
            }
            #was-shortcode-builder-modal .was-shortcode-button-style-col-2 {
                flex: 1 !important;
                min-width: 0 !important;
                display: flex !important;
                align-items: flex-start !important;
            }
            #was-shortcode-builder-modal .was-shortcode-button-size-fields {
                display: flex !important;
                flex-direction: row !important;
                gap: 16px !important;
                width: 100% !important;
            }
            #was-shortcode-builder-modal .was-shortcode-button-size-fields > div {
                flex: 1 !important;
            }
            
            /* Color Pickers */
            #was-shortcode-builder-modal .aso-color-picker-row {
                display: flex !important;
                flex-direction: row !important;
                flex-wrap: nowrap !important;
                gap: 32px !important;
                align-items: flex-start !important;
                justify-content: flex-start !important;
                margin-bottom: 0 !important;
                margin-top: 0px !important;
                padding: 0 !important;
                background: transparent !important;
                border: none !important;
            }
            #was-shortcode-builder-modal .aso-color-picker-field {
                display: flex !important;
                flex-direction: column !important;
                gap: 8px !important;
                align-items: center !important;
                flex: 1 !important;
                min-width: 0 !important;
            }
            #was-shortcode-builder-modal .aso-color-picker-field label {
                font-weight: 500 !important;
                font-size: 13px !important;
                color: #0f172a !important;
                display: block !important;
                margin: 0 !important;
                text-align: center !important;
                white-space: nowrap !important;
                letter-spacing: 0 !important;
                font-family: Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
            }
            #was-shortcode-builder-modal input[type="color"] {
                width: 48px !important;
                height: 48px !important;
                padding: 0 !important;
                border-radius: 999px !important;
                border: 2px solid #d7deeb !important;
                cursor: pointer !important;
                margin: 0 !important;
                transition: all 0.2s ease !important;
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08) !important;
                appearance: none !important;
                -webkit-appearance: none !important;
                -moz-appearance: none !important;
                background: none !important;
                outline: none !important;
                box-sizing: border-box !important;
                position: relative !important;
                display: block !important;
            }
            #was-shortcode-builder-modal input[type="color"]::-webkit-color-swatch-wrapper {
                padding: 0 !important;
                margin: 0 !important;
                border: none !important;
            }
            #was-shortcode-builder-modal input[type="color"]::-webkit-color-swatch {
                border: none !important;
                border-radius: 999px !important;
                margin: 0 !important;
                padding: 0 !important;
            }
            #was-shortcode-builder-modal input[type="color"]::-moz-color-swatch {
                border: none !important;
                border-radius: 999px !important;
                margin: 0 !important;
                padding: 0 !important;
            }
            #was-shortcode-builder-modal input[type="color"]::-moz-color-swatch-wrapper {
                border: none !important;
                margin: 0 !important;
                padding: 0 !important;
            }
            #was-shortcode-builder-modal input[type="color"]:hover {
                border-color: #0073aa !important;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12) !important;
            }
            #was-shortcode-builder-modal input[type="color"]:focus {
                outline: none !important;
                border-color: #0073aa !important;
                box-shadow: 0 0 0 3px rgba(0, 115, 170, 0.2) !important;
            }
            
            /* Segmented Controls */
            #was-shortcode-builder-modal .was-shortcode-display-type,
            #was-shortcode-builder-modal .was-shortcode-button-states {
                display: flex !important;
                gap: 6px !important;
                margin-bottom: 12px !important;
                margin-top: 8px !important;
                flex-wrap: wrap !important;
                padding: 0 !important;
                background: transparent !important;
                border: none !important;
            }
            #was-shortcode-builder-modal .was-shortcode-segmented-item,
            #was-shortcode-builder-modal .was-shortcode-button-state {
                padding: 8px 12px !important;
                border: 2px solid #d1d5db !important;
                border-radius: 5px !important;
                font-size: 12px !important;
                font-weight: 600 !important;
                cursor: pointer !important;
                transition: all 0.25s ease !important;
                background: white !important;
                user-select: none !important;
                flex: 1 !important;
                min-width: 100px !important;
                text-align: center !important;
                height: 32px !important;
                display: flex !important;
                align-items: center !important;
                justify-content: center !important;
            }
            #was-shortcode-builder-modal .was-shortcode-segmented-item:hover,
            #was-shortcode-builder-modal .was-shortcode-button-state:hover {
                border-color: #0ea5e9 !important;
                background: #f0f9ff !important;
            }
            #was-shortcode-builder-modal .was-shortcode-segmented-item:has(input[type="radio"]:checked),
            #was-shortcode-builder-modal .was-shortcode-button-state.was-shortcode-button-state--active {
                background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%) !important;
                border-color: #0284c7 !important;
                color: white !important;
                font-weight: 700 !important;
                box-shadow: 0 2px 8px rgba(14, 165, 233, 0.2) !important;
            }
            
            /* Checkboxes */
            #was-shortcode-builder-modal .was-shortcode-checkbox-row {
                display: flex !important;
                flex-wrap: wrap !important;
                gap: 12px !important;
                margin-bottom: 12px !important;
                padding: 0 !important;
                background: transparent !important;
                border: none !important;
            }
            
            /* Advanced Tab - 3 Checkboxes in First Row */
            #was-shortcode-builder-modal .was-shortcode-advanced-row-three {
                display: grid !important;
                grid-template-columns: 1fr 1fr 1fr !important;
                gap: 16px !important;
                margin-bottom: 20px !important;
                padding: 0 !important;
                background: transparent !important;
                border: none !important;
            }
            
            /* Advanced Tab - Pagination Row (2 Columns) */
            #was-shortcode-builder-modal .was-shortcode-advanced-row-pagination {
                display: grid !important;
                grid-template-columns: 1fr 1fr !important;
                gap: 16px !important;
                margin-bottom: 20px !important;
                padding: 0 !important;
                background: transparent !important;
                border: none !important;
                align-items: start !important;
            }
            
            #was-shortcode-builder-modal .was-shortcode-checkbox {
                display: flex !important;
                align-items: center !important;
                gap: 6px !important;
                font-size: 13px !important;
                font-weight: 400 !important;
                cursor: pointer !important;
                padding: 0 !important;
                user-select: none !important;
                margin-bottom: 0 !important;
                color: #0f172a !important;
            }
            #was-shortcode-builder-modal .was-shortcode-checkbox input[type="checkbox"] {
                width: 16px !important;
                height: 16px !important;
                cursor: pointer !important;
                flex-shrink: 0 !important;
                accent-color: #0ea5e9 !important;
            }
            
            /* Pagination Type Row */
            #was-shortcode-builder-modal .was-shortcode-pagination-type-row {
                display: block !important;
                padding: 0 !important;
                background: transparent !important;
                border: none !important;
            }
            
            #was-shortcode-builder-modal .was-shortcode-pagination-type-row[hidden] {
                display: none !important;
            }
            
            /* Button State Panels */
            #was-shortcode-builder-modal .was-shortcode-button-state-panel {
                margin-bottom: 12px !important;
                margin-top: 8px !important;
                padding: 10px !important;
                background: linear-gradient(135deg, #f0f9ff 0%, #f9fafb 100%) !important;
                border: 1px solid #bfdbfe !important;
                border-radius: 6px !important;
            }
            #was-shortcode-builder-modal .was-shortcode-button-state-panel[hidden] {
                display: none !important;
            }
            
            /* Output Row */
            #was-shortcode-builder-modal .was-shortcode-output-row {
                margin-top: 12px !important;
                padding-top: 12px !important;
                border-top: 1px solid #e2e8f0 !important;
            }
            #was-shortcode-builder-modal .was-shortcode-output-row > label {
                display: block !important;
                font-size: 11px !important;
                font-weight: 700 !important;
                color: #0f172a !important;
                margin-bottom: 4px !important;
            }
            #was-shortcode-builder-modal .was-shortcode-output-container {
                display: flex !important;
                gap: 8px !important;
                align-items: flex-start !important;
            }
            #was-shortcode-builder-modal #was-shortcode-output {
                font-family: "Monaco", "Courier New", monospace !important;
                font-size: 11px !important;
                min-height: 50px !important;
                padding: 8px !important;
                background: #ffffff !important;
                color: #757575 !important;
                border: 1px solid #e5e7eb !important;
                border-radius: 4px !important;
                margin-bottom: 0 !important;
                flex: 1 !important;
            }
            #was-shortcode-builder-modal #was-shortcode-copy {
                padding: 8px 16px !important;
                border-radius: 10px !important;
                border: 1px solid #0073aa !important;
                font-size: 13px !important;
                font-weight: 600 !important;
                cursor: pointer !important;
                transition: all 0.2s !important;
                min-width: 110px !important;
                display: inline-flex !important;
                align-items: center !important;
                justify-content: center !important;
                height: 38px !important;
                background-color: transparent !important;
                color: #0073aa !important;
                flex-shrink: 0 !important;
                margin-top: 0 !important;
                white-space: nowrap !important;
            }
            #was-shortcode-builder-modal #was-shortcode-copy:hover {
                background-color: rgba(0, 115, 170, 0.08) !important;
                border-color: #005a87 !important;
                color: #005a87 !important;
            }
                width: 100% !important;
            }
            
            /* Source sections */
            #was-shortcode-builder-modal .was-shortcode-source-single,
            #was-shortcode-builder-modal .was-shortcode-source-category {
                padding: 10px !important;
                margin-bottom: 12px !important;
                background: #f0f9ff !important;
                border-left: 3px solid #0ea5e9 !important;
                border-radius: 4px !important;
            }
            #was-shortcode-builder-modal .was-shortcode-source-single label,
            #was-shortcode-builder-modal .was-shortcode-source-category label {
                display: block !important;
                margin-bottom: 4px !important;
                font-size: 11px !important;
                font-weight: 700 !important;
                color: #0f172a !important;
            }
            
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
        `;
        document.head.appendChild(style);
        
        document.body.appendChild(overlay);
        var modal = overlay.querySelector('.was-scroll-modal-panel');
        
        // Ensure modal body doesn't overflow
        var modalBody = modal.querySelector('.was-scroll-modal-body');
        if (modalBody) {
            modalBody.style.padding = '12px 16px';
        }
        
        var tabBtns = modal.querySelectorAll('.was-shortcode-tab-btn');
        console.log('[Shortcode Builder] Found tab buttons:', tabBtns.length);
        var footerMessage = modal.querySelector('#was-shortcode-footer-message');
        var saveButton = modal.querySelector('.was-shortcode-save');
        var shortcodeData = window.WAS_SHORTCODE_BUILDER_DATA || {};
        var isFreeEdition = !!shortcodeData.isFree;
        var upgradeUrl = shortcodeData.upgradeUrl || '';
        var copyButton = modal.querySelector('#was-shortcode-copy');
        var configNameInput = modal.querySelector('#was-shortcode-config-name');
        var configDropdown = modal.querySelector('#was-shortcode-config-dropdown');
        var state = buildDefaults();

        function setActiveTab(name){
            modal.querySelectorAll('.was-shortcode-tab-btn').forEach(function(btn){
                if (btn.dataset.tab === name) {
                    btn.classList.add('was-shortcode-tab-active');
                } else {
                    btn.classList.remove('was-shortcode-tab-active');
                }
            });
            modal.querySelectorAll('[data-tab-panel]').forEach(function(panel){
                if (panel.dataset.tabPanel === name) {
                    panel.classList.add('was-shortcode-tab-active');
                    panel.style.display = 'block';
                } else {
                    panel.classList.remove('was-shortcode-tab-active');
                    panel.style.display = 'none';
                }
            });
        }

        function setButtonStatePanel(name){
            modal.querySelectorAll('[data-state-panel]').forEach(function(panel){
                panel.hidden = panel.dataset.statePanel !== name;
            });
            modal.querySelectorAll('.was-shortcode-button-state').forEach(function(button){
                button.classList.toggle('was-shortcode-button-state--active', button.dataset.buttonState === name);
            });
        }

        function toggleConditional(){
            modal.querySelectorAll('[data-conditional]').forEach(function(section){
                var condition = section.dataset.conditional;
                section.hidden = state.displayType !== condition;
            });
            // Hide sorting options when single download is selected
            var sortingOptions = modal.querySelector('.was-shortcode-sorting-options');
            if ( sortingOptions ) {
                sortingOptions.hidden = state.displayType === 'single';
            }
        }

        function syncState(){
            state.displayType = modal.querySelector('input[name="was-shortcode-display-type"]:checked').value;
            state.downloadId = modal.querySelector('#was-shortcode-single-select').value;
            state.categorySlug = modal.querySelector('#was-shortcode-category-select').value;
            state.orderBy = modal.querySelector('#was-shortcode-order-by').value;
            state.order = modal.querySelector('#was-shortcode-order').value;
            state.itemsLimit = modal.querySelector('#was-shortcode-limit').value;
            state.layout = modal.querySelector('#was-shortcode-layout').value;
            state.columnsDesktop = modal.querySelector('#was-shortcode-columns-desktop').value;
            state.columnsTablet = modal.querySelector('#was-shortcode-columns-tablet').value;
            state.columnsMobile = modal.querySelector('#was-shortcode-columns-mobile').value;
            state.columnGap = modal.querySelector('#was-shortcode-column-gap').value;
            state.rowGap = modal.querySelector('#was-shortcode-row-gap').value;
            state.buttonAlignment = modal.querySelector('#was-shortcode-button-alignment').value;
            state.buttonText = modal.querySelector('#was-shortcode-button-text').value;
            state.buttonNormalTextColor = modal.querySelector('#was-shortcode-button-normal-text').value;
            state.buttonNormalBackground = modal.querySelector('#was-shortcode-button-normal-bg').value;
            state.buttonNormalBorder = modal.querySelector('#was-shortcode-button-normal-border').value;
            state.buttonHoverTextColor = modal.querySelector('#was-shortcode-button-hover-text').value;
            state.buttonHoverBackground = modal.querySelector('#was-shortcode-button-hover-bg').value;
            state.buttonHoverBorder = modal.querySelector('#was-shortcode-button-hover-border').value;
            state.borderRadius = modal.querySelector('#was-shortcode-button-radius').value;
            state.borderWidth = modal.querySelector('#was-shortcode-button-border').value;
            state.fontSize = modal.querySelector('#was-shortcode-button-font').value;
            state.paddingVertical = modal.querySelector('#was-shortcode-button-padding-vertical').value;
            state.paddingHorizontal = modal.querySelector('#was-shortcode-button-padding-horizontal').value;
            state.showFileIcon = modal.querySelector('#was-shortcode-show-file-icon').checked;
            state.showDescription = modal.querySelector('#was-shortcode-show-description').checked;
            state.showFileSize = modal.querySelector('#was-shortcode-show-file-size').checked;
            state.showDownloadCount = modal.querySelector('#was-shortcode-show-download-count').checked;
            state.showCategoryLabel = modal.querySelector('#was-shortcode-show-category-label').checked;
            state.iconSize = modal.querySelector('#was-shortcode-icon-size').value;
            state.iconPosition = modal.querySelector('#was-shortcode-icon-position').value;
            state.iconMarginTop = modal.querySelector('#was-shortcode-icon-margin-top').value;
            state.iconMarginRight = modal.querySelector('#was-shortcode-icon-margin-right').value;
            state.iconMarginBottom = modal.querySelector('#was-shortcode-icon-margin-bottom').value;
            state.iconMarginLeft = modal.querySelector('#was-shortcode-icon-margin-left').value;
            state.containerBackground = modal.querySelector('#was-shortcode-container-background').value;
            state.containerBorderColor = modal.querySelector('#was-shortcode-container-border').value;
            state.containerBorderRadius = modal.querySelector('#was-shortcode-container-radius').value;
            state.containerBoxShadow = modal.querySelector('#was-shortcode-box-shadow').value;
            state.titleFontSize = modal.querySelector('#was-shortcode-title-font').value;
            state.descriptionFontSize = modal.querySelector('#was-shortcode-description-font').value;
            state.fontWeight = modal.querySelector('#was-shortcode-font-weight').value;
            state.customClass = modal.querySelector('#was-shortcode-custom-class').value;
            state.enablePagination = modal.querySelector('#was-shortcode-enable-pagination').checked;
            state.paginationType = modal.querySelector('#was-shortcode-pagination-type').value;
            state.openNewTab = modal.querySelector('#was-shortcode-open-new-tab').checked;
            state.forceDownload = modal.querySelector('#was-shortcode-force-download').checked;
            state.disableDownloadCounter = modal.querySelector('#was-shortcode-disable-counter').checked;
            state.configName = configNameInput.value;
        }

        function generateShortcode(){
            syncState();
            var attrs = [];
            if ( state.displayType === 'single' && state.downloadId ) {
                attrs.push('id="' + escapeAttr(state.downloadId) + '"');
            }
            if ( state.displayType === 'category' && state.categorySlug ) {
                attrs.push('category="' + escapeAttr(state.categorySlug) + '"');
            }
            attrs.push('layout="' + escapeAttr(state.layout) + '"');
            // Only include columns attribute for grid/card/compact layouts
            if ( state.layout !== 'list' ) {
                attrs.push('columns="' + escapeAttr(state.columnsDesktop) + ',' + escapeAttr(state.columnsTablet) + ',' + escapeAttr(state.columnsMobile) + '"');
                attrs.push('column_gap="' + escapeAttr(state.columnGap) + '"');
            }
            // Only include sorting options if not single download
            if ( state.displayType !== 'single' ) {
                attrs.push('order_by="' + escapeAttr(state.orderBy) + '"');
                attrs.push('order="' + escapeAttr(state.order) + '"');
                attrs.push('per_page="' + escapeAttr(state.itemsLimit) + '"');
            }
            attrs.push('button_text="' + escapeAttr(state.buttonText) + '"');
            // Only include button_alignment for non-list layouts
            if ( state.layout !== 'list' ) {
                attrs.push('button_alignment="' + escapeAttr(state.buttonAlignment) + '"');
            }
            attrs.push('row_gap="' + escapeAttr(state.rowGap) + '"');
            attrs.push('button_text_color="' + escapeAttr(state.buttonNormalTextColor) + '"');
            attrs.push('button_background_color="' + escapeAttr(state.buttonNormalBackground) + '"');
            attrs.push('button_border_color="' + escapeAttr(state.buttonNormalBorder) + '"');
            attrs.push('button_hover_text_color="' + escapeAttr(state.buttonHoverTextColor) + '"');
            attrs.push('button_hover_bg_color="' + escapeAttr(state.buttonHoverBackground) + '"');
            attrs.push('button_hover_border_color="' + escapeAttr(state.buttonHoverBorder) + '"');
            attrs.push('button_radius="' + escapeAttr(state.borderRadius) + '"');
            attrs.push('button_border_width="' + escapeAttr(state.borderWidth) + '"');
            attrs.push('button_font_size="' + escapeAttr(state.fontSize) + '"');
            attrs.push('button_padding="' + escapeAttr(state.paddingVertical) + ',' + escapeAttr(state.paddingHorizontal) + '"');
            attrs.push('show_file_icon="' + ( state.showFileIcon ? '1' : '0' ) + '"');
            attrs.push('show_description="' + ( state.showDescription ? '1' : '0' ) + '"');
            attrs.push('show_file_size="' + ( state.showFileSize ? '1' : '0' ) + '"');
            attrs.push('show_download_count="' + ( state.showDownloadCount ? '1' : '0' ) + '"');
            attrs.push('show_category_label="' + ( state.showCategoryLabel ? '1' : '0' ) + '"');
            attrs.push('icon_size="' + escapeAttr(state.iconSize) + '"');
            attrs.push('icon_position="' + escapeAttr(state.iconPosition) + '"');
            attrs.push('icon_margin_top="' + escapeAttr(state.iconMarginTop) + '"');
            attrs.push('icon_margin_right="' + escapeAttr(state.iconMarginRight) + '"');
            attrs.push('icon_margin_bottom="' + escapeAttr(state.iconMarginBottom) + '"');
            attrs.push('icon_margin_left="' + escapeAttr(state.iconMarginLeft) + '"');
            attrs.push('container_background="' + escapeAttr(state.containerBackground) + '"');
            attrs.push('container_border_color="' + escapeAttr(state.containerBorderColor) + '"');
            attrs.push('container_border_radius="' + escapeAttr(state.containerBorderRadius) + '"');
            attrs.push('container_box_shadow="' + escapeAttr(state.containerBoxShadow) + '"');
            attrs.push('title_font_size="' + escapeAttr(state.titleFontSize) + '"');
            attrs.push('description_font_size="' + escapeAttr(state.descriptionFontSize) + '"');
            attrs.push('font_weight="' + escapeAttr(state.fontWeight) + '"');
            if ( state.customClass ) {
                attrs.push('class="' + escapeAttr(state.customClass) + '"');
            }
            attrs.push('pagination="' + ( state.enablePagination ? '1' : '0' ) + '"');
            attrs.push('pagination_type="' + escapeAttr(state.paginationType) + '"');
            attrs.push('open_new_tab="' + ( state.openNewTab ? '1' : '0' ) + '"');
            attrs.push('force_download="' + ( state.forceDownload ? '1' : '0' ) + '"');
            attrs.push('disable_counter="' + ( state.disableDownloadCounter ? '1' : '0' ) + '"');
            return '[aso_downloads ' + attrs.join(' ') + ']';
        }

        function updateShortcode(){
            var generated = generateShortcode();
            modal.querySelector('#was-shortcode-output').value = generated;
            if (isFreeEdition) {
                saveButton.disabled = false;
            } else {
                saveButton.disabled = !configNameInput.value.trim();
            }
        }

        setActiveTab('source');
        setButtonStatePanel('normal');
        toggleConditional();
        updateShortcode();

        // Handle layout change to enable/disable relevant fields
        function updateLayoutFields(){
            var layout = modal.querySelector('#was-shortcode-layout').value;
            var columnsDesktop = modal.querySelector('#was-shortcode-columns-desktop');
            var columnsTablet = modal.querySelector('#was-shortcode-columns-tablet');
            var columnsMobile = modal.querySelector('#was-shortcode-columns-mobile');
            var columnGap = modal.querySelector('#was-shortcode-column-gap');
            var rowGap = modal.querySelector('#was-shortcode-row-gap');
            var buttonAlignment = modal.querySelector('#was-shortcode-button-alignment');
            var iconSizeField = modal.querySelector('#was-shortcode-icon-size');
            
            // Set icon size defaults based on layout
            if ( layout === 'compact' ) {
                iconSizeField.value = '24';
                state.iconSize = '24';
            } else {
                iconSizeField.value = '48';
                state.iconSize = '48';
            }
            
            if ( layout === 'list' ) {
                // Disable column fields for list layout (make read-only and hide)
                columnsDesktop.readOnly = true;
                columnsTablet.readOnly = true;
                columnsMobile.readOnly = true;
                columnGap.readOnly = true;
                buttonAlignment.disabled = true;
                rowGap.readOnly = false;
                
                // Add visual styling to disabled fields
                columnsDesktop.parentElement.style.opacity = '0.5';
                columnsDesktop.parentElement.style.pointerEvents = 'none';
                columnsTablet.parentElement.style.opacity = '0.5';
                columnsTablet.parentElement.style.pointerEvents = 'none';
                columnsMobile.parentElement.style.opacity = '0.5';
                columnsMobile.parentElement.style.pointerEvents = 'none';
                columnGap.parentElement.style.opacity = '0.5';
                columnGap.parentElement.style.pointerEvents = 'none';
                buttonAlignment.parentElement.style.opacity = '0.5';
                buttonAlignment.parentElement.style.pointerEvents = 'none';
                rowGap.parentElement.style.opacity = '1';
                rowGap.parentElement.style.pointerEvents = 'auto';
            } else {
                // Enable all fields for grid/card/compact layouts
                columnsDesktop.readOnly = false;
                columnsTablet.readOnly = false;
                columnsMobile.readOnly = false;
                columnGap.readOnly = false;
                buttonAlignment.disabled = false;
                rowGap.readOnly = false;
                
                columnsDesktop.parentElement.style.opacity = '1';
                columnsDesktop.parentElement.style.pointerEvents = 'auto';
                columnsTablet.parentElement.style.opacity = '1';
                columnsTablet.parentElement.style.pointerEvents = 'auto';
                columnsMobile.parentElement.style.opacity = '1';
                columnsMobile.parentElement.style.pointerEvents = 'auto';
                columnGap.parentElement.style.opacity = '1';
                columnGap.parentElement.style.pointerEvents = 'auto';
                buttonAlignment.parentElement.style.opacity = '1';
                buttonAlignment.parentElement.style.pointerEvents = 'auto';
                rowGap.parentElement.style.opacity = '1';
                rowGap.parentElement.style.pointerEvents = 'auto';
            }
        }
        
        // Call updateLayoutFields on initial load
        updateLayoutFields();

        modal.querySelectorAll('input, select').forEach(function(input){
            input.addEventListener('change', function(){
                if ( input.name === 'was-shortcode-display-type' ) {
                    state.displayType = input.value;
                    toggleConditional();
                }
                if ( input.id === 'was-shortcode-layout' ) {
                    updateLayoutFields();
                }
                updateShortcode();
            });
            // Also listen to input event for real-time updates (works for disabled fields too)
            input.addEventListener('input', function(){
                updateShortcode();
            });
        });

        // Toggle pagination type visibility based on enable pagination checkbox
        var enablePaginationCheckbox = modal.querySelector('#was-shortcode-enable-pagination');
        var paginationTypeRow = modal.querySelector('#was-shortcode-pagination-type-row');
        if (enablePaginationCheckbox && paginationTypeRow) {
            enablePaginationCheckbox.addEventListener('change', function(){
                if (enablePaginationCheckbox.checked) {
                    paginationTypeRow.removeAttribute('hidden');
                } else {
                    paginationTypeRow.setAttribute('hidden', '');
                }
            });
        }

        modal.querySelectorAll('.was-shortcode-tab-btn').forEach(function(btn){
            btn.addEventListener('click', function(){
                setActiveTab(btn.dataset.tab);
            });
        });

        modal.querySelectorAll('.was-shortcode-button-state').forEach(function(btn){
            btn.addEventListener('click', function(){
                setButtonStatePanel(btn.dataset.buttonState);
            });
        });

        copyButton.addEventListener('click', function(){
            var text = modal.querySelector('#was-shortcode-output').value;
            if ( navigator.clipboard && navigator.clipboard.writeText ) {
                navigator.clipboard.writeText(text).then(function(){
                    copyButton.textContent = translations.copiedLabel || 'Copied!';
                    setTimeout(function(){ copyButton.textContent = translations.copyButton || 'Copy shortcode'; }, 2000);
                });
            } else {
                modal.querySelector('#was-shortcode-output').select();
                document.execCommand('copy');
                copyButton.textContent = translations.copiedLabel || 'Copied!';
                setTimeout(function(){ copyButton.textContent = translations.copyButton || 'Copy shortcode'; }, 2000);
            }
        });

        var outputTextarea = modal.querySelector('#was-shortcode-output');
        if (outputTextarea) {
            outputTextarea.addEventListener('click', function(){
                outputTextarea.select();
            });
        }

        configDropdown.addEventListener('change', function(){
            var key = configDropdown.value;
            if ( key && configs[key] ) {
                state = buildDefaults();
                applyConfig(state, configs[key].data || {});
                state.configName = configs[key].name;
                configNameInput.value = configs[key].name;
                updateFields();
                toggleConditional();
                updateShortcode();
            }
        });

        var loadButton = modal.querySelector('#was-shortcode-config-load');
        var deleteButton = modal.querySelector('#was-shortcode-config-delete');
        if ( loadButton ) {
            loadButton.addEventListener('click', function(){
                var key = configDropdown.value;
                if ( !key ) {
                    footerMessage.textContent = translations.selectConfig || 'Please select a configuration.';
                    footerMessage.style.display = 'block';
                    footerMessage.style.color = '#dc2626';
                    return;
                }
                if ( configs[key] ) {
                    state = buildDefaults();
                    applyConfig(state, configs[key].data || {});
                    state.configName = configs[key].name;
                    configNameInput.value = configs[key].name;
                    updateFields();
                    toggleConditional();
                    updateShortcode();
                    footerMessage.textContent = '\\u2713 ' + (translations.configLoaded || 'Configuration loaded.');
                    footerMessage.style.display = 'block';
                    footerMessage.style.color = '#28a745';
                    setTimeout(function(){ footerMessage.style.display = 'none'; }, 2000);
                }
            });
        }

        if (deleteButton) {
            deleteButton.addEventListener('click', function() {
                var key = configDropdown.value;
                if (!key) {
                    footerMessage.textContent = translations.selectConfig || 'Please select a configuration to delete.';
                    footerMessage.style.display = 'block';
                    footerMessage.style.color = '#dc2626';
                    return;
                }
                if (!configs[key]) {
                    footerMessage.textContent = translations.invalidConfig || 'Invalid configuration selected.';
                    footerMessage.style.display = 'block';
                    footerMessage.style.color = '#dc2626';
                    return;
                }
                if (!confirm(translations.confirmDelete || 'Are you sure you want to delete this configuration?')) {
                    return;
                }
                var payload = {
                    action: 'was_delete_shortcode_configuration',
                    security: nonces.save,
                    config_key: key
                };
                deleteButton.disabled = true;
                deleteButton.textContent = translations.deleting || 'Deleting...';
                jQuery.post(ajaxurl, payload).done(function(resp) {
                    deleteButton.disabled = false;
                    deleteButton.textContent = translations.deleteBtn || 'Delete';
                    if (resp && resp.success) {
                        window.WAS_SHORTCODE_BUILDER_DATA = window.WAS_SHORTCODE_BUILDER_DATA || {};
                        window.WAS_SHORTCODE_BUILDER_DATA.configs = resp.data.configs || {};
                        configs = resp.data.configs || {};
                        // Update the dropdown
                        configDropdown.innerHTML = '<option value="">' + escapeAttr(translations.selectConfig || '-- Select Configuration --') + '</option>';
                        Object.keys(configs).forEach(function(k) {
                            var option = document.createElement('option');
                            option.value = k;
                            option.textContent = configs[k].name;
                            configDropdown.appendChild(option);
                        });
                        configNameInput.value = '';
                        state = buildDefaults();
                        updateFields();
                        toggleConditional();
                        updateShortcode();
                        footerMessage.textContent = '\\u2713 ' + (resp.data.message || translations.deleted || 'Configuration deleted.');
                        footerMessage.style.display = 'block';
                        footerMessage.style.color = '#28a745';
                        setTimeout(function(){ footerMessage.style.display = 'none'; }, 2000);
                    } else {
                        var errorMsg = resp && resp.data && resp.data.message ? resp.data.message : (translations.deleteError || 'Delete failed.');
                        footerMessage.textContent = '\\u2715 ' + errorMsg;
                        footerMessage.style.display = 'block';
                        footerMessage.style.color = '#dc2626';
                    }
                }).fail(function(xhr, status, error) {
                    deleteButton.disabled = false;
                    deleteButton.textContent = translations.deleteBtn || 'Delete';
                    footerMessage.textContent = '\\u2715 ' + (translations.deleteNetworkError || 'Delete failed \\u2014 network error.');
                    footerMessage.style.display = 'block';
                    footerMessage.style.color = '#dc2626';
                });
            });
        }

        function updateFields(){
            modal.querySelector('#was-shortcode-single-select').value = state.downloadId;
            modal.querySelector('#was-shortcode-category-select').value = state.categorySlug;
            modal.querySelector('#was-shortcode-order-by').value = state.orderBy;
            modal.querySelector('#was-shortcode-order').value = state.order;
            modal.querySelector('#was-shortcode-limit').value = state.itemsLimit;
            modal.querySelector('#was-shortcode-layout').value = state.layout;
            modal.querySelector('#was-shortcode-columns-desktop').value = state.columnsDesktop;
            modal.querySelector('#was-shortcode-columns-tablet').value = state.columnsTablet;
            modal.querySelector('#was-shortcode-columns-mobile').value = state.columnsMobile;
            modal.querySelector('#was-shortcode-column-gap').value = state.columnGap;
            modal.querySelector('#was-shortcode-row-gap').value = state.rowGap;
            modal.querySelector('#was-shortcode-button-alignment').value = state.buttonAlignment;
            modal.querySelector('#was-shortcode-button-text').value = state.buttonText;
            modal.querySelector('#was-shortcode-button-normal-text').value = state.buttonNormalTextColor;
            modal.querySelector('#was-shortcode-button-normal-bg').value = state.buttonNormalBackground;
            modal.querySelector('#was-shortcode-button-normal-border').value = state.buttonNormalBorder;
            modal.querySelector('#was-shortcode-button-hover-text').value = state.buttonHoverTextColor;
            modal.querySelector('#was-shortcode-button-hover-bg').value = state.buttonHoverBackground;
            modal.querySelector('#was-shortcode-button-hover-border').value = state.buttonHoverBorder;
            modal.querySelector('#was-shortcode-button-radius').value = state.borderRadius;
            modal.querySelector('#was-shortcode-button-border').value = state.borderWidth;
            modal.querySelector('#was-shortcode-button-font').value = state.fontSize;
            modal.querySelector('#was-shortcode-button-padding-vertical').value = state.paddingVertical;
            modal.querySelector('#was-shortcode-button-padding-horizontal').value = state.paddingHorizontal;
            modal.querySelector('#was-shortcode-show-file-icon').checked = state.showFileIcon;
            modal.querySelector('#was-shortcode-show-description').checked = state.showDescription;
            modal.querySelector('#was-shortcode-show-file-size').checked = state.showFileSize;
            modal.querySelector('#was-shortcode-show-download-count').checked = state.showDownloadCount;
            modal.querySelector('#was-shortcode-show-category-label').checked = state.showCategoryLabel;
            modal.querySelector('#was-shortcode-icon-size').value = state.iconSize;
            modal.querySelector('#was-shortcode-icon-position').value = state.iconPosition;
            modal.querySelector('#was-shortcode-icon-margin-top').value = state.iconMarginTop;
            modal.querySelector('#was-shortcode-icon-margin-right').value = state.iconMarginRight;
            modal.querySelector('#was-shortcode-icon-margin-bottom').value = state.iconMarginBottom;
            modal.querySelector('#was-shortcode-icon-margin-left').value = state.iconMarginLeft;
            modal.querySelector('#was-shortcode-container-background').value = state.containerBackground;
            modal.querySelector('#was-shortcode-container-border').value = state.containerBorderColor;
            modal.querySelector('#was-shortcode-container-radius').value = state.containerBorderRadius;
            modal.querySelector('#was-shortcode-box-shadow').value = state.containerBoxShadow;
            modal.querySelector('#was-shortcode-title-font').value = state.titleFontSize;
            modal.querySelector('#was-shortcode-description-font').value = state.descriptionFontSize;
            modal.querySelector('#was-shortcode-font-weight').value = state.fontWeight;
            modal.querySelector('#was-shortcode-custom-class').value = state.customClass;
            modal.querySelector('#was-shortcode-enable-pagination').checked = state.enablePagination;
            modal.querySelector('#was-shortcode-pagination-type').value = state.paginationType;
            modal.querySelector('#was-shortcode-open-new-tab').checked = state.openNewTab;
            modal.querySelector('#was-shortcode-force-download').checked = state.forceDownload;
            modal.querySelector('#was-shortcode-disable-counter').checked = state.disableDownloadCounter;
            
            // Update layout-dependent field states
            updateLayoutFields();
        }

        modal.querySelectorAll('[data-shortcode-builder-close]').forEach(function(button){
            button.addEventListener('click', function(){ overlay.remove(); });
        });
        overlay.addEventListener('click', function(e){ if ( e.target === overlay ) { overlay.remove(); } });

        saveButton.addEventListener('click', function(evt){
            if (isFreeEdition) {
                if (evt) {
                    evt.preventDefault();
                    evt.stopImmediatePropagation();
                }
                if (upgradeUrl) {
                    window.open(upgradeUrl, '_blank', 'noopener');
                }
                return;
            }
            if ( !configNameInput.value.trim() ) {
                footerMessage.textContent = translations.missingName || 'Please provide a configuration name.';
                footerMessage.style.display = 'block';
                footerMessage.style.color = '#dc2626';
                return;
            }
            var payload = {
                action: 'was_save_shortcode_configuration',
                security: nonces.save,
                config_name: configNameInput.value.trim(),
                shortcode: modal.querySelector('#was-shortcode-output').value,
                config_data: JSON.stringify(state)
            };
            console.log('[Shortcode Builder] Save payload:', payload);
            console.log('[Shortcode Builder] AJAX URL:', ajaxurl);
            console.log('[Shortcode Builder] Nonce:', nonces.save);
            jQuery.post(ajaxurl, payload).done(function(resp){
                console.log('[Shortcode Builder] AJAX Response:', resp);
                if ( resp && resp.success ) {
                    window.WAS_SHORTCODE_BUILDER_DATA = window.WAS_SHORTCODE_BUILDER_DATA || {};
                    window.WAS_SHORTCODE_BUILDER_DATA.configs = resp.data.configs || {};
                    
                    // Update the dropdown with new configurations
                    var configDropdownSelect = modal.querySelector('#was-shortcode-config-dropdown');
                    if ( configDropdownSelect ) {
                        configDropdownSelect.innerHTML = '<option value="">' + escapeAttr(translations.selectConfig || '-- Select Configuration --') + '</option>';
                        Object.keys(resp.data.configs).forEach(function(key){
                            var option = document.createElement('option');
                            option.value = key;
                            option.textContent = resp.data.configs[key].name;
                            configDropdownSelect.appendChild(option);
                        });
                    }
                    
                    footerMessage.textContent = '\\u2713 ' + ( resp.data.message || (translations.saved || 'Shortcode saved!') );
                    footerMessage.style.display = 'block';
                    footerMessage.style.color = '#28a745';
                    setTimeout(function(){ overlay.remove(); }, 1200);
                } else {
                    var errorMsg = resp && resp.data && resp.data.message ? resp.data.message : (translations.saveError || 'Save failed.');
                    console.error('[Shortcode Builder] Save error:', resp);
                    footerMessage.textContent = '\\u2715 ' + errorMsg;
                    footerMessage.style.display = 'block';
                    footerMessage.style.color = '#dc2626';
                }
            }).fail(function(xhr, status, error){
                console.error('[Shortcode Builder] AJAX failed:', status, error, xhr);
                footerMessage.textContent = '\\u2715 ' + (translations.saveNetworkError || 'Save failed \\u2014 network error.');
                footerMessage.style.display = 'block';
                footerMessage.style.color = '#dc2626';
            });
        });

        configDropdown.addEventListener('input', function(){
            if ( !configDropdown.value ) {
                configNameInput.value = '';
                state = buildDefaults();
                updateFields();
                toggleConditional();
                updateShortcode();
            }
        });
    }

    function initShortcodeBuilder(){
        var btns = document.querySelectorAll('button[data-was-open-shortcode-builder]');
        if ( btns.length === 0 ) {
            console.warn('[Shortcode Builder] No buttons found with data-was-open-shortcode-builder');
            return;
        }
        btns.forEach(function(btn){
            btn.addEventListener('click', function(e){
                e.preventDefault();
                try {
                    openShortcodeBuilderModal();
                } catch ( err ) {
                    console.error('[Shortcode Builder] Error opening modal:', err);
                    ASONotifications.error('Error opening modal: ' + err.message);
                }
            });
        });
    }

    $(document).ready(function(){
        // Wait for DOM to be fully ready before initializing
        if ( document.readyState === 'loading' ) {
            document.addEventListener('DOMContentLoaded', initShortcodeBuilder);
        } else {
            initShortcodeBuilder();
        }
    });
})(jQuery);

