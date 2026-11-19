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
   IMPULSE PDF — v4.0 "EDITORIALE" (12/10/2026)
   Rifatto da zero sulla grafica del sito (Design A): Cormorant per
   titoli e testi, Jost per le etichette, blu notte / oro / crema.

   La sintesi apre con una prova da fare sul lavoro. Le sei aree sono
   ordinate dalla priorità principale; entrambe le offerte restano accessibili.

   LOGICA DATI: invariata. I testi arrivano dall'assembler (state +
   assembled); qui si sceglie solo cosa mostrare e come.
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
const CREAM = "#F5EDD8";
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

const FIELDWORK: Record<DimensionKey, { task: string; evidence: string }> = {
  clarity: {
    task: "Confronta gli ultimi tre preventivi. Sottolinea il problema del cliente, il risultato proposto e come lo descrivi.",
    evidence: "Hai scritto una frase che un cliente reale riconoscerebbe e hai individuato il preventivo in cui quella promessa è più chiara."
  },
  acquisition: {
    task: "Riprendi le ultime dieci richieste commerciali. Per ciascuna segna da dove è arrivata e come è finita.",
    evidence: "Puoi indicare quante richieste ha generato ogni fonte e quante sono diventate clienti. Segna i casi di origine sconosciuta."
  },
  operations: {
    task: "Riprendi gli ultimi cinque giorni di lavoro. Cerca nelle chat e nelle email le decisioni rimaste in attesa del tuo via libera.",
    evidence: "Hai il numero di richieste e un esempio concreto. Se una richiesta si ripete, scrivi chi potrebbe gestirla e con quale regola."
  },
  margins: {
    task: "Prendi le ultime tre commesse concluse. Per ciascuna sottrai dal ricavo i costi diretti e il costo delle ore impiegate.",
    evidence: "Puoi indicare quale commessa ha lasciato meno margine e quale costo ha inciso di più. Segna le ore stimate per poterle verificare."
  },
  asset: {
    task: "Scegli un metodo, un contratto o un archivio usato nel lavoro. Individua dove si trova, chi può usarlo e con quali diritti.",
    evidence: "Una seconda persona riesce a trovare il materiale e a descrivere come usarlo. Annota il primo passaggio in cui si blocca."
  },
  readiness: {
    task: "Riunisci i numeri dell’ultimo trimestre, i ruoli e i rischi principali in una pagina. Falla leggere a una persona autorizzata.",
    evidence: "Il lettore sa spiegare come guadagna l’azienda e chi decide. Le domande rimaste aperte indicano cosa chiarire."
  }
};

const ANSWER_CHECK: Record<string, string> = {
  Q3: "Confronta gli ultimi tre preventivi e cerchia ciò che hai venduto in tutti e tre.",
  Q4: "Prendi l’ultimo cliente profittevole e l’ultimo difficile da servire. Quale tratto potevi riconoscere prima?",
  Q5: "Affianca la promessa sul sito alla tua ultima proposta. Sottolinea ciò che cambia.",
  Q6: "Chiedi a una persona esterna di spiegare in una frase cosa vendi, dopo aver letto la tua pagina.",
  Q7: "Recupera l’ultima decisione sul prezzo e il dato che l’ha motivata.",
  Q8: "Confronta la previsione di nuovi clienti del mese scorso con il numero effettivo.",
  Q9: "Segna l’origine degli ultimi dieci clienti e in quanti casi sei intervenuto personalmente.",
  Q10: "Guarda gli ultimi cinque contatti. Quali segnali anticipavano il costo di servirli?",
  Q11: "Ricostruisci i passaggi seguiti per le ultime tre richieste, fino all’esito.",
  Q12: "Sulle ultime dieci vendite, calcola la quota di ricavi arrivata fuori dalla tua rete.",
  Q13: "Ripensa all’ultima assenza. Qual è il primo lavoro rimasto fermo e per quanto tempo?",
  Q14: "Chiedi a un collega di completare un’attività usando solo le istruzioni disponibili.",
  Q15: "Confronta ritardi e rilavorazioni di una settimana normale con quelli dell’ultimo picco.",
  Q16: "Conta le approvazioni che ti sono arrivate in cinque giorni. Quale richiesta si ripete?",
  Q17: "Riprendi le ultime tre eccezioni e annota chi le ha chiuse e con quale regola.",
  Q18: "Ricostruisci il margine di una commessa conclusa, includendo il costo delle ore.",
  Q19: "Confronta incassi e uscite previsti un mese fa con i movimenti effettivi.",
  Q20: "Trova la data dell’ultima revisione prezzi e confronta il margine prima e dopo.",
  Q21: "Riprendi l’ultima decisione di spesa e verifica quali dati erano disponibili quel giorno.",
  Q22: "Ordina tre clienti per fatturato, poi per margine. Chi cambia posizione?",
  Q23: "Elenca cosa continuerebbe ad avere valore se per un mese non entrassero nuovi ordini.",
  Q24: "Per un asset importante recupera una prova del suo valore e la data dell’ultimo aggiornamento.",
  Q25: "Fai seguire a un collega le istruzioni d’uso di un asset e annota dove serve il tuo aiuto.",
  Q26: "Nelle ultime trattative cerca un motivo preciso per cui un cliente ha scelto proprio voi.",
  Q27: "Per una relazione chiave recupera l’accordo e controlla chi può rinnovarlo.",
  Q28: "Cronometra quanto impieghi a ritrovare una sintesi aggiornata di numeri e responsabilità.",
  Q29: "Scegli una decisione strategica recente. Chi aveva autorità per prenderla in tua assenza?",
  Q30: "Fai presentare il business a un collega e annota le domande a cui deve rispondere il founder.",
  Q31: "Scegli un rischio concreto. Recupera il piano scritto, il responsabile e la prima azione prevista.",
  Q32: "Fai leggere la sintesi aziendale a una persona autorizzata e raccogli le domande rimaste aperte."
};

