import type { Spell } from '../../types/spell';

export const chillTouch: Spell = {
  id: 'chill-touch',
  name: 'Chill Touch',
  level: 0,
  school: 'necromancy',
  castingTime: 'Action',
  range: 'Touch',
  duration: 'Instantaneous',
  concentration: false,
  description:
    'Channeling the chill of the grave, you make a melee spell attack against a target within reach. On a hit, the target takes 1d10 Necrotic damage, and it can\'t regain Hit Points until the start of your next turn. This spell\'s damage increases by 1d10 when you reach levels 5 (2d10), 11 (3d10), and 17 (4d10).',
};
