import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  isMainModule,
  writeResponseToNodeResponse
} from '@angular/ssr/node';

import express from 'express';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const app = express();
const serverDistFolder = dirname(fileURLToPath(import.meta.url));
const browserDistFolder = resolve(serverDistFolder, '../browser');

const allowedHosts = [
  'localhost',
  '127.0.0.1',
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
  trustProxyHeaders: ['x-forwarded-host', 'x-forwarded-proto'],
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
