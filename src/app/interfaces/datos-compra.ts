import { Producto } from './producto';
import { DatosCliente } from './datos-cliente';

export interface DatosCompra {
  productos: { producto: Producto; cantidad: number }[];
  subtotal: number;
  datosCliente?: DatosCliente;
  tipoDespacho?: string;
  esCompraCarrito?: boolean;
}