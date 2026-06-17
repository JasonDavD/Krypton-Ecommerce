import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { signal } from '@angular/core';
import { of, throwError } from 'rxjs';
import { CatalogComponent } from './catalog.component';
import { ProductService } from './product.service';
import { NotificationService } from '../../core/notifications/notification.service';
import { ProductResponse, CategoryResponse } from '../../models/product.model';

// ---------------------------------------------------------------------------
// Stubs
// ---------------------------------------------------------------------------

const makeProduct = (id: number): ProductResponse => ({
  id,
  sku: `SKU-00${id}`,
  name: `Producto ${id}`,
  description: null,
  price: 100 * id,
  stock: 5,
  imageUrl: null,
  active: true,
  categoryId: 1,
  categoryName: 'General',
});

const makeProductServiceStub = (products: ProductResponse[] = []) => ({
  search: jest.fn(),
  listCategories: jest.fn().mockReturnValue(of([] as CategoryResponse[])),
  products: signal(products).asReadonly(),
  totalPages: signal(1).asReadonly(),
  totalElements: signal(products.length).asReadonly(),
  loading: signal(false).asReadonly(),
  error: signal<string | null>(null).asReadonly(),
});

// ---------------------------------------------------------------------------
// CatalogComponent — light container render tests (P4.4 optional)
// ---------------------------------------------------------------------------

