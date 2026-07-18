import type { Class, Subclass } from '../../types/class';
import { champion } from './fighter/champion';
import { fighter } from './fighter/fighter';

export { fighter, champion };

export const classes: Class[] = [fighter];
export const subclasses: Subclass[] = [champion];
