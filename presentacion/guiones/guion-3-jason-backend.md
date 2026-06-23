# Guion · Parte 3 — Backend: API, seguridad y pruebas
**Expositor:** Jason Dávila Delgado · **Tiempo:** ~5 min · **Slides:** Parte 3 (API REST, seguridad, checkout transaccional, pruebas)

> Es la parte más técnica. Hablá tranquilo; el checkout transaccional es el momento fuerte.

---

### [Slide: Parte 3 — divisor]
"Gracias, Billy. Yo me voy a meter en el backend: cómo expone la API, cómo se asegura, y la pieza que más nos importaba —el checkout— además de cómo lo probamos."

### [Slide: API REST]
"La API es **REST**, organizada por recurso: `/api/products` para el catálogo, `/api/cart` para el carrito, `/api/orders` para los pedidos, y todo lo administrativo bajo `/api/admin`. Algo importante: la entrada y la salida **siempre** son DTOs —records de Java—, nunca la entidad de base de datos. Eso desacopla el contrato JSON del modelo interno: puedo cambiar la base sin romperle el contrato al frontend. Y el manejo de errores está **centralizado** en un solo lugar, así que las respuestas son consistentes: un 400 si el dato es inválido, 401 si no estás autenticado, 404 si no existe, 409 o 422 según la regla de negocio."

### [Slide: Seguridad]
"La autenticación es con **JWT**. Cuando hacés login, el backend te devuelve un token firmado, y el frontend lo manda en cada petición como Bearer. Las contraseñas nunca se guardan en texto plano: van hasheadas con **BCrypt**. Y hay **dos roles**: CLIENTE y ADMIN. Todo lo que cuelga de `/api/admin` exige rol ADMIN: si entrás sin token es 401, y si entrás con un rol que no corresponde, es 403."

### [Slide: Checkout transaccional] ← MOMENTO CLAVE
"Y acá llegamos al corazón del sistema. El checkout es **una sola transacción atómica**. Cuando el cliente confirma la compra, dentro de esa transacción pasan cuatro cosas: se crea la **orden** con sus ítems, copiando el precio del momento —el snapshot que mencionó Billy—; por cada ítem se registra una **salida en el kardex**; se **descuenta** el stock; y se **vacía** el carrito.
Lo importante es esto: **o pasan las cuatro, o no pasa ninguna**. Si en el medio falla algo —por ejemplo, no hay stock suficiente—, se revierte **todo** con un rollback. Nunca queda una venta a medias ni se vende algo sin descontarlo del inventario. Por eso el kardex y el stock siempre cuadran. Esto es, textualmente, el requisito de **seguridad transaccional** de la rúbrica."

### [Slide: Pruebas]
"Y todo esto no lo escribimos a la confianza: el backend se construyó con **Strict TDD** —primero el test que falla, después el código que lo hace pasar, y recién ahí se refactoriza—. Tenemos tres niveles: **unitarios** con JUnit y Mockito para la lógica de los services; **web slice** con MockMvc para el contrato HTTP; y de **integración** con Testcontainers, que levanta un **MySQL real** en Docker, para probar el flujo completo con paridad de producción. Eso nos dio la confianza de tocar el checkout sin romper nada."

### [Pase a Edward]
"Todo esto se consume desde una interfaz. Edward les va a mostrar cómo se ve del lado del usuario. Edward…"

---

## Preguntas frecuentes
- **¿Qué pasa si dos personas compran el último producto a la vez?** La transacción valida el stock dentro del mismo bloque atómico; el segundo checkout falla y hace rollback, así no se sobrevende.
- **¿El token expira?** Sí, tiene vencimiento (24 h); además va firmado, así que no se puede falsificar sin el secreto.
- **¿Por qué DTOs y no exponer la entidad?** Seguridad y desacople: evitás filtrar campos internos y podés versionar el contrato sin tocar el modelo.
- **¿Qué es Testcontainers?** Una librería que levanta servicios reales (acá MySQL) en Docker durante los tests, en vez de simular con una base en memoria.
- **¿Cuántos tests tienen?** La suite del backend está en verde; cada feature (checkout, pago, comprobante, reportes) tiene cobertura unitaria y de contrato.
