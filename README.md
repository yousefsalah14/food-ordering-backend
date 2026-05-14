# Food Ordering Backend

NestJS API for the food ordering platform. This service provides authentication, catalog management, cart operations, order processing, payments, admin utilities, uploads, and the domain data used by the frontend application.

## Project Summary

This backend is the source of truth for the application data model and business rules. It exposes authenticated REST endpoints for:

- User registration, login, and profile lookup
- Product and category browsing
- Cart creation and item management
- Order creation, order listing, and order detail retrieval
- Admin dashboard metrics and operations
- Coupon generation and admin user management
- Payment handling, including cash on delivery and Stripe integration
- Media uploads

## Delivered Task Notes

The current implementation includes the backend changes required for the landing page recent-orders experience:

- `GET /orders` returns paginated order data for authenticated users
- Non-admin users only receive their own orders
- Admin users can retrieve the full order list
- The order query supports pagination, search, and status filters

This behavior is important for the customer landing page because the frontend now reads recent orders directly from the authenticated `/orders` endpoint.

## Domain Areas

- `src/auth` - login, JWT issuance, and session validation
- `src/users` - user records and profile operations
- `src/categories` - product category management
- `src/products` - product catalog operations
- `src/cart` - cart and cart item handling
- `src/orders` - order creation, history, and order status updates
- `src/payments` - payment creation and webhook-related logic
- `src/admin` - dashboard data, admin user creation, and coupon generation
- `src/uploads` - file upload handling
- `src/database` - application seed data

## API Overview

Base routes are mounted under the configured API prefix, which defaults to `/api`.

Common endpoints include:

- `POST /auth/login`
- `POST /auth/register`
- `GET /auth/me`
- `GET /products`
- `GET /categories`
- `GET /cart`
- `POST /orders`
- `GET /orders`
- `GET /orders/:id`
- `PATCH /orders/:id/status`
- `GET /admin/dashboard`
- `POST /admin/users`
- `GET /admin/coupons/generate`

Swagger is exposed under the configured docs path, which defaults to `/docs`.

## Test Credentials

The seed script creates a default admin account for local verification.

- Email: `admin@gmail.com`
- Password: `admin`

The seed logs the same credentials after creation so they can be used immediately for testing the admin console and order management screens.

## Environment Variables

Create a `.env` file with values appropriate for your local setup.

```env
PORT=3000
API_PREFIX=api
SWAGGER_PATH=docs
JWT_SECRET=food-ordering-secret
JWT_EXPIRES_IN=7d
APP_BASE_URL=http://localhost:3000
FRONTEND_URL=http://localhost:5173

DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=
DB_NAME=food_ordering
DB_SYNCHRONIZE=true

STRIPE_SECRET_KEY=
STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_SUCCESS_URL=http://localhost:3000/payment/success
STRIPE_CANCEL_URL=http://localhost:3000/payment/cancel
STRIPE_CURRENCY=egp
```

## Getting Started

```bash
npm install
npm run start:dev
```

The API runs on `http://localhost:3000` by default.

## Available Scripts

```bash
npm run start
npm run start:dev
npm run start:prod
npm run build
npm run lint
npm run test
npm run test:e2e
npm run test:cov
npm run seed
```

## Validation Notes

- `GET /orders` is protected by JWT authentication
- Role-based access is enforced in the orders and admin modules
- Seed data is intended for local development and review only
- The backend and frontend are designed to run together with the frontend targeting the API base URL above
