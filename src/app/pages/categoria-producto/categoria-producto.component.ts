import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { CategoriaService } from '../../services/categoria.service';
import { ActivatedRoute } from '@angular/router';
import { ProductoService } from '../../services/producto.service';
import { CardComponent } from '../../components/card/card.component';
import { ModalCompraComponent } from '../../components/modal-compra/modal-compra.component';
import { Producto } from '../../interfaces/producto';

@Component({
  selector: 'app-categoria-producto',
  imports: [CommonModule, CardComponent, ModalCompraComponent],
  templateUrl: './categoria-producto.component.html',
  styleUrl: './categoria-producto.component.css'
})
export class CategoriaProductoComponent implements OnInit {
  categoriaId!: number;
  categoriaNombre: string = '';
  productos: Producto[] = [];

  constructor(
    private productoService: ProductoService,
    private categoriaService: CategoriaService,
    private route: ActivatedRoute) { }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.categoriaId = +params['id'];
      this.cargarCategoria();
      this.cargarProductosPorCategoria();
    });
  }

  cargarCategoria(): void {
    this.categoriaService.getCategoriaPorId(this.categoriaId).subscribe(categoria => {
      if (categoria) {
        this.categoriaNombre = categoria.nombre;
      } else {
        console.error('Categoría no encontrada');
      }
    });
  }

  cargarProductosPorCategoria(): void {
    this.productoService.getProductosPorCategoria(this.categoriaId).subscribe(productos => {
      this.productos = productos;
    }, error => {
      console.error('Error al cargar productos por categoría:', error);
    });
  }
}
