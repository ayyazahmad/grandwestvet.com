/**
 * ASOS GSheet Tables - Table Editor JavaScript
 * Handles accordion, live preview, and column visibility controls
 */

(function($) {
    'use strict';

    const ASOSTableEditor = {
        
        /**
         * Initialize all editor functionality
         */
        init: function() {
            const initializers = [
                'initAccordion',
                'initCopyShortcode',
                'initLivePreview',
                'initColumnVisibility',
                'initFormChangeTracking',
                'initDevicePreviewMode',
                'initStatusToggle',
                'initTemplates'
            ];

            initializers.forEach((method) => {
                try {
                    if (typeof this[method] === 'function') {
                        this[method]();
                    }
                } catch (err) {
                    // Keep other editor controls working even if one initializer fails.
                    console.error('[ASOS GSheet] Init failed:', method, err);
                }
            });
        },

        /* Pre-configured templates */
        templates: {
            compact: {
                font_family: 'Inter, "Segoe UI", sans-serif',
                header_font_size: 13,
                font_size: 12,
                border_radius: 6,
                cell_padding: 6,
                table_width: '100%',
                header_bg: '#f8fafc',
                header_text: '#0f172a',
                body_bg: '#ffffff',
                body_text: '#0f172a',
                border_color: '#e5e7eb',
                zebra_stripes: false
            },
            dark: {
                font_family: 'Inter, "Segoe UI", sans-serif',
                header_font_size: 14,
                font_size: 14,
                border_radius: 8,
                cell_padding: 10,
                table_width: '100%',
                header_bg: '#111827',
                header_text: '#ffffff',
                body_bg: '#0f172a',
                body_text: '#e6eef8',
                border_color: 'rgba(255,255,255,0.06)',
                zebra_stripes: false
            },
            light: {
                font_family: 'Inter, "Segoe UI", sans-serif',
                header_font_size: 15,
                font_size: 14,
                border_radius: 12,
                cell_padding: 12,
                table_width: '100%',
                header_bg: '#f8fafc',
                header_text: '#0f172a',
                body_bg: '#ffffff',
                body_text: '#0f172a',
                border_color: '#e5e7eb',
                zebra_stripes: true
            },
            carded: {
                font_family: 'Georgia, "Times New Roman", serif',
                header_font_size: 16,
                font_size: 15,
                border_radius: 16,
                cell_padding: 14,
                table_width: '90%',
                header_bg: '#f8fafc',
                header_text: '#0f172a',
                body_bg: '#ffffff',
                body_text: '#0f172a',
                border_color: '#e2e8f0',
                zebra_stripes: false
            },
            minimal: {
                font_family: 'Helvetica, Arial, sans-serif',
                header_font_size: 14,
                font_size: 14,
                border_radius: 4,
                cell_padding: 10,
                table_width: '100%',
                header_bg: 'transparent',
                header_text: '#ffffff',
                body_bg: '#ffffff',
                body_text: '#0f172a',
                border_color: 'transparent',
                zebra_stripes: false
            }
            ,
            ocean: {
                font_family: 'Inter, "Segoe UI", sans-serif',
                header_font_size: 14,
                font_size: 14,
                border_radius: 8,
                cell_padding: 10,
                table_width: '100%',
                header_bg: '#0369a1',
                header_text: '#ffffff',
                body_bg: '#e6fffa',
                body_text: '#034155',
                border_color: '#06b6d4',
                zebra_stripes: false
            },
            sunset: {
                font_family: 'Inter, "Segoe UI", sans-serif',
                header_font_size: 15,
                font_size: 14,
                border_radius: 10,
                cell_padding: 12,
                table_width: '100%',
                header_bg: '#fb923c',
                header_text: '#ffffff',
                body_bg: '#fff7ed',
                body_text: '#7c2d12',
                border_color: '#f97316',
                zebra_stripes: false
            },
            mint: {
                font_family: 'Inter, "Segoe UI", sans-serif',
                header_font_size: 14,
                font_size: 14,
                border_radius: 8,
                cell_padding: 12,
                table_width: '100%',
                header_bg: '#10b981',
                header_text: '#ffffff',
                body_bg: '#ecfdf5',
                body_text: '#064e3b',
                border_color: '#34d399',
                zebra_stripes: false
            }
        },

        initTemplates: function() {
            const container = document.getElementById('asos-gsheet-editor-form');
            const self = this;
            if (!container) return;
            container.addEventListener('click', function(e) {
                const card = e.target.closest && e.target.closest('.asos-template-card');
                if (!card) return;
                const key = card.getAttribute('data-template');
                if (key && self.templates[key]) {
                    self.applyTemplate(key, card);
                }
            });

            // keyboard activation (Enter/Space) for accessibility
            container.addEventListener('keydown', function(e) {
                const card = e.target.closest && e.target.closest('.asos-template-card');
                if (!card) return;
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    const key = card.getAttribute('data-template');
                    if (key && self.templates[key]) {
                        self.applyTemplate(key, card);
                    }
                }
            });
        },

        applyTemplate: function(key, cardEl) {
            const tpl = this.templates[key];
            const form = document.getElementById('asos-gsheet-editor-form');
            const previewContainer = document.getElementById('preview-container');
            if (!tpl || !form) return;

            Object.keys(tpl).forEach(k => {
                const selector = `[name="${k}"]`;
                const el = form.querySelector(selector);
                if (!el) return;
                if (el.type === 'checkbox') {
                    el.checked = !!tpl[k];
                } else if (el.tagName === 'SELECT' || el.type === 'text' || el.type === 'number' || el.type === 'color' || el.tagName === 'TEXTAREA') {
                    el.value = tpl[k];
                } else {
                    // fallback
                    el.value = tpl[k];
                }

                // dispatch change so listeners pick it up
                const ev = new Event('change', { bubbles: true });
                el.dispatchEvent(ev);
            });

            // mark selected template visually
            try {
                document.querySelectorAll('.asos-template-card.selected').forEach(c => c.classList.remove('selected'));
                if (cardEl && cardEl.classList) cardEl.classList.add('selected');
                else {
                    const targetCard = document.querySelector('.asos-template-card[data-template="' + key + '"]');
                    if (targetCard) targetCard.classList.add('selected');
                }
            } catch (err) {
                // ignore
            }

            // Trigger preview refresh
            if (previewContainer) {
                this.refreshPreview(previewContainer);
            }
        },

        /**
         * Collapsible Accordion Sections
         */
        initAccordion: function() {
            const headers = document.querySelectorAll('.asos-accordion-header');
            
            if (!headers.length) return;

            headers.forEach(header => {
                // Make the entire header clickable
                header.style.cursor = 'pointer';
                
                header.addEventListener('click', function(e) {
                    // Prevent event bubbling if clicking on interactive elements inside header
                    if (e.target.tagName === 'INPUT' || e.target.tagName === 'BUTTON') {
                        return;
                    }
                    
                    const section = this.closest('.asos-accordion-section');
                    if (!section) return;
                    
                    const isCurrentlyOpen = section.classList.contains('is-open');
                    
                    // Close all sections
                    document.querySelectorAll('.asos-accordion-section').forEach(s => {
                        s.classList.remove('is-open');
                    });
                    
                    // Open clicked section if it wasn't already open
                    if (!isCurrentlyOpen) {
                        section.classList.add('is-open');
                    }
                });
            });

            // Open first section by default
            const firstSection = document.querySelector('.asos-accordion-section');
            if (firstSection) {
                firstSection.classList.add('is-open');
            }
        },

        /**
         * Copy Shortcode to Clipboard
         */
        initCopyShortcode: function() {
            const copyBtn = document.querySelector('.asos-copy-shortcode');
            
            if (!copyBtn) return;

            copyBtn.addEventListener('click', function(e) {
                e.preventDefault();
                
                const code = this.closest('.asos-gsheet-shortcode-display').querySelector('code');
                if (!code) return;

                const text = code.textContent;
                
                // Modern clipboard API
                if (navigator.clipboard && navigator.clipboard.writeText) {
                    navigator.clipboard.writeText(text).then(() => {
                        ASOSTableEditor.showCopyFeedback(copyBtn);
                    }).catch(err => {
                        console.error('Failed to copy:', err);
                        ASOSTableEditor.fallbackCopy(text, copyBtn);
                    });
                } else {
                    ASOSTableEditor.fallbackCopy(text, copyBtn);
                }
            });
        },

        /**
         * Show "Copied!" feedback
         */
        showCopyFeedback: function(button) {
            const originalText = button.textContent;
            button.textContent = '✓ Copied!';
            button.style.background = '#10b981';
            button.style.borderColor = '#10b981';
            button.style.color = 'white';
            
            setTimeout(() => {
                button.textContent = originalText;
                button.style.background = '';
                button.style.borderColor = '';
                button.style.color = '';
            }, 2000);
        },

        /**
         * Fallback copy method for older browsers
         */
        fallbackCopy: function(text, button) {
            const textarea = document.createElement('textarea');
            textarea.value = text;
            textarea.style.position = 'fixed';
            textarea.style.opacity = '0';
            document.body.appendChild(textarea);
            textarea.select();
            
            try {
                document.execCommand('copy');
                this.showCopyFeedback(button);
            } catch (err) {
                console.error('Fallback copy failed:', err);
            }
            
            document.body.removeChild(textarea);
        },

        /**
         * Live Preview Updates
         */
        initLivePreview: function() {
            const form = document.getElementById('asos-gsheet-editor-form');
            const previewContainer = document.getElementById('preview-container');
            const refreshBtn = document.getElementById('refresh-preview');
            const exportBtn = document.getElementById('export-preview');
            
            if (!form || !previewContainer) return;

            // Refresh preview button
            if (refreshBtn) {
                refreshBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.refreshPreview(previewContainer);
                });
            }

            if (exportBtn) {
                exportBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.exportPreviewTable();
                });
            }

            // Auto-refresh on ANY form change (debounced)
            // Listen to all input types: text, number, color, checkbox, select, textarea
            const allInputs = form.querySelectorAll('input, select, textarea');
            
            let previewTimeout;
            allInputs.forEach(input => {
                input.addEventListener('change', () => {
                    clearTimeout(previewTimeout);
                    previewTimeout = setTimeout(() => {
                        this.refreshPreview(previewContainer);
                    }, 800);
                });
                
                // Also listen to input event for real-time feedback on text fields
                if (input.type === 'text' || input.type === 'number' || input.tagName === 'TEXTAREA') {
                    input.addEventListener('input', () => {
                        clearTimeout(previewTimeout);
                        previewTimeout = setTimeout(() => {
                            this.refreshPreview(previewContainer);
                        }, 1200);
                    });
                }
            });
        },

        /**
         * Refresh Preview Data
         */
        refreshPreview: function(container) {
            const tableId = document.querySelector('input[name="table_id"]')?.value;
            const sheetUrl = document.querySelector('input[name="sheet_url"]')?.value;
            
            if (!sheetUrl) {
                this.showPreviewMessage(container, 'Please enter a Google Sheets URL to preview data.', 'info');
                return;
            }

            // Show loading
            container.innerHTML = '<div class="asos-preview-placeholder"><div class="asos-preview-skeleton"><div class="asos-skeleton-row"></div><div class="asos-skeleton-row"></div><div class="asos-skeleton-row"></div><div class="asos-skeleton-row"></div></div><p>Loading preview...</p></div>';

            // AJAX call to fetch preview
            $.ajax({
                url: ajaxurl,
                method: 'POST',
                data: {
                    action: 'asos_gsheet_fetch_preview',
                    nonce: ASOSGSheetAdmin?.nonce || '',
                    table_id: tableId,
                    sheet_id: this.extractSheetId(sheetUrl),
                    sheet_gid: document.querySelector('input[name="sheet_gid"]')?.value || '0',
                    sheet_range: document.querySelector('input[name="sheet_range"]')?.value || '',
                    header_row: document.querySelector('input[name="header_row"]')?.value || '1',
                    use_cache: false
                },
                success: (response) => {
                    if (response.success && response.data) {
                        this.renderPreview(container, response.data);
                    } else {
                        this.showPreviewMessage(container, response.data || 'Failed to load preview', 'error');
                    }
                },
                error: () => {
                    this.showPreviewMessage(container, 'Network error. Please try again.', 'error');
                }
            });
        },

        /**
         * Extract Sheet ID from URL
         */
        extractSheetId: function(url) {
            const match = url.match(/\/d\/([a-zA-Z0-9-_]+)/);
            return match ? match[1] : url;
        },

        /**
         * Render Preview Table with Applied Configurations
         */
        renderPreview: function(container, data, currentPage = 1) {
            if (!data.data || !data.data.headers || !data.data.rows) {
                this.showPreviewMessage(container, 'No data available', 'info');
                return;
            }

            const form = document.getElementById('asos-gsheet-editor-form');
            
            // Get configuration from form
            const config = {
                showTitle: form?.querySelector('input[name="show_title"]')?.checked || false,
                showDescription: form?.querySelector('input[name="show_description"]')?.checked || false,
                enableSearch: form?.querySelector('input[name="enable_search"]')?.checked || false,
                enablePagination: form?.querySelector('input[name="enable_pagination"]')?.checked || false,
                enableSorting: form?.querySelector('input[name="enable_sorting"]')?.checked || false,
                enableColumnFilters: form?.querySelector('input[name="enable_column_filters"]')?.checked || false,
                showEntriesSelector: form?.querySelector('input[name="show_entries_selector"]')?.checked || false,
                zebraStripes: form?.querySelector('input[name="zebra_stripes"]')?.checked || false,
                perPage: parseInt(form?.querySelector('input[name="per_page"]')?.value || 5),
                headerBg: form?.querySelector('input[name="header_bg"]')?.value || '#0ea5e9',
                headerText: form?.querySelector('input[name="header_text"]')?.value || '#ffffff',
                bodyBg: form?.querySelector('input[name="body_bg"]')?.value || '#ffffff',
                bodyText: form?.querySelector('input[name="body_text"]')?.value || '#0f172a',
                borderColor: form?.querySelector('input[name="border_color"]')?.value || '#e5e7eb',
                fontSize: parseInt(form?.querySelector('input[name="font_size"]')?.value || 14),
                headerFontSize: parseInt(form?.querySelector('input[name="header_font_size"]')?.value || 14),
                fontFamily: form?.querySelector('select[name="font_family"]')?.value || 'Inter, "Segoe UI", sans-serif',
                tableWidth: form?.querySelector('input[name="table_width"]')?.value || '100%',
                borderRadius: parseInt(form?.querySelector('input[name="border_radius"]')?.value || 4),
                cellPadding: parseInt(form?.querySelector('input[name="cell_padding"]')?.value || 8),
                tableTitle: form?.querySelector('input[name="table_title"]')?.value || '',
                tableDescription: form?.querySelector('textarea[name="table_description"]')?.value || '',
                columnsMode: form?.querySelector('select[name="columns_mode"]')?.value || 'auto',
                visibleColumns: form?.querySelector('input[name="visible_columns"]')?.value || '',
                hiddenColumns: form?.querySelector('input[name="hidden_columns"]')?.value || '',
                columnLabels: form?.querySelector('textarea[name="column_labels"]')?.value || '',
                columnTypes: form?.querySelector('textarea[name="column_types"]')?.value || '',
                columnAlignment: form?.querySelector('textarea[name="column_alignment"]')?.value || '',
            };

            // Parse column labels mapping (Original=New format)
            const labelMap = {};
            if (config.columnLabels) {
                config.columnLabels.split('\n').forEach(line => {
                    const [original, newLabel] = line.split('=').map(s => s.trim());
                    if (original && newLabel) {
                        labelMap[original] = newLabel;
                    }
                });
            }

            // Parse column alignment mapping
            const alignmentMap = {};
            if (config.columnAlignment) {
                config.columnAlignment.split('\n').forEach(line => {
                    const [column, alignment] = line.split('=').map(s => s.trim());
                    if (column && alignment) {
                        alignmentMap[column] = alignment;
                    }
                });
            }

            // Parse column type mapping
            const typeMap = {};
            if (config.columnTypes) {
                config.columnTypes.split('\n').forEach(line => {
                    const [column, type] = line.split('=').map(s => s.trim());
                    if (column && type) {
                        typeMap[column] = type.toLowerCase();
                    }
                });
            }

            // Parse visible and hidden columns
            const visibleList = config.visibleColumns
                .split(',')
                .map(s => s.trim())
                .filter(s => s);
            
            const hiddenList = config.hiddenColumns
                .split(',')
                .map(s => s.trim())
                .filter(s => s);

            const originalHeaders = data.data.headers;  // Keep reference to original headers for alignment lookups
            let headers = data.data.headers;
            let allRows = data.data.rows;
            
            // Apply column filtering based on mode
            const visibleColumnIndices = [];
            let filteredHeaders = headers;

            if (config.columnsMode === 'manual') {
                if (visibleList.length > 0) {
                    // Show only visible columns
                    filteredHeaders = headers.filter((header, idx) => {
                        const isVisible = visibleList.includes(header);
                        if (isVisible) visibleColumnIndices.push(idx);
                        return isVisible;
                    });
                } else if (hiddenList.length > 0) {
                    // Hide specified columns
                    filteredHeaders = headers.filter((header, idx) => {
                        const isHidden = hiddenList.includes(header);
                        if (!isHidden) visibleColumnIndices.push(idx);
                        return !isHidden;
                    });
                } else {
                    // No filtering
                    headers.forEach((_, idx) => visibleColumnIndices.push(idx));
                }
            } else {
                // Auto mode - hide only explicitly hidden columns
                if (hiddenList.length > 0) {
                    filteredHeaders = headers.filter((header, idx) => {
                        const isHidden = hiddenList.includes(header);
                        if (!isHidden) visibleColumnIndices.push(idx);
                        return !isHidden;
                    });
                } else {
                    headers.forEach((_, idx) => visibleColumnIndices.push(idx));
                }
            }

            // Apply custom labels to headers
            filteredHeaders = filteredHeaders.map(header => labelMap[header] || header);

            // Filter rows to keep only visible columns
            const filteredRows = allRows.map(row => {
                return visibleColumnIndices.map(idx => row[idx] || '');
            });

            const allRowsFiltered = filteredRows;
            
            // Calculate pagination
            const totalPages = Math.ceil(allRowsFiltered.length / config.perPage);
            const page = Math.max(1, Math.min(currentPage, totalPages));
            const startIdx = (page - 1) * config.perPage;
            const endIdx = startIdx + config.perPage;
            const rows = allRowsFiltered.slice(startIdx, endIdx);

            let html = '<div class="asos-preview-wrapper">';
            
            // Title
            if (config.showTitle && config.tableTitle) {
                html += `<h3 style="margin: 0 0 8px 0; padding: 0; color: ${this.escapeHtml(config.bodyText)}; font-family: ${config.fontFamily}; font-size: ${config.fontSize + 4}px; font-weight: 600;">${this.escapeHtml(config.tableTitle)}</h3>`;
            }
            
            // Description
            if (config.showDescription && config.tableDescription) {
                html += `<p style="margin: 0 0 12px 0; padding: 0; color: ${this.escapeHtml(config.bodyText)}; font-family: ${config.fontFamily}; font-size: ${Math.max(config.fontSize - 2, 12)}px; opacity: 0.8;">${this.escapeHtml(config.tableDescription)}</p>`;
            }

// Search and Entries Selector Row
            if (config.enableSearch || (config.showEntriesSelector && config.enablePagination)) {
                let searchRowHtml = `<div style="margin-bottom: 12px; display: flex; align-items: center; gap: 12px; justify-content: space-between;">`;
                
                // Entries selector (left side)
                if (config.showEntriesSelector && config.enablePagination) {
                    searchRowHtml += `<div style="display: flex; align-items: center;">
                        <label style="font-size: 12px; color: ${this.escapeHtml(config.bodyText)}; white-space: nowrap;">Show
                            <select class="asos-entries-selector" style="margin: 0 4px; padding: 4px 8px; font-size: 12px; border: 1px solid ${this.escapeHtml(config.borderColor)}; border-radius: 4px;">
                                <option value="10" ${config.perPage === 10 ? 'selected' : ''}>10</option>
                                <option value="25" ${config.perPage === 25 ? 'selected' : ''}>25</option>
                                <option value="50" ${config.perPage === 50 ? 'selected' : ''}>50</option>
                                <option value="100" ${config.perPage === 100 ? 'selected' : ''}>100</option>
                            </select> entries
                        </label>
                    </div>`;
                } else {
                    // Spacer if only search is enabled
                    if (config.enableSearch) {
                        searchRowHtml += `<div></div>`;
                    }
                }
                
                // Search box (right side, 25% width)
                if (config.enableSearch) {
                    searchRowHtml += `<input type="text" placeholder="Search..." style="width: 25%; padding: 8px 12px; font-size: ${config.fontSize}px; border: 1px solid ${this.escapeHtml(config.borderColor)}; border-radius: ${config.borderRadius}px; font-family: ${config.fontFamily}; margin-left: auto;">`;
                }
                
                searchRowHtml += `</div>`;
                html += searchRowHtml;
            }

            // Table
            html += '<div class="asos-preview-table-wrapper" style="overflow-x: auto; border-radius: ' + config.borderRadius + 'px; border: 1px solid ' + this.escapeHtml(config.borderColor) + '; width: ' + this.escapeHtml(config.tableWidth) + ';">';
            html += '<table class="asos-preview-table" style="width: 100%; border-collapse: collapse; font-family: ' + config.fontFamily + '; font-size: ' + config.fontSize + 'px;">';
            
            // Headers
            html += '<thead><tr style="background-color: ' + this.escapeHtml(config.headerBg) + ';">';
            filteredHeaders.forEach((header, idx) => {
                const originalHeader = visibleColumnIndices[idx] >= 0 ? originalHeaders[visibleColumnIndices[idx]] : header;
                const alignment = alignmentMap[originalHeader] || 'left';
                const headerStyle = `padding: ${config.cellPadding}px; text-align: ${alignment}; font-size: ${config.headerFontSize}px; color: ${this.escapeHtml(config.headerText)}; font-weight: 600; border-bottom: 1px solid ${this.escapeHtml(config.borderColor)};`;
                let headerHtml = `<th style="${headerStyle}${config.enableSorting ? ' cursor: pointer; user-select: none;' : ''}" data-column="${idx}">`;
                headerHtml += this.escapeHtml(header);
                if (config.enableSorting) {
                    headerHtml += ' <span style="font-size: 10px; opacity: 0.6;">⇅</span>';
                }
                headerHtml += '</th>';
                html += headerHtml;
            });
            html += '</tr>';
            
            // Column Filters Row (if enabled)
            if (config.enableColumnFilters) {
                html += '<tr style="background-color: rgba(0,0,0,0.02);">';
                filteredHeaders.forEach(header => {
                    html += `<th style="padding: 8px 12px; text-align: left; border-bottom: 1px solid ${this.escapeHtml(config.borderColor)};">
                        <input type="text" placeholder="Filter..." style="width: 100%; padding: 4px 6px; font-size: 11px; border: 1px solid ${this.escapeHtml(config.borderColor)}; border-radius: 2px; box-sizing: border-box;">
                    </th>`;
                });
                html += '</tr>';
            }
            
            html += '</thead>';
            
            // Rows
            html += '<tbody>';
            rows.forEach((row, idx) => {
                const rowBg = config.zebraStripes && idx % 2 === 1 ? 'rgba(0,0,0,0.02)' : this.escapeHtml(config.bodyBg);
                html += `<tr style="background-color: ${rowBg};">`;
                row.forEach((cell, cellIdx) => {
                    const originalHeader = visibleColumnIndices[cellIdx] >= 0 ? originalHeaders[visibleColumnIndices[cellIdx]] : '';
                    const alignment = alignmentMap[originalHeader] || 'left';
                    const type = typeMap[originalHeader] || '';
                    const renderedCell = this.formatCellValue(cell, type);
                    html += `<td style="padding: ${config.cellPadding}px; text-align: ${alignment}; font-size: ${config.fontSize}px; color: ${this.escapeHtml(config.bodyText)}; border-bottom: 1px solid ${this.escapeHtml(config.borderColor)};">${renderedCell}</td>`;
                });
                html += '</tr>';
            });
            html += '</tbody>';
            
            html += '</table></div>';

            // Pagination controls
            if (config.enablePagination && allRowsFiltered.length > 1) {
                const hasMultiplePages = totalPages > 1;
                html += `<div style="margin-top: 16px; display: flex; justify-content: space-between; align-items: center; padding: 0 4px;">
                    <span style="font-size: 12px; color: ${this.escapeHtml(config.bodyText)}; opacity: 0.7;">Showing ${startIdx + 1} to ${Math.min(endIdx, allRowsFiltered.length)} of ${allRowsFiltered.length} entries (Page ${page} of ${totalPages})</span>
                    <div>
                        <button type="button" style="padding: 6px 12px; margin: 0 4px; border: 1px solid ${this.escapeHtml(config.borderColor)}; background: white; color: ${this.escapeHtml(config.bodyText)}; cursor: ${page > 1 ? 'pointer' : 'not-allowed'}; border-radius: 4px; opacity: ${page > 1 ? '1' : '0.5'};" ${page <= 1 ? 'disabled' : ''} class="asos-prev-btn">← Prev</button>
                        <button type="button" style="padding: 6px 12px; margin: 0 4px; border: 1px solid ${this.escapeHtml(config.borderColor)}; background: white; color: ${this.escapeHtml(config.bodyText)}; cursor: ${page < totalPages ? 'pointer' : 'not-allowed'}; border-radius: 4px; opacity: ${page < totalPages ? '1' : '0.5'};" ${page >= totalPages ? 'disabled' : ''} class="asos-next-btn">Next →</button>
                    </div>
                </div>`;
            }

            html += '</div>';
            
            // Add info text
            const showInfo = config.enableSearch || config.enableSorting || config.enablePagination;
            if (showInfo) {
                if (config.enablePagination) {
                    html += `<p style="margin-top: 12px; text-align: center; color: ${this.escapeHtml(config.bodyText)}; font-size: 12px; opacity: 0.6;">Page ${page} of ${totalPages}</p>`;
                } else {
                    html += `<p style="margin-top: 12px; text-align: center; color: ${this.escapeHtml(config.bodyText)}; font-size: 12px; opacity: 0.6;">Showing ${Math.min(config.perPage || 5, allRowsFiltered.length)} of ${allRowsFiltered.length} rows</p>`;
                }
            }
            
            container.innerHTML = html;
            
            // Store current page and data for pagination
            this.currentPreviewPage = page;
            this.lastPreviewData = data;
            
            // Attach entries selector listener
            const entriesSelector = container.querySelector('.asos-entries-selector');
            if (entriesSelector && config.showEntriesSelector && config.enablePagination) {
                entriesSelector.addEventListener('change', (e) => {
                    const newPerPage = parseInt(e.target.value);
                    const perPageInput = document.querySelector('input[name="per_page"]');
                    if (perPageInput) {
                        perPageInput.value = newPerPage;
                    }
                    // Reset to page 1 when entries per page changes
                    this.renderPreview(container, data, 1);
                });
            }
            
            // Attach pagination button listeners
            if (config.enablePagination) {
                const prevBtn = container.querySelector('.asos-prev-btn');
                const nextBtn = container.querySelector('.asos-next-btn');
                
                if (prevBtn) {
                    prevBtn.addEventListener('click', () => {
                        if (page > 1) {
                            this.renderPreview(container, data, page - 1);
                        }
                    });
                }
                
                if (nextBtn) {
                    nextBtn.addEventListener('click', () => {
                        const totalPages = Math.ceil(allRowsFiltered.length / config.perPage);
                        if (page < totalPages) {
                            this.renderPreview(container, data, page + 1);
                        }
                    });
                }
            }
        },

        /**
         * Show Preview Message
         */
        showPreviewMessage: function(container, message, type = 'info') {
            const colors = {
                info: '#3b82f6',
                error: '#ef4444',
                success: '#10b981'
            };
            
            container.innerHTML = `<div class="asos-preview-placeholder"><p style="color: ${colors[type]};">${this.escapeHtml(message)}</p></div>`;
        },

        /**
         * Update Preview Styles (Live)
         */
        updatePreviewStyles: function() {
            // This would update the preview table styles in real-time
            // Implementation depends on having a rendered preview table
            console.log('Preview styles updated');
        },

        /**
         * Column Visibility Controls
         */
        initColumnVisibility: function() {
            const columnList = document.getElementById('column-list');
            
            if (!columnList) return;

            // Check if we need to populate from sheet data
            const sheetUrl = document.querySelector('input[name="sheet_url"]')?.value;
            
            if (sheetUrl && columnList.querySelector('.asos-column-placeholder')) {
                this.loadColumns(columnList);
            }

            // Initialize sortable (if sortable library is available)
            if (typeof Sortable !== 'undefined') {
                new Sortable(columnList, {
                    animation: 150,
                    handle: '.asos-column-drag-handle',
                    ghostClass: 'sortable-ghost'
                });
            }

            // Visibility toggle handlers
            columnList.addEventListener('click', (e) => {
                if (e.target.classList.contains('asos-visibility-toggle')) {
                    e.target.classList.toggle('is-visible');
                    this.updateColumnVisibilityData();
                }
            });
        },

        /**
         * Load Columns from Sheet
         */
        loadColumns: function(container) {
            // This would fetch column headers from the sheet
            // For now, show a placeholder
            container.innerHTML = '<div class="asos-column-placeholder"><p>Save table to manage columns</p></div>';
        },

        /**
         * Update Column Visibility Data
         */
        updateColumnVisibilityData: function() {
            const items = document.querySelectorAll('.asos-column-item');
            const visible = [];
            const hidden = [];
            
            items.forEach(item => {
                const name = item.querySelector('.asos-column-name').textContent;
                const isVisible = item.querySelector('.asos-visibility-toggle.is-visible') !== null;
                
                if (isVisible) {
                    visible.push(name);
                } else {
                    hidden.push(name);
                }
            });
            
            // Update hidden form fields
            const visibleInput = document.querySelector('input[name="visible_columns"]');
            const hiddenInput = document.querySelector('input[name="hidden_columns"]');
            
            if (visibleInput) visibleInput.value = visible.join(', ');
            if (hiddenInput) hiddenInput.value = hidden.join(', ');
        },

        /**
         * Track Form Changes
         */
        initFormChangeTracking: function() {
            const form = document.getElementById('asos-gsheet-editor-form');
            if (!form) return;

            let hasChanges = false;
            
            form.addEventListener('change', () => {
                hasChanges = true;
            });

            // Warn before leaving if unsaved changes
            window.addEventListener('beforeunload', (e) => {
                if (hasChanges) {
                    e.preventDefault();
                    e.returnValue = '';
                    return '';
                }
            });

            // Clear flag on save
            form.addEventListener('submit', () => {
                hasChanges = false;
            });
        },

        /**
         * Status Toggle Handler
         */
        initStatusToggle: function() {
            const statusToggles = document.querySelectorAll('[data-toggle="status"]');
            
            statusToggles.forEach(toggle => {
                const checkbox = toggle.querySelector('input[type="checkbox"]');
                const hiddenInput = toggle.querySelector('input[type="hidden"]');
                
                if (!checkbox || !hiddenInput) return;
                
                // Handle checkbox change
                checkbox.addEventListener('change', () => {
                    const isChecked = checkbox.checked;
                    const activeValue = checkbox.dataset.valueActive || 'active';
                    const inactiveValue = checkbox.dataset.valueInactive || 'draft';
                    
                    // Update hidden input
                    hiddenInput.value = isChecked ? activeValue : inactiveValue;
                    
                    // Update toggle class
                    if (isChecked) {
                        toggle.classList.add('active');
                    } else {
                        toggle.classList.remove('active');
                    }
                });
            });
        },

        /**
         * Device Preview Mode Switcher
         */
        initDevicePreviewMode: function() {
            const deviceButtons = document.querySelectorAll('.asos-device-mode-btn');
            const previewWrapper = document.getElementById('preview-wrapper');
            let savedDevice = 'desktop';
            try {
                savedDevice = localStorage.getItem('asos-gsheet-preview-device') || 'desktop';
            } catch (err) {
                savedDevice = 'desktop';
            }
            
            if (!deviceButtons.length || !previewWrapper) return;
            
            // Set initial state from localStorage
            this.setDeviceMode(savedDevice);
            
            // Add click listeners to device buttons
            deviceButtons.forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.preventDefault();
                    const device = btn.dataset.device;
                    this.setDeviceMode(device);
                });
            });
        },
        
        /**
         * Set Device Preview Mode
         */
        setDeviceMode: function(device) {
            const deviceButtons = document.querySelectorAll('.asos-device-mode-btn');
            const previewWrapper = document.getElementById('preview-wrapper');
            
            if (!previewWrapper) return;

            const normalizedDevice = ['desktop', 'tablet', 'mobile'].includes(device) ? device : 'desktop';
            
            // Remove all device classes
            previewWrapper.classList.remove('desktop', 'tablet', 'mobile');
            
            // Remove active class from all buttons
            deviceButtons.forEach(btn => btn.classList.remove('active'));
            
            // Add device class and active state to button
            previewWrapper.classList.add(normalizedDevice);
            const activeButton = document.querySelector('.asos-device-mode-btn[data-device="' + normalizedDevice + '"]');
            if (activeButton) {
                activeButton.classList.add('active');
            }

            // Apply explicit inline width so mode change remains visible even if CSS is overridden.
            const widthByMode = {
                desktop: '100%',
                tablet: '768px',
                mobile: '375px'
            };
            previewWrapper.style.width = widthByMode[normalizedDevice] || '100%';
            previewWrapper.style.maxWidth = '100%';
            previewWrapper.style.marginLeft = 'auto';
            previewWrapper.style.marginRight = 'auto';
            
            // Save to localStorage
            try {
                localStorage.setItem('asos-gsheet-preview-device', normalizedDevice);
            } catch (err) {
                // Ignore storage errors; mode still works for current session.
            }
        },

        /**
         * Escape HTML
         */
        escapeHtml: function(text) {
            const div = document.createElement('div');
            div.textContent = text;
            return div.innerHTML;
        },

        /**
         * Format preview cell value by configured column type.
         */
        formatCellValue: function(value, type) {
            const raw = String(value ?? '');
            switch ((type || '').toLowerCase()) {
                case 'number': {
                    const n = Number(raw.replace(/[^0-9.-]/g, ''));
                    return Number.isFinite(n) ? this.escapeHtml(new Intl.NumberFormat().format(n)) : this.escapeHtml(raw);
                }
                case 'currency': {
                    const n = Number(raw.replace(/[^0-9.-]/g, ''));
                    return Number.isFinite(n) ? this.escapeHtml(new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD' }).format(n)) : this.escapeHtml(raw);
                }
                case 'date': {
                    const d = new Date(raw);
                    return Number.isNaN(d.getTime()) ? this.escapeHtml(raw) : this.escapeHtml(d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }));
                }
                default:
                    return this.escapeHtml(raw);
            }
        },

        /**
         * Export current preview table as CSV.
         */
        exportPreviewTable: function() {
            const table = document.querySelector('#preview-container table');
            if (!table) {
                this.showNotification('Nothing to export. Load a preview table first.', 'warning');
                return;
            }

            const rows = [];
            const allRows = table.querySelectorAll('tr');
            allRows.forEach((tr) => {
                const cells = tr.querySelectorAll('th, td');
                const row = Array.from(cells).map((cell) => {
                    const text = (cell.textContent || '').trim().replace(/\s+/g, ' ');
                    return '"' + text.replace(/"/g, '""') + '"';
                }).join(',');
                rows.push(row);
            });

            const csv = rows.join('\n');
            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            const tableName = (document.querySelector('input[name="table_title"]')?.value || 'table').trim().toLowerCase().replace(/[^a-z0-9]+/g, '-');
            a.href = url;
            a.download = (tableName || 'table') + '-preview.csv';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            this.showNotification('Preview exported as CSV.', 'success');
        },

        showNotification: function(message, type) {
            if (window.ASONotifications && typeof window.ASONotifications.show === 'function') {
                window.ASONotifications.show(message, type || 'info');
                return;
            }
            console.log('[ASOS GSheet]', message);
        }
    };

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => ASOSTableEditor.init());
    } else {
        ASOSTableEditor.init();
    }

    // Expose to global scope for potential external use
    window.ASOSTableEditor = ASOSTableEditor;

})(jQuery);
