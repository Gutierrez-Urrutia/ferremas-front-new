import { Injectable } from '@angular/core';
import { BehaviorSubject, catchError, map, Observable, of } from "rxjs";
import { ProductoResponse } from "../interfaces/producto-response";
import { ProductoApiService } from "./producto-api.service";

@Injectable({
  providedIn: 'root'
})
export class ProductoService {
  private productosSource = new BehaviorSubject<ProductoResponse[]>([]);
  productos$ = this.productosSource.asObservable();

  constructor(private productoApiService: ProductoApiService) {
    this.cargarProductosIniciales();
  }

  private cargarProductosIniciales() {
    console.log('🔄 Cargando productos desde backend...');

    this.productoApiService.getProductos().pipe(
      map((productosBackend: any) => {
        console.log('📦 Productos recibidos del backend:', productosBackend);
        return productosBackend as ProductoResponse[];
      }),
      catchError((error: any): Observable<ProductoResponse[]> => {
        console.error('❌ Error cargando productos desde backend:', error);
        console.warn('⚠️ Usando productos por defecto');
        return of([]);
      })
    ).subscribe((productos: ProductoResponse[]) => {
      console.log('✅ Productos cargados:', productos);
      this.productosSource.next(productos);
    });
  }

  getProductos(): Observable<ProductoResponse[]> {
    return this.productos$;
  }

  getProductosDestacados(): Observable<ProductoResponse[]> {
    return this.productos$.pipe(
      map(productos => productos.filter(p => p.destacado && !p.oculto))
    );
  }
  
  getProductosConDescuento(): Observable<ProductoResponse[]> {
    return this.productos$.pipe(
      map(productos => productos.filter(p => p.descuento && !p.oculto))
    );
  }
  
  getProductoPorId(id: number): Observable<ProductoResponse | undefined> {
    return this.productos$.pipe(
      map(productos => productos.find(p => p.id === id))
    );
  }

  getProductosPorCategoria(categoriaId: number): Observable<ProductoResponse[]> {
    return this.productos$.pipe(
      map((productos: ProductoResponse[]) => productos.filter(p => p.categoriaId === categoriaId && !p.oculto))
    );
  }

  getProductosPorMarca(marcaId: number): Observable<ProductoResponse[]> {
    return this.productos$.pipe(
      map((productos: ProductoResponse[]) => productos.filter(p => p.marcaId === marcaId && !p.oculto))
    );
  }

  getMarcasDisponibles(): Observable<string[]> {
    return this.productos$.pipe(
      map((productos: ProductoResponse[]) => {
        const marcas = productos
          .filter(p => p.marca && !p.oculto)
          .map(p => p.marca)
          .filter((marca, index, array) => array.indexOf(marca) === index)
          .sort();
        return marcas;
      })
    );
  }

  buscarProductos(termino: string): Observable<ProductoResponse[]> {
    return this.productos$.pipe(
      map(productos => 
        productos.filter(producto =>
          (producto.nombre.toLowerCase().includes(termino.toLowerCase()) ||
           producto.descripcion.toLowerCase().includes(termino.toLowerCase()) ||
           producto.marca.toLowerCase().includes(termino.toLowerCase())) &&
          !producto.oculto
        )
      )
    );
  }
}