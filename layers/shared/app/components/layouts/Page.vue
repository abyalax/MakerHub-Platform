<script lang="ts" setup>
import type { BreadcrumbProps } from '../fragments/breadcrumbs';
import SidebarProvider from '../ui/sidebar/SidebarProvider.vue';
import AppSidebar from '../fragments/sidebar/AppSidebar.vue';
import SidebarInset from '../ui/sidebar/SidebarInset.vue';
import Header from './Header.vue';
import { AppSearch } from '../fragments/input';
import ToggleTheme from '../ui/theme/ToggleTheme.vue';
import Main from './Main.vue';
import Flex from './Flex.vue';
import AppBreadcrumbs from '../fragments/breadcrumbs/AppBreadcrumbs.vue';
import H4 from '../ui/typography/H4.vue';
import ConfigDrawer from '../fragments/config/ConfigDrawer.vue';
import { cn } from '../../lib/utils';
import AppProvider from '../providers/AppProvider.vue';

interface Props {
  title: string;
  breadcrumbs: BreadcrumbProps[];
}

defineProps<Props>();
</script>

<template>
  <AppProvider>
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset
        :class="
          cn(
            // Set content container, so we can use container queries
            '@container/content',
            // If layout is fixed, set the height
            // to 100svh to prevent overflow
            'has-data-[layout=fixed]:h-svh',
            // If layout is fixed and sidebar is inset,
            // set the height to 100svh - spacing (total margins) to prevent overflow
            'peer-data-[variant=inset]:has-data-[layout=fixed]:h-[calc(100svh-(var(--spacing)*4))]'
          )
        "
      >
        <Header>
          <AppSearch />
          <div class="ms-auto flex items-center space-x-4">
            <ToggleTheme />
            <ConfigDrawer />
          </div>
        </Header>
        <Main fluid>
          <Flex direction="row" justify="space-between" class="gap-4 mb-4">
            <Flex direction="column" :gap="20">
              <H4 class="text-start">{{ title }}</H4>
              <AppBreadcrumbs :items="breadcrumbs" />
            </Flex>
            <!-- Top Actions Slots -->
            <slot name="top-actions" />
          </Flex>
          <!-- Children -->
          <slot name="children" />
        </Main>
      </SidebarInset>
    </SidebarProvider>
  </AppProvider>
</template>
