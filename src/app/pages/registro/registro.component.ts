import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-registro',
  imports: [CommonModule, FormsModule],
  templateUrl: './registro.component.html',
  styleUrl: './registro.component.css'
})
export class RegistroComponent {
  registro = {
    nombre: '',
    email: '',
    password: ''
  };
  private authService = inject(AuthService);
  private router = inject(Router);
  constructor() { }
  onRegister() {
    this.authService.register(
      this.registro.nombre,
      this.registro.email,
      this.registro.password
    ).subscribe({
      next: () => {
        alert('Registro exitoso, ahora puedes iniciar sesión');
        this.router.navigate(['/login']);
      },
      error: (err) => {
        console.error('Error en el registro:', err);
        alert('Hubo un error al registrar. Inténtalo nuevamente.');
      }
    });
  }
}