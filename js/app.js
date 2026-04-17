const BASE_URL = 'https://dummyjson.com';

const state = {
  users: [],
  nextClientId: 1000,
};

const $ = (id) => document.getElementById(id);

const dom = {
  loading: $('loadingState'),
  error: $('errorState'),
  errorMsg: $('errorMsg'),
  empty: $('emptyState'),
  table: $('tableContainer'),
  tableBody: $('userTableBody'),
  countText: $('countText'),
  userCount: $('userCount'),
  toasts: $('toastContainer'),
  searchInput: $('searchInput'),
  searchBtn: $('searchBtn'),

  addModal: $('addModal'),
  addForm: $('addForm'),
  addFirstName: $('addFirstName'),
  addLastName: $('addLastName'),
  addEmail: $('addEmail'),
  addPhone: $('addPhone'),
  addSubmitBtn: $('addSubmitBtn'),
  addBtnText: $('addBtnText'),

  editModal: $('editModal'),
  editForm: $('editForm'),
  editId: $('editUserId'),
  editFirst: $('editFirstName'),
  editLast: $('editLastName'),
  editEmail: $('editEmail'),
  editPhone: $('editPhone'),
  editSubmitBtn: $('editSubmitBtn'),
  editBtnText: $('editBtnText'),

  deleteModal: $('deleteModal'),
  deleteUserId: $('deleteUserId'),
  deleteUserName: $('deleteUserName'),
  deleteBtnText: $('deleteBtnText'),
};

function escapeHtml(value) {
  const element = document.createElement('div');
  element.textContent = value ?? '';
  return element.innerHTML;
}

function initials(firstName, lastName) {
  return `${firstName?.[0] ?? ''}${lastName?.[0] ?? ''}`.toUpperCase() || '?';
}

function avatarColors(seed) {
  const palettes = [
    ['#c8ff00', '#1a1a00'],
    ['#38bdf8', '#001a2c'],
    ['#34d399', '#0a1f18'],
    ['#f472b6', '#1f0a15'],
    ['#fb923c', '#1f0e00'],
    ['#a78bfa', '#0e0a1f'],
    ['#fbbf24', '#1f1600'],
    ['#818cf8', '#0f0f1f'],
  ];

  let hash = 0;
  for (const char of `${seed ?? ''}`) {
    hash = (hash * 31 + char.charCodeAt(0)) & 0xffff;
  }

  const [background, foreground] = palettes[hash % palettes.length];
  return { background, foreground };
}

