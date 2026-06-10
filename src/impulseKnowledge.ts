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

/*
 * CHANGELOG v2 (report value upgrade):
 * - Aggiunti 2 campi OPZIONALI al database stage:
 *   costOfInaction?  -> cosa si amplifica se il vincolo viene ignorato
 *                       (meccanismo, mai numeri)
 *   nextProblem?     -> il problema che si apre una volta risolto il
 *                       vincolo (loop verso la Strategic Review)
 *   Opzionali = nessun breaking change per consumer esistenti.
 * - Riscritti i 5 blocchi stage: sintomi specifici nel coreConstraint,
 *   graduationCriteria in formato test osservabile (ancore coerenti con
 *   le 33 domande della scorecard: 4 settimane, 12 mesi, una settimana).
 * - LABEL allineati al naming del funnel (Tilda result page + PDF):
 *   Foundation / Traction / Stabilization / Productization / Scale
 *   Readiness. Le CHIAVI interne restano invariate, quindi
 *   normalizeImpulseStage e tutti i consumer continuano a funzionare.
 *   Se preferisci i vecchi label (Market Traction / Operating Stability /
 *   Value Architecture), cambia SOLO le stringhe `label`.
 * - FUNCTION_CONSTRAINT_LIBRARY e helper invariati (secondo pass a parte).
 */

export const IMPULSE_STAGE_DATABASE: Record<
  ImpulseStage,
  {
    label: string;
    role: string;
    headline: string;
    coreConstraint: string;
    costOfInaction?: string;
    strategicReviewFocus: string;
    graduationCriteria: string[];
    nonFare: string;
    nextProblem?: string;
    sourceConcepts: string[];
  }
