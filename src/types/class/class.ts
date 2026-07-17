import type { Ability, Die, Skill, Choice } from '../common';
import type { EquipmentPackage, Weapon, ArtisanTools, Armor } from '../item';
import type { ClassFeature } from './feature';

export interface Class {
  id: string;
  name: string;
  description: string;
  hitDie: Die;
  primaryAbility: Ability[];
  savingThrowProficiencies: Ability[];
  skillProficiencies: Choice<Skill>;
  weaponProficiencies: Weapon['name'][];
  toolProficiencies: ArtisanTools['name'][];
  armorProficiencies: Armor['name'][];
  startingEquipment: Choice<EquipmentPackage>;
  features: ClassFeature[];
}
