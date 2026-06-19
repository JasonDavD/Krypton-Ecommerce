import { API_BASE_URL } from './config';

/**
 * Pantalla temporal de verificación: confirma que el design system carga
 * (fuente Kanit, tokens de color, logo, assets). Se reemplaza por el router +
 * las vistas reales en el siguiente paso.
 */
const SWATCHES: ReadonlyArray<[string, string]> = [
  ['Navy', '--kr-navy-800'],
  ['Azul', '--kr-blue-600'],
  ['Naranja', '--kr-orange-500'],
  ['Amarillo', '--kr-yellow-500'],
];

function App() {
  return (
    <main style={{ maxWidth: 880, margin: '0 auto', padding: '72px 24px' }}>
      <img src="/brand/Krypton-navy.svg" alt="Krypton" style={{ height: 40, marginBottom: 28 }} />

      <span className="kr-eyebrow">Frontend React</span>
      <h1
        style={{
          fontFamily: 'var(--font-display)',
          fontStyle: 'italic',
          fontWeight: 900,
          fontSize: 'var(--fs-display)',
          letterSpacing: 'var(--ls-tight)',
          lineHeight: 1,
          margin: '10px 0 18px',
        }}
      >
        Krypton <span style={{ color: 'var(--kr-orange-500)' }}>en React.</span>
      </h1>

      <p style={{ fontSize: 18, color: 'var(--text-muted)', maxWidth: 520, lineHeight: 1.6 }}>
        Vite + React + TypeScript con el design system cargado: tipografía Kanit,
        tokens de marca y assets listos. Próximo: router, auth y las vistas.
      </p>

      <div style={{ display: 'flex', gap: 12, marginTop: 30 }}>
        {SWATCHES.map(([name, token]) => (
          <div
            key={name}
            style={{
              flex: 1,
              height: 84,
              borderRadius: 'var(--radius-md)',
              background: `var(${token})`,
              display: 'flex',
              alignItems: 'flex-end',
              padding: 10,
              color: '#fff',
              fontSize: 13,
              fontWeight: 700,
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            {name}
          </div>
        ))}
      </div>

      <p style={{ marginTop: 30, fontSize: 13, color: 'var(--text-faint)' }}>
        API backend: <code>{API_BASE_URL}</code>
      </p>
    </main>
  );
}

export default App;
