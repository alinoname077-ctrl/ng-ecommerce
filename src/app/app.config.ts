import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter, withComponentInputBinding, withViewTransitions } from '@angular/router';

import { routes } from './app.routes';
import { provideHotToastConfig } from '@ngxpert/hot-toast';
import { MAT_FORM_FIELD_DEFAULT_OPTIONS } from '@angular/material/form-field';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { provideHttpClient } from '@angular/common/http';

export const appConfig: ApplicationConfig = {
 providers: [
  provideBrowserGlobalErrorListeners(),
 

  provideHttpClient(),

  provideRouter(routes, withComponentInputBinding()),
  provideHotToastConfig({
    style: { marginTop: '70px' },
    stacking: 'depth',
    duration: 1000,
  }),
  {
    provide: MAT_FORM_FIELD_DEFAULT_OPTIONS,
    useValue: {
      appearance: 'outline',
      subscriptSizing: 'dynamic',
      floatLabel: 'never',
    },
  },
  provideClientHydration(withEventReplay()),
],};