import { Component, OnInit, inject } from '@angular/core';
import { ProductService } from '../services/product.service';

@Component({
  selector: 'app-test-products',
  standalone: true,
  template: `<p>Открой консоль браузера (F12)</p>`,
})
export class TestProductsComponent implements OnInit {
  private readonly productService = inject(ProductService);

  ngOnInit(): void {
    this.productService.getProducts().subscribe({
      next: (products) => {
        console.log('Products:', products);
      },
      error: (err) => {
        console.error('Ошибка загрузки JSON:', err);
      },
    });
  }
}