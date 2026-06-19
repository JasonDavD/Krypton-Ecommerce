import type { CSSProperties } from 'react';

const wrap: CSSProperties = { maxWidth: 1200, margin: '0 auto', padding: '72px 32px', textAlign: 'center' };

/** Página temporal mientras se porta la vista real. */
export function Placeholder({ title }: { title: string }) {
  return (
    <div style={wrap}>
      <h1 style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', color: 'var(--text-strong)' }}>{title}</h1>
      <p style={{ color: 'var(--text-muted)' }}>Próximamente — vista en construcción.</p>
    </div>
  );
}
