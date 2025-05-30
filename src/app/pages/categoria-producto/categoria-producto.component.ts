import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { CategoriaService } from '../../services/categoria.service';
import { ActivatedRoute } from '@angular/router';
import { ProductoService } from '../../services/producto.service';
import { CardComponent } from '../../components/card/card.component';
import { ModalCompraComponent } from '../../components/modal-compra/modal-compra.component';
import { Producto } from '../../interfaces/producto';
import { PaginacionComponent } from '../../components/paginacion/paginacion.component';
import { PaginacionPipe } from '../../pipes/paginacion.pipe';

@Component({
  selector: 'app-categoria-producto',
  imports: [CommonModule, CardComponent, ModalCompraComponent, PaginacionComponent, PaginacionPipe],
  templateUrl: './categoria-producto.component.html',
  styleUrl: './categoria-producto.component.css'
})
export class CategoriaProductoComponent implements OnInit {
  categoriaId!: number;
  categoriaNombre: string = '';
  productos: Producto[] = [];
  currentPage = 1;
  itemsPerPage = 8;
  totalItems = 0;
  loading = true;
  error = '';

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
    this.loading = true;
    this.error = '';
    
    this.productoService.getProductosPorCategoria(this.categoriaId).subscribe({
      next: (productos) => {
        this.productos = productos.filter(p => !p.oculto);
        this.totalItems = this.productos.length;
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Error al cargar los productos de la categoría';
        this.loading = false;
        console.error('Error:', error);
      }
    });
  }

  onPageChanged(page: number): void {
    this.currentPage = page;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
