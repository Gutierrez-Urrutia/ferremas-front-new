import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ProductoService } from '../../services/producto.service';
import { CardComponent } from '../../components/card/card.component';
import { ModalCompraComponent } from '../../components/modal-compra/modal-compra.component';
import { MarcaService } from '../../services/marca.service';
import { Producto } from '../../interfaces/producto';
import { PaginacionComponent } from '../../components/paginacion/paginacion.component';
import { PaginacionPipe } from '../../pipes/paginacion.pipe';

@Component({
    selector: 'app-marca-producto',
    imports: [CommonModule, CardComponent, ModalCompraComponent, PaginacionComponent, PaginacionPipe],
    templateUrl: './marca-producto.component.html',
    styleUrls: ['./marca-producto.component.css']
})
export class MarcaProductoComponent implements OnInit {
    marcaId!: number;
    marcaNombre: string = '';
    productos: Producto[] = [];
    currentPage = 1;
    itemsPerPage = 8;
    totalItems = 0;
    loading = true;
    error = '';

    constructor(
        private productoService: ProductoService,
        private marcaService: MarcaService,
        private route: ActivatedRoute
    ) { }

    ngOnInit(): void {
        this.route.params.subscribe(params => {
            this.currentPage = 1
            this.marcaId = +params['id'];
            this.cargarMarca();
            this.cargarProductosPorMarca();
        });
    }

    cargarMarca(): void {
        this.marcaService.getMarcaPorId(this.marcaId).subscribe({
            next: (marca) => {
                if (marca) {
                    this.marcaNombre = marca.nombre;
                } else {
                    this.error = 'Marca no encontrada';
                }
            },
            error: (error) => {
                console.error('Error al cargar marca:', error);
                this.marcaNombre = 'Marca desconocida';
            }
        });
    }

    cargarProductosPorMarca(): void {
        this.loading = true;
        this.error = '';
        
        this.productoService.getProductosPorMarca(this.marcaId).subscribe({
            next: (productos) => {
                this.productos = productos.filter(p => !p.oculto);
                this.totalItems = this.productos.length;
                this.loading = false;
            },
            error: (error) => {
                this.error = 'Error al cargar los productos de la marca';
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