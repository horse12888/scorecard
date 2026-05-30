export type ImpulseDimension =
  | "clarity"
  | "acquisition"
  | "operations"
  | "margins"
  | "asset"
  | "readiness";

export type ImpulseStage =
  | "FOUNDATION"
  | "MARKET_TRACTION"
  | "OPERATING_STABILITY"
  | "VALUE_ARCHITECTURE"
  | "SCALE_READINESS";

export type FunctionConstraint = {
  id: string;
  label: string;
  dimensions: ImpulseDimension[];
  stages: ImpulseStage[];
  trigger: string;
  implication: string;
  work: string;
  avoid: string;
};

export const IMPULSE_STAGE_DATABASE: Record<
  ImpulseStage,
  {
    label: string;
    role: string;
    headline: string;
    coreConstraint: string;
    strategicReviewFocus: string;
    graduationCriteria: string[];
    nonFare: string;
    sourceConcepts: string[];
  }
> = {
  FOUNDATION: {
    label: "Foundation",
    role: "Founder as validator",
    headline:
      "Il business deve dimostrare che esiste una proposta abbastanza chiara da essere capita, provata e pagata.",
    coreConstraint:
      "Il valore non è ancora sufficientemente validato, monetizzato o leggibile.",
    strategicReviewFocus:
      "Chiarire cliente, problema, promessa, offerta minima vendibile, pricing iniziale e prove reali di domanda.",
    graduationCriteria: [
      "L’offerta è descrivibile in modo semplice.",
      "Esistono segnali reali di interesse o utilizzo.",
      "Almeno alcuni clienti sono disposti a pagare.",
      "Il business sa distinguere feedback positivo da domanda pagante.",
      "I primi pagamenti, costi e risultati sono tracciati."
    ],
    nonFare:
      "Non costruire struttura, automazioni o team prima di aver validato proposta, cliente e disponibilità a pagare.",
    sourceConcepts: ["Market Proof Before Monetization", "First Paid Proof"]
  },

  MARKET_TRACTION: {
    label: "Market Traction",
    role: "Founder as demand builder",
    headline:
      "Il business deve trasformare vendite episodiche in domanda più stabile, tracciabile e ripetibile.",
    coreConstraint:
      "La crescita dipende ancora da sforzo personale, referral casuali o canali non misurati.",
    strategicReviewFocus:
      "Identificare il canale più promettente, rendere il messaggio più chiaro, tracciare lead e conversioni, e costruire una routine commerciale sostenibile.",
    graduationCriteria: [
      "I nuovi clienti arrivano con maggiore regolarità.",
      "Il business sa quali attività generano opportunità reali.",
      "Esiste una prima logica di follow-up e conversione.",
      "La qualità della delivery resta accettabile anche con più domanda.",
      "Costi, entrate e attività commerciali sono monitorati."
    ],
    nonFare:
      "Non moltiplicare canali, offerte o campagne prima di sapere cosa produce clienti buoni in modo ripetibile.",
    sourceConcepts: ["Consistent Demand Creation"]
  },

  OPERATING_STABILITY: {
    label: "Operating Stability",
    role: "Founder as system builder",
    headline:
      "Il business deve passare da esecuzione personale a sistema operativo minimo.",
    coreConstraint:
      "Il founder è ancora troppo centrale nella delivery, nelle decisioni, nel controllo qualità o nel coordinamento del team.",
    strategicReviewFocus:
      "Stabilizzare delivery, onboarding, responsabilità, processi critici, dati cliente, margini e gestione delle priorità.",
    graduationCriteria: [
      "Il team può eseguire attività essenziali senza dipendere sempre dal founder.",
      "Esistono processi minimi per onboarding, delivery e follow-up.",
      "Il business sa quali clienti servire e quali evitare.",
      "Le informazioni cliente sono raccolte in un sistema leggibile.",
      "Margini, costi e responsabilità sono più chiari."
    ],
    nonFare:
      "Non assumere o aumentare volume per compensare processi deboli, clienti non filtrati o responsabilità non definite.",
    sourceConcepts: ["Founder-to-Team Transfer", "Focus and Fit Discipline"]
  },

  VALUE_ARCHITECTURE: {
    label: "Value Architecture",
    role: "Founder as value architect",
    headline:
      "Il business deve aumentare il valore per cliente senza aumentare caos, delivery o costo operativo in modo proporzionale.",
    coreConstraint:
      "L’azienda ha trazione, ma il modello di valore, margine e asset non è ancora abbastanza forte o trasferibile.",
    strategicReviewFocus:
      "Disegnare percorsi di valore, espansione cliente, materiali commerciali, customer journey, pricing, budget e asset documentabili.",
    graduationCriteria: [
      "Il business sa quali clienti generano maggiore valore.",
      "Esiste un percorso chiaro dopo la prima vendita.",
      "Il pricing riflette meglio valore e delivery.",
      "La customer experience è più coerente.",
      "Budget, forecast e capacità di reinvestimento sono più leggibili."
    ],
    nonFare:
      "Non creare nuove offerte solo per fare di più. Ogni nuova offerta deve aumentare valore, margine o asset trasferibile.",
    sourceConcepts: ["Customer Value Expansion"]
  },

  SCALE_READINESS: {
    label: "Scale Readiness",
    role: "Founder as scale architect",
    headline:
      "Il business deve rendere sistemi, persone, dati, margini e decisioni abbastanza leggibili da sostenere scala, delega o investimento.",
    coreConstraint:
      "La crescita esiste, ma il sistema non è ancora abbastanza efficiente, classificato, specializzato o leggibile per aumentare complessità.",
    strategicReviewFocus:
      "Ottimizzare ciò che già funziona, classificare caos operativo, specializzare responsabilità, proteggere dati e costruire una base decisionale più solida.",
    graduationCriteria: [
      "Il business migliora i sistemi esistenti prima di aggiungerne nuovi.",
      "Clienti, lead, dati, ruoli e budget sono classificati.",
      "Le responsabilità critiche hanno ownership chiara.",
      "Le metriche operative e finanziarie sono affidabili.",
      "Il management può prendere decisioni senza dipendere da intuizione o memoria."
    ],
    nonFare:
      "Non aggiungere persone, canali, prodotti, software o capitale se il sistema attuale è già inefficiente o poco leggibile.",
    sourceConcepts: [
      "Improve Before Expanding",
      "Categorize Before Scale",
      "Specialized Operating Capacity",
      "Strategic Capital Allocation"
    ]
  }
};

