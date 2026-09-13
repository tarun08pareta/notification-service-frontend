import { Injectable, inject, computed } from '@angular/core';
import { ADMIN_NAVIGATION_ITEMS } from '../../../admin/navigation/admin-navigation.config';
import { USER_NAVIGATION_ITEMS } from '../../../user/navigation/user-navigation.config';
import { AuthService } from '../../auth/auth.service';
import { NavigationItem } from '../models/navigation-item.model';

@Injectable({
    providedIn: 'root'
})
export class NavigationService {
    private authService = inject(AuthService);

    // Provide the correct navigation list based on user role
    readonly navigationItems = computed(() => {
        const user = this.authService.currentUser();
        if (!user) {
            return [];
        }
        
        if (user.roles.includes('ADMIN')) {
            return ADMIN_NAVIGATION_ITEMS;
        } else if (user.roles.includes('USER')) {
            return USER_NAVIGATION_ITEMS;
        }
        
        return [];
    });
}
