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
  /* [V2 PASS — sezione 4.4 dello spec]
     Regole applicate a ogni vincolo:
     - P1: trigger = sintomi specifici e riconoscibili
     - P2: implication = costo come MECCANISMO (mai numeri)
     - work = lo stato finale che deve esistere (WHAT), mai il metodo
     - avoid = anti-azione
     - TAG DISCIPLINATI: una dimensione sta nei tag solo se la copy
       ne parla davvero. (Prima: copy margins taggata anche readiness
       -> utenti con binding readiness ricevevano consigli sui numeri
       interni che i loro stessi punteggi smentivano.)
     - 2 vincoli NUOVI per il lato readiness, prima orfano:
       readiness_external_materials, finance_external_readability */

  product: [
    {
      id: "product_v1_not_paid_ready",
      label: "Offerta non ancora pagabile",
      dimensions: ["clarity", "margins"],
      stages: ["FOUNDATION"],
      trigger:
        "Arrivano complimenti, richieste di informazioni e demo che non si chiudono — ma il prezzo non è quasi mai stato detto ad alta voce, e nessuno ha ancora pagato due volte.",
      implication:
        "Ogni settimana spesa a perfezionare ciò che nessuno ha comprato converte runway in complessità invece che in prova di mercato: l'interesse non è domanda finché non passa dalla cassa.",
      work:
        "Una prima versione vendibile con promessa in una frase, un prezzo iniziale detto senza esitare e criteri minimi di successo cliente.",
      avoid:
        "Non aumentare marketing prima di aver chiarito cosa viene comprato, da chi e a quale prezzo."
    },
    {
      id: "product_too_broad",
      label: "Offerta tirata in troppe direzioni",
      dimensions: ["clarity", "operations", "margins"],
      stages: ["OPERATING_STABILITY"],
      trigger:
        "Quasi ogni cliente compra una versione leggermente diversa: preventivi su misura, eccezioni in delivery, e la domanda \"cosa fate esattamente?\" riceve risposte diverse a seconda di chi risponde.",
      implication:
        "Ogni variante aggiunta vende una volta ma si paga per sempre: più eccezioni in delivery, margine meno leggibile, messaggio più diluito. Il fatturato cresce mentre il sistema si indebolisce.",
      work:
        "Il cliente migliore identificato, le varianti ridotte all'essenziale, e offerta, delivery e pricing allineati attorno a quel segmento.",
      avoid:
        "Non dire sì a clienti o richieste che rendono il sistema meno scalabile, anche quando portano fatturato."
    },
    {
      id: "product_value_expansion_missing",
      label: "Percorso di valore incompleto",
      dimensions: ["asset", "margins"],
      stages: ["VALUE_ARCHITECTURE"],
      trigger:
        "Dopo la prima vendita non succede niente di strutturato: chi vuole continuare deve chiederlo lui, e il valore generato per i clienti migliori non ha un passo successivo naturale.",
      implication:
        "Senza percorso di espansione, ogni crescita richiede clienti nuovi: il costo di acquisizione si ripaga una volta sola, e il valore costruito con i clienti migliori resta sul tavolo.",
      work:
        "Un percorso cliente con offerta principale, espansione naturale, pricing coerente e materiali riutilizzabili.",
      avoid:
        "Non creare nuovi prodotti scollegati dal bisogno dei clienti migliori per riempire il calendario."
    }
  ],

  marketing: [
    {
      id: "marketing_no_repeatable_channel",
      label: "Canale di acquisizione non ripetibile",
      dimensions: ["acquisition"],
      stages: ["MARKET_TRACTION"],
      trigger:
        "I clienti arrivano quasi solo da passaparola e rete personale: quando spingi tu c'è un picco, quando consegni c'è silenzio — e il vuoto si presenta 60-90 giorni dopo.",
      implication:
        "Finché la domanda parte e si ferma con la tua attenzione, il fatturato non si accumula: si alterna. E ogni mese imprevedibile rende impossibile pianificare assunzioni o investimenti.",
      work:
        "Un canale identificato come prioritario, una routine commerciale sostenibile e numeri visibili su attività, lead e conversioni.",
      avoid:
        "Non aprire più canali in contemporanea: più volume su un sistema non leggibile produce rumore, non clienti."
    },
    {
      id: "marketing_unqualified_demand",
      label: "Domanda non qualificata",
      dimensions: ["acquisition", "margins"],
      stages: ["OPERATING_STABILITY"],
      trigger:
        "Il marketing porta richieste, ma troppe sono fuori target: call con gente che non comprerà mai, preventivi che non si chiudono, e i clienti sbagliati che entrano consumano più di quanto pagano.",
      implication:
        "Ogni lead fuori target costa due volte: il tempo commerciale che brucia e il posto che occupa al posto di un cliente giusto. Il volume cresce mentre il margine per ora lavorata scende.",
      work:
        "Un profilo cliente esplicito, criteri di qualificazione detti ad alta voce e un messaggio che attira chi è vicino al profilo migliore.",
      avoid:
        "Non misurare il marketing solo sulla quantità di lead se la loro qualità sta consumando margine."
    },
    {
      id: "marketing_cac_pressure",
      label: "Costo di acquisizione in aumento",
      dimensions: ["acquisition", "margins", "asset"],
      stages: ["SCALE_READINESS"],
      trigger:
        "I canali che funzionavano rendono meno: serve più budget per gli stessi risultati, e se l'advertising si fermasse domani, la domanda si fermerebbe con lui.",
      implication:
        "Un business che compra tutta la sua domanda compete ogni giorno all'asta: chi ha brand, referral e asset propri paga meno per lo stesso cliente — e nel tempo quel divario si mangia il margine.",
      work:
        "Posizionamento, brand asset, referral e una misura del ritorno reale per canale che non dipenda solo dalla spesa corrente.",
      avoid:
        "Non aumentare budget pubblicitario se il sistema non sa ancora attribuire qualità e ritorno per canale."
    }
  ],

  sales: [
    {
      id: "sales_no_script_or_feedback",
      label: "Vendita non codificata",
      dimensions: ["acquisition", "asset"],
      stages: ["MARKET_TRACTION", "OPERATING_STABILITY"],
      trigger:
        "Le vendite migliori le chiudi tu, a modo tuo: le obiezioni le gestisci a memoria, i materiali si rifanno ogni volta, e nessuno saprebbe replicare la tua conversazione di vendita.",
      implication:
        "Ogni trattativa vinta in questo modo produce fatturato ma zero asset: il know-how commerciale evapora invece di accumularsi, e la vendita resta non delegabile per costruzione.",
      work:
        "Promessa, obiezioni ricorrenti, domande frequenti, follow-up e criteri di qualificazione esistenti in forma scritta e riutilizzabile.",
      avoid:
        "Non delegare la vendita prima di aver reso visibile cosa funziona: si delega un sistema, non un talento."
    },
    {
      id: "sales_follow_up_leakage",
      label: "Follow-up commerciale disperso",
      dimensions: ["acquisition", "operations"],
      stages: ["OPERATING_STABILITY", "SCALE_READINESS"],
      trigger:
        "Lead buoni muoiono in inbox: il follow-up parte quando qualcuno se ne ricorda, nessuno sa di chi è la responsabilità di una trattativa aperta, e i \"ci risentiamo\" non hanno una data.",
      implication:
        "Stai pagando — in tempo o in budget — per generare opportunità che poi non vengono lavorate: il sistema perde a valle quello che compra a monte, e aumentare i lead amplifica la perdita.",
      work:
        "Una pipeline visibile, tempi di risposta definiti, ownership chiara e una sequenza minima di follow-up per ogni categoria di lead.",
      avoid:
        "Non aumentare la lead generation finché la pipeline perde opportunità già presenti."
    }
  ],

  customerSuccess: [
    {
      id: "cs_onboarding_weak",
      label: "Onboarding cliente fragile",
      dimensions: ["operations"],
      stages: ["OPERATING_STABILITY"],
      trigger:
        "I nuovi clienti fanno sempre le stesse domande nelle prime settimane, il primo risultato arriva tardi, e ogni partenza assorbe attenzione tua o delle persone migliori.",
      implication:
        "La promessa fatta in vendita si gioca nei primi giorni: un ingresso disordinato converte entusiasmo in dubbio, e ogni cliente nuovo costa più capacità operativa di quanta dovrebbe.",
      work:
        "Un percorso di ingresso standard con passaggi, responsabilità, materiali, tempi e un primo successo definito.",
      avoid:
        "Non vendere più clienti se l'ingresso non è ancora in grado di assorbire volume senza di te."
    },
    {
      id: "cs_no_satisfaction_metrics",
      label: "Soddisfazione cliente non misurata",
      dimensions: ["operations", "readiness"],
      stages: ["OPERATING_STABILITY", "SCALE_READINESS"],
      trigger:
        "Chi se ne va lo scopri quando se n'è già andato: non esiste un segnale che distingua un cliente silenzioso da uno insoddisfatto, e i reclami arrivano solo quando è tardi.",
      implication:
        "Internamente si vola alla cieca sulla qualità; esternamente, retention e soddisfazione non sono dimostrabili a nessuno — e ciò che non è misurato, per un interlocutore serio, non esiste.",
      work:
        "Metriche leggere di soddisfazione e rinnovo, cause di abbandono identificate e un elenco vivo dei problemi ricorrenti.",
      avoid:
        "Non aspettare il reclamo evidente per capire dove la delivery perde valore."
    }
  ],

  operations: [
    {
      id: "ops_founder_dependency",
      label: "Dipendenza operativa dal founder",
      dimensions: ["operations", "readiness"],
      stages: ["OPERATING_STABILITY"],
      trigger:
        "Ogni eccezione torna sulla tua scrivania, le decisioni ricorrenti aspettano il tuo ok, e una tua assenza di qualche settimana richiederebbe interventi d'emergenza.",
      implication:
        "Il business funziona, ma funziona attraverso di te: la tua capacità di assorbire eccezioni è il tetto dell'azienda — e ciò che dipende dalla tua presenza non è né trasferibile né valutabile da fuori.",
      work:
        "Attività critiche mappate, regole scritte per le decisioni ricorrenti, standard di qualità e un'escalation che filtra cosa davvero deve arrivare a te.",
      avoid:
        "Non assumere per delegare il caos: senza regole scritte, ogni persona nuova eredita il disordine e te lo riporta moltiplicato."
    },
    {
      id: "ops_no_weekly_rhythm",
      label: "Ritmo operativo non visibile",
      dimensions: ["operations"],
      stages: ["OPERATING_STABILITY", "SCALE_READINESS"],
      trigger:
        "Tutti sono occupati ma nessuno sa dire cosa è prioritario questa settimana: l'urgente scavalca l'importante, gli arretrati sono invisibili finché non esplodono.",
      implication:
        "Un calendario pieno non è un sistema operativo: senza un ritmo che renda visibili priorità e capacità, l'attività cresce senza che cresca l'avanzamento — e il rumore vince sul segnale.",
      work:
        "Un ritmo settimanale in cui priorità, capacità, blocchi e responsabilità sono visibili a tutti quelli che devono vederli.",
      avoid:
        "Non confondere l'essere occupati con l'avanzare: sono due misure diverse, e solo la seconda conta."
    }
  ],

  finance: [
    {
      id: "finance_basic_visibility_missing",
      label: "Numeri base non leggibili",
      dimensions: ["margins"],
      stages: ["FOUNDATION", "MARKET_TRACTION", "OPERATING_STABILITY"],
      trigger:
        "Le decisioni si prendono guardando il conto in banca: il margine per offerta si ricostruisce a mano quando serve, e tra incassato e guadagnato la differenza si scopre dopo.",
      implication:
        "Ogni decisione di crescita presa senza margini leggibili è una scommessa: si può accelerare esattamente sull'offerta o sul canale che distrugge valore, convinti di stare crescendo.",
      work:
        "Entrate, costi, margine per offerta, cash flow minimo e obblighi fiscali visibili senza ricostruzioni manuali.",
      avoid:
        "Non aumentare spesa o team prima di sapere cosa il business può davvero sostenere."
    },
    {
      id: "finance_external_readability",
      label: "Numeri leggibili dentro, illeggibili fuori",
      dimensions: ["readiness", "margins"],
      stages: ["OPERATING_STABILITY", "VALUE_ARCHITECTURE", "SCALE_READINESS"],
      trigger:
        "I numeri esistono e tu li conosci — ma ogni interlocutore esterno richiede giorni di estrazioni manuali e la tua presenza per spiegare cosa significano davvero.",
      implication:
        "Un business i cui numeri richiedono traduzione orale viene prudenzialmente scontato da chiunque debba valutarlo: partner, figure senior, capitale. Quello sconto non lo vedi mai scritto, ma lo paghi a ogni negoziazione.",
      work:
        "Una vista dei numeri — struttura, margini, andamento — che un interlocutore esterno legge e capisce senza di te nella stanza.",
      avoid:
        "Non aprire conversazioni con partner o capitale presentando numeri ricostruiti ad hoc per l'occasione."
    },
    {
      id: "finance_reinvestment_unclear",
      label: "Capacità di reinvestimento non chiara",
      dimensions: ["margins", "asset"],
      stages: ["VALUE_ARCHITECTURE", "SCALE_READINESS"],
      trigger:
        "Il business cresce, ma quanto si può reinvestire in marketing, team o sistemi è una sensazione: ogni investimento importante è un atto di fede sul cash flow futuro.",
      implication:
        "Senza una misura della capacità di reinvestimento, la crescita può sembrare salute mentre consuma liquidità e resilienza: si scopre il limite solo sbattendoci contro.",
      work:
        "Un budget, un forecast semplice, il margine per offerta e scenari di reinvestimento confrontati con la realtà.",
      avoid:
        "Non finanziare la crescita a intuito se i numeri non mostrano la capacità reale di sostenerla."
    }
  ],

  people: [
    {
      id: "people_role_clarity_missing",
      label: "Ruoli e responsabilità poco chiari",
      dimensions: ["operations", "readiness"],
      stages: ["OPERATING_STABILITY", "SCALE_READINESS"],
      trigger:
        "Tutti aiutano, nessuno possiede: gli output attesi non sono scritti, le review non esistono, e quando qualcosa cade a terra non è colpa di nessuno perché non era di nessuno.",
      implication:
        "Persone senza ownership aumentano la capacità solo in apparenza: ogni testa in più aggiunge coordinamento sulle tue spalle — e da fuori, un'organizzazione senza ruoli leggibili sembra una persona con aiutanti.",
      work:
        "Ruoli con output attesi, responsabilità decisionali esplicite, criteri di performance e momenti di review che esistono davvero.",
      avoid:
        "Non aggiungere persone se ogni nuova persona aumenta il carico di coordinamento invece di ridurlo."
    },
    {
      id: "people_specialization_gap",
      label: "Competenze non specializzate",
      dimensions: ["operations", "readiness"],
      stages: ["SCALE_READINESS"],
      trigger:
        "Problemi ormai specialistici — finanza, dati, canali a scala — vengono gestiti da generalisti che coprono troppi fronti: le decisioni competenti aspettano sempre te o un consulente esterno.",
      implication:
        "Quando la complessità supera la competenza disponibile, le decisioni rallentano o peggiorano in silenzio: il costo non si vede in un report, si vede nei mesi persi sulle scelte sbagliate.",
      work:
        "Responsabilità specialistiche separate, ownership funzionali e metriche dedicate per le aree che ormai richiedono profondità.",
      avoid:
        "Non chiedere a un generalista di risolvere problemi specialistici senza dargli struttura, mandato e limiti chiari."
    }
  ],

  dataAndSystems: [
    {
      id: "systems_scattered_data",
      label: "Dati dispersi",
      dimensions: ["operations", "readiness"],
      stages: ["OPERATING_STABILITY", "SCALE_READINESS"],
      trigger:
        "Informazioni clienti, file, accessi e decisioni vivono in posti diversi: trovare un dato richiede sapere a chi chiederlo, e ogni analisi parte da una caccia al tesoro.",
      implication:
        "Il business funziona finché le persone ricordano dove sono le cose: ogni crescita aumenta i punti di rottura, e ciò che non è recuperabile in autonomia non è verificabile da nessuno — dentro o fuori.",
      work:
        "Dati critici, documenti e accessi centralizzati, con una responsabilità chiara di aggiornamento.",
      avoid:
        "Non aggiungere complessità se le informazioni base non sono ancora recuperabili e affidabili."
    },
    {
      id: "systems_tool_sprawl",
      label: "Troppi strumenti, poco sistema",
      dimensions: ["operations", "margins"],
      stages: ["OPERATING_STABILITY", "SCALE_READINESS"],
      trigger:
        "Abbonamenti che nessuno usa, lo stesso dato inserito in tre tool diversi, automazioni partite con entusiasmo e abbandonate a metà: la tecnologia si è accumulata, il sistema no.",
      implication:
        "Ogni tool aggiunto sopra un processo non chiarito aggiunge costo fisso e complessità senza togliere lavoro: si paga due volte — l'abbonamento e il tempo per tenerlo in piedi.",
      work:
        "Gli strumenti essenziali identificati, ognuno con un owner e un processo che supporta; il resto eliminato.",
      avoid:
        "Non comprare nuovi tool per compensare processi non chiariti: lo strumento eredita il disordine, non lo risolve."
    }
  ],

  externalReadiness: [
    {
      id: "readiness_external_materials",
      label: "Materiali esterni inesistenti",
      dimensions: ["readiness", "clarity"],
      stages: [
        "MARKET_TRACTION",
        "OPERATING_STABILITY",
        "VALUE_ARCHITECTURE",
        "SCALE_READINESS"
      ],
      trigger:
        "Ogni conversazione seria — partner, figura senior, banca — richiede che tu prepari materiali da zero e che tu sia presente per spiegare: senza di te nella stanza, il business non si racconta.",
      implication:
        "Chi non può verificare in autonomia, prudenzialmente svaluta: il valore che richiede la tua spiegazione orale viene percepito come più piccolo e più rischioso di quanto sia. E ogni incontro improvvisato consuma una relazione che non torna.",
      work:
        "Un set minimo di materiali — sintesi del modello, numeri chiave, struttura — che regge una lettura esterna senza la tua presenza.",
      avoid:
        "Non moltiplicare gli incontri esterni sperando che la presenza compensi i materiali: prima si ordina la lettura interna, poi si apre la porta."
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
