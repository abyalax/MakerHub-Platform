export const formatDate = (value?: string | Date, options?: Intl.DateTimeFormatOptions) => {
  if (!value) return '-';
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '-';

  const formatOptions: Intl.DateTimeFormatOptions = {
    dateStyle: 'medium',
    ...options,
  };

  return new Intl.DateTimeFormat('id-ID', formatOptions).format(date);
};

export const formatPrice = (value: number | string, withPrefix: boolean = true): string => {
  const number = typeof value === 'string' ? Number.parseFloat(value.replaceAll(/[^0-9.-]+/g, '')) : value;

  if (Number.isNaN(number)) return '';

  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  })
    .format(number)
    .replace(/^Rp/, withPrefix ? 'Rp' : '')
    .trim();
};
