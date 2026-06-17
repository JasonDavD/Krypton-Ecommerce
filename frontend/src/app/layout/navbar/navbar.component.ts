import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink],
  template: `
    <nav class="navbar">
      <a routerLink="/" class="navbar__brand">Krypton</a>

      <div class="navbar__links">
        @if (!authService.isAuthenticated()) {
          <a routerLink="/cuenta/ingresar" class="navbar__link">Iniciar sesión</a>
          <a routerLink="/cuenta/registro" class="navbar__link">Registrarse</a>
        } @else {
          <span class="navbar__user">{{ authService.currentUser()?.email }}</span>
          <a routerLink="/catalogo" class="navbar__link">Catálogo</a>
          <a routerLink="/carrito" class="navbar__link">Carrito</a>
          <a routerLink="/pedidos" class="navbar__link">Mis pedidos</a>
          @if (authService.isAdmin()) {
            <a routerLink="/admin" class="navbar__link navbar__link--admin">Admin</a>
          }
          <button class="navbar__logout" (click)="logout()">Cerrar sesión</button>
        }
      </div>
    </nav>
  `,
  styles: [`
    .navbar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      background-color: #1a1a2e;
      padding: 0.75rem 1.5rem;
      border-bottom: 1px solid #2a2a4e;
    }

    .navbar__brand {
      color: #e040fb;
      font-size: 1.25rem;
      font-weight: 700;
      text-decoration: none;
      letter-spacing: 0.05em;
    }

    .navbar__links {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .navbar__link {
      color: #c0c0d0;
      text-decoration: none;
      font-size: 0.9rem;
      transition: color 0.2s;
    }

    .navbar__link:hover {
      color: #e040fb;
    }

    .navbar__link--admin {
      color: #ff9800;
    }

    .navbar__user {
      color: #80cbc4;
      font-size: 0.875rem;
    }

    .navbar__logout {
      background: transparent;
      border: 1px solid #c0c0d0;
      color: #c0c0d0;
      padding: 0.25rem 0.75rem;
      border-radius: 0.25rem;
      cursor: pointer;
      font-size: 0.875rem;
      transition: all 0.2s;
    }

    .navbar__logout:hover {
      border-color: #e040fb;
      color: #e040fb;
    }
  `],
})
export class NavbarComponent {
  protected readonly authService = inject(AuthService);

  logout(): void {
    this.authService.logout();
  }
}
