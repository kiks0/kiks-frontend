import { store } from '../store';
import { login, logout } from '../store/authSlice';

const { fetch: originalFetch } = window;

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

window.fetch = async (...args) => {
  let [resource, config] = args;
  
  // Convert resource to string for easy URL checking
  const urlStr = typeof resource === 'string' ? resource : resource.url;
  const isBackendRequest = urlStr.startsWith(API_URL) || urlStr.startsWith('/api/');

  if (isBackendRequest) {
    config = config || {};
    config.headers = config.headers || {};
    config.credentials = 'include'; // Ensure cookies are sent/received in CORS requests

    // Attach access token if present in localStorage
    const token = localStorage.getItem('auth_token');
    if (token) {
      // Handle different headers formats
      if (config.headers instanceof Headers) {
        if (!config.headers.has('Authorization')) {
          config.headers.set('Authorization', `Bearer ${token}`);
        }
      } else if (Array.isArray(config.headers)) {
        const hasAuth = config.headers.some(h => h[0].toLowerCase() === 'authorization');
        if (!hasAuth) {
          config.headers.push(['Authorization', `Bearer ${token}`]);
        }
      } else {
        if (!config.headers['Authorization'] && !config.headers['authorization']) {
          config.headers['Authorization'] = `Bearer ${token}`;
        }
      }
    }
  }

  // Run the original fetch
  let response = await originalFetch(resource, config);

  // If unauthorized (401) and it is a protected backend endpoint
  if (
    response.status === 401 &&
    isBackendRequest &&
    !urlStr.includes('/api/auth/refresh') &&
    !urlStr.includes('/api/auth/login') &&
    !urlStr.includes('/api/auth/register') &&
    !urlStr.includes('/api/users/reactivate-verify')
  ) {
    console.log('[AUTH] Access token expired. Triggering silent token refresh...');

    try {
      // Call the refresh endpoint to get a new access token
      const refreshResponse = await originalFetch(`${API_URL}/api/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
      });

      if (refreshResponse.ok) {
        const data = await refreshResponse.json();
        if (data.success && data.token) {
          console.log('[AUTH] Token refresh successful.');

          // Save new credentials
          localStorage.setItem('auth_token', data.token);
          localStorage.setItem('auth_user', JSON.stringify(data.user));
          localStorage.setItem('currentUser', JSON.stringify(data.user));
          
          // Dispatch to Redux store to update app state
          store.dispatch(login({ user: data.user, token: data.token }));

          // Retry the original request with the new access token
          if (config.headers instanceof Headers) {
            config.headers.set('Authorization', `Bearer ${data.token}`);
          } else if (Array.isArray(config.headers)) {
            const authIdx = config.headers.findIndex(h => h[0].toLowerCase() === 'authorization');
            if (authIdx !== -1) {
              config.headers[authIdx][1] = `Bearer ${data.token}`;
            } else {
              config.headers.push(['Authorization', `Bearer ${data.token}`]);
            }
          } else {
            config.headers['Authorization'] = `Bearer ${data.token}`;
            if (config.headers['authorization']) {
              config.headers['authorization'] = `Bearer ${data.token}`;
            }
          }

          // Rerun original fetch with updated config
          response = await originalFetch(resource, config);
        }
      } else {
        throw new Error('Refresh response not OK');
      }
    } catch (refreshError) {
      console.warn('[AUTH] Silent refresh failed or expired. Logging out user.', refreshError);
      
      // Clear local storage and logout
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
      localStorage.removeItem('currentUser');
      localStorage.removeItem('shopping_cart');

      store.dispatch(logout());

      // Redirect to login page if we aren't already there
      if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/register')) {
        window.location.href = '/login?expired=true';
      }
    }
  }

  return response;
};
