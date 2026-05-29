import { jsPDF } from 'jspdf';
import { getProfileData } from './diagnostics';

const IMPULSE_COLORS = {
  teal: [39, 112, 143] as [number, number, number],
  gold: [245, 197, 24] as [number, number, number],
  cream: [250, 247, 238] as [number, number, number],
  lightBlue: [223, 240, 245] as [number, number, number],
  dark: [26, 26, 26] as [number, number, number],
  darkSoft: [40, 40, 40] as [number, number, number],
  gray: [100, 100, 100] as [number, number, number],
  grayLight: [200, 200, 200] as [number, number, number],
  white: [255, 255, 255] as [number, number, number]
};

const PAGE = {
  width: 210,
  height: 297,
  marginX: 28,
  marginY: 32,
  contentWidth: 154
};

class PDFBuilder {
  doc: jsPDF;
  cursorY: number = PAGE.marginY;
  pageNumber: number = 0;
  result: any;

  constructor(result: any) {
    this.doc = new jsPDF({ unit: 'mm', format: 'a4' });
    this.result = result;
  }

  save(filename: string) {
    this.doc.save(filename);
  }

  newPage(bgColor: number[] = IMPULSE_COLORS.white, darkHeader: boolean = false) {
    if (this.pageNumber > 0) this.doc.addPage();

    this.pageNumber++;
    this.cursorY = PAGE.marginY;
    this.fillRect(0, 0, PAGE.width, PAGE.height, bgColor);

    if (this.pageNumber > 1) {
      this.doc.setDrawColor(...(darkHeader ? IMPULSE_COLORS.gray : IMPULSE_COLORS.grayLight));
      this.doc.setLineWidth(0.2);
      this.doc.line(PAGE.marginX, 15, PAGE.width - PAGE.marginX, 15);

      this.drawText(`IMPULSE · REPORT NUM. ${String(this.pageNumber).padStart(2, '0')}`, PAGE.marginX, 12, {
        fontSize: 7,
        color: darkHeader ? IMPULSE_COLORS.white : IMPULSE_COLORS.gray,
        charSpace: 0.5
      });

      const userName = this.result?.name
        ? String(this.result.name).toUpperCase()
        : this.result?.user?.name
          ? String(this.result.user.name).toUpperCase()
          : '';

      this.drawText(userName, PAGE.width - PAGE.marginX, 12, {
        fontSize: 7,
        align: 'right',
        color: darkHeader ? IMPULSE_COLORS.white : IMPULSE_COLORS.gray,
        charSpace: 0.5
      });
    }
  }

  fillRect(x: number, y: number, w: number, h: number, color: number[]) {
    this.doc.setFillColor(color[0], color[1], color[2]);
    this.doc.rect(x, y, w, h, 'F');
  }

  drawText(text: string, x: number, y: number, options: any = {}) {
    const fontSize = options.fontSize || 10;
    const font = options.font || 'helvetica';
    const style = options.style || 'normal';
    const color = options.color || IMPULSE_COLORS.dark;
    const align = options.align || 'left';
    const maxWidth = options.maxWidth || PAGE.contentWidth;
    const lineHeightFactor = options.lineHeightFactor || 1.4;

    this.doc.setFont(font, style);
    this.doc.setFontSize(fontSize);
    this.doc.setTextColor(color[0], color[1], color[2]);

    const lines = this.doc.splitTextToSize(String(text || ''), maxWidth);
    const lineHeight = (fontSize * 0.3527) * lineHeightFactor;

    let currentY = y;

    lines.forEach((line: string) => {
      this.doc.text(line, x, currentY, { align });
      currentY += lineHeight;
    });

    return currentY;
  }

