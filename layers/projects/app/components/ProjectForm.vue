<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import type { JSONContent } from '@tiptap/vue-3';
import { toTypedSchema } from '@vee-validate/zod';
import { useForm } from 'vee-validate';
import * as z from 'zod';
import { ContentAccessType } from '~/layers/shared/app/common/enum';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '~/layers/shared/app/components/ui/form';
import { Input } from '~/layers/shared/app/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/layers/shared/app/components/ui/select';
import type { CreateProjectPayload } from '../../types';
import ProjectContentEditor from './ProjectContentEditor.vue';

const emptyDocument = (): JSONContent => ({
  type: 'doc',
  content: [{ type: 'paragraph' }],
});

const projectSchema = toTypedSchema(
  z.object({
    title: z.string().trim().min(1, 'Title is required').max(255, 'Title must be at most 255 characters'),
    slug: z.string().trim().max(280, 'Slug must be at most 280 characters').optional(),
    summary: z.string().trim().max(500, 'Summary must be at most 500 characters').optional(),
    description: z.string().trim().min(1, 'Project scope is required'),
    contentJson: z.custom<JSONContent>(),
    accessType: z.enum(ContentAccessType),
    price: z.coerce.number().min(0, 'Price cannot be negative'),
    currency: z.string().trim().length(3, 'Currency must use a 3-letter code'),
  })
);

const contentJson = ref<JSONContent>(emptyDocument());

const form = useForm({
  validationSchema: projectSchema,
  initialValues: {
    title: '',
    slug: '',
    summary: '',
    description: '',
    contentJson: contentJson.value,
    accessType: ContentAccessType.FREE,
    price: 0,
    currency: 'IDR',
  },
});

const disabled = computed(() => form.isSubmitting.value);

watch(
  contentJson,
  (value) => {
    form.setFieldValue('contentJson', value);
  },
  { deep: true }
);

const submit = async (): Promise<CreateProjectPayload | null> => {
  const result = await form.validate();
  if (!result.valid) return null;

  const values = form.values;
  return {
    title: values.title,
    slug: values.slug || undefined,
    summary: values.summary || undefined,
    description: values.description,
    contentJson: values.contentJson,
    accessType: values.accessType,
    price: values.price,
    currency: values.currency || 'IDR',
  };
};

const reset = () => {
  contentJson.value = emptyDocument();
  form.resetForm();
};

defineExpose({
  submit,
  reset,
});
</script>

<template>
  <form class="space-y-6" @submit.prevent>
    <div class="grid gap-4 lg:grid-cols-[minmax(0,1fr)_18rem]">
      <div class="space-y-4">
        <FormField v-slot="{ componentField }" name="title">
          <FormItem>
            <FormLabel>Title</FormLabel>
            <FormControl>
              <Input v-bind="componentField" :disabled="disabled" placeholder="Build a distributed task queue" />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>

        <FormField v-slot="{ componentField }" name="summary">
          <FormItem>
            <FormLabel>Summary</FormLabel>
            <FormControl>
              <textarea
                v-bind="componentField"
                :disabled="disabled"
                rows="3"
                class="border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 min-h-20 w-full rounded-md border bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Short catalog summary shown before learners open the project"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>
      </div>

      <div class="space-y-4">
        <FormField v-slot="{ componentField }" name="slug">
          <FormItem>
            <FormLabel>Slug</FormLabel>
            <FormControl>
              <Input v-bind="componentField" :disabled="disabled" placeholder="auto-generated" />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>

        <FormField v-slot="{ componentField }" name="accessType">
          <FormItem>
            <FormLabel>Access</FormLabel>
            <Select v-bind="componentField" :disabled="disabled">
              <FormControl>
                <SelectTrigger class="w-full">
                  <SelectValue placeholder="Select access" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem :value="ContentAccessType.FREE">Free</SelectItem>
                <SelectItem :value="ContentAccessType.PREMIUM">Premium</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        </FormField>

        <div class="grid grid-cols-[minmax(0,1fr)_5rem] gap-3">
          <FormField v-slot="{ componentField }" name="price">
            <FormItem>
              <FormLabel>Price</FormLabel>
              <FormControl>
                <Input v-bind="componentField" :disabled="disabled" type="number" min="0" step="1000" />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>

          <FormField v-slot="{ componentField }" name="currency">
            <FormItem>
              <FormLabel>Currency</FormLabel>
              <FormControl>
                <Input v-bind="componentField" :disabled="disabled" maxlength="3" />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>
        </div>
      </div>
    </div>

    <FormField name="description">
      <FormItem>
        <FormLabel>Project scope</FormLabel>
        <FormControl>
          <ProjectContentEditor
            v-model="contentJson"
            :disabled="disabled"
            @text-change="(value) => form.setFieldValue('description', value)"
            @upload-error="(message) => form.setFieldError('description', message)"
          />
        </FormControl>
        <FormMessage />
      </FormItem>
    </FormField>
  </form>
</template>
