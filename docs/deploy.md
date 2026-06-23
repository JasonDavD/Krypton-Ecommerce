# Deploy de Krypton (nube, gratis, sin tarjeta)

Stack: **Aiven** (MySQL) · **Render** (backend Spring Boot) · **Vercel** (frontend React).
Los tres tienen capa gratuita y **no piden tarjeta**.

El despliegue va **de adentro hacia afuera** (cada capa depende de la anterior):

```
Aiven (DB)  →  Render (backend)  →  Vercel (frontend)  →  ajustar CORS
```

---

## 1. Base de datos — Aiven (MySQL)

1. Crear un servicio **MySQL** en el plan **Free**.
2. De la pantalla de conexión anotar: **host**, **port**, **database**, **user**, **password**.
3. Armar la URL JDBC (Aiven exige SSL):

   ```
   jdbc:mysql://HOST:PORT/DATABASE?sslMode=REQUIRED
   ```

> Aiven apaga el servicio free si está inactivo (avisa por mail). Antes de la demo, verificá que esté **Running**.

## 2. Backend — Render (Docker)

- New → **Web Service** → conectar el repo → **Runtime: Docker** (usa `backend/Dockerfile`).
- **Root Directory:** `backend`
- **Variables de entorno** (Environment):

  | Variable | Valor |
  |---|---|
  | `SPRING_PROFILES_ACTIVE` | `prod` |
  | `DB_URL` | `jdbc:mysql://HOST:PORT/DATABASE?sslMode=REQUIRED` |
  | `DB_USERNAME` | usuario de Aiven |
  | `DB_PASSWORD` | password de Aiven |
  | `JWT_SECRET` | string aleatorio de **≥32 caracteres** |
  | `APP_CORS_ALLOWED_ORIGINS` | (provisional) `*`… no: poné la URL de Vercel cuando exista (paso 4) |
  | `APP_UPLOADS_BASE_URL` | la URL pública del propio backend de Render |

- `PORT` lo inyecta Render solo (el `application.yml` ya lo lee).
- Al primer arranque, **Flyway** crea el schema y siembra datos contra la DB de Aiven.

> Render free **duerme** el servicio tras 15 min de inactividad (primer request ~30-60s). Para la demo, "despertalo" entrando una vez antes.

## 3. Frontend — Vercel

- Import del repo → **Root Directory:** `frontend` (framework: Vite).
- Variable de entorno:

  | Variable | Valor |
  |---|---|
  | `VITE_API_BASE_URL` | la URL pública del backend de Render |

- Deploy → queda la URL pública del frontend.

## 4. Cableado final (CORS)

- En Render, setear `APP_CORS_ALLOWED_ORIGINS` con el dominio **exacto** de Vercel (ej. `https://krypton.vercel.app`) y redeployar.
- Verificar end-to-end: registro/login, catálogo, carrito, checkout, **pago**, **descarga de comprobante**.

---

## Limitación conocida (free tier)

Las **imágenes que sube el admin** se guardan en el filesystem del backend (`APP_UPLOADS_DIR`). En Render free el disco es **efímero**: se pierden en cada redeploy/reinicio. Opciones:
- **Demo:** aceptarlo (los productos sembrados usan el placeholder de marca).
- **Persistente:** almacenamiento externo (Cloudinary/S3) — cambio aparte, no incluido.

## Variables de entorno — resumen

**Backend (Render):** `SPRING_PROFILES_ACTIVE`, `DB_URL`, `DB_USERNAME`, `DB_PASSWORD`, `JWT_SECRET`, `APP_CORS_ALLOWED_ORIGINS`, `APP_UPLOADS_BASE_URL`
**Frontend (Vercel):** `VITE_API_BASE_URL`