  drawDonut(
    x: number,
    y: number,
    radius: number,
    thickness: number,
    percent: number,
    color: number[],
    trackColor: number[] = IMPULSE_COLORS.darkSoft
  ) {
    this.doc.setLineWidth(thickness);
    this.doc.setDrawColor(trackColor[0], trackColor[1], trackColor[2]);
    this.doc.circle(x, y, radius, 'S');

    if (percent > 0) {
      const p = Math.max(0, Math.min(100, percent)) / 100;
      const segments = Math.max(30, Math.floor(180 * p));
      const startA = -Math.PI / 2;
      const endA = startA + Math.PI * 2 * p;

      const outerR = radius + thickness / 2;
      const innerR = radius - thickness / 2;

      const points: [number, number][] = [];

      for (let i = 0; i <= segments; i++) {
        const a = startA + (endA - startA) * (i / segments);
        points.push([x + outerR * Math.cos(a), y + outerR * Math.sin(a)]);
      }

      for (let i = segments; i >= 0; i--) {
        const a = startA + (endA - startA) * (i / segments);
        points.push([x + innerR * Math.cos(a), y + innerR * Math.sin(a)]);
      }

      this.doc.setFillColor(color[0], color[1], color[2]);

      const relPoints: [number, number][] = [];

      for (let i = 1; i < points.length; i++) {
        relPoints.push([points[i][0] - points[i - 1][0], points[i][1] - points[i - 1][1]]);
      }

      relPoints.push([
        points[0][0] - points[points.length - 1][0],
        points[0][1] - points[points.length - 1][1]
      ]);

      this.doc.lines(relPoints, points[0][0], points[0][1], [1, 1], 'F', true);
    }
  }

  drawRadar(cx: number, cy: number, r: number, dimensions: any[]) {
    const safeDimensions = Array.isArray(dimensions) ? dimensions.filter(Boolean) : [];
    const n = safeDimensions.length;

    if (n < 3) return;

    const angleStep = (Math.PI * 2) / n;
    const startAngle = -Math.PI / 2;
    const scorePts: [number, number][] = [];

    for (let i = 0; i < n; i++) {
      const a = startAngle + i * angleStep;
      const sr = (Math.max(0, Math.min(10, Number(safeDimensions[i].score || 0))) / 10) * r;
      scorePts.push([cx + sr * Math.cos(a), cy + sr * Math.sin(a)]);
    }

    this.doc.setFillColor(
      IMPULSE_COLORS.lightBlue[0],
      IMPULSE_COLORS.lightBlue[1],
      IMPULSE_COLORS.lightBlue[2]
    );

    this.drawPolygon(scorePts, true, false);

    this.doc.setDrawColor(220, 225, 230);
    this.doc.setLineWidth(0.15);

    for (let level = 2; level <= 10; level += 2) {
      const lr = (level / 10) * r;
      const pts: [number, number][] = [];

      for (let i = 0; i < n; i++) {
        const a = startAngle + i * angleStep;
        pts.push([cx + lr * Math.cos(a), cy + lr * Math.sin(a)]);
      }

      this.drawPolygon(pts, false);
    }

    this.doc.setDrawColor(200, 205, 210);
    this.doc.setLineWidth(0.2);

    for (let i = 0; i < n; i++) {
      const a = startAngle + i * angleStep;
      this.doc.line(cx, cy, cx + r * Math.cos(a), cy + r * Math.sin(a));
    }

    this.doc.setDrawColor(
      IMPULSE_COLORS.teal[0],
      IMPULSE_COLORS.teal[1],
      IMPULSE_COLORS.teal[2]
    );
    this.doc.setLineWidth(0.8);
    this.drawPolygon(scorePts, false);

    scorePts.forEach((p) => {
      this.doc.setFillColor(
        IMPULSE_COLORS.teal[0],
        IMPULSE_COLORS.teal[1],
        IMPULSE_COLORS.teal[2]
      );
      this.doc.circle(p[0], p[1], 1.8, 'F');

      this.doc.setFillColor(255, 255, 255);
      this.doc.circle(p[0], p[1], 0.8, 'F');
    });

    for (let i = 0; i < n; i++) {
      const a = startAngle + i * angleStep;
      const lx = cx + (r + 7) * Math.cos(a);
      const ly = cy + (r + 7) * Math.sin(a);

      let align: 'left' | 'center' | 'right' = 'center';
      const dx = Math.cos(a);

      if (dx > 0.3) align = 'left';
      else if (dx < -0.3) align = 'right';

      this.drawText(getDimensionName(safeDimensions[i]).toUpperCase(), lx, ly + 1.5, {
        align,
        fontSize: 7,
        style: 'bold',
        color: IMPULSE_COLORS.darkSoft,
        charSpace: 0.5
      });
    }
  }

