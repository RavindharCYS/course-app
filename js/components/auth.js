// auth.js

class AuthManager {
    constructor() {
        this.isAuthenticated = false;
        this.token = localStorage.getItem('authToken');
        this.user = JSON.parse(localStorage.getItem('user')) || null;
        this.initializeAuth();
    }

    // Initialize Authentication
    initializeAuth() {
        if (this.token) {
            this.isAuthenticated = true;
            this.updateUIForAuthState();
        }

        this.initializeLoginForm();
        this.initializeRegisterForm();
        this.initializePasswordReset();
        this.initializeLogout();
    }

    // Login Form Handling
    initializeLoginForm() {
        const loginForm = document.getElementById('loginForm');
        if (!loginForm) return;

        // Password visibility toggle
        const passwordToggle = loginForm.querySelector('.password-toggle');
        if (passwordToggle) {
            passwordToggle.addEventListener('click', () => this.togglePasswordVisibility(loginForm));
        }

        // Form submission
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleLogin(loginForm);
        });

        // Remember me functionality
        const rememberMe = loginForm.querySelector('#remember');
        if (rememberMe) {
            rememberMe.checked = localStorage.getItem('rememberMe') === 'true';
        }
    }

    // Register Form Handling
    initializeRegisterForm() {
        const registerForm = document.getElementById('registerForm');
        if (!registerForm) return;

        // Password strength indicator
        const passwordInput = registerForm.querySelector('#password');
        if (passwordInput) {
            passwordInput.addEventListener('input', (e) => this.updatePasswordStrength(e.target));
        }

        // Confirm password validation
        const confirmPassword = registerForm.querySelector('#confirmPassword');
        if (confirmPassword) {
            confirmPassword.addEventListener('input', () => this.validateConfirmPassword(registerForm));
        }

        // Form submission
        registerForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleRegistration(registerForm);
        });
    }

    // Login Handler
    async handleLogin(form) {
        try {
            const formData = new FormData(form);
            const email = formData.get('email');
            const password = formData.get('password');
            const rememberMe = formData.get('remember') === 'on';

            if (!this.validateLoginForm(form)) return;

            this.showLoadingState(form);

            // Simulate API call
            const response = await this.loginAPI(email, password);

            if (response.success) {
                this.setAuthData(response.token, response.user, rememberMe);
                this.showSuccessMessage('Login successful!');
                window.location.href = 'dashboard.html';
            }
        } catch (error) {
            this.showErrorMessage(error.message);
        } finally {
            this.hideLoadingState(form);
        }
    }

    // Registration Handler
    async handleRegistration(form) {
        try {
            const formData = new FormData(form);
            const userData = {
                fullName: formData.get('fullName'),
                email: formData.get('email'),
                password: formData.get('password'),
                confirmPassword: formData.get('confirmPassword')
            };

            if (!this.validateRegistrationForm(form)) return;

            this.showLoadingState(form);

            // Simulate API call
            const response = await this.registerAPI(userData);

            if (response.success) {
                this.showSuccessMessage('Registration successful! Please login.');
                window.location.href = 'login.html';
            }
        } catch (error) {
            this.showErrorMessage(error.message);
        } finally {
            this.hideLoadingState(form);
        }
    }

    // Form Validation
    validateLoginForm(form) {
        let isValid = true;
        const email = form.querySelector('#email');
        const password = form.querySelector('#password');

        // Clear previous errors
        this.clearErrors(form);

        // Email validation
        if (!this.validateEmail(email.value)) {
            this.showInputError(email, 'Please enter a valid email address');
            isValid = false;
        }

        // Password validation
        if (password.value.length < 6) {
            this.showInputError(password, 'Password must be at least 6 characters');
            isValid = false;
        }

        return isValid;
    }

    validateRegistrationForm(form) {
        let isValid = true;
        const fullName = form.querySelector('#fullName');
        const email = form.querySelector('#email');
        const password = form.querySelector('#password');
        const confirmPassword = form.querySelector('#confirmPassword');
        const terms = form.querySelector('#terms');

        // Clear previous errors
        this.clearErrors(form);

        // Full name validation
        if (fullName.value.trim().length < 2) {
            this.showInputError(fullName, 'Please enter your full name');
            isValid = false;
        }

        // Email validation
        if (!this.validateEmail(email.value)) {
            this.showInputError(email, 'Please enter a valid email address');
            isValid = false;
        }

        // Password validation
        if (!this.validatePassword(password.value)) {
            this.showInputError(password, 'Password must be at least 8 characters with numbers and letters');
            isValid = false;
        }

        // Confirm password validation
        if (password.value !== confirmPassword.value) {
            this.showInputError(confirmPassword, 'Passwords do not match');
            isValid = false;
        }

        // Terms validation
        if (!terms.checked) {
            this.showInputError(terms, 'Please accept the terms and conditions');
            isValid = false;
        }

        return isValid;
    }

    // Password Strength Checker
    updatePasswordStrength(passwordInput) {
        const strength = this.calculatePasswordStrength(passwordInput.value);
        const strengthBar = document.querySelector('.strength-level');
        const strengthText = document.querySelector('.strength-text');

        if (!strengthBar || !strengthText) return;

        // Update strength bar
        strengthBar.style.width = `${strength.score * 25}%`;
        strengthBar.style.backgroundColor = strength.color;
        strengthText.textContent = strength.message;
    }

    calculatePasswordStrength(password) {
        let score = 0;
        let message = '';
        let color = '';

        // Length check
        if (password.length >= 8) score++;
        // Contains number
        if (/\d/.test(password)) score++;
        // Contains letter
        if (/[a-zA-Z]/.test(password)) score++;
        // Contains special character
        if (/[!@#$%^&*]/.test(password)) score++;

        switch (score) {
            case 0:
            case 1:
                message = 'Weak';
                color = '#ff4444';
                break;
            case 2:
                message = 'Fair';
                color = '#ffbb33';
                break;
            case 3:
                message = 'Good';
                color = '#00C851';
                break;
            case 4:
                message = 'Strong';
                color = '#007E33';
                break;
        }

        return { score, message, color };
    }

    // Utility Functions
    validateEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    validatePassword(password) {
        return password.length >= 8 && /[0-9]/.test(password) && /[a-zA-Z]/.test(password);
    }

    togglePasswordVisibility(form) {
        const passwordInput = form.querySelector('[type="password"]');
        const toggleIcon = form.querySelector('.password-toggle');

        if (passwordInput.type === 'password') {
            passwordInput.type = 'text';
            toggleIcon.classList.replace('fa-eye-slash', 'fa-eye');
        } else {
            passwordInput.type = 'password';
            toggleIcon.classList.replace('fa-eye', 'fa-eye-slash');
        }
    }

    // API Simulation
    loginAPI(email, password) {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    success: true,
                    token: 'sample-token-123',
                    user: {
                        id: 1,
                        name: 'John Doe',
                        email: email
                    }
                });
            }, 1500);
        });
    }

    registerAPI(userData) {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    success: true,
                    message: 'Registration successful'
                });
            }, 1500);
        });
    }

    // Auth State Management
    setAuthData(token, user, remember) {
        this.token = token;
        this.user = user;
        this.isAuthenticated = true;

        if (remember) {
            localStorage.setItem('authToken', token);
            localStorage.setItem('user', JSON.stringify(user));
            localStorage.setItem('rememberMe', 'true');
        } else {
            sessionStorage.setItem('authToken', token);
            sessionStorage.setItem('user', JSON.stringify(user));
        }

        this.updateUIForAuthState();
    }

    logout() {
        this.token = null;
        this.user = null;
        this.isAuthenticated = false;

        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        localStorage.removeItem('rememberMe');
        sessionStorage.clear();

        window.location.href = 'login.html';
    }

    // UI Helpers
    showLoadingState(form) {
        const button = form.querySelector('button[type="submit"]');
        if (button) {
            button.disabled = true;
            button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading...';
        }
    }

    hideLoadingState(form) {
        const button = form.querySelector('button[type="submit"]');
        if (button) {
            button.disabled = false;
            button.innerHTML = form.id === 'loginForm' ? 
                '<i class="fas fa-sign-in-alt"></i> Login' : 
                '<i class="fas fa-user-plus"></i> Register';
        }
    }

    showInputError(input, message) {
        const errorElement = document.createElement('span');
        errorElement.className = 'error-message';
        errorElement.textContent = message;
        input.parentElement.appendChild(errorElement);
        input.classList.add('error');
    }

    clearErrors(form) {
        form.querySelectorAll('.error-message').forEach(error => error.remove());
        form.querySelectorAll('.error').forEach(input => input.classList.remove('error'));
    }

    showSuccessMessage(message) {
        // You can implement your own toast/notification system
        alert(message);
    }

    showErrorMessage(message) {
        // You can implement your own toast/notification system
        alert(message);
    }

    updateUIForAuthState() {
        const authLinks = document.querySelectorAll('.auth-link');
        const userMenu = document.querySelector('.user-menu');

        if (this.isAuthenticated) {
            authLinks?.forEach(link => link.style.display = 'none');
            userMenu?.style.display = 'flex';
        } else {
            authLinks?.forEach(link => link.style.display = 'flex');
            userMenu?.style.display = 'none';
        }
    }
}

// Initialize Authentication
const auth = new AuthManager();

// Export for use in other files
export default auth;