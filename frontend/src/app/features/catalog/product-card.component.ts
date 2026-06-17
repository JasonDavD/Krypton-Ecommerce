import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CurrencyPipe } from '@angular/common';
import { ProductResponse } from '../../models/product.model';
import { PLACEHOLDER_IMAGE } from '../../models/product.model';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [RouterLink, CurrencyPipe],
  template: `
    <a [routerLink]="['/catalogo', product.id]" class="product-card">
      <img
        [src]="product.imageUrl ?? PLACEHOLDER_IMAGE"
        [alt]="product.name"
        class="product-card__image"
      />
      <div class="product-card__body">
        <h3 class="product-card__name">{{ product.name }}</h3>
        <p class="product-card__price">{{ product.price | currency: 'PEN' : 'symbol' : '1.2-2' }}</p>
      </div>
    </a>
  `,
  styles: [`
    .product-card {
      display: flex;
      flex-direction: column;
      border: 1px solid #2a2a4e;
      border-radius: 0.5rem;
      overflow: hidden;
      text-decoration: none;
      color: inherit;
      transition: border-color 0.2s, box-shadow 0.2s;
      background-color: #12122a;
    }

    .product-card:hover {
      border-color: #e040fb;
      box-shadow: 0 0 0 2px rgba(224, 64, 251, 0.2);
    }

    .product-card__image {
      width: 100%;
      aspect-ratio: 4 / 3;
      object-fit: cover;
      background-color: #1a1a3e;
    }

    .product-card__body {
      padding: 0.75rem;
    }

    .product-card__name {
      margin: 0 0 0.4rem;
      font-size: 0.95rem;
      color: #e0e0f0;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .product-card__price {
      margin: 0;
      font-size: 1rem;
      font-weight: 700;
      color: #e040fb;
    }
  `],
})
export class ProductCardComponent {
  @Input() product!: ProductResponse;

  readonly PLACEHOLDER_IMAGE = PLACEHOLDER_IMAGE;
}
