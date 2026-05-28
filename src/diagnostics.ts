export const DIMENSIONS_KEYS = ['clarity', 'acquisition', 'operations', 'margins', 'asset', 'readiness'];

export const DIMENSIONS_COPY: Record<string, any> = {
  clarity: {
    label: "Clarity",
    subtitle: "Quanto è chiaro cosa fa il business, per chi e perché vale.",
    low: {
      cosaIndica: "La chiarezza non è ancora abbastanza stabile per reggere marketing, vendita o delega. Offerta, cliente ideale, messaggio o pricing non sono ancora leggibili in modo immediato.",
      vincolo: "Il valore può esistere, ma non viene capito abbastanza in fretta.",
      nonFare: "Non aumentare visibilità, contenuti o advertising prima di rendere l'offerta centrale più chiara.",
      lavoro: "Serve allineare offerta, cliente ideale, messaggio e pricing prima di amplificare il business."
    },
    mid: {
      cosaIndica: "Le basi della chiarezza ci sono, ma una o due aree cedono: offerta, pricing, messaggio o trasferibilità commerciale.",
      vincolo: "Il valore esiste. Il problema è trasferirlo senza doverlo spiegare ogni volta.",
      nonFare: "Non aumentare marketing sopra un messaggio ancora parzialmente instabile.",
      lavoro: "Allineamento rigoroso tra conversazione di vendita, sito, materiali commerciali e pricing."
    },
    high: {
      cosaIndica: "La chiarezza è una forza. Il business si spiega rapidamente e il valore è comprensibile.",
      vincolo: "Il prossimo vincolo non è creare chiarezza, ma renderla trasferibile al team, ai materiali e ai canali.",
      nonFare: "Non lasciare che la chiarezza viva solo nella tua conversazione diretta.",
      lavoro: "Documentare la logica commerciale in modo che altri possano comunicarla con la stessa precisione."
    }
  },
  acquisition: {
    label: "Acquisition",
    subtitle: "Quanto è prevedibile e indipendente da te il flusso di clienti.",
    low: {
      cosaIndica: "Il business non ha ancora un motore commerciale leggibile. La domanda può esistere, ma il modo in cui arriva non è stabile.",
      vincolo: "Il vincolo è capire da dove arrivano i clienti migliori e perché.",
      nonFare: "Non aprire più canali contemporaneamente.",
      lavoro: "Isolare un primo canale e leggere lead, conversione, qualità cliente e margine."
    },
    mid: {
      cosaIndica: "Hai clienti che arrivano, ma il sistema non è ancora prevedibile. Probabilmente uno o due canali funzionano, ma manca un meccanismo che non dipenda dalla tua spinta diretta.",
      vincolo: "Il business genera opportunità. Il vincolo è trasformarle in un flusso prevedibile.",
      nonFare: "Non aprire altri canali prima di sapere quale singolo canale produce clienti profittevoli in modo ripetuto.",
      lavoro: "Separare lead generation, qualificazione, conversione e margine per canale."
    },
    high: {
      cosaIndica: "L'acquisizione è una forza. Esiste un canale o un sistema commerciale che produce domanda in modo leggibile.",
      vincolo: "Il prossimo vincolo è proteggere qualità, margine e ripetibilità mentre aumenti il volume.",
      nonFare: "Non confondere più volume con crescita migliore.",
      lavoro: "Raffinare attribution, qualificazione e qualità cliente per evitare crescita rumorosa."
    }
  },
  operations: {
    label: "Operations",
    subtitle: "Quanto il business funziona senza memoria personale o controllo costante.",
    low: {
      cosaIndica: "Il business dipende ancora troppo da te per funzionare. Decisioni, urgenze e standard tornano alla tua scrivania.",
      vincolo: "Il vincolo è trasformare lavoro ricorrente in regole trasferibili.",
      nonFare: "Non assumere o aggiungere software per compensare processi non scritti.",
      lavoro: "Mappare decisioni ricorrenti, standard qualitativi ed eccezioni operative."
    },
    mid: {
      cosaIndica: "Una parte del business gira da sola, una parte dipende ancora da te. Hai delegato l'esecuzione, ma forse non la decisione o lo standard qualitativo.",
      vincolo: "L'esecuzione è parzialmente delegata. Il contesto decisionale no. Il business non scala quando resti tu il punto di passaggio per standard e urgenze.",
      nonFare: "Assumere persone o aggiungere software per compensare processi che non sono ancora trasferibili.",
      lavoro: "Identificare quali decisioni ricorrenti possono seguire una regola scritta e quali no."
    },
    high: {
      cosaIndica: "Operations è una forza. Il business ha processi, standard e responsabilità che reggono oltre la tua presenza quotidiana.",
      vincolo: "Il prossimo vincolo è evitare che nuove iniziative rompano il sistema operativo esistente.",
      nonFare: "Non aggiungere complessità senza proteggere i processi che già funzionano.",
      lavoro: "Raffinare dashboard operative, ownership e standard decisionali."
    }
  },
  margins: {
    label: "Margins",
    subtitle: "Leggibilità economica del business: separazione tra fatturato e margine.",
    low: {
      cosaIndica: "La leggibilità economica è debole. Non è ancora chiaro quali offerte, clienti o canali producano margine reale.",
      vincolo: "Il vincolo è separare fatturato da profitto operativo.",
      nonFare: "Non aumentare acquisition spend prima di sapere dove si crea margine.",
      lavoro: "Leggere CAC, margine lordo, conversione, retention e valore cliente per canale."
    },
    mid: {
      cosaIndica: "Il fatturato è chiaro e tracciato, ma il margine reale per singolo cliente, canale o specifica offerta non è ancora sufficientemente separato.",
      vincolo: "Il fatturato esiste, ma la leggibilità economica non è ancora sufficiente a supportare un'espansione sicura.",
      nonFare: "Non accelerare le spese di acquisizione prima di sapere esattamente quali clienti e canali generano margine reale.",
      lavoro: "Separazione fine fra canali, CAC, qualità lead, conversione, margine effettivo e lifetime value."
    },
    high: {
      cosaIndica: "Margins è una forza. Il business ha una lettura economica abbastanza chiara per prendere decisioni più disciplinate.",
      vincolo: "Il prossimo vincolo è proteggere il margine mentre cresci.",
      nonFare: "Non sacrificare margine per inseguire volume.",
      lavoro: "Analizzare quali segmenti, offerte e canali meritano più capitale operativo."
    }
  },
  asset: {
    label: "Asset",
    subtitle: "Cosa il business possiede oltre il cash flow corrente.",
    low: {
      cosaIndica: "Il business produce ricavi, ma non sta ancora cristallizzando abbastanza valore proprietario.",
      vincolo: "Il valore vive ancora troppo nell'esecuzione corrente.",
      nonFare: "Non parlare di espansione, capitale o partnership come se il business fosse già un asset solido.",
      lavoro: "Identificare IP, sistemi, dati, brand, relazioni clienti e asset documentabili."
    },
    mid: {
      cosaIndica: "C'è presenza di alcuni asset, dati, brand o proprietà, ma non sono ancora consolidati o leggibili dall'esterno come valore separato dall'attività corrente.",
      vincolo: "Il business crea valore operativo. Non tutto quel valore si sta cristallizzando in un asset indipendente.",
      nonFare: "Investire in espansione geografica, capitale o partnership prima che esista almeno un asset proprietario chiaramente identificabile.",
      lavoro: "Il prossimo livello richiede che valore, conoscenza e relazioni vivano strutturalmente nel business, non solo nella tua presenza."
    },
    high: {
      cosaIndica: "Asset è una forza. Il business sta costruendo valore che va oltre il cash flow operativo.",
      vincolo: "Il prossimo vincolo è rendere questi asset più leggibili, proteggibili e monetizzabili.",
      nonFare: "Non lasciare asset impliciti o non documentati.",
      lavoro: "Documentare sistemi, proprietà intellettuale, dati, brand e relazioni chiave."
    }
  },
  readiness: {
    label: "Readiness",
    subtitle: "Quanto il business è leggibile da chi non lo vive dall'interno.",
    low: {
      cosaIndica: "La leggibilità esterna è il vincolo principale. Numeri, struttura e narrativa non sono ancora pronti per un interlocutore esterno.",
      vincolo: "Il business può avere sostanza, ma non è ancora decodificabile da chi guarda da fuori.",
      nonFare: "Non esporre il business a partner, investitori, senior hire o acquirenti prima di ordinare la lettura interna.",
      lavoro: "Rendere chiari numeri, struttura, materiali, narrativa e logica economica."
    },
    mid: {
      cosaIndica: "La leggibilità è parziale. Alcune parti del business sono presentabili all'esterno in modo pulito, altre strutture risiedono ancora esclusivamente nella tua testa.",
      vincolo: "Il business ha sostanza. Tuttavia, non è ancora abbastanza leggibile o presentabile per chi guarda da fuori.",
      nonFare: "Non esporre il business a interlocutori esterni senior finché la lettura interna, numeri, report e struttura, non è ordinata.",
      lavoro: "Numeri, struttura e narrativa devono diventare immediatamente chiari anche a chi non vive dentro l'azienda."
    },
    high: {
      cosaIndica: "Readiness è una forza. Il business è già abbastanza leggibile per interlocutori esterni sofisticati.",
      vincolo: "Il prossimo vincolo è mantenere coerenza tra numeri, narrativa e struttura durante il prossimo salto.",
      nonFare: "Non presentare il business con materiali disallineati o incompleti.",
      lavoro: "Raffinare materiali, data room leggera, narrativa strategica e metriche chiave."
    }
  }
};

export const PROFILES: Record<string, any> = {
  A: {
    title: "Clarity Gap",
    blocco: "Il valore esiste. Non è ancora abbastanza leggibile dall'esterno per essere capito in fretta dal mercato.",
    manifesta: "Ogni vendita richiede troppa spiegazione. Il sito e le conversazioni dicono cose diverse. Il ciclo di vendita si allunga e il marketing porta lead confusi.",
    rischio: "Aggiungere marketing o sales su un messaggio frammentato amplifica la confusione e brucia capitale operativo senza migliorare conversioni.",
    nonFare: "Non rifare il sito per renderlo bello e non aumentare budget prima di aver chiarito la singola offerta centrale.",
    decisione: "Semplificare l'offerta a un solo asse principale leggibile universalmente e senza dipendere da una tua spiegazione privata.",
    foundational: {
      blocco: "Il primo vincolo è rendere il valore comprensibile. Prima ancora di amplificare il business, serve chiarire offerta, cliente ideale, promessa e prezzo.",
      manifesta: "Il mercato non ha ancora un modo semplice per capire cosa compra, perché dovrebbe comprarlo e perché dovrebbe farlo ora.",
      rischio: "Aumentare visibilità o advertising in questa fase può generare attenzione ma non conversione utile.",
      nonFare: "Non aumentare contenuti, campagne o rebranding prima di aver chiarito l'offerta centrale.",
      decisione: "Ridurre la complessità commerciale a una promessa chiara, una buyer persona prioritaria e una struttura di prezzo difendibile."
    }
  },
  B: {
    title: "Growth Engine Gap",
    blocco: "I clienti esistono e la domanda c'è. Il modo in cui arrivano, però, non è ancora un meccanismo prevedibile o isolato.",
    manifesta: "Il fatturato cresce, ma non sai da dove arriverà il prossimo mese. La crescita dipende da passaparola, referral e il tuo networking personale.",
    rischio: "La non prevedibilità blocca grandi decisioni. Assunzioni e scale-up restano sospese perché manca la certezza del volume.",
    nonFare: "Non testare tre nuovi canali in contemporanea. Non delegare interamente il sales finché non è leggibile cosa funziona oggi.",
    decisione: "Isolare l'unico canale che ha già portato clienti profittevoli e trasformarlo in un processo tracciabile e chirurgico.",
    foundational: {
      blocco: "Il primo vincolo è commerciale: il business non ha ancora un motore di domanda leggibile o validato.",
      manifesta: "Le opportunità arrivano in modo episodico o personale. Non è ancora chiaro quale offerta, canale e conversazione generino domanda ripetibile.",
      rischio: "Scalare ora significa aumentare rumore, non prevedibilità. Senza un primo loop commerciale, marketing e sales restano tentativi.",
      nonFare: "Non aprire nuovi canali e non delegare sales prima di capire quale meccanismo può generare domanda profittevole.",
      decisione: "Isolare un primo loop: una offerta, un segmento, un canale, una metrica economica leggibile."
    }
  },
  C: {
    title: "Operational Gap",
    blocco: "Il business produce valore tangibile. Il modo in cui lo produce non è ancora un sistema indipendente da te.",
    manifesta: "Il team esegue, ma le eccezioni e i problemi inattesi rimbalzano costantemente sulla tua scrivania. La tua capacità di assorbire eccezioni diventa il limite dell'azienda.",
    rischio: "Aumentare le vendite aggraverà il collo di bottiglia operativo, degradando la qualità dell'erogazione e aumentando il carico operativo su di te.",
    nonFare: "Non assumere altre risorse junior e non implementare software complessi sperando che organizzino processi non scritti.",
    decisione: "Scrivere le regole ricorrenti e trasferire non l'esecuzione manuale, ma il contesto decisionale ai diretti responsabili.",
    foundational: {
      blocco: "Il vincolo operativo è ancora di base: il business non ha stabilizzato abbastanza regole, standard e responsabilità.",
      manifesta: "Molte attività dipendono ancora da memoria personale, urgenza, controllo diretto o correzioni continue.",
      rischio: "Aumentare clienti o complessità operativa può rompere la qualità prima ancora di creare scala.",
      nonFare: "Non assumere o aggiungere software prima di aver scritto le regole operative minime.",
      decisione: "Trasformare le attività ricorrenti in standard semplici, visibili e ripetibili."
    }
  },
  D: {
    title: "Readiness Gap",
    blocco: "Il valore e i sistemi esistono. Tuttavia, il business non è pronto per essere decodificato facilmente da interlocutori esterni, investitori o partner strategici.",
    manifesta: "Davanti a investitori, partner o acquirenti devi tradurre faticosamente i numeri e giustificare la struttura aziendale a voce.",
    rischio: "Si lascia denaro e posizione sul tavolo negoziale per via di uno svantaggio strutturale nella presentazione dei dati.",
    nonFare: "Non intavolare partnership strategiche, operazioni di capitale o di acquisizione finché reportistica e struttura legale non sono cristalline.",
    decisione: "Rendere la struttura di business completamente ispezionabile e chiara nei dati. L'identità finanziaria deve parlare da sola.",
    foundational: {
      blocco: "Il business non è ancora abbastanza leggibile per essere valutato bene da chi lo osserva dall'esterno.",
      manifesta: "Numeri, struttura, materiali e narrativa non sono ancora ordinati in una forma che un interlocutore esterno possa leggere senza traduzione.",
      rischio: "Esporsi troppo presto a partner, investitori o figure senior crea asimmetria: il valore può essere sottovalutato o frainteso.",
      nonFare: "Non cercare capitale, partnership o senior hire prima di ordinare metriche, struttura e narrativa.",
      decisione: "Preparare una lettura esterna minima: numeri chiave, logica economica, struttura, rischi e materiali."
    }
  }
};

