/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
 
import React, { useState, useEffect } from 'react';
import { generateIMPULSEReport } from './pdf';
import { QUESTIONS } from './questions';
import { calculateScorecardResult } from './scoring';
 
const SHOW_TESTS =
  (import.meta as any).env.DEV ||
  (import.meta as any).env.VITE_SHOW_TESTS === 'true';
 
/* [LINK CORTO] Ponte Apps Script (stesso URL del CRM /exec). Dato ?id=,
   restituisce via JSONP il payload "result=" preso da pdf_url nel foglio. */
const SHORT_LINK_WEBAPP =
  'https://script.google.com/macros/s/AKfycby09pL6InKdxK2zeZLx9Rg7bFnAEH5wieZVyn98qcRBPW8rZ5qblfIQeLxUmNYI2nxY/exec';

/* [SERVER-SIDE v1] La banca testuale (perche'-pesa, prime mosse,
   stage-next, lettera) vive sull'assembler, non nel bundle. Dato il
   payload del lead, torna via JSONP solo la sua fetta. Se fallisce
   -> null e il report degrada senza le sezioni premium (nessun errore). */
const ASSEMBLER_WEBAPP =
  'https://script.google.com/macros/s/AKfycbxn0duukqyMP5Dvw4DTTGyKddnfAKucRBN4mt9-dMtJdWGv_Sjb3pXSSYlA_pJ1VGAB/exec';
const ASSEMBLER_DIM_ORDER = ['clarity', 'acquisition', 'operations', 'margins', 'asset', 'readiness'];

/* [FIX COOKIE v2.8.1] Le chiamate JSONP (<script>) inviano i cookie di
   Google: chi e' collegato a piu' account viene rediretto su /macros/u/N/
   e riceve "Pagina non trovata". fetch cross-origin senza cookie evita il
   problema (verificato 10/10/2026). Ritorna undefined se fallisce: in quel
   caso si usa il vecchio JSONP come riserva. */
async function jsonpViaFetch(url: string, cbName: string): Promise<any> {
  try {
    const r = await fetch(url, { credentials: 'omit', cache: 'no-store' });
    if (!r.ok) return undefined;
    const t = (await r.text()).trim();
    const prefix = cbName + '(';
    if (!t.startsWith(prefix)) return undefined;
    const inner = t.slice(prefix.length).replace(/\)\s*;?\s*$/, '');
    return JSON.parse(inner);
  } catch (e) {
    return undefined;
  }
}

function fetchAssembledContent(
  overall: number | null | undefined,
  dimensions: any,
  ans: string | null | undefined,
  bind: string | null | undefined,
  intentLevel: number | null | undefined,
  stagingScore: number | null | undefined
): Promise<any> {
  return new Promise(resolve => {
    const dims = ASSEMBLER_DIM_ORDER
      .map(d => {
        const dim = dimensions && dimensions[d];
        const sc = (dim && typeof dim.score === 'number') ? dim.score : '';
        const ye = (dim && typeof dim.yes === 'number') ? dim.yes : 0;
        return sc + ':' + ye;
      })
      .join(',');
    const cbName = '__impulseAssembled_' + Math.random().toString(36).slice(2);
    let done = false;
    const script = document.createElement('script');
    const cleanup = () => {
      try { delete (window as any)[cbName]; } catch (e) { (window as any)[cbName] = undefined; }
      if (script.parentNode) script.parentNode.removeChild(script);
    };
    const finish = (val: any) => { if (done) return; done = true; cleanup(); resolve(val); };
    (window as any)[cbName] = (data: any) => finish(data || null);
    script.onerror = () => finish(null);
    setTimeout(() => finish(null), 8000);
    const url =
      ASSEMBLER_WEBAPP +
      '?callback=' + cbName +
      '&ans=' + encodeURIComponent(ans || '') +
      '&bind=' + encodeURIComponent(bind || '') +
      '&overall=' + encodeURIComponent(String(overall == null ? '' : overall)) +
      '&intent=' + encodeURIComponent(String(intentLevel == null ? '' : intentLevel)) +
      '&staging=' + encodeURIComponent(String(stagingScore == null ? '' : stagingScore)) +
      '&dims=' + encodeURIComponent(dims);
    script.src = url;
    /* [FIX COOKIE v2.8.1] prima fetch senza cookie, poi JSONP di riserva */
    jsonpViaFetch(url, cbName).then(data => {
      if (data !== undefined) finish(data || null);
      else if (!done) document.body.appendChild(script);
    });
  });
}
 
