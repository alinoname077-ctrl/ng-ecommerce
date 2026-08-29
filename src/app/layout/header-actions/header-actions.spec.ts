import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { signal } from '@angular/core';
import { HeaderActions } from './header-actions';
import { EcommerceStore } from '../../ecommerce-store';
import { AuthService } from '../../services/auth/auth.service';
import { User } from '../../models/user';

describe('HeaderActions', () => {
  let fixture: ComponentFixture<HeaderActions>;
  let authUser: ReturnType<typeof signal<User | undefined>>;
  let authReady: ReturnType<typeof signal<boolean>>;

  beforeEach(async () => {
    authUser = signal<User | undefined>(undefined);
    authReady = signal(true);

    await TestBed.configureTestingModule({
      imports: [HeaderActions],
      providers: [
        {
          provide: EcommerceStore,
          useValue: {
            wishlistCount: signal(0),
            cartCount: signal(0),
          },
        },
        {
          provide: AuthService,
          useValue: {
            user: authUser,
            ready: authReady,
          },
        },
        {
          provide: Router,
          useValue: {
            navigate: jasmine.createSpy('navigate'),
          },
        },
        {
          provide: MatDialog,
          useValue: {
            open: jasmine.createSpy('open'),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(HeaderActions);
    fixture.detectChanges();
  });

  it('shows the guest profile action when user is not signed in', () => {
    const button = profileButton();

    expect(button.textContent).toContain('Профиль');
    expect(button.classList).not.toContain('profile-action--signed-in');
    expect(statusDot()).toBeNull();
  });

  it('shows Google photo, display name, and online indicator for Google users', () => {
    authUser.set({
      id: 'google-user',
      name: 'Ali Ali',
      email: 'ali@example.com',
      imageUrl: 'https://lh3.googleusercontent.com/a/avatar=s96-c',
      orderHistory: [],
    });
    fixture.detectChanges();

    const button = profileButton();
    const image = button.querySelector<HTMLImageElement>('img.profile-action__avatar');

    expect(button.classList).toContain('profile-action--signed-in');
    expect(button.textContent).toContain('Ali Ali');
    expect(image?.src).toContain('https://lh3.googleusercontent.com/a/avatar=s96-c');
    expect(statusDot()).not.toBeNull();
  });

  it('falls back to initials when a Google photo cannot be loaded', () => {
    authUser.set({
      id: 'google-user',
      name: 'Ali Ali',
      email: 'ali@example.com',
      imageUrl: 'https://lh3.googleusercontent.com/a/avatar=s96-c',
      orderHistory: [],
    });
    fixture.detectChanges();

    const image = profileButton().querySelector<HTMLImageElement>('img.profile-action__avatar');
    image?.dispatchEvent(new Event('error'));
    fixture.detectChanges();

    expect(profileButton().querySelector('img.profile-action__avatar')).toBeNull();
    expect(profileButton().querySelector('.profile-action__initials')?.textContent?.trim()).toBe('AA');
    expect(statusDot()).not.toBeNull();
  });

  it('shows a generic signed-in avatar for phone users without exposing the full phone number', () => {
    authUser.set({
      id: 'phone-user',
      name: 'Пользователь',
      phoneNumber: '+77081724084',
      orderHistory: [],
    });
    fixture.detectChanges();

    const button = profileButton();

    expect(button.classList).toContain('profile-action--signed-in');
    expect(button.textContent).toContain('Мой профиль');
    expect(button.textContent).not.toContain('+77081724084');
    expect(button.querySelector('.profile-action__icon-avatar mat-icon')?.textContent?.trim()).toBe('person');
    expect(statusDot()).not.toBeNull();
  });

  function profileButton() {
    return fixture.nativeElement.querySelector('.profile-action') as HTMLButtonElement;
  }

  function statusDot() {
    return fixture.nativeElement.querySelector('.profile-action__status') as HTMLElement | null;
  }
});
