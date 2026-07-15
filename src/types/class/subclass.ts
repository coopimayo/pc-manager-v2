/** A subclass (Champion, Evoker, …), belonging to exactly one Class. */
export interface Subclass {
  id: string;
  /** id of the Class this subclass belongs to. */
  classId: string;
  name: string;
  description: string;
  // TODO: features granted at each subclass level.
}
