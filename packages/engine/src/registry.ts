import type {
  ContentPack,
  Entity,
  FeatCategory,
  ValidationFinding,
} from "./types.js";

export interface EntityQuery {
  entityType: Entity["type"];
  filter?: {
    speciesId?: string;
    classId?: string;
    category?: FeatCategory;
  };
}

/** Merged view over the content packs a character opts into. */
export class Registry {
  private byId = new Map<string, Entity>();
  readonly findings: ValidationFinding[] = [];
  readonly attributions: string[] = [];

  constructor(packs: ContentPack[]) {
    for (const pack of packs) {
      if (pack.license.attribution) {
        this.attributions.push(pack.license.attribution);
      }
      for (const entity of pack.entities) {
        if (this.byId.has(entity.id)) {
          this.findings.push({
            severity: "error",
            code: "duplicate-entity-id",
            message: `Entity id "${entity.id}" appears in more than one place (pack "${pack.id}").`,
          });
        }
        this.byId.set(entity.id, entity);
      }
    }
  }

  get(id: string): Entity | undefined {
    return this.byId.get(id);
  }

  getOfType<T extends Entity["type"]>(
    id: string,
    type: T,
  ): Extract<Entity, { type: T }> | undefined {
    const entity = this.byId.get(id);
    if (!entity || entity.type !== type) return undefined;
    return entity as Extract<Entity, { type: T }>;
  }

  query(q: EntityQuery): Entity[] {
    const results: Entity[] = [];
    for (const entity of this.byId.values()) {
      if (entity.type !== q.entityType) continue;
      const f = q.filter;
      if (f?.speciesId && entity.type === "subspecies" && entity.speciesId !== f.speciesId)
        continue;
      if (f?.classId && entity.type === "subclass" && entity.classId !== f.classId) continue;
      if (f?.category && entity.type === "feat" && entity.category !== f.category) continue;
      results.push(entity);
    }
    return results.sort((a, b) => a.id.localeCompare(b.id));
  }
}
