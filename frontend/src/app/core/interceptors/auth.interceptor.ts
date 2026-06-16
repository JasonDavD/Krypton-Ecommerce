import { HttpInterceptorFn } from '@angular/common/http';

/**
 * Functional auth interceptor.
 * Attaches `Authorization: Bearer <token>` to every request EXCEPT /api/auth/**.
 * Order: FIRST in withInterceptors([authInterceptor, errorInterceptor]).
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // Public auth endpoints must never receive a stale/invalid token
  if (req.url.includes('/api/auth/')) {
    return next(req);
  }

  const token = localStorage.getItem('token');
  if (!token) {
    return next(req);
  }

  const cloned = req.clone({
    setHeaders: { Authorization: `Bearer ${token}` },
  });
  return next(cloned);
};
