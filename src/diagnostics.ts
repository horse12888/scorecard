import {
  enrichRoadmapInfo,
  getFunctionConstraintsForDimensions,
  normalizeImpulseStage,
  type ImpulseDimension
} from "./impulseKnowledge";

export const DIMENSIONS_KEYS = [
  "clarity",
  "acquisition",
  "operations",
  "margins",
  "asset",
  "readiness"
];

type DimensionKey =
  | "clarity"
  | "acquisition"
  | "operations"
  | "margins"
  | "asset"
  | "readiness";

type ProcessedDimension = {
  key: string;
  label: string;
  subtitle: string;
  score: number;
  yes: number;
  bracket: string;
  cosaIndica: string;
  vincolo: string;
  nonFare: string;
  lavoro: string;
};

type DiagnosticOptions = {
  intentLevel?: number | null;
  stagingScore?: number | null;
};

type RiskFlag = {
  id: string;
  title: string;
  body: string;
  severity: "low" | "medium" | "high";
};

export const DIMENSIONS_COPY: Record<string, any> = {
  clarity: {
    label: "Clarity",
    subtitle: "Quanto è chiaro cosa fa il business, per chi e perché vale.",
    low: {
      cosaIndica:
        "La chiarezza non è ancora abbastanza stabile per reggere marketing, vendita o delega. Offerta, cliente ideale, messaggio o pricing non sono ancora leggibili in modo immediato.",
      vincolo:
        "Il valore può esistere, ma non viene capito abbastanza in fretta.",
      nonFare:
        "Non aumentare visibilità, contenuti o advertising prima di rendere l'offerta centrale più chiara.",
      lavoro:
        "Serve allineare offerta, cliente ideale, messaggio e pricing prima di amplificare il business."
    },
    mid: {
      cosaIndica:
        "Le basi della chiarezza ci sono, ma una o due aree cedono: offerta, pricing, messaggio o trasferibilità commerciale.",
      vincolo:
        "Il valore esiste. Il problema è trasferirlo senza doverlo spiegare ogni volta.",
      nonFare:
        "Non aumentare marketing sopra un messaggio ancora parzialmente instabile.",
      lavoro:
        "Allineamento rigoroso tra conversazione di vendita, sito, materiali commerciali e pricing."
    },
    high: {
      cosaIndica:
        "La chiarezza è una forza. Il business si spiega rapidamente e il valore è comprensibile.",
      vincolo:
        "Il prossimo vincolo non è creare chiarezza, ma renderla trasferibile al team, ai materiali e ai canali.",
      nonFare:
        "Non lasciare che la chiarezza viva solo nella tua conversazione diretta.",
      lavoro:
        "Documentare la logica commerciale in modo che altri possano comunicarla con la stessa precisione."
    }
  },

  acquisition: {
    label: "Acquisition",
    subtitle: "Quanto è prevedibile e indipendente da te il flusso di clienti.",
    low: {
      cosaIndica:
        "Il business non ha ancora un motore commerciale leggibile. La domanda può esistere, ma il modo in cui arriva non è stabile.",
      vincolo:
        "Il vincolo è capire da dove arrivano i clienti migliori e perché.",
      nonFare:
        "Non aprire più canali contemporaneamente.",
      lavoro:
        "Isolare un primo canale e leggere lead, conversione, qualità cliente e margine."
    },
    mid: {
      cosaIndica:
        "Hai clienti che arrivano, ma il sistema non è ancora prevedibile. Probabilmente uno o due canali funzionano, ma manca un meccanismo che non dipenda dalla tua spinta diretta.",
      vincolo:
        "Il business genera opportunità. Il vincolo è trasformarle in un flusso prevedibile.",
      nonFare:
        "Non aprire altri canali prima di sapere quale singolo canale produce clienti profittevoli in modo ripetuto.",
      lavoro:
        "Separare lead generation, qualificazione, conversione e margine per canale."
    },
    high: {
      cosaIndica:
        "L'acquisizione è una forza. Esiste un canale o un sistema commerciale che produce domanda in modo leggibile.",
      vincolo:
        "Il prossimo vincolo è proteggere qualità, margine e ripetibilità mentre aumenti il volume.",
      nonFare:
        "Non confondere più volume con crescita migliore.",
      lavoro:
        "Raffinare attribution, qualificazione e qualità cliente per evitare crescita rumorosa."
    }
  },

  operations: {
    label: "Operations",
    subtitle: "Quanto il business funziona senza memoria personale o controllo costante.",
    low: {
      cosaIndica:
        "Il business dipende ancora troppo da te per funzionare. Decisioni, urgenze e standard tornano alla tua scrivania.",
      vincolo:
        "Il vincolo è trasformare lavoro ricorrente in regole trasferibili.",
      nonFare:
        "Non assumere o aggiungere software per compensare processi non scritti.",
      lavoro:
        "Mappare decisioni ricorrenti, standard qualitativi ed eccezioni operative."
    },
    mid: {
      cosaIndica:
        "Una parte del business gira da sola, una parte dipende ancora da te. Hai delegato l'esecuzione, ma forse non la decisione o lo standard qualitativo.",
      vincolo:
        "L'esecuzione è parzialmente delegata. Il contesto decisionale no. Il business non scala quando resti tu il punto di passaggio per standard e urgenze.",
      nonFare:
        "Assumere persone o aggiungere software per compensare processi che non sono ancora trasferibili.",
      lavoro:
        "Identificare quali decisioni ricorrenti possono seguire una regola scritta e quali no."
    },
    high: {
      cosaIndica:
        "Operations è una forza. Il business ha processi, standard e responsabilità che reggono oltre la tua presenza quotidiana.",
      vincolo:
        "Il prossimo vincolo è evitare che nuove iniziative rompano il sistema operativo esistente.",
      nonFare:
        "Non aggiungere complessità senza proteggere i processi che già funzionano.",
      lavoro:
        "Raffinare dashboard operative, ownership e standard decisionali."
    }
  },

  margins: {
    label: "Margins",
    subtitle: "Leggibilità economica del business: separazione tra fatturato e margine.",
    low: {
      cosaIndica:
        "La leggibilità economica è debole. Non è ancora chiaro quali offerte, clienti o canali producano margine reale.",
      vincolo:
        "Il vincolo è separare fatturato da profitto operativo.",
      nonFare:
        "Non aumentare acquisition spend prima di sapere dove si crea margine.",
      lavoro:
        "Leggere CAC, margine lordo, conversione, retention e valore cliente per canale."
    },
    mid: {
      cosaIndica:
        "Il fatturato è chiaro e tracciato, ma il margine reale per singolo cliente, canale o specifica offerta non è ancora sufficientemente separato.",
      vincolo:
        "Il fatturato esiste, ma la leggibilità economica non è ancora sufficiente a supportare un'espansione sicura.",
      nonFare:
        "Non accelerare le spese di acquisizione prima di sapere esattamente quali clienti e canali generano margine reale.",
      lavoro:
        "Separazione fine fra canali, CAC, qualità lead, conversione, margine effettivo e lifetime value."
    },
    high: {
      cosaIndica:
        "Margins è una forza. Il business ha una lettura economica abbastanza chiara per prendere decisioni più disciplinate.",
      vincolo:
        "Il prossimo vincolo è proteggere il margine mentre cresci.",
      nonFare:
        "Non sacrificare margine per inseguire volume.",
      lavoro:
        "Analizzare quali segmenti, offerte e canali meritano più capitale operativo."
    }
  },

  asset: {
    label: "Asset",
    subtitle: "Cosa il business possiede oltre il cash flow corrente.",
    low: {
      cosaIndica:
        "Il business produce ricavi, ma non sta ancora cristallizzando abbastanza valore proprietario.",
      vincolo:
        "Il valore vive ancora troppo nell'esecuzione corrente.",
      nonFare:
        "Non parlare di espansione, capitale o partnership come se il business fosse già un asset solido.",
      lavoro:
        "Identificare IP, sistemi, dati, brand, relazioni clienti e asset documentabili."
    },
    mid: {
      cosaIndica:
        "C'è presenza di alcuni asset, dati, brand o proprietà, ma non sono ancora consolidati o leggibili dall'esterno come valore separato dall'attività corrente.",
      vincolo:
        "Il business crea valore operativo. Non tutto quel valore si sta cristallizzando in un asset indipendente.",
      nonFare:
        "Investire in espansione geografica, capitale o partnership prima che esista almeno un asset proprietario chiaramente identificabile.",
      lavoro:
        "Il prossimo livello richiede che valore, conoscenza e relazioni vivano strutturalmente nel business, non solo nella tua presenza."
    },
    high: {
      cosaIndica:
        "Asset è una forza. Il business sta costruendo valore che va oltre il cash flow operativo.",
      vincolo:
        "Il prossimo vincolo è rendere questi asset più leggibili, proteggibili e monetizzabili.",
      nonFare:
        "Non lasciare asset impliciti o non documentati.",
      lavoro:
        "Documentare sistemi, proprietà intellettuale, dati, brand e relazioni chiave."
    }
  },

  readiness: {
    label: "Readiness",
    subtitle: "Quanto il business è leggibile da chi non lo vive dall'interno.",
    low: {
      cosaIndica:
        "La leggibilità esterna è il vincolo principale. Numeri, struttura e narrativa non sono ancora pronti per un interlocutore esterno.",
      vincolo:
        "Il business può avere sostanza, ma non è ancora decodificabile da chi guarda da fuori.",
      nonFare:
        "Non esporre il business a partner, investitori, senior hire o acquirenti prima di ordinare la lettura interna.",
      lavoro:
        "Rendere chiari numeri, struttura, materiali, narrativa e logica economica."
    },
    mid: {
      cosaIndica:
        "La leggibilità è parziale. Alcune parti del business sono presentabili all'esterno in modo pulito, altre strutture risiedono ancora esclusivamente nella tua testa.",
      vincolo:
        "Il business ha sostanza. Tuttavia, non è ancora abbastanza leggibile o presentabile per chi guarda da fuori.",
      nonFare:
        "Non esporre il business a interlocutori esterni senior finché la lettura interna, numeri, report e struttura, non è ordinata.",
      lavoro:
        "Numeri, struttura e narrativa devono diventare immediatamente chiari anche a chi non vive dentro l'azienda."
    },
    high: {
      cosaIndica:
        "Readiness è una forza. Il business è già abbastanza leggibile per interlocutori esterni sofisticati.",
      vincolo:
        "Il prossimo vincolo è mantenere coerenza tra numeri, narrativa e struttura durante il prossimo salto.",
      nonFare:
        "Non presentare il business con materiali disallineati o incompleti.",
      lavoro:
        "Raffinare materiali, data room leggera, narrativa strategica e metriche chiave."
    }
  }
};

