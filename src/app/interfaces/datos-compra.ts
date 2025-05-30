import { DatosCliente } from './datos-cliente';
import { ProductoResponse } from './producto-response';

export interface DatosCompra {
  productos: { producto: ProductoResponse; cantidad: number }[];
  subtotal: number;
  datosCliente?: DatosCliente;
  tipoDespacho?: string;
  esCompraCarrito?: boolean;
}