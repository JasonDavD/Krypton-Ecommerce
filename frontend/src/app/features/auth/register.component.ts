import { Component } from '@angular/core';
import { AuthFormComponent } from './auth-form.component';

/**
 * /cuenta/registro — referenced by app.routes.ts via loadComponent.
 * Do NOT rename the export.
 */
@Component({
  selector: 'app-register',
  standalone: true,
  imports: [AuthFormComponent],
  template: `<app-auth-form mode="register"></app-auth-form>`,
})
export class RegisterComponent {}
