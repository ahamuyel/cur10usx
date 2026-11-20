const pt = {
  landing: {
    nav: {
      product: "Produto",
      features: "Funcionalidades",
      institutions: "Para instituições",
      students: "Para estudantes",
      experience: "Plataforma",
      faq: "FAQ",
      problems: "Problema",
      transformation: "Transformação",
      ecosystem: "Ecossistema",
      benefits: "Benefícios",
      trust: "Infraestrutura",
      vision: "Visão",
      explore: "Criar conta",
      demo: "Registar escola",
      signin: "Entrar",
      account: "Conta",
      theme_toggle: "Alternar tema",
      menu_open: "Abrir menu",
      menu_close: "Fechar menu",
    },

    hero: {
      badge: "Infraestrutura Digital Educacional",
      headline: "A infraestrutura digital que\nconecta gestão e evolução\nacadémica.",
      subheadline:
        "Cur10usX une instituições de ensino, estudantes, professores e encarregados de educação num único ecossistema — combinando gestão inteligente, Perfil Evolutivo, portfólio e aprendizagem assistida.",
      cta: "Registar instituição",
      explore: "Explorar a plataforma",
      preview_label: "Visão institucional em tempo real",
    },

    stats: {
      partner_label: "Instituições activas na plataforma",
      schools: "Instituições activas",
      students: "Estudantes",
      teachers: "Professores",
      classes: "Turmas",
    },

    problem: {
      tag: "Problema & Solução",
      headline: "Da operação fragmentada à clareza pedagógica.",
      description:
        "Escolas não sofrem por falta de esforço — sofrem por ferramentas desconectadas. O Cur10usX substitui planilhas, papel e silos por um fluxo contínuo onde cada dado apoia a aprendizagem.",
      items: [
        {
          title: "Dados Fragmentados",
          description: "Notas, presenças, matrículas e comunicados dispersos por múltiplas ferramentas sem ligação entre si.",
        },
        {
          title: "Sobrecarga Administrativa",
          description: "Direcção e docentes perdem horas em processos repetitivos que deveriam ser automáticos.",
        },
        {
          title: "Visibilidade Tardia",
          description: "Sem leitura longitudinal da jornada do aluno, dificuldades académicas só aparecem no fim do trimestre.",
        },
        {
          title: "Jornada Descontínua",
          description: "O percurso e as competências do estudante perdem-se entre anos lectivos e arquivos físicos.",
        },
      ],
    },

    transformation: {
      tag: "Antes e Depois",
      headline: "Uma transição concreta no dia-a-dia escolar.",
      description:
        "Compare o modelo operacional tradicional com uma infraestrutura desenhada para instituições modernas.",
      tab_legacy: "Modelo tradicional",
      tab_platform: "Com Cur10usX",
      steps: [
        {
          title: "Gestão & Matrículas",
          legacy_title: "Registos desconectados",
          legacy_items: [
            "Processos em papel e planilhas paralelas",
            "Retrabalho na transição de ano lectivo",
            "Histórico do aluno difícil de consolidar",
          ],
          platform_title: "Operação centralizada",
          platform_items: [
            "Admissões, matrículas e turmas num fluxo único",
            "Transição de ano lectivo estruturada",
            "Registo académico completo sempre acessível",
          ],
        },
        {
          title: "Assiduidade & Famílias",
          legacy_title: "Comunicação reactiva",
          legacy_items: [
            "Faltas comunicadas dias ou semanas depois",
            "Avisos perdidos em múltiplos canais",
            "Encarregados sem visão clara do percurso",
          ],
          platform_title: "Acompanhamento contínuo",
          platform_items: [
            "Registo digital de presenças e justificações",
            "Notificações e comunicados institucionais",
            "Acesso transparente para encarregados de educação",
          ],
        },
        {
          title: "Avaliação & Aprendizagem",
          legacy_title: "Apenas notas finais",
          legacy_items: [
            "Fechos trimestrais morosos e manuais",
            "Pouca visibilidade sobre domínio por tópico",
            "Certificados emitidos sem verificação digital",
          ],
          platform_title: "Inteligência educacional",
          platform_items: [
            "Motor de avaliação com pautas e médias automáticas",
            "Perfil Evolutivo e trilhas de aprendizagem assistida",
            "Documentos e certificados com verificação pública",
          ],
        },
      ],
    },

    ecosystem: {
      tag: "Ecossistema Conectado",
      headline: "Desenhado para cada papel na comunidade educativa.",
      description:
        "Cada utilizador encontra um ambiente focado nas suas responsabilidades, ligado à mesma fonte de verdade com controlo rigoroso de permissões.",
      cta_institution: "Registar escola",
      cta_member: "Solicitar vinculação",
      items: [
        { title: "Alunos", description: "Perfis completos com histórico, documentos e evolução académica." },
        { title: "Professores", description: "Gestão de turmas, disciplinas, avaliações e comunicação." },
        { title: "Turmas", description: "Organização, horários e alocação de recursos." },
        { title: "Presenças", description: "Registo rápido com alertas automáticos para encarregados." },
        { title: "Avaliações", description: "Notas, médias, pautas e relatórios num fluxo contínuo." },
        { title: "Relatórios", description: "Documentos institucionais gerados automaticamente." },
        { title: "Comunicação", description: "Mensagens e notificações entre escola e famílias." },
        { title: "Pais", description: "Acompanhamento em tempo real da vida escolar." },
      ],
      roles: [
        {
          id: "institutions",
          role: "Instituições",
          title: "Gestão inteligente e visão executiva",
          description:
            "Centralize matrículas, equipas, anos lectivos, regras de avaliação e saúde académica num ambiente multi-tenant isolado e personalizável.",
          highlights: [
            "Saúde académica e indicadores institucionais",
            "Gestão de turmas, cursos, funcionários e permissões",
            "Identidade visual própria e relatórios oficiais",
          ],
        },
        {
          id: "students",
          role: "Estudantes",
          title: "Protagonismo na própria jornada",
          description:
            "Acompanhe o seu Perfil Evolutivo, construa o portfólio académico e avance ao seu ritmo com trilhas de aprendizagem assistida.",
          highlights: [
            "Perfil Evolutivo com progresso por disciplina",
            "Trilhas curriculares, exercícios e domínio por tópico",
            "Horário, tarefas, notas e certificados verificáveis",
          ],
        },
        {
          id: "teachers",
          role: "Professores",
          title: "Menos burocracia, mais foco pedagógico",
          description:
            "Registe aulas, presenças, tarefas e avaliações num painel pensado para o ritmo da sala de aula, com alertas sobre alunos que precisam de apoio.",
          highlights: [
            "Lançamento ágil de notas, provas e tarefas",
            "Sinais precoces de risco académico por turma",
            "Comunicação directa com alunos e encarregados",
          ],
        },
        {
          id: "parents",
          role: "Encarregados de educação",
          title: "Presença activa sem fricção",
          description:
            "Acompanhe a assiduidade, avaliações, avisos e evolução dos seus educandos com clareza, transparência e comunicação directa com a escola.",
          highlights: [
            "Visão consolidada do desempenho do educando",
            "Submissão e acompanhamento de justificações",
            "Avisos institucionais e mensagens centralizadas",
          ],
        },
      ],
    },

    features: {
      tag: "Funcionalidades",
      headline: "Cinco pilares para transformar a experiência educativa.",
      description:
        "Mais do que digitalizar tarefas administrativas: o Cur10usX estrutura o ciclo completo entre gestão institucional e desenvolvimento do estudante.",
      items: [
        {
          id: "institutional",
          eyebrow: "Operação",
          title: "Gestão Institucional Inteligente",
          description:
            "Admissões, matrículas, turmas, cursos, disciplinas, horários, funcionários, pautas e transição de anos lectivos — tudo integrado numa única arquitetura.",
          bullets: ["Multi-tenant isolado por escola", "Motor de avaliação configurável", "Importação em massa e relatórios"],
        },
        {
          id: "evolutionary",
          eyebrow: "Diferencial",
          title: "Perfil Evolutivo do Estudante",
          description:
            "Uma linha contínua que acompanha o crescimento do aluno trimestre a trimestre e ano após ano, indo muito além de um boletim estático.",
          bullets: ["Histórico longitudinal por ano lectivo", "Evolução de médias e assiduidade", "Metas e progresso visível"],
        },
        {
          id: "portfolio",
          eyebrow: "Credenciais",
          title: "Portfólio & Competências",
          description:
            "Consolide evidências académicas, declarações, histórico escolar e certificados de conclusão com código de verificação pública.",
          bullets: ["Portfólio académico estruturado", "Certificados e declarações oficiais", "Verificação pública por código"],
        },
        {
          id: "tracking",
          eyebrow: "Continuidade",
          title: "Acompanhamento Académico",
          description:
            "Registo de presenças, justificações, tarefas, provas e comunicação em tempo real entre escola, docentes e encarregados.",
          bullets: ["Presenças e justificações digitais", "Avisos e mensagens integradas", "Notificações contextuais"],
        },
        {
          id: "intelligence",
          eyebrow: "Aprendizagem",
          title: "Inteligência Educacional & Aprendizagem Assistida",
          description:
            "Detecção precoce de risco académico, análise de saúde das turmas e um ambiente de aprendizagem com trilhas, exercícios e domínio por tópico.",
          bullets: ["Alertas de risco de reprovação e absentismo", "Trilhas curriculares e pontuação de domínio", "Recomendações pedagógicas accionáveis"],
        },
      ],
    },

    evolution: {
      tag: "Perfil Evolutivo",
      headline: "Cada estudante é uma trajetória, não apenas uma pauta.",
      description:
        "O coração do Cur10usX é o Perfil Evolutivo: uma camada contínua que une assiduidade, avaliações, domínio de conteúdos e conquistas num registo vivo da evolução do estudante.",
      preview_badge: "Estrutura do Perfil Evolutivo",
      preview_title: "Visão longitudinal do percurso académico",
      preview_caption: "Representação ilustrativa das dimensões acompanhadas na plataforma.",
      stages: [
        {
          step: "01",
          title: "Ingresso e contexto",
          description: "A candidatura, matrícula e alocação de turma iniciam o registo estruturado do aluno desde o primeiro dia.",
        },
        {
          step: "02",
          title: "Acompanhamento contínuo",
          description: "Assiduidade, tarefas, provas e participação alimentam uma leitura actualizada em cada trimestre.",
        },
        {
          step: "03",
          title: "Domínio e aprendizagem assistida",
          description: "Trilhas curriculares e exercícios identificam competências consolidadas e tópicos que exigem reforço.",
        },
        {
          step: "04",
          title: "Portfólio e certificação",
          description: "O percurso consolida-se em histórico multi-ano e documentos oficiais prontos para verificação pública.",
        },
      ],
      dimensions: [
        { label: "Percurso Académico", detail: "Histórico contínuo por ano lectivo, classe e curso" },
        { label: "Domínio Curricular", detail: "Progresso por unidade, tópico e exercícios resolvidos" },
        { label: "Assiduidade & Compromisso", detail: "Presenças, justificações e consistência de estudo" },
        { label: "Portfólio Verificável", detail: "Declarações, certificados e evidências académicas" },
      ],
    },

    experience: {
      tag: "Experiência da Plataforma",
      headline: "Interfaces reais, construídas para clareza diária.",
      description:
        "Sem menus labirínticos nem sobrecarga visual. Cada ecrã do Cur10usX privilegia legibilidade, velocidade operacional e contexto imediato.",
      views: [
        {
          id: "overview",
          label: "Painel Institucional",
          url: "cur10usx.com/dashboard",
          image: "/screenshots/dashboard-1.png",
          alt: "Interface real do painel institucional Cur10usX",
          title: "Visão consolidada da escola em tempo real",
          description:
            "Acompanhe indicadores académicos, assiduidade, avisos e estado das turmas num painel limpo e orientado à decisão.",
        },
        {
          id: "management",
          label: "Gestão Académica",
          url: "cur10usx.com/list/teachers",
          image: "/screenshots/dashboard-2.png",
          alt: "Interface real de gestão de professores e turmas no Cur10usX",
          title: "Equipas, alunos e turmas organizados com precisão",
          description:
            "Listagens rápidas com pesquisa, filtros, vistas em tabela ou cartão e acções seguras protegidas por perfil.",
        },
      ],
    },

    benefits: {
      tag: "Transformação por Perfil",
      headline: "Antes e depois de Cur10usX.",
      description: "Cada pessoa na comunidade escolar vive uma transformação diferente.",
      journey: "Antes",
      outcome: "Depois",
      items: [
        {
          role: "Diretores",
          before: "Planilhas, relatórios manuais, sem visão consolidada.",
          after: "Dashboard completo com dados em tempo real. Decisões estratégicas em minutos, não semanas.",
        },
        {
          role: "Professores",
          before: "Burocracia, papel, chamada manual, notas dispersas.",
          after: "Registo rápido, comunicação integrada, mais tempo para ensinar.",
        },
        {
          role: "Pais",
          before: "Sem visibilidade,\ndependência de telefonemas.",
          after: "Notificações em tempo real. Presenças, notas e comunicados no telemóvel.",
        },
        {
          role: "Alunos",
          before: "Feedback tardio,\nsem acompanhamento contínuo.",
          after: "Progresso visível, intervenção precoce, suporte personalizado.",
        },
      ],
    },

    trust: {
      tag: "Arquitetura & Confiança",
      headline: "Engenharia sólida para instituições que não podem parar.",
      description:
        "Segurança, isolamento de dados e rastreabilidade fazem parte da fundação técnica do Cur10usX.",
      points: [
        {
          title: "Isolamento Multi-Tenant",
          desc: "Cada escola opera no seu próprio espaço lógico, com fronteiras rigorosas de acesso por instituição.",
        },
        {
          title: "RBAC & Autenticação 2FA",
          desc: "Controlo granular por perfil (direcção, docentes, estudantes e encarregados) com suporte a 2FA.",
        },
        {
          title: "Auditoria & Rastreabilidade",
          desc: "Registo de acções críticas, protecção contra abuso e validação de integridade documental.",
        },
        {
          title: "Web Moderna & Responsiva",
          desc: "Experiência fluida em desktop, tablet e telemóvel, com suporte nativo a modo claro e escuro.",
        },
      ],
    },

    vision: {
      tag: "Visão",
      headline: "Melhores sistemas criam melhores escolas.",
      description:
        "A tecnologia não é o objetivo. É o meio para decisões mais rápidas, intervenções mais cedo e aprendizagens mais profundas.",
      points: [
        { title: "Decisões Informadas", description: "Diretores e professores com dados em tempo real para agir com confiança." },
        { title: "Intervenção Precoce", description: "Problemas de aprendizagem detetados antes que se tornem críticos." },
        { title: "Comunicação Eficaz", description: "Escola e famílias ligadas por um fluxo de informação contínuo." },
      ],
    },

    faq: {
      tag: "Perguntas Frequentes",
      headline: "Respostas diretas antes de começar.",
      description: "Os detalhes essenciais sobre adopção, segurança e funcionamento da plataforma.",
      items: [
        {
          q: "O que diferencia o Cur10usX de um software escolar tradicional?",
          a: "Além de cobrir a gestão administrativa e académica (matrículas, turmas, pautas, assiduidade e certificados), o Cur10usX integra o Perfil Evolutivo do estudante, indicadores de risco académico e um módulo de aprendizagem assistida — ligando operação e aprendizagem num único sistema.",
        },
        {
          q: "Como funciona o isolamento de dados entre escolas?",
          a: "O Cur10usX utiliza uma arquitetura multi-tenant com validação por instituição em todas as consultas e rotas, além de controlo de acesso por perfil (RBAC), autenticação de dois factores (2FA) e registo de auditoria.",
        },
        {
          q: "Quem pode utilizar a plataforma dentro da instituição?",
          a: "A plataforma oferece experiências dedicadas para administradores escolares, professores, estudantes e encarregados de educação — cada um com acesso apenas às informações e acções da sua competência.",
        },
        {
          q: "Como posso registar a minha escola?",
          a: "Clique em «Registar instituição», preencha os dados da escola e do administrador principal. Após aprovação e activação, a instituição pode configurar o seu tema visual, anos lectivos, cursos, turmas e equipa.",
        },
        {
          q: "A plataforma funciona em telemóvel e em modo escuro?",
          a: "Sim. Tanto a página pública como os painéis internos foram construídos com design responsivo para telemóvel, tablet e desktop, com suporte completo a Light Mode e Dark Mode.",
        },
      ],
    },

    cta: {
      tag: "Comece hoje",
      headline: "Eleve a gestão e a jornada educativa da sua instituição.",
      description:
        "Registe a sua escola na plataforma ou aceda à sua conta para começar a conectar direcção, docentes, estudantes e famílias.",
      button: "Registar instituição",
      explore: "Entrar na plataforma",
    },

    footer: {
      description:
        "Infraestrutura digital educacional que une gestão inteligente, Perfil Evolutivo e aprendizagem assistida.",
      product: "Produto",
      resources: "Navegação",
      company: "Acesso & Legal",
      link_product: "Visão Geral",
      link_features: "Funcionalidades",
      link_evolution: "Perfil Evolutivo",
      link_experience: "Experiência",
      link_institutions: "Para instituições",
      link_students: "Para estudantes",
      link_trust: "Arquitetura",
      link_faq: "Perguntas frequentes",
      link_register: "Registar instituição",
      link_apply: "Candidatura / Matrícula",
      link_signin: "Iniciar sessão",
      status: "Plataforma operacional",
      copyright: "Cur10usX. Todos os direitos reservados.",
      tos: "Termos de serviço",
      privacy: "Política de privacidade",
      contact: "suporte@cur10usx.com",
    },
  },

  common: {
    save: "Guardar",
    cancel: "Cancelar",
    delete: "Eliminar",
    edit: "Editar",
    create: "Criar",
    search: "Pesquisar",
    loading: "A carregar...",
    noResults: "Sem resultados",
    confirm: "Confirmar",
    back: "Voltar",
  },

  auth: {
    login: "Entrar",
    logout: "Sair",
    signup: "Criar conta",
    email: "Email",
    password: "Palavra-passe",
    forgotPassword: "Esqueceu a password?",
  },

  nav: {
    dashboard: "Início",
    teachers: "Professores",
    students: "Alunos",
    parents: "Encarregados",
    classes: "Turmas",
    subjects: "Disciplinas",
    courses: "Cursos",
    lessons: "Aulas",
    exams: "Provas",
    assignments: "Tarefas",
    results: "Resultados",
    attendance: "Assiduidade",
    evaluation: "Avaliações",
    recurso: "Recursos",
    messages: "Mensagens",
    announcements: "Avisos",
    academicYears: "Anos Letivos",
    enrollments: "Matrículas",
    settings: "Configurações",
    profile: "Perfil",
    help: "Ajuda",
    support: "Suporte",
    schools: "Escolas",
    users: "Utilizadores",
    stats: "Estatísticas",
    applications: "Solicitações",
    admins: "Administradores",
    gradingConfig: "Config. Avaliação",
    import: "Importar",
    friends: "Amigos",
    groupDashboard: "Dashboard",
    groupAcademic: "Académico",
    groupEvaluations: "Avaliações",
    groupCommunication: "Comunicação",
    groupOthers: "Outros",
    groupAdmin: "Administração",
  },
}

export default pt
