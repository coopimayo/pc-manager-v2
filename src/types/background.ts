import type { Ability, Skill, Choice } from './common';
import type { EquipmentPackage, ArtisanTools } from './item';


export interface Background {
  id: string;
  name: string;
  description: string;
  abilityScores: Ability[];
  featId: string;
  skillProficiencies: Skill[];
  toolProficiency: ArtisanTools['name'] | 'None';
  startingEquipment: Choice<EquipmentPackage>;
}