function userDisplayName(user) {
  return `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim();
}

function getApiId(user) {
  return user.serverId ?? user.id;
}

function setLoadingButton(button, labelEl, label, loading) {
  button.classList.toggle('btn-loading', loading);
  labelEl.textContent = label;
}

function showState(name) {
  dom.loading.classList.toggle('hidden', name !== 'loading');
  dom.loading.classList.toggle('flex', name === 'loading');

  dom.error.classList.toggle('hidden', name !== 'error');
  dom.error.classList.toggle('flex', name === 'error');

  dom.empty.classList.toggle('hidden', name !== 'empty');
  dom.empty.classList.toggle('flex', name === 'empty');

  dom.table.classList.toggle('hidden', name !== 'table');
}

function toast(message, type = 'success') {
  const icons = {
    success: '<svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>',
    error: '<svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>',
    info: '<svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>',
  };

  const element = document.createElement('div');
  element.className = `toast toast-${type}`;
  element.innerHTML = `${icons[type] ?? icons.info}<span>${escapeHtml(message)}</span>`;
  dom.toasts.appendChild(element);

  window.setTimeout(() => {
    element.style.animation = 'toastOut 0.3s ease forwards';
    window.setTimeout(() => element.remove(), 300);
  }, 2800);
}

function setCount(count) {
  dom.countText.textContent = `${count} user${count === 1 ? '' : 's'}`;
  dom.userCount.classList.remove('hidden');
}

function filterUsers(query) {
  const normalizedQuery = query.trim().toLowerCase();

  if (!normalizedQuery) {
    return state.users;
  }

  return state.users.filter((user) => {
    const haystack = [user.id, user.firstName, user.lastName, user.email, user.phone]
      .join(' ')
      .toLowerCase();
    return haystack.includes(normalizedQuery);
  });
}

function renderUsers(list) {
  dom.tableBody.innerHTML = '';
  setCount(list.length);

  if (!list.length) {
    showState('empty');
    return;
  }

  showState('table');

  list.forEach((user, index) => {
    const row = document.createElement('div');
    row.className = 'user-row';
    row.id = `row-${user.id}`;
    row.style.animationDelay = `${Math.min(index * 0.03, 0.4)}s`;

    const avatar = avatarColors(userDisplayName(user));

    row.innerHTML = `
      <div class="col-span-1 text-xs text-white/20 font-mono">#${escapeHtml(user.id)}</div>
      <div class="col-span-2 flex items-center gap-2">
        <span class="user-avatar" style="background:${avatar.background};color:${avatar.foreground}">${initials(user.firstName, user.lastName)}</span>
        <span class="truncate-text text-sm text-white/80">${escapeHtml(user.firstName)}</span>
      </div>
      <div class="col-span-2 text-sm text-white/60 truncate-text pr-2">${escapeHtml(user.lastName)}</div>
      <div class="col-span-3 text-xs text-white/40 truncate-text pr-2">${escapeHtml(user.email)}</div>
      <div class="col-span-2 text-xs text-white/40 truncate-text pr-2">${escapeHtml(user.phone)}</div>
      <div class="col-span-2 flex gap-2 justify-end actions-cell">
        <button type="button" class="btn-edit" data-action="edit" data-id="${user.id}">Edit</button>
        <button type="button" class="btn-delete" data-action="delete" data-id="${user.id}">Delete</button>
      </div>
    `;

    dom.tableBody.appendChild(row);
  });
}

function renderCurrentView() {
  const query = dom.searchInput.value.trim();
  renderUsers(filterUsers(query));
}

async function loadUsers() {
  showState('loading');

  try {
    const response = await fetch(`${BASE_URL}/users?limit=1000`);

    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }

    const data = await response.json();
    state.users = (data.users ?? []).map((user) => ({
      ...user,
      serverId: user.id,
    }));

    renderCurrentView();
  } catch (error) {
    dom.errorMsg.textContent = `Error: ${error.message}`;
    showState('error');
    toast('Failed to load users', 'error');
  }
}

function openModal(modalName) {
  const modal = modalName === 'add' ? dom.addModal : modalName === 'edit' ? dom.editModal : dom.deleteModal;
  modal.classList.remove('hidden');
  modal.classList.add('flex');
  document.body.style.overflow = 'hidden';
}

function closeModal(modalName) {
  const modal = modalName === 'add' ? dom.addModal : modalName === 'edit' ? dom.editModal : dom.deleteModal;
  modal.classList.add('hidden');
  modal.classList.remove('flex');
  document.body.style.overflow = '';
}

function openAddModal() {
  dom.addForm.reset();
  openModal('add');
  window.setTimeout(() => dom.addFirstName.focus(), 0);
}

function findUserById(id) {
  return state.users.find((user) => Number(user.id) === Number(id));
}

function openEdit(id) {
  const user = findUserById(id);

  if (!user) {
    toast('User not found', 'error');
    return;
  }

  dom.editId.value = user.id;
  dom.editFirst.value = user.firstName ?? '';
  dom.editLast.value = user.lastName ?? '';
  dom.editEmail.value = user.email ?? '';
  dom.editPhone.value = user.phone ?? '';

  openModal('edit');
  window.setTimeout(() => dom.editFirst.focus(), 0);
}

function openDelete(id) {
  const user = findUserById(id);

  if (!user) {
    toast('User not found', 'error');
    return;
  }

  dom.deleteUserId.value = user.id;
  dom.deleteUserName.textContent = `"${userDisplayName(user)}" will be permanently removed.`;
  openModal('delete');
}

async function createUser(payload) {
  const response = await fetch(`${BASE_URL}/users/add`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  const data = await response.json();
  const createdUser = {
    ...payload,
    ...data,
    id: state.nextClientId++,
    serverId: data.id ?? null,
  };

  state.users.unshift(createdUser);
  renderCurrentView();
  closeModal('add');
  dom.addForm.reset();
  toast(`User "${userDisplayName(createdUser)}" created successfully`, 'success');
}

async function updateUser(id, payload) {
  const user = findUserById(id);
  if (!user) {
    throw new Error('User not found');
  }

  const response = await fetch(`${BASE_URL}/users/${getApiId(user)}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  const updatedData = await response.json();
  state.users = state.users.map((item) => {
    if (Number(item.id) !== Number(id)) {
      return item;
    }

    return {
      ...item,
      ...payload,
      ...updatedData,
      id: item.id,
      serverId: item.serverId ?? updatedData.id ?? item.id,
    };
  });

  renderCurrentView();
  closeModal('edit');
  toast(`User "${payload.firstName} ${payload.lastName}" updated successfully`, 'success');
}

