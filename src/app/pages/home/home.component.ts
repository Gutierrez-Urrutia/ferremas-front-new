import { Component, OnInit } from '@angular/core';
import { CarrouselComponent } from '../../components/carrousel/carrousel.component';
import { DestacadosComponent } from '../../components/destacados/destacados.component';
import { PrefooterComponent } from '../../components/prefooter/prefooter.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-home',
  imports: [CommonModule, CarrouselComponent, DestacadosComponent, PrefooterComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {

  ngOnInit(): void { }

}
