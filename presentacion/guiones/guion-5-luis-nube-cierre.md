# Guion · Parte 5 — Nube, versionamiento y demo
**Expositor:** Luis Curi de la Peña · **Tiempo:** ~4-5 min + demo · **Slides:** Parte 5 (despliegue, versionamiento, demo, cierre, gracias)

> Luis cierra. Tener la app YA abierta en otra pestaña y el backend "despierto" (entrar una vez antes, por el cold start del free tier).

---

### [Slide: Parte 5 — divisor]
"Gracias, Edward. Para cerrar, les muestro cómo está desplegado y se los enseño funcionando."

### [Slide: Despliegue en la nube]
"La aplicación está dividida en tres servicios, todos en la nube y en capa gratuita: el **backend** corre en **Render**, dentro de un contenedor Docker, con su perfil de producción y sus variables de entorno; la **base de datos** es un **MySQL gestionado en Aiven**, donde Flyway aplicó solo todas las migraciones al primer arranque; y el **frontend** está en **Vercel**, como build estático, apuntando al backend por variable de entorno. La tienda está viva en **krypton-three-iota.vercel.app**."

### [Slide: Versionamiento y metodología]
"En cuanto a la gestión del proyecto: trabajamos con **Git y GitHub**, una rama por funcionalidad y Pull Requests revisables antes de integrar; usamos **commits convencionales** —feat, fix, chore, docs— para que la historia se entienda; y avanzamos **por incrementos**, integrando cada funcionalidad por su propio Pull Request."

### [Slide: Demo en vivo]
"Ahora sí, veámoslo funcionando."
**[Cambiar a la pestaña del navegador. Recorrido sugerido — no más de 2-3 minutos:]**
1. Catálogo → buscar/filtrar → entrar a un producto.
2. Agregar al carrito → ir al carrito → checkout (elegir boleta) → pagar con tarjeta → **descargar el comprobante**.
3. Entrar al admin con `admin@krypton.pe` / `Admin123!` → mostrar un producto, un pedido y un reporte (descargar PDF o Excel).
> Si el backend tarda en la primera respuesta, comentar: "es el cold start del plan gratuito de Render; ya se despertó".

### [Slide: Cierre — lo que logramos]
"Para cerrar: logramos un **e-commerce completo, de n capas, desplegado y funcionando en la nube**; con **seguridad transaccional real** en el checkout y un backend construido bajo Strict TDD; y un panel administrativo con CRUD, reportes en PDF y Excel, y control de stock con kardex."

### [Slide: Gracias]
"Eso es Krypton. Muchas gracias por su atención."

---

## Preguntas frecuentes
- **¿Cuánto cuesta tenerlo en la nube?** Cero: Render, Aiven y Vercel tienen capa gratuita sin tarjeta. El backend free se "duerme" tras inactividad y tarda unos segundos en el primer pedido.
- **¿Los datos se pierden?** No: la base está en Aiven, persistente. (Solo las imágenes subidas como archivo no persisten en el plan free; por eso se pueden cargar por URL externa.)
- **¿Cómo se actualiza la app?** Cada merge a `main` dispara el redeploy automático en Render y Vercel.
- **¿Qué es k6?** Una herramienta de pruebas de carga: simula muchos usuarios concurrentes para medir si el catálogo aguanta. Es el siguiente paso.
- **¿Tienen tests?** Sí, el backend bajo Strict TDD con suite en verde (unit, web slice e integración con MySQL real).
