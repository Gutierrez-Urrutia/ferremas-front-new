import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UsuarioService } from '../../services/usuario.service';
import { Usuario } from '../../interfaces/usuario';

@Component({
  selector: 'app-admin',
  imports: [CommonModule, FormsModule],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.css'
})
export class AdminComponent implements OnInit {
  usuarios: Usuario[] = [];
  loading: boolean = false;
  error: string = '';
  
  // Filtros y búsqueda
  searchTerm: string = '';
  selectedRole: string = '';
  
  // Roles disponibles
  roles: string[] = ['CLIENTE', 'VENDEDOR', 'BODEGUERO', 'AUDITOR', 'ADMIN'];

  // Modal para agregar usuario
  showAddModal: boolean = false;
  newUser = {
    nombre: '',
    email: '',
    password: '',
    rol: 'CLIENTE'
  };
  modalLoading: boolean = false;

  constructor(private usuarioService: UsuarioService) { }

  ngOnInit(): void {
    this.loadUsers();
  }

  // Cargar todos los usuarios
  loadUsers(): void {
    this.loading = true;
    this.error = '';
    
    this.usuarioService.getAllUsers().subscribe({
      next: (usuarios) => {
        this.usuarios = usuarios;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error cargando usuarios:', err);
        this.error = 'Error al cargar los usuarios. Verifica tu conexión y permisos.';
        this.loading = false;
      }
    });
  }

  // Filtrar usuarios según búsqueda y rol
  get filteredUsers(): Usuario[] {
    let filtered = this.usuarios;

    // Filtrar por término de búsqueda
    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase().trim();
      filtered = filtered.filter(usuario => 
        usuario.nombre.toLowerCase().includes(term) ||
        usuario.email.toLowerCase().includes(term)
      );
    }

    // Filtrar por rol
    if (this.selectedRole) {
      filtered = filtered.filter(usuario => usuario.rol === this.selectedRole);
    }

    return filtered;
  }

  // Cambiar rol de usuario
  changeRole(usuario: Usuario, newRole: string): void {
    if (confirm(`¿Estás seguro de cambiar el rol de ${usuario.nombre} a ${newRole}?`)) {
      this.usuarioService.changeUserRole(usuario.id, newRole).subscribe({
        next: (updatedUser) => {
          // Actualizar el usuario en la lista local
          const index = this.usuarios.findIndex(u => u.id === usuario.id);
          if (index !== -1) {
            this.usuarios[index] = updatedUser;
          }
          alert('Rol actualizado exitosamente');
        },
        error: (err) => {
          console.error('Error cambiando rol:', err);
          alert('Error al cambiar el rol del usuario');
        }
      });
    }
  }

  // Eliminar usuario
  deleteUser(usuario: Usuario): void {
    if (confirm(`¿Estás seguro de eliminar al usuario ${usuario.nombre}? Esta acción no se puede deshacer.`)) {
      this.usuarioService.deleteUser(usuario.id).subscribe({
        next: () => {
          // Remover usuario de la lista local
          this.usuarios = this.usuarios.filter(u => u.id !== usuario.id);
          alert('Usuario eliminado exitosamente');
        },
        error: (err) => {
          console.error('Error eliminando usuario:', err);
          alert('Error al eliminar el usuario');
        }
      });
    }
  }

  // Limpiar filtros
  clearFilters(): void {
    this.searchTerm = '';
    this.selectedRole = '';
  }

  // Recargar datos
  refresh(): void {
    this.loadUsers();
  }

  // Agregar nuevo usuario
  addUser(): void {
    this.showAddModal = true;
  }

  // Cerrar modal
  closeModal(): void {
    this.showAddModal = false;
    this.resetForm();
  }

  // Resetear formulario
  resetForm(): void {
    this.newUser = {
      nombre: '',
      email: '',
      password: '',
      rol: 'CLIENTE'
    };
    this.modalLoading = false;
  }

  // Crear usuario
  createUser(): void {
    // Validaciones básicas
    if (!this.newUser.nombre.trim()) {
      alert('El nombre es requerido');
      return;
    }
    if (!this.newUser.email.trim()) {
      alert('El email es requerido');
      return;
    }
    if (!this.newUser.password.trim()) {
      alert('La contraseña es requerida');
      return;
    }
    if (this.newUser.password.length < 6) {
      alert('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    this.modalLoading = true;

    this.usuarioService.createUser(this.newUser).subscribe({
      next: (usuario) => {
        // Agregar el nuevo usuario a la lista
        this.usuarios.push(usuario);
        alert('Usuario creado exitosamente');
        this.closeModal();
      },
      error: (err) => {
        console.error('Error creando usuario:', err);
        this.modalLoading = false;
        
        // Manejar errores específicos
        if (err.status === 409) {
          alert('El email ya está registrado en el sistema');
        } else if (err.status === 400) {
          alert('Datos inválidos. Verifica la información ingresada');
        } else {
          alert('Error al crear el usuario. Intenta nuevamente');
        }
      }
    });
  }

  // TrackBy function para mejorar rendimiento de la tabla
  trackByUserId(index: number, usuario: Usuario): number {
    return usuario.id;
  }

  // Manejar cambio de rol con tipado correcto
  onRoleChange(usuario: Usuario, event: Event): void {
    const target = event.target as HTMLSelectElement;
    if (target && target.value !== usuario.rol) {
      this.changeRole(usuario, target.value);
    }
  }
}