describe('CatalogComponent', () => {
  let fixture: ComponentFixture<CatalogComponent>;
  let component: CatalogComponent;
  let productServiceStub: ReturnType<typeof makeProductServiceStub>;

  const setup = async (products: ProductResponse[] = []) => {
    productServiceStub = makeProductServiceStub(products);

    await TestBed.configureTestingModule({
      imports: [CatalogComponent, RouterTestingModule],
      providers: [
        { provide: ProductService, useValue: productServiceStub },
        { provide: NotificationService, useValue: { notify: jest.fn() } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CatalogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  };

  afterEach(() => TestBed.resetTestingModule());

  it('calls productService.search() once on ngOnInit', async () => {
    await setup();
    expect(productServiceStub.search).toHaveBeenCalledTimes(1);
    expect(productServiceStub.search).toHaveBeenCalledWith({}, 0);
  });

  it('calls productService.listCategories() once on ngOnInit', async () => {
    await setup();
    expect(productServiceStub.listCategories).toHaveBeenCalledTimes(1);
  });

  it('renders a product-card for each product in the mocked signal', async () => {
    await setup([makeProduct(1), makeProduct(2), makeProduct(3)]);
    const cards = fixture.nativeElement.querySelectorAll('app-product-card');
    expect(cards.length).toBe(3);
  });

  it('shows empty state when products signal is empty and not loading', async () => {
    await setup([]);
    const el: HTMLElement = fixture.nativeElement;
    expect(el.textContent).toContain('No se encontraron productos');
  });

  describe('onFilterChange', () => {
    it('resets page to 0 and calls search with new filter', async () => {
      await setup();
      component.page.set(2); // simulate being on page 2
      productServiceStub.search.mockClear();

      component.onFilterChange({ name: 'zapatos' });

      expect(component.page()).toBe(0);
      expect(productServiceStub.search).toHaveBeenCalledWith({ name: 'zapatos' }, 0);
    });
  });

  describe('onPageChange', () => {
    it('sets page to n and calls search', async () => {
      await setup();
      productServiceStub.search.mockClear();

      component.onPageChange(3);

      expect(component.page()).toBe(3);
      expect(productServiceStub.search).toHaveBeenCalledWith({}, 3);
    });
  });

  // ---------------------------------------------------------------------------
  // CRITICAL-1: notify on product list error (5xx)
  // ---------------------------------------------------------------------------

  describe('notify on list error (CRITICAL-1)', () => {
    it('calls notificationService.notify with error message when productService.error() is non-null after search', async () => {
      // Arrange: stub search to set error signal synchronously
      const errorSignal = signal<string | null>(null);
      const productServiceWithError = {
        search: jest.fn().mockImplementation(() => {
          errorSignal.set('Error al cargar productos');
        }),
        listCategories: jest.fn().mockReturnValue(of([] as CategoryResponse[])),
        products: signal([] as ProductResponse[]).asReadonly(),
        totalPages: signal(0).asReadonly(),
        totalElements: signal(0).asReadonly(),
        loading: signal(false).asReadonly(),
        error: errorSignal.asReadonly(),
      };
      const notifySpy = jest.fn();

      await TestBed.configureTestingModule({
        imports: [CatalogComponent, RouterTestingModule],
        providers: [
          { provide: ProductService, useValue: productServiceWithError },
          { provide: NotificationService, useValue: { notify: notifySpy } },
        ],
      }).compileComponents();

      fixture = TestBed.createComponent(CatalogComponent);
      fixture.detectChanges(); // ngOnInit → search() → error signal set → effect fires

      // effect() runs synchronously in test zone after detectChanges
      expect(notifySpy).toHaveBeenCalledWith('No se pudieron cargar los productos', 'error');
    });
  });

  // ---------------------------------------------------------------------------
  // CRITICAL-2: error callback on listCategories subscribe
  // ---------------------------------------------------------------------------

  describe('notify on category load error (CRITICAL-2)', () => {
    it('calls notificationService.notify with category error message when listCategories fails', async () => {
      const productServiceCatError = {
        search: jest.fn(),
        listCategories: jest
          .fn()
          .mockReturnValue(throwError(() => new Error('network error'))),
        products: signal([] as ProductResponse[]).asReadonly(),
        totalPages: signal(0).asReadonly(),
        totalElements: signal(0).asReadonly(),
        loading: signal(false).asReadonly(),
        error: signal<string | null>(null).asReadonly(),
      };
      const notifySpy = jest.fn();

      await TestBed.configureTestingModule({
        imports: [CatalogComponent, RouterTestingModule],
        providers: [
          { provide: ProductService, useValue: productServiceCatError },
          { provide: NotificationService, useValue: { notify: notifySpy } },
        ],
      }).compileComponents();

      fixture = TestBed.createComponent(CatalogComponent);
      fixture.detectChanges(); // ngOnInit → listCategories().subscribe → error handler fires

      expect(notifySpy).toHaveBeenCalledWith('No se pudieron cargar las categorías', 'error');
    });
  });

  // ---------------------------------------------------------------------------
  // WARNING-1: active-page button class
  // ---------------------------------------------------------------------------

  describe('Page buttons reflect total pages', () => {
    it('applies catalog__page-btn--active class to the current page button only', async () => {
      // Need a service stub with totalPages > 1 so pagination renders
      const multiPageStub = {
        search: jest.fn(),
        listCategories: jest.fn().mockReturnValue(of([] as CategoryResponse[])),
        products: signal([makeProduct(1)]).asReadonly(),
        totalPages: signal(3).asReadonly(),
        totalElements: signal(3).asReadonly(),
        loading: signal(false).asReadonly(),
        error: signal<string | null>(null).asReadonly(),
      };

      await TestBed.configureTestingModule({
        imports: [CatalogComponent, RouterTestingModule],
        providers: [
          { provide: ProductService, useValue: multiPageStub },
          { provide: NotificationService, useValue: { notify: jest.fn() } },
        ],
      }).compileComponents();

      fixture = TestBed.createComponent(CatalogComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();

      // Initial page is 0 — button 0 should have the active class
      const buttons: NodeListOf<HTMLButtonElement> =
        fixture.nativeElement.querySelectorAll('.catalog__page-btn');

      expect(buttons.length).toBe(3);
      expect(buttons[0].classList.contains('catalog__page-btn--active')).toBe(true);
      expect(buttons[1].classList.contains('catalog__page-btn--active')).toBe(false);
      expect(buttons[2].classList.contains('catalog__page-btn--active')).toBe(false);

      // Navigate to page 1 and assert the active marker moves
      component.onPageChange(1);
      fixture.detectChanges();

      expect(buttons[0].classList.contains('catalog__page-btn--active')).toBe(false);
      expect(buttons[1].classList.contains('catalog__page-btn--active')).toBe(true);
      expect(buttons[2].classList.contains('catalog__page-btn--active')).toBe(false);
    });
  });
});
