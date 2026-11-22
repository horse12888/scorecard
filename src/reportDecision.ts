import { QUESTIONS, type Dimension } from './questions';

export type ReportArea = Dimension;

export const decisions: Record<ReportArea, { question: string; reason: string; evidence: string; consequence: string }> = {
  clarity: {
    question: 'Per quale problema vuoi che un cliente scelga te?',
    reason: 'Se due preventivi raccontano lavori molto diversi, il cliente può faticare a capire quando rivolgersi a te.',
    evidence: 'I motivi citati dai clienti quando accettano o rifiutano un preventivo.',
    consequence: 'Una proposta difficile da distinguere dalle altre tende a essere confrontata soprattutto sul prezzo.'
  },
  acquisition: {
    question: 'Da dove possono arrivare i prossimi clienti?',
    reason: 'Un mese pieno di richieste dice poco su quello successivo se resta incerta la loro provenienza.',
    evidence: 'Il canale da cui arrivano i clienti che hanno effettivamente acquistato.',
    consequence: 'Un investimento commerciale può portare più contatti senza portare clienti adatti alla tua offerta.'
  },
  operations: {
    question: 'Quali decisioni richiedono davvero il tuo via libera?',
    reason: 'Se anche un acquisto ordinario aspetta la tua approvazione, la tua disponibilità condiziona i tempi del team.',
    evidence: 'Le richieste rimaste ferme in attesa di una tua conferma.',
    consequence: 'Una tua assenza può ritardare una consegna anche quando le persone e i materiali sono disponibili.'
  },
  margins: {
    question: 'Quali commesse vale la pena rinnovare alle condizioni attuali?',
    reason: 'Un cliente può ordinare spesso e lasciarti poco margine. Il fatturato da solo non basta per decidere quando ridiscutere un prezzo.',
    evidence: 'I costi diretti e le ore assorbite dalle commesse in rinnovo.',
    consequence: 'Accettare altro lavoro alle stesse condizioni può occupare il team senza lasciare abbastanza risorse per il prossimo ordine.'
  },
  asset: {
    question: 'Che cosa conserva valore anche senza di te?',
    reason: 'Un cliente può essere legato al marchio oppure alla persona che lo segue. La differenza conta quando vuoi cedere una responsabilità.',
    evidence: 'Le relazioni o le attività che un collega riesce già a gestire in tua assenza.',
    consequence: 'Un passaggio di consegne può mettere a rischio una relazione commerciale o una competenza difficile da sostituire.'
  },
  readiness: {
    question: 'Che cosa saprebbe verificare un partner prima di firmare?',
    reason: 'Se conti e responsabilità si capiscono solo dopo una tua spiegazione, una trattativa dipende dalla tua disponibilità.',
    evidence: 'I dati che un possibile partner può controllare in autonomia.',
    consequence: 'Il partner può rinviare una decisione anche quando è interessato alla proposta.'
  }
};

export type OfferInput = {
  intentLevel?: number | string | null;
  metadata?: { revenueRange?: string; intentLevel?: number | string | null };
  answers?: { Q2?: { idx?: number; label?: string } };
};

// Tilda usa Q2.idx. Nei link al report la stessa risposta viaggia come etichetta.
const revenueBands = QUESTIONS.find(q => q.id === 'Q2')!.options!;
export function reportOffer(result: OfferInput): 'kit' | 'review' {
  const answer = result.answers?.Q2;
  const band = answer?.idx ?? revenueBands.indexOf(result.metadata?.revenueRange || answer?.label || '');
  return band >= 1 || Number(result.intentLevel ?? result.metadata?.intentLevel) >= 2 ? 'review' : 'kit';
}
