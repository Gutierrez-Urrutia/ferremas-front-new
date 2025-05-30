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

@Component({
  selector: 'app-navbar',
  imports: [CommonModule, RouterModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent implements OnInit {
  categorias: Categoria[] = [];
  marcas: Marca[] = [];
  cantidadCarrito: number = 0;
  selectedDivisa: string = 'CLP';
  availableDivisas: DivisaRate[] = [];

  constructor(
    private categoriaService: CategoriaService,
    private carritoService: CarritoService,
    private divisaService: DivisaService,
    private marcaService: MarcaService
  ) {
    // Suscribe a los cambios de divisa seleccionada para actualizar el valor local
    this.divisaService.selectedDivisa$.subscribe(divisa => {
      this.selectedDivisa = divisa;
    });

    // Suscribe a los cambios en las tasas de divisas disponibles
    this.divisaService.rates$.subscribe(rates => {
      this.availableDivisas = rates;
    });
  }

  onDivisaChange(divisa: string): void {
    this.divisaService.setSelectedDivisa(divisa);
  }

  ngOnInit(): void {
    // Carga las categorías al inicializar el componente
    this.categoriaService.getCategorias().subscribe(categorias => {
      this.categorias = categorias;
    });
    
    // Actualiza la cantidad de productos en el carrito cuando hay cambios
    this.carritoService.itemsCarrito$.subscribe(items => {
      this.cantidadCarrito = this.carritoService.obtenerCantidadTotal();
    });

    // Carga las marcas disponibles al inicializar el componente
    this.marcaService.getMarcas().subscribe(marcas => {
      this.marcas = marcas;
      console.log('Marcas cargadas:', this.marcas);
    });
  }
}