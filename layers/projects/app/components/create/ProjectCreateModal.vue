<script setup lang="ts">
import { ref, watch } from 'vue';
import { Loader2 } from 'lucide-vue-next';
import { Button } from '~/layers/shared/app/components/ui/button';
import { Dialog, DialogFooter, DialogHeader, DialogScrollContent, DialogTitle } from '~/layers/shared/app/components/ui/dialog';
import { useCreateProject } from '../../composable/useCreateProjects';
import ProjectForm from '../ProjectForm.vue';

const open = defineModel<boolean>('open', { default: false });
const emit = defineEmits<{
  created: [];
}>();

const itemFormRef = ref<InstanceType<typeof ProjectForm> | null>(null);
const { mutateAsync: createProject, isPending } = useCreateProject();

const handleOpenChange = (value: boolean) => {
  if (isPending.value) return;
  open.value = value;
};

const submit = async () => {
  const payload = await itemFormRef.value?.submit();
  if (!payload) return;

  await createProject(payload);
  itemFormRef.value?.reset();
  open.value = false;
  emit('created');
};

watch(open, (value) => {
  if (!value) itemFormRef.value?.reset();
});
</script>

<template>
  <Dialog :open="open" @update:open="handleOpenChange">
    <DialogScrollContent
      class="m-0! w-[calc(100vw-1rem)]! max-w-none! rounded-none! border-0! p-4! sm:m-8! sm:w-[calc(100vw-4rem)]! sm:max-w-5xl! sm:rounded-lg! sm:p-6! lg:w-full! lg:max-w-7xl!"
    >
      <DialogHeader>
        <DialogTitle>Create Projects</DialogTitle>
      </DialogHeader>

      <div class="space-y-6">
        <div class="border-t pt-6">
          <ProjectForm ref="itemFormRef" />
        </div>
      </div>

      <DialogFooter class="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end sm:gap-3">
        <Button type="button" variant="outline" class="w-full sm:w-auto" :disabled="isPending" @click="handleOpenChange(false)">
          Cancel
        </Button>
        <Button type="button" class="w-full sm:w-auto" data-testid="submit-projects" :disabled="isPending" @click="submit">
          <Loader2 v-if="isPending" class="size-4 animate-spin" />
          {{ isPending ? 'Submitting...' : 'Submit Project' }}
        </Button>
      </DialogFooter>
    </DialogScrollContent>
  </Dialog>
</template>
