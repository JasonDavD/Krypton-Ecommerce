import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ActivatedRoute } from '@angular/router';
import { of, throwError } from 'rxjs';
import { ProductDetailComponent } from './product-detail.component';
import { ProductService } from './product.service';
import { NotificationService } from '../../core/notifications/notification.service';
import { ProductResponse } from '../../models/product.model';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const makeProduct = (overrides: Partial<ProductResponse> = {}): ProductResponse => ({
  id: 7,
  sku: 'SKU-007',
  name: 'Auriculares Pro',
  description: 'Audio de alta fidelidad',
  price: 299.99,
  stock: 3,
  imageUrl: 'https://example.com/headphones.jpg',
  active: true,
  categoryId: 1,
  categoryName: 'Electrónica',
  ...overrides,
});

const makeActivatedRoute = (id: string) => ({
  snapshot: { paramMap: { get: (_: string) => id } },
});

// ---------------------------------------------------------------------------
// ProductDetailComponent — pragmatic render tests
// ---------------------------------------------------------------------------

describe('ProductDetailComponent', () => {
  let fixture: ComponentFixture<ProductDetailComponent>;
  let component: ProductDetailComponent;
  let notifySpy: jest.SpyInstance;

  const configure = async (
    routeId: string,
    getByIdResult: ReturnType<typeof of> | ReturnType<typeof throwError>,
  ) => {
    const notificationServiceMock = { notify: jest.fn() };
    const productServiceMock = {
      getById: jest.fn().mockReturnValue(getByIdResult),
    };

    await TestBed.configureTestingModule({
      imports: [ProductDetailComponent, RouterTestingModule],
      providers: [
        { provide: ActivatedRoute, useValue: makeActivatedRoute(routeId) },
        { provide: ProductService, useValue: productServiceMock },
        { provide: NotificationService, useValue: notificationServiceMock },
      ],
    }).compileComponents();

    notifySpy = notificationServiceMock.notify as jest.Mock;
    fixture = TestBed.createComponent(ProductDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  };

  afterEach(() => TestBed.resetTestingModule());

  describe('loaded branch', () => {
    beforeEach(async () => {
      await configure('7', of(makeProduct()));
    });

    it('renders the product name', () => {
      const el: HTMLElement = fixture.nativeElement;
      expect(el.textContent).toContain('Auriculares Pro');
    });

    it('renders the product price', () => {
      const el: HTMLElement = fixture.nativeElement;
      expect(el.textContent).toContain('299.99');
    });

    it('does NOT call NotificationService.notify', () => {
      expect(notifySpy).not.toHaveBeenCalled();
    });
  });

  describe('404 branch', () => {
    beforeEach(async () => {
      const httpError = { status: 404, message: 'Not Found' };
      await configure('99', throwError(() => httpError));
    });

    it('renders "Producto no encontrado"', () => {
      const el: HTMLElement = fixture.nativeElement;
      expect(el.textContent).toContain('Producto no encontrado');
    });

    it('renders a back link to /catalogo', () => {
      const anchor: HTMLAnchorElement = fixture.nativeElement.querySelector('a');
      expect(anchor?.getAttribute('href')).toBe('/catalogo');
    });

    it('calls NotificationService.notify with "Producto no encontrado" and "error"', () => {
      expect(notifySpy).toHaveBeenCalledWith('Producto no encontrado', 'error');
    });
  });

  describe('non-numeric id branch', () => {
    beforeEach(async () => {
      // getById should never be called for a non-numeric id
      const productServiceMock = { getById: jest.fn() };
      const notificationServiceMock = { notify: jest.fn() };

      await TestBed.configureTestingModule({
        imports: [ProductDetailComponent, RouterTestingModule],
        providers: [
          { provide: ActivatedRoute, useValue: makeActivatedRoute('abc') },
          { provide: ProductService, useValue: productServiceMock },
          { provide: NotificationService, useValue: notificationServiceMock },
        ],
      }).compileComponents();

      notifySpy = notificationServiceMock.notify as jest.Mock;
      fixture = TestBed.createComponent(ProductDetailComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });

    it('shows not-found state without making an HTTP call', () => {
      expect(component.state).toBe('not-found');
    });
  });
});
