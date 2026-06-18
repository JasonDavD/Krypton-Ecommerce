# Krypton-Ecommerce — Agent Guide

Backend: **Spring Boot + Java + Maven**. Base package `pe.com.krypton`. Arquitectura de
**capas con interfaces**. Persistencia PostgreSQL + Flyway. Strict TDD activo.

Reglas compactas y contexto: ver [`.atl/skill-registry.md`](.atl/skill-registry.md).
Modelo de datos y arquitectura: ver [`docs/`](docs/).

## Skills

| Skill | Descripción | Archivo |
|-------|-------------|---------|
| `krypton-backend` | Capas con interfaces + JPA + Flyway + REST/DTO. Reglas del modelo (snapshot de precio, stock cacheado + kardex, surrogate vs natural key). | [SKILL.md](.claude/skills/krypton-backend/SKILL.md) |
| `krypton-tdd` | Strict TDD: JUnit 5 + Mockito (unit), `@WebMvcTest` (web), Testcontainers Postgres (integración). | [SKILL.md](.claude/skills/krypton-tdd/SKILL.md) |
| `krypton-design` | Identidad de marca Krypton: tokens, color, tipografía, assets + UI kit de referencia. Para diseñar/generar vistas on-brand. | [SKILL.md](.claude/skills/krypton-design/SKILL.md) |

## Frontend / Design System

Frontend: **Angular 17+ standalone SPA** en `frontend/`. Rutas en español (`/catalogo`, `/cuenta/ingresar`, `/cuenta/registro`).

Marca **Krypton** (light-first, sin morado). Al construir o tocar UI, respetar:

- **Tokens runtime** (la app compila contra esto): [`frontend/src/styles/design-system/`](frontend/src/styles/design-system/), importados en `frontend/src/styles.scss`. Usar `var(--color-brand)`, `var(--action-cta)`, `var(--space-*)`, etc. — nunca hardcodear hex.
- **Fuentes**: `frontend/public/fonts/` (Kanit) · **Logos**: `frontend/public/brand/Krypton-{white,navy,blue,orange}.svg`.
- **Biblia de marca** (VISUAL FOUNDATIONS + CONTENT FUNDAMENTALS, voz es-PE): [`readme`](.claude/skills/krypton-design/readme.md) del skill `krypton-design`.
- **Reglas duras**: Kanit en todo; **azul** `#1A7DD7` = acción primaria/links; **naranja** `#F37402` = CTA (con glow); navy `#03275A` = ink/bands. **Prohibido morado/magenta** y gradientes arcoíris. Iconos **Lucide** (2px, currentColor) — **sin emoji**. Precios en Soles: `S/ x.xx` (`currency:'PEN'`).
- ⚠️ Los componentes del skill (`components/`, `ui_kits/`) son **React de referencia**. La app es **Angular**: se RE-IMPLEMENTAN como componentes Angular leyendo el `.jsx`/`.prompt.md` como contrato — **NO se importan**.

## Convenciones

- Conventional commits únicamente. Sin atribución a IA.
- Migraciones Flyway desde `V1`. `ddl-auto: validate`.
- Tests: `mvn test`. RED → GREEN → REFACTOR.
- DB local: `docker compose up -d` antes de correr la app.
