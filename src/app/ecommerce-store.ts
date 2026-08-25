import { computed, inject } from '@angular/core';
import { ProductService } from './services/product.service';
import { Product } from './models/product';
import {
  patchState,
  signalMethod,
  signalStore,
  withComputed,
  withMethods,
  withState,
  withHooks,
} from '@ngrx/signals';
import { produce } from 'immer';
import { SeoManager } from './services/seo-manager';
import { Toaster } from './services/toaster';
import { CartItem } from './models/cart';
import { MatDialog } from '@angular/material/dialog';
import { SignInDialog } from './components/sign-in-dialog/sign-in-dialog';
import { SignInParams, SignUpParams, User } from './models/user';
import { Router } from '@angular/router';
import { Order } from './models/order';
import { withStorageSync } from '@angular-architects/ngrx-toolkit';
import { AddReviewParams, UserReview } from './models/user-review';
export type EcommerceState = {
  products: Product[];
  category: string;
  search: string;
currentPage: number;
pageSize: number;
  categoriesOpen: boolean;
  wishlistItems: Product[];
  cartItems: CartItem[];
  currentOrder: Order | undefined;
  user: User | undefined;

  loading: boolean;
  selectedProductId: string | undefined;

  writeReview: boolean;
};

export const EcommerceStore = signalStore(
  { providedIn: 'root' },
withState({
  products: [],
  category: 'all',
  search: '',

  currentPage: 1,
  pageSize: 24,
  categoriesOpen: false,
  wishlistItems: [],
  cartItems: [],
  currentOrder: undefined,
  user: undefined,
  loading: false,
  selectedProductId: undefined,
  writeReview: false,
} as EcommerceState),
 
  // TEMP: отключено из-за SSR (localStorage is not defined)
  // withStorageSync({
  //   key: 'modern-store',
  //   select: ({ wishlistItems, cartItems, user }) => ({ wishlistItems, cartItems, user }),
  // }),
  withComputed(({
  category,
  products,
  wishlistItems,
  cartItems,
  selectedProductId,
  search,
  currentPage,
  pageSize,
}) => {

  const filteredProducts = computed(() => {
    const term = search().toLowerCase().trim();

    return products().filter((p) => {
      const matchesCategory =
        category() === 'all' ||
        (p.categorySlug || p.category).toLowerCase() === category().toLowerCase();

      const matchesSearch =
        !term ||
        `${p.name} ${p.description} ${p.category}`
          .toLowerCase()
          .includes(term);

      return matchesCategory && matchesSearch;
    });
  });

  const totalProducts = computed(() => filteredProducts().length);

  const totalPages = computed(() =>
    Math.max(1, Math.ceil(totalProducts() / pageSize()))
  );

  const pagedProducts = computed(() => {
    const start = (currentPage() - 1) * pageSize();

    return filteredProducts().slice(
      start,
      start + pageSize()
    );
  });

  return {

    filteredProducts,

    totalProducts,

    totalPages,

    pagedProducts,
    categories: computed(() => {
  const unique = new Map<string, string>();

  products()
    .filter((product) => product.category)
    .sort((a, b) => a.category.localeCompare(b.category))
    .forEach((product) => {
      unique.set(product.categorySlug || product.category, product.category);
    });

  return [
    { label: 'All', value: 'all' },
    ...Array.from(unique.entries()).map(([value, label]) => ({
      label,
      value,
    })),
  ];
}),

    wishlistCount: computed(() => wishlistItems().length),

    cartCount: computed(() =>
      cartItems().reduce(
        (acc, item) => acc + item.quantity,
        0
      )
    ),

    selectedProduct: computed(() =>
      products().find(
        (p) => p.id === selectedProductId()
      )
    ),
  };

}),
  withMethods(
   (
  store,
  toaster = inject(Toaster),
  matDialog = inject(MatDialog),
  router = inject(Router),
  seoManager = inject(SeoManager),
  productService = inject(ProductService),
) => ({
      setCategory: signalMethod<string>((category: string) => {
  patchState(store, {
    category,
    currentPage: 1,
  });
}),
      resetFilters: () => {
        patchState(store, {
          search: '',
          category: 'all',
          currentPage: 1,
          selectedProductId: undefined,
        });
      },
      nextPage: () => {
  if (store.currentPage() < store.totalPages()) {
    patchState(store, {
      currentPage: store.currentPage() + 1,
    });
  }
},

previousPage: () => {
  if (store.currentPage() > 1) {
    patchState(store, {
      currentPage: store.currentPage() - 1,
    });
  }
},

goToPage: signalMethod<number>((page: number) => {
  patchState(store, {
    currentPage: page,
  });
}),
setPageSize: signalMethod<number>((pageSize) => {
  patchState(store, {
    pageSize,
  });
}),

      loadProducts: () => {
  productService.getProducts().subscribe({
    next: (products) => {
     patchState(store, { products });
    },
    error: (err) => {
      console.error('Cannot load products.json', err);
    },
  });
},
      upsertProduct: (product: Product) => {
        const existingIndex = store.products().findIndex((item) => item.id === product.id);

        if (existingIndex === -1) {
          patchState(store, { products: [product, ...store.products()] });
          return;
        }

        const products = produce(store.products(), (draft) => {
          draft[existingIndex] = product;
        });

        patchState(store, { products });
      },
      setProductsListSeoTags: signalMethod<string | undefined>((category) => {
        const normalizedCategory = category === 'all' ? undefined : category;
        const categoryProduct = normalizedCategory
          ? store.products().find((product) => product.categorySlug === normalizedCategory)
          : undefined;
        const categoryName = categoryProduct?.category || 'Каталог оборудования Ridan';
        const description = normalizedCategory
          ? `${categoryName}: оборудование Ridan для инженерных систем в каталоге C-Trade.`
          : 'Каталог оборудования Ridan для систем отопления, теплоснабжения, водоснабжения и автоматизации.';
        const items = store.filteredProducts().slice(0, 24).map((product) => ({
          name: product.name,
          url: `https://c-trade.kz/product/${product.slug}`,
          image: product.imageUrl,
        }));

        seoManager.updateSeoTags({
          title: categoryName,
          description,
          type: 'collection',
          brand: 'Ридан',
          category: categoryName,
          categorySlug: normalizedCategory,
          items,
        });
      }),



      toggleCategories: () => {
  patchState(store, {
    categoriesOpen: !store.categoriesOpen(),
  });
},

openCategories: () => {
  patchState(store, { categoriesOpen: true });
},

closeCategories: () => {
  patchState(store, { categoriesOpen: false });
},
      setSearch: signalMethod<string>((value: string) => {
        patchState(store, { search: value });
      }),

      setProductId: signalMethod<string>((productId: string) => {
        patchState(store, { selectedProductId: productId });
      }),
      setProductSeoTags: signalMethod<Product|undefined>((product) => {
        if (!product) return;

        const descriptionParts = [
          product.description,
          product.category ? `Категория: ${product.category}` : '',
          product.series ? `Серия: ${product.series}` : '',
          product.id ? `Артикул: ${product.id}` : '',
        ].filter(Boolean);

        seoManager.updateSeoTags({
          title: product.name,
          description: descriptionParts.join('. '),
          image: product.imageUrl,
          type: 'product',
         
          sku: product.id,
          brand: 'Ридан',
          category: product.category,
          categorySlug: product.categorySlug,

          price: product.price,
          currency: product.currency || 'KZT',
          inStock: product.inStock ?? true,
        });
      }),
      addToWishlist: (product: Product) => {
        const updatedWishlistItems = produce(store.wishlistItems(), (draft) => {
          if (!draft.find((p) => p.id === product.id)) {
            draft.push(product);
          }
        });
        patchState(store, { wishlistItems: updatedWishlistItems });
        toaster.success('Product added to wishlist');
      },
      removeFromWishlist: (product: Product) => {
        patchState(store, {
          wishlistItems: store.wishlistItems().filter((p) => p.id !== product.id),
        });
        toaster.success('Product removed from wishlist');
      },
      clearWishlist: () => {
        patchState(store, { wishlistItems: [] });
      },
      addToCart: (product: Product, quantity = 1) => {
        const existingItemIndex = store.cartItems().findIndex((i) => i.product.id === product.id);

        const updatedCartItems = produce(store.cartItems(), (draft) => {
          if (existingItemIndex !== -1) {
            draft[existingItemIndex].quantity += quantity;
            return;
          }
          draft.push({ product, quantity });
        });

        patchState(store, { cartItems: updatedCartItems });
        toaster.success(
          existingItemIndex !== -1 ? 'Product added again' : 'Product added to the cart',
        );
      },
      setItemQuantity(params: { productId: string; quantity: number }) {
  const index = store.cartItems().findIndex(
    (c) => c.product.id === params.productId
  );
        
        const updated = produce(store.cartItems(), (draft) => {
          draft[index].quantity = params.quantity;
        });
        patchState(store, { cartItems: updated });
      },
      addAllWishlistToCart: () => {
        const updatedCartItems = produce(store.cartItems(), (draft) => {
          store.wishlistItems().forEach((p) => {
            if (!draft.find((c) => c.product.id === p.id)) {
              draft.push({ product: p, quantity: 1 });
            }
          });
        });
        patchState(store, { cartItems: updatedCartItems, wishlistItems: [] });
      },
      moveToWishlist: (product: Product) => {
      const updatedCartItems = store.cartItems().filter(
  (p) => p.product.id !== product.id
);

const updatedWishlistItems = produce(store.wishlistItems(), (draft) => {
  if (!draft.find((p) => p.id === product.id)) {
    draft.push(product);
  }
});
        patchState(store, { cartItems: updatedCartItems, wishlistItems: updatedWishlistItems });
      },
      removeFromCart: (product: Product) => {
        patchState(store, {
         cartItems: store.cartItems().filter(
  (p) => p.product.id !== product.id
),
        });
      },

      proceedToCheckout: () => {
        if (!store.user()) {
          matDialog.open(SignInDialog, {
            disableClose: true,
            data: {
              checkout: true,
            },
          });
          return;
        }
        router.navigate(['/checkout']);
      },

      placeOrder: async () => {
        patchState(store, { loading: true });
        const user = store.user();
        if (!user) {
          toaster.error('Please login before placing  order');
          patchState(store, { loading: false });
          return;
        }

        const order: Order = {
          id: crypto.randomUUID(),
          userId: user.id,
          total: Math.round(
            store.cartItems().reduce((acc, item) => acc + item.quantity * item.product.price, 0),
          ),
          items: store.cartItems(),
          paymentStatus: 'success',
        };

        await new Promise((resolve) => setTimeout(resolve, 1000));

        patchState(store, { loading: false, cartItems: [], currentOrder: order });
        router.navigate(['order-success']);
      },

      startKaspiPayment: () => {
        if (!store.cartItems().length) {
          toaster.error('Your cart is empty');
          return;
        }

        const subtotal = Math.round(
          store.cartItems().reduce((acc, item) => acc + item.quantity * item.product.price, 0),
        );

        const order: Order = {
          id: `CT-TEST-${crypto.randomUUID().slice(0, 8).toUpperCase()}`,
          userId: store.user()?.id || 'guest',
          total: subtotal + Math.round(0.05 * subtotal),
          items: store.cartItems(),
          currency: 'KZT',
          paymentMethod: 'Kaspi',
          paymentStatus: 'PENDING',
        };

        patchState(store, { currentOrder: order });
        router.navigate(['/payment/kaspi']);
      },

      completeKaspiPayment: async () => {
        const order = store.currentOrder();

        if (!order || order.paymentMethod !== 'Kaspi') {
          toaster.error('Test order not found');
          router.navigate(['/checkout']);
          return;
        }

        patchState(store, { loading: true });
        await new Promise((resolve) => setTimeout(resolve, 1000));

        patchState(store, {
          loading: false,
          cartItems: [],
          currentOrder: {
            ...order,
            paymentStatus: 'PAID',
          },
        });
        router.navigate(['/order-success']);
      },

      signIn: ({ email, password, checkout, dialogId }: SignInParams) => {
        patchState(store, {
          user: {
            id: '1',
            email,
            name: 'John Doe',
            imageUrl: 'https://randomuser.me/api/portraits/men/1.jpg',
          },
        });

        matDialog.getDialogById(dialogId)?.close();

        if (checkout) {
          router.navigate(['/checkout']);
        }
      },

      signUp: ({ email, password, name, checkout, dialogId }: SignUpParams) => {
        patchState(store, {
          user: {
            id: '1',
            email,
            name: 'John D',
            imageUrl: 'https://randomuser.me/api/portraits/men/1.jpg',
          },
        });

        matDialog.getDialogById(dialogId)?.close();

        if (checkout) {
          router.navigate(['/checkout']);
        }
      },

      signOut: () => {
        patchState(store, { user: undefined });
      },

      showWriteReview: () => {
        patchState(store, { writeReview: true });
      },

      hideWriteReview: () => {
        patchState(store, { writeReview: false });
      },
               addReview: async ({ title, comment, rating }: AddReviewParams) => {
        patchState(store, { loading: true });

        const product = store.products().find(
          (p) => p.id === store.selectedProductId()
        );

        if (!product) {
          toaster.error('Product not found');
          patchState(store, { loading: false });
          return;
        }

        const newReview: UserReview = {
          id: crypto.randomUUID(),
          title,
          comment,
          rating,
          productId: product.id,
          userName: store.user()?.name || '',
          userImageUrl: store.user()?.imageUrl || '',
          reviewDate: new Date(),
        };

        const updatedProducts = produce(store.products(), (draft) => {
          const index = draft.findIndex((p) => p.id === product.id);

          if (index !== -1) {
          draft[index].reviews = draft[index].reviews || [];
          draft[index].reviews.push(newReview);
          draft[index].rating =
            Math.round(
                ((draft[index].reviews || []).reduce((acc, r) => acc + r.rating, 0) /
                  (draft[index].reviews?.length || 1)) *
                  10
              ) / 10;

            draft[index].reviewCount = draft[index].reviews?.length || 0;
          }
        });

        await new Promise((resolve) => setTimeout(resolve, 1000));

        patchState(store, {
          loading: false,
          products: updatedProducts,
          writeReview: false,
        });

        toaster.success('Review added successfully');
      },
    })
  )
);
