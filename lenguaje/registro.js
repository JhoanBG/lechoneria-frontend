// Form validation and submission
class RegisterForm {
    constructor() {
      this.form = document.getElementById('registerForm');
      this.fields = {
        nombre: document.getElementById('nombre'),
        email: document.getElementById('email'),
        password: document.getElementById('password'),
        confirmar: document.getElementById('confirmar')
      };
      this.submitBtn = document.querySelector('.submit-btn');
      // ⚠️ CORRECCIÓN: URL simplificada para coincidir con el backend
      this.url = 'http://localhost:3003';
      this.init();
    }
  
    init() {
      this.setupEventListeners();
      this.setupPasswordToggle();
      this.setupPasswordStrength();
    }
  
    setupEventListeners() {
      this.form.addEventListener('submit', this.handleSubmit.bind(this));
      
      Object.keys(this.fields).forEach(fieldName => {
        const field = this.fields[fieldName];
        field.addEventListener('blur', () => this.validateField(fieldName));
        field.addEventListener('input', () => this.clearError(fieldName));
      });
    }
  
    setupPasswordToggle() {
      document.querySelectorAll('.password-toggle').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const targetId = e.target.getAttribute('data-target');
          const input = document.getElementById(targetId);
          const isPassword = input.type === 'password';
          
          input.type = isPassword ? 'text' : 'password';
          e.target.textContent = isPassword ? '🙈' : '👁️';
        });
      });
    }
  
    setupPasswordStrength() {
      const passwordField = this.fields.password;
      const strengthFill = document.getElementById('strength-fill');
      const strengthText = document.getElementById('strength-text');
  
      passwordField.addEventListener('input', (e) => {
        const password = e.target.value;
        const strength = this.calculatePasswordStrength(password);
        
        strengthFill.className = 'strength-fill';
        if (password.length > 0) {
          strengthFill.classList.add(`strength-${strength.level}`);
          strengthText.textContent = strength.text;
          strengthText.style.color = strength.color;
        } else {
          strengthText.textContent = 'Ingresa una contraseña';
          strengthText.style.color = 'var(--text-secondary)';
        }
      });
    }
  
    calculatePasswordStrength(password) {
      let score = 0;
      const checks = {
        length: password.length >= 8,
        lowercase: /[a-z]/.test(password),
        uppercase: /[A-Z]/.test(password),
        numbers: /\d/.test(password),
        symbols: /[!@#$%^&*(),.?":{}|<>]/.test(password)
      };
  
      score = Object.values(checks).filter(Boolean).length;
  
      if (score <= 2) return { level: 'weak', text: 'Débil', color: 'var(--error-color)' };
      if (score === 3) return { level: 'fair', text: 'Regular', color: 'var(--warning-color)' };
      if (score === 4) return { level: 'good', text: 'Buena', color: 'var(--accent-color)' };
      return { level: 'strong', text: 'Muy fuerte', color: 'var(--success-color)' };
    }
  
    validateField(fieldName) {
      const field = this.fields[fieldName];
      const value = field.value.trim();
      let isValid = true;
      let errorMessage = '';
  
      switch (fieldName) {
        case 'nombre':
          if (!value) {
            errorMessage = 'El nombre es requerido';
            isValid = false;
          } else if (value.length < 2) {
            errorMessage = 'El nombre debe tener al menos 2 caracteres';
            isValid = false;
          } else if (!/^[a-zA-ZÀ-ÿ\s]+$/.test(value)) {
            errorMessage = 'El nombre solo puede contener letras y espacios';
            isValid = false;
          }
          break;
  
        case 'email':
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!value) {
            errorMessage = 'El correo electrónico es requerido';
            isValid = false;
          } else if (!emailRegex.test(value)) {
            errorMessage = 'Ingresa un correo electrónico válido';
            isValid = false;
          }
          break;
  
        case 'password':
          if (!value) {
            errorMessage = 'La contraseña es requerida';
            isValid = false;
          } else if (value.length < 8) {
            errorMessage = 'La contraseña debe tener al menos 8 caracteres';
            isValid = false;
          }
          break;
  
        case 'confirmar':
          if (!value) {
            errorMessage = 'Confirma tu contraseña';
            isValid = false;
          } else if (value !== this.fields.password.value) {
            errorMessage = 'Las contraseñas no coinciden';
            isValid = false;
          }
          break;
      }
  
      this.showError(fieldName, errorMessage, !isValid);
      return isValid;
    }
  
    showError(fieldName, message, show) {
      const field = this.fields[fieldName];
      const errorElement = document.getElementById(`${fieldName}-error`);
      
      if (!errorElement) {
        console.warn(`Elemento de error no encontrado: ${fieldName}-error`);
        return;
      }
      
      const errorText = errorElement.querySelector('.error-text');
      
      if (!errorText) {
        console.warn(`Elemento de texto de error no encontrado en: ${fieldName}-error`);
        return;
      }
  
      if (show) {
        field.classList.add('error');
        errorText.textContent = message;
        errorElement.classList.add('show');
      } else {
        field.classList.remove('error');
        errorElement.classList.remove('show');
      }
    }
  
    clearError(fieldName) {
      this.showError(fieldName, '', false);
    }
  
    validateForm() {
      let isValid = true;
      Object.keys(this.fields).forEach(fieldName => {
        if (!this.validateField(fieldName)) {
          isValid = false;
        }
      });
      return isValid;
    }
  
    async handleSubmit(e) {
      e.preventDefault();
  
      if (!this.validateForm()) {
        this.showToast('Error en el formulario', 'Por favor corrige los errores marcados', 'error');
        return;
      }
  
      this.setLoading(true);
  
      // ⚠️ CORRECCIÓN: Solo enviar los datos necesarios (sin 'confirmar')
      const formData = {
        nombre: this.fields.nombre.value.trim(),
        email: this.fields.email.value.trim(),
        password: this.fields.password.value
      };
  
      console.log('📤 Enviando datos:', formData);
  
      try {
        // ⚠️ CORRECCIÓN: URL exacta que coincide con el backend
        const response = await fetch(`${this.url}/registro/registro-usuario`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(formData)
        });
  
        console.log('📥 Respuesta del servidor:', response.status);
        
        // ⚠️ MEJORA: Manejo robusto de respuestas
        let result;
        try {
          result = await response.json();
        } catch (parseError) {
          console.error('Error al parsear JSON:', parseError);
          throw new Error('Respuesta del servidor inválida');
        }
  
        console.log('📊 Datos de respuesta:', result);
  
        if (response.ok && result.success) {
          this.showToast('¡Cuenta creada!', `Usuario creado exitosamente: ${formData.nombre}`, 'success');
          
          // Limpiar formulario
          this.form.reset();
          this.clearAllErrors();
          
          // Reset password strength indicator
          const strengthFill = document.getElementById('strength-fill');
          const strengthText = document.getElementById('strength-text');
          if (strengthFill && strengthText) {
            strengthFill.className = 'strength-fill';
            strengthText.textContent = 'Ingresa una contraseña';
            strengthText.style.color = 'var(--text-secondary)';
          }
          
          // Redireccionar después de un tiempo
          setTimeout(() => {
            window.location.href = '../html/login.html';
          }, 2000);
        } else {
          // Mostrar mensaje de error del servidor
          this.showToast('Error de registro', result.message || 'Error al crear la cuenta', 'error');
        }
      } catch (error) {
        console.error('❌ Error al registrar:', error);
        this.showToast('Error de conexión', 'No se pudo conectar con el servidor. Intenta más tarde.', 'error');
      } finally {
        this.setLoading(false);
      }
    }
  
    clearAllErrors() {
      Object.keys(this.fields).forEach(fieldName => {
        this.clearError(fieldName);
      });
    }
  
    setLoading(loading) {
      this.submitBtn.classList.toggle('loading', loading);
      this.submitBtn.disabled = loading;
      
      const btnText = this.submitBtn.querySelector('.btn-text');
      const spinner = this.submitBtn.querySelector('.loading-spinner');
      
      if (loading) {
        if (btnText) btnText.textContent = 'Creando cuenta...';
        if (spinner) spinner.style.display = 'inline-block';
      } else {
        if (btnText) btnText.textContent = 'Crear Cuenta';
        if (spinner) spinner.style.display = 'none';
      }
    }
  
    showToast(title, message, type = 'success') {
      const toast = document.getElementById('toast');
      if (!toast) {
        console.warn('Elemento toast no encontrado');
        alert(`${title}: ${message}`); // Fallback
        return;
      }
      
      const icon = toast.querySelector('.toast-icon');
      const titleEl = toast.querySelector('.toast-title');
      const messageEl = toast.querySelector('.toast-message');
      
      if (icon) icon.textContent = type === 'success' ? '✅' : '❌';
      if (titleEl) titleEl.textContent = title;
      if (messageEl) messageEl.textContent = message;
      
      toast.classList.remove('error');
      if (type === 'error') {
        toast.classList.add('error');
      }
  
      toast.classList.add('show');
      
      setTimeout(() => {
        toast.classList.remove('show');
      }, 5000);
    }
  }
  
  // Initialize form when DOM is loaded
  document.addEventListener('DOMContentLoaded', () => {
    new RegisterForm();
  });