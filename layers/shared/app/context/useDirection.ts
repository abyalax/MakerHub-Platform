import { getCookie, removeCookie, setCookie } from '../lib/cookies';
import { createContext } from '../utils/createContext';
import { onMounted, type Ref, ref, onUnmounted } from 'vue';

export type Direction = 'ltr' | 'rtl';

const DEFAULT_DIRECTION = 'ltr';
const DIRECTION_COOKIE_NAME = 'dir';
const DIRECTION_COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 year

type DirectionContextType = {
  defaultDir: Direction;
  dir: Ref<Direction>;
  setDir: (dir: Direction) => void;
  resetDir: () => void;
};

const [useDirection, provideContext] = createContext<DirectionContextType>('Direction');

function setupDirectionProvider() {
  const initDirection = (getCookie(DIRECTION_COOKIE_NAME) as Direction) || DEFAULT_DIRECTION;
  const dir = ref<Direction>(initDirection);

  const setDir = (params: Direction) => {
    dir.value = params;
    setCookie(DIRECTION_COOKIE_NAME, params, DIRECTION_COOKIE_MAX_AGE);
  };

  const resetDir = () => {
    dir.value = DEFAULT_DIRECTION;
    removeCookie(DIRECTION_COOKIE_NAME);
  };

  onMounted(() => {
    const htmlElement = document.documentElement;
    htmlElement.setAttribute('dir', dir.value);
  });

  onUnmounted(() => {
    const htmlElement = document.documentElement;
    htmlElement.removeAttribute('dir');
  });

  const context: DirectionContextType = {
    dir: dir,
    setDir,
    defaultDir: DEFAULT_DIRECTION,
    resetDir,
  };

  return provideContext(context);
}

export { useDirection, setupDirectionProvider };
