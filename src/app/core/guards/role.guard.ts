import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';

export const roleGuard: CanActivateFn = (route, state) => {
    const authService = inject(AuthService);
    const router = inject(Router);

    const requiredRoles = route.data?.['roles'] as string[];

    if (!requiredRoles || requiredRoles.length === 0) {
        return true; // No roles required
    }

    if (authService.hasAnyRole(requiredRoles)) {
        return true;
    }

    // In future: return router.createUrlTree(['/unauthorized']);
    return false;
};
