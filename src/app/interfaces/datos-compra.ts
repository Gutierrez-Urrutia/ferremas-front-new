import { Producto } from './producto';
import { DatosCliente } from './datos-cliente';

export interface DatosCompra {
  producto: Producto;
  cantidad: number;
  subtotal: number;
  datosCliente?: DatosCliente;
  tipoDespacho?: string;
}