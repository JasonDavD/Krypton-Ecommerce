# Guion · Parte 2 — Arquitectura y modelo de datos
**Expositor:** Billy Muñoz Segura · **Tiempo:** ~4 min · **Slides:** Parte 2 (arquitectura, stack, modelo de datos)

---

### [Slide: Parte 2 — divisor]
"Gracias, Naomi. Yo les voy a contar cómo está construido el sistema por dentro: la arquitectura y el modelo de datos."

### [Slide: Arquitectura]
"El backend usa una **arquitectura por capas con interfaces**, donde las dependencias fluyen hacia abajo: el **controller** recibe la petición REST, se la pasa al **service**, que tiene la lógica; el service usa el **repository** para hablar con la base; y el repository trabaja sobre el **modelo**, las entidades. Tres reglas que respetamos siempre: primero, el controller **nunca** toca la base directamente, siempre pasa por el service. Segundo, las entidades **no se exponen** en la API: lo que viaja son DTOs, y un mapper traduce de entidad a DTO. Y tercero, cada service es **interfaz más implementación**, lo que lo hace fácil de testear y desacoplado."

### [Slide: Stack tecnológico]
"En cuanto a herramientas: el backend es **Spring Boot 3 con Java 17**; el frontend, **React con Vite y TypeScript**; la base de datos es **MySQL 8**, con **Flyway** para versionar el esquema y JPA para el acceso. La seguridad es **Spring Security con JWT y BCrypt**. Los reportes usan **Apache POI** para Excel y **OpenPDF** para PDF. Y para las pruebas, **JUnit, Mockito y Testcontainers**, que levanta un MySQL real."

### [Slide: Modelo de datos]
"El modelo tiene **ocho tablas**: usuarios, categorías, productos, carrito y su detalle, órdenes y su detalle, y los movimientos de stock. Pero más que las tablas, quiero resaltar **tres decisiones de diseño**:
La primera, el **snapshot de precio**: cuando comprás, el detalle de la orden **congela** el precio del momento; el carrito, en cambio, muestra el precio vivo. Así, si mañana sube el precio, una orden vieja no cambia.
La segunda, el **stock cacheado más kardex**: en `products.stock` guardamos el saldo para leerlo rápido, pero la verdad está en `stock_movement`, el historial de entradas y salidas. Es como tu cuenta bancaria: el banco guarda el saldo, pero la verdad son los movimientos.
Y la tercera, **clave técnica versus clave de negocio**: el `id` autoincremental se usa para todas las relaciones; el `sku`, legible, es el que ve el administrador. El SKU nunca se usa como llave foránea."

### [Pase a Jason]
"Con esta base, Jason les va a mostrar cómo funciona el backend en acción, sobre todo la parte transaccional. Jason…"

---

## Preguntas frecuentes
- **¿Por qué MySQL y no PostgreSQL?** El proyecto evolucionó sobre MySQL (incluso usamos funciones propias como `CONVERT_TZ` en los reportes); migrar no aportaba valor y sí riesgo.
- **¿Para qué sirve Flyway?** Versiona el esquema: cada cambio es una migración numerada (V1, V2…) que se aplica sola al arrancar. Hibernate solo valida; Flyway manda.
- **¿Por qué interfaces en los services?** Para poder mockearlos en los tests unitarios y mantener el código desacoplado.
- **¿Qué es el kardex?** El registro histórico de entradas y salidas de inventario; es la fuente de la verdad del stock.