export const PROFILES: Record<string, any> = {
  A: {
    title: "Clarity Gap",
    blocco:
      "Il valore esiste. Non è ancora abbastanza leggibile dall'esterno per essere capito in fretta dal mercato.",
    manifesta:
      "Ogni vendita richiede troppa spiegazione. Il sito e le conversazioni dicono cose diverse. Il ciclo di vendita si allunga e il marketing porta lead confusi.",
    rischio:
      "Aggiungere marketing o sales su un messaggio frammentato amplifica la confusione e brucia capitale operativo senza migliorare conversioni.",
    nonFare:
      "Non rifare il sito per renderlo bello e non aumentare budget prima di aver chiarito la singola offerta centrale.",
    decisione:
      "Semplificare l'offerta a un solo asse principale leggibile universalmente e senza dipendere da una tua spiegazione privata.",
    foundational: {
      title: "Clarity Gap",
      blocco:
        "Il primo vincolo è rendere il valore comprensibile. Prima ancora di amplificare il business, serve chiarire offerta, cliente ideale, promessa e prezzo.",
      manifesta:
        "Il mercato non ha ancora un modo semplice per capire cosa compra, perché dovrebbe comprarlo e perché dovrebbe farlo ora.",
      rischio:
        "Aumentare visibilità o advertising in questa fase può generare attenzione ma non conversione utile.",
      nonFare:
        "Non aumentare contenuti, campagne o rebranding prima di aver chiarito l'offerta centrale.",
      decisione:
        "Ridurre la complessità commerciale a una promessa chiara, una buyer persona prioritaria e una struttura di prezzo difendibile."
    },
    mature: {
      title: "Gap di posizionamento",
      blocco:
        "La chiarezza esiste, ma non è ancora abbastanza stabile tra canali, materiali e conversazioni commerciali.",
      manifesta:
        "Il valore viene compreso, ma può cambiare forma a seconda di chi lo spiega, del canale usato o del tipo di interlocutore.",
      rischio:
        "Aumentare volume su un posizionamento parzialmente instabile crea lead misti, aspettative non allineate e cicli commerciali più lenti.",
      nonFare:
        "Non aumentare campagne, contenuti o nuovi canali finché il messaggio principale non è stabile e trasferibile.",
      decisione:
        "Rendere coerenti offerta, promessa, pricing, materiali e conversazione commerciale prima di amplificare."
    },
    scale: {
      title: "Gap di trasferibilità",
      blocco:
        "La chiarezza esiste. Il vincolo è renderla indipendente dalla tua presenza diretta.",
      manifesta:
        "Team, canali, materiali e interlocutori esterni devono riuscire a leggere e comunicare il valore nello stesso modo, senza dipendere dalla tua spiegazione personale.",
      rischio:
        "Se la chiarezza resta troppo concentrata nel founder, la scala crea distorsione: messaggi diversi, promesse diverse, aspettative diverse.",
      nonFare:
        "Non lasciare che la chiarezza viva solo nelle tue conversazioni dirette o nei tuoi interventi correttivi.",
      decisione:
        "Trasformare la chiarezza in sistema: materiali, narrativa, sales assets, criteri commerciali e standard di comunicazione."
    }
  },

  B: {
    title: "Growth Engine Gap",
    blocco:
      "I clienti esistono e la domanda c'è. Il modo in cui arrivano, però, non è ancora un meccanismo prevedibile o isolato.",
    manifesta:
      "Il fatturato cresce, ma non sai da dove arriverà il prossimo mese. La crescita dipende da passaparola, referral e il tuo networking personale.",
    rischio:
      "La non prevedibilità blocca grandi decisioni. Assunzioni e scale-up restano sospese perché manca la certezza del volume.",
    nonFare:
      "Non testare tre nuovi canali in contemporanea. Non delegare interamente il sales finché non è leggibile cosa funziona oggi.",
    decisione:
      "Isolare l'unico canale che ha già portato clienti profittevoli e trasformarlo in un processo tracciabile e chirurgico.",
    foundational: {
      title: "Growth Engine Gap",
      blocco:
        "Il primo vincolo è commerciale: il business non ha ancora un motore di domanda leggibile o validato.",
      manifesta:
        "Le opportunità arrivano in modo episodico o personale. Non è ancora chiaro quale offerta, canale e conversazione generino domanda ripetibile.",
      rischio:
        "Scalare ora significa aumentare rumore, non prevedibilità. Senza un primo loop commerciale, marketing e sales restano tentativi.",
      nonFare:
        "Non aprire nuovi canali e non delegare sales prima di capire quale meccanismo può generare domanda profittevole.",
      decisione:
        "Isolare un primo loop: una offerta, un segmento, un canale, una metrica economica leggibile."
    },
    mature: {
      title: "Gap di prevedibilità commerciale",
      blocco:
        "Il business genera domanda, ma la qualità del flusso commerciale deve diventare più leggibile.",
      manifesta:
        "Esistono canali e clienti, ma non è ancora abbastanza chiaro quali segnali producono clienti migliori, margine migliore o minore carico operativo.",
      rischio:
        "Crescere senza distinguere qualità della domanda, conversione e margine produce volume rumoroso.",
      nonFare:
        "Non aumentare budget o team commerciale prima di distinguere chiaramente canale, qualità lead, conversione e margine.",
      decisione:
        "Separare crescita utile e crescita rumorosa attraverso una lettura più precisa del motore commerciale."
    },
    scale: {
      title: "Gap di qualità della crescita",
      blocco:
        "La crescita esiste. Il vincolo è proteggere qualità, margine e prevedibilità mentre aumenti volume e complessità.",
      manifesta:
        "Il business può generare domanda, ma il salto successivo richiede distinzione più precisa tra canali, segmenti, clienti e margine.",
      rischio:
        "La scala può aumentare ricavi ma peggiorare qualità, capacità operativa e margine se il motore commerciale non viene governato.",
      nonFare:
        "Non confondere volume con crescita migliore.",
      decisione:
        "Rendere il growth engine più selettivo: canali, qualificazione, segmenti, margine e capacità devono muoversi insieme."
    }
  },

  C: {
    title: "Operational Gap",
    blocco:
      "Il business produce valore tangibile. Il modo in cui lo produce non è ancora un sistema indipendente da te.",
    manifesta:
      "Il team esegue, ma le eccezioni e i problemi inattesi rimbalzano costantemente sulla tua scrivania. La tua capacità di assorbire eccezioni diventa il limite dell'azienda.",
    rischio:
      "Aumentare le vendite aggraverà il collo di bottiglia operativo, degradando la qualità dell'erogazione e aumentando il carico operativo su di te.",
    nonFare:
      "Non assumere altre risorse junior e non implementare software complessi sperando che organizzino processi non scritti.",
    decisione:
      "Scrivere le regole ricorrenti e trasferire non l'esecuzione manuale, ma il contesto decisionale ai diretti responsabili.",
    foundational: {
      title: "Operational Gap",
      blocco:
        "Il vincolo operativo è ancora di base: il business non ha stabilizzato abbastanza regole, standard e responsabilità.",
      manifesta:
        "Molte attività dipendono ancora da memoria personale, urgenza, controllo diretto o correzioni continue.",
      rischio:
        "Aumentare clienti o complessità operativa può rompere la qualità prima ancora di creare scala.",
      nonFare:
        "Non assumere o aggiungere software prima di aver scritto le regole operative minime.",
      decisione:
        "Trasformare le attività ricorrenti in standard semplici, visibili e ripetibili."
    },
    mature: {
      title: "Gap di delega decisionale",
      blocco:
        "Il business funziona, ma alcune decisioni, eccezioni e standard tornano ancora troppo spesso al founder.",
      manifesta:
        "Il team può eseguire, ma il contesto decisionale resta concentrato. Le persone sanno cosa fare, ma non sempre quando decidere, quando fermarsi e quando escalare.",
      rischio:
        "Il founder resta il sistema operativo invisibile dell'azienda. Questo limita velocità, ownership e capacità di crescita.",
      nonFare:
        "Non aggiungere persone o strumenti per compensare decisioni non codificate.",
      decisione:
        "Rendere trasferibili criteri decisionali, ownership, standard qualitativi ed escalation."
    },
    scale: {
      title: "Gap di architettura operativa",
      blocco:
        "Il sistema operativo esiste. Il vincolo è proteggerlo mentre aumentano volume, team, canali e complessità.",
      manifesta:
        "La struttura regge, ma nuove iniziative possono creare eccezioni, sovraccarico manageriale o perdita di standard.",
      rischio:
        "La scala rompe ciò che funzionava se processi, ownership e reporting non vengono rafforzati prima dell'aumento di complessità.",
      nonFare:
        "Non aggiungere complessità senza proteggere i processi e le responsabilità che già funzionano.",
      decisione:
        "Rafforzare governance operativa, ownership, dashboard e criteri decisionali per assorbire il prossimo salto."
    }
  },

  D: {
    title: "Readiness Gap",
    blocco:
      "Il valore e i sistemi esistono. Tuttavia, il business non è pronto per essere decodificato facilmente da interlocutori esterni, investitori o partner strategici.",
    manifesta:
      "Davanti a investitori, partner o acquirenti devi tradurre faticosamente i numeri e giustificare la struttura aziendale a voce.",
    rischio:
      "Si lascia denaro e posizione sul tavolo negoziale per via di uno svantaggio strutturale nella presentazione dei dati.",
    nonFare:
      "Non intavolare partnership strategiche, operazioni di capitale o di acquisizione finché reportistica e struttura legale non sono cristalline.",
    decisione:
      "Rendere la struttura di business completamente ispezionabile e chiara nei dati. L'identità finanziaria deve parlare da sola.",
    foundational: {
      title: "Readiness Gap",
      blocco:
        "Il business non è ancora abbastanza leggibile per essere valutato bene da chi lo osserva dall'esterno.",
      manifesta:
        "Numeri, struttura, materiali e narrativa non sono ancora ordinati in una forma che un interlocutore esterno possa leggere senza traduzione.",
      rischio:
        "Esporsi troppo presto a partner, investitori o figure senior crea asimmetria: il valore può essere sottovalutato o frainteso.",
      nonFare:
        "Non cercare capitale, partnership o senior hire prima di ordinare metriche, struttura e narrativa.",
      decisione:
        "Preparare una lettura esterna minima: numeri chiave, logica economica, struttura, rischi e materiali."
    },
    mature: {
      title: "Gap di leggibilità esterna",
      blocco:
        "Il business ha sostanza, ma la lettura esterna non è ancora abbastanza ordinata.",
      manifesta:
        "Alcuni numeri, materiali o passaggi strategici richiedono ancora spiegazione orale. Il valore c'è, ma non sempre si vede subito.",
      rischio:
        "Un interlocutore esterno può sottovalutare il business o leggere male rischio, margine, asset e potenziale.",
      nonFare:
        "Non entrare in conversazioni strategiche importanti con materiali disallineati o incompleti.",
      decisione:
        "Rendere numeri, narrativa, struttura e asset leggibili senza traduzione continua del founder."
    },
    scale: {
      title: "Gap di investor readiness",
      blocco:
        "Il business è forte. Il vincolo è renderlo pienamente leggibile, difendibile e auditabile da interlocutori esterni sofisticati.",
      manifesta:
        "Il valore deve essere comunicabile attraverso materiali, metriche, asset, responsabilità e narrativa coerente. Non basta che il business funzioni: deve essere leggibile a distanza.",
      rischio:
        "In operazioni strategiche, capitale, partnership o board review, materiali incompleti riducono leva negoziale e credibilità.",
      nonFare:
        "Non presentare il business con numeri, narrativa, asset o governance non allineati.",
      decisione:
        "Preparare una lettura esterna solida: metriche, data room leggera, asset, rischi, narrativa strategica e struttura operativa."
    }
  }
};

