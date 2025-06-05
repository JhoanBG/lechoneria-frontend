class LoginManager {
    constructor() {
      // ✅ URL base corregida
      this.apiUrl = 'http://localhost:3003';
      this.loginAttempts = 0;
      this.maxAttempts = 5;
      this.lockoutTime = 15 * 60 * 1000; // 15 minutos
      this.init();
    }
  
    init() {
      this.bindEvents();
      this.checkLockout();
      this.setupRealTimeValidation();
      this.checkExistingSession(); // ✅ Verificar si ya hay sesión activa
    }
  
    async checkExistingSession() {
      try {
        // ✅ URL corregida - eliminamos la duplicación
        const response = await fetch(`${this.apiUrl}/api/me`, {
          method: 'GET',
          credentials: 'include'
        });
  
        if (response.ok) {
          const data = await response.json();
          console.log('✅ Sesión activa encontrada:', data.user.nombre);
          this.showAlert(`Ya tienes una sesión activa como ${data.user.nombre}. Redirigiendo...`, 'success');
          setTimeout(() => {
            window.location.href = '../html/gestion.html';
          }, 2000);
        }
      } catch (error) {
        console.log('ℹ️ No hay sesión activa');
      }
    }
  
    bindEvents() {
      const form = document.getElementById('login-form');
      const passwordToggle = document.getElementById('password-toggle');
  
      form.addEventListener('submit', (e) => this.handleLogin(e));
      if (passwordToggle) {
        passwordToggle.addEventListener('click', () => this.togglePassword());
      }
  
      form.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          const hasErrors = document.querySelectorAll('.error-message.show').length > 0;
          if (hasErrors) e.preventDefault();
        }
      });
    }
  
    setupRealTimeValidation() {
      const emailInput = document.getElementById('email');
      const passwordInput = document.getElementById('password');
  
      if (emailInput) {
        emailInput.addEventListener('blur', () => this.validateEmail());
        emailInput.addEventListener('input', () => this.validateEmailRealTime());
      }
  
      if (passwordInput) {
        passwordInput.addEventListener('blur', () => this.validatePassword());
        passwordInput.addEventListener('input', () => this.clearFieldError('password'));
      }
    }
  
    validateEmailRealTime() {
      const email = document.getElementById('email').value;
      if (email.length > 0) {
        this.validateEmail();
      }
    }
  
    validateEmail() {
      const emailInput = document.getElementById('email');
      const email = emailInput.value.trim();
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
      if (!email) {
        this.showFieldError('email', 'El correo electrónico es requerido');
        return false;
      }
  
      if (!emailRegex.test(email)) {
        this.showFieldError('email', 'Ingrese un correo electrónico válido');
        return false;
      }
  
      this.showFieldSuccess('email');
      return true;
    }
  
    validatePassword() {
      const passwordInput = document.getElementById('password');
      const password = passwordInput.value;
  
      if (!password) {
        this.showFieldError('password', 'La contraseña es requerida');
        return false;
      }
  
      if (password.length < 6) {
        this.showFieldError('password', 'La contraseña debe tener al menos 6 caracteres');
        return false;
      }
  
      this.clearFieldError('password');
      return true;
    }
  
    showFieldError(fieldName, message) {
      const input = document.getElementById(fieldName);
      const errorElement = document.getElementById(`${fieldName}-error`);
      const successElement = document.getElementById(`${fieldName}-success`);
  
      if (input) {
        input.classList.add('error');
        input.classList.remove('success');
      }
  
      if (errorElement) {
        const span = errorElement.querySelector('span');
        if (span) span.textContent = message;
        errorElement.classList.add('show');
      }
  
      if (successElement) {
        successElement.classList.remove('show');
      }
    }
  
    showFieldSuccess(fieldName) {
      const input = document.getElementById(fieldName);
      const errorElement = document.getElementById(`${fieldName}-error`);
      const successElement = document.getElementById(`${fieldName}-success`);
  
      if (input) {
        input.classList.remove('error');
        input.classList.add('success');
      }
  
      if (errorElement) {
        errorElement.classList.remove('show');
      }
  
      if (successElement) {
        successElement.classList.add('show');
      }
    }
  
    clearFieldError(fieldName) {
      const input = document.getElementById(fieldName);
      const errorElement = document.getElementById(`${fieldName}-error`);
      const successElement = document.getElementById(`${fieldName}-success`);
  
      if (input) input.classList.remove('error');
      if (errorElement) errorElement.classList.remove('show');
      if (successElement) successElement.classList.remove('show');
    }
  
    togglePassword() {
      const passwordInput = document.getElementById('password');
      const toggleIcon = document.querySelector('.password-toggle i');
  
      if (passwordInput && toggleIcon) {
        if (passwordInput.type === 'password') {
          passwordInput.type = 'text';
          toggleIcon.classList.remove('fa-eye');
          toggleIcon.classList.add('fa-eye-slash');
        } else {
          passwordInput.type = 'password';
          toggleIcon.classList.remove('fa-eye-slash');
          toggleIcon.classList.add('fa-eye');
        }
      }
    }
  
    async handleLogin(e) {
      e.preventDefault();
  
      if (this.isLockedOut()) {
        this.showAlert('Demasiados intentos fallidos. Intenta de nuevo más tarde.', 'warning');
        return;
      }
  
      const emailValid = this.validateEmail();
      const passwordValid = this.validatePassword();
  
      if (!emailValid || !passwordValid) {
        this.showAlert('Por favor, corrige los errores en el formulario', 'error');
        return;
      }
  
      const email = document.getElementById('email').value.trim();
      const password = document.getElementById('password').value;
      const loginButton = document.getElementById('login-button');
  
      this.setLoading(loginButton, true);
  
      try {
        console.log('🔑 Intentando login para:', email);
        // ✅ URL corregida - eliminamos la duplicación /login/login
        const response = await fetch(`${this.apiUrl}/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
          credentials: 'include'
        });
  
        const data = await response.json();
        console.log('📊 Respuesta del servidor:', data);
  
        if (response.ok && data.success) {
          this.showAlert('¡Inicio de sesión exitoso! Redirigiendo...', 'success');
          this.loginAttempts = 0;
          this.removeFromStorage('loginAttempts');
  
          setTimeout(() => {
            window.location.href = '../html/monitoreo.html';
          }, 1500);
        } else {
          this.handleLoginError(data.message || 'Credenciales incorrectas');
        }
      } catch (error) {
        console.error('❌ Error de red:', error);
        this.showAlert('Error de conexión. Verifica tu conexión a internet.', 'error');
      } finally {
        this.setLoading(loginButton, false);
      }
    }
  
    handleLoginError(message) {
      this.loginAttempts++;
      this.saveToStorage('loginAttempts', this.loginAttempts);
      this.saveToStorage('lastAttempt', Date.now());
  
      if (this.loginAttempts >= this.maxAttempts) {
        this.showAlert(`Demasiados intentos fallidos. Cuenta bloqueada por ${this.lockoutTime / 60000} minutos.`, 'warning');
      } else {
        const remaining = this.maxAttempts - this.loginAttempts;
        this.showAlert(`${message}. Te quedan ${remaining} intentos.`, 'error');
      }
    }
  
    checkLockout() {
      const attempts = this.getFromStorage('loginAttempts') || 0;
      const lastAttempt = this.getFromStorage('lastAttempt') || 0;
      const timeSinceLastAttempt = Date.now() - lastAttempt;
  
      if (attempts >= this.maxAttempts && timeSinceLastAttempt < this.lockoutTime) {
        const remainingTime = Math.ceil((this.lockoutTime - timeSinceLastAttempt) / 60000);
        this.showAlert(`Cuenta temporalmente bloqueada. Intenta de nuevo en ${remainingTime} minutos.`, 'warning');
        return true;
      }
  
      if (timeSinceLastAttempt >= this.lockoutTime) {
        this.loginAttempts = 0;
        this.removeFromStorage('loginAttempts');
        this.removeFromStorage('lastAttempt');
      } else {
        this.loginAttempts = attempts;
      }
  
      return false;
    }
  
    isLockedOut() {
      return this.checkLockout();
    }
  
    showAlert(message, type) {
      const alertContainer = document.getElementById('alert-container');
      const alertMessage = document.getElementById('alert-message');
      if (!alertContainer || !alertMessage) {
        alert(message);
        return;
      }
  
      const alertIcon = alertContainer.querySelector('i');
      alertMessage.textContent = message;
      alertContainer.className = `alert ${type} show`;
  
      if (alertIcon) {
        alertIcon.className =
          type === 'success' ? 'fas fa-check-circle' :
          type === 'warning' ? 'fas fa-exclamation-triangle' :
          'fas fa-exclamation-circle';
      }
  
      setTimeout(() => {
        alertContainer.classList.remove('show');
      }, 5000);
    }
  
    setLoading(button, loading) {
      if (!button) return;
      button.classList.toggle('loading', loading);
      button.disabled = loading;
      button.textContent = loading ? 'Iniciando sesión...' : 'Iniciar Sesión';
    }
  
    saveToStorage(key, value) {
      window.tempStorage = window.tempStorage || {};
      window.tempStorage[key] = value;
    }
  
    getFromStorage(key) {
      window.tempStorage = window.tempStorage || {};
      return window.tempStorage[key];
    }
  
    removeFromStorage(key) {
      window.tempStorage = window.tempStorage || {};
      delete window.tempStorage[key];
    }
  }
  
  // ✅ FUNCIÓN GLOBAL PARA RECUPERAR CONTRASEÑA
  function mostrarRecuperarPassword() {
    const email = document.getElementById('email').value.trim();
  
    if (!email) {
      alert('Por favor, ingresa tu correo electrónico primero');
      document.getElementById('email').focus();
      return;
    }
  
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      alert('Por favor, ingresa un correo electrónico válido');
      document.getElementById('email').focus();
      return;
    }
  
    alert(`Se enviará un enlace de recuperación a: ${email}`);
  
    fetch('http://localhost:3003/recuperar-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
      credentials: 'include'
    })
    .then(res => res.json())
    .then(data => {
      alert(data.success ? 'Se ha enviado un enlace de recuperación a tu correo' : 'Error: ' + data.message);
    })
    .catch(() => alert('Error de conexión'));
  }
  
  // ✅ INICIAR APLICACIÓN CUANDO EL DOM ESTÉ LISTO
  document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Inicializando Login Manager...');
    new LoginManager();
  });
  
  // ✅ EXPONER FUNCIONES GLOBALES
  window.mostrarRecuperarPassword = mostrarRecuperarPassword;

