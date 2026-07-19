import type { EquipmentPackage } from '../../types/item';

export { CharacterCreator } from './CharacterCreator';

export function slugify(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function uniqueId(name: string, taken: string[]): string {
  const base = slugify(name) || 'character';
  if (!taken.includes(base)) return base;
  let suffix = 2;
  while (taken.includes(`${base}-${suffix}`)) suffix += 1;
  return `${base}-${suffix}`;
}

export function describePackage(pkg: EquipmentPackage): string {
  return [...pkg.items.map((item) => item.name), `${pkg.gold} gp`].join(', ');
}
