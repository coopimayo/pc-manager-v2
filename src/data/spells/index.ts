import type { Spell } from '../../types/spell';
import { dancingLights } from './dancing-lights';
import { darkness } from './darkness';
import { detectMagic } from './detect-magic';
import { druidcraft } from './druidcraft';
import { faerieFire } from './faerie-fire';
import { longstrider } from './longstrider';
import { mistyStep } from './misty-step';
import { passWithoutTrace } from './pass-without-trace';
import { prestidigitation } from './prestidigitation';

export {
  dancingLights,
  darkness,
  detectMagic,
  druidcraft,
  faerieFire,
  longstrider,
  mistyStep,
  passWithoutTrace,
  prestidigitation,
};

export const spells: Spell[] = [
  dancingLights,
  druidcraft,
  prestidigitation,
  detectMagic,
  faerieFire,
  longstrider,
  darkness,
  mistyStep,
  passWithoutTrace,
];
