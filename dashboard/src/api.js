const BASE = '/api';

export async function fetchAgents() {
  const res = await fetch(`${BASE}/agents`);
  return res.json();
}

export async function fetchAgent(id) {
  const res = await fetch(`${BASE}/agents/${id}`);
  return res.json();
}

export async function createAgent(data) {
  const res = await fetch(`${BASE}/agents`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function updateAgent(id, data) {
  const res = await fetch(`${BASE}/agents/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function deleteAgent(id) {
  const res = await fetch(`${BASE}/agents/${id}`, { method: 'DELETE' });
  return res.json();
}

export async function toggleAgent(id) {
  const res = await fetch(`${BASE}/agents/${id}/toggle`, { method: 'PATCH' });
  return res.json();
}

export async function enhancePrompt({ mode, input, currentPrompt, type }) {
  const res = await fetch(`${BASE}/enhance`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ mode, input, currentPrompt, type }),
  });
  return res.json();
}
