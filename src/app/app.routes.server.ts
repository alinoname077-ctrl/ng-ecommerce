import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    path: '',
    renderMode: RenderMode.Server
  },
  {
    path: 'catalog',
    renderMode: RenderMode.Server
  },
  {
    path: 'products/:category',
    renderMode: RenderMode.Server
  },
  {
    path: 'brands/ridan',
    renderMode: RenderMode.Server
  },
  {
    path: 'product/:slug',
    renderMode: RenderMode.Server
  },
  {
    path: 'wishlist',
    renderMode: RenderMode.Server
  },
  {
    path: 'cart',
    renderMode: RenderMode.Server
  },
  {
    path: 'checkout',
    renderMode: RenderMode.Server
  },
  {
    path: 'profile',
    renderMode: RenderMode.Server
  },
  {
    path: 'payment/kaspi',
    renderMode: RenderMode.Server
  },
  {
    path: 'order-success',
    renderMode: RenderMode.Server
  },
  {
    path: '**',
    renderMode: RenderMode.Server
  }
];
