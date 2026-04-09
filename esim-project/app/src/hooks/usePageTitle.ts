import { useEffect } from 'react';

/**
 * Updates the document title and meta description for SEO
 */
export function usePageTitle(title: string, description?: string) {
  useEffect(() => {
    // Update page title
    document.title = title;

    // Update meta description if provided
    if (description) {
      let metaDescription = document.querySelector('meta[name="description"]');
      if (!metaDescription) {
        metaDescription = document.createElement('meta');
        metaDescription.setAttribute('name', 'description');
        document.head.appendChild(metaDescription);
      }
      metaDescription.setAttribute('content', description);
    }
  }, [title, description]);
}
