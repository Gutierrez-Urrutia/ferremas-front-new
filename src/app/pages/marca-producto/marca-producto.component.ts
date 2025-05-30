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

    constructor(
        private productoService: ProductoService,
        private marcaService: MarcaService,
        private route: ActivatedRoute
    ) { }

    ngOnInit(): void {
        this.route.params.subscribe(params => {
            this.marcaId = +params['id'];
            this.cargarMarca();
            this.cargarProductosPorMarca();
        });
    }

    cargarMarca(): void {
        this.marcaService.getMarcaPorId(this.marcaId).subscribe(marca => {
            if (marca) {
                this.marcaNombre = marca.nombre;
            } else {
                console.error('Marca no encontrada');
            }
        });
    }

    cargarProductosPorMarca(): void {
        this.productoService.getProductosPorMarca(this.marcaId).subscribe(productos => {
            this.productos = productos;
            this.totalItems = productos.length;
        }, error => {
            console.error('Error al cargar productos por marca:', error);
        });
    }

    onPageChanged(page: number): void {
        this.currentPage = page;
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}