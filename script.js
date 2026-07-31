const dropdowns = document.querySelectorAll('.nav-dropdown');

dropdowns.forEach((dropdown) => {
  const toggle = dropdown.querySelector('.nav-dropdown-toggle');
  toggle.addEventListener('click', (event) => {
    event.stopPropagation();
    dropdowns.forEach((otherDropdown) => {
      if (otherDropdown !== dropdown) {
        otherDropdown.classList.remove('open');
        otherDropdown.querySelector('.nav-dropdown-toggle').setAttribute('aria-expanded', 'false');
      }
    });
    const open = dropdown.classList.toggle('open');
    toggle.setAttribute('aria-expanded', String(open));
  });
});

document.querySelectorAll('.submenu-toggle').forEach((toggle) => {
  toggle.addEventListener('click', (event) => {
    event.stopPropagation();
    const parent = toggle.closest('.submenu-parent');
    parent.parentElement.querySelectorAll('.submenu-parent').forEach((otherParent) => {
      if (otherParent !== parent) {
        otherParent.classList.remove('submenu-open');
        otherParent.querySelector('.submenu-toggle').setAttribute('aria-expanded', 'false');
      }
    });
    const open = parent.classList.toggle('submenu-open');
    toggle.setAttribute('aria-expanded', String(open));
  });
});

document.addEventListener('click', () => {
  dropdowns.forEach((dropdown) => {
    dropdown.classList.remove('open');
    dropdown.querySelector('.nav-dropdown-toggle').setAttribute('aria-expanded', 'false');
    dropdown.querySelectorAll('.submenu-parent').forEach((submenu) => submenu.classList.remove('submenu-open'));
    dropdown.querySelectorAll('.submenu-toggle').forEach((toggle) => toggle.setAttribute('aria-expanded', 'false'));
  });
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') document.dispatchEvent(new MouseEvent('click'));
});

document.querySelectorAll('.dropdown-menu .pending').forEach((link) => {
  link.addEventListener('click', (event) => event.preventDefault());
});

const editableSelector = [
  'main h1',
  'main h2',
  'main h3',
  'main p',
  'main figcaption',
  'main li'
].join(',');

const pageKey = `ws-edit:${window.location.pathname.split('/').pop() || 'index.html'}`;
const editableElements = Array.from(document.querySelectorAll(editableSelector)).filter((element) => {
  if (element.closest('.edit-toolbar')) return false;
  if (element.closest('nav')) return false;
  if (element.querySelector('img, svg, form, input, textarea, button')) return false;
  return element.textContent.trim().length > 0;
});

editableElements.forEach((element, index) => {
  const key = `${pageKey}:${index}`;
  element.dataset.editKey = key;
  const savedValue = localStorage.getItem(key);
  if (savedValue !== null) element.innerHTML = savedValue;
});

if (editableElements.length) {
  const currentFileName = window.location.pathname.split('/').pop() || 'index.html';
  const toolbar = document.createElement('div');
  toolbar.className = 'edit-toolbar';
  toolbar.setAttribute('aria-label', 'Teksten aanpassen');
  toolbar.innerHTML = `
    <button class="edit-toggle" type="button">Tekst aanpassen</button>
    <button class="edit-save secondary" type="button">Bewaar in browser</button>
    <button class="edit-download secondary" type="button">Download ${currentFileName}</button>
    <button class="edit-reset secondary" type="button">Herstel</button>
    <span class="edit-status" aria-live="polite">Bewaard in deze browser</span>
  `;
  document.body.appendChild(toolbar);

  const toggleButton = toolbar.querySelector('.edit-toggle');
  const saveButton = toolbar.querySelector('.edit-save');
  const downloadButton = toolbar.querySelector('.edit-download');
  const resetButton = toolbar.querySelector('.edit-reset');
  const status = toolbar.querySelector('.edit-status');

  const setStatus = (message) => {
    status.textContent = message;
  };

  const saveTextChanges = () => {
    editableElements.forEach((element) => {
      localStorage.setItem(element.dataset.editKey, element.innerHTML);
    });
    setStatus('Bewaard in deze browser');
  };

  const downloadCurrentPage = () => {
    const clone = document.documentElement.cloneNode(true);
    clone.querySelector('.edit-toolbar')?.remove();
    clone.querySelector('body')?.classList.remove('edit-mode');
    clone.querySelectorAll('[contenteditable], [spellcheck]').forEach((element) => {
      element.removeAttribute('contenteditable');
      element.removeAttribute('spellcheck');
    });

    const html = `<!doctype html>\n${clone.outerHTML}`;
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = currentFileName;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(link.href);
    setStatus(`${currentFileName} gedownload`);
  };

  const setEditMode = (enabled) => {
    document.body.classList.toggle('edit-mode', enabled);
    editableElements.forEach((element) => {
      element.contentEditable = String(enabled);
      element.spellcheck = enabled;
    });
    toggleButton.textContent = enabled ? 'Stop bewerken' : 'Tekst aanpassen';
    setStatus(enabled ? 'Bewerkmodus actief' : 'Bewaard in deze browser');
  };

  toggleButton.addEventListener('click', () => {
    const isEditing = document.body.classList.contains('edit-mode');
    if (isEditing) saveTextChanges();
    setEditMode(!isEditing);
  });

  editableElements.forEach((element) => {
    element.addEventListener('input', () => {
      setStatus('Nog niet opgeslagen');
    });
  });

  saveButton.addEventListener('click', saveTextChanges);
  downloadButton.addEventListener('click', downloadCurrentPage);

  resetButton.addEventListener('click', () => {
    editableElements.forEach((element) => localStorage.removeItem(element.dataset.editKey));
    window.location.reload();
  });
}
