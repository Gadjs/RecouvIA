import { getRelanceStep } from '../../domain/relance-steps';
import type { ReminderTemplate } from './templates-data';

function normalize(text: string): string {
  return text
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase();
}

/** Accent- and case-insensitive search over title, statut, channel, tone, step and message. */
export function searchTemplates(
  templates: readonly ReminderTemplate[],
  query: string,
): ReminderTemplate[] {
  const terms = normalize(query).split(/\s+/).filter(Boolean);
  if (terms.length === 0) return [...templates];
  return templates.filter((template) => {
    const { canal, ton } = getRelanceStep(template.step);
    const haystack = normalize(
      [template.title, template.statut, canal, ton, template.step, template.message].join(
        ' ',
      ),
    );
    return terms.every((term) => haystack.includes(term));
  });
}