export const IMPULSE_SCALING_ROADMAP: Record<string, any> = {
  FOUNDATION: {
    label: "FOUNDATION",
    roadmapStageMap: ["IMPROVISE", "MONETIZE"],
    role: "Founder as operator",
    headline:
      "Il business deve prima isolare l'offerta e validare una delivery ripetibile.",
    bottomLineConstraint:
      "Il business non ha ancora separato abbastanza chiaramente offerta, cliente, delivery e margine. Prima di cercare scala, deve dimostrare che una proposta centrale può essere venduta e consegnata in modo ripetibile.",
    graduationCriteria: [
      "Una offerta centrale chiara",
      "Un cliente ideale prioritario",
      "Una delivery che può essere ripetuta senza reinventare ogni volta",
      "Una prima lettura di margine e sostenibilità",
      "Un messaggio commerciale comprensibile senza spiegazioni lunghe"
    ],
    functionConstraints: {
      product: "L'offerta può essere ancora troppo personalizzata o instabile.",
      marketing:
        "Il messaggio non è ancora abbastanza semplice da generare domanda qualificata.",
      sales:
        "La vendita dipende ancora dalla capacità personale del founder di spiegare il valore.",
      customerService:
        "La delivery può richiedere interventi manuali o correzioni frequenti.",
      it: "Gli strumenti servono a tenere ordine, non a creare automazioni complesse.",
      recruiting:
        "Assumere ruoli fissi è prematuro se il lavoro ricorrente non è ancora chiaro.",
      hr: "Non serve una struttura HR. Serve chiarezza su responsabilità minime e standard.",
      finance:
        "La priorità è leggere margine, cash flow e costo reale della delivery."
    },
    troppoPresto:
      "Automazioni complesse, assunzioni strutturali, rebranding, nuovi canali o advertising significativo prima di aver isolato una offerta che si vende e si consegna con margine.",
    diventareSistema:
      "L'offerta centrale, il profilo cliente, la promessa commerciale e la capacità di erogare con qualità a un margine corretto.",
    nonFare:
      "Non cercare di automatizzare l'acquisizione di un'offerta che non si vende facilmente a voce.",
    strategicReviewFocus:
      "Validare il nucleo: offerta, cliente, promessa, pricing, delivery e margine minimo."
  },

  TRACTION: {
    label: "TRACTION",
    roadmapStageMap: ["ADVERTISE", "STABILIZE"],
    role: "Founder as builder",
    headline:
      "Il business ha domanda. Non ha ancora prevedibilità matematica.",
    bottomLineConstraint:
      "Il business ha segnali di domanda, ma non ha ancora isolato un meccanismo prevedibile di acquisizione, conversione, delivery e margine.",
    graduationCriteria: [
      "Un canale primario identificato",
      "Una metrica di conversione leggibile",
      "Una prima separazione tra lead, cliente buono e cliente rumoroso",
      "Una delivery che non collassa al crescere delle richieste",
      "Una lettura chiara del margine per offerta o canale"
    ],
    functionConstraints: {
      product: "L'offerta deve essere resa più standardizzabile senza perdere valore.",
      marketing:
        "Il vincolo è isolare quale messaggio e quale canale portano domanda utile.",
      sales:
        "La conversione deve diventare tracciabile, non solo dipendente da intuito e relazione.",
      customerService:
        "La qualità deve reggere un primo aumento di volume senza troppe eccezioni.",
      it: "Serve una base di tracking: CRM leggero, pipeline, fonti lead e report minimo.",
      recruiting:
        "Eventuali supporti devono liberare il founder dalle attività ripetitive, non sostituire decisioni non ancora codificate.",
      hr: "Serve chiarire ownership e responsabilità operative di base.",
      finance:
        "CAC, margine, conversione e cash flow devono essere letti per canale o offerta."
    },
    troppoPresto:
      "Moltiplicazione dei canali, sales team, software enterprise, hiring pesante o ottimizzazioni avanzate prima di avere un primo loop leggibile.",
    diventareSistema:
      "Un singolo canale di acquisizione, una prima pipeline commerciale e un flusso operativo delegabile.",
    nonFare:
      "Non testare tre nuovi canali in contemporanea prima di aver reso prevedibile il primo.",
    strategicReviewFocus:
      "Isolare il primo growth loop: canale, messaggio, conversione, delivery e margine."
  },

  STABILIZATION: {
    label: "STABILIZATION",
    roadmapStageMap: ["PRIORITIZE"],
    role: "Founder as operator-designer",
    headline:
      "Il business funziona. Il vincolo è ridurre la dipendenza dai tuoi input quotidiani.",
    bottomLineConstraint:
      "Il business ha una base funzionante, ma il founder resta ancora troppo coinvolto in eccezioni, decisioni, standard e controllo qualità.",
    graduationCriteria: [
      "Processi principali documentati",
      "Decisioni ricorrenti codificate",
      "Responsabilità operative assegnate",
      "Dashboard o reporting minimo attivo",
      "Eccezioni ridotte e gestite senza passare sempre dal founder"
    ],
    functionConstraints: {
      product: "La delivery deve diventare meno artigianale e più standardizzata.",
      marketing: "Il marketing deve seguire priorità commerciali, non iniziative sparse.",
      sales: "La vendita deve avere script, criteri di qualificazione e passaggi chiari.",
      customerService:
        "Le eccezioni devono essere classificate e risolte con regole, non solo con interventi ad hoc.",
      it: "Gli strumenti devono supportare workflow e reporting, non aggiungere complessità.",
      recruiting:
        "Le assunzioni servono solo dove esiste una funzione chiara da trasferire.",
      hr: "Servono standard di performance e responsabilità, anche se la struttura è ancora leggera.",
      finance: "Budget, margini e cash flow devono guidare le priorità operative."
    },
    troppoPresto:
      "Espansione internazionale, acquisizioni, iniziative laterali, nuovi prodotti o investimenti slegati dal core business.",
    diventareSistema:
      "Il livello decisionale intermedio: le eccezioni non devono più arrivare sempre al founder.",
    nonFare:
      "Non assumere altre risorse junior per tamponare l'assenza di processi scritti.",
    strategicReviewFocus:
      "Ridurre dipendenza dal founder attraverso processi, ownership, dashboard e regole decisionali."
  },

  PRODUCTIZATION: {
    label: "PRODUCTIZATION",
    roadmapStageMap: ["PRODUCTIZE", "OPTIMIZE"],
    role: "Founder as system architect",
    headline:
      "A questo stadio si lavora sull'economia, sulla scalabilità dei margini, non sul volume base.",
    bottomLineConstraint:
      "Il business funziona, ma deve trasformare capacità, delivery e valore in unità più replicabili, leggibili e marginalmente efficienti.",
    graduationCriteria: [
      "Offerte strutturate e non solo servizi custom",
      "Margini leggibili per offerta, cliente o canale",
      "Standard di delivery chiari",
      "Sistema commerciale replicabile",
      "Metriche operative e finanziarie usate per decidere"
    ],
    functionConstraints: {
      product:
        "Il valore deve essere impacchettato in offerte più ripetibili e comparabili.",
      marketing:
        "Il posizionamento deve sostenere offerte chiare, non solo reputazione personale.",
      sales: "Il processo commerciale deve poter essere trasferito e misurato.",
      customerService:
        "La customer experience deve diventare coerente e non dipendere da interventi eccezionali.",
      it: "Automazioni e strumenti devono aumentare margine e controllo, non solo velocità.",
      recruiting:
        "Assunzioni e ruoli devono essere progettati attorno a funzioni scalabili.",
      hr: "Servono criteri di performance, formazione e responsabilità per mantenere standard.",
      finance:
        "La finanza deve guidare pricing, mix clienti, margini e allocazione del capitale operativo."
    },
    troppoPresto:
      "Abbandono della supervisione strategica, espansione del volume con clienti fuori target, debito non necessario o nuovi prodotti scollegati dal core.",
    diventareSistema:
      "Leggibilità totale dei margini e trasformazione della delivery in un prodotto operativo più replicabile.",
    nonFare:
      "Non espandere il volume acquisendo clienti fuori target che inquinano i margini.",
    strategicReviewFocus:
      "Productizzare il valore: offerte, margini, delivery, sistemi commerciali e controllo economico."
  },

  "SCALE READINESS": {
    label: "SCALE READINESS",
    roadmapStageMap: ["CATEGORIZE", "SPECIALIZE", "CAPITALIZE"],
    role: "Founder as strategic allocator",
    headline:
      "Il valore esiste ed è autonomo. Il problema diventa renderlo perfettamente leggibile all'esterno.",
    bottomLineConstraint:
      "Il business ha valore, struttura e sistemi. Il prossimo vincolo è rendere tutto leggibile, auditabile e difendibile per decisioni più grandi.",
    graduationCriteria: [
      "Metriche finanziarie coerenti",
      "Narrativa strategica chiara",
      "Asset e sistemi documentati",
      "Responsabilità manageriali leggibili",
      "Materiali pronti per partner, investitori, board o operazioni straordinarie"
    ],
    functionConstraints: {
      product:
        "Le offerte devono essere categorizzabili, confrontabili e spiegabili a stakeholder esterni.",
      marketing:
        "Il posizionamento deve sostenere credibilità e differenziazione strategica.",
      sales:
        "Il sistema commerciale deve essere leggibile come asset, non solo come performance corrente.",
      customerService:
        "Retention, qualità e soddisfazione devono essere dimostrabili con dati.",
      it: "Sistemi, dati e reporting devono reggere due diligence leggera o revisione esterna.",
      recruiting:
        "La struttura manageriale deve essere comprensibile e non dipendere solo dal founder.",
      hr: "Ruoli, incentivi e responsabilità devono sostenere continuità e accountability.",
      finance:
        "La lettura finanziaria deve essere pronta per capitale, partnership, M&A o board esterni."
    },
    troppoPresto:
      "Operazioni straordinarie, partnership strategiche o capitale esterno senza una lettura finanziaria, operativa e narrativa già ordinata.",
    diventareSistema:
      "Metriche finanziarie, struttura, asset, reporting e narrativa devono essere leggibili anche da chi non conosce il business dall'interno.",
    nonFare:
      "Non presentare il business con dati, materiali o narrativa disallineati.",
    strategicReviewFocus:
      "Preparare il business a interlocutori esterni: data room leggera, metriche, asset, narrativa e struttura."
  }
};

