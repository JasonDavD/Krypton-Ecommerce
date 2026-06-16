import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';

/**
 * Functional guard that protects admin routes.
 * - Unauthenticated → /auth/login
 * - Authenticated but role !== 'ADMIN' → / (home)
 * - role === 'ADMIN' → allow
 *
 * Compares against the RAW JWT claim value 'ADMIN', NOT 'ROLE_ADMIN'.
 * (JwtService.generateToken stores `.claim("role", role.name())` = 'ADMIN'/'CLIENTE')
 */
export const adminGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isAuthenticated()) {
    return router.createUrlTree(['/auth/login']);
  }

  if (authService.role() === 'ADMIN') {
    return true;
  }

  // Authenticated but not ADMIN → redirect to home
  return router.createUrlTree(['/']);
};
