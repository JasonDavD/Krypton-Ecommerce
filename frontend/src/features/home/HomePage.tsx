import type { CSSProperties } from 'react';
import { Link } from 'react-router-dom';

/**
 * Home (placeholder branded). Hero con la identidad Krypton + CTA al catálogo.
 * La versión completa (categorías, destacados con datos reales, promo, trust)
 * se porta del diseño aprobado en el siguiente paso.
 */
const ctaPri: CSSProperties = {
  display: 'inline-flex', alignItems: 'center', gap: 10, height: 54, padding: '0 28px', borderRadius: 999,
  background: 'linear-gradient(120deg, var(--kr-orange-500), var(--kr-redorange-500))', color: '#fff',
  fontSize: 16, fontWeight: 700, textDecoration: 'none', boxShadow: '0 16px 36px -10px rgba(243,116,2,0.6)',
};

export function HomePage() {
  return (
    <section style={{ position: 'relative', overflow: 'hidden', background: 'radial-gradient(130% 120% at 82% -10%, #0a3a7a 0%, #03275a 46%, #021a3d 100%)' }}>
      <img src="/bg-login.webp" alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', mixBlendMode: 'multiply', opacity: 0.5, pointerEvents: 'none' }} />
      <div style={{ position: 'relative', zIndex: 2, maxWidth: 1200, margin: '0 auto', padding: '96px 32px' }}>
        <div style={{ maxWidth: 620, color: '#fff' }}>
          <span className="kr-eyebrow" style={{ color: 'var(--kr-blue-500)' }}>Tienda de tecnología</span>
          <h1 style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontWeight: 900, fontSize: 64, lineHeight: 0.98, letterSpacing: '-0.025em', margin: '14px 0 20px', color: '#fff' }}>
            Tecnología <span style={{ color: 'var(--kr-orange-500)' }}>que enciende.</span>
          </h1>
          <p style={{ fontSize: 18, lineHeight: 1.6, color: 'rgba(255,255,255,0.72)', margin: '0 0 32px', maxWidth: 480 }}>
            Laptops, componentes y audio de última generación. Armá tu setup con lo mejor de la tecnología.
          </p>
          <Link to="/catalogo" style={ctaPri}>Explorar el catálogo</Link>
        </div>
      </div>
    </section>
  );
}
