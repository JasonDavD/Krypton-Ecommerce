import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ProductCardComponent } from './product-card.component';
import { ProductResponse } from '../../models/product.model';
import { PLACEHOLDER_IMAGE } from '../../models/product.model';

// ---------------------------------------------------------------------------
// Test fixtures
// ---------------------------------------------------------------------------

const makeProduct = (overrides: Partial<ProductResponse> = {}): ProductResponse => ({
  id: 42,
  sku: 'SKU-042',
  name: 'Zapatillas Test',
  description: 'Descripción de prueba',
  price: 149.99,
  stock: 5,
  imageUrl: 'https://example.com/shoe.jpg',
  active: true,
  categoryId: 3,
  categoryName: 'Calzado',
  ...overrides,
});

// ---------------------------------------------------------------------------
// ProductCardComponent — pragmatic render tests
// ---------------------------------------------------------------------------

describe('ProductCardComponent', () => {
  let fixture: ComponentFixture<ProductCardComponent>;
  let component: ProductCardComponent;

  const setup = (product: ProductResponse) => {
    fixture = TestBed.createComponent(ProductCardComponent);
    component = fixture.componentInstance;
    component.product = product;
    fixture.detectChanges();
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductCardComponent, RouterTestingModule],
    }).compileComponents();
  });

  it('renders the product name in the DOM', () => {
    setup(makeProduct());
    const el: HTMLElement = fixture.nativeElement;
    expect(el.textContent).toContain('Zapatillas Test');
  });

  it('renders the product price in the DOM', () => {
    setup(makeProduct({ price: 149.99 }));
    const el: HTMLElement = fixture.nativeElement;
    // CurrencyPipe formats it — just confirm some numeric content is present
    expect(el.textContent).toContain('149.99');
  });

  describe('imageUrl fallback', () => {
    it('uses imageUrl when it is a non-null string', () => {
      setup(makeProduct({ imageUrl: 'https://example.com/shoe.jpg' }));
      const img: HTMLImageElement = fixture.nativeElement.querySelector('img');
      expect(img.src).toBe('https://example.com/shoe.jpg');
    });

    it('uses PLACEHOLDER_IMAGE when imageUrl is null — NOT the string "null"', () => {
      setup(makeProduct({ imageUrl: null }));
      const img: HTMLImageElement = fixture.nativeElement.querySelector('img');
      expect(img.src).not.toBe('null');
      expect(img.src).toContain(PLACEHOLDER_IMAGE);
    });
  });

  describe('routerLink', () => {
    it('root anchor targets /catalog/{id}', () => {
      setup(makeProduct({ id: 42 }));
      const anchor: HTMLAnchorElement = fixture.nativeElement.querySelector('a');
      // RouterTestingModule resolves the routerLink — the href will contain /catalog/42
      expect(anchor.getAttribute('href')).toBe('/catalog/42');
    });
  });
});
