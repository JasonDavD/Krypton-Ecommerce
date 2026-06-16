import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { AuthService } from './auth.service';
import { LoginRequest, RegisterRequest, AuthResponse, UserResponse } from '../../models/auth.model';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Build a minimal JWT with given payload (unsigned — fine for unit tests). */
function buildJwt(payload: Record<string, unknown>): string {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).replace(/=+$/, '');
  const body = btoa(JSON.stringify(payload)).replace(/=+$/, '');
  return `${header}.${body}.fakesig`;
}

const TOKEN_ADMIN = buildJwt({ sub: 'admin@test.com', role: 'ADMIN', exp: Math.floor(Date.now() / 1000) + 3600 });
const TOKEN_CLIENTE = buildJwt({ sub: 'user@test.com', role: 'CLIENTE', exp: Math.floor(Date.now() / 1000) + 3600 });
const TOKEN_EXPIRED = buildJwt({ sub: 'exp@test.com', role: 'ADMIN', exp: Math.floor(Date.now() / 1000) - 1 });

const AUTH_RESPONSE_ADMIN: AuthResponse = { token: TOKEN_ADMIN, tokenType: 'Bearer', expiresIn: 3600 };
const AUTH_RESPONSE_CLIENTE: AuthResponse = { token: TOKEN_CLIENTE, tokenType: 'Bearer', expiresIn: 3600 };

const USER_RESPONSE: UserResponse = {
  id: 1,
  name: 'Test User',
  email: 'user@test.com',
  role: 'CLIENTE',
  active: true,
  createdAt: '2026-06-15T00:00:00Z',
};

// ---------------------------------------------------------------------------
// AuthService — Strict TDD Specs (P3.1 RED)
// ---------------------------------------------------------------------------