export const STAGE_DATA = IMPULSE_SCALING_ROADMAP;

const PROFILE_STAGE_MATRIX: Record<string, Record<string, any>> = {
  A: {
    FOUNDATION: {
      title: "Chiarezza prima della crescita",
      body:
        "Il business non ha ancora una struttura di offerta abbastanza chiara. Prima di parlare di crescita, serve definire cosa viene venduto, a chi, perché e con quale pricing.",
      focus:
        "Ridurre la complessità commerciale e trasformare offerta, promessa e cliente ideale in una lettura semplice."
    },
    TRACTION: {
      title: "Domanda potenziale, messaggio instabile",
      body:
        "C'è movimento, ma il mercato non riceve ancora un messaggio sufficientemente coerente. Il rischio è generare domanda confusa o clienti non ideali.",
      focus:
        "Rendere stabile la promessa commerciale prima di aumentare canali, contenuti o outbound."
    },
    STABILIZATION: {
      title: "Chiarezza da codificare",
      body:
        "Il business funziona, ma la chiarezza commerciale non è ancora abbastanza codificata. Team, materiali o partner potrebbero non spiegare il valore nello stesso modo.",
      focus:
        "Allineare sito, materiali, pricing e conversazione commerciale."
    },
    PRODUCTIZATION: {
      title: "Offerta da rendere pacchettizzabile",
      body:
        "Il business è vicino a diventare più pacchettizzabile, ma offerta, promessa e pricing devono essere più stabili prima di aumentare scala.",
      focus:
        "Trasformare il valore in una struttura di offerta più leggibile, replicabile e vendibile."
    },
    "SCALE READINESS": {
      title: "Chiarezza come asset trasferibile",
      body:
        "La chiarezza è il collo di bottiglia residuo. Il valore esiste, ma deve essere espresso in modo più forte, trasferibile e immediato.",
      focus:
        "Rendere la narrativa commerciale indipendente dal founder."
    }
  },

  B: {
    FOUNDATION: {
      title: "Motore commerciale non ancora validato",
      body:
        "Il business non ha ancora un motore di domanda affidabile. Prima di scalare, serve capire quale offerta può generare clienti giusti con margine sostenibile.",
      focus:
        "Validare un primo loop commerciale: segmento, canale, messaggio, conversione e margine."
    },
    TRACTION: {
      title: "Trazione non ancora prevedibile",
      body:
        "Ci sono clienti o interesse, ma l'acquisizione dipende ancora troppo da referral, rete personale o sforzo diretto.",
      focus:
        "Separare domanda episodica da domanda ripetibile."
    },
    STABILIZATION: {
      title: "Growth engine da misurare meglio",
      body:
        "La domanda esiste, ma il processo commerciale deve diventare più misurabile. Lead quality, conversione e margine vanno separati.",
      focus:
        "Misurare canali, qualità lead, conversione e margine per decidere dove investire."
    },
    PRODUCTIZATION: {
      title: "Crescita da rendere meno founder-led",
      body:
        "Il business ha una base sufficiente, ma il growth engine deve diventare meno dipendente dal founder e più ripetibile.",
      focus:
        "Costruire un processo commerciale trasferibile, qualificabile e controllabile."
    },
    "SCALE READINESS": {
      title: "Crescita come vincolo di scala",
      body:
        "La crescita è il vincolo principale. Il sistema è abbastanza maturo, ma serve una macchina commerciale più prevedibile.",
      focus:
        "Proteggere qualità, margine e prevedibilità mentre cresce il volume."
    }
  },

  C: {
    FOUNDATION: {
      title: "Sistema operativo ancora troppo informale",
      body:
        "Il business dipende troppo dal founder o da processi informali. La priorità è rendere visibile come funziona davvero il sistema operativo.",
      focus:
        "Scrivere standard minimi, responsabilità e decisioni ricorrenti."
    },
    TRACTION: {
      title: "La delivery può limitare la domanda",
      body:
        "La domanda può esserci, ma la delivery non è ancora abbastanza stabile. Più clienti potrebbero aumentare caos, eccezioni e dipendenza dal founder.",
      focus:
        "Stabilizzare delivery e ownership prima di aumentare volume commerciale."
    },
    STABILIZATION: {
      title: "Delega decisionale da rafforzare",
      body:
        "Il business funziona, ma ruoli, decisioni e processi devono essere codificati. Il rischio è restare bloccati in una gestione troppo manuale.",
      focus:
        "Trasferire criteri decisionali, standard qualitativi e gestione delle eccezioni."
    },
    PRODUCTIZATION: {
      title: "Delivery da rendere trasferibile",
      body:
        "La delivery deve diventare trasferibile. Il problema non è solo fare bene il lavoro, ma renderlo replicabile senza il founder al centro.",
      focus:
        "Trasformare capacità operativa in sistema, processi, ruoli e metriche."
    },
    "SCALE READINESS": {
      title: "Operations da proteggere in scala",
      body:
        "Il business è vicino alla scala, ma l'operatività deve reggere volume, team e standardizzazione senza perdere qualità.",
      focus:
        "Rafforzare governance operativa, dashboard, ruoli e standard."
    }
  },

  D: {
    FOUNDATION: {
      title: "Business non ancora leggibile dall'esterno",
      body:
        "Il business non è ancora leggibile per interlocutori esterni. Prima di esporlo a partner, advisor o capitali, servono numeri, materiali e struttura.",
      focus:
        "Preparare una lettura minima: numeri, modello, rischi, asset e narrativa."
    },
    TRACTION: {
      title: "Sostanza ancora poco dimostrabile",
      body:
        "C'è attività, ma non ancora una narrativa ordinata. Il rischio è avere sostanza, ma non riuscire a dimostrarla bene.",
      focus:
        "Ordinare metriche, materiali e struttura prima di conversazioni strategiche."
    },
    STABILIZATION: {
      title: "Leggibilità esterna da costruire",
      body:
        "Il business funziona, ma deve essere reso più leggibile. Numeri, ruoli, rischi e materiali devono poter parlare senza spiegazioni continue del founder.",
      focus:
        "Rendere il business spiegabile da materiali, numeri e struttura, non solo dalla tua voce."
    },
    PRODUCTIZATION: {
      title: "Readiness come ponte verso il valore",
      body:
        "La readiness diventa il ponte verso partner, capitale o valorizzazione. Serve rendere il business valutabile e trasferibile.",
      focus:
        "Costruire materiali, asset, metriche e narrativa per interlocutori senior."
    },
    "SCALE READINESS": {
      title: "Investor readiness da rafforzare",
      body:
        "Il business è vicino a uno stage avanzato, ma la qualità della documentazione, governance e narrative package può ancora limitarne il valore percepito.",
      focus:
        "Allineare metriche, data room leggera, asset, rischi e governance."
    }
  }
};

