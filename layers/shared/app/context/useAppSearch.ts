import { onMounted, onUnmounted, ref, type Ref } from 'vue';
import { createContext } from '../utils/createContext';

type SearchContextType = {
  open: Ref<boolean>;
  setOpen: (v: boolean) => void;
  toggleOpen: () => void;
};

const [useAppSearch, provideContext] = createContext<SearchContextType>('Search');

function setupSearchProvider() {
  const open = ref(false);

  const toggleOpen = () => {
    open.value = !open.value;
  };

  const setOpen = (v: boolean) => (open.value = v);

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      toggleOpen();
    }
  };

  onMounted(() => document.addEventListener('keydown', onKeyDown));
  onUnmounted(() => document.removeEventListener('keydown', onKeyDown));

  const context: SearchContextType = { open, toggleOpen, setOpen };

  return provideContext(context);
}

export { useAppSearch, setupSearchProvider };
