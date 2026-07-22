import type { Spell } from '../../types/spell';
import { dancingLights } from './dancing-lights';
import { darkness } from './darkness';
import { detectMagic } from './detect-magic';
import { druidcraft } from './druidcraft';
import { faerieFire } from './faerie-fire';
import { light } from './light';
import { longstrider } from './longstrider';
import { mending } from './mending';
import { minorIllusion } from './minor-illusion';
import { mistyStep } from './misty-step';
import { passWithoutTrace } from './pass-without-trace';
import { prestidigitation } from './prestidigitation';
import { speakWithAnimals } from './speak-with-animals';

export {
  dancingLights,
  darkness,
  detectMagic,
  druidcraft,
  faerieFire,
  light,
  longstrider,
  mending,
  minorIllusion,
  mistyStep,
  passWithoutTrace,
  prestidigitation,
  speakWithAnimals,
};

export const spells: Spell[] = [
  dancingLights,
  druidcraft,
  prestidigitation,
  detectMagic,
  faerieFire,
  light,
  longstrider,
  darkness,
  mistyStep,
  passWithoutTrace,
  mending,
  minorIllusion,
  speakWithAnimals,
];
