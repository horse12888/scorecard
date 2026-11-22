import { decisions, reportOffer } from "../reportDecision";
import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
  Link, Svg, Line, Polygon, Circle
} from "@react-pdf/renderer";

/* ============================================================
   IMPULSE PDF — v4.0 "EDITORIALE" (12/10/2026)
   Rifatto da zero sulla grafica del sito (Design A): Cormorant per
   titoli e testi, Jost per le etichette, blu notte / oro / crema.

   La sintesi presenta la decisione suggerita dalle risposte.
============================================================ */

const USE_CUSTOM_FONTS = true;
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
    /* solo Medium: il corsivo si usa sempre dalla famiglia "Cormorant".
       Lo stesso file in due famiglie fa sparire lettere nel PDF. */
    fonts: [{ src: FONT_DIR + "/Cormorant-Medium.woff" }]
  });
  Font.register({
    family: "Jost",
    fonts: [
      { src: FONT_DIR + "/Jost-Medium.woff" },
      { src: FONT_DIR + "/Jost-Medium.woff", fontWeight: 700 }
    ]
  });
}

const F = {
  display: USE_CUSTOM_FONTS ? "CormorantDisplay" : "Times-Roman",
  serif: USE_CUSTOM_FONTS ? "Cormorant" : "Times-Roman",
  sans: USE_CUSTOM_FONTS ? "Jost" : "Helvetica"
};

Font.registerHyphenationCallback((word) => [word]);

/* ---------------- Palette ---------------- */
const INK = "#13273B";
const DEEP = "#0B1928";
const PAPER = "#F8F5EE";
const BODY = "#22364A";
const MUTED = "#4B5866";
const SOFT = "#77828F";
const RULE = "#DCD6C8";
const RULE_STRONG = "#9AA3AD";
const GOLD = "#B88A2A";
const GOLD_INK = "#86651E";
const GOLD_BRIGHT = "#C9A24B";
const ALERT = "#8E2A1E";
const IVORY = "#F4EFE4";
const IVORY_SOFT = "#CFC8B8";
const DARK_MUTED = "#96A3B0";
const DARK_RULE = "#2A3B4C";
const TICK_EMPTY = "#E5DFCE";
const TICK_EMPTY_GOLD = "#ECE2C8";

/* ---------------- Tipi ---------------- */
type DimensionKey =
  | "clarity"
  | "acquisition"
  | "operations"
  | "margins"
  | "asset"
  | "readiness";

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
  stagingScore?: number;
  bindingConstraint?: string;
  diagnosticPattern?: any;
  riskFlags?: any[];
  intentInsight?: any;
  intentLevel?: number | null;
};

/* ---------------- Testi fissi ---------------- */
const DIM_ORDER: DimensionKey[] = [
  "clarity",
  "acquisition",
  "operations",
  "margins",
  "asset",
  "readiness"
];

const DIM_IT: Record<string, string> = {
  clarity: "Chiarezza",
  acquisition: "Acquisizione clienti",
  operations: "Operatività",
  margins: "Margini",
  asset: "Valore trasferibile",
  readiness: "Prontezza"
};

const DIM_COPY: Record<string, string> = {
  clarity: "Cosa vendi, a chi e perché ti scelgono.",
  acquisition: "Da dove arrivano i clienti e quanto è regolare il flusso.",
  operations: "Come consegni il lavoro e quanto passa ancora da te.",
  margins: "Quanto resta di ogni vendita e quanta cassa hai.",
  asset: "Quello che resta nel business anche senza di te.",
  readiness: "Quanto il business si capisce da fuori: numeri, ruoli, materiali."
};

const DIM_SHORT: Record<string, string> = {
  clarity: "Chiarezza",
  acquisition: "Clienti",
  operations: "Operatività",
  margins: "Margini",
  asset: "Valore",
  readiness: "Prontezza"
};

const STAGE_BANDS = [
  { name: "Avvio", from: 0, to: 40 },
  { name: "Crescita", from: 40, to: 60 },
  { name: "Stabilità", from: 60, to: 75 },
  { name: "Offerta definita", from: 75, to: 85 },
  { name: "Pronto a scalare", from: 85, to: 100 }
];

/* ---------------- Utilità ---------------- */
function txt(value: any, fallback = "") {
  if (value === null || value === undefined) return fallback;
  const s = String(value).trim();
  return s || fallback;
}

function stageFromScore(score: number) {
  const s = Math.max(0, Math.min(100, Number(score) || 0));
  for (const b of STAGE_BANDS) {
    if (s < b.to || b.to === 100) return b.name;
  }
  return "Crescita";
}

function dimName(key?: string) {
  return DIM_IT[String(key || "")] || txt(key);
}

function fmtScore(n: any) {
  return (Math.round((Number(n) || 0) * 10) / 10).toFixed(1).replace(".", ",");
}

function scoreStatus(score: number) {
  if (score >= 7) return "Forza";
  if (score < 4) return "Vincolo";
  return "In sviluppo";
}

