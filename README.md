# Hackathon16 - Sistema de Pagos Online

Backend con **Express + Node.js + Socket.IO + MySQL + OAuth (GitHub) + Stripe + Culqi** para registrar productos, pagos y devoluciones persistentes.

## Requisitos

- Node.js 20+
- MySQL 8+

## Configuración

1. Copiar variables de entorno:

```bash
cp .env.example .env
```

2. Instalar dependencias:

```bash
npm install
```

3. Crear la base de datos en MySQL y configurar credenciales en `.env`.

4. Inicializar esquema:

```bash
npm run db:init
```

## Ejecutar

```bash
npm start
```

## Scripts

- `npm run lint`: validación sintáctica JS
- `npm run build`: sin paso de build (informativo)
- `npm test`: pruebas unitarias
- `npm run db:init`: crea tablas del sistema

## OAuth

- Configurar `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET` y `GITHUB_CALLBACK_URL`.
- Flujo: `GET /auth/github` → callback `GET /auth/github/callback`.
- Desarrollo local rápido: `ENABLE_DEV_AUTH=true` y enviar `x-dev-user-id`.

## Endpoints principales

- `GET /health`
- `POST /api/products` (auth)
- `GET /api/products`
- `POST /api/payments` (auth)
- `GET /api/payments` (auth)
- `POST /api/refunds` (auth)
- `GET /api/refunds` (auth)

## Socket.IO

Eventos emitidos:

- `payment:created`
- `refund:created`
