import { Component, OnDestroy, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatIcon } from '@angular/material/icon';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth/auth.service';
import { environment } from '../../../environments/environment';

type AuthAction = 'google' | 'send-code' | 'confirm-code';

type AuthDialogData = {
  checkout?: boolean;
  redirectUrl?: string;
};

@Component({
  selector: 'app-auth-dialog',
  imports: [ReactiveFormsModule, MatButton, MatIconButton, MatFormField, MatLabel, MatInput, MatIcon, MatProgressSpinner],
  templateUrl: './auth-dialog.html',
  styleUrl: './auth-dialog.scss',
})
export class AuthDialog implements OnDestroy {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);
  private readonly dialogRef = inject(MatDialogRef<AuthDialog>);
  private readonly data = inject<AuthDialogData | null>(MAT_DIALOG_DATA, { optional: true });

  protected readonly codeSent = signal(false);
  protected readonly errorMessage = signal('');
  protected readonly loadingAction = signal<AuthAction | null>(null);
  protected readonly firebaseConfigured = this.authService.isConfigured();
  protected readonly phoneAuthEnabled = environment.features.phoneAuthEnabled;

  protected readonly phoneForm = this.fb.group({
    phone: ['', [Validators.required, Validators.pattern(/^\+\d{10,15}$/)]],
  });

  protected readonly codeForm = this.fb.group({
    code: ['', [Validators.required, Validators.pattern(/^\d{4,8}$/)]],
  });

  constructor() {
    this.dialogRef.beforeClosed().subscribe(() => this.resetTransientState());
  }

  protected loading(action?: AuthAction) {
    return action ? this.loadingAction() === action : !!this.loadingAction();
  }

  protected async signInWithGoogle() {
    await this.runAuthAction('google', () => this.authService.signInWithGoogle());
  }

  protected async sendPhoneCode() {
    if (this.phoneForm.invalid) {
      this.phoneForm.markAllAsTouched();
      this.errorMessage.set('Номер введён неправильно. Укажите номер в международном формате, например +77081234567.');
      return;
    }

    await this.runAction('send-code', async () => {
      await this.authService.sendPhoneCode(this.phoneForm.controls.phone.value || '', 'tawk-safe-recaptcha');
      this.codeSent.set(true);
      this.errorMessage.set('');
    });
  }

  protected async confirmPhoneCode() {
    if (this.codeForm.invalid) {
      this.codeForm.markAllAsTouched();
      this.errorMessage.set('Неверный SMS-код. Проверьте код из сообщения и попробуйте ещё раз.');
      return;
    }

    await this.runAuthAction('confirm-code', () => this.authService.confirmPhoneCode(this.codeForm.controls.code.value || ''));
  }

  protected close() {
    this.resetTransientState();
    this.dialogRef.close(false);
  }

  ngOnDestroy() {
    this.resetTransientState();
  }

  private async runAuthAction(action: AuthAction, authCall: () => Promise<unknown>) {
    await this.runAction(action, async () => {
      await authCall();
      this.dialogRef.close(true);

      if (this.data?.checkout) {
        await this.router.navigate(['/checkout']);
        return;
      }

      await this.router.navigateByUrl(this.data?.redirectUrl || '/profile');
    });
  }

  private async runAction(action: AuthAction, callback: () => Promise<void>) {
    if (this.loadingAction()) {
      return;
    }

    this.errorMessage.set('');
    this.loadingAction.set(action);

    try {
      await callback();
    } catch (error) {
      this.errorMessage.set(this.authService.toUserMessage(error));
    } finally {
      this.loadingAction.set(null);
    }
  }

  private resetTransientState() {
    this.errorMessage.set('');
    this.loadingAction.set(null);
    this.codeSent.set(false);
    this.codeForm.reset();
    this.authService.clearPendingAuth();
  }
}
