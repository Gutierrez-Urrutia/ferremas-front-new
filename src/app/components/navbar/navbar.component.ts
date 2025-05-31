import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CategoriaService } from '../../services/categoria.service';
import { CarritoService } from '../../services/carrito.service';
import { Categoria } from '../../interfaces/categoria';
import { DivisaRate } from '../../interfaces/divisa-rate';
import { DivisaService } from '../../services/divisa.service';
import { Marca } from '../../interfaces/marca';
import { MarcaService } from '../../services/marca.service';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-navbar',
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent implements OnInit {
  categorias: Categoria[] = [];
  marcas: Marca[] = [];
  cantidadCarrito: number = 0;
  selectedDivisa: string = 'CLP';
  availableDivisas: DivisaRate[] = [];

  login = {
    email: '',
    password: ''
  };

  onLogin() {
    // Llamar al servicio de autenticación
    console.log('Login con', this.login);
  }

  constructor(
    private categoriaService: CategoriaService,
    private carritoService: CarritoService,
    private divisaService: DivisaService,
    private marcaService: MarcaService,
    public authService: AuthService
  ) {
    this.divisaService.selectedDivisa$.subscribe(divisa => {
      this.selectedDivisa = divisa;
    });

    this.divisaService.rates$.subscribe(rates => {
      this.availableDivisas = rates;
    });
  }

  onDivisaChange(divisa: string): void {
    this.divisaService.setSelectedDivisa(divisa);
  }

  ngOnInit(): void {
    this.categoriaService.getCategorias().subscribe(categorias => {
      this.categorias = categorias;
    });

    // Suscribirse a cambios en el carrito
    this.carritoService.itemsCarrito$.subscribe(items => {
      this.cantidadCarrito = this.carritoService.obtenerCantidadTotal();
    });

    this.marcaService.getMarcas().subscribe(marcas => {
      this.marcas = marcas;
      console.log('Marcas cargadas:', this.marcas);
    });
  }
  logout(): void {
    this.authService.logout();
  }
}