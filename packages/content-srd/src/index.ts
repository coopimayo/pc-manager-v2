import type { ContentPack } from "@pc-manager/engine";
import { backgrounds } from "./backgrounds.js";
import { feats } from "./feats.js";
import { champion, fighter } from "./fighter.js";
import { species } from "./species.js";

/**
 * SRD 5.2 content pack (initial subset — see docs/PLAN.md milestones).
 * Mechanics are paraphrased from the System Reference Document 5.2.
 * TODO(M4): fidelity pass against the published SRD 5.2 document, remaining
 * species (Dragonborn, Gnome, Goliath, Tiefling) and the other 11 classes.
 */
export const srdPack: ContentPack = {
  id: "srd-5.2",
  name: "SRD 5.2 (subset)",
  version: "0.1.0",
  license: {
    name: "CC-BY-4.0",
    attribution:
      "This work includes material from the System Reference Document 5.2 (“SRD 5.2”) by Wizards of the Coast LLC, available at https://www.dndbeyond.com/srd. The SRD 5.2 is licensed under the Creative Commons Attribution 4.0 International License, available at https://creativecommons.org/licenses/by/4.0/legalcode.",
    url: "https://creativecommons.org/licenses/by/4.0/legalcode",
  },
  entities: [...species, ...backgrounds, ...feats, fighter, champion],
};
