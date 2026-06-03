const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const logClientActivity = async (action, details = '') => {
  try {
    const token = localStorage.getItem('auth_token');
    const headers = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    // Fire and forget, catch errors silently to avoid disrupting user experience
    fetch(`${API_URL}/api/logs/activity`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ action, details }),
    }).catch(() => {});
  } catch (e) {
    // Silent catch
  }
};
