import { createContext } from "../utils/createContext";
import { getCookie, setCookie } from "../lib/cookies";
import { ref, type Ref } from "vue";

export type Collapsible = "offcanvas" | "icon" | "none";
export type Variant = "inset" | "sidebar" | "floating";

const LAYOUT_COLLAPSIBLE_COOKIE_NAME = "layout_collapsible";
const LAYOUT_VARIANT_COOKIE_NAME = "layout_variant";
const LAYOUT_COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

const DEFAULT_VARIANT = "inset";
const DEFAULT_COLLAPSIBLE = "icon";

type LayoutContextType = {
  resetLayout: () => void;

  defaultCollapsible: Collapsible;
  collapsible: Ref<Collapsible>;
  setCollapsible: (collapsible: Collapsible) => void;

  defaultVariant: Variant;
  variant: Ref<Variant>;
  setVariant: (variant: Variant) => void;
};

const [useLayout, provideContext] = createContext<LayoutContextType>("Layout");

function setupLayoutProvider() {
  const initVariant =
    (getCookie(LAYOUT_VARIANT_COOKIE_NAME) as Variant) || DEFAULT_VARIANT;
  const initCollapsible =
    (getCookie(LAYOUT_COLLAPSIBLE_COOKIE_NAME) as Collapsible) ||
    DEFAULT_COLLAPSIBLE;

  const variant = ref<Variant>(initVariant);
  const collapsible = ref<Collapsible>(initCollapsible);

  const setVariant = (newVariant: Variant) => {
    variant.value = newVariant;
    setCookie(LAYOUT_VARIANT_COOKIE_NAME, newVariant, LAYOUT_COOKIE_MAX_AGE);
  };

  const setCollapsible = (newCollapsible: Collapsible) => {
    collapsible.value = newCollapsible;
    setCookie(
      LAYOUT_COLLAPSIBLE_COOKIE_NAME,
      newCollapsible,
      LAYOUT_COOKIE_MAX_AGE,
    );
  };

  const resetLayout = () => {
    setCollapsible(DEFAULT_COLLAPSIBLE);
    setVariant(DEFAULT_VARIANT);
  };

  const contextValue: LayoutContextType = {
    variant,
    collapsible,
    setVariant,
    setCollapsible,
    resetLayout,
    defaultCollapsible: DEFAULT_COLLAPSIBLE,
    defaultVariant: DEFAULT_VARIANT,
  };

  return provideContext(contextValue);
}

export { useLayout, setupLayoutProvider };
