<script lang="ts" setup>
import { Settings } from "lucide-vue-next";
import { useSidebar } from "../../ui/sidebar";
import { useDirection } from "../../../context/useDirection";
import { useLayout } from "../../../context/useLayout";
import Button from "../../ui/button/Button.vue";
import Sheet from "../../ui/sheet/Sheet.vue";
import SheetContent from "../../ui/sheet/SheetContent.vue";
import SheetDescription from "../../ui/sheet/SheetDescription.vue";
import SheetHeader from "../../ui/sheet/SheetHeader.vue";
import SheetTitle from "../../ui/sheet/SheetTitle.vue";
import SheetTrigger from "../../ui/sheet/SheetTrigger.vue";
import SheetFooter from "../../ui/sheet/SheetFooter.vue";
import ConfigTheme from "./ConfigTheme.vue";
import ConfigLayout from "./ConfigLayout.vue";
import ConfigSidebar from "./ConfigSidebar.vue";
import ConfigDirection from "./ConfigDirection.vue";

const { setOpen } = useSidebar();
const { resetLayout } = useLayout();
const { resetDir } = useDirection();

const handleReset = () => {
  setOpen(true);
  resetDir();
  resetLayout();
};
</script>

<template>
  <Sheet>
    <SheetTrigger as-child>
      <Button
        size="icon"
        variant="ghost"
        aria-label="Open theme settings"
        aria-describedby="config-drawer-description"
        class="rounded-full"
      >
        <Settings aria-hidden />
      </Button>
    </SheetTrigger>
    <SheetContent class="flex flex-col">
      <SheetHeader class="pb-0 text-start">
        <SheetTitle>Theme Settings</SheetTitle>
        <SheetDescription id="config-drawer-description">
          Adjust the appearance and layout to suit your preferences.
        </SheetDescription>
      </SheetHeader>
      <div class="space-y-6 overflow-y-auto px-4">
        <ConfigTheme />
        <ConfigSidebar />
        <ConfigLayout />
        <ConfigDirection />
      </div>

      <SheetFooter class="gap-2">
        <Button
          variant="destructive"
          aria-label="Reset all settings to default values"
          @click="handleReset"
        >
          Reset
        </Button>
      </SheetFooter>
    </SheetContent>
  </Sheet>
</template>
