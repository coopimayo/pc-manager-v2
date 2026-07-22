import type { Ability } from '../common';

export interface SheetTool {
  name: string;
  ability?: Ability;
  modifier?: number;
}
