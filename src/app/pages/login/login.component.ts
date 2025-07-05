import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  login = {
    email: '',
    password: ''
  };
  
  errorMessage: string = '';
  isLoading: boolean = false;

  constructor(private authService: AuthService, private router: Router) { }

  onLogin() {
    // Limpiar mensaje de error y activar loading
    this.errorMessage = '';
    this.isLoading = true;
    
    this.authService.login(this.login.email, this.login.password).subscribe({
      next: () => {
        // La redirección se maneja automáticamente en el AuthService según el rol
        console.log('Login exitoso, redirigiendo según rol...');
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error en el login:', err);
        this.isLoading = false;
        
        // Mostrar mensaje de error específico según el tipo de error
        if (err.status === 401) {
          this.errorMessage = 'Credenciales incorrectas. Por favor, verifica tu email y contraseña.';
        } else if (err.status === 0) {
          this.errorMessage = 'Error de conexión. Por favor, verifica tu conexión a internet.';
        } else if (err.status >= 500) {
          this.errorMessage = 'Error del servidor. Por favor, intenta más tarde.';
        } else {
          this.errorMessage = 'Error al iniciar sesión. Por favor, intenta nuevamente.';
        }
      }
    });
  }

  // Limpiar mensaje de error cuando el usuario empiece a escribir
  clearError() {
    if (this.errorMessage) {
      this.errorMessage = '';
    }
  }
}