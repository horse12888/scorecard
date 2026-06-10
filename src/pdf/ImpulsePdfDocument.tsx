import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
  Link
} from "@react-pdf/renderer";

/* ============================================================
   IMPULSE PDF DOCUMENT — v2.1 "Advisory Edition"
   Redesign editoriale in stile advisory/Big4:
   - Copertina scura con accenti gold (coerente con i blocchi
     CTA del funnel), pagine interne bianche
   - Sistema a righe sottili (hairline) al posto delle card
     arrotondate; gerarchia tipografica netta; sezioni numerate
   - Header e footer fissi con numerazione pagina automatica
     e dicitura di riservatezza
   - Disclaimer in copertina (coerente con la landing)

   ALLINEAMENTI vs versione precedente (reversibili):
   [N1] Nomi dimensioni in inglese (Clarity, Acquisition, ...)
        come nel resto del funnel; sottotitoli in italiano.
   [N2] normalizeStage allineato ai nomi usati in landing,
        result page e CRM (Foundation / Traction / ...).
        La vecchia mappa (Market Traction / Operating Stability /
        Value Architecture) è conservata in commento.
        NOTA: impulseKnowledge.ts usa ancora i vecchi label
        internamente — decidere quale naming vince a livello
        di funnel e allineare anche lì.
   [N3] Score in copertina: "56 /100" invece di "56%"
        (coerente con "su 100" su result page e landing).
   LOGICA DATI E ACCESSOR: INVARIATI.
============================================================ */

Font.registerHyphenationCallback((word) => [word]);

type DimensionKey =
  | "clarity"
  | "acquisition"
  | "operations"
  | "margins"
  | "asset"
  | "readiness";

type RiskFlag = {
  id?: string;
  title?: string;
  body?: string;
  severity?: "low" | "medium" | "high" | string;
};

type DiagnosticPattern = {
  profileStageKey?: string;
  profileStageTitle?: string;
  profileStageBody?: string;
  topGapPairKey?: string;
  topGapPairTitle?: string;
  topGapPairBody?: string;
  strategicWarning?: string;
  recommendedFocus?: string;
};

type IntentInsight = {
  level?: number | null;
  label?: string;
  body?: string;
};

type PdfResult = {
  leadId?: string;
  name?: string;
  company?: string;
  email?: string;
  metadata?: Record<string, any>;
  overall: number;
  fascia?: string;
  profile?: string;
  profileData?: any;
  stage?: string;
  stageLabel?: string;
  roadmapInfo?: any;
  stageInfo?: any;
  functionConstraints?: any[];
  dimensions: Record<DimensionKey, { score: number; yes: number }>;
  processedDims?: any[];
  priorities?: any[];
  priorita?: any[];
  strengths?: any[];
  forze?: any[];
  stagingScore?: number;
  bindingConstraint?: string;
  topGapPair?: any;
  diagnosticPattern?: DiagnosticPattern;
  riskFlags?: RiskFlag[];
  intentInsight?: IntentInsight;
  intentLevel?: number | null;
};

/* [N1] Nomi dimensione allineati al funnel (inglese = nome proprio
   del framework, come su landing, result page e CRM). */
const dimensionNames: Record<DimensionKey, string> = {
  clarity: "Clarity",
  acquisition: "Acquisition",
  operations: "Operations",
  margins: "Margins",
  asset: "Asset",
  readiness: "Readiness"
};

const dimensionShortCopy: Record<DimensionKey, string> = {
  clarity: "Offerta, cliente ideale, messaggio e pricing.",
  acquisition: "Canali, lead flow, vendita e qualità della domanda.",
  operations: "Processi, delivery, ownership e dipendenza dal founder.",
  margins: "Margini, cash flow, pricing e qualità economica.",
  asset: "Brand, dati, IP, contratti e valore trasferibile.",
  readiness: "Materiali, numeri, struttura e leggibilità esterna."
};

function safeText(value: any, fallback = "") {
  if (value === null || value === undefined) return fallback;
  return String(value);
}

/* [N2] Stage display allineato ai nomi del funnel.
   Vecchia mappa (per ripristino):
   TRACTION -> "Market Traction"
   STABILIZATION -> "Operating Stability"
   PRODUCTIZATION -> "Value Architecture" */
function normalizeStage(stage: string) {
  const map: Record<string, string> = {
    FOUNDATION: "Foundation",
    TRACTION: "Traction",
    MARKET_TRACTION: "Traction",
    "MARKET TRACTION": "Traction",
    STABILIZATION: "Stabilization",
    OPERATING_STABILITY: "Stabilization",
    "OPERATING STABILITY": "Stabilization",
    PRODUCTIZATION: "Productization",
    VALUE_ARCHITECTURE: "Productization",
    "VALUE ARCHITECTURE": "Productization",
    "SCALE READINESS": "Scale Readiness",
    SCALE_READINESS: "Scale Readiness"
  };

  return map[stage] || stage || "";
}

function getFirstName(name?: string) {
  const clean = safeText(name).trim();
  if (!clean) return "";
  return clean.split(" ")[0];
}

function getProfileTitle(result: PdfResult) {
  if (result.profileData?.title) return result.profileData.title;

  const profile = result.profile || "B";
  const map: Record<string, string> = {
    A: "Clarity Gap",
    B: "Growth Engine Gap",
    C: "Operational Gap",
    D: "Readiness Gap"
  };

  return map[profile] || "Operational Gap";
}

function getProfileBody(result: PdfResult) {
  return (
    result.profileData?.blocco ||
    "Il business ha trazione, ma il prossimo salto richiede più chiarezza, struttura e leggibilità operativa."
  );
}

function getStageInfo(result: PdfResult) {
  return result.roadmapInfo || result.stageInfo || {};
}

function getDimensionLabel(item: any) {
  const key = item?.key as DimensionKey;
  return dimensionNames[key] || item?.label || key || "";
}

function getPriorities(result: PdfResult) {
  const items = result.priorita || result.priorities || [];

  if (items.length > 0) return items.slice(0, 3);

  return Object.keys(result.dimensions)
    .map((key) => ({
      key,
      label: dimensionNames[key as DimensionKey],
      score: result.dimensions[key as DimensionKey].score,
      vincolo: dimensionShortCopy[key as DimensionKey],
      lavoro: "Chiarire il vincolo e trasformarlo in una sequenza operativa.",
      nonFare: "Non aumentare complessità prima di aver reso leggibile questa area."
    }))
    .sort((a, b) => Number(a.score) - Number(b.score))
    .slice(0, 3);
}

