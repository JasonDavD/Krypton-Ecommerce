import { Component, OnInit, effect, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ProductService } from './product.service';
import { NotificationService } from '../../core/notifications/notification.service';
import { ProductCardComponent } from './product-card.component';
import { CatalogFilterComponent } from './catalog-filter.component';
import { CatalogFilter, CategoryResponse } from '../../models/product.model';

/**
 * Smart container for /catalog.
 * Owns: filter signal, page signal, categories signal.
 * Delegates HTTP + signal state to ProductService.
 * Presentational children: CatalogFilterComponent, ProductCardComponent.
 *
 * IMPORTANT: export name MUST stay `CatalogComponent` — app.routes.ts references it via loadComponent.
 */
@Component({
  selector: 'app-catalog',
  standalone: true,
  imports: [ProductCardComponent, CatalogFilterComponent],
  template: `
    <section class="catalog">
      <h2 class="catalog__title">Catálogo</h2>

      <app-catalog-filter
        [categories]="categories()"
        (filterChange)="onFilterChange($event)"
      />

      @if (productService.loading()) {
        <p class="catalog__status">Cargando...</p>
      } @else if (productService.error()) {
        <div class="catalog__error">
          <p>No se pudieron cargar los productos</p>
          <button (click)="runSearch()" class="catalog__retry">Reintentar</button>
        </div>
      } @else if (productService.products().length === 0) {
        <p class="catalog__empty">No se encontraron productos</p>
      } @else {
        <div class="catalog__grid">
          @for (p of productService.products(); track p.id) {
            <app-product-card [product]="p" />
          }
        </div>

        <!-- Pagination -->
        @if (productService.totalPages() > 1) {
          <nav class="catalog__pagination" aria-label="Paginación">
            @for (n of pageNumbers(); track n) {
              <button
                class="catalog__page-btn"
                [class.catalog__page-btn--active]="n === page()"
                (click)="onPageChange(n)"
              >
                {{ n + 1 }}
              </button>
            }
          </nav>
        }
      }
    </section>
  `,
  styles: [`
    .catalog {
      padding: 1.5rem;
      max-width: 1200px;
      margin: 0 auto;
    }

    .catalog__title {
      font-size: 1.5rem;
      color: #e0e0f0;
      margin: 0 0 1rem;
    }

    .catalog__status,
    .catalog__empty {
      padding: 2rem;
      text-align: center;
      color: #c0c0d0;
    }

    .catalog__error {
      padding: 2rem;
      text-align: center;
      color: #ff6e6e;
    }

    .catalog__retry {
      margin-top: 0.75rem;
      padding: 0.4rem 1rem;
      background: transparent;
      border: 1px solid #ff6e6e;
      color: #ff6e6e;
      border-radius: 0.375rem;
      cursor: pointer;
      font-size: 0.875rem;
    }

    .catalog__retry:hover {
      background-color: rgba(255, 110, 110, 0.1);
    }

    .catalog__grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
      gap: 1.25rem;
    }

    .catalog__pagination {
      display: flex;
      justify-content: center;
      gap: 0.5rem;
      margin-top: 2rem;
    }

    .catalog__page-btn {
      padding: 0.35rem 0.75rem;
      background: transparent;
      border: 1px solid #2a2a4e;
      color: #c0c0d0;
      border-radius: 0.375rem;
      cursor: pointer;
      font-size: 0.875rem;
      transition: all 0.2s;
    }

    .catalog__page-btn:hover {
      border-color: #e040fb;
      color: #e040fb;
    }

    .catalog__page-btn--active {
      background-color: #e040fb;
      border-color: #e040fb;
      color: #fff;
    }
  `],
})
export class CatalogComponent implements OnInit {
  protected readonly productService = inject(ProductService);
  private readonly notificationService = inject(NotificationService);
  private readonly route = inject(ActivatedRoute);

  // Container-owned signals
  readonly filter = signal<CatalogFilter>({});
  readonly page = signal<number>(0);
  readonly categories = signal<CategoryResponse[]>([]);

  constructor() {
    // React to product-list errors reactively via signal effect.
    // Fires whenever productService.error() transitions from null → non-null.
    effect(() => {
      if (this.productService.error() !== null) {
        this.notificationService.notify('No se pudieron cargar los productos', 'error');
      }
    });
  }

  ngOnInit(): void {
    this.productService.listCategories().subscribe({
      next: (cats) => {
        this.categories.set(cats);
      },
      error: () => {
        this.notificationService.notify('No se pudieron cargar las categorías', 'error');
      },
    });

    // The navbar search navigates here with ?q=term. React to it — the subscription
    // also fires with the current params on init, so it covers the first load too.
    this.route.queryParamMap.subscribe((params) => {
      const q = params.get('q')?.trim() || undefined;
      this.filter.set({ ...this.filter(), name: q });
      this.page.set(0);
      this.runSearch();
    });
  }

  runSearch(): void {
    this.productService.search(this.filter(), this.page());
  }

  onFilterChange(f: CatalogFilter): void {
    this.filter.set(f);
    this.page.set(0);
    this.runSearch();
  }

  onPageChange(n: number): void {
    this.page.set(n);
    this.runSearch();
  }

  /** Generates an array [0 .. totalPages-1] for the pagination loop. */
  pageNumbers(): number[] {
    return Array.from({ length: this.productService.totalPages() }, (_, i) => i);
  }
}
