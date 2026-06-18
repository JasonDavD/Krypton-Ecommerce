import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { ProductService } from '../catalog/product.service';
import { ComingSoonService } from '../../core/coming-soon/coming-soon.service';
import { ProductResponse, PLACEHOLDER_IMAGE } from '../../models/product.model';

interface Cat { name: string; icon: string; }
interface Perk { icon: string; title: string; desc: string; }

/**
 * Home / landing (Krypton). Renders INSIDE MainLayout (brand navbar + footer).
 * Featured products are REAL data (ProductService.featured); categories/perks/
 * promo are curated marketing content. Icons use lucide-angular.
 */
@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink, LucideAngularModule],
  styles: [`
    :host { display:block; font-family:var(--font-sans); color:var(--text-strong); background:#eef1f6; }
    lucide-icon { display:inline-flex; align-items:center; }
    .wrap { max-width:1200px; margin:0 auto; padding:0 32px; }
    .eyebrow { font-size:12px; font-weight:700; letter-spacing:0.14em; text-transform:uppercase; color:var(--kr-blue-600); }
    .sec-head { display:flex; align-items:flex-end; justify-content:space-between; gap:16px; margin-bottom:28px; }
    .sec-title { font-family:var(--font-display); font-weight:800; font-size:34px; letter-spacing:-0.02em; color:var(--text-strong); margin:8px 0 0; }
    .see-all { font-size:14.5px; font-weight:700; color:var(--text-link); text-decoration:none; white-space:nowrap; }
    .muted { color:var(--text-muted); font-size:15px; }

    /* hero */
    .hero { position:relative; overflow:hidden; background:radial-gradient(130% 120% at 82% -10%, #0a3a7a 0%, #03275a 46%, #021a3d 100%); }
    .hero__img { position:absolute; inset:0; width:100%; height:100%; object-fit:cover; mix-blend-mode:multiply; opacity:0.5; pointer-events:none; }
    .hero__tint { position:absolute; inset:0; background:rgba(2,18,55,0.42); pointer-events:none; }
    .orb { position:absolute; border-radius:50%; filter:blur(8px); pointer-events:none; }
    .hero__inner { position:relative; z-index:2; max-width:1200px; margin:0 auto; padding:88px 32px 96px; }
    .hero__content { max-width:620px; color:#fff; }
    .hero__content > * { animation:krRise 620ms var(--ease-out) both; }
    .hero__content > *:nth-child(2){ animation-delay:90ms; }
    .hero__content > *:nth-child(3){ animation-delay:170ms; }
    .hero__content > *:nth-child(4){ animation-delay:250ms; }
    .hero__content > *:nth-child(5){ animation-delay:330ms; }
    .hero__eyebrow { display:inline-flex; align-items:center; gap:8px; font-size:12px; font-weight:700; letter-spacing:0.16em; text-transform:uppercase; color:var(--kr-blue-500); margin-bottom:22px; }
    .hero__title { color:#fff; font-family:var(--font-display); font-weight:900; font-style:italic; font-size:68px; line-height:0.96; letter-spacing:-0.028em; margin:0 0 22px; text-shadow:0 2px 28px rgba(2,18,55,0.5); }
    .hero__title .accent { color:var(--kr-orange-500); }
    .hero__sub { font-size:18px; line-height:1.6; color:rgba(255,255,255,0.72); margin:0 0 36px; max-width:480px; }
    .hero__ctas { display:flex; gap:14px; flex-wrap:wrap; }
    .hero__stats { display:flex; gap:30px; margin-top:44px; flex-wrap:wrap; }
    .stat-num { font-family:var(--font-display); font-weight:800; font-size:26px; color:#fff; }
    .stat-lbl { font-size:13px; color:rgba(255,255,255,0.6); }
    .stat-div { width:1px; background:rgba(255,255,255,0.18); }

    .cta-pri { display:inline-flex; align-items:center; gap:10px; height:56px; padding:0 28px; border:none; border-radius:999px;
               background:linear-gradient(120deg, var(--kr-orange-500), var(--kr-redorange-500)); color:#fff; font-size:16px;
               font-weight:700; font-family:var(--font-sans); cursor:pointer; text-decoration:none; box-shadow:0 16px 36px -10px rgba(243,116,2,0.62);
               transition:filter 120ms ease, box-shadow 200ms ease, transform 120ms ease; }
    .cta-pri:hover { filter:brightness(0.96); box-shadow:0 18px 40px -10px rgba(243,116,2,0.72); }
    .cta-pri:active { transform:scale(0.985); }
    .ghost { display:inline-flex; align-items:center; gap:9px; height:56px; padding:0 26px; border-radius:999px;
             background:rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.28); color:#fff; font-size:16px;
             font-weight:600; font-family:var(--font-sans); cursor:pointer; text-decoration:none; transition:background 160ms ease, border-color 160ms ease; }
    .ghost:hover { background:rgba(255,255,255,0.12); border-color:rgba(255,255,255,0.5); }

    /* categories */
    .cat-grid { display:grid; grid-template-columns:repeat(6, 1fr); gap:16px; }
    .cat { display:flex; flex-direction:column; align-items:center; gap:14px; padding:26px 14px; background:#fff;
           border:1px solid var(--border-subtle); border-radius:18px; text-decoration:none;
           transition:transform 200ms var(--ease-out), box-shadow 200ms ease, border-color 200ms ease; }
    .cat:hover { transform:translateY(-4px); box-shadow:0 18px 36px -16px rgba(3,39,90,0.32); border-color:var(--kr-blue-500); }
    .cat__ic { display:inline-flex; align-items:center; justify-content:center; width:58px; height:58px; border-radius:16px;
               background:var(--kr-gray-100); color:var(--kr-navy-800); transition:background 200ms ease, color 200ms ease; }
    .cat:hover .cat__ic { background:var(--kr-blue-600); color:#fff; }
    .cat__name { font-size:14.5px; font-weight:700; color:var(--text-strong); }

    /* products */
    .prod-grid { display:grid; grid-template-columns:repeat(4, 1fr); gap:22px; }
    .card { display:flex; flex-direction:column; background:#fff; border:1px solid var(--border-subtle); border-radius:12px;
            overflow:hidden; transition:box-shadow 200ms var(--ease-out), transform 200ms var(--ease-out), border-color 200ms var(--ease-out); }
    .card:hover { box-shadow:0 18px 36px -18px rgba(3,39,90,0.3); transform:translateY(-3px); border-color:var(--kr-blue-500); }
    .card__media { position:relative; aspect-ratio:1/1; display:flex; align-items:center; justify-content:center; overflow:hidden;
                   background:linear-gradient(160deg, var(--kr-gray-50), #e7f0fb); }
    .card__media img { width:100%; height:100%; object-fit:contain; padding:16px; box-sizing:border-box; }
    .card__body { padding:16px; display:flex; flex-direction:column; gap:8px; flex:1; }
    .card__cat { font-size:11px; font-weight:700; letter-spacing:0.1em; text-transform:uppercase; color:var(--kr-blue-600); }
    .card__name-link { text-decoration:none; }
    .card__name { margin:0; font-size:15px; font-weight:600; color:var(--text-strong); line-height:1.3;
                  display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden; min-height:39px; }
    .card__foot { margin-top:auto; display:flex; align-items:flex-end; justify-content:space-between; gap:8px; padding-top:6px; }
    .card__price { font-size:19px; font-weight:800; color:var(--text-strong); letter-spacing:-0.01em; }
    .card__add { width:40px; height:40px; flex:none; display:inline-flex; align-items:center; justify-content:center; border-radius:10px;
                 border:none; cursor:pointer; background:var(--kr-orange-500); color:#fff; box-shadow:0 10px 20px -8px rgba(243,116,2,0.6);
                 transition:transform 120ms ease, filter 120ms ease; }
    .card__add:hover { filter:brightness(0.96); transform:scale(1.06); }

    /* promo */
    .promo { position:relative; overflow:hidden; border-radius:28px; background:radial-gradient(120% 160% at 12% 10%, #0a3a7a 0%, #03275a 50%, #021a3d 100%);
             padding:54px 56px; display:flex; align-items:center; justify-content:space-between; gap:32px; flex-wrap:wrap; }
    .promo__eyebrow { display:inline-flex; align-items:center; gap:8px; font-size:12px; font-weight:700; letter-spacing:0.14em;
                      text-transform:uppercase; color:var(--kr-yellow-500); margin-bottom:16px; }
    .promo__title { font-family:var(--font-display); font-weight:900; font-style:italic; font-size:40px; line-height:1.02;
                    letter-spacing:-0.025em; margin:0 0 14px; color:#fff; }
    .promo__title .accent { color:var(--kr-orange-500); }
    .promo__sub { font-size:16px; color:rgba(255,255,255,0.7); margin:0; max-width:460px; }

    /* trust */
    .trust-grid { display:grid; grid-template-columns:repeat(4, 1fr); gap:20px; }
    .perk { display:flex; align-items:center; gap:14px; padding:22px; background:#fff; border:1px solid var(--border-subtle); border-radius:16px; }
    .perk__ic { display:inline-flex; align-items:center; justify-content:center; width:48px; height:48px; flex:none; border-radius:13px;
                background:var(--kr-gray-100); color:var(--kr-blue-600); }
    .perk__title { font-size:15px; font-weight:700; color:var(--text-strong); }
    .perk__desc { font-size:13px; color:var(--text-muted); margin-top:2px; }

    @media (max-width:980px){ .cat-grid { grid-template-columns:repeat(3,1fr); } .prod-grid, .trust-grid { grid-template-columns:repeat(2,1fr); } .hero__title { font-size:48px; } }

    @keyframes krFloat  { 0%,100% { transform: translate(0,0); } 50% { transform: translate(0,-26px); } }
    @keyframes krFloat2 { 0%,100% { transform: translate(0,0); } 50% { transform: translate(0, 22px); } }
    @keyframes krRise   { from { opacity:0; transform: translateY(16px); } to { opacity:1; transform: translateY(0); } }
    @media (prefers-reduced-motion: reduce){ .hero__content > *, .orb { animation: none !important; } }
  `],
  template: `
    <!-- HERO -->
    <section class="hero">
      <img class="hero__img" src="/bg-login.webp" alt="">
      <div class="hero__tint"></div>
      <div class="orb" style="top:-160px; right:-120px; width:520px; height:520px; background:radial-gradient(circle, rgba(243,116,2,0.34), rgba(3,39,90,0) 64%); animation:krFloat 12s ease-in-out infinite;"></div>
      <div class="orb" style="bottom:-200px; left:-120px; width:540px; height:540px; background:radial-gradient(circle, rgba(26,125,215,0.40), rgba(3,39,90,0) 66%); animation:krFloat2 14s ease-in-out infinite;"></div>
      <div class="hero__inner">
        <div class="hero__content">
          <span class="hero__eyebrow"><lucide-icon name="zap" [size]="15" style="color:var(--kr-yellow-500);"></lucide-icon> Nueva temporada tech</span>
          <h1 class="hero__title"><span>Tecnología<br>que&ngsp;</span><span class="accent">enciende.</span></h1>
          <p class="hero__sub">Laptops, componentes y audio de última generación. Arma tu setup con lo mejor de la tecnología — envíos a todo el Perú en 24 horas.</p>
          <div class="hero__ctas">
            <a routerLink="/catalogo" class="cta-pri">Explorar el catálogo <lucide-icon name="arrow-right" [size]="20"></lucide-icon></a>
            <button type="button" class="ghost" (click)="comingSoon.show('Ofertas')"><lucide-icon name="tag" [size]="19" style="color:var(--kr-yellow-500);"></lucide-icon> Ver ofertas</button>
          </div>
          <div class="hero__stats">
            <div><div class="stat-num">+1,200</div><div class="stat-lbl">productos en stock</div></div>
            <div class="stat-div"></div>
            <div><div class="stat-num">24h</div><div class="stat-lbl">entrega express</div></div>
            <div class="stat-div"></div>
            <div><div class="stat-num" style="display:inline-flex;align-items:baseline;">4.8<span style="margin-left:5px;color:var(--kr-yellow-500);">★</span></div><div class="stat-lbl">valoración media</div></div>
          </div>
        </div>
      </div>
    </section>

    <!-- CATEGORIES -->
    <section class="wrap" style="padding-top:64px; padding-bottom:8px;">
      <div class="sec-head">
        <div><span class="eyebrow">Explora por categoría</span><h2 class="sec-title">¿Qué estás armando hoy?</h2></div>
        <a routerLink="/catalogo" class="see-all">Ver todo →</a>
      </div>
      <div class="cat-grid">
        @for (cat of categories; track cat.name) {
          <a routerLink="/catalogo" class="cat">
            <span class="cat__ic"><lucide-icon [name]="cat.icon" [size]="26"></lucide-icon></span>
            <span class="cat__name">{{ cat.name }}</span>
          </a>
        }
      </div>
    </section>

    <!-- FEATURED (real data) -->
    <section class="wrap" style="padding-top:56px; padding-bottom:8px;">
      <div class="sec-head">
        <div><span class="eyebrow">Lo más nuevo</span><h2 class="sec-title">Destacados del catálogo</h2></div>
        <a routerLink="/catalogo" class="see-all">Ver catálogo completo →</a>
      </div>

      @if (loadingProducts()) {
        <p class="muted">Cargando destacados…</p>
      } @else if (products().length === 0) {
        <p class="muted">Aún no hay productos para mostrar.</p>
      } @else {
        <div class="prod-grid">
          @for (p of products(); track p.id) {
            <article class="card">
              <a [routerLink]="['/catalogo', p.id]" class="card__media">
                <img [src]="p.imageUrl ?? PLACEHOLDER_IMAGE" [alt]="p.name">
              </a>
              <div class="card__body">
                <span class="card__cat">{{ p.categoryName }}</span>
                <a [routerLink]="['/catalogo', p.id]" class="card__name-link"><h3 class="card__name">{{ p.name }}</h3></a>
                <div class="card__foot">
                  <span class="card__price">{{ p.price | currency:'PEN':'symbol':'1.2-2' }}</span>
                  <button class="card__add" type="button" aria-label="Agregar al carrito" (click)="comingSoon.show('Carrito')">
                    <lucide-icon name="shopping-cart" [size]="18"></lucide-icon>
                  </button>
                </div>
              </div>
            </article>
          }
        </div>
      }
    </section>

    <!-- PROMO -->
    <section class="wrap" style="margin-top:64px;">
      <div class="promo">
        <div class="orb" style="top:-120px; right:14%; width:340px; height:340px; background:radial-gradient(circle, rgba(242,184,9,0.22), rgba(3,39,90,0) 70%); animation:krFloat 13s ease-in-out infinite;"></div>
        <div style="position:relative; z-index:2; color:#fff; max-width:560px;">
          <span class="promo__eyebrow"><lucide-icon name="percent" [size]="15"></lucide-icon> Oferta de temporada</span>
          <h2 class="promo__title">Hasta <span class="accent">30% de dscto.</span> en setups gamer</h2>
          <p class="promo__sub">Arma tu rig completo: GPU, monitor, periféricos y audio con descuentos exclusivos por tiempo limitado.</p>
        </div>
        <button type="button" class="cta-pri" style="position:relative; z-index:2; height:58px;" (click)="comingSoon.show('Ofertas')">Aprovechar ofertas <lucide-icon name="arrow-right" [size]="20"></lucide-icon></button>
      </div>
    </section>

    <!-- TRUST -->
    <section class="wrap" style="padding-top:64px; padding-bottom:72px;">
      <div class="trust-grid">
        @for (perk of perks; track perk.title) {
          <div class="perk">
            <span class="perk__ic"><lucide-icon [name]="perk.icon" [size]="23"></lucide-icon></span>
            <div><div class="perk__title">{{ perk.title }}</div><div class="perk__desc">{{ perk.desc }}</div></div>
          </div>
        }
      </div>
    </section>
  `,
})
export class HomeComponent implements OnInit {
  private readonly productService = inject(ProductService);
  protected readonly comingSoon = inject(ComingSoonService);

