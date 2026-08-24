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

let productsCache: Product[] | undefined;
let productSlugCache: Set<string> | undefined;

async function getProducts(): Promise<Product[]> {
  if (productsCache) {
    return productsCache;
  }

  const filePath = join(browserDistFolder, 'data/products.json');

  const data = await readFile(filePath, 'utf-8');

  const products = JSON.parse(data) as Product[];
  productsCache = products;

  return products;
}

async function getProductSlugs(): Promise<Set<string>> {
  if (productSlugCache) {
    return productSlugCache;
  }

  const products = await getProducts();
  productSlugCache = new Set(products.map((product) => product.slug).filter(Boolean));

  return productSlugCache;
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

function xmlEscape(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function getProductSlugFromPath(path: string): string | undefined {
  const match = path.match(/^\/product\/([^/?#]+)\/?$/);
  return match ? decodeURIComponent(match[1]) : undefined;
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
  const categorySlugs = Array.from(
    new Set(products.map((product) => product.categorySlug).filter(Boolean)),
  );

  const urls = [
    `${origin}/`,
    `${origin}/brands/ridan`,
    `${origin}/products/all`,
    ...categorySlugs.map((categorySlug) => `${origin}/products/${categorySlug}`),
    ...products.map(
      (product) => `${origin}/product/${product.slug}`
    ),
  ];

  res.type('application/xml').send(`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (url) => `  <url>
    <loc>${xmlEscape(url)}</loc>
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
    const productSlug = getProductSlugFromPath(req.path);
    const productExists = productSlug ? (await getProductSlugs()).has(productSlug) : true;
    const response = await angularApp.handle(req);

    if (response) {
      if (!productExists) {
        const body = await response.text();
        const notFoundResponse = new Response(body, {
          status: 404,
          statusText: 'Not Found',
          headers: response.headers,
        });

        writeResponseToNodeResponse(notFoundResponse, res);
      } else {
        writeResponseToNodeResponse(response, res);
      }
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