function reportDate() {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, "0");
  return `${p(d.getDate())}.${p(d.getMonth() + 1)}.${d.getFullYear()}`;
}

/* ============================================================
   Strumenti grafici
============================================================ */

function TickBar({ score, accent, h = 9 }: { score: number; accent?: boolean; h?: number }) {
  const clamped = Math.max(0, Math.min(10, Number(score) || 0));
  const filled = Math.floor(clamped);
  const frac = Math.round((clamped - filled) * 100) / 100;
  const fill = accent ? GOLD : INK;
  const empty = accent ? TICK_EMPTY_GOLD : TICK_EMPTY;
  return (
    <View style={{ flexDirection: "row" }}>
      {Array.from({ length: 10 }).map((_, i) => {
        const full = i < filled;
        const part = i === filled && frac >= 0.08;
        return (
          <View
            key={i}
            style={{
              flex: 1,
              height: h,
              marginRight: i < 9 ? 2.5 : 0,
              backgroundColor: full ? fill : empty
            }}
          >
            {part ? (
              <View style={{ width: `${Math.round(frac * 100)}%`, height: h, backgroundColor: fill }} />
            ) : null}
          </View>
        );
      })}
    </View>
  );
}

function polar(cx: number, cy: number, r: number, deg: number) {
  const rad = (deg * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy - r * Math.sin(rad) };
}

function Radar({
  dims,
  binding
}: {
  dims: Record<DimensionKey, { score: number; yes: number }>;
  binding?: string;
}) {
  const W = 220;
  const H = 154;
  const cx = W / 2;
  const cy = H / 2 + 2;
  const R = 54;
  const ang = (i: number) => 90 - i * 60;
  const ring = (r: number) =>
    DIM_ORDER.map((_, i) => {
      const p = polar(cx, cy, r, ang(i));
      return `${p.x.toFixed(2)},${p.y.toFixed(2)}`;
    }).join(" ");
  const pts = DIM_ORDER.map((k, i) => {
    const s = Math.max(0, Math.min(10, Number(dims?.[k]?.score || 0)));
    const p = polar(cx, cy, (s / 10) * R, ang(i));
    return { k, x: p.x, y: p.y };
  });
  return (
    <Svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
      {[R * 0.4, R * 0.7].map((r, i) => (
        <Polygon key={i} points={ring(r)} stroke="#D8D2C2" strokeWidth={0.7} fill="none" />
      ))}
      <Polygon points={ring(R)} stroke={INK} strokeWidth={1} fill="none" />
      {DIM_ORDER.map((_, i) => {
        const p = polar(cx, cy, R, ang(i));
        return <Line key={i} x1={cx} y1={cy} x2={p.x} y2={p.y} stroke="#D8D2C2" strokeWidth={0.7} />;
      })}
      <Polygon
        points={pts.map((p) => `${p.x.toFixed(2)},${p.y.toFixed(2)}`).join(" ")}
        fill={GOLD}
        fillOpacity={0.2}
        stroke={GOLD}
        strokeWidth={1.4}
      />
      {pts.map((p) => (
        <Circle
          key={p.k}
          cx={p.x}
          cy={p.y}
          r={p.k === binding ? 4 : 2.3}
          fill={p.k === binding ? GOLD : PAPER}
          stroke={GOLD}
          strokeWidth={1.1}
        />
      ))}
      {DIM_ORDER.map((k, i) => {
        const deg = ang(i);
        const p = polar(cx, cy, R + 12, deg);
        const cos = Math.cos((deg * Math.PI) / 180);
        const anchor = cos > 0.35 ? "start" : cos < -0.35 ? "end" : "middle";
        return (
          <Text
            key={k}
            x={p.x}
            y={p.y + 2.5}
            textAnchor={anchor as any}
            style={{ fontFamily: F.sans, fontSize: 6.5, fill: k === binding ? GOLD_INK : INK }}
          >
            {DIM_SHORT[k].toUpperCase()}
          </Text>
        );
      })}
    </Svg>
  );
}

function Diamond({ size = 5 }: { size?: number }) {
  return (
    <View
      style={{
        width: size,
        height: size,
        backgroundColor: GOLD,
        transform: "rotate(45deg)",
        marginLeft: 6
      }}
    />
  );
}

