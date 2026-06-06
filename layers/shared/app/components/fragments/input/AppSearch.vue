<script lang="ts" setup>
import { SearchIcon } from "lucide-vue-next";
import Button from "../../ui/button/Button.vue";
import { useAppSearch } from "../../../context/useAppSearch";
import { cn } from "../../../lib/utils";

interface Props {
  placeholder?: string;
  class?: string;
}

const props = defineProps<Props>();
const { toggleOpen } = useAppSearch();

const btnClass = computed(() =>
  cn(
    "bg-muted/25 group text-muted-foreground hover:bg-accent relative h-8 w-full flex-1 justify-start rounded-md text-sm font-normal shadow-none sm:w-40 sm:pe-12 md:flex-none lg:w-52 xl:w-64",
    props.class,
  ),
);
</script>

<template>
  <Button variant="outline" :class="btnClass" @click="toggleOpen">
    <SearchIcon
      aria-hidden="true"
      class="absolute start-1.5 top-1/2 -translate-y-1/2"
      :size="16"
    />
    <kbd
      class="bg-muted group-hover:bg-accent pointer-events-none absolute end-[0.3rem] top-[0.3rem] hidden h-5 items-center gap-1 rounded border px-1.5 font-mono text-[10px] font-medium opacity-100 select-none sm:flex"
    >
      <span class="text-xs">⌘</span>K
    </kbd>
  </Button>
</template>
