import { Component, inject } from '@angular/core';
import { NotificationService } from './notification.service';

/**
 * NotificationComponent — toast/banner display for in-app notifications.
 * Reads from NotificationService signal and renders active notifications.
 * Consumed by AppComponent shell.
 */
@Component({
  selector: 'app-notification',
  standalone: true,
  template: `
    @if (notificationService.notifications().length > 0) {
      <div class="notification-container" role="status" aria-live="polite">
        @for (notification of notificationService.notifications(); track $index) {
          <div
            class="notification notification--{{ notification.type }}"
            [attr.data-type]="notification.type"
          >
            <span class="notification__message">{{ notification.message }}</span>
            <button
              class="notification__dismiss"
              (click)="dismiss($index)"
              aria-label="Cerrar notificación"
            >
              &times;
            </button>
          </div>
        }
      </div>
    }
  `,
  styles: [`
    .notification-container {
      position: fixed;
      top: 1rem;
      right: 1rem;
      z-index: 1000;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      max-width: 24rem;
    }

    .notification {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 0.75rem;
      padding: 0.75rem 1rem;
      border-radius: 0.375rem;
      font-size: 0.875rem;
      color: #fff;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
    }

    .notification--error {
      background-color: #c62828;
      border-left: 4px solid #e53935;
    }

    .notification--info {
      background-color: #1565c0;
      border-left: 4px solid #1e88e5;
    }

    .notification--success {
      background-color: #2e7d32;
      border-left: 4px solid #43a047;
    }

    .notification__message {
      flex: 1;
    }

    .notification__dismiss {
      background: transparent;
      border: none;
      color: rgba(255, 255, 255, 0.8);
      cursor: pointer;
      font-size: 1.125rem;
      line-height: 1;
      padding: 0;
      transition: color 0.2s;
    }

    .notification__dismiss:hover {
      color: #fff;
    }
  `],
})
export class NotificationComponent {
  protected readonly notificationService = inject(NotificationService);

  dismiss(index: number): void {
    this.notificationService.dismiss(index);
  }
}
