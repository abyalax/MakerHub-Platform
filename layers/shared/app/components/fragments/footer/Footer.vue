<script setup lang="ts">
import Instagram from '../../../assets/icon/Instagram.vue';
import Github from '../../../assets/icon/Github.vue';
import Twitter from '../../../assets/icon/Twitter.vue';
import Linkedin from '../../../assets/icon/Linkedin.vue';

const currentYear = new Date().getFullYear();

const socials = [
  { name: 'GitHub', icon: Github, href: 'https://github.com' },
  { name: 'Twitter', icon: Twitter, href: 'https://twitter.com' },
  { name: 'Instagram', icon: Instagram, href: 'https://instagram.com' },
  { name: 'LinkedIn', icon: Linkedin, href: 'https://linkedin.com' },
];
</script>

<template>
  <footer class="w-full border-t bg-background text-muted-foreground transition-colors duration-300">
    <div class="container mx-auto flex flex-col items-center justify-between gap-4 py-6 md:h-16 md:flex-row md:py-0">
      <p class="text-sm text-center md:text-left leading-loose">&copy; {{ currentYear }} Acme Inc. All rights reserved.</p>

      <div class="flex items-center space-x-4">
        <a
          v-for="social in socials"
          :key="social.name"
          :href="social.href"
          target="_blank"
          rel="noreferrer"
          class="rounded-md p-2 hover:bg-accent hover:text-accent-foreground transition-colors"
          :aria-label="social.name"
        >
          <component :is="social.icon" class="h-5 w-5" />
        </a>
      </div>
    </div>
  </footer>
</template>
