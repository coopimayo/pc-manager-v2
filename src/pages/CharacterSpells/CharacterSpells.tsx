import { useMemo, useState } from 'react';

import { backgrounds } from '../../data/backgrounds';
import { classes, subclasses } from '../../data/classes';
import { feats } from '../../data/feats';
import { weapons } from '../../data/items';
import { species, subspecies } from '../../data/species';
import { spells } from '../../data/spells';
import { derive } from '../../lib/derive';
import { signed, titleCase } from '../../lib/format';
import type { Character } from '../../types';
import type { SheetSpell, SheetSpellSlot } from '../../types/sheet';
import styles from './CharacterSpells.module.css';

interface SlotTrackerProps {
  slot: SheetSpellSlot;
  remaining: number;
  onChange: (remaining: number) => void;
}

function SlotTracker({ slot, remaining, onChange }: SlotTrackerProps) {
  return (
    <div className={styles.slot}>
      <span className={styles.slotLevel}>Level {slot.level}</span>
      <div className={styles.pips}>
        {Array.from({ length: slot.total }, (_, index) => {
          const available = index < remaining;
          return (
            <button
              key={index}
              type="button"
              className={available ? styles.pip : styles.pipSpent}
              aria-pressed={!available}
              aria-label={`Level ${slot.level} slot ${index + 1} of ${slot.total}`}
              onClick={() => onChange(index === remaining - 1 ? index : index + 1)}
            />
          );
        })}
      </div>
      <span className={styles.slotLabel}>
        {remaining} of {slot.total}
      </span>
    </div>
  );
}

function levelLabel(level: number): string {
  return level === 0 ? 'Cantrips' : `Level ${level}`;
}

function spellMeta(spell: SheetSpell): string {
  return [titleCase(spell.school), spell.castingTime, spell.range, spell.duration].join(' · ');
}

interface CharacterSpellsProps {
  character: Character;
  onBack: () => void;
}

export function CharacterSpells({ character, onBack }: CharacterSpellsProps) {
  const sheet = derive(character, {
    classes,
    weapons,
    feats,
    subclasses,
    species,
    subspecies,
    backgrounds,
    spells,
  });

  const [remaining, setRemaining] = useState<Record<number, number>>({});
  const [query, setQuery] = useState('');
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const groups = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const matches = needle
      ? sheet.spells.filter(
          (spell) =>
            spell.name.toLowerCase().includes(needle) ||
            spell.school.toLowerCase().includes(needle),
        )
      : sheet.spells;

    const byLevel = new Map<number, SheetSpell[]>();
    for (const spell of matches) {
      const bucket = byLevel.get(spell.level) ?? [];
      bucket.push(spell);
      byLevel.set(spell.level, bucket);
    }
    return [...byLevel.entries()].sort(([a], [b]) => a - b);
  }, [sheet.spells, query]);

  function toggleExpanded(name: string) {
    setExpanded((current) => {
      const next = new Set(current);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  }

  const hasSpells = sheet.spells.length > 0;
  const hasSlots = sheet.spellSlots.length > 0;

  return (
    <main className={styles.page}>
      <div className={styles.topbar}>
        <button type="button" className={styles.back} onClick={onBack}>
          ← {sheet.name}
        </button>
      </div>

      <header className={styles.header}>
        <h1 className={styles.title}>Spells</h1>
        <p className={styles.subtitle}>{sheet.name}</p>
      </header>

      {sheet.spellcasting ? (
        <section className={styles.section}>
          <div className={styles.stats}>
            <div className={styles.stat}>
              <span className={styles.statLabel}>Ability</span>
              <strong className={styles.statValue}>
                {sheet.spellcasting.ability.toUpperCase()}
              </strong>
            </div>
            <div className={styles.stat}>
              <span className={styles.statLabel}>Save DC</span>
              <strong className={styles.statValue}>{sheet.spellcasting.saveDc}</strong>
            </div>
            <div className={styles.stat}>
              <span className={styles.statLabel}>Spell Attack</span>
              <strong className={styles.statValue}>{signed(sheet.spellcasting.attackBonus)}</strong>
            </div>
          </div>
        </section>
      ) : null}

      {hasSlots ? (
        <section className={styles.section}>
          <div className={styles.slotsHead}>
            <h2 className={styles.heading}>Spell Slots</h2>
            <button
              type="button"
              className={styles.rest}
              onClick={() => setRemaining({})}
            >
              Long Rest
            </button>
          </div>
          <ul className={styles.slots}>
            {sheet.spellSlots.map((slot) => (
              <li key={slot.level}>
                <SlotTracker
                  slot={slot}
                  remaining={remaining[slot.level] ?? slot.total}
                  onChange={(next) =>
                    setRemaining((current) => ({ ...current, [slot.level]: next }))
                  }
                />
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className={styles.section}>
        <div className={styles.slotsHead}>
          <h2 className={styles.heading}>Known Spells</h2>
          {hasSpells ? (
            <input
              type="search"
              className={styles.search}
              placeholder="Search spells…"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              aria-label="Search spells"
            />
          ) : null}
        </div>

        {!hasSpells ? (
          <p className={styles.empty}>No spells known.</p>
        ) : groups.length === 0 ? (
          <p className={styles.empty}>No spells match “{query}”.</p>
        ) : (
          groups.map(([level, levelSpells]) => (
            <div key={level} className={styles.group}>
              <h3 className={styles.groupHeading}>{levelLabel(level)}</h3>
              <ul className={styles.cards}>
                {levelSpells.map((spell) => {
                  const open = expanded.has(spell.name);
                  return (
                    <li key={spell.name} className={styles.card}>
                      <button
                        type="button"
                        className={styles.cardHead}
                        aria-expanded={open}
                        onClick={() => toggleExpanded(spell.name)}
                      >
                        <span className={styles.cardName}>{spell.name}</span>
                        {spell.concentration ? (
                          <span className={styles.badge}>Concentration</span>
                        ) : null}
                        <span className={styles.chevron} aria-hidden>
                          {open ? '−' : '+'}
                        </span>
                      </button>
                      <p className={styles.cardMeta}>{spellMeta(spell)}</p>
                      {open ? <p className={styles.cardBody}>{spell.description}</p> : null}
                    </li>
                  );
                })}
              </ul>
            </div>
          ))
        )}
      </section>
    </main>
  );
}
