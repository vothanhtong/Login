// AI Assistant Login & Register Form JavaScript
class AIAssistantForm {
    constructor() {
        this.loginForm = document.getElementById('loginForm');
        this.registerForm = document.getElementById('registerForm');
        this.form = this.loginForm || this.registerForm;
        
        if (!this.form) return;

        this.isLogin = !!this.loginForm;
        this.emailInput = document.getElementById('email');
        this.passwordInput = document.getElementById('password');
        this.confirmPasswordInput = document.getElementById('confirmPassword');
        this.passwordToggle = document.getElementById('passwordToggle');
        this.submitButton = this.form.querySelector('.neural-button');
        this.successMessage = document.getElementById('successMessage');
        this.socialButtons = document.querySelectorAll('.social-neural');
        
        this.init();
    }
    
    init() {
        this.bindEvents();
        if (this.passwordToggle) this.setupPasswordToggle();
        this.setupSocialButtons();
        this.setupAIEffects();
    }
    
    bindEvents() {
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));
        this.emailInput.addEventListener('blur', () => this.validateEmail());
        this.passwordInput.addEventListener('blur', () => this.validatePassword());
        if (this.confirmPasswordInput) {
            this.confirmPasswordInput.addEventListener('blur', () => this.validateConfirmPassword());
            this.confirmPasswordInput.addEventListener('input', () => this.clearError('confirmPassword'));
        }
        
        this.emailInput.addEventListener('input', () => this.clearError('email'));
        this.passwordInput.addEventListener('input', () => this.clearError('password'));
        
        // Add placeholder for label animations
        this.emailInput.setAttribute('placeholder', ' ');
        this.passwordInput.setAttribute('placeholder', ' ');
        if (this.confirmPasswordInput) this.confirmPasswordInput.setAttribute('placeholder', ' ');
    }
    
    setupPasswordToggle() {
        this.passwordToggle.addEventListener('click', () => {
            const type = this.passwordInput.type === 'password' ? 'text' : 'password';
            this.passwordInput.type = type;
            this.passwordToggle.classList.toggle('toggle-active', type === 'text');
        });
    }
    
    setupSocialButtons() {
        this.socialButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const provider = button.querySelector('span').textContent.trim();
                alert(`Social login with ${provider} is coming soon!`);
            });
        });
    }
    
    setupAIEffects() {
        [this.emailInput, this.passwordInput, this.confirmPasswordInput].forEach(input => {
            if (!input) return;
            input.addEventListener('focus', (e) => {
                const field = e.target.closest('.smart-field');
                if (field) this.triggerNeuralEffect(field);
            });
        });
    }
    
    triggerNeuralEffect(field) {
        const indicator = field.querySelector('.ai-indicator');
        if (indicator) {
            indicator.style.opacity = '1';
            setTimeout(() => {
                indicator.style.opacity = '';
            }, 2000);
        }
    }
    
    validateEmail() {
        const email = this.emailInput.value.trim();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        
        if (!email) {
            this.showError('email', 'Email is required');
            return false;
        }
        
        if (!emailRegex.test(email)) {
            this.showError('email', 'Invalid email format');
            return false;
        }
        
        this.clearError('email');
        return true;
    }
    
    validatePassword() {
        const password = this.passwordInput.value;
        if (!password) {
            this.showError('password', 'Password is required');
            return false;
        }
        if (password.length < 6) {
            this.showError('password', 'Security key must be at least 6 characters');
            return false;
        }
        this.clearError('password');
        return true;
    }

    validateConfirmPassword() {
        if (!this.confirmPasswordInput) return true;
        
        const password = this.passwordInput.value;
        const confirm = this.confirmPasswordInput.value;
        
        if (password !== confirm) {
            this.showError('confirmPassword', 'Passwords do not match');
            return false;
        }
        this.clearError('confirmPassword');
        return true;
    }
    
    showError(field, message) {
        const input = document.getElementById(field);
        const smartField = input.closest('.smart-field');
        const errorElement = document.getElementById(`${field}Error`);
        
        smartField.classList.add('error');
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.classList.add('show');
        }
    }
    
    clearError(field) {
        const input = document.getElementById(field);
        const smartField = input ? input.closest('.smart-field') : null;
        const errorElement = document.getElementById(`${field}Error`);
        
        if (smartField) smartField.classList.remove('error');
        if (errorElement) {
            errorElement.classList.remove('show');
            setTimeout(() => {
                errorElement.textContent = '';
            }, 200);
        }
    }
    
    async handleSubmit(e) {
        e.preventDefault();
        
        const isEmailValid = this.validateEmail();
        const isPasswordValid = this.validatePassword();
        const isConfirmValid = this.validateConfirmPassword();
        
        if (!isEmailValid || !isPasswordValid || !isConfirmValid) {
            return;
        }
        
        const email = this.emailInput.value;
        const password = this.passwordInput.value;
        
        this.setLoading(true);
        
        const endpoint = this.isLogin ? '/api/login' : '/api/register';
        
        try {
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            
            const data = await response.json();
            
            if (data.success) {
                if (this.isLogin && data.token) {
                    localStorage.setItem('token', data.token);
                    localStorage.setItem('userEmail', data.email);
                }
                this.showNeuralSuccess(data.message);
                
                // Redirect to dashboard page after login
                if (this.isLogin) {
                    setTimeout(() => {
                        window.location.href = 'dashboard.html';
                    }, 2000);
                }
            } else {
                this.showError('password', data.message || 'Access Denied');
            }
        } catch (error) {
            console.error('Connection error:', error);
            this.showError('password', 'Neural connection failed. Ensure server is running.');
        } finally {
            this.setLoading(false);
        }
    }
    
    setLoading(loading) {
        this.submitButton.classList.toggle('loading', loading);
        this.submitButton.disabled = loading;
        this.socialButtons.forEach(button => {
            button.style.pointerEvents = loading ? 'none' : 'auto';
            button.style.opacity = loading ? '0.5' : '1';
        });
    }
    
    showNeuralSuccess(msg) {
        this.form.style.transform = 'scale(0.95)';
        this.form.style.opacity = '0';
        
        if (this.successMessage) {
            const p = this.successMessage.querySelector('p');
            if (p) p.textContent = msg;
        }

        setTimeout(() => {
            this.form.style.display = 'none';
            const extra = document.querySelectorAll('.neural-social, .signup-section, .auth-separator');
            extra.forEach(el => el.style.display = 'none');
            
            this.successMessage.classList.add('show');
            
            if (!this.isLogin) {
                // If it was registration, redirect to login after a delay
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 2000);
            }
        }, 300);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new AIAssistantForm();
});
