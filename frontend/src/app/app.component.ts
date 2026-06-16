import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './layout/navbar/navbar.component';
import { FooterComponent } from './layout/footer/footer.component';
import { NotificationComponent } from './core/notifications/notification.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, FooterComponent, NotificationComponent],
  template: `
    <app-navbar />
    <main class="main-content">
      <router-outlet />
    </main>
    <app-footer />
    <app-notification />
  `,
  styles: [`
    :host {
      display: flex;
      flex-direction: column;
      min-height: 100vh;
    }

    .main-content {
      flex: 1;
      padding: 1.5rem;
    }
  `],
})
export class AppComponent {}
