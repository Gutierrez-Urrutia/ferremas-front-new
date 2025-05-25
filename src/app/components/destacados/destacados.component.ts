import { Component } from '@angular/core';
import { CardComponent } from "../card/card.component";
import { Producto } from '../../interfaces/producto';
import { ProductoService } from '../../services/producto.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-destacados',
  imports: [CardComponent, CommonModule],
  templateUrl: './destacados.component.html',
  styleUrl: './destacados.component.css'
})
export class DestacadosComponent {
  productosDestacados: Producto[] = [];
  productosAgrupados: Producto[][] = [];
  itemsPorSlide = 4;

  constructor(private productoService: ProductoService) { }

  ngOnInit(): void {
    this.productoService.getProductosDestacados().subscribe(productos => {
      this.productosDestacados = productos;
      this.agruparProductos();
    });
  }

  /**
   * Agrupa los productos en arrays de 4 elementos para cada slide del carrusel
   */
  agruparProductos(): void {
    this.productosAgrupados = [];
    for (let i = 0; i < this.productosDestacados.length; i += this.itemsPorSlide) {
      this.productosAgrupados.push(
        this.productosDestacados.slice(i, i + this.itemsPorSlide)
      );
    }
    
    // Si el último grupo tiene menos de 4 productos, completar el grupo con null
    const ultimoGrupo = this.productosAgrupados[this.productosAgrupados.length - 1];
    if (ultimoGrupo && ultimoGrupo.length < this.itemsPorSlide) {
      const faltantes = this.itemsPorSlide - ultimoGrupo.length;
      for (let i = 0; i < faltantes; i++) {
        // Para evitar errores, completamos con objetos vacíos que no mostrarán nada
        ultimoGrupo.push({
          id: 0,
          nombre: '',
          precio: 0,
          descripcion: '',
          destacado: false,
          imagen: '',
          oculto: true
        });
      }
    }
  }
}
