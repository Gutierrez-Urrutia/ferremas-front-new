import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { ProductoApiService } from '../../services/producto-api.service';
import { Producto } from '../../interfaces/producto';
import { CardComponent } from '../../components/card/card.component';

@Component({
  selector: 'app-producto',
  imports: [CommonModule, CardComponent],
  templateUrl: './producto.component.html',
  styleUrls: ['./producto.component.css']
})
export class ProductoComponent implements OnInit {
  producto: Producto | null = null;
  loading = true;
  error: string | null = null;

  constructor(private route: ActivatedRoute, private productoApi: ProductoApiService) { }

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    const id = idParam ? Number(idParam) : null;
    if (!id) {
      this.error = 'ID de producto inválido';
      this.loading = false;
      return;
    }

    this.productoApi.getProductoById(id).subscribe({
      next: p => {
        this.producto = p;
        this.loading = false;
      },
      error: () => {
        this.error = 'Error al cargar el producto';
        this.loading = false;
      }
    });
  }
}
