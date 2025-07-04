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

  constructor(private authService: AuthService, private router: Router) { }

  onLogin() {
    this.authService.login(this.login.email, this.login.password).subscribe({
      next: () => {
        // La redirección se maneja automáticamente en el AuthService según el rol
        console.log('Login exitoso, redirigiendo según rol...');
      },
      error: (err) => {
        console.error('Error en el login:', err);
        alert('Credenciales incorrectas o error de conexión.');
      }
    });
  }
}