const TOP_GAP_PAIR_MATRIX: Record<string, any> = {
  clarity_acquisition: {
    title: "Clarity + Acquisition",
    body:
      "Il problema non è solo trovare più clienti. Il mercato potrebbe non capire abbastanza bene cosa viene offerto, per chi è pensato e perché dovrebbe scegliere te.",
    warning:
      "Aumentare advertising, contenuti o outreach può amplificare confusione.",
    focus:
      "Chiarire offerta, promessa, cliente ideale e messaggio prima di scalare canali."
  },
  clarity_operations: {
    title: "Clarity + Operations",
    body:
      "Il business non è chiaro né commercialmente né operativamente. Ogni cliente può diventare un caso speciale e aumentare dipendenza dal founder.",
    warning:
      "Scalare in questa condizione aumenta complessità commerciale e operativa insieme.",
    focus:
      "Standardizzare offerta e delivery nello stesso intervento."
  },
  clarity_margins: {
    title: "Clarity + Margins",
    body:
      "Il valore non è abbastanza chiaro, quindi anche il pricing diventa fragile. Quando il valore non è leggibile, il margine tende a essere difeso con più fatica.",
    warning:
      "Prezzi decisi per sensazione, sconti frequenti e margini poco difendibili.",
    focus:
      "Ricollegare pricing a valore percepito, outcome e posizionamento."
  },
  clarity_asset: {
    title: "Clarity + Asset",
    body:
      "Il business può avere valore, ma non è ancora trasformato in asset riconoscibili. Il valore resta troppo nella persona, nella reputazione o nell'operatività quotidiana.",
    warning:
      "Senza asset chiari, il business viene percepito come meno trasferibile.",
    focus:
      "Identificare IP, metodologie, dati, processi, brand o contratti documentabili."
  },
  clarity_readiness: {
    title: "Clarity + Readiness",
    body:
      "Il business non è ancora spiegabile in modo forte a un interlocutore senior. Il valore può esistere, ma richiede troppa traduzione.",
    warning:
      "Opportunità strategiche possono essere perse perché il valore non viene capito velocemente.",
    focus:
      "Creare narrativa chiara, numeri essenziali e materiali sintetici."
  },
  acquisition_operations: {
    title: "Acquisition + Operations",
    body:
      "La domanda e la delivery non sono ancora allineate. Anche se arrivassero più clienti, il sistema potrebbe non reggere.",
    warning:
      "Più acquisizione può produrre più caos operativo.",
    focus:
      "Stabilizzare processo commerciale e delivery prima di aumentare volume."
  },
  acquisition_margins: {
    title: "Acquisition + Margins",
    body:
      "Il growth engine non è ancora economicamente sano. Il problema può essere volume, qualità lead, conversione o margine.",
    warning:
      "Crescere in fatturato può peggiorare profitto, cash flow o qualità clienti.",
    focus:
      "Misurare canali per margine, non solo per lead o ricavi."
  },
  acquisition_asset: {
    title: "Acquisition + Asset",
    body:
      "Il business vende, ma non accumula abbastanza valore proprietario o trasferibile. Ogni vendita rischia di restare transazionale.",
    warning:
      "La crescita può produrre ricavi senza creare enterprise value.",
    focus:
      "Trasformare acquisizione, clienti e delivery in dati, case study, IP, community o contratti."
  },
  acquisition_readiness: {
    title: "Acquisition + Readiness",
    body:
      "Il business non ha ancora una pipeline leggibile né materiali forti per partner o figure senior. Il mercato interno non è prevedibile e l'esterno non capisce il potenziale.",
    warning:
      "Conversazioni strategiche esterne restano deboli se domanda e materiali non sono leggibili.",
    focus:
      "Costruire una lettura chiara di domanda, funnel, conversione e qualità clienti."
  },
  operations_margins: {
    title: "Operations + Margins",
    body:
      "Il sistema operativo può stare erodendo margine. Il problema non è solo quanto vendi, ma quanto costa consegnare bene.",
    warning:
      "Delivery complessa, eccezioni, tempo founder nascosto e margini reali più bassi di quelli percepiti.",
    focus:
      "Mappare delivery economics, tempi, costi nascosti e ownership."
  },
  operations_asset: {
    title: "Operations + Asset",
    body:
      "Il business funziona, ma il valore è ancora troppo incorporato nelle persone e nei processi informali.",
    warning:
      "Difficile delegare, vendere, trasferire o valorizzare se il sistema resta implicito.",
    focus:
      "Documentare processi, metodologie, asset e responsabilità."
  },
  operations_readiness: {
    title: "Operations + Readiness",
    body:
      "Il business non è ancora sufficientemente autonomo né leggibile. La dipendenza operativa rende difficile una conversazione strategica esterna.",
    warning:
      "Il founder resta indispensabile in ogni spiegazione e decisione.",
    focus:
      "Separare ruoli, processi, numeri e materiali."
  },
  margins_asset: {
    title: "Margins + Asset",
    body:
      "Il business può generare ricavi, ma non abbastanza valore economico o patrimoniale.",
    warning:
      "Molto lavoro può tradursi in poco enterprise value.",
    focus:
      "Capire quali offerte, clienti o canali creano margine e asset."
  },
  margins_readiness: {
    title: "Margins + Readiness",
    body:
      "I numeri economici non sono ancora pronti per guidare decisioni o conversazioni esterne.",
    warning:
      "Decisioni strategiche prese su fatturato, non su margini e cash flow.",
    focus:
      "Rendere margini, cash flow e unit economics leggibili."
  },
  asset_readiness: {
    title: "Asset + Readiness",
    body:
      "Il valore potenziale del business non è ancora dimostrabile. Potrebbero esserci asset, ma non sono pronti per essere capiti, valutati o trasferiti.",
    warning:
      "Il business viene percepito come meno solido di quanto sia.",
    focus:
      "Documentare asset, evidenze, contratti, IP, dati, rischi e materiali esterni."
  }
};

