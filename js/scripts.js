const API_BASE = 'http://localhost:3001/api';
const STORAGE_KEY = 'bonded-auth';

function getSession() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || null;
  } catch {
    return null;
  }
}

function setSession(session) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
}

function clearSession() {
  localStorage.removeItem(STORAGE_KEY);
}

function redirectByRole(user) {
  if (!user) {
    window.location.replace('index.html');
    return;
  }

  window.location.replace(user.role === 'student' ? 'match.html' : 'profile.html');
}

function parseInterests(value) {
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

async function apiRequest(path, options = {}, useAuth = true) {
  const session = getSession();
  const headers = { ...(options.headers || {}) };

  if (useAuth && session?.token) {
    headers.Authorization = `Bearer ${session.token}`;
  }

  if (options.body && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  const contentType = response.headers.get('content-type') || '';
  const payload = contentType.includes('application/json') ? await response.json() : null;

  if (!response.ok) {
    const error = new Error(payload?.error || 'Request failed');
    error.details = payload?.details;
    error.status = response.status;
    throw error;
  }

  return payload;
}

function setMessage(target, message, type = '') {
  if (!target) {
    return;
  }

  target.textContent = message || '';
  target.className = `form-message ${type}`.trim();
}

function toggleAlumniFields(role) {
  document.querySelectorAll('[data-alumni-only]').forEach((block) => {
    const inputs = block.querySelectorAll('input');

    if (role === 'alumni') {
      block.removeAttribute('data-hidden');
      inputs.forEach((input) => {
        input.required = true;
      });
      return;
    }

    block.setAttribute('data-hidden', 'true');
    inputs.forEach((input) => {
      input.required = false;
      input.value = '';
    });
  });
}

function bindLogout() {
  document.querySelectorAll('[data-logout]').forEach((button) => {
    button.addEventListener('click', () => {
      clearSession();
      window.location.replace('index.html');
    });
  });
}

function applyRoleVisibility(user) {
  document.querySelectorAll('[data-student-only]').forEach((link) => {
    if (user?.role === 'student') {
      link.removeAttribute('data-hidden');
      return;
    }

    link.setAttribute('data-hidden', 'true');
  });
}

async function ensureSession() {
  const session = getSession();

  if (!session?.token) {
    window.location.replace('index.html');
    return null;
  }

  if (session.user) {
    return session;
  }

  try {
    const data = await apiRequest('/profile/me');
    const resolved = { token: session.token, user: data.user };
    setSession(resolved);
    return resolved;
  } catch {
    clearSession();
    window.location.replace('index.html');
    return null;
  }
}

function createTag(text) {
  const tag = document.createElement('span');
  tag.className = 'tag';
  tag.textContent = text;
  return tag;
}

async function initLoginPage() {
  const existingSession = getSession();
  if (existingSession?.token) {
    redirectByRole(existingSession.user);
    return;
  }

  const form = document.getElementById('login-form');
  const message = document.querySelector('[data-form-message]');

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    setMessage(message, 'Signing in...');

    try {
      const data = await apiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: form.email.value.trim(),
          password: form.password.value,
        }),
      }, false);

      setSession({ token: data.token, user: data.user });
      redirectByRole(data.user);
    } catch (error) {
      setMessage(message, error.message, 'error');
    }
  });
}

async function initSignupPage() {
  const existingSession = getSession();
  if (existingSession?.token) {
    redirectByRole(existingSession.user);
    return;
  }

  const form = document.getElementById('signup-form');
  const message = document.querySelector('[data-form-message]');
  const roleSelect = form.role;

  const syncRole = () => toggleAlumniFields(roleSelect.value);
  roleSelect.addEventListener('change', syncRole);
  syncRole();

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const payload = {
      email: form.email.value.trim(),
      password: form.password.value,
      role: form.role.value,
      fullName: form.fullName.value.trim(),
      gradYear: Number(form.gradYear.value),
      domain: form.domain.value.trim(),
      interests: parseInterests(form.interests.value),
      bio: form.bio.value.trim(),
    };

    if (payload.role === 'alumni') {
      payload.company = form.company.value.trim();
      payload.jobTitle = form.jobTitle.value.trim();
    }

    setMessage(message, 'Creating account...');

    try {
      await apiRequest('/auth/signup', {
        method: 'POST',
        body: JSON.stringify(payload),
      }, false);

      const loginData = await apiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: payload.email,
          password: payload.password,
        }),
      }, false);

      setSession({ token: loginData.token, user: loginData.user });
      redirectByRole(loginData.user);
    } catch (error) {
      setMessage(message, error.message, 'error');
    }
  });
}

function fillProfileForm(form, profile) {
  if (!form || !profile) {
    return;
  }

  form.fullName.value = profile.fullName || '';
  form.gradYear.value = profile.gradYear || '';
  form.domain.value = profile.domain || '';
  form.interests.value = Array.isArray(profile.interests) ? profile.interests.join(', ') : '';
  form.bio.value = profile.bio || '';
  form.company.value = profile.company || '';
  form.jobTitle.value = profile.jobTitle || '';
}

