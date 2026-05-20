import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CarrouselComponent } from '../../components/carrousel/carrousel.component';
import { DestacadosComponent } from '../../components/destacados/destacados.component';
import { PrefooterComponent } from '../../components/prefooter/prefooter.component';
import { CardComponent } from '../../components/card/card.component';
import { CommonModule } from '@angular/common';
import { ProductoService } from '../../services/producto.service';
import { Producto } from '../../interfaces/producto';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  imports: [CommonModule, FormsModule, CarrouselComponent, DestacadosComponent, PrefooterComponent, CardComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  terminoBusqueda = '';
  @ViewChild('buscadorInput') buscadorInput!: ElementRef<HTMLInputElement>;

  resultadosCards: Producto[] = [];
  showCards = false;

  constructor(private productoService: ProductoService, private router: Router) {}

  ngOnInit(): void { }

  onTermChange(value: string): void {
    this.terminoBusqueda = value;
    const term = value?.trim();
    this.showCards = false;
    // No predictive search: do not call backend here. Results will be fetched on Enter.
  }

  // When user presses Enter: perform search and show cards with results
  onEnter(): void {
    const term = this.terminoBusqueda?.trim();
    if (term && term.length > 0) {
      this.productoService.buscarProductos(term).subscribe(results => {
        this.resultadosCards = results;
        this.showCards = true;
      });
    } else {
      this.resultadosCards = [];
      this.showCards = false;
    }
  }

  // Navigate to a dedicated product page (if exists)
  navigateToProduct(id: number): void {
    this.router.navigate(['/producto', id]);
  }

  limpiarBusqueda(): void {
    this.terminoBusqueda = '';
    this.resultadosCards = [];
    this.showCards = false;
  }

  focusBusqueda(): void {
    try {
      this.buscadorInput?.nativeElement?.focus();
    } catch (e) {
      // no-op if not available yet
    }
  }

}
