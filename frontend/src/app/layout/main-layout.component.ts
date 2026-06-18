import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './navbar/navbar.component';
import { FooterComponent } from './footer/footer.component';

/**
 * Storefront chrome: navbar + footer around the routed content.
 * Wraps only the tienda routes (catálogo, carrito, pedidos, admin…).
 * Auth routes render bare (immersive full-screen layout) — they are NOT
 * children of this layout.
 */
@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, FooterComponent],
  template: `
    <app-navbar />
    <main class="main-content">
      <router-outlet />
    </main>
    <app-footer />
  `,
  styles: [`
    :host {
      display: flex;
      flex-direction: column;
      min-height: 100vh;
    }

    /* No padding: each view manages its own (Home is full-bleed; Catálogo has its own container). */
    .main-content {
      flex: 1;
      padding: 0;
    }
  `],
})
export class MainLayoutComponent {}
