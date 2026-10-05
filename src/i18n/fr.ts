export const fr = {
  app: {
    title: 'RecouvIA',
    subtitle: 'Préparez et consignez vos relances de primes — NSIA Vie Assurances',
    demoNotice:
      'Données fictives uniquement. Les entrées sont enregistrées dans ce navigateur.',
  },
  library: {
    title: 'Bibliothèque de modèles',
    searchLabel: 'Rechercher un modèle',
    searchPlaceholder: 'Statut, canal, étape, mot du message…',
    count: (shown: number, total: number) => `${shown} modèle(s) sur ${total}`,
    empty: 'Aucun modèle ne correspond à votre recherche.',
    fields: {
      step: 'Étape',
      statut: 'Statut',
      canal: 'Canal',
      ton: 'Ton',
      message: 'Message (français)',
      wolof: 'Version wolof',
    },
    use: 'Utiliser ce modèle',
    useAria: (title: string) => `Utiliser le modèle « ${title} » dans le journal`,
  },
  journal: {
    title: 'Journal des relances',
    form: {
      police: 'Numéro de police (fictif)',
      policeHint: 'Exemple : DEMO-0001',
      policeInvalid: 'Numéro invalide : 4 à 20 caractères (lettres, chiffres, tirets).',
      step: 'Étape de relance',
      canal: 'Canal',
      statut: 'Statut',
      sentOn: 'Date d’envoi',
      note: 'Note (facultatif)',
      fromTemplate: (title: string) => `Pré-rempli depuis le modèle « ${title} »`,
      submit: 'Enregistrer la relance',
    },
    counters: {
      title: 'Relances par police',
      empty: 'Aucune police pour le moment.',
      count: (n: number) => `${n} relance${n > 1 ? 's' : ''}`,
    },
    list: {
      title: 'Relances enregistrées',
      empty: 'Aucune relance enregistrée. Utilisez le formulaire ci-dessus.',
      filterLabel: 'Filtrer par numéro de police',
      duplicate: 'Dupliquer',
      duplicateAria: (police: string, step: string) =>
        `Dupliquer la relance ${step} de la police ${police}`,
      remove: 'Supprimer',
      removeAria: (police: string, step: string) =>
        `Supprimer la relance ${step} de la police ${police}`,
      confirm: 'Confirmer la suppression',
      cancel: 'Annuler',
      columns: {
        sentOn: 'Date d’envoi',
        police: 'Police',
        step: 'Étape',
        canal: 'Canal',
        statut: 'Statut',
        note: 'Note',
        actions: 'Actions',
      },
    },
  },
} as const;
