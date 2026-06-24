# Guion · Parte 1 — Caso de negocio y el problema
**Expositora:** Naomi Velasco Moreto · **Tiempo:** ~4 min · **Slides:** Portada → Agenda → Parte 1 (problema, solución, alcance, proceso)

> Naomi abre la presentación (portada + agenda) y luego desarrolla la Parte 1.

---

### [Slide: Portada]
"Buenas tardes a todos. Somos el equipo de **Krypton E-commerce**, un proyecto del curso EFSRT V de CIBERTEC. Lo desarrollamos entre cinco: Billy, Jason, Edward, Luis y yo, Naomi. Lo que les vamos a mostrar es una **plataforma de comercio electrónico de n capas desplegada en la nube** para una empresa de retail de tecnología."

### [Slide: Agenda]
"La presentación tiene cinco partes: yo arranco con el caso de negocio; Billy sigue con la arquitectura y el modelo de datos; Jason explica el backend; Edward, el frontend; y Luis cierra con el despliegue en la nube y una demo en vivo."

### [Slide: Parte 1 — divisor]
"Empecemos por el porqué del proyecto."

### [Slide: El problema]
"Krypton es un retail de tecnología —vende laptops, smartphones, componentes—, pero su proceso de venta es **presencial y manual**. Eso le trae cuatro problemas concretos: solo vende en el **horario y el lugar** de la tienda; su inventario es propenso a errores porque **no controla el stock en tiempo real**; **no puede atender** a nadie fuera de su zona; y como todo es manual, **no tiene reportes** de ventas ni sabe qué productos se venden más. En una palabra: Krypton no puede escalar."

### [Slide: La solución]
"La solución es un **e-commerce de n capas en la nube** que digitaliza la venta de punta a punta y le da a la administración el control en tiempo real del catálogo, el stock y las ventas. El objetivo general fue diseñar, desarrollar e implementar esa aplicación garantizando tres cosas: **persistencia confiable**, **seguridad transaccional** y **reportes exportables**."

### [Slide: Alcance y actores]
"Dentro del alcance entró todo lo esencial: registro y login con tokens, catálogo con búsqueda y filtros, carrito y checkout con control de stock, panel administrativo, reportes en PDF y Excel, y el despliegue en la nube. **Dejamos fuera** —a propósito, por el plazo— la pasarela de pago real (el pago se **simula**), la app móvil, la logística de envíos y las reseñas. Y hay dos actores: el **cliente**, que compra y consulta sus pedidos; y el **administrador**, que gestiona el catálogo, los pedidos y los reportes."

### [Slide: Proceso de negocio]
"El corazón de todo es el **proceso de venta en línea**: el cliente navega el catálogo, agrega al carrito, hace checkout, se genera la orden descontando el stock, se confirma, y la administración gestiona y reporta la venta. Lo modelamos en BPMN, con dos carriles: Cliente y Administrador. Y acá está la clave que Jason va a profundizar: si la confirmación falla, el stock **no** se descuenta —es todo o nada."

### [Pase a Billy]
"Para que esto funcione bien por dentro, le paso la palabra a Billy, que les va a contar cómo está construido. Billy…"

---

## Preguntas frecuentes
- **¿Por qué se simula el pago?** Por el plazo de tres semanas y porque integrar una pasarela real (Visa/Niubiz) excede el alcance académico; lo importante —la seguridad transaccional del stock— igual se demuestra.
- **¿Quién define los precios y el catálogo?** El administrador, desde el panel.
- **¿Es solo para Lima?** No: justamente al ser web en la nube, rompe la limitación geográfica de la tienda física.
