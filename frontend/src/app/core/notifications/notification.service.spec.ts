import { TestBed } from '@angular/core/testing';
import { NotificationService, Notification } from './notification.service';

// ---------------------------------------------------------------------------
// NotificationService — Strict TDD Specs (W1 RED)
// ---------------------------------------------------------------------------

describe('NotificationService', () => {
  let service: NotificationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NotificationService);
  });

  // -------------------------------------------------------------------------
  // Scenario: initial state — no notifications
  // -------------------------------------------------------------------------
  it('should start with no notifications', () => {
    expect(service.notifications().length).toBe(0);
  });

  // -------------------------------------------------------------------------
  // Scenario: notify() pushes a message into the signal
  // -------------------------------------------------------------------------
  it('should add an error notification when notify() is called with type error', () => {
    service.notify('No tienes permiso para realizar esta acción', 'error');

    const notifications = service.notifications();
    expect(notifications.length).toBe(1);
    expect(notifications[0].message).toBe('No tienes permiso para realizar esta acción');
    expect(notifications[0].type).toBe('error');
  });

  // -------------------------------------------------------------------------
  // Triangulation: notify() with default type 'info'
  // -------------------------------------------------------------------------
  it('should default to info type when no type is provided', () => {
    service.notify('Operación completada');

    const notifications = service.notifications();
    expect(notifications.length).toBe(1);
    expect(notifications[0].type).toBe('info');
  });

  // -------------------------------------------------------------------------
  // Triangulation: multiple notifications accumulate
  // -------------------------------------------------------------------------
  it('should accumulate multiple notifications', () => {
    service.notify('Error 1', 'error');
    service.notify('Info mensaje', 'info');
    service.notify('Éxito', 'success');

    expect(service.notifications().length).toBe(3);
    expect(service.notifications()[1].message).toBe('Info mensaje');
    expect(service.notifications()[2].type).toBe('success');
  });

  // -------------------------------------------------------------------------
  // Scenario: dismiss() removes a notification by index
  // -------------------------------------------------------------------------
  it('should remove the notification at the given index when dismiss() is called', () => {
    service.notify('Mensaje A', 'error');
    service.notify('Mensaje B', 'info');

    service.dismiss(0);

    const notifications = service.notifications();
    expect(notifications.length).toBe(1);
    expect(notifications[0].message).toBe('Mensaje B');
  });

  // -------------------------------------------------------------------------
  // Triangulation: dismiss() on second item leaves first
  // -------------------------------------------------------------------------
  it('should remove only the specified index', () => {
    service.notify('Primero', 'error');
    service.notify('Segundo', 'info');

    service.dismiss(1);

    const notifications = service.notifications();
    expect(notifications.length).toBe(1);
    expect(notifications[0].message).toBe('Primero');
  });
});
