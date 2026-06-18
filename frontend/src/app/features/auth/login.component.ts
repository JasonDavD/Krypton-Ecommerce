import { Component } from '@angular/core';
import { AuthFormComponent } from './auth-form.component';

/**
 * /cuenta/ingresar — referenced by app.routes.ts via loadComponent.
 * Do NOT rename the export.
 */
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [AuthFormComponent],
  template: `<app-auth-form mode="login"></app-auth-form>`,
})
export class LoginComponent {}
