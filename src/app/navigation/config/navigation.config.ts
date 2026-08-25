import { NavigationItem } from '../models/navigation-item.model';

export const NAVIGATION_ITEMS: NavigationItem[] = [
    {
        label: 'Dashboard',
        icon: 'dashboard',
        route: '/dashboard',
        roles: ['USER', 'ADMIN']
    },
    {
        label: 'My Notifications',
        icon: 'notifications',
        route: '/notifications',
        roles: ['USER']
    },
    {
        label: 'Clients',
        icon: 'business',
        route: '/clients',
        roles: ['ADMIN']
    },
    {
        label: 'Users',
        icon: 'people',
        route: '/users',
        roles: ['ADMIN']
    },
    {
        label: 'Roles',
        icon: 'security',
        route: '/roles',
        roles: ['ADMIN']
    },
    {
        label: 'Notification Providers',
        icon: 'extension',
        route: '/providers',
        roles: ['ADMIN']
    },
    {
        label: 'Channels',
        icon: 'call_split',
        route: '/channels',
        roles: ['ADMIN']
    },
    {
        label: 'Templates',
        icon: 'description',
        route: '/templates',
        roles: ['USER', 'ADMIN']
    },
    {
        label: 'Delivery Logs',
        icon: 'receipt_long',
        route: '/logs',
        roles: ['ADMIN']
    },
    {
        label: 'Usage',
        icon: 'bar_chart',
        route: '/usage',
        roles: ['ADMIN']
    },
    {
        label: 'Playground',
        icon: 'science',
        route: '/playground',
        roles: ['USER']
    },
    {
        label: 'Settings',
        icon: 'settings',
        route: '/settings',
        roles: ['ADMIN']
    }
];
