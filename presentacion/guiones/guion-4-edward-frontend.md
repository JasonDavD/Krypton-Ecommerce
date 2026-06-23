# Guion · Parte 4 — Frontend y experiencia
**Expositor:** Edward Escobedo Murga · **Tiempo:** ~4-5 min · **Slides:** Parte 4 (SPA y cliente, pago/comprobante, panel admin)

---

### [Slide: Parte 4 — divisor]
"Gracias, Jason. Ahora vamos a lo que ve el usuario: el frontend."

### [Slide: SPA en React]
"El frontend es una **aplicación de página única** hecha en **React con Vite**, responsiva, y totalmente desacoplada del backend: se comunica solo por la API REST. El recorrido del cliente es natural: entra al **catálogo**, donde puede buscar y filtrar por categoría o precio; agrega productos al **carrito**; pasa al **checkout**, donde elige boleta o factura y el sistema calcula el envío y desglosa el IGV; **paga**; y después puede ver todo en **Mis pedidos**."

### [Slide: Pago y comprobante]
"Tres cosas a destacar de esta parte. La primera, el **pago simulado**: el cliente elige Yape, tarjeta de crédito o débito, y completa un formulario con validación —no hay cobro real, eso está fuera del alcance, pero la experiencia es completa. La segunda, el **comprobante**: una vez pagado, se genera una boleta o factura descargable en **PDF**, tanto para el cliente como para el administrador. Y la tercera, el **timeline del pedido**: el cliente ve en qué estado está su compra —Pendiente, Confirmado, Enviado, Entregado— de un vistazo."

### [Slide: Panel administrativo]
"Del lado del administrador hay un **panel con cinco secciones**: Productos —con CRUD completo y gestión de imágenes—, Categorías, Pedidos, Usuarios y Reportes. La sección de **Reportes** es un dashboard con KPIs y gráficos hechos con Recharts: ventas por período, productos más vendidos y el kardex de cada producto. Y cada uno de esos reportes se puede **descargar en PDF y en Excel**, agrupado por categoría —que era otro requisito de la rúbrica."

### [Pase a Luis]
"Todo esto está funcionando, y no en nuestras máquinas: está en internet. Luis les va a contar cómo lo desplegamos y nos lo va a mostrar en vivo. Luis…"

---

## Preguntas frecuentes
- **¿Es responsivo?** Sí, se adapta a móvil y escritorio.
- **¿Por qué React y no Angular?** Por agilidad del equipo y por el ecosistema (Vite da un desarrollo muy rápido). El proyecto incluso conserva una rama archivada del front anterior en Angular.
- **¿El cliente recibe el comprobante por correo?** No en esta versión (no hay envío de mails); lo descarga desde su pedido. El admin también puede emitirlo.
- **¿Cómo sabe el frontend a qué backend pegarle?** Por una variable de entorno (`VITE_API_BASE_URL`) que se setea en el build.
