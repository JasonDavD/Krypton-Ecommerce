import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { ProductService } from './product.service';
import {
  ProductResponse,
  CategoryResponse,
  PageResponse,
  CatalogFilter,
} from '../../models/product.model';

// ---------------------------------------------------------------------------
// Test fixtures
// ---------------------------------------------------------------------------

const BASE = 'http://localhost:8080';

const mockProduct: ProductResponse = {
  id: 1,
  sku: 'SKU-001',
  name: 'Camiseta Test',
  description: 'Descripción de prueba',
  price: 99.99,
  stock: 10,
  imageUrl: 'https://example.com/img.jpg',
  active: true,
  categoryId: 2,
  categoryName: 'Ropa',
};

const mockPage: PageResponse<ProductResponse> = {
  content: [mockProduct],
  page: 0,
  size: 12,
  totalElements: 1,
  totalPages: 1,
};

const mockCategories: CategoryResponse[] = [
  { id: 1, name: 'Electrónica', description: null },
  { id: 2, name: 'Ropa', description: 'Ropa y accesorios' },
];

// ---------------------------------------------------------------------------
// ProductService — Strict RED-GREEN Specs
// ---------------------------------------------------------------------------

describe('ProductService', () => {
  let service: ProductService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ProductService],
    });
    service = TestBed.inject(ProductService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    http.verify();
  });

  // -------------------------------------------------------------------------
  // 1. search() issues GET to the correct absolute URL
  // -------------------------------------------------------------------------

  describe('search() — URL and method', () => {
    it('should GET the absolute products URL', () => {
      service.search({}, 0);
      const req = http.expectOne((r) => r.url === `${BASE}/api/products`);
      expect(req.request.method).toBe('GET');
      req.flush(mockPage);
    });
  });

  // -------------------------------------------------------------------------
  // 2. Params casing — lowercase page/size keys; size === '12'
  // -------------------------------------------------------------------------

  describe('search() — params casing', () => {
    it('should send lowercase page and size params', () => {
      service.search({}, 0);
      const req = http.expectOne((r) => r.url === `${BASE}/api/products`);
      expect(req.request.params.get('page')).toBe('0');
      expect(req.request.params.get('size')).toBe('12');
      req.flush(mockPage);
    });

    it('should send page=2 when called with page 2', () => {
      service.search({}, 2);
      const req = http.expectOne((r) => r.url === `${BASE}/api/products`);
      expect(req.request.params.get('page')).toBe('2');
      req.flush(mockPage);
    });
  });

  // -------------------------------------------------------------------------
  // 3. Filter omission — empty filter {} sends NO filter keys
  // -------------------------------------------------------------------------

  describe('search() — filter omission', () => {
    it('should NOT include name, categoryId, priceMin, priceMax for empty filter', () => {
      service.search({}, 0);
      const req = http.expectOne((r) => r.url === `${BASE}/api/products`);
      expect(req.request.params.has('name')).toBe(false);
      expect(req.request.params.has('categoryId')).toBe(false);
      expect(req.request.params.has('priceMin')).toBe(false);
      expect(req.request.params.has('priceMax')).toBe(false);
      req.flush(mockPage);
    });

    it('should omit whitespace-only name from params', () => {
      const filter: CatalogFilter = { name: '   ' };
      service.search(filter, 0);
      const req = http.expectOne((r) => r.url === `${BASE}/api/products`);
      expect(req.request.params.has('name')).toBe(false);
      req.flush(mockPage);
    });
  });

  // -------------------------------------------------------------------------
  // 4. Filter composition — all 4 filter keys composed correctly
  // -------------------------------------------------------------------------

  describe('search() — filter composition', () => {
    it('should include all present filter keys as strings', () => {
      const filter: CatalogFilter = {
        name: 'camiseta',
        categoryId: 3,
        priceMin: 50,
        priceMax: 200,
      };
      service.search(filter, 0);
      const req = http.expectOne((r) => r.url === `${BASE}/api/products`);
      expect(req.request.params.get('name')).toBe('camiseta');
      expect(req.request.params.get('categoryId')).toBe('3');
      expect(req.request.params.get('priceMin')).toBe('50');
      expect(req.request.params.get('priceMax')).toBe('200');
      req.flush(mockPage);
    });

    it('should trim the name value and include it', () => {
      const filter: CatalogFilter = { name: '  cami  ' };
      service.search(filter, 0);
      const req = http.expectOne((r) => r.url === `${BASE}/api/products`);
      expect(req.request.params.get('name')).toBe('cami');
      req.flush(mockPage);
    });
  });

  // -------------------------------------------------------------------------
  // 5. Signal population on success
  // -------------------------------------------------------------------------

  describe('search() — signal population', () => {
    it('should set loading to true before flush and false after', () => {
      service.search({}, 0);
      expect(service.loading()).toBe(true);

      const req = http.expectOne((r) => r.url === `${BASE}/api/products`);
      req.flush(mockPage);

      expect(service.loading()).toBe(false);
    });

    it('should populate products, totalPages, totalElements on success', () => {
      service.search({}, 0);
      const req = http.expectOne((r) => r.url === `${BASE}/api/products`);
      req.flush(mockPage);

      expect(service.products()).toEqual([mockProduct]);
      expect(service.totalPages()).toBe(1);
      expect(service.totalElements()).toBe(1);
    });
  });

  // -------------------------------------------------------------------------
  // 6. Error path — 5xx sets error signal, clears loading
  // -------------------------------------------------------------------------

  describe('search() — error path', () => {
    it('should set loading to false and error to non-null on 5xx', () => {
      service.search({}, 0);
      const req = http.expectOne((r) => r.url === `${BASE}/api/products`);
      req.flush('Server error', { status: 500, statusText: 'Internal Server Error' });

      expect(service.loading()).toBe(false);
      expect(service.error()).not.toBeNull();
    });

    it('should leave products signal unchanged (empty) on error', () => {
      service.search({}, 0);
      const req = http.expectOne((r) => r.url === `${BASE}/api/products`);
      req.flush('Server error', { status: 500, statusText: 'Internal Server Error' });

      expect(service.products()).toEqual([]);
    });
  });

  // -------------------------------------------------------------------------
  // 7. getById() — success and 404
  // -------------------------------------------------------------------------

  describe('getById()', () => {
    it('should GET the absolute product detail URL', () => {
      let result: ProductResponse | undefined;
      service.getById(1).subscribe((p) => (result = p));

      const req = http.expectOne(`${BASE}/api/products/1`);
      expect(req.request.method).toBe('GET');
      req.flush(mockProduct);

      expect(result).toEqual(mockProduct);
    });

    it('should surface 404 error to the subscriber', () => {
      let error: unknown;
      service.getById(9999).subscribe({ error: (e) => (error = e) });

      const req = http.expectOne(`${BASE}/api/products/9999`);
      req.flush('Not found', { status: 404, statusText: 'Not Found' });

      expect(error).toBeDefined();
    });
  });

  // -------------------------------------------------------------------------
  // 8. listCategories() — shareReplay(1) cache: first call → one GET, second → none
  // -------------------------------------------------------------------------

  describe('listCategories() — cache / shareReplay(1)', () => {
    it('should issue exactly one GET /api/categories for multiple subscriptions', () => {
      // First subscription
      service.listCategories().subscribe();
      const req = http.expectOne(`${BASE}/api/categories`);
      req.flush(mockCategories);

      // Second subscription — must NOT trigger another GET
      service.listCategories().subscribe();
      http.expectNone(`${BASE}/api/categories`);
    });

    it('should replay the cached categories to subsequent subscribers', () => {
      let first: CategoryResponse[] | undefined;
      let second: CategoryResponse[] | undefined;

      service.listCategories().subscribe((c) => (first = c));
      http.expectOne(`${BASE}/api/categories`).flush(mockCategories);

      service.listCategories().subscribe((c) => (second = c));

      expect(first).toEqual(mockCategories);
      expect(second).toEqual(mockCategories);
    });
  });
});