export const FUNCTION_CONSTRAINT_LIBRARY: Record<string, FunctionConstraint[]> = {
  product: [
    {
      id: "product_v1_not_paid_ready",
      label: "Offerta non ancora pagabile",
      dimensions: ["clarity", "margins"],
      stages: ["FOUNDATION"],
      trigger:
        "L’offerta è interessante, ma non ancora abbastanza chiara, concreta o necessaria da generare pagamento.",
      implication:
        "Il mercato può apprezzare l’idea senza ancora riconoscerla come qualcosa da comprare.",
      work:
        "Definire una prima versione vendibile, una promessa chiara, un pricing iniziale e criteri minimi di successo cliente.",
      avoid:
        "Non aumentare marketing prima di aver chiarito cosa viene comprato e perché."
    },
    {
      id: "product_too_broad",
      label: "Offerta tirata in troppe direzioni",
      dimensions: ["clarity", "operations", "margins"],
      stages: ["OPERATING_STABILITY"],
      trigger:
        "Il business serve clienti troppo diversi, personalizza troppo e fatica a mantenere qualità, margine e coerenza.",
      implication:
        "Ogni nuovo cliente può aumentare ricavi ma anche complessità nascosta.",
      work:
        "Identificare il cliente migliore, ridurre varianti inutili e allineare offerta, delivery e pricing attorno a quel segmento.",
      avoid:
        "Non dire sì a clienti o richieste che rendono il sistema meno scalabile."
    },
    {
      id: "product_value_expansion_missing",
      label: "Percorso di valore incompleto",
      dimensions: ["asset", "margins", "clarity"],
      stages: ["VALUE_ARCHITECTURE"],
      trigger:
        "Il business ha una prima offerta funzionante, ma non ha un percorso chiaro per aumentare valore, retention o LTV.",
      implication:
        "La crescita dipende troppo dall’acquisizione di nuovi clienti invece che dall’espansione del valore per clienti già acquisiti.",
      work:
        "Disegnare un percorso cliente con offerta principale, possibile espansione, pricing coerente e materiali commerciali riutilizzabili.",
      avoid:
        "Non creare nuovi prodotti scollegati dal bisogno dei clienti migliori."
    }
  ],

  marketing: [
    {
      id: "marketing_no_repeatable_channel",
      label: "Canale di acquisizione non ripetibile",
      dimensions: ["acquisition", "clarity"],
      stages: ["MARKET_TRACTION"],
      trigger:
        "I clienti arrivano da referral, relazioni personali o iniziative sporadiche, senza un canale misurabile.",
      implication:
        "Il business può vendere, ma non sa ancora generare domanda con prevedibilità.",
      work:
        "Identificare il canale più promettente, definire una routine commerciale e tracciare attività, lead e conversioni.",
      avoid:
        "Non aprire troppi canali contemporaneamente."
    },
    {
      id: "marketing_unqualified_demand",
      label: "Domanda non qualificata",
      dimensions: ["acquisition", "margins", "operations"],
      stages: ["OPERATING_STABILITY"],
      trigger:
        "Il marketing genera interesse, ma troppi lead non sono adatti, non comprano o creano attrito nella delivery.",
      implication:
        "Il business spreca tempo commerciale e abbassa qualità operativa.",
      work:
        "Chiarire ICP, messaggio, criteri di qualificazione e contenuti che attirano clienti più vicini al profilo migliore.",
      avoid:
        "Non misurare solo quantità di lead se la qualità dei lead consuma margine."
    },
    {
      id: "marketing_cac_pressure",
      label: "Costo di acquisizione in aumento",
      dimensions: ["acquisition", "margins", "asset"],
      stages: ["SCALE_READINESS"],
      trigger:
        "I canali funzionano meno, i costi salgono o il business dipende troppo da performance marketing immediato.",
      implication:
        "La crescita può continuare a produrre volume ma comprimere margine e controllo.",
      work:
        "Rafforzare posizionamento, contenuto, brand asset, referral e misurazione del ritorno reale per canale.",
      avoid:
        "Non aumentare budget pubblicitario se il sistema non sa ancora attribuire qualità e ritorno."
    }
  ],

  sales: [
    {
      id: "sales_no_script_or_feedback",
      label: "Vendita non codificata",
      dimensions: ["acquisition", "asset", "readiness"],
      stages: ["MARKET_TRACTION", "OPERATING_STABILITY"],
      trigger:
        "La vendita dipende dal founder o da talento individuale, senza script, obiezioni raccolte o materiali riutilizzabili.",
      implication:
        "Il business non trasforma conversazioni commerciali in asset trasferibili.",
      work:
        "Documentare promessa, obiezioni, domande frequenti, follow-up, materiali e criteri di qualificazione.",
      avoid:
        "Non delegare vendita senza prima rendere visibile cosa funziona."
    },
    {
      id: "sales_follow_up_leakage",
      label: "Follow-up commerciale disperso",
      dimensions: ["acquisition", "operations"],
      stages: ["OPERATING_STABILITY", "SCALE_READINESS"],
      trigger:
        "Lead buoni vengono persi perché non esiste una sequenza chiara di follow-up, ownership o priorità.",
      implication:
        "Il business paga per generare opportunità che poi non vengono lavorate con disciplina.",
      work:
        "Creare pipeline, tempi di risposta, responsabilità e sequenze minime per ogni categoria di lead.",
      avoid:
        "Non aumentare lead generation se la pipeline perde opportunità già presenti."
    }
  ],

  customerSuccess: [
    {
      id: "cs_onboarding_weak",
      label: "Onboarding cliente fragile",
      dimensions: ["operations", "asset", "readiness"],
      stages: ["OPERATING_STABILITY"],
      trigger:
        "I nuovi clienti si sentono persi, chiedono troppe spiegazioni o non arrivano rapidamente al primo risultato.",
      implication:
        "La promessa commerciale perde forza nella delivery e aumenta il rischio di insoddisfazione.",
      work:
        "Definire un onboarding standard con passaggi, responsabilità, materiali, tempi e criteri di primo successo.",
      avoid:
        "Non vendere più clienti se l’onboarding non è ancora capace di assorbire volume."
    },
    {
      id: "cs_no_satisfaction_metrics",
      label: "Soddisfazione cliente non misurata",
      dimensions: ["operations", "asset", "readiness"],
      stages: ["OPERATING_STABILITY", "SCALE_READINESS"],
      trigger:
        "Il business non misura qualità della customer experience, cause di churn, reclami o segnali di soddisfazione.",
      implication:
        "Il team può confondere clienti silenziosi con clienti soddisfatti.",
      work:
        "Creare metriche leggere di soddisfazione, feedback, rinnovo, problemi ricorrenti e miglioramenti prioritari.",
      avoid:
        "Non aspettare reclami evidenti per capire dove la delivery perde valore."
    }
  ],

  operations: [
    {
      id: "ops_founder_dependency",
      label: "Dipendenza operativa dal founder",
      dimensions: ["operations", "readiness", "asset"],
      stages: ["OPERATING_STABILITY"],
      trigger:
        "Il founder è ancora necessario per risolvere problemi, coordinare persone, prendere decisioni o garantire qualità.",
      implication:
        "Il business può funzionare, ma non è ancora trasferibile o scalabile.",
      work:
        "Mappare attività critiche, responsabilità, standard di qualità, escalation e documentazione minima.",
      avoid:
        "Non assumere altre persone senza sapere quali decisioni e responsabilità devono uscire dal founder."
    },
    {
      id: "ops_no_weekly_rhythm",
      label: "Ritmo operativo non visibile",
      dimensions: ["operations", "margins", "readiness"],
      stages: ["OPERATING_STABILITY", "SCALE_READINESS"],
      trigger:
        "Il team è occupato, ma non è chiaro cosa sia prioritario, cosa sia arretrato e cosa stia consumando capacità.",
      implication:
        "La crescita può creare attività senza creare avanzamento reale.",
      work:
        "Creare un ritmo settimanale per priorità, capacità, follow-up, urgenze, blocchi e responsabilità.",
      avoid:
        "Non confondere calendario pieno con sistema operativo sano."
    }
  ],

  finance: [
    {
      id: "finance_basic_visibility_missing",
      label: "Numeri base non leggibili",
      dimensions: ["margins", "readiness"],
      stages: ["FOUNDATION", "MARKET_TRACTION", "OPERATING_STABILITY"],
      trigger:
        "Il business non traccia chiaramente incassi, costi, margini, tasse, pagamenti o cash flow.",
      implication:
        "Ogni decisione di crescita rischia di essere presa senza capire il reale impatto economico.",
      work:
        "Rendere visibili entrate, costi, margine per offerta, cash flow minimo e obblighi fiscali.",
      avoid:
        "Non aumentare spesa o team prima di sapere cosa il business può sostenere."
    },
    {
      id: "finance_reinvestment_unclear",
      label: "Capacità di reinvestimento non chiara",
      dimensions: ["margins", "asset", "readiness"],
      stages: ["VALUE_ARCHITECTURE", "SCALE_READINESS"],
      trigger:
        "Il business cresce ma non sa quanto può reinvestire in marketing, team, prodotto o sistemi senza comprimere margine.",
      implication:
        "La crescita può sembrare positiva mentre riduce liquidità, controllo o resilienza.",
      work:
        "Creare budget, forecast semplice, margine per offerta e scenari di reinvestimento.",
      avoid:
        "Non finanziare crescita con intuizione se i numeri non mostrano capacità reale."
    }
  ],

  people: [
    {
      id: "people_role_clarity_missing",
      label: "Ruoli e responsabilità poco chiari",
      dimensions: ["operations", "readiness"],
      stages: ["OPERATING_STABILITY", "SCALE_READINESS"],
      trigger:
        "Le persone aiutano, ma responsabilità, output attesi, criteri e ownership non sono definiti.",
      implication:
        "Il team aumenta capacità solo in apparenza, mentre crea più coordinamento per il founder.",
      work:
        "Definire ruoli, output, responsabilità decisionali, criteri di performance e momenti di review.",
      avoid:
        "Non aggiungere persone se ogni nuova persona aumenta il carico di coordinamento."
    },
    {
      id: "people_specialization_gap",
      label: "Competenze non specializzate",
      dimensions: ["operations", "asset", "readiness"],
      stages: ["SCALE_READINESS"],
      trigger:
        "Il business richiede competenze specifiche, ma continua ad affidarsi a generalisti o persone che devono coprire troppi ambiti.",
      implication:
        "La complessità supera la capacità del team di prendere decisioni competenti e autonome.",
      work:
        "Separare responsabilità specialistiche, ownership funzionali, sistemi di collaborazione e metriche dedicate.",
      avoid:
        "Non chiedere a un generalista di risolvere problemi specialistici senza struttura."
    }
  ],

  dataAndSystems: [
    {
      id: "systems_scattered_data",
      label: "Dati dispersi",
      dimensions: ["readiness", "asset", "operations"],
      stages: ["OPERATING_STABILITY", "SCALE_READINESS"],
      trigger:
        "Informazioni cliente, lead, processi, file, password o decisioni sono distribuiti in troppi luoghi.",
      implication:
        "Il business funziona finché le persone ricordano dove sono le cose, ma diventa fragile quando cresce.",
      work:
        "Centralizzare dati critici, sistemi, accessi, documenti e responsabilità di aggiornamento.",
      avoid:
        "Non aumentare complessità se le informazioni base non sono ancora recuperabili e affidabili."
    },
    {
      id: "systems_tool_sprawl",
      label: "Troppi strumenti, poco sistema",
      dimensions: ["operations", "margins", "readiness"],
      stages: ["OPERATING_STABILITY", "SCALE_READINESS"],
      trigger:
        "Il business ha acquistato tool, software o automazioni senza reale adozione, ownership o integrazione.",
      implication:
        "La tecnologia aumenta costo e complessità invece di ridurre lavoro operativo.",
      work:
        "Valutare quali strumenti sono essenziali, chi li usa, quale processo supportano e cosa va eliminato.",
      avoid:
        "Non comprare nuovi tool per compensare processi non chiariti."
    }
  ]
};

