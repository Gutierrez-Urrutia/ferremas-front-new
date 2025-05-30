import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-simular-pago',
  imports: [CommonModule, FormsModule],
  templateUrl: './simular-pago.component.html',
  styleUrl: './simular-pago.component.css'
})
export class SimularPagoComponent implements OnInit {
  @Input() monto!: number;
  @Input() numeroOrden!: string;
  @Output() pagoCompletado = new EventEmitter<boolean>();

  estadoPago: 'inicial' | 'procesando' | 'completado' | 'error' = 'inicial';
  
  numeroTarjeta: string = '';
  mesExpiracion: string = '';
  anoExpiracion: string = '';
  cvv: string = '';
  nombreTitular: string = '';

  tiempoRestante: number = 0;
  progreso: number = 0; 
  intervaloTiempo: any;
  intervaloProgreso: any; 
  fechaTransaccion: Date = new Date();

  constructor(private router: Router) {}

  ngOnInit() {
    
    this.numeroTarjeta = '4532 1234 5678 9012';
    this.mesExpiracion = '12';
    this.anoExpiracion = '2025';
    this.cvv = '123';
    this.nombreTitular = 'JUAN PEREZ';
  }

  iniciarPago() {
    if (!this.validarDatos()) {
      Swal.fire({
        title: 'Datos incompletos',
        text: 'Por favor, complete todos los campos correctamente.',
        icon: 'warning',
        confirmButtonText: 'Entendido',
        confirmButtonColor: '#ffc107'
      });
      return;
    }

    this.estadoPago = 'procesando';
    this.tiempoRestante = 5; 
    this.progreso = 0; 
    
    this.intervaloTiempo = setInterval(() => {
      this.tiempoRestante--;
      
      if (this.tiempoRestante <= 0) {
        this.finalizarPago();
      }
    }, 1000);

    this.intervaloProgreso = setInterval(() => {
      this.progreso += 2; 
      
      if (this.progreso >= 100) {
        this.progreso = 100;
        clearInterval(this.intervaloProgreso);
      }
    }, 100);
  }

  finalizarPago() {
    clearInterval(this.intervaloTiempo);
    clearInterval(this.intervaloProgreso);
    
    this.progreso = 100;
    
    this.fechaTransaccion = new Date();
    
    const exitoso = Math.random() > 0.2;
    
    if (exitoso) {
      this.estadoPago = 'completado';
      setTimeout(() => {
        this.pagoCompletado.emit(true);
      }, 2000);
    } else {
      this.estadoPago = 'error';
    }
  }

  reintentar() {
    this.estadoPago = 'inicial';
    this.tiempoRestante = 0;
    this.progreso = 0; 
  }

  cancelarPago() {
    Swal.fire({
      title: '¿Cancelar pago?',
      text: 'Se cancelará el proceso de pago actual',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Sí, cancelar',
      cancelButtonText: 'Continuar pago',
      reverseButtons: true
    }).then((result) => {
      if (result.isConfirmed) {
        if (this.intervaloTiempo) {
          clearInterval(this.intervaloTiempo);
        }
        if (this.intervaloProgreso) {
          clearInterval(this.intervaloProgreso);
        }
        
        Swal.fire({
          title: 'Pago cancelado',
          text: 'El proceso de pago ha sido cancelado',
          icon: 'info',
          timer: 2000,
          showConfirmButton: false,
          timerProgressBar: true
        });
        
        this.pagoCompletado.emit(false);
      }
    });
  }

  validarDatos(): boolean {
    return this.numeroTarjeta.length >= 16 &&
           this.mesExpiracion.length === 2 &&
           this.anoExpiracion.length === 4 &&
           this.cvv.length >= 3 &&
           this.nombreTitular.length > 0;
  }

  formatearTarjeta() {
    // Remover espacios y caracteres no numéricos
    let valor = this.numeroTarjeta.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    valor = valor.substring(0, 16);
    
    const matches = valor.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    
    if (parts.length) {
      this.numeroTarjeta = parts.join(' ');
    } else {
      this.numeroTarjeta = valor;
    }
  }
}