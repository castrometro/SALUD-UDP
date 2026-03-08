# SALUD-UDP - Sistema de Gestión de Fichas Ambulatorias

## 🎯 Idea del Proyecto

**SALUD-UDP** es un sistema de gestión de fichas clínicas ambulatorias desarrollado para la Universidad Diego Portales. El proyecto busca digitalizar y modernizar el manejo de información clínica, permitiendo a estudiantes, docentes y administradores gestionar de manera eficiente los registros de pacientes y sus fichas médicas.

### Objetivos Principales:
- Gestión integral de pacientes con validación de RUT chileno
- Creación y seguimiento de fichas ambulatorias con campos clínicos completos
- Sistema de autenticación y autorización basado en roles (Administrador, Docente, Estudiante)
- Trazabilidad completa de las acciones realizadas en las fichas clínicas
- Interfaz moderna y responsiva para facilitar el trabajo clínico

## 🏗️ Patrón de Diseño

El proyecto implementa un **Monolito Modular**, que combina las ventajas de una arquitectura monolítica con la organización y separación de responsabilidades de los microservicios.

### Características del Patrón:

1. **Backend Modular (Django)**:
   - **apps/users**: Gestión de usuarios y autenticación con roles diferenciados
   - **apps/pacientes**: Módulo de gestión de pacientes con validación de datos chilenos
   - **apps/fichas**: Módulo de fichas ambulatorias con trazabilidad completa
   - **apps/common**: Utilidades compartidas y validadores

2. **Frontend por Features (React)**:
   - Organización por características de negocio
   - Componentes reutilizables y servicios específicos por feature
   - Separación clara entre lógica de presentación y lógica de negocio

3. **Ventajas del Enfoque**:
   - Desarrollo y despliegue simplificado
   - Módulos cohesivos con bajo acoplamiento
   - Facilita la transición futura a microservicios si es necesario
   - Código más mantenible y testeable

## 🏛️ Arquitectura

La arquitectura del sistema sigue un modelo de **tres capas con reverse proxy**:

```
┌─────────────────────────────────────────────────────┐
│                    NGINX (Puerto 8080)               │
│                   Reverse Proxy                      │
└──────────────┬─────────────────────┬─────────────────┘
               │                     │
               │ /                   │ /api/, /admin/
               ▼                     ▼
┌──────────────────────────┐  ┌──────────────────────┐
│  Frontend (Puerto 5173)   │  │ Backend (Puerto 8000) │
│  Vite + React + TypeScript│  │  Django REST Framework│
│  • React Router           │  │  • JWT Authentication │
│  • Axios                  │  │  • MySQL Client       │
│  • TailwindCSS            │  │  • CORS Headers       │
│  • Lucide Icons           │  │  • Simple JWT         │
└──────────────────────────┘  └──────────┬────────────┘
                                         │
                                         ▼
                              ┌──────────────────────┐
                              │   MySQL 8.0 DB       │
                              │   Base de Datos      │
                              │   • dbficha_dev      │
                              └──────────────────────┘
```

### Componentes de la Arquitectura:

1. **Capa de Presentación (Frontend)**:
   - Framework: React 18 con TypeScript
   - Build Tool: Vite para desarrollo rápido y HMR
   - Estilos: TailwindCSS para diseño responsive
   - Comunicación: Axios para llamadas HTTP al backend

2. **Capa de Lógica de Negocio (Backend)**:
   - Framework: Django 5.1.4 con Django REST Framework
   - Autenticación: JWT (JSON Web Tokens) con Simple JWT
   - Base de Datos: MySQL 8.0 con mysqlclient
   - API RESTful con endpoints para usuarios, pacientes y fichas

3. **Capa de Datos**:
   - Motor: MySQL 8.0
   - Persistencia: Volúmenes Docker para datos persistentes
   - Migraciones: Django ORM para gestión de esquema

4. **Capa de Proxy**:
   - Nginx Alpine para enrutamiento
   - Gestión de CORS y headers
   - Separación de rutas frontend/backend

## 🛠️ Stack Tecnológico

### Backend
- **Framework**: Django 5.1.4
- **API**: Django REST Framework 3.15.2
- **Autenticación**: djangorestframework-simplejwt 5.4.0
- **Base de Datos**: MySQL 8.0 + mysqlclient 2.2.4
- **CORS**: django-cors-headers 4.6.0
- **Configuración**: python-decouple 3.8
- **Lenguaje**: Python 3.x

### Frontend
- **Framework**: React 18.2.0
- **Lenguaje**: TypeScript 5.2.2
- **Build Tool**: Vite 5.1.4
- **Routing**: React Router DOM 6.30.2
- **HTTP Client**: Axios 1.13.2
- **Estilos**: TailwindCSS 3.4.1 + PostCSS 8.4.35
- **Iconos**: Lucide React 0.330.0
- **Utilidades**: clsx 2.1.0, tailwind-merge 2.2.1

