const fr = {
  landing: {
    nav: {
      product: "Produit",
      features: "Fonctionnalités",
      institutions: "Pour les écoles",
      students: "Pour les élèves",
      experience: "Plateforme",
      faq: "FAQ",
      problems: "Problème",
      transformation: "Transformation",
      ecosystem: "Écosystème",
      benefits: "Avantages",
      trust: "Infrastructure",
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
      badge: "Infrastructure Numérique Éducative",
      headline: "L'infrastructure numérique qui\nrelie gestion et évolution\nacadémique.",
      subheadline:
        "Cur10usX réunit établissements, élèves, enseignants et parents dans un même écosystème — combinant gestion intelligente, Profil Évolutif, portfolio et apprentissage assisté.",
      cta: "Inscrire un établissement",
      explore: "Découvrir la plateforme",
      preview_label: "Vue institutionnelle en temps réel",
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
      tag: "Écosystème Connecté",
      headline: "Conçu pour chaque rôle de la communauté éducative.",
      description:
        "Chaque utilisateur dispose d'un espace clair relié à la même source de vérité, protégé par des permissions granulaires.",
      cta_institution: "Inscrire une école",
      cta_member: "Demander une inscription",
      items: [
        { title: "Élèves", description: "Profils complets avec historique, documents et évolution académique." },
        { title: "Enseignants", description: "Gestion des classes, matières, évaluations et communication." },
        { title: "Classes", description: "Organisation, emplois du temps et allocation des ressources." },
        { title: "Présences", description: "Enregistrement rapide avec alertes automatiques pour les parents." },
        { title: "Évaluations", description: "Notes, moyennes, bulletins et rapports dans un flux continu." },
        { title: "Rapports", description: "Documents institutionnels générés automatiquement." },
        { title: "Communication", description: "Messages et notifications entre l'école et les familles." },
        { title: "Parents", description: "Suivi en temps réel de la vie scolaire." },
      ],
      roles: [
        {
          id: "institutions",
          role: "Établissements",
          title: "Gestion intelligente et vision exécutive",
          description:
            "Centralisez inscriptions, équipes, années académiques, règles d'évaluation et santé académique dans un espace multi-tenant isolé et personnalisable.",
          highlights: [
            "Santé académique et indicateurs institutionnels",
            "Classes, cours, personnel et permissions granulaires",
            "Identité visuelle propre et rapports officiels",
          ],
        },
        {
          id: "students",
          role: "Élèves",
          title: "Acteur de sa propre progression",
          description:
            "Suivez votre Profil Évolutif, construisez votre portfolio académique et progressez grâce aux parcours d'apprentissage assisté.",
          highlights: [
            "Profil Évolutif avec progression par matière",
            "Parcours curriculaires, exercices et maîtrise par sujet",
            "Emploi du temps, devoirs, notes et certificats vérifiables",
          ],
        },
        {
          id: "teachers",
          role: "Enseignants",
          title: "Moins d'administratif, plus de pédagogie",
          description:
            "Enregistrez cours, présences, devoirs et évaluations dans une interface fluide, avec des signaux précoces sur les élèves à accompagner.",
          highlights: [
            "Saisie rapide des notes, examens et devoirs",
            "Alertes précoces de risque académique par classe",
            "Communication directe avec élèves et parents",
          ],
        },
        {
          id: "parents",
          role: "Parents & Tuteurs",
          title: "Suivi actif sans friction",
          description:
            "Consultez présences, évaluations, annonces et évolution de vos enfants en toute transparence et restez en lien direct avec l'école.",
          highlights: [
            "Vue consolidée des résultats et de l'assiduité",
            "Envoi numérique des justificatifs d'absence",
            "Annonces institutionnelles et messagerie centralisées",
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
      tag: "Profil Évolutif",
      headline: "Chaque élève est une trajectoire, pas seulement un bulletin.",
      description:
        "Au cœur de Cur10usX se trouve le Profil Évolutif : un dossier vivant qui relie assiduité, évaluations, maîtrise des notions et étapes clés tout au long du parcours scolaire.",
      preview_badge: "Architecture du Profil Évolutif",
      preview_title: "Vue longitudinale de la progression",
      preview_caption: "Représentation illustrative des dimensions suivies dans la plateforme.",
      stages: [
        {
          step: "01",
          title: "Admission et contexte",
          description: "Candidature, inscription et affectation en classe créent un dossier structuré dès le premier jour.",
        },
        {
          step: "02",
          title: "Suivi continu",
          description: "Présences, devoirs, examens et engagement maintiennent une vision claire à chaque trimestre.",
        },
        {
          step: "03",
          title: "Maîtrise et apprentissage assisté",
          description: "Parcours curriculaires et exercices identifient les acquis et les points à renforcer.",
        },
        {
          step: "04",
          title: "Portfolio et certification",
          description: "Le parcours se consolide en historique pluriannuel et documents officiels vérifiables.",
        },
      ],
      dimensions: [
        { label: "Parcours Académique", detail: "Historique continu par année, niveau et filière" },
        { label: "Maîtrise Curriculaire", detail: "Progression par unité, thème et exercices résolus" },
        { label: "Assiduité & Régularité", detail: "Présences, justificatifs et constance d'étude" },
        { label: "Portfolio Vérifiable", detail: "Attestations, certificats et preuves académiques" },
      ],
    },

    experience: {
      tag: "Expérience de la Plateforme",
      headline: "Des interfaces conçues pour la clarté quotidienne.",
      description:
        "Sans menus complexes ni surcharge visuelle. Chaque écran de Cur10usX privilégie la lisibilité, la rapidité et le contexte immédiat.",
      views: [
        {
          id: "overview",
          label: "Tableau de bord",
          url: "cur10usx.com/dashboard",
          title: "Vision consolidée de votre établissement en temps réel",
          description:
            "Suivez la santé académique des classes, l'assiduité, les inscriptions actives et les autorisations depuis un espace clair.",
        },
        {
          id: "evolution",
          label: "Profil Évolutif",
          url: "cur10usx.com/aprender",
          title: "Trajectoire, maîtrise par notion et portfolio vérifiable",
          description:
            "Parcours curriculaires, progression longitudinale et certificats à code public réunis dans un seul dossier continu.",
        },
        {
          id: "classroom",
          label: "Enseignants & Familles",
          url: "cur10usx.com/list/lessons",
          title: "Cours, présences numériques et suivi synchronisé",
          description:
            "Appel rapide en classe, justificatifs d'absence et notifications structurées qui gardent les familles informées.",
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
      headline: "Des réponses claires avant de commencer.",
      description: "L'essentiel sur l'adoption, la sécurité et le fonctionnement de la plateforme.",
      items: [
        {
          q: "Qu'est-ce qui distingue Cur10usX d'un logiciel scolaire classique ?",
          a: "En plus de la gestion administrative et académique (inscriptions, classes, notes, présences et certificats), Cur10usX intègre le Profil Évolutif de l'élève, les indicateurs de risque académique et l'apprentissage assisté dans une même plateforme.",
        },
        {
          q: "Comment l'isolation des données entre établissements est-elle garantie ?",
          a: "Cur10usX repose sur une architecture multi-tenant avec cloisonnement par établissement sur chaque requête, contrôle d'accès par rôle (RBAC), authentification à deux facteurs (2FA) et journal d'audit.",
        },
        {
          q: "Qui peut utiliser la plateforme au sein de l'école ?",
          a: "La plateforme propose des espaces dédiés aux administrateurs scolaires, enseignants, élèves et parents — chacun accédant uniquement aux données et actions de son rôle.",
        },
        {
          q: "Comment inscrire mon établissement ?",
          a: "Cliquez sur « Inscrire un établissement » et renseignez les informations de votre école et de l'administrateur principal. Après validation et activation, vous pouvez personnaliser votre espace et configurer vos classes.",
        },
        {
          q: "La plateforme fonctionne-t-elle sur mobile et en mode sombre ?",
          a: "Oui. Le site public comme les tableaux de bord internes sont entièrement responsives sur mobile, tablette et ordinateur, avec support complet des thèmes clair et sombre.",
        },
      ],
    },

    cta: {
      tag: "Démarrer",
      headline: "Faites évoluer la gestion et le suivi éducatif de votre école.",
      description:
        "Inscrivez votre établissement ou connectez-vous pour relier direction, enseignants, élèves et familles.",
      button: "Inscrire un établissement",
      explore: "Accéder à la plateforme",
    },

    footer: {
      description:
        "Infrastructure numérique éducative combinant gestion intelligente, Profil Évolutif et apprentissage assisté.",
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