export function normalizeImpulseStage(stage?: string): ImpulseStage {
  const raw = String(stage || "").trim().toUpperCase();

  if (
    raw === "FOUNDATION" ||
    raw === "FOUNDATIONAL" ||
    raw === "BASE"
  ) {
    return "FOUNDATION";
  }

  if (
    raw === "TRACTION" ||
    raw === "MARKET_TRACTION" ||
    raw === "MARKET TRACTION"
  ) {
    return "MARKET_TRACTION";
  }

  if (
    raw === "STABILIZATION" ||
    raw === "STABILISATION" ||
    raw === "OPERATING_STABILITY" ||
    raw === "OPERATING STABILITY"
  ) {
    return "OPERATING_STABILITY";
  }

  if (
    raw === "PRODUCTIZATION" ||
    raw === "PRODUCTISATION" ||
    raw === "VALUE_ARCHITECTURE" ||
    raw === "VALUE ARCHITECTURE"
  ) {
    return "VALUE_ARCHITECTURE";
  }

  if (
    raw === "SCALE_READINESS" ||
    raw === "SCALE READINESS" ||
    raw === "READINESS"
  ) {
    return "SCALE_READINESS";
  }

  return "FOUNDATION";
}

export function getAllFunctionConstraints(): FunctionConstraint[] {
  return Object.values(FUNCTION_CONSTRAINT_LIBRARY).flat();
}

export function getFunctionConstraintsForStage(
  stage?: string,
  limit = 3
): FunctionConstraint[] {
  const normalizedStage = normalizeImpulseStage(stage);

  return getAllFunctionConstraints()
    .filter((item) => item.stages.includes(normalizedStage))
    .slice(0, limit);
}

export function getFunctionConstraintsForDimensions(
  dimensions: ImpulseDimension[],
  stage?: string,
  limit = 3
): FunctionConstraint[] {
  const normalizedStage = normalizeImpulseStage(stage);
  const dimensionSet = new Set(dimensions);

  return getAllFunctionConstraints()
    .map((item) => {
      const stageMatch = item.stages.includes(normalizedStage) ? 2 : 0;
      const dimensionMatches = item.dimensions.filter((dim) =>
        dimensionSet.has(dim)
      ).length;

      return {
        item,
        score: stageMatch + dimensionMatches
      };
    })
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((entry) => entry.item);
}

export function enrichRoadmapInfo(stage?: string) {
  const normalizedStage = normalizeImpulseStage(stage);
  return IMPULSE_STAGE_DATABASE[normalizedStage];
}