function getStrengths(result: PdfResult) {
  const items = result.forze || result.strengths || [];

  if (items.length > 0) return items.slice(0, 3);

  return Object.keys(result.dimensions)
    .map((key) => ({
      key,
      label: dimensionNames[key as DimensionKey],
      score: result.dimensions[key as DimensionKey].score
    }))
    .sort((a, b) => Number(b.score) - Number(a.score))
    .slice(0, 3);
}

function getProcessedDims(result: PdfResult) {
  if (result.processedDims && result.processedDims.length > 0) {
    return result.processedDims;
  }

  return (Object.keys(result.dimensions) as DimensionKey[]).map((key) => ({
    key,
    label: dimensionNames[key],
    subtitle: dimensionShortCopy[key],
    score: result.dimensions[key].score,
    yes: result.dimensions[key].yes,
    bracket:
      result.dimensions[key].score < 4
        ? "low"
        : result.dimensions[key].score >= 7
          ? "high"
          : "mid",
    vincolo: dimensionShortCopy[key],
    lavoro: "Rendere questa area più chiara, stabile e trasferibile.",
    nonFare: "Non scalare questa area prima di averne chiarito il vincolo."
  }));
}

function getBracketLabel(bracket?: string) {
  if (bracket === "high") return "FORZA";
  if (bracket === "low") return "VINCOLO";
  return "IN SVILUPPO";
}

function getScoreLabel(score: number) {
  if (score >= 7) return "FORZA";
  if (score < 4) return "VINCOLO";
  return "IN SVILUPPO";
}

function getDiagnosticPattern(result: PdfResult, priorities: any[]) {
  if (result.diagnosticPattern) {
    return result.diagnosticPattern;
  }

  const first = priorities[0];
  const second = priorities[1];

  const firstLabel = first ? getDimensionLabel(first) : "Vincolo principale";
  const secondLabel = second ? getDimensionLabel(second) : "Secondo vincolo";

  return {
    profileStageTitle: "Profilo e fase da leggere insieme",
    profileStageBody:
      "Il profilo mostra il tipo di vincolo. La fase mostra quanto il business è pronto a reggere il prossimo salto.",
    topGapPairTitle: `${firstLabel} + ${secondLabel}`,
    topGapPairBody:
      "Il pattern diagnostico nasce dalla combinazione delle due dimensioni più deboli. Queste aree vanno lette insieme prima di decidere cosa scalare.",
    strategicWarning:
      "Intervenire su una sola area può lasciare intatto il vincolo reale.",
    recommendedFocus:
      "Leggere insieme i primi due gap e trasformarli in una sequenza operativa."
  };
}

function getFallbackFocusFromPatternTitle(title?: string) {
  const clean = safeText(title).toLowerCase();

  if (clean.includes("clarity") && clean.includes("acquisition")) {
    return "Chiarire offerta, promessa, cliente ideale e canale prioritario prima di aumentare volume commerciale.";
  }

  if (clean.includes("clarity") && clean.includes("operations")) {
    return "Standardizzare offerta e delivery nello stesso intervento, così che ogni cliente non diventi un caso speciale.";
  }

  if (clean.includes("clarity") && clean.includes("margins")) {
    return "Ricollegare pricing, valore percepito, promessa e margine prima di aumentare acquisizione.";
  }

  if (clean.includes("clarity") && clean.includes("asset")) {
    return "Identificare quali parti del valore possono diventare asset documentabili, trasferibili o difendibili.";
  }

  if (clean.includes("clarity") && clean.includes("readiness")) {
    return "Rendere narrativa, numeri essenziali e materiali comprensibili anche senza spiegazione diretta del founder.";
  }

  if (clean.includes("acquisition") && clean.includes("operations")) {
    return "Stabilizzare processo commerciale e delivery prima di aumentare volume.";
  }

  if (clean.includes("acquisition") && clean.includes("margins")) {
    return "Misurare canali, conversione e qualità cliente in base al margine, non solo al volume.";
  }

  if (clean.includes("acquisition") && clean.includes("asset")) {
    return "Trasformare acquisizione, clienti e delivery in dati, case study, IP, community o contratti.";
  }

  if (clean.includes("acquisition") && clean.includes("readiness")) {
    return "Costruire una lettura chiara di domanda, funnel, conversione e qualità clienti.";
  }

  if (clean.includes("operations") && clean.includes("margins")) {
    return "Mappare delivery economics, tempi, costi nascosti e ownership.";
  }

  if (clean.includes("operations") && clean.includes("asset")) {
    return "Documentare processi, metodologie, asset e responsabilità.";
  }

  if (clean.includes("operations") && clean.includes("readiness")) {
    return "Separare ruoli, processi, numeri e materiali.";
  }

  if (clean.includes("margins") && clean.includes("asset")) {
    return "Capire quali offerte, clienti o canali creano margine e asset.";
  }

  if (clean.includes("margins") && clean.includes("readiness")) {
    return "Rendere margini, cash flow e unit economics leggibili.";
  }

  if (clean.includes("asset") && clean.includes("readiness")) {
    return "Documentare asset, evidenze, contratti, IP, dati, rischi e materiali esterni.";
  }

  return "Leggere insieme i primi due gap e trasformarli in una sequenza operativa.";
}

function getPdfRecommendedFocus(diagnosticPattern: DiagnosticPattern) {
  const focus = safeText(diagnosticPattern.recommendedFocus).trim();
  const warning = safeText(diagnosticPattern.strategicWarning).trim();

  if (!focus) {
    return getFallbackFocusFromPatternTitle(diagnosticPattern.topGapPairTitle);
  }

  if (warning && focus === warning) {
    return getFallbackFocusFromPatternTitle(diagnosticPattern.topGapPairTitle);
  }

  return focus;
}

function getPdfStrategicWarning(diagnosticPattern: DiagnosticPattern) {
  return safeText(
    diagnosticPattern.strategicWarning,
    "Intervenire su una sola area può lasciare intatto il vincolo reale."
  );
}

function getRiskFlags(result: PdfResult) {
  if (result.riskFlags && result.riskFlags.length > 0) {
    return result.riskFlags.slice(0, 4);
  }

  return [];
}

