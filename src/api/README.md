# API Gateway - Módulo de Usuarios

Este módulo proporciona funcionalidades para autenticación y gestión de usuarios a través de la API REST del gateway.

## API Base
```
https://channel-gateway.inf326.nur.dev/api/v1
```

## Funciones Disponibles

### `registerUser(userData)`
Registra un nuevo usuario en el sistema.

**Parámetros:**
```javascript
{
  email: string,           // Email válido
  username: string,        // Usuario único
  password: string,        // Contraseña (min 6 caracteres recomendado)
  full_name?: string       // Nombre completo (opcional)
}
```

**Retorna:**
```javascript
{
  id: string (UUID),
  email: string,
  username: string,
  full_name?: string,
  is_active: boolean
}
```

### `loginUser(usernameOrEmail, password)`
Autentica un usuario y obtiene un token JWT.

**Parámetros:**
- `usernameOrEmail` (string): Usuario o email del usuario
- `password` (string): Contraseña del usuario

**Retorna:**
```javascript
{
  access_token: string,
  token_type: "bearer"
}
```

### `getCurrentUser()`
Obtiene los datos del usuario autenticado actualmente.

**Requiere:** Token JWT en headers (se incluye automáticamente)

**Retorna:**
```javascript
{
  id: string (UUID),
  email: string,
  username: string,
  full_name?: string,
  is_active: boolean
}
```

### `updateUserProfile(userData)`
Actualiza el perfil del usuario autenticado.

**Parámetros:**
```javascript
{
  full_name?: string       // Nuevo nombre completo
}
```

**Retorna:**
```javascript
{
  id: string (UUID),
  email: string,
  username: string,
  full_name?: string,
  is_active: boolean
}
```

### `setAuthToken(token)`
Almacena el token JWT en localStorage y lo agrega a los headers de las peticiones.

**Parámetros:**
- `token` (string): Token JWT recibido del login

### `removeAuthToken()`
Elimina el token JWT de localStorage y lo remueve de los headers.

## Interceptores

### Request Interceptor
Automáticamente agrega el token JWT a los headers de todas las peticiones si está disponible.

### Response Interceptor
- Si la respuesta es 401 (No autorizado), limpia el token y redirige a `/login`
- Propaga otros errores normalmente

## Manejo de Errores

Todos los métodos lanzan excepciones con la siguiente estructura:
```javascript
{
  detail?: string,  // Mensaje detallado del error
  message?: string, // Mensaje genérico del error
  status?: number   // Código HTTP
}
```

## Ejemplo de Uso

```javascript
import { registerUser, loginUser, setAuthToken, getCurrentUser } from './api/usersApi';

// Registrar un nuevo usuario
try {
  const user = await registerUser({
    email: 'usuario@ejemplo.com',
    username: 'mi_usuario',
    password: 'mi_contraseña_segura',
    full_name: 'Mi Nombre Completo'
  });
  console.log('Usuario registrado:', user);
} catch (error) {
  console.error('Error al registrar:', error.detail);
}

// Autenticar un usuario
try {
  const tokenData = await loginUser('mi_usuario', 'mi_contraseña_segura');
  setAuthToken(tokenData.access_token);

  // Obtener datos del usuario autenticado
  const currentUser = await getCurrentUser();
  console.log('Usuario autenticado:', currentUser);
} catch (error) {
  console.error('Error al iniciar sesión:', error.detail);
}
```

## Almacenamiento

- **Access Token**: Almacenado en `localStorage.accessToken`
- **Datos del Usuario**: Almacenado en `localStorage.user` (JSON)

## Notas de Seguridad

- El token JWT se incluye automáticamente en todas las peticiones
- Si se detecta un token inválido (401), se limpia automáticamente
- Los datos sensibles se limpian al cerrar sesión