/* [VINCOLO v2.8] nome leggibile della dimensione-vincolo (stessa
   dimensione che mostrano result page e CRM: bindingConstraint) */
const DIMENSION_LABELS: Record<string, string> = {
  clarity: 'Clarity',
  acquisition: 'Acquisition',
  operations: 'Operations',
  margins: 'Margins',
  asset: 'Asset',
  readiness: 'Readiness'
};

function getBindingKey(result: any): string {
  const b = result?.bindingConstraint;
  if (b && DIMENSION_LABELS[b]) return b;
  const dims = result?.dimensions || {};
  let best = '';
  ASSEMBLER_DIM_ORDER.forEach(d => {
    const sc = dims[d] && typeof dims[d].score === 'number' ? dims[d].score : null;
    if (sc === null) return;
    if (!best || sc < dims[best].score) best = d;
  });
  return best;
}

/* [LEAD v2.8] link Kit con leadId e vincolo (li usa il blocco /kit) */
function buildKitUrl(result: any, medium: string) {
  const params = new URLSearchParams();
  params.set('utm_source', 'report');
  params.set('utm_medium', medium);
  params.set('utm_campaign', 'kit_report');
  if (result?.leadId) params.set('lead', String(result.leadId));
  const v = getBindingKey(result);
  if (v) params.set('v', v);
  if (result?.metadata?.isTest) params.set('test', '1');
  return `https://davidedileo.it/kit?${params.toString()}`;
}

/* [CONSENSO + GA v2.8] GA4 solo dopo consenso esplicito.
   La scelta (si'/no) resta in localStorage: nessun dato personale. */
const GA4_ID = 'G-8F2VD8X89M';
const CONSENT_KEY = 'impulse_analytics_consent';

function readConsent(): 'yes' | 'no' | null {
  try {
    const v = localStorage.getItem(CONSENT_KEY);
    return v === 'yes' || v === 'no' ? v : null;
  } catch (e) {
    return null;
  }
}

function loadGA() {
  const w = window as any;
  if (w.__impulseGaLoaded) return;
  w.__impulseGaLoaded = true;
  w.dataLayer = w.dataLayer || [];
  w.gtag = function () { w.dataLayer.push(arguments); };
  const sc = document.createElement('script');
  sc.async = true;
  sc.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA4_ID;
  document.head.appendChild(sc);
  w.gtag('js', new Date());
  w.gtag('config', GA4_ID);
}

function track(name: string, params: Record<string, any> = {}) {
  try {
    const w = window as any;
    if (readConsent() === 'yes' && typeof w.gtag === 'function') {
      w.gtag('event', name, params);
    }
  } catch (e) {}
}

/* JSONP: evita problemi di CORS verso script.google.com.
   Risolve con il payload (gia' decodificato dall'url-encoding) o stringa vuota. */