function getIntentInsight(result: PdfResult) {
  return (
    result.intentInsight || {
      label: "Intent non rilevato",
      body:
        "L'urgenza strategica non è disponibile in questa diagnosi. La priorità viene quindi calcolata da score, stage e vincoli dimensionali."
    }
  );
}

/* [V2.2 / P6] Chiusura calibrata su intentLevel (0-3).
   Fonte: result.intentLevel (top-level, da buildEnrichedResult)
   con fallback su intentInsight.level se presente.
   Se l'intent non è disponibile, nessuna riga aggiuntiva. */
function getIntentClosing(result: PdfResult): string | null {
  const raw =
    result.intentLevel ?? (result.intentInsight as any)?.level ?? null;
  const level = Number(raw);

  if (raw === null || raw === undefined || Number.isNaN(level)) {
    return null;
  }

  if (level >= 3) {
    return "Hai indicato una priorità immediata. In questa finestra, la sequenza conta più dello sforzo: gli interventi fatti nell'ordine sbagliato consumano la finestra senza prepararla.";
  }

  if (level === 2) {
    return "Hai indicato una decisione importante nei prossimi 6-12 mesi. L'ordine degli interventi determina con quale forza arriverai a quella decisione.";
  }

  return "L'urgenza dichiarata è bassa. La diagnosi resta valida: quando deciderai di muoverti, il punto di partenza è già identificato.";
}

function getReportDate() {
  try {
    return new Date().toLocaleDateString("it-IT", {
      day: "2-digit",
      month: "long",
      year: "numeric"
    });
  } catch (e) {
    return new Date().toISOString().slice(0, 10);
  }
}

/* ---------- Componenti ---------- */

function Bar({ score, accent }: { score: number; accent?: boolean }) {
  const width = Math.max(0, Math.min(100, score * 10));

  return (
    <View style={styles.barTrack}>
      <View
        style={[
          styles.barFill,
          accent ? styles.barFillAccent : null,
          { width: `${width}%` }
        ]}
      />
    </View>
  );
}

function PageHeader({ name }: { name?: string }) {
  return (
    <View style={styles.header} fixed>
      <Text style={styles.headerText}>
        IMPULSE SYSTEM — BUSINESS READINESS REPORT
      </Text>
      <Text style={styles.headerText}>{safeText(name).toUpperCase()}</Text>
    </View>
  );
}

