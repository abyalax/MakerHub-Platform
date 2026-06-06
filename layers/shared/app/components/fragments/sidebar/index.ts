import { LayoutDashboard, Settings, User2, ShieldCheck } from 'lucide-vue-next';
import type { Component } from 'vue';
import { PERMISSIONS } from '../../../common/const/permission';

export interface MenuItem {
  title: string;
  url: string;
  icon: Component;
  badge?: {
    count: number;
    variant: 'default' | 'destructive' | 'secondary' | 'outline';
  };
  submenu?: MenuItem[];
  permissions: string[];
}

export interface MenuGroup {
  group: string;
  items: MenuItem[];
}

export interface SidebarAppProps {
  user?: {
    name?: string | null;
    email?: string | null;
    avatar?: string;
  };
  appName?: string;
  appLogo?: string;
}

export const sidebarItems = (): MenuGroup[] => [
  {
    group: 'General',
    items: [
      {
        title: 'Dashboard',
        url: '/dashboard',
        icon: LayoutDashboard,
        permissions: [],
      },
      {
        title: 'Users',
        url: '/users',
        icon: User2,
        permissions: [PERMISSIONS.USER.READ],
      },
      {
        title: 'Roles',
        url: '/roles',
        icon: ShieldCheck,
        permissions: [PERMISSIONS.ROLE.READ],
      },
    ],
  },
];

export const bottomItems: MenuItem[] = [
  {
    title: 'Settings',
    url: '/dashboard',
    icon: Settings,
    permissions: [],
  },
];
