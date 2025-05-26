export interface Producto {
  id: number;
  nombre: string;
  precio: number;
  descripcion: string;
  imagen: string;
  descuento?: number;
  destacado?: boolean;
  oculto?: boolean;
  categoriaId: number;
}