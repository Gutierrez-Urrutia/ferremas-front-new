import { Precio } from './precio';

export interface Producto {
  id: number;
  codigo_producto: string;
  nombre: string;
  categoria: string;
  marca: string;
  precios: Precio[];
  descripcion: string;
  imagen: string;
  descuento: number;
  destacado: boolean;
  oculto: boolean;
  categoriaId: number;
  marcaId: number;
  stock:number;
}

