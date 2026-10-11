import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
  Link,
  Svg,
  Line,
  Polygon,
  Circle
} from "@react-pdf/renderer";

/* ============================================================
   IMPULSE PDF DOCUMENT — v3.0 "MANIFESTO"
   Redesign approvato: tipografia massiva (Poppins ExtraBold),
   mono tecnico (IBM Plex Mono), inchiostro + gold, copertina
   scura, box a celle (etichetta piena + corpo), matrice a
   tacche per le dimensioni, radar + matrice a pagina 06.

   LOGICA DATI E ACCESSOR: INVARIATI rispetto a v2.x.
   Cambia SOLO la presentazione.

   FONT — carica questi TTF in /public/fonts/ della repo
   (l'app è servita su report.davidedileo.it, quindi public/
   risponde alla root del dominio). Google Fonts, licenza OFL:
     Poppins-Regular.ttf
     Poppins-Bold.ttf
     Poppins-ExtraBold.ttf
   NB: NON usare IBM Plex Mono — i suoi TTF mandano in errore
   fontkit (il parser di @react-pdf): "Out of bounds access".
   Finché i file non sono online, imposta USE_CUSTOM_FONTS=false:
   il PDF renderizza con Helvetica/Courier senza rompersi.
============================================================ */

const USE_CUSTOM_FONTS = true;

/* [DESIGN A v3.1 - 10/10/2026] Tipografia allineata a sito, scorecard e
   report web: Cormorant (testi e titoli) + Jost (etichette). File WOFF da
   @fontsource (licenza OFL) in /public/fonts. FONT_DIR si puo' cambiare
   solo per i test fuori dal browser. */
const FONT_DIR: string = (globalThis as any).__IMPULSE_FONT_DIR || "/fonts";

if (USE_CUSTOM_FONTS) {
  Font.register({
    family: "Cormorant",
    fonts: [
      { src: FONT_DIR + "/Cormorant-Regular.woff" },
      { src: FONT_DIR + "/Cormorant-Italic.woff", fontStyle: "italic" },
      { src: FONT_DIR + "/Cormorant-SemiBold.woff", fontWeight: 600 },
      { src: FONT_DIR + "/Cormorant-SemiBold.woff", fontWeight: 700 }
    ]
  });
  Font.register({
    family: "CormorantDisplay",
    fonts: [
      { src: FONT_DIR + "/Cormorant-Medium.woff" },
      { src: FONT_DIR + "/Cormorant-Italic.woff", fontStyle: "italic" }
    ]
  });
  Font.register({
    family: "Jost",
    fonts: [
      { src: FONT_DIR + "/Jost-Medium.woff" },
      { src: FONT_DIR + "/Jost-Medium.woff", fontWeight: 700 }
    ]
  });
}

/* black = titoli (Cormorant Medium), sans = testo (Cormorant),
   mono = etichette e numeri piccoli (Jost) */
const F = {
  black: USE_CUSTOM_FONTS ? "CormorantDisplay" : "Times-Roman",
  sans: USE_CUSTOM_FONTS ? "Cormorant" : "Times-Roman",
  mono: USE_CUSTOM_FONTS ? "Jost" : "Helvetica"
};

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

/* [NOMI v2.10] nomi in italiano (l'inglese resta nelle Capsule del Kit) */
const dimensionNames: Record<DimensionKey, string> = {
  clarity: "Chiarezza",
  acquisition: "Acquisizione clienti",
  operations: "Operatività",
  margins: "Margini",
  asset: "Valore trasferibile",
  readiness: "Prontezza"
};
const DIM_EN_TO_IT: Record<string, string> = {
  Clarity: "Chiarezza", Acquisition: "Acquisizione clienti", Operations: "Operatività",
  Margins: "Margini", Asset: "Valore trasferibile", Readiness: "Prontezza"
};
function pairTitleIt(t: string) {
  let out = String(t || "");
  Object.keys(DIM_EN_TO_IT).forEach(k => { out = out.split(k).join(DIM_EN_TO_IT[k]); });
  return out;
}
/* etichette corte per il radar: i nomi lunghi escono dal disegno */
const RADAR_SHORT: Record<string, string> = {
  clarity: "Chiarezza", acquisition: "Clienti", operations: "Operatività",
  margins: "Margini", asset: "Valore", readiness: "Prontezza"
};
const FASCIA_IT: Record<string, string> = {
  FOUNDATIONAL: "Fondamenta",
  BUILDING: "In costruzione",
  AWARE: "Avanzato",
  READY: "Pronto"
};

const dimensionShortCopy: Record<DimensionKey, string> = {
  clarity: "Cosa vendi, a chi e perché ti scelgono.",
  acquisition: "Da dove arrivano i clienti e quanto è regolare il flusso.",
  operations: "Come consegni il lavoro e quanto passa ancora da te.",
  margins: "Quanto resta di ogni vendita e quanta cassa hai.",
  asset: "Quello che resta nel business anche senza di te.",
  readiness: "Quanto il business si capisce da fuori: numeri, ruoli, materiali."
};

function safeText(value: any, fallback = "") {
  if (value === null || value === undefined) return fallback;
  return String(value);
}

function normalizeStage(stage: string) {
  const map: Record<string, string> = {
    FOUNDATION: "Avvio",
    TRACTION: "Crescita",
    MARKET_TRACTION: "Crescita",
    "MARKET TRACTION": "Crescita",
    STABILIZATION: "Stabilità",
    OPERATING_STABILITY: "Stabilità",
    "OPERATING STABILITY": "Stabilità",
    PRODUCTIZATION: "Offerta definita",
    VALUE_ARCHITECTURE: "Offerta definita",
    "VALUE ARCHITECTURE": "Offerta definita",
    "SCALE READINESS": "Pronto a scalare",
    SCALE_READINESS: "Pronto a scalare"
  };

  const key = String(stage || "").toUpperCase().trim();
  return map[key] || map[stage] || stage || "";
}

function getFirstName(name?: string) {
  const clean = safeText(name).trim();
  if (!clean) return "";
  return clean.split(" ")[0];
}

const PROFILE_TITLE_IT: Record<string, string> = {
  "Clarity Gap": "Il nodo della chiarezza",
  "Growth Engine Gap": "Il nodo dei clienti",
  "Operational Gap": "Il nodo operativo",
  "Readiness Gap": "Il nodo della prontezza"
};

function getProfileTitle(result: PdfResult) {
  const t = getProfileTitleRaw(result);
  return PROFILE_TITLE_IT[t] || t;
}

function getProfileTitleRaw(result: PdfResult) {
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
  /* [SERVER-SIDE v3] il pattern (con tutto il testo-analisi) arriva dallo
     state del server. Fallback minimo, senza analisi, se lo state manca. */
  if (result.diagnosticPattern) {
    return result.diagnosticPattern;
  }
  const first = priorities[0];
  const second = priorities[1];
  const firstLabel = first ? getDimensionLabel(first) : "Vincolo principale";
  const secondLabel = second ? getDimensionLabel(second) : "Secondo vincolo";
  return { topGapPairTitle: `${firstLabel} + ${secondLabel}` };
}



function getPdfRecommendedFocus(diagnosticPattern: DiagnosticPattern) {
  /* [SERVER-SIDE v3] il focus arriva dallo state; niente fallback-analisi locale. */
  return safeText(diagnosticPattern.recommendedFocus).trim();
}

function getPdfStrategicWarning(diagnosticPattern: DiagnosticPattern) {
  return safeText(diagnosticPattern.strategicWarning);
}

function getRiskFlags(result: PdfResult) {
  if (result.riskFlags && result.riskFlags.length > 0) {
    return result.riskFlags.slice(0, 4);
  }

  return [];
}

