const fr = {
  landing: {
    nav: {
      product: "Accueil",
      features: "Comment ça marche",
      institutions: "Pour qui",
      students: "Parcours élève",
      experience: "En pratique",
      faq: "Questions",
      problems: "Problème",
      transformation: "Transformation",
      ecosystem: "Pour qui",
      benefits: "Avantages",
      trust: "Confiance",
      vision: "Vision",
      explore: "Créer un compte",
      demo: "Inscrire une école",
      signin: "Connexion",
      account: "Compte",
      theme_toggle: "Changer thème",
      menu_open: "Ouvrir menu",
      menu_close: "Fermer menu",
    },

    hero: {
      badge: "Pour les écoles, enseignants, élèves et familles",
      headline: "L'école bien organisée.\nL'élève au centre.",
      subheadline:
        "Votre école gère inscriptions, classes et notes sans paperasse — et élèves, enseignants et parents suivent présence, devoirs et progrès au même endroit.",
      cta: "Je suis une école · Inscrire",
      explore: "Je suis élève ou parent",
      preview_label: "Choisissez un côté pour voir comment ça fonctionne",
    },

    stats: {
      partner_label: "Établissements actifs sur la plateforme",
      schools: "Établissements actifs",
      students: "Élèves",
      teachers: "Enseignants",
      classes: "Classes",
    },

    problem: {
      tag: "Problème & Solution",
      headline: "D'une gestion fragmentée à la clarté pédagogique.",
      description:
        "Les écoles ne manquent pas d'engagement — elles sont freinées par des outils isolés. Cur10usX remplace tableurs, papier et silos par un flux continu au service de l'apprentissage.",
      items: [
        {
          title: "Données Fragmentées",
          description: "Notes, présences, inscriptions et avis dispersés dans des outils non connectés.",
        },
        {
          title: "Charge Administrative",
          description: "Directions et enseignants consacrent des heures à des tâches manuelles répétitives.",
        },
        {
          title: "Visibilité Tardive",
          description: "Sans suivi longitudinal, les difficultés académiques n'apparaissent qu'en fin de trimestre.",
        },
        {
          title: "Parcours Discontinu",
          description: "L'évolution et les compétences de l'élève se perdent d'une année scolaire à l'autre.",
        },
      ],
    },

    transformation: {
      tag: "Avant & Après",
      headline: "Un changement concret dans le quotidien scolaire.",
      description:
        "Comparez les pratiques traditionnelles avec une infrastructure conçue pour les écoles modernes.",
      tab_legacy: "Modèle traditionnel",
      tab_platform: "Avec Cur10usX",
      steps: [
        {
          title: "Gestion & Inscriptions",
          legacy_title: "Dossiers dispersés",
          legacy_items: [
            "Dossiers papier et tableurs parallèles",
            "Reprise manuelle à chaque rentrée",
            "Historique académique difficile à consolider",
          ],
          platform_title: "Opération centralisée",
          platform_items: [
            "Admissions, inscriptions et classes dans un flux unique",
            "Transition d'année académique structurée",
            "Dossier complet accessible à tout moment",
          ],
        },
        {
          title: "Assiduité & Familles",
          legacy_title: "Communication réactive",
          legacy_items: [
            "Absences signalées avec plusieurs jours de retard",
            "Annonces perdues dans des groupes informels",
            "Parents sans visibilité claire sur le parcours",
          ],
          platform_title: "Suivi continu",
          platform_items: [
            "Saisie numérique des présences et justificatifs",
            "Communications institutionnelles structurées",
            "Accès transparent en temps réel pour les familles",
          ],
        },
        {
          title: "Évaluation & Apprentissage",
          legacy_title: "Uniquement des moyennes finales",
          legacy_items: [
            "Clôtures trimestrielles longues et manuelles",
            "Peu de visibilité sur la maîtrise par notion",
            "Certificats émis sans vérification numérique",
          ],
          platform_title: "Intelligence éducative",
          platform_items: [
            "Moteur d'évaluation configurable avec calculs automatiques",
            "Profil Évolutif et parcours d'apprentissage assisté",
            "Documents officiels vérifiables par code public",
          ],
        },
      ],
    },

    ecosystem: {
      tag: "Pour qui",
      headline: "Une plateforme. Quatre usages simples.",
      description:
        "L'école adopte Cur10usX et toute la communauté y accède — chacun voit uniquement ce dont il a besoin au quotidien.",
      cta_institution: "Inscrire mon école",
      cta_member: "Postuler ou se connecter",
      items: [
        { title: "Élèves", description: "Notes, emploi du temps, devoirs et progrès réunis." },
        { title: "Enseignants", description: "Appel rapide, notes et lien direct avec la classe." },
        { title: "Classes", description: "Horaires, matières et enseignants bien coordonnés." },
        { title: "Présences", description: "Saisie rapide avec alerte immédiate aux parents." },
        { title: "Évaluations", description: "Notes, moyennes et bulletins sans erreurs manuelles." },
        { title: "Documents", description: "Attestations et certificats prêts en quelques minutes." },
        { title: "Communication", description: "Annonces et messages directs entre école et famille." },
        { title: "Parents", description: "Suivre son enfant sans attendre la fin du trimestre." },
      ],
      roles: [
        {
          id: "institutions",
          role: "Écoles",
          title: "Moins de paperasse, une école mieux organisée",
          description:
            "Rassemblez inscriptions, classes, horaires, enseignants et bulletins au même endroit — sans perdre des heures dans des fichiers dispersés.",
          highlights: [
            "Inscriptions en ligne et répartition des classes sans files",
            "Bulletins, moyennes et attestations générés automatiquement",
            "Annonces scolaires livrées directement sur le téléphone des familles",
          ],
        },
        {
          id: "students",
          role: "Élèves",
          title: "Tout ce qu'il faut pour apprendre et progresser",
          description:
            "Consulte ton emploi du temps, tes devoirs et tes notes à tout moment, entraîne-toi sur les sujets difficiles et conserve ton portfolio officiel.",
          highlights: [
            "Notes, devoirs et horaires sur un seul écran clair",
            "Exercices guidés pour avancer à ton rythme",
            "Parcours scolaire et certificats officiels toujours accessibles",
          ],
        },
        {
          id: "teachers",
          role: "Enseignants",
          title: "Plus de temps pour enseigner, moins d'administratif",
          description:
            "Faites l'appel en quelques secondes, saisissez les notes simplement et repérez tôt les élèves qui ont besoin d'accompagnement.",
          highlights: [
            "Appel numérique rapide directement en classe",
            "Saisie simple des examens, devoirs et moyennes",
            "Lien direct avec les élèves et leurs parents",
          ],
        },
        {
          id: "parents",
          role: "Parents",
          title: "Suivez la scolarité de votre enfant en temps réel",
          description:
            "Recevez une alerte en cas d'absence ou de nouvelle note, envoyez vos justificatifs par téléphone et échangez facilement avec l'école.",
          highlights: [
            "Savoir immédiatement si votre enfant était en cours",
            "Suivre notes et progrès tout au long du trimestre",
            "Envoyer un justificatif et lire les annonces officielles",
          ],
        },
      ],
    },

    features: {
      tag: "Fonctionnalités",
      headline: "Cinq piliers pour élever l'expérience éducative.",
      description:
        "Au-delà de la numérisation administrative : Cur10usX relie directement la gestion institutionnelle au développement continu de l'élève.",
      items: [
        {
          id: "institutional",
          eyebrow: "Opérations",
          title: "Gestion Institutionnelle Intelligente",
          description:
            "Admissions, inscriptions, classes, cours, matières, emplois du temps, personnel, évaluations et transitions annuelles réunis dans une seule architecture.",
          bullets: ["Multi-tenant isolé par établissement", "Moteur d'évaluation configurable", "Importations et rapports"],
        },
        {
          id: "evolutionary",
          eyebrow: "Différenciateur",
          title: "Profil Évolutif de l'Élève",
          description:
            "Une trajectoire continue qui suit la progression trimestre après trimestre et année après année, bien au-delà d'un bulletin statique.",
          bullets: ["Historique longitudinal multi-années", "Évolution des moyennes et présences", "Objectifs académiques clairs"],
        },
        {
          id: "portfolio",
          eyebrow: "Certifications",
          title: "Portfolio & Compétences",
          description:
            "Consolidez preuves académiques, relevés, attestations et certificats de fin de cycle dotés d'un code de vérification publique.",
          bullets: ["Portfolio académique structuré", "Certificats et attestations officiels", "Vérification publique par code"],
        },
        {
          id: "tracking",
          eyebrow: "Continuité",
          title: "Suivi Académique en Temps Réel",
          description:
            "Présences, justificatifs, devoirs, examens et communication structurée entre école, enseignants et familles.",
          bullets: ["Présences et justificatifs numériques", "Annonces et messagerie intégrées", "Notifications contextuelles"],
        },
        {
          id: "intelligence",
          eyebrow: "Apprentissage",
          title: "Intelligence Éducative & Apprentissage Assisté",
          description:
            "Détection précoce du risque académique, analyse de la santé des classes et espace d'apprentissage avec parcours, exercices et maîtrise par notion.",
          bullets: ["Alertes d'absentéisme et de baisse de résultats", "Parcours curriculaires et score de maîtrise", "Recommandations pédagogiques concrètes"],
        },
      ],
    },

    evolution: {
      tag: "Parcours de l'Élève",
      headline: "Bien plus que des notes en fin de trimestre.",
      description:
        "Avec le Profil Évolutif, chaque élève construit un suivi vivant de sa scolarité — de la rentrée jusqu'aux certificats officiels.",
      preview_badge: "Suivi continu",
      preview_title: "Une progression claire année après année",
      preview_caption: "Chaque étape relie l'organisation de l'école aux progrès réels de l'élève.",
      stages: [
        {
          step: "01",
          title: "Inscription sans files",
          description: "La candidature et la répartition en classe se font simplement, avec les horaires prêts dès le premier jour.",
        },
        {
          step: "02",
          title: "Quotidien toujours clair",
          description: "Présences, devoirs et notes restent à jour au même endroit pour l'élève et ses parents.",
        },
        {
          step: "03",
          title: "Révisions accompagnées",
          description: "Des exercices guidés aident l'élève à renforcer exactement les matières où il a besoin d'aide.",
        },
        {
          step: "04",
          title: "Réussites conservées",
          description: "Tout le parcours devient un portfolio et des certificats officiels prêts à présenter.",
        },
      ],
      dimensions: [
        { label: "Parcours Scolaire", detail: "Toutes les années réunies dans un seul dossier clair" },
        { label: "Progrès d'Étude", detail: "Notions acquises et points à retravailler" },
        { label: "Assiduité", detail: "Présences et justificatifs clairs pour l'école et la famille" },
        { label: "Certificats Officiels", detail: "Attestations et relevés prêts dès que besoin" },
      ],
    },

    experience: {
      tag: "En Pratique",
      headline: "Simple à prendre en main. Agréable chaque jour.",
      description:
        "Pas d'écrans compliqués ni de menus cachés. Tout est pensé pour accomplir les tâches du quotidien en quelques clics.",
      views: [
        {
          id: "overview",
          label: "Gestion de l'École",
          url: "Espace Direction",
          title: "Inscriptions, classes et bulletins au même endroit",
          description:
            "Visualisez l'état de chaque classe, validez les inscriptions et éditez les relevés sans double saisie.",
        },
        {
          id: "classroom",
          label: "Cours & Familles",
          url: "Salle de Classe et Parents",
          title: "Présences et annonces livrées aussitôt",
          description:
            "L'enseignant fait l'appel en quelques secondes et les parents sont informés sur leur téléphone, avec justificatifs simples.",
        },
        {
          id: "evolution",
          label: "Études & Progrès",
          url: "Espace Élève",
          title: "Chaque élève suit son évolution",
          description:
            "Notes, exercices pratiques pour progresser dans chaque matière et portfolio officiel toujours disponible.",
        },
      ],
    },

    benefits: {
      tag: "Transformation par Profil",
      headline: "Avant et après Cur10usX.",
      description: "Chaque membre de la communauté scolaire vit une transformation concrète.",
      journey: "Avant",
      outcome: "Après",
      items: [
        {
          role: "Directeurs",
          before: "Tableurs, rapports manuels, aucune vision consolidée.",
          after: "Tableau de bord complet en temps réel. Décisions stratégiques en minutes, pas en semaines.",
        },
        {
          role: "Enseignants",
          before: "Paperasse, appel manuel, notes dispersées.",
          after: "Enregistrement rapide, communication intégrée, plus de temps pour enseigner.",
        },
        {
          role: "Parents",
          before: "Aucune visibilité,\ndépendant des appels téléphoniques.",
          after: "Notifications en temps réel. Présences, notes et annonces sur mobile.",
        },
        {
          role: "Élèves",
          before: "Retour tardif,\naucun suivi continu.",
          after: "Progrès visible, intervention précoce, accompagnement personnalisé.",
        },
      ],
    },

    trust: {
      tag: "Architecture & Confiance",
      headline: "Une ingénierie solide pour des écoles exigeantes.",
      description:
        "Sécurité, isolation des données et traçabilité sont intégrées dès la fondation de Cur10usX.",
      points: [
        {
          title: "Isolation Multi-Tenant",
          desc: "Chaque école dispose de son propre périmètre isolé avec cloisonnement strict des données.",
        },
        {
          title: "RBAC & Authentification 2FA",
          desc: "Contrôle d'accès par rôle (direction, enseignants, élèves et parents) avec support 2FA.",
        },
        {
          title: "Audit & Intégrité",
          desc: "Journalisation des actions critiques, limitation de débit et vérification publique des documents.",
        },
        {
          title: "Web Moderne & Responsive",
          desc: "Expérience fluide sur ordinateur, tablette et mobile, en mode clair comme en mode sombre.",
        },
      ],
    },

    vision: {
      tag: "Vision",
      headline: "De meilleurs systèmes créent de meilleures écoles.",
      description:
        "La technologie n'est pas l'objectif. C'est le moyen d'avoir des décisions plus rapides, des interventions plus précoces et des apprentissages plus profonds.",
      points: [
        { title: "Décisions Éclairées", description: "Direction et enseignants avec des données en temps réel pour agir avec confiance." },
        { title: "Intervention Précoce", description: "Problèmes d'apprentissage détectés avant qu'ils ne deviennent critiques." },
        { title: "Communication Efficace", description: "École et familles connectées par un flux d'information continu." },
      ],
    },

    faq: {
      tag: "Questions Fréquentes",
      headline: "Des réponses simples avant de commencer.",
      description: "Ce que les écoles, parents et élèves demandent le plus souvent.",
      items: [
        {
          q: "Cur10usX est-il destiné aux écoles ou aux élèves ?",
          a: "Aux deux. L'école utilise Cur10usX pour organiser inscriptions, classes, horaires et notes — et à partir de là, élèves, enseignants et parents accèdent au même espace pour suivre, réviser et communiquer.",
        },
        {
          q: "Je suis élève ou parent. Comment puis-je accéder ?",
          a: "Si votre école utilise déjà Cur10usX, cliquez sur « Connexion » avec votre invitation ou envoyez une demande d'inscription. Sinon, parlez-en à la direction de votre école.",
        },
        {
          q: "Comment inscrire mon école ?",
          a: "Cliquez sur « Je suis une école · Inscrire » et indiquez les informations de base. Après activation, vous pourrez créer l'année scolaire, les classes et inviter enseignants, élèves et parents.",
        },
        {
          q: "Les données de notre école restent-elles privées ?",
          a: "Toujours. Chaque école dispose de son propre espace privé et protégé — seules les personnes autorisées de votre établissement voient vos élèves et vos classes.",
        },
        {
          q: "Est-ce que cela fonctionne sur téléphone sans rien installer ?",
          a: "Oui. Cur10usX s'ouvre directement dans le navigateur sur téléphone, tablette et ordinateur, en mode clair comme en mode sombre.",
        },
      ],
    },

    cta: {
      tag: "Prêt à simplifier ?",
      headline: "Adoptez Cur10usX dans votre école.",
      description:
        "Moins de temps sur la paperasse, plus de temps pour accompagner chaque élève. Inscrivez votre école ou connectez-vous.",
      button: "Inscrire mon école",
      explore: "Me connecter",
    },

    footer: {
      description:
        "La plateforme simple qui organise l'école et accompagne la progression de chaque élève.",
      product: "Produit",
      resources: "Navigation",
      company: "Accès & Légal",
      link_product: "Vue d'ensemble",
      link_features: "Fonctionnalités",
      link_evolution: "Profil Évolutif",
      link_experience: "Expérience",
      link_institutions: "Pour les écoles",
      link_students: "Pour les élèves",
      link_trust: "Architecture",
      link_faq: "FAQ",
      link_register: "Inscrire un établissement",
      link_apply: "Candidature / Inscription",
      link_signin: "Se connecter",
      status: "Plateforme opérationnelle",
      copyright: "Cur10usX. Tous droits réservés.",
      tos: "Conditions d'utilisation",
      privacy: "Politique de confidentialité",
      contact: "suporte@cur10usx.com",
    },
  },

  common: {
    save: "Enregistrer",
    cancel: "Annuler",
    delete: "Supprimer",
    edit: "Modifier",
    create: "Créer",
    search: "Rechercher",
    loading: "Chargement...",
    noResults: "Aucun résultat",
    confirm: "Confirmer",
    back: "Retour",
  },

  auth: {
    login: "Connexion",
    logout: "Déconnexion",
    signup: "Créer un compte",
    email: "Email",
    password: "Mot de passe",
    forgotPassword: "Mot de passe oublié?",
  },

  nav: {
    dashboard: "Accueil",
    teachers: "Enseignants",
    students: "Élèves",
    parents: "Parents",
    classes: "Classes",
    subjects: "Matières",
    courses: "Cours",
    lessons: "Leçons",
    exams: "Examens",
    assignments: "Devoirs",
    results: "Résultats",
    attendance: "Présences",
    evaluation: "Évaluations",
    recurso: "Recours",
    messages: "Messages",
    announcements: "Annonces",
    academicYears: "Années Académiques",
    enrollments: "Inscriptions",
    settings: "Paramètres",
    profile: "Profil",
    help: "Aide",
    support: "Support",
    schools: "Écoles",
    users: "Utilisateurs",
    stats: "Statistiques",
    applications: "Demandes",
    admins: "Administrateurs",
    gradingConfig: "Config. Évaluation",
    import: "Importer",
    friends: "Amis",
    groupDashboard: "Tableau de bord",
    groupAcademic: "Académique",
    groupEvaluations: "Évaluations",
    groupCommunication: "Communication",
    groupOthers: "Autres",
    groupAdmin: "Administration",
  },
}

export default fr
