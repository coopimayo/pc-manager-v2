import type { Ability, Skill } from './common';
import type { EquipmentOption, ArtisanTools } from './item';


export interface Background {
  id: string;
  name: string;
  description: string;
  abilityScores: Ability[];
  featId: string;
  skillProficiencies: Skill[];
  toolProficiency: ArtisanTools['name'] | 'None';
  equipmentOptions: EquipmentOption[];
}
