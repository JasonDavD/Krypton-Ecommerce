import { ComingSoonService } from './coming-soon.service';

describe('ComingSoonService', () => {
  let svc: ComingSoonService;

  beforeEach(() => {
    svc = new ComingSoonService();
  });

  it('starts hidden', () => {
    expect(svc.visible()).toBe(false);
    expect(svc.feature()).toBeNull();
  });

  it('show() makes it visible with the feature label', () => {
    svc.show('Recuperar contraseña');
    expect(svc.visible()).toBe(true);
    expect(svc.feature()).toBe('Recuperar contraseña');
  });

  it('show() with no argument is visible with an empty label', () => {
    svc.show();
    expect(svc.visible()).toBe(true);
    expect(svc.feature()).toBe('');
  });

  it('hide() resets to hidden', () => {
    svc.show('x');
    svc.hide();
    expect(svc.visible()).toBe(false);
    expect(svc.feature()).toBeNull();
  });
});
