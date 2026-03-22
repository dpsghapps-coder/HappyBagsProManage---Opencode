# AGENT.MD - Happy Bags Pro Manager

## Project Overview

**Paper Bag Business Manager** is a centralized administrative tool for Happy Bags, a small-scale paper bag manufacturer. It streamlines operations from client onboarding and product cataloging to production tracking and financial document generation.

- **Company:** Happy Bags
- **Platform:** Web Application

## Tech Stack

- **Frontend:** React 19 + TypeScript + Vite
- **UI:** Tailwind CSS v4 + Shadcn/ui
- **Backend:** Laravel 12 (PHP 8.4) + Inertia.js + Laravel Breeze
- **Database:** MySQL (SQLite as backup)
- **PDF Generation:** Client-side or server-side library (e.g., jspdf, react-pdf)

## Expected Folder Structure

```
├── app/
│   ├── Http/
│   │   ├── Controllers/
│   │   └── Middleware/
│   ├── Models/
│   └── Providers/
├── database/
│   ├── migrations/
│   └── seeders/
├── resources/
│   └── js/
│       ├── components/
│       ├── pages/
│       ├── layouts/
│       ├── hooks/
│       └── types/
├── routes/
└── vite.config.ts
```

## Database Schema

### Users
- `id` (bigint, auto-increment)
- `name` (string)
- `email` (string, unique)
- `password` (string, hashed)
- `role` (enum: manager, sales_rep, client)
- `client_id` (nullable, bigint - for client role)
- `timestamps`

### Products
- `id` (bigint, auto-increment)
- `product_name` (string)
- `unit_price` (decimal)
- `category` (string: Tote, Box, Paper Bag)
- `dimension` (string: L x B x H)
- `other_details` (string: handle type)
- `timestamps`

### Clients
- `id` (bigint, auto-increment)
- `client_name` (string)
- `mobile_no1` (string)
- `mobile_no2` (string, nullable)
- `delivery_address` (text)
- `timestamps`

### Orders
- `id` (bigint, auto-increment)
- `order_id` (string, format: HPBG-YYYY-XXXX)
- `client_id` (bigint, foreign key)
- `items` (JSON: [{product_id, qty, line_total}])
- `subtotal` (decimal)
- `total` (decimal)
- `status` (enum: Quote, Invoice Created, Payment Received, Work In Progress, Work Completed, Delivered)
- `is_vat` (boolean)
- `delivery_date` (date)
- `order_created_at` (timestamp)
- `order_updated_at` (timestamp)
- `timestamps`

## UI/UX Guidelines

### Design System
- **Aesthetic:** Professional glassmorphic design suitable for official environment
- **Spacing:** Generous use of whitespace
- **Responsive:** Mobile-friendly for staff on phones

### Desktop Layout (>768px)
- **Left Section:** Company logo and name
- **Middle Section:** Search bar
- **Right Section:** Notification bell (with badge), Help icon, User profile (avatar, name, logout)
- **Navigation:** Sidebar

### Mobile Layout (<768px)
- Simple logo + hamburger menu trigger
- Sidebar reflows into bottom navigation bar with icons for thumb access

### Login Page
- Clean, frictionless design
- "Remember Me" functionality
- Show/Hide password toggle
- Password recovery system
- Clear validation messages

## Implementation Priority

1. **User Management** - Auth, RBAC (manager, sales_rep, client), profile management
2. **Product Management** - CRUD for bag types (SOS, Flat-handle, Twisted-handle)
3. **Client Management** - Contact info, delivery addresses, order history
4. **Orders & Workflow** - Order entry, workflow stages, VAT calculation (20%)
5. **Dashboard** - Live status tracking, charts, alerts, quick actions
6. **PDF Generation** - Proforma, Invoice, Receipt templates

## Order Workflow

```
Quote/Proforma → Invoice Issued → Payment Received → Production → Delivered → Completed
```

## Role-Based Access Control

| Role        | Permissions                              |
|-------------|------------------------------------------|
| manager     | Full access to all modules, reporting   |
| sales_rep   | Clients, Products, Order creation       |
| client      | View own orders, invoices, receipts     |

## Commands

### Frontend (React/Vite)
```bash
npm run dev          # Start development server
npm run build        # Production build
npm run lint         # Run ESLint
npm run typecheck    # TypeScript type checking
npm run preview      # Preview production build
```

### Backend (Laravel)
```bash
php artisan migrate          # Run migrations
php artisan db:seed         # Seed database
php artisan serve            # Start Laravel server
php artisan make:model       # Create new model
php artisan make:controller  # Create new controller
```

## Coding Conventions

### React/TypeScript
- Use TypeScript strict mode
- Component file naming: `PascalCase` (e.g., `UserProfile.tsx`)
- Custom hooks: `camelCase` with `use` prefix (e.g., `useAuth.ts`)
- Types/Interfaces: Define in `/resources/js/types/`
- Use Shadcn/ui components from the library

### Laravel
- Follow PSR-12 coding standards
- Use Eloquent ORM for database operations
- Resource controllers for CRUD operations
- Form requests for validation

### General
- Use meaningful variable and function names
- Add TypeScript types for all function parameters and return values
- Comment complex business logic
- Keep components small and focused

## IMPORTANT REMINDERS

### SQLite Decimal Handling
**ALWAYS use `float` cast instead of `decimal:2` for SQLite compatibility.**
SQLite returns decimal values as strings, which breaks JavaScript `.toFixed()` calls.
```php
// WRONG - breaks with SQLite
protected $casts = ['price' => 'decimal:2'];

// CORRECT - works with SQLite
protected $casts = ['price' => 'float'];
```

### JSON Array Handling
When passing JSON columns (like `items`) to Inertia, always transform them explicitly:
```php
// In controller, always transform JSON fields:
$orders = Order::with('client')->get()->map(function ($order) {
    return [
        'items' => is_array($order->items) ? $order->items : json_decode($order->items, true),
        'total' => (float) $order->total,
        // ... other fields
    ];
});
```

### Laravel Casts Not Working with Inertia
Laravel model casts may not serialize properly through Inertia. Always explicitly cast values in controllers:
- Decimal/float fields: `(float) $order->total`
- Boolean fields: `(bool) $order->is_vat`
- JSON fields: `is_array($order->items) ? $order->items : json_decode($order->items, true)`
- Use environment variables for sensitive data
