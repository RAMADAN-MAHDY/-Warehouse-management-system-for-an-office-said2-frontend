import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://management-system-said2.vercel.app';
  
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/dashboard', '/sales', '/profit', '/expenses', '/excel-files'],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
