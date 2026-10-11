/* ============================================================
   ATTENZIONE (11/10/2026): FILE VECCHIO, NON E' IL MOTORE LIVE.
   Domande sì/no di una versione precedente, usate solo dalla
   modalità di prova interna del report (SHOW_TESTS).
   Il motore vero è:
   - scorecard su Tilda (/scorecard): domande, punteggi, vincolo;
   - Apps Script "IMPULSE Report Assembler": diagnosi e testi.
   Non modificare questo file pensando di cambiare l'assessment.
   ============================================================ */
import { QUESTIONS } from './questions';

export function calculateScorecardResult(answers: Record<string, any>, user: { name: string, company: string, email: string }) {
  const dims: Record<string, { yes: number, total: number }> = {
    clarity: { yes: 0, total: 0 },
    acquisition: { yes: 0, total: 0 },
    operations: { yes: 0, total: 0 },
    margins: { yes: 0, total: 0 },
    asset: { yes: 0, total: 0 },
    readiness: { yes: 0, total: 0 }
  };

  QUESTIONS.forEach(q => {
    if (q.dimension) {
      dims[q.dimension].total += 1;
      const ans = answers[q.id];
      if (ans === true) {
        dims[q.dimension].yes += 1;
      }
    }
  });

  const weights: Record<string, number> = {
    clarity: 0.20,
    acquisition: 0.15,
    operations: 0.20,
    margins: 0.15,
    asset: 0.15,
    readiness: 0.15
  };

  const dimensions: Record<string, { score: number, yes: number }> = {};
  let overallFraction = 0;

  Object.keys(dims).forEach(key => {
    const rawScore = dims[key].total > 0 ? (dims[key].yes / dims[key].total) * 10 : 0;
    dimensions[key] = {
      score: Number(rawScore.toFixed(1)),
      yes: dims[key].yes
    };
    overallFraction += rawScore * weights[key];
  });

  const overall = Number(((overallFraction / 10) * 100).toFixed(0));

  /* [SERVER-SIDE v2] lo stato diagnostico non si calcola piu' qui:
     arriva dal server. Questa funzione (solo dev) torna i punteggi. */
  return {
    name: user.name,
    company: user.company,
    email: user.email,
    metadata: {
      businessType: answers['Q1'] || '',
      revenueRange: answers['Q2'] || ''
    },
    overall: overall,
    dimensions: dimensions
  };
}
