<script setup lang="ts">
import { computed } from 'vue';
import { Button } from '~/layers/shared/app/components/ui/button';
import { Input } from '~/layers/shared/app/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/layers/shared/app/components/ui/select';
import { Card, CardContent, CardFooter, CardHeader } from '~/layers/shared/app/components/ui/card';
import { Badge } from '~/layers/shared/app/components/ui/badge';
import { Pagination, PaginationContent, PaginationItem, PaginationNext, PaginationPrevious } from '~/layers/shared/app/components/ui/pagination';
import { useTableFilter } from '~/layers/shared/app/composable/table/filters/useTableFilter';
import { useGetProjectPublics } from '../../../composable/useGetProjectPublics';

const { state, queryParams, search, filterRefs, resetFilters } = useTableFilter({
  storeKey: 'TableFilterProjectsPublics',
  filterFields: [{ name: 'featured', type: 'boolean' }, 'category'],
  syncUrl: true,
});

const { data } = useGetProjectPublics(queryParams);

const projects = computed(() => data.value?.data ?? []);
const pagination = computed(() => data.value?.meta);

const featuredModel = computed({
  get: () => {
    if (filterRefs.featured.value === true) return 'true';
    if (filterRefs.featured.value === false) return 'false';
    return 'all';
  },
  set: (value: string) => {
    filterRefs.featured.value = value === 'all' ? null : value === 'true';
  },
});

const totalPages = computed(() => pagination.value?.totalPages ?? 1);
const currentPage = computed(() => pagination.value?.currentPage ?? state.value.page ?? 1);

function goToPage(page: number) {
  if (page < 1 || page > totalPages.value) return;
  state.value.page = page;
}

function formatPrice(price?: number | null, currency = 'IDR') {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(Number(price ?? 0));
}
</script>

<template>
  <section class="container py-10">
    <div class="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div>
        <p class="text-sm font-medium text-primary">Project Marketplace</p>

        <h1 class="mt-2 text-3xl font-bold tracking-tight text-foreground">Explore public projects</h1>

        <p class="mt-2 max-w-2xl text-muted-foreground">Discover free and premium project-based learning content from mentors.</p>
      </div>

      <Button variant="outline" @click="resetFilters"> Reset filters </Button>
    </div>

    <div class="mb-6 grid gap-3 md:grid-cols-[1fr_220px_180px]">
      <Input v-model="search" type="search" placeholder="Search projects..." />

      <Input v-model="filterRefs.category" type="text" placeholder="Category slug" />

      <Select v-model="featuredModel">
        <SelectTrigger class="w-full">
          <SelectValue placeholder="All projects" />
        </SelectTrigger>

        <SelectContent>
          <SelectItem value="all">All projects</SelectItem>
          <SelectItem value="true">Featured</SelectItem>
          <SelectItem value="false">Not featured</SelectItem>
        </SelectContent>
      </Select>
    </div>

    <div v-if="projects.length" class="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
      <Card v-for="project in projects" :key="project.id" class="overflow-hidden pt-0">
        <div class="relative aspect-video bg-muted">
          <img v-if="project.coverUrl" :src="project.coverUrl" :alt="project.title" class="h-full w-full object-cover" />

          <div v-else class="flex h-full w-full items-center justify-center text-sm text-muted-foreground">No cover image</div>

          <div class="absolute left-3 top-3 flex gap-2">
            <Badge variant="secondary">
              {{ project.category?.name ?? 'Uncategorized' }}
            </Badge>

            <Badge :variant="project.accessType === 'PREMIUM' ? 'default' : 'secondary'">
              {{ project.accessType === 'PREMIUM' ? 'Premium' : 'Free' }}
            </Badge>
          </div>
        </div>

        <CardHeader>
          <h2 class="line-clamp-2 text-lg font-semibold tracking-tight">
            {{ project.title }}
          </h2>

          <p class="line-clamp-2 text-sm text-muted-foreground">
            {{ project.summary || 'No summary provided yet.' }}
          </p>
        </CardHeader>

        <CardContent>
          <div class="flex items-center justify-between gap-3 text-sm">
            <div class="min-w-0">
              <p class="truncate font-medium">
                {{ project.mentor.name ?? 'Unknown mentor' }}
              </p>

              <p class="truncate text-muted-foreground">
                {{ project.mentor?.headline ?? 'Mentor' }}
              </p>
            </div>

            <p class="shrink-0 font-semibold">
              {{ project.accessType === 'PREMIUM' ? formatPrice(project.price, project.currency) : 'Free' }}
            </p>
          </div>
        </CardContent>

        <CardFooter>
          <Button as-child class="w-full">
            <NuxtLink :to="`/public/projects/${project.category.slug}/${project.slug}`"> View project </NuxtLink>
          </Button>
        </CardFooter>
      </Card>
    </div>

    <Card v-else class="border-dashed">
      <CardContent class="p-10 text-center">
        <h2 class="text-lg font-semibold">No projects found</h2>

        <p class="mt-2 text-sm text-muted-foreground">Try changing your search keyword or filters.</p>
      </CardContent>
    </Card>

    <div v-if="totalPages > 1" class="mt-8 flex items-center justify-between gap-4">
      <p class="text-sm text-muted-foreground">Page {{ currentPage }} of {{ totalPages }}</p>

      <Pagination :page="currentPage" :total="pagination?.totalItems ?? 0" :items-per-page="pagination?.itemsPerPage ?? 10">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious href="#" :class="{ 'pointer-events-none opacity-50': currentPage <= 1 }" @click.prevent="goToPage(currentPage - 1)" />
          </PaginationItem>

          <PaginationItem v-for="page in totalPages" :key="page">
            <Button :variant="page === currentPage ? 'default' : 'outline'" size="icon" @click="goToPage(page)">
              {{ page }}
            </Button>
          </PaginationItem>

          <PaginationItem>
            <PaginationNext
              href="#"
              :class="{ 'pointer-events-none opacity-50': currentPage >= totalPages }"
              @click.prevent="goToPage(currentPage + 1)"
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  </section>
</template>
