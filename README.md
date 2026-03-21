# SALUD-UDP - Sistema de Gestión de Fichas Ambulatorias

## Idea del Proyecto

**SALUD-UDP** es un sistema de gestión de fichas clínicas ambulatorias para la Universidad Diego Portales. Digitaliza el manejo de información clínica, permitiendo a estudiantes, docentes y administradores gestionar registros de pacientes y fichas médicas.

### Objetivos Principales
- Gestión integral de pacientes con validación de RUT chileno
- Creación y seguimiento de fichas ambulatorias con campos clínicos completos
- Autenticación y autorización basada en roles (Admin, Docente, Estudiante)
- Trazabilidad completa de las acciones realizadas en las fichas
- Interfaz moderna y responsiva

## Arquitectura

El proyecto implementa un **Monolito Modular** con 3 contenedores Docker:

```
Browser → localhost:5173 (Vite dev server)
              ├── /          → React SPA (HMR)
              ├── /api/*     → proxy → backend:8000 (Django REST)
              ├── /admin/*   → proxy → backend:8000 (Django Admin)
              └── /static/*  → proxy → backend:8000

         backend:8000 (Django) ← → db:3306 (MySQL 8.0)
```

Vite actúa como punto de entrada único en desarrollo, usando su proxy integrado para reenviar peticiones al backend. No se usa Nginx en desarrollo.

### Backend Modular (Django)
| App | Responsabilidad |
|-----|----------------|
| `apps/users` | Usuarios, autenticación JWT, roles |
| `apps/pacientes` | Gestión de pacientes, validación RUT |
| `apps/fichas` | Fichas ambulatorias, plantillas, historial |
| `apps/common` | Validadores compartidos (RUT chileno) |

### Frontend por Features (React)
| Feature | Responsabilidad |
|---------|----------------|
| `features/auth` | Login, contexto de autenticación, protección de rutas |
| `features/pacientes` | CRUD de pacientes, detalle con fichas asociadas |
| `features/fichas` | Plantillas, fichas de estudiante, historial de versiones |
| `features/estudiantes` | Gestión de estudiantes (vista docente/admin) |

## Stack Tecnológico

| Capa | Tecnología |
|------|-----------|
| Frontend | React 18, TypeScript 5, Vite 5, TailwindCSS 3, Axios, React Router 6, Lucide Icons, ESLint |
| Backend | Django 5.1, Django REST Framework 3.15, SimpleJWT, python-decouple |
| Base de Datos | MySQL 8.0 |
| Testing | pytest, pytest-django, factory-boy, Faker |
| Infraestructura | Docker, Docker Compose |

## Inicio Rápido

### Prerrequisitos
- Docker y Docker Compose instalados
- Puerto **5173** disponible

### 3 pasos para correr el proyecto

```bash
# 1. Clonar
git clone https://github.com/castrometro/SALUD-UDP.git
cd SALUD-UDP

# 2. Configurar entorno
cp .env.example .env

# 3. Levantar
docker compose up --build -d
```

Listo. Las migraciones corren automáticamente via `entrypoint.sh`.  
Abrir **http://localhost:5173**

### Crear un superusuario

```bash
docker compose exec backend python manage.py createsuperuser
```

Luego acceder al admin en http://localhost:5173/admin/

### Comandos útiles

```bash
# Ver logs en tiempo real
docker compose logs -f backend
docker compose logs -f frontend

# Reiniciar todo
docker compose down && docker compose up -d

# Reset completo (borra la BD)
docker compose down -v && docker compose up --build -d

# Correr tests (backend)
docker compose exec backend pytest

# Lint frontend
docker compose exec frontend npm run lint
```

## Estructura del Proyecto

```
SALUD-UDP/
├── docker-compose.yml          # Orquestación (db, backend, frontend)
├── .env.example                # Variables de entorno (copiar a .env)
├── README.md
│
├── backend/
│   ├── Dockerfile
│   ├── entrypoint.sh           # Migrate automático + runserver
│   ├── requirements.txt
│   ├── manage.py
│   ├── pytest.ini
│   ├── config/
│   │   ├── settings.py         # Configuración principal
│   │   ├── test_settings.py    # Settings para tests (SQLite)
│   │   └── urls.py             # Rutas raíz de la API
│   ├── apps/
│   │   ├── common/             # Validadores compartidos
│   │   ├── users/              # Usuarios y autenticación
│   │   ├── pacientes/          # Gestión de pacientes
│   │   └── fichas/             # Fichas clínicas
│   └── utils/
│       └── pagination.py       # Paginación estándar DRF
│
├── frontend/
│   ├── Dockerfile
│   ├── package.json
│   ├── .eslintrc.cjs          # ESLint config (TS + React hooks)
│   ├── vite.config.ts          # Proxy /api → backend:8000, alias @/ → src/
│   ├── tsconfig.json           # Path alias @/* → src/*
│   ├── tailwind.config.js
│   └── src/
│       ├── App.tsx             # Rutas y layout principal
│       ├── services/api.ts     # Axios con interceptores JWT (tipado AxiosError)
│       ├── types/common.ts     # PaginatedResponse genérico
│       ├── components/         # Componentes compartidos (Header, Layout, Pagination, etc.)
│       ├── features/
│       │   ├── auth/           # Login, AuthContext, protección de rutas
│       │   ├── pacientes/      # Pages y services de pacientes
│       │   ├── fichas/         # Pages, components y services de fichas
│       │   └── estudiantes/    # Pages, components y services de estudiantes
│       └── utils/rut.ts        # Validación de RUT en frontend
│
├── nginx/                      # Config Nginx (solo producción futura)
│   └── default.conf
│
└── Docs/                       # Documentación del sistema
    └── documentacion del sistema/
        ├── workflows.md
        ├── REQUERIMIENTOS_FICHAS_SIMULACION.md
        ├── backend/apps/       # Docs por app Django
        └── frontend/features/  # Docs por feature React
```

## Variables de Entorno

El archivo `.env.example` contiene todos los valores necesarios para desarrollo. No requiere modificación para correr local:

| Variable | Valor por defecto | Descripción |
|----------|------------------|-------------|
| `MYSQL_DATABASE` | `dbficha_dev` | Nombre de la BD |
| `MYSQL_USER` | `dev_user` | Usuario MySQL |
| `MYSQL_PASSWORD` | `dev_password` | Password MySQL |
| `MYSQL_ROOT_PASSWORD` | `root_password` | Password root MySQL |
| `DB_HOST` | `db` | Host de BD (nombre del contenedor) |
| `DB_PORT` | `3306` | Puerto MySQL |
| `DJANGO_DEBUG` | `True` | Modo debug de Django |
| `DJANGO_SECRET_KEY` | `django-insecure-...` | Clave secreta (cambiar en prod) |
| `VITE_API_URL` | (no requerida) | URL base de la API para el frontend. En Docker, el proxy de Vite maneja `/api` → `backend:8000`, por lo que no se necesita |

## Roles del Sistema

| Rol | Puede |
|-----|-------|
| **ADMIN** | Todo. Acceso a Django Admin. |
| **DOCENTE** | Crear pacientes, crear plantillas de fichas, ver fichas de estudiantes, ver historial. |
| **ESTUDIANTE** | Ver pacientes, clonar plantillas a su propia ficha, editar sus fichas. |
