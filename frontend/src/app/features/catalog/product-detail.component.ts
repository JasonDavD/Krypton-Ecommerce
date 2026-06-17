import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { CurrencyPipe } from '@angular/common';
import { ProductService } from './product.service';
import { NotificationService } from '../../core/notifications/notification.service';
import { ProductResponse } from '../../models/product.model';
import { PLACEHOLDER_IMAGE } from '../../models/product.model';

type ViewState = 'loading' | 'loaded' | 'not-found' | 'error';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [RouterLink, CurrencyPipe],
  template: `
    @if (state === 'loading') {
      <p class="detail__status">Cargando...</p>
    } @else if (state === 'loaded' && product) {
      <article class="detail">
        <img
          [src]="product.imageUrl ?? PLACEHOLDER_IMAGE"
          [alt]="product.name"
          class="detail__image"
        />
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

    .detail__image {
      width: 100%;
      border-radius: 0.5rem;
      object-fit: cover;
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

  readonly PLACEHOLDER_IMAGE = PLACEHOLDER_IMAGE;

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