/* Barra delle fasi: 5 segmenti proporzionali, marcatore sul punteggio */
function StageScale({ score, dark, labels }: { score: number; dark?: boolean; labels?: boolean }) {
  const s = Math.max(0, Math.min(100, Number(score) || 0));
  const current = stageFromScore(s);
  return (
    <View>
      <View style={{ position: "relative", height: 10, justifyContent: "center" }}>
        <View style={{ flexDirection: "row", height: 3 }}>
          {STAGE_BANDS.map((b, i) => (
            <View
              key={b.name}
              style={{
                width: `${b.to - b.from}%`,
                height: 3,
                marginRight: i < STAGE_BANDS.length - 1 ? 2 : 0,
                backgroundColor:
                  b.name === current ? (dark ? GOLD_BRIGHT : GOLD) : dark ? DARK_RULE : TICK_EMPTY
              }}
            />
          ))}
        </View>
        <View
          style={{
            position: "absolute",
            left: `${s}%`,
            top: 1,
            width: 8,
            height: 8,
            marginLeft: -4,
            borderRadius: 4,
            backgroundColor: dark ? IVORY : INK,
            borderWidth: 1.5,
            borderColor: dark ? DEEP : PAPER
          }}
        />
      </View>
      {labels ? (
      <View style={{ flexDirection: "row", marginTop: 7 }}>
        {STAGE_BANDS.map((b) => (
          <Text
            key={b.name}
            style={{
              width: `${b.to - b.from}%`,
              fontFamily: F.sans,
              fontSize: 8,
              letterSpacing: 0.2,
              color:
                b.name === current ? (dark ? GOLD_BRIGHT : GOLD_INK) : dark ? DARK_MUTED : SOFT
            }}
          >
            {b.name.toUpperCase()}
          </Text>
        ))}
      </View>
      ) : (
      <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 6 }}>
        <Text style={{ fontFamily: F.sans, fontSize: 8, letterSpacing: 0.5, color: dark ? DARK_MUTED : SOFT }}>0</Text>
        <Text style={{ fontFamily: F.sans, fontSize: 8, letterSpacing: 0.5, color: dark ? DARK_MUTED : SOFT }}>100</Text>
      </View>
      )}
    </View>
  );
}

/* ---------------- Parti ricorrenti ---------------- */

function Header({ who }: { who: string }) {
  return (
    <View style={s.header} fixed>
      <Text style={s.headerMark}>IMPULSE</Text>
      <Text style={s.headerMeta}>{who ? `${who.toUpperCase()} · ` : ""}REPORT DIAGNOSTICO</Text>
    </View>
  );
}

function Footer() {
  return (
    <View style={s.footer} fixed>
      <Text style={s.footerText}>RISERVATO E CONFIDENZIALE · DAVIDEDILEO.IT</Text>
      <Text
        style={s.footerText}
        render={({ pageNumber, totalPages }) =>
          `${String(pageNumber).padStart(2, "0")} / ${String(totalPages).padStart(2, "0")}`
        }
      />
    </View>
  );
}

function Head({ n, kicker, title, intro }: { n: string; kicker: string; title: string; intro?: string }) {
  return (
    <View style={s.head}>
      <Text style={s.kicker}>{`${n} · ${kicker}`.toUpperCase()}</Text>
      <Text style={s.title}>{title}</Text>
      {intro ? <Text style={s.intro}>{intro}</Text> : null}
    </View>
  );
}

function Label({ children, tone }: { children: any; tone?: "gold" | "alert" | "muted" | "light" }) {
  const color =
    tone === "alert" ? ALERT : tone === "muted" ? SOFT : tone === "light" ? GOLD_BRIGHT : GOLD_INK;
  return <Text style={[s.label, { color }]}>{children}</Text>;
}

/* ============================================================
   Documento
============================================================ */

