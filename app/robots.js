export default function robots() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://hqcc.hofstra.edu';

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/member', '/admin'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
