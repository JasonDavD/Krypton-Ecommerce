import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError, map, shareReplay } from 'rxjs/operators';
import { throwError } from 'rxjs';
import {
  CatalogFilter,
  CategoryResponse,
  PageResponse,
  ProductResponse,
} from '../../models/product.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ProductService {
  private readonly DEFAULT_PAGE_SIZE = 12;

  // ---------------------------------------------------------------------------
  // Private writable signals
  // ---------------------------------------------------------------------------

  private readonly _products = signal<ProductResponse[]>([]);
  private readonly _totalPages = signal<number>(0);
  private readonly _totalElements = signal<number>(0);
  private readonly _loading = signal<boolean>(false);
  private readonly _error = signal<string | null>(null);

  // ---------------------------------------------------------------------------
  // Public readonly signals
  // ---------------------------------------------------------------------------

  readonly products = this._products.asReadonly();
  readonly totalPages = this._totalPages.asReadonly();
  readonly totalElements = this._totalElements.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();

  // ---------------------------------------------------------------------------
  // Category cache (shareReplay(1) — fetched once per service instance)
  // ---------------------------------------------------------------------------

  private categories$?: Observable<CategoryResponse[]>;

  constructor(private readonly http: HttpClient) {}

  // ---------------------------------------------------------------------------
  // search() — server-side paginated product list; populates signals
  // ---------------------------------------------------------------------------

  /**
   * Server-side product search. Builds HttpParams (page/size always; filter
   * params only when present), sets loading/error signals, populates the
   * products + totalPages signals from the PageResponse on success.
   * page is ZERO-BASED (matches PageResponse.page).
   */
  search(filter: CatalogFilter, page: number): void {
    this._loading.set(true);
    this._error.set(null);

    const params = this.buildSearchParams(filter, page);

    this.http
      .get<PageResponse<ProductResponse>>(`${environment.apiBaseUrl}/api/products`, { params })
      .pipe(
        catchError((err) => {
          this._loading.set(false);
          this._error.set(err.message ?? 'Error al cargar productos');
          return throwError(() => err);
        }),
      )
      .subscribe({
        next: (page) => {
          this._products.set(page.content);
          this._totalPages.set(page.totalPages);
          this._totalElements.set(page.totalElements);
          this._loading.set(false);
        },
      });
  }

  // ---------------------------------------------------------------------------
  // getById() — single product by id; caller handles success/404 logic
  // ---------------------------------------------------------------------------

  /** GET /api/products/{id} → ProductResponse. Caller subscribes. */
  getById(id: number): Observable<ProductResponse> {
    return this.http.get<ProductResponse>(`${environment.apiBaseUrl}/api/products/${id}`);
  }

  /**
   * GET /api/products?size={limit} → first page content only, for the Home
   * "destacados" strip. Returns an Observable and does NOT touch the shared
   * catalog signals, so Home and Catálogo never fight over list state.
   */
  featured(limit = 8): Observable<ProductResponse[]> {
    const params = new HttpParams().set('page', '0').set('size', String(limit));
    return this.http
      .get<PageResponse<ProductResponse>>(`${environment.apiBaseUrl}/api/products`, { params })
      .pipe(map((page) => page.content));
  }

  // ---------------------------------------------------------------------------
  // listCategories() — lazy cold-load with shareReplay(1) cache
  // ---------------------------------------------------------------------------

  /** GET /api/categories → CategoryResponse[], cold-loaded once, cached. */
  listCategories(): Observable<CategoryResponse[]> {
    if (!this.categories$) {
      this.categories$ = this.http
        .get<CategoryResponse[]>(`${environment.apiBaseUrl}/api/categories`)
        .pipe(shareReplay(1));
    }
    return this.categories$;
  }

  // ---------------------------------------------------------------------------
  // Private helpers
  // ---------------------------------------------------------------------------

  private buildSearchParams(filter: CatalogFilter, page: number): HttpParams {
    let params = new HttpParams()
      .set('page', String(page))
      .set('size', String(this.DEFAULT_PAGE_SIZE));

    if (filter.name?.trim()) {
      params = params.set('name', filter.name.trim());
    }
    if (filter.categoryId != null) {
      params = params.set('categoryId', String(filter.categoryId));
    }
    if (filter.priceMin != null) {
      params = params.set('priceMin', String(filter.priceMin));
    }
    if (filter.priceMax != null) {
      params = params.set('priceMax', String(filter.priceMax));
    }

    return params;
  }
}
