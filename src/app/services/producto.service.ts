import { Injectable } from '@angular/core';
import { BehaviorSubject, catchError, map, Observable, of } from "rxjs";
import { Producto } from "../interfaces/producto";
import { ProductoApiService } from "./producto-api.service";

@Injectable({
  providedIn: 'root'
})
export class ProductoService {
  /* Fuente reactiva que mantiene la lista de productos en memoria y permite su actualización en tiempo real */
  private productosSource = new BehaviorSubject<Producto[]>([]);
  /* Observable expuesto para que otros componentes puedan suscribirse a los cambios en la lista de productos */
  productos$ = this.productosSource.asObservable();

  constructor(private productoApiService: ProductoApiService) {
    this.cargarProductosIniciales();
  }

  /* Carga los productos desde el backend al inicializar el servicio.
     Si ocurre un error, se utiliza una lista vacía como fallback. */
  private cargarProductosIniciales() {
    console.log('Cargando productos desde backend...');

    this.productoApiService.getProductos().pipe(
      map((productosBackend: Producto[]) => {
        console.log('Productos recibidos del backend:', productosBackend);
        return productosBackend;
      }),
      catchError((error: any): Observable<Producto[]> => {
        console.error('Error cargando productos desde backend:', error);
        console.warn('Usando productos por defecto');
        return of([]);
      })
    ).subscribe((productos) => {
      console.log('Productos cargados:', productos);
      this.productosSource.next(productos);
    });
  }

  getProductos(): Observable<Producto[]> {
    return this.productos$;
  }

  /* Devuelve solo los productos destacados y no ocultos */
  getProductosDestacados(): Observable<Producto[]> {
    return this.productos$.pipe(
      map(productos => productos.filter(p => p.destacado && !p.oculto))
    );
  }
  
  /* Devuelve los productos que tienen descuento y no están ocultos */
  getProductosConDescuento(): Observable<Producto[]> {
    return this.productos$.pipe(
      map(productos => productos.filter(p => p.descuento && !p.oculto))
    );
  }
  
  /* Busca un producto por su identificador único */
  getProductoPorId(id: number): Observable<Producto | undefined> {
    return this.productos$.pipe(
      map(productos => productos.find(p => p.id === id))
    );
  }

  /* Filtra productos por categoría y que no estén ocultos */
  getProductosPorCategoria(categoriaId: number): Observable<Producto[]> {
    return this.productos$.pipe(
      map((productos: Producto[]) => productos.filter(p => p.categoriaId === categoriaId && !p.oculto))
    );
  }

  /* Filtra productos por marca y que no estén ocultos */
  getProductosPorMarca(marcaId: number): Observable<Producto[]> {
    return this.productos$.pipe(
      map((productos: Producto[]) => productos.filter(p => p.marcaId === marcaId && !p.oculto))
    );
  }

  /* Obtiene la lista de marcas únicas disponibles entre los productos no ocultos */
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

  /* Busca productos cuyo nombre, descripción o marca coincidan con el término de búsqueda y que no estén ocultos */
  buscarProductos(termino: string): Observable<Producto[]> {
    const normalizedTermino = this.normalizarTexto(termino);

    return this.productos$.pipe(
      map((productos: Producto[]) => {
        if (!normalizedTermino) {
          return [];
        }

        return productos.filter(producto => {
          if (producto.oculto) {
            return false;
          }

          const nombre = this.normalizarTexto(producto.nombre);
          const descripcion = this.normalizarTexto(producto.descripcion);
          const marca = this.normalizarTexto(producto.marca);

          return nombre.includes(normalizedTermino) || descripcion.includes(normalizedTermino) || marca.includes(normalizedTermino);
        });
      })
    );
  }

  private normalizarTexto(texto: string | null | undefined): string {
    return (texto || '')
      .toString()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim();
  }
}