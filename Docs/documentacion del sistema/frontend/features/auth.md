# Documentación del Feature: Auth (Frontend)

## Propósito
Maneja el estado global de sesión, login, y protección de rutas. Es el "guardián" de la aplicación.

## Estructura

```
features/auth/
├── types.ts                # User, AuthResponse
├── context/
│   └── AuthContext.tsx      # Provider global + hook useAuth
├── components/
│   └── LoginForm.tsx       # Formulario de login
├── pages/
│   └── LoginPage.tsx       # Página completa de login
└── services/
    └── authService.ts      # Llamadas API de auth
```

## Tipos (`types.ts`)
- `User`: id, email, first_name, last_name, rut, role.
- `AuthResponse`: access, refresh (tokens JWT).

## Contexto (`AuthContext.tsx`)
Provee estado de autenticación a toda la app via React Context.

**Hook `useAuth()` retorna:**
- `user` — objeto User o null.
- `isAuthenticated` — booleano derivado.
- `isLoading` — true mientras valida token al montar.
- `login(email, password)` — autentica y guarda tokens en localStorage.
- `logout()` — limpia tokens y estado.
- `isAdmin`, `isDocente`, `isEstudiante` — flags de rol.

**Flujo de inicio:**
1. Al montar, intenta leer `access_token` de localStorage.
2. Si existe, llama a `getCurrentUser()` para validarlo.
3. Si falla, limpia tokens (token expirado).

## Servicio (`authService.ts`)
- `login(email, password)` → POST `/api/token/`.
- `getCurrentUser()` → GET `/api/users/me/`.

## Componentes

### `LoginForm.tsx`
- Campos: email y password.
- Toggle de visibilidad de password (Lucide Eye/EyeOff).
- Estado de loading con spinner.
- Muestra errores de credenciales inválidas.

### `LoginPage.tsx`
- Layout full-screen con imagen de fondo y logo.
- Redirige a `/menu-usuario` tras login exitoso.

## Protección de Rutas
Definida en `App.tsx` con el componente `PrivateRoute`:
- Si `isLoading` → muestra "Cargando...".
- Si `isAuthenticated` → renderiza children.
- Si no → redirige a `/login`.

## Interceptor de tokens (`services/api.ts`)
- **Request**: Inyecta `Authorization: Bearer <token>` en cada petición.
- **Response 401**: Intenta refresh automático con el refresh token. Si falla, limpia sesión y redirige a `/login`.
