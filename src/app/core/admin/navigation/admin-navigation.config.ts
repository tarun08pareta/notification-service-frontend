import { NavigationItem } from '../../common/navigation/models/navigation-item.model';

export const ADMIN_NAVIGATION_ITEMS: NavigationItem[] = [
    { label: 'Dashboard', icon: 'dashboard', route: '/admin/dashboard' },
    { label: 'Users', icon: 'people', route: '/admin/users' },
    { label: 'Roles', icon: 'security', route: '/admin/roles' },
    { label: 'Providers', icon: 'extension', route: '/admin/providers' },
    { label: 'Notifications', icon: 'notifications', route: '/admin/notifications' },
    { label: 'Channels', icon: 'call_split', route: '/admin/channels' },
    // UPDATED: Fixed Templates route to /admin/templates
    { label: 'Templates', icon: 'description', route: '/admin/templates' },
    // UPDATED: Added Notifications management link
    { label: 'Delivery Logs', icon: 'receipt_long', route: '/admin/logs' },
    { label: 'Usage', icon: 'bar_chart', route: '/admin/usage' },
    { label: 'Settings', icon: 'settings', route: '/admin/settings' }
];

