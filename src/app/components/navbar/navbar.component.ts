import { Component, OnInit } from '@angular/core';
import { CategoriaService } from '../../services/categoria.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Categoria } from '../../interfaces/categoria';


@Component({
  selector: 'app-navbar',
  imports: [CommonModule, RouterModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent implements OnInit{
  categorias: Categoria[] = [];
  
  constructor(private categoriaService: CategoriaService) { }

  ngOnInit(): void {
    // Suscribirse al observable de categorías para obtener la lista
    this.categoriaService.getCategorias().subscribe(categorias => {
      this.categorias = categorias;
    });
  }


}
