/* =============================================================
   INSIGHTS — personalizzazione answer-level del report
   Generato dal question bank LIVE del quiz Tilda (v2.5+).
   Le 30 domande a scala (Q3–Q32) in ordine canonico: il payload
   `ans` del quiz è una stringa di 30 caratteri (idx 0-3, x=n/d)
   allineata a SCORED. Contenuti: micro-insight per risposta,
   prima mossa 48h per vincolo, graduazione per stadio, lettera.
   ============================================================= */

export interface ScoredQuestion { id: string; dimension: string; text: string; options: string[]; }

export const SCORED: ScoredQuestion[] = [
  { id: "Q3", dimension: "clarity", text: "Quanto è definita la tua offerta principale?", options: ["Vendo cose diverse a seconda di chi ho davanti: non c’è un’offerta che domina", "Ho un’offerta principale, ma cambia forma quasi a ogni cliente", "Ho un’offerta principale chiara che genera la maggior parte del fatturato", "Ho un’offerta principale chiara e standardizzata, che vendo senza ridisegnarla ogni volta"] },
  { id: "Q4", dimension: "clarity", text: "Sai chi è il tuo cliente ideale e soprattutto chi NON lo è?", options: ["Prendo praticamente tutti i clienti che arrivano", "Ho un’idea del cliente giusto, ma faccio fatica a dire di no agli altri", "So descrivere il cliente ideale e di solito riconosco chi non lo è", "Ho criteri chiari: in pochi secondi so chi è in target e chi escludere"] },
  { id: "Q5", dimension: "clarity", text: "Il modo in cui spieghi il valore è coerente ovunque?", options: ["Cambio spiegazione ogni volta, dipende dalla conversazione", "Sito e conversazioni di vendita dicono cose un po’ diverse", "Sito e ultima conversazione di vendita, messi fianco a fianco, dicono quasi la stessa cosa", "Offerta, promessa e messaggio sono identici ovunque, senza che debba spiegarli io"] },
  { id: "Q6", dimension: "clarity", text: "Quanto in fretta una persona esterna capisce cosa fai?", options: ["Devo spiegarlo a lungo prima che capiscano", "Lo capiscono solo dopo qualche domanda", "Lo capiscono dopo una frase o due", "Lo capirebbe anche un dodicenne in una sola frase"] },
  { id: "Q7", dimension: "clarity", text: "Come è stato deciso il prezzo della tua offerta principale?", options: ["È più o meno quello che fa il mercato / quello che me la sento di chiedere", "L’ho deciso una volta e non l’ho più rivisto", "L’ho rivisto negli ultimi 12 mesi guardando il valore, non solo i costi", "È una decisione strategica, rivista, difendibile e coerente su tutti i materiali"] },
  { id: "Q8", dimension: "acquisition", text: "Quanto riesci a prevedere i nuovi clienti del prossimo mese?", options: ["Per niente: dipende da come va il mese", "Solo una stima molto approssimativa", "Una previsione ragionevole basata sui mesi precedenti", "Una previsione affidabile basata su numeri di pipeline"] },
  { id: "Q9", dimension: "acquisition", text: "Da dove arrivano davvero i tuoi clienti?", options: ["Quasi solo passaparola e dal mio network personale", "Un mix, ma serve sempre la mia spinta diretta", "Almeno un canale porta clienti con poco mio intervento", "Ho un canale o un sistema che genera domanda in modo prevedibile, senza di me"] },
  { id: "Q10", dimension: "acquisition", text: "Sai distinguere un buon lead da uno che ti farà perdere tempo o margine?", options: ["No, tratto tutti i lead allo stesso modo", "Lo capisco solo dopo, a danno ormai fatto", "Ho criteri informali per riconoscerli", "Ho criteri chiari e qualifico i lead prima di investirci tempo"] },
  { id: "Q11", dimension: "acquisition", text: "Cosa succede quando arriva una richiesta commerciale?", options: ["Improvviso ogni volta", "Faccio più o meno le stesse cose, ma a memoria", "Ho un processo abbastanza ripetibile", "Ho un processo definito che trasforma una richiesta in una vendita qualificata"] },
  { id: "Q12", dimension: "acquisition", text: "Quanto fatturato arriva da fuori del tuo network personale?", options: ["Quasi nulla: è quasi tutto rete personale e referral", "Meno di un terzo", "Tra un terzo e la metà", "La maggior parte arriva da canali indipendenti dalla mia rete"] },
  { id: "Q13", dimension: "operations", text: "Se ti fermassi per 4 settimane, cosa succederebbe al business?", options: ["Si fermerebbe quasi tutto", "Andrebbe avanti a fatica, con molti problemi", "Funzionerebbe, con qualche intoppo", "Continuerebbe a funzionare senza grossi problemi"] },
  { id: "Q14", dimension: "operations", text: "I processi principali del business sono scritti e accessibili?", options: ["Sono soprattutto nella mia testa", "Qualcosa è scritto, ma non aggiornato né usato", "I processi chiave sono documentati e usati", "Documentati, aggiornati, e una persona nuova li può seguire da sola"] },
  { id: "Q15", dimension: "operations", text: "Quando il volume aumenta, cosa succede alla qualità della delivery?", options: ["Crolla: devo intervenire io", "Tiene solo se intervengo io", "Negli ultimi picchi ha tenuto, con eccezioni gestite dal team", "Resta stabile senza il mio intervento diretto"] },
  { id: "Q16", dimension: "operations", text: "Le decisioni operative ricorrenti come vengono prese?", options: ["Passano quasi tutte da me", "Le più importanti passano sempre da me", "Molte le prende il team, alcune tornano a me", "Il team le gestisce con regole chiare: raramente tornano a me"] },
  { id: "Q17", dimension: "operations", text: "Quando capita un’eccezione operativa, chi la gestisce?", options: ["Sempre io", "Io, quasi sempre", "Il team prova, poi spesso chiede a me", "Il team gestisce le eccezioni ricorrenti senza riportarle a me"] },
  { id: "Q18", dimension: "margins", text: "Conosci il margine reale di ciascuna delle tue offerte principali?", options: ["Guardo soprattutto il fatturato", "Ho un’idea approssimativa del margine", "Conosco il margine delle offerte principali", "Conosco il margine reale per offerta, cliente e canale"] },
  { id: "Q19", dimension: "margins", text: "Quanto è prevedibile il cash flow dei prossimi 3 mesi?", options: ["Per niente: vado a vista", "Molto approssimativo", "Prevedibile con buona approssimazione", "Lo prevedo con precisione e lo uso per decidere"] },
  { id: "Q20", dimension: "margins", text: "Negli ultimi 12 mesi hai adeguato il pricing?", options: ["No, è fermo da anni", "Solo per inflazione o aumento costi", "L’ho adeguato una volta, guardando il valore", "Lo rivedo in modo strategico e regolare"] },
  { id: "Q21", dimension: "margins", text: "Come decidi su marketing, assunzioni o nuovi progetti?", options: ["A intuito o sensazione", "Guardando soprattutto il fatturato", "Guardando margini e cash flow per le decisioni grandi", "Margini, cash flow e capacità operativa guidano sistematicamente le decisioni"] },
  { id: "Q22", dimension: "margins", text: "Sai quali clienti, offerte o canali generano il margine migliore (non solo il fatturato)?", options: ["No, guardo solo chi fattura di più", "Ho un’idea vaga", "So abbastanza bene dove sta il margine buono", "So con precisione dove sta il margine e agisco di conseguenza"] },
  { id: "Q23", dimension: "asset", text: "Oltre al cash flow corrente, il business possiede asset di valore (IP, brand, dati, contratti, community)?", options: ["No: il valore è tutto nell’attività corrente", "Qualcosa, ma poco strutturato", "Sì, alcuni asset rilevanti", "Sì, asset rilevanti e identificabili, separati dall’operatività"] },
  { id: "Q24", dimension: "asset", text: "Gli asset principali sono documentati con numeri, contratti o evidenze?", options: ["No", "In parte, in modo informale", "I principali sono documentati", "Tutti documentati, con evidenze verificabili"] },
  { id: "Q25", dimension: "asset", text: "Almeno un asset può essere spiegato e trasferito a un partner o buyer esterno?", options: ["No: vivono nella mia testa o nella mia persona", "Forse uno, ma con molta fatica", "Sì, almeno uno è trasferibile", "Sì, più asset sono spiegabili, documentati e trasferibili"] },
  { id: "Q26", dimension: "asset", text: "Hai dati, know-how o metodologie difficili da replicare per un competitor?", options: ["No: faccio sostanzialmente quello che fanno tutti", "Qualcosa, ma poco protetto", "Sì: i clienti lo citano come motivo per sceglierci", "Sì, asset proprietari chiari, documentati e difendibili"] },
  { id: "Q27", dimension: "asset", text: "Le relazioni strategiche chiave sono formalizzate con contratti o accordi scritti?", options: ["No, è tutto informale", "Alcune, ma a voce", "Le principali sono scritte", "Tutte formalizzate con accordi scritti"] },
  { id: "Q28", dimension: "readiness", text: "Hai materiali pronti (numeri, struttura, sintesi) per spiegare il business a un partner senior?", options: ["No, dovrei prepararli da zero", "Qualcosa c’è, ma andrebbe rifatto", "Ho una buona base già pronta", "Sì, materiali pronti e allineati"] },
  { id: "Q29", dimension: "readiness", text: "Se non potessi lavorare per 3 mesi, chi prenderebbe le decisioni strategiche?", options: ["Nessuno: dipende tutto da me", "Qualcuno proverebbe, ma senza autorità chiara", "C’è una figura identificata", "Ruoli e deleghe decisionali sono chiari e già operativi"] },
  { id: "Q30", dimension: "readiness", text: "Il business reggerebbe una conversazione con un partner serio senza dipendere dalla tua presenza?", options: ["No: devo esserci e spiegare tutto io", "Solo se preparo e guido io la conversazione", "In gran parte sì", "Sì: numeri e struttura parlano da soli"] },
  { id: "Q31", dimension: "readiness", text: "Hai mappato i rischi principali del business e cosa succederebbe se si verificassero?", options: ["No", "Li ho in testa, non scritti", "I principali sono identificati", "Mappati e scritti, con un piano di risposta"] },
  { id: "Q32", dimension: "readiness", text: "Un advisor esterno capirebbe modello di business, numeri, rischi e asset in meno di una settimana?", options: ["No: servirebbe molto più tempo e molte mie spiegazioni", "Con fatica e molta traduzione orale", "Sì, in gran parte", "Sì, in pochi giorni e in autonomia"] },
];

const WHY: Record<string, string> = {
  Q3: "Un'offerta che cambia forma a ogni cliente non è un'offerta: è una trattativa ricorrente. Ogni vendita riparte da zero, e il conto lo paga il margine.",
  Q4: "Senza criteri di esclusione, ogni sì fuori target ricompra il vincolo: più eccezioni, più delivery su misura, meno margine. Il «no» scritto è un asset.",
  Q5: "Se sito e conversazioni dicono cose diverse, il mercato deve tradurti — e il valore che richiede traduzione viene sempre scontato.",
  Q6: "La chiarezza si misura in secondi. Ogni spiegazione in più è attrito, e l'attrito filtra via i compratori migliori, non i peggiori.",
  Q7: "Un prezzo mai ridiscusso è una decisione presa dal mercato di ieri. Il pricing è la leva di margine più rapida che possiedi — e la meno usata.",
  Q8: "Se non puoi prevedere i clienti del mese prossimo, non hai un motore: hai il meteo. E sul meteo non si costruiscono piani.",
  Q9: "Il passaparola è meraviglioso, ma non è tuo: non si accende a comando. Finché non sai da dove arrivano davvero i clienti, ogni investimento è un lancio di dadi.",
  Q10: "Senza criteri scritti, il tempo commerciale va ai lead sbagliati mentre i migliori aspettano. La qualificazione è margine travestito da processo.",
  Q11: "Ogni richiesta gestita improvvisando è conversione regalata al caso. Il percorso da contatto a cliente va scritto: una pagina, non un manuale.",
  Q12: "Un business che vende solo al network personale ha un soffitto: il tuo capitale sociale. Il motore vero comincia dove finiscono le tue conoscenze.",
  Q13: "Ciò che si rompe quando ti fermi è la mappa del valore intrappolato nella tua testa. Non è un problema di delega: è un sistema non ancora scritto.",
  Q14: "Ciò che è scritto si può insegnare, verificare, migliorare, vendere. Ciò che è in testa si può solo fare — e rifare, per sempre, tu.",
  Q15: "Se la qualità cala quando il volume sale, la crescita è un rischio, non un obiettivo: più clienti significherebbe più caos, non più profitto.",
  Q16: "Ogni decisione ricorrente che passa da te è un collo di bottiglia con la tua firma. Le regole scritte decidono al posto tuo, alla tua velocità.",
  Q17: "Le eccezioni che solo tu sai gestire sono la misura esatta della tua indispensabilità. E l'indispensabilità non è un asset: è una gabbia.",
  Q18: "Senza il margine per offerta — ore tue incluse — guidi guardando il fatturato, cioè la vanità. Quasi certamente alcuni clienti sono in perdita: non sai quali.",
  Q19: "La cassa imprevedibile trasforma ogni decisione in scommessa. Bastano pochi numeri al mese per passare da «spero» a «so».",
  Q20: "Dodici mesi senza toccare i prezzi sono dodici mesi di inflazione, esperienza e valore regalati. Il ri-prezzo è la mossa più rapida che esista.",
  Q21: "Decidere marketing e assunzioni a sensazione significa far dipendere il margine dall'umore. I numeri non tolgono coraggio: tolgono azzardo.",
  Q22: "Una parte piccola di clienti e offerte genera quasi sempre la maggior parte del margine. Finché non sai quale, tratti tutto allo stesso modo — e la media mente.",
  Q23: "Un business che non accumula asset produce reddito, non patrimonio: quando ti fermi tu, si ferma tutto. La differenza si costruisce per strada, o mai.",
  Q24: "Un asset senza numeri, contratti o evidenze, agli occhi di chiunque, non esiste. Il valore che non si può mostrare non si può vendere.",
  Q25: "Se nessun asset può essere spiegato e trasferito, il business vale quanto la tua agenda. La parte trasferibile è l'unica che sopravvive a te.",
  Q26: "Il metodo che vive nella tua testa è il tuo asset più prezioso e il meno protetto. Scritto e nominato, diventa qualcosa che ha un valore — e un prezzo.",
  Q27: "Le relazioni strategiche a stretta di mano muoiono con le persone o con gli umori. Un contratto le trasforma da fortuna in asset.",
  Q28: "Le occasioni serie — partner, banca, investitore — non aspettano che prepari i materiali. La leggibilità si costruisce prima che serva, o non serve.",
  Q29: "Se nessuno può decidere al posto tuo per tre mesi, il business non ha un piano B. E chi ti valuta se ne accorge prima di te.",
  Q30: "Il valore che richiede un'ora di spiegazione, agli occhi di un interlocutore senior, vale la metà. La sintesi non è cosmesi: è prova di controllo.",
  Q31: "I rischi non mappati non spariscono: si presentano al momento peggiore, col conto in mano. Mapparli è la differenza tra gestire e sperare.",
  Q32: "Se un esterno competente non capisce modello e numeri in dieci minuti, il problema non è l'esterno: è la leggibilità. E si sconta sempre dal prezzo.",
};

export const FIRST_MOVES: Record<string, string> = {
  clarity: "Scrivi la lista dei tuoi clienti passati ordinata per margine reale. Poi chiama il migliore e fagli due domande: «Perché hai scelto proprio me?» e «Cosa stavi per fare, invece?». L'avatar non si inventa: si estrae.",
  acquisition: "Apri un foglio a tre colonne — da dove è arrivato, quale tua azione l'ha generato, se è diventato una conversazione di vendita — e ricostruisci a memoria gli ultimi 10 clienti. Non puoi riparare quello che non vedi.",
  operations: "Scrivi tutto ciò che si rompe o genera lamentele nella consegna, ordinato per frequenza. Cerchia la voce numero uno: nei prossimi 90 giorni si sistema solo quella, e si ignora deliberatamente il resto.",
  margins: "Apri un foglio: una riga per ciascuno degli ultimi 5 clienti — ricavo, meno costi diretti, meno le TUE ore a una tariffa onesta. Il margine senza le tue ore è finto. Fa male una volta sola.",
  asset: "L'esperimento: domani vendi il business, l'acquirente firma, tu esci dalla stanza. Scrivi cosa resta dentro, in due colonne: «esiste ed è del business» / «esiste solo nella mia testa». La seconda colonna è il tuo piano.",
  readiness: "Compila il cruscotto a 4 numeri del mese scorso: incassato, margine reale, cassa disponibile, pipeline. Trenta minuti. Sarà approssimativo: va bene così, si affina ogni mese.",
};

export const STAGE_NEXT: Record<string, string> = {
  "FOUNDATION": "Chi esce da questo stadio smette di vendere «a chi capita» e dimostra che il mercato paga: vendite ripetute a clienti diversi, prezzi accettati senza sconti d'emergenza, soldi tracciati.",
  "TRACTION": "Chi passa oltre trasforma gli episodi in flusso: una dose di acquisizione quotidiana anche nei mesi pieni, un solo canale misurato e raddoppiato, un processo di vendita che non cambia a ogni chiamata.",
  "STABILIZATION": "Chi gradua qui cambia mestiere: da esecutore a formatore. I compiti chiave sono scritti, i problemi si chiudono uno alla volta in sequenza, e il business regge un'assenza senza incidenti.",
  "PRODUCTIZATION": "Chi supera questo stadio impara a dire no: un avatar preciso estratto dai clienti migliori, un'offerta ri-prezzata per lui, e il margine per cliente — non il fatturato — come bussola.",
  "SCALE READINESS": "Oltre c'è la scala vera: un'offerta premium per i clienti migliori, numeri leggibili da un esterno in dieci minuti, asset documentati che valgono anche senza di te.",
};

export const CLOSING_LETTER = "Questo report è una fotografia onesta, non un giudizio. Il punteggio conta meno della sequenza: un vincolo alla volta, nell'ordine giusto. Se ti è stato utile, rifallo tra 90 giorni e confronta i numeri — è lì che si vede il lavoro.";

export interface CostlyAnswer { id: string; dimension: string; text: string; chosenText: string; why: string; }

/* Decodifica `ans` e sceglie le 3 risposte più costose:
   idx più basso prima, a parità vince la dimensione del vincolo,
   poi la dimensione col punteggio più basso. */
export function pickCostlyAnswers(
  ans: string | null | undefined,
  bindingConstraint: string | null | undefined,
  dimensions: Record<string, { score: number }> | null | undefined
): CostlyAnswer[] {
  if (!ans || typeof ans !== "string" || ans.length < SCORED.length) return [];
  const dimScore = (d: string) =>
    dimensions && dimensions[d] && typeof dimensions[d].score === "number"
      ? dimensions[d].score
      : 10;
  const candidates: Array<CostlyAnswer & { idx: number }> = [];
  for (let i = 0; i < SCORED.length; i++) {
    const ch = ans[i];
    if (ch === "x") continue;
    const idx = parseInt(ch, 10);
    if (isNaN(idx) || idx > 1) continue; // solo le risposte basse (0-1)
    const q = SCORED[i];
    candidates.push({
      id: q.id, dimension: q.dimension, text: q.text,
      chosenText: q.options[idx] || "", why: WHY[q.id] || "", idx
    });
  }
  candidates.sort((a, b) => {
    if (a.idx !== b.idx) return a.idx - b.idx;
    const aBind = a.dimension === bindingConstraint ? 0 : 1;
    const bBind = b.dimension === bindingConstraint ? 0 : 1;
    if (aBind !== bBind) return aBind - bBind;
    return dimScore(a.dimension) - dimScore(b.dimension);
  });
  return candidates.slice(0, 3).map(({ idx, ...rest }) => rest);
}

/* Data di ricalibrazione: oggi + 90 giorni, formato it-IT. */
export function retestDate(): string {
  const d = new Date();
  d.setDate(d.getDate() + 90);
  return d.toLocaleDateString("it-IT", { day: "2-digit", month: "long", year: "numeric" });
}
