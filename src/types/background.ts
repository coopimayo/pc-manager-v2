import type { Ability, Skill, Choice } from './common';
import type { EquipmentPackage, Tool } from './item';


export interface Background {
  id: string;
  name: string;
  description: string;
  abilityScores: Ability[];
  featId: string;
  skillProficiencies: Skill[];
  toolProficiency: Tool['name'] | 'None';
  startingEquipment: Choice<EquipmentPackage>;
}
