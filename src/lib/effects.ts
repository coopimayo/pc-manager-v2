import type { Effect } from '../types';

export type EffectOfKind<K extends Effect['kind']> = Extract<Effect, { kind: K }>;

export function effectsOfKind<K extends Effect['kind']>(
  effects: Effect[],
  kind: K,
): EffectOfKind<K>[] {
  return effects.filter((effect): effect is EffectOfKind<K> => effect.kind === kind);
}

export function effectOfKind<K extends Effect['kind']>(
  effects: Effect[],
  kind: K,
): EffectOfKind<K> | undefined {
  return effects.find((effect): effect is EffectOfKind<K> => effect.kind === kind);
}
