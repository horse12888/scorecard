import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font
} from "@react-pdf/renderer";

Font.registerHyphenationCallback((word) => [word]);

type DimensionKey =
  | "clarity"
  | "acquisition"
  | "operations"
  | "margins"
  | "asset"
  | "readiness";

type PdfResult = {
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
  dimensions: Record<DimensionKey, { score: number; yes: number }>;
  processedDims?: any[];
  priorities?: any[];
  priorita?: any[];
  strengths?: any[];
  forze?: any[];
  stagingScore?: number;
  bindingConstraint?: string;
};

const dimensionNames: Record<DimensionKey, string> = {
  clarity: "Chiarezza",
  acquisition: "Acquisizione",
  operations: "Operazioni",
  margins: "Margini",
  asset: "Asset",
  readiness: "Preparazione"
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

function normalizeStage(stage: string) {
  const map: Record<string, string> = {
    FOUNDATION: "FOUNDATION",
    TRACTION: "TRAZIONE",
    STABILIZATION: "STABILIZZAZIONE",
    PRODUCTIZATION: "PRODUCTIZATION",
    "SCALE READINESS": "SCALE READINESS"
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

function Bar({ score }: { score: number }) {
  const width = Math.max(0, Math.min(100, score * 10));

  return (
    <View style={styles.barTrack}>
      <View style={[styles.barFill, { width: `${width}%` }]} />
    </View>
  );
}

function Header({ page, name }: { page: string; name?: string }) {
  return (
    <View style={styles.header} fixed>
      <Text style={styles.headerText}>IMPULSE REPORT</Text>
      <Text style={styles.headerText}>
        PAGINA {page} {safeText(name).toUpperCase()}
      </Text>
    </View>
  );
}

function SectionTitle({
  kicker,
  title,
  body
}: {
  kicker?: string;
  title: string;
  body?: string;
}) {
  return (
    <View style={styles.sectionTitleBlock}>
      {kicker ? <Text style={styles.kicker}>{kicker}</Text> : null}
      <Text style={styles.sectionTitle}>{title}</Text>
      {body ? <Text style={styles.sectionBody}>{body}</Text> : null}
    </View>
  );
}

export function ImpulsePdfDocument({ result }: { result: PdfResult }) {
  const score = Number(result.overall || 0);
  const name = safeText(result.name);
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

  return (
    <Document
      title={`IMPULSE Report ${name || "Business"}`}
      author="IMPULSE System"
      subject="Business Readiness Report"
    >
      <Page size="A4" style={styles.page}>
        <Header page="01" name={name} />

        <View style={styles.coverHero}>
          <Text style={styles.reportTitle}>IMPULSE BUSINESS READINESS REPORT</Text>
          <Text style={styles.preparedFor}>
            Preparato per {name || "il tuo business"}
          </Text>
        </View>

        <View style={styles.coverGrid}>
          <View style={styles.scoreBox}>
            <Text style={styles.bigScore}>{score}%</Text>
            <Text style={styles.scoreCaption}>SCORE COMPLESSIVO</Text>
          </View>

          <View style={styles.profileBox}>
            <Text style={styles.kicker}>VINCOLO PRINCIPALE</Text>
            <Text style={styles.profileTitle}>{profileTitle}</Text>
            <Text style={styles.profileBody}>{profileBody}</Text>
          </View>
        </View>

        <View style={styles.summaryGrid}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>FASCIA</Text>
            <Text style={styles.summaryValue}>{safeText(result.fascia)}</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>PROFILO</Text>
            <Text style={styles.summaryValue}>Profilo {safeText(result.profile)}</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>FASE</Text>
            <Text style={styles.summaryValue}>{stageLabel}</Text>
          </View>
        </View>

        <View style={styles.noteBox}>
          <Text style={styles.noteTitle}>PUNTO CHIAVE</Text>
          <Text style={styles.noteText}>
            Il report identifica dove il business perde leva. La Strategic Review serve a trasformare questa diagnosi in ordine operativo, priorità e decisioni.
          </Text>
        </View>
      </Page>

      <Page size="A4" style={styles.page}>
        <Header page="02" name={name} />
        <SectionTitle
          kicker="LA TUA FASE"
          title={stageLabel}
          body={stageInfo.headline || "Il business ha segnali utili, ma il prossimo salto richiede più struttura e leggibilità."}
        />

        <View style={styles.stageCard}>
          <View style={styles.twoCol}>
            <View style={styles.col}>
              <Text style={styles.blockLabel}>RUOLO</Text>
              <Text style={styles.blockText}>{stageInfo.role || "Founder as system builder"}</Text>
            </View>
            <View style={styles.col}>
              <Text style={styles.blockLabel}>FOCUS</Text>
              <Text style={styles.blockText}>
                {stageInfo.strategicReviewFocus || "Chiarire il vincolo principale e la sequenza operativa."}
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          <Text style={styles.blockLabel}>VINCOLO DI STAGE</Text>
          <Text style={styles.longText}>
            {stageInfo.bottomLineConstraint || "Il business deve rendere più leggibili sistemi, numeri, responsabilità e margini prima di aumentare complessità."}
          </Text>
        </View>

        <View style={styles.criteriaCard}>
          <Text style={styles.cardTitle}>Criteri per il prossimo salto</Text>
          {(stageInfo.graduationCriteria || []).slice(0, 5).map((item: string, index: number) => (
            <View key={index} style={styles.listRow}>
              <Text style={styles.listNumber}>{String(index + 1).padStart(2, "0")}</Text>
              <Text style={styles.listText}>{item}</Text>
            </View>
          ))}
        </View>

        <View style={styles.warningBox}>
          <Text style={styles.warningTitle}>COSA NON SCALARE ANCORA</Text>
          <Text style={styles.warningText}>
            {stageInfo.nonFare || stageInfo.troppoPresto || "Non aumentare complessità prima di aver reso chiaro il vincolo operativo principale."}
          </Text>
        </View>
      </Page>

      <Page size="A4" style={styles.page}>
        <Header page="03" name={name} />
        <SectionTitle
          kicker="LE 3 PRIORITÀ OPERATIVE"
          title="Cosa va chiarito prima"
          body="Queste sono le aree che oggi creano più attrito operativo. Prima di aumentare volume, complessità o investimento, vanno rese più chiare, trasferibili e leggibili."
        />

        <View style={styles.priorityList}>
          {priorities.map((item: any, index: number) => (
            <View key={item.key || index} style={styles.priorityCard}>
              <View style={styles.priorityHeader}>
                <Text style={styles.priorityRank}>#{index + 1}</Text>
                <View style={styles.priorityTitleBlock}>
                  <Text style={styles.priorityTitle}>{getDimensionLabel(item)}</Text>
                  <Text style={styles.priorityScore}>{Number(item.score || 0).toFixed(1)} / 10</Text>
                </View>
              </View>

              <Text style={styles.blockLabel}>VINCOLO</Text>
              <Text style={styles.longText}>
                {item.vincolo || item.cosaIndica || dimensionShortCopy[item.key as DimensionKey] || ""}
              </Text>

              <Text style={styles.blockLabel}>DA CHIARIRE</Text>
              <Text style={styles.longText}>
                {item.lavoro || "Rendere più chiari numeri, responsabilità, criteri e sequenza operativa."}
              </Text>

              <Text style={styles.blockLabel}>EVITARE</Text>
              <Text style={styles.longText}>
                {item.nonFare || "Non aumentare complessità prima di avere una lettura più stabile di questa area."}
              </Text>
            </View>
          ))}
        </View>
      </Page>

      <Page size="A4" style={styles.page}>
        <Header page="04" name={name} />
        <SectionTitle
          kicker="MAPPA DIAGNOSTICA"
          title="Le 6 dimensioni"
          body="Questa pagina mostra la relazione tra le aree del business. Le dimensioni più basse indicano dove il valore resta bloccato prima ancora di cercare più clienti, più automazione o più capitale."
        />

        <View style={styles.dimensionGrid}>
          {dims.map((dim: any) => (
            <View key={dim.key} style={styles.dimensionCard}>
              <View style={styles.dimensionHeader}>
                <Text style={styles.dimensionTitle}>{getDimensionLabel(dim)}</Text>
                <Text style={styles.dimensionScore}>{Number(dim.score || 0).toFixed(1)} / 10</Text>
              </View>
              <Bar score={Number(dim.score || 0)} />
              <Text style={styles.dimensionStatus}>
                {getBracketLabel(dim.bracket) || getScoreLabel(Number(dim.score || 0))}
              </Text>
              <Text style={styles.dimensionText}>
                {dim.subtitle || dimensionShortCopy[dim.key as DimensionKey]}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.insightBox}>
          <Text style={styles.insightTitle}>LETTURA OPERATIVA</Text>
          <Text style={styles.insightText}>
            Il punto non è solo migliorare il punteggio di ogni area. Il salto avviene quando offerta, acquisizione, delivery, margini, asset e leggibilità esterna iniziano a funzionare come un sistema unico.
          </Text>
        </View>
      </Page>

      <Page size="A4" style={styles.page}>
        <Header page="05" name={name} />
        <SectionTitle
          kicker="COORDINATE"
          title="Forze e vincoli"
          body="Questa pagina separa le aree più solide da quelle che limitano il prossimo salto."
        />

        <View style={styles.twoColLarge}>
          <View style={styles.columnCard}>
            <Text style={styles.cardTitle}>Le tue forze</Text>
            {strengths.map((item: any, index: number) => (
              <View key={item.key || index} style={styles.scoreRow}>
                <Text style={styles.scoreRowName}>{getDimensionLabel(item)}</Text>
                <Text style={styles.scoreRowValue}>{Number(item.score || 0).toFixed(1)}</Text>
              </View>
            ))}
          </View>

          <View style={styles.columnCard}>
            <Text style={styles.cardTitle}>Le tue priorità</Text>
            {priorities.map((item: any, index: number) => (
              <View key={item.key || index} style={styles.scoreRow}>
                <Text style={styles.scoreRowName}>{getDimensionLabel(item)}</Text>
                <Text style={styles.scoreRowValue}>{Number(item.score || 0).toFixed(1)}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.noteBox}>
          <Text style={styles.noteTitle}>VINCOLO BINDING</Text>
          <Text style={styles.noteText}>
            {displayedBindingKey
              ? `La dimensione che oggi limita di più lo stage è ${dimensionNames[displayedBindingKey] || displayedBindingKey}.`
              : "Il vincolo principale emerge dalla combinazione delle dimensioni più deboli."}
          </Text>
        </View>
      </Page>

      <Page size="A4" style={styles.page}>
        <Header page="06" name={name} />
        <SectionTitle
          kicker={`PROFILO ${safeText(result.profile)}`}
          title={profileTitle}
          body={profileBody}
        />

        <View style={styles.profileDetailCard}>
          <Text style={styles.blockLabel}>COME SI MANIFESTA</Text>
          <Text style={styles.longText}>
            {result.profileData?.manifesta || "Il vincolo si manifesta quando il business deve essere capito, delegato o valutato senza la presenza costante del founder."}
          </Text>

          <Text style={styles.blockLabel}>RISCHIO SE IGNORATO</Text>
          <Text style={styles.longText}>
            {result.profileData?.rischio || "Il rischio è aumentare volume, complessità o esposizione esterna senza aver prima chiarito il sistema."}
          </Text>

          <Text style={styles.blockLabel}>LA DECISIONE CHE VIENE PRIMA</Text>
          <Text style={styles.longText}>
            {result.profileData?.decisione || "Rendere più chiari numeri, responsabilità, offerta e vincolo operativo principale."}
          </Text>
        </View>

        <View style={styles.ctaBox}>
          <Text style={styles.ctaLabel}>STRATEGIC REVIEW</Text>
          <Text style={styles.ctaTitle}>
            {firstName
              ? `${firstName}, trasforma la diagnosi in ordine operativo.`
              : "Trasforma la diagnosi in ordine operativo."}
          </Text>
          <Text style={styles.ctaBody}>
            Il report ha isolato il vincolo che oggi limita il prossimo salto del business. La Strategic Review serve a trasformare questa diagnosi in un piano operativo: cosa correggere prima, cosa non scalare ancora, quali decisioni prendere e quali priorità mettere in ordine nei prossimi 30-60 giorni.
          </Text>
          <Text style={styles.ctaUrl}>davidedileo.it</Text>
        </View>
      </Page>
    </Document>
  );
}

const styles = StyleSheet.create({
  page: {
    paddingTop: 34,
    paddingBottom: 34,
    paddingHorizontal: 38,
    backgroundColor: "#FAF7EE",
    color: "#151515",
    fontFamily: "Helvetica"
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 26,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#E6E2D8"
  },
  headerText: {
    fontSize: 8,
    color: "#5F6368",
    letterSpacing: 1.1,
    textTransform: "uppercase"
  },
  coverHero: {
    marginBottom: 28
  },
  reportTitle: {
    fontSize: 18,
    color: "#123C69",
    fontWeight: 700,
    letterSpacing: 1,
    marginBottom: 8
  },
  preparedFor: {
    fontSize: 11,
    color: "#5F6368"
  },
  coverGrid: {
    flexDirection: "row",
    gap: 18,
    marginBottom: 20
  },
  scoreBox: {
    width: "36%",
    minHeight: 170,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 18,
    justifyContent: "center",
    alignItems: "center"
  },
  bigScore: {
    fontSize: 54,
    color: "#27708F",
    fontWeight: 700
  },
  scoreCaption: {
    fontSize: 8,
    color: "#5F6368",
    letterSpacing: 0.6,
    textAlign: "center",
    marginTop: 8
  },
  profileBox: {
    width: "64%",
    minHeight: 170,
    backgroundColor: "#EAF5FA",
    borderRadius: 20,
    padding: 22
  },
  kicker: {
    fontSize: 8,
    color: "#27708F",
    letterSpacing: 1.2,
    textTransform: "uppercase",
    fontWeight: 700,
    marginBottom: 8
  },
  profileTitle: {
    fontSize: 28,
    lineHeight: 1.05,
    fontWeight: 700,
    color: "#151515",
    marginBottom: 10
  },
  profileBody: {
    fontSize: 11.5,
    lineHeight: 1.45,
    color: "#3D4348"
  },
  summaryGrid: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 20
  },
  summaryItem: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 14
  },
  summaryLabel: {
    fontSize: 8,
    color: "#5F6368",
    letterSpacing: 1.1,
    marginBottom: 5
  },
  summaryValue: {
    fontSize: 15,
    fontWeight: 700,
    color: "#151515"
  },
  noteBox: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 18,
    marginTop: 8
  },
  noteTitle: {
    fontSize: 9,
    color: "#27708F",
    fontWeight: 700,
    letterSpacing: 1.1,
    marginBottom: 8
  },
  noteText: {
    fontSize: 11,
    lineHeight: 1.45,
    color: "#3D4348",
    marginBottom: 4
  },
  sectionTitleBlock: {
    marginBottom: 22
  },
  sectionTitle: {
    fontSize: 34,
    lineHeight: 1.05,
    fontWeight: 700,
    color: "#151515",
    marginBottom: 10
  },
  sectionBody: {
    fontSize: 12,
    lineHeight: 1.45,
    color: "#5F6368",
    maxWidth: 480
  },
  stageCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 20,
    marginBottom: 16
  },
  twoCol: {
    flexDirection: "row",
    gap: 16
  },
  col: {
    flex: 1
  },
  blockLabel: {
    fontSize: 8,
    color: "#27708F",
    fontWeight: 700,
    letterSpacing: 1,
    marginTop: 10,
    marginBottom: 5,
    textTransform: "uppercase"
  },
  blockText: {
    fontSize: 11,
    lineHeight: 1.4,
    color: "#151515"
  },
  longText: {
    fontSize: 10.5,
    lineHeight: 1.45,
    color: "#3D4348"
  },
  divider: {
    height: 1,
    backgroundColor: "#E6E2D8",
    marginVertical: 14
  },
  criteriaCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 18,
    marginBottom: 16
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 700,
    color: "#151515",
    marginBottom: 12
  },
  listRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 8
  },
  listNumber: {
    width: 22,
    fontSize: 10,
    color: "#27708F",
    fontWeight: 700
  },
  listText: {
    flex: 1,
    fontSize: 11,
    lineHeight: 1.35,
    color: "#3D4348"
  },
  warningBox: {
    backgroundColor: "#FFF2F0",
    borderRadius: 16,
    padding: 16
  },
  warningTitle: {
    fontSize: 9,
    color: "#B42318",
    fontWeight: 700,
    letterSpacing: 1,
    marginBottom: 6
  },
  warningText: {
    fontSize: 11,
    lineHeight: 1.45,
    color: "#B42318"
  },
  priorityList: {
    gap: 12
  },
  priorityCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 17,
    marginBottom: 10
  },
  priorityHeader: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 8
  },
  priorityRank: {
    fontSize: 16,
    color: "#27708F",
    fontWeight: 700,
    width: 34
  },
  priorityTitleBlock: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10
  },
  priorityTitle: {
    fontSize: 15,
    fontWeight: 700,
    color: "#151515"
  },
  priorityScore: {
    fontSize: 13,
    fontWeight: 700,
    color: "#27708F"
  },
  dimensionGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12
  },
  dimensionCard: {
    width: "48%",
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 16,
    marginBottom: 10
  },
  dimensionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
    marginBottom: 10
  },
  dimensionTitle: {
    fontSize: 13,
    fontWeight: 700,
    color: "#151515"
  },
  dimensionScore: {
    fontSize: 12,
    fontWeight: 700,
    color: "#27708F"
  },
  dimensionStatus: {
    fontSize: 8,
    color: "#5F6368",
    letterSpacing: 1,
    marginTop: 8,
    marginBottom: 6
  },
  dimensionText: {
    fontSize: 10,
    lineHeight: 1.35,
    color: "#5F6368"
  },
  insightBox: {
    backgroundColor: "#EAF5FA",
    borderRadius: 16,
    padding: 16,
    marginTop: 12
  },
  insightTitle: {
    fontSize: 9,
    color: "#27708F",
    fontWeight: 700,
    letterSpacing: 1,
    marginBottom: 7
  },
  insightText: {
    fontSize: 10.5,
    lineHeight: 1.45,
    color: "#3D4348"
  },
  barTrack: {
    height: 7,
    backgroundColor: "#EDF1F4",
    borderRadius: 10,
    overflow: "hidden"
  },
  barFill: {
    height: 7,
    backgroundColor: "#27708F",
    borderRadius: 10
  },
  twoColLarge: {
    flexDirection: "row",
    gap: 14,
    marginBottom: 18
  },
  columnCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 18
  },
  scoreRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "#E6E2D8",
    paddingBottom: 8,
    marginBottom: 8
  },
  scoreRowName: {
    fontSize: 11,
    color: "#3D4348"
  },
  scoreRowValue: {
    fontSize: 11,
    color: "#27708F",
    fontWeight: 700
  },
  profileDetailCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 20,
    marginBottom: 18
  },
  ctaBox: {
    backgroundColor: "#123C69",
    borderRadius: 20,
    padding: 24,
    marginTop: 10
  },
  ctaLabel: {
    fontSize: 8,
    color: "#FFFFFF",
    letterSpacing: 1.2,
    textTransform: "uppercase",
    fontWeight: 700,
    marginBottom: 8
  },
  ctaTitle: {
    fontSize: 24,
    lineHeight: 1.1,
    color: "#FFFFFF",
    fontWeight: 700,
    marginBottom: 12
  },
  ctaBody: {
    fontSize: 12,
    lineHeight: 1.45,
    color: "#FFFFFF",
    marginBottom: 14
  },
  ctaUrl: {
    fontSize: 13,
    color: "#FFFFFF",
    fontWeight: 700
  }
});
