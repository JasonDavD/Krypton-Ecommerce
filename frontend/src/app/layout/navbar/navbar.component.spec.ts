import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { signal, computed } from '@angular/core';
import { NavbarComponent } from './navbar.component';
import { AuthService } from '../../core/auth/auth.service';

// ---------------------------------------------------------------------------
// Helper: build a minimal AuthService stub with controllable signals
// ---------------------------------------------------------------------------
function makeAuthStub(opts: {
  authenticated: boolean;
  email?: string;
  admin?: boolean;
}) {
  const _authenticated = opts.authenticated;
  const _email = opts.email ?? null;
  const _admin = opts.admin ?? false;

  return {
    isAuthenticated: () => _authenticated,
    isAdmin: () => _admin,
    currentUser: () => (_email ? { email: _email, role: _admin ? 'ADMIN' : 'CLIENTE' } : null),
    logout: jest.fn(),
  };
}

describe('NavbarComponent', () => {
  async function setup(authStub: ReturnType<typeof makeAuthStub>) {
    await TestBed.configureTestingModule({
      imports: [NavbarComponent],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: authStub },
      ],
    }).compileComponents();

    const fixture: ComponentFixture<NavbarComponent> = TestBed.createComponent(NavbarComponent);
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement;
    return { fixture, el };
  }

  describe('unauthenticated state', () => {
    it('shows login and register links', async () => {
      const { el } = await setup(makeAuthStub({ authenticated: false }));
      expect(el.textContent).toContain('Iniciar sesión');
      expect(el.textContent).toContain('Registrarse');
    });

    it('does NOT show logout button', async () => {
      const { el } = await setup(makeAuthStub({ authenticated: false }));
      const btn = el.querySelector('.navbar__logout');
      expect(btn).toBeNull();
    });

    it('does NOT show Admin link', async () => {
      const { el } = await setup(makeAuthStub({ authenticated: false }));
      expect(el.textContent).not.toContain('Admin');
    });
  });

  describe('authenticated CLIENTE state', () => {
    it('shows user email and logout button', async () => {
      const { el } = await setup(makeAuthStub({ authenticated: true, email: 'cliente@krypton.pe', admin: false }));
      expect(el.textContent).toContain('cliente@krypton.pe');
      expect(el.querySelector('.navbar__logout')).not.toBeNull();
    });

    it('does NOT show login or register links', async () => {
      const { el } = await setup(makeAuthStub({ authenticated: true, email: 'cliente@krypton.pe', admin: false }));
      expect(el.textContent).not.toContain('Iniciar sesión');
      expect(el.textContent).not.toContain('Registrarse');
    });

    it('does NOT show Admin link', async () => {
      const { el } = await setup(makeAuthStub({ authenticated: true, email: 'cliente@krypton.pe', admin: false }));
      expect(el.textContent).not.toContain('Admin');
    });
  });

  describe('authenticated ADMIN state', () => {
    it('shows Admin link when isAdmin is true', async () => {
      const { el } = await setup(makeAuthStub({ authenticated: true, email: 'admin@krypton.pe', admin: true }));
      expect(el.textContent).toContain('Admin');
    });

    it('shows logout button', async () => {
      const { el } = await setup(makeAuthStub({ authenticated: true, email: 'admin@krypton.pe', admin: true }));
      expect(el.querySelector('.navbar__logout')).not.toBeNull();
    });

    it('calls authService.logout() when logout button clicked', async () => {
      const stub = makeAuthStub({ authenticated: true, email: 'admin@krypton.pe', admin: true });
      const { el } = await setup(stub);
      const btn = el.querySelector<HTMLButtonElement>('.navbar__logout')!;
      btn.click();
      expect(stub.logout).toHaveBeenCalledTimes(1);
    });
  });
});
