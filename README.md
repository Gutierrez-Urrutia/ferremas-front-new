```markdown
# 🔧 Ferremas - Plataforma E-commerce para Ferretería

Una aplicación web moderna desarrollada con Angular que ofrece una experiencia completa de compra online para productos de ferretería, incluyendo navegación por categorías, gestión de carrito y simulación de pagos.

## ✨ Características Principales

- **Catálogo de productos** organizado por categorías y marcas
- **Sistema de ofertas** con productos destacados y descuentos
- **Carrito de compras** con gestión completa de productos
- **Simulador de pagos** integrado con Webpay Plus
- **Conversión de divisas** en tiempo real
- **Interfaz responsive** optimizada para todos los dispositivos

## 🛠️ Stack Tecnológico [1](#1-0) 

- **Angular 19.2.0** - Framework principal
- **Bootstrap 5.3.6** - Framework CSS y componentes UI
- **FontAwesome 6.7.2** - Iconografía
- **SweetAlert2** - Notificaciones y alertas
- **RxJS** - Programación reactiva

## 📁 Arquitectura del Proyecto

```
src/app/
├── components/          # Componentes reutilizables
│   ├── navbar/         # Navegación principal
│   ├── footer/         # Pie de página
│   ├── card/           # Tarjetas de productos
│   ├── modal-compra/   # Modal de proceso de compra
│   └── modal-carrito/  # Modal del carrito
├── pages/              # Páginas principales
│   ├── home/           # Página de inicio
│   ├── categoria-producto/  # Productos por categoría
│   ├── marca-producto/      # Productos por marca
│   ├── oferta-producto/     # Ofertas especiales
│   └── simular-pago/        # Simulador de pagos
├── services/           # Servicios de datos
│   ├── producto.service.ts
│   ├── carrito.service.ts
│   ├── categoria.service.ts
│   └── divisa.service.ts
└── interfaces/         # Definiciones TypeScript
```

## 🚀 Instalación y Configuración

### Prerrequisitos
- Node.js 18+
- Angular CLI 19.2.12
- npm o yarn

### Pasos de instalación

1. **Clonar el repositorio**
   ```bash
   git clone https://github.com/Gutierrez-Urrutia/ferremas-front-new.git
   cd ferremas-front-new
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Ejecutar en desarrollo**
   ```bash
   ng serve
   ```

4. **Acceder a la aplicación**
   Abrir `http://localhost:4200/` en el navegador

## 📝 Scripts Disponibles

- `ng serve` - Servidor de desarrollo
- `ng build` - Construcción para producción
- `ng test` - Ejecutar pruebas unitarias
- `ng e2e` - Pruebas end-to-end

## 🎯 Funcionalidades Clave

### Navegación de Productos
La aplicación implementa un sistema de navegación por categorías y marcas con paginación automática. [2](#1-1) 

### Sistema de Ofertas
Los productos con descuentos se muestran en una sección especial con badges distintivos. [3](#1-2) 

### Proceso de Compra
El sistema incluye un modal de compra con múltiples pasos que guía al usuario desde la selección hasta el pago. [4](#1-3) 

### Simulador de Pagos
Integración con simulador de Webpay Plus para procesar pagos de forma segura. [5](#1-4) 

## 🔧 Servicios y Gestión de Estado

### Gestión de Categorías
El servicio de categorías implementa un patrón reactivo con fallback a datos por defecto. [6](#1-5) 

### Estados de Error
La aplicación maneja graciosamente los errores de conexión con mensajes informativos. [7](#1-6) 

## 🎨 Interfaz de Usuario

- **Diseño responsive** con Bootstrap Grid System
- **Estados de carga** con spinners animados
- **Manejo de errores** con alertas contextuales
- **Navegación intuitiva** con breadcrumbs y filtros

## 🌐 Integración Backend

La aplicación se conecta con APIs backend para:
- Gestión de productos y categorías
- Información de marcas y precios
- Tasas de cambio de divisas
- Procesamiento de órdenes

## 🤝 Contribución

1. Fork del proyecto
2. Crear rama feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit cambios (`git commit -m 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Crear Pull Request

## 📄 Licencia

Proyecto de uso privado - Ferremas SpA

## 👨‍💻 Desarrollador

**Pablo Gutiérrez** - [Gutierrez-Urrutia](https://github.com/Gutierrez-Urrutia)

---

💡 **Tip**: Para una experiencia óptima, asegúrate de tener una conexión estable a internet para la carga de imágenes y conversión de divisas.
```
