import { Injectable, signal } from '@angular/core';

// ---------------------------------------------------------------------------
// Public types
// ---------------------------------------------------------------------------
export type NotificationType = 'error' | 'info' | 'success';

export interface Notification {
  message: string;
  type: NotificationType;
}

// ---------------------------------------------------------------------------
// NotificationService
// Holds the current in-app notifications as a Signal.
// ErrorInterceptor calls notify() on 403; the NotificationComponent reads it.
// ---------------------------------------------------------------------------
@Injectable({ providedIn: 'root' })
export class NotificationService {
  // Private writable signal — the queue of active notifications
  private readonly _notifications = signal<Notification[]>([]);

  // Public read-only signal — consumed by NotificationComponent
  readonly notifications = this._notifications.asReadonly();

  /**
   * Push a notification into the queue.
   * @param message  Human-readable message string.
   * @param type     Visual severity. Defaults to 'info'.
   */
  notify(message: string, type: NotificationType = 'info'): void {
    this._notifications.update((current) => [...current, { message, type }]);
  }

  /**
   * Remove the notification at the given index.
   */
  dismiss(index: number): void {
    this._notifications.update((current) => current.filter((_, i) => i !== index));
  }
}
