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

  // Modal para editar usuario
  showEditModal: boolean = false;
  editingUser: Usuario | null = null;
  editUserData = {
    nombre: '',
    email: '',
    rol: 'CLIENTE'
  };

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
        next: (response) => {
          console.log('Usuario eliminado exitosamente:', response);
          alert('Usuario eliminado exitosamente');
          // Recargar la tabla automáticamente desde el servidor
          this.loadUsers();
        },
        error: (err) => {
          console.error('Error eliminando usuario:', err);
          
          // Si el status es 200, tratarlo como éxito (problema común con algunos backends)
          if (err.status === 200) {
            console.log('Eliminación exitosa (status 200 reportado como error)');
            alert('Usuario eliminado exitosamente');
            // Recargar la tabla automáticamente desde el servidor
            this.loadUsers();
            return;
          }
          
          // Manejar otros errores reales
          if (err.status === 0) {
            alert('Error de conexión. Verifica que el servidor esté funcionando.');
          } else if (err.status === 403) {
            alert('No tienes permisos para eliminar usuarios.');
          } else if (err.status === 404) {
            alert('Usuario no encontrado.');
            // Aún así recargar para sincronizar con el servidor
            this.loadUsers();
          } else {
            alert(`Error al eliminar el usuario. Código: ${err.status || 'Desconocido'}`);
          }
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

  // Editar usuario
  editUser(usuario: Usuario): void {
    this.editingUser = usuario;
    this.editUserData = {
      nombre: usuario.nombre,
      email: usuario.email,
      rol: usuario.rol
    };
    this.showEditModal = true;
  }

  // Cerrar modal de edición
  closeEditModal(): void {
    this.showEditModal = false;
    this.editingUser = null;
    this.resetEditForm();
  }

  // Resetear formulario de edición
  resetEditForm(): void {
    this.editUserData = {
      nombre: '',
      email: '',
      rol: 'CLIENTE'
    };
    this.modalLoading = false;
  }

  // Actualizar usuario
  updateUser(): void {
    if (!this.editingUser) return;

    // Validaciones básicas
    if (!this.editUserData.nombre.trim()) {
      alert('El nombre es requerido');
      return;
    }
    if (!this.editUserData.email.trim()) {
      alert('El email es requerido');
      return;
    }

    this.modalLoading = true;

    this.usuarioService.updateUser(this.editingUser.id, this.editUserData).subscribe({
      next: (usuario) => {
        // Actualizar el usuario en la lista
        const index = this.usuarios.findIndex(u => u.id === this.editingUser!.id);
        if (index !== -1) {
          this.usuarios[index] = usuario;
        }
        alert('Usuario actualizado exitosamente');
        this.closeEditModal();
      },
      error: (err) => {
        console.error('Error actualizando usuario:', err);
        this.modalLoading = false;
        
        // Manejar errores específicos
        if (err.status === 409) {
          alert('El email ya está registrado por otro usuario');
        } else if (err.status === 400) {
          alert('Datos inválidos. Verifica la información ingresada');
        } else if (err.status === 404) {
          alert('Usuario no encontrado');
          this.loadUsers(); // Recargar lista
        } else {
          alert('Error al actualizar el usuario. Intenta nuevamente');
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
