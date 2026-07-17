export type Activation =
  | { type: 'action' }
  | { type: 'bonus-action' }
  | { type: 'reaction'; trigger: string }
  | { type: 'free' }
  | { type: 'passive' };
