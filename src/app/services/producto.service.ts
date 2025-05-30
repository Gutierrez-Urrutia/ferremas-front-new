import { Injectable } from '@angular/core';
import { BehaviorSubject, catchError, map, Observable, of } from "rxjs";
import { Producto } from "../interfaces/producto";
import { ProductoApiService } from "./producto-api.service";

@Injectable({
  providedIn: 'root'
})
export class ProductoService {
  private productosSource = new BehaviorSubject<Producto[]>([]);
  productos$ = this.productosSource.asObservable();

  constructor(private productoApiService: ProductoApiService) {
    this.cargarProductosIniciales();
  }

  private cargarProductosIniciales() {
    console.log('Cargando productos desde backend...');

    this.productoApiService.getProductos().pipe(
      map((productosBackend: any) => {
        console.log('Productos recibidos del backend:', productosBackend);
        return productosBackend as Producto[];
      }),
      catchError((error: any): Observable<Producto[]> => {
        console.error('Error cargando productos desde backend:', error);
        console.warn('Usando productos por defecto');
        return of([]);
      })
    ).subscribe((productos: Producto[]) => {
      console.log('Productos cargados:', productos);
      this.productosSource.next(productos);
    });
  }

  getProductos(): Observable<Producto[]> {
    return this.productos$;
  }

  getProductosDestacados(): Observable<Producto[]> {
    return this.productos$.pipe(
      map(productos => productos.filter(p => p.destacado && !p.oculto))
    );
  }
  
  getProductosConDescuento(): Observable<Producto[]> {
    return this.productos$.pipe(
      map(productos => productos.filter(p => p.descuento && !p.oculto))
    );
  }
  
  getProductoPorId(id: number): Observable<Producto | undefined> {
    return this.productos$.pipe(
      map(productos => productos.find(p => p.id === id))
    );
  }

  getProductosPorCategoria(categoriaId: number): Observable<Producto[]> {
    return this.productos$.pipe(
      map((productos: Producto[]) => productos.filter(p => p.categoriaId === categoriaId && !p.oculto))
    );
  }

  getProductosPorMarca(marcaId: number): Observable<Producto[]> {
    return this.productos$.pipe(
      map((productos: Producto[]) => productos.filter(p => p.marcaId === marcaId && !p.oculto))
    );
  }

  getMarcasDisponibles(): Observable<string[]> {
    return this.productos$.pipe(
      map((productos: Producto[]) => {
        const marcas = productos
          .filter(p => p.marca && !p.oculto)
          .map(p => p.marca)
          .filter((marca, index, array) => array.indexOf(marca) === index)
          .sort();
        return marcas;
      })
    );
  }

  buscarProductos(termino: string): Observable<Producto[]> {
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