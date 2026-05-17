import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    path: '',
    renderMode: RenderMode.Server
  },
  {
    path: 'products/:category',
    renderMode: RenderMode.Server
  },
  {
    path: 'product/:productId',
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
    path: 'order-success',
    renderMode: RenderMode.Server
  }
];