import { TestBed } from '@angular/core/testing';
import { ComingSoonComponent } from './coming-soon.component';
import { ComingSoonService } from './coming-soon.service';

describe('ComingSoonComponent', () => {
  let svc: ComingSoonService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ComingSoonComponent],
    }).compileComponents();
    svc = TestBed.inject(ComingSoonService);
  });

  it('renders nothing while hidden', () => {
    const fixture = TestBed.createComponent(ComingSoonComponent);
    fixture.detectChanges();
    expect((fixture.nativeElement as HTMLElement).querySelector('.cs-card')).toBeNull();
  });

  it('renders the card with title and feature when shown', () => {
    const fixture = TestBed.createComponent(ComingSoonComponent);
    svc.show('Recuperar contraseña');
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('.cs-card')).not.toBeNull();
    expect(el.textContent).toContain('Pendiente por implementar');
    expect(el.textContent).toContain('Recuperar contraseña');
  });

  it('hides when the service hides', () => {
    const fixture = TestBed.createComponent(ComingSoonComponent);
    svc.show();
    fixture.detectChanges();
    svc.hide();
    fixture.detectChanges();
    expect((fixture.nativeElement as HTMLElement).querySelector('.cs-card')).toBeNull();
  });
});
