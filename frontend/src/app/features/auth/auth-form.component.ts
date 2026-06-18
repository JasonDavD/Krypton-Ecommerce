import { Component, Input, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { AuthService } from '../../core/auth/auth.service';
import { ComingSoonService } from '../../core/coming-soon/coming-soon.service';

/**
 * Presentational + wired auth card (Krypton "Auth v5 immersive").
 * Used by both LoginComponent and RegisterComponent via the `mode` input.
 * Brand tokens come from the global design system (src/styles/design-system,
 * loaded via src/styles.scss). Icons use lucide-angular (registered in
 * app.config). Requires /bg-login.webp and /brand/Krypton-white.svg in /public.
 */
@Component({
  selector: 'app-auth-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, LucideAngularModule],
  styles: [`
    :host { display: block; }
    /* lucide renders an svg with a baseline gap — inline-flex pins it dead-center to the text */
    lucide-icon { display: inline-flex; align-items: center; }
    .kr-in::placeholder { color: var(--kr-gray-400); }
    .kr-in:focus {
      border-color: var(--kr-blue-600) !important;
      background: #fff !important;
      box-shadow: 0 0 0 3px rgba(26,125,215,0.18);
    }
    .kr-cta:hover { filter: brightness(0.96); }
    .kr-cta:active { transform: scale(0.985); }
    .kr-chip {
      display: inline-flex; align-items: center; gap: 8px;
      padding: 10px 16px; border-radius: 999px;
      background: rgba(255,255,255,0.07); border: 1px solid rgba(255,255,255,0.13);
      font-size: 13px; font-weight: 600; color: rgba(255,255,255,0.9);
    }
    .kr-soc {
      display: flex; align-items: center; justify-content: center; gap: 8px;
      flex: 1; height: 48px; border: 1.5px solid var(--border-default);
      border-radius: 12px; background: #fff; cursor: pointer; text-decoration: none;
      font-family: var(--font-sans); font-size: 14px; font-weight: 600; color: var(--text-body);
    }
    .kr-soc:hover { background: var(--kr-gray-50); }
    .kr-field-icon { position: absolute; left: 14px; color: var(--kr-gray-400); pointer-events: none; display: flex; }
    .kr-card-in > * { animation: krRise 520ms var(--ease-out) both; }
    .kr-card-in > *:nth-child(2){ animation-delay: 60ms; }
    .kr-card-in > *:nth-child(3){ animation-delay: 120ms; }
    .kr-card-in > *:nth-child(4){ animation-delay: 180ms; }
    @media (prefers-reduced-motion: reduce){ .kr-card-in > *, .kr-orb { animation: none !important; } }
    @keyframes krFloat  { 0%,100% { transform: translate(0,0); } 50% { transform: translate(0,-26px); } }
    @keyframes krFloat2 { 0%,100% { transform: translate(0,0); } 50% { transform: translate(0, 22px); } }
    @keyframes krRise   { from { transform: translateY(16px); } to { transform: translateY(0); } }
  `],
  template: `
  <div style="position:relative; min-height:100vh; width:100%; font-family:var(--font-sans); overflow:hidden; background:radial-gradient(135% 110% at 80% -10%, #0a3a7a 0%, #03275a 44%, #021a3d 100%); display:flex; flex-direction:column;">

    <!-- background image · multiply blend -->
    <img src="/bg-login.webp" alt="" style="position:fixed; inset:0; z-index:0; width:100%; height:100%; object-fit:cover; mix-blend-mode:multiply; opacity:0.55; pointer-events:none;">
    <div style="position:fixed; inset:0; z-index:0; background:rgba(2,18,55,0.5); pointer-events:none;"></div>

    <!-- glow orbs -->
    <div class="kr-orb" style="position:absolute; top:-150px; right:-120px; width:520px; height:520px; border-radius:50%; background:radial-gradient(circle, rgba(243,116,2,0.32), rgba(3,39,90,0) 64%); filter:blur(8px); pointer-events:none; animation:krFloat 11s ease-in-out infinite;"></div>
    <div class="kr-orb" style="position:absolute; bottom:-200px; left:-140px; width:560px; height:560px; border-radius:50%; background:radial-gradient(circle, rgba(26,125,215,0.40), rgba(3,39,90,0) 66%); filter:blur(8px); pointer-events:none; animation:krFloat2 13s ease-in-out infinite;"></div>

    <header style="position:relative; z-index:2; display:flex; align-items:center; justify-content:space-between; padding:26px 34px;">
      <img src="/brand/Krypton-white.svg" alt="Krypton" style="height:26px;">
    </header>

    <main style="position:relative; z-index:2; flex:1; display:flex; align-items:flex-start; justify-content:center; padding:40px 24px 48px;">
      <div style="display:grid; grid-template-columns:minmax(0,1fr) 460px; gap:64px; align-items:start; width:100%; max-width:1080px;">

        <!-- LEFT · pitch -->
        <div style="color:#fff; min-width:0; min-height:645px; display:flex; flex-direction:column; justify-content:center;">
          <span style="display:inline-flex; align-items:center; gap:8px; font-size:11.5px; font-weight:700; letter-spacing:0.14em; text-transform:uppercase; color:var(--kr-blue-500); margin-bottom:24px;"><lucide-icon name="zap" [size]="16" style="color:var(--kr-yellow-500);"></lucide-icon> Tienda de tecnología</span>
          <h1 style="font-family:var(--font-display); font-weight:900; font-style:italic; font-size:56px; line-height:0.98; letter-spacing:-0.025em; margin:0 0 20px; text-shadow:0 2px 22px rgba(2,18,55,0.45);"><span style="color:#fff;">Tecnología<br>que&ngsp;</span><span style="color:var(--kr-orange-500);">enciende.</span></h1>
          <p style="font-size:16.5px; line-height:1.6; color:rgba(255,255,255,0.66); margin:0 0 34px; max-width:380px;">Crea tu cuenta y arma tu setup en minutos. Lo último en laptops, componentes y audio — a un solo clic.</p>
          <div style="display:flex; gap:10px; flex-wrap:wrap;">
            <span class="kr-chip"><lucide-icon name="truck" [size]="16" style="color:var(--kr-yellow-500);"></lucide-icon> Envío en 24h</span>
            <span class="kr-chip"><lucide-icon name="shield-check" [size]="16" style="color:var(--kr-yellow-500);"></lucide-icon> Pago seguro</span>
            <span class="kr-chip"><lucide-icon name="package" [size]="16" style="color:var(--kr-yellow-500);"></lucide-icon> Garantía oficial</span>
          </div>
        </div>

        <!-- RIGHT · card -->
        <div style="position:relative;">
          <div style="position:absolute; inset:auto 8% -22px 8%; height:46px; border-radius:50%; background:radial-gradient(ellipse, rgba(0,0,0,0.42), rgba(0,0,0,0) 70%); filter:blur(8px);"></div>
          <div style="position:relative; background:#fff; border-radius:26px; padding:34px 34px 30px; box-shadow:0 44px 100px -34px rgba(2,18,55,0.7), 0 0 0 1px rgba(255,255,255,0.6);">

            @if (success()) {
              <div style="display:flex; flex-direction:column; align-items:center; text-align:center; padding:14px 6px 8px;">
                <span style="display:inline-flex; align-items:center; justify-content:center; width:78px; height:78px; border-radius:50%; background:var(--kr-success-bg); color:var(--kr-success); margin-bottom:22px;"><lucide-icon name="check" [size]="40"></lucide-icon></span>
                <h2 style="font-family:var(--font-display); font-weight:800; font-size:27px; letter-spacing:-0.02em; color:var(--text-strong); margin:0 0 10px;">¡Todo listo!</h2>
                <p style="font-size:15px; color:var(--text-muted); line-height:1.6; margin:0 0 26px; max-width:300px;">Tu sesión está activa. Te llevamos al catálogo.</p>
              </div>
            } @else {
              <form class="kr-card-in" [formGroup]="form" (ngSubmit)="submit()">

                <!-- segmented switch -->
                <div style="display:flex; gap:4px; padding:5px; border-radius:999px; background:var(--kr-gray-100); margin-bottom:22px;">
                  <a routerLink="/cuenta/ingresar" [style.flex]="1" [style.height.px]="44" [style.display]="'flex'" [style.alignItems]="'center'" [style.justifyContent]="'center'" [style.borderRadius]="'999px'" [style.textDecoration]="'none'" [style.fontWeight]="700" [style.fontSize.px]="14" [style.background]="isLogin ? '#fff' : 'transparent'" [style.color]="isLogin ? 'var(--kr-navy-800)' : 'var(--text-muted)'" [style.boxShadow]="isLogin ? '0 2px 8px rgba(3,39,90,0.12)' : 'none'">Iniciar sesión</a>
                  <a routerLink="/cuenta/registro" [style.flex]="1" [style.height.px]="44" [style.display]="'flex'" [style.alignItems]="'center'" [style.justifyContent]="'center'" [style.borderRadius]="'999px'" [style.textDecoration]="'none'" [style.fontWeight]="700" [style.fontSize.px]="14" [style.background]="!isLogin ? '#fff' : 'transparent'" [style.color]="!isLogin ? 'var(--kr-navy-800)' : 'var(--text-muted)'" [style.boxShadow]="!isLogin ? '0 2px 8px rgba(3,39,90,0.12)' : 'none'">Crear cuenta</a>
                </div>

                <div>
                  <h2 style="font-family:var(--font-display); font-weight:800; font-size:26px; letter-spacing:-0.02em; color:var(--text-strong); margin:0 0 5px;">{{ isLogin ? 'Bienvenido de nuevo' : 'Crea tu cuenta' }}</h2>
                  <p style="font-size:14.5px; color:var(--text-muted); margin:0;">{{ isLogin ? 'Inicia sesión para continuar con tu compra.' : 'Únete a Krypton y arma tu setup en minutos.' }}</p>
                </div>

                <div style="display:flex; flex-direction:column; gap:15px; margin-top:22px;">

                  @if (!isLogin) {
                    <div style="display:flex; flex-direction:column; gap:7px;">
                      <label for="kr-name" style="font-size:12.5px; font-weight:600; color:var(--text-body);">Nombre completo</label>
                      <div style="position:relative; display:flex; align-items:center;">
                        <lucide-icon name="user" [size]="18" class="kr-field-icon"></lucide-icon>
                        <input id="kr-name" class="kr-in" type="text" formControlName="name" placeholder="Ej. Ana Quispe"
                          style="width:100%; height:50px; padding:0 14px 0 42px; border:1.5px solid var(--border-subtle); border-radius:12px; font-family:var(--font-sans); font-size:15px; color:var(--text-strong); background:var(--kr-gray-50); outline:none;">
                      </div>
                      @if (showError('name')) { <span style="font-size:12px; color:var(--kr-danger);">Ingresa tu nombre completo.</span> }
                    </div>
                  }

                  <div style="display:flex; flex-direction:column; gap:7px;">
                    <label for="kr-email" style="font-size:12.5px; font-weight:600; color:var(--text-body);">Correo electrónico</label>
                    <div style="position:relative; display:flex; align-items:center;">
                      <lucide-icon name="mail" [size]="18" class="kr-field-icon"></lucide-icon>
                      <input id="kr-email" class="kr-in" type="email" formControlName="email" placeholder="tu@correo.com"
                        style="width:100%; height:50px; padding:0 14px 0 42px; border:1.5px solid var(--border-subtle); border-radius:12px; font-family:var(--font-sans); font-size:15px; color:var(--text-strong); background:var(--kr-gray-50); outline:none;">
                    </div>
                    @if (showError('email')) { <span style="font-size:12px; color:var(--kr-danger);">Ingresa un correo válido.</span> }
                  </div>

                  <div style="display:flex; flex-direction:column; gap:7px;">
                    <div style="display:flex; align-items:center; justify-content:space-between;">
                      <label for="kr-password" style="font-size:12.5px; font-weight:600; color:var(--text-body);">Contraseña</label>
                      @if (isLogin) { <a href="#" (click)="$event.preventDefault(); comingSoon.show('Recuperar contraseña')" style="font-size:12.5px; font-weight:600; color:var(--text-link); text-decoration:none;">¿Olvidaste tu contraseña?</a> }
                    </div>
                    <div style="position:relative; display:flex; align-items:center;">
                      <lucide-icon name="lock" [size]="18" class="kr-field-icon"></lucide-icon>
                      <input id="kr-password" class="kr-in" [type]="showPw() ? 'text' : 'password'" formControlName="password" placeholder="••••••••"
                        style="width:100%; height:50px; padding:0 44px 0 42px; border:1.5px solid var(--border-subtle); border-radius:12px; font-family:var(--font-sans); font-size:15px; color:var(--text-strong); background:var(--kr-gray-50); outline:none;">
                      <button type="button" (click)="showPw.set(!showPw())" [attr.aria-label]="showPw() ? 'Ocultar contraseña' : 'Mostrar contraseña'" style="position:absolute; right:9px; width:34px; height:34px; display:flex; align-items:center; justify-content:center; border:none; background:transparent; color:var(--kr-gray-400); cursor:pointer; border-radius:8px;"><lucide-icon [name]="showPw() ? 'eye-off' : 'eye'" [size]="20"></lucide-icon></button>
                    </div>
                    @if (showError('password')) { <span style="font-size:12px; color:var(--kr-danger);">Mínimo 6 caracteres.</span> }
                  </div>

                  @if (!isLogin) {
                    <div style="display:flex; flex-direction:column; gap:7px;">
                      <label for="kr-confirm" style="font-size:12.5px; font-weight:600; color:var(--text-body);">Confirmar contraseña</label>
                      <div style="position:relative; display:flex; align-items:center;">
                        <lucide-icon name="lock" [size]="18" class="kr-field-icon"></lucide-icon>
                        <input id="kr-confirm" class="kr-in" [type]="showPw() ? 'text' : 'password'" formControlName="confirm" placeholder="••••••••"
                          style="width:100%; height:50px; padding:0 14px 0 42px; border:1.5px solid var(--border-subtle); border-radius:12px; font-family:var(--font-sans); font-size:15px; color:var(--text-strong); background:var(--kr-gray-50); outline:none;">
                      </div>
                      @if (form.errors?.['mismatch'] && form.get('confirm')?.touched) { <span style="font-size:12px; color:var(--kr-danger);">Las contraseñas no coinciden.</span> }
                    </div>

                    <div style="display:flex; flex-direction:column; gap:7px;">
                      <label style="display:flex; align-items:flex-start; gap:9px; cursor:pointer; user-select:none;">
                        <input type="checkbox" formControlName="agree" (change)="agreeError.set(false)" style="width:17px; height:17px; margin-top:2px; accent-color:var(--kr-blue-600); cursor:pointer; flex:none;">
                        <span style="font-size:13.5px; color:var(--text-body); line-height:1.45;">Acepto los <a href="#" (click)="$event.preventDefault(); comingSoon.show('Términos y condiciones')" style="color:var(--text-link); text-decoration:none; font-weight:600;">Términos</a> y la <a href="#" (click)="$event.preventDefault(); comingSoon.show('Política de privacidad')" style="color:var(--text-link); text-decoration:none; font-weight:600;">Política de privacidad</a>.</span>
                      </label>
                      @if (agreeError()) { <span style="font-size:12px; color:var(--kr-danger);">Debes aceptar los Términos y la Política para crear tu cuenta.</span> }
                    </div>
                  }

                  @if (isLogin) {
                    <label style="display:flex; align-items:center; gap:9px; cursor:pointer; user-select:none;">
                      <input type="checkbox" formControlName="remember" style="width:17px; height:17px; accent-color:var(--kr-blue-600); cursor:pointer;">
                      <span style="font-size:13.5px; color:var(--text-body);">Mantener sesión iniciada</span>
                    </label>
                  }

                  @if (serverError()) { <div style="font-size:13px; color:var(--kr-danger); background:#fdecec; border-radius:10px; padding:10px 12px;">{{ serverError() }}</div> }

                  <button class="kr-cta" type="submit" [disabled]="loading()"
                    style="position:relative; display:flex; align-items:center; justify-content:center; width:100%; height:56px; border:none; border-radius:999px; background:linear-gradient(120deg, var(--kr-orange-500), var(--kr-redorange-500)); color:#fff; font-family:var(--font-sans); font-weight:700; font-size:16px; cursor:pointer; box-shadow:0 14px 30px -8px rgba(243,116,2,0.62); margin-top:6px;">
                    <span>{{ loading() ? 'Procesando…' : (isLogin ? 'Iniciar sesión' : 'Crear mi cuenta') }}</span>
                    <span style="position:absolute; right:8px; top:50%; transform:translateY(-50%); width:40px; height:40px; border-radius:50%; background:rgba(0,0,0,0.16); display:flex; align-items:center; justify-content:center;"><lucide-icon name="arrow-right" [size]="20"></lucide-icon></span>
                  </button>
                </div>

                <p style="text-align:center; font-size:14px; color:var(--text-muted); margin:22px 0 0;">
                  @if (isLogin) { ¿Aún no tienes cuenta? <a routerLink="/cuenta/registro" style="color:var(--text-link); font-weight:700; text-decoration:none;">Crear cuenta</a> }
                  @else { ¿Ya tienes cuenta? <a routerLink="/cuenta/ingresar" style="color:var(--text-link); font-weight:700; text-decoration:none;">Iniciar sesión</a> }
                </p>

                <!-- social -->
                <div style="display:flex; align-items:center; gap:12px; margin:18px 0; color:var(--text-faint); font-size:13px;">
                  <span style="flex:1; height:1px; background:var(--border-subtle);"></span>o continúa con<span style="flex:1; height:1px; background:var(--border-subtle);"></span>
                </div>
                <div style="display:flex; gap:12px;">
                  <button type="button" class="kr-soc" (click)="comingSoon.show('Acceso con Google')">
                    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.7-6.1 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.3 6.1 29.4 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.3-.4-3.5z"/><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.3 6.1 29.4 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/><path fill="#4CAF50" d="M24 44c5.3 0 10.1-2 13.7-5.3l-6.3-5.3C29.3 35 26.8 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.6 39.6 16.2 44 24 44z"/><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.3-4.2 5.7l6.3 5.3C40.9 35.7 44 30.3 44 24c0-1.3-.1-2.3-.4-3.5z"/></svg>
                    Google
                  </button>
                  <a routerLink="/catalogo" class="kr-soc"><lucide-icon name="user" [size]="18"></lucide-icon> Invitado</a>
                </div>
              </form>
            }
          </div>
        </div>
      </div>
    </main>
  </div>
  `,
})
export class AuthFormComponent {
  @Input() mode: 'login' | 'register' = 'login';

  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);
  protected comingSoon = inject(ComingSoonService);

  loading = signal(false);
  success = signal(false);
  showPw = signal(false);
  serverError = signal<string | null>(null);
  agreeError = signal(false);

  get isLogin(): boolean { return this.mode === 'login'; }

  form = this.fb.group(
    {
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirm: [''],
      agree: [false],
      remember: [true],
    },
    { validators: (g) => (g.get('password')?.value === g.get('confirm')?.value ? null : { mismatch: true }) },
  );

  showError(ctrl: string): boolean {
    const c = this.form.get(ctrl);
    return !!c && c.invalid && c.touched;
  }

  submit(): void {
    this.serverError.set(null);
    this.agreeError.set(false);

    // Validación según el modo
    const required = this.isLogin ? ['email', 'password'] : ['name', 'email', 'password'];
    required.forEach((k) => this.form.get(k)?.markAsTouched());
    if (required.some((k) => this.form.get(k)?.invalid)) return;
    if (!this.isLogin) {
      if (this.form.errors?.['mismatch']) {
        this.form.get('confirm')?.markAsTouched();
        return;
      }
      if (!this.form.value.agree) {
        this.agreeError.set(true);
        return;
      }
    }

    const v = this.form.value;
    this.loading.set(true);

    const obs = this.isLogin
      ? this.auth.login({ email: v.email!, password: v.password! })
      : this.auth.register({ name: v.name!, email: v.email!, password: v.password! });

    obs.subscribe({
      next: () => {
        this.loading.set(false);
        this.success.set(true);
        setTimeout(() => this.router.navigate(['/catalogo']), 1100);
      },
      error: (err) => {
        this.loading.set(false);
        this.serverError.set(
          err?.status === 401
            ? 'Correo o contraseña incorrectos.'
            : 'No se pudo completar la operación. Inténtalo de nuevo.',
        );
      },
    });
  }
}
