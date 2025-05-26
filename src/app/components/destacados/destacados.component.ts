import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductoService } from '../../services/producto.service';
import { Producto } from '../../interfaces/producto';
import { CardComponent } from '../card/card.component';
import { ModalCompraComponent } from '../modal-compra/modal-compra.component';

@Component({
  selector: 'app-destacados',
  imports: [CommonModule, CardComponent, ModalCompraComponent],
  templateUrl: './destacados.component.html',
  styleUrl: './destacados.component.css'
})
export class DestacadosComponent implements OnInit {
  productos: Producto[] = [];
  productosAgrupados: Producto[][] = [];
  productosAMostrar: number = 4; // Por defecto para desktop

  constructor(private productoService: ProductoService) { }

  ngOnInit(): void {
    this.calcularProductosAMostrar();
    this.cargarProductosDestacados();
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.calcularProductosAMostrar();
    this.agruparProductos();
  }

  calcularProductosAMostrar(): void {
    const width = window.innerWidth;
    
    if (width < 576) {
      this.productosAMostrar = 1; // Mobile
    } else if (width < 768) {
      this.productosAMostrar = 2; // Tablet pequeño
    } else if (width < 1200) {
      this.productosAMostrar = 3; // Tablet/Desktop pequeño
    } else {
      this.productosAMostrar = 4; // Desktop grande
    }
  }

  cargarProductosDestacados(): void {
    this.productoService.getProductosDestacados().subscribe(productos => {
      this.productos = productos;
      this.agruparProductos();
    });
  }

  agruparProductos(): void {
    this.productosAgrupados = [];
    for (let i = 0; i < this.productos.length; i += this.productosAMostrar) {
      this.productosAgrupados.push(this.productos.slice(i, i + this.productosAMostrar));
    }
  }
}