import { buildEventSchema } from "@pc-manager/engine";
import { z } from "zod";
import { type Character, CURRENT_FORMAT_VERSION } from "./character";

/**
 * The JSON export/import boundary. A `.json` export is exactly a `Character`;
 * import parses untrusted text, migrates it up to the current format, and
 * validates it against the same schemas the engine uses for build events.
 * Nothing derived is ever serialized — the build log is the whole character.
 */
const characterFileSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  packIds: z.array(z.string().min(1)).min(1),
  buildLog: z.array(buildEventSchema).min(1),
  createdAt: z.string().min(1),
  updatedAt: z.string().min(1),
  formatVersion: z.number().int().min(1),
});

export type ImportResult =
  | { ok: true; character: Character }
  | { ok: false; error: string };

/** Pretty-printed so hand-inspecting or diffing an exported file is pleasant. */
export function serializeCharacter(character: Character): string {
  return JSON.stringify(character, null, 2);
}

// ---------------------------------------------------------------------------
// Format migration
// ---------------------------------------------------------------------------

type Migration = (data: Record<string, unknown>) => Record<string, unknown>;

/**
 * `migrations[v]` upgrades a file of `formatVersion` v to v+1. Empty for now
 * (v1 is the first format); every future change to the file shape or the
 * BuildEvent union bumps CURRENT_FORMAT_VERSION and registers a step here.
 */
const migrations: Record<number, Migration> = {};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function migrate(data: unknown): unknown {
  if (!isRecord(data)) return data; // schema validation will reject it
  let current = data;
  while (typeof current.formatVersion === "number" && current.formatVersion < CURRENT_FORMAT_VERSION) {
    const step = migrations[current.formatVersion];
    if (!step) break; // no path forward; validation surfaces the mismatch
    current = step(current);
  }
  return current;
}

function describeError(error: z.ZodError): string {
  return error.issues
    .map((issue) => {
      const path = issue.path.length > 0 ? issue.path.join(".") : "(root)";
      return `${path}: ${issue.message}`;
    })
    .join("; ");
}

/**
 * Parse an exported character file. Returns a friendly error string rather than
 * throwing so the UI can show it directly.
 */
export function parseCharacterFile(json: string): ImportResult {
  let data: unknown;
  try {
    data = JSON.parse(json);
  } catch (e) {
    return { ok: false, error: `File is not valid JSON: ${(e as Error).message}` };
  }

  if (isRecord(data) && typeof data.formatVersion === "number" && data.formatVersion > CURRENT_FORMAT_VERSION) {
    return {
      ok: false,
      error: `This file uses format version ${data.formatVersion}, but this app supports up to ${CURRENT_FORMAT_VERSION}. Update the app to import it.`,
    };
  }

  const migrated = migrate(data);
  const parsed = characterFileSchema.safeParse(migrated);
  if (!parsed.success) {
    return { ok: false, error: `File is not a valid character: ${describeError(parsed.error)}` };
  }
  // The return type's `character: Character` enforces at compile time that the
  // schema's inferred shape stays assignable to Character — a free sync check.
  return { ok: true, character: parsed.data };
}
