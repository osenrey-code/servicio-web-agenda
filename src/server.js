const express = require('express');
const fs = require('node:fs/promises');
const path = require('node:path');

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const DATA_FILE = path.join(__dirname, '..', 'data', 'contacts.json');

app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'public')));

async function readContacts() {
  try {
    const content = await fs.readFile(DATA_FILE, 'utf8');
    return JSON.parse(content);
  } catch (error) {
    if (error.code === 'ENOENT') return [];
    throw error;
  }
}

async function writeContacts(contacts) {
  await fs.mkdir(path.dirname(DATA_FILE), { recursive: true });
  await fs.writeFile(DATA_FILE, JSON.stringify(contacts, null, 2) + '\\n', 'utf8');
}

function validateContact(body) {
  const nombre = typeof body.nombre === 'string' ? body.nombre.trim() : '';
  const telefono = typeof body.telefono === 'string' ? body.telefono.trim() : '';
  const email = typeof body.email === 'string' ? body.email.trim() : '';

  if (!nombre) return { error: 'El campo nombre es obligatorio.' };
  if (!telefono) return { error: 'El campo telefono es obligatorio.' };
  if (email && !/^\\S+@\\S+\\.\\S+$/.test(email)) {
    return { error: 'El email no tiene un formato válido.' };
  }

  return { contact: { nombre, telefono, ...(email ? { email } : {}) } };
}

// GET /api/contactos: lista todos los contactos almacenados.
app.get('/api/contactos', async (_req, res, next) => {
  try {
    res.json(await readContacts());
  } catch (error) {
    next(error);
  }
});

// POST /api/contactos: almacena un nuevo contacto.
app.post('/api/contactos', async (req, res, next) => {
  const result = validateContact(req.body || {});
  if (result.error) return res.status(400).json({ error: result.error });

  try {
    const contacts = await readContacts();
    const contact = { id: Date.now(), ...result.contact };
    contacts.push(contact);
    await writeContacts(contacts);
    return res.status(201).json(contact);
  } catch (error) {
    return next(error);
  }
});

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'agenda' });
});

app.use((_req, res) => {
  res.status(404).json({ error: 'Recurso no encontrado.' });
});

app.use((error, _req, res, _next) => {
  console.error(error);
  res.status(500).json({ error: 'Ocurrió un error interno en el servidor.' });
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log('Servicio de agenda disponible en http://localhost:' + PORT);
  });
}

module.exports = { app, readContacts, writeContacts };
