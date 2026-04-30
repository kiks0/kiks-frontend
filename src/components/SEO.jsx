import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const SEO = ({ title, description, keywords, image }) => {
  const location = useLocation();

  useEffect(() => {
    const baseTitle = "KiksUltraLuxury";

    // Only one browser tab title
    document.title = baseTitle;

    const metaDescription = document.querySelector('meta[name="description"]');
    const ogDescription = document.querySelector('meta[property="og:description"]');
    const desc = description || "Experience the essence of elegance with our exclusive collection of premium fragrances.";

    if (metaDescription) metaDescription.setAttribute('content', desc);
    if (ogDescription) ogDescription.setAttribute('content', desc);

    const metaKeywords = document.querySelector('meta[name="keywords"]');
    if (metaKeywords && keywords) {
      metaKeywords.setAttribute('content', keywords);
    }

    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) ogTitle.setAttribute('content', baseTitle);

    const ogImage = document.querySelector('meta[property="og:image"]');
    if (ogImage && image) {
      ogImage.setAttribute('content', image);
    }

    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }

    canonical.setAttribute('href', window.location.href);
  }, [title, description, keywords, image, location]);

  return null;
};

export default SEO;