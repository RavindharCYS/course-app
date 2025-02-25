// certificates.js

class CertificateManager {
    constructor() {
        this.certificates = [];
        this.filteredCertificates = [];
        this.currentCategory = 'all';
        this.searchQuery = '';
        this.sortBy = 'newest';
        this.currentPage = 1;
        this.itemsPerPage = 9;

        this.initialize();
    }

    // Initialize Certificate Management
    async initialize() {
        try {
            await this.loadCertificates();
            this.initializeEventListeners();
            this.renderCertificates();
        } catch (error) {
            this.showError('Failed to load certificates');
        }
    }

    // Event Listeners
    initializeEventListeners() {
        // Search functionality
        const searchInput = document.querySelector('.search-bar input');
        if (searchInput) {
            searchInput.addEventListener('input', this.debounce(() => {
                this.searchQuery = searchInput.value;
                this.currentPage = 1;
                this.filterCertificates();
            }, 300));
        }

        // Category filter
        const categorySelect = document.querySelector('.filter-select');
        if (categorySelect) {
            categorySelect.addEventListener('change', (e) => {
                this.currentCategory = e.target.value;
                this.currentPage = 1;
                this.filterCertificates();
            });
        }

        // Sort filter
        const sortSelect = document.querySelector('.filter-select[data-type="sort"]');
        if (sortSelect) {
            sortSelect.addEventListener('change', (e) => {
                this.sortBy = e.target.value;
                this.sortCertificates();
                this.renderCertificates();
            });
        }

        // Initialize modal functionality
        this.initializeModal();
    }

    // Load Certificates (Simulated API Call)
    async loadCertificates() {
        try {
            const response = await this.fetchCertificates();
            this.certificates = response.certificates;
            this.filteredCertificates = [...this.certificates];
        } catch (error) {
            throw new Error('Failed to fetch certificates');
        }
    }

    // Filter Certificates
    filterCertificates() {
        this.filteredCertificates = this.certificates.filter(certificate => {
            const matchesCategory = this.currentCategory === 'all' || 
                                  certificate.category === this.currentCategory;
            const matchesSearch = certificate.courseName.toLowerCase()
                                .includes(this.searchQuery.toLowerCase());

            return matchesCategory && matchesSearch;
        });

        this.sortCertificates();
        this.renderCertificates();
    }

    // Sort Certificates
    sortCertificates() {
        this.filteredCertificates.sort((a, b) => {
            const dateA = new Date(a.completionDate);
            const dateB = new Date(b.completionDate);

            return this.sortBy === 'newest' ? 
                dateB - dateA : 
                dateA - dateB;
        });
    }

    // Render Certificates
    renderCertificates() {
        const certificateContainer = document.querySelector('.certificates-grid .container');
        if (!certificateContainer) return;

        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        const certificatesToShow = this.filteredCertificates.slice(startIndex, endIndex);

        certificateContainer.innerHTML = certificatesToShow.length ? 
            certificatesToShow.map(cert => this.createCertificateCard(cert)).join('') :
            this.createEmptyState();

        this.initializeCertificateActions();
    }

