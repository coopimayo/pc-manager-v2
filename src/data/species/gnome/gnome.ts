import type { Species } from '../../../types/species';

export const gnome: Species = {
  id: 'gnome',
  name: 'Gnome',
  description:
    'Gnomes are small folk who burn with curiosity and an irrepressible zest for life. Their agile minds delight in invention, illusion, and the secrets of the natural world, and their innate cunning shields them against the magic of others.',
  creatureType: 'humanoid',
  size: 'small',
  speed: 30,
  traits: [
    {
      id: 'gnome-darkvision',
      name: 'Darkvision',
      description:
        'You have Darkvision with a range of 60 feet. In dim light you see as if it were bright light, and in darkness you see as if it were dim light. You discern colors in that darkness only as shades of gray.',
      effects: [{ kind: 'grantSense', sense: 'darkvision', range: 60 }],
    },
    {
      id: 'gnome-gnomish-cunning',
      name: 'Gnomish Cunning',
      description:
        'You have Advantage on Intelligence, Wisdom, and Charisma saving throws.',
      effects: [],
    },
  ],
};
