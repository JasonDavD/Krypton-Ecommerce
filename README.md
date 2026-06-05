# Krypton E-commerce

E-commerce B2C de artefactos tecnológicos (rubro Coolbox). Proyecto académico
**CIBERTEC — EFSRT VI**. Monorepo: **backend** en Spring Boot 3 + Java 17,
**frontend** (SPA, a definir), persistencia en **PostgreSQL 16**.

## Estructura del monorepo

```
Krypton-Ecommerce
├── backend/                            # Spring Boot 3 + Java 17 (Maven)
│   ├── src/main/java/pe/com/krypton/   # model, repository, service, ...
│   ├── src/main/resources/             # application.yml + db/migration (Flyway)
│   └── src/test/java/pe/com/krypton/   # tests (unit + integración)
├── frontend/                           # SPA (pendiente: React/Angular)
├── docs/                               # documentación del proyecto
├── scripts/                            # utilidades (setup-tests.ps1, ...)
└── docker-compose.yml                  # PostgreSQL 16 local
```

> **¿Por qué monorepo?** Un solo repo con `backend/` y `frontend/` lado a lado.
> Cada carpeta se construye y se despliega **por separado** (el back a Render/
> Railway, el front a Vercel/Netlify) apuntando a su subcarpeta. Monorepo es
> dónde VIVE el código; el despliegue es independiente.

## Stack

| Capa | Tecnología |
| ---- | ---------- |
| Backend | Spring Boot 3.3.5, Java 17, Maven (wrapper `./mvnw`) |
| Persistencia | PostgreSQL 16 + Flyway (migraciones) + Spring Data JPA |
| Seguridad | Spring Security + JWT |
| Tests | JUnit 5, Mockito, Testcontainers (Postgres real) |
| Arquitectura | Capas con interfaces — ver [docs/arquitectura-backend.md](docs/arquitectura-backend.md) |

## Quick start

> Guía completa paso a paso: **[docs/onboarding.md](docs/onboarding.md)**.

```bash
# 1. Levantar la base de datos (Postgres 16) — desde la raíz
docker compose up -d

# 2. Configurar los tests de integración — UNA vez por máquina (Docker abierto)
pwsh ./scripts/setup-tests.ps1

# 3. Backend: entrar a la carpeta y correr la app (Flyway crea las tablas)
cd backend
./mvnw spring-boot:run

# 4. Correr los tests (dentro de backend/)
./mvnw test
```

**Requisitos:** JDK 17+ y Docker Desktop corriendo. Maven NO hace falta
instalarlo: usá `./mvnw` dentro de `backend/`.

> ⚠️ El **paso 2** es obligatorio la primera vez en cada máquina: configura
> Testcontainers para que encuentre tu Docker. Sin eso, los tests de integración
> no levantan. El porqué está en [docs/onboarding.md](docs/onboarding.md#4-configurar-los-tests-de-integración-una-vez-por-máquina).

## Documentación

| Doc | Contenido |
| --- | --------- |
| [docs/onboarding.md](docs/onboarding.md) | Cómo dejar el backend corriendo de cero |
| [docs/arquitectura-backend.md](docs/arquitectura-backend.md) | Arquitectura por capas (leer antes de codear) |
| [docs/modelo-datos.md](docs/modelo-datos.md) | Modelo de datos (8 tablas) |
| [docs/modelo.dbml](docs/modelo.dbml) | Diagrama ER (fuente única — dbdiagram.io) |
