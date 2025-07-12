import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

export interface ItemPedidoBackend {
  producto: { id: number };
  cantidad: number;
  precioUnitario: number;
}

export interface CrearPedidoRequestBackend {
  usuario: { id: number };
  direccionEntrega: { id: number };
  tipoEnvio: string;
  numeroOrden: string;
  items: ItemPedidoBackend[];
}

@Injectable({
  providedIn: 'root'
})
export class PedidoService {
  private readonly baseUrl = 'http://localhost:8090/api/v1/pedidos';

  constructor(private http: HttpClient) {}

  /**
   * Crea un nuevo pedido (formato backend)
   */
  crearPedido(pedidoData: CrearPedidoRequestBackend): Observable<any> {
    console.log('Enviando pedido al backend:', pedidoData);
    return this.http.post<any>(this.baseUrl, pedidoData).pipe(
      catchError((error) => {
        console.error('Error backend:', error);
        if (error.error) {
          console.error('Detalle error backend:', error.error);
        }
        return throwError(() => error);
      })
    );
  }

  /**
   * Obtiene pedidos por usuario
   */
  obtenerPedidosPorUsuario(usuarioId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/usuario/${usuarioId}`);
  }

  /**
   * Obtiene un pedido por número de orden
   */
  obtenerPedidoPorNumeroOrden(numeroOrden: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/numero/${numeroOrden}`);
  }

  /**
   * Obtiene un pedido por ID
   */
  obtenerPedidoPorId(id: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/${id}`);
  }

  /**
   * Actualiza el estado de un pedido
   */
  actualizarEstadoPedido(id: number, estado: string): Observable<any> {
    console.log(`=== ACTUALIZANDO PEDIDO ${id} ===`);
    console.log('Estado enviado:', estado);
    console.log('Longitud del estado:', estado.length);
    console.log('URL completa:', `${this.baseUrl}/${id}/estado?estado=${estado}`);
    
    return this.http.patch<any>(`${this.baseUrl}/${id}/estado`, null, {
      params: { estado: estado }
    }).pipe(
      catchError((error) => {
        console.error('=== ERROR AL ACTUALIZAR ESTADO ===');
        console.error('Error completo:', error);
        if (error.error) {
          console.error('Detalle error backend:', error.error);
        }
        if (error.status) {
          console.error('Status HTTP:', error.status);
        }
        return throwError(() => error);
      })
    );
  }
}
