import { Injectable, computed, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, switchMap, tap, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import {
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  Role,
  UserResponse,
} from '../../models/auth.model';
import { environment } from '../../../environments/environment';

// ---------------------------------------------------------------------------
// Internal JWT payload shape (what we decode from the token)
// ---------------------------------------------------------------------------
interface JwtPayload {
  sub: string;   // email
  role: string;  // 'ADMIN' | 'CLIENTE'
  exp: number;   // expiration unix timestamp (seconds)
  iat?: number;
}

// Minimal shape we store in the currentUser signal.
// We build it from the decoded JWT because AuthResponse does NOT carry user data.
interface AuthenticatedUser {
  email: string;
  role: Role;
}

// ---------------------------------------------------------------------------
// AuthService
// ---------------------------------------------------------------------------

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly TOKEN_KEY = 'token';
  private readonly LOGIN_URL = `${environment.apiBaseUrl}/api/auth/login`;
  private readonly REGISTER_URL = `${environment.apiBaseUrl}/api/auth/register`;

  // Private writable signals
  private readonly _currentUser = signal<AuthenticatedUser | null>(null);
  private readonly _role = signal<Role | null>(null);

  // Public read-only signals
  readonly currentUser = this._currentUser.asReadonly();
  readonly role = this._role.asReadonly();

  // Computed derived signals
  readonly isAuthenticated = computed(() => this._currentUser() !== null);
  readonly isAdmin = computed(() => this._role() === 'ADMIN');

  constructor(private readonly http: HttpClient) {
    this.rehydrate();
  }

  // ---------------------------------------------------------------------------
  // login — POST /api/auth/login → AuthResponse{token} → decode JWT → signals
  // ---------------------------------------------------------------------------
  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(this.LOGIN_URL, credentials).pipe(
      tap((res) => this.handleAuthResponse(res)),
    );
  }

  // ---------------------------------------------------------------------------
  // register — POST /api/auth/register → UserResponse → auto-login → signals
  // ---------------------------------------------------------------------------
  register(payload: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<UserResponse>(this.REGISTER_URL, payload).pipe(
      switchMap(() =>
        this.http.post<AuthResponse>(this.LOGIN_URL, {
          email: payload.email,
          password: payload.password,
        }),
      ),
      tap((res) => this.handleAuthResponse(res)),
      catchError((err) => {
        // If the register call itself failed we must NOT emit a login request.
        // switchMap already short-circuits on error, so just rethrow.
        return throwError(() => err);
      }),
    );
  }

  // ---------------------------------------------------------------------------
  // logout — clears storage + resets signals
  // ---------------------------------------------------------------------------
  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    this._currentUser.set(null);
    this._role.set(null);
  }

  // ---------------------------------------------------------------------------
  // Private helpers
  // ---------------------------------------------------------------------------

  /** Decode a JWT payload (base64url). Does NOT verify signature (browser-side). */
  private decodeToken(token: string): JwtPayload | null {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return null;
      // base64url → base64 → decode
      const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
      const json = atob(base64);
      return JSON.parse(json) as JwtPayload;
    } catch {
      return null;
    }
  }

  /** Returns true if the token is NOT expired. */
  private isTokenValid(payload: JwtPayload): boolean {
    const nowSec = Math.floor(Date.now() / 1000);
    return payload.exp > nowSec;
  }

  /** Persist token + populate signals from a successful AuthResponse. */
  private handleAuthResponse(res: AuthResponse): void {
    const payload = this.decodeToken(res.token);
    if (!payload || !this.isTokenValid(payload)) {
      // Received an expired or invalid token — treat as failure
      return;
    }
    localStorage.setItem(this.TOKEN_KEY, res.token);
    const role = payload.role as Role;
    this._currentUser.set({ email: payload.sub, role });
    this._role.set(role);
  }

  /** On service construction: read token from localStorage, rehydrate if valid. */
  private rehydrate(): void {
    const token = localStorage.getItem(this.TOKEN_KEY);
    if (!token) return;

    const payload = this.decodeToken(token);
    if (!payload || !this.isTokenValid(payload)) {
      // Stale or invalid token — clear it
      localStorage.removeItem(this.TOKEN_KEY);
      return;
    }

    const role = payload.role as Role;
    this._currentUser.set({ email: payload.sub, role });
    this._role.set(role);
  }
}
