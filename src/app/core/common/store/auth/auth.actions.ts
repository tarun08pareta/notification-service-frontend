import { createAction, props } from '@ngrx/store';
import { User } from '../../auth/auth.models';

export const loginSuccess = createAction(
  '[Auth] Login Success',
  props<{ user: User; accessToken: string; expiresIn: number }>()
);

export const restoreAuth = createAction(
  '[Auth] Restore Auth',
  props<{ user: User; accessToken: string; expiresIn: number }>()
);

export const logout = createAction('[Auth] Logout');
