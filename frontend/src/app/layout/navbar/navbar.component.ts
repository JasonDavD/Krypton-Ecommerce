import { Component, ElementRef, inject, signal, ViewChild } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { AuthService } from '../../core/auth/auth.service';
import { ComingSoonService } from '../../core/coming-soon/coming-soon.service';

/**
 * Storefront chrome: announcement bar + sticky navbar (Krypton brand).
 * Replaces the placeholder dark/magenta navbar. Keeps the auth-aware behaviour
 * (login/register vs. user + logout). The search reveals an animated input;
 * Enter navigates to /catalogo?q=term (the catalog reads it and filters by name).
 */
@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, LucideAngularModule],
  styles: [`
    :host { display: block; }
    lucide-icon { display: inline-flex; align-items: center; }
    .ann { display:flex; align-items:center; justify-content:center; gap:10px; height:40px;
           background:linear-gradient(90deg, var(--kr-orange-500), var(--kr-redorange-500));
           color:#fff; font-size:13.5px; font-weight:600; padding:0 16px; text-align:center; }
    .bar { position:sticky; top:0; z-index:40; }
    .nav { display:flex; align-items:center; justify-content:space-between; gap:24px; height:68px;
           padding:0 32px; background:rgba(255,255,255,0.92); backdrop-filter:blur(12px);
           border-bottom:1px solid var(--border-subtle); }
    .nav__logo { height:28px; width:auto; display:block; }
    .links { display:flex; align-items:center; gap:30px; }
    .link { position:relative; font-size:14.5px; font-weight:600; color:var(--text-body); text-decoration:none; cursor:pointer; background:none; border:none; font-family:var(--font-sans); padding:0; }
    .link::after { content:''; position:absolute; left:0; right:0; bottom:-6px; height:2px; background:var(--kr-blue-500);
                   border-radius:2px; transform:scaleX(0); transform-origin:left; transition:transform 200ms var(--ease-out); }
    .link:hover::after { transform:scaleX(1); }
    .link:hover { color:var(--kr-navy-800); }
    .actions { display:flex; align-items:center; gap:14px; }
    .icon-btn { display:inline-flex; align-items:center; justify-content:center; width:42px; height:42px; flex:none;
                border:1px solid var(--border-subtle); border-radius:12px; background:#fff; color:var(--kr-navy-800);
                cursor:pointer; text-decoration:none; transition:background 160ms ease, color 160ms ease; }
    .icon-btn--active { background:var(--kr-navy-800); color:#fff; }
    .search { width:250px; height:42px; flex:none; box-sizing:border-box; padding:0 16px; border:1.5px solid var(--border-subtle);
              border-radius:12px; background:var(--kr-gray-50); font-family:var(--font-sans); font-size:14.5px;
              color:var(--text-strong); outline:none; transform-origin:right center; }
    .search:focus { border-color:var(--kr-blue-600); background:#fff; box-shadow:0 0 0 3px rgba(26,125,215,0.16); }
    .login { font-size:14.5px; font-weight:600; color:var(--kr-navy-800); text-decoration:none; padding:0 6px; cursor:pointer;
             background:none; border:none; font-family:var(--font-sans); }
    .cta { display:inline-flex; align-items:center; height:42px; padding:0 20px; border-radius:999px;
           background:var(--kr-orange-500); color:#fff; font-size:14px; font-weight:700; text-decoration:none;
           box-shadow:0 10px 24px -10px rgba(243,116,2,0.6); transition:filter 120ms ease, box-shadow 200ms ease, transform 120ms ease; }
    .cta:hover { filter:brightness(0.96); box-shadow:0 18px 40px -10px rgba(243,116,2,0.72); }
    .cta:active { transform:scale(0.985); }
    .user { font-size:13.5px; color:var(--text-muted); max-width:180px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
  `],
  template: `
    <div class="ann">
      <lucide-icon name="truck" [size]="16"></lucide-icon>
      Envío gratis en compras desde S/ 199 — solo esta semana
    </div>

    <div class="bar">
      <header class="nav">
        <a routerLink="/" aria-label="Krypton inicio"><img class="nav__logo" src="/brand/Krypton-navy.svg" alt="Krypton"></a>

        @if (!searchOpen()) {
          <nav class="links">
            <a routerLink="/catalogo" class="link">Catálogo</a>
            <a routerLink="/catalogo" class="link">Categorías</a>
            <button type="button" class="link" (click)="comingSoon.show('Ofertas')">Ofertas</button>
            @if (auth.isAuthenticated()) { <a routerLink="/pedidos" class="link">Mis pedidos</a> }
          </nav>
        }

        <div class="actions">
          @if (searchOpen()) {
            <input #search class="search" [value]="query()" (input)="query.set($any($event.target).value)"
                   (keydown)="onKey($event)" placeholder="Buscar productos por nombre…">
          }
          <button class="icon-btn" [class.icon-btn--active]="searchOpen()" (click)="toggleSearch()" aria-label="Buscar">
            @if (!searchOpen()) {
              <svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            } @else {
              <svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            }
          </button>

          <a routerLink="/carrito" class="icon-btn" aria-label="Carrito">
            <lucide-icon name="shopping-cart" [size]="19"></lucide-icon>
          </a>

          @if (!auth.isAuthenticated()) {
            <a routerLink="/cuenta/ingresar" class="login">Iniciar sesión</a>
            <a routerLink="/cuenta/registro" class="cta">Crear cuenta</a>
          } @else {
            <span class="user">{{ auth.currentUser()?.email }}</span>
            @if (auth.isAdmin()) { <a routerLink="/admin" class="link">Admin</a> }
            <button class="login nav__logout" (click)="auth.logout()">Cerrar sesión</button>
          }
        </div>
      </header>
    </div>
  `,
})
export class NavbarComponent {
  protected readonly auth = inject(AuthService);
  protected readonly comingSoon = inject(ComingSoonService);
  private readonly router = inject(Router);

  readonly searchOpen = signal(false);
  readonly query = signal('');

  @ViewChild('search') searchInput?: ElementRef<HTMLInputElement>;

  toggleSearch(): void {
    const next = !this.searchOpen();
    this.searchOpen.set(next);
    if (next) {
      // wait for @if to render the input, then focus + animate it open
      setTimeout(() => {
        const el = this.searchInput?.nativeElement;
        if (!el) return;
        el.focus();
        el.animate(
          [{ transform: 'scaleX(0.25)', opacity: 0.35 }, { transform: 'scaleX(1)', opacity: 1 }],
          { duration: 300, easing: 'cubic-bezier(0.22,1,0.36,1)' },
        );
      });
    }
  }

  onKey(e: KeyboardEvent): void {
    if (e.key === 'Escape') this.searchOpen.set(false);
    if (e.key === 'Enter') this.submitSearch();
  }

  /** Navigate to the catalog with the search term; the catalog filters by name. */
  submitSearch(): void {
    const q = this.query().trim();
    this.router.navigate(['/catalogo'], { queryParams: q ? { q } : {} });
    this.searchOpen.set(false);
  }
}
