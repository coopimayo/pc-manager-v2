import type { Spell } from '../../types/spell';

export const faerieFire: Spell = {
  id: 'faerie-fire',
  name: 'Faerie Fire',
  level: 1,
  school: 'evocation',
  castingTime: 'Action',
  range: '60 feet',
  duration: 'Concentration, up to 1 minute',
  concentration: true,
  description:
    'Objects and creatures in a 20-foot Cube are outlined in light. Any attack roll against an affected creature or object has Advantage if the attacker can see it, and the affected target can\'t benefit from the Invisible condition.',
};