function getIntentInsight(result: PdfResult) {
  /* [SERVER-SIDE v3] arriva dallo state; fallback minimo senza analisi. */
  return result.intentInsight || { label: "", body: "" };
}







function priorityCountWord(n: number) {
  if (n === 1) return "una";
  if (n === 2) return "due";
  return "tre";
}



/* Data breve per il registro mono della copertina (03.07.2026) */
function getReportDateShort() {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, "0");
  return `${p(d.getDate())}.${p(d.getMonth() + 1)}.${d.getFullYear()}`;
}

/* ============================================================
   PALETTE MANIFESTO
============================================================ */

const INK = "#13273B"; /* blu notte — testo e box */
const PAPER = "#F8F5EE";
const BODY = "#2C3A49";
const MUTED = "#77828F";
const FAINT = "#57626F";
const HAIRLINE = "#DCD6C8";
const GOLD = "#B88A2A"; /* gold su carta */
const WASH = "#F5EDD8"; /* sabbia — box prima mossa */
const GOLD_BRIGHT = "#C9A24B"; /* gold su scuro */
const RED = "#B42318";
const DARK = "#0B1928"; /* blu profondo copertina */
const IVORY = "#F4EFE4";
const IVORY_SOFT = "#CFC8B8";
const DARK_MUTED = "#96A3B0";
const DARK_FAINT = "#5F6D7B";
const DARK_HAIRLINE = "#2A3B4C";
const GOLD_WASH = "#F5EDD8"; /* evidenza riga binding */
const TICK_EMPTY = "#E5DFCE";
const TICK_EMPTY_GOLD = "#E9DFC6";

const STAGE_THRESHOLDS = [40, 60, 75, 85];

/* ============================================================
   STRUMENTI DIAGNOSTICI
============================================================ */

function polarPoint(cx: number, cy: number, r: number, deg: number) {
  const rad = (deg * Math.PI) / 180;
  return {
    x: cx + r * Math.cos(rad),
    y: cy - r * Math.sin(rad)
  };
}

/* Matrice a tacche: 10 celle, riempimento parziale via opacity.
   È la firma visiva del report insieme al radar. */
function TickBar({
  score,
  accent,
  h = 11
}: {
  score: number;
  accent?: boolean;
  h?: number;
}) {
  const clamped = Math.max(0, Math.min(10, Number(score) || 0));
  const filled = Math.floor(clamped);
  const frac = Math.round((clamped - filled) * 100) / 100;
  const fillColor = accent ? GOLD : INK;
  const emptyColor = accent ? TICK_EMPTY_GOLD : TICK_EMPTY;

  return (
    <View style={{ flexDirection: "row" }}>
      {Array.from({ length: 10 }).map((_, i) => {
        const isFull = i < filled;
        const isPartial = i === filled && frac >= 0.08;
        return (
          <View
            key={i}
            style={{
              flex: 1,
              height: h,
              marginRight: i < 9 ? 2.5 : 0,
              backgroundColor: isFull ? fillColor : emptyColor
            }}
          >
            {isPartial ? (
              <View
                style={{
                  width: `${Math.round(frac * 100)}%`,
                  height: h,
                  backgroundColor: fillColor
                }}
              />
            ) : null}
          </View>
        );
      })}
    </View>
  );
}

/* Rombo gold disegnato (il glifo ◆ non esiste nei font caricati
   e verrebbe reso col carattere di fallback). */
function BindingMark({ size = 5, right = false }: { size?: number; right?: boolean }) {
  return (
    <View
      style={{
        width: size,
        height: size,
        backgroundColor: GOLD,
        transform: "rotate(45deg)",
        marginLeft: right ? 0 : 5,
        marginRight: right ? 4 : 0
      }}
    />
  );
}

const RADAR_ORDER: DimensionKey[] = [
  "clarity",
  "acquisition",
  "operations",
  "margins",
  "asset",
  "readiness"
];

function DimensionsRadar({
  dims,
  bindingKey
}: {
  dims: Record<DimensionKey, { score: number; yes: number }>;
  bindingKey?: DimensionKey | "";
}) {
  const W = 250;
  const H = 212;
  const cx = W / 2;
  const cy = H / 2 + 2;
  const R = 76;

  const angleFor = (i: number) => 90 - i * 60;

  const ringPoints = (radius: number) =>
    RADAR_ORDER.map((_, i) => {
      const p = polarPoint(cx, cy, radius, angleFor(i));
      return `${p.x.toFixed(2)},${p.y.toFixed(2)}`;
    }).join(" ");

  const dataPoints = RADAR_ORDER.map((key, i) => {
    const score = Math.max(0, Math.min(10, Number(dims?.[key]?.score || 0)));
    const p = polarPoint(cx, cy, (score / 10) * R, angleFor(i));
    return { key, x: p.x, y: p.y };
  });

  return (
    <Svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
      {[R / 3, (2 * R) / 3].map((radius, idx) => (
        <Polygon
          key={idx}
          points={ringPoints(radius)}
          stroke="#D8D2C2"
          strokeWidth={0.8}
          fill="none"
        />
      ))}
      <Polygon
        points={ringPoints(R)}
        stroke={INK}
        strokeWidth={1.2}
        fill="none"
      />
      {RADAR_ORDER.map((_, i) => {
        const p = polarPoint(cx, cy, R, angleFor(i));
        return (
          <Line
            key={i}
            x1={cx}
            y1={cy}
            x2={p.x}
            y2={p.y}
            stroke="#D8D2C2"
            strokeWidth={0.8}
          />
        );
      })}
      <Polygon
        points={dataPoints.map(p => `${p.x.toFixed(2)},${p.y.toFixed(2)}`).join(" ")}
        fill={GOLD}
        fillOpacity={0.22}
        stroke={GOLD}
        strokeWidth={1.5}
      />
      {dataPoints.map(p => (
        <Circle
          key={p.key}
          cx={p.x}
          cy={p.y}
          r={p.key === bindingKey ? 4 : 2.4}
          fill={p.key === bindingKey ? GOLD : PAPER}
          stroke={GOLD}
          strokeWidth={1.2}
        />
      ))}
      {RADAR_ORDER.map((key, i) => {
        const deg = angleFor(i);
        const p = polarPoint(cx, cy, R + 13, deg);
        const cos = Math.cos((deg * Math.PI) / 180);
        const anchor = cos > 0.35 ? "start" : cos < -0.35 ? "end" : "middle";
        const isBinding = key === bindingKey;
        return (
          <Text
            key={key}
            x={p.x}
            y={p.y + 2.5}
            textAnchor={anchor as any}
            style={{
              fontFamily: F.mono,
              fontSize: 6,
              fill: isBinding ? GOLD : INK,
              fontWeight: 700
            }}
          >
            {(RADAR_SHORT[key] || dimensionNames[key]).toUpperCase()}
          </Text>
        );
      })}
    </Svg>
  );
}

/* ---------- Componenti editoriali ---------- */

function PageHeader({ name, page }: { name?: string; page: string }) {
  return (
    <View style={styles.header} fixed>
      <Text style={styles.headerWordmark}>IMPULSE</Text>
      <Text style={styles.headerMeta}>
        {safeText(name).toUpperCase()} · {page}/09
      </Text>
    </View>
  );
}

function PageFooter() {
  return (
    <View style={styles.footer} fixed>
      <Text style={styles.footerText}>
        RISERVATO E CONFIDENZIALE · IMPULSE · DAVIDEDILEO.IT
      </Text>
      <Text
        style={styles.footerText}
        render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`}
      />
    </View>
  );
}

function SectionHead({
  number,
  kicker,
  title,
  body
}: {
  number: string;
  kicker: string;
  title: string;
  body?: string;
}) {
  return (
    <View style={styles.sectionHeadBlock}>
      <View style={styles.sectionHeadRow}>
        <Text style={styles.sectionNumber}>{number}</Text>
        <View style={styles.sectionHeadCol}>
          <Text style={styles.kicker}>{`// ${kicker}`}</Text>
          <Text style={styles.sectionTitle}>{title}</Text>
        </View>
      </View>
      {body ? <Text style={styles.sectionBody}>{body}</Text> : null}
    </View>
  );
}

