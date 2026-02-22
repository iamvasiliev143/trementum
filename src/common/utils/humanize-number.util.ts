export const round = (value: number, digits = 2) => {
  return Number(value.toFixed(digits));
};

export const humanizeNumber = (value: number) => {
  if (value >= 1_000_000) return round(value / 1_000_000, 1) + 'M';

  if (value >= 1_000) return round(value / 1_000, 1) + 'k';

  return value.toString();
};
