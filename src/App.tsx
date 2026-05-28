/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { generateIMPULSEReport } from './pdf';
import { QUESTIONS, Question } from './questions';
import { calculateScorecardResult } from './scoring';
import { computeDiagnosticState } from './diagnostics';

const SHOW_TESTS = (import.meta as any).env.DEV || (import.meta as any).env.VITE_SHOW_TESTS === 'true';

export default function App() {
  const [step, setStep] = useState<'loading' | 'error' | 'info' | 'questions' | 'summary'>('loading');
  const [user, setUser] = useState({ name: '', company: '', email: '' });
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [result, setResult] = useState<any>(null);
  const [currentIdx, setCurrentIdx] = useState(0);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const encodedResult = urlParams.get('result');

    if (encodedResult) {
      try {
        const decodedString = decodeURIComponent(escape(atob(encodedResult)));
        const parsed = JSON.parse(decodedString);
        
        if (parsed) {
          const dims = parsed.dimensions;
          const requiredDims = ['clarity', 'acquisition', 'operations', 'margins', 'asset', 'readiness'];
          
          const isValid = 
            typeof parsed.name === 'string' && parsed.name.trim() !== '' &&
            typeof parsed.overall === 'number' && parsed.overall >= 0 && parsed.overall <= 100 &&
            dims &&
            requiredDims.every(d => 
              dims[d] && 
              typeof dims[d].score === 'number' && dims[d].score >= 0 && dims[d].score <= 10 &&
              typeof dims[d].yes === 'number' && dims[d].yes >= 0 && dims[d].yes <= 7
            );

          if (isValid) {
            // Compute full diagnostic state on the Netlify side
            const state = computeDiagnosticState(parsed.overall, parsed.dimensions);
            
            setResult({
  name: parsed.name,
  company: parsed.company || '',
  email: parsed.email || '',
  metadata: parsed.metadata || {},
  overall: parsed.overall,

  fascia: state.fascia,

  profile: state.profile,
  profileData: state.profileData,

  stage: state.stageLabel,
  stageLabel: state.stageLabel,

  roadmapStage: state.roadmapStage,
  roadmapInfo: state.roadmapInfo,

  dimensions: parsed.dimensions,

  strengths: state.forze,
  priorities: state.priorita,
  forze: state.forze,
  priorita: state.priorita,

  processedDims: state.processedDims,
  stageInfo: state.stageInfo,

  spiderDims: state.processedDims.map((d: any) => ({ label: d.label, score: d.score }))
});
            setStep('summary');
          } else {
            console.error("Validation failed", parsed);
            setStep('error');
          }
        } else {
          setStep('error');
        }
      } catch (e) {
        console.error("Failed to decode result parameter", e);
        setStep('error');
      }
    } else {
      if (SHOW_TESTS) {
        setStep('info'); // Fallback to DEV flow
      } else {
        setStep('error');
      }
    }
  }, []);

  const handleStart = (e: React.FormEvent) => {
    e.preventDefault();
    setStep('questions');
    setCurrentIdx(0);
  };

  const currentQuestion = QUESTIONS[currentIdx];

  const handleSelectOption = (idx: number, opt: string) => {
    const updatedAnswers = { ...answers, [currentQuestion.id]: opt };
    setAnswers(updatedAnswers);
  };

  const handleYesNo = (val: boolean) => {
    const updatedAnswers = { ...answers, [currentQuestion.id]: val };
    setAnswers(updatedAnswers);
    handleNext(updatedAnswers);
  };

  const handleNext = (currentAnswers = answers) => {
    if (currentIdx < QUESTIONS.length - 1) {
      setCurrentIdx(currentIdx + 1);
    } else {
      const finalResult = calculateScorecardResult(currentAnswers, user);
      setResult(finalResult);
      setStep('summary');
    }
  };

  const handlePrev = () => {
    if (currentIdx > 0) {
      setCurrentIdx(currentIdx - 1);
    }
  };

  const handleDownloadPDF = async () => {
    if (result) {
      console.log("Report result before PDF:", result);
      await generateIMPULSEReport(result);
    }
  };

  const runTest = async (label: string, mockAnswers: Record<string, any>, mockUser: any) => {
    const testResult = calculateScorecardResult(mockAnswers, mockUser);
    setResult(testResult);
    setStep('summary');
    await generateIMPULSEReport(testResult, label);
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
      Q1: "Founder o co-founder",
      Q2: "€500k–€1M"
    };
    
    // Simulate passing count
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
      label: 'TEST 1 — CLARITY GAP',
      user: { name: "Anna Rossi", company: "Rossi Studio", email: "anna@example.com" },
      answers: makeAnswers(2.8, 5.7, 5.7, 5.7, 5.7, 4.3)
    },
    {
      label: 'TEST 2 — GROWTH ENGINE GAP',
      user: { name: "Marco Bianchi", company: "Bianchi Growth", email: "marco@example.com" },
      answers: makeAnswers(5.7, 4.3, 5.7, 4.3, 5.7, 5.7) // Acquisition & Margins lowest
    },
    {
      label: 'TEST 3 — OPERATIONAL GAP',
      user: { name: "Luca Verdi", company: "Verdi Industries", email: "luca@example.com" },
      answers: makeAnswers(8.1, 8.2, 5.1, 7.0, 4.8, 6.4) // Operations and Asset lowest
    },
    {
      label: 'TEST 4 — READINESS GAP',
      user: { name: "Laura Neri", company: "Neri Advisory", email: "laura@example.com" },
      answers: makeAnswers(8.2, 6.2, 6.2, 5.7, 5.7, 2.8) // Readiness is lowest
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center p-4 font-sans text-gray-900">
      <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200 max-w-2xl w-full">
        <div className="flex justify-between items-center mb-8 border-b pb-4">
          <h1 className="text-2xl font-bold tracking-tight text-[rgb(39,112,143)]">IMPULSE Scorecard</h1>
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
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900">Errore di caricamento</h2>
            <p className="text-gray-600">
              Non riusciamo a generare il report perché i dati della scorecard sono incompleti. Torna alla scorecard e riprova.
            </p>
            {SHOW_TESTS && (
              <button onClick={() => setStep('info')} className="mt-6 text-sm text-[rgb(39,112,143)] underline">
                (Dev mode: Show manual scorecard)
              </button>
            )}
          </div>
        )}

        {step === 'info' && SHOW_TESTS && (
          <form onSubmit={handleStart} className="space-y-4">
            <p className="text-gray-600 mb-6 text-sm">
              Scopri dove il valore del tuo business è bloccato — e quale leva muovere prima. Compila il form per iniziare.
            </p>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
              <input required type="text" className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-[rgb(39,112,143)] outline-none" value={user.name} onChange={e => setUser({...user, name: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Azienda</label>
              <input required type="text" className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-[rgb(39,112,143)] outline-none" value={user.company} onChange={e => setUser({...user, company: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input required type="email" className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-[rgb(39,112,143)] outline-none" value={user.email} onChange={e => setUser({...user, email: e.target.value})} />
            </div>
            <button type="submit" className="mt-6 w-full bg-[rgb(39,112,143)] text-white font-medium py-3 px-6 rounded transition hover:bg-[rgb(30,85,110)]">Inizia Scorecard</button>
            
            {SHOW_TESTS && (
              <div className="mt-12 pt-6 border-t border-gray-100">
                <p className="text-xs text-gray-400 font-mono mb-4 text-center">E2E TEST PIPELINE (DEV ONLY)</p>
                <div className="grid grid-cols-2 gap-2">
                  {testCases.map((tc, i) => (
                    <button key={i} type="button" onClick={() => runTest(tc.label, tc.answers, tc.user)} className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 rounded">
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
               <span>DOMANDA {currentIdx + 1} DI {QUESTIONS.length}</span>
               {currentQuestion.dimension && <span>{currentQuestion.dimension}</span>}
            </div>

            <div className="border-b border-gray-100 pb-8 min-h-[160px]">
              <p className="font-semibold text-gray-900 text-xl leading-snug mb-8">
                {currentQuestion.text}
              </p>
              
              {currentQuestion.type === 'yesno' ? (
                <div className="flex gap-4">
                  <button
                    onClick={() => handleYesNo(false)}
                    className={`flex-1 py-4 text-lg font-medium rounded-lg border-2 transition ${answers[currentQuestion.id] === false ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-500'}`}
                  >
                    No
                  </button>
                  <button
                    onClick={() => handleYesNo(true)}
                    className={`flex-1 py-4 text-lg font-medium rounded-lg border-2 transition ${answers[currentQuestion.id] === true ? 'bg-[rgb(39,112,143)] text-white border-[rgb(39,112,143)]' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-500 hover:bg-[rgb(240,248,255)]'}`}
                  >
                    Sì
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {currentQuestion.options?.map((opt, i) => (
                    <button
                      key={i}
                      onClick={() => handleSelectOption(i, opt)}
                      className={`block w-full text-left px-5 py-4 text-base font-medium rounded-lg border-2 transition ${answers[currentQuestion.id] === opt ? 'bg-[rgb(39,112,143)] text-white border-[rgb(39,112,143)]' : 'bg-white text-gray-700 border-gray-200 hover:border-gray-400'}`}
                    >
                      {opt}
                    </button>
                  ))}
                  <button 
                    onClick={handleNext}
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
                onClick={handlePrev}
                disabled={currentIdx === 0}
                className="text-gray-500 hover:text-gray-900 disabled:opacity-30 flex items-center gap-2"
              >
                ← Indietro
              </button>
              
              {currentQuestion.type === 'yesno' && answers[currentQuestion.id] !== undefined && (
                <button 
                  onClick={handleNext}
                  className="bg-[rgb(39,112,143)] text-white py-2 px-6 rounded text-sm hover:bg-[rgb(30,85,110)] transition"
                >
                  Avanti →
                </button>
              )}
            </div>
            
            <div className="w-full bg-gray-100 h-2 rounded overflow-hidden mt-4">
               <div className="bg-[rgb(39,112,143)] h-full transition-all duration-300" style={{ width: `${Math.round(((currentIdx + 1) / QUESTIONS.length) * 100)}%` }}></div>
            </div>
          </div>
        )}

        {step === 'summary' && result && (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold tracking-tight text-[rgb(39,112,143)] text-center mb-8">Diagnosi Elaborata</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 p-6 bg-gray-50 rounded-lg text-center border border-gray-100 mb-6">
              <div className="flex flex-col justify-center">
                <p className="text-xs text-gray-500 font-mono tracking-wider mb-2">SCORE</p>
                <p className="text-lg md:text-xl font-bold break-words leading-tight">{result.overall} / 100</p>
              </div>
              <div className="flex flex-col justify-center">
                <p className="text-xs text-gray-500 font-mono tracking-wider mb-2">FASCIA</p>
                <p className="text-lg md:text-xl font-bold break-words leading-tight">{result.fascia}</p>
              </div>
              <div className="flex flex-col justify-center">
                <p className="text-xs text-gray-500 font-mono tracking-wider mb-2">STAGE</p>
                <p className="text-lg md:text-xl font-bold break-words leading-tight">{result.stage}</p>
              </div>
              <div className="flex flex-col justify-center">
                <p className="text-xs text-gray-500 font-mono tracking-wider mb-2">PROFILE</p>
                <p className="text-lg md:text-xl font-bold break-words leading-tight">{result.profile}</p>
              </div>
            </div>

            <button 
              onClick={handleDownloadPDF}
              className="w-full bg-[rgb(212,175,55)] hover:bg-[rgb(192,155,35)] text-gray-900 font-bold py-4 px-6 rounded mt-8 mb-4 transition"
            >
              Scarica Report PDF
            </button>
            
            {SHOW_TESTS && (
              <button 
                onClick={() => { setStep('info'); setAnswers({}); setResult(null); }}
                className="w-full bg-white hover:bg-gray-50 border border-gray-200 text-gray-600 font-medium py-3 px-6 rounded transition"
              >
                Nuovo Test (Dev Only)
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
