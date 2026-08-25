export interface NavigationItem {
    label: string;
    icon: string;
    route: string;
    roles?: string[]; // If empty, available to all authenticated users
    children?: NavigationItem[];
}
