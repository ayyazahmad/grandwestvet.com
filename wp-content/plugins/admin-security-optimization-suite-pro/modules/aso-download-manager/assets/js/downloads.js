(function() {
    document.addEventListener('DOMContentLoaded', function() {
        const buttons = document.querySelectorAll('.aso-download-btn');

        buttons.forEach(button => {
            button.addEventListener('click', function(e) {
                e.preventDefault();

                const downloadId = this.getAttribute('data-download-id');
                const newTab = this.getAttribute('data-new-tab') === '1';
                const disableCounter = this.getAttribute('data-disable-counter') === '1';
                const isCompact = this.classList.contains('aso-download-compact-btn');
                const originalText = this.textContent;
                const originalHTML = this.innerHTML;

                // For compact buttons, add a loading class instead of changing text
                if (isCompact) {
                    this.classList.add('loading');
                } else {
                    this.classList.add('loading');
                    this.textContent = asoDownloadData.labels.downloading;
                }

                const formData = new FormData();
                formData.append('action', 'aso_download_file');
                formData.append('download_id', downloadId);
                formData.append('nonce', asoDownloadData.nonce);
                formData.append('disable_counter', disableCounter ? '1' : '0');

                fetch(asoDownloadData.ajaxUrl, {
                    method: 'POST',
                    body: formData
                })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        const fileUrl = data.data.url;
                        const target = newTab ? '_blank' : '_self';

                        if (data.data.force_download) {
                            const link = document.createElement('a');
                            link.href = fileUrl;
                            link.download = '';
                            document.body.appendChild(link);
                            link.click();
                            document.body.removeChild(link);
                        } else {
                            window.open(fileUrl, target);
                        }
                    }
                })
                .catch(error => {
                    console.error('Download error:', error);
                })
                .finally(() => {
                    this.classList.remove('loading');
                    if (isCompact) {
                        this.innerHTML = originalHTML;
                    } else {
                        this.textContent = originalText;
                    }
                });
            });
        });
    });
})();
