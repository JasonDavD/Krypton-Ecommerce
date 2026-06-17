import { TestBed } from '@angular/core/testing';
import { Router, UrlTree } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { authGuard } from './auth.guard';
import { HttpClientTestingModule } from '@angular/common/http/testing';

// ---------------------------------------------------------------------------
// Helpers — build minimal ActivatedRouteSnapshot / RouterStateSnapshot stubs
// ---------------------------------------------------------------------------
const mockRoute = {} as never;
const mockState = {} as never;

// ---------------------------------------------------------------------------
// AuthGuard — Strict TDD Specs (P3.7 RED)
// ---------------------------------------------------------------------------

describe('authGuard', () => {
  let authServiceStub: { isAuthenticated: jest.Mock };
  let routerSpy: jest.Mocked<Pick<Router, 'createUrlTree'>>;

  beforeEach(() => {
    authServiceStub = { isAuthenticated: jest.fn() };
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
  // Scenario: Authenticated → allow
  // -------------------------------------------------------------------------
  it('should return true when user is authenticated', () => {
    authServiceStub.isAuthenticated.mockReturnValue(true);

    let result: boolean | UrlTree | undefined;
    TestBed.runInInjectionContext(() => {
      result = authGuard(mockRoute, mockState) as boolean | UrlTree;
    });

    expect(result).toBe(true);
    expect(routerSpy.createUrlTree).not.toHaveBeenCalled();
  });

  // -------------------------------------------------------------------------
  // Scenario: Unauthenticated → redirect to /cuenta/ingresar
  // -------------------------------------------------------------------------
  it('should return a UrlTree to /cuenta/ingresar when user is not authenticated', () => {
    authServiceStub.isAuthenticated.mockReturnValue(false);
    const fakeUrlTree = {} as UrlTree;
    routerSpy.createUrlTree.mockReturnValue(fakeUrlTree);

    let result: boolean | UrlTree | undefined;
    TestBed.runInInjectionContext(() => {
      result = authGuard(mockRoute, mockState) as boolean | UrlTree;
    });

    expect(routerSpy.createUrlTree).toHaveBeenCalledWith(['/cuenta/ingresar']);
    expect(result).toBe(fakeUrlTree);
  });
});
