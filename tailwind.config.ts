import type { Config } from "tailwindcss";

const config: Config = {
  theme: {
    extend: {
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "slide-from-left": {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(0)" },
        },
        "slide-to-left": {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-100%)" },
        },
        "slide-from-right": {
          "0%": { transform: "translateX(100%)" },
          "100%": { transform: "translateX(0)" },
        },
        "slide-to-right": {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(100%)" },
        },
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "fade-out": {
          from: { opacity: "1" },
          to: { opacity: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "slide-from-left": "slide-from-left 0.3s ease-out",
        "slide-to-left": "slide-to-left 0.3s ease-out",
        "slide-from-right": "slide-from-right 0.3s ease-out",
        "slide-to-right": "slide-to-right 0.3s ease-out",
        "fade-in": "fade-in 0.3s ease-out",
        "fade-out": "fade-out 0.3s ease-out",
      },
    },
  },
  content: [
    "./layers/**/app/*.{vue,js,ts}",

    // components
    "./layers/2-users/app/components/fragment/**/*.{vue,js,ts}",
    "./layers/2-users/app/components/ui/**/*.{vue,js,ts}",
    "./layers/2-users/app/components/providers/**/*.{vue,js,ts}",
    "./layers/2-users/app/components/layouts/**/*.{vue,js,ts}",

    // components shared
    "./layers/shared/app/components/fragment/**/*.{vue,js,ts}",
    "./layers/shared/app/components/ui/**/*.{vue,js,ts}",
    "./layers/shared/app/components/providers/**/*.{vue,js,ts}",
    "./layers/shared/app/components/layouts/**/*.{vue,js,ts}",
  ],
};
export default config;
