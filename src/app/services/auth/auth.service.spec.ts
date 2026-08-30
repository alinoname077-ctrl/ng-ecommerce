import { PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Auth, ConfirmationResult, RecaptchaVerifier } from 'firebase/auth';
import {
  AuthService,
  FIREBASE_PHONE_SIGN_IN,
  FIREBASE_RECAPTCHA_FACTORY,
} from './auth.service';

describe('AuthService reCAPTCHA lifecycle', () => {
  const containerId = 'recaptcha-test-container';
  let factory: jasmine.Spy;
  let phoneSignIn: jasmine.Spy;
  let verifiers: Array<{
    clear: jasmine.Spy;
    render: jasmine.Spy;
  }>;

  beforeEach(() => {
    verifiers = [];
    factory = jasmine.createSpy('recaptchaFactory').and.callFake((_auth: Auth, targetId: string) => {
      const verifier = {
        clear: jasmine.createSpy('clear'),
        render: jasmine.createSpy('render').and.callFake(async () => {
          document.getElementById(targetId)?.appendChild(document.createElement('iframe'));
          return 1;
        }),
      };
      verifiers.push(verifier);
      return verifier as unknown as RecaptchaVerifier;
    });
    phoneSignIn = jasmine
      .createSpy('phoneSignIn')
      .and.resolveTo({ confirm: jasmine.createSpy('confirm') } as unknown as ConfirmationResult);

    TestBed.configureTestingModule({
      providers: [
        AuthService,
        { provide: PLATFORM_ID, useValue: 'browser' },
        { provide: FIREBASE_RECAPTCHA_FACTORY, useValue: factory },
        { provide: FIREBASE_PHONE_SIGN_IN, useValue: phoneSignIn },
      ],
    });

    document.body.insertAdjacentHTML('beforeend', `<div id="${containerId}"></div>`);
  });

  afterEach(() => {
    TestBed.resetTestingModule();
    document.getElementById(containerId)?.remove();
  });

  it('reuses the active verifier and does not render it twice for the same container', async () => {
    const service = TestBed.inject(AuthService);

    await service.sendPhoneCode('+77081724084', containerId);
    await service.sendPhoneCode('+77081724084', containerId);

    expect(factory).toHaveBeenCalledTimes(1);
    expect(verifiers[0].render).toHaveBeenCalledTimes(1);
    expect(phoneSignIn).toHaveBeenCalledTimes(2);
  });

  it('prevents parallel SMS sends from creating duplicate verifiers', async () => {
    const service = TestBed.inject(AuthService);

    await Promise.all([
      service.sendPhoneCode('+77081724084', containerId),
      service.sendPhoneCode('+77081724084', containerId),
    ]);

    expect(factory).toHaveBeenCalledTimes(1);
    expect(verifiers[0].render).toHaveBeenCalledTimes(1);
    expect(phoneSignIn).toHaveBeenCalledTimes(1);
  });

  it('clears the verifier and DOM container before a new dialog session', async () => {
    const service = TestBed.inject(AuthService);

    await service.sendPhoneCode('+77081724084', containerId);
    expect(document.getElementById(containerId)?.children.length).toBe(1);

    service.clearPendingAuth();
    expect(verifiers[0].clear).toHaveBeenCalledTimes(1);
    expect(document.getElementById(containerId)?.children.length).toBe(0);

    await service.sendPhoneCode('+77081724084', containerId);

    expect(factory).toHaveBeenCalledTimes(2);
    expect(verifiers[1].render).toHaveBeenCalledTimes(1);
  });

  it('clears the verifier and DOM container when SMS sending fails', async () => {
    phoneSignIn.and.rejectWith(new Error('network'));
    const service = TestBed.inject(AuthService);

    await expectAsync(service.sendPhoneCode('+77081724084', containerId)).toBeRejected();

    expect(verifiers[0].clear).toHaveBeenCalledTimes(1);
    expect(document.getElementById(containerId)?.children.length).toBe(0);
  });
});