> = {
  FOUNDATION: {
    label: "Foundation",
    role: "Founder as validator",
    headline:
      "Il business deve dimostrare una cosa sola: che esiste qualcuno disposto a pagare, più di una volta, per un'offerta descrivibile in una frase.",
    coreConstraint:
      "Il valore non è ancora validato da pagamenti ripetuti. Interesse, complimenti e utilizzo gratuito non sono domanda: sono segnali ambigui che possono assorbire mesi senza produrre un business.",
    costOfInaction:
      "Ogni mese speso a costruire struttura, contenuti o strumenti sopra un'offerta non ancora pagata è un mese di runway convertito in complessità invece che in prova di mercato. Il rischio non è andare piano: è costruire in una direzione che il mercato non ha mai confermato.",
    strategicReviewFocus:
      "Separare i segnali veri di domanda da quelli ambigui, e definire l'offerta minima per cui qualcuno paga: cliente, problema, promessa, prezzo iniziale.",
    graduationCriteria: [
      "L'offerta principale si descrive in una frase, senza spiegazioni aggiuntive.",
      "Esistono pagamenti reali, non solo manifestazioni di interesse.",
      "Almeno un cliente ha pagato una seconda volta o ha rinnovato.",
      "Sai dire chi NON è un cliente in target, non solo chi lo è.",
      "Entrate, costi e risultati dei primi clienti sono scritti, non a memoria."
    ],
    nonFare:
      "Non costruire team, automazioni, brand o presenza prima che qualcuno abbia pagato. La struttura amplifica un modello: se il modello non è validato, amplifica il dubbio.",
    nextProblem:
      "Una volta validato il pagamento, il problema cambia natura: non è più 'qualcuno paga?' ma 'in che ordine costruisco domanda ripetibile senza rompere quello che funziona?'. Quella sequenza dipende dal tuo caso specifico: margini, capacità, canale naturale.",
    sourceConcepts: ["Market Proof Before Monetization", "First Paid Proof"]
  },

  MARKET_TRACTION: {
    label: "Traction",
    role: "Founder as demand builder",
    headline:
      "Il business vende, ma a strappi. Il lavoro di questa fase è trasformare vendite episodiche in domanda che si ripete senza dipendere ogni volta dalla tua spinta personale.",
    coreConstraint:
      "Il flusso di clienti è stop-and-go: mesi buoni seguiti da mesi vuoti, perché la generazione di domanda parte e si ferma con la tua attenzione. I sintomi tipici: non sai prevedere i clienti del mese prossimo nemmeno approssimativamente; il fatturato arriva quasi tutto da rete personale e referral; quando sei occupato a consegnare, smetti di vendere — e il vuoto si presenta 60-90 giorni dopo.",
    costOfInaction:
      "Ogni mese in questo stato rafforza la dipendenza: più consegni, meno vendi; più il fatturato oscilla, meno puoi pianificare assunzioni, investimenti o impegni. La crescita aggiunta su domanda imprevedibile non si accumula: si alterna.",
    strategicReviewFocus:
      "Identificare quale singolo canale merita priorità nel tuo caso, cosa rende leggibile la qualità di un'opportunità, e quale routine commerciale è sostenibile con la tua capacità attuale.",
    graduationCriteria: [
      "Sai stimare i nuovi clienti del prossimo mese guardando numeri di pipeline, non sensazioni.",
      "Almeno un canale porta opportunità anche nelle settimane in cui non lo alimenti personalmente.",
      "Distingui un lead buono da uno che brucia tempo PRIMA di investirci ore, con criteri detti ad alta voce.",
      "Una richiesta commerciale segue lo stesso percorso ogni volta, non un'improvvisazione.",
      "La qualità della delivery non è peggiorata mentre la domanda cresceva."
    ],
    nonFare:
      "Non aprire più canali in contemporanea e non aumentare budget su canali che non sai ancora leggere. Più volume su un sistema commerciale non leggibile produce più rumore, non più clienti buoni.",
    nextProblem:
      "Quando la domanda diventa ripetibile, emerge il problema successivo: il sistema operativo dietro la vendita. Quale canale viene prima, con quale offerta, a quale ritmo sostenibile per la TUA capacità di delivery — questa è una decisione di sequenza, non di volontà.",
    sourceConcepts: ["Consistent Demand Creation"]
  },

  OPERATING_STABILITY: {
    label: "Stabilization",
    role: "Founder as system builder",
    headline:
      "Il business funziona, ma funziona attraverso di te. Il lavoro di questa fase è il passaggio più difficile: da esecutore a costruttore di sistema.",
    coreConstraint:
      "C'è più lavoro di quanto una persona possa reggere, e il sistema per distribuirlo non esiste ancora. I sintomi tipici: ogni eccezione torna sulla tua scrivania; i processi vivono nella tua testa o in quella di una persona sola; i nuovi clienti partono senza un percorso di ingresso e si sentono persi; gli strumenti si sono accumulati ma pochi vengono usati davvero; numeri e responsabilità si gestiscono a memoria.",
    costOfInaction:
      "In questo stato, ogni cliente in più aggiunge eccezioni più velocemente di quanto aggiunga margine. Assumere senza processi scritti trasferisce il caos, non il lavoro: la persona nuova ti costa tempo invece di liberartene. E il valore costruito resta intrappolato nella tua presenza.",
    strategicReviewFocus:
      "Individuare quale processo va stabilizzato per primo nel tuo caso — non tutti insieme — e in quale ordine delega, documentazione e filtro clienti producono leva invece di costo.",
    graduationCriteria: [
      "Un'assenza di 4 settimane non ferma la delivery: rallenta, ma regge senza interventi d'emergenza.",
      "Le decisioni operative ricorrenti hanno regole scritte: tornano a te le eccezioni vere, non la routine.",
      "Una persona nuova può seguire i processi chiave leggendoli, senza affiancamento continuo.",
      "Sai quali clienti servire e quali rifiutare, e il rifiuto avviene davvero.",
      "Margini e costi per offerta sono scritti e consultati prima delle decisioni, non ricostruiti dopo."
    ],
    nonFare:
      "Non assumere e non comprare software per compensare processi non scritti. Persone e strumenti aggiunti sopra un sistema implicito ereditano il caos e lo moltiplicano per il numero di teste.",
    nextProblem:
      "Quando il sistema regge senza di te, si apre la domanda di valore: quali clienti, offerte e percorsi meritano di essere standardizzati e quali abbandonati. È una scelta di architettura del valore, e l'ordine sbagliato costa margine per anni.",
    sourceConcepts: ["Founder-to-Team Transfer", "Focus and Fit Discipline"]
  },

  VALUE_ARCHITECTURE: {
    label: "Productization",
    role: "Founder as value architect",
    headline:
      "Il business ha trazione e regge. Il lavoro di questa fase è trasformare quello che fai in qualcosa che vale anche senza di te: offerta standard, percorso cliente, margine difendibile, asset documentati.",
    coreConstraint:
      "Il valore per cliente non è ancora architettato: ogni vendita rischia di restare un episodio. I sintomi tipici: dopo la prima vendita non esiste un percorso naturale di espansione; il pricing è fermo da troppo o deciso a sensazione; sai chi fattura di più ma non chi genera il margine migliore; il know-how che ti distingue non è documentato da nessuna parte.",
    costOfInaction:
      "Crescere senza architettura del valore significa aumentare i ricavi più velocemente del margine e del valore trasferibile: più lavoro che si traduce in poco enterprise value. La differenza tra un business che fattura e un business che vale si decide esattamente in questa fase.",
    strategicReviewFocus:
      "Disegnare quale percorso di valore viene prima nel tuo caso: espansione cliente, revisione pricing, standardizzazione offerta o documentazione degli asset — e in quale sequenza si sostengono a vicenda invece di competere per la tua attenzione.",
    graduationCriteria: [
      "Esiste un passo naturale dopo la prima vendita, e una parte dei clienti lo compie.",
      "Il pricing è stato rivisto negli ultimi 12 mesi guardando il valore, non solo i costi.",
      "Sai indicare per iscritto quali clienti, offerte e canali generano il margine migliore — e agisci di conseguenza.",
      "Almeno un asset (metodo, dati, brand, contratti) è documentato al punto da poter essere spiegato a un esterno senza di te.",
      "Budget e forecast esistono e vengono confrontati con la realtà, non solo redatti."
    ],
    nonFare:
      "Non creare nuove offerte per riempire il calendario. Ogni offerta nuova deve aumentare margine, valore per cliente o asset trasferibile — altrimenti aggiunge delivery e diluisce il sistema.",
    nextProblem:
      "Quando offerta, margine e asset sono architettati, il problema diventa la leggibilità esterna: rendere il sistema comprensibile a chi può moltiplicarlo — figure senior, partner, capitale. Cosa documentare prima, e in che forma, dipende da quale porta vuoi aprire.",
    sourceConcepts: ["Customer Value Expansion"]
  },

  SCALE_READINESS: {
    label: "Scale Readiness",
    role: "Founder as scale architect",
    headline:
      "Il business è vicino al punto in cui può sostenere scala, delega seria o capitale. Il lavoro di questa fase è rendere il sistema leggibile e migliorarlo PRIMA di espanderlo.",
    coreConstraint:
      "La crescita esiste, ma il sistema non è ancora abbastanza efficiente, classificato e leggibile per reggere complessità aggiuntiva. I sintomi tipici: si aggiungono iniziative prima di ottimizzare quelle esistenti; clienti, dati, ruoli e budget non sono classificati e ogni analisi parte da zero; responsabilità critiche senza ownership unica; decisioni importanti prese su intuizione perché le metriche non sono affidabili.",
    costOfInaction:
      "Scalare un sistema inefficiente scala l'inefficienza: ogni persona, canale o euro aggiunto rende il sistema più costoso da capire e da correggere. E un business illeggibile viene sistematicamente percepito — da partner, senior hire o capitale — come meno solido di quanto sia: lo sconto lo paghi tu.",
    strategicReviewFocus:
      "Stabilire cosa ottimizzare, cosa classificare e cosa specializzare prima di aggiungere — e quale base decisionale serve perché il management regga senza la tua memoria.",
    graduationCriteria: [
      "Il miglioramento di ciò che esiste ha priorità formale sull'aggiunta di nuovo: lo dimostrano le decisioni degli ultimi mesi.",
      "Clienti, lead, dati, ruoli e budget sono classificati: un'analisi nuova parte da una base, non da zero.",
      "Ogni responsabilità critica ha un solo owner, e l'owner non sei tu per default.",
      "Le metriche operative e finanziarie reggono una verifica esterna senza ricostruzioni manuali.",
      "Un advisor esterno capirebbe modello, numeri, rischi e asset in meno di una settimana, in autonomia."
    ],
    nonFare:
      "Non aggiungere persone, canali, prodotti, software o capitale sopra un sistema già inefficiente o poco leggibile. A questo livello, l'espansione prematura non rallenta la crescita: la rende irreversibilmente costosa.",
    nextProblem:
      "Superata questa soglia, le opzioni si moltiplicano: nuove linee, mercati, capitale, M&A, uscita parziale. Il problema non è più 'se' ma 'quale prima': ogni opzione richiede una preparazione diversa, e prepararle tutte insieme equivale a non prepararne nessuna.",
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