function fetchEncodedResultById(id: string): Promise<string> {
  return new Promise(resolve => {
    const cbName = '__impulseGotPayload_' + Math.random().toString(36).slice(2);
    let done = false;
    const script = document.createElement('script');
 
    const cleanup = () => {
      try {
        delete (window as any)[cbName];
      } catch (e) {
        (window as any)[cbName] = undefined;
      }
      if (script.parentNode) script.parentNode.removeChild(script);
    };
 
    (window as any)[cbName] = (payload: string) => {
      done = true;
      /* [SFIDA] il ponte puo' rispondere con una stringa (CRM v2.2)
         o con {r, c} (CRM v2.3+: payload + sfida dichiarata). */
      let raw = '';
      let challenge = '';
      if (payload && typeof payload === 'object') {
        raw = payload.r ? String(payload.r) : '';
        challenge = payload.c ? String(payload.c) : '';
      } else {
        raw = payload ? String(payload) : '';
      }
      let decoded = '';
      try {
        decoded = raw ? decodeURIComponent(raw) : '';
      } catch (e) {
        decoded = raw || '';
      }
      cleanup();
      resolve({ encoded: decoded, challenge });
    };
 
    const url =
      SHORT_LINK_WEBAPP +
      '?id=' +
      encodeURIComponent(id) +
      '&callback=' +
      cbName;
    script.src = url;
 
    script.onerror = () => {
      if (!done) {
        cleanup();
        resolve({ encoded: '', challenge: '' });
      }
    };
 
    /* [FIX COOKIE v2.8.1] prima fetch senza cookie, poi JSONP di riserva */
    jsonpViaFetch(url, cbName).then(data => {
      if (data !== undefined) (window as any)[cbName](data);
      else if (!done) document.head.appendChild(script);
    });

    setTimeout(() => {
      if (!done) {
        cleanup();
        resolve({ encoded: '', challenge: '' });
      }
    }, 12000);
  });
}
 
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
 
    spiderDims: (state.processedDims || []).map((d: any) => ({
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

  /* [UTM v2.8] leadId anche in query: la pagina Review lo legge da li'
     e resiste ai clic sulle ancore interne (#request-review) */
  const leadIdQ = result?.leadId || '';
  if (leadIdQ) params.set('leadId', String(leadIdQ));
  const vincolo = getBindingKey(result);
  if (vincolo) params.set('v', vincolo);

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
        'Hai indicato che una decisione importante è una priorità adesso. La Strategic Review trasforma questa diagnosi nell’ordine operativo dei prossimi 30-60 giorni: cosa correggere prima, cosa non scalare ancora, con i tuoi numeri.',
      button: 'Prenota ora la Strategic Review'
    };
  }
 
  if (!Number.isNaN(level) && level === 2) {
    return {
      kicker: 'STRATEGIC REVIEW',
      title: 'Trasforma la diagnosi in ordine operativo.',
      body:
        'Hai indicato una decisione importante nei prossimi 6-12 mesi. L’ordine degli interventi determina con quale forza ci arriverai. Una sessione di lavoro sul tuo caso: priorità, sequenza, prossime decisioni.',
      button: 'Prenota la Strategic Review'
    };
  }
 
  return {
    kicker: 'QUANDO SARAI PRONTO',
    title: 'Il punto di partenza è già identificato.',
    body:
      'Questa diagnosi resta valida nel tempo. Se vuoi trasformarla in una sequenza operativa con una sessione di lavoro sul tuo caso, la Strategic Review è il passo successivo.',
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
  const [shareCopied, setShareCopied] = useState(false);
  const [consent, setConsent] = useState<'yes' | 'no' | null>(() => readConsent());

  /* [CONSENSO + GA v2.8] */
  useEffect(() => {
    if (consent === 'yes') loadGA();
  }, [consent]);

  const chooseConsent = (v: 'yes' | 'no') => {
    try { localStorage.setItem(CONSENT_KEY, v); } catch (e) {}
    setConsent(v);
    if (v === 'yes') {
      loadGA();
      if (result) {
        setTimeout(() => track('report_view', { vincolo: getBindingKey(result), is_test: result?.metadata?.isTest ? 'yes' : 'no' }), 300);
      }
    }
  };

  useEffect(() => {
    if (step === 'summary' && result) {
      document.title = 'Il tuo vincolo: ' + (DIMENSION_LABELS[getBindingKey(result)] || '') + ' — IMPULSE';
      track('report_view', { vincolo: getBindingKey(result), is_test: result?.metadata?.isTest ? 'yes' : 'no' });
    }
  }, [step, result]);
 
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
 
    /* Rende il report da un payload "result=" (codificato base64). */
    const renderFromEncoded = async (encodedResult: string, challenge?: string): Promise<boolean> => {
      try {
        setStep('loading');
        const parsed = decodeResultPayload(encodedResult);
 
        if (!parsed || !isValidParsedResult(parsed)) {
          console.error('Validation failed', parsed);
          setStep('error');
          return false;
        }
 
        const leadId = getLeadIdFromParsed(parsed);
        const intentLevel = getIntentLevelFromParsed(parsed);
        const stagingScore = getStagingScoreFromParsed(parsed);
 
        const ansStr = typeof (parsed as any).ans === "string" ? (parsed as any).ans : null;
        /* [SERVER-SIDE v2] stato diagnostico + fetta testuale: tutto dal server */
        const assembled = await fetchAssembledContent(
          parsed.overall, parsed.dimensions, ansStr,
          parsed.bindingConstraint, intentLevel, stagingScore
        );
        const state = (assembled && assembled.state) ? assembled.state : {};
 
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

        (enrichedResult as any).ans = ansStr;

        /* [SFIDA] parole del lead, arrivano SOLO dal ponte ?id= (mai
           dall'URL condivisibile: privacy by design) */
        (enrichedResult as any).challenge =
          challenge && String(challenge).trim() ? String(challenge).trim().slice(0, 300) : null;
 
        console.log('Parsed report leadId:', leadId);
        console.log('Enriched report result:', enrichedResult);
 
        (enrichedResult as any).assembled = assembled;

        setResult(enrichedResult);
        setStep('summary');
        return true;
      } catch (e) {
        console.error('Failed to decode result parameter', e);
        setStep('error');
        return false;
      }
    };
 
    const encodedResult = urlParams.get('result');
 
    if (encodedResult) {
      renderFromEncoded(encodedResult);
      return;
    }
 
    /* [LINK CORTO] ?id=LEADID -> recupera il payload dal ponte e renderizza.
       Resta in 'loading' (spinner) finche' il JSONP non risponde. */
    const shortId = urlParams.get('id');
 
    if (shortId) {
      fetchEncodedResultById(shortId).then(({ encoded, challenge }: any) => {
        if (encoded) {
          renderFromEncoded(encoded, challenge);
        } else {
          console.error('Short link: payload non trovato per id', shortId);
          setStep('error');
        }
      });
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
 
  const handleNext = async (currentAnswers: Record<string, any> = answers) => {
    if (currentIdx < QUESTIONS.length - 1) {
      setCurrentIdx(currentIdx + 1);
      return;
    }
 
    const finalResult = calculateScorecardResult(currentAnswers, user);
 
    const intentLevel = getIntentLevelFromResult(finalResult);
    const stagingScore = getStagingScoreFromResult(finalResult);
 
    const assembled = await fetchAssembledContent(
      finalResult.overall, finalResult.dimensions, null,
      (finalResult as any).bindingConstraint, intentLevel, stagingScore
    );
    const state = (assembled && assembled.state) ? assembled.state : {};
 
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
 
    (enrichedResult as any).assembled = assembled;
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
      track('pdf_download', { vincolo: getBindingKey(result) });
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
 
    const assembled = await fetchAssembledContent(
      testResult.overall, testResult.dimensions, null,
      (testResult as any).bindingConstraint, intentLevel, stagingScore
    );
    const state = (assembled && assembled.state) ? assembled.state : {};
 
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
 
    (enrichedTestResult as any).assembled = assembled;
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
    <div className="min-h-screen bg-[#FBF9F3] flex flex-col items-center p-0 sm:p-4 font-sans text-gray-900">
      <div className="bg-white p-5 sm:p-8 rounded-none sm:shadow-sm border-0 sm:border sm:border-gray-200 max-w-2xl w-full">
        <div className="flex justify-between items-center mb-8 border-b pb-4">
          <h1 className="text-2xl font-bold tracking-tight text-[#0B1928]">
            IMPULSE Scorecard
          </h1>
 
          <div className="text-sm text-gray-500 tracking-wider">
            {step === 'info' && '1/3 PROFILE'}
            {step === 'questions' && '2/3 ASSESSMENT'}
            {step === 'summary' && 'DIAGNOSI'}
          </div>
        </div>
 
        {step === 'loading' && (
          <div className="text-center py-20 text-gray-500">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0B1928] mx-auto mb-4"></div>
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
                className="mt-6 text-sm text-[#0B1928] underline"
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
                className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-[#0B1928] outline-none"
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
                className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-[#0B1928] outline-none"
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
                className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-[#0B1928] outline-none"
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
              className="mt-6 w-full bg-[#0B1928] text-white font-medium py-3 px-6 rounded transition hover:bg-[#13273B]"
            >
              Inizia Scorecard
            </button>
 
            {SHOW_TESTS && (
              <div className="mt-12 pt-6 border-t border-gray-100">
                <p className="text-xs text-gray-400 mb-4 text-center">
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
            <div className="mb-6 flex justify-between items-center text-xs text-gray-400 uppercase">
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
                    className={`flex-1 py-4 text-lg font-medium rounded-none border-2 transition ${
                      answers[currentQuestion.id] === false
                        ? 'bg-[#0B1928] text-white border-gray-900'
                        : 'bg-white text-gray-600 border-gray-200 hover:border-gray-500'
                    }`}
                  >
                    No
                  </button>
 
                  <button
                    type="button"
                    onClick={() => handleYesNo(true)}
                    className={`flex-1 py-4 text-lg font-medium rounded-none border-2 transition ${
                      answers[currentQuestion.id] === true
                        ? 'bg-[#0B1928] text-white border-[#0B1928]'
                        : 'bg-white text-gray-600 border-gray-200 hover:border-gray-500 hover:bg-[#F5EDD8]'
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
                      className={`block w-full text-left px-5 py-4 text-base font-medium rounded-none border-2 transition ${
                        answers[currentQuestion.id] === opt
                          ? 'bg-[#0B1928] text-white border-[#0B1928]'
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
                    className="w-full mt-4 bg-[#0B1928] text-white font-medium py-3 px-6 rounded transition disabled:opacity-50"
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
                    className="bg-[#0B1928] text-white py-2 px-6 rounded text-sm hover:bg-[#13273B] transition"
                  >
                    Avanti →
                  </button>
                )}
            </div>
 
            <div className="w-full bg-gray-100 h-2 rounded overflow-hidden mt-4">
              <div
                className="bg-[#0B1928] h-full transition-all duration-300"
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
            {/* [VINCOLO v2.8] il vincolo e' il titolo: e' la promessa dello scorecard */}
            <div className="text-center mb-8">
              <p className="text-xs font-bold tracking-widest text-[#B88A2A] mb-3">
                IL TUO VINCOLO PRINCIPALE
              </p>
              <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-[#0B1928]">
                {DIMENSION_LABELS[getBindingKey(result)] || 'Il tuo vincolo'}
              </h2>
              <p className="text-sm text-gray-500 mt-3">
                &Egrave; la dimensione che oggi limita di pi&ugrave; la prossima fase del business.
              </p>
            </div>
 
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 p-6 bg-[#FBF9F3] rounded-none text-center border border-gray-100 mb-6">
              <div className="flex flex-col justify-center">
                <p className="text-xs text-gray-500 tracking-wider mb-2">
                  PUNTEGGIO
                </p>
                <p className="text-lg md:text-xl font-bold break-words leading-tight">
                  {result.overall} / 100
                </p>
              </div>
 
              <div className="flex flex-col justify-center">
                <p className="text-xs text-gray-500 tracking-wider mb-2">
                  FASCIA
                </p>
                <p className="text-lg md:text-xl font-bold break-words leading-tight">
                  {result.fascia}
                </p>
              </div>
 
              <div className="flex flex-col justify-center">
                <p className="text-xs text-gray-500 tracking-wider mb-2">
                  STAGE
                </p>
                <p className="text-lg md:text-xl font-bold break-words leading-tight">
                  {result.stage}
                </p>
              </div>
 
              <div className="flex flex-col justify-center">
                <p className="text-xs text-gray-500 tracking-wider mb-2">
                  VINCOLO
                </p>
                <p className="text-lg md:text-xl font-bold break-words leading-tight">
                  {DIMENSION_LABELS[getBindingKey(result)] || '-'}
                </p>
              </div>
            </div>
 
            {result.diagnosticPattern ? (
              <div className="p-5 bg-[#FBF9F3] rounded-none border border-gray-100">
                <p className="text-xs text-gray-500 tracking-wider mb-2">
                  PATTERN DIAGNOSTICO
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
              <div className="p-5 bg-red-50 rounded-none border border-red-100">
                <p className="text-xs text-red-500 tracking-wider mb-2">
                  SEGNALE DI RISCHIO
                </p>
                <p className="text-lg font-bold text-red-700 mb-2">
                  {result.riskFlags[0].title}
                </p>
                <p className="text-sm text-red-700 leading-relaxed">
                  {result.riskFlags[0].body}
                </p>
              </div>
            ) : null}
 
            {/* [SFIDA] eco delle parole del lead (solo flusso ?id=) */}
            {(result as any).challenge ? (
              <div className="p-5 bg-[#0B1928] rounded-none">
                <p className="text-xs text-[#DFBE6F] font-semibold tracking-wider mb-2">
                  LA SFIDA CHE HAI DICHIARATO
                </p>
                <p className="text-base font-bold text-[#F4EFE4] leading-relaxed">
                  &laquo;{(result as any).challenge}&raquo;
                </p>
                <p className="text-sm text-[#ADB9C6] mt-2 leading-relaxed">
                  Parole tue. Questa diagnosi ti dice da dove cominciare a scioglierla: dal vincolo, non da tutto insieme.
                </p>
              </div>
            ) : null}

            {/* [ANSWERS v3] le 3 risposte che pesano di più — answer-level */}
            {(() => {
              const picks = ((result as any).assembled?.costlyAnswers) || [];
              if (!picks.length) return null;
              return (
                <div className="p-5 bg-white rounded-none border-2 border-[#13273B]">
                  <p className="text-xs text-[#8F6B20] font-semibold tracking-wider mb-3">
                    LE RISPOSTE CHE TI COSTANO DI PI&Ugrave;
                  </p>
                  {picks.map((pk) => (
                    <div key={pk.id} className="mb-4 last:mb-0">
                      <p className="text-sm font-bold text-gray-900">{pk.text}</p>
                      <p className="text-sm italic text-[#57626E] mt-1">Hai risposto: &laquo;{pk.chosenText}&raquo;</p>
                      <p className="text-sm text-gray-600 mt-1 leading-relaxed">{pk.why}</p>
                    </div>
                  ))}
                </div>
              );
            })()}

            {/* [ANSWERS v3] la prima mossa (48h) + ponte Kit */}
            {(result as any).assembled?.firstMove ? (
              <div className="p-5 bg-[#F5EDD8] rounded-none border-2 border-[#B88A2A]">
                <p className="text-xs text-[#8F6B20] font-semibold tracking-wider mb-2">
                  LA TUA PRIMA MOSSA &mdash; ENTRO 48 ORE
                </p>
                <p className="text-sm text-gray-700 leading-relaxed">
                  {(result as any).assembled.firstMove}
                </p>
                <p className="text-sm text-gray-600 mt-3">
                  &Egrave; la prima di tre. Le altre due &mdash; e l&rsquo;ordine giusto &mdash; sono il metodo:{' '}
                  <a
                    href={buildKitUrl(result, 'web')}
                    onClick={() => track('click_kit', { from: 'report_first_move', vincolo: getBindingKey(result) })}
                    className="font-bold text-[#8F6B20] underline"
                  >
                    Priority Map Kit &rarr;
                  </a>
                </p>
              </div>
            ) : null}

            {/* [ANSWERS v3] cosa distingue chi passa oltre + ricalibrazione */}
            {(result as any).assembled?.stageNext ? (
              <div className="p-5 bg-[#FBF9F3] rounded-none border border-gray-200">
                <p className="text-xs text-gray-500 tracking-wider mb-2">
                  COSA DISTINGUE CHI PASSA OLTRE
                </p>
                <p className="text-sm text-gray-600 leading-relaxed">{(result as any).assembled.stageNext}</p>
                <p className="text-xs text-gray-500 mt-3">
                  Ricalibrazione consigliata: <span className="font-bold text-gray-700">{(result as any).assembled?.retestDate}</span> &mdash; rifai lo scorecard e confronta.
                </p>
              </div>
            ) : null}

            {result.leadId ? (
              <div className="text-center text-xs text-gray-400">
                Report ID: {result.leadId}
              </div>
            ) : null}
 
            {/* [V2.5] CTA Strategic Review on-page, calibrata su intent */}
            {(() => {
              const cta = getReviewCta(result);
              const reviewUrl = buildStrategicReviewUrl(result);
              return (
                <div className="bg-[#0B1928] rounded-none p-6 mt-2">
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
                    onClick={() => track('click_review', { from: 'report', vincolo: getBindingKey(result) })}
                    className="inline-block bg-[rgb(184,138,42)] hover:bg-[#B88A2A] text-gray-900 font-bold py-3 px-6 rounded transition"
                  >
                    {cta.button}
                  </a>
                  {/* [CTA v2.8] alternativa fai-da-te sempre visibile */}
                  <p className="text-sm text-gray-300 mt-4">
                    Preferisci partire da solo?{' '}
                    <a
                      href={buildKitUrl(result, 'web_cta')}
                      onClick={() => track('click_kit', { from: 'report_cta', vincolo: getBindingKey(result) })}
                      className="font-bold text-[#DFBE6F] underline"
                    >
                      Priority Map Kit, &euro;47 &rarr;
                    </a>
                  </p>
                </div>
              );
            })()}
 
            <button
              type="button"
              onClick={handleDownloadPDF}
              className="w-full bg-[#C9A24B] hover:bg-[rgb(192,155,35)] text-gray-900 font-bold py-4 px-6 rounded mt-8 mb-4 transition"
            >
              Scarica Report PDF
            </button>

            {/* [SHARE] riquadro-condivisione: il passaparola del metodo */}
            <div className="mt-6 p-5 bg-[#0B1928] rounded-none text-center">
              <p className="text-xs text-[#DFBE6F] font-semibold tracking-wider mb-2">
                CONOSCI UN FOUNDER CHE DOVREBBE VEDERLO?
              </p>
              <p className="text-sm text-[#ADB9C6] mb-4">
                Ogni business ha un vincolo. Lo scorecard &egrave; gratuito e il report arriva subito.
              </p>
              <button
                onClick={() => {
                  const url = 'https://davidedileo.it/scorecard?utm_source=share&utm_medium=report&utm_campaign=passaparola';
                  const nav: any = navigator;
                  track('share', { vincolo: getBindingKey(result) });
                  if (nav.share) {
                    nav.share({ title: 'IMPULSE Business Readiness', text: 'Un business cresce alla velocit\u00e0 del suo vincolo. Scopri il tuo:', url }).catch(() => {});
                  } else if (nav.clipboard && nav.clipboard.writeText) {
                    nav.clipboard.writeText(url).then(() => setShareCopied(true));
                  }
                }}
                className="px-6 py-3 bg-[#C9A24B] text-[#0B1928] font-bold text-sm rounded-none"
              >
                {shareCopied ? 'Link copiato \u2713' : 'Condividi lo scorecard'}
              </button>
            </div>
 
            {SHOW_TESTS && (
              <button
                type="button"
                onClick={() => {
                  setStep('info');
                  setAnswers({});
                  setResult(null);
                }}
                className="w-full bg-white hover:bg-[#FBF9F3] border border-gray-200 text-gray-600 font-medium py-3 px-6 rounded transition"
              >
                Nuovo Test, Dev Only
              </button>
            )}
          </div>
        )}
      </div>

      {/* [CONSENSO v2.8] Accetta e Rifiuta con la stessa evidenza */}
      {step === 'summary' && consent === null ? (
        <div className="fixed bottom-0 left-0 right-0 bg-[#0B1928] text-white p-4 z-50">
          <div className="max-w-2xl mx-auto flex flex-col sm:flex-row sm:items-center gap-3">
            <p className="text-sm text-gray-200 flex-1">
              Uso cookie analitici (Google Analytics) solo per capire come migliorare il report. Nessuna pubblicit&agrave;.{' '}
              <a href="https://davidedileo.it/cookie-policy" target="_blank" rel="noreferrer" className="underline text-[#DFBE6F]">
                Cookie policy
              </a>
            </p>
            <div className="flex gap-2">
              <button type="button" onClick={() => chooseConsent('no')} className="flex-1 sm:flex-none border border-white px-5 py-2 font-bold text-sm">
                Rifiuta
              </button>
              <button type="button" onClick={() => chooseConsent('yes')} className="flex-1 sm:flex-none border border-white px-5 py-2 font-bold text-sm">
                Accetta
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
 