  drawPolygon(points: [number, number][], filled = false, stroked = true) {
    if (!points || points.length < 3) return;

    const start = points[0];
    const rel: [number, number][] = [];

    for (let i = 1; i < points.length; i++) {
      rel.push([points[i][0] - points[i - 1][0], points[i][1] - points[i - 1][1]]);
    }

    rel.push([
      points[0][0] - points[points.length - 1][0],
      points[0][1] - points[points.length - 1][1]
    ]);

    const style = filled ? (stroked ? 'DF' : 'F') : 'S';

    this.doc.lines(rel, start[0], start[1], [1, 1], style, true);
  }

  drawLuxuryCard(
    title: string,
    body: string,
    accentColor: number[],
    yPos: number,
    bg: number[] = IMPULSE_COLORS.cream
  ) {
    const safeBody = body || '';
    const testLines = this.doc.splitTextToSize(safeBody, PAGE.contentWidth - 14);
    const cardHeight = Math.max(30, 20 + testLines.length * 5);

    this.fillRect(PAGE.marginX, yPos, PAGE.contentWidth, cardHeight, bg);
    this.fillRect(PAGE.marginX, yPos, 4, cardHeight, accentColor);

    this.drawText(String(title || '').toUpperCase(), PAGE.marginX + 10, yPos + 10, {
      fontSize: 8,
      style: 'bold',
      color: accentColor
    });

    this.drawText(safeBody, PAGE.marginX + 10, yPos + 18, {
      fontSize: 10.5,
      color: IMPULSE_COLORS.darkSoft,
      lineHeightFactor: 1.6,
      maxWidth: PAGE.contentWidth - 14
    });

    return yPos + cardHeight + 8;
  }

  drawBulletList(
    title: string,
    items: string[],
    accentColor: number[],
    yPos: number,
    bg: number[] = IMPULSE_COLORS.white
  ) {
    const safeItems = Array.isArray(items) ? items.filter(Boolean) : [];
    const estimatedHeight = Math.max(34, 22 + safeItems.length * 11);

    this.fillRect(PAGE.marginX, yPos, PAGE.contentWidth, estimatedHeight, bg);
    this.fillRect(PAGE.marginX, yPos, 4, estimatedHeight, accentColor);

    this.drawText(String(title || '').toUpperCase(), PAGE.marginX + 10, yPos + 10, {
      fontSize: 8,
      style: 'bold',
      color: accentColor,
      charSpace: 0.5
    });

    let currentY = yPos + 21;

    safeItems.forEach((item: string) => {
      this.drawText('•', PAGE.marginX + 10, currentY, {
        fontSize: 10,
        style: 'bold',
        color: accentColor,
        maxWidth: 4
      });

      currentY = this.drawText(item, PAGE.marginX + 16, currentY, {
        fontSize: 9.5,
        color: IMPULSE_COLORS.darkSoft,
        lineHeightFactor: 1.45,
        maxWidth: PAGE.contentWidth - 24
      });

      currentY += 2;
    });

    return yPos + estimatedHeight + 8;
  }
}

function getDisplayName(state: any) {
  return state?.name || state?.user?.name || 'Founder';
}

function getFilenameSafe(value: string) {
  return String(value || 'Report')
    .trim()
    .replace(/\s+/g, '_')
    .replace(/[^\w\-]/g, '');
}

function getRawStageLabel(state: any) {
  const roadmap = state.roadmapInfo || state.stageInfo || {};

  return (
    state.roadmapStage ||
    state.stageLabel ||
    state.stage ||
    roadmap.label ||
    roadmap.title ||
    'STAGE NON DISPONIBILE'
  );
}

function getNormalizedStage(state: any) {
  const stage = String(getRawStageLabel(state) || '').toUpperCase();

  if (stage.includes('SCALE')) return 'SCALE_READINESS';
  if (stage.includes('PRODUCT')) return 'PRODUCTIZATION';
  if (stage.includes('STABIL')) return 'STABILIZATION';
  if (stage.includes('TRACTION')) return 'TRACTION';
  return 'FOUNDATION';
}

function getStageLabel(state: any) {
  const stage = getNormalizedStage(state);

  const labels: Record<string, string> = {
    FOUNDATION: 'FONDAZIONE',
    TRACTION: 'TRAZIONE',
    STABILIZATION: 'STABILIZZAZIONE',
    PRODUCTIZATION: 'PRODOTTIZZAZIONE',
    SCALE_READINESS: 'PRONTO PER LA SCALA'
  };

  return labels[stage] || 'FASE NON DISPONIBILE';
}

function getItalianRole(role: string) {
  const value = String(role || '').toLowerCase();

  if (value.includes('operator') && value.includes('designer')) {
    return 'Founder come operatore e progettista';
  }

  if (value.includes('builder')) {
    return 'Founder come costruttore';
  }

  if (value.includes('operator')) {
    return 'Founder come operatore';
  }

  if (value.includes('architect')) {
    return 'Founder come architetto del sistema';
  }

  if (value.includes('allocator')) {
    return 'Founder come allocatore';
  }

  return role || 'Founder';
}

function getProfileTitleItalian(title: string) {
  const value = String(title || '').toLowerCase();

  if (value.includes('trasferibilità')) return 'Gap di trasferibilità';
  if (value.includes('qualità della crescita')) return 'Gap di qualità della crescita';
  if (value.includes('architettura operativa')) return 'Gap di architettura operativa';
  if (value.includes('investor readiness')) return 'Gap di investor readiness';
  if (value.includes('posizionamento')) return 'Gap di posizionamento';
  if (value.includes('prevedibilità commerciale')) return 'Gap di prevedibilità commerciale';
  if (value.includes('delega decisionale')) return 'Gap di delega decisionale';
  if (value.includes('leggibilità esterna')) return 'Gap di leggibilità esterna';
  if (value.includes('clarity')) return 'Gap di chiarezza';
  if (value.includes('growth')) return 'Gap del motore commerciale';
  if (value.includes('operational')) return 'Gap operativo';
  if (value.includes('readiness')) return 'Gap di preparazione esterna';

  return title || 'Profilo diagnostico';
}

function getDimensionName(dim: any) {
  const raw = String(dim?.label || dim?.key || 'Dimension').toLowerCase();

  if (raw.includes('clarity')) return 'Chiarezza';
  if (raw.includes('acquisition')) return 'Acquisizione';
  if (raw.includes('operations')) return 'Operazioni';
  if (raw.includes('margins')) return 'Margini';
  if (raw.includes('asset')) return 'Asset';
  if (raw.includes('readiness')) return 'Preparazione';

  return String(dim?.label || dim?.key || 'Dimensione');
}

function getScoreStatus(score: number) {
  if (score >= 7) return 'FORZA';
  if (score >= 5) return 'IN SVILUPPO';
  return 'VINCOLO';
}

function fitText(text: string, maxChars: number) {
  const safe = String(text || '').trim();

  if (safe.length <= maxChars) return safe;

  return `${safe.slice(0, maxChars - 1).trim()}…`;
}

