import type { Ability, Die, Skill } from '../common';
import type { EquipmentOption, Weapon, ArtisanTools, Armor } from '../item';
import type { ClassFeature } from './feature';

export interface Class {
  id: string;
  name: string;
  description: string;
  hitDie: Die;
  primaryAbility: Ability[];
  savingThrowProficiencies: Ability[];
  skillProficiencies: Skill[];
  weaponProficiencies: Weapon['name'][];
  toolProficiencies: ArtisanTools['name'][];
  armorProficiencies: Armor['name'][];
  startingEquipment: EquipmentOption[];
  features: ClassFeature[];
}
