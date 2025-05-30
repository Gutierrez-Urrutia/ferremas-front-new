import { Component, Input, Output, EventEmitter, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-paginacion',
  imports: [CommonModule],
  templateUrl: './paginacion.component.html',
  styleUrl: './paginacion.component.css'
})
export class PaginacionComponent implements OnChanges {
  @Input() totalItems: number = 0; // Total de elementos a paginar
  @Input() itemsPerPage: number = 8; // Cantidad de elementos por página
  @Input() currentPage: number = 1; // Página actual seleccionada
  @Input() maxVisiblePages: number = 5; // Máximo de botones de página visibles

  @Output() pageChanged = new EventEmitter<number>(); // Emite el número de página cuando se cambia

  totalPages: number = 0; // Total de páginas calculadas
  visiblePages: number[] = []; // Números de páginas visibles en la paginación

  ngOnChanges(): void {
    this.calculatePagination();
  }

  /* Calcula el total de páginas y actualiza los números de página visibles. 
  Se ejecuta cada vez que cambian los inputs relevantes.*/
  private calculatePagination(): void {
    this.totalPages = Math.ceil(this.totalItems / this.itemsPerPage);
    this.generateVisiblePages();
  }

  /* Genera el rango de páginas que se mostrarán en la paginación,
  centrando la página actual cuando sea posible.*/
  private generateVisiblePages(): void {
    const half = Math.floor(this.maxVisiblePages / 2);
    let start = Math.max(1, this.currentPage - half);
    let end = Math.min(this.totalPages, start + this.maxVisiblePages - 1);

    // Ajusta el inicio si no hay suficientes páginas al final
    if (end - start + 1 < this.maxVisiblePages) {
      start = Math.max(1, end - this.maxVisiblePages + 1);
    }

    this.visiblePages = [];
    for (let i = start; i <= end; i++) {
      this.visiblePages.push(i);
    }
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages && page !== this.currentPage) {
      this.pageChanged.emit(page);
    }
  }

  goToPrevious(): void {
    if (this.currentPage > 1) {
      this.goToPage(this.currentPage - 1);
    }
  }

  goToNext(): void {
    if (this.currentPage < this.totalPages) {
      this.goToPage(this.currentPage + 1);
    }
  }

  goToFirst(): void {
    this.goToPage(1);
  }

  goToLast(): void {
    this.goToPage(this.totalPages);
  }
}