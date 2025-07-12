import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ConversorPipe } from '../../pipes/conversor.pipe';
import * as XLSX from 'xlsx';

interface Pedido {
  id: number;
  fechaCreacion: string;
  total: number;
  estado: string;
  numeroOrden: string;
  items?: any[];
}

@Component({
  selector: 'app-auditor',
  imports: [CommonModule, ConversorPipe, FormsModule],
  templateUrl: './auditor.component.html',
  styleUrl: './auditor.component.css'
})
export class AuditorComponent implements OnInit {
  pedidos: Pedido[] = [];
  pedidosFiltrados: Pedido[] = [];
  loading = true;
  error = '';
  
  // Filtros de fecha
  fechaInicio: string = '';
  fechaTermino: string = '';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.cargarPedidos();
  }

  cargarPedidos(): void {
    this.loading = true;
    this.error = '';
    
    this.http.get<Pedido[]>('http://localhost:8090/api/v1/pedidos').subscribe({
      next: (data: Pedido[]) => {
        // Filtrar solo pedidos ENTREGADO
        this.pedidos = data.filter((pedido: Pedido) => pedido.estado === 'ENTREGADO');
        this.aplicarFiltroFechas();
        this.loading = false;
      },
      error: (error: any) => {
        console.error('Error al cargar pedidos:', error);
        this.error = 'Error al cargar los pedidos';
        this.loading = false;
      }
    });
  }

  calcularTotalSinIVA(total: number): number {
    return total / 1.19;
  }

  calcularIVA(total: number): number {
    return total - this.calcularTotalSinIVA(total);
  }

  formatearFecha(fecha: string): string {
    return new Date(fecha).toLocaleDateString('es-CL', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  aplicarFiltroFechas(): void {
    console.log('=== APLICANDO FILTRO DE FECHAS ===');
    console.log('Fecha inicio:', this.fechaInicio);
    console.log('Fecha término:', this.fechaTermino);
    console.log('Total pedidos antes de filtrar:', this.pedidos.length);
    
    if (!this.fechaInicio && !this.fechaTermino) {
      // Sin filtros, mostrar todos los pedidos
      this.pedidosFiltrados = [...this.pedidos];
    } else {
      this.pedidosFiltrados = this.pedidos.filter(pedido => {
        // Extraer solo la fecha (YYYY-MM-DD) del pedido
        const fechaPedidoStr = pedido.fechaCreacion.split('T')[0]; // Solo parte de fecha
        
        console.log(`Pedido ${pedido.numeroOrden}:`, {
          fechaOriginal: pedido.fechaCreacion,
          fechaPedidoStr: fechaPedidoStr
        });
        
        let cumpleFiltro = true;

        if (this.fechaInicio) {
          const cumpleInicio = fechaPedidoStr >= this.fechaInicio;
          console.log(`  Filtro inicio (${this.fechaInicio}):`, cumpleInicio);
          cumpleFiltro = cumpleFiltro && cumpleInicio;
        }

        if (this.fechaTermino) {
          const cumpleTermino = fechaPedidoStr <= this.fechaTermino;
          console.log(`  Filtro término (${this.fechaTermino}):`, cumpleTermino);
          cumpleFiltro = cumpleFiltro && cumpleTermino;
        }

        console.log(`  Resultado final para pedido ${pedido.numeroOrden}:`, cumpleFiltro);
        return cumpleFiltro;
      });
    }
    
    console.log('Total pedidos después de filtrar:', this.pedidosFiltrados.length);
    console.log('=== FIN FILTRO DE FECHAS ===');
  }

  limpiarFiltros(): void {
    this.fechaInicio = '';
    this.fechaTermino = '';
    this.aplicarFiltroFechas();
  }

  onFiltroChange(): void {
    this.aplicarFiltroFechas();
  }

  generarInformeExcel(): void {
    if (this.pedidosFiltrados.length === 0) {
      alert('No hay datos para exportar');
      return;
    }

    // Preparar los datos para el Excel usando los datos filtrados
    const datosExcel = this.pedidosFiltrados.map(pedido => ({
      'Número de Orden': pedido.numeroOrden,
      'Fecha': this.formatearFecha(pedido.fechaCreacion),
      'Total sin IVA': this.formatearMoneda(this.calcularTotalSinIVA(pedido.total)),
      'IVA (19%)': this.formatearMoneda(this.calcularIVA(pedido.total)),
      'Total': this.formatearMoneda(pedido.total)
    }));

    // Crear el libro de trabajo
    const workbook = XLSX.utils.book_new();
    
    // Crear la hoja de trabajo
    const worksheet = XLSX.utils.json_to_sheet(datosExcel);

    // Ajustar el ancho de las columnas
    const columnWidths = [
      { wch: 18 }, // Número de Orden
      { wch: 12 }, // Fecha
      { wch: 18 }, // Total sin IVA
      { wch: 15 }, // IVA (19%)
      { wch: 18 }  // Total
    ];
    worksheet['!cols'] = columnWidths;

    // Agregar la hoja al libro
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Pedidos Entregados');

    // Generar el nombre del archivo con la fecha actual
    const fechaActual = new Date().toISOString().split('T')[0];
    const nombreArchivo = `Informe_Auditoria_${fechaActual}.xlsx`;

    // Descargar el archivo
    XLSX.writeFile(workbook, nombreArchivo);
  }

  private formatearMoneda(cantidad: number): string {
    return new Intl.NumberFormat('es-CL', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(cantidad);
  }
}
