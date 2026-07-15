/**
 * Zod schemas mirroring the types in types.ts. Content packs (SRD and
 * homebrew alike) must validate against `contentPackSchema`; CI enforces this
 * for every pack in the repo.
 */
import { z } from "zod";
import type { BuildEvent, DecisionPoint, Effect, Predicate } from "./types.js";

export const abilitySchema = z.enum(["str", "dex", "con", "int", "wis", "cha"]);

export const proficiencyRefSchema = z.object({
  type: z.enum(["skill", "savingThrow", "armor", "weapon", "tool", "language"]),
  id: z.string().min(1),
});

export const predicateSchema: z.ZodType<Predicate> = z.lazy(() =>
  z.discriminatedUnion("type", [
    z.object({ type: z.literal("abilityAtLeast"), ability: abilitySchema, value: z.number().int() }),
    z.object({ type: z.literal("hasProficiency"), proficiency: proficiencyRefSchema }),
    z.object({ type: z.literal("classLevelAtLeast"), classId: z.string().min(1), level: z.number().int().min(1) }),
    z.object({ type: z.literal("characterLevelAtLeast"), level: z.number().int().min(1) }),
    z.object({ type: z.literal("all"), predicates: z.array(predicateSchema) }),
    z.object({ type: z.literal("any"), predicates: z.array(predicateSchema) }),
  ]),
);

const featCategorySchema = z.enum(["origin", "general", "fighting-style", "epic-boon"]);

export const featureSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  text: z.string(),
  effects: z.array(z.lazy(() => effectSchema)).optional(),
});

export const effectSchema: z.ZodType<Effect> = z.lazy(() =>
  z.discriminatedUnion("kind", [
    z.object({
      kind: z.literal("abilityIncrease"),
      ability: abilitySchema,
      amount: z.number().int(),
      max: z.number().int().optional(),
    }),
    z.object({ kind: z.literal("grantProficiency"), proficiency: proficiencyRefSchema }),
    z.object({ kind: z.literal("grantFeature"), feature: featureSchema }),
    z.object({ kind: z.literal("grantFeat"), featId: z.string().min(1) }),
    z.object({ kind: z.literal("setStat"), stat: z.string().min(1), value: z.string().min(1) }),
    z.object({ kind: z.literal("modifyStat"), stat: z.string().min(1), delta: z.string().min(1) }),
    z.object({ kind: z.literal("grantDecision"), decision: decisionPointSchema }),
  ]),
);

const decisionOptionSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  effects: z.array(effectSchema),
});

const optionSourceSchema = z.union([
  z.object({ source: z.literal("list"), options: z.array(decisionOptionSchema).min(1) }),
  z.object({
    source: z.literal("query"),
    entityType: z.enum(["species", "subspecies", "subclass", "feat", "background"]),
    filter: z
      .object({
        speciesId: z.string().optional(),
        classId: z.string().optional(),
        category: featCategorySchema.optional(),
      })
      .optional(),
  }),
]);

export const decisionPointSchema: z.ZodType<DecisionPoint> = z.lazy(() =>
  z.object({
    id: z.string().min(1),
    prompt: z.string().min(1),
    count: z.number().int().min(1),
    allowDuplicates: z.boolean().optional(),
    maxPerOption: z.number().int().min(1).optional(),
    options: optionSourceSchema,
  }),
) as z.ZodType<DecisionPoint>;

const entityBase = {
  id: z.string().min(1),
  name: z.string().min(1),
  description: z.string().optional(),
};

const classLevelEntrySchema = z.object({ effects: z.array(effectSchema) });

const levelsSchema = z
  .record(z.string().regex(/^([1-9]|1[0-9]|20)$/), classLevelEntrySchema)
  .transform((r) => r as Partial<Record<number, { effects: Effect[] }>>);

export const entitySchema = z.discriminatedUnion("type", [
  z.object({ ...entityBase, type: z.literal("species"), effects: z.array(effectSchema) }),
  z.object({
    ...entityBase,
    type: z.literal("subspecies"),
    speciesId: z.string().min(1),
    effects: z.array(effectSchema),
  }),
  z.object({
    ...entityBase,
    type: z.literal("class"),
    hitDie: z.union([z.literal(6), z.literal(8), z.literal(10), z.literal(12)]),
    primaryAbilities: z.array(abilitySchema).min(1),
    multiclassPrerequisite: predicateSchema.optional(),
    levels: levelsSchema,
  }),
  z.object({
    ...entityBase,
    type: z.literal("subclass"),
    classId: z.string().min(1),
    levels: levelsSchema,
  }),
  z.object({
    ...entityBase,
    type: z.literal("feat"),
    category: featCategorySchema,
    prerequisite: predicateSchema.optional(),
    repeatable: z.boolean().optional(),
    effects: z.array(effectSchema),
  }),
  z.object({ ...entityBase, type: z.literal("background"), effects: z.array(effectSchema) }),
]);

// ---------------------------------------------------------------------------
// Build log — a character *is* its build log; import validates against this.
// ---------------------------------------------------------------------------

export const abilityScoresSchema = z.object({
  str: z.number().int(),
  dex: z.number().int(),
  con: z.number().int(),
  int: z.number().int(),
  wis: z.number().int(),
  cha: z.number().int(),
});

export const buildEventSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("characterCreated"),
    name: z.string().min(1),
    packIds: z.array(z.string().min(1)),
  }),
  z.object({
    type: z.literal("abilityScoresSet"),
    method: z.enum(["standardArray", "pointBuy", "manual"]),
    scores: abilityScoresSchema,
  }),
  z.object({
    type: z.literal("classLevelTaken"),
    classId: z.string().min(1),
    hpRoll: z.number().int().min(1).optional(),
  }),
  z.object({
    type: z.literal("decisionResolved"),
    decisionId: z.string().min(1),
    optionIds: z.array(z.string().min(1)),
  }),
]);

// Compile-time guarantee the schema stays in lockstep with the BuildEvent union:
// if either drifts, one of these assignments fails to type-check.
const _buildEventOut: BuildEvent = {} as z.infer<typeof buildEventSchema>;
const _buildEventIn: z.infer<typeof buildEventSchema> = {} as BuildEvent;
void _buildEventOut;
void _buildEventIn;

export const contentPackSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  version: z.string().min(1),
  license: z.object({
    name: z.string().min(1),
    attribution: z.string().optional(),
    url: z.string().optional(),
  }),
  entities: z.array(entitySchema),
});
