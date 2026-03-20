import axios from 'axios';

const BASE_URL = process.env.REACT_APP_API_URL || '/api';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 120000,
});

// ── Resume Analysis ───────────────────────────────────────────────────────────
export const analyzeResume = (file, jobDescription = '', onUploadProgress) => {
  const formData = new FormData();
  formData.append('resume', file);
  if (jobDescription.trim()) formData.append('job_description', jobDescription.trim());
  return api.post('/analyze/', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress,
  });
};

export const fetchHistory   = ()              => api.get('/history/');

// ── Builder ───────────────────────────────────────────────────────────────────
export const saveResume     = (template_id, resume_data) => api.post('/save-resume/',    { template_id, resume_data });
export const trackDownload  = ()                         => api.post('/track-download/', {});
export const subscribe      = ()                         => api.post('/subscribe/',      {});

// ── Admin ─────────────────────────────────────────────────────────────────────
export const adminGetUsers  = ()      => api.get('/admin/users/');
export const adminGrant     = (email) => api.post('/admin/grant/',  { email });
export const adminRevoke    = (email) => api.post('/admin/revoke/', { email });

// ── Health ────────────────────────────────────────────────────────────────────
export const healthCheck    = ()      => api.get('/health/');

export default api;
