import { NavigationItem } from '../../common/navigation/models/navigation-item.model';

export const ADMIN_NAVIGATION_ITEMS: NavigationItem[] = [
    { label: 'Dashboard', icon: 'dashboard', route: '/admin/dashboard' },
    { label: 'Clients', icon: 'business', route: '/admin/clients' },
    { label: 'Users', icon: 'people', route: '/admin/users' },
    { label: 'Roles', icon: 'security', route: '/admin/roles' },
    { label: 'Notification Providers', icon: 'extension', route: '/admin/providers' },
    { label: 'Channels', icon: 'call_split', route: '/admin/channels' },
    { label: 'Templates', icon: 'description', route: '/templates' },
    { label: 'Delivery Logs', icon: 'receipt_long', route: '/admin/logs' },
    { label: 'Usage', icon: 'bar_chart', route: '/admin/usage' },
    { label: 'Settings', icon: 'settings', route: '/admin/settings' }
];
