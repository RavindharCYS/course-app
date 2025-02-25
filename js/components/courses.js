// courses.js

class CourseManager {
    constructor() {
        this.courses = [];
        this.filteredCourses = [];
        this.currentCategory = 'all';
        this.currentProgress = 'all';
        this.searchQuery = '';
        this.currentPage = 1;
        this.itemsPerPage = 9;

        this.initialize();
    }

    // Initialize Course Management
    async initialize() {
        try {
            await this.loadCourses();
            this.initializeEventListeners();
            this.initializeFilters();
            this.renderCourses();
        } catch (error) {
            this.showError('Failed to load courses');
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
                this.filterCourses();
            }, 300));
        }

        // Category filters
        const filterButtons = document.querySelectorAll('.filter-btn');
        filterButtons.forEach(button => {
            button.addEventListener('click', () => {
                this.setActiveFilter(button);
                this.currentCategory = button.dataset.category;
                this.currentPage = 1;
                this.filterCourses();
            });
        });

        // Progress filters
        const progressButtons = document.querySelectorAll('.progress-btn');
        progressButtons.forEach(button => {
            button.addEventListener('click', () => {
                this.setActiveProgress(button);
                this.currentProgress = button.dataset.progress;
                this.currentPage = 1;
                this.filterCourses();
            });
        });

        // Pagination
        this.initializePagination();
    }

    // Initialize Filters
    initializeFilters() {
        // Set default active filters
        const defaultCategoryFilter = document.querySelector('.filter-btn[data-category="all"]');
        const defaultProgressFilter = document.querySelector('.progress-btn[data-progress="all"]');

        if (defaultCategoryFilter) defaultCategoryFilter.classList.add('active');
        if (defaultProgressFilter) defaultProgressFilter.classList.add('active');
    }

    // Load Courses (Simulated API Call)
    async loadCourses() {
        try {
            // Simulate API call
            const response = await this.fetchCourses();
            this.courses = response.courses;
            this.filteredCourses = [...this.courses];
        } catch (error) {
            throw new Error('Failed to fetch courses');
        }
    }

    // Filter Courses
    filterCourses() {
        this.filteredCourses = this.courses.filter(course => {
            const matchesCategory = this.currentCategory === 'all' || course.category === this.currentCategory;
            const matchesProgress = this.currentProgress === 'all' || course.progress === this.currentProgress;
            const matchesSearch = course.title.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
                                course.description.toLowerCase().includes(this.searchQuery.toLowerCase());

            return matchesCategory && matchesProgress && matchesSearch;
        });

        this.renderCourses();
        this.updatePagination();
    }

    // Render Courses
    renderCourses() {
        const courseContainer = document.querySelector('.courses-grid .container');
        if (!courseContainer) return;

        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        const coursesToShow = this.filteredCourses.slice(startIndex, endIndex);

        courseContainer.innerHTML = coursesToShow.length ? 
            coursesToShow.map(course => this.createCourseCard(course)).join('') :
            this.createEmptyState();

        // Initialize course card interactions
        this.initializeCourseCards();
    }

    // Create Course Card HTML
    createCourseCard(course) {
        return `
            <div class="course-card" data-course-id="${course.id}">
                <div class="course-image">
                    <img src="${course.image}" alt="${course.title}">
                    <div class="course-badge">${course.category}</div>
                </div>
                <div class="course-content">
                    <h3>${course.title}</h3>
                    <div class="course-info">
                        <span><i class="fas fa-clock"></i> ${course.duration}</span>
                        <span><i class="fas fa-user-graduate"></i> ${course.level}</span>
                    </div>
                    <p>${course.description}</p>
                    <div class="course-footer">
                        <div class="rating">
                            ${this.createRatingStars(course.rating)}
                            <span>(${course.reviews} reviews)</span>
                        </div>
                        <a href="course-detail.html?id=${course.id}" class="enroll-btn">
                            ${course.enrolled ? 'Continue' : 'Enroll Now'}
                        </a>
                    </div>
                </div>
            </div>
        `;
    }

    // Create Rating Stars
    createRatingStars(rating) {
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 !== 0;
        let stars = '';

        for (let i = 0; i < 5; i++) {
            if (i < fullStars) {
                stars += '<i class="fas fa-star"></i>';
            } else if (i === fullStars && hasHalfStar) {
                stars += '<i class="fas fa-star-half-alt"></i>';
            } else {
                stars += '<i class="far fa-star"></i>';
            }
        }

        return stars;
    }

    // Create Empty State
    createEmptyState() {
        return `
            <div class="empty-state">
                <i class="fas fa-search"></i>
                <h3>No Courses Found</h3>
                <p>Try adjusting your search or filter criteria</p>
            </div>
        `;
    }

    // Initialize Course Cards
    initializeCourseCards() {
        const courseCards = document.querySelectorAll('.course-card');
        courseCards.forEach(card => {
            card.addEventListener('click', (e) => {
                if (!e.target.closest('.enroll-btn')) {
                    const courseId = card.dataset.courseId;
                    window.location.href = `course-detail.html?id=${courseId}`;
                }
            });
        });
    }

    // Pagination
    initializePagination() {
        const pagination = document.querySelector('.pagination');
        if (!pagination) return;

        pagination.addEventListener('click', (e) => {
            if (e.target.classList.contains('page-btn')) {
                this.currentPage = parseInt(e.target.textContent);
                this.renderCourses();
                this.updatePagination();
            }
        });
    }

    updatePagination() {
        const pagination = document.querySelector('.pagination');
        if (!pagination) return;

        const totalPages = Math.ceil(this.filteredCourses.length / this.itemsPerPage);
        let paginationHTML = '';

        for (let i = 1; i <= totalPages; i++) {
            paginationHTML += `
                <button class="page-btn ${i === this.currentPage ? 'active' : ''}">
                    ${i}
                </button>
            `;
        }

        pagination.innerHTML = paginationHTML;
    }

    // Filter Helpers
    setActiveFilter(button) {
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        button.classList.add('active');
    }

    setActiveProgress(button) {
        document.querySelectorAll('.progress-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        button.classList.add('active');
    }

    // API Simulation
    async fetchCourses() {
        return new Promise(resolve => {
            setTimeout(() => {
                resolve({
                    courses: [
                        {
                            id: 1,
                            title: 'Cyber Security Basics',
                            category: 'cyber',
                            description: 'Learn the fundamentals of cyber security',
                            image: '../assets/images/courses/cyber-security.jpg',
                            duration: '8 weeks',
                            level: 'Beginner',
                            rating: 4.5,
                            reviews: 128,
                            enrolled: false,
                            progress: 'not-started'
                        },
                        // Add more course objects here
                    ]
                });
            }, 1000);
        });
    }

    // Utility Functions
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

    showError(message) {
        const container = document.querySelector('.courses-grid .container');
        if (container) {
            container.innerHTML = `
                <div class="error-state">
                    <i class="fas fa-exclamation-circle"></i>
                    <h3>Error</h3>
                    <p>${message}</p>
                </div>
            `;
        }
    }
}

// Initialize Course Manager
const courseManager = new CourseManager();

// Export for use in other files
export default courseManager;

document.addEventListener('DOMContentLoaded', function() {
    // Filter Buttons
    const filterBtns = document.querySelectorAll('.filter-btn');
    const courseCards = document.querySelectorAll('.course-card');

    filterBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            // Remove active class from all buttons
            filterBtns.forEach(b => b.classList.remove('active'));
            // Add active class to clicked button
            this.classList.add('active');

            const category = this.dataset.category;

            courseCards.forEach(card => {
                if (category === 'all' || card.dataset.category === category) {
                    card.style.display = 'block';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    });

    // Search Functionality
    const searchInput = document.querySelector('.search-bar input');
    const searchButton = document.querySelector('.search-bar button');

    function performSearch() {
        const searchTerm = searchInput.value.toLowerCase();

        courseCards.forEach(card => {
            const title = card.querySelector('h3').textContent.toLowerCase();
            const description = card.querySelector('p').textContent.toLowerCase();

            if (title.includes(searchTerm) || description.includes(searchTerm)) {
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
});