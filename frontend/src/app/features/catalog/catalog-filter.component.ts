import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { CatalogFilter, CategoryResponse } from '../../models/product.model';

@Component({
  selector: 'app-catalog-filter',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <div class="catalog-filter">
      <!-- Name — debounced internally -->
      <input
        type="text"
        [formControl]="nameControl"
        placeholder="Buscar por nombre..."
        class="catalog-filter__input"
        aria-label="Buscar por nombre"
      />

      <!-- Category — immediate emit -->
      <select
        class="catalog-filter__select"
        aria-label="Categoría"
        (change)="onCategoryChange($event)"
      >
        <option value="">Todas las categorías</option>
        @for (cat of categories; track cat.id) {
          <option [value]="cat.id">{{ cat.name }}</option>
        }
      </select>

      <!-- Price range — immediate emit -->
      <input
        type="number"
        placeholder="Precio mín."
        class="catalog-filter__input catalog-filter__input--price"
        aria-label="Precio mínimo"
        (change)="onPriceChange('priceMin', $event)"
      />
      <input
        type="number"
        placeholder="Precio máx."
        class="catalog-filter__input catalog-filter__input--price"
        aria-label="Precio máximo"
        (change)="onPriceChange('priceMax', $event)"
      />
    </div>
  `,
  styles: [`
    .catalog-filter {
      display: flex;
      flex-wrap: wrap;
      gap: 0.75rem;
      padding: 1rem 0;
    }

    .catalog-filter__input,
    .catalog-filter__select {
      background-color: #12122a;
      border: 1px solid #2a2a4e;
      border-radius: 0.375rem;
      color: #e0e0f0;
      font-size: 0.875rem;
      padding: 0.4rem 0.75rem;
      outline: none;
      transition: border-color 0.2s;
    }

    .catalog-filter__input {
      flex: 1;
      min-width: 180px;
    }

    .catalog-filter__input--price {
      flex: 0 1 130px;
      min-width: 100px;
    }

    .catalog-filter__select {
      flex: 0 1 200px;
    }

    .catalog-filter__input:focus,
    .catalog-filter__select:focus {
      border-color: #e040fb;
    }
  `],
})
export class CatalogFilterComponent implements OnInit, OnDestroy {
  @Input() categories: CategoryResponse[] = [];
  @Output() filterChange = new EventEmitter<CatalogFilter>();

  readonly nameControl = new FormControl<string>('', { nonNullable: true });

  // Internal filter state — composed from all input fields
  private currentFilter: CatalogFilter = {};

  private readonly destroy$ = new Subject<void>();

  ngOnInit(): void {
    // Name input: debounced + deduplicated
    this.nameControl.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe((name) => {
        this.currentFilter = { ...this.currentFilter, name: name || undefined };
        this.filterChange.emit({ ...this.currentFilter });
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onCategoryChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    const categoryId = value ? Number(value) : undefined;
    this.currentFilter = { ...this.currentFilter, categoryId };
    this.filterChange.emit({ ...this.currentFilter });
  }

  onPriceChange(field: 'priceMin' | 'priceMax', event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    const num = value ? Number(value) : undefined;
    this.currentFilter = { ...this.currentFilter, [field]: num };
    this.filterChange.emit({ ...this.currentFilter });
  }
}