describe('AuthService', () => {
  let service: AuthService;
  let http: HttpTestingController;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AuthService],
    });
    service = TestBed.inject(AuthService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    http.verify();
    localStorage.clear();
  });

  // -------------------------------------------------------------------------
  // Initial state
  // -------------------------------------------------------------------------

  it('should start unauthenticated with null signals', () => {
    expect(service.currentUser()).toBeNull();
    expect(service.role()).toBeNull();
    expect(service.isAuthenticated()).toBe(false);
    expect(service.isAdmin()).toBe(false);
  });

  // -------------------------------------------------------------------------
  // login()
  // -------------------------------------------------------------------------

  describe('login()', () => {
    it('should POST to /api/auth/login with credentials', () => {
      const creds: LoginRequest = { email: 'admin@test.com', password: 'pass' };
      service.login(creds).subscribe();
      const req = http.expectOne('/api/auth/login');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(creds);
      req.flush(AUTH_RESPONSE_ADMIN);
    });

    it('should persist token to localStorage on success', () => {
      service.login({ email: 'admin@test.com', password: 'pass' }).subscribe();
      http.expectOne('/api/auth/login').flush(AUTH_RESPONSE_ADMIN);
      expect(localStorage.getItem('token')).toBe(TOKEN_ADMIN);
    });

    it('should set currentUser signal from decoded JWT (ADMIN)', () => {
      service.login({ email: 'admin@test.com', password: 'pass' }).subscribe();
      http.expectOne('/api/auth/login').flush(AUTH_RESPONSE_ADMIN);
      const user = service.currentUser();
      expect(user).not.toBeNull();
      expect(user?.email).toBe('admin@test.com');
    });

    it('should set role signal to ADMIN', () => {
      service.login({ email: 'admin@test.com', password: 'pass' }).subscribe();
      http.expectOne('/api/auth/login').flush(AUTH_RESPONSE_ADMIN);
      expect(service.role()).toBe('ADMIN');
      expect(service.isAdmin()).toBe(true);
      expect(service.isAuthenticated()).toBe(true);
    });

    it('should set role signal to CLIENTE', () => {
      service.login({ email: 'user@test.com', password: 'pass' }).subscribe();
      http.expectOne('/api/auth/login').flush(AUTH_RESPONSE_CLIENTE);
      expect(service.role()).toBe('CLIENTE');
      expect(service.isAdmin()).toBe(false);
    });

    it('should NOT persist token or set signals on error', () => {
      let error: unknown;
      service.login({ email: 'bad@test.com', password: 'wrong' }).subscribe({
        error: (e) => (error = e),
      });
      http.expectOne('/api/auth/login').flush({ error: 'Unauthorized' }, { status: 401, statusText: 'Unauthorized' });
      expect(localStorage.getItem('token')).toBeNull();
      expect(service.currentUser()).toBeNull();
      expect(error).toBeDefined();
    });
  });

  // -------------------------------------------------------------------------
  // register()
  // -------------------------------------------------------------------------

  describe('register()', () => {
    it('should POST to /api/auth/register then auto-login', () => {
      const payload: RegisterRequest = { name: 'New', email: 'user@test.com', password: 'pass' };
      service.register(payload).subscribe();

      const regReq = http.expectOne('/api/auth/register');
      expect(regReq.request.method).toBe('POST');
      expect(regReq.request.body).toEqual(payload);
      regReq.flush(USER_RESPONSE);

      const loginReq = http.expectOne('/api/auth/login');
      expect(loginReq.request.method).toBe('POST');
      loginReq.flush(AUTH_RESPONSE_CLIENTE);
    });

    it('should persist token and set signals after successful registration', () => {
      const payload: RegisterRequest = { name: 'New', email: 'user@test.com', password: 'pass' };
      service.register(payload).subscribe();

      http.expectOne('/api/auth/register').flush(USER_RESPONSE);
      http.expectOne('/api/auth/login').flush(AUTH_RESPONSE_CLIENTE);

      expect(localStorage.getItem('token')).toBe(TOKEN_CLIENTE);
      expect(service.currentUser()?.email).toBe('user@test.com');
      expect(service.role()).toBe('CLIENTE');
    });

    it('should propagate error if register endpoint fails', () => {
      let error: unknown;
      service.register({ name: 'X', email: 'dup@test.com', password: 'pass' }).subscribe({
        error: (e) => (error = e),
      });
      http.expectOne('/api/auth/register').flush({ error: 'Conflict' }, { status: 409, statusText: 'Conflict' });
      http.expectNone('/api/auth/login');
      expect(localStorage.getItem('token')).toBeNull();
      expect(error).toBeDefined();
    });
  });

  // -------------------------------------------------------------------------
  // logout()
  // -------------------------------------------------------------------------

  describe('logout()', () => {
    it('should clear token from localStorage and reset signals', () => {
      service.login({ email: 'admin@test.com', password: 'pass' }).subscribe();
      http.expectOne('/api/auth/login').flush(AUTH_RESPONSE_ADMIN);

      service.logout();

      expect(localStorage.getItem('token')).toBeNull();
      expect(service.currentUser()).toBeNull();
      expect(service.role()).toBeNull();
      expect(service.isAuthenticated()).toBe(false);
    });
  });

  // -------------------------------------------------------------------------
  // Boot rehydration
  // -------------------------------------------------------------------------

  describe('boot rehydration', () => {
    it('should restore signals from a valid token in localStorage', () => {
      localStorage.setItem('token', TOKEN_ADMIN);
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        imports: [HttpClientTestingModule],
        providers: [AuthService],
      });
      const fresh = TestBed.inject(AuthService);
      TestBed.inject(HttpTestingController); // no pending requests expected

      expect(fresh.currentUser()?.email).toBe('admin@test.com');
      expect(fresh.role()).toBe('ADMIN');
      expect(fresh.isAuthenticated()).toBe(true);
    });

    it('should NOT restore signals from an expired token', () => {
      localStorage.setItem('token', TOKEN_EXPIRED);
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        imports: [HttpClientTestingModule],
        providers: [AuthService],
      });
      const fresh = TestBed.inject(AuthService);
      TestBed.inject(HttpTestingController);

      expect(fresh.currentUser()).toBeNull();
      expect(fresh.isAuthenticated()).toBe(false);
      expect(localStorage.getItem('token')).toBeNull();
    });
  });
});
