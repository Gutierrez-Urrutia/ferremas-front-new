import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from "./components/navbar/navbar.component";
import { CarrouselComponent } from "./components/carrousel/carrousel.component";
import { DestacadosComponent } from "./components/destacados/destacados.component";
import { FooterComponent } from "./components/footer/footer.component";
import { PrefooterComponent } from "./components/prefooter/prefooter.component";

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NavbarComponent, CarrouselComponent, DestacadosComponent, FooterComponent, PrefooterComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'ferremas-front';
}
