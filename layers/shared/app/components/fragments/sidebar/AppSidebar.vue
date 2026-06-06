<script lang="ts" setup>
import { usePermission } from '~/layers/auth/app/composables/usePermission';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '~/layers/shared/app/components/ui/sidebar';
import { useLayout } from '~/layers/shared/app/context/useLayout';
import { cn } from '~/layers/shared/app/lib/utils';
import type { SidebarAppProps } from '.';
import { bottomItems, sidebarItems } from '.';

import SidebarGroupApp from './AppSidebarGroup.vue';
import SidebarUser from './AppSidebarUser.vue';

defineProps<SidebarAppProps>();

const { collapsible, variant } = useLayout();
const { state } = useSidebar();
const { path } = useRoute();
const { hasAll } = usePermission();

// Filter based on user permissions
const filteredNavigations = computed(() => {
  const originalItems = sidebarItems();

  const filtered = originalItems
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => {
        // If no permissions required, show the item (public)
        if (!item.permissions || item.permissions.length === 0) return true;
        // Check if user has all of the required permissions (AND logic)
        const hasPermission = hasAll(item.permissions);
        return hasPermission;
      }),
    }))
    .filter((group) => group.items.length > 0); // Remove empty groups

  return filtered;
});

// Filter bottom items based on user permissions
const filteredBottomItems = computed(() => {
  const originalItems = bottomItems;

  const filtered = originalItems.filter((item) => {
    // If no permissions required, show the item (public)
    if (!item.permissions || item.permissions.length === 0) return true;
    // Check if user has all of the required permissions (AND logic)
    return hasAll(item.permissions);
  });

  return filtered;
});

const isActive = (url: string) => path === url;
</script>

<template>
  <Sidebar :collapsible="collapsible" :variant="variant">
    <SidebarHeader class="border-b border-border/40 p-4">
      <div class="flex items-center gap-3">
        <div v-if="state !== 'collapsed'" class="flex flex-col min-w-0">
          <span class="font-semibold text-sm truncate">Procurement</span>
          <span class="text-xs text-muted-foreground">v1.0.0</span>
        </div>
      </div>
    </SidebarHeader>
    <SidebarContent class="flex-1 overflow-y-auto">
      <!-- Main Navigation Groups -->
      <SidebarGroupApp v-for="section in filteredNavigations" :key="section.group" :section="section" />

      <!-- Bottom Navigations -->
      <SidebarGroup class="mt-auto">
        <SidebarGroupContent>
          <SidebarMenu>
            <SidebarMenuItem v-for="item in filteredBottomItems" :key="item.title">
              <SidebarMenuButton
                as-child
                :class="
                  cn(
                    'px-4 py-2 hover:bg-accent hover:text-accent-foreground transition-colors',
                    isActive(item.url) && 'bg-accent text-accent-foreground font-medium'
                  )
                "
              >
                <RouterLink :to="item.url" class="flex items-center gap-3">
                  <component :is="item.icon" class="w-4 h-4" />
                  <span>{{ item.title }}</span>
                </RouterLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    </SidebarContent>

    <!-- Footer With User Information -->
    <SidebarFooter>
      <SidebarUser :user="{ email: user?.email, name: user?.name }" />
    </SidebarFooter>
  </Sidebar>
</template>
