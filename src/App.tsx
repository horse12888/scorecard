/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { generateIMPULSEReport } from './pdf';
import { QUESTIONS } from './questions';
import { calculateScorecardResult } from './scoring';
import { computeDiagnosticState } from './diagnostics';

const SHOW_TESTS =
  (import.meta as any).env.DEV ||
  (import.meta as any).env.VITE_SHOW_TESTS === 'true';

function makeDevLeadId() {
  const timestamp = new Date()
    .toISOString()
    .replace(/[-:.TZ]/g, '')
    .slice(0, 14);

  const random = Math.random().toString(36).slice(2, 8);

  return `dev_${timestamp}_${random}`;
}

function getLeadIdFromParsed(parsed: any) {
  return parsed?.leadId || parsed?.metadata?.leadId || '';
}

function toNullableNumber(value: any) {
  if (value === null || value === undefined || value === '') {
    return null;
  }

  const n = Number(value);

  if (Number.isNaN(n)) {
    return null;
  }

  return n;
}

function getIntentLevelFromParsed(parsed: any) {
  return toNullableNumber(
    parsed?.intentLevel ??
      parsed?.intent_level ??
      parsed?.metadata?.intentLevel ??
      parsed?.metadata?.intent_level ??
      null
  );
}

function getStagingScoreFromParsed(parsed: any) {
  return toNullableNumber(
    parsed?.stagingScore ??
      parsed?.staging_score ??
      parsed?.metadata?.stagingScore ??
      parsed?.metadata?.staging_score ??
      null
  );
}

function getIntentLevelFromResult(result: any) {
  return toNullableNumber(
    result?.intentLevel ??
      result?.intent_level ??
      result?.metadata?.intentLevel ??
      result?.metadata?.intent_level ??
      null
  );
}

function getStagingScoreFromResult(result: any) {
  return toNullableNumber(
    result?.stagingScore ??
      result?.staging_score ??
      result?.metadata?.stagingScore ??
      result?.metadata?.staging_score ??
      null
  );
}

function buildEnrichedResult(baseResult: any, state: any, leadId?: string) {
  const resolvedLeadId =
    leadId ||
    baseResult?.leadId ||
    baseResult?.metadata?.leadId ||
    '';

  const resolvedIntentLevel =
    baseResult?.intentLevel ??
    baseResult?.intent_level ??
    baseResult?.metadata?.intentLevel ??
    baseResult?.metadata?.intent_level ??
    state?.intentInsight?.level ??
    null;

  const resolvedStagingScore =
    baseResult?.stagingScore ??
    baseResult?.staging_score ??
    state?.stagingScore ??
    baseResult?.overall ??
    null;

  return {
    ...baseResult,

    leadId: resolvedLeadId,

    metadata: {
      ...(baseResult.metadata || {}),
      leadId: resolvedLeadId,
      intentLevel: resolvedIntentLevel
    },

    intentLevel: resolvedIntentLevel,
    stagingScore: resolvedStagingScore,

    fascia: state.fascia,

    profile: state.profile,
    profileData: state.profileData,

    stage: state.stageLabel,
    stageLabel: state.stageLabel,

    roadmapStage: state.roadmapStage,
    roadmapInfo: state.roadmapInfo,

    functionConstraints: state.functionConstraints || [],

    strengths: state.forze,
    priorities: state.priorita,
    forze: state.forze,
    priorita: state.priorita,

    processedDims: state.processedDims,
    stageInfo: state.stageInfo,

    topGapPair: state.topGapPair,
    diagnosticPattern: state.diagnosticPattern,
    riskFlags: state.riskFlags || [],
    intentInsight: state.intentInsight,

    spiderDims: state.processedDims.map((d: any) => ({
      label: d.label,
      score: d.score
    }))
  };
}

function isValidParsedResult(parsed: any) {
  const dims = parsed?.dimensions;

  const requiredDims = [
    'clarity',
    'acquisition',
    'operations',
    'margins',
    'asset',
    'readiness'
  ];

  return (
    typeof parsed?.name === 'string' &&
    parsed.name.trim() !== '' &&
    typeof parsed?.overall === 'number' &&
    parsed.overall >= 0 &&
    parsed.overall <= 100 &&
    dims &&
    requiredDims.every(
      d =>
        dims[d] &&
        typeof dims[d].score === 'number' &&
        dims[d].score >= 0 &&
        dims[d].score <= 10 &&
        typeof dims[d].yes === 'number' &&
        dims[d].yes >= 0 &&
        dims[d].yes <= 7
    )
  );
}

function decodeResultPayload(encodedResult: string) {
  const decodedString = decodeURIComponent(escape(atob(encodedResult)));
  return JSON.parse(decodedString);
}

/* [V2.5 / CONVERSIONE] CTA Strategic Review on-page, calibrata su intent.
   Prima la CTA esisteva solo dentro il PDF. */
function buildStrategicReviewUrl(result: any) {
  const base = 'https://davidedileo.it/strategic-review';
  const utm = result?.metadata?.utm || {};
  const params = new URLSearchParams();

  Object.keys(utm).forEach(k => {
    if (utm[k]) params.set(k, String(utm[k]));
  });

  if (result?.metadata?.isTest) params.set('test', '1');

  const query = params.toString() ? `?${params.toString()}` : '';
  const leadId = result?.leadId || '';
  const hash = leadId ? `#leadId=${encodeURIComponent(leadId)}` : '';

  return `${base}${query}${hash}`;
}

function getReviewCta(result: any) {
  const level = Number(result?.intentLevel);

  if (!Number.isNaN(level) && level >= 3) {
    return {
      kicker: 'PRIORITÀ ADESSO',
      title: 'Hai una finestra di decisione aperta.',
      body:
        'Hai indicato che una decisione importante è una priorità adesso. La Strategic Review trasforma questa diagnosi nell\u2019ordine operativo dei prossimi 30-60 giorni: cosa correggere prima, cosa non scalare ancora, con i tuoi numeri.',
      button: 'Prenota ora la Strategic Review'
    };
  }

  if (!Number.isNaN(level) && level === 2) {
    return {
      kicker: 'STRATEGIC REVIEW',
      title: 'Trasforma la diagnosi in ordine operativo.',
      body:
        'Hai indicato una decisione importante nei prossimi 6-12 mesi. L\u2019ordine degli interventi determina con quale forza ci arriverai. Una sessione di lavoro sul tuo caso: priorità, sequenza, prossime decisioni.',
      button: 'Prenota la Strategic Review'
    };
  }

  return {
    kicker: 'QUANDO SARAI PRONTO',
    title: 'Il punto di partenza è già identificato.',
    body:
      'Questa diagnosi resta valida nel tempo. Se vuoi trasformarla in una sequenza operativa con una sessione di lavoro sul tuo caso, la Strategic Review è il passo dopo.',
    button: 'Scopri la Strategic Review'
  };
}

export default function App() {
  const [step, setStep] = useState<
    'loading' | 'error' | 'info' | 'questions' | 'summary'
  >('loading');

  const [user, setUser] = useState({
    name: '',
    company: '',
    email: ''
  });

  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [result, setResult] = useState<any>(null);
  const [currentIdx, setCurrentIdx] = useState(0);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const encodedResult = urlParams.get('result');

    if (encodedResult) {
      try {
        const parsed = decodeResultPayload(encodedResult);

        if (!parsed || !isValidParsedResult(parsed)) {
          console.error('Validation failed', parsed);
          setStep('error');
          return;
        }

        const leadId = getLeadIdFromParsed(parsed);
        const intentLevel = getIntentLevelFromParsed(parsed);
        const stagingScore = getStagingScoreFromParsed(parsed);

        const state = computeDiagnosticState(
          parsed.overall,
          parsed.dimensions,
          {
            intentLevel,
            stagingScore
          }
        );

        const enrichedResult = buildEnrichedResult(
          {
            leadId,
            name: parsed.name,
            company: parsed.company || '',
            email: parsed.email || '',
            metadata: parsed.metadata || {},
            overall: parsed.overall,
            dimensions: parsed.dimensions,
            stagingScore,
            bindingConstraint: parsed.bindingConstraint,
            intentLevel
          },
          state,
          leadId
        );

        console.log('Parsed report leadId:', leadId);
        console.log('Parsed intentLevel:', intentLevel);
        console.log('Parsed stagingScore:', stagingScore);
        console.log('Enriched report result:', enrichedResult);

        setResult(enrichedResult);
        setStep('summary');
      } catch (e) {
        console.error('Failed to decode result parameter', e);
        setStep('error');
      }

      return;
    }

    if (SHOW_TESTS) {
      setStep('info');
    } else {
      setStep('error');
    }
  }, []);

  const handleStart = (e: React.FormEvent) => {
    e.preventDefault();
    setStep('questions');
    setCurrentIdx(0);
  };

  const currentQuestion = QUESTIONS[currentIdx];

  const handleSelectOption = (idx: number, opt: string) => {
    const updatedAnswers = {
      ...answers,
      [currentQuestion.id]: opt
    };

    setAnswers(updatedAnswers);
  };

  const handleYesNo = (val: boolean) => {
    const updatedAnswers = {
      ...answers,
      [currentQuestion.id]: val
    };

    setAnswers(updatedAnswers);
    handleNext(updatedAnswers);
  };

  const handleNext = (currentAnswers: Record<string, any> = answers) => {
    if (currentIdx < QUESTIONS.length - 1) {
      setCurrentIdx(currentIdx + 1);
      return;
    }

    const finalResult = calculateScorecardResult(currentAnswers, user);

    const intentLevel = getIntentLevelFromResult(finalResult);
    const stagingScore = getStagingScoreFromResult(finalResult);

    const state = computeDiagnosticState(
      finalResult.overall,
      finalResult.dimensions,
      {
        intentLevel,
        stagingScore
      }
    );

    const devLeadId = finalResult.leadId || makeDevLeadId();

    const enrichedResult = buildEnrichedResult(
      {
        ...finalResult,
        leadId: devLeadId,
        intentLevel,
        stagingScore
      },
      state,
      devLeadId
    );

    setResult(enrichedResult);
    setStep('summary');
  };

  const handlePrev = () => {
    if (currentIdx > 0) {
      setCurrentIdx(currentIdx - 1);
    }
  };

  const handleDownloadPDF = async () => {
    if (result) {
      console.log('Report result before PDF:', result);
      await generateIMPULSEReport(result);
    }
  };

  const runTest = async (
    label: string,
    mockAnswers: Record<string, any>,
    mockUser: any
  ) => {
    const testResult = calculateScorecardResult(mockAnswers, mockUser);

    const intentLevel = getIntentLevelFromResult(testResult);
    const stagingScore = getStagingScoreFromResult(testResult);

    const state = computeDiagnosticState(
      testResult.overall,
      testResult.dimensions,
      {
        intentLevel,
        stagingScore
      }
    );

    const devLeadId = testResult.leadId || makeDevLeadId();

    const enrichedTestResult = buildEnrichedResult(
      {
        ...testResult,
        leadId: devLeadId,
        intentLevel,
        stagingScore
      },
      state,
      devLeadId
    );

    setResult(enrichedTestResult);
    setStep('summary');

    await generateIMPULSEReport(enrichedTestResult, label);
  };

  const makeAnswers = (
    clarityScore: number,
    acqScore: number,
    opsScore: number,
    marginsScore: number,
    assetScore: number,
    readinessScore: number
  ) => {
    const ans: Record<string, any> = {
      Q1: 'Founder o co-founder',
      Q2: '€500k–€1M'
    };

    const mapDimension = (dimName: string, expectedScore: number) => {
      let yesCount = Math.round((expectedScore / 10) * 7);

      QUESTIONS.filter(q => q.dimension === dimName).forEach(q => {
        if (yesCount > 0) {
          ans[q.id] = true;
          yesCount--;
        } else {
          ans[q.id] = false;
        }
      });
    };

    mapDimension('clarity', clarityScore);
    mapDimension('acquisition', acqScore);
    mapDimension('operations', opsScore);
    mapDimension('margins', marginsScore);
    mapDimension('asset', assetScore);
    mapDimension('readiness', readinessScore);

    return ans;
  };

  const testCases = [
    {
      label: 'TEST 1 - CLARITY GAP',
      user: {
        name: 'Anna Rossi',
        company: 'Rossi Studio',
        email: 'anna@example.com'
      },
      answers: makeAnswers(2.8, 5.7, 5.7, 5.7, 5.7, 4.3)
    },
    {
      label: 'TEST 2 - GROWTH ENGINE GAP',
      user: {
        name: 'Marco Bianchi',
        company: 'Bianchi Growth',
        email: 'marco@example.com'
      },
      answers: makeAnswers(5.7, 4.3, 5.7, 4.3, 5.7, 5.7)
    },
    {
      label: 'TEST 3 - OPERATIONAL GAP',
      user: {
        name: 'Luca Verdi',
        company: 'Verdi Industries',
        email: 'luca@example.com'
      },
      answers: makeAnswers(8.1, 8.2, 5.1, 7.0, 4.8, 6.4)
    },
    {
      label: 'TEST 4 - READINESS GAP',
      user: {
        name: 'Laura Neri',
        company: 'Neri Advisory',
        email: 'laura@example.com'
      },
      answers: makeAnswers(8.2, 6.2, 6.2, 5.7, 5.7, 2.8)
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center p-4 font-sans text-gray-900">
      <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200 max-w-2xl w-full">
        <div className="flex justify-between items-center mb-8 border-b pb-4">
          <h1 className="text-2xl font-bold tracking-tight text-[rgb(39,112,143)]">
            IMPULSE Scorecard
          </h1>

          <div className="text-sm text-gray-500 font-mono tracking-wider">
            {step === 'info' && '1/3 PROFILE'}
            {step === 'questions' && '2/3 ASSESSMENT'}
            {step === 'summary' && 'DIAGNOSI'}
          </div>
        </div>

        {step === 'loading' && (
          <div className="text-center py-20 text-gray-500">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[rgb(39,112,143)] mx-auto mb-4"></div>
            <p>Caricamento diagnosi in corso...</p>
          </div>
        )}

        {step === 'error' && (
          <div className="text-center py-10 space-y-4">
            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg
                className="w-8 h-8"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>

            <h2 className="text-xl font-bold text-gray-900">
              Errore di caricamento
            </h2>

            <p className="text-gray-600">
              Non riusciamo a generare il report perché i dati della scorecard
              sono incompleti. Torna alla scorecard e riprova.
            </p>

            {SHOW_TESTS && (
              <button
                type="button"
                onClick={() => setStep('info')}
                className="mt-6 text-sm text-[rgb(39,112,143)] underline"
              >
                Dev mode: mostra scorecard manuale
              </button>
            )}
          </div>
        )}

        {step === 'info' && SHOW_TESTS && (
          <form onSubmit={handleStart} className="space-y-4">
            <p className="text-gray-600 mb-6 text-sm">
              Scopri dove il valore del tuo business è bloccato e quale leva
              muovere prima. Compila il form per iniziare.
            </p>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nome
              </label>
              <input
                required
                type="text"
                className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-[rgb(39,112,143)] outline-none"
                value={user.name}
                onChange={e =>
                  setUser({
                    ...user,
                    name: e.target.value
                  })
                }
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Azienda
              </label>
              <input
                required
                type="text"
                className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-[rgb(39,112,143)] outline-none"
                value={user.company}
                onChange={e =>
                  setUser({
                    ...user,
                    company: e.target.value
                  })
                }
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                required
                type="email"
                className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-[rgb(39,112,143)] outline-none"
                value={user.email}
                onChange={e =>
                  setUser({
                    ...user,
                    email: e.target.value
                  })
                }
              />
            </div>

            <button
              type="submit"
              className="mt-6 w-full bg-[rgb(39,112,143)] text-white font-medium py-3 px-6 rounded transition hover:bg-[rgb(30,85,110)]"
            >
              Inizia Scorecard
            </button>

            {SHOW_TESTS && (
              <div className="mt-12 pt-6 border-t border-gray-100">
                <p className="text-xs text-gray-400 font-mono mb-4 text-center">
                  E2E TEST PIPELINE, DEV ONLY
                </p>

                <div className="grid grid-cols-2 gap-2">
                  {testCases.map((tc, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => runTest(tc.label, tc.answers, tc.user)}
                      className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 rounded"
                    >
                      {tc.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </form>
        )}

        {step === 'questions' && currentQuestion && (
          <div className="space-y-8">
            <div className="mb-6 flex justify-between items-center text-xs font-mono text-gray-400 uppercase">
              <span>
                DOMANDA {currentIdx + 1} DI {QUESTIONS.length}
              </span>

              {currentQuestion.dimension && (
                <span>{currentQuestion.dimension}</span>
              )}
            </div>

            <div className="border-b border-gray-100 pb-8 min-h-[160px]">
              <p className="font-semibold text-gray-900 text-xl leading-snug mb-8">
                {currentQuestion.text}
              </p>

              {currentQuestion.type === 'yesno' ? (
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => handleYesNo(false)}
                    className={`flex-1 py-4 text-lg font-medium rounded-lg border-2 transition ${
                      answers[currentQuestion.id] === false
                        ? 'bg-gray-900 text-white border-gray-900'
                        : 'bg-white text-gray-600 border-gray-200 hover:border-gray-500'
                    }`}
                  >
                    No
                  </button>

                  <button
                    type="button"
                    onClick={() => handleYesNo(true)}
                    className={`flex-1 py-4 text-lg font-medium rounded-lg border-2 transition ${
                      answers[currentQuestion.id] === true
                        ? 'bg-[rgb(39,112,143)] text-white border-[rgb(39,112,143)]'
                        : 'bg-white text-gray-600 border-gray-200 hover:border-gray-500 hover:bg-[rgb(240,248,255)]'
                    }`}
                  >
                    Sì
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {currentQuestion.options?.map((opt, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => handleSelectOption(i, opt)}
                      className={`block w-full text-left px-5 py-4 text-base font-medium rounded-lg border-2 transition ${
                        answers[currentQuestion.id] === opt
                          ? 'bg-[rgb(39,112,143)] text-white border-[rgb(39,112,143)]'
                          : 'bg-white text-gray-700 border-gray-200 hover:border-gray-400'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}

                  <button
                    type="button"
                    onClick={() => handleNext()}
                    disabled={answers[currentQuestion.id] === undefined}
                    className="w-full mt-4 bg-[rgb(39,112,143)] text-white font-medium py-3 px-6 rounded transition disabled:opacity-50"
                  >
                    Avanti
                  </button>
                </div>
              )}
            </div>

            <div className="flex justify-between items-center text-sm">
              <button
                type="button"
                onClick={handlePrev}
                disabled={currentIdx === 0}
                className="text-gray-500 hover:text-gray-900 disabled:opacity-30 flex items-center gap-2"
              >
                ← Indietro
              </button>

              {currentQuestion.type === 'yesno' &&
                answers[currentQuestion.id] !== undefined && (
                  <button
                    type="button"
                    onClick={() => handleNext()}
                    className="bg-[rgb(39,112,143)] text-white py-2 px-6 rounded text-sm hover:bg-[rgb(30,85,110)] transition"
                  >
                    Avanti →
                  </button>
                )}
            </div>

            <div className="w-full bg-gray-100 h-2 rounded overflow-hidden mt-4">
              <div
                className="bg-[rgb(39,112,143)] h-full transition-all duration-300"
                style={{
                  width: `${Math.round(
                    ((currentIdx + 1) / QUESTIONS.length) * 100
                  )}%`
                }}
              ></div>
            </div>
          </div>
        )}

        {step === 'summary' && result && (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold tracking-tight text-[rgb(39,112,143)] text-center mb-8">
              Diagnosi Elaborata
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 p-6 bg-gray-50 rounded-lg text-center border border-gray-100 mb-6">
              <div className="flex flex-col justify-center">
                <p className="text-xs text-gray-500 font-mono tracking-wider mb-2">
                  SCORE
                </p>
                <p className="text-lg md:text-xl font-bold break-words leading-tight">
                  {result.overall} / 100
                </p>
              </div>

              <div className="flex flex-col justify-center">
                <p className="text-xs text-gray-500 font-mono tracking-wider mb-2">
                  FASCIA
                </p>
                <p className="text-lg md:text-xl font-bold break-words leading-tight">
                  {result.fascia}
                </p>
              </div>

              <div className="flex flex-col justify-center">
                <p className="text-xs text-gray-500 font-mono tracking-wider mb-2">
                  STAGE
                </p>
                <p className="text-lg md:text-xl font-bold break-words leading-tight">
                  {result.stage}
                </p>
              </div>

              <div className="flex flex-col justify-center">
                <p className="text-xs text-gray-500 font-mono tracking-wider mb-2">
                  PROFILE
                </p>
                <p className="text-lg md:text-xl font-bold break-words leading-tight">
                  {result.profile}
                </p>
              </div>
            </div>

            {result.diagnosticPattern ? (
              <div className="p-5 bg-gray-50 rounded-lg border border-gray-100">
                <p className="text-xs text-gray-500 font-mono tracking-wider mb-2">
                  DIAGNOSTIC PATTERN
                </p>
                <p className="text-lg font-bold text-gray-900 mb-2">
                  {result.diagnosticPattern.topGapPairTitle}
                </p>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {result.diagnosticPattern.topGapPairBody}
                </p>
              </div>
            ) : null}

            {result.riskFlags && result.riskFlags.length > 0 ? (
              <div className="p-5 bg-red-50 rounded-lg border border-red-100">
                <p className="text-xs text-red-500 font-mono tracking-wider mb-2">
                  RISK FLAG
                </p>
                <p className="text-lg font-bold text-red-700 mb-2">
                  {result.riskFlags[0].title}
                </p>
                <p className="text-sm text-red-700 leading-relaxed">
                  {result.riskFlags[0].body}
                </p>
              </div>
            ) : null}

            {result.leadId ? (
              <div className="text-center text-xs text-gray-400 font-mono">
                Report ID: {result.leadId}
              </div>
            ) : null}

            {/* [V2.5] CTA Strategic Review on-page, calibrata su intent */}
            {(() => {
              const cta = getReviewCta(result);
              const reviewUrl = buildStrategicReviewUrl(result);
              return (
                <div className="bg-[#1A1A1A] rounded-lg p-6 mt-2">
                  <p className="text-[11px] tracking-widest font-bold text-[rgb(184,138,42)] mb-2 uppercase">
                    {cta.kicker}
                  </p>
                  <p className="text-xl font-bold text-white mb-2">
                    {cta.title}
                  </p>
                  <p className="text-sm text-gray-300 leading-relaxed mb-4">
                    {cta.body}
                  </p>
                  <a
                    href={reviewUrl}
                    className="inline-block bg-[rgb(184,138,42)] hover:bg-[rgb(199,154,59)] text-gray-900 font-bold py-3 px-6 rounded transition"
                  >
                    {cta.button}
                  </a>
                </div>
              );
            })()}

            <button
              type="button"
              onClick={handleDownloadPDF}
              className="w-full bg-[rgb(212,175,55)] hover:bg-[rgb(192,155,35)] text-gray-900 font-bold py-4 px-6 rounded mt-8 mb-4 transition"
            >
              Scarica Report PDF
            </button>

            {SHOW_TESTS && (
              <button
                type="button"
                onClick={() => {
                  setStep('info');
                  setAnswers({});
                  setResult(null);
                }}
                className="w-full bg-white hover:bg-gray-50 border border-gray-200 text-gray-600 font-medium py-3 px-6 rounded transition"
              >
                Nuovo Test, Dev Only
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