function PageFooter() {
  return (
    <View style={styles.footer} fixed>
      <Text style={styles.footerText}>
        Riservato e confidenziale · IMPULSE System · davidedileo.it
      </Text>
      <Text
        style={styles.footerText}
        render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`}
      />
    </View>
  );
}

function SectionTitle({
  number,
  kicker,
  title,
  body
}: {
  number: string;
  kicker?: string;
  title: string;
  body?: string;
}) {
  return (
    <View style={styles.sectionTitleBlock}>
      <View style={styles.sectionNumberRow}>
        <Text style={styles.sectionNumber}>{number}</Text>
        <View style={styles.sectionNumberRule} />
        {kicker ? <Text style={styles.kicker}>{kicker}</Text> : null}
      </View>
      <Text style={styles.sectionTitle}>{title}</Text>
      {body ? <Text style={styles.sectionBody}>{body}</Text> : null}
      <View style={styles.sectionBottomRule} />
    </View>
  );
}

function FieldLabel({ children }: { children: any }) {
  return <Text style={styles.blockLabel}>{children}</Text>;
}

export function ImpulsePdfDocument({ result }: { result: PdfResult }) {
  const score = Number(result.overall || 0);
  const name = safeText(result.name);
  const company = safeText(result.company);
  const firstName = getFirstName(name);
  const profileTitle = getProfileTitle(result);
  const profileBody = getProfileBody(result);
  const stage = result.stageLabel || result.stage || "";
  const stageLabel = normalizeStage(stage);
  const stageInfo = getStageInfo(result);
  const priorities = getPriorities(result);
  const strengths = getStrengths(result);
  const dims = getProcessedDims(result);
  const bindingKey = result.bindingConstraint as DimensionKey | undefined;
  const fallbackBindingKey = priorities[0]?.key as DimensionKey | undefined;
  const displayedBindingKey = bindingKey || fallbackBindingKey;
  const functionConstraints = result.functionConstraints || [];
  const diagnosticPattern = getDiagnosticPattern(result, priorities);
  const pdfRecommendedFocus = getPdfRecommendedFocus(diagnosticPattern);
  const pdfStrategicWarning = getPdfStrategicWarning(diagnosticPattern);
  const riskFlags = getRiskFlags(result);
  const intentInsight = getIntentInsight(result);
  const reportDate = getReportDate();

  const strategicReviewBaseUrl = "https://davidedileo.it/strategic-review";
  const resolvedLeadId = result.leadId || result.metadata?.leadId || "";
  const strategicReviewUrl = resolvedLeadId
    ? `${strategicReviewBaseUrl}#leadId=${encodeURIComponent(resolvedLeadId)}`
    : strategicReviewBaseUrl;

  return (
    <Document
      title={`IMPULSE Report ${name || "Business"}`}
      author="IMPULSE System"
      subject="Business Readiness Report"
    >
      {/* ================= COPERTINA (scura) ================= */}
      <Page size="A4" style={styles.coverPage}>
        <View style={styles.coverTopRow}>
          <Text style={styles.coverWordmark}>IMPULSE SYSTEM</Text>
          <Text style={styles.coverWordmarkRight}>BUSINESS READINESS</Text>
        </View>
        <View style={styles.coverGoldRule} />

        <View style={styles.coverTitleBlock}>
          <Text style={styles.coverKicker}>DIAGNOSI OPERATIVA</Text>
          <Text style={styles.coverTitle}>Business Readiness Report</Text>
          <Text style={styles.coverPrepared}>
            Preparato per {name || "il tuo business"}
            {company ? ` · ${company}` : ""}
          </Text>
          <Text style={styles.coverMetaLine}>
            {reportDate}
            {resolvedLeadId ? `  ·  Report ID ${resolvedLeadId}` : ""}
          </Text>
        </View>

        <View style={styles.coverScoreRow}>
          <View style={styles.coverScoreBlock}>
            <Text style={styles.coverScoreLabel}>IMPULSE SCORE</Text>
            <View style={styles.coverScoreLine}>
              {/* [N3] "/100" e non "%" */}
              <Text style={styles.coverScoreNumber}>{score}</Text>
              <Text style={styles.coverScoreOutOf}>/100</Text>
            </View>
          </View>

          <View style={styles.coverConstraintBlock}>
            <Text style={styles.coverScoreLabel}>VINCOLO PRINCIPALE</Text>
            <Text style={styles.coverConstraintTitle}>{profileTitle}</Text>
            <Text style={styles.coverConstraintBody}>{profileBody}</Text>
          </View>
        </View>

        <View style={styles.coverMetaGrid}>
          <View style={styles.coverMetaItem}>
            <Text style={styles.coverMetaLabel}>FASCIA</Text>
            <Text style={styles.coverMetaValue}>{safeText(result.fascia)}</Text>
          </View>
          <View style={styles.coverMetaItem}>
            <Text style={styles.coverMetaLabel}>PROFILO</Text>
            <Text style={styles.coverMetaValue}>
              Profilo {safeText(result.profile)}
            </Text>
          </View>
          <View style={[styles.coverMetaItem, styles.coverMetaItemLast]}>
            <Text style={styles.coverMetaLabel}>STAGE</Text>
            <Text style={styles.coverMetaValue}>{stageLabel}</Text>
          </View>
        </View>

        <View style={styles.coverIndex}>
          <Text style={styles.coverIndexTitle}>CONTENUTI</Text>
          {[
            "Lo stage operativo",
            "Il pattern diagnostico",
            "Le 3 priorità operative",
            "La mappa delle 6 dimensioni",
            "Forze e vincoli",
            "I vincoli funzionali",
            "Profilo e prossimo passo"
          ].map((item, index) => (
            <View key={index} style={styles.coverIndexRow}>
              <Text style={styles.coverIndexNum}>
                {String(index + 2).padStart(2, "0")}
              </Text>
              <Text style={styles.coverIndexText}>{item}</Text>
            </View>
          ))}
        </View>

        <View style={styles.coverFooter}>
          <Text style={styles.coverFooterText}>
            Riservato e confidenziale. Questo report è una diagnosi operativa
            generata dalle risposte fornite. Non costituisce consulenza
            finanziaria, legale o fiscale.
          </Text>
        </View>
      </Page>

      {/* ================= 02 — STAGE ================= */}
      <Page size="A4" style={styles.page}>
        <PageHeader name={name} />
        <SectionTitle
          number="02"
          kicker="LO STAGE OPERATIVO"
          title={stageLabel}
          body={
            stageInfo.headline ||
            "Il business ha segnali utili, ma il prossimo salto richiede più struttura e leggibilità."
          }
        />

        <View style={styles.twoCol}>
          <View style={styles.colRuled}>
            <FieldLabel>RUOLO</FieldLabel>
            <Text style={styles.blockText}>
              {stageInfo.role || "Founder as system builder"}
            </Text>
          </View>
          <View style={styles.colRuled}>
            <FieldLabel>FOCUS</FieldLabel>
            <Text style={styles.blockText}>
              {stageInfo.strategicReviewFocus ||
                "Chiarire il vincolo principale e la sequenza operativa."}
            </Text>
          </View>
        </View>

        <View style={styles.ruledBlock}>
          <FieldLabel>VINCOLO DI STAGE</FieldLabel>
          <Text style={styles.longText}>
            {stageInfo.bottomLineConstraint ||
              "Il business deve rendere più leggibili sistemi, numeri, responsabilità e margini prima di aumentare complessità."}
          </Text>
        </View>

        {/* [V2.2 / P2] Costo dell'inazione: meccanismo, mai numeri.
            Render condizionale: se il campo non c'è, il layout resta v2.1. */}
        {stageInfo.costOfInaction ? (
          <View style={styles.ruledBlock}>
            <FieldLabel>IL COSTO DELL'INAZIONE</FieldLabel>
            <Text style={styles.longText}>{stageInfo.costOfInaction}</Text>
          </View>
        ) : null}

        <View style={styles.ruledBlock}>
          <Text style={styles.cardTitle}>Criteri per il prossimo salto</Text>
          {(stageInfo.graduationCriteria || [])
            .slice(0, 5)
            .map((item: string, index: number) => (
              <View key={index} style={styles.listRow}>
                <Text style={styles.listNumber}>
                  {String(index + 1).padStart(2, "0")}
                </Text>
                <Text style={styles.listText}>{item}</Text>
              </View>
            ))}
        </View>

        <View style={styles.warningBox} wrap={false}>
          <Text style={styles.warningTitle}>COSA NON SCALARE ANCORA</Text>
          <Text style={styles.warningText}>
            {stageInfo.nonFare ||
              stageInfo.troppoPresto ||
              "Non aumentare complessità prima di aver reso chiaro il vincolo operativo principale."}
          </Text>
        </View>

        <PageFooter />
      </Page>

      {/* ================= 03 — PATTERN ================= */}
      <Page size="A4" style={styles.page}>
        <PageHeader name={name} />
        <SectionTitle
          number="03"
          kicker="IL PATTERN DIAGNOSTICO"
          title={safeText(diagnosticPattern.topGapPairTitle, "Pattern diagnostico")}
          body={safeText(
            diagnosticPattern.topGapPairBody,
            "Il pattern diagnostico nasce dalla relazione tra le dimensioni più deboli del business."
          )}
        />

        <View style={styles.ruledBlock}>
          <FieldLabel>PROFILO + FASE</FieldLabel>
          <Text style={styles.patternTitle}>
            {safeText(
              diagnosticPattern.profileStageTitle,
              "Profilo e fase da leggere insieme"
            )}
          </Text>
          <Text style={styles.longText}>
            {safeText(
              diagnosticPattern.profileStageBody,
              "Il profilo mostra il tipo di vincolo. La fase mostra quanto il business è pronto a reggere il prossimo salto."
            )}
          </Text>
        </View>

        <View style={styles.focusBox}>
          <Text style={styles.focusLabel}>FOCUS RACCOMANDATO</Text>
          <Text style={styles.focusText}>{pdfRecommendedFocus}</Text>
        </View>

        <View style={styles.warningBox} wrap={false}>
          <Text style={styles.warningTitle}>ATTENZIONE STRATEGICA</Text>
          <Text style={styles.warningText}>{pdfStrategicWarning}</Text>
        </View>

        <View style={styles.ruledBlock}>
          <FieldLabel>INTENT</FieldLabel>
          <Text style={styles.patternTitle}>
            {safeText(intentInsight.label, "Intent non rilevato")}
          </Text>
          <Text style={styles.longText}>
            {safeText(
              intentInsight.body,
              "L'urgenza strategica non è disponibile in questa diagnosi."
            )}
          </Text>
        </View>

        {riskFlags.length > 0 ? (
          <View style={styles.ruledBlock}>
            <Text style={styles.cardTitle}>Risk flags principali</Text>
            {riskFlags.map((risk: RiskFlag, index: number) => (
              <View key={risk.id || index} style={styles.riskRow}>
                <Text style={styles.riskTitle}>
                  {safeText(risk.title, `Risk flag ${index + 1}`)}
                </Text>
                <Text style={styles.riskBody}>{safeText(risk.body)}</Text>
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.ruledBlock}>
            <FieldLabel>RISK FLAGS</FieldLabel>
            <Text style={styles.longText}>
              Nessun risk flag critico aggiuntivo è stato rilevato oltre ai
              vincoli principali della diagnosi.
            </Text>
          </View>
        )}

        <PageFooter />
      </Page>

      {/* ================= 04 — PRIORITÀ ================= */}
      <Page size="A4" style={styles.page}>
        <PageHeader name={name} />
        <SectionTitle
          number="04"
          kicker="LE 3 PRIORITÀ OPERATIVE"
          title="Cosa va chiarito prima"
          body="Queste sono le aree che oggi creano più attrito operativo. Prima di aumentare volume, complessità o investimento, vanno rese più chiare, trasferibili e leggibili."
        />

        {priorities.map((item: any, index: number) => (
          <View key={item.key || index} style={styles.priorityBlock}>
            <View style={styles.priorityHeader}>
              <Text style={styles.priorityRank}>
                {String(index + 1).padStart(2, "0")}
              </Text>
              <Text style={styles.priorityTitle}>{getDimensionLabel(item)}</Text>
              <Text style={styles.priorityScore}>
                {Number(item.score || 0).toFixed(1)} / 10
              </Text>
            </View>

            <View style={styles.priorityBody}>
              <FieldLabel>VINCOLO</FieldLabel>
              <Text style={styles.longText}>
                {item.vincolo ||
                  item.cosaIndica ||
                  dimensionShortCopy[item.key as DimensionKey] ||
                  ""}
              </Text>

              <FieldLabel>DA CHIARIRE</FieldLabel>
              <Text style={styles.longText}>
                {item.lavoro ||
                  "Rendere più chiari numeri, responsabilità, criteri e sequenza operativa."}
              </Text>

              <FieldLabel>EVITARE</FieldLabel>
              <Text style={styles.longText}>
                {item.nonFare ||
                  "Non aumentare complessità prima di avere una lettura più stabile di questa area."}
              </Text>
            </View>
          </View>
        ))}

        {/* [V2.2 / P4] De-prioritizzazione esplicita: ciò che non è
            in lista è rumore per questa fase. */}
        <Text style={styles.deprioritizeNote}>
          Tutto ciò che non è in queste tre priorità è, per questa fase,
          rumore: non perché non conti, ma perché conta dopo.
        </Text>

        <PageFooter />
      </Page>

      {/* ================= 05 — MAPPA 6 DIMENSIONI ================= */}
      <Page size="A4" style={styles.page}>
        <PageHeader name={name} />
        <SectionTitle
          number="05"
          kicker="LA MAPPA DIAGNOSTICA"
          title="Le 6 dimensioni"
          body="Questa pagina mostra la relazione tra le aree del business. Le dimensioni più basse indicano dove il valore resta bloccato prima ancora di cercare più clienti, più automazione o più capitale."
        />

        <View style={styles.dimTableHead}>
          <Text style={styles.dimTableHeadLeft}>DIMENSIONE</Text>
          <Text style={styles.dimTableHeadRight}>SCORE</Text>
        </View>

        {dims.map((dim: any) => {
          const isBinding = dim.key === displayedBindingKey;
          return (
            <View key={dim.key} style={styles.dimRow}>
              <View style={styles.dimRowTop}>
                <View style={styles.dimRowNameWrap}>
                  <Text style={styles.dimensionTitle}>
                    {getDimensionLabel(dim)}
                  </Text>
                  <Text style={styles.dimensionStatus}>
                    {getBracketLabel(dim.bracket) ||
                      getScoreLabel(Number(dim.score || 0))}
                    {isBinding ? "  ·  VINCOLO BINDING" : ""}
                  </Text>
                </View>
                <Text style={styles.dimensionScore}>
                  {Number(dim.score || 0).toFixed(1)} / 10
                </Text>
              </View>
              <Bar score={Number(dim.score || 0)} accent={isBinding} />
              <Text style={styles.dimensionText}>
                {dim.subtitle || dimensionShortCopy[dim.key as DimensionKey]}
              </Text>
            </View>
          );
        })}

        <View style={styles.focusBox}>
          <Text style={styles.focusLabel}>LETTURA OPERATIVA</Text>
          <Text style={styles.insightText}>
            Il punto non è solo migliorare il punteggio di ogni area. Il salto
            avviene quando offerta, acquisizione, delivery, margini, asset e
            leggibilità esterna iniziano a funzionare come un sistema unico.
          </Text>
        </View>

        <PageFooter />
      </Page>

      {/* ================= 06 — FORZE E VINCOLI ================= */}
      <Page size="A4" style={styles.page}>
        <PageHeader name={name} />
        <SectionTitle
          number="06"
          kicker="LE COORDINATE"
          title="Forze e vincoli"
          body="Questa pagina separa le aree più solide da quelle che limitano il prossimo salto."
        />

        <View style={styles.twoColLarge}>
          <View style={styles.columnRuled}>
            <Text style={styles.cardTitle}>Le tue forze</Text>
            {strengths.map((item: any, index: number) => (
              <View key={item.key || index} style={styles.scoreRow}>
                <Text style={styles.scoreRowName}>
                  {getDimensionLabel(item)}
                </Text>
                <Text style={styles.scoreRowValue}>
                  {Number(item.score || 0).toFixed(1)}
                </Text>
              </View>
            ))}
          </View>

          <View style={styles.columnRuled}>
            <Text style={styles.cardTitle}>Le tue priorità</Text>
            {priorities.map((item: any, index: number) => (
              <View key={item.key || index} style={styles.scoreRow}>
                <Text style={styles.scoreRowName}>
                  {getDimensionLabel(item)}
                </Text>
                <Text style={styles.scoreRowValue}>
                  {Number(item.score || 0).toFixed(1)}
                </Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.focusBox}>
          <Text style={styles.focusLabel}>VINCOLO BINDING</Text>
          <Text style={styles.insightText}>
            {displayedBindingKey
              ? `La dimensione che oggi limita di più lo stage è ${
                  dimensionNames[displayedBindingKey] || displayedBindingKey
                }.`
              : "Il vincolo principale emerge dalla combinazione delle dimensioni più deboli."}
          </Text>
        </View>

        <PageFooter />
      </Page>

      {/* ================= 07 — VINCOLI FUNZIONALI ================= */}
      <Page size="A4" style={styles.page}>
        <PageHeader name={name} />
        <SectionTitle
          number="07"
          kicker="I VINCOLI FUNZIONALI"
          title="Dove il sistema può perdere leva"
          body="Questi sono i vincoli funzionali più probabili in base alla fase del business e alle dimensioni più deboli emerse dalla scorecard."
        />

        {functionConstraints.length > 0 ? (
          <View>
            {functionConstraints.slice(0, 3).map((item: any, index: number) => (
              <View key={item.id || index} style={styles.priorityBlock}>
                <View style={styles.priorityHeader}>
                  <Text style={styles.priorityRank}>
                    {String(index + 1).padStart(2, "0")}
                  </Text>
                  <Text style={styles.priorityTitle}>{item.label}</Text>
                </View>

                <View style={styles.priorityBody}>
                  <FieldLabel>COSA INDICA</FieldLabel>
                  <Text style={styles.longText}>{item.implication}</Text>

                  <FieldLabel>DA CHIARIRE</FieldLabel>
                  <Text style={styles.longText}>{item.work}</Text>

                  <FieldLabel>EVITARE</FieldLabel>
                  <Text style={styles.longText}>{item.avoid}</Text>
                </View>
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.ruledBlock}>
            <FieldLabel>NESSUN VINCOLO FUNZIONALE SPECIFICO</FieldLabel>
            <Text style={styles.longText}>
              La diagnosi principale emerge dalle sei dimensioni e dal vincolo
              binding.
            </Text>
          </View>
        )}

        <PageFooter />
      </Page>

      {/* ================= 08 — PROFILO + CTA ================= */}
      <Page size="A4" style={styles.page}>
        <PageHeader name={name} />
        <SectionTitle
          number="08"
          kicker={`PROFILO ${safeText(result.profile)}`}
          title={profileTitle}
          body={profileBody}
        />

        <View style={styles.ruledBlock}>
          <FieldLabel>COME SI MANIFESTA</FieldLabel>
          <Text style={styles.longText}>
            {result.profileData?.manifesta ||
              "Il vincolo si manifesta quando il business deve essere capito, delegato o valutato senza la presenza costante del founder."}
          </Text>

          <FieldLabel>RISCHIO SE IGNORATO</FieldLabel>
          <Text style={styles.longText}>
            {result.profileData?.rischio ||
              "Il rischio è aumentare volume, complessità o esposizione esterna senza aver prima chiarito il sistema."}
          </Text>

          <FieldLabel>LA DECISIONE CHE VIENE PRIMA</FieldLabel>
          <Text style={styles.longText}>
            {result.profileData?.decisione ||
              "Rendere più chiari numeri, responsabilità, offerta e vincolo operativo principale."}
          </Text>
        </View>

        {/* [V2.2 / P5] Il problema rivelato: il loop che la Strategic
            Review chiude. Render condizionale. */}
        {stageInfo.nextProblem ? (
          <View style={styles.ruledBlock}>
            <FieldLabel>IL PROBLEMA CHE SI APRE DOPO</FieldLabel>
            <Text style={styles.longText}>{stageInfo.nextProblem}</Text>
          </View>
        ) : null}

        <View style={styles.ctaBox} wrap={false}>
          <Text style={styles.ctaLabel}>STRATEGIC REVIEW</Text>
          <Text style={styles.ctaTitle}>
            {firstName
              ? `${firstName}, trasforma la diagnosi in ordine operativo.`
              : "Trasforma la diagnosi in ordine operativo."}
          </Text>
          {/* [V2.2 / 4.3] Registro "descrivi, non spiegare". */}
          <Text style={styles.ctaBody}>
            Questo report ti ha dato il COSA: il vincolo, la posta in gioco,
            i criteri per riconoscere quando è risolto. Quello che non può
            darti è la sequenza applicata al tuo caso: cosa viene prima tra
            le tue priorità, con i tuoi margini, la tua capacità e la tua
            finestra di decisione. La Strategic Review serve esattamente a
            questo: trasformare la diagnosi in un ordine operativo dei
            prossimi 30-60 giorni.
          </Text>
          {getIntentClosing(result) ? (
            <Text style={styles.ctaIntentLine}>{getIntentClosing(result)}</Text>
          ) : null}
          <Link src={strategicReviewUrl} style={styles.ctaButton}>
            Prenota la Strategic Review
          </Link>
          {resolvedLeadId ? (
            <Text style={styles.ctaSmallText}>Report ID: {resolvedLeadId}</Text>
          ) : null}
        </View>

        <PageFooter />
      </Page>
    </Document>
  );
}

/* ============================================================
   STILI — sistema editoriale "advisory"
   Token allineati al funnel:
   ink #171717 · body #33302A · muted #6F6A61 · hairline #DDD3C4
   teal #27708F · teal-dark #1F5B75 · gold #B88A2A
============================================================ */

const INK = "#171717";
const BODY = "#33302A";
const MUTED = "#6F6A61";
const HAIRLINE = "#DDD3C4";
const TEAL = "#27708F";
const TEAL_DARK = "#1F5B75";
const GOLD = "#B88A2A";
const DANGER = "#B42318";
const CREAM = "#FAF6EC";
const COVER_BG = "#1A1A1A";

const styles = StyleSheet.create({
  /* ---- Copertina ---- */
  coverPage: {
    paddingTop: 42,
    paddingBottom: 42,
    paddingHorizontal: 46,
    backgroundColor: COVER_BG,
    color: "#FFFFFF",
    fontFamily: "Helvetica"
  },
  coverTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12
  },
  coverWordmark: {
    fontSize: 9,
    color: "#FFFFFF",
    letterSpacing: 2.4,
    fontWeight: 700
  },
  coverWordmarkRight: {
    fontSize: 9,
    color: "rgba(255,255,255,0.45)",
    letterSpacing: 2.4
  },
  coverGoldRule: {
    height: 2,
    backgroundColor: GOLD,
    width: 44,
    marginBottom: 56
  },
  coverTitleBlock: {
    marginBottom: 44
  },
  coverKicker: {
    fontSize: 8.5,
    color: GOLD,
    letterSpacing: 2.2,
    fontWeight: 700,
    marginBottom: 14
  },
  coverTitle: {
    fontSize: 34,
    lineHeight: 1.04,
    color: "#FFFFFF",
    fontWeight: 700,
    letterSpacing: -0.5,
    marginBottom: 16,
    maxWidth: 380
  },
  coverPrepared: {
    fontSize: 12,
    color: "rgba(255,255,255,0.85)",
    marginBottom: 5
  },
  coverMetaLine: {
    fontSize: 9,
    color: "rgba(255,255,255,0.45)"
  },
  coverScoreRow: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.16)",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.16)",
    paddingVertical: 26,
    marginBottom: 26,
    gap: 30
  },
  coverScoreBlock: {
    width: "34%",
    borderRightWidth: 1,
    borderRightColor: "rgba(255,255,255,0.16)",
    paddingRight: 24,
    justifyContent: "center"
  },
  coverScoreLabel: {
    fontSize: 7.5,
    color: "rgba(255,255,255,0.5)",
    letterSpacing: 1.8,
    fontWeight: 700,
    marginBottom: 10
  },
  coverScoreLine: {
    flexDirection: "row",
    alignItems: "flex-end"
  },
  coverScoreNumber: {
    fontSize: 64,
    lineHeight: 0.9,
    color: "#FFFFFF",
    fontWeight: 700,
    letterSpacing: -2
  },
  coverScoreOutOf: {
    fontSize: 14,
    color: "rgba(255,255,255,0.5)",
    marginLeft: 6,
    marginBottom: 4
  },
  coverConstraintBlock: {
    flex: 1,
    justifyContent: "center"
  },
  coverConstraintTitle: {
    fontSize: 23,
    lineHeight: 1.05,
    color: "#FFFFFF",
    fontWeight: 700,
    letterSpacing: -0.4,
    marginBottom: 8
  },
  coverConstraintBody: {
    fontSize: 10,
    lineHeight: 1.5,
    color: "rgba(255,255,255,0.7)"
  },
  coverMetaGrid: {
    flexDirection: "row",
    marginBottom: 40
  },
  coverMetaItem: {
    flex: 1,
    borderRightWidth: 1,
    borderRightColor: "rgba(255,255,255,0.16)",
    paddingRight: 16,
    marginRight: 16
  },
  coverMetaItemLast: {
    borderRightWidth: 0,
    marginRight: 0,
    paddingRight: 0
  },
  coverMetaLabel: {
    fontSize: 7.5,
    color: "rgba(255,255,255,0.45)",
    letterSpacing: 1.8,
    fontWeight: 700,
    marginBottom: 6
  },
  coverMetaValue: {
    fontSize: 13,
    color: "#FFFFFF",
    fontWeight: 700
  },
  coverIndex: {
    marginTop: "auto",
    marginBottom: 28
  },
  coverIndexTitle: {
    fontSize: 7.5,
    color: GOLD,
    letterSpacing: 2,
    fontWeight: 700,
    marginBottom: 12
  },
  coverIndexRow: {
    flexDirection: "row",
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.10)"
  },
  coverIndexNum: {
    width: 30,
    fontSize: 8.5,
    color: GOLD,
    fontWeight: 700
  },
  coverIndexText: {
    fontSize: 9.5,
    color: "rgba(255,255,255,0.8)"
  },
  coverFooter: {
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.16)",
    paddingTop: 12
  },
  coverFooterText: {
    fontSize: 7.5,
    lineHeight: 1.5,
    color: "rgba(255,255,255,0.4)"
  },

  /* ---- Pagine interne ---- */
  page: {
    paddingTop: 30,
    paddingBottom: 46,
    paddingHorizontal: 46,
    backgroundColor: "#FFFFFF",
    color: INK,
    fontFamily: "Helvetica"
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 28,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: HAIRLINE
  },
  headerText: {
    fontSize: 7,
    color: MUTED,
    letterSpacing: 1.6,
    textTransform: "uppercase"
  },
  footer: {
    position: "absolute",
    bottom: 24,
    left: 46,
    right: 46,
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: HAIRLINE,
    paddingTop: 8
  },
  footerText: {
    fontSize: 7,
    color: MUTED,
    letterSpacing: 0.6
  },

  /* ---- Titoli di sezione ---- */
  sectionTitleBlock: {
    marginBottom: 24
  },
  sectionNumberRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12
  },
  sectionNumber: {
    fontSize: 11,
    color: GOLD,
    fontWeight: 700,
    letterSpacing: 1
  },
  sectionNumberRule: {
    width: 26,
    height: 1,
    backgroundColor: HAIRLINE,
    marginHorizontal: 10
  },
  kicker: {
    fontSize: 7.5,
    color: TEAL_DARK,
    letterSpacing: 1.8,
    textTransform: "uppercase",
    fontWeight: 700
  },
  sectionTitle: {
    fontSize: 30,
    lineHeight: 1.04,
    fontWeight: 700,
    color: INK,
    letterSpacing: -0.6,
    marginBottom: 10
  },
  sectionBody: {
    fontSize: 10.5,
    lineHeight: 1.5,
    color: MUTED,
    maxWidth: 440
  },
  sectionBottomRule: {
    height: 1,
    backgroundColor: HAIRLINE,
    marginTop: 18
  },

  /* ---- Blocchi a righe ---- */
  ruledBlock: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: HAIRLINE,
    marginBottom: 2
  },
  twoCol: {
    flexDirection: "row",
    gap: 28,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: HAIRLINE,
    marginBottom: 4
  },
  colRuled: {
    flex: 1
  },
  blockLabel: {
    fontSize: 7.5,
    color: TEAL_DARK,
    fontWeight: 700,
    letterSpacing: 1.6,
    marginTop: 7,
    marginBottom: 3,
    textTransform: "uppercase"
  },
  blockText: {
    fontSize: 10.5,
    lineHeight: 1.45,
    color: INK
  },
  longText: {
    fontSize: 9.5,
    lineHeight: 1.42,
    color: BODY
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: 700,
    color: INK,
    letterSpacing: -0.2,
    marginBottom: 10
  },
  listRow: {
    flexDirection: "row",
    gap: 12,
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: "#EFEAE0"
  },
  listNumber: {
    width: 22,
    fontSize: 9,
    color: GOLD,
    fontWeight: 700
  },
  listText: {
    flex: 1,
    fontSize: 10,
    lineHeight: 1.4,
    color: BODY
  },

  /* ---- Box accentati ---- */
  focusBox: {
    backgroundColor: CREAM,
    borderLeftWidth: 2,
    borderLeftColor: GOLD,
    padding: 14,
    marginTop: 14,
    marginBottom: 4
  },
  focusLabel: {
    fontSize: 7.5,
    color: TEAL_DARK,
    fontWeight: 700,
    letterSpacing: 1.6,
    marginBottom: 6,
    textTransform: "uppercase"
  },
  focusText: {
    fontSize: 10.5,
    lineHeight: 1.5,
    color: TEAL_DARK,
    fontWeight: 700
  },
  warningBox: {
    borderLeftWidth: 2,
    borderLeftColor: DANGER,
    backgroundColor: "#FBF1EF",
    padding: 11,
    marginTop: 10,
    marginBottom: 2
  },
  warningTitle: {
    fontSize: 7.5,
    color: DANGER,
    fontWeight: 700,
    letterSpacing: 1.6,
    marginBottom: 6
  },
  warningText: {
    fontSize: 10,
    lineHeight: 1.5,
    color: DANGER
  },
  patternTitle: {
    fontSize: 14,
    fontWeight: 700,
    color: INK,
    marginBottom: 6
  },
  insightText: {
    fontSize: 10,
    lineHeight: 1.5,
    color: BODY
  },
  riskRow: {
    borderLeftWidth: 2,
    borderLeftColor: DANGER,
    paddingLeft: 12,
    paddingVertical: 6,
    marginBottom: 8
  },
  riskTitle: {
    fontSize: 10.5,
    color: DANGER,
    fontWeight: 700,
    marginBottom: 3
  },
  riskBody: {
    fontSize: 9,
    lineHeight: 1.4,
    color: DANGER
  },

  /* ---- Priorità ---- */
  priorityBlock: {
    borderBottomWidth: 1,
    borderBottomColor: HAIRLINE,
    paddingBottom: 10,
    marginBottom: 10
  },
  priorityHeader: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 12,
    marginBottom: 4
  },
  priorityRank: {
    fontSize: 16,
    color: GOLD,
    fontWeight: 700,
    width: 30
  },
  priorityTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: 700,
    color: INK,
    letterSpacing: -0.3
  },
  priorityScore: {
    fontSize: 12,
    fontWeight: 700,
    color: TEAL
  },
  priorityBody: {
    paddingLeft: 42
  },

  /* ---- Tabella dimensioni ---- */
  dimTableHead: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: INK,
    marginBottom: 2
  },
  dimTableHeadLeft: {
    fontSize: 7.5,
    color: MUTED,
    letterSpacing: 1.6,
    fontWeight: 700
  },
  dimTableHeadRight: {
    fontSize: 7.5,
    color: MUTED,
    letterSpacing: 1.6,
    fontWeight: 700
  },
  dimRow: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: HAIRLINE
  },
  dimRowTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginBottom: 7
  },
  dimRowNameWrap: {
    flexDirection: "column"
  },
  dimensionTitle: {
    fontSize: 12.5,
    fontWeight: 700,
    color: INK
  },
  dimensionStatus: {
    fontSize: 7,
    color: MUTED,
    letterSpacing: 1.2,
    marginTop: 3
  },
  dimensionScore: {
    fontSize: 11.5,
    fontWeight: 700,
    color: TEAL
  },
  dimensionText: {
    fontSize: 9,
    lineHeight: 1.35,
    color: MUTED,
    marginTop: 6
  },
  barTrack: {
    height: 4,
    backgroundColor: "#EFEAE0",
    overflow: "hidden"
  },
  barFill: {
    height: 4,
    backgroundColor: TEAL
  },
  barFillAccent: {
    backgroundColor: GOLD
  },

  /* ---- Colonne forze/vincoli ---- */
  twoColLarge: {
    flexDirection: "row",
    gap: 28,
    marginBottom: 4
  },
  columnRuled: {
    flex: 1,
    borderTopWidth: 1,
    borderTopColor: INK,
    paddingTop: 12
  },
  scoreRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: HAIRLINE,
    paddingVertical: 8
  },
  scoreRowName: {
    fontSize: 10.5,
    color: BODY
  },
  scoreRowValue: {
    fontSize: 10.5,
    color: TEAL,
    fontWeight: 700
  },

  /* ---- CTA finale ---- */
  ctaBox: {
    backgroundColor: COVER_BG,
    padding: 18,
    marginTop: 12
  },
  ctaLabel: {
    fontSize: 7.5,
    color: GOLD,
    letterSpacing: 2,
    textTransform: "uppercase",
    fontWeight: 700,
    marginBottom: 10
  },
  ctaTitle: {
    fontSize: 19,
    lineHeight: 1.08,
    color: "#FFFFFF",
    fontWeight: 700,
    letterSpacing: -0.4,
    marginBottom: 8
  },
  ctaBody: {
    fontSize: 9.5,
    lineHeight: 1.45,
    color: "rgba(255,255,255,0.78)",
    marginBottom: 10
  },
  ctaButton: {
    fontSize: 12,
    color: COVER_BG,
    fontWeight: 700,
    textDecoration: "none",
    backgroundColor: GOLD,
    paddingTop: 10,
    paddingBottom: 10,
    paddingHorizontal: 16,
    alignSelf: "flex-start"
  },
  ctaSmallText: {
    fontSize: 7.5,
    color: "rgba(255,255,255,0.45)",
    marginTop: 10
  },
  /* [V2.2] Nota di de-prioritizzazione, pagina 04 */
  deprioritizeNote: {
    fontSize: 8.5,
    lineHeight: 1.45,
    color: MUTED,
    marginTop: 8,
    paddingTop: 6,
    borderTopWidth: 0.75,
    borderTopColor: HAIRLINE
  },
  /* [V2.2] Riga di chiusura calibrata su intent, dentro la ctaBox */
  ctaIntentLine: {
    fontSize: 9,
    lineHeight: 1.45,
    color: GOLD,
    marginBottom: 10
  }
});
