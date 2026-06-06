<script lang="ts" setup>
import { ChevronRight } from 'lucide-vue-next';
import { usePermission } from '~/layers/auth/app/composables/usePermission';
import type { MenuItem } from '.';
import Badge from '../../ui/badge/Badge.vue';
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from '../../ui/sidebar';
import { Tooltip, TooltipContent, TooltipTrigger } from '../../ui/tooltip';
import { cn } from '~/layers/shared/app/lib/utils';

type Props = {
  section: {
    items: MenuItem[];
    group: string;
  };
};

const props = defineProps<Props>();
const { hasAny } = usePermission();

const expandedItems = ref<string[]>([]);
const { state, isMobile } = useSidebar();
const route = useRoute();
const path = route.path;

// Filter submenu items based on permissions
const filteredItems = computed(() => {
  return props.section.items
    .map((item) => ({
      ...item,
      submenu: item.submenu?.filter((subItem) => {
        // If no permissions required, show the item (public)
        if (!subItem.permissions || subItem.permissions.length === 0) {
          return true;
        }
        // Check if user has any of the required permissions (OR logic)
        return hasAny(subItem.permissions);
      }),
    }))
    .filter((item) => {
      // Keep item if it has no submenu or if it has filtered submenu items
      return !item.submenu || item.submenu.length === 0 || item.submenu.length > 0;
    });
});

const toggleExpanded = (title: string) => {
  expandedItems.value = expandedItems.value.includes(title) ? expandedItems.value.filter((item) => item !== title) : [...expandedItems.value, title];
};

const isParentActive = (submenu?: Array<{ url: string }>) => submenu?.some((item) => path === item.url);

const isActive = (url: string) => path === url;

const showTooltip = computed(() => state.value === 'collapsed' && !isMobile.value);

const checkIsActive = (item: MenuItem) => {
  const hasSubmenu = item.submenu && item.submenu.length > 0;
  return isActive(item.url) || (hasSubmenu && isParentActive(item.submenu));
};

const isExpanded = (item: MenuItem) => expandedItems.value.includes(item.title);
</script>

<template>
  <SidebarGroup>
    <SidebarGroupLabel class="px-4 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
      {{ section.group }}
    </SidebarGroupLabel>

    <SidebarGroupContent>
      <SidebarMenu>
        <SidebarMenuItem v-for="item in filteredItems" :key="item.title">
          <Tooltip :disabled="!showTooltip">
            <TooltipTrigger as-child>
              <SidebarMenuButton
                :is-active="checkIsActive(item)"
                :as-child="!(item.submenu && item.submenu.length > 0)"
                :class="cn('w-full flex items-center transition-colors', checkIsActive(item) && 'bg-accent text-accent-foreground font-medium')"
                @click="item.submenu?.length ? toggleExpanded(item.title) : undefined"
              >
                <template v-if="item.submenu && item.submenu.length > 0">
                  <div class="flex items-center gap-3">
                    <component :is="item.icon" v-if="item.icon" class="w-4 h-4" />
                    <span>{{ item.title }}</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <Badge v-if="item.badge" :variant="item.badge.variant" class="h-5 px-1.5 text-xs">
                      {{ item.badge.count }}
                    </Badge>
                    <ChevronRight :class="cn('w-4 h-4 transition-transform', isExpanded(item) && 'rotate-90')" />
                  </div>
                </template>

                <RouterLink v-else :to="item.url" class="flex items-center gap-3 w-full">
                  <component :is="item.icon" v-if="item.icon" class="w-4 h-4" />
                  <span>{{ item.title }}</span>
                  <Badge v-if="item.badge" :variant="item.badge.variant" class="ml-auto h-5 px-1.5 text-xs">
                    {{ item.badge.count }}
                  </Badge>
                </RouterLink>
              </SidebarMenuButton>
            </TooltipTrigger>

            <TooltipContent v-if="showTooltip" side="right">
              {{ item.title }}
            </TooltipContent>
          </Tooltip>

          <Transition
            enter-active-class="transition-all duration-300 ease-in-out"
            enter-from-class="opacity-0 translate-y-[-10px]"
            enter-to-class="opacity-100 translate-y-0"
          >
            <SidebarMenuSub v-if="item.submenu?.length && isExpanded(item)">
              <SidebarMenuSubItem v-for="subItem in item.submenu" :key="subItem.title">
                <SidebarMenuSubButton
                  as-child
                  :class="cn('px-4 py-1.5 text-sm transition-colors', route.path === subItem.url && 'bg-accent text-accent-foreground font-medium')"
                >
                  <RouterLink :to="subItem.url">
                    <span>{{ subItem.title }}</span>
                  </RouterLink>
                </SidebarMenuSubButton>
              </SidebarMenuSubItem>
            </SidebarMenuSub>
          </Transition>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarGroupContent>
  </SidebarGroup>
</template>