async function initProfilePage() {
  const session = await ensureSession();
  if (!session) {
    return;
  }

  bindLogout();
  applyRoleVisibility(session.user);
  toggleAlumniFields(session.user.role);

  const status = document.querySelector('[data-user-status]');
  if (status) {
    status.textContent = `${session.user.profile?.fullName || session.user.email} · ${session.user.role}`;
  }

  const form = document.getElementById('profile-form');
  const message = document.querySelector('[data-form-message]');
  fillProfileForm(form, session.user.profile || {});

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const payload = {
      fullName: form.fullName.value.trim(),
      gradYear: Number(form.gradYear.value),
      domain: form.domain.value.trim(),
      interests: parseInterests(form.interests.value),
      bio: form.bio.value.trim(),
    };

    if (session.user.role === 'alumni') {
      payload.company = form.company.value.trim();
      payload.jobTitle = form.jobTitle.value.trim();
    }

    setMessage(message, 'Saving profile...');

    try {
      const data = await apiRequest('/profile/me', {
        method: 'PUT',
        body: JSON.stringify(payload),
      });

      setSession({ token: session.token, user: data.user });
      setMessage(message, 'Profile saved.', 'success');
      applyRoleVisibility(data.user);
      toggleAlumniFields(data.user.role);
      if (status) {
        status.textContent = `${data.user.profile?.fullName || data.user.email} · ${data.user.role}`;
      }
    } catch (error) {
      setMessage(message, error.message, 'error');
    }
  });
}

async function initMatchPage() {
  const session = await ensureSession();
  if (!session) {
    return;
  }

  if (session.user.role !== 'student') {
    window.location.replace('profile.html');
    return;
  }

  bindLogout();
  applyRoleVisibility(session.user);

  const summary = document.getElementById('match-summary');
  const grid = document.getElementById('match-grid');
  const form = document.getElementById('match-filters');
  const template = document.getElementById('match-card-template');
  const statusChip = document.querySelector('[data-user-status]');
  const state = { connectionMap: new Map() };

  if (statusChip) {
    statusChip.textContent = `${session.user.profile?.fullName || session.user.email} · ${session.user.role}`;
  }

  async function loadConnections() {
    const data = await apiRequest('/connections');
    state.connectionMap = new Map(
      data.data.map((connection) => [connection.counterpart.id, connection.status]),
    );
  }

  function renderMatches(matches) {
    grid.innerHTML = '';

    if (!matches.length) {
      summary.textContent = 'No alumni matched these filters.';
      return;
    }

    summary.textContent = `${matches.length} alumni matched your search.`;

    matches.forEach((match) => {
      const card = template.content.firstElementChild.cloneNode(true);
      const profile = match.profile || {};
      const currentStatus = state.connectionMap.get(match.id) || null;
      const statusEl = card.querySelector('.request-status');
      const button = card.querySelector('.connect-button');

      card.querySelector('.card-kicker').textContent = profile.jobTitle ? `${profile.jobTitle} · ${profile.company || 'Alumni'}` : 'Alumni mentor';
      card.querySelector('h3').textContent = profile.fullName || 'Alumni';
      card.querySelector('.score-pill').textContent = `${match.score} score`;
      card.querySelector('.match-bio').textContent = profile.bio || 'No bio provided.';

      const tags = card.querySelector('.match-tags');
      tags.appendChild(createTag(profile.domain || 'No domain listed'));
      tags.appendChild(createTag(`${profile.gradYear || 'N/A'} grad`));
      (Array.isArray(profile.interests) ? profile.interests : []).slice(0, 4).forEach((interest) => tags.appendChild(createTag(interest)));

      if (currentStatus) {
        statusEl.textContent = currentStatus;
        statusEl.classList.add(currentStatus);
        button.textContent = currentStatus === 'pending' ? 'Request sent' : currentStatus === 'accepted' ? 'Connected' : 'Declined';
        button.disabled = true;
      } else {
        statusEl.textContent = 'Not connected';
        button.addEventListener('click', async () => {
          button.disabled = true;
          button.textContent = 'Sending...';

          try {
            const created = await apiRequest('/connections', {
              method: 'POST',
              body: JSON.stringify({ alumniId: match.id }),
            });

            state.connectionMap.set(match.id, created.connection.status);
            statusEl.textContent = created.connection.status;
            statusEl.className = `request-status ${created.connection.status}`;
            button.textContent = 'Request sent';
          } catch (error) {
            statusEl.textContent = error.message;
            statusEl.className = 'request-status declined';
            button.disabled = false;
            button.textContent = 'Connect';
          }
        });
      }

      grid.appendChild(card);
    });
  }

  async function loadMatches(filters = {}) {
    summary.textContent = 'Loading matches...';
    grid.innerHTML = '';

    const params = new URLSearchParams();
    if (filters.domain) params.set('domain', filters.domain);
    if (filters.minYear) params.set('minYear', filters.minYear);
    if (filters.maxYear) params.set('maxYear', filters.maxYear);

    await loadConnections();
    const data = await apiRequest(`/match${params.toString() ? `?${params.toString()}` : ''}`);
    renderMatches(data.data);
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    try {
      await loadMatches({
        domain: form.domain.value.trim(),
        minYear: form.minYear.value.trim(),
        maxYear: form.maxYear.value.trim(),
      });
    } catch (error) {
      summary.textContent = error.message;
    }
  });

  await loadMatches();
}

document.addEventListener('DOMContentLoaded', () => {
  const page = document.body.dataset.page;

  if (page === 'login') {
    initLoginPage();
  }

  if (page === 'signup') {
    initSignupPage();
  }

  if (page === 'profile') {
    initProfilePage();
  }

  if (page === 'match') {
    initMatchPage();
  }
});