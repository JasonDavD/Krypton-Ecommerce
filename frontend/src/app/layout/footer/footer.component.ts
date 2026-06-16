import { Component } from '@angular/core';

@Component({
  selector: 'app-footer',
  standalone: true,
  template: `
    <footer class="footer">
      <p>&copy; {{ year }} Krypton E-commerce. Todos los derechos reservados.</p>
    </footer>
  `,
  styles: [`
    .footer {
      background-color: #1a1a2e;
      color: #a0a0b0;
      text-align: center;
      padding: 1rem;
      font-size: 0.875rem;
      border-top: 1px solid #2a2a4e;
    }
  `],
})
export class FooterComponent {
  readonly year = new Date().getFullYear();
}
