/**
 * ASOS GSheet Tables - Frontend JavaScript
 * Handles search, sorting, filters and pagination for rendered tables.
 */

(function() {
    'use strict';

    document.addEventListener('DOMContentLoaded', function() {
        const containers = document.querySelectorAll('.asos-gsheet-table-frontend');
        containers.forEach(function(container) {
            initTable(container);
        });
    });

    function initTable(container) {
        const table = container.querySelector('.asos-gsheet-frontend-table');
        const tbody = table ? table.querySelector('tbody') : null;
        if (!table || !tbody) return;

        const rows = Array.from(tbody.querySelectorAll('.asos-gsheet-data-row'));
        const searchInput = container.querySelector('.asos-gsheet-search-input');
        const columnFilters = Array.from(container.querySelectorAll('.asos-gsheet-column-filter'));
        const entriesSelector = container.querySelector('.asos-entries-selector');
        const prevBtn = container.querySelector('.asos-gsheet-prev-page');
        const nextBtn = container.querySelector('.asos-gsheet-next-page');
        const info = container.querySelector('.asos-gsheet-pagination-info');
        const emptyState = container.querySelector('.asos-gsheet-empty-state');
        const sortableHeaders = Array.from(table.querySelectorAll('th[data-sortable="1"]'));

        const settings = {
            enableSearch: container.dataset.enableSearch === '1',
            enablePagination: container.dataset.enablePagination === '1',
            enableSorting: container.dataset.enableSorting === '1',
            perPage: Math.max(1, parseInt(container.dataset.perPage || '10', 10)),
            emptyMessage: container.dataset.emptyMessage || 'No matching records found.',
            prevLabel: container.dataset.prevLabel || 'Prev',
            nextLabel: container.dataset.nextLabel || 'Next'
        };

        const state = {
            query: '',
            filterByColumn: {},
            sortIndex: -1,
            sortDir: 'asc',
            currentPage: 1
        };

        if (prevBtn) prevBtn.textContent = settings.prevLabel;
        if (nextBtn) nextBtn.textContent = settings.nextLabel;
        if (emptyState) emptyState.textContent = settings.emptyMessage;

        function getCellText(row, index) {
            const cell = row.querySelector('td[data-column-index="' + index + '"]');
            return ((cell && cell.textContent) ? cell.textContent : '').trim().toLowerCase();
        }

        function compareValues(a, b) {
            const numA = parseFloat(a.replace(/[^0-9.-]/g, ''));
            const numB = parseFloat(b.replace(/[^0-9.-]/g, ''));
            const bothNumbers = !Number.isNaN(numA) && !Number.isNaN(numB);
            if (bothNumbers) return numA - numB;
            return a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' });
        }

        function update() {
            let workingRows = rows.slice();

            if (settings.enableSearch && state.query) {
                const q = state.query.toLowerCase();
                workingRows = workingRows.filter(function(row) {
                    return (row.textContent || '').toLowerCase().indexOf(q) !== -1;
                });
            }

            Object.keys(state.filterByColumn).forEach(function(key) {
                const filterValue = (state.filterByColumn[key] || '').toLowerCase().trim();
                if (!filterValue) return;
                const colIdx = parseInt(key, 10);
                workingRows = workingRows.filter(function(row) {
                    return getCellText(row, colIdx).indexOf(filterValue) !== -1;
                });
            });

            if (settings.enableSorting && state.sortIndex >= 0) {
                const idx = state.sortIndex;
                const dir = state.sortDir;
                workingRows.sort(function(rowA, rowB) {
                    const a = getCellText(rowA, idx);
                    const b = getCellText(rowB, idx);
                    const cmp = compareValues(a, b);
                    return dir === 'asc' ? cmp : -cmp;
                });
            }

            rows.forEach(function(row) {
                row.style.display = 'none';
            });

            const total = workingRows.length;
            const pages = settings.enablePagination ? Math.max(1, Math.ceil(total / settings.perPage)) : 1;
            state.currentPage = Math.max(1, Math.min(state.currentPage, pages));

            let pageRows = workingRows;
            let start = 0;
            let end = total;
            if (settings.enablePagination) {
                start = (state.currentPage - 1) * settings.perPage;
                end = Math.min(start + settings.perPage, total);
                pageRows = workingRows.slice(start, end);
            }

            pageRows.forEach(function(row) {
                row.style.display = '';
                tbody.appendChild(row);
            });

            if (emptyState) {
                emptyState.style.display = total === 0 ? '' : 'none';
            }

            if (info) {
                if (total === 0) {
                    info.textContent = settings.emptyMessage;
                } else {
                    info.textContent = 'Showing ' + (start + 1) + ' to ' + end + ' of ' + total + ' entries';
                }
            }

            if (prevBtn) {
                prevBtn.disabled = !settings.enablePagination || state.currentPage <= 1 || total === 0;
                prevBtn.style.opacity = prevBtn.disabled ? '0.5' : '1';
                prevBtn.style.cursor = prevBtn.disabled ? 'not-allowed' : 'pointer';
            }
            if (nextBtn) {
                nextBtn.disabled = !settings.enablePagination || state.currentPage >= pages || total === 0;
                nextBtn.style.opacity = nextBtn.disabled ? '0.5' : '1';
                nextBtn.style.cursor = nextBtn.disabled ? 'not-allowed' : 'pointer';
            }
        }

        if (searchInput && settings.enableSearch) {
            searchInput.addEventListener('input', function() {
                state.query = searchInput.value || '';
                state.currentPage = 1;
                update();
            });
        }

        columnFilters.forEach(function(input) {
            input.addEventListener('input', function() {
                const idx = input.getAttribute('data-column-index');
                state.filterByColumn[idx] = input.value || '';
                state.currentPage = 1;
                update();
            });
        });

        if (entriesSelector && settings.enablePagination) {
            entriesSelector.addEventListener('change', function() {
                const nextPerPage = Math.max(1, parseInt(entriesSelector.value || '10', 10));
                settings.perPage = nextPerPage;
                state.currentPage = 1;
                update();
            });
        }

        if (prevBtn) {
            prevBtn.addEventListener('click', function() {
                if (state.currentPage > 1) {
                    state.currentPage -= 1;
                    update();
                }
            });
        }

        if (nextBtn) {
            nextBtn.addEventListener('click', function() {
                state.currentPage += 1;
                update();
            });
        }

        sortableHeaders.forEach(function(th) {
            th.style.cursor = 'pointer';
            th.addEventListener('click', function() {
                const nextIndex = parseInt(th.getAttribute('data-column-index') || '-1', 10);
                if (nextIndex < 0) return;

                if (state.sortIndex === nextIndex) {
                    state.sortDir = state.sortDir === 'asc' ? 'desc' : 'asc';
                } else {
                    state.sortIndex = nextIndex;
                    state.sortDir = 'asc';
                }

                sortableHeaders.forEach(function(other) {
                    const label = (other.textContent || '').replace(/\s[▲▼]$/, '');
                    other.textContent = label;
                });
                const baseLabel = (th.textContent || '').replace(/\s[▲▼]$/, '');
                th.textContent = baseLabel + (state.sortDir === 'asc' ? ' ▲' : ' ▼');
                state.currentPage = 1;
                update();
            });
        });

        update();
    }
})();
