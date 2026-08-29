import { Routes } from '@angular/router';
import { productResolver } from './resolvers/product.resolver';
import { authGuard } from './services/auth/auth.guard';


export const routes: Routes = [
   {
  path: '',
  loadComponent: () => import('./pages/products-grid/products-grid'),
},
{
  path: 'catalog',
  loadComponent: () => import('./pages/products-grid/products-grid'),
},
    {

    path: 'products/:category',
    loadComponent: () => import('./pages/products-grid/products-grid')
     },
{
  path: 'brands/ridan',
  loadComponent: () => import('./pages/brand-ridan/brand-ridan')
},
{
  path: 'product/:slug',
  loadComponent: () => import('./pages/view-product-detail/view-product-detail'),
  resolve: {
    product: productResolver,
  },
  
},

    {
    path: 'wishlist',
    loadComponent: () => import('./pages/my-wishlist/my-wishlist')
},
{
    path: 'cart',
    loadComponent: () => import('./pages/view-cart/view-cart'),
},
{
    path: 'checkout',
    loadComponent: () => import('./pages/checkout/checkout'),
},
{
    path: 'profile',
    loadComponent: () => import('./pages/profile/profile'),
    canActivate: [authGuard],
},
{
    path: 'payment/kaspi',
    loadComponent: () => import('./pages/payment-kaspi/payment-kaspi'),
},
{
    path: 'order-success',
    loadComponent: () => import('./pages/order-success/order-success'),
},
{
    path: '**',
    redirectTo: 'products/all',
},


];
