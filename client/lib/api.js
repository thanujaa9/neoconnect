const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

const getToken = () => localStorage.getItem('token');

const headers = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${getToken()}`
});

export const api = {
  register: (data) => fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(r => r.json()),

  login: (data) => fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(r => r.json()),

  getMe: () => fetch(`${BASE_URL}/auth/me`, { headers: headers() }).then(r => r.json()),
  getManagers: () => fetch(`${BASE_URL}/auth/managers`, { headers: headers() }).then(r => r.json()),
  submitCase: (formData) => fetch(`${BASE_URL}/cases`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${getToken()}` },
    body: formData
  }).then(r => r.json()),

  getAllCases: () => fetch(`${BASE_URL}/cases`, { headers: headers() }).then(r => r.json()),

  getMyCases: () => fetch(`${BASE_URL}/cases/mycases`, { headers: headers() }).then(r => r.json()),

  getCase: (id) => fetch(`${BASE_URL}/cases/${id}`, { headers: headers() }).then(r => r.json()),

  trackCase: (trackingId) => fetch(`${BASE_URL}/cases/track/${trackingId}`).then(r => r.json()),
  
  resolveCase: (id, data) => fetch(`${BASE_URL}/cases/${id}/resolve`, {
  method: 'PATCH',
  headers: headers(),
  body: JSON.stringify(data)
}).then(r => r.json()),

getSecretariatCases: () => fetch(`${BASE_URL}/cases/mycases/secretariat`, { headers: headers() }).then(r => r.json()),
getDigest: () => fetch(`${BASE_URL}/hub/digest`).then(r => r.json()),
getImpact: () => fetch(`${BASE_URL}/hub/impact`).then(r => r.json()),
getMinutes: () => fetch(`${BASE_URL}/hub/minutes`).then(r => r.json()),
uploadMinutes: (formData) => fetch(`${BASE_URL}/hub/minutes`, {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${getToken()}` },
  body: formData
}).then(r => r.json()),
  assignCase: (id, assignedTo) => fetch(`${BASE_URL}/cases/${id}/assign`, {
    method: 'PATCH',
    headers: headers(),
    body: JSON.stringify({ assignedTo })
  }).then(r => r.json()),

  updateStatus: (id, status) => fetch(`${BASE_URL}/cases/${id}/status`, {
    method: 'PATCH',
    headers: headers(),
    body: JSON.stringify({ status })
  }).then(r => r.json()),

  addNote: (id, text) => fetch(`${BASE_URL}/cases/${id}/notes`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({ text })
  }).then(r => r.json()),

  getPolls: () => fetch(`${BASE_URL}/polls`, { headers: headers() }).then(r => r.json()),

  createPoll: (data) => fetch(`${BASE_URL}/polls`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify(data)
  }).then(r => r.json()),
closePoll: (pollId) => fetch(`${BASE_URL}/polls/${pollId}/close`, {
  method: 'PATCH',
  headers: headers()
}).then(r => r.json()),
  vote: (pollId, optionId) => fetch(`${BASE_URL}/polls/${pollId}/vote`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({ optionId })
  }).then(r => r.json()),

  getAnalytics: () => fetch(`${BASE_URL}/analytics`, { headers: headers() }).then(r => r.json()),
};