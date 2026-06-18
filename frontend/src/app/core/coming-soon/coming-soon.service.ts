import { Injectable, computed, signal } from '@angular/core';

/**
 * Drives the global "Pendiente por implementar" floating card.
 * Any placeholder action (links/buttons without a real implementation yet)
 * calls show() to surface a branded modal instead of dead-ending on href="#".
 */
@Injectable({ providedIn: 'root' })
export class ComingSoonService {
  // null = hidden. A string (possibly empty) = visible, naming the feature.
  private readonly _feature = signal<string | null>(null);

  readonly feature = this._feature.asReadonly();
  readonly visible = computed(() => this._feature() !== null);

  /** Open the card. @param feature optional human label of what's pending. */
  show(feature = ''): void {
    this._feature.set(feature);
  }

  hide(): void {
    this._feature.set(null);
  }
}
