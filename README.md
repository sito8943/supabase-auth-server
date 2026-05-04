# Supabase Auth Server (Express + TypeScript)

Microservicio pequeño para exponer operaciones básicas de autenticación usando Supabase Auth.

## 1. Variables de entorno

Copiar `.env.example` a `.env` y completar:

- `SUPABASE_URL` (obligatoria)
- `SUPABASE_ANON_KEY` (obligatoria)
- `SUPABASE_SERVICE_ROLE_KEY` (opcional por ahora)
- `SUPABASE_BRIDGE_KEY` (obligatoria, secreto compartido con backend Java)
- `PORT` (opcional, default `3090`)
- `CORS_ORIGIN` (opcional; lista separada por comas, default `http://localhost:8080`)

Todas las rutas `/api/auth/*` exigen header:

```text
X-Bridge-Key: <SUPABASE_BRIDGE_KEY>
```

## 2. Endpoints disponibles

Base URL: `http://localhost:3090/api/auth`

### `POST /register`
Registra un usuario.

Body:

```json
{
  "email": "user@mail.com",
  "password": "12345678",
  "redirectTo": "https://tu-frontend.com/reset-password",
  "data": {
    "name": "Sito"
  }
}
```

### `POST /login`
Inicia sesión por email/password.

Body:

```json
{
  "email": "user@mail.com",
  "password": "12345678"
}
```

### `POST /forgot-password`
Envía email de recuperación.

Body:

```json
{
  "email": "user@mail.com",
  "redirectTo": "https://tu-frontend.com/update-password"
}
```

### `POST /resend`
Reenvía email para `signup` o `email_change`.

Body:

```json
{
  "email": "user@mail.com",
  "type": "signup",
  "redirectTo": "https://tu-frontend.com/welcome"
}
```

### `POST /verify`
Verifica `token_hash` de callback (equivalente a `verifyOtp`).

Body:

```json
{
  "tokenHash": "<supabase-token-hash>",
  "type": "email"
}
```

Notas:
- `type` soportado: `email` (confirmación) y `recovery` (reset password).
- En éxito devuelve `verified: true` y, cuando aplica, `user`/`session`.

### `POST /refresh`
Renueva sesión con refresh token.

Body:

```json
{
  "refreshToken": "<refresh_token>"
}
```

### `POST /update-password`
Actualiza password usando access token de recovery/sesión.

Body:

```json
{
  "accessToken": "<access_token>",
  "refreshToken": "<refresh_token opcional, recomendado en recovery>",
  "password": "newStrongPassword123"
}
```

### `GET /validate`
Valida el access token actual.

Header:

```text
Authorization: Bearer <access_token>
```

## 3. Salud del servicio

- `GET /health`

## 4. Qué datos necesito de tu Supabase para dejarlo conectado

1. `SUPABASE_URL` del proyecto
2. `SUPABASE_ANON_KEY`
3. URL(s) de frontend para:
   - `CORS_ORIGIN`
   - redirect de recuperación/verificación (`redirectTo`)
4. Confirmar si también quieres endpoints admin (entonces necesitaré `SUPABASE_SERVICE_ROLE_KEY`)
