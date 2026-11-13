# Servicio Web de Agenda

Implementación de la Tarea 5: un servicio web en Node.js con Express para listar y almacenar contactos.

## Ejecutar

```bash
npm install
npm start
```

Luego abre <http://localhost:3000>.

## API

### Listar contactos

```http
GET /api/contactos
```

### Guardar contacto

```http
POST /api/contactos
Content-Type: application/json

{"nombre":"Ana Pérez","telefono":"809-555-0101","email":"ana@correo.com"}
```

La respuesta exitosa es `201 Created`. Los datos se conservan en `data/contacts.json`.
