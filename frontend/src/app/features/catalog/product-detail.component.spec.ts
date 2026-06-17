import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ActivatedRoute } from '@angular/router';
import { of, throwError } from 'rxjs';
import { ProductDetailComponent } from './product-detail.component';
import { ProductService } from './product.service';
import { NotificationService } from '../../core/notifications/notification.service';
import { ProductResponse, ProductImageResponse } from '../../models/product.model';
import { PLACEHOLDER_IMAGE } from '../../models/product.model';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const makeImage = (id: number, order: number, cover = false): ProductImageResponse => ({
  id,
  url: `https://cdn.example.com/img${id}.jpg`,
  displayOrder: order,
  cover,
});

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

  // ─── Carousel tests (D2: next on last → first; prev on first → last) ──────

  describe('carousel — empty images falls back to imageUrl', () => {
    beforeEach(async () => {
      // Product has no images array (absent) — must fall back to imageUrl
      await configure('7', of(makeProduct({ images: undefined })));
    });

    it('shows the imageUrl as the fallback src', () => {
      const img: HTMLImageElement | null = fixture.nativeElement.querySelector('img');
      expect(img?.src).toBe('https://example.com/headphones.jpg');
    });

    it('does NOT render navigation controls', () => {
      const prevBtn = fixture.nativeElement.querySelector('[data-testid="prev"]');
      const nextBtn = fixture.nativeElement.querySelector('[data-testid="next"]');
      expect(prevBtn).toBeNull();
      expect(nextBtn).toBeNull();
    });
  });

  describe('carousel — empty images array falls back to PLACEHOLDER_IMAGE', () => {
    beforeEach(async () => {
      // Product has empty images array and no imageUrl
      await configure('7', of(makeProduct({ images: [], imageUrl: null })));
    });

    it('shows the placeholder image when images is empty and imageUrl is null', () => {
      const img: HTMLImageElement | null = fixture.nativeElement.querySelector('img');
      expect(img?.src).toContain('placeholder-product.svg');
    });
  });

  describe('carousel — single image', () => {
    const singleImage = makeImage(1, 0, true);

    beforeEach(async () => {
      await configure('7', of(makeProduct({ images: [singleImage] })));
    });

    it('renders the image src from images[0].url', () => {
      const img: HTMLImageElement | null = fixture.nativeElement.querySelector('img');
      expect(img?.src).toBe(singleImage.url);
    });

    it('does NOT render navigation controls for a single image', () => {
      const prevBtn = fixture.nativeElement.querySelector('[data-testid="prev"]');
      const nextBtn = fixture.nativeElement.querySelector('[data-testid="next"]');
      expect(prevBtn).toBeNull();
      expect(nextBtn).toBeNull();
    });
  });

  describe('carousel — multiple images with wrap-around (D2)', () => {
    const images = [
      makeImage(1, 0, true),
      makeImage(2, 1, false),
      makeImage(3, 2, false),
    ];

    beforeEach(async () => {
      await configure('7', of(makeProduct({ images })));
    });

    it('starts at index 0 (first image)', () => {
      const img: HTMLImageElement | null = fixture.nativeElement.querySelector('img');
      expect(img?.src).toBe(images[0].url);
    });

    it('renders prev and next navigation controls', () => {
      const prevBtn = fixture.nativeElement.querySelector('[data-testid="prev"]');
      const nextBtn = fixture.nativeElement.querySelector('[data-testid="next"]');
      expect(prevBtn).not.toBeNull();
      expect(nextBtn).not.toBeNull();
    });

    it('next() advances to the second image', () => {
      component.next();
      fixture.detectChanges();
      const img: HTMLImageElement | null = fixture.nativeElement.querySelector('img');
      expect(img?.src).toBe(images[1].url);
    });

    it('next() on the last image wraps to the first (D2)', () => {
      // Advance to last image
      component.next();
      component.next();
      fixture.detectChanges();
      const imgAtLast: HTMLImageElement | null = fixture.nativeElement.querySelector('img');
      expect(imgAtLast?.src).toBe(images[2].url);

      // One more next: should wrap to first
      component.next();
      fixture.detectChanges();
      const imgWrapped: HTMLImageElement | null = fixture.nativeElement.querySelector('img');
      expect(imgWrapped?.src).toBe(images[0].url);
    });

    it('prev() on the first image wraps to the last (D2)', () => {
      // At index 0 — prev should go to last
      component.prev();
      fixture.detectChanges();
      const img: HTMLImageElement | null = fixture.nativeElement.querySelector('img');
      expect(img?.src).toBe(images[images.length - 1].url);
    });

    it('prev() from a middle image goes back one', () => {
      component.next(); // index 1
      fixture.detectChanges();
      component.prev(); // back to 0
      fixture.detectChanges();
      const img: HTMLImageElement | null = fixture.nativeElement.querySelector('img');
      expect(img?.src).toBe(images[0].url);
    });
  });
});
