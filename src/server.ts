import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  isMainModule,
  writeResponseToNodeResponse
} from '@angular/ssr/node';

import express from 'express';
import { readFile } from 'node:fs/promises';
import { join } from 'path';

import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const app = express();

const serverDistFolder = dirname(fileURLToPath(import.meta.url));
const browserDistFolder = resolve(serverDistFolder, '../browser');

app.get('/google87342c1a9cd54865.html', (req, res) => {
  res.sendFile(join(browserDistFolder, 'google87342c1a9cd54865.html'));
});
interface Product {
  slug: string;
  categorySlug?: string;
}

async function getProducts(): Promise<Product[]> {
  const filePath = join(browserDistFolder, 'data/products.json');

  const data = await readFile(filePath, 'utf-8');

  return JSON.parse(data);
}
const primaryOrigin = 'https://c-trade.kz';

const allowedHosts = [
  'localhost',
  '127.0.0.1',

  '*.vercel.app',

  'c-trade.kz',
  'www.c-trade.kz',

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
  return primaryOrigin;
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

app.get('/sitemap.xml', async (req, res) => {
  const origin = getPublicOrigin(req);
  const today = new Date().toISOString().slice(0, 10);

  const products = await getProducts();

  const urls = [
    `${origin}/`,
    ...products.map(
      (product) => `${origin}/product/${product.slug}`
    ),
  ];

  res.type('application/xml').send(`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (url) => `  <url>
    <loc>${url}</loc>
    <lastmod>${today}</lastmod>
  </url>`
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
