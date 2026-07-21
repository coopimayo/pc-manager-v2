import type { ClassFeature } from './feature';
import type { ClassSpellcasting } from './spellcasting';

export interface Subclass {
  id: string;
  classId: string;
  name: string;
  description: string;
  features: ClassFeature[];
  spellcasting?: ClassSpellcasting;
}
