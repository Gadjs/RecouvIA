import type { RelanceStepId, Statut } from '../../domain/types';

export const WOLOF_PLACEHOLDER = '[à valider]';

export interface ReminderTemplate {
  id: string;
  title: string;
  step: RelanceStepId;
  statut: Statut;
  /** French sample message; `{placeholders}` are filled by the officer, never invented. */
  message: string;
  /** Wolof version, pending validation by a native speaker. */
  wolof: string;
}

type TemplateSeed = Omit<ReminderTemplate, 'wolof'>;

const SEEDS: readonly TemplateSeed[] = [
  {
    id: 'tpl-01',
    title: 'Rappel d’échéance à venir',
    step: 'J-3',
    statut: 'Échéance proche',
    message:
      'Bonjour {nom}, la prime de votre police {police} arrive à échéance le {echeance}. Montant : {montant}. Merci de prévoir votre règlement. NSIA Vie Assurances.',
  },
  {
    id: 'tpl-02',
    title: 'Rappel avec moyen de paiement',
    step: 'J-3',
    statut: 'Échéance proche',
    message:
      'Bonjour {nom}, votre prime de {montant} (police {police}) est due le {echeance}. Vous pouvez régler via {moyen_paiement}. Pensez à nous transmettre votre preuve de paiement.',
  },
  {
    id: 'tpl-03',
    title: 'Rappel la veille de l’échéance',
    step: 'J-1',
    statut: 'Échéance proche',
    message:
      'Bonjour {nom}, petit rappel : la prime de votre police {police} est due demain, le {echeance} ({montant}). Nous restons à votre disposition pour toute question.',
  },
  {
    id: 'tpl-04',
    title: 'Dernier rappel avant échéance',
    step: 'J-1',
    statut: 'Échéance proche',
    message:
      'Bonjour {nom}, afin que votre police {police} reste à jour, nous vous invitons à régler {montant} avant le {echeance}. Merci de votre confiance.',
  },
  {
    id: 'tpl-05',
    title: 'Jour d’échéance',
    step: 'J0',
    statut: 'Échéance proche',
    message:
      'Bonjour {nom}, la prime de votre police {police} ({montant}) est exigible aujourd’hui, {echeance}. Nous vous remercions de procéder à son règlement.',
  },
  {
    id: 'tpl-06',
    title: 'Confirmation de promesse de paiement',
    step: 'J0',
    statut: 'Promesse de paiement',
    message:
      'Bonjour {nom}, nous prenons note de votre engagement à régler {montant} pour la police {police} le {date_promesse}. Nous vous remercions de votre diligence.',
  },
  {
    id: 'tpl-07',
    title: 'Premier constat d’impayé',
    step: 'J+1',
    statut: 'En retard',
    message:
      'Bonjour {nom}, nous n’avons pas reçu la prime de votre police {police}, échue le {echeance}. Arriéré : {arriere}. Merci de régulariser dès que possible.',
  },
  {
    id: 'tpl-08',
    title: 'Oubli probable (paiement peut-être croisé)',
    step: 'J+1',
    statut: 'En retard',
    message:
      'Bonjour {nom}, il semble que la prime de votre police {police} (échéance {echeance}) soit en attente. Si vous avez déjà réglé, merci de nous envoyer votre preuve de paiement ; sinon, nous vous invitons à régulariser ({arriere}).',
  },
  {
    id: 'tpl-09',
    title: 'Appel de relance',
    step: 'J+3',
    statut: 'En retard',
    message:
      'Appel à {nom} : rappeler que la prime de la police {police}, échue le {echeance}, reste impayée ({arriere}). Demander la cause du retard et proposer un moyen de règlement.',
  },
  {
    id: 'tpl-10',
    title: 'Appel : recueil d’une promesse de paiement',
    step: 'J+3',
    statut: 'Promesse de paiement',
    message:
      'Appel à {nom} : obtenir une date précise de règlement pour la police {police} ({arriere}). Noter la date promise : {date_promesse}. Confirmer ensuite par écrit.',
  },
  {
    id: 'tpl-11',
    title: 'Relance WhatsApp avec arriéré',
    step: 'J+7',
    statut: 'En retard',
    message:
      'Bonjour {nom}, malgré notre précédent contact, la police {police} présente un arriéré de {arriere} depuis le {echeance}. Nous vous demandons de régulariser rapidement.',
  },
  {
    id: 'tpl-12',
    title: 'Rappel de la date promise',
    step: 'J+7',
    statut: 'Promesse de paiement',
    message:
      'Bonjour {nom}, vous vous êtes engagé(e) à régler la police {police} le {date_promesse}. Nous vous rappelons cette date ; arriéré actuel : {arriere}.',
  },
  {
    id: 'tpl-13',
    title: 'Appel ferme sur l’arriéré',
    step: 'J+10',
    statut: 'En retard',
    message:
      'Appel à {nom} : la police {police} cumule un arriéré de {arriere}. Indiquer fermement la nécessité d’un règlement immédiat et convenir d’une échéance écrite.',
  },
  {
    id: 'tpl-14',
    title: 'Promesse non tenue',
    step: 'J+10',
    statut: 'Promesse de paiement',
    message:
      'Appel à {nom} : le règlement promis pour le {date_promesse} (police {police}) n’a pas été reçu. Arriéré : {arriere}. Demander une nouvelle date ferme.',
  },
  {
    id: 'tpl-15',
    title: 'SMS formel avec arriéré',
    step: 'J+15',
    statut: 'En retard',
    message:
      'NSIA Vie Assurances — {nom}, la police {police} reste impayée depuis le {echeance} (arriéré : {arriere}). Veuillez régulariser sans délai ou nous contacter.',
  },
  {
    id: 'tpl-16',
    title: 'Dernière échéance de promesse',
    step: 'J+15',
    statut: 'Promesse de paiement',
    message:
      'NSIA Vie Assurances — {nom}, sans règlement de {arriere} au plus tard le {date_promesse}, le dossier de la police {police} sera transmis à votre conseiller.',
  },
  {
    id: 'tpl-17',
    title: 'Appel formel : conséquences pour le contrat',
    step: 'J+21',
    statut: 'En retard',
    message:
      'Appel à {nom} : informer que l’arriéré de {arriere} sur la police {police} peut avoir des conséquences sur le contrat. Rappeler les moyens de règlement et fixer une dernière date.',
  },
  {
    id: 'tpl-18',
    title: 'Transmission au conseiller',
    step: 'J+21',
    statut: 'Escalade conseiller',
    message:
      'Appel à {nom} : prévenir que le dossier de la police {police} (arriéré : {arriere}) est transmis à {conseiller}, qui prendra contact pour trouver une solution.',
  },
  {
    id: 'tpl-19',
    title: 'Visite ou contact du conseiller',
    step: 'J+30',
    statut: 'Escalade conseiller',
    message:
      'Conseiller {conseiller} : contacter {nom} au sujet de la police {police}, impayée depuis le {echeance} (arriéré : {arriere}). Proposer un rendez-vous et un plan de règlement.',
  },
  {
    id: 'tpl-20',
    title: 'Dernier avis avant traitement du dossier',
    step: 'J+30',
    statut: 'Escalade conseiller',
    message:
      'Bonjour {nom}, malgré nos relances, la police {police} présente toujours un arriéré de {arriere}. Merci de contacter {conseiller} sans délai afin d’examiner votre situation.',
  },
];

export const TEMPLATES: readonly ReminderTemplate[] = SEEDS.map((seed) => ({
  ...seed,
  wolof: WOLOF_PLACEHOLDER,
}));
