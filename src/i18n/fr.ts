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
      message: 'Message',
      messageHint:
        'Les marqueurs {nom}, {police}, {echeance} sont à compléter avant envoi.',
      proofTitle: 'Preuve de paiement (champs lus)',
      proofOperator: 'Opérateur',
      proofAmount: 'Montant (entier)',
      proofAmountInvalid: 'Montant invalide : indiquez un nombre entier ou laissez vide.',
      proofCurrency: 'Devise',
      proofDate: 'Date du paiement',
      proofReference: 'Référence de transaction',
      proofPayer: 'Nom de l’expéditeur',
      fromTemplate: (title: string) => `Pré-rempli depuis le modèle « ${title} »`,
      submit: 'Enregistrer la relance',
    },
    tabs: {
      label: 'Ajouter une relance',
      modele: 'Modèles',
      description: 'Décrire',
      preuve: 'Preuve de paiement',
    },
    describe: {
      intro:
        'Décrivez la situation de l’assuré en quelques phrases. Le texte est analysé par un service d’IA : saisissez uniquement des données fictives.',
      label: 'Situation de l’assuré',
      placeholder:
        'Exemple : l’assuré a deux échéances de retard et promet de payer à la fin du mois.',
      analyze: 'Analyser la situation',
      loading: 'Analyse en cours…',
      restart: 'Recommencer',
    },
    proof: {
      intro:
        'Importez une capture d’écran Wave ou Orange Money (fictive). L’image est réduite dans votre navigateur ; seuls les champs lus sont enregistrés, jamais l’image.',
      label: 'Capture du reçu',
      previewAlt: 'Aperçu du reçu sélectionné',
      preparing: 'Préparation de l’image…',
      read: 'Lire le reçu',
      loading: 'Lecture du reçu en cours…',
      restart: 'Choisir une autre image',
    },
    review: {
      title: 'Suggestion à vérifier',
      editHint: 'Vérifiez et modifiez chaque champ avant d’enregistrer.',
      status: 'Statut suggéré',
      channel: 'Canal suggéré',
      timing: 'Étape suggérée',
      tone: 'Ton suggéré',
      confidence: (value: number) => `Confiance : ${Math.round(value * 100)} %`,
      reasoning: 'Justification',
      warning: 'Attention',
      saved: 'Relance enregistrée dans le journal.',
    },
    errors: {
      unavailable:
        'Le service d’analyse est momentanément indisponible. Vérifiez que l’émulateur est lancé, puis réessayez dans quelques instants.',
      timeout: 'Le service d’analyse met trop de temps à répondre. Réessayez.',
      'not-configured':
        'Le service d’analyse n’est pas configuré (clé manquante côté serveur).',
      'invalid-input':
        'Les informations envoyées ne sont pas valides. Vérifiez-les et réessayez.',
      'invalid-response':
        'La réponse du service est inattendue. Réessayez ; si le problème persiste, saisissez la relance à la main.',
      unknown: 'Une erreur est survenue. Réessayez dans un instant.',
      emptyText: 'Décrivez d’abord la situation.',
      noImage: 'Choisissez d’abord une image.',
      'unsupported-type':
        'Format non pris en charge. Choisissez une image PNG, JPEG ou WebP.',
      unreadable: 'Cette image est illisible. Essayez une autre capture.',
      'too-large':
        'L’image reste trop volumineuse (4 Mo maximum). Essayez une capture plus petite.',
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
      sources: {
        modele: 'Modèle',
        description: 'Description (IA)',
        preuve: 'Preuve de paiement',
      },
      showMessage: 'Voir le message',
      proofSummary: (operator: string, amount: string, reference: string) =>
        `Preuve ${operator}${amount ? ` — ${amount}` : ''}${reference ? ` — réf. ${reference}` : ''}`,
      confirm: 'Confirmer la suppression',
      cancel: 'Annuler',
      columns: {
        sentOn: 'Date d’envoi',
        police: 'Police',
        step: 'Étape',
        canal: 'Canal',
        statut: 'Statut',
        note: 'Note',
        source: 'Origine',
        actions: 'Actions',
      },
    },
  },
} as const;
