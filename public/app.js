const form = document.querySelector('#contact-form');
const list = document.querySelector('#contacts');
const loading = document.querySelector('#loading');
const message = document.querySelector('#message');

function showMessage(text, kind) {
  message.textContent = text;
  message.className = kind;
}

async function loadContacts() {
  loading.hidden = false;
  list.replaceChildren();
  try {
    const response = await fetch('/api/contactos');
    if (!response.ok) throw new Error('No se pudo cargar la agenda.');
    const contacts = await response.json();
    loading.hidden = true;
    if (!contacts.length) {
      const empty = document.createElement('li');
      empty.className = 'empty';
      empty.textContent = 'Todavía no hay contactos guardados.';
      list.append(empty);
      return;
    }
    contacts.forEach(({ nombre, telefono, email }) => {
      const item = document.createElement('li');
      item.className = 'contact';
      item.innerHTML = \`<div><strong>\${escapeHtml(nombre)}</strong><small>\${escapeHtml(telefono)}\${email ? \` · \${escapeHtml(email)}\` : ''}</small></div>\`;
      list.append(item);
    });
  } catch (error) {
    loading.textContent = error.message;
  }
}

function escapeHtml(value) {
  return value.replace(/[&<>'"]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[character]));
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  const data = Object.fromEntries(new FormData(form));
  try {
    const response = await fetch('/api/contactos', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || 'No se pudo guardar el contacto.');
    form.reset();
    showMessage('Contacto guardado correctamente.', 'success');
    await loadContacts();
  } catch (error) {
    showMessage(error.message, 'error');
  }
});

document.querySelector('#refresh').addEventListener('click', loadContacts);
loadContacts();
