import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { CatalogFilterComponent } from './catalog-filter.component';
import { CategoryResponse } from '../../models/product.model';
import { CatalogFilter } from '../../models/product.model';

// ---------------------------------------------------------------------------
// Test fixtures
// ---------------------------------------------------------------------------

const mockCategories: CategoryResponse[] = [
  { id: 1, name: 'Electrónica', description: null },
  { id: 2, name: 'Ropa', description: 'Ropa y accesorios' },
];

// ---------------------------------------------------------------------------
// CatalogFilterComponent — pragmatic render tests
// ---------------------------------------------------------------------------

describe('CatalogFilterComponent', () => {
  let fixture: ComponentFixture<CatalogFilterComponent>;
  let component: CatalogFilterComponent;
  let emitted: CatalogFilter[];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CatalogFilterComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CatalogFilterComponent);
    component = fixture.componentInstance;
    component.categories = mockCategories;
    emitted = [];
    component.filterChange.subscribe((f) => emitted.push(f));
    fixture.detectChanges();
  });

  describe('name input — debounce', () => {
    it('emits exactly once after 300ms for rapid keystrokes', fakeAsync(() => {
      // Simulate rapid typing by setting the form control value multiple times
      component.nameControl.setValue('z');
      component.nameControl.setValue('za');
      component.nameControl.setValue('zap');

      // No emission yet — debounce not fired
      expect(emitted.length).toBe(0);

      tick(300);

      // Now exactly one emission with the last value
      expect(emitted.length).toBe(1);
      expect(emitted[0].name).toBe('zap');
    }));

    it('does NOT emit again if the same value is typed twice (distinctUntilChanged)', fakeAsync(() => {
      component.nameControl.setValue('test');
      tick(300);
      const countAfterFirst = emitted.length;

      // Same value again
      component.nameControl.setValue('test');
      tick(300);

      expect(emitted.length).toBe(countAfterFirst); // no new emission
    }));
  });

  describe('category select — immediate emit', () => {
    it('emits immediately with categoryId when a category is selected', () => {
      const select: HTMLSelectElement = fixture.nativeElement.querySelector('select');
      select.value = '1';
      select.dispatchEvent(new Event('change'));

      expect(emitted.length).toBe(1);
      expect(emitted[0].categoryId).toBe(1);
    });

    it('emits with categoryId undefined when "All categories" is selected', () => {
      // First select a category
      const select: HTMLSelectElement = fixture.nativeElement.querySelector('select');
      select.value = '2';
      select.dispatchEvent(new Event('change'));

      // Then reset
      select.value = '';
      select.dispatchEvent(new Event('change'));

      expect(emitted.length).toBe(2);
      expect(emitted[1].categoryId).toBeUndefined();
    });
  });

  describe('composed filter', () => {
    it('includes both name and categoryId when both are set', fakeAsync(() => {
      // Set category first (immediate)
      const select: HTMLSelectElement = fixture.nativeElement.querySelector('select');
      select.value = '2';
      select.dispatchEvent(new Event('change'));

      // Then type a name
      component.nameControl.setValue('zapatos');
      tick(300);

      // Last emission should include both
      const last = emitted[emitted.length - 1];
      expect(last.categoryId).toBe(2);
      expect(last.name).toBe('zapatos');
    }));
  });
});
