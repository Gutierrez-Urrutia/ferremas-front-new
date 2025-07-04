# API Endpoints para la página de Admin

## Endpoint para obtener todos los usuarios

**GET** `/api/usuarios`

**Headers requeridos:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Respuesta esperada:**
```json
[
  {
    "id": 1,
    "nombre": "Juan Pérez",
    "email": "juan@example.com",
    "rol": "ADMIN"
  },
  {
    "id": 2,
    "nombre": "María García",
    "email": "maria@example.com",
    "rol": "VENDEDOR"
  },
  {
    "id": 3,
    "nombre": "Pedro López",
    "email": "pedro@example.com",
    "rol": "BODEGUERO"
  }
]
```

## Endpoint para cambiar rol de usuario

**PATCH** `/api/usuarios/{id}/rol`

**Headers requeridos:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Body:**
```json
{
  "rol": "VENDEDOR"
}
```

**Respuesta esperada:**
```json
{
  "id": 2,
  "nombre": "María García",
  "email": "maria@example.com",
  "rol": "VENDEDOR"
}
```

## Endpoint para eliminar usuario

**DELETE** `/api/usuarios/{id}`

**Headers requeridos:**
```
Authorization: Bearer {token}
```

**Respuesta esperada:** Status 204 (No Content)

## Notas importantes:

1. Todos los endpoints requieren autenticación con token Bearer
2. Solo usuarios con rol ADMIN pueden acceder a estos endpoints
3. El backend debe validar permisos antes de ejecutar las operaciones
4. Se recomienda implementar soft delete en lugar de eliminación física
