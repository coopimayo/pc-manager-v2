import type { Spell } from '../../types/spell';
import { chillTouch } from './chill-touch';
import { dancingLights } from './dancing-lights';
import { darkness } from './darkness';
import { detectMagic } from './detect-magic';
import { druidcraft } from './druidcraft';
import { faerieFire } from './faerie-fire';
import { falseLife } from './false-life';
import { fireBolt } from './fire-bolt';
import { hellishRebuke } from './hellish-rebuke';
import { holdPerson } from './hold-person';
import { light } from './light';
import { longstrider } from './longstrider';
import { mending } from './mending';
import { minorIllusion } from './minor-illusion';
import { mistyStep } from './misty-step';
import { passWithoutTrace } from './pass-without-trace';
import { poisonSpray } from './poison-spray';
import { prestidigitation } from './prestidigitation';
import { rayOfEnfeeblement } from './ray-of-enfeeblement';
import { rayOfSickness } from './ray-of-sickness';
import { speakWithAnimals } from './speak-with-animals';
import { thaumaturgy } from './thaumaturgy';

export {
  chillTouch,
  dancingLights,
  darkness,
  detectMagic,
  druidcraft,
  faerieFire,
  falseLife,
  fireBolt,
  hellishRebuke,
  holdPerson,
  light,
  longstrider,
  mending,
  minorIllusion,
  mistyStep,
  passWithoutTrace,
  poisonSpray,
  prestidigitation,
  rayOfEnfeeblement,
  rayOfSickness,
  speakWithAnimals,
  thaumaturgy,
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
  thaumaturgy,
  poisonSpray,
  chillTouch,
  fireBolt,
  falseLife,
  hellishRebuke,
  holdPerson,
  rayOfSickness,
  rayOfEnfeeblement,
];