function getProfileMaturityKey(overall: number) {
  if (overall < 40) return "foundational";
  if (overall >= 85) return "scale";
  if (overall >= 60) return "mature";
  return "base";
}

export function getProfileData(profileId: string, overall: number) {
  const baseProfile = PROFILES[profileId] || PROFILES.B;
  const maturityKey = getProfileMaturityKey(Number(overall || 0));

  if (maturityKey !== "base" && baseProfile[maturityKey]) {
    return {
      ...baseProfile,
      title: baseProfile[maturityKey].title || baseProfile.title,
      blocco: baseProfile[maturityKey].blocco || baseProfile.blocco,
      manifesta: baseProfile[maturityKey].manifesta || baseProfile.manifesta,
      rischio: baseProfile[maturityKey].rischio || baseProfile.rischio,
      nonFare: baseProfile[maturityKey].nonFare || baseProfile.nonFare,
      decisione: baseProfile[maturityKey].decisione || baseProfile.decisione
    };
  }

  return { ...baseProfile };
}

export function stageFromScore(overall: number): string {
  const s = Number(overall) || 0;

  if (s < 40) return "FOUNDATION";
  if (s < 60) return "TRACTION";
  if (s < 75) return "STABILIZATION";
  if (s < 85) return "PRODUCTIZATION";

  return "SCALE READINESS";
}

