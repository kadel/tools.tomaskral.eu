/**
 * Shared JavaScript for tool pages
 */

class ToolPage {
    constructor(options) {
        this.toolName = options.toolName;
        this.apiEndpoint = options.apiEndpoint;
        this.getRequestBody = options.getRequestBody;
        this.validateInput = options.validateInput || (() => null);
        this.formatResult = options.formatResult || ((data) => JSON.stringify(data, null, 2));
        this.submitButtonText = options.submitButtonText || 'Submit';
        this.loadingText = options.loadingText || 'Processing...';

        this.form = document.getElementById('convertForm');
        this.submitBtn = document.getElementById('submitBtn');
        this.resultSection = document.getElementById('resultSection');
        this.resultContent = document.getElementById('resultContent');
        this.errorSection = document.getElementById('errorSection');
        this.copyBtn = document.getElementById('copyBtn');
        this.docsSection = document.getElementById('docsSection');
        this.docsToggle = document.getElementById('docsToggle');
        this.docsContent = document.getElementById('docsContent');

        this.init();
    }

    init() {
        this.setupDocsToggle();
        this.loadDocs();
        this.setupForm();
        this.setupCopyButton();
        this.setupExampleLinks();
    }

    setupDocsToggle() {
        if (this.docsToggle && this.docsSection) {
            this.docsToggle.addEventListener('click', () => {
                this.docsSection.classList.toggle('open');
            });
        }
    }

    async loadDocs() {
        if (!this.docsContent) return;

        try {
            const response = await fetch(`/${this.toolName}/readme`);
            if (!response.ok) throw new Error('Failed to load docs');
            const markdown = await response.text();
            this.docsContent.innerHTML = marked.parse(markdown);
        } catch (error) {
            this.docsContent.innerHTML = '<p>Failed to load documentation.</p>';
        }
    }

    setupForm() {
        if (!this.form) return;

        this.form.addEventListener('submit', async (e) => {
            e.preventDefault();

            const validationError = this.validateInput();
            if (validationError) {
                this.showError(validationError);
                return;
            }

            const requestBody = this.getRequestBody();
            if (!requestBody) return;

            this.submitBtn.disabled = true;
            this.submitBtn.textContent = this.loadingText;
            this.hideError();

            try {
                const response = await fetch(this.apiEndpoint, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(requestBody)
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.message || data.error || 'Request failed');
                }

                this.resultContent.textContent = this.formatResult(data);
                this.resultSection.classList.add('visible');
            } catch (error) {
                this.showError(error.message);
            } finally {
                this.submitBtn.disabled = false;
                this.submitBtn.textContent = this.submitButtonText;
            }
        });
    }

    setupCopyButton() {
        if (!this.copyBtn) return;

        this.copyBtn.addEventListener('click', async () => {
            try {
                await navigator.clipboard.writeText(this.resultContent.textContent);
                this.copyBtn.textContent = 'Copied!';
                setTimeout(() => {
                    this.copyBtn.textContent = 'Copy';
                }, 2000);
            } catch (err) {
                this.showError('Failed to copy to clipboard');
            }
        });
    }

    setupExampleLinks() {
        const exampleLinks = document.querySelectorAll('.example-link');
        exampleLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetInput = document.getElementById(link.dataset.target || 'url');
                if (targetInput) {
                    targetInput.value = link.dataset.url || link.dataset.value;
                }
            });
        });
    }

    showError(message) {
        if (this.errorSection) {
            this.errorSection.textContent = message;
            this.errorSection.style.display = 'block';
        }
        if (this.resultSection) {
            this.resultSection.classList.remove('visible');
        }
    }

    hideError() {
        if (this.errorSection) {
            this.errorSection.style.display = 'none';
        }
    }
}
