# TiendaXpress

Plataforma web completa para minimarket de barrio con panel de administración, catálogo de productos, carrito de compras, gestión de inventario y métricas de ventas.

## 🚀 Tecnologías

*   **Frontend:** Vue 3, Vite, Tailwind CSS, Pinia, Vue Router, Axios.
*   **Backend:** NestJS, Mongoose, Passport (JWT), class-validator, bcryptjs.
*   **Base de Datos:** MongoDB Atlas.

## ⚙️ Requisitos Previos

*   Node.js (v18 o superior)
*   NPM o Yarn
*   Una instancia de MongoDB (Local o Atlas)

## 🛠️ Instalación y Configuración

### 1. Clonar el repositorio

```bash
git clone <url-del-repositorio>
cd tiendaxpress
```

### 2. Configurar el Backend

```bash
cd backend
npm install
```

Crea un archivo `.env` en la raíz de `backend/` basado en `.env.example`:

```env
MONGODB_URI=mongodb+srv://<usuario>:<password>@<cluster>.mongodb.net/tiendaxpress?retryWrites=true&w=majority
JWT_SECRET=tu_secreto_super_seguro
JWT_EXPIRES_IN=7d
PORT=3000
```

#### Ejecutar Script de Seed (Datos de prueba)

Para poblar la base de datos con categorías, productos y un usuario administrador por defecto:

```bash
npx ts-node src/seed.ts
```

*Admin por defecto:*
*   **Usuario:** `admin@tiendaxpress.com`
*   **Contraseña:** `admin123`

#### Iniciar el servidor de desarrollo (Backend)

```bash
npm run start:dev
```
El backend estará corriendo en `http://localhost:3000/api`.

### 3. Configurar el Frontend

Abre una nueva terminal:

```bash
cd frontend
npm install
```

#### Iniciar el servidor de desarrollo (Frontend)

```bash
npm run dev
```
El frontend estará corriendo en `http://localhost:5173`.

## 📂 Estructura del Proyecto

*   `backend/`: API RESTful construida con NestJS. Arquitectura modular por componentes (auth, users, products, orders, inventory, promotions, dashboard, categories).
*   `frontend/`: SPA construida con Vue 3 + Vite. Incluye vistas públicas (tienda, producto, carrito) y un panel de administración protegido.

## 🎨 Características Principales

*   **UI/UX Moderna:** Diseño inspirado en apps de delivery, Mobile-first, animaciones suaves y colores cálidos.
*   **Gestión de Inventario:** Control de stock en tiempo real y alertas de bajo inventario.
*   **Panel de Administración:** Dashboard interactivo con métricas clave y gráficos.
*   **Carrito de Compras:** Persistente en localStorage.
*   **Autenticación:** JWT con roles de usuario (Cliente, Administrador).
