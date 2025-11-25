# Grupo 12 - Sistema de Chats con Funcionalidades Avanzadas

## Descripción

Sistema web de mensajería en tiempo real que permite la creación de canales y hilos de discusión, con integración de funcionalidades inteligentes como búsqueda de Wikipedia y asistente de programación.

## Características

- Registro e inicio de sesión de usuarios
- Creación de canales y hilos de discusión
- Integración con Wikipedia para búsqueda de información
- Asistente de programación 
- Interfaz responsive adaptable a dispositivos móviles y de escritorio
- Modo claro/oscuro

## Tecnologías Utilizadas

- Frontend: React, Vite
- Backend: API Gateway en Python con FastAPI
- Docker y Kubernetes
- Playwright para pruebas automatizadas


## Configuración de Variables de Entorno

Antes de ejecutar la aplicación, configure las variables de entorno:

```
# Frontend
VITE_API_BASE_URL=

# API Gateway
API_BASE_URL=
```


## Pruebas Automatizadas

### Tipos de Pruebas

1. **Pruebas E2E con Playwright**:
   - Registro e inicio de sesión
   - Creación de canales y hilos
   - Envío de mensajes con comandos Wikipedia y Cide
   - Navegación y UI
   - Diseño responsive

2. **Pruebas de API**:
   - Verificación de salud del gateway
   - Registro/login de usuarios
   - Creación de canales
   - Comandos Wikipedia y Cide

### Ejecución de Pruebas

```bash
# Ejecutar todas las pruebas
python playwright_tests.py

# Solo pruebas E2E
python playwright_tests.py --e2e

# Solo pruebas de API
python playwright_tests.py --api
```


## Comandos de Chat

- `/wikipedia [consulta]` - Busca información en Wikipedia
- `/code [código]` - Asistente de programación

## Despliegue

El sistema está configurado para desplegarse en Kubernetes con:
- Balanceador de carga
- Secretos para credenciales
- Configuración de red nginx
- Monitoreo de salud

