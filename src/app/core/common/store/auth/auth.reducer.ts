import { createReducer, on } from '@ngrx/store';
import { initialAuthState, AuthState } from './auth.state';
import * as AuthActions from './auth.actions';

export const authReducer = createReducer(
  initialAuthState,
  on(AuthActions.loginSuccess, AuthActions.restoreAuth, (state, { user, accessToken, expiresIn }): AuthState => ({
    ...state,
    user,
    accessToken,
    expiresIn
  })),
  on(AuthActions.logout, (): AuthState => ({
    ...initialAuthState
  }))
);
