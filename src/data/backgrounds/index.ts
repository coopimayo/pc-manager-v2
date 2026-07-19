import type { Background } from '../../types';
import { charlatan } from './charlatan';
import { criminal } from './criminal';
import { entertainer } from './entertainer';
import { farmer } from './farmer';
import { guard } from './guard';
import { merchant } from './merchant';
import { noble } from './noble';
import { sailor } from './sailor';
import { scribe } from './scribe';
import { soldier } from './soldier';
import { wayfarer } from './wayfarer';

export { charlatan, criminal, entertainer, farmer, guard, merchant, noble, sailor, scribe, soldier, wayfarer };

export const backgrounds: Background[] = [
  charlatan,
  criminal,
  entertainer,
  farmer,
  guard,
  merchant,
  noble,
  sailor,
  scribe,
  soldier,
  wayfarer,
];
