export const BASE_API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
export const API_URL = BASE_API_URL.endsWith('/') ? BASE_API_URL.slice(0, -1) : BASE_API_URL;

/**
 * Ensures an image URL is absolute and correctly points to the backend if relative.
 * @param {string} url - The URL to format
 * @returns {string} - The absolute URL
 */
export const getFullImageUrl = (url) => {
  if (!url || typeof url !== 'string') return '/logo.webp';
  
  // If it's already an absolute URL
  if (url.startsWith('http') || url.startsWith('data:')) {
    // If it's a localhost URL pointing to uploads but wrong port, fix it
    if (url.includes('localhost:') && url.includes('/uploads/')) {
       const parts = url.split('/uploads/');
       return `${API_URL}/uploads/${parts[1]}`;
    }
    return url;
  }

  // Normalize: remove leading slash to handle both /uploads and uploads
  const cleanPath = url.startsWith('/') ? url.substring(1) : url;

  // Case 1: Path starts with uploads/
  if (cleanPath.startsWith('uploads/')) {
    return `${API_URL}/${cleanPath}`;
  }

  // Case 2: Path is just the kiks- filename
  if (cleanPath.match(/^kiks-/)) {
    return `${API_URL}/uploads/${cleanPath}`;
  }

  // Case 3: Public folder assets (fallback to leading slash)
  return `/${cleanPath}`;
};
