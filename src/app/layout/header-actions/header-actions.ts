import { Component, computed, inject, signal } from '@angular/core';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { Router } from '@angular/router';
import { MatBadge } from '@angular/material/badge';
import { MatDialog } from '@angular/material/dialog';
import { EcommerceStore } from '../../ecommerce-store';
import { AuthDialog } from '../../components/auth-dialog/auth-dialog';
import { AuthService } from '../../services/auth/auth.service';

@Component({
  selector: 'app-header-actions',
  imports: [MatIcon, MatButton, MatIconButton, MatBadge],
  template: `    <div class="site-header-actions flex items-center gap-2">
      <button
        matIconButton
        type="button"
        aria-label="Избранное"
        [matBadge]="store.wishlistCount()"
        [matBadgeHidden]="store.wishlistCount() === 0"
        (click)="router.navigate(['/wishlist'])"
      >
        <mat-icon>favorite</mat-icon>
      </button>
      <button
        matIconButton
        type="button"
        aria-label="Корзина"
        [matBadge]="store.cartCount()"
        [matBadgeHidden]="store.cartCount() === 0"
        (click)="router.navigate(['/cart'])"
      >
        <mat-icon>shopping_cart</mat-icon>
      </button>

      <button
        type="button"
        matButton
        class="profile-action"
        aria-label="Профиль"
        title="Профиль"
        [disabled]="!authService.ready()"
        [class.profile-action--signed-in]="isSignedIn()"
        [class.profile-action--pending]="!authService.ready()"
        (click)="openProfile()"
      >
        <span class="profile-action__avatar-wrap">
          @if (!authService.ready()) {
            <span class="profile-action__icon-avatar profile-action__icon-avatar--pending" aria-hidden="true">
              <mat-icon>person</mat-icon>
            </span>
          } @else if (showProfilePhoto()) {
            <img
              [src]="user()?.imageUrl"
              [alt]="profileName()"
              class="profile-action__avatar"
              (error)="handleProfilePhotoError()"
            />
          } @else if (showInitials()) {
            <span class="profile-action__initials" aria-hidden="true">{{ profileInitials() }}</span>
          } @else {
            <span class="profile-action__icon-avatar" aria-hidden="true">
              <mat-icon>person</mat-icon>
            </span>
          }
          @if (isSignedIn()) {
            <span class="profile-action__status" aria-hidden="true"></span>
          }
        </span>
        @if (authService.ready()) {
          <span class="profile-action__label">{{ profileName() }}</span>
        }
      </button>
    </div>
  `,
  styles: [`    .profile-action {
      align-items: center;
      display: inline-flex;
      gap: 8px;
      max-width: 180px;
      min-height: 40px;
      overflow: visible;
      padding-inline: 12px;
    }

    .profile-action__label {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .profile-action__avatar-wrap {
      align-items: center;
      display: inline-flex;
      flex: 0 0 auto;
      height: 32px;
      justify-content: center;
      overflow: visible;
      position: relative;
      width: 32px;
    }

    .profile-action__avatar {
      border-radius: 999px;
      height: 30px;
      object-fit: cover;
      width: 30px;
    }

    .profile-action__icon-avatar,
    .profile-action__initials {
      align-items: center;
      background: #111827;
      border-radius: 999px;
      color: #ffffff;
      display: inline-flex;
      font-size: 0.78rem;
      font-weight: 850;
      height: 30px;
      justify-content: center;
      line-height: 1;
      width: 30px;
    }

    .profile-action:not(.profile-action--signed-in) .profile-action__icon-avatar {
      background: transparent;
      color: inherit;
      height: 24px;
      width: 24px;
    }

    .profile-action__icon-avatar mat-icon {
      font-size: 22px;
      height: 22px;
      width: 22px;
    }

    .profile-action__status {
      background: #22c55e;
      border: 2px solid #ffffff;
      border-radius: 999px;
      bottom: -1px;
      box-shadow: 0 0 0 1px rgba(15, 23, 42, 0.08);
      height: 11px;
      position: absolute;
      right: -1px;
      width: 11px;
      z-index: 2;
    }

    .profile-action--pending {
      opacity: 0.72;
      pointer-events: none;
    }

    .profile-action__icon-avatar--pending {
      opacity: 0.58;
    }

    @media (max-width: 640px) {
      .site-header-actions {
        gap: 4px;
      }

      .profile-action {
        max-width: 112px;
        min-width: 40px;
        padding-inline: 8px;
      }

      .profile-action--signed-in {
        min-width: 40px;
        overflow: visible;
        padding-inline: 6px;
      }

      .profile-action--signed-in .profile-action__label {
        display: none;
      }
    }
  `],
})
export class HeaderActions {
  protected readonly store = inject(EcommerceStore);
  protected readonly authService = inject(AuthService);
  protected readonly user = this.authService.user;
  protected readonly router = inject(Router);
  private readonly matDialog = inject(MatDialog);
  private readonly failedPhotoUrl = signal<string | undefined>(undefined);
  protected readonly showProfilePhoto = computed(() => {
    const user = this.user();
    return this.isSignedIn() && !!user?.imageUrl && this.failedPhotoUrl() !== user.imageUrl;
  });

  protected isSignedIn() {
    return this.authService.ready() && !!this.user();
  }

  protected profileName() {
    const user = this.user();
    if (!user) {
      return 'Профиль';
    }

    const name = user.name?.trim();
    return name && !name.startsWith('+') && name !== 'Пользователь' ? name : 'Мой профиль';
  }

  protected showInitials() {
    const user = this.user();
    return this.isSignedIn() && !!user && !this.isPhoneOnlyUser() && this.profileName() !== 'Мой профиль';
  }

  protected profileInitials() {
    return this.profileName()
      .split(/\s+/)
      .map((part) => part[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  }

  protected handleProfilePhotoError() {
    const url = this.user()?.imageUrl;
    if (url) {
      this.failedPhotoUrl.set(url);
    }
  }

  protected openProfile() {
    if (!this.authService.ready()) {
      return;
    }

    if (this.user()) {
      this.router.navigate(['/profile']);
      return;
    }

    this.matDialog.open(AuthDialog, {
      autoFocus: false,
      disableClose: false,
      panelClass: 'auth-dialog-panel',
    });
  }

  private isPhoneOnlyUser() {
    const user = this.user();
    return !!user?.phoneNumber && !user.email && !user.imageUrl;
  }
}
