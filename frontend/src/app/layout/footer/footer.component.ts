import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ComingSoonService } from '../../core/coming-soon/coming-soon.service';

/**
 * Krypton footer — navy field with link columns + brand mark.
 * Replaces the placeholder dark/magenta footer. Links without a real page yet
 * (social, soporte, ofertas) open the "Pendiente por implementar" card.
 */
@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink],
  styles: [`
    .footer { background:#03275a; color:#fff; font-family:var(--font-sans); }
    .top { max-width:1200px; margin:0 auto; padding:60px 32px 32px; display:grid; grid-template-columns:1.6fr 1fr 1fr 1fr; gap:40px; }
    .logo { height:32px; width:auto; display:block; margin-bottom:18px; }
    .blurb { font-size:14px; line-height:1.6; color:rgba(255,255,255,0.6); margin:0 0 20px; max-width:300px; }
    .social { display:flex; gap:10px; }
    .social a { display:inline-flex; align-items:center; justify-content:center; width:40px; height:40px; border-radius:11px;
                background:rgba(255,255,255,0.08); color:#fff; text-decoration:none; cursor:pointer; }
    .col-title { font-size:13px; font-weight:700; letter-spacing:0.1em; text-transform:uppercase; color:rgba(255,255,255,0.5); margin-bottom:16px; }
    .col-links { display:flex; flex-direction:column; gap:11px; }
    .col-links a { font-size:14px; color:rgba(255,255,255,0.74); text-decoration:none; transition:color 140ms ease; cursor:pointer; }
    .col-links a:hover { color:#fff; }
    .bottom { border-top:1px solid rgba(255,255,255,0.12); }
    .bottom-inner { max-width:1200px; margin:0 auto; padding:20px 32px; display:flex; align-items:center; justify-content:space-between; gap:16px; flex-wrap:wrap; }
    .copy { font-size:13px; color:rgba(255,255,255,0.55); }
    .secure { display:inline-flex; align-items:center; gap:8px; font-size:13px; color:rgba(255,255,255,0.55); }
    @media (max-width:780px){ .top { grid-template-columns:1fr 1fr; } }
  `],
  template: `
    <footer class="footer">
      <div class="top">
        <div>
          <a routerLink="/"><img class="logo" src="/brand/Krypton-white.svg" alt="Krypton"></a>
          <p class="blurb">Tu tienda de tecnología en el Perú. Lo último en laptops, componentes y audio con envío express.</p>
          <div class="social">
            <a (click)="comingSoon.show('Instagram')" aria-label="Instagram"><svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="5"></rect><circle cx="12" cy="12" r="4"></circle><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"></circle></svg></a>
            <a (click)="comingSoon.show('Facebook')" aria-label="Facebook"><svg viewBox="0 0 24 24" width="19" height="19" fill="currentColor"><path d="M22 12a10 10 0 1 0-11.56 9.88v-6.99H7.9V12h2.54V9.8c0-2.5 1.49-3.89 3.78-3.89 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56V12h2.78l-.44 2.89h-2.34v6.99A10 10 0 0 0 22 12z"></path></svg></a>
            <a (click)="comingSoon.show('YouTube')" aria-label="YouTube"><svg viewBox="0 0 24 24" width="19" height="19" fill="currentColor"><path d="M21.58 7.19a2.5 2.5 0 0 0-1.76-1.77C18.25 5 12 5 12 5s-6.25 0-7.82.42A2.5 2.5 0 0 0 2.42 7.2 26 26 0 0 0 2 12a26 26 0 0 0 .42 4.81 2.5 2.5 0 0 0 1.76 1.77C5.75 19 12 19 12 19s6.25 0 7.82-.42a2.5 2.5 0 0 0 1.76-1.77A26 26 0 0 0 22 12a26 26 0 0 0-.42-4.81zM10 15V9l5.2 3-5.2 3z"></path></svg></a>
          </div>
        </div>
        <div>
          <div class="col-title">Tienda</div>
          <div class="col-links">
            <a routerLink="/catalogo">Catálogo</a>
            <a routerLink="/catalogo">Categorías</a>
            <a (click)="comingSoon.show('Ofertas')">Ofertas</a>
            <a routerLink="/carrito">Carrito</a>
          </div>
        </div>
        <div>
          <div class="col-title">Cuenta</div>
          <div class="col-links">
            <a routerLink="/cuenta/ingresar">Iniciar sesión</a>
            <a routerLink="/cuenta/registro">Crear cuenta</a>
            <a routerLink="/pedidos">Mis pedidos</a>
          </div>
        </div>
        <div>
          <div class="col-title">Soporte</div>
          <div class="col-links">
            <a (click)="comingSoon.show('Centro de ayuda')">Centro de ayuda</a>
            <a (click)="comingSoon.show('Envíos y entregas')">Envíos y entregas</a>
            <a (click)="comingSoon.show('Garantía')">Garantía</a>
          </div>
        </div>
      </div>
      <div class="bottom">
        <div class="bottom-inner">
          <span class="copy">© {{ year }} Krypton E-commerce. Todos los derechos reservados.</span>
          <span class="secure">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#f2b809" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path><path d="m9 12 2 2 4-4"></path></svg>
            Pago 100% seguro
          </span>
        </div>
      </div>
    </footer>
  `,
})
export class FooterComponent {
  protected readonly comingSoon = inject(ComingSoonService);
  readonly year = new Date().getFullYear();
}
