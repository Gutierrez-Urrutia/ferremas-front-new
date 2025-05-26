import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

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

  // Estado del pago
  estadoPago: 'inicial' | 'procesando' | 'completado' | 'error' = 'inicial';
  
  // Datos simulados de tarjeta
  numeroTarjeta: string = '';
  mesExpiracion: string = '';
  anoExpiracion: string = '';
  cvv: string = '';
  nombreTitular: string = '';

  // Simulación de proceso
  tiempoRestante: number = 0;
  intervaloTiempo: any;
  
  // Fecha actual para mostrar en el recibo
  fechaTransaccion: Date = new Date();

  constructor(private router: Router) {}

  ngOnInit() {
    // Auto-rellenar datos de prueba
    this.numeroTarjeta = '4532 1234 5678 9012';
    this.mesExpiracion = '12';
    this.anoExpiracion = '2025';
    this.cvv = '123';
    this.nombreTitular = 'JUAN PEREZ';
  }

  iniciarPago() {
    if (!this.validarDatos()) {
      alert('Por favor, complete todos los campos correctamente.');
      return;
    }

    this.estadoPago = 'procesando';
    this.tiempoRestante = 5; // 30 segundos de simulación
    
    this.intervaloTiempo = setInterval(() => {
      this.tiempoRestante--;
      
      if (this.tiempoRestante <= 0) {
        this.finalizarPago();
      }
    }, 1000);
  }

  finalizarPago() {
    clearInterval(this.intervaloTiempo);
    
    // Actualizar fecha de transacción al momento del pago
    this.fechaTransaccion = new Date();
    
    // Simular resultado aleatorio (80% éxito, 20% fallo)
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
  }

  cancelarPago() {
    if (this.intervaloTiempo) {
      clearInterval(this.intervaloTiempo);
    }
    this.pagoCompletado.emit(false);
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
    
    // Limitar a 16 dígitos
    valor = valor.substring(0, 16);
    
    // Agregar espacios cada 4 dígitos
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