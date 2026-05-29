export type Dimension = 'clarity' | 'acquisition' | 'operations' | 'margins' | 'asset' | 'readiness';

export interface Question {
  id: string;
  dimension?: Dimension; // undefined for profile questions
  type: 'single' | 'yesno';
  section: string;
  text: string;
  options?: string[];
  weight?: number;
  reverse?: boolean;
}

export const QUESTIONS: Question[] = [
  { id: "Q1", type: "single", section: "profile", text: "Quale descrizione ti rappresenta meglio?", options: ["Proprietario di un business operativo","Founder o co-founder","Operator / COO / manager senior","Proprietario di asset operativi (immobili, IP, brand)","Sto valutando un nuovo progetto"] },
  { id: "Q2", type: "single", section: "profile", text: "Fatturato annuo del business", options: ["Sotto €100k","€100k–€500k","€500k–€1M","€1M–€3M","€3M–€10M","Oltre €10M"] },
  
  // CLARITY
  { id: "Q3", dimension: 'clarity', type: "yesno", section: "clarity", text: "Puoi spiegare cosa fa il tuo business in una frase che un dodicenne capirebbe?", weight: 1, reverse: false },
  { id: "Q4", dimension: 'clarity', type: "yesno", section: "clarity", text: "Hai un'offerta principale che genera oltre il 50% del fatturato?", weight: 1, reverse: false },
  { id: "Q5", dimension: 'clarity', type: "yesno", section: "clarity", text: "Il prezzo della tua offerta principale è stato deciso strategicamente negli ultimi 12 mesi?", weight: 1, reverse: false },
  { id: "Q6", dimension: 'clarity', type: "yesno", section: "clarity", text: "Sapresti dire in 10 secondi chi è il tuo cliente ideale, escludendo chi non lo è?", weight: 1, reverse: false },
  { id: "Q7", dimension: 'clarity', type: "yesno", section: "clarity", text: "La proposta di valore sul tuo sito è la stessa che usi nelle conversazioni di vendita?", weight: 1, reverse: false },
  { id: "Q8", dimension: 'clarity', type: "yesno", section: "clarity", text: "Almeno 3 dei tuoi ultimi 10 clienti hanno detto chiaramente perché ti hanno scelto invece dei competitor?", weight: 1, reverse: false },
  { id: "Q9", dimension: 'clarity', type: "yesno", section: "clarity", text: "Il pricing della tua offerta principale ha margini superiori al 30%?", weight: 1, reverse: false },
  
  // ACQUISITION
  { id: "Q10", dimension: 'acquisition', type: "yesno", section: "acquisition", text: "Puoi prevedere con ragionevole precisione quanti nuovi clienti arriveranno il prossimo mese?", weight: 1, reverse: false },
  { id: "Q11", dimension: 'acquisition', type: "yesno", section: "acquisition", text: "Hai almeno un canale di acquisizione che porta clienti senza il tuo intervento diretto?", weight: 1, reverse: false },
  { id: "Q12", dimension: 'acquisition', type: "yesno", section: "acquisition", text: "Negli ultimi 6 mesi hai acquisito clienti che non conoscevi personalmente prima?", weight: 1, reverse: false },
  { id: "Q13", dimension: 'acquisition', type: "yesno", section: "acquisition", text: "Sai esattamente quanto ti costa acquisire un cliente?", weight: 1, reverse: false },
  { id: "Q14", dimension: 'acquisition', type: "yesno", section: "acquisition", text: "Hai un processo di follow-up scritto per i lead che non comprano subito?", weight: 1, reverse: false },
  { id: "Q15", dimension: 'acquisition', type: "yesno", section: "acquisition", text: "Riesci a generare nuove richieste commerciali anche senza pubblicare nuovi contenuti?", weight: 1, reverse: false },
  { id: "Q16", dimension: 'acquisition', type: "yesno", section: "acquisition", text: "Almeno il 30% del fatturato arriva da canali che non sono il tuo network personale?", weight: 1, reverse: false },
  
  // OPERATIONS
  { id: "Q17", dimension: 'operations', type: "yesno", section: "operations", text: "Se ti fermassi per 4 settimane, il business continuerebbe a funzionare?", weight: 1, reverse: false },
  { id: "Q18", dimension: 'operations', type: "yesno", section: "operations", text: "I processi principali del business sono scritti e accessibili al team?", weight: 1, reverse: false },
  { id: "Q19", dimension: 'operations', type: "yesno", section: "operations", text: "Hai almeno un workflow AI o un'automazione attivi da più di 3 mesi?", weight: 1, reverse: false },
  { id: "Q20", dimension: 'operations', type: "yesno", section: "operations", text: "Le decisioni operative ricorrenti vengono prese senza passare sempre da te?", weight: 1, reverse: false },
  { id: "Q21", dimension: 'operations', type: "yesno", section: "operations", text: "Hai una dashboard o un sistema di reporting aggiornato almeno settimanalmente?", weight: 1, reverse: false },
  { id: "Q22", dimension: 'operations', type: "yesno", section: "operations", text: "Quando un membro del team se ne va, il suo lavoro è documentato abbastanza da essere ripreso da un altro?", weight: 1, reverse: false },
  { id: "Q23", dimension: 'operations', type: "yesno", section: "operations", text: "Riesci a delegare almeno il 70% delle attività operative senza errori ricorrenti?", weight: 1, reverse: false },
  
  // MARGINS
  { id: "Q24", dimension: 'margins', type: "yesno", section: "margins", text: "Conosci il margine reale per ciascuna delle tue principali offerte?", weight: 1, reverse: false },
  { id: "Q25", dimension: 'margins', type: "yesno", section: "margins", text: "Il cash flow dei prossimi 3 mesi è prevedibile con buona approssimazione?", weight: 1, reverse: false },
  { id: "Q26", dimension: 'margins', type: "yesno", section: "margins", text: "Negli ultimi 12 mesi il pricing è stato adeguato in modo strategico (non solo per l'inflazione)?", weight: 1, reverse: false },
  { id: "Q27", dimension: 'margins', type: "yesno", section: "margins", text: "Puoi consegnare un riepilogo dei numeri principali (revenue, margini, costi) entro 24 ore se richiesto?", weight: 1, reverse: false },
  { id: "Q28", dimension: 'margins', type: "yesno", section: "margins", text: "Almeno il 60% del fatturato viene da clienti o offerte ad alto margine?", weight: 1, reverse: false },
  { id: "Q29", dimension: 'margins', type: "yesno", section: "margins", text: "Hai chiuso o ridotto le offerte a basso margine negli ultimi 12 mesi?", weight: 1, reverse: false },
  { id: "Q30", dimension: 'margins', type: "yesno", section: "margins", text: "Il pricing è coerente tra tutti i materiali (sito, deck, preventivi, conversazioni)?", weight: 1, reverse: false },
  
  // ASSET
  { id: "Q31", dimension: 'asset', type: "yesno", section: "asset", text: "Il business possiede asset rilevanti oltre al cash flow operativo (immobili, IP, brand, dati, contratti, community)?", weight: 1, reverse: false },
  { id: "Q32", dimension: 'asset', type: "yesno", section: "asset", text: "Gli asset principali del business sono documentati con numeri, contratti o evidenze verificabili?", weight: 1, reverse: false },
  { id: "Q33", dimension: 'asset', type: "yesno", section: "asset", text: "Almeno uno dei tuoi asset genera valore economico senza richiedere il tuo intervento diretto?", weight: 1, reverse: false },
  { id: "Q34", dimension: 'asset', type: "yesno", section: "asset", text: "Il brand del business ha riconoscibilità nel tuo settore di riferimento?", weight: 1, reverse: false },
  { id: "Q35", dimension: 'asset', type: "yesno", section: "asset", text: "Hai dati proprietari, know-how o metodologie che un competitor faticherebbe a replicare?", weight: 1, reverse: false },
  { id: "Q36", dimension: 'asset', type: "yesno", section: "asset", text: "Le tue relazioni strategiche chiave sono formalizzate con contratti o accordi scritti?", weight: 1, reverse: false },
  { id: "Q37", dimension: 'asset', type: "yesno", section: "asset", text: "Sapresti spiegare a un advisor il valore totale degli asset del business in modo strutturato?", weight: 1, reverse: false },
  
  // READINESS
  { id: "Q38", dimension: 'readiness', type: "yesno", section: "readiness", text: "Hai materiali pronti (deck, memo, numeri) per spiegare il business a un partner senior senza prepararli da zero?", weight: 1, reverse: false },
  { id: "Q39", dimension: 'readiness', type: "yesno", section: "readiness", text: "Nei prossimi 12 mesi stai valutando una decisione importante (espansione, ristrutturazione, ingresso di figure senior, monetizzazione asset)?", weight: 1, reverse: false },
  { id: "Q40", dimension: 'readiness', type: "yesno", section: "readiness", text: "Sapresti dire chi prenderebbe le decisioni strategiche del business se tu non potessi lavorare per 3 mesi?", weight: 1, reverse: false },
  { id: "Q41", dimension: 'readiness', type: "yesno", section: "readiness", text: "Il business potrebbe sostenere una conversazione con un partner serio senza dipendere dalla tua presenza?", weight: 1, reverse: false },
  { id: "Q42", dimension: 'readiness', type: "yesno", section: "readiness", text: "Hai mappato i 3 rischi principali del business e cosa succederebbe se si verificassero?", weight: 1, reverse: false },
  { id: "Q43", dimension: 'readiness', type: "yesno", section: "readiness", text: "Almeno l'80% del valore del business è documentato e non solo nella tua testa?", weight: 1, reverse: false },
  { id: "Q44", dimension: 'readiness', type: "yesno", section: "readiness", text: "Il business sarebbe leggibile da un advisor esterno entro una settimana di lavoro?", weight: 1, reverse: false }
];
