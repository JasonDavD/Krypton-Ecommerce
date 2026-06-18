import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { MainLayoutComponent } from './main-layout.component';
import { AuthService } from '../core/auth/auth.service';

// Navbar (rendered by the layout) injects AuthService — minimal stub for structure tests.
const authServiceStub = {
  isAuthenticated: () => false,
  isAdmin: () => false,
  currentUser: () => null,
  logout: jest.fn(),
};

describe('MainLayoutComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MainLayoutComponent],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: authServiceStub },
      ],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(MainLayoutComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should render the navbar', () => {
    const fixture = TestBed.createComponent(MainLayoutComponent);
    fixture.detectChanges();
    expect((fixture.nativeElement as HTMLElement).querySelector('app-navbar')).not.toBeNull();
  });

  it('should render the footer', () => {
    const fixture = TestBed.createComponent(MainLayoutComponent);
    fixture.detectChanges();
    expect((fixture.nativeElement as HTMLElement).querySelector('app-footer')).not.toBeNull();
  });

  it('should render the router outlet', () => {
    const fixture = TestBed.createComponent(MainLayoutComponent);
    fixture.detectChanges();
    expect((fixture.nativeElement as HTMLElement).querySelector('router-outlet')).not.toBeNull();
  });
});
