import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { signal } from '@angular/core';
import { AppComponent } from './app.component';
import { AuthService } from './core/auth/auth.service';
import { NotificationService } from './core/notifications/notification.service';

// Minimal AuthService stub — shell tests only verify structure, not auth logic
const authServiceStub = {
  isAuthenticated: () => false,
  isAdmin: () => false,
  currentUser: () => null,
  logout: jest.fn(),
};

// Minimal NotificationService stub — shell tests verify component is wired in
const notificationServiceStub = {
  notifications: signal([]).asReadonly(),
  notify: jest.fn(),
  dismiss: jest.fn(),
};

describe('AppComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: authServiceStub },
        { provide: NotificationService, useValue: notificationServiceStub },
      ],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

  // navbar/footer moved to MainLayoutComponent — see main-layout.component.spec.ts

  it('should render the router outlet', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector('router-outlet')).not.toBeNull();
  });

  it('should render the notification component', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector('app-notification')).not.toBeNull();
  });
});
