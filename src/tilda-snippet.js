/*
TILDA → GITHUB PAGES — CONTRATTO DI INTEGRAZIONE (v2)
=====================================================

⚠️ QUESTO FILE È DOCUMENTAZIONE, NON CODICE DA INCOLLARE.
La sorgente di verità dell'integrazione è il codice live su Tilda
(scorecard + result page). Questo file descrive il contratto del
payload così che chi legge il repo capisca cosa arriva all'app React.

STORIA: la versione precedente di questo file descriveva
l'architettura v1 (44 domande sì/no, yes 0-7, redirect immediato
a Netlify al submit, payload senza leadId/intent/staging).
Quell'architettura NON è più in uso.

ARCHITETTURA ATTUALE (v2)
-------------------------
1. L'utente completa le 33 domande su Tilda (scala 0-3, Q3-Q32
   scored + INTENT1 non scored) e compila il form contatti.
2. Tilda calcola overall, dimensioni, stagingScore e
   bindingConstraint IN LOCALE e mostra la pagina risultato
   INLINE su Tilda (non c'è redirect al submit).
3. In parallelo, Tilda invia il payload CRM ad Apps Script
   (Google Sheets).
4. Solo quando l'utente clicca "Scarica report PDF", la result
   page apre l'app React (GitHub Pages) in nuova scheda con il
   payload codificato in query string:

   URL = GITHUB_REPORT_URL + "?result=" +
         encodeURIComponent(btoa(unescape(encodeURIComponent(
           JSON.stringify(payload)))))

   GITHUB_REPORT_URL attuale nel codice live:
   https://horse12888.github.io/scorecard/
   (Se viene attivato un custom domain, aggiornarlo in UN SOLO
   posto nel codice Tilda e in questo file — non mantenere due URL.)

CONTRATTO DEL PAYLOAD (quello che App.tsx si aspetta e legge)
-------------------------------------------------------------
{
  leadId: "imp_YYYYMMDDHHMMSS_xxxxxx",   // generato da Tilda
  name: "...",                            // obbligatorio, non vuoto
  company: "...",
  email: "...",
  metadata: {
    leadId: "...",                        // ridondante, letto come fallback
    businessType: "...",                  // label di Q1
    revenueRange: "...",                  // label di Q2
    website: "...",
    phone: "...",
    assessmentVersion: "v2_scale_0_3",
    intentLevel: 0|1|2|3|null             // INTENT1, non scored
  },
  overall: 0-100,                         // intero
  dimensions: {
    clarity:     { score: 0-10, yes: 0-5 },
    acquisition: { score: 0-10, yes: 0-5 },
    operations:  { score: 0-10, yes: 0-5 },
    margins:     { score: 0-10, yes: 0-5 },
    asset:       { score: 0-10, yes: 0-5 },
    readiness:   { score: 0-10, yes: 0-5 }
  },
  stagingScore: 0-100,                    // score - penalità binding
  bindingConstraint: "clarity" | ... | "readiness"
}

NOTE SUL CONTRATTO
------------------
- "yes" in v2 = numero di risposte 3/3 nella dimensione (max 5,
  perché ogni dimensione ha 5 domande). In v1 era il numero di
  "sì" su 7. Il nome della colonna è stato mantenuto per
  retro-compatibilità; assessmentVersion disambigua.
  (La validazione in App.tsx accetta yes <= 7 per compatibilità
  con eventuali payload v1 ancora in circolazione.)
- intentLevel e stagingScore sono letti da App.tsx sia top-level
  sia da metadata (snake_case incluso): vedi
  getIntentLevelFromParsed / getStagingScoreFromParsed.
- L'app NON ricalcola overall/dimensioni: arricchisce il payload
  con computeDiagnosticState (fascia, profilo, stage, pattern,
  risk flags, priorità) e genera il PDF.
- Lo stage pubblico è calcolato su `overall`, NON su
  stagingScore (vedi commento in diagnostics.ts).

COSA NON FARE
-------------
- Non reintrodurre il redirect al submit: il risultato vive su
  Tilda; l'app GitHub serve al PDF.
- Non inviare le risposte grezze nel payload URL
  (INCLUDE_ANSWERS_IN_PAYLOAD = false nel codice Tilda).
- Non duplicare la logica di stage/profilo su Tilda oltre a
  quanto già allineato: diagnostics.ts è la fonte di verità
  per l'arricchimento.
*/
