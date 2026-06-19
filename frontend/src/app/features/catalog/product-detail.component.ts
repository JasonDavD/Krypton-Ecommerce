import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { CurrencyPipe } from '@angular/common';
import { ProductService } from './product.service';
import { NotificationService } from '../../core/notifications/notification.service';
import { ProductResponse } from '../../models/product.model';
import { PLACEHOLDER_IMAGE } from '../../models/product.model';

type ViewState = 'loading' | 'loaded' | 'not-found' | 'error';

/**
 * Product detail view with plain CSS carousel.
 *
 * Carousel design decisions (locked):
 * - D2: WRAP-AROUND — next on last → first; prev on first → last (modulo).
 * - gallery getter: falls back to [{url: imageUrl ?? PLACEHOLDER_IMAGE}] when images is absent/empty.
 * - hasMultiple: hides navigation controls when only 1 image in the gallery.
 * - No new npm dependencies — plain template + component state only.
 */
@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [RouterLink, CurrencyPipe],
  template: `
    @if (state === 'loading') {
      <p class="detail__status">Cargando...</p>
    } @else if (state === 'loaded' && product) {
      <article class="detail">
        <div class="detail__gallery">
          <img
            [src]="gallery[currentIndex].url"
            [alt]="product.name"
            class="detail__image"
          />
          @if (hasMultiple) {
            <div class="detail__nav">
              <button
                class="detail__nav-btn"
                data-testid="prev"
                (click)="prev()"
                aria-label="Imagen anterior"
              >&#8249;</button>
              <span class="detail__nav-counter">
                {{ currentIndex + 1 }} / {{ gallery.length }}
              </span>
              <button
                class="detail__nav-btn"
                data-testid="next"
                (click)="next()"
                aria-label="Imagen siguiente"
              >&#8250;</button>
            </div>
          }
        </div>
        <div class="detail__info">
          <h1 class="detail__name">{{ product.name }}</h1>
          <p class="detail__price">{{ product.price | currency: 'PEN' : 'symbol' : '1.2-2' }}</p>
          <p class="detail__category">{{ product.categoryName }}</p>
          @if (product.description) {
            <p class="detail__description">{{ product.description }}</p>
          }
          <p class="detail__stock">Stock: {{ product.stock }}</p>
        </div>
      </article>
    } @else if (state === 'not-found') {
      <div class="detail__not-found">
        <p>Producto no encontrado</p>
        <a routerLink="/catalogo" class="detail__back">Volver al catálogo</a>
      </div>
    } @else {
      <div class="detail__error">
        <p>No se pudo cargar el producto</p>
        <a routerLink="/catalogo" class="detail__back">Volver al catálogo</a>
      </div>
    }
  `,
  styles: [`
    .detail__status {
      padding: 2rem;
      text-align: center;
      color: #c0c0d0;
    }

    .detail {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 2rem;
      padding: 2rem;
      max-width: 960px;
      margin: 0 auto;
    }

    .detail__gallery {
      position: relative;
    }

    .detail__image {
      width: 100%;
      border-radius: 0.5rem;
      object-fit: cover;
    }

    .detail__nav {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 1rem;
      margin-top: 0.5rem;
    }

    .detail__nav-btn {
      background: #2a2a3a;
      border: 1px solid #444466;
      color: #e0e0f0;
      border-radius: 0.25rem;
      width: 2rem;
      height: 2rem;
      font-size: 1.25rem;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .detail__nav-btn:hover {
      background: #3a3a5a;
    }

    .detail__nav-counter {
      color: #c0c0d0;
      font-size: 0.875rem;
    }

    .detail__name {
      font-size: 1.5rem;
      color: #e0e0f0;
      margin: 0 0 0.5rem;
    }

    .detail__price {
      font-size: 1.25rem;
      font-weight: 700;
      color: #e040fb;
      margin: 0 0 0.5rem;
    }

    .detail__category {
      color: #80cbc4;
      font-size: 0.875rem;
      margin: 0 0 1rem;
    }

    .detail__description {
      color: #c0c0d0;
      line-height: 1.6;
    }

    .detail__stock {
      color: #c0c0d0;
      font-size: 0.875rem;
    }

    .detail__not-found,
    .detail__error {
      padding: 2rem;
      text-align: center;
      color: #c0c0d0;
    }

    .detail__back {
      display: inline-block;
      margin-top: 1rem;
      color: #e040fb;
      text-decoration: none;
    }

    .detail__back:hover {
      text-decoration: underline;
    }
  `],
})
export class ProductDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly productService = inject(ProductService);
  private readonly notificationService = inject(NotificationService);

  state: ViewState = 'loading';
  product: ProductResponse | null = null;
  currentIndex = 0;

  readonly PLACEHOLDER_IMAGE = PLACEHOLDER_IMAGE;

  /**
   * Gallery items. Falls back to a single-item array using imageUrl ?? PLACEHOLDER_IMAGE
   * when the product has no images (absent or empty array).
   */
  get gallery(): Array<{ url: string }> {
    if (this.product?.images && this.product.images.length > 0) {
      return this.product.images;
    }
    return [{ url: this.product?.imageUrl ?? PLACEHOLDER_IMAGE }];
  }

  /** True when there is more than one image — controls navigation visibility. */
  get hasMultiple(): boolean {
    return this.gallery.length > 1;
  }

  /** Advance to the next image. Wraps around from last to first (D2). */
  next(): void {
    this.currentIndex = (this.currentIndex + 1) % this.gallery.length;
  }

  /** Go back to the previous image. Wraps around from first to last (D2). */
  prev(): void {
    this.currentIndex = (this.currentIndex - 1 + this.gallery.length) % this.gallery.length;
  }

  ngOnInit(): void {
    const rawId = this.route.snapshot.paramMap.get('id');
    const id = Number(rawId);

    if (!isFinite(id) || !rawId) {
      this.state = 'not-found';
      return;
    }

    this.productService.getById(id).subscribe({
      next: (p) => {
        this.product = p;
        this.currentIndex = 0;
        this.state = 'loaded';
      },
      error: (err) => {
        if (err.status === 404) {
          this.state = 'not-found';
          this.notificationService.notify('Producto no encontrado', 'error');
        } else {
          this.state = 'error';
          this.notificationService.notify('No se pudo cargar el producto', 'error');
        }
      },
    });
  }
}
