import { DatePipe, DecimalPipe } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButton } from '@angular/material/button';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatInput } from '@angular/material/input';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth/auth.service';

@Component({
  selector: 'app-profile',
  imports: [ReactiveFormsModule, DatePipe, DecimalPipe, MatButton, MatFormField, MatLabel, MatInput, MatIcon],
  templateUrl: './profile.html',
  styleUrl: './profile.scss',
})
export default class Profile {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  protected readonly authService = inject(AuthService);
  protected readonly user = this.authService.user;
  protected readonly initials = computed(() => (this.user()?.name || 'П').trim().slice(0, 1).toUpperCase());

  protected readonly addressForm = this.fb.group({
    city: ['', Validators.required],
    street: ['', Validators.required],
    apartment: [''],
    comment: [''],
  });

  constructor() {
    const address = this.user()?.deliveryAddress;
    if (address) {
      this.addressForm.patchValue(address);
    }
  }

  protected saveAddress() {
    if (this.addressForm.invalid) {
      this.addressForm.markAllAsTouched();
      return;
    }

    const value = this.addressForm.getRawValue();
    this.authService.updateDeliveryAddress({
      city: value.city || '',
      street: value.street || '',
      apartment: value.apartment || undefined,
      comment: value.comment || undefined,
    });
  }

  protected async signOut() {
    await this.authService.signOut();
    await this.router.navigate(['/products/all']);
  }
}
