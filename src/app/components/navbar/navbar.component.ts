import { Component, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CategoriaService } from '../../services/categoria.service';
import { CarritoService } from '../../services/carrito.service';
import { Categoria } from '../../interfaces/categoria';
import { DivisaRate } from '../../interfaces/divisa-rate';
import { DivisaService } from '../../services/divisa.service';
import { Marca } from '../../interfaces/marca';
import { MarcaService } from '../../services/marca.service';
import { AuthService } from '../../services/auth.service'; // Agregar import

@Component({
  selector: 'app-navbar',
  imports: [CommonModule, RouterModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent implements OnInit, AfterViewInit {
  categorias: Categoria[] = [];
  marcas: Marca[] = [];
  cantidadCarrito: number = 0;
  selectedDivisa: string = 'CLP';
  availableDivisas: DivisaRate[] = [];

  constructor(
    private categoriaService: CategoriaService,
    private carritoService: CarritoService,
    private divisaService: DivisaService,
    private marcaService: MarcaService,
    public authService: AuthService // Agregar AuthService como público
  ) {
    // Suscribe a los cambios de divisa seleccionada para actualizar el valor local
    this.divisaService.selectedDivisa$.subscribe(divisa => {
      this.selectedDivisa = divisa;
    });

    // Suscribe a los cambios en las tasas de divisas disponibles
    this.divisaService.rates$.subscribe(rates => {
      this.availableDivisas = rates;
      // Reinicializar dropdowns cuando cambien las divisas
      setTimeout(() => this.initializeDropdowns(), 50);
    });
  }

  ngOnInit(): void {
    // Carga las categorías al inicializar el componente
    this.categoriaService.getCategorias().subscribe(categorias => {
      this.categorias = categorias;
      setTimeout(() => this.initializeDropdowns(), 50);
    });

    // Actualiza la cantidad de productos en el carrito cuando hay cambios
    this.carritoService.itemsCarrito$.subscribe(items => {
      this.cantidadCarrito = this.carritoService.obtenerCantidadTotal();
    });

    // Carga las marcas disponibles al inicializar el componente
    this.marcaService.getMarcas().subscribe(marcas => {
      this.marcas = marcas;
      console.log('Marcas cargadas:', this.marcas);
      setTimeout(() => this.initializeDropdowns(), 50);
    });
  }

  ngAfterViewInit(): void {
    // Inicializar dropdowns después de que la vista esté completamente renderizada
    setTimeout(() => {
      this.initializeDropdowns();
    }, 100);
  }

  private initializeDropdowns(): void {
    if (typeof (window as any).bootstrap !== 'undefined') {
      const dropdownElements = document.querySelectorAll('[data-bs-toggle="dropdown"]');

      dropdownElements.forEach(element => {
        const existingInstance = (window as any).bootstrap.Dropdown.getInstance(element);
        if (!existingInstance) {
          new (window as any).bootstrap.Dropdown(element);
        }
      });

      console.log(`✅ Inicializados ${dropdownElements.length} dropdowns de Bootstrap`);
    }
  }

  onDivisaChange(divisa: string): void {
    this.divisaService.setSelectedDivisa(divisa);
    this.closeAllDropdowns();
  }

  private closeAllDropdowns(): void {
    if (typeof (window as any).bootstrap !== 'undefined') {
      document.querySelectorAll('[data-bs-toggle="dropdown"]').forEach(element => {
        const dropdown = (window as any).bootstrap.Dropdown.getInstance(element);
        if (dropdown) {
          dropdown.hide();
        }
      });
    }
  }

  // Método para obtener el nombre del usuario
  getUserName(): string {
    try {
      const user = this.authService.getCurrentUser();
      
      if (!user) return 'Usuario';
      
      // Retornar el nombre del usuario o email como fallback
      return user.nombre || user.email || 'Usuario';
    } catch (error) {
      console.error('Error obteniendo nombre de usuario:', error);
      return 'Usuario';
    }
  }

  // Método para obtener el rol del usuario
  getUserRole(): string {
    try {
      return this.authService.getUserRole() || '';
    } catch (error) {
      console.error('Error obteniendo rol de usuario:', error);
      return '';
    }
  }

  // Método para cerrar sesión
  logout(): void {
    this.authService.logout();
    this.closeAllDropdowns();
  }
}