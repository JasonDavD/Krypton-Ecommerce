import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';

import { routes } from './app.routes';
import { environment } from '../environments/environment';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { errorInterceptor } from './core/interceptors/error.interceptor';

// Compile-time check: environment import resolves correctly
export const API_BASE_URL = environment.apiBaseUrl;

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    // Interceptor order: authInterceptor FIRST (attaches Bearer), errorInterceptor LAST (catches 401/403)
    provideHttpClient(withInterceptors([authInterceptor, errorInterceptor])),
  ],
};