function getDimensionMicroCopy(dim: any) {
  const key = String(dim?.key || dim?.label || '').toLowerCase();
  const score = Number(dim?.score || 0);
  const band = score >= 7 ? 'high' : score >= 5 ? 'mid' : 'low';

  const copy: Record<string, Record<string, string>> = {
    clarity: {
      low: 'Valore non capito in fretta.',
      mid: 'Serve ancora troppa spiegazione.',
      high: 'Messaggio già leggibile.'
    },
    acquisition: {
      low: 'Flusso commerciale episodico.',
      mid: 'Flusso non ancora prevedibile.',
      high: 'Motore commerciale solido.'
    },
    operations: {
      low: 'Delivery ancora dipendente da te.',
      mid: 'Decisioni ancora al founder.',
      high: 'Macchina operativa trasferibile.'
    },
    margins: {
      low: 'Margine e costo non chiari.',
      mid: 'Margine poco leggibile.',
      high: 'Lettura economica solida.'
    },
    asset: {
      low: 'Valore ancora nell’esecuzione.',
      mid: 'Valore poco documentato.',
      high: 'Asset più visibili e trasferibili.'
    },
    readiness: {
      low: 'Business poco leggibile da fuori.',
      mid: 'Narrativa esterna parziale.',
      high: 'Narrativa esterna più solida.'
    }
  };

  if (key.includes('clarity')) return copy.clarity[band];
  if (key.includes('acquisition')) return copy.acquisition[band];
  if (key.includes('operations')) return copy.operations[band];
  if (key.includes('margins')) return copy.margins[band];
  if (key.includes('asset')) return copy.asset[band];
  if (key.includes('readiness')) return copy.readiness[band];

  return 'Area da monitorare.';
}

