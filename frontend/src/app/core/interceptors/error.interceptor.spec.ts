import { TestBed } from '@angular/core/testing';
import { HttpRequest, HttpHandlerFn, HttpErrorResponse } from '@angular/common/http';
import { throwError, of } from 'rxjs';
import { Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { NotificationService } from '../notifications/notification.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { errorInterceptor } from './error.interceptor';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function makeErrorHandler(status: number, body: unknown = {}): HttpHandlerFn {
  return () =>
    throwError(
      () =>
        new HttpErrorResponse({
          status,
          error: body,
        }),
    ) as ReturnType<HttpHandlerFn>;
}

function makeSuccessHandler(): HttpHandlerFn {
  return () => of(new (require('@angular/common/http').HttpResponse)({ status: 200 })) as ReturnType<HttpHandlerFn>;
}

// ---------------------------------------------------------------------------
// ErrorInterceptor — Strict TDD Specs (P3.5 RED)
// ---------------------------------------------------------------------------

describe('errorInterceptor', () => {
  let routerSpy: jest.Mocked<Pick<Router, 'navigate'>>;
  let authSpy: jest.Mocked<Pick<AuthService, 'logout'>>;
  let notificationSpy: jest.Mocked<Pick<NotificationService, 'notify'>>;

  beforeEach(() => {
    routerSpy = { navigate: jest.fn() };
    authSpy = { logout: jest.fn() };
    notificationSpy = { notify: jest.fn() };

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        { provide: Router, useValue: routerSpy },
        { provide: AuthService, useValue: authSpy },
        { provide: NotificationService, useValue: notificationSpy },
      ],
    });
  });

  afterEach(() => {
    localStorage.clear();
  });

  // -------------------------------------------------------------------------
  // Scenario: 401 → logout + redirect to /auth/login
  // -------------------------------------------------------------------------
  it('should call logout and navigate to /auth/login on 401', (done) => {
    const req = new HttpRequest('GET', '/api/orders');

    TestBed.runInInjectionContext(() => {
      errorInterceptor(req, makeErrorHandler(401, { error: 'Unauthorized' })).subscribe({
        error: () => {
          expect(authSpy.logout).toHaveBeenCalledTimes(1);
          expect(routerSpy.navigate).toHaveBeenCalledWith(['/auth/login']);
          done();
        },
      });
    });
  });

  // -------------------------------------------------------------------------
  // Scenario: 403 → do NOT logout, do NOT redirect to login
  // -------------------------------------------------------------------------
  it('should NOT logout and NOT navigate to /auth/login on 403', (done) => {
    const req = new HttpRequest('GET', '/api/admin/users');

    TestBed.runInInjectionContext(() => {
      errorInterceptor(req, makeErrorHandler(403, { error: 'Forbidden' })).subscribe({
        error: () => {
          expect(authSpy.logout).not.toHaveBeenCalled();
          expect(routerSpy.navigate).not.toHaveBeenCalledWith(['/auth/login']);
          done();
        },
      });
    });
  });

  // -------------------------------------------------------------------------
  // Scenario (W1): 403 → notify() called with forbidden message (RED)
  // -------------------------------------------------------------------------
  it('should call notify with forbidden message on 403', (done) => {
    const req = new HttpRequest('GET', '/api/admin/users');

    TestBed.runInInjectionContext(() => {
      errorInterceptor(req, makeErrorHandler(403, { error: 'Forbidden' })).subscribe({
        error: () => {
          expect(notificationSpy.notify).toHaveBeenCalledTimes(1);
          expect(notificationSpy.notify).toHaveBeenCalledWith(
            'No tienes permiso para realizar esta acción',
            'error',
          );
          done();
        },
      });
    });
  });

  // -------------------------------------------------------------------------
  // Triangulation (W1): 401 → notify() is NOT called
  // -------------------------------------------------------------------------
  it('should NOT call notify on 401 (logout handles it)', (done) => {
    const req = new HttpRequest('GET', '/api/orders');

    TestBed.runInInjectionContext(() => {
      errorInterceptor(req, makeErrorHandler(401, { error: 'Unauthorized' })).subscribe({
        error: () => {
          expect(notificationSpy.notify).not.toHaveBeenCalled();
          done();
        },
      });
    });
  });

  // -------------------------------------------------------------------------
  // Scenario: 5xx → re-throw (no special handling)
  // -------------------------------------------------------------------------
  it('should rethrow 500 errors without calling logout or navigate', (done) => {
    const req = new HttpRequest('GET', '/api/products');

    TestBed.runInInjectionContext(() => {
      errorInterceptor(req, makeErrorHandler(500, { error: 'Internal Server Error' })).subscribe({
        error: (err: HttpErrorResponse) => {
          expect(err.status).toBe(500);
          expect(authSpy.logout).not.toHaveBeenCalled();
          done();
        },
      });
    });
  });

  // -------------------------------------------------------------------------
  // Scenario: success → pass through untouched
  // -------------------------------------------------------------------------
  it('should pass through successful responses unchanged', (done) => {
    const req = new HttpRequest('GET', '/api/catalog');

    TestBed.runInInjectionContext(() => {
      errorInterceptor(req, makeSuccessHandler()).subscribe({
        next: (res) => {
          expect(res).toBeDefined();
          done();
        },
      });
    });
  });
});
