# Documentación del Feature: Auth (Frontend)

## Propósito
El módulo `/frontend/src/features/auth` maneja el estado global de la sesión del usuario, el login, y la protección de rutas. Actúa como el "guardián" de la aplicación.

## Arquitectura

### Contexto (`AuthContext.tsx`)
Utiliza React Context API para proveer el estado de autenticación a toda la app.
- **Estado**:
    - `user`: Objeto con datos del usuario (`id`, `email`, `role`, `name`) o `null`.
    - `token`: El JWT de acceso.
    - `isAuthenticated`: Booleano derivado.
- **Métodos**:
    - `login(email, password)`: Llama a la API, guarda el token en `localStorage`, decodifica el usuario y actualiza el estado.
    - `logout()`: Limpia el `localStorage` y el estado.

### Protección de Rutas (`PrivateRoutes`)
Componente "Wrapper" (generalmente en `App.tsx` o `routes.tsx`) que envuelve rutas protegidas.
- Verifica `isAuthenticated`.
- Si `false`: Redirige a `/login`.
- Si `true`: Renderiza el componente hijo.
- **Mejora Futura (Issue #5)**: Validar rol específico para impedir que estudiantes entren a rutas de docentes.

### Páginas
- **`LoginPage.tsx`**: Formulario simple de correo/contraseña. Maneja errores de credenciales inválidas.

### Integración API (`services/authService.ts`)
- Instancia de `axios` configurada.
- Interceptores (si aplica) para inyectar el header `Authorization: Bearer <token>` en cada petición.

## Flujo de Login
1. Usuario ingresa credenciales en `LoginPage`.
2. `authService.login()` envía POST al backend.
3. Si es exitoso, backend devuelve tokens.
4. `AuthContext` guarda tokens y decodifica los datos del usuario.
5. Usuario es redirigido al dashboard principal (`/home` o `/pacientes`).