async function deleteUser(id) {
  const user = findUserById(id);

  if (!user) {
    throw new Error('User not found');
  }

  const response = await fetch(`${BASE_URL}/users/${getApiId(user)}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  state.users = state.users.filter((item) => Number(item.id) !== Number(id));
  renderCurrentView();
  closeModal('delete');
  toast(`User "${userDisplayName(user)}" deleted`, 'info');
}

dom.addForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  const payload = {
    firstName: dom.addFirstName.value.trim(),
    lastName: dom.addLastName.value.trim(),
    email: dom.addEmail.value.trim(),
    phone: dom.addPhone.value.trim(),
  };

  setLoadingButton(dom.addSubmitBtn, dom.addBtnText, 'Creating...', true);

  try {
    await createUser(payload);
  } catch (error) {
    toast(`Create failed: ${error.message}`, 'error');
  } finally {
    setLoadingButton(dom.addSubmitBtn, dom.addBtnText, 'Create User', false);
  }
});

dom.editForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  const id = Number(dom.editId.value);
  const payload = {
    firstName: dom.editFirst.value.trim(),
    lastName: dom.editLast.value.trim(),
    email: dom.editEmail.value.trim(),
    phone: dom.editPhone.value.trim(),
  };

  setLoadingButton(dom.editSubmitBtn, dom.editBtnText, 'Saving...', true);

  try {
    await updateUser(id, payload);
  } catch (error) {
    toast(`Update failed: ${error.message}`, 'error');
  } finally {
    setLoadingButton(dom.editSubmitBtn, dom.editBtnText, 'Save Changes', false);
  }
});

$('confirmDelete').addEventListener('click', async () => {
  const id = Number(dom.deleteUserId.value);
  const button = $('confirmDelete');

  setLoadingButton(button, dom.deleteBtnText, 'Deleting...', true);

  try {
    const row = $(`row-${id}`);
    if (row) {
      row.style.transition = 'opacity 0.25s ease, transform 0.25s ease';
      row.style.opacity = '0';
      row.style.transform = 'translateX(-10px)';
      await new Promise((resolve) => window.setTimeout(resolve, 250));
    }

    await deleteUser(id);
  } catch (error) {
    toast(`Delete failed: ${error.message}`, 'error');
  } finally {
    setLoadingButton(button, dom.deleteBtnText, 'Delete', false);
  }
});

let searchTimer;

dom.searchInput.addEventListener('input', () => {
  window.clearTimeout(searchTimer);
  searchTimer = window.setTimeout(() => {
    renderCurrentView();
  }, 200);
});

dom.searchBtn.addEventListener('click', async () => {
  const query = dom.searchInput.value.trim();

  if (!query) {
    renderUsers(state.users);
    return;
  }

  showState('loading');

  try {
    const response = await fetch(`${BASE_URL}/users/search?q=${encodeURIComponent(query)}`);

    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }

    const data = await response.json();
    renderUsers((data.users ?? []).map((user) => ({
      ...user,
      serverId: user.id,
    })));
  } catch (error) {
    dom.errorMsg.textContent = `Search failed: ${error.message}`;
    showState('error');
    toast(`Search failed: ${error.message}`, 'error');
  }
});

dom.searchInput.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    event.preventDefault();
    dom.searchBtn.click();
  }
});

dom.tableBody.addEventListener('click', (event) => {
  const button = event.target.closest('button[data-action]');

  if (!button) {
    return;
  }

  const id = Number(button.dataset.id);

  if (button.dataset.action === 'edit') {
    openEdit(id);
    return;
  }

  if (button.dataset.action === 'delete') {
    openDelete(id);
  }
});

$('openAddModal').addEventListener('click', openAddModal);
$('closeAddModal').addEventListener('click', () => closeModal('add'));
$('cancelAdd').addEventListener('click', () => closeModal('add'));
$('addModalBackdrop').addEventListener('click', () => closeModal('add'));

$('closeEditModal').addEventListener('click', () => closeModal('edit'));
$('cancelEdit').addEventListener('click', () => closeModal('edit'));
$('editModalBackdrop').addEventListener('click', () => closeModal('edit'));

$('cancelDelete').addEventListener('click', () => closeModal('delete'));
document.querySelector('#deleteModal .modal-backdrop').addEventListener('click', () => closeModal('delete'));

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    closeModal('add');
    closeModal('edit');
    closeModal('delete');
  }
});

loadUsers();