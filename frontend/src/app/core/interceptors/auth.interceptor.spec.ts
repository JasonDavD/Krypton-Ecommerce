import { TestBed } from '@angular/core/testing';
import { HttpRequest, HttpHandlerFn, HttpEvent, HttpResponse } from '@angular/common/http';
import { of } from 'rxjs';
import { authInterceptor } from './auth.interceptor';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function makeHandler(capturedReq: { value: HttpRequest<unknown> | null }): HttpHandlerFn {
  return (req: HttpRequest<unknown>) => {
    capturedReq.value = req;
    return of(new HttpResponse({ status: 200 })) as ReturnType<HttpHandlerFn>;
  };
}

// ---------------------------------------------------------------------------
// AuthInterceptor — Strict TDD Specs (P3.3 RED)
// ---------------------------------------------------------------------------

describe('authInterceptor', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
  });

  afterEach(() => {
    localStorage.clear();
  });

  // -------------------------------------------------------------------------
  // Scenario: Authenticated request → header present
  // -------------------------------------------------------------------------
  it('should add Authorization Bearer header when token is in localStorage', () => {
    localStorage.setItem('token', 'my-jwt-token');

    const captured: { value: HttpRequest<unknown> | null } = { value: null };
    const req = new HttpRequest('GET', '/api/orders');

    TestBed.runInInjectionContext(() => {
      authInterceptor(req, makeHandler(captured)).subscribe();
    });

    expect(captured.value?.headers.get('Authorization')).toBe('Bearer my-jwt-token');
  });

  // -------------------------------------------------------------------------
  // Scenario: Public endpoint bypass → /api/auth/** does NOT get the header
  // -------------------------------------------------------------------------
  it('should NOT add Authorization header for /api/auth/login', () => {
    localStorage.setItem('token', 'my-jwt-token');

    const captured: { value: HttpRequest<unknown> | null } = { value: null };
    const req = new HttpRequest('POST', '/api/auth/login', {});

    TestBed.runInInjectionContext(() => {
      authInterceptor(req, makeHandler(captured)).subscribe();
    });

    expect(captured.value?.headers.has('Authorization')).toBe(false);
  });

  it('should NOT add Authorization header for /api/auth/register', () => {
    localStorage.setItem('token', 'my-jwt-token');

    const captured: { value: HttpRequest<unknown> | null } = { value: null };
    const req = new HttpRequest('POST', '/api/auth/register', {});

    TestBed.runInInjectionContext(() => {
      authInterceptor(req, makeHandler(captured)).subscribe();
    });

    expect(captured.value?.headers.has('Authorization')).toBe(false);
  });

  // -------------------------------------------------------------------------
  // Scenario: No token → header absent
  // -------------------------------------------------------------------------
  it('should NOT add Authorization header when no token is stored', () => {
    const captured: { value: HttpRequest<unknown> | null } = { value: null };
    const req = new HttpRequest('GET', '/api/products');

    TestBed.runInInjectionContext(() => {
      authInterceptor(req, makeHandler(captured)).subscribe();
    });

    expect(captured.value?.headers.has('Authorization')).toBe(false);
  });

  // -------------------------------------------------------------------------
  // Sanity: original request is not mutated (clone was used)
  // -------------------------------------------------------------------------
  it('should pass through the request unchanged when no token and no auth path', () => {
    const captured: { value: HttpRequest<unknown> | null } = { value: null };
    const req = new HttpRequest('GET', '/api/catalog');

    TestBed.runInInjectionContext(() => {
      authInterceptor(req, makeHandler(captured)).subscribe();
    });

    expect(captured.value?.url).toBe('/api/catalog');
  });
});
