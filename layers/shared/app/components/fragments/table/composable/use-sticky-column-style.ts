import type { Header } from '@tanstack/vue-table';
import type { CSSProperties } from 'vue';
import { useTheme } from '~/layers/shared/app/composable/useTheme';

/**
 * HOOK Style for BODY CELL (sticky horizontal - freeze columns)
 */
export const useCreateStickyColumnStyle = <TData, TValue>(freezeIds: string[]) => {
  const { theme } = useTheme();

  const createStyle = (header: Header<TData, TValue>, scrollLeft: number, isSelectedRow?: boolean): CSSProperties | undefined => {
    const id = header.column.id;
    if (!freezeIds.includes(id)) return undefined;

    const headerGroup = header.headerGroup.headers;
    const orderedFreeze = headerGroup.filter((h) => freezeIds.includes(h.column.id)).map((h) => h.column.id);

    const left = header.getStart();
    const isLastFrozen = orderedFreeze[orderedFreeze.length - 1] === id;
    const stuck = scrollLeft > left - 1;
    const width = header.getSize();

    const common: CSSProperties = {
      width,
      minWidth: width,
      maxWidth: width,
      position: 'sticky',
      left: stuck ? left : 0,
      zIndex: 30,
      backgroundColor: stuck ? (isSelectedRow ? 'var(--accent)' : 'var(--background)') : isSelectedRow ? 'var(--accent)' : 'var(--background)',
      boxSizing: 'border-box',
      transform: 'translateZ(0)',
      transition: 'left 0.2s linear',
    };

    if (isLastFrozen && stuck) {
      return {
        ...common,
        zIndex: 40,
        ['--sticky-shadow']: theme.value === 'dark' ? 'rgba(0,0,0,0.28)' : 'rgba(0,0,0,0.10)',
      } as CSSProperties;
    }

    return common;
  };

  return createStyle;
};