### Base de Datos
- **Motor**: MySQL 8.0
- **Configuración**: Contenedor Docker con volúmenes persistentes

### Infraestructura
- **Contenedorización**: Docker + Docker Compose 3.8
- **Reverse Proxy**: Nginx Alpine
- **Red**: Docker Bridge Network (clinica_net)

### Herramientas de Desarrollo
- **Linting (Frontend)**: ESLint
- **Compilador**: TypeScript Compiler
- **Hot Reload**: Vite HMR
- **Variables de Entorno**: .env files

## 🚀 Inicio Rápido

### Prerrequisitos
- Docker y Docker Compose instalados
- Puertos 8080, 8000, 3000, 5173 disponibles

### Configuración

1. Clonar el repositorio:
```bash
git clone https://github.com/castrometro/SALUD-UDP.git
cd SALUD-UDP
```

2. Configurar variables de entorno:
```bash
cp .env.example .env
# Editar .env con tus configuraciones locales
```

3. Levantar los servicios:
```bash
docker compose up --build -d
```

4. Ejecutar migraciones del backend:
```bash
docker compose exec backend python manage.py migrate
```

5. Crear un superusuario para acceder al admin de Django:
```bash
docker compose exec backend python manage.py createsuperuser
```

6. Acceder a la aplicación:
- Frontend: http://localhost:8080
- Backend API: http://localhost:8080/api/
- Admin Django: http://localhost:8080/admin/

## 💻 Guía para Correr en Local

### Opción recomendada: Docker Compose

1. Crear el archivo de entorno a partir del ejemplo:
```bash
cp .env.example .env
```

2. Verificar o ajustar estas variables mínimas en `.env`:
```env
MYSQL_DATABASE=dbficha_dev
MYSQL_USER=dev_user
MYSQL_PASSWORD=dev_password
MYSQL_ROOT_PASSWORD=root_dev_local_2026
DB_HOST=db
DB_PORT=3306

DJANGO_DEBUG=True
DJANGO_SECRET_KEY=django-insecure-local-salud-udp-dev-2026
DJANGO_ALLOWED_HOSTS=localhost,127.0.0.1

VITE_API_URL=/api
```

3. Levantar el stack:
```bash
docker compose up --build -d
```

4. Ejecutar migraciones:
```bash
docker compose exec backend python manage.py migrate
```

5. Crear un superusuario:
```bash
docker compose exec backend python manage.py createsuperuser
```

6. Validar acceso:
- Aplicación: http://localhost:8080
- Django Admin: http://localhost:8080/admin/
- API: http://localhost:8080/api/

### Comandos útiles

Ver logs:
```bash
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f db
```

Detener servicios:
```bash
docker compose down
```

Detener y eliminar volúmenes de la base:
```bash
docker compose down -v
```

### Notas de desarrollo

- El proyecto usa Nginx como punto de entrada local en `http://localhost:8080`.
- El backend corre en `http://localhost:8000` y el frontend Vite en `http://localhost:5173`, pero el flujo recomendado es entrar por Nginx.
- El formulario de login del frontend autentica con correo electrónico.

### Usuarios por Defecto

El sistema maneja tres tipos de roles:
- **ADMIN**: Administrador del sistema
- **DOCENTE**: Docentes supervisores
- **ESTUDIANTE**: Estudiantes usuarios del sistema

## 📁 Estructura del Proyecto

```
SALUD-UDP/
├── backend/
│   ├── apps/
│   │   ├── users/          # Gestión de usuarios y autenticación
│   │   ├── pacientes/      # Gestión de pacientes
│   │   ├── fichas/         # Fichas ambulatorias
│   │   └── common/         # Validadores y utilidades
│   ├── config/             # Configuración Django
│   ├── requirements.txt    # Dependencias Python
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── components/     # Componentes reutilizables
│   │   ├── features/       # Features por módulo
│   │   ├── pages/          # Páginas principales
│   │   ├── services/       # Servicios API
│   │   └── utils/          # Utilidades
│   ├── package.json        # Dependencias Node
│   └── Dockerfile
├── nginx/
│   └── default.conf        # Configuración Nginx
├── docker-compose.yml      # Orquestación de servicios
└── .env.example           # Variables de entorno ejemplo
```

## 🔒 Seguridad

- Autenticación basada en JWT con tokens de acceso y refresh
- Validación de RUT chileno en modelos de Usuario y Paciente
- CORS configurado para dominios específicos
- Variables de entorno para datos sensibles
- Separación de credenciales de desarrollo y producción

## 📝 Licencia

Este proyecto es desarrollado para uso académico en la Universidad Diego Portales.

## 👥 Contribuciones

Para contribuir al proyecto, por favor contacta con el equipo de desarrollo de la UDP.
