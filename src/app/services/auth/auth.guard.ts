import { isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID, inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { AuthService } from './auth.service';
import { AuthDialog } from '../../components/auth-dialog/auth-dialog';

export const authGuard: CanActivateFn = async (_route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const dialog = inject(MatDialog);
  const isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  if (!isBrowser) {
    return true;
  }

  await authService.whenReady();

  if (authService.user()) {
    return true;
  }

  dialog.open(AuthDialog, {
    autoFocus: false,
    data: { redirectUrl: state.url },
    disableClose: false,
    panelClass: 'auth-dialog-panel',
  });

  return false;
};
