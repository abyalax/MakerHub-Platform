<script lang="ts" setup>
import Breadcrumb from "../../ui/breadcrumb/Breadcrumb.vue";
import BreadcrumbList from "../../ui/breadcrumb/BreadcrumbList.vue";
import BreadcrumbItem from "../../ui/breadcrumb/BreadcrumbItem.vue";
import BreadcrumbLink from "../../ui/breadcrumb/BreadcrumbLink.vue";
import BreadcrumbSeparator from "../../ui/breadcrumb/BreadcrumbSeparator.vue";
import BreadcrumbPage from "../../ui/breadcrumb/BreadcrumbPage.vue";
import type { BreadcrumbProps } from ".";

defineProps<{ items?: BreadcrumbProps[] }>();
</script>

<template>
  <Breadcrumb>
    <BreadcrumbList>
      <template v-for="item in items" :key="item.title">
        <template v-if="item.active">
          <BreadcrumbPage>{{ item.title }}</BreadcrumbPage>
          <BreadcrumbSeparator />
        </template>

        <template v-else>
          <BreadcrumbItem>
            <BreadcrumbLink :as-child="true">
              <RouterLink :to="item.url">{{ item.title }}</RouterLink>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
        </template>
      </template>
    </BreadcrumbList>
  </Breadcrumb>
</template>
