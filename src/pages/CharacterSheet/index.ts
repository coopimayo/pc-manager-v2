import { classes, subclasses } from '../../data/classes';
import type { Character } from '../../types';
import type { ClassFeature } from '../../types/class';
import type { Uses } from '../../types/effect';
import type { SheetAttack } from '../../types/sheet';

export { CharacterSheet } from './CharacterSheet';

export function featuresGained(before: Character, after: Character): ClassFeature[] {
  const primary = after.classes[0];
  const previous = before.classes[0];
  if (!primary || !previous) return [];
  const definition = classes.find((entry) => entry.id === primary.classId);
  const subclass = primary.subclassId
    ? subclasses.find((entry) => entry.id === primary.subclassId)
    : undefined;
  return [...(definition?.features ?? []), ...(subclass?.features ?? [])].filter(
    (feature) => feature.level > previous.level && feature.level <= primary.level,
  );
}

export function describeDamage(damage: SheetAttack['damage']): string {
  const dice = `${damage.count}${damage.die}`;
  const modifier =
    damage.modifier === 0 ? '' : damage.modifier > 0 ? ` + ${damage.modifier}` : ` − ${-damage.modifier}`;
  return `${dice}${modifier} ${damage.type}`;
}

export function describeRecharge(uses: Uses): string {
  const rules = uses.recharge
    .map((rule) => `${rule.amount === 'all' ? 'all' : rule.amount} on a ${rule.on.replace('-', ' ')}`)
    .join(', ');
  return `Regains ${rules}`;
}
