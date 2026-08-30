import { isPlatformBrowser } from '@angular/common';
import { InjectionToken, Injectable, PLATFORM_ID, inject, signal } from '@angular/core';
import { FirebaseApp, FirebaseOptions, getApp, getApps, initializeApp } from 'firebase/app';
import {
  Auth,
  ConfirmationResult,
  GoogleAuthProvider,
  RecaptchaVerifier,
  User as FirebaseUser,
  browserLocalPersistence,
  getAuth,
  onAuthStateChanged,
  setPersistence,
  signInWithPhoneNumber,
  signInWithPopup,
  signOut,
} from 'firebase/auth';
import { DeliveryAddress, User, UserOrderSummary } from '../../models/user';
import { environment } from '../../../environments/environment';

type RecaptchaFactory = (
  auth: Auth,
  containerOrId: string,
  parameters: ConstructorParameters<typeof RecaptchaVerifier>[2],
) => RecaptchaVerifier;

type PhoneSignIn = typeof signInWithPhoneNumber;

export const FIREBASE_RECAPTCHA_FACTORY = new InjectionToken<RecaptchaFactory>(
  'Firebase reCAPTCHA verifier factory',
  {
    providedIn: 'root',
    factory: () => (auth, containerOrId, parameters) => new RecaptchaVerifier(auth, containerOrId, parameters),
  },
);

