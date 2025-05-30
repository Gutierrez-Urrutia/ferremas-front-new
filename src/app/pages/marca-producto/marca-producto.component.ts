import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ProductoService } from '../../services/producto.service';
import { CardComponent } from '../../components/card/card.component';
import { ModalCompraComponent } from '../../components/modal-compra/modal-compra.component';
import { Marca } from '../../interfaces/marca';
import { MarcaService } from '../../services/marca.service';
import { ProductoResponse } from '../../interfaces/producto-response';

@Component({
    selector: 'app-marca-producto',
    imports: [CommonModule, CardComponent, ModalCompraComponent],
    templateUrl: './marca-producto.component.html',
    styleUrls: ['./marca-producto.component.css']
})
export class MarcaProductoComponent implements OnInit {
    marcaId!: number;
    marcaNombre: string = '';
    productos: ProductoResponse[] = [];

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
        }, error => {
            console.error('Error al cargar productos por marca:', error);
        });
    }
}