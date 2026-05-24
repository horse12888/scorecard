import { QUESTIONS } from './questions';
import { computeDiagnosticState } from './diagnostics';

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

  const state = computeDiagnosticState(overall, dimensions);
  
  return {
    name: user.name,
    company: user.company,
    email: user.email,
    metadata: {
      businessType: answers['Q1'] || '',
      revenueRange: answers['Q2'] || ''
    },
    overall: overall,
    fascia: state.fascia,
    profile: state.profile,
    stage: state.stageLabel,
    stageLabel: state.stageLabel,
    dimensions: dimensions,
    strengths: state.forze,
    priorities: state.priorita,
    forze: state.forze,
    priorita: state.priorita,
    processedDims: state.processedDims,
    stageInfo: state.stageInfo,
    spiderDims: state.processedDims.map((d: any) => ({ label: d.label, score: d.score }))
  };
}