export function fasciaFromScore(overall: number): string {
  const s = Number(overall) || 0;

  if (s < 40) return "FOUNDATIONAL";
  if (s < 60) return "BUILDING";
  if (s < 85) return "AWARE";

  return "READY";
}

function getProfileFromDimensionKey(key: string) {
  if (key === "clarity") return "A";
  if (key === "acquisition" || key === "margins") return "B";
  if (key === "operations" || key === "asset") return "C";
  if (key === "readiness") return "D";

  return "B";
}

function hasKey(keys: string[], key: string) {
  return keys.indexOf(key) !== -1;
}

function resolveProfileWithTieBreak(
  sortedDims: ProcessedDimension[],
  intentLevel: number | null
) {
  const lowestScore = Number(sortedDims[0]?.score || 0);

  const candidateDims = sortedDims
    .filter(dim => Number(dim.score) <= lowestScore + 0.7)
    .map(dim => dim.key);

  const exactLowestDims = sortedDims
    .filter(dim => Number(dim.score) === lowestScore)
    .map(dim => dim.key);

  const intent = typeof intentLevel === "number" ? intentLevel : null;

  if (intent === 3 && hasKey(candidateDims, "readiness")) {
    return "D";
  }

  if (
    hasKey(candidateDims, "clarity") &&
    (hasKey(candidateDims, "acquisition") || hasKey(candidateDims, "margins"))
  ) {
    return "A";
  }

  if (
    hasKey(candidateDims, "operations") &&
    (hasKey(candidateDims, "acquisition") || hasKey(candidateDims, "margins"))
  ) {
    return "C";
  }

  if (hasKey(candidateDims, "operations") && hasKey(candidateDims, "asset")) {
    return "C";
  }

  if (hasKey(candidateDims, "asset") && hasKey(candidateDims, "readiness")) {
    return intent !== null && intent >= 2 ? "D" : "C";
  }

  if (hasKey(candidateDims, "acquisition") && hasKey(candidateDims, "margins")) {
    return "B";
  }

  if (hasKey(exactLowestDims, "readiness")) {
    return "D";
  }

  return getProfileFromDimensionKey(sortedDims[0]?.key || "acquisition");
}

function normalizeGapPairKey(first: string, second: string) {
  const ordered = [first, second].sort(function (a, b) {
    return DIMENSIONS_KEYS.indexOf(a) - DIMENSIONS_KEYS.indexOf(b);
  });

  return ordered.join("_");
}

function buildTopGapPair(sortedDims: ProcessedDimension[]) {
  const first = sortedDims[0]?.key || "acquisition";
  const second = sortedDims[1]?.key || "operations";
  const key = normalizeGapPairKey(first, second);

  return {
    first,
    second,
    key
  };
}

function getTopGapPairData(pairKey: string) {
  return (
    TOP_GAP_PAIR_MATRIX[pairKey] || {
      title: "Diagnostic Pattern",
      body:
        "Il pattern diagnostico nasce dalla combinazione delle due dimensioni più deboli. Queste aree vanno lette insieme prima di scegliere cosa scalare.",
      warning:
        "Intervenire su una sola area può lasciare intatto il vincolo reale.",
      focus:
        "Leggere insieme i primi due gap e trasformarli in una sequenza operativa."
    }
  );
}

function getProfileStageData(profile: string, stageKey: string) {
  const profileMap = PROFILE_STAGE_MATRIX[profile] || PROFILE_STAGE_MATRIX.B;

  return (
    profileMap[stageKey] || {
      title: "Profilo e stage da leggere insieme",
      body:
        "Il profilo mostra il tipo di vincolo. Lo stage mostra quanto il business è pronto a reggere il prossimo salto.",
      focus:
        "Usare profilo e stage per decidere cosa correggere prima."
    }
  );
}

function getScoreMap(processedDims: ProcessedDimension[]) {
  return processedDims.reduce((acc: Record<string, number>, dim) => {
    acc[dim.key] = Number(dim.score || 0);
    return acc;
  }, {});
}

function buildRiskFlags(
  processedDims: ProcessedDimension[],
  overall: number,
  intentLevel: number | null
): RiskFlag[] {
  const s = getScoreMap(processedDims);
  const intent = typeof intentLevel === "number" ? intentLevel : null;
  const risks: RiskFlag[] = [];

  if (s.acquisition >= 6.7 && s.operations < 4) {
    risks.push({
      id: "demand_breaks_delivery",
      title: "Demand breaks delivery",
      body:
        "La domanda non è il problema principale. Il rischio è aumentare volume prima che delivery e decisioni operative siano stabili.",
      severity: "high"
    });
  }

  if (s.acquisition >= 6 && s.margins < 4) {
    risks.push({
      id: "revenue_without_margin",
      title: "Revenue without margin",
      body:
        "Il business può generare clienti, ma non è chiaro se la crescita produce margine sano.",
      severity: "high"
    });
  }

  if (s.operations < 4 && s.readiness < 5) {
    risks.push({
      id: "founder_dependency",
      title: "Founder dependency",
      body:
        "Il business dipende ancora troppo dal founder per funzionare ed essere spiegato.",
      severity: "high"
    });
  }

  if (intent === 3 && s.readiness < 5) {
    risks.push({
      id: "strategic_exposure_risk",
      title: "Strategic exposure risk",
      body:
        "Stai considerando una decisione importante, ma il business potrebbe non essere ancora abbastanza leggibile per sostenerla.",
      severity: "high"
    });
  }

  if (s.asset < 4 && Number(overall || 0) >= 50) {
    risks.push({
      id: "hidden_value_risk",
      title: "Hidden value risk",
      body:
        "Il business può avere trazione, ma non sta ancora accumulando abbastanza valore trasferibile.",
      severity: "medium"
    });
  }

  if (Number(overall || 0) < 60 && intent !== null && intent >= 2) {
    risks.push({
      id: "premature_scaling_risk",
      title: "Premature scaling risk",
      body:
        "Prima di aumentare team, capitale o complessità, serve chiarire il vincolo principale.",
      severity: "high"
    });
  }

  if (s.clarity < 4 && s.margins < 5) {
    risks.push({
      id: "positioning_leakage",
      title: "Positioning leakage",
      body:
        "La mancanza di chiarezza può indebolire pricing, margine e qualità clienti.",
      severity: "medium"
    });
  }

  if (s.asset >= 6 && s.readiness < 5) {
    risks.push({
      id: "external_readiness_gap",
      title: "External readiness gap",
      body:
        "Esistono asset o valore proprietario, ma non sono ancora pronti per essere presentati a partner o buyer.",
      severity: "medium"
    });
  }

  return risks.slice(0, 4);
}

