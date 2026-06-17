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
 *   - /cart, /orders  → authGuard  (any authenticated user)
 *   - /admin, /reports → adminGuard (ADMIN role only)
 *   - /catalog, /auth/** → public
 */
export const routes: Routes = [
  {
    path: '',
    redirectTo: 'catalog',
    pathMatch: 'full',
  },

  // --- Public routes ---
  {
    path: 'catalog',
    loadComponent: () =>
      import('./features/catalog/catalog.component').then((m) => m.CatalogComponent),
  },
  {
    path: 'catalog/:id',
    loadComponent: () =>
      import('./features/catalog/product-detail.component').then((m) => m.ProductDetailComponent),
  },

  // --- Auth routes (stub) ---
  {
    path: 'auth',
    children: [
      {
        path: 'login',
        loadComponent: () =>
          import('./features/auth/login.component').then((m) => m.LoginComponent),
      },
      {
        path: 'register',
        loadComponent: () =>
          import('./features/auth/register.component').then((m) => m.RegisterComponent),
      },
      {
        path: '',
        redirectTo: 'login',
        pathMatch: 'full',
      },
    ],
  },

  // --- Authenticated routes ---
  {
    path: 'cart',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/cart/cart.component').then((m) => m.CartComponent),
  },
  {
    path: 'orders',
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
    path: 'reports',
    canActivate: [adminGuard],
    loadComponent: () =>
      import('./features/reports/reports.component').then((m) => m.ReportsComponent),
  },

  // --- Fallback ---
  {
    path: '**',
    redirectTo: 'catalog',
  },
];
