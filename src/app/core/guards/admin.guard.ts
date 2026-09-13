import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../common/auth/auth.service';

export const adminGuard: CanActivateFn = (route, state) => {
    const authService = inject(AuthService);
    
    if (authService.hasAnyRole(['ADMIN'])) {
        return true;
    }

    return false;
};
