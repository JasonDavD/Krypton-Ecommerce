import type { CSSProperties } from 'react';
import { Link, Outlet } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

/**
 * Chrome de la tienda: navbar + footer alrededor del contenido ruteado.
 * Versión placeholder (branded). Se reemplaza por el navbar/footer portados
 * del diseño aprobado en el siguiente paso. Las rutas de auth NO usan este layout.
 */
const link: CSSProperties = { color: 'var(--text-body)', textDecoration: 'none', fontSize: 14.5, fontWeight: 600 };
const cta: CSSProperties = {
  display: 'inline-flex', alignItems: 'center', height: 40, padding: '0 18px', borderRadius: 999,
  background: 'var(--kr-orange-500)', color: '#fff', textDecoration: 'none', fontSize: 14, fontWeight: 700,
};
const linkBtn: CSSProperties = {
  background: 'none', border: 'none', cursor: 'pointer', color: 'var(--kr-navy-800)',
  fontSize: 14.5, fontWeight: 600, fontFamily: 'var(--font-sans)', padding: 0,
};

export function MainLayout() {
  const { isAuthenticated, isAdmin, user, logout } = useAuth();
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <header
        style={{
          position: 'sticky', top: 0, zIndex: 40, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          height: 68, padding: '0 32px', background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(12px)',
          borderBottom: '1px solid var(--border-subtle)',
        }}
      >
        <Link to="/" aria-label="Krypton inicio">
          <img src="/brand/Krypton-navy.svg" alt="Krypton" style={{ height: 26, display: 'block' }} />
        </Link>
        <nav style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          <Link to="/catalogo" style={link}>Catálogo</Link>
          {isAuthenticated && <Link to="/pedidos" style={link}>Mis pedidos</Link>}
          {isAdmin && <Link to="/admin" style={link}>Admin</Link>}
          {isAuthenticated ? (
            <>
              <span style={{ color: 'var(--text-muted)', fontSize: 13.5, maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user?.email}
              </span>
              <button type="button" onClick={logout} style={linkBtn}>Cerrar sesión</button>
            </>
          ) : (
            <>
              <Link to="/cuenta/ingresar" style={link}>Iniciar sesión</Link>
              <Link to="/cuenta/registro" style={cta}>Crear cuenta</Link>
            </>
          )}
        </nav>
      </header>

      <main style={{ flex: 1 }}>
        <Outlet />
      </main>

      <footer style={{ background: 'var(--kr-navy-800)', color: 'rgba(255,255,255,0.7)', padding: '28px 32px', textAlign: 'center', fontSize: 14 }}>
        © {new Date().getFullYear()} Krypton E-commerce. Todos los derechos reservados.
      </footer>
    </div>
  );
}