function FieldLabel({
  children,
  danger
}: {
  children: any;
  danger?: boolean;
}) {
  return (
    <Text style={[styles.fieldLabel, danger ? styles.fieldLabelDanger : null]}>
      {children}
    </Text>
  );
}

/* Box a celle: etichetta piena a sinistra + corpo.
   variant "ink" = focus (cella scura, testo gold)
   variant "red" = warning (cella rossa) */
function CellBox({
  label,
  variant,
  children
}: {
  label: string;
  variant: "ink" | "red";
  children: any;
}) {
  return (
    <View style={styles.cellBox} wrap={false}>
      <View
        style={[
          styles.cellBoxLabel,
          variant === "red" ? styles.cellBoxLabelRed : styles.cellBoxLabelInk
        ]}
      >
        <Text
          style={[
            styles.cellBoxLabelText,
            variant === "red"
              ? styles.cellBoxLabelTextRed
              : styles.cellBoxLabelTextInk
          ]}
        >
          {label}
        </Text>
      </View>
      <View style={styles.cellBoxBody}>
        <Text style={styles.cellBoxBodyText}>{children}</Text>
      </View>
    </View>
  );
}

export function ImpulsePdfDocument({ result }: { result: PdfResult }) {
  const score = Number(result.overall || 0);
  const clampedScore = Math.max(0, Math.min(100, score));
  const name = safeText(result.name);
  /* [ANSWERS v3] risposte piu' costose, dal payload compatto del quiz */
  const costlyAnswers = ((result as any).assembled?.costlyAnswers) || [];
  const firstMove = (result as any).assembled?.firstMove || null;
  const company = safeText(result.company);
  const firstName = getFirstName(name);
  const profileTitle = getProfileTitle(result);
  const profileBody = getProfileBody(result);
  const stage = result.stageLabel || result.stage || "";
  const stageLabel = normalizeStage(stage);
  const stageInfo = getStageInfo(result);
  const priorities = getPriorities(result);
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
  const reportDateShort = getReportDateShort();

  const strategicReviewBaseUrl = "https://davidedileo.it/strategic-review";
  const resolvedLeadId = result.leadId || result.metadata?.leadId || "";

  const utmMeta: Record<string, string> = (result.metadata as any)?.utm || {};
  const reviewParams = new URLSearchParams();
  Object.keys(utmMeta).forEach(k => {
    if (utmMeta[k]) reviewParams.set(k, String(utmMeta[k]));
  });
  if ((result.metadata as any)?.isTest) reviewParams.set("test", "1");
  const reviewQuery = reviewParams.toString() ? `?${reviewParams.toString()}` : "";

  const strategicReviewUrl = `${strategicReviewBaseUrl}${reviewQuery}${
    resolvedLeadId ? `#leadId=${encodeURIComponent(resolvedLeadId)}` : ""
  }`;

  const intentLevelNum = Number(
    result.intentLevel ?? (result.intentInsight as any)?.level
  );

  const profileKickerLabel = String(safeText(result.profile))
    .toLowerCase()
    .startsWith("profilo")
    ? String(safeText(result.profile)).toUpperCase()
    : `PROFILO ${safeText(result.profile).toUpperCase()}`;

  return (
    <Document
      title={`IMPULSE Report ${name || "Business"}`}
      author="IMPULSE System"
      subject="Report IMPULSE"
    >
      {/* ================= 01 — COPERTINA (scura) ================= */}
      <Page size="A4" style={styles.coverPage}>
        <View style={styles.coverTopRow}>
          <Text style={styles.coverWordmark}>IMPULSE</Text>
          <View>
            <Text style={styles.coverTopMeta}>
              {resolvedLeadId ? `${resolvedLeadId} / ` : ""}
              {reportDateShort}
            </Text>
            <Text style={styles.coverTopMeta}>RISERVATO E CONFIDENZIALE</Text>
          </View>
        </View>

        <View style={styles.coverTitleBlock}>
          <Text style={styles.coverKicker}>{`// IMPULSE · CONSTRAINT PROFILE`}</Text>
          <Text style={styles.coverTitleLine}>BUSINESS</Text>
          {/* Parola outlined: 8 copie gold sfalsate + copia color
              sfondo sopra (né text-stroke né fill SVG "none" sono
              affidabili in react-pdf). */}
          <View style={{ position: "relative", height: 64 }}>
            {[
              [-1.6, 0], [1.6, 0], [0, -1.6], [0, 1.6],
              [-1.1, -1.1], [1.1, -1.1], [-1.1, 1.1], [1.1, 1.1]
            ].map(([dx, dy], i) => (
              <Text
                key={i}
                style={[
                  styles.coverTitleLine,
                  { position: "absolute", left: dx, top: dy, color: GOLD_BRIGHT }
                ]}
              >
                READINESS
              </Text>
            ))}
            <Text
              style={[
                styles.coverTitleLine,
                { position: "absolute", left: 0, top: 0, color: DARK }
              ]}
            >
              READINESS
            </Text>
          </View>
          <Text style={styles.coverTitleLine}>REPORT</Text>
        </View>

        <View style={styles.coverPreparedRow}>
          <View style={styles.coverPreparedBar} />
          <Text style={styles.coverPreparedText}>
            Preparato per{" "}
            <Text style={styles.coverPreparedName}>{name || "il tuo business"}</Text>
            {company ? ` · ${company}` : ""}
          </Text>
        </View>

        <View style={styles.coverBand}>
          <View style={styles.coverScoreCell}>
            <Text style={styles.coverCellLabel}>PUNTEGGIO IMPULSE</Text>
            <View style={styles.coverScoreRow}>
              <Text style={styles.coverScoreNumber}>{String(clampedScore)}</Text>
              <Text style={styles.coverScoreOutOf}>/100</Text>
            </View>
            {/* Scala 0-100 con tacche alle soglie di stage reali */}
            <View style={styles.coverScaleTrack}>
              <View
                style={[styles.coverScaleFill, { width: `${clampedScore}%` }]}
              />
              {STAGE_THRESHOLDS.map(t => (
                <View
                  key={t}
                  style={[styles.coverScaleTick, { left: `${t}%` }]}
                />
              ))}
            </View>
          </View>
          <View style={styles.coverConstraintCell}>
            <Text style={styles.coverCellLabel}>VINCOLO PRINCIPALE</Text>
            <Text style={styles.coverConstraintTitle}>{profileTitle}</Text>
            <Text style={styles.coverConstraintBody}>{profileBody}</Text>
          </View>
        </View>

        <View style={styles.coverMetaRow}>
          <Text style={styles.coverMetaItem}>
            FASCIA{" "}
            <Text style={styles.coverMetaValue}>
              {(FASCIA_IT[safeText(result.fascia).toUpperCase().trim()] || safeText(result.fascia)).toUpperCase()}
            </Text>
          </Text>
          <Text style={styles.coverMetaItem}>
            PROFILO{" "}
            <Text style={styles.coverMetaValue}>
              {safeText(result.profile).toUpperCase()}
            </Text>
          </Text>
          <Text style={styles.coverMetaItem}>
            FASE{" "}
            <Text style={styles.coverMetaValue}>{stageLabel.toUpperCase()}</Text>
          </Text>
          {displayedBindingKey ? (
            <Text style={styles.coverMetaItem}>
              VINCOLO{" "}
              <Text style={styles.coverMetaValueGold}>
                {(dimensionNames[displayedBindingKey] || "").toUpperCase()}
              </Text>
            </Text>
          ) : null}
        </View>

        <Text style={styles.coverDisclaimer}>
          Riservato e confidenziale. Questo report è una diagnosi operativa
          generata dalle risposte fornite. Non costituisce consulenza
          finanziaria, legale o fiscale.
        </Text>
      </Page>

      {/* ================= 02 — STAGE ================= */}
      <Page size="A4" style={styles.page}>
        <PageHeader name={name} page="02" />
        <SectionHead
          number="02"
          kicker="LA FASE DEL BUSINESS"
          title={stageLabel}
          body={
            stageInfo.headline ||
            "Il business ha segnali utili, ma il prossimo salto richiede più struttura e leggibilità."
          }
        />

        <View style={styles.twoColBlock}>
          <View style={styles.col}>
            <FieldLabel>RUOLO</FieldLabel>
            <Text style={styles.emphasisText}>
              {stageInfo.role || "Founder as system builder"}
            </Text>
          </View>
          <View style={styles.col}>
            <FieldLabel>FOCUS</FieldLabel>
            <Text style={styles.emphasisText}>
              {stageInfo.strategicReviewFocus ||
                "Chiarire il vincolo principale e la sequenza operativa."}
            </Text>
          </View>
        </View>

        <View style={styles.fieldBlock}>
          <FieldLabel>IL VINCOLO DI QUESTA FASE</FieldLabel>
          <Text style={styles.bodyText}>
            {stageInfo.bottomLineConstraint ||
              "Il business deve rendere più leggibili sistemi, numeri, responsabilità e margini prima di aumentare complessità."}
          </Text>
        </View>

        {stageInfo.costOfInaction ? (
          <View style={styles.fieldBlock}>
            <FieldLabel>IL COSTO DELL'INAZIONE</FieldLabel>
            <Text style={styles.bodyText}>{stageInfo.costOfInaction}</Text>
          </View>
        ) : null}

        <View style={styles.listBlock}>
          <Text style={styles.blockTitle}>Criteri per il prossimo salto</Text>
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

        <View style={{ flexGrow: 1 }} />

        <CellBox label="NON SCALARE ANCORA" variant="red">
          {stageInfo.nonFare ||
            stageInfo.troppoPresto ||
            "Non aumentare complessità prima di aver reso chiaro il vincolo operativo principale."}
        </CellBox>

        <PageFooter />
      </Page>

      {/* ================= 03 — PATTERN ================= */}
      <Page size="A4" style={styles.page}>
        <PageHeader name={name} page="03" />
        <SectionHead
          number="03"
          kicker="LO SCHEMA DEI VINCOLI"
          title={pairTitleIt(safeText(diagnosticPattern.topGapPairTitle, "Lo schema dei tuoi vincoli"))}
          body={safeText(diagnosticPattern.topGapPairBody)}
        />

        <View style={styles.fieldBlockFirst}>
          <FieldLabel>PROFILO + FASE</FieldLabel>
          <Text style={styles.patternTitle}>
            {safeText(
              diagnosticPattern.profileStageTitle,
              "Profilo e fase da leggere insieme"
            )}
          </Text>
          <Text style={styles.bodyText}>
            {safeText(
              diagnosticPattern.profileStageBody,
              "Il profilo mostra il tipo di vincolo. La fase mostra quanto il business è pronto a reggere il prossimo salto."
            )}
          </Text>
        </View>

        <CellBox label="FOCUS RACCOMANDATO" variant="ink">
          {pdfRecommendedFocus}
        </CellBox>

        <CellBox label="ATTENZIONE STRATEGICA" variant="red">
          {pdfStrategicWarning}
        </CellBox>

        <View style={styles.fieldBlock}>
          <FieldLabel>INTENZIONE</FieldLabel>
          <Text style={styles.patternTitle}>
            {safeText(intentInsight.label)}
          </Text>
          <Text style={styles.bodyText}>
            {safeText(intentInsight.body)}
          </Text>
        </View>

        {riskFlags.length > 0 ? (
          <View style={styles.listBlock}>
            <Text style={styles.blockTitle}>Risk flags principali</Text>
            {riskFlags.map((risk: RiskFlag, index: number) => (
              <View key={risk.id || index} style={styles.riskRow}>
                <Text style={styles.riskTitle}>
                  {safeText(risk.title, `Risk flag ${index + 1}`).toUpperCase()}
                </Text>
                <Text style={styles.riskBody}>{safeText(risk.body)}</Text>
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.fieldBlock}>
            <FieldLabel>RISK FLAGS</FieldLabel>
            <Text style={styles.bodyText}>
              Nessun risk flag critico aggiuntivo è stato rilevato oltre ai
              vincoli principali della diagnosi.
            </Text>
          </View>
        )}

        <PageFooter />
      </Page>

      {/* ================= 04 — PRIORITÀ ================= */}
      <Page size="A4" style={styles.page}>
        <PageHeader name={name} page="04" />
        <SectionHead
          number="04"
          kicker={`LE ${priorityCountWord(priorities.length).toUpperCase()} PRIORITÀ OPERATIVE`}
          title="Cosa va chiarito prima"
          body="Queste sono le aree che oggi creano più attrito operativo. Prima di aumentare volume, complessità o investimento, vanno rese più chiare, trasferibili e leggibili."
        />

        {priorities.map((item: any, index: number) => (
          <View key={item.key || index} style={styles.priorityBlock} wrap={false}>
            <View style={styles.priorityHeadRow}>
              <Text style={styles.priorityRank}>
                {String(index + 1).padStart(2, "0")}
              </Text>
              <Text style={styles.priorityTitle}>{getDimensionLabel(item)}</Text>
              <Text style={styles.priorityScore}>
                {Number(item.score || 0).toFixed(1)} / 10
              </Text>
            </View>

            <View style={styles.priorityField}>
              <FieldLabel>VINCOLO</FieldLabel>
              <Text style={styles.bodyText}>
                {item.vincolo ||
                  item.cosaIndica ||
                  dimensionShortCopy[item.key as DimensionKey] ||
                  ""}
              </Text>
            </View>

            <View style={styles.twoColTight}>
              <View style={styles.col}>
                <FieldLabel>DA CHIARIRE</FieldLabel>
                <Text style={styles.bodyText}>
                  {item.lavoro ||
                    "Rendere più chiari numeri, responsabilità, criteri e sequenza operativa."}
                </Text>
              </View>
              <View style={styles.col}>
                <FieldLabel danger>EVITARE</FieldLabel>
                <Text style={styles.bodyText}>
                  {item.nonFare ||
                    "Non aumentare complessità prima di avere una lettura più stabile di questa area."}
                </Text>
              </View>
            </View>
          </View>
        ))}

        <Text style={styles.deprioritizeNote}>
          {`Tutto ciò che non è in queste ${priorityCountWord(priorities.length)} priorità è, per questa fase, rumore. Conta, ma conta dopo. In che ordine e a che ritmo affrontare queste priorità lo decidiamo nella Strategic Review (pagina 08).`}
        </Text>

        <PageFooter />
      </Page>

      {/* ================= 05 — MATRICE 6 DIMENSIONI ================= */}
      <Page size="A4" style={styles.page}>
        <PageHeader name={name} page="05" />
        <SectionHead
          number="05"
          kicker="LA MAPPA DIAGNOSTICA"
          title="Le sei dimensioni"
          body="Le dimensioni più basse indicano dove il valore resta bloccato prima ancora di cercare più clienti, più automazione o più capitale."
        />

        <View style={styles.matrixHead}>
          <Text style={[styles.matrixHeadText, { width: 150 }]}>DIMENSIONE</Text>
          <Text style={[styles.matrixHeadText, { flex: 1 }]}>DA 0 A 10</Text>
          <Text style={[styles.matrixHeadText, styles.matrixHeadScore]}>
            PUNTEGGIO
          </Text>
        </View>

        {dims.map((dim: any) => {
          const isBinding = dim.key === displayedBindingKey;
          const status =
            getBracketLabel(dim.bracket) || getScoreLabel(Number(dim.score || 0));
          return (
            <View
              key={dim.key}
              style={[styles.matrixRow, isBinding ? styles.matrixRowBinding : null]}
            >
              <View style={{ width: 150 }}>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Text
                    style={[
                      { flexShrink: 1 },
                      styles.matrixName,
                      isBinding ? styles.matrixNameBinding : null
                    ]}
                  >
                    {getDimensionLabel(dim).toUpperCase()}
                  </Text>
                  {isBinding ? <BindingMark /> : null}
                </View>
                <Text
                  style={[
                    styles.matrixSub,
                    isBinding ? styles.matrixSubBinding : null
                  ]}
                >
                  {isBinding
                    ? `VINCOLO PRINCIPALE · ${dim.subtitle || dimensionShortCopy[dim.key as DimensionKey]}`
                    : `${status} · ${dim.subtitle || dimensionShortCopy[dim.key as DimensionKey]}`}
                </Text>
              </View>
              <View style={{ flex: 1, justifyContent: "center" }}>
                <TickBar score={Number(dim.score || 0)} accent={isBinding} />
              </View>
              <Text
                style={[
                  styles.matrixScore,
                  isBinding ? styles.matrixScoreBinding : null
                ]}
              >
                {Number(dim.score || 0).toFixed(1)}
              </Text>
            </View>
          );
        })}

        <View style={styles.legendRow}>
          <Text style={styles.legendItem}>0–3.9 VINCOLO</Text>
          <Text style={styles.legendItem}>4.0–6.9 IN SVILUPPO</Text>
          <Text style={styles.legendItem}>7.0+ FORZA</Text>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <BindingMark size={4} right />
            <Text style={[styles.legendItem, { color: GOLD }]}>
              VINCOLO PRINCIPALE
            </Text>
          </View>
        </View>

        <View style={{ flexGrow: 1 }} />

        <View style={styles.darkBox} wrap={false}>
          <Text style={styles.darkBoxLabel}>LETTURA OPERATIVA</Text>
          <Text style={styles.darkBoxText}>
            Il salto non è migliorare ogni punteggio: avviene quando le sei aree
            iniziano a funzionare come un sistema unico.
          </Text>
        </View>

        <PageFooter />
      </Page>

      {/* ================= 06 — RADAR + MATRICE ================= */}
      <Page size="A4" style={styles.page}>
        <PageHeader name={name} page="06" />
        <SectionHead
          number="06"
          kicker="LE COORDINATE"
          title="Forze e vincoli"
          body="Il radar mostra la forma del sistema. La matrice mostra la distanza esatta di ogni dimensione dalle soglie: sotto 4.0 vincolo, sopra 7.0 forza."
        />

        <View style={styles.radarRow}>
          <DimensionsRadar
            dims={result.dimensions}
            bindingKey={displayedBindingKey as DimensionKey}
          />

          <View style={styles.radarSideCol}>
            <View style={styles.miniMatrixHead}>
              <Text style={styles.matrixHeadText}>DIMENSIONE / 0–10</Text>
              <Text style={styles.matrixHeadText}>PUNTEGGIO</Text>
            </View>
            {dims.map((dim: any) => {
              const isBinding = dim.key === displayedBindingKey;
              return (
                <View
                  key={dim.key}
                  style={[
                    styles.miniMatrixRow,
                    isBinding ? styles.miniMatrixRowBinding : null
                  ]}
                >
                  <View style={styles.miniMatrixNameRow}>
                    <View style={{ flexDirection: "row", alignItems: "center" }}>
                      <Text
                        style={[
                          styles.miniMatrixName,
                          isBinding ? styles.matrixNameBinding : null
                        ]}
                      >
                        {getDimensionLabel(dim).toUpperCase()}
                      </Text>
                      {isBinding ? <BindingMark size={4} /> : null}
                    </View>
                    <Text
                      style={[
                        styles.miniMatrixScore,
                        isBinding ? styles.matrixScoreBinding : null
                      ]}
                    >
                      {Number(dim.score || 0).toFixed(1)}
                    </Text>
                  </View>
                  <TickBar score={Number(dim.score || 0)} accent={isBinding} h={8} />
                </View>
              );
            })}
            <View style={styles.legendRowTight}>
              <Text style={styles.legendItem}>0–3.9 VINCOLO</Text>
              <Text style={styles.legendItem}>7.0+ FORZA</Text>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <BindingMark size={4} right />
                <Text style={[styles.legendItem, { color: GOLD }]}>VINCOLO</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={{ flexGrow: 1 }} />

        <CellBox label="VINCOLO PRINCIPALE" variant="ink">
          {displayedBindingKey
            ? `La dimensione che oggi limita di più questa fase è ${
                dimensionNames[displayedBindingKey] || displayedBindingKey
              }. Finché resta debole, ogni intervento sulle altre aree rende meno.`
            : "Il vincolo principale emerge dalla combinazione delle dimensioni più deboli."}
        </CellBox>

        <PageFooter />
      </Page>

      {/* ================= 07 — VINCOLI FUNZIONALI ================= */}
      <Page size="A4" style={styles.page}>
        <PageHeader name={name} page="07" />
        <SectionHead
          number="07"
          kicker="I VINCOLI FUNZIONALI"
          title="Dove il sistema perde leva"
          body="Questi sono i vincoli funzionali più probabili in base alla fase del business e alle dimensioni più deboli emerse dalla scorecard."
        />

        {functionConstraints.length > 0 ? (
          <View>
            {functionConstraints.slice(0, 3).map((item: any, index: number) => (
              <View
                key={item.id || index}
                style={styles.priorityBlock}
                wrap={false}
              >
                <View style={styles.priorityHeadRow}>
                  <Text style={styles.priorityRank}>
                    {String(index + 1).padStart(2, "0")}
                  </Text>
                  <Text style={styles.priorityTitle}>{item.label}</Text>
                </View>

                <View style={styles.priorityField}>
                  <FieldLabel>COSA INDICA</FieldLabel>
                  <Text style={styles.bodyText}>{item.implication}</Text>
                </View>

                <View style={styles.twoColTight}>
                  <View style={styles.col}>
                    <FieldLabel>DA CHIARIRE</FieldLabel>
                    <Text style={styles.bodyText}>{item.work}</Text>
                  </View>
                  <View style={styles.col}>
                    <FieldLabel danger>EVITARE</FieldLabel>
                    <Text style={styles.bodyText}>{item.avoid}</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.fieldBlockFirst}>
            <FieldLabel>NESSUN VINCOLO FUNZIONALE SPECIFICO</FieldLabel>
            <Text style={styles.bodyText}>
              La diagnosi principale emerge dalle sei dimensioni e dal vincolo
              binding.
            </Text>
          </View>
        )}

        <PageFooter />
      </Page>

      {/* ================= 08 — PROFILO + CTA ================= */}
      <Page size="A4" style={styles.page}>
        <PageHeader name={name} page="08" />
        <SectionHead
          number="08"
          kicker={profileKickerLabel}
          title={profileTitle}
          body={profileBody}
        />

        <View style={styles.fieldBlockFirst}>
          <FieldLabel>COME SI MANIFESTA</FieldLabel>
          <Text style={styles.bodyText}>
            {result.profileData?.manifesta ||
              "Il vincolo si manifesta quando il business deve essere capito, delegato o valutato senza la presenza costante del founder."}
          </Text>
        </View>

        <View style={styles.fieldBlock}>
          <FieldLabel danger>RISCHIO SE IGNORATO</FieldLabel>
          <Text style={styles.bodyText}>
            {result.profileData?.rischio ||
              "Il rischio è aumentare volume, complessità o esposizione esterna senza aver prima chiarito il sistema."}
          </Text>
        </View>

        <View style={styles.fieldBlock}>
          <FieldLabel>LA DECISIONE CHE VIENE PRIMA</FieldLabel>
          <Text style={styles.bodyText}>
            {result.profileData?.decisione ||
              "Rendere più chiari numeri, responsabilità, offerta e vincolo operativo principale."}
          </Text>
        </View>

        {(result as any).assembled?.nextProblem ? (
          <View style={styles.fieldBlock}>
            <FieldLabel>IL PROBLEMA CHE SI APRE DOPO</FieldLabel>
            <Text style={styles.bodyText}>
              {(result as any).assembled.nextProblem}
            </Text>
          </View>
        ) : null}

        <View style={{ flexGrow: 1 }} />

        <View style={styles.ctaBox} wrap={false}>
          <Text style={styles.ctaLabel}>STRATEGIC REVIEW</Text>
          <Text style={styles.ctaTitle}>
            {firstName
              ? `${firstName}, dalla diagnosi a un piano.`
              : "Dalla diagnosi a un piano."}
          </Text>
          <Text style={styles.ctaBody}>
            {`Questo report ti dice cosa frena il business, cosa rischi e come capire quando il problema è risolto. Non può dirti in che ordine muoverti nel tuo caso: cosa viene prima tra ${
              priorities.length > 0
                ? priorities
                    .map((item: any) => getDimensionLabel(item))
                    .join(", ")
                : "le tue priorità"
            }, con i tuoi margini e il tempo che hai. Nella Strategic Review lo decidiamo insieme: un piano per i prossimi 30-60 giorni.`}
          </Text>
          {(result as any).assembled?.intentClosing ? (
            <Text style={styles.ctaIntentLine}>{(result as any).assembled.intentClosing}</Text>
          ) : null}
          <View style={styles.ctaButtonRow}>
            <Link src={strategicReviewUrl} style={styles.ctaButton}>
              {!Number.isNaN(intentLevelNum) && intentLevelNum >= 3
                ? "PRENOTA ORA LA STRATEGIC REVIEW"
                : "PRENOTA LA STRATEGIC REVIEW"}
            </Link>
            {resolvedLeadId ? (
              <Text style={styles.ctaSmallText}>
                REPORT ID: {resolvedLeadId}
              </Text>
            ) : null}
          </View>
        </View>

        <PageFooter />
      </Page>

      {/* ============ PAGE 09 — LE RISPOSTE CHE PESANO + PRIMA MOSSA ============ */}
      <Page size="A4" style={styles.page}>
        <PageHeader name={name} page="09" />
        <SectionHead
          number="09"
          kicker="LE TUE RISPOSTE, ALLA LETTERA"
          title="Dove si nasconde il punteggio."
          body="Le risposte che ti costano di più, parola per parola, e perché pesano sul risultato."
        />

        {(result as any).challenge ? (
          <View style={styles.challengeBox}>
            <Text style={styles.challengeLabel}>LA SFIDA CHE HAI SCRITTO</Text>
            <Text style={styles.challengeQuote}>{'\u00AB'}{String((result as any).challenge)}{'\u00BB'}</Text>
            <Text style={styles.challengeNote}>Parole tue. La diagnosi ti dice da dove partire: dal vincolo, non da tutto insieme.</Text>
          </View>
        ) : null}

        {costlyAnswers.length > 0 ? (
          costlyAnswers.map((ca, index) => (
            <View key={ca.id} style={styles.fieldBlock}>
              <FieldLabel>{String(index + 1).padStart(2, "0")} · {ca.dimension.toUpperCase()}</FieldLabel>
              <Text style={styles.emphasisText}>{ca.text}</Text>
              <Text style={styles.answersChosen}>Hai risposto: {'\u00AB'}{ca.chosenText}{'\u00BB'}</Text>
              <Text style={styles.bodyText}>{ca.why}</Text>
            </View>
          ))
        ) : (
          <View style={styles.fieldBlock}>
            <Text style={styles.bodyText}>
              Le risposte puntuali non sono disponibili per questo report: rifai lo scorecard per la versione completa.
            </Text>
          </View>
        )}

        {firstMove ? (
          <View style={styles.firstMoveBox}>
            <FieldLabel>LA TUA PRIMA MOSSA, ENTRO 48 ORE</FieldLabel>
            <Text style={styles.bodyText}>{firstMove}</Text>
            <Text style={styles.answersBridge}>
              È la prima di tre. Le altre due, e l'ordine in cui farle, sono nel Kit:{" "}
              <Link
                src="https://davidedileo.it/kit?utm_source=report&utm_medium=pdf&utm_campaign=kit_report"
                style={styles.answersBridgeLink}
              >
                davidedileo.it/kit
              </Link>
            </Text>
          </View>
        ) : null}

        <View style={styles.letterBlock}>
          <FieldLabel>UNA NOTA PERSONALE</FieldLabel>
          <Text style={styles.bodyText}>{(result as any).assembled?.letter || ""}</Text>
          <Text style={styles.letterSign}>Davide</Text>
          <Text style={styles.letterCred}>COO & co-founder di una fintech di tokenizzazione · IMPULSE è il mio criterio operativo, reso strumento e costruito con l'AI.</Text>
          <Text style={styles.letterRetest}>Rifai lo scorecard il {(result as any).assembled?.retestDate || ""} e confronta i numeri.</Text>
        </View>
      </Page>
    </Document>
  );
}

/* ============================================================
   STILI — sistema "MANIFESTO"
   ink #16150F · paper #FBF9F3 · gold #B88A2A (carta) /
   #C9A24B (scuro) · red #B42318 · hairline #E0DACA
============================================================ */

/* [DESIGN A] Cormorant ha l'occhio piccolo: i testi correnti salgono del
   16%, i titoli del 6%; le etichette in Jost restano come sono. */
function designA<T extends Record<string, any>>(defs: T): T {
  const out: any = {};
  Object.keys(defs).forEach((k) => {
    const st = { ...(defs as any)[k] };
    if (typeof st.fontSize === "number") {
      if (st.fontFamily === F.mono) {
        /* invariato */
      } else if (st.fontFamily === F.black) {
        st.fontSize = Math.round(st.fontSize * 1.06 * 10) / 10;
        if (typeof st.letterSpacing === "number" && st.letterSpacing < 0) st.letterSpacing = st.letterSpacing * 0.5;
      } else {
        st.fontSize = Math.round(st.fontSize * 1.16 * 10) / 10;
      }
    }
    out[k] = st;
  });
  return out;
}

const styles = StyleSheet.create(designA({
  /* ---- Copertina ---- */
  coverPage: {
    paddingTop: 44,
    paddingBottom: 40,
    paddingHorizontal: 48,
    backgroundColor: DARK,
    color: IVORY,
    fontFamily: F.sans
  },
  coverTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start"
  },
  coverWordmark: {
    fontFamily: F.black,
    fontSize: 17,
    letterSpacing: 2.5,
    color: IVORY
  },
  coverTopMeta: {
    fontFamily: F.mono,
    fontSize: 6.5,
    color: MUTED,
    textAlign: "right",
    lineHeight: 1.8
  },
  coverTitleBlock: {
    marginTop: 62
  },
  coverKicker: {
    fontFamily: F.mono,
    fontSize: 7.5,
    letterSpacing: 3,
    color: GOLD_BRIGHT,
    marginBottom: 18
  },
  coverTitleLine: {
    fontFamily: F.black,
    fontSize: 64,
    lineHeight: 1,
    letterSpacing: -1,
    color: IVORY
  },
  coverTitleLineGold: {
    color: GOLD_BRIGHT
  },
  coverPreparedRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginTop: 30
  },
  coverPreparedBar: {
    width: 38,
    height: 2.5,
    backgroundColor: GOLD_BRIGHT,
    marginRight: 12
  },
  coverPreparedText: {
    fontSize: 10,
    color: IVORY_SOFT
  },
  coverPreparedName: {
    color: IVORY,
    fontWeight: 700
  },
  coverBand: {
    flexDirection: "row",
    marginTop: "auto",
    borderWidth: 1,
    borderColor: DARK_HAIRLINE
  },
  coverScoreCell: {
    flex: 1.2,
    padding: 18,
    borderRightWidth: 1,
    borderRightColor: DARK_HAIRLINE
  },
  coverCellLabel: {
    fontFamily: F.mono,
    fontSize: 6.5,
    letterSpacing: 2,
    color: GOLD_BRIGHT,
    marginBottom: 8
  },
  coverScoreRow: {
    flexDirection: "row",
    alignItems: "flex-end"
  },
  coverScoreNumber: {
    fontFamily: F.black,
    fontSize: 58,
    lineHeight: 1,
    color: IVORY
  },
  coverScoreOutOf: {
    fontFamily: F.mono,
    fontSize: 11,
    color: MUTED,
    marginLeft: 6,
    marginBottom: 4
  },
  coverScaleTrack: {
    position: "relative",
    height: 4.5,
    backgroundColor: DARK_HAIRLINE,
    marginTop: 12
  },
  coverScaleFill: {
    position: "absolute",
    left: 0,
    top: 0,
    height: 4.5,
    backgroundColor: GOLD_BRIGHT
  },
  coverScaleTick: {
    position: "absolute",
    top: -2.5,
    width: 1.5,
    height: 9.5,
    backgroundColor: DARK_FAINT
  },
  coverConstraintCell: {
    flex: 1.6,
    padding: 18,
    justifyContent: "center"
  },
  coverConstraintTitle: {
    fontFamily: F.black,
    fontSize: 19,
    lineHeight: 1.05,
    textTransform: "uppercase",
    color: IVORY,
    marginBottom: 6
  },
  coverConstraintBody: {
    fontSize: 8.5,
    lineHeight: 1.5,
    color: DARK_MUTED
  },
  coverMetaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
    paddingTop: 13,
    borderTopWidth: 1,
    borderTopColor: DARK_HAIRLINE
  },
  coverMetaItem: {
    fontFamily: F.mono,
    fontSize: 7,
    color: MUTED
  },
  coverMetaValue: {
    color: IVORY,
    fontWeight: 700
  },
  coverMetaValueGold: {
    color: GOLD_BRIGHT,
    fontWeight: 700
  },
  coverDisclaimer: {
    fontSize: 6.5,
    lineHeight: 1.6,
    color: DARK_FAINT,
    marginTop: 12
  },

  /* ---- Pagine interne ---- */
  page: {
    paddingTop: 38,
    paddingBottom: 52,
    paddingHorizontal: 46,
    backgroundColor: PAPER,
    color: INK,
    fontFamily: F.sans
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: 10,
    borderBottomWidth: 2.5,
    borderBottomColor: INK,
    marginBottom: 24
  },
  headerWordmark: {
    fontFamily: F.black,
    fontSize: 9,
    letterSpacing: 1.5,
    color: INK
  },
  headerMeta: {
    fontFamily: F.mono,
    fontSize: 6,
    letterSpacing: 1.5,
    color: MUTED
  },
  footer: {
    position: "absolute",
    bottom: 26,
    left: 46,
    right: 46,
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: HAIRLINE,
    paddingTop: 8
  },
  footerText: {
    fontFamily: F.mono,
    fontSize: 6,
    color: MUTED
  },

  /* ---- Testata di sezione ---- */
  sectionHeadBlock: {
    marginBottom: 6
  },
  sectionHeadRow: {
    flexDirection: "row"
  },
  sectionNumber: {
    fontFamily: F.black,
    fontSize: 38,
    lineHeight: 1,
    color: GOLD_BRIGHT,
    marginRight: 16
  },
  sectionHeadCol: {
    flex: 1,
    justifyContent: "flex-end"
  },
  kicker: {
    fontFamily: F.mono,
    fontSize: 6.5,
    letterSpacing: 2.2,
    color: MUTED,
    marginBottom: 6
  },
  sectionTitle: {
    fontFamily: F.black,
    fontSize: 26,
    lineHeight: 1,
    letterSpacing: -0.3,
    textTransform: "uppercase",
    color: INK
  },
  sectionBody: {
    fontSize: 8.5,
    lineHeight: 1.55,
    color: FAINT,
    maxWidth: 400,
    marginTop: 10
  },

  /* ---- Blocchi campo ---- */
  fieldBlockFirst: {
    borderTopWidth: 2,
    borderTopColor: INK,
    marginTop: 18,
    paddingTop: 11
  },
  fieldBlock: {
    borderTopWidth: 1,
    borderTopColor: HAIRLINE,
    marginTop: 12,
    paddingTop: 11
  },
  twoColBlock: {
    flexDirection: "row",
    borderTopWidth: 2,
    borderTopColor: INK,
    marginTop: 18,
    paddingTop: 11
  },
  twoColTight: {
    flexDirection: "row",
    marginTop: 8
  },
  col: {
    flex: 1,
    marginRight: 20
  },
  fieldLabel: {
    fontFamily: F.mono,
    fontSize: 6.5,
    letterSpacing: 2,
    color: GOLD,
    marginBottom: 4
  },
  fieldLabelDanger: {
    color: RED
  },
  bodyText: {
    fontSize: 9,
    lineHeight: 1.5,
    color: BODY
  },
  emphasisText: {
    fontSize: 9.5,
    lineHeight: 1.5,
    color: INK,
    fontWeight: 700
  },
  blockTitle: {
    fontFamily: F.black,
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: 0.4,
    color: INK,
    marginBottom: 6
  },
  listBlock: {
    marginTop: 18
  },
  listRow: {
    flexDirection: "row",
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: HAIRLINE
  },
  listNumber: {
    fontFamily: F.mono,
    fontSize: 7.5,
    fontWeight: 700,
    color: GOLD,
    width: 20
  },
  listText: {
    flex: 1,
    fontSize: 9,
    lineHeight: 1.45,
    color: BODY
  },

  /* ---- Box a celle ---- */
  cellBox: {
    flexDirection: "row",
    borderWidth: 2,
    borderColor: INK,
    marginTop: 14
  },
  cellBoxLabel: {
    width: 106,
    paddingVertical: 12,
    paddingHorizontal: 10,
    justifyContent: "center"
  },
  cellBoxLabelInk: {
    backgroundColor: INK
  },
  cellBoxLabelRed: {
    backgroundColor: RED
  },
  cellBoxLabelText: {
    fontFamily: F.black,
    fontSize: 7,
    lineHeight: 1.3,
    letterSpacing: 0.6,
    textTransform: "uppercase"
  },
  cellBoxLabelTextInk: {
    color: GOLD_BRIGHT
  },
  cellBoxLabelTextRed: {
    color: PAPER
  },
  cellBoxBody: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 14,
    justifyContent: "center"
  },
  cellBoxBodyText: {
    fontSize: 9,
    lineHeight: 1.5,
    color: INK
  },

  /* ---- Pattern / risk ---- */
  patternTitle: {
    fontFamily: F.black,
    fontSize: 11,
    textTransform: "uppercase",
    color: INK,
    marginBottom: 5
  },
  riskRow: {
    borderLeftWidth: 2.5,
    borderLeftColor: RED,
    paddingLeft: 12,
    paddingVertical: 5,
    marginBottom: 9
  },
  riskTitle: {
    fontFamily: F.mono,
    fontSize: 7.5,
    fontWeight: 700,
    letterSpacing: 0.8,
    color: RED,
    marginBottom: 3
  },
  riskBody: {
    fontSize: 8.5,
    lineHeight: 1.45,
    color: BODY
  },

  /* ---- Priorità / vincoli funzionali ---- */
  priorityBlock: {
    borderTopWidth: 2,
    borderTopColor: INK,
    marginTop: 16,
    paddingTop: 10
  },
  priorityHeadRow: {
    flexDirection: "row",
    alignItems: "flex-end"
  },
  priorityRank: {
    fontFamily: F.black,
    fontSize: 20,
    lineHeight: 1,
    color: GOLD_BRIGHT,
    marginRight: 12
  },
  priorityTitle: {
    flex: 1,
    fontFamily: F.black,
    fontSize: 14,
    lineHeight: 1,
    textTransform: "uppercase",
    color: INK
  },
  priorityScore: {
    fontFamily: F.mono,
    fontSize: 9.5,
    fontWeight: 700,
    color: GOLD
  },
  priorityField: {
    marginTop: 8
  },
  deprioritizeNote: {
    fontSize: 7.5,
    lineHeight: 1.55,
    color: FAINT,
    borderTopWidth: 1,
    borderTopColor: HAIRLINE,
    paddingTop: 10,
    marginTop: 16
  },

  /* ---- Matrice a tacche (pagina 05) ---- */
  matrixHead: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingBottom: 6,
    borderBottomWidth: 2,
    borderBottomColor: INK,
    marginTop: 16
  },
  matrixHeadText: {
    fontFamily: F.mono,
    fontSize: 6,
    letterSpacing: 1.5,
    color: MUTED
  },
  matrixHeadScore: {
    width: 40,
    textAlign: "right"
  },
  matrixRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: HAIRLINE
  },
  matrixRowBinding: {
    backgroundColor: GOLD_WASH,
    paddingHorizontal: 8,
    marginHorizontal: -8
  },
  matrixName: {
    fontSize: 9.5,
    fontWeight: 700,
    letterSpacing: 0.4,
    color: INK
  },
  matrixNameBinding: {
    color: GOLD
  },
  matrixSub: {
    fontFamily: F.mono,
    fontSize: 5.5,
    lineHeight: 1.4,
    color: MUTED,
    marginTop: 2,
    paddingRight: 8
  },
  matrixSubBinding: {
    color: GOLD
  },
  matrixScore: {
    width: 40,
    textAlign: "right",
    fontFamily: F.mono,
    fontSize: 11,
    fontWeight: 700,
    color: INK
  },
  matrixScoreBinding: {
    color: GOLD
  },
  legendRow: {
    flexDirection: "row",
    marginTop: 10
  },
  legendRowTight: {
    flexDirection: "row",
    marginTop: 8
  },
  legendItem: {
    fontFamily: F.mono,
    fontSize: 5.5,
    letterSpacing: 0.8,
    color: MUTED,
    marginRight: 14
  },

  /* ---- Box scuro (lettura operativa) ---- */
  darkBox: {
    backgroundColor: INK,
    padding: 16,
    marginTop: 16
  },
  darkBoxLabel: {
    fontFamily: F.mono,
    fontSize: 6.5,
    letterSpacing: 2,
    color: GOLD_BRIGHT,
    marginBottom: 6
  },
  darkBoxText: {
    fontSize: 9.5,
    lineHeight: 1.5,
    color: IVORY
  },

  /* ---- Pagina 06: radar + matrice ---- */
  radarRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 14
  },
  radarSideCol: {
    flex: 1,
    marginLeft: 18
  },
  miniMatrixHead: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingBottom: 5,
    borderBottomWidth: 2,
    borderBottomColor: INK
  },
  miniMatrixRow: {
    paddingVertical: 7,
    borderBottomWidth: 1,
    borderBottomColor: HAIRLINE
  },
  miniMatrixRowBinding: {
    backgroundColor: GOLD_WASH,
    paddingHorizontal: 7,
    marginHorizontal: -7
  },
  miniMatrixNameRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 5
  },
  miniMatrixName: {
    fontSize: 8,
    fontWeight: 700,
    letterSpacing: 0.4,
    color: INK
  },
  miniMatrixScore: {
    fontFamily: F.mono,
    fontSize: 9,
    fontWeight: 700,
    color: INK
  },

  /* ---- CTA finale ---- */
  ctaBox: {
    backgroundColor: INK,
    paddingVertical: 22,
    paddingHorizontal: 24,
    marginTop: 16
  },
  ctaLabel: {
    fontFamily: F.mono,
    fontSize: 6.5,
    letterSpacing: 2,
    color: GOLD_BRIGHT,
    marginBottom: 10
  },
  ctaTitle: {
    fontFamily: F.black,
    fontSize: 18,
    lineHeight: 1.1,
    textTransform: "uppercase",
    color: IVORY,
    marginBottom: 8
  },
  ctaBody: {
    fontSize: 8.5,
    lineHeight: 1.55,
    color: IVORY_SOFT,
    marginBottom: 8
  },
  ctaIntentLine: {
    fontSize: 8,
    lineHeight: 1.5,
    color: GOLD_BRIGHT,
    marginBottom: 12
  },
  ctaButtonRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4
  },
  ctaButton: {
    fontFamily: F.black,
    fontSize: 9.5,
    letterSpacing: 0.8,
    color: INK,
    backgroundColor: GOLD_BRIGHT,
    textDecoration: "none",
    paddingVertical: 10,
    paddingHorizontal: 16
  },
  ctaSmallText: {
    fontFamily: F.mono,
    fontSize: 6.5,
    color: MUTED,
    marginLeft: 14
  },
  answersChosen: {
    fontFamily: F.sans,
    fontWeight: 700,
    fontSize: 8.5,
    color: GOLD,
    marginTop: 3,
    marginBottom: 3
  },
  answersBridge: {
    fontFamily: F.sans,
    fontSize: 8.5,
    color: MUTED,
    marginTop: 6
  },
  answersBridgeLink: {
    fontFamily: F.sans,
    fontWeight: 700,
    fontSize: 8.5,
    color: GOLD,
    textDecoration: "none"
  },
  firstMoveBox: {
    backgroundColor: WASH,
    borderWidth: 1.5,
    borderColor: GOLD,
    padding: 12,
    marginTop: 10
  },
  letterBlock: {
    marginTop: 14,
    borderTopWidth: 2,
    borderTopColor: INK,
    paddingTop: 10
  },
  letterSign: {
    fontFamily: F.black,
    fontSize: 10,
    color: INK,
    marginTop: 4
  },
  letterRetest: {
    fontFamily: F.sans,
    fontSize: 7.5,
    color: MUTED,
    marginTop: 8
  },
  challengeBox: {
    backgroundColor: DARK,
    padding: 12,
    marginBottom: 12
  },
  challengeLabel: {
    fontFamily: F.sans,
    fontWeight: 700,
    fontSize: 6.5,
    letterSpacing: 1.5,
    color: GOLD_BRIGHT,
    marginBottom: 4
  },
  challengeQuote: {
    fontFamily: F.black,
    fontSize: 11,
    color: IVORY,
    lineHeight: 1.35
  },
  challengeNote: {
    fontFamily: F.sans,
    fontSize: 7.5,
    color: "#ADB9C6",
    marginTop: 5
  },
  letterCred: {
    fontFamily: F.sans,
    fontSize: 7,
    color: MUTED,
    marginTop: 3
  }
}));
