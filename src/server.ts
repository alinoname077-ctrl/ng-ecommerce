import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  isMainModule,
  writeResponseToNodeResponse
} from '@angular/ssr/node';

import express from 'express';
import { join } from 'path';

import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const app = express();

const serverDistFolder = dirname(fileURLToPath(import.meta.url));
const browserDistFolder = resolve(serverDistFolder, '../browser');

app.get('/google87342c1a9cd54865.html', (req, res) => {
  res.sendFile(join(browserDistFolder, 'google87342c1a9cd54865.html'));
});

const categories = ['all', 'automation', 'drives', 'pumps', 'valves', 'heat-exchangers'];
const productIds = Array.from({ length: 20 }, (_, index) => `p-${index + 1}`);
const primaryOrigin = 'https://ng-ecommerce-sigma.vercel.app';

const allowedHosts = [
  'localhost',
  '127.0.0.1',
  '*.vercel.app',
  process.env['VERCEL_URL'],
  process.env['VERCEL_BRANCH_URL'],
  process.env['VERCEL_PROJECT_PRODUCTION_URL'],
  ...(process.env['NG_ALLOWED_HOSTS']?.split(',') ?? []),
]
  .filter((host): host is string => !!host)
  .map((host) => host.replace(/^https?:\/\//, '').trim())
  .filter(Boolean);

const angularApp = new AngularNodeAppEngine({
  allowedHosts,
  trustProxyHeaders: true,
});

function getPublicOrigin(req: express.Request): string {
  const protocol = (req.get('x-forwarded-proto') || req.protocol || 'https').split(',')[0].trim();
  const host = (req.get('x-forwarded-host') || req.get('host') || '').split(',')[0].trim();
  const hostname = host.split(':')[0];

  return hostname === 'localhost' || hostname === '127.0.0.1'
    ? `${protocol}://${host}`
    : primaryOrigin;
}

app.get('/robots.txt', (req, res) => {
  const origin = getPublicOrigin(req);

  res.type('text/plain').send(
    [
      'User-agent: *',
      'Allow: /',
      '',
      `Sitemap: ${origin}/sitemap.xml`,
      '',
    ].join('\n'),
  );
});

app.get('/sitemap.xml', (req, res) => {
  const origin = getPublicOrigin(req);
  const today = new Date().toISOString().slice(0, 10);
  const urls = [
    `${origin}/`,
    ...categories.map((category) => `${origin}/products/${category}`),
    ...productIds.map((productId) => `${origin}/product/${productId}`),
  ];

  res.type('application/xml').send(`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (url) => `  <url>
    <loc>${url}</loc>
    <lastmod>${today}</lastmod>
  </url>`,
  )
  .join('\n')}
</urlset>
`);
});

app.use(
  express.static(browserDistFolder, {
    index: false,
    maxAge: '1y',
  })
);

app.use(async (req, res, next) => {
  try {
    const response = await angularApp.handle(req);

    if (response) {
      writeResponseToNodeResponse(response, res);
    } else {
      next();
    }
  } catch (err) {
    next(err);
  }
});

if (isMainModule(import.meta.url)) {
  const port = process.env['PORT'] || 4000;

  app.listen(port, () => {
    console.log(`Node server listening on http://localhost:${port}`);
  });
}

export const reqHandler = createNodeRequestHandler(app);
