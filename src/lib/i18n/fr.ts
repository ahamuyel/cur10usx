const fr = {
  landing: {
    nav: {
      problems: "Le défi",
      transformation: "Solution",
      ecosystem: "Modules",
      benefits: "Avantages",
      vision: "Futur",
      trust: "Pourquoi Cur10usX",
      explore: "Explorer",
      demo: "Demander une démo",
      signin: "Se connecter",
    },
    hero: {
      badge: "Plateforme de gestion scolaire n°1 en Angola",
      headline: "Le Système d'Exploitation\nde Votre École",
      subheadline:
        "Remplacez les tableurs, les cahiers et les groupes WhatsApp par une plateforme unique. Élèves, enseignants, évaluations et rapports — tout centralisé au même endroit.",
      cta: "Demander une démonstration",
      explore: "Voir le produit en 60s",
      stats: "écoles angolaises l'utilisent déjà",
      trusted_by: "Des écoles qui font confiance à Cur10usX",
    },
    problem: {
      tag: "Le défi auquel les écoles sont confrontées",
      headline: "Chaque information devrait être au même endroit. Mais pour la plupart des écoles, elle est dispersée.",
      description:
        "Au quotidien, les notes sont dans un tableur, les présences dans un cahier, les communications sur WhatsApp et les rapports dans des fichiers perdus. L'équipe administrative est débordée. Les enseignants perdent du temps dans la bureaucratie. Et les directeurs manquent de visibilité claire sur ce qui se passe réellement.",
      items: [
        {
          title: "Documents et données éparpillés",
          description:
            "Les informations importantes sur les élèves, les classes et les calendriers se trouvent dans des systèmes différents. Votre équipe passe des heures à consolider des données qui devraient être disponibles instantanément.",
        },
        {
          title: "Processus chronophages",
          description:
            "Les enseignants passent plus de temps à remplir des formulaires et des tableaux qu'à préparer les cours ou à accompagner les élèves. Les rapports de fin de trimestre demandent des semaines de travail manuel.",
        },
        {
          title: "Visibilité limitée",
          description:
            "Sans données centralisées et à jour, les directeurs ne peuvent pas identifier les problèmes à temps. Les élèves en difficulté passent inaperçus jusqu'à ce qu'il soit trop tard pour intervenir.",
        },
        {
          title: "Communication fragmentée",
          description:
            "Mots égarés, messages dans des groupes dispersés et parents qui manquent d'informations importantes. La communication scolaire doit être aussi organisée que l'institution elle-même.",
        },
      ],
    },
    transformation: {
      tag: "De la complexité à la clarté",
      headline: "Le passage d'opérations dispersées à une école connectée.",
      description:
        "Cur10usX transforme la gestion scolaire. Elle unifie les processus, centralise les données et donne à votre équipe les outils nécessaires pour prendre des décisions en toute confiance.",
      legacy: "Avant",
      platform: "Avec Cur10usX",
      steps: [
        {
          title: "Gestion des élèves",
          before: {
            title: "Informations dispersées",
            items: [
              "Fiches manuelles et dossiers physiques",
              "Inscriptions sur papier avec risque d'erreurs",
              "Historique difficile à consulter",
            ],
            status: "Dispersé",
          },
          after: {
            title: "Registre centralisé",
            items: [
              "Profil unique de chaque élève avec tout son historique",
              "Inscriptions simplifiées en quelques clics",
              "Documents et registres toujours accessibles",
            ],
            status: "Centralisé",
          },
        },
        {
          title: "Présences",
          before: {
            title: "Contrôle manuel",
            items: [
              "Listes papier et consolidation manuelle",
              "Données uniquement disponibles à la fin du mois",
              "Parents informés des absences bien trop tard",
            ],
            status: "Manuel",
          },
          after: {
            title: "Enregistrement instantané",
            items: [
              "Présences enregistrées sur le téléphone de l'enseignant",
              "Notification automatique aux parents en cas d'absence",
              "Rapports disponibles pour la direction",
            ],
            status: "Automatique",
          },
        },
        {
          title: "Évaluations",
          before: {
            title: "Tableaux et erreurs",
            items: [
              "Notes dans des feuilles de calcul distinctes",
              "Des semaines pour compiler les rapports finaux",
              "Erreurs fréquentes dans le calcul des moyennes",
            ],
            status: "Sujet aux erreurs",
          },
          after: {
            title: "Gestion intégrée",
            items: [
              "Notes centralisées et alignées avec le programme scolaire",
              "Moyennes calculées automatiquement",
              "Rapports finaux générés en un seul clic",
            ],
            status: "Précis",
          },
        },
      ],
    },
    multiTenant: {
      tag: "Conçu pour Grandir",
      headline: "Une plateforme. Plusieurs écoles. Contrôle total.",
      description:
        "Cur10usX a été conçu dès le départ comme une plateforme multi-tenant. Chaque école dispose de son propre environnement isolé, tandis que la direction du groupe a une visibilité consolidée sur l'ensemble des établissements.",
      features: [
        {
          title: "Environnements indépendants",
          desc: "Chaque école opère dans son propre espace, avec ses propres données, élèves, enseignants et configurations — totalement isolés et sécurisés.",
        },
        {
          title: "Image de marque personnalisée",
          desc: "Chaque école peut avoir son logo, ses couleurs et son identité visuelle. Cur10usX s'adapte à la marque de l'établissement, pas l'inverse.",
        },
        {
          title: "Rapports consolidés",
          desc: "La direction du groupe peut visualiser les données agrégées de toutes les écoles dans un seul tableau de bord, sans perdre les détails de chaque unité.",
        },
        {
          title: "Gestion centralisée",
          desc: "Créez et gérez les utilisateurs, les permissions et les configurations de toutes les écoles à partir d'un seul panneau d'administration.",
        },
      ],
    },
    ecosystem: {
      tag: "Tout fonctionne ensemble",
      headline: "Tout ce dont votre école a besoin. Réuni en un seul endroit.",
      description:
        "Cur10usX n'est pas une collection d'outils isolés. C'est un écosystème où élèves, enseignants, classes, évaluations et communication fonctionnent comme un système unifié.",
      capabilities: "Ce qui est inclus",
      modules: [
        {
          id: "academic",
          title: "Élèves",
          description:
            "Profil complet, inscription simplifiée et historique scolaire toujours disponible.",
        },
        {
          id: "teachers",
          title: "Enseignants",
          description:
            "Données professionnelles, classes attribuées et matières enseignées dans un seul registre.",
        },
        {
          id: "classes",
          title: "Classes",
          description:
            "Organisation des classes, emplois du temps et affectation des matières et enseignants.",
        },
        {
          id: "attendance",
          title: "Présences",
          description:
            "Enregistrement rapide sur mobile avec notification automatique aux parents.",
        },
        {
          id: "assessments",
          title: "Évaluations",
          description:
            "Saisie des notes, calcul automatique des moyennes et rapports de performance.",
        },
        {
          id: "reporting",
          title: "Rapports",
          description:
            "Bulletins, relevés de notes et historiques générés automatiquement. Prêts à imprimer.",
        },
        {
          id: "communication",
          title: "Communication",
          description:
            "Avis, notifications et messages directs aux parents, enseignants et élèves.",
        },
        {
          id: "records",
          title: "Dossiers scolaires",
          description:
            "Historique scolaire complet, certificats et documents académiques organisés.",
        },
      ],
    },
    benefits: {
      tag: "Des avantages pour tous",
      headline: "Chaque membre de la communauté scolaire y trouve son compte.",
      description:
        "Cur10usX a été conçue pour simplifier le quotidien de tous les acteurs de l'éducation.",
      items: [
        {
          role: "Directeurs",
          title: "Vision complète de l'établissement",
          description:
            "Accédez à toutes les informations consolidées de votre école. Décidez en toute confiance sur la base de données réelles et à jour.",
          points: [
            "Visibilité totale sur les opérations",
            "Rapports consolidés en quelques secondes",
            "Décisions basées sur des données réelles",
          ],
        },
        {
          role: "Enseignants",
          title: "Moins de bureaucratie, plus d'enseignement",
          description:
            "Réduisez le temps consacré aux tâches administratives. Enregistrez les présences, saisissez les notes et communiquez avec les parents en toute simplicité.",
          points: [
            "Enregistrement des présences sur mobile",
            "Saisie des notes simplifiée",
            "Plus de temps pour préparer les cours",
          ],
        },
        {
          role: "Élèves",
          title: "Un meilleur accompagnement",
          description:
            "Grâce aux informations centralisées, les enseignants et les directeurs suivent de près les progrès de chaque élève et interviennent si nécessaire.",
          points: [
            "Suivi continu des performances",
            "Intervention précoce en cas de besoin",
            "Parcours scolaire plus transparent",
          ],
        },
        {
          role: "Parents",
          title: "Plus de transparence et de confiance",
          description:
            "Suivez le parcours scolaire de votre enfant. Recevez des notifications sur les présences, les notes et les communications importantes.",
          points: [
            "Notifications en temps réel",
            "Accès aux notes et aux présences",
            "Communication directe avec l'école",
          ],
        },
      ],
    },
    testimonials: {
      tag: "Ce que disent les directeurs",
      headline: "Ceux qui l'utilisent le recommandent.",
      description: "Directeurs et gestionnaires d'écoles partagent comment Cur10usX a transformé la gestion de leur établissement.",
      items: [
        {
          quote: "Avant, consolider le rapport de fin de période prenait deux semaines. Maintenant, c'est un clic. La différence dans l'organisation de l'école a été énorme.",
          author: "João Silva",
          role: "Directeur Pédagogique",
          school: "Colégio São Miguel",
        },
        {
          quote: "Nous avons enfin laissé les tableurs derrière nous. Nous avons trois écoles et je peux maintenant tout voir dans un seul tableau de bord — présences, notes, communications. Cela a tout changé.",
          author: "Maria Fernandes",
          role: "Directrice Générale",
          school: "Réseau d'Enseignement Horizonte",
        },
        {
          quote: "Ce qui m'a le plus impressionné, c'est la communication avec les parents. Les absences sont notifiées automatiquement. Les parents se sentent plus impliqués.",
          author: "António Domingos",
          role: "Administrateur Scolaire",
          school: "École Secondaire Moderne",
        },
      ],
    },
    vision: {
      tag: "Bâtir les bases de l'avenir",
      headline: "Les écoles qui s'organisent aujourd'hui se préparent pour demain.",
      description:
        "Moderniser une école ne se résume pas à la technologie. Il s'agit de bâtir une institution mieux préparée, plus efficace et plus apte à soutenir le développement de chaque élève.",
      points: [
        {
          title: "Une organisation qui permet de grandir",
          description:
            "Avec des processus centralisés et des informations fiables, votre école peut se développer sans perdre le contrôle de ses opérations.",
        },
        {
          title: "Une visibilité qui transforme",
          description:
            "Quand les enseignants ont le temps d'enseigner et que les directeurs ont des données pour décider, les élèves bénéficient d'un parcours scolaire plus enrichissant.",
        },
        {
          title: "Une base solide pour l'avenir",
          description:
            "Les institutions bien organisées aujourd'hui seront prêtes à adopter de nouvelles pratiques pédagogiques et à offrir de meilleures opportunités aux élèves.",
        },
      ],
    },
    trust: {
      tag: "Pourquoi les écoles choisissent Cur10usX",
      headline: "Des opérations plus claires. De meilleurs résultats. Un impact réel.",
      description:
        "Les directeurs et administrateurs scolaires choisissent Cur10usX non pas pour sa technologie, mais pour ce qu'elle rend possible : une école plus organisée, plus efficace et plus axée sur les élèves.",
      points: [
        {
          title: "Gagnez du temps",
          desc: "Éliminez des heures de travail manuel grâce à des processus automatisés. Votre équipe peut se concentrer sur ce qui compte le plus.",
        },
        {
          title: "Améliorez l'organisation",
          desc: "Centralisez toutes les informations scolaires en un seul endroit. Les données des élèves, des enseignants, des classes et des évaluations sont toujours accessibles.",
        },
        {
          title: "Augmentez la visibilité",
          desc: "Les directeurs ont une vision claire et à jour de l'ensemble de l'établissement. Des décisions basées sur des faits, pas des suppositions.",
        },
        {
          title: "Soutenez la croissance",
          desc: "Grâce à un meilleur suivi académique, les élèves reçoivent le soutien nécessaire pour atteindre leur plein potentiel.",
        },
      ],
    },
    faq: {
      tag: "Questions Fréquentes",
      headline: "Tout ce que vous devez savoir.",
      description: "Réponses rapides aux questions les plus courantes sur Cur10usX.",
      items: [
        {
          q: "Devons-nous installer un logiciel ?",
          a: "Non. Cur10usX est 100% en ligne (SaaS). Il fonctionne sur tout ordinateur, tablette ou téléphone avec accès internet. Pas de serveurs, installations ou maintenance technique nécessaires.",
        },
        {
          q: "Pouvons-nous migrer nos données existantes ?",
          a: "Oui. L'équipe Cur10usX vous aide à migrer vos données — élèves, enseignants, classes, notes et historiques — à partir de tableurs ou d'autres systèmes. Le processus est simple et sécurisé.",
        },
        {
          q: "Chaque école a-t-elle besoin d'un compte séparé ?",
          a: "Pas nécessairement. Cur10usX prend en charge plusieurs écoles sur une seule plateforme (multi-tenant). Vous pouvez gérer plusieurs établissements depuis un seul tableau de bord, avec des données isolées et indépendantes.",
        },
        {
          q: "Combien de temps prend la mise en œuvre ?",
          a: "La configuration initiale peut être réalisée en quelques jours, pas en mois. Après la migration des données, l'équipe de l'école commence à utiliser le système immédiatement avec un accompagnement dédié.",
        },
        {
          q: "Est-ce sécurisé ? Où les données sont-elles stockées ?",
          a: "Oui. Les données sont stockées sur des serveurs sécurisés avec chiffrement, sauvegardes quotidiennes et conformité aux réglementations sur la protection des données (RGPD).",
        },
        {
          q: "Pouvons-nous personnaliser avec notre logo et nos couleurs ?",
          a: "Oui. Chaque école peut personnaliser la plateforme avec son logo, ses couleurs institutionnelles et son identité visuelle. Cur10usX s'adapte à votre marque.",
        },
      ],
    },
    cta: {
      tag: "Une école préparée pour l'avenir",
      headline: "Moderniser une école ne commence pas par plus de travail.",
      description:
        "Cela commence par de meilleurs systèmes, une meilleure visibilité et de meilleurs outils pour grandir. Cur10usX aide votre école à organiser le présent et à préparer l'avenir.",
      button: "Demander une démonstration",
    },
    footer: {
      description:
        "Plateforme de gestion scolaire qui aide les établissements d'enseignement en Angola à organiser les informations, simplifier les opérations et créer de meilleures expériences éducatives.",
      product: "PLATEFORME",
      resources: "RESSOURCES",
      company: "ÉTABLISSEMENT",
      contact: "CONTACT",
      status: "Opérationnel",
      copyright: "Cur10usX. Gestion scolaire.",
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
    noResults: "Aucun résultat trouvé",
    confirm: "Confirmer",
    back: "Retour",
  },
  auth: {
    login: "Se connecter",
    logout: "Se déconnecter",
    signup: "Créer un compte",
    email: "E-mail",
    password: "Mot de passe",
    forgotPassword: "Mot de passe oublié ?",
  },
  nav: {
    dashboard: "Accueil",
    teachers: "Enseignants",
    students: "Élèves",
    parents: "Parents",
    classes: "Classes",
    subjects: "Matières",
    courses: "Formations",
    lessons: "Cours",
    exams: "Examens",
    assignments: "Devoirs",
    results: "Résultats",
    attendance: "Présences",
    messages: "Messages",
    announcements: "Annonces",
    settings: "Paramètres",
    profile: "Profil",
    help: "Aide",
    academicYears: "Années Académiques",
    enrollments: "Inscriptions",
    evaluation: "Évaluations",
    recurso: "Rattrapages",
    friends: "Amis",
    applications: "Candidatures",
    admins: "Administrateurs",
    gradingConfig: "Config. Évaluation",
    import: "Importer",
    support: "Support",
    schools: "Écoles",
    users: "Utilisateurs",
    catalog: "Catalogue",
    stats: "Statistiques",
    superAdmins: "Super Admins",
    groupDashboard: "Tableau de bord",
    groupAcademic: "Gestion Académique",
    groupEvaluations: "Évaluations",
    groupCommunication: "Communication",
    groupAdmin: "Administration",
    groupOthers: "Autres",
  },
  settings: {
    title: "Paramètres",
    subtitle: "Gérez vos préférences",
    appearance: "Apparence",
    darkMode: "Mode sombre",
    darkModeDesc: "Basculer entre le thème clair et sombre",
    language: "Langue",
    languageDesc: "Langue de l'interface",
    notifications: "Notifications",
    platformNotifs: "Notifications sur la plateforme",
    platformNotifsDesc: "Recevoir des alertes en temps réel",
    emailNotifs: "Notifications par e-mail",
    emailNotifsDesc: "Résumé quotidien par e-mail",
    schoolSection: "École",
    schoolCustom: "Personnaliser l'école",
    schoolCustomDesc: "Logo, couleur primaire et identité visuelle",
    schoolConfigBtn: "Configurer",
    securitySection: "Sécurité",
    changePassword: "Modifier le mot de passe",
    changePasswordDesc: "Mettez à jour votre mot de passe d'accès",
    changePasswordBtn: "Modifier",
    twoFactor: "Authentification à deux facteurs",
    twoFactorDesc: "Ajouter une couche de sécurité supplémentaire",
    twoFactorBtn: "Configurer",
    gdpr: "Confidentialité et données",
    gdprDesc: "Exporter ou supprimer mes données (RGPD)",
    gdprBtn: "Gérer",
    activeSessions: "Sessions actives",
    activeSessionsDesc: "Gérer les appareils connectés",
    activeSessionsBtn: "Gérer",
    saving: "Enregistrement...",
  },
}

export default fr
