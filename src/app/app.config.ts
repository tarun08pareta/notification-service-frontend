import { ApplicationConfig, provideZoneChangeDetection, APP_INITIALIZER } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideStore, Store } from '@ngrx/store';

import { routes } from './app.routes';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { loaderInterceptor } from './core/interceptors/loader.interceptor';
import { loaderReducer } from './core/store/loader/loader.reducer';
import { authReducer } from './core/store/auth/auth.reducer';
import { AuthStorageService } from './core/auth/auth-storage.service';
import { restoreAuth } from './core/store/auth/auth.actions';

export function initializeAuth(store: Store, authStorage: AuthStorageService) {
  return () => {
    const authData = authStorage.getAuth();
    if (authData) {
      store.dispatch(restoreAuth(authData));
    }
  };
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }), 
    provideRouter(routes),
    provideHttpClient(
      withInterceptors([authInterceptor, loaderInterceptor])
    ),
    provideAnimationsAsync(),
    provideStore({ loader: loaderReducer, auth: authReducer }),
    {
      provide: APP_INITIALIZER,
      useFactory: initializeAuth,
      deps: [Store, AuthStorageService],
      multi: true
    }
  ]
};
