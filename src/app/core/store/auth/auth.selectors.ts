import { createFeatureSelector, createSelector } from '@ngrx/store';
import { AuthState } from './auth.state';

export const selectAuthState = createFeatureSelector<AuthState>('auth');

export const selectCurrentUser = createSelector(
  selectAuthState,
  (state: AuthState) => state.user
);

export const selectAccessToken = createSelector(
  selectAuthState,
  (state: AuthState) => state.accessToken
);

export const selectIsAuthenticated = createSelector(
  selectAuthState,
  (state: AuthState) => !!state.user && !!state.accessToken
);

export const selectUserRoles = createSelector(
  selectCurrentUser,
  (user) => user ? user.roles : []
);
