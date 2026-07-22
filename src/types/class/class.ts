import type { Ability, Die, Skill, Choice } from '../common';
import type { EquipmentPackage, Weapon, Tool, Armor } from '../item';
import type { ClassFeature } from './feature';
import type { ClassSpellcasting } from './spellcasting';

export interface Class {
  id: string;
  name: string;
  description: string;
  hitDie: Die;
  primaryAbility: Ability[];
  savingThrowProficiencies: Ability[];
  skillProficiencies: Choice<Skill>;
  weaponProficiencies: Weapon['name'][];
  toolProficiencies: Tool['name'][];
  armorProficiencies: Armor['name'][];
  startingEquipment: Choice<EquipmentPackage>;
  features: ClassFeature[];
  spellcasting?: ClassSpellcasting;
}