function getFunctionConstraints(state: any) {
  const stage = getNormalizedStage(state);

  const playbook: Record<string, Array<{ area: string; constraint: string; graduate: string }>> = {
    FOUNDATION: [
      {
        area: 'Acquisizione',
        constraint: 'Il messaggio non isola ancora una promessa centrale.',
        graduate: 'Va chiarito quale promessa può essere capita da un segmento prioritario.'
      },
      {
        area: 'Vendite',
        constraint: 'La vendita dipende ancora da spiegazioni lunghe o personali.',
        graduate: 'Va chiarito cosa deve rendere la conversazione più semplice e ripetibile.'
      },
      {
        area: 'Esecuzione',
        constraint: 'La delivery viene reinventata troppo spesso.',
        graduate: 'Va chiarito quale consegna minima può essere ripetuta senza ripartire da zero.'
      },
      {
        area: 'Finanza',
        constraint: 'Margine, prezzo e costo operativo non sono ancora separati.',
        graduate: 'Va chiarito quale offerta produce margine reale.'
      },
      {
        area: 'Dati',
        constraint: 'Mancano numeri minimi per capire cosa funziona.',
        graduate: 'Va chiarito quali numeri servono per leggere domanda, conversione e margine.'
      },
      {
        area: 'Asset',
        constraint: 'Il valore vive nell’esecuzione, non ancora in asset documentati.',
        graduate: 'Va chiarito quale parte del valore può essere documentata e trasferita.'
      },
      {
        area: 'Preparazione',
        constraint: 'Il business non è ancora leggibile da fuori.',
        graduate: 'Va chiarito cosa deve capire un esterno senza spiegazioni lunghe.'
      }
    ],
    TRACTION: [
      {
        area: 'Acquisizione',
        constraint: 'La domanda esiste, ma il canale primario non è ancora isolato.',
        graduate: 'Va chiarito quale canale produce segnali di qualità.'
      },
      {
        area: 'Vendite',
        constraint: 'Le conversazioni commerciali non sono ancora abbastanza qualificabili.',
        graduate: 'Va chiarito cosa distingue un lead utile da uno rumoroso.'
      },
      {
        area: 'Esecuzione',
        constraint: 'La delivery può collassare quando aumentano le richieste.',
        graduate: 'Va chiarito dove la delivery rischia di perdere qualità o margine.'
      },
      {
        area: 'Finanza',
        constraint: 'CAC, conversione e margine non vengono ancora letti insieme.',
        graduate: 'Va chiarita la relazione tra canale, conversione, margine e capacità.'
      },
      {
        area: 'Dati',
        constraint: 'Il sistema non mostra ancora cosa crea crescita ripetibile.',
        graduate: 'Va chiarito quali numeri mostrano cosa sta funzionando.'
      },
      {
        area: 'Operazioni',
        constraint: 'Il founder resta il punto di passaggio per priorità e urgenze.',
        graduate: 'Va chiarito quali eccezioni non devono più tornare al founder.'
      },
      {
        area: 'Preparazione',
        constraint: 'La storia del business è ancora troppo dipendente dal founder.',
        graduate: 'Va chiarito cosa deve capire un esterno senza parlare con il founder.'
      }
    ],
    STABILIZATION: [
      {
        area: 'Acquisizione',
        constraint: 'Il messaggio funziona, ma non è ancora abbastanza sistematizzato.',
        graduate: 'Va chiarito quale asset commerciale può essere replicato senza riscriverlo ogni volta.'
      },
      {
        area: 'Vendite',
        constraint: 'La vendita può ancora dipendere da seniority o intuizione.',
        graduate: 'Va chiarito cosa rende la vendita trasferibile ad altri operatori.'
      },
      {
        area: 'Operazioni',
        constraint: 'Le decisioni operative tornano ancora troppo spesso al founder.',
        graduate: 'Va chiarito quali decisioni possono seguire regole intermedie.'
      },
      {
        area: 'Esecuzione',
        constraint: 'La qualità non è ancora abbastanza indipendente dal controllo diretto.',
        graduate: 'Va chiarito quali standard proteggono la qualità senza controllo continuo.'
      },
      {
        area: 'Finanza',
        constraint: 'La crescita rischia di nascondere costi operativi e dispersione.',
        graduate: 'Va chiarito dove crescita, margine e carico operativo si separano.'
      },
      {
        area: 'Dati',
        constraint: 'Il reporting non separa ancora performance, capacità e colli di bottiglia.',
        graduate: 'Va chiarito quali segnali servono per decidere ogni settimana.'
      },
      {
        area: 'Team',
        constraint: 'Il team esegue, ma non sempre decide nel modo corretto.',
        graduate: 'Va chiarito cosa il team può decidere, quando escalare e con quali criteri.'
      }
    ],
    PRODUCTIZATION: [
      {
        area: 'Offerta',
        constraint: 'L’offerta funziona, ma non è ancora abbastanza impacchettata.',
        graduate: 'Va chiarito cosa rende l’offerta vendibile senza ridisegnarla ogni volta.'
      },
      {
        area: 'Acquisizione',
        constraint: 'Il messaggio deve diventare un asset scalabile.',
        graduate: 'Va chiarito quali prove e materiali rendono il messaggio più trasferibile.'
      },
      {
        area: 'Vendite',
        constraint: 'La conversione dipende ancora troppo da personalizzazione e urgenza.',
        graduate: 'Va chiarito cosa rende il processo commerciale ripetibile.'
      },
      {
        area: 'Operazioni',
        constraint: 'La complessità cresce se ogni cliente richiede eccezioni.',
        graduate: 'Va chiarito quali confini operativi non possono essere superati.'
      },
      {
        area: 'Finanza',
        constraint: 'Serve distinguere crescita buona e crescita che consuma margine.',
        graduate: 'Va chiarito quali segmenti, offerte e canali meritano più risorse.'
      },
      {
        area: 'Dati',
        constraint: 'La conoscenza operativa è ancora dispersa.',
        graduate: 'Va chiarito dove vive la conoscenza critica del business.'
      },
      {
        area: 'Preparazione',
        constraint: 'Il business deve diventare comprensibile a partner, hire o investitori.',
        graduate: 'Va chiarito quali materiali rendono il business leggibile da fuori.'
      }
    ],
    SCALE_READINESS: [
      {
        area: 'Strategia',
        constraint: 'La crescita può creare dispersione e iniziative laterali.',
        graduate: 'Va chiarito quali priorità guidano allocazione, focus e governance.'
      },
      {
        area: 'Acquisizione',
        constraint: 'I canali devono essere gestiti come portafoglio, non come esperimenti isolati.',
        graduate: 'Va chiarito quali canali meritano investimento e quali vanno ridotti.'
      },
      {
        area: 'Vendite',
        constraint: 'Il sistema commerciale deve reggere volume e segmentazione.',
        graduate: 'Va chiarito come leggere pipeline, qualificazione e previsione commerciale.'
      },
      {
        area: 'Operazioni',
        constraint: 'L’organizzazione deve assorbire crescita senza dipendere dal founder.',
        graduate: 'Va chiarito dove servono ownership, management layer e reporting.'
      },
      {
        area: 'Finanza',
        constraint: 'Le decisioni devono essere guidate da capitale, margine e rischio.',
        graduate: 'Va chiarito come capitale, margine e rischio guidano le scelte.'
      },
      {
        area: 'Dati',
        constraint: 'I dati devono supportare decisioni direzionali, non solo reporting.',
        graduate: 'Va chiarito quali metriche servono al controllo direzionale.'
      },
      {
        area: 'Preparazione',
        constraint: 'Materiali e governance devono reggere scrutiny esterno.',
        graduate: 'Va chiarito cosa deve essere pronto per advisor, partner o investitori.'
      }
    ]
  };

  return playbook[stage] || playbook.FOUNDATION;
}

