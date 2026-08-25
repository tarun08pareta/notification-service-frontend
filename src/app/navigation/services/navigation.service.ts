import { Injectable, inject, computed } from '@angular/core';
import { NAVIGATION_ITEMS } from '../config/navigation.config';
import { AuthService } from '../../core/auth/auth.service';
import { NavigationItem } from '../models/navigation-item.model';

@Injectable({
    providedIn: 'root'
})
export class NavigationService {
    private authService = inject(AuthService);

    // Filter items reactively when user roles change
    readonly navigationItems = computed(() => {
        const user = this.authService.currentUser();
        if (!user) {
            return [];
        }
        return this.filterItems(NAVIGATION_ITEMS, user.roles);
    });

    private filterItems(items: NavigationItem[], userRoles: string[]): NavigationItem[] {
        return items.filter(item => {
            if (!item.roles || item.roles.length === 0) {
                return true;
            }
            return item.roles.some(role => userRoles.includes(role));
        });
    }
}
