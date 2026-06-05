# Krypton — Onboarding del Backend

Guía para dejar el backend corriendo en tu máquina **de cero**. Si seguís los
pasos en orden, en ~10 minutos tenés la app levantada y los tests en verde.

> Regla de oro del proyecto: **conceptos antes que código**. Si algo de acá no
> te cierra, preguntá antes de seguir. No copies y pegues comandos a ciegas.

> **El repo es un monorepo.** El backend vive en `backend/` y el frontend (a
> futuro) en `frontend/`. Todos los comandos de Maven se corren **dentro de
> `backend/`**. Los de Docker y el script de setup, desde la **raíz**.

## 1. Requisitos previos

| Herramienta | Versión | Para qué |
| ----------- | ------- | -------- |
| **JDK** | 17 o superior | Compilar y correr el backend. El proyecto **apunta a Java 17** (es lo que se usa en clase). Si tenés JDK 21, compila a 17 igual. |
| **Docker Desktop** | Engine reciente | Levanta PostgreSQL (la app) y los contenedores de los tests de integración (Testcontainers). |
| **Maven** | — | **No hace falta instalarlo.** Usá el wrapper incluido: `./mvnw` (dentro de `backend/`). |
| **Git** | cualquiera | Clonar el repo. |

Verificá el JDK:

```bash
java -version    # debe decir 17 o más
```

## 2. Clonar y entrar al proyecto

```bash
git clone https://github.com/JasonDavD/Krypton-Ecommerce.git
cd Krypton-Ecommerce
```

## 3. Levantar la base de datos (Docker)

Desde la **raíz** del repo. La app usa **PostgreSQL 16** local, definido en
`docker-compose.yml`:

```bash
docker compose up -d
```

Esto te deja una base en `localhost:5432`:

| Dato | Valor |
| ---- | ----- |
| Base | `krypton` |
| Usuario | `krypton` |
| Password | `krypton` |

> ¿Por qué Postgres en Docker y no instalado a mano? Para tener **paridad con
> producción** (que también es Postgres 16) y que todos en el equipo trabajen
> contra exactamente la misma base, sin "en mi máquina anda".

## 4. Configurar los tests de integración (UNA vez por máquina)

Los tests de integración no usan una base falsa: levantan un **Postgres real**
en un contenedor con **Testcontainers**. Para que Testcontainers encuentre tu
Docker, corré este script **una sola vez** (desde la raíz):

```powershell
pwsh ./scripts/setup-tests.ps1
# si PowerShell bloquea la ejecución:
powershell -ExecutionPolicy Bypass -File ./scripts/setup-tests.ps1
```

Qué hace: detecta el endpoint real de **tu** Docker y lo escribe en
`~/.testcontainers.properties` (en tu carpeta de usuario). Es idempotente —
podés correrlo las veces que quieras.

> **¿Por qué este paso existe?** Docker Desktop con Engine 29+ no escucha en el
> pipe por defecto que busca Testcontainers. Ese dato es **específico de cada
> máquina**, por eso vive en tu carpeta home y **NO** en el repo (si lo
> hardcodeáramos, le rompería los tests a quien tenga otro setup). El script lo
> resuelve solo. Detalle completo más abajo, en *Troubleshooting*.

## 5. Correr la aplicación

El proyecto Spring Boot vive en `backend/`. Entrá ahí y usá el wrapper:

```bash
cd backend
./mvnw spring-boot:run
```

Al arrancar, **Flyway** aplica las migraciones (`backend/src/main/resources/db/migration/`)
y crea las 8 tablas. Hibernate corre en modo `validate`: no toca el schema, solo
verifica que las entidades JPA coincidan con las tablas.

## 6. Correr los tests

```bash
cd backend
./mvnw test
```

La primera vez Testcontainers baja la imagen `postgres:16` (tarda un poco).
Después queda cacheada. Si todo está bien, terminás con `BUILD SUCCESS`.

---

## Troubleshooting

### Los tests fallan con `CannotGetJdbcConnectionException` / "Failed to obtain JDBC Connection"

Testcontainers no pudo hablar con tu Docker. Causa típica: **Docker Desktop con
Engine 29+** escucha en un pipe distinto al que Testcontainers busca por defecto.

**Solución:** asegurate de haber hecho el **Paso 4** (`scripts/setup-tests.ps1`)
con Docker Desktop **abierto y corriendo**. Eso escribe el `docker.host` correcto
en `~/.testcontainers.properties`.

Si querés ver a mano cuál es el endpoint real de tu Docker:

```bash
docker context inspect --format '{{.Endpoints.docker.Host}}'
```

### "docker no respondió" al correr el script

Docker Desktop no está corriendo. Abrilo, esperá a que diga **running**, y volvé
a correr el script.

### El build no encuentra Java / usa una versión rara

Verificá `java -version`. Necesitás **17 o superior**. Si tenés varias versiones,
asegurate de que `JAVA_HOME` apunte a un JDK 17+.

---

## Mapa rápido del proyecto

| Ruta | Qué hay |
| ---- | ------- |
| `backend/` | Proyecto Spring Boot (Maven). Acá corrés `./mvnw`. |
| `backend/src/main/java/pe/com/krypton/` | Código del backend (model, repository, etc.) |
| `backend/src/main/resources/application.yml` | Configuración (perfil `local`, datasource, Flyway) |
| `backend/src/main/resources/db/migration/` | Migraciones Flyway (dueñas del schema) |
| `backend/src/test/java/pe/com/krypton/` | Tests (unit + integración con Testcontainers) |
| `frontend/` | SPA (pendiente: React/Angular) |
| `docker-compose.yml` | PostgreSQL 16 local |
| `scripts/setup-tests.ps1` | Configura Testcontainers (Paso 4) |
| `docs/arquitectura-backend.md` | Arquitectura por capas (leer antes de codear) |
| `docs/modelo-datos.md` | Modelo de datos (8 tablas) |
