import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductoService } from '../../services/producto.service';
import { CardComponent } from '../card/card.component';
import { ModalCompraComponent } from '../modal-compra/modal-compra.component';
import { Producto } from '../../interfaces/producto';

@Component({
  selector: 'app-destacados',
  imports: [CommonModule, CardComponent, ModalCompraComponent],
  templateUrl: './destacados.component.html',
  styleUrls: ['./destacados.component.css']
})
export class DestacadosComponent implements OnInit {
  productos: Producto[] = [];
  productosFiltrados: Producto[] = [];
  productosAgrupados: Producto[][] = [];
  productosAMostrar: number = 4; // Cantidad de productos a mostrar por grupo
  sinResultados = false;

  constructor(private productoService: ProductoService) { }

  ngOnInit(): void {
    this.calcularProductosAMostrar();
    this.cargarProductosDestacados();
  }

  // Escucha el evento de cambio de tamaño de ventana para ajustar la cantidad de productos a mostrar
  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.calcularProductosAMostrar();
    this.agruparProductos();
  }

  calcularProductosAMostrar(): void {
    const width = window.innerWidth;
    
    if (width < 576) {
      this.productosAMostrar = 1;
    } else if (width < 768) {
      this.productosAMostrar = 2; 
    } else if (width < 1200) {
      this.productosAMostrar = 3; 
    } else {
      this.productosAMostrar = 4;
    }
  }

  // Obtiene todos los productos desde el servicio y los agrupa según el tamaño de pantalla
  cargarProductosDestacados(): void {
    this.productoService.getProductosDestacados().subscribe(productos => {
      this.productos = productos;
      this.productosFiltrados = [...this.productos];
      this.sinResultados = this.productosFiltrados.length === 0;
      this.agruparProductos();
    });
  }

  agruparProductos(): void {
    this.productosAgrupados = [];
    for (let i = 0; i < this.productosFiltrados.length; i += this.productosAMostrar) {
      this.productosAgrupados.push(this.productosFiltrados.slice(i, i + this.productosAMostrar));
    }
  }
}