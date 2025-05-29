import { Injectable } from '@angular/core';
import { BehaviorSubject, catchError, map, Observable, of } from 'rxjs';
import { Producto } from '../interfaces/producto';
import { ProductoApiService } from './producto-api.service';
import { ProductoResponse } from '../interfaces/producto-response';


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
    // const productos: Producto[] = [
    //   {
    //     id: 1,
    //     nombre: "Taladro Percutor 850W",
    //     precio: 89.99,
    //     descripcion: "Taladro percutor profesional de 850W con mandril de 13mm",
    //     imagen: "taladro.jpg",
    //     descuento: 10,
    //     destacado: true,
    //     oculto: false,
    //     categoriaId: 1
    //   },
    //   {
    //     id: 2,
    //     nombre: "Set de Destornilladores 42 piezas",
    //     precio: 45.50,
    //     descripcion: "Set completo con 42 piezas para todo tipo de tornillos",
    //     imagen: "destornilladores.jpg",
    //     destacado: true,
    //     oculto: false,
    //     categoriaId: 1
    //   },
    //   {
    //     id: 3,
    //     nombre: "Sierra Circular 1500W",
    //     precio: 120.00,
    //     descripcion: "Sierra circular de 1500W con hoja de 7.25 pulgadas",
    //     imagen: "sierra.jpg",
    //     descuento: 5,
    //     destacado: true,
    //     oculto: false,
    //     categoriaId: 2
    //   },
    //   {
    //     id: 4,
    //     nombre: "Lijadora Orbital 300W",
    //     precio: 55.00,
    //     descripcion: "Lijadora orbital de 300W con sistema de recolección de polvo",
    //     imagen: "lijadora.jpg",
    //     destacado: true,
    //     oculto: false,
    //     categoriaId: 2
    //   },
    //   {
    //     id: 5,
    //     nombre: "Juego de Llaves Allen 9 piezas",
    //     precio: 15.00,
    //     descripcion: "Juego de llaves Allen de alta calidad, 9 piezas",
    //     imagen: "llaves.jpg",
    //     destacado: true,
    //     oculto: false,
    //     categoriaId: 3
    //   },
    //   {
    //     id: 6,
    //     nombre: "Martillo de Goma 1kg",
    //     precio: 10.00,
    //     descripcion: "Martillo de goma de 1kg, ideal para trabajos delicados",
    //     imagen: "martillo.jpg",
    //     destacado: true,
    //     oculto: false,
    //     categoriaId: 3
    //   },
    //   {
    //     id: 7,
    //     nombre: "Cinta Métrica 5m",
    //     precio: 5.00,
    //     descripcion: "Cinta métrica de 5 metros, ideal para mediciones precisas",
    //     imagen: "cinta.jpg",
    //     destacado: true,
    //     oculto: false,
    //     categoriaId: 4
    //   },
    //   {
    //     id: 8,
    //     nombre: "Escuadra de Carpintero",
    //     precio: 8.00,
    //     descripcion: "Escuadra de carpintero de alta precisión",
    //     imagen: "escuadra.jpg",
    //     destacado: true,
    //     oculto: false,
    //     categoriaId: 4
    //   },
    //   {
    //     id: 9,
    //     nombre: "Nivel de Burbuja 60cm",
    //     precio: 12.00,
    //     descripcion: "Nivel de burbuja de 60cm, ideal para trabajos de nivelación",
    //     imagen: "nivel.jpg",
    //     destacado: true,
    //     oculto: false,
    //     categoriaId: 5
    //   },
    //   {
    //     id: 10,
    //     nombre: "Caja de Herramientas 16\"",
    //     precio: 25.00,
    //     descripcion: "Caja de herramientas de 16 pulgadas, ideal para organizar tus herramientas",
    //     imagen: "caja_herramientas.jpg",
    //     descuento: 15,
    //     destacado: true,
    //     oculto: false,
    //     categoriaId: 5
    //   }  
    // ];

    // this.productosSource.next(productos);
    console.log('🔄 Cargando productos desde backend...');

    this.productoApiService.getProductos().pipe(
      map((productosBackend: any) => {
        console.log('📦 Productos recibidos del backend:', productosBackend);
        return this.mapearProductosDelBackend(productosBackend as ProductoResponse[]);
      }),
      catchError((error: any): Observable<Producto[]> => {
        console.error('❌ Error cargando productos desde backend:', error);
        console.warn('⚠️ Usando productos por defecto');
        return of(this.obtenerProductosPorDefecto());
      })
    ).subscribe((productos: Producto[]) => {
      console.log('✅ Productos cargados:', productos);
      this.productosSource.next(productos);
    });
  }

    private mapearProductosDelBackend(productosBackend: ProductoResponse[]): Producto[] {
    return productosBackend
      .filter(producto => !producto.oculto) // Filtrar productos ocultos
      .map(productoBackend => ({
        id: productoBackend.id,
        nombre: productoBackend.nombre,
        precio: productoBackend.precio || 0,
        descripcion: productoBackend.descripcion || 'Sin descripción',
        imagen: productoBackend.imagen || 'producto-default.jpg',
        descuento: productoBackend.descuento || undefined,
        destacado: productoBackend.destacado || undefined,
        oculto: productoBackend.oculto || undefined,
        categoriaId: productoBackend.categoriaId
      }));
  }

  private obtenerProductosPorDefecto(): Producto[] {
    return [
      // {
      //   id: 1,
      //   nombre: "Taladro Percutor 850W",
      //   precio: 89990,
      //   descripcion: "Taladro percutor profesional de 850W con mandril de 13mm",
      //   imagen: "taladro.jpg",
      //   descuento: 10,
      //   destacado: true,
      //   oculto: false,
      //   categoriaId: 1
      // },
      // {
      //   id: 2,
      //   nombre: "Set de Destornilladores 42 piezas",
      //   precio: 45500,
      //   descripcion: "Set completo con 42 piezas para todo tipo de tornillos",
      //   imagen: "destornilladores.jpg",
      //   destacado: true,
      //   oculto: false,
      //   categoriaId: 1
      // },
      // {
      //   id: 3,
      //   nombre: "Sierra Circular 1500W",
      //   precio: 120000,
      //   descripcion: "Sierra circular de 1500W con hoja de 7.25 pulgadas",
      //   imagen: "sierra.jpg",
      //   descuento: 5,
      //   destacado: true,
      //   oculto: false,
      //   categoriaId: 2
      // },
      // {
      //   id: 4,
      //   nombre: "Lijadora Orbital 300W",
      //   precio: 55000,
      //   descripcion: "Lijadora orbital de 300W con sistema de recolección de polvo",
      //   imagen: "lijadora.jpg",
      //   destacado: true,
      //   oculto: false,
      //   categoriaId: 2
      // },
      // {
      //   id: 5,
      //   nombre: "Juego de Llaves Allen 9 piezas",
      //   precio: 15000,
      //   descripcion: "Juego de llaves Allen de alta calidad, 9 piezas",
      //   imagen: "llaves.jpg",
      //   destacado: true,
      //   oculto: false,
      //   categoriaId: 3
      // },
      // {
      //   id: 6,
      //   nombre: "Martillo de Goma 1kg",
      //   precio: 10000,
      //   descripcion: "Martillo de goma de 1kg, ideal para trabajos delicados",
      //   imagen: "martillo.jpg",
      //   destacado: true,
      //   oculto: false,
      //   categoriaId: 3
      // },
      // {
      //   id: 7,
      //   nombre: "Cinta Métrica 5m",
      //   precio: 5000,
      //   descripcion: "Cinta métrica de 5 metros, ideal para mediciones precisas",
      //   imagen: "cinta.jpg",
      //   destacado: true,
      //   oculto: false,
      //   categoriaId: 4
      // },
      // {
      //   id: 8,
      //   nombre: "Escuadra de Carpintero",
      //   precio: 8000,
      //   descripcion: "Escuadra de carpintero de alta precisión",
      //   imagen: "escuadra.jpg",
      //   destacado: true,
      //   oculto: false,
      //   categoriaId: 4
      // },
      // {
      //   id: 9,
      //   nombre: "Nivel de Burbuja 60cm",
      //   precio: 12000,
      //   descripcion: "Nivel de burbuja de 60cm, ideal para trabajos de nivelación",
      //   imagen: "nivel.jpg",
      //   destacado: true,
      //   oculto: false,
      //   categoriaId: 5
      // },
      // {
      //   id: 10,
      //   nombre: "Caja de Herramientas 16\"",
      //   precio: 25000,
      //   descripcion: "Caja de herramientas de 16 pulgadas, ideal para organizar tus herramientas",
      //   imagen: "caja_herramientas.jpg",
      //   descuento: 15,
      //   destacado: true,
      //   oculto: false,
      //   categoriaId: 5
      // }  
    ];
  }

  getProductos(): Observable<Producto[]> {
    return this.productos$;
  }

  getProductosDestacados(): Observable<Producto[]> {
    return new Observable<Producto[]>(observer => {
      this.productos$.subscribe(productos => {
        observer.next(productos.filter(p => p.destacado));
      });
    });
  }

  getProductoPorId(id: number): Observable<Producto | undefined> {
    return new Observable<Producto | undefined>(observer => {
      this.productos$.subscribe(productos => {
        observer.next(productos.find(p => p.id === id));
      });
    });
  }

  getProductosPorCategoria(categoriaId: number): Observable<Producto[]> {
    return this.productos$.pipe(
      map((productos: Producto[]) => productos.filter(p => p.categoriaId === categoriaId && !p.oculto))
    );
  }
}
