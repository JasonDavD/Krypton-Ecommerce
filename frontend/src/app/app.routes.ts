import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { adminGuard } from './core/guards/admin.guard';

/**
 * Top-level route scaffold.
 *
 * Each lazy stub uses a dedicated component file (one named export per file)
 * so downstream feature changes can replace the loadComponent target without
 * touching any sibling route declarations.
 *
 * Guard policy:
 *   - /carrito, /pedidos  → authGuard  (any authenticated user)
 *   - /admin, /reportes → adminGuard (ADMIN role only)
 *   - /catalogo, /cuenta/** → public
 */
export const routes: Routes = [
  {
    path: '',
    redirectTo: 'catalogo',
    pathMatch: 'full',
  },

  // --- Public routes ---
  {
    path: 'catalogo',
    loadComponent: () =>
      import('./features/catalog/catalog.component').then((m) => m.CatalogComponent),
  },
  {
    path: 'catalogo/:id',
    loadComponent: () =>
      import('./features/catalog/product-detail.component').then((m) => m.ProductDetailComponent),
  },

  // --- Auth routes (stub) ---
  {
    path: 'cuenta',
    children: [
      {
        path: 'ingresar',
        loadComponent: () =>
          import('./features/auth/login.component').then((m) => m.LoginComponent),
      },
      {
        path: 'registro',
        loadComponent: () =>
          import('./features/auth/register.component').then((m) => m.RegisterComponent),
      },
      {
        path: '',
        redirectTo: 'ingresar',
        pathMatch: 'full',
      },
    ],
  },

  // --- Authenticated routes ---
  {
    path: 'carrito',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/cart/cart.component').then((m) => m.CartComponent),
  },
  {
    path: 'pedidos',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/orders/orders.component').then((m) => m.OrdersComponent),
  },

  // --- Admin-only routes ---
  {
    path: 'admin',
    canActivate: [adminGuard],
    loadComponent: () =>
      import('./features/admin/admin.component').then((m) => m.AdminComponent),
  },
  {
    path: 'reportes',
    canActivate: [adminGuard],
    loadComponent: () =>
      import('./features/reports/reports.component').then((m) => m.ReportsComponent),
  },

  // --- Fallback ---
  {
    path: '**',
    redirectTo: 'catalogo',
  },
];
