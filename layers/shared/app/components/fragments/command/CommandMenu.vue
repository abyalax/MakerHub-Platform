<script lang="ts" setup>
import ScrollArea from "../../ui/scroll-area/ScrollArea.vue";
import CommandDialog from "../../ui/command/CommandDialog.vue";
import CommandEmpty from "../../ui/command/CommandEmpty.vue";
import CommandGroup from "../../ui/command/CommandGroup.vue";
import CommandInput from "../../ui/command/CommandInput.vue";
import CommandItem from "../../ui/command/CommandItem.vue";
import CommandList from "../../ui/command/CommandList.vue";
import CommandSeparator from "../../ui/command/CommandSeparator.vue";

import { useAppSearch } from "../../../context/useAppSearch";
import { sidebarItems, type MenuItem } from "../sidebar";
import { ArrowRight, ChevronRight, Laptop, Moon, Sun } from "lucide-vue-next";
import Badge from "../../ui/badge/Badge.vue";
import { useTheme } from "../../../composable/useTheme";

const { push } = useRouter();
const { open, setOpen } = useAppSearch();
const { setTheme } = useTheme();
const navigations = sidebarItems();

const runCommand = (command: VoidFunction) => {
  setOpen(false);
  command();
};

const hasSubmenu = (item: MenuItem) => item.submenu && item.submenu.length > 0;
</script>

<template>
  <CommandDialog v-model:open="open" modal>
    <CommandInput placeholder="Type a command or search..." />
    <CommandList>
      <ScrollArea type="hover" class="h-72 pe-1">
        <CommandEmpty>No Result found.</CommandEmpty>

        <CommandGroup
          v-for="group in navigations"
          :key="group.group"
          :heading="group.group"
        >
          <template v-for="navItem in group.items" :key="navItem.title">
            <template v-if="hasSubmenu(navItem)">
              <CommandItem
                v-for="(subItem, i) in navItem.submenu"
                :key="`${navItem.title}-${subItem.title}-${i}`"
                :value="`${navItem.title} ${subItem.title}`"
                @select="runCommand(() => push(subItem.url))"
              >
                <div class="mr-2 flex size-4 items-center justify-center">
                  <ArrowRight class="text-muted-foreground/80 size-2" />
                </div>
                <span>{{ navItem.title }}</span>
                <ChevronRight class="mx-2 size-3 text-muted-foreground/50" />
                <span>{{ subItem.title }}</span>
              </CommandItem>
            </template>

            <CommandItem
              v-else
              :key="navItem.title"
              :value="navItem.title"
              @select="runCommand(() => push(navItem.url))"
            >
              <div class="mr-2 flex size-4 items-center justify-center">
                <component
                  :is="navItem.icon"
                  v-if="navItem.icon"
                  class="size-4"
                />
                <ArrowRight v-else class="size-2 text-muted-foreground/80" />
              </div>
              <span>{{ navItem.title }}</span>
              <Badge
                v-if="navItem.badge"
                :variant="navItem.badge.variant"
                class="ml-auto text-[10px] px-1 h-4"
              >
                {{ navItem.badge.count }}
              </Badge>
            </CommandItem>
          </template>
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Theme">
          <CommandItem
            value="light"
            @select="runCommand(() => setTheme('light'))"
          >
            <Sun /> <span>Light</span>
          </CommandItem>
          <CommandItem
            value="dark"
            @select="runCommand(() => setTheme('dark'))"
          >
            <Moon class="scale-90" /> <span>Dark</span>
          </CommandItem>
          <CommandItem
            value="system"
            @select="runCommand(() => setTheme('system'))"
          >
            <Laptop /> <span>System</span>
          </CommandItem>
        </CommandGroup>
      </ScrollArea>
    </CommandList>
  </CommandDialog>
</template>
