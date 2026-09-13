import { User } from '../../auth/auth.models';

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  expiresIn: number | null;
}

export const initialAuthState: AuthState = {
  user: null,
  accessToken: null,
  expiresIn: null
};
