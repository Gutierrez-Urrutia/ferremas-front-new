import { Component, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';

declare var bootstrap: any;

@Component({
  selector: 'app-carrousel',
  imports: [CommonModule],
  templateUrl: './carrousel.component.html',
  styleUrl: './carrousel.component.css'
})
export class CarrouselComponent implements AfterViewInit {

  // Inicializa el carrusel de Bootstrap después de que la vista se ha renderizado
  ngAfterViewInit() {
    const carouselElement = document.getElementById('carouselExampleCaptions');
    if (carouselElement) {
      // Configura el carrusel para que cambie cada 8 segundos automáticamente
      const carousel = new bootstrap.Carousel(carouselElement, {
        interval: 8000,
        ride: 'carousel'
      });
    }
  }
}