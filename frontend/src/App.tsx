import { Navigate, Route, Routes } from 'react-router-dom';
import { MainLayout } from './app/MainLayout';
import { HomePage } from './features/home/HomePage';
import { LoginPage } from './features/auth/LoginPage';
import { RegisterPage } from './features/auth/RegisterPage';
import { Placeholder } from './components/Placeholder';

/**
 * Mapa de rutas. Dos shells:
 *  - /cuenta/** → bare (auth inmersiva, sin navbar/footer)
 *  - resto → MainLayout (navbar + footer)
 * Las vistas placeholder se reemplazan por las portadas del diseño aprobado.
 */
function App() {
  return (
    <Routes>
      {/* Auth (sin chrome) */}
      <Route path="/cuenta/ingresar" element={<LoginPage />} />
      <Route path="/cuenta/registro" element={<RegisterPage />} />

      {/* Tienda (con navbar + footer) */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/catalogo" element={<Placeholder title="Catálogo" />} />
        <Route path="/catalogo/:id" element={<Placeholder title="Detalle de producto" />} />
        <Route path="/carrito" element={<Placeholder title="Carrito" />} />
        <Route path="/pedidos" element={<Placeholder title="Mis pedidos" />} />
        <Route path="/admin" element={<Placeholder title="Admin" />} />
        <Route path="/reportes" element={<Placeholder title="Reportes" />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}

export default App;
