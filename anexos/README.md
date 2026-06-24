# Anexos — Krypton E-commerce (EFSRT V)

Material complementario para el informe del proyecto.

## Contenido

| Archivo | Anexo | Qué es |
|---|---|---|
| `anexo-1-DER.html` | 1 | Diagrama Entidad-Relación (8 tablas reales de MySQL) — render Mermaid |
| `anexo-2-arquitectura.html` | 2 | Diagrama de arquitectura de software (n capas en la nube) — render Mermaid |
| `anexo-3-catalogo.html` | 3a | Mockup hi-fi del catálogo de productos |
| `anexo-3-dashboard.html` | 3b | Mockup hi-fi del dashboard de administración |

## Cómo usarlos

1. Abrí cada `.html` con doble clic (se ven en el navegador).
2. Para pegarlos en el informe (Word/PDF), **sacá una captura de pantalla** de cada uno
   (o, en los diagramas Mermaid, podés exportar el SVG con clic derecho sobre el diagrama).
3. Requieren internet para verse perfectos (fuentes Kanit + íconos Lucide se cargan por CDN);
   sin internet igual funcionan, solo con la tipografía/íconos del sistema.

## Notas

- El **DER** refleja el esquema real (incluye el kardex `stock_movement` y los campos de
  facturación/pago de `orders`). El rol CLIENTE/ADMIN es una columna en `users`, no una tabla.
- El **3a/3b son mockups** (prototipos de alta fidelidad) fieles a la app real. Si preferís
  vistas finales auténticas, la app está desplegada en https://krypton-three-iota.vercel.app
  (catálogo y, con `admin@krypton.pe`, el panel `/admin`).