/* stesso testo della pagina risultato (result page v2.14) */
const ANTI_ACTION: Record<string, string> = {
  clarity: "Aumentare marketing, contenuti o automazioni. Prima va chiarito cosa vendi, a chi e a che prezzo.",
  acquisition: "Aprire tre canali nuovi insieme. Prima trovane uno che funziona, misuralo e verifica che regga il margine.",
  operations: "Assumere o comprare software per tappare processi che nessuno ha mai scritto. Prima metti nero su bianco come lavorate davvero.",
  margins: "Spingere su volume o nuovi canali finché non sai quanto margine lascia ogni vendita.",
  asset: "Cercare partner, capitale o acquirenti prima di poter mostrare cosa resta nel business quando tu non ci sei.",
  readiness: "Presentarti a investitori o partner prima di aver messo in ordine numeri, ruoli e materiali."
};

const STAGE_IT: Record<string, string> = {
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

const STAGE_BANDS = [
  { name: "Avvio", from: 0, to: 40 },
  { name: "Crescita", from: 40, to: 60 },
  { name: "Stabilità", from: 60, to: 75 },
  { name: "Offerta definita", from: 75, to: 85 },
  { name: "Pronto a scalare", from: 85, to: 100 }
];

/* stesso testo della pagina risultato */
const STAGE_COPY: Record<string, string> = {
  Avvio: "Prima servono basi più solide. Senza quelle, né la crescita né il capitale producono leva vera.",
  Crescita: "Il business si muove, ma vendita e operatività non sono ancora prevedibili.",
  "Stabilità": "Il business funziona. Adesso esecuzione, numeri e decisioni ricorrenti vanno messi in struttura.",
  "Offerta definita": "C'è abbastanza trazione per trasformare il lavoro in un sistema e ridurre la dipendenza da te.",
  "Pronto a scalare": "Sei vicino a poter scalare. Il lavoro adesso è tenere il business documentato e sotto controllo mentre cresce."
};

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

function stageNameOf(result: PdfResult, score: number) {
  const raw = txt(result.stageLabel || result.stage).toUpperCase();
  return STAGE_IT[raw] || stageFromScore(score);
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

/* Percorso: come la pagina risultato. Review solo con intento 3 e
   fatturato da €500k in su; tutti gli altri Kit. */
const REVENUE_REVIEW = ["€500k–€1M", "€1M–€3M", "€3M–€10M", "Oltre €10M"];
function routeOf(result: PdfResult): "review" | "kit" {
  const intent = Number(result.intentLevel ?? result.intentInsight?.level);
  const rev = txt(result.metadata?.revenueRange);
  return intent === 3 && REVENUE_REVIEW.indexOf(rev) >= 0 ? "review" : "kit";
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
  const exercise = FIELDWORK[binding];
  const bindingName = dimName(binding);

  const profile = result.profileData || {};
  const profileTitle = txt(profile.title, `Il nodo: ${bindingName.toLowerCase()}`);
  const profileBody = txt(profile.blocco);

  const stageName = stageNameOf(result, score);
  const stageInfo = result.roadmapInfo || result.stageInfo || {};

  const ranked = [...DIM_ORDER].sort((a, b) => {
    if (a === binding) return -1;
    if (b === binding) return 1;
    const d = Number(dims[a]?.score || 0) - Number(dims[b]?.score || 0);
    return d !== 0 ? d : DIM_ORDER.indexOf(a) - DIM_ORDER.indexOf(b);
  });

  const prioritiesRaw = (result.priorita || result.priorities || []).slice(0, 3);
  const priorities =
    prioritiesRaw.length > 0
      ? prioritiesRaw
      : ranked.slice(0, 3).map((k) => ({ key: k, score: dims[k]?.score, vincolo: DIM_COPY[k] }));

  const costly: any[] = assembled.costlyAnswers || [];
  const firstMove = txt(assembled.firstMove);
  const pattern = result.diagnosticPattern || {};
  const constraints = (result.functionConstraints || []).slice(0, 3);

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

  const route = routeOf(result);

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
            <View style={s.coverForBar} />
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
            <Text style={s.coverProfile}>{profileTitle}</Text>
            {profileBody ? <Text style={s.coverProfileBody}>{profileBody}</Text> : null}
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
          title="Da dove partire questa settimana"
          intro={`Dalle tue risposte emerge una priorità: ${bindingName.toLowerCase()}. Verificala sul lavoro prima di cambiare il modo in cui operi.`}
        />

        <View style={s.moveBox} wrap={false}>
          <Label>Una prova da avviare entro 48 ore</Label>
          <Text style={s.moveText}>{exercise.task}</Text>
        </View>
        <View style={s.block} wrap={false}>
          <Label>La prova è completa quando</Label>
          <Text style={s.lead}>{exercise.evidence}</Text>
        </View>
        {firstMove && (
          <View style={s.block} wrap={false}>
            <Label>La mossa suggerita dal tuo report</Label>
            <Text style={s.body}>{firstMove}</Text>
          </View>
        )}

        <View style={s.antiRow} wrap={false}>
          <Label tone="alert">Cosa non fare adesso</Label>
          <Text style={s.antiText}>{ANTI_ACTION[binding] || ""}</Text>
        </View>

        <View style={{ flexGrow: 1 }} />

        <View style={s.toc} wrap={false}>
          <Label tone="muted">Nelle prossime pagine</Label>
          <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
            {[
              ["03", "Perché ti frena: le tue risposte"],
              ["04", "La mappa delle sei aree"],
              ["05", "Cosa sistemare prima"],
              ["06", "Dove il business perde forza"],
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
          title="Il tuo vincolo, in pratica."
          intro="Riprendi questi episodi nella tua azienda. Per ogni risposta trovi un possibile effetto e una verifica pratica."
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
              {txt(ca.why) && <Text style={s.body}>{txt(ca.why)}</Text>}
              <Text style={s.answerCheck}>
                <Text style={{ fontWeight: 600 }}>Come verificarlo. </Text>
                {ANSWER_CHECK[ca.id] || "Riprendi l’ultimo episodio che ti ha portato a scegliere questa risposta e annota cosa è successo."}
              </Text>
            </View>
          ))
        ) : (
          <View style={s.block}>
            <Text style={s.body}>Per questo report mancano le singole risposte. Puoi comunque verificare la priorità con la prova di pagina 2.</Text>
            {txt(profile.manifesta) && <Text style={s.answerCheck}>{profile.manifesta}</Text>}
            {txt(profile.rischio) && <Text style={s.answerCheck}>{profile.rischio}</Text>}
          </View>
        )}

        <Footer />
      </Page>

      {/* ===================== 04 LE SEI AREE ===================== */}
      <Page size="A4" style={s.page}>
        <Header who={who} />
        <Head
          n="04"
          kicker="Le sei aree"
          title="Le sei aree, in ordine di priorità"
          intro="La prima riga indica il vincolo emerso dalle risposte. Ogni barra mostra un punteggio su 10. A parità di punteggio il vincolo mantiene la precedenza."
        />

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
          <Text style={s.body}>Sotto 4 l’area è debole. Da 4 a meno di 7 è in sviluppo. Da 7 in su è un punto di forza. Il punteggio complessivo è una media pesata delle sei aree.</Text>
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
          intro="Le tre aree che oggi creano più attrito, in ordine. Il resto, per ora, può aspettare."
        />

        {priorities.map((p: any, i: number) => (
          <View key={p.key || i} style={s.prio} wrap={false}>
            <View style={s.prioHead}>
              <Text style={s.prioNum}>{String(i + 1).padStart(2, "0")}</Text>
              <Text style={s.prioName}>{dimName(p.key)}</Text>
              <Text style={s.prioScore}>{`${fmtScore(dims[p.key as DimensionKey]?.score ?? p.score)} / 10`}</Text>
            </View>
            {txt(p.vincolo) ? <Text style={s.bodyMid}>{p.vincolo}</Text> : null}
            <View style={s.twoColTight}>
              <View style={s.col}>
                <Label>Su cosa lavorare</Label>
                <Text style={s.bodySmall}>{txt(p.lavoro, "Rendere quest'area chiara, misurabile e trasferibile.")}</Text>
              </View>
              <View style={s.col}>
                <Label tone="alert">Da evitare</Label>
                <Text style={s.bodySmall}>{txt(p.nonFare, "Aggiungere complessità prima di aver chiarito quest'area.")}</Text>
              </View>
            </View>
          </View>
        ))}

        {txt(pattern.topGapPairBody) ? (
          <View style={s.pairBox} wrap={false}>
            <Label tone="light">Come si legano le tue due aree più deboli</Label>
            <Text style={s.pairTitle}>
              {txt(pattern.topGapPairTitle).replace(/Clarity|Acquisition|Operations|Margins|Asset|Readiness/g, (m) =>
                dimName(m.toLowerCase())
              )}
            </Text>
            <Text style={s.pairBody}>{pattern.topGapPairBody}</Text>
            {txt(pattern.recommendedFocus) ? (
              <Text style={s.pairFocus}>
                <Text style={{ color: GOLD_BRIGHT }}>Dove lavorare: </Text>
                {pattern.recommendedFocus}
              </Text>
            ) : null}
          </View>
        ) : null}

        <Footer />
      </Page>

      {/* ===================== 06 DOVE IL SISTEMA PERDE LEVA ===================== */}
      <Page size="A4" style={s.page}>
        <Header who={who} />
        <Head
          n="06"
          kicker="I punti deboli del sistema"
          title="Dove il business perde forza."
          intro="I problemi concreti più probabili, dati la fase del business e le aree più deboli."
        />

        {constraints.length > 0 ? (
          constraints.map((c: any, i: number) => (
            <View key={c.id || i} style={s.prio} wrap={false}>
              <View style={s.prioHead}>
                <Text style={s.prioNum}>{String(i + 1).padStart(2, "0")}</Text>
                <Text style={s.prioName}>{txt(c.label)}</Text>
              </View>
              <Text style={s.bodyMid}>{txt(c.implication)}</Text>
              <View style={s.twoColTight}>
                <View style={s.col}>
                  <Label>Come deve essere</Label>
                  <Text style={s.bodySmall}>{txt(c.work)}</Text>
                </View>
                <View style={s.col}>
                  <Label tone="alert">Da evitare</Label>
                  <Text style={s.bodySmall}>{txt(c.avoid)}</Text>
                </View>
              </View>
            </View>
          ))
        ) : (
          <Text style={s.body}>Nessun punto debole specifico oltre a quelli già visti nelle sei aree.</Text>
        )}


        <Footer />
      </Page>

      {/* ===================== 07 LA FASE ===================== */}
      <Page size="A4" style={s.page}>
        <Header who={who} />
        <Head n="07" kicker="La fase del business" title={`${stageName}.`} intro={txt(stageInfo.headline, STAGE_COPY[stageName])} />

        <View style={s.stageScaleWrap}>
          <StageScale score={score} labels />
        </View>

        <View style={s.block}>
          <Label>Il tuo ruolo in questa fase</Label>
          <Text style={s.lead}>{txt(stageInfo.role, "Costruire il sistema")}</Text>
        </View>

        {txt(stageInfo.bottomLineConstraint) ? (
          <View style={s.block}>
            <Label>Il limite tipico di questa fase</Label>
            <Text style={s.bodyMid}>{stageInfo.bottomLineConstraint}</Text>
          </View>
        ) : null}

        {txt(stageInfo.costOfInaction) ? (
          <View style={s.block}>
            <Label tone="alert">Quanto costa restare fermi</Label>
            <Text style={s.bodyMid}>{stageInfo.costOfInaction}</Text>
          </View>
        ) : null}

        {(stageInfo.graduationCriteria || []).length > 0 ? (
          <View style={s.block}>
            <Label>Sei pronto per la fase successiva quando</Label>
            {(stageInfo.graduationCriteria || []).slice(0, 5).map((c: string, i: number) => (
              <View key={i} style={s.checkRow}>
                <View style={s.checkBox} />
                <Text style={s.checkText}>{c}</Text>
              </View>
            ))}
          </View>
        ) : null}

        <Footer />
      </Page>

      {/* ===================== 08 IL PROSSIMO PASSO ===================== */}
      <Page size="A4" style={s.page}>
        <Header who={who} />
        <Head n="08" kicker="Il prossimo passo" title="Dalla diagnosi all'azione." />

        {(txt(profile.decisione) || txt(assembled.nextProblem)) ? (
          <View style={s.block}>
            <Label>{txt(profile.decisione) ? "La decisione che viene prima" : "Il prossimo problema da considerare"}</Label>
            <Text style={s.lead}>{txt(profile.decisione) || txt(assembled.nextProblem)}</Text>
          </View>
        ) : null}

        <View style={s.block} wrap={false}>
          <Label>Se prosegui in autonomia</Label>
          <Text style={s.body}>Fai la prova di pagina 2. Tra sette giorni confronta il risultato con la tua risposta iniziale e scegli una cosa da cambiare.</Text>
        </View>

        <View style={{ flexGrow: 1 }} />
        <View style={s.cta} wrap={false}>
          <Text style={s.ctaKicker}>SE VUOI UN SUPPORTO</Text>
          <Text style={s.ctaTitle}>Chi prepara il piano?</Text>
          {(route === "review" ? ["review", "kit"] : ["kit", "review"]).map((option) => (
            <View key={option} style={{ marginTop: 12 }}>
              {option === "kit" ? (
                <>
                  <Text style={s.ctaBody}>Con il Kit scegli le tre mosse e compili tu il piano di 90 giorni. Se passi alla Review entro 30 giorni, i €47 vengono scalati dal prezzo.</Text>
                  <Link src={kitUrl} style={s.ctaAlt}>Guarda il Priority Map Kit · €47</Link>
                </>
              ) : (
                <>
                  <Text style={s.ctaBody}>Se devi prendere una decisione e vuoi un confronto, esaminiamo il tuo caso in 45 minuti. Entro 48 ore ti consegno la Priority Map scritta.</Text>
                  <Link src={reviewUrl} style={s.ctaAlt}>Guarda la Strategic Review · €350</Link>
                </>
              )}
            </View>
          ))}
        </View>

        <View style={s.letter} wrap={false}>
          <Label tone="muted">Una nota personale</Label>
          {txt(assembled.letter) ? <Text style={s.letterText}>{assembled.letter}</Text> : null}
          <Text style={s.letterSign}>Davide</Text>
          <Text style={s.letterCred}>COO & co-founder di una fintech di tokenizzazione · IMPULSE è il mio criterio operativo, reso strumento e costruito con l'AI.</Text>
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
  body: { fontSize: 12.6, lineHeight: 1.42, color: BODY },
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
  coverForBar: { width: 26, height: 1.2, backgroundColor: GOLD_BRIGHT, marginRight: 12 },
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
  moveBox: { marginTop: 18, padding: 16, backgroundColor: CREAM, borderLeftWidth: 2.5, borderLeftColor: GOLD },
  moveText: { fontSize: 13.4, lineHeight: 1.42, color: INK },
  antiRow: { marginTop: 14, paddingLeft: 16, borderLeftWidth: 2.5, borderLeftColor: ALERT },
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
  areaRow: { flexDirection: "row", alignItems: "center", paddingVertical: 15, paddingHorizontal: 6, borderBottomWidth: 0.5, borderBottomColor: RULE },
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
  ctaAlt: { fontFamily: F.sans, marginTop: 5, fontSize: 13, color: GOLD_BRIGHT, textDecoration: "underline" },
  letter: { marginTop: 18, paddingTop: 12, borderTopWidth: 0.6, borderTopColor: RULE },
  letterText: { fontSize: 12.4, lineHeight: 1.42, color: BODY },
  letterSign: { marginTop: 8, fontFamily: F.serif, fontStyle: "italic", fontSize: 18, color: INK },
  letterCred: { marginTop: 3, fontSize: 10.2, lineHeight: 1.35, color: SOFT },
  letterRetest: { marginTop: 6, fontSize: 11, color: GOLD_INK, fontStyle: "italic" },
  code: { marginTop: 6, fontFamily: F.sans, fontSize: 6, letterSpacing: 1, color: SOFT }
});
