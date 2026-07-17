import type { ClassFeature } from './feature';

export interface Subclass {
  id: string;
  classId: string;
  name: string;
  description: string;
  features: ClassFeature[];
}