    // Create Certificate Card
    createCertificateCard(certificate) {
        return `
            <div class="certificate-card" data-id="${certificate.id}">
                <div class="certificate-preview">
                    <img src="${certificate.image}" alt="${certificate.courseName} Certificate">
                    <div class="certificate-overlay">
                        <button class="preview-btn" data-certificate="${certificate.id}">
                            <i class="fas fa-eye"></i> Preview
                        </button>
                        <button class="download-btn" data-certificate="${certificate.id}">
                            <i class="fas fa-download"></i> Download
                        </button>
                    </div>
                </div>
                <div class="certificate-info">
                    <h3>${certificate.courseName}</h3>
                    <div class="certificate-meta">
                        <span>
                            <i class="fas fa-calendar-alt"></i> 
                            Completed: ${this.formatDate(certificate.completionDate)}
                        </span>
                        <span>
                            <i class="fas fa-award"></i> 
                            Grade: ${certificate.grade}
                        </span>
                    </div>
                    <div class="certificate-actions">
                        <button class="share-btn" data-certificate="${certificate.id}">
                            <i class="fas fa-share-alt"></i> Share
                        </button>
                        <button class="verify-btn" data-certificate="${certificate.id}">
                            <i class="fas fa-check-circle"></i> Verify
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    // Create Empty State
    createEmptyState() {
        return `
            <div class="empty-state">
                <i class="fas fa-certificate"></i>
                <h3>No Certificates Found</h3>
                <p>Complete courses to earn certificates</p>
            </div>
        `;
    }

    // Initialize Certificate Actions
    initializeCertificateActions() {
        // Preview buttons
        document.querySelectorAll('.preview-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const certId = e.target.closest('button').dataset.certificate;
                this.previewCertificate(certId);
            });
        });

        // Download buttons
        document.querySelectorAll('.download-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const certId = e.target.closest('button').dataset.certificate;
                this.downloadCertificate(certId);
            });
        });

        // Share buttons
        document.querySelectorAll('.share-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const certId = e.target.closest('button').dataset.certificate;
                this.shareCertificate(certId);
            });
        });

        // Verify buttons
        document.querySelectorAll('.verify-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const certId = e.target.closest('button').dataset.certificate;
                this.verifyCertificate(certId);
            });
        });
    }

    // Modal Functionality
    initializeModal() {
        const modal = document.getElementById('certificateModal');
        const closeBtn = document.querySelector('.close-modal');

        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.closeModal());
        }

        if (modal) {
            window.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeModal();
                }
            });
        }
    }

    // Certificate Actions
    previewCertificate(certificateId) {
        const certificate = this.certificates.find(cert => cert.id === certificateId);
        if (!certificate) return;

        const modal = document.getElementById('certificateModal');
        const modalImg = document.getElementById('modalImage');

        if (modal && modalImg) {
            modalImg.src = certificate.image;
            modal.style.display = 'block';
        }
    }

    async downloadCertificate(certificateId) {
        try {
            const certificate = this.certificates.find(cert => cert.id === certificateId);
            if (!certificate) return;

            // Simulate download
            this.showToast('Downloading certificate...', 'info');
            await this.simulateDownload(certificate.image);
            this.showToast('Certificate downloaded successfully!', 'success');
        } catch (error) {
            this.showToast('Failed to download certificate', 'error');
        }
    }

    shareCertificate(certificateId) {
        const certificate = this.certificates.find(cert => cert.id === certificateId);
        if (!certificate) return;

        if (navigator.share) {
            navigator.share({
                title: `${certificate.courseName} Certificate`,
                text: `Check out my certificate for ${certificate.courseName}!`,
                url: window.location.href
            }).catch(() => {
                this.showToast('Failed to share certificate', 'error');
            });
        } else {
            // Fallback for browsers that don't support Web Share API
            this.copyToClipboard(window.location.href);
            this.showToast('Certificate link copied to clipboard!', 'success');
        }
    }

    async verifyCertificate(certificateId) {
        try {
            this.showToast('Verifying certificate...', 'info');
            // Simulate verification
            await this.simulateVerification(certificateId);
            this.showToast('Certificate verified successfully!', 'success');
        } catch (error) {
            this.showToast('Failed to verify certificate', 'error');
        }
    }

    // Utility Functions
    closeModal() {
        const modal = document.getElementById('certificateModal');
        if (modal) {
            modal.style.display = 'none';
        }
    }

    formatDate(date) {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    copyToClipboard(text) {
        navigator.clipboard.writeText(text);
    }

    showToast(message, type) {
        // Implement your toast notification system here
        console.log(`${type}: ${message}`);
    }

    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // Simulated API Calls
    async fetchCertificates() {
        return new Promise(resolve => {
            setTimeout(() => {
                resolve({
                    certificates: [
                        {
                            id: '1',
                            courseName: 'Cyber Security Basics',
                            category: 'cyber',
                            completionDate: '2023-05-15',
                            grade: 'A',
                            image: '../assets/certificates/cyber-security.jpg',
                            verificationId: 'CERT-123-456'
                        },
                        // Add more certificate objects here
                    ]
                });
            }, 1000);
        });
    }

    simulateDownload(url) {
        return new Promise(resolve => setTimeout(resolve, 1500));
    }

    simulateVerification(certificateId) {
        return new Promise(resolve => setTimeout(resolve, 1500));
    }
}

// Initialize Certificate Manager
const certificateManager = new CertificateManager();

// Export for use in other files
export default certificateManager;

document.addEventListener('DOMContentLoaded', function() {
    // Search functionality
    const searchInput = document.querySelector('.search-bar input');
    const searchButton = document.querySelector('.search-bar button');
    const certificateCards = document.querySelectorAll('.certificate-card');

    function performSearch() {
        const searchTerm = searchInput.value.toLowerCase();

        certificateCards.forEach(card => {
            const title = card.querySelector('h3').textContent.toLowerCase();
            const meta = card.querySelector('.certificate-meta').textContent.toLowerCase();

            if (title.includes(searchTerm) || meta.includes(searchTerm)) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        });
    }

    searchButton.addEventListener('click', performSearch);
    searchInput.addEventListener('keyup', function(e) {
        if (e.key === 'Enter') {
            performSearch();
        }
    });

    // Filter functionality
    const categorySelect = document.querySelector('.filter-select');
    categorySelect.addEventListener('change', function() {
        const selectedCategory = this.value;

        certificateCards.forEach(card => {
            if (selectedCategory === 'all' || card.dataset.category === selectedCategory) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        });
    });

    // Share functionality
    const shareBtns = document.querySelectorAll('.share-btn');
    shareBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            // Add your share functionality here
            alert('Share functionality coming soon!');
        });
    });

    // Download functionality
    const downloadBtns = document.querySelectorAll('.download-btn');
    downloadBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            // Add your download functionality here
            alert('Download functionality coming soon!');
        });
    });
});