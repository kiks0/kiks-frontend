import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { getFullImageUrl } from '../utils/url';

const BASE_TITLE = "KIKS Ultra Luxury";
const DEFAULT_DESC = "Experience the essence of elegance with our exclusive collection of handcrafted artisanal fragrances and Extrait de Parfum.";
const DEFAULT_IMAGE = "https://res.cloudinary.com/dprxiz6os/image/upload/v1779191419/araambh_1_mh8uqw.webp";
const BASE_DOMAIN = "https://www.kiksultraluxury.com";

// Helper to set or create a meta tag by name or property
const setMetaTag = (attr, key, content) => {
    if (!content) return;
    let element = document.querySelector(`meta[${attr}="${key}"]`);
    if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attr, key);
        document.head.appendChild(element);
    }
    element.setAttribute('content', content);
};

const SEO = ({
    title,
    description,
    keywords,
    image,
    type = 'website',
    canonicalUrl,
    noindex = false,
    schema = null
}) => {
    const location = useLocation();

    useEffect(() => {
        // 1. Title formatting
        const formattedTitle = title
            ? (title.toLowerCase().includes('kiks') ? title : `${title} | ${BASE_TITLE}`)
            : `${BASE_TITLE} | Premium Perfumes & Fragrances`;
        document.title = formattedTitle;

        // 2. Canonical URL (default: origin + pathname, stripping query parameters and hash)
        const cleanCanonical = canonicalUrl || (typeof window !== 'undefined' ? `${window.location.origin}${window.location.pathname}` : `${BASE_DOMAIN}${location.pathname}`);
        let canonicalEl = document.querySelector('link[rel="canonical"]');
        if (!canonicalEl) {
            canonicalEl = document.createElement('link');
            canonicalEl.setAttribute('rel', 'canonical');
            document.head.appendChild(canonicalEl);
        }
        canonicalEl.setAttribute('href', cleanCanonical);

        // 3. Absolute Image for Social Previews
        let absoluteImage = DEFAULT_IMAGE;
        if (image) {
            const rawUrl = getFullImageUrl(image);
            if (rawUrl.startsWith('http')) {
                absoluteImage = rawUrl;
            } else if (typeof window !== 'undefined') {
                absoluteImage = `${window.location.origin}${rawUrl.startsWith('/') ? '' : '/'}${rawUrl}`;
            } else {
                absoluteImage = `${BASE_DOMAIN}${rawUrl.startsWith('/') ? '' : '/'}${rawUrl}`;
            }
        }

        const desc = description || DEFAULT_DESC;

        // 4. Standard Metadata
        setMetaTag('name', 'description', desc);
        if (keywords) {
            setMetaTag('name', 'keywords', keywords);
        }

        // 5. Robots indexing
        if (noindex) {
            setMetaTag('name', 'robots', 'noindex, nofollow');
        } else {
            setMetaTag('name', 'robots', 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1');
        }

        // 6. Open Graph (Facebook / WhatsApp / Instagram / LinkedIn)
        setMetaTag('property', 'og:site_name', BASE_TITLE);
        setMetaTag('property', 'og:locale', 'en_US');
        setMetaTag('property', 'og:type', type);
        setMetaTag('property', 'og:title', formattedTitle);
        setMetaTag('property', 'og:description', desc);
        setMetaTag('property', 'og:url', cleanCanonical);
        setMetaTag('property', 'og:image', absoluteImage);
        setMetaTag('property', 'og:image:alt', formattedTitle);

        // 7. Twitter / X Card
        setMetaTag('name', 'twitter:card', 'summary_large_image');
        setMetaTag('name', 'twitter:url', cleanCanonical);
        setMetaTag('name', 'twitter:title', formattedTitle);
        setMetaTag('name', 'twitter:description', desc);
        setMetaTag('name', 'twitter:image', absoluteImage);

        // 8. Dynamic JSON-LD Structured Data Schema
        const schemaId = 'dynamic-seo-schema';
        let schemaEl = document.getElementById(schemaId);

        if (schema) {
            if (!schemaEl) {
                schemaEl = document.createElement('script');
                schemaEl.id = schemaId;
                schemaEl.type = 'application/ld+json';
                document.head.appendChild(schemaEl);
            }
            schemaEl.textContent = typeof schema === 'string' ? schema : JSON.stringify(schema);
        } else if (schemaEl) {
            schemaEl.remove();
        }

        return () => {
            // Clean up dynamic schema when unmounting if this component created one
            const currentSchema = document.getElementById(schemaId);
            if (currentSchema) {
                currentSchema.remove();
            }
        };

    }, [title, description, keywords, image, type, canonicalUrl, noindex, schema, location]);

    return null; // Invisible component
};

export default SEO;
