import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { adminGuard } from './core/guards/admin.guard';
import { MainLayoutComponent } from './layout/main-layout.component';

/**
 * Two top-level shells:
 *   - /cuenta/**         → bare (immersive auth, no navbar/footer)
 *   - everything else    → MainLayoutComponent (navbar + footer chrome)
 *
 * Guard policy:
 *   - /carrito, /pedidos → authGuard  (any authenticated user)
 *   - /admin, /reportes  → adminGuard (ADMIN role only)
 *   - /catalogo, /cuenta/** → public
 */
export const routes: Routes = [
  // --- Auth (sin chrome) ---
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

  // --- Tienda (con navbar + footer) ---
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./features/home/home.component').then((m) => m.HomeComponent),
      },
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
      {
        path: '**',
        redirectTo: 'catalogo',
      },
    ],
  },
];
