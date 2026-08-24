import { Routes } from '@angular/router';
import { productResolver } from './resolvers/product.resolver';


export const routes: Routes = [
   {
  path: '',
  loadComponent: () => import('./pages/home/home').then(m => m.Home),
},
    {

    path: 'products/:category',
    loadComponent: () => import('./pages/products-grid/products-grid')
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
