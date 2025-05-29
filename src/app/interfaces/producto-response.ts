export interface ProductoResponse {
  id: number;
  codigo_producto: string;
  nombre: string;
  categoria: string;
  marca: string;
  precios: any[];
  precio: number;
  descripcion: string;
  imagen: string;
  descuento: number;
  destacado: boolean;
  oculto: boolean;
  categoriaId: number;
}