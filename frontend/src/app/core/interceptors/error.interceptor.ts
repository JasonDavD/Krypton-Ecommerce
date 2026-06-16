import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../auth/auth.service';
import { NotificationService } from '../notifications/notification.service';

/**
 * Functional error interceptor.
 * 401 → AuthService.logout() + router.navigate(['/auth/login'])
 * 403 → notify user ('No tienes permiso...'), re-throw (auth state intact, no redirect)
 * 5xx → re-throw
 * Order: LAST in withInterceptors([authInterceptor, errorInterceptor]).
 */
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const notificationService = inject(NotificationService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        authService.logout();
        router.navigate(['/auth/login']);
      } else if (error.status === 403) {
        // Surface a user-facing notification; do NOT logout, do NOT redirect to login
        notificationService.notify('No tienes permiso para realizar esta acción', 'error');
      }
      // 403 + all other errors: re-throw unchanged
      return throwError(() => error);
    }),
  );
};
