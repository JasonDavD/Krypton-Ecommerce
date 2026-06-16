import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { NotificationComponent } from './notification.component';
import { NotificationService, Notification } from './notification.service';

// ---------------------------------------------------------------------------
// Helper: build a minimal NotificationService stub with controllable signal
// ---------------------------------------------------------------------------
function makeNotificationStub(items: Notification[]) {
  const _notifications = signal<Notification[]>(items);
  return {
    notifications: _notifications.asReadonly(),
    notify: jest.fn(),
    dismiss: jest.fn((index: number) => {
      _notifications.update((current) => current.filter((_, i) => i !== index));
    }),
  };
}

// ---------------------------------------------------------------------------
// NotificationComponent — Pragmatic render-tests (W1)
// ---------------------------------------------------------------------------

describe('NotificationComponent', () => {
  async function setup(stub: ReturnType<typeof makeNotificationStub>) {
    await TestBed.configureTestingModule({
      imports: [NotificationComponent],
      providers: [{ provide: NotificationService, useValue: stub }],
    }).compileComponents();

    const fixture: ComponentFixture<NotificationComponent> = TestBed.createComponent(NotificationComponent);
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement;
    return { fixture, el, stub };
  }

  // -------------------------------------------------------------------------
  // Scenario: no notifications → container is not rendered
  // -------------------------------------------------------------------------
  it('should not render the container when there are no notifications', async () => {
    const { el } = await setup(makeNotificationStub([]));
    expect(el.querySelector('.notification-container')).toBeNull();
  });

  // -------------------------------------------------------------------------
  // Scenario: single error notification → renders the message text
  // -------------------------------------------------------------------------
  it('should render the error notification message when service has one', async () => {
    const { el } = await setup(
      makeNotificationStub([{ message: 'No tienes permiso para realizar esta acción', type: 'error' }]),
    );
    expect(el.textContent).toContain('No tienes permiso para realizar esta acción');
  });

  // -------------------------------------------------------------------------
  // Triangulation: info notification renders with data-type="info"
  // -------------------------------------------------------------------------
  it('should render the data-type attribute matching the notification type', async () => {
    const { el } = await setup(
      makeNotificationStub([{ message: 'Operación completada', type: 'info' }]),
    );
    const notifEl = el.querySelector('[data-type="info"]');
    expect(notifEl).not.toBeNull();
    expect(notifEl!.textContent).toContain('Operación completada');
  });

  // -------------------------------------------------------------------------
  // Scenario: multiple notifications → all messages rendered
  // -------------------------------------------------------------------------
  it('should render all notifications when there are multiple', async () => {
    const { el } = await setup(
      makeNotificationStub([
        { message: 'Error de permisos', type: 'error' },
        { message: 'Guardado con éxito', type: 'success' },
      ]),
    );
    expect(el.textContent).toContain('Error de permisos');
    expect(el.textContent).toContain('Guardado con éxito');
    expect(el.querySelectorAll('.notification').length).toBe(2);
  });

  // -------------------------------------------------------------------------
  // Scenario: dismiss button calls service.dismiss() with correct index
  // -------------------------------------------------------------------------
  it('should call dismiss(0) when the first dismiss button is clicked', async () => {
    const stub = makeNotificationStub([
      { message: 'Primer error', type: 'error' },
    ]);
    const { el } = await setup(stub);
    const btn = el.querySelector<HTMLButtonElement>('.notification__dismiss')!;
    btn.click();
    expect(stub.dismiss).toHaveBeenCalledWith(0);
  });
});