function buildIntentInsight(intentLevel: number | null) {
  if (intentLevel === 0) {
    return {
      level: 0,
      label: "Nessuna decisione strategica immediata",
      body:
        "La diagnosi può essere usata per ordinare il business senza pressione immediata su capitale, exit, senior hire o partnership."
    };
  }

  if (intentLevel === 1) {
    return {
      level: 1,
      label: "Interesse esplorativo",
      body:
        "Esiste un interesse strategico, ma non ancora una finestra decisionale urgente. La priorità è aumentare chiarezza e controllo."
    };
  }

  if (intentLevel === 2) {
    return {
      level: 2,
      label: "Decisione probabile nei prossimi 6-12 mesi",
      body:
        "Il business va preparato prima che la decisione diventi urgente. Numeri, vincoli e materiali devono diventare più leggibili."
    };
  }

  if (intentLevel === 3) {
    return {
      level: 3,
      label: "Decisione prioritaria adesso",
      body:
        "La diagnosi va letta con maggiore urgenza. Se readiness, asset o operations sono bassi, una decisione strategica potrebbe essere prematura o sottovalutare i rischi."
    };
  }

  return {
    level: null,
    label: "Intent non rilevato",
    body:
      "L'urgenza strategica non è disponibile in questa diagnosi. La priorità viene quindi calcolata solo da score, stage e vincoli dimensionali."
  };
}

function buildStrategicWarning(
  risks: RiskFlag[],
  topGapPairData: any,
  intentInsight: any
) {
  const highRisk = risks.find(risk => risk.severity === "high");

  if (highRisk) {
    return highRisk.body;
  }

  if (intentInsight && intentInsight.level === 3) {
    return intentInsight.body;
  }

  return topGapPairData.warning || "";
}

function buildRecommendedFocus(
  profileStageData: any,
  topGapPairData: any,
  risks: RiskFlag[]
) {
  return topGapPairData.focus || profileStageData.focus || "";
}

function buildDiagnosticPattern(
  profile: string,
  stageKey: string,
  topGapPair: { first: string; second: string; key: string },
  risks: RiskFlag[],
  intentInsight: any
) {
  const profileStageData = getProfileStageData(profile, stageKey);
  const topGapPairData = getTopGapPairData(topGapPair.key);

  return {
    profileStageKey: profile + "_" + stageKey,
    profileStageTitle: profileStageData.title,
    profileStageBody: profileStageData.body,

    topGapPairKey: topGapPair.key,
    topGapPairTitle: topGapPairData.title,
    topGapPairBody: topGapPairData.body,

    strategicWarning: buildStrategicWarning(
      risks,
      topGapPairData,
      intentInsight
    ),

    recommendedFocus: buildRecommendedFocus(
      profileStageData,
      topGapPairData,
      risks
    )
  };
}

export function computeDiagnosticState(
  overall: number,
  rawDimensions: Record<string, { score: number; yes: number }>,
  options: DiagnosticOptions = {}
) {
  const safeOverall = Number(overall || 0);
  const intentLevel =
    typeof options.intentLevel === "number" ? options.intentLevel : null;

  const stagingScore =
  typeof options.stagingScore === "number" ? options.stagingScore : safeOverall;

const fascia = fasciaFromScore(safeOverall);

/**
 * Stage principale:
 * usiamo lo score complessivo, non lo stagingScore.
 *
 * Lo stagingScore resta utile come segnale diagnostico interno,
 * ma non deve abbassare lo stage principale quando il business
 * mostra già segnali sufficienti per TRACTION.
 */
const originalStageLabel = stageFromScore(safeOverall);

  const baseRoadmapInfo =
    IMPULSE_SCALING_ROADMAP[
      originalStageLabel as keyof typeof IMPULSE_SCALING_ROADMAP
    ];

  const impulseStage = normalizeImpulseStage(originalStageLabel);
  const enrichedRoadmapInfo = enrichRoadmapInfo(impulseStage);

  const roadmapInfo = {
    ...baseRoadmapInfo,
    ...enrichedRoadmapInfo,
    label: enrichedRoadmapInfo.label,
    role: enrichedRoadmapInfo.role,
    headline: enrichedRoadmapInfo.headline,
    bottomLineConstraint: enrichedRoadmapInfo.coreConstraint,
    strategicReviewFocus: enrichedRoadmapInfo.strategicReviewFocus,
    graduationCriteria: enrichedRoadmapInfo.graduationCriteria,
    nonFare: enrichedRoadmapInfo.nonFare
  };

  const stageInfo = roadmapInfo;

  const processedDims = DIMENSIONS_KEYS.map(key => {
    const score = Number(rawDimensions[key]?.score || 0);
    const yes = Number(rawDimensions[key]?.yes || 0);

    let bracket = "mid";
    if (score < 4.0) bracket = "low";
    else if (score >= 7.0) bracket = "high";

    const bracketCopy = DIMENSIONS_COPY[key][bracket];

    return {
      key,
      label: DIMENSIONS_COPY[key].label,
      subtitle: DIMENSIONS_COPY[key].subtitle,
      score,
      yes,
      bracket,
      cosaIndica: bracketCopy.cosaIndica,
      vincolo: bracketCopy.vincolo,
      nonFare: bracketCopy.nonFare,
      lavoro: bracketCopy.lavoro
    };
  });

  const sortedDims = [...processedDims].sort((a, b) => {
    if (a.score !== b.score) return a.score - b.score;
    return DIMENSIONS_KEYS.indexOf(a.key) - DIMENSIONS_KEYS.indexOf(b.key);
  });

  const uniqueScores = Array.from(new Set(sortedDims.map(d => d.score))).sort(
    (a, b) => a - b
  );

  const highestScore = uniqueScores[uniqueScores.length - 1];
  const lowestScore = uniqueScores[0];

  let priorita = sortedDims.filter(d => d.score === uniqueScores[0]);

  if (
    priorita.length < 3 &&
    uniqueScores.length > 1 &&
    uniqueScores[1] < highestScore
  ) {
    priorita.push(...sortedDims.filter(d => d.score === uniqueScores[1]));
  }

  if (
    priorita.length < 3 &&
    uniqueScores.length > 2 &&
    uniqueScores[2] < highestScore
  ) {
    priorita.push(...sortedDims.filter(d => d.score === uniqueScores[2]));
  }

  priorita = priorita.slice(0, 3);

  const descScores = [...uniqueScores].reverse();
  let forze = sortedDims.filter(d => d.score === descScores[0]);

  if (
    forze.length < 3 &&
    descScores.length > 1 &&
    descScores[1] > lowestScore
  ) {
    forze.push(...sortedDims.filter(d => d.score === descScores[1]));
  }

  if (
    forze.length < 3 &&
    descScores.length > 2 &&
    descScores[2] > lowestScore
  ) {
    forze.push(...sortedDims.filter(d => d.score === descScores[2]));
  }

  forze = forze
    .filter(f => !priorita.some(p => p.key === f.key))
    .slice(0, 3);

  if (priorita.length === 0) {
    priorita = sortedDims.slice(0, 3);
  }

  if (forze.length === 0) {
    forze = [...sortedDims]
      .reverse()
      .filter(d => !priorita.some(p => p.key === d.key))
      .slice(0, 3);
  }

  const profile = resolveProfileWithTieBreak(sortedDims, intentLevel);
  const profileData = getProfileData(profile, safeOverall);

  const weakestDimensions = priorita
    .map((dim: any) => dim.key as ImpulseDimension)
    .filter(Boolean);

  const functionConstraints = getFunctionConstraintsForDimensions(
    weakestDimensions,
    impulseStage,
    3
  );

  const topGapPair = buildTopGapPair(sortedDims);
  const intentInsight = buildIntentInsight(intentLevel);
  const riskFlags = buildRiskFlags(processedDims, safeOverall, intentLevel);

  const diagnosticPattern = buildDiagnosticPattern(
    profile,
    originalStageLabel,
    topGapPair,
    riskFlags,
    intentInsight
  );

  return {
    fascia,
    stage: impulseStage,
    stageLabel: enrichedRoadmapInfo.label,
    stageInfo,
    roadmapStage: impulseStage,
    roadmapInfo,
    functionConstraints,
    profile,
    profileData,
    forze,
    priorita,
    processedDims,

    stagingScore,
    topGapPair,
    diagnosticPattern,
    riskFlags,
    intentInsight
  };
}
