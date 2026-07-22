import type { Species } from '../../../types/species';

export const goliath: Species = {
  id: 'goliath',
  name: 'Goliath',
  description:
    'Goliaths are descendants of giants, and their towering stature and unshakable resolve reflect that mighty lineage. Wherever they roam, they carry a supernatural boon inherited from a particular kind of giant, and at their full height they can loom large over any battlefield.',
  creatureType: 'humanoid',
  size: 'medium',
  speed: 35,
  traits: [
    {
      id: 'goliath-large-form',
      name: 'Large Form',
      description:
        "Starting at character level 5, you can change your size to Large as a Bonus Action if you're in a big enough space. This transformation lasts for 10 minutes or until you end it (no action required). For that duration, you have Advantage on Strength checks, and your Speed increases by 10 feet. Once you use this trait, you can't use it again until you finish a Long Rest.",
      effects: [
        {
          kind: 'grantAbility',
          name: 'Large Form',
          description:
            'Change your size to Large as a Bonus Action for 10 minutes, gaining Advantage on Strength checks and a 10-foot increase to your Speed.',
          activation: { type: 'bonus-action' },
          atLevel: 5,
          uses: { count: 1, recharge: [{ on: 'long-rest', amount: 'all' }] },
        },
      ],
    },
    {
      id: 'goliath-powerful-build',
      name: 'Powerful Build',
      description:
        'You have Advantage on any ability check you make to end the Grappled condition. You also count as one size larger when determining your carrying capacity.',
      effects: [],
    },
  ],
};
