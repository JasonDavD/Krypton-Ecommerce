import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NotificationComponent } from './core/notifications/notification.component';
import { ComingSoonComponent } from './core/coming-soon/coming-soon.component';

/**
 * Root shell. Intentionally bare: the storefront chrome (navbar/footer) lives
 * in MainLayoutComponent, which wraps only the tienda routes. Auth routes render
 * full-screen without chrome. The notification host stays global so toasts work
 * on every route.
 */
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NotificationComponent, ComingSoonComponent],
  template: `
    <router-outlet />
    <app-notification />
    <app-coming-soon />
  `,
})
export class AppComponent {}