export const IMPULSE_SCALING_ROADMAP: Record<string, any> = {
  "FOUNDATION": {
    label: "FOUNDATION",
    roadmapStageMap: ["IMPROVISE", "MONETIZE"],
    role: "Founder as operator",
    headline: "Il business deve prima isolare l'offerta e validare una delivery ripetibile.",
    bottomLineConstraint: "Il business non ha ancora separato abbastanza chiaramente offerta, cliente, delivery e margine. Prima di cercare scala, deve dimostrare che una proposta centrale può essere venduta e consegnata in modo ripetibile.",
    graduationCriteria: [
      "Una offerta centrale chiara",
      "Un cliente ideale prioritario",
      "Una delivery che può essere ripetuta senza reinventare ogni volta",
      "Una prima lettura di margine e sostenibilità",
      "Un messaggio commerciale comprensibile senza spiegazioni lunghe"
    ],
    functionConstraints: {
      product: "L'offerta può essere ancora troppo personalizzata o instabile.",
      marketing: "Il messaggio non è ancora abbastanza semplice da generare domanda qualificata.",
      sales: "La vendita dipende ancora dalla capacità personale del founder di spiegare il valore.",
      customerService: "La delivery può richiedere interventi manuali o correzioni frequenti.",
      it: "Gli strumenti servono a tenere ordine, non a creare automazioni complesse.",
      recruiting: "Assumere ruoli fissi è prematuro se il lavoro ricorrente non è ancora chiaro.",
      hr: "Non serve una struttura HR. Serve chiarezza su responsabilità minime e standard.",
      finance: "La priorità è leggere margine, cash flow e costo reale della delivery."
    },
    troppoPresto: "Automazioni complesse, assunzioni strutturali, rebranding, nuovi canali o advertising significativo prima di aver isolato una offerta che si vende e si consegna con margine.",
    diventareSistema: "L'offerta centrale, il profilo cliente, la promessa commerciale e la capacità di erogare con qualità a un margine corretto.",
    nonFare: "Non cercare di automatizzare l'acquisizione di un'offerta che non si vende facilmente a voce.",
    strategicReviewFocus: "Validare il nucleo: offerta, cliente, promessa, pricing, delivery e margine minimo."
  },
  "TRACTION": {
    label: "TRACTION",
    roadmapStageMap: ["ADVERTISE", "STABILIZE"],
    role: "Founder as builder",
    headline: "Il business ha domanda. Non ha ancora prevedibilità matematica.",
    bottomLineConstraint: "Il business ha segnali di domanda, ma non ha ancora isolato un meccanismo prevedibile di acquisizione, conversione, delivery e margine.",
    graduationCriteria: [
      "Un canale primario identificato",
      "Una metrica di conversione leggibile",
      "Una prima separazione tra lead, cliente buono e cliente rumoroso",
      "Una delivery che non collassa al crescere delle richieste",
      "Una lettura chiara del margine per offerta o canale"
    ],
    functionConstraints: {
      product: "L'offerta deve essere resa più standardizzabile senza perdere valore.",
      marketing: "Il vincolo è isolare quale messaggio e quale canale portano domanda utile.",
      sales: "La conversione deve diventare tracciabile, non solo dipendente da intuito e relazione.",
      customerService: "La qualità deve reggere un primo aumento di volume senza troppe eccezioni.",
      it: "Serve una base di tracking: CRM leggero, pipeline, fonti lead e report minimo.",
      recruiting: "Eventuali supporti devono liberare il founder dalle attività ripetitive, non sostituire decisioni non ancora codificate.",
      hr: "Serve chiarire ownership e responsabilità operative di base.",
      finance: "CAC, margine, conversione e cash flow devono essere letti per canale o offerta."
    },
    troppoPresto: "Moltiplicazione dei canali, sales team, software enterprise, hiring pesante o ottimizzazioni avanzate prima di avere un primo loop leggibile.",
    diventareSistema: "Un singolo canale di acquisizione, una prima pipeline commerciale e un flusso operativo delegabile.",
    nonFare: "Non testare tre nuovi canali in contemporanea prima di aver reso prevedibile il primo.",
    strategicReviewFocus: "Isolare il primo growth loop: canale, messaggio, conversione, delivery e margine."
  },
  "STABILIZATION": {
    label: "STABILIZATION",
    roadmapStageMap: ["PRIORITIZE"],
    role: "Founder as operator-designer",
    headline: "Il business funziona. Il vincolo è ridurre la dipendenza dai tuoi input quotidiani.",
    bottomLineConstraint: "Il business ha una base funzionante, ma il founder resta ancora troppo coinvolto in eccezioni, decisioni, standard e controllo qualità.",
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
      customerService: "Le eccezioni devono essere classificate e risolte con regole, non solo con interventi ad hoc.",
      it: "Gli strumenti devono supportare workflow e reporting, non aggiungere complessità.",
      recruiting: "Le assunzioni servono solo dove esiste una funzione chiara da trasferire.",
      hr: "Servono standard di performance e responsabilità, anche se la struttura è ancora leggera.",
      finance: "Budget, margini e cash flow devono guidare le priorità operative."
    },
    troppoPresto: "Espansione internazionale, acquisizioni, iniziative laterali, nuovi prodotti o investimenti slegati dal core business.",
    diventareSistema: "Il livello decisionale intermedio: le eccezioni non devono più arrivare sempre al founder.",
    nonFare: "Non assumere altre risorse junior per tamponare l'assenza di processi scritti.",
    strategicReviewFocus: "Ridurre dipendenza dal founder attraverso processi, ownership, dashboard e regole decisionali."
  },
  "PRODUCTIZATION": {
    label: "PRODUCTIZATION",
    roadmapStageMap: ["PRODUCTIZE", "OPTIMIZE"],
    role: "Founder as system architect",
    headline: "A questo stadio si lavora sull'economia, sulla scalabilità dei margini, non sul volume base.",
    bottomLineConstraint: "Il business funziona, ma deve trasformare capacità, delivery e valore in unità più replicabili, leggibili e marginalmente efficienti.",
    graduationCriteria: [
      "Offerte strutturate e non solo servizi custom",
      "Margini leggibili per offerta, cliente o canale",
      "Standard di delivery chiari",
      "Sistema commerciale replicabile",
      "Metriche operative e finanziarie usate per decidere"
    ],
    functionConstraints: {
      product: "Il valore deve essere impacchettato in offerte più ripetibili e comparabili.",
      marketing: "Il posizionamento deve sostenere offerte chiare, non solo reputazione personale.",
      sales: "Il processo commerciale deve poter essere trasferito e misurato.",
      customerService: "La customer experience deve diventare coerente e non dipendere da interventi eccezionali.",
      it: "Automazioni e strumenti devono aumentare margine e controllo, non solo velocità.",
      recruiting: "Assunzioni e ruoli devono essere progettati attorno a funzioni scalabili.",
      hr: "Servono criteri di performance, formazione e responsabilità per mantenere standard.",
      finance: "La finanza deve guidare pricing, mix clienti, margini e allocazione del capitale operativo."
    },
    troppoPresto: "Abbandono della supervisione strategica, espansione del volume con clienti fuori target, debito non necessario o nuovi prodotti scollegati dal core.",
    diventareSistema: "Leggibilità totale dei margini e trasformazione della delivery in un prodotto operativo più replicabile.",
    nonFare: "Non espandere il volume acquisendo clienti fuori target che inquinano i margini.",
    strategicReviewFocus: "Productizzare il valore: offerte, margini, delivery, sistemi commerciali e controllo economico."
  },
  "SCALE READINESS": {
    label: "SCALE READINESS",
    roadmapStageMap: ["CATEGORIZE", "SPECIALIZE", "CAPITALIZE"],
    role: "Founder as strategic allocator",
    headline: "Il valore esiste ed è autonomo. Il problema diventa renderlo perfettamente leggibile all'esterno.",
    bottomLineConstraint: "Il business ha valore, struttura e sistemi. Il prossimo vincolo è rendere tutto leggibile, auditabile e difendibile per decisioni più grandi.",
    graduationCriteria: [
      "Metriche finanziarie coerenti",
      "Narrativa strategica chiara",
      "Asset e sistemi documentati",
      "Responsabilità manageriali leggibili",
      "Materiali pronti per partner, investitori, board o operazioni straordinarie"
    ],
    functionConstraints: {
      product: "Le offerte devono essere categorizzabili, confrontabili e spiegabili a stakeholder esterni.",
      marketing: "Il posizionamento deve sostenere credibilità e differenziazione strategica.",
      sales: "Il sistema commerciale deve essere leggibile come asset, non solo come performance corrente.",
      customerService: "Retention, qualità e soddisfazione devono essere dimostrabili con dati.",
      it: "Sistemi, dati e reporting devono reggere due diligence leggera o revisione esterna.",
      recruiting: "La struttura manageriale deve essere comprensibile e non dipendere solo dal founder.",
      hr: "Ruoli, incentivi e responsabilità devono sostenere continuità e accountability.",
      finance: "La lettura finanziaria deve essere pronta per capitale, partnership, M&A o board esterni."
    },
    troppoPresto: "Operazioni straordinarie, partnership strategiche o capitale esterno senza una lettura finanziaria, operativa e narrativa già ordinata.",
    diventareSistema: "Metriche finanziarie, struttura, asset, reporting e narrativa devono essere leggibili anche da chi non conosce il business dall'interno.",
    nonFare: "Non presentare il business con dati, materiali o narrativa disallineati.",
    strategicReviewFocus: "Preparare il business a interlocutori esterni: data room leggera, metriche, asset, narrativa e struttura."
  }
};

