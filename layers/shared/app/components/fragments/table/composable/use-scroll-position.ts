import type { Ref } from 'vue';
import { ref, watch } from 'vue';

export function useScrollPosition(elemenRef: Ref<HTMLElement | null>) {
  const scrollLeft = ref(0);
  const scrollTop = ref(0);

  watch(elemenRef, (el) => {
    if (!el) return;

    let rafId = 0;
    const onScroll = () => {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        scrollLeft.value = el.scrollLeft;
        scrollTop.value = el.scrollTop;
      });
    };

    el.addEventListener('scroll', onScroll, { passive: true });
    scrollLeft.value = el.scrollLeft;
    scrollTop.value = el.scrollTop;

    return () => {
      el.removeEventListener('scroll', onScroll);
    };
  });

  return { scrollLeft, scrollTop };
}
