import { DatosCliente } from './datos-cliente';
import { Producto } from './producto';

export interface DatosCompra {
  productos: { producto: Producto; cantidad: number }[];
  subtotal: number;
  datosCliente?: DatosCliente;
  tipoDespacho?: string;
  esCompraCarrito?: boolean;
}