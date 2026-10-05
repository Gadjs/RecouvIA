import type { ReactNode } from 'react';
import { fr } from '../../i18n/fr';

export const ENTRY_TABS = ['modele', 'description', 'preuve'] as const;
export type EntryTab = (typeof ENTRY_TABS)[number];

interface EntryTabsProps {
  active: EntryTab;
  onChange: (tab: EntryTab) => void;
  panels: Record<EntryTab, ReactNode>;
}

/**
 * Tab bar for the three ways to add an entry. All panels stay mounted (hidden
 * when inactive) so an AI result under review survives a tab switch.
 */
export function EntryTabs({ active, onChange, panels }: EntryTabsProps) {
  const t = fr.journal.tabs;

  function handleKeyDown(event: React.KeyboardEvent, index: number) {
    const offset = event.key === 'ArrowRight' ? 1 : event.key === 'ArrowLeft' ? -1 : 0;
    if (offset === 0) return;
    event.preventDefault();
    const next = ENTRY_TABS[(index + offset + ENTRY_TABS.length) % ENTRY_TABS.length];
    if (next) {
      onChange(next);
      document.getElementById(`tab-${next}`)?.focus();
    }
  }

  return (
    <div className="entry-tabs">
      <div role="tablist" aria-label={t.label}>
        {ENTRY_TABS.map((tab, index) => (
          <button
            key={tab}
            type="button"
            role="tab"
            id={`tab-${tab}`}
            aria-selected={active === tab}
            aria-controls={`panel-${tab}`}
            tabIndex={active === tab ? 0 : -1}
            className={active === tab ? 'tab active' : 'tab secondary'}
            onClick={() => onChange(tab)}
            onKeyDown={(event) => handleKeyDown(event, index)}
          >
            {t[tab]}
          </button>
        ))}
      </div>
      {ENTRY_TABS.map((tab) => (
        <div
          key={tab}
          role="tabpanel"
          id={`panel-${tab}`}
          aria-labelledby={`tab-${tab}`}
          hidden={active !== tab}
        >
          {panels[tab]}
        </div>
      ))}
    </div>
  );
}
