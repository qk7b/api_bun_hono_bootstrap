function toNumber(value: string | undefined): number | undefined {
  if (!value) return undefined;
  const num = Number(value);
  if (isNaN(num)) return undefined;
  return num;
}

export { toNumber };