function getGraduationChecklist(state: any) {
  const roadmap = state.roadmapInfo || state.stageInfo || {};
  const stage = getNormalizedStage(state);

  if (Array.isArray(roadmap.graduationCriteria) && roadmap.graduationCriteria.length > 0) {
    return roadmap.graduationCriteria.slice(0, 7);
  }

  const fallback: Record<string, string[]> = {
    FOUNDATION: [
      'Una offerta centrale chiara',
      'Un cliente ideale prioritario',
      'Una delivery ripetibile',
      'Una prima lettura di margine',
      'Un messaggio commerciale comprensibile senza spiegazioni lunghe'
    ],
    TRACTION: [
      'Un canale primario identificato',
      'Una metrica di conversione leggibile',
      'Una separazione tra lead buono e lead rumoroso',
      'Una delivery che non collassa al crescere delle richieste',
      'Una lettura chiara del margine per offerta o canale'
    ],
    STABILIZATION: [
      'Processi principali documentati',
      'Decisioni ricorrenti codificate',
      'Responsabilità operative assegnate',
      'Dashboard o reporting minimo attivo',
      'Eccezioni ridotte e gestite senza passare sempre dal founder'
    ],
    PRODUCTIZATION: [
      'Offerta principale codificata',
      'Confini di delivery chiari',
      'Unit economics per offerta e segmento',
      'Sales process ripetibile',
      'Materiali commerciali e operativi coerenti'
    ],
    SCALE_READINESS: [
      'Metriche finanziarie coerenti',
      'Narrativa strategica chiara',
      'Asset e sistemi documentati',
      'Responsabilità manageriali leggibili',
      'Materiali pronti per partner, investitori, board o operazioni straordinarie'
    ]
  };

  return fallback[stage] || fallback.FOUNDATION;
}

function getThreePriorities(state: any) {
  const priorities = Array.isArray(state.priorita || state.priorities)
    ? [...(state.priorita || state.priorities)]
    : [];

  const fallbackDims = Array.isArray(state.processedDims) ? state.processedDims : [];

  const sortedFallback = [...fallbackDims].sort((a: any, b: any) => {
    return Number(a.score || 0) - Number(b.score || 0);
  });

  const topThree = [...priorities];

  sortedFallback.forEach((dim: any) => {
    const alreadyIncluded = topThree.some((p: any) => {
      return String(p.key || p.label) === String(dim.key || dim.label);
    });

    if (!alreadyIncluded && topThree.length < 3) {
      topThree.push(dim);
    }
  });

  return topThree.slice(0, 3);
}
