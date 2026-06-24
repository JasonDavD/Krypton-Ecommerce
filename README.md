# Krypton E-commerce

E-commerce B2C de artefactos tecnológicos (dispositivos y componentes). Proyecto
académico **CIBERTEC — EFSRT V**. Monorepo: **backend** Spring Boot 3 + Java 17,
**frontend** React 19 + Vite + TypeScript, persistencia en **MySQL 8**.

## Demo en vivo

La aplicación está desplegada en la nube:

- **Tienda (frontend):** https://krypton-three-iota.vercel.app
- **API (backend):** https://krypton-backend-ixai.onrender.com
- **Panel admin:** `/admin` con `admin@krypton.pe` / `Admin123!`

> El backend corre en el plan gratuito de Render y se "duerme" tras la inactividad:
> la primera carga puede tardar ~30–60 s en despertar.

## Estructura del monorepo

```
Krypton-Ecommerce
├── backend/                            # Spring Boot 3.3.5 + Java 17 (Maven wrapper ./mvnw)
│   ├── src/main/java/pe/com/krypton/   # model, repository, service, controller, dto, ...
│   ├── src/main/resources/             # application.yml + db/migration (Flyway)
│   └── src/test/java/pe/com/krypton/   # tests (unit + web slice + integración)
├── frontend/                           # React 19 + Vite + TypeScript (SPA)
│   ├── src/features/                   # catálogo, carrito, checkout, pedidos, admin, ...
│   └── src/components, models, auth/   # compartidos
├── docs/                               # documentación del proyecto
├── presentacion/                       # deck de exposición (HTML) + guiones por expositor
├── anexos/                             # anexos del informe (DER, arquitectura, capturas)
└── docker-compose.yml                  # MySQL 8 local
```

> **¿Por qué monorepo?** Un solo repo con `backend/` y `frontend/` lado a lado.
> Cada carpeta se despliega **por separado**: el backend en **Render** (Docker), la
> base de datos en **Aiven** (MySQL gestionado) y el frontend en **Vercel**. La guía
> completa de despliegue está en [docs/deploy.md](docs/deploy.md).

## Stack

| Capa | Tecnología |
| ---- | ---------- |
| Backend | Spring Boot 3.3.5, Java 17, Maven (wrapper `./mvnw`) |
| Frontend | React 19, Vite, TypeScript, React Router, Axios, Recharts |
| Persistencia | MySQL 8 + Flyway (migraciones) + Spring Data JPA |
| Seguridad | Spring Security + JWT |
| Tests | JUnit 5, Mockito, Testcontainers (MySQL real) |
| Arquitectura | Capas con interfaces — ver [docs/arquitectura-backend.md](docs/arquitectura-backend.md) |

## Funcionalidades

**Cliente:** registro/login con JWT · catálogo con búsqueda y filtros · carrito ·
checkout con cálculo de envío e IGV y elección de comprobante (boleta/factura) · pago
**simulado** (Yape / tarjeta de crédito o débito) · descarga del comprobante en **PDF** ·
seguimiento del estado del pedido (timeline) e historial de compras.

**Administración (`/admin`):** CRUD de productos (con imágenes), categorías, gestión de
pedidos y de usuarios, y un dashboard de **reportes** (KPIs + gráficos) exportables a
**PDF y Excel**. El stock se controla con un **kardex** (historial de movimientos), y el
**checkout es una transacción atómica** (descuenta stock y registra el movimiento, todo o nada).

## Requisitos

- **JDK 17+** — el backend usa el wrapper `./mvnw`, no hace falta instalar Maven.
- **Node 20+** (con npm) — para el frontend.
- **Docker Desktop** corriendo — para la base de datos.

## Levantar el proyecto

Hacen falta **tres cosas corriendo**: la base de datos, el backend y el frontend.
Abrí una terminal para cada paso (los pasos 2 y 3 quedan en primer plano).

### 1. Base de datos (MySQL 8)

Desde la raíz del repo:

```bash
docker compose up -d
```

Levanta MySQL 8 en el puerto **3307** del host (container `krypton-db`, base
`krypton`, usuario `krypton`/`krypton`). El puerto es 3307 para no chocar con un
MySQL nativo en 3306.

### 2. Backend (http://localhost:8080)

```bash
cd backend
./mvnw spring-boot:run
```

Al arrancar, **Flyway aplica las migraciones** (crea las tablas, siembra el admin
y unos productos demo). El backend queda escuchando en `http://localhost:8080`.

> En Windows usá `mvnw.cmd spring-boot:run`.

### 3. Frontend (http://localhost:5173)

En otra terminal:

```bash
cd frontend
npm install        # sólo la primera vez
npm run dev
```

El frontend queda en `http://localhost:5173` y apunta al backend en
`http://localhost:8080` por defecto (configurable con `VITE_API_BASE_URL`).

### Listo — entrar a la tienda

Abrí **http://localhost:5173**. Podés registrar tu propia cuenta de cliente, o
entrar al **panel de administración** con el usuario sembrado:

- **Admin:** `admin@krypton.pe` / `Admin123!`

Desde `/admin` gestionás productos, categorías, pedidos, usuarios y reportes.

## Tests (backend)

```bash
cd backend
./mvnw test
```

Los tests de integración usan **Testcontainers** (levanta un MySQL real en Docker).
La **primera vez en cada máquina** configurá Docker para Testcontainers:

```bash
pwsh ./scripts/setup-tests.ps1
```

> Sin ese paso, los tests de integración no encuentran tu Docker. El detalle está
> en [docs/onboarding.md](docs/onboarding.md).

## Build de producción

```bash
# Backend → JAR ejecutable en backend/target/
cd backend && ./mvnw clean package

# Frontend → estáticos en frontend/dist/
cd frontend && npm run build
```

## Documentación

| Doc | Contenido |
| --- | --------- |
| [docs/arquitectura-backend.md](docs/arquitectura-backend.md) | Arquitectura por capas (leer antes de codear) |
| [docs/modelo-datos.md](docs/modelo-datos.md) | Modelo de datos |
| [docs/modelo.dbml](docs/modelo.dbml) | Diagrama ER (fuente única — dbdiagram.io) |
| [docs/deploy.md](docs/deploy.md) | Guía de despliegue en la nube (Render · Aiven · Vercel) |
