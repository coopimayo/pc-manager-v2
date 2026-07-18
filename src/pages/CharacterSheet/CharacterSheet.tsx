import { useState } from 'react';

import { FeatChoiceDialog } from '../../components/FeatChoiceDialog';
import { classes } from '../../data/classes';
import { feats } from '../../data/feats';
import { weapons } from '../../data/items';
import { derive } from '../../lib/derive';
import type { Ability, Character } from '../../types';
import type { ClassFeature } from '../../types/class';
import type { Activation, Uses } from '../../types/effect';
import type { SheetAbility, SheetAttack } from '../../types/sheet';
import styles from './CharacterSheet.module.css';

const abilityOrder: Ability[] = ['str', 'dex', 'con', 'int', 'wis', 'cha'];

function grantFeatFeatureGained(before: Character, after: Character): ClassFeature | undefined {
  const primary = after.classes[0];
  const previous = before.classes[0];
  if (!primary || !previous) return undefined;
  const definition = classes.find((entry) => entry.id === primary.classId);
  if (!definition) return undefined;
  return definition.features.find(
    (feature) =>
      feature.grantFeat && feature.level > previous.level && feature.level <= primary.level,
  );
}

const activationLabels: Record<Activation['type'], string> = {
  'action': 'Action',
  'bonus-action': 'Bonus Action',
  'reaction': 'Reaction',
  'free': 'Free',
  'passive': 'Passive',
};

function signed(value: number): string {
  return value >= 0 ? `+${value}` : `${value}`;
}

function titleCase(value: string): string {
  return value.replace(
    /(^|-)([a-z])/g,
    (_, prefix: string, letter: string) => (prefix ? ' ' : '') + letter.toUpperCase(),
  );
}

function describeDamage(damage: SheetAttack['damage']): string {
  const dice = `${damage.count}${damage.die}`;
  const modifier =
    damage.modifier === 0 ? '' : damage.modifier > 0 ? ` + ${damage.modifier}` : ` − ${-damage.modifier}`;
  return `${dice}${modifier} ${damage.type}`;
}

function describeRecharge(uses: Uses): string {
  const rules = uses.recharge
    .map((rule) => `${rule.amount === 'all' ? 'all' : rule.amount} on a ${rule.on.replace('-', ' ')}`)
    .join(', ');
  return `Regains ${rules}`;
}

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

interface CharacterSheetProps {
  character: Character;
  onBack: () => void;
}

export function CharacterSheet({ character: initialCharacter, onBack }: CharacterSheetProps) {
  const [character, setCharacter] = useState(initialCharacter);
  const [remaining, setRemaining] = useState<Record<string, number>>({});
  const [pending, setPending] = useState<{ character: Character; feature: ClassFeature } | null>(
    null,
  );
  const sheet = derive(character, classes, weapons, feats);
  const summary = sheet.classes.map((entry) => `${entry.name} ${entry.level}`).join(' / ');
  const canLevelUp = sheet.level < 20;

  const pendingOptions = pending
    ? feats.filter(
        (feat) =>
          feat.category === pending.feature.grantFeat &&
          !pending.character.featIds.includes(feat.id),
      )
    : [];

  function levelUp() {
    const next: Character = {
      ...character,
      classes: character.classes.map((entry, index) =>
        index === 0 ? { ...entry, level: entry.level + 1 } : entry,
      ),
    };
    const feature = grantFeatFeatureGained(character, next);
    const options = feature
      ? feats.filter((feat) => feat.category === feature.grantFeat && !next.featIds.includes(feat.id))
      : [];
    if (feature && options.length > 0) {
      setPending({ character: next, feature });
    } else {
      setCharacter(next);
    }
  }

  function chooseFeat(featId: string) {
    if (!pending) return;
    setCharacter({ ...pending.character, featIds: [...pending.character.featIds, featId] });
    setPending(null);
  }

  return (
    <>
    <main className={styles.page}>
      <div className={styles.topbar}>
        <button type="button" className={styles.back} onClick={onBack}>
          ← All characters
        </button>
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

      <header className={styles.header}>
        <h1 className={styles.title}>{sheet.name}</h1>
        <p className={styles.subtitle}>{summary}</p>
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
        <h2 className={styles.heading}>Attacks</h2>
        {sheet.attacks.length === 0 ? (
          <p className={styles.empty}>No weapons equipped.</p>
        ) : (
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
        )}
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

      <section className={styles.section}>
        <h2 className={styles.heading}>Features</h2>
        <ul className={styles.cards}>
          {sheet.features.map((feature) => (
            <li key={feature.id} className={styles.card}>
              <div className={styles.cardHead}>
                <strong>{feature.name}</strong>
                <span className={styles.badge}>Level {feature.level}</span>
              </div>
              <p className={styles.cardBody}>{feature.description}</p>
              {feature.detail ? <p className={styles.cardMeta}>{feature.detail}</p> : null}
            </li>
          ))}
        </ul>
      </section>

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
        onChoose={chooseFeat}
        onCancel={() => setPending(null)}
      />
    ) : null}
    </>
  );
}
