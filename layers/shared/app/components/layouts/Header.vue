<script lang="ts" setup>
import { cn } from "../../lib/utils";
import SidebarTrigger from "../ui/sidebar/SidebarTrigger.vue";
import Separator from "../ui/separator/Separator.vue";

interface HeaderProps {
  fixed?: boolean;
  class?: string;
}

defineProps<HeaderProps>();

const offset = ref(0);
const onScroll = () => {
  offset.value = document.body.scrollTop || document.documentElement.scrollTop;
};

onMounted(() => {
  document.addEventListener("scroll", onScroll, { passive: true });
});

onUnmounted(() => {
  document.removeEventListener("scroll", onScroll);
});
</script>

<template>
  <header
    :class="
      cn(
        'z-50 h-12',
        fixed && 'header-fixed peer/header sticky top-0 w-[inherit]',
        offset > 10 && fixed ? 'shadow' : 'shadow-none',
      )
    "
  >
    <div
      :class="
        cn(
          'relative flex h-full items-center gap-3 px-4 py-2 sm:gap-4',
          offset > 10 &&
            fixed &&
            'after:bg-background/20 after:absolute after:inset-0 after:-z-10 after:backdrop-blur-lg',
        )
      "
    >
      <SidebarTrigger variant="outline" class="max-md:scale-125" />
      <Separator orientation="vertical" class="h-4" />
      <slot />
    </div>
  </header>
</template>