export function ImpulsePdfDocument({ result }: { result: PdfResult }) {
  const assembled = (result as any).assembled || {};
  const score = Math.max(0, Math.min(100, Math.round(Number(result.overall || 0))));
  const name = txt(result.name);
  const company = txt(result.company);
  const who = name || company;

  const dims = result.dimensions;
  const binding = DIM_ORDER.find((key) => key === result.bindingConstraint) ??
    [...DIM_ORDER].sort((a, b) => Number(dims[a]?.score || 0) - Number(dims[b]?.score || 0))[0];
  const decision = decisions[binding];
  const bindingName = dimName(binding);

  const stageName = stageFromScore(score);

  const ranked = [...DIM_ORDER].sort((a, b) => {
    if (a === binding) return -1;
    if (b === binding) return 1;
    const d = Number(dims[a]?.score || 0) - Number(dims[b]?.score || 0);
    return d !== 0 ? d : DIM_ORDER.indexOf(a) - DIM_ORDER.indexOf(b);
  });

  const priorities = ranked.slice(0, 3);
  const costly = assembled.costlyAnswers || [];

  /* link: stessi parametri della pagina risultato */
  const leadId = txt(result.leadId || result.metadata?.leadId);
  const utm: Record<string, string> = result.metadata?.utm || {};
  const isTest = !!result.metadata?.isTest;

  const reviewParams = new URLSearchParams();
  Object.keys(utm).forEach((k) => utm[k] && reviewParams.set(k, String(utm[k])));
  if (isTest) reviewParams.set("test", "1");
  if (leadId) reviewParams.set("leadId", leadId);
  reviewParams.set("v", binding);
  const reviewUrl =
    "https://davidedileo.it/strategic-review?" +
    reviewParams.toString() +
    (leadId ? `#leadId=${encodeURIComponent(leadId)}` : "");

  const kitParams = new URLSearchParams();
  kitParams.set("utm_source", "report");
  kitParams.set("utm_medium", "pdf");
  kitParams.set("utm_campaign", "kit_report");
  if (leadId) kitParams.set("lead", leadId);
  kitParams.set("v", binding);
  if (isTest) kitParams.set("test", "1");
  const kitUrl = "https://davidedileo.it/kit?" + kitParams.toString();

  const route = reportOffer(result);

  return (
    <Document
      title={`Report IMPULSE${who ? " · " + who : ""}`}
      author="Davide di Leo · IMPULSE"
      subject="Report diagnostico IMPULSE"
      language="it"
    >
      {/* ===================== 01 COPERTINA ===================== */}
      <Page size="A4" style={s.cover}>
        <View style={s.coverTop}>
          <Text style={s.coverMark}>IMPULSE</Text>
          <View>
            <Text style={s.coverMeta}>{reportDate()}</Text>
            <Text style={s.coverMeta}>RISERVATO E CONFIDENZIALE</Text>
          </View>
        </View>

        <View style={s.coverTitleBlock}>
          <Text style={s.coverKicker}>REPORT DIAGNOSTICO</Text>
          <Text style={s.coverTitle}>Cosa frena</Text>
          <Text style={[s.coverTitle, s.coverTitleGold]}>il tuo business.</Text>
          <View style={s.coverFor}>
            <Text style={s.coverForText}>
              Preparato per <Text style={s.coverForName}>{name || "te"}</Text>
              {company ? ` · ${company}` : ""}
            </Text>
          </View>
        </View>

        <View style={{ flexGrow: 1 }} />

        <View style={s.coverBand}>
          <View style={s.coverBindCell}>
            <Text style={s.coverLabel}>IL TUO VINCOLO PRINCIPALE</Text>
            <Text style={s.coverBind}>{bindingName}</Text>

            <Text style={s.coverProfileBody}>{DIM_COPY[binding]}</Text>
          </View>
          <View style={s.coverScoreCell}>
            <Text style={s.coverLabel}>PUNTEGGIO IMPULSE</Text>
            <View style={s.coverScoreRow}>
              <Text style={s.coverScore}>{String(score)}</Text>
              <Text style={s.coverScoreOf}>/100</Text>
            </View>
            <StageScale score={score} dark />
            <Text style={s.coverStage}>
              Fase: <Text style={{ color: IVORY }}>{stageName}</Text>
            </Text>
          </View>
        </View>

        <Text style={s.coverNote}>
          Diagnosi operativa generata dalle tue risposte. Non è consulenza finanziaria, legale o fiscale.
        </Text>
      </Page>

      {/* ===================== 02 IN SINTESI ===================== */}
      <Page size="A4" style={s.page}>
        <Header who={who} />
        <Head
          n="02"
          kicker="In sintesi"
          title="La decisione da prendere"
          intro={`Dalle risposte sulle sei aree emerge una priorità: ${bindingName.toLowerCase()}.`}
        />
        <View style={s.block}>
          <Label>La decisione</Label>
          <Text style={s.lead}>{decision.question}</Text>
        </View>
        <View style={s.block}>
          <Label>Perché conta</Label>
          <Text style={s.body}>{decision.reason}</Text>
        </View>
        <View style={s.block}>
          <Label>Le prime tre aree in ordine di priorità</Label>
          {priorities.map(key => <Text key={key} style={s.body}>{dimName(key)} · {fmtScore(dims[key]?.score)} su 10</Text>)}
        </View>

        <View style={{ flexGrow: 1 }} />

        <View style={s.toc} wrap={false}>
          <Label tone="muted">Nelle prossime pagine</Label>
          <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
            {[
              ["03", "Le tue risposte"],
              ["04", "La mappa delle sei aree"],
              ["05", "Cosa sistemare prima"],
              ["06", "Le conseguenze sul lavoro"],
              ["07", "La fase del business"],
              ["08", "Il prossimo passo"]
            ].map(([n, t]) => (
              <View key={n} style={s.tocItem}>
                <Text style={s.tocNum}>{n}</Text>
                <Text style={s.tocText}>{t}</Text>
              </View>
            ))}
          </View>
        </View>

        <Footer />
      </Page>

      {/* ===================== 03 PERCHÉ TI FRENA ===================== */}
      <Page size="A4" style={s.page}>
        <Header who={who} />
        <Head
          n="03"
          kicker="Perché ti frena"
          title="Le risposte che hanno pesato"
          intro="Qui puoi rileggere le domande e le risposte disponibili per questo report."
        />

        {(result as any).challenge ? (
          <View style={s.quoteBox} wrap={false}>
            <Label tone="muted">La sfida che hai scritto</Label>
            <Text style={s.quote}>{`«${String((result as any).challenge)}»`}</Text>
          </View>
        ) : null}

        {costly.length > 0 ? (
          costly.slice(0, 3).map((ca: any, i: number) => (
            <View key={ca.id || i} style={s.answer} wrap={false}>
              <Label>{`${String(i + 1).padStart(2, "0")} · ${dimName(ca.dimension)}`}</Label>
              <Text style={s.answerQ}>{txt(ca.text)}</Text>
              <Text style={s.answerChosen}>{`Hai risposto: «${txt(ca.chosenText)}»`}</Text>
            </View>
          ))
        ) : (
          <View style={s.block}>
            <Text style={s.body}>Per questo report abbiamo i punteggi delle aree. Li trovi nella pagina successiva.</Text>
          </View>
        )}

        <View style={s.block} wrap={false}>
          <Label>Come leggere queste risposte</Label>
          <Text style={s.body}>{binding === "margins" ? "Dal solo fatturato non puoi sapere quanto lascia una commessa. Per quella decisione servono anche i costi diretti e le ore di lavoro." : "Le risposte descrivono come vedi il lavoro oggi. Contratti, conti e prestazioni effettive richiedono una verifica separata."}</Text>
        </View>
        <Footer />
      </Page>

      {/* ===================== 04 LE SEI AREE ===================== */}
      <Page size="A4" style={s.page}>
        <Header who={who} />
        <Head
          n="04"
          kicker="Le sei aree"
          title="Le sei aree, in ordine di priorità"
          intro="Il punto dorato indica la priorità. Le barre sotto il grafico riportano i punteggi su 10."
        />

        <View style={{ alignItems: "center" }}><Radar dims={dims} binding={binding} /></View>
        {ranked.map((k) => {
          const sc = Number(dims[k]?.score || 0);
          const isB = k === binding;
          return (
            <View key={k} style={[s.areaRow, isB ? s.areaRowB : {}]} wrap={false}>
              <View style={s.areaName}>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Text style={[s.areaTitle, isB ? { color: GOLD_INK } : {}]}>{dimName(k)}</Text>
                  {isB ? <Diamond size={4.5} /> : null}
                </View>
                <Text style={s.areaSub}>
                  {(isB ? "Vincolo principale" : scoreStatus(sc)).toUpperCase()}
                </Text>
              </View>
              <View style={{ flex: 1, justifyContent: "center", paddingTop: 2 }}>
                <TickBar score={sc} accent={isB} />
                <Text style={s.areaCopy}>{DIM_COPY[k]}</Text>
              </View>
              <Text style={[s.areaScore, isB ? { color: GOLD_INK } : {}]}>{fmtScore(sc)}</Text>
            </View>
          );
        })}

        <View style={s.block} wrap={false}>
          <Label>Come leggere i punteggi</Label>
          <Text style={s.body}>Sotto 4 l’area richiede attenzione. Da 4 a meno di 7 è in sviluppo. Da 7 in su è un punto di forza. Il punteggio complessivo è una media pesata delle sei aree.</Text>
        </View>
        <Footer />
      </Page>

      {/* ===================== 05 COSA SISTEMARE PRIMA ===================== */}
      <Page size="A4" style={s.page}>
        <Header who={who} />
        <Head
          n="05"
          kicker="Le priorità"
          title="Cosa sistemare prima."
          intro="Per ogni area trovi la decisione aperta e gli elementi utili per prenderla."
        />

        {priorities.map((key, i) => (
          <View key={key} style={s.prio} wrap={false}>
            <View style={s.prioHead}>
              <Text style={s.prioNum}>{String(i + 1).padStart(2, "0")}</Text>
              <Text style={s.prioName}>{dimName(key)}</Text>
              <Text style={s.prioScore}>{fmtScore(dims[key]?.score)} / 10</Text>
            </View>
            <Text style={s.lead}>{decisions[key].question}</Text>
            <View style={{ marginTop: 8 }}>
              <Label tone="muted">Cosa guardare</Label>
              <Text style={s.body}>{decisions[key].evidence}</Text>
            </View>
          </View>
        ))}
        <Footer />
      </Page>

      {/* ===================== 06 DOVE IL SISTEMA PERDE LEVA ===================== */}
      <Page size="A4" style={s.page}>
        <Header who={who} />
        <Head
          n="06"
          kicker="Le conseguenze"
          title="Cosa può succedere nel lavoro"
          intro="Tre possibili conseguenze delle aree evidenziate nelle risposte."
        />
        {priorities.map(key => (
          <View key={key} style={s.block} wrap={false}>
            <Label>{dimName(key)}</Label>
            <Text style={s.lead}>{decisions[key].consequence}</Text>
          </View>
        ))}
        <Footer />
      </Page>

      {/* ===================== 07 LA FASE ===================== */}
      <Page size="A4" style={s.page}>
        <Header who={who} />
        <Head n="07" kicker="La fase del business" title={stageName}
          intro={`Il tuo punteggio complessivo è ${score} su 100. Nell’assessment corrisponde alla fase «${stageName}».`} />
        <View style={s.stageScaleWrap}><StageScale score={score} labels /></View>
        <View style={s.block}><Label>Come leggere la fase</Label>
          <Text style={s.body}>La fase riassume le risposte su tutte le aree. Anche un’azienda che vende da anni può ottenere un punteggio basso se la gestione dipende da poche persone o se i margini sono difficili da leggere.</Text>
        </View>
        <View style={s.block}><Label>Nel tuo caso</Label>
          <Text style={s.lead}>{dimName(binding)} · {fmtScore(dims[binding]?.score)} su 10</Text>
          <Text style={s.body}>Il punteggio complessivo comprende anche le altre cinque aree. Per capire perché emerge questa priorità, puoi rileggere le tue risposte a pagina 3.</Text>
        </View>
        <View style={s.block}><Label>Le fasce di punteggio</Label>
          {STAGE_BANDS.map(b => <Text key={b.name} style={s.body}>{b.from}–{b.to === 100 ? 100 : b.to - 1}   {b.name}</Text>)}
        </View>
        <Footer />
      </Page>

      {/* ===================== 08 IL PROSSIMO PASSO ===================== */}
      <Page size="A4" style={s.page}>
        <Header who={who} />
        <Head n="08" kicker="Il prossimo passo" title="Come proseguire" />

        <View style={s.block}>
          <Label>La tua priorità · {bindingName}</Label>
          <Text style={s.lead}>{decision.question}</Text>
        </View>
        <View style={{ flexGrow: 1 }} />
        <View style={s.cta} wrap={false}>
          <Text style={s.ctaKicker}>KIT E STRATEGIC REVIEW</Text>
          <Text style={s.ctaTitle}>{route === "review" ? "Discuti la decisione con Davide" : "Prepara il tuo piano con il Kit"}</Text>
          {(route === "review" ? ["review", "kit"] : ["kit", "review"]).map((option) => (
            <View key={option} style={{ marginTop: 12 }}>
              {option === "kit" ? (
                <>
                  <Text style={s.ctaBody}>Apri la guida per la tua priorità. Nel foglio Google scegli tre interventi, assegni le scadenze e segui i progressi per 90 giorni. Se passi alla Review entro 30 giorni, i €47 vengono scalati dal prezzo.</Text>
                  <Link src={kitUrl} style={route === "kit" ? s.ctaPrimary : s.ctaAlt}>{binding === "margins" ? "Lavora in autonomia sui tuoi margini · Kit €47" : "Voglio lavorarci in autonomia · Kit €47"}</Link>
                </>
              ) : (
                <>
                  <Text style={s.ctaBody}>Se devi prendere una decisione e vuoi un confronto, esaminiamo il tuo caso in 45 minuti. Entro 48 ore ti consegno la Priority Map scritta.</Text>
                  <Link src={reviewUrl} style={route === "review" ? s.ctaPrimary : s.ctaAlt}>Voglio discuterne con Davide · Review €350</Link>
                </>
              )}
            </View>
          ))}
        </View>

        <View style={s.letter} wrap={false}>
          <Label tone="muted">Una nota personale</Label>
          <Text style={s.letterText}>Se decidi di ripetere l’assessment, conserva questo report: potrai confrontare le risposte e vedere quali priorità sono cambiate.</Text>
          <Text style={s.letterSign}>Davide</Text>
          <Text style={s.letterCred}>Sono cofondatore e COO di una fintech che si occupa di tokenizzazione. Ho costruito IMPULSE con il supporto dell’AI, partendo dai criteri che uso nel mio lavoro.</Text>
          {txt(assembled.retestDate) ? (
            <Text style={s.letterRetest}>{`Rifai lo scorecard il ${assembled.retestDate} e confronta i numeri.`}</Text>
          ) : null}
          {leadId ? <Text style={s.code}>{`Codice report: ${leadId}`}</Text> : null}
        </View>

        <Footer />
      </Page>
    </Document>
  );
}

