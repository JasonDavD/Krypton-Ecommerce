import { TestBed } from '@angular/core/testing';
import { Router, UrlTree } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { adminGuard } from './admin.guard';
import { HttpClientTestingModule } from '@angular/common/http/testing';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const mockRoute = {} as never;
const mockState = {} as never;

// ---------------------------------------------------------------------------
// AdminGuard — Strict TDD Specs (P3.9 RED)
// ---------------------------------------------------------------------------

describe('adminGuard', () => {
  let authServiceStub: { isAuthenticated: jest.Mock; role: jest.Mock };
  let routerSpy: jest.Mocked<Pick<Router, 'createUrlTree'>>;

  beforeEach(() => {
    authServiceStub = {
      isAuthenticated: jest.fn(),
      role: jest.fn(),
    };
    routerSpy = { createUrlTree: jest.fn() };

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        { provide: AuthService, useValue: authServiceStub },
        { provide: Router, useValue: routerSpy },
      ],
    });
  });

  // -------------------------------------------------------------------------
  // Scenario: ADMIN role → allow
  // -------------------------------------------------------------------------
  it('should return true when role is ADMIN', () => {
    authServiceStub.isAuthenticated.mockReturnValue(true);
    authServiceStub.role.mockReturnValue('ADMIN');

    let result: boolean | UrlTree | undefined;
    TestBed.runInInjectionContext(() => {
      result = adminGuard(mockRoute, mockState) as boolean | UrlTree;
    });

    expect(result).toBe(true);
    expect(routerSpy.createUrlTree).not.toHaveBeenCalled();
  });

  // -------------------------------------------------------------------------
  // Scenario: CLIENTE role → redirect (NOT to /auth/login but to /)
  // -------------------------------------------------------------------------
  it('should redirect to / when user is authenticated but role is CLIENTE', () => {
    authServiceStub.isAuthenticated.mockReturnValue(true);
    authServiceStub.role.mockReturnValue('CLIENTE');
    const fakeUrlTree = {} as UrlTree;
    routerSpy.createUrlTree.mockReturnValue(fakeUrlTree);

    let result: boolean | UrlTree | undefined;
    TestBed.runInInjectionContext(() => {
      result = adminGuard(mockRoute, mockState) as boolean | UrlTree;
    });

    expect(routerSpy.createUrlTree).toHaveBeenCalledWith(['/']);
    expect(result).toBe(fakeUrlTree);
  });

  // -------------------------------------------------------------------------
  // Scenario: unauthenticated → redirect to /auth/login
  // -------------------------------------------------------------------------
  it('should redirect to /auth/login when user is not authenticated', () => {
    authServiceStub.isAuthenticated.mockReturnValue(false);
    authServiceStub.role.mockReturnValue(null);
    const fakeUrlTree = {} as UrlTree;
    routerSpy.createUrlTree.mockReturnValue(fakeUrlTree);

    let result: boolean | UrlTree | undefined;
    TestBed.runInInjectionContext(() => {
      result = adminGuard(mockRoute, mockState) as boolean | UrlTree;
    });

    expect(routerSpy.createUrlTree).toHaveBeenCalledWith(['/auth/login']);
    expect(result).toBe(fakeUrlTree);
  });

  // -------------------------------------------------------------------------
  // Scenario: compares raw 'ADMIN' not 'ROLE_ADMIN'
  // -------------------------------------------------------------------------
  it('should compare against raw ADMIN string (not ROLE_ADMIN)', () => {
    authServiceStub.isAuthenticated.mockReturnValue(true);
    // If the code mistakenly checks 'ROLE_ADMIN', this test with 'ADMIN' would fail
    authServiceStub.role.mockReturnValue('ADMIN');

    let result: boolean | UrlTree | undefined;
    TestBed.runInInjectionContext(() => {
      result = adminGuard(mockRoute, mockState) as boolean | UrlTree;
    });

    expect(result).toBe(true);
  });
});
