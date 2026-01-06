export default function sitemap() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://hqcc.hofstra.edu';
  const now = new Date();

  const routes = ['/', '/signin', '/signup'];

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: now,
    changefreq: 'weekly',
    priority: route === '/' ? 1.0 : 0.6,
  }));
}