/* ============================================================
   Stili
============================================================ */
const s = StyleSheet.create({
  /* ---- pagina ---- */
  page: {
    paddingTop: 62,
    paddingBottom: 58,
    paddingHorizontal: 54,
    backgroundColor: PAPER,
    color: BODY,
    fontFamily: F.serif
  },
  header: {
    position: "absolute",
    top: 26,
    left: 54,
    right: 54,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: 7,
    borderBottomWidth: 0.6,
    borderBottomColor: RULE
  },
  headerMark: { fontFamily: F.display, fontSize: 10.5, letterSpacing: 2.6, color: INK },
  headerMeta: { fontFamily: F.sans, fontSize: 6.3, letterSpacing: 1.4, color: SOFT },
  footer: {
    position: "absolute",
    bottom: 24,
    left: 54,
    right: 54,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 7,
    borderTopWidth: 0.6,
    borderTopColor: RULE
  },
  footerText: { fontFamily: F.sans, fontSize: 7.1, letterSpacing: 1, color: MUTED },

  head: { marginBottom: 20 },
  kicker: { fontFamily: F.sans, fontSize: 7.6, letterSpacing: 2.2, color: GOLD_INK, marginBottom: 8 },
  title: { fontFamily: F.display, fontSize: 33, lineHeight: 1.08, color: INK, letterSpacing: -0.3 },
  intro: { marginTop: 9, fontSize: 13.5, lineHeight: 1.4, color: MUTED, maxWidth: 440 },

  label: { fontFamily: F.sans, fontSize: 8.5, letterSpacing: 1.1, marginBottom: 5, textTransform: "uppercase" },
  body: { fontSize: 14, lineHeight: 1.42, color: BODY },
  bodyMid: { fontSize: 12.2, lineHeight: 1.38, color: BODY },
  bodySmall: { fontSize: 11.4, lineHeight: 1.36, color: BODY },
  small: { fontSize: 11, lineHeight: 1.35, color: MUTED },
  lead: { fontFamily: F.display, fontSize: 16, lineHeight: 1.3, color: INK },
  block: { marginTop: 14, paddingTop: 11, borderTopWidth: 0.6, borderTopColor: RULE },
  twoCol: { flexDirection: "row", marginTop: 14, paddingTop: 11, borderTopWidth: 0.6, borderTopColor: RULE },
  twoColTight: { flexDirection: "row", marginTop: 8 },
  col: { flex: 1, paddingRight: 14 },

  /* ---- copertina ---- */
  cover: {
    paddingTop: 46,
    paddingBottom: 38,
    paddingHorizontal: 54,
    backgroundColor: DEEP,
    color: IVORY,
    fontFamily: F.serif
  },
  coverTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  coverMark: { fontFamily: F.display, fontSize: 17, letterSpacing: 3.2, color: IVORY },
  coverMeta: { fontFamily: F.sans, fontSize: 6.6, letterSpacing: 1.4, color: DARK_MUTED, textAlign: "right", lineHeight: 1.8 },
  coverTitleBlock: { marginTop: 92 },
  coverKicker: { fontFamily: F.sans, fontSize: 8, letterSpacing: 3, color: GOLD_BRIGHT, marginBottom: 18 },
  coverTitle: { fontFamily: F.display, fontSize: 60, lineHeight: 1.02, color: IVORY, letterSpacing: -0.6 },
  coverTitleGold: { fontFamily: F.serif, fontStyle: "italic", color: GOLD_BRIGHT },
  coverFor: { flexDirection: "row", alignItems: "center", marginTop: 26 },
  coverForText: { fontSize: 14, color: IVORY_SOFT },
  coverForName: { color: IVORY, fontWeight: 600 },
  coverBand: { flexDirection: "row", borderTopWidth: 0.8, borderTopColor: DARK_RULE, borderBottomWidth: 0.8, borderBottomColor: DARK_RULE, paddingVertical: 22 },
  coverBindCell: { flex: 1.25, paddingRight: 22, borderRightWidth: 0.8, borderRightColor: DARK_RULE },
  coverScoreCell: { flex: 1, paddingLeft: 22 },
  coverLabel: { fontFamily: F.sans, fontSize: 6.8, letterSpacing: 1.8, color: GOLD_BRIGHT, marginBottom: 8 },
  coverBind: { fontFamily: F.serif, fontStyle: "italic", fontSize: 40, lineHeight: 1, color: GOLD_BRIGHT, marginBottom: 8 },
  coverProfile: { fontFamily: F.display, fontSize: 15.5, color: IVORY, marginBottom: 5 },
  coverProfileBody: { fontSize: 11.8, lineHeight: 1.38, color: IVORY_SOFT },
  coverScoreRow: { flexDirection: "row", alignItems: "flex-end", marginBottom: 12 },
  coverScore: { fontFamily: F.display, fontSize: 52, lineHeight: 0.9, color: IVORY },
  coverScoreOf: { fontFamily: F.sans, fontSize: 9, color: DARK_MUTED, marginLeft: 6, marginBottom: 6 },
  coverStage: { marginTop: 12, fontSize: 13, color: IVORY_SOFT },
  coverNote: { marginTop: 14, fontSize: 9.5, lineHeight: 1.4, color: DARK_MUTED },

  /* ---- 02 sintesi ---- */
  moveText: { fontSize: 13.4, lineHeight: 1.42, color: INK },
  antiText: { fontSize: 12.6, lineHeight: 1.4, color: BODY, fontStyle: "italic" },
  toc: { paddingTop: 10, borderTopWidth: 0.6, borderTopColor: RULE },
  tocItem: { width: "50%", flexDirection: "row", alignItems: "baseline", marginTop: 4 },
  tocNum: { width: 22, fontFamily: F.sans, fontSize: 7, letterSpacing: 1, color: GOLD_INK },
  tocText: { fontSize: 11.6, color: BODY },

  /* ---- 03 perché ti frena ---- */
  quoteBox: { marginBottom: 6, paddingBottom: 12, borderBottomWidth: 0.6, borderBottomColor: RULE },
  quote: { fontStyle: "italic", fontSize: 16, lineHeight: 1.35, color: INK },
  answer: { paddingTop: 11, paddingBottom: 12, borderBottomWidth: 0.6, borderBottomColor: RULE },
  answerCheck: { fontSize: 12.2, color: BODY, marginTop: 4, lineHeight: 1.35 },
  answerQ: { fontFamily: F.display, fontSize: 15.5, lineHeight: 1.25, color: INK, marginBottom: 3 },
  answerChosen: { fontStyle: "italic", fontSize: 12.6, color: GOLD_INK, marginBottom: 4 },

  /* ---- 04 mappa ---- */
  areaRow: { flexDirection: "row", alignItems: "center", paddingVertical: 6, paddingHorizontal: 6, borderBottomWidth: 0.5, borderBottomColor: RULE },
  areaRowB: { backgroundColor: "#F3EBD6" },
  areaName: { width: 140, paddingRight: 8 },
  areaTitle: { fontFamily: F.display, fontSize: 17, color: INK },
  areaSub: { fontFamily: F.sans, fontSize: 9, letterSpacing: 0.5, color: MUTED, marginTop: 2 },
  areaCopy: { fontSize: 12, lineHeight: 1.3, color: MUTED, marginTop: 4 },
  areaScore: { width: 50, textAlign: "right", fontFamily: F.display, fontSize: 19, color: INK },

  /* ---- 05/06 priorità e punti deboli ---- */
  prio: { paddingTop: 10, paddingBottom: 10, borderTopWidth: 0.8, borderTopColor: RULE_STRONG },
  prioHead: { flexDirection: "row", alignItems: "baseline", marginBottom: 5 },
  prioNum: { width: 28, fontFamily: F.display, fontSize: 19, color: GOLD },
  prioName: { flex: 1, fontFamily: F.display, fontSize: 18, color: INK },
  prioScore: { fontFamily: F.sans, fontSize: 8, letterSpacing: 1, color: GOLD_INK },
  pairBox: { marginTop: 10, paddingVertical: 14, paddingHorizontal: 18, backgroundColor: INK },
  pairTitle: { fontFamily: F.display, fontSize: 18, color: IVORY, marginBottom: 5 },
  pairBody: { fontSize: 12, lineHeight: 1.38, color: IVORY_SOFT },
  pairFocus: { marginTop: 8, fontSize: 12, lineHeight: 1.4, color: IVORY },
  riskRow: { marginTop: 6 },
  riskTitle: { fontFamily: F.display, fontSize: 14, color: ALERT, marginBottom: 1 },

  /* ---- 07 fase ---- */
  stageScaleWrap: { marginBottom: 2, paddingTop: 12, borderTopWidth: 0.8, borderTopColor: RULE_STRONG },
  checkRow: { flexDirection: "row", alignItems: "flex-start", marginTop: 5 },
  checkBox: { width: 8, height: 8, borderWidth: 0.9, borderColor: GOLD, marginTop: 4, marginRight: 10 },
  checkText: { flex: 1, fontSize: 11.4, lineHeight: 1.34, color: BODY },

  /* ---- 08 prossimo passo ---- */
  cta: { padding: 22, backgroundColor: DEEP },
  ctaKicker: { fontFamily: F.sans, fontSize: 7.2, letterSpacing: 2, color: GOLD_BRIGHT, marginBottom: 8 },
  ctaTitle: { fontFamily: F.display, fontSize: 24, lineHeight: 1.12, color: IVORY, marginBottom: 8 },
  ctaBody: { fontSize: 12.4, lineHeight: 1.42, color: IVORY_SOFT },
  ctaPrimary: { fontFamily: F.sans, marginTop: 6, padding: 7, backgroundColor: IVORY, color: INK, fontSize: 13, textDecoration: "none" },
  ctaAlt: { fontFamily: F.sans, marginTop: 5, fontSize: 13, color: GOLD_BRIGHT, textDecoration: "underline" },
  letter: { marginTop: 18, paddingTop: 12, borderTopWidth: 0.6, borderTopColor: RULE },
  letterText: { fontSize: 12.4, lineHeight: 1.42, color: BODY },
  letterSign: { marginTop: 8, fontFamily: F.serif, fontStyle: "italic", fontSize: 18, color: INK },
  letterCred: { marginTop: 3, fontSize: 10.2, lineHeight: 1.35, color: SOFT },
  letterRetest: { marginTop: 6, fontSize: 11, color: GOLD_INK, fontStyle: "italic" },
  code: { marginTop: 6, fontFamily: F.sans, fontSize: 6, letterSpacing: 1, color: SOFT }
});
