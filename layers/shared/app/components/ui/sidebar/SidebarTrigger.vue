<script setup lang="ts">
import type { HTMLAttributes } from "vue";
import { PanelLeft } from "lucide-vue-next";
import { cn } from "../../../lib/utils";
import { useSidebar } from "./utils";
import Button from "../button/Button.vue";

const props = defineProps<{
  class?: HTMLAttributes["class"];
  variant:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link"
    | null
    | undefined;
}>();

const { toggleSidebar } = useSidebar();
</script>

<template>
  <Button
    data-sidebar="trigger"
    data-slot="sidebar-trigger"
    :variant="variant"
    size="icon"
    :class="cn('h-7 w-7', props.class)"
    @click="toggleSidebar"
  >
    <PanelLeft />
    <span class="sr-only">Toggle Sidebar</span>
  </Button>
</template>
