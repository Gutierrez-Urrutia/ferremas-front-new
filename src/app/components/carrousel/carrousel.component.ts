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

  ngAfterViewInit() {
    // Inicializar el carrusel manualmente
    const carouselElement = document.getElementById('carouselExampleCaptions');
    if (carouselElement) {
      const carousel = new bootstrap.Carousel(carouselElement, {
        interval: 8000,
        ride: 'carousel'
      });
    }
  }
}