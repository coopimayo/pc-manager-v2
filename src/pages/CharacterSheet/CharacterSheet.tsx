import { useState } from 'react';

import { FeatChoiceDialog } from '../../components/FeatChoiceDialog';
import { SubclassChoiceDialog } from '../../components/SubclassChoiceDialog';
import { SubspeciesChoiceDialog } from '../../components/SubspeciesChoiceDialog';
import { backgrounds } from '../../data/backgrounds';
import { classes, subclasses } from '../../data/classes';
import { feats } from '../../data/feats';
import { tools, weapons } from '../../data/items';
import { species, subspecies } from '../../data/species';
import { spells } from '../../data/spells';
import { derive, grantedFeatCategory, grantedSpellIds, grantsSubclass } from '../../lib/derive';
import { signed, titleCase } from '../../lib/format';
import type { Ability, Character, Skill } from '../../types';
import type { ClassFeature } from '../../types/class';
import type { Activation } from '../../types/effect';
import type { SheetAbility } from '../../types/sheet';
import { describeDamage, describeRecharge, featuresGained } from './index';
import styles from './CharacterSheet.module.css';

const abilityOrder: Ability[] = ['str', 'dex', 'con', 'int', 'wis', 'cha'];

const activationLabels: Record<Activation['type'], string> = {
  'action': 'Action',
  'bonus-action': 'Bonus Action',
  'reaction': 'Reaction',
  'free': 'Free',
  'passive': 'Passive',
};

interface UsesTrackerProps {
  name: string;
  uses: NonNullable<SheetAbility['uses']>;
  remaining: number;
  onChange: (remaining: number) => void;
}

function UsesTracker({ name, uses, remaining, onChange }: UsesTrackerProps) {
  return (
    <div className={styles.uses}>
      <div className={styles.pips}>
        {Array.from({ length: uses.count }, (_, index) => {
          const available = index < remaining;
          return (
            <button
              key={index}
              type="button"
              className={available ? styles.pip : styles.pipSpent}
              aria-pressed={!available}
              aria-label={`${name} use ${index + 1} of ${uses.count}`}
              onClick={() => onChange(index === remaining - 1 ? index : index + 1)}
            />
          );
        })}
      </div>
      <span className={styles.usesLabel}>
        {remaining} of {uses.count} left
      </span>
    </div>
  );
}

interface HideableCardsProps<Item extends { id: string; name: string; description: string; hidden: boolean }> {
  items: Item[];
  badge: (item: Item) => string;
  meta?: (item: Item) => string | undefined;
  onToggleHidden: (id: string) => void;
}

function HideableCards<Item extends { id: string; name: string; description: string; hidden: boolean }>({
  items,
  badge,
  meta,
  onToggleHidden,
}: HideableCardsProps<Item>) {
  const [showHidden, setShowHidden] = useState(false);
  const hiddenCount = items.filter((item) => item.hidden).length;
  const shown = showHidden ? items : items.filter((item) => !item.hidden);

  return (
    <>
      <ul className={styles.cards}>
        {shown.map((item) => (
          <li key={item.id} className={item.hidden ? `${styles.card} ${styles.cardHidden}` : styles.card}>
            <div className={styles.cardHead}>
              <strong>{item.name}</strong>
              <span className={styles.cardActions}>
                <span className={styles.badge}>{badge(item)}</span>
                <button
                  type="button"
                  className={styles.visibilityToggle}
                  aria-label={`${item.hidden ? 'Show' : 'Hide'} ${item.name}`}
                  onClick={() => onToggleHidden(item.id)}
                >
                  {item.hidden ? 'Show' : 'Hide'}
                </button>
              </span>
            </div>
            <p className={styles.cardBody}>{item.description}</p>
            {meta?.(item) ? <p className={styles.cardMeta}>{meta(item)}</p> : null}
          </li>
        ))}
      </ul>
      {hiddenCount > 0 ? (
        <button
          type="button"
          className={styles.hiddenToggle}
          onClick={() => setShowHidden((current) => !current)}
        >
          {showHidden ? `Hide ${hiddenCount} hidden` : `Show ${hiddenCount} hidden`}
        </button>
      ) : null}
    </>
  );
}

interface CharacterSheetProps {
  character: Character;
  onChange: (character: Character) => void;
  onDelete: () => void;
  onBack: () => void;
  onOpenSpells: () => void;
}

