import { Component, HostListener, inject } from '@angular/core';
import { LucideAngularModule } from 'lucide-angular';
import { ComingSoonService } from './coming-soon.service';

/**
 * Global floating card shown when a not-yet-built action is clicked.
 * Driven by ComingSoonService; mounted once in AppComponent.
 * Dismiss: backdrop click, "Entendido" button, or Escape.
 */
@Component({
  selector: 'app-coming-soon',
  standalone: true,
  imports: [LucideAngularModule],
  template: `
    @if (svc.visible()) {
      <div class="cs-backdrop" (click)="svc.hide()" role="dialog" aria-modal="true" aria-labelledby="cs-title">
        <div class="cs-card" (click)="$event.stopPropagation()">
          <span class="cs-icon"><lucide-icon name="construction" [size]="32"></lucide-icon></span>
          <h2 id="cs-title" class="cs-title">Pendiente por implementar</h2>
          <p class="cs-sub">
            @if (svc.feature()) { <strong>{{ svc.feature() }}</strong> estará disponible pronto. }
            @else { Esta función estará disponible pronto. }
          </p>
          <button type="button" class="cs-btn" (click)="svc.hide()">Entendido</button>
        </div>
      </div>
    }
  `,
  styles: [`
    lucide-icon { display: inline-flex; align-items: center; }

    .cs-backdrop {
      position: fixed; inset: 0; z-index: 1100;
      display: flex; align-items: center; justify-content: center; padding: 24px;
      background: rgba(2, 18, 55, 0.55);
      backdrop-filter: blur(3px);
      animation: csFade 180ms var(--ease-out) both;
    }
    .cs-card {
      width: 100%; max-width: 360px; text-align: center;
      background: var(--surface-card);
      border-radius: var(--radius-xl);
      padding: 36px 32px 30px;
      box-shadow: var(--shadow-lg);
      font-family: var(--font-sans);
      animation: csRise 240ms var(--ease-out) both;
    }
    .cs-icon {
      display: inline-flex; align-items: center; justify-content: center;
      width: 72px; height: 72px; margin-bottom: 20px;
      border-radius: 50%;
      background: var(--kr-orange-100);
      color: var(--kr-orange-600);
    }
    .cs-title {
      font-family: var(--font-display); font-weight: 800;
      font-size: var(--fs-h4); letter-spacing: var(--ls-tight);
      color: var(--text-strong); margin: 0 0 8px;
    }
    .cs-sub {
      font-size: 14.5px; line-height: 1.55;
      color: var(--text-muted); margin: 0 0 24px;
    }
    .cs-sub strong { color: var(--text-body); font-weight: 700; }
    .cs-btn {
      width: 100%; height: 50px; border: none; border-radius: var(--radius-pill);
      background: var(--action-primary); color: var(--text-on-brand);
      font-family: var(--font-sans); font-weight: 700; font-size: 15px; cursor: pointer;
      transition: background var(--dur-fast) var(--ease-out);
    }
    .cs-btn:hover { background: var(--action-primary-hover); }

    @keyframes csFade { from { opacity: 0; } to { opacity: 1; } }
    @keyframes csRise { from { opacity: 0; transform: translateY(12px) scale(0.98); } to { opacity: 1; transform: translateY(0) scale(1); } }
    @media (prefers-reduced-motion: reduce) {
      .cs-backdrop, .cs-card { animation: none !important; }
    }
  `],
})
export class ComingSoonComponent {
  protected readonly svc = inject(ComingSoonService);

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.svc.hide();
  }
}
