import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { HomeComponent } from './home.component';
import { ProductService } from '../catalog/product.service';

// Featured products come from ProductService.featured() — stub it.
const productServiceStub = {
  featured: jest.fn(() => of([])),
};

describe('HomeComponent', () => {
  beforeEach(async () => {
    productServiceStub.featured.mockClear();
    await TestBed.configureTestingModule({
      imports: [HomeComponent],
      providers: [
        provideRouter([]),
        { provide: ProductService, useValue: productServiceStub },
      ],
    }).compileComponents();
  });

  it('creates and renders the hero headline', () => {
    const fixture = TestBed.createComponent(HomeComponent);
    fixture.detectChanges();
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('enciende');
  });

  it('calls featured() on init', () => {
    const fixture = TestBed.createComponent(HomeComponent);
    fixture.detectChanges();
    expect(productServiceStub.featured).toHaveBeenCalled();
  });

  it('shows the empty message when there are no featured products', () => {
    const fixture = TestBed.createComponent(HomeComponent);
    fixture.detectChanges();
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('Aún no hay productos');
  });
});