export function CharacterSheet({
  character,
  onChange,
  onDelete,
  onBack,
  onOpenSpells,
}: CharacterSheetProps) {
  function setCharacter(next: Character | ((current: Character) => Character)) {
    onChange(typeof next === 'function' ? next(character) : next);
  }
  const [remaining, setRemaining] = useState<Record<string, number>>({});
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [pending, setPending] = useState<{ character: Character; feature: ClassFeature } | null>(
    null,
  );
  const [pendingSubclass, setPendingSubclass] = useState<{
    character: Character;
    feature: ClassFeature;
  } | null>(null);
  const availableSubspecies = subspecies.filter((entry) => entry.speciesId === character.speciesId);
  const needsSubspecies = availableSubspecies.length > 0 && !character.subspeciesId;
  const [choosingSubspecies, setChoosingSubspecies] = useState(false);
  const sheet = derive(character, {
    classes,
    weapons,
    tools,
    feats,
    subclasses,
    species,
    subspecies,
    backgrounds,
    spells,
  });
  const summary = sheet.classes.map((entry) => `${entry.name} ${entry.level}`).join(' / ');
  const subclassLine = sheet.classes
    .map((entry) => entry.subclass)
    .filter((name): name is string => Boolean(name))
    .join(' / ');
  const speciesLine = sheet.subspecies ? `${sheet.species} (${sheet.subspecies})` : sheet.species;
  const originLine = [speciesLine, sheet.background]
    .filter((name): name is string => Boolean(name))
    .join(' · ');
  const topSlot = sheet.spellSlots.at(-1);
  const spellsSummary = [
    sheet.spells.length > 0
      ? `${sheet.spells.length} ${sheet.spells.length === 1 ? 'spell' : 'spells'} known`
      : undefined,
    topSlot ? `slots to level ${topSlot.level}` : undefined,
  ]
    .filter((part): part is string => Boolean(part))
    .join(' · ');
  const canLevelUp = sheet.level < 20;
  const backgroundFeatId = backgrounds.find(
    (entry) => entry.id === character.backgroundId,
  )?.featId;

  function featOptionsFor(feature: ClassFeature, target: Character) {
    return feats.filter(
      (feat) =>
        feat.category === grantedFeatCategory(feature) &&
        feat.id !== backgroundFeatId &&
        !target.featIds.includes(feat.id),
    );
  }

  function subclassOptionsFor(target: Character) {
    return subclasses.filter((entry) => entry.classId === target.classes[0]?.classId);
  }

  const pendingOptions = pending ? featOptionsFor(pending.feature, pending.character) : [];
  const pendingSubclassOptions = pendingSubclass ? subclassOptionsFor(pendingSubclass.character) : [];

  function levelUp() {
    const leveled = character.classes.map((entry, index) =>
      index === 0 ? { ...entry, level: entry.level + 1 } : entry,
    );
    const nextLevel = leveled.reduce((total, entry) => total + entry.level, 0);
    const lineage = subspecies.find(
      (entry) => entry.id === character.subspeciesId && entry.speciesId === character.speciesId,
    );
    const granted = lineage ? grantedSpellIds(lineage.traits, nextLevel) : [];
    const next: Character = {
      ...character,
      classes: leveled,
      spellbook: {
        ...character.spellbook,
        knownSpellIds: [...new Set([...character.spellbook.knownSpellIds, ...granted])],
      },
    };
    const gained = featuresGained(character, next);

    const subclassFeature = gained.find(grantsSubclass);
    if (subclassFeature && subclassOptionsFor(next).length > 0) {
      setPendingSubclass({ character: next, feature: subclassFeature });
      return;
    }

    const featFeature = gained.find((feature) => grantedFeatCategory(feature));
    if (featFeature && featOptionsFor(featFeature, next).length > 0) {
      setPending({ character: next, feature: featFeature });
      return;
    }

    setCharacter(next);
  }

  function chooseFeat(
    featId: string,
    increases?: Partial<Record<Ability, number>>,
    skills?: Skill[],
  ) {
    if (!pending) return;
    const merged: Partial<Record<Ability, number>> = { ...pending.character.abilityScoreIncreases };
    if (increases) {
      (Object.keys(increases) as Ability[]).forEach((ability) => {
        merged[ability] = (merged[ability] ?? 0) + (increases[ability] ?? 0);
      });
    }
    setCharacter({
      ...pending.character,
      featIds: [...pending.character.featIds, featId],
      abilityScoreIncreases: merged,
      skillProficiencies: [...new Set([...pending.character.skillProficiencies, ...(skills ?? [])])],
    });
    setPending(null);
  }

  function toggleHidden(key: 'hiddenFeatureIds' | 'hiddenTraitIds') {
    return (id: string) =>
      setCharacter((current) => {
        const ids = current[key] ?? [];
        return {
          ...current,
          [key]: ids.includes(id) ? ids.filter((entry) => entry !== id) : [...ids, id],
        };
      });
  }

  function chooseSubclass(subclassId: string) {
    if (!pendingSubclass) return;
    setCharacter({
      ...pendingSubclass.character,
      classes: pendingSubclass.character.classes.map((entry, index) =>
        index === 0 ? { ...entry, subclassId } : entry,
      ),
    });
    setPendingSubclass(null);
  }

  function chooseSubspecies(subspeciesId: string, castingAbility?: Ability) {
    const chosen = subspecies.find((entry) => entry.id === subspeciesId);
    const granted = chosen ? grantedSpellIds(chosen.traits, sheet.level) : [];
    setCharacter({
      ...character,
      subspeciesId,
      spellbook: {
        castingAbility: castingAbility ?? character.spellbook.castingAbility,
        knownSpellIds: [...new Set([...character.spellbook.knownSpellIds, ...granted])],
      },
    });
    setChoosingSubspecies(false);
  }

  return (
    <>
    <main className={styles.page}>
      <div className={styles.topbar}>
        <button type="button" className={styles.back} onClick={onBack}>
          ← All characters
        </button>
        <div className={styles.actions}>
          {confirmingDelete ? (
            <>
              <span className={styles.confirmPrompt}>Delete {sheet.name}?</span>
              <button type="button" className={styles.deleteConfirm} onClick={onDelete}>
                Delete
              </button>
              <button
                type="button"
                className={styles.back}
                onClick={() => setConfirmingDelete(false)}
              >
                Cancel
              </button>
            </>
          ) : (
            <button
              type="button"
              className={styles.delete}
              onClick={() => setConfirmingDelete(true)}
            >
              Delete
            </button>
          )}
          <button
            type="button"
            className={styles.levelUp}
            onClick={levelUp}
            disabled={!canLevelUp}
            title={canLevelUp ? undefined : 'Maximum level reached'}
          >
            Level Up
          </button>
        </div>
      </div>

      <header className={styles.header}>
        <h1 className={styles.title}>{sheet.name}</h1>
        <p className={styles.subtitle}>
          {originLine ? `${originLine} · ${summary}` : summary}
        </p>
        {subclassLine ? <p className={styles.subclass}>{subclassLine}</p> : null}
        {needsSubspecies ? (
          <button
            type="button"
            className={styles.lineagePrompt}
            onClick={() => setChoosingSubspecies(true)}
          >
            Choose your {sheet.species} lineage
          </button>
        ) : null}
      </header>

      <section className={styles.section}>
        <div className={styles.stats}>
          <div className={styles.stat}>
            <span className={styles.statLabel}>Level</span>
            <strong className={styles.statValue}>{sheet.level}</strong>
          </div>
          <div className={styles.stat}>
            <span className={styles.statLabel}>Hit Points</span>
            <strong className={styles.statValue}>{sheet.hitPoints}</strong>
          </div>
          <div className={styles.stat}>
            <span className={styles.statLabel}>Proficiency</span>
            <strong className={styles.statValue}>{signed(sheet.proficiencyBonus)}</strong>
          </div>
          <div className={styles.stat}>
            <span className={styles.statLabel}>Initiative</span>
            <strong className={styles.statValue}>{signed(sheet.initiative)}</strong>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.heading}>Ability Scores</h2>
        <ul className={styles.abilities}>
          {abilityOrder.map((ability) => (
            <li key={ability} className={styles.ability}>
              <span className={styles.abilityName}>{ability.toUpperCase()}</span>
              <strong className={styles.abilityScore}>{sheet.abilityScores[ability]}</strong>
              <span className={styles.abilityModifier}>
                {signed(sheet.abilityModifiers[ability])}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section className={styles.section}>
        <h2 className={styles.heading}>Skills</h2>
        <ul className={styles.skills}>
          {sheet.skills.map((entry) => (
            <li
              key={entry.skill}
              className={entry.proficient ? styles.skillProficient : styles.skill}
            >
              <span>{titleCase(entry.skill)}</span>
              <span className={styles.skillAbility}>{entry.ability.toUpperCase()}</span>
              <strong>{signed(entry.modifier)}</strong>
            </li>
          ))}
        </ul>
      </section>

      <section className={styles.section}>
        <h2 className={styles.heading}>Tools</h2>
        {sheet.tools.length === 0 ? (
          <p className={styles.empty}>No tool proficiencies.</p>
        ) : (
          <ul className={styles.skills}>
            {sheet.tools.map((tool) => (
              <li key={tool.name} className={styles.skillProficient}>
                <span>{tool.name}</span>
                {tool.ability ? (
                  <span className={styles.skillAbility}>{tool.ability.toUpperCase()}</span>
                ) : null}
                {tool.modifier !== undefined ? <strong>{signed(tool.modifier)}</strong> : null}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className={styles.section}>
        <h2 className={styles.heading}>Attacks</h2>
        <ul className={styles.attacks}>
          <li className={styles.attackHead}>
            <span>Weapon</span>
            <span>Attack</span>
            <span>Damage</span>
          </li>
          {sheet.attacks.map((attack) => (
            <li key={attack.name} className={styles.attack}>
              <span className={styles.attackName}>{attack.name}</span>
              <span className={styles.attackBonus}>{signed(attack.attackBonus)}</span>
              <span className={styles.attackDamage}>{describeDamage(attack.damage)}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className={styles.section}>
        <h2 className={styles.heading}>Actions</h2>
        {sheet.abilities.length === 0 ? (
          <p className={styles.empty}>No activatable abilities.</p>
        ) : (
          <ul className={styles.cards}>
            {sheet.abilities.map((ability) => (
              <li key={ability.name} className={styles.card}>
                <div className={styles.cardHead}>
                  <strong>{ability.name}</strong>
                  <span className={styles.badge}>
                    {activationLabels[ability.activation.type]}
                  </span>
                </div>
                <p className={styles.cardBody}>{ability.description}</p>
                {ability.uses ? (
                  <>
                    <UsesTracker
                      name={ability.name}
                      uses={ability.uses}
                      remaining={remaining[ability.name] ?? ability.uses.count}
                      onChange={(next) =>
                        setRemaining((current) => ({ ...current, [ability.name]: next }))
                      }
                    />
                    <p className={styles.cardMeta}>{describeRecharge(ability.uses)}</p>
                  </>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </section>

      {sheet.spells.length > 0 || sheet.spellSlots.length > 0 || sheet.spellcasting ? (
        <section className={styles.section}>
          <h2 className={styles.heading}>Spells</h2>
          <button type="button" className={styles.spellsLink} onClick={onOpenSpells}>
            <span className={styles.spellsLinkLabel}>Open spellbook</span>
            <span className={styles.spellsLinkMeta}>{spellsSummary}</span>
            <span className={styles.spellsLinkArrow} aria-hidden>
              →
            </span>
          </button>
        </section>
      ) : null}

      <section className={styles.section}>
        <h2 className={styles.heading}>Features</h2>
        <HideableCards
          items={sheet.features}
          badge={(feature) => `Level ${feature.level}`}
          meta={(feature) => feature.detail}
          onToggleHidden={toggleHidden('hiddenFeatureIds')}
        />
      </section>

      {sheet.traits.length > 0 ? (
        <section className={styles.section}>
          <h2 className={styles.heading}>Traits</h2>
          <HideableCards
            items={sheet.traits}
            badge={() => sheet.species ?? ''}
            onToggleHidden={toggleHidden('hiddenTraitIds')}
          />
        </section>
      ) : null}

      <section className={styles.section}>
        <h2 className={styles.heading}>Feats</h2>
        {sheet.feats.length === 0 ? (
          <p className={styles.empty}>No feats.</p>
        ) : (
          <ul className={styles.cards}>
            {sheet.feats.map((feat) => (
              <li key={feat.name} className={styles.card}>
                <div className={styles.cardHead}>
                  <strong>{feat.name}</strong>
                  <span className={styles.badge}>{titleCase(feat.category)}</span>
                </div>
                <p className={styles.cardBody}>{feat.description}</p>
                {feat.note ? <p className={styles.cardMeta}>{feat.note}</p> : null}
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
    {pending ? (
      <FeatChoiceDialog
        featureName={pending.feature.name}
        options={pendingOptions}
        abilityScores={sheet.abilityScores}
        proficientSkills={sheet.skills
          .filter((entry) => entry.proficient)
          .map((entry) => entry.skill)}
        onChoose={chooseFeat}
        onCancel={() => setPending(null)}
      />
    ) : null}
    {pendingSubclass ? (
      <SubclassChoiceDialog
        featureName={pendingSubclass.feature.name}
        options={pendingSubclassOptions}
        onChoose={chooseSubclass}
        onCancel={() => setPendingSubclass(null)}
      />
    ) : null}
    {choosingSubspecies && needsSubspecies ? (
      <SubspeciesChoiceDialog
        speciesName={sheet.species ?? 'Species'}
        options={availableSubspecies}
        abilityModifiers={sheet.abilityModifiers}
        proficiencyBonus={sheet.proficiencyBonus}
        onChoose={chooseSubspecies}
        onCancel={() => setChoosingSubspecies(false)}
      />
    ) : null}
    </>
  );
}
