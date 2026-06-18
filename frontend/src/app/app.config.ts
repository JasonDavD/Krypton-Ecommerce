import { ApplicationConfig, provideZoneChangeDetection, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import {
  LucideAngularModule,
  Zap,
  Truck,
  ShieldCheck,
  Package,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  User,
  Check,
  Construction,
  ShoppingCart,
  Tag,
  Laptop,
  Cpu,
  Headphones,
  Monitor,
  Keyboard,
  Gamepad2,
  Percent,
  BadgeCheck,
  RotateCcw,
} from 'lucide-angular';

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
    // Lucide icons used across the app (registered by kebab-case name in templates)
    importProvidersFrom(
      LucideAngularModule.pick({
        Zap,
        Truck,
        ShieldCheck,
        Package,
        Mail,
        Lock,
        Eye,
        EyeOff,
        ArrowRight,
        User,
        Check,
        Construction,
        ShoppingCart,
        Tag,
        Laptop,
        Cpu,
        Headphones,
        Monitor,
        Keyboard,
        Gamepad2,
        Percent,
        BadgeCheck,
        RotateCcw,
      }),
    ),
  ],
};
