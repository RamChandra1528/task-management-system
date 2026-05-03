export function optionalRef(value) {
  return value === "" || value === undefined ? null : value;
}

export function optionalArray(value) {
  return Array.isArray(value) ? value.filter(Boolean) : [];
}

export function clampPercent(value) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) {
    return 0;
  }
  return Math.min(100, Math.max(0, numeric));
}