export const FIREBASE_PHONE_SIGN_IN = new InjectionToken<PhoneSignIn>('Firebase phone sign-in', {
  providedIn: 'root',
  factory: () => signInWithPhoneNumber,
});

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly recaptchaFactory = inject(FIREBASE_RECAPTCHA_FACTORY);
  private readonly phoneSignIn = inject(FIREBASE_PHONE_SIGN_IN);
  private readonly auth = this.isBrowser && this.hasFirebaseConfig() ? this.createAuth() : undefined;
  private recaptchaVerifier: RecaptchaVerifier | null = null;
  private recaptchaContainerId: string | null = null;
  private recaptchaRenderPromise: Promise<unknown> | null = null;
  private confirmationResult?: ConfirmationResult;
  private phoneCodeRequest: Promise<void> | null = null;
  private readyResolve!: () => void;
  private readonly readyPromise = new Promise<void>((resolve) => {
    this.readyResolve = resolve;
  });

  readonly user = signal<User | undefined>(undefined);
  readonly ready = signal(false);

  constructor() {
    if (!this.auth) {
      this.ready.set(true);
      this.readyResolve();
      return;
    }

    void this.initializeAuthState();
  }

  whenReady() {
    return this.readyPromise;
  }

  isConfigured() {
    return !!this.auth;
  }

  async signInWithGoogle() {
    const auth = this.requireAuth();
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    await setPersistence(auth, browserLocalPersistence);
    const result = await signInWithPopup(auth, provider);
    this.user.set(this.mapFirebaseUser(result.user));
    return this.user();
  }

  async sendPhoneCode(phoneNumber: string, containerId: string) {
    if (this.phoneCodeRequest) {
      return this.phoneCodeRequest;
    }

    this.phoneCodeRequest = this.sendPhoneCodeInternal(phoneNumber, containerId).finally(() => {
      this.phoneCodeRequest = null;
    });

    return this.phoneCodeRequest;
  }

  private async sendPhoneCodeInternal(phoneNumber: string, containerId: string) {
    const auth = this.requireAuth();
    const normalizedPhone = phoneNumber.replace(/[\s()-]/g, '');

    if (!/^\+\d{10,15}$/.test(normalizedPhone)) {
      throw new Error('Номер введён неправильно. Укажите номер в международном формате, например +77081234567.');
    }

    try {
      await setPersistence(auth, browserLocalPersistence);
      const verifier = await this.getRecaptchaVerifier(auth, containerId);
      this.confirmationResult = await this.phoneSignIn(auth, normalizedPhone, verifier);
    } catch (error) {
      this.clearRecaptcha();
      throw error;
    }
  }

  async confirmPhoneCode(code: string) {
    if (!this.confirmationResult) {
      throw new Error('Код не отправлен. Сначала запросите SMS-код.');
    }

    if (!/^\d{4,8}$/.test(code.trim())) {
      throw new Error('Неверный SMS-код. Проверьте код из сообщения и попробуйте ещё раз.');
    }

    const result = await this.confirmationResult.confirm(code.trim());
    this.confirmationResult = undefined;
    this.clearRecaptcha();
    this.user.set(this.mapFirebaseUser(result.user));
    return this.user();
  }

  async signOut() {
    if (this.auth) {
      await signOut(this.auth);
    }
    this.user.set(undefined);
    this.confirmationResult = undefined;
    this.clearRecaptcha();
  }

  clearPendingAuth() {
    this.confirmationResult = undefined;
    this.clearRecaptcha();
  }

  updateDeliveryAddress(address: DeliveryAddress) {
    const currentUser = this.user();
    if (!currentUser) {
      return;
    }

    const updatedUser: User = { ...currentUser, deliveryAddress: address };
    this.user.set(updatedUser);
    this.writeLocalProfile(updatedUser);
  }

  addOrderToHistory(order: UserOrderSummary) {
    const currentUser = this.user();
    if (!currentUser) {
      return;
    }

    const exists = currentUser.orderHistory.some((item) => item.id === order.id);
    const orderHistory = exists ? currentUser.orderHistory : [order, ...currentUser.orderHistory];
    const updatedUser: User = { ...currentUser, orderHistory };
    this.user.set(updatedUser);
    this.writeLocalProfile(updatedUser);
  }

  toUserMessage(error: unknown) {
    const code = typeof error === 'object' && error && 'code' in error ? String(error.code) : '';
    const message = error instanceof Error ? error.message : '';

    if (message.startsWith('Firebase Authentication не настроен')) {
      return message;
    }

    switch (code) {
      case 'auth/popup-closed-by-user':
      case 'auth/cancelled-popup-request':
        return 'Окно Google было закрыто до завершения входа.';
      case 'auth/invalid-phone-number':
      case 'auth/missing-phone-number':
        return 'Номер введён неправильно. Укажите номер в международном формате.';
      case 'auth/invalid-verification-code':
      case 'auth/code-expired':
        return 'Неверный SMS-код. Проверьте код или запросите новый.';
      case 'auth/missing-verification-code':
        return 'Код не отправлен. Сначала запросите SMS-код.';
      case 'auth/too-many-requests':
        return 'Слишком много попыток. Попробуйте позже.';
      case 'auth/network-request-failed':
        return 'Ошибка сети. Проверьте подключение и попробуйте ещё раз.';
      case 'auth/unauthorized-domain':
        return 'Домен сайта не добавлен в Firebase Authorized domains. Добавьте текущий домен в Firebase Console.';
      case 'auth/operation-not-allowed':
        return 'Этот способ входа не включён в Firebase Console.';
      default:
        return message || 'Не удалось выполнить вход. Попробуйте ещё раз.';
    }
  }

  private requireAuth() {
    if (!this.auth) {
      throw new Error('Firebase Authentication не настроен. Заполните Firebase environment-файлы и включите методы входа в Firebase Console.');
    }

    return this.auth;
  }

  private createAuth() {
    const app = this.createApp(environment.firebase);
    return getAuth(app);
  }

  private async initializeAuthState() {
    const auth = this.requireAuth();

    try {
      await setPersistence(auth, browserLocalPersistence);
    } finally {
      onAuthStateChanged(
        auth,
        (firebaseUser) => {
          this.user.set(firebaseUser ? this.mapFirebaseUser(firebaseUser) : undefined);
          this.ready.set(true);
          this.readyResolve();
        },
        () => {
          this.user.set(undefined);
          this.ready.set(true);
          this.readyResolve();
        },
      );
    }
  }

  private createApp(config: FirebaseOptions): FirebaseApp {
    return getApps().length ? getApp() : initializeApp(config);
  }

  private async getRecaptchaVerifier(auth: Auth, containerId: string) {
    await this.waitForRecaptchaContainer(containerId);

    if (this.recaptchaVerifier && this.recaptchaContainerId === containerId) {
      await this.recaptchaRenderPromise;
      return this.recaptchaVerifier;
    }

    this.clearRecaptcha();

    const verifier = this.recaptchaFactory(auth, containerId, {
      size: 'invisible',
    });

    this.recaptchaVerifier = verifier;
    this.recaptchaContainerId = containerId;
    this.recaptchaRenderPromise = verifier.render();

    try {
      await this.recaptchaRenderPromise;
      return verifier;
    } catch (error) {
      this.clearRecaptcha();
      throw error;
    }
  }

  private async waitForRecaptchaContainer(containerId: string) {
    if (!this.isBrowser) {
      return;
    }

    for (let attempt = 0; attempt < 20; attempt++) {
      if (document.getElementById(containerId)) {
        return;
      }

      await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
    }

    throw new Error('Контейнер reCAPTCHA не найден. Закройте окно входа и попробуйте ещё раз.');
  }

  private hasFirebaseConfig() {
    const { apiKey, authDomain, projectId, appId, messagingSenderId } = environment.firebase;
    return [apiKey, authDomain, projectId, appId, messagingSenderId].every(
      (value) => !!value && !value.startsWith('YOUR_'),
    );
  }

  private mapFirebaseUser(firebaseUser: FirebaseUser): User {
    const localProfile = this.readLocalProfile(firebaseUser.uid);
    const localName = localProfile.name?.trim();
    const displayName = firebaseUser.displayName?.trim();
    const isPhoneOnlyUser = !!firebaseUser.phoneNumber && !firebaseUser.email && !firebaseUser.photoURL;
    const fallbackName = isPhoneOnlyUser || localName?.startsWith('+') ? 'Пользователь' : localName || 'Пользователь';

    return {
      id: firebaseUser.uid,
      email: firebaseUser.email ?? localProfile.email,
      name: displayName || fallbackName,
      imageUrl: firebaseUser.photoURL ?? localProfile.imageUrl,
      phoneNumber: firebaseUser.phoneNumber ?? localProfile.phoneNumber,
      deliveryAddress: localProfile.deliveryAddress,
      orderHistory: localProfile.orderHistory ?? [],
    };
  }

  private storageKey(userId: string) {
    return 'c-trade-auth-profile-' + userId;
  }

  private readLocalProfile(userId: string): Partial<User> {
    if (!this.isBrowser) {
      return {};
    }

    try {
      const value = localStorage.getItem(this.storageKey(userId));
      return value ? JSON.parse(value) : {};
    } catch {
      return {};
    }
  }

  private writeLocalProfile(user: User) {
    if (!this.isBrowser) {
      return;
    }

    localStorage.setItem(this.storageKey(user.id), JSON.stringify(user));
  }

  private clearRecaptcha() {
    const containerId = this.recaptchaContainerId;

    try {
      this.recaptchaVerifier?.clear();
    } catch {
      // Firebase may already have removed the widget during dialog teardown.
    }

    this.recaptchaVerifier = null;
    this.recaptchaContainerId = null;
    this.recaptchaRenderPromise = null;

    if (!this.isBrowser || !containerId) {
      return;
    }

    document.getElementById(containerId)?.replaceChildren();
  }
}