  protected readonly PLACEHOLDER_IMAGE = PLACEHOLDER_IMAGE;

  readonly products = signal<ProductResponse[]>([]);
  readonly loadingProducts = signal(true);

  // Curated visual shortcuts (navigate to the catalog). Not backend categories.
  readonly categories: Cat[] = [
    { name: 'Laptops', icon: 'laptop' },
    { name: 'Componentes', icon: 'cpu' },
    { name: 'Audio', icon: 'headphones' },
    { name: 'Monitores', icon: 'monitor' },
    { name: 'Periféricos', icon: 'keyboard' },
    { name: 'Gaming', icon: 'gamepad-2' },
  ];

  readonly perks: Perk[] = [
    { icon: 'truck', title: 'Envío en 24h', desc: 'Entrega express a todo el Perú' },
    { icon: 'shield-check', title: 'Pago seguro', desc: 'Transacciones 100% protegidas' },
    { icon: 'badge-check', title: 'Garantía oficial', desc: 'Productos con respaldo de marca' },
    { icon: 'rotate-ccw', title: 'Devoluciones', desc: '30 días para cambios y reembolsos' },
  ];

  ngOnInit(): void {
    this.productService.featured(4).subscribe({
      next: (ps) => {
        this.products.set(ps);
        this.loadingProducts.set(false);
      },
      error: () => {
        this.loadingProducts.set(false);
      },
    });
  }
}
