import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const SEO = ({ title, description, keywords, image }) => {
    const location = useLocation();

    useEffect(() => {
        
        // 1. Update Title
       const baseTitle = "Kiksultraluxury"; // Change this to your brand name
        document.title = title ? `${title} | ${baseTitle}` : baseTitle;

        // 2. Update Description
        const metaDescription = document.querySelector('meta[name="description"]');
        const ogDescription = document.querySelector('meta[property="og:description"]');
        const desc = description || "Experience the essence of elegance with our exclusive collection of premium fragrances.";

        if (metaDescription) metaDescription.setAttribute('content', desc);
        if (ogDescription) ogDescription.setAttribute('content', desc);

        // 3. Update Keywords
        const metaKeywords = document.querySelector('meta[name="keywords"]');
        if (metaKeywords && keywords) {
            metaKeywords.setAttribute('content', keywords);
        }

        // 4. Update OG Title
        const ogTitle = document.querySelector('meta[property="og:title"]');
        if (ogTitle) ogTitle.setAttribute('content', title || baseTitle);

        // 5. Update OG Image
        const ogImage = document.querySelector('meta[property="og:image"]');
        if (ogImage && image) {
            ogImage.setAttribute('content', image);
        }

        // 6. Canonical Link
        let canonical = document.querySelector('link[rel="canonical"]');
        if (!canonical) {
            canonical = document.createElement('link');
            canonical.setAttribute('rel', 'canonical');
            document.head.appendChild(canonical);
        }
        canonical.setAttribute('href', window.location.href);

    }, [title, description, keywords, image, location]);

    return null; // This component doesn't render anything
};

export default SEO;