export const STAGE_DATA = IMPULSE_SCALING_ROADMAP;

export function getProfileData(profileId: string, overall: number) {
  const baseProfile = PROFILES[profileId];
  if (!baseProfile) return PROFILES.B;

  if (overall < 40 && baseProfile.foundational) {
    return {
      ...baseProfile,
      blocco: baseProfile.foundational.blocco,
      manifesta: baseProfile.foundational.manifesta,
      rischio: baseProfile.foundational.rischio,
      nonFare: baseProfile.foundational.nonFare,
      decisione: baseProfile.foundational.decisione
    };
  }

  return { ...baseProfile };
}

export function computeDiagnosticState(overall: number, rawDimensions: Record<string, { score: number, yes: number }>) {
  let fascia = "AWARE";
  let stageLabel = "TRACTION";

  if (overall < 40) { fascia = "FOUNDATIONAL"; }
  else if (overall < 60) { fascia = "BUILDING"; }
  else if (overall < 80) { fascia = "AWARE"; }
  else { fascia = "READY"; }

  if (overall < 40) { stageLabel = "FOUNDATION"; }
  else if (overall < 60) { stageLabel = "TRACTION"; }
  else if (overall < 75) { stageLabel = "STABILIZATION"; }
  else if (overall < 85) { stageLabel = "PRODUCTIZATION"; }
  else { stageLabel = "SCALE READINESS"; }

  const roadmapInfo = IMPULSE_SCALING_ROADMAP[stageLabel as keyof typeof IMPULSE_SCALING_ROADMAP];
  const stageInfo = roadmapInfo;

  const processedDims = DIMENSIONS_KEYS.map(key => {
    const score = Number(rawDimensions[key]?.score || 0);
    const yes = Number(rawDimensions[key]?.yes || 0);

    let bracket = 'mid';
    if (score < 4.0) bracket = 'low';
    else if (score >= 7.0) bracket = 'high';

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

  const sortedDims = [...processedDims].sort((a, b) => a.score - b.score);

  const uniqueScores = Array.from(new Set(sortedDims.map(d => d.score))).sort((a, b) => a - b);
  const highestScore = uniqueScores[uniqueScores.length - 1];
  const lowestScore = uniqueScores[0];

  let priorita = sortedDims.filter(d => d.score === uniqueScores[0]);

  if (priorita.length < 3 && uniqueScores.length > 1 && uniqueScores[1] < highestScore) {
    priorita.push(...sortedDims.filter(d => d.score === uniqueScores[1]));
  }

  if (priorita.length < 3 && uniqueScores.length > 2 && uniqueScores[2] < highestScore) {
    priorita.push(...sortedDims.filter(d => d.score === uniqueScores[2]));
  }

  priorita = priorita.slice(0, 3);

  const descScores = [...uniqueScores].reverse();
  let forze = sortedDims.filter(d => d.score === descScores[0]);

  if (forze.length < 3 && descScores.length > 1 && descScores[1] > lowestScore) {
    forze.push(...sortedDims.filter(d => d.score === descScores[1]));
  }

  if (forze.length < 3 && descScores.length > 2 && descScores[2] > lowestScore) {
    forze.push(...sortedDims.filter(d => d.score === descScores[2]));
  }

  forze = forze.filter(f => !priorita.some(p => p.key === f.key)).slice(0, 3);

  if (priorita.length === 0) priorita = sortedDims.slice(0, 3);

  if (forze.length === 0) {
    forze = [...sortedDims]
      .reverse()
      .filter(d => !priorita.some(p => p.key === d.key))
      .slice(0, 3);
  }

  const lowestKey = priorita[0]?.key || 'acquisition';

  let profile = "B";
  if (lowestKey === 'clarity') profile = "A";
  else if (lowestKey === 'operations' || lowestKey === 'asset') profile = "C";
  else if (lowestKey === 'acquisition' || lowestKey === 'margins') profile = "B";
  else if (lowestKey === 'readiness') profile = "D";

  const profileData = getProfileData(profile, overall);

  return {
    fascia,
    stageLabel,
    stageInfo,
    roadmapStage: stageLabel,
    roadmapInfo,
    profile,
    profileData,
    forze,
    priorita,
    processedDims
  };
}
