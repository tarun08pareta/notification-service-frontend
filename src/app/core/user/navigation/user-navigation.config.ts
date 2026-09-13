import { NavigationItem } from '../../common/navigation/models/navigation-item.model';

export const USER_NAVIGATION_ITEMS: NavigationItem[] = [
    { label: 'Dashboard', icon: 'dashboard', route: '/user/dashboard' },
    { label: 'API Tokens', icon: 'vpn_key', route: '/user/api-tokens' },
    { label: 'Playground', icon: 'science', route: '/user/playground' },
    { label: 'My Notifications', icon: 'notifications', route: '/notifications' },
    { label: 'Templates', icon: 'description', route: '/templates' }
];
