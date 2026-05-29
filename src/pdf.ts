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
      low: 'Il valore non è ancora capito in fretta.',
      mid: 'Il valore richiede ancora troppa spiegazione.',
      high: 'Il messaggio è già abbastanza leggibile.'
    },
    acquisition: {
      low: 'Il flusso commerciale è ancora episodico.',
      mid: 'Il flusso commerciale non è ancora prevedibile.',
      high: 'Il motore commerciale ha già basi solide.'
    },
    operations: {
      low: 'La delivery dipende ancora troppo da te.',
      mid: 'Le decisioni tornano ancora al founder.',
      high: 'La macchina operativa è già trasferibile.'
    },
    margins: {
      low: 'Margine, costo e valore cliente non sono chiari.',
      mid: 'Il margine non è abbastanza leggibile.',
      high: 'La lettura economica è già solida.'
    },
    asset: {
      low: 'Il valore vive ancora nell’esecuzione.',
      mid: 'Il valore non è ancora abbastanza documentato.',
      high: 'Gli asset sono già più visibili e trasferibili.'
    },
    readiness: {
      low: 'Il business non è ancora leggibile dall’esterno.',
      mid: 'La narrativa esterna è ancora parziale.',
      high: 'La narrativa esterna è già più solida.'
    }
  };

  if (key.includes('clarity')) return copy.clarity[band];
  if (key.includes('acquisition')) return copy.acquisition[band];
  if (key.includes('operations')) return copy.operations[band];
  if (key.includes('margins')) return copy.margins[band];
  if (key.includes('asset')) return copy.asset[band];
  if (key.includes('readiness')) return copy.readiness[band];

  return 'Area diagnostica da monitorare.';
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
      'Management layer attivo',
      'Metriche direzionali affidabili',
      'Governance operativa più chiara',
      'Data room leggera pronta',
      'Criteri di allocazione capitale e priorità definiti'
    ]
  };

  return fallback[stage] || fallback.FOUNDATION;
}

function drawExecutiveResultPage(pdf: PDFBuilder, state: any, userProfile: any) {
  const roadmap = state.roadmapInfo || state.stageInfo || {};
  const name = getDisplayName(state);
  const stageLabel = getStageLabel(state);
  const profileTitle = getProfileTitleItalian(userProfile?.title);

  pdf.newPage(IMPULSE_COLORS.dark, true);

  pdf.drawText('IMPULSE BUSINESS READINESS REPORT', PAGE.marginX, 40, {
    fontSize: 9,
    style: 'bold',
    color: IMPULSE_COLORS.gold,
    charSpace: 1.2
  });

  pdf.drawText(`Preparato per ${name}`, PAGE.marginX, 52, {
    fontSize: 9,
    color: IMPULSE_COLORS.grayLight
  });

  pdf.drawText(new Date().toLocaleDateString('it-IT'), PAGE.width - PAGE.marginX, 52, {
    fontSize: 9,
    align: 'right',
    color: IMPULSE_COLORS.grayLight
  });

  pdf.drawDonut(PAGE.marginX + 31, 103, 25, 4, Number(state.overall || 0), IMPULSE_COLORS.teal);

  pdf.drawText(`${Number(state.overall || 0)}%`, PAGE.marginX + 31, 109, {
    fontSize: 32,
    style: 'bold',
    align: 'center',
    color: IMPULSE_COLORS.white
  });

  pdf.drawText('PUNTEGGIO COMPLESSIVO', PAGE.marginX + 31, 131, {
    fontSize: 5.8,
    style: 'bold',
    align: 'center',
    color: IMPULSE_COLORS.grayLight,
    charSpace: 0.4
  });

  pdf.drawText(profileTitle, PAGE.marginX + 72, 88, {
    fontSize: 31,
    style: 'bold',
    color: IMPULSE_COLORS.white,
    lineHeightFactor: 1.05,
    maxWidth: 82
  });

  pdf.drawText(
    userProfile?.blocco ||
      'Il report identifica il vincolo principale che rallenta la prossima fase di crescita.',
    PAGE.marginX + 72,
    126,
    {
      fontSize: 10.5,
      color: IMPULSE_COLORS.cream,
      lineHeightFactor: 1.55,
      maxWidth: 82
    }
  );

  const boxY = 168;
  const boxW = 48;
  const boxGap = 5;

  const boxes = [
    { title: 'FASCIA', value: String(state.fascia || '-') },
    { title: 'PROFILO', value: `Profilo ${state.profile || '-'}` },
    { title: 'FASE', value: stageLabel }
  ];

  boxes.forEach((box, index) => {
    const x = PAGE.marginX + index * (boxW + boxGap);

    pdf.fillRect(x, boxY, boxW, 31, IMPULSE_COLORS.darkSoft);

    pdf.drawText(box.title, x + 5, boxY + 9, {
      fontSize: 6.5,
      style: 'bold',
      color: IMPULSE_COLORS.gold,
      charSpace: 0.6,
      maxWidth: boxW - 10
    });

    pdf.drawText(box.value, x + 5, boxY + 20, {
      fontSize: 8.5,
      style: 'bold',
      color: IMPULSE_COLORS.white,
      lineHeightFactor: 1.2,
      maxWidth: boxW - 10
    });
  });

  pdf.cursorY = 222;

  pdf.drawText('VINCOLO PRINCIPALE', PAGE.marginX, pdf.cursorY, {
    fontSize: 8,
    style: 'bold',
    color: IMPULSE_COLORS.gold,
    charSpace: 1
  });

  pdf.cursorY += 11;

  const mainConstraint =
    roadmap.bottomLineConstraint ||
    userProfile?.manifesta ||
    'Il vincolo principale richiede priorità operativa prima di aumentare complessità, budget o nuove iniziative.';

  pdf.drawText(mainConstraint, PAGE.marginX, pdf.cursorY, {
    fontSize: 14,
    style: 'bold',
    color: IMPULSE_COLORS.white,
    lineHeightFactor: 1.45,
    maxWidth: PAGE.contentWidth
  });
}

function drawRoadmapStagePage(pdf: PDFBuilder, state: any) {
  const roadmap = state.roadmapInfo || state.stageInfo || {};
  const stageLabel = getStageLabel(state);
  const role = getItalianRole(roadmap.role || 'Founder');

  pdf.newPage(IMPULSE_COLORS.cream);

  pdf.cursorY = 38;

  pdf.drawText('LA TUA FASE', PAGE.marginX, pdf.cursorY, {
    fontSize: 24,
    style: 'bold',
    color: IMPULSE_COLORS.dark
  });

  pdf.cursorY += 17;

  pdf.drawText(stageLabel, PAGE.marginX, pdf.cursorY, {
    fontSize: 34,
    style: 'bold',
    color: IMPULSE_COLORS.teal,
    lineHeightFactor: 1.05,
    maxWidth: PAGE.contentWidth
  });

  pdf.cursorY += 22;

  const tableY = pdf.cursorY;
  const labelW = 45;
  const rowH = 14;

  const rows = [
    {
      label: 'RUOLO',
      value: role
    },
    {
      label: 'VINCOLO',
      value: roadmap.bottomLineConstraint || roadmap.headline || 'Vincolo non disponibile'
    },
    {
      label: 'PASSAGGIO',
      value: getGraduationChecklist(state).slice(0, 2).join(' · ')
    }
  ];

  rows.forEach((row, index) => {
    const y = tableY + index * rowH;

    pdf.fillRect(PAGE.marginX, y, labelW, rowH, IMPULSE_COLORS.teal);
    pdf.fillRect(PAGE.marginX + labelW, y, PAGE.contentWidth - labelW, rowH, IMPULSE_COLORS.white);

    pdf.drawText(row.label, PAGE.marginX + 4, y + 8.7, {
      fontSize: 6.8,
      style: 'bold',
      color: IMPULSE_COLORS.white,
      charSpace: 0.5
    });

    pdf.drawText(String(row.value), PAGE.marginX + labelW + 5, y + 8.5, {
      fontSize: 7.4,
      color: IMPULSE_COLORS.darkSoft,
      maxWidth: PAGE.contentWidth - labelW - 8,
      lineHeightFactor: 1.15
    });
  });

  pdf.cursorY = tableY + rows.length * rowH + 20;

  if (roadmap.headline) {
    pdf.cursorY = pdf.drawText(roadmap.headline, PAGE.marginX, pdf.cursorY, {
      fontSize: 12.5,
      style: 'bold',
      color: IMPULSE_COLORS.dark,
      lineHeightFactor: 1.4,
      maxWidth: PAGE.contentWidth
    });

    pdf.cursorY += 10;
  }

  if (roadmap.strategicReviewFocus) {
    pdf.cursorY = pdf.drawLuxuryCard(
      'FOCUS DELLA STRATEGIC REVIEW',
      roadmap.strategicReviewFocus,
      IMPULSE_COLORS.teal,
      pdf.cursorY,
      IMPULSE_COLORS.lightBlue
    );
  }

  if (roadmap.nonFare && pdf.cursorY < 250) {
    pdf.cursorY = pdf.drawLuxuryCard(
      'ERRORE DA EVITARE',
      roadmap.nonFare,
      IMPULSE_COLORS.dark,
      pdf.cursorY,
      IMPULSE_COLORS.white
    );
  }
}

function drawFunctionConstraintsPage(pdf: PDFBuilder, state: any) {
  const rows = getFunctionConstraints(state);

  pdf.newPage(IMPULSE_COLORS.white);

  pdf.cursorY = 36;

  pdf.drawText('MAPPA OPERATIVA DEI VINCOLI', PAGE.marginX, pdf.cursorY, {
    fontSize: 26,
    style: 'bold',
    color: IMPULSE_COLORS.dark,
    lineHeightFactor: 1.05
  });

  pdf.cursorY += 19;

  pdf.drawText(
    'Questa è la parte operativa della diagnosi: mostra dove il vincolo si manifesta e cosa va chiarito prima di passare allo stage successivo.',
    PAGE.marginX,
    pdf.cursorY,
    {
      fontSize: 9.6,
      color: IMPULSE_COLORS.gray,
      lineHeightFactor: 1.45,
      maxWidth: PAGE.contentWidth
    }
  );

  pdf.cursorY += 23;

  const tableX = PAGE.marginX;
  const tableY = pdf.cursorY;
  const areaW = 31;
  const constraintW = 64;
  const graduateW = 59;
  const rowH = 24;

  pdf.fillRect(tableX, tableY, PAGE.contentWidth, 12, IMPULSE_COLORS.dark);

  pdf.drawText('AREA', tableX + 4, tableY + 8, {
    fontSize: 6.5,
    style: 'bold',
    color: IMPULSE_COLORS.white,
    charSpace: 0.6
  });

  pdf.drawText('VINCOLO', tableX + areaW + 4, tableY + 8, {
    fontSize: 6.5,
    style: 'bold',
    color: IMPULSE_COLORS.white,
    charSpace: 0.6
  });

  pdf.drawText('DA CHIARIRE', tableX + areaW + constraintW + 4, tableY + 8, {
    fontSize: 6.5,
    style: 'bold',
    color: IMPULSE_COLORS.white,
    charSpace: 0.6
  });

  rows.slice(0, 7).forEach((row, index) => {
    const y = tableY + 12 + index * rowH;
    const bg = index % 2 === 0 ? IMPULSE_COLORS.cream : IMPULSE_COLORS.white;

    pdf.fillRect(tableX, y, PAGE.contentWidth, rowH, bg);
    pdf.fillRect(tableX, y, areaW, rowH, IMPULSE_COLORS.teal);

    pdf.drawText(row.area.toUpperCase(), tableX + 4, y + 10, {
      fontSize: 6.6,
      style: 'bold',
      color: IMPULSE_COLORS.white,
      maxWidth: areaW - 7,
      lineHeightFactor: 1.12
    });

    pdf.drawText(row.constraint, tableX + areaW + 4, y + 8, {
      fontSize: 6.8,
      color: IMPULSE_COLORS.darkSoft,
      maxWidth: constraintW - 8,
      lineHeightFactor: 1.18
    });

    pdf.drawText(row.graduate, tableX + areaW + constraintW + 4, y + 8, {
      fontSize: 6.8,
      color: IMPULSE_COLORS.darkSoft,
      maxWidth: graduateW - 8,
      lineHeightFactor: 1.18
    });
  });

  pdf.cursorY = tableY + 12 + rows.slice(0, 7).length * rowH + 12;

  pdf.fillRect(PAGE.marginX, pdf.cursorY, PAGE.contentWidth, 28, IMPULSE_COLORS.dark);
  pdf.fillRect(PAGE.marginX, pdf.cursorY, 4, 28, IMPULSE_COLORS.gold);

  pdf.drawText('PUNTO CHIAVE', PAGE.marginX + 10, pdf.cursorY + 10, {
    fontSize: 7,
    style: 'bold',
    color: IMPULSE_COLORS.gold,
    charSpace: 0.8
  });

  pdf.drawText(
    'Il valore del report è identificare cosa blocca il passaggio di stage. Il lavoro successivo è decidere come rimuoverlo.',
    PAGE.marginX + 10,
    pdf.cursorY + 19,
    {
      fontSize: 8.3,
      style: 'bold',
      color: IMPULSE_COLORS.white,
      maxWidth: PAGE.contentWidth - 18,
      lineHeightFactor: 1.2
    }
  );
}

function drawTopPrioritiesPage(pdf: PDFBuilder, state: any) {
  const priorities = state.priorita || state.priorities || [];
  const fallbackDims = state.processedDims || [];
  const topThree = priorities.length ? priorities.slice(0, 3) : fallbackDims.slice(0, 3);

  pdf.newPage(IMPULSE_COLORS.white);

  pdf.cursorY = 40;

  pdf.drawText('LE 3 PRIORITÀ OPERATIVE', PAGE.marginX, pdf.cursorY, {
    fontSize: 27,
    style: 'bold',
    color: IMPULSE_COLORS.dark,
    lineHeightFactor: 1.05
  });

  pdf.cursorY += 20;

  pdf.drawText(
    'Queste sono le aree che creano più attrito operativo. Il report indica cosa va chiarito prima di aumentare complessità, budget o nuove iniziative.',
    PAGE.marginX,
    pdf.cursorY,
    {
      fontSize: 10,
      color: IMPULSE_COLORS.gray,
      lineHeightFactor: 1.5,
      maxWidth: PAGE.contentWidth
    }
  );

  pdf.cursorY += 20;

  topThree.forEach((dim: any, index: number) => {
    const y = pdf.cursorY;
    const score = Number(dim.score || 0);
    const title = `#${index + 1} ${getDimensionName(dim).toUpperCase()} · ${score.toFixed(1)} / 10`;
    const body =
      dim.vincolo ||
      dim.meaning ||
      dim.cosaIndica ||
      'Questa area richiede lavoro applicato prima di scalare.';

    const bg = index === 0 ? IMPULSE_COLORS.lightBlue : IMPULSE_COLORS.cream;
    const accent = index === 0 ? IMPULSE_COLORS.teal : IMPULSE_COLORS.gold;

    pdf.fillRect(PAGE.marginX, y, PAGE.contentWidth, 55, bg);
    pdf.fillRect(PAGE.marginX, y, 4, 55, accent);

    pdf.drawText(title, PAGE.marginX + 10, y + 10, {
      fontSize: 8,
      style: 'bold',
      color: index === 0 ? IMPULSE_COLORS.teal : IMPULSE_COLORS.dark,
      charSpace: 0.4
    });

    pdf.drawText(body, PAGE.marginX + 10, y + 20, {
      fontSize: 8.7,
      color: IMPULSE_COLORS.darkSoft,
      lineHeightFactor: 1.25,
      maxWidth: PAGE.contentWidth - 18
    });

    if (dim.lavoro) {
      pdf.drawText('DA CHIARIRE:', PAGE.marginX + 10, y + 41, {
        fontSize: 6.3,
        style: 'bold',
        color: IMPULSE_COLORS.teal,
        charSpace: 0.2
      });

      pdf.drawText(fitText(dim.lavoro, 88), PAGE.marginX + 49, y + 41, {
        fontSize: 6.6,
        color: IMPULSE_COLORS.darkSoft,
        maxWidth: 40,
        lineHeightFactor: 1.15
      });
    }

    if (dim.nonFare) {
      pdf.drawText('EVITARE:', PAGE.marginX + 91, y + 41, {
        fontSize: 6.5,
        style: 'bold',
        color: IMPULSE_COLORS.dark,
        charSpace: 0.3
      });

      pdf.drawText(fitText(dim.nonFare, 78), PAGE.marginX + 118, y + 41, {
        fontSize: 6.7,
        color: IMPULSE_COLORS.darkSoft,
        maxWidth: 55,
        lineHeightFactor: 1.15
      });
    }

    pdf.cursorY += 64;
  });
}

function drawGraduationChecklistPage(pdf: PDFBuilder, state: any) {
  const checklist = getGraduationChecklist(state);
  const roadmap = state.roadmapInfo || state.stageInfo || {};

  pdf.newPage(IMPULSE_COLORS.cream);

  pdf.cursorY = 40;

  pdf.drawText('CHECKLIST PER IL PROSSIMO STAGE', PAGE.marginX, pdf.cursorY, {
    fontSize: 25,
    style: 'bold',
    color: IMPULSE_COLORS.dark,
    lineHeightFactor: 1.05
  });

  pdf.cursorY += 20;

  pdf.drawText(
    'Questi sono i criteri pratici che devono diventare più chiari, stabili o trasferibili prima del salto successivo.',
    PAGE.marginX,
    pdf.cursorY,
    {
      fontSize: 10,
      color: IMPULSE_COLORS.gray,
      lineHeightFactor: 1.5,
      maxWidth: PAGE.contentWidth
    }
  );

  pdf.cursorY += 24;

  checklist.slice(0, 7).forEach((item: string, index: number) => {
    const y = pdf.cursorY;

    pdf.fillRect(PAGE.marginX, y, PAGE.contentWidth, 18, IMPULSE_COLORS.white);
    pdf.fillRect(PAGE.marginX, y, 18, 18, index < 2 ? IMPULSE_COLORS.teal : IMPULSE_COLORS.gold);

    pdf.drawText(String(index + 1).padStart(2, '0'), PAGE.marginX + 9, y + 11.5, {
      fontSize: 7.5,
      style: 'bold',
      color: IMPULSE_COLORS.white,
      align: 'center'
    });

    pdf.drawText(item, PAGE.marginX + 25, y + 11.5, {
      fontSize: 9.3,
      style: 'bold',
      color: IMPULSE_COLORS.darkSoft,
      maxWidth: PAGE.contentWidth - 32,
      lineHeightFactor: 1.15
    });

    pdf.cursorY += 22;
  });

  if (roadmap.nonFare && pdf.cursorY < 245) {
    pdf.cursorY += 4;

    pdf.cursorY = pdf.drawLuxuryCard(
      'COSA NON SCALARE ANCORA',
      roadmap.nonFare,
      IMPULSE_COLORS.dark,
      pdf.cursorY,
      IMPULSE_COLORS.white
    );
  }
}

function drawScoreMapPage(pdf: PDFBuilder, state: any) {
  const strengths = state.forze || state.strengths || [];
  const priorities = state.priorita || state.priorities || [];
  const spiderDims = state.spiderDims || state.processedDims || [];

  pdf.newPage(IMPULSE_COLORS.white);

  pdf.cursorY = 42;

  pdf.drawText('Le tue coordinate.', PAGE.marginX, pdf.cursorY, {
    fontSize: 30,
    style: 'bold',
    color: IMPULSE_COLORS.dark
  });

  pdf.cursorY += 17;

  pdf.drawText(
    'Questa pagina mostra dove il business è già solido e dove crea più attrito prima del prossimo salto.',
    PAGE.marginX,
    pdf.cursorY,
    {
      fontSize: 10,
      color: IMPULSE_COLORS.gray,
      lineHeightFactor: 1.5,
      maxWidth: PAGE.contentWidth
    }
  );

  const leftX = PAGE.marginX;
  const rightX = PAGE.marginX + 82;
  const startY = 92;

  pdf.drawText('LE TUE FORZE', leftX, startY, {
    fontSize: 8,
    style: 'bold',
    color: IMPULSE_COLORS.teal,
    charSpace: 0.7
  });

  strengths.slice(0, 3).forEach((dim: any, index: number) => {
    const y = startY + 16 + index * 17;

    pdf.drawText(getDimensionName(dim), leftX, y, {
      fontSize: 11,
      style: 'bold',
      color: IMPULSE_COLORS.dark
    });

    pdf.drawText(Number(dim.score || 0).toFixed(1), leftX + 57, y, {
      fontSize: 13,
      style: 'bold',
      color: IMPULSE_COLORS.teal
    });
  });

  pdf.drawText(state.overall >= 75 ? 'AREE DA RIFINIRE' : 'LE TUE PRIORITÀ', rightX, startY, {
    fontSize: 8,
    style: 'bold',
    color: IMPULSE_COLORS.gold,
    charSpace: 0.7
  });

  priorities.slice(0, 3).forEach((dim: any, index: number) => {
    const y = startY + 16 + index * 17;

    pdf.drawText(getDimensionName(dim), rightX, y, {
      fontSize: 11,
      style: 'bold',
      color: IMPULSE_COLORS.dark
    });

    pdf.drawText(Number(dim.score || 0).toFixed(1), rightX + 57, y, {
      fontSize: 13,
      style: 'bold',
      color: IMPULSE_COLORS.dark
    });
  });

  pdf.drawRadar(PAGE.width / 2, 215, 48, spiderDims);
}

function drawDimensionCardsPage(pdf: PDFBuilder, state: any) {
  const dims = state.processedDims || [];

  pdf.newPage(IMPULSE_COLORS.cream);

  pdf.cursorY = 42;

  pdf.drawText('MAPPA DIAGNOSTICA', PAGE.marginX, pdf.cursorY, {
    fontSize: 29,
    style: 'bold',
    color: IMPULSE_COLORS.dark
  });

  pdf.cursorY += 18;

  pdf.drawText(
    'Le 6 dimensioni mostrano dove il business è forte, dove è instabile e dove il valore resta bloccato.',
    PAGE.marginX,
    pdf.cursorY,
    {
      fontSize: 10,
      color: IMPULSE_COLORS.gray,
      lineHeightFactor: 1.5,
      maxWidth: PAGE.contentWidth
    }
  );

  const cardW = 72;
  const cardH = 50;
  const gapX = 10;
  const gapY = 11;
  const startX = PAGE.marginX;
  const startY = 88;

  dims.slice(0, 6).forEach((dim: any, index: number) => {
    const col = index % 2;
    const row = Math.floor(index / 2);
    const x = startX + col * (cardW + gapX);
    const y = startY + row * (cardH + gapY);
    const score = Number(dim.score || 0);
    const status = getScoreStatus(score);
    const accent =
      score >= 7
        ? IMPULSE_COLORS.teal
        : score >= 5
          ? IMPULSE_COLORS.gold
          : IMPULSE_COLORS.dark;

    pdf.fillRect(x, y, cardW, cardH, IMPULSE_COLORS.white);
    pdf.fillRect(x, y, 3, cardH, accent);

    pdf.drawText(getDimensionName(dim).toUpperCase(), x + 8, y + 10, {
      fontSize: 7.2,
      style: 'bold',
      color: accent,
      charSpace: 0.4,
      maxWidth: cardW - 14
    });

    pdf.drawText(`${score.toFixed(1)} / 10`, x + 8, y + 22, {
      fontSize: 16,
      style: 'bold',
      color: IMPULSE_COLORS.dark
    });

    pdf.drawText(status, x + 8, y + 31, {
      fontSize: 6.5,
      style: 'bold',
      color: IMPULSE_COLORS.gray,
      charSpace: 0.4
    });

    pdf.drawText(getDimensionMicroCopy(dim), x + 8, y + 39, {
      fontSize: 7.2,
      color: IMPULSE_COLORS.darkSoft,
      lineHeightFactor: 1.25,
      maxWidth: cardW - 14
    });
  });

  pdf.cursorY = 248;

  pdf.drawText('Punto chiave', PAGE.marginX, pdf.cursorY, {
    fontSize: 10,
    style: 'bold',
    color: IMPULSE_COLORS.teal
  });

  pdf.cursorY += 10;

  pdf.drawText(
    'I punteggi servono a localizzare il vincolo. Il lavoro successivo è trasformare quel vincolo in sistemi, regole e materiali operativi.',
    PAGE.marginX,
    pdf.cursorY,
    {
      fontSize: 11,
      style: 'bold',
      color: IMPULSE_COLORS.dark,
      lineHeightFactor: 1.45,
      maxWidth: PAGE.contentWidth
    }
  );
}

function drawProfilePage(pdf: PDFBuilder, state: any, userProfile: any) {
  const profileTitle = getProfileTitleItalian(userProfile?.title);

  pdf.newPage(IMPULSE_COLORS.dark, true);

  pdf.cursorY = 45;

  pdf.drawText(`PROFILO ${state.profile || ''}`, PAGE.marginX, pdf.cursorY, {
    fontSize: 9,
    style: 'bold',
    color: IMPULSE_COLORS.gold,
    charSpace: 1.2
  });

  pdf.cursorY += 18;

  pdf.drawText(profileTitle, PAGE.marginX, pdf.cursorY, {
    fontSize: 38,
    style: 'bold',
    color: IMPULSE_COLORS.white,
    lineHeightFactor: 1.05,
    maxWidth: PAGE.contentWidth
  });

  pdf.cursorY += 32;

  pdf.drawText(userProfile?.blocco || '', PAGE.marginX, pdf.cursorY, {
    fontSize: 12.5,
    style: 'italic',
    color: IMPULSE_COLORS.cream,
    lineHeightFactor: 1.45,
    maxWidth: PAGE.contentWidth
  });

  pdf.cursorY += 34;

  if (userProfile?.manifesta) {
    pdf.drawText('COME SI MANIFESTA', PAGE.marginX, pdf.cursorY, {
      fontSize: 8,
      style: 'bold',
      color: IMPULSE_COLORS.teal,
      charSpace: 0.8
    });

    pdf.cursorY += 9;

    pdf.cursorY = pdf.drawText(userProfile.manifesta, PAGE.marginX, pdf.cursorY, {
      fontSize: 10.5,
      color: IMPULSE_COLORS.white,
      lineHeightFactor: 1.5,
      maxWidth: PAGE.contentWidth
    });

    pdf.cursorY += 13;
  }

  if (userProfile?.rischio) {
    pdf.drawText('IL RISCHIO SE IGNORATO', PAGE.marginX, pdf.cursorY, {
      fontSize: 8,
      style: 'bold',
      color: IMPULSE_COLORS.gold,
      charSpace: 0.8
    });

    pdf.cursorY += 9;

    pdf.cursorY = pdf.drawText(userProfile.rischio, PAGE.marginX, pdf.cursorY, {
      fontSize: 10.5,
      color: IMPULSE_COLORS.white,
      lineHeightFactor: 1.5,
      maxWidth: PAGE.contentWidth
    });

    pdf.cursorY += 13;
  }

  if (userProfile?.decisione) {
    pdf.fillRect(PAGE.marginX, pdf.cursorY, PAGE.contentWidth, 38, IMPULSE_COLORS.darkSoft);
    pdf.fillRect(PAGE.marginX, pdf.cursorY, 4, 38, IMPULSE_COLORS.gold);

    pdf.drawText('LA DECISIONE CHE VIENE PRIMA', PAGE.marginX + 10, pdf.cursorY + 11, {
      fontSize: 7.5,
      style: 'bold',
      color: IMPULSE_COLORS.gold,
      charSpace: 0.7
    });

    pdf.drawText(userProfile.decisione, PAGE.marginX + 10, pdf.cursorY + 21, {
      fontSize: 10,
      style: 'bold',
      color: IMPULSE_COLORS.white,
      lineHeightFactor: 1.35,
      maxWidth: PAGE.contentWidth - 18
    });
  }
}

function drawStrategicReviewPage(pdf: PDFBuilder, state: any, userProfile: any) {
  pdf.newPage(IMPULSE_COLORS.teal, true);

  pdf.cursorY = 58;

  pdf.drawText('IL REPORT MOSTRA DOVE SI TROVA IL VINCOLO.', PAGE.marginX, pdf.cursorY, {
    fontSize: 25,
    style: 'bold',
    color: IMPULSE_COLORS.white,
    lineHeightFactor: 1.08,
    maxWidth: PAGE.contentWidth
  });

  pdf.cursorY += 38;

  pdf.drawText('LA REVIEW DEFINISCE COME PROCEDERE.', PAGE.marginX, pdf.cursorY, {
    fontSize: 25,
    style: 'bold',
    color: IMPULSE_COLORS.gold,
    lineHeightFactor: 1.08,
    maxWidth: PAGE.contentWidth
  });

  pdf.cursorY += 42;

  pdf.drawText(
    'Questo report identifica cosa sta bloccando il business. La Strategic Review serve a definire come rimuoverlo, in quale ordine e con quali decisioni operative.',
    PAGE.marginX,
    pdf.cursorY,
    {
      fontSize: 12,
      color: IMPULSE_COLORS.cream,
      lineHeightFactor: 1.55,
      maxWidth: PAGE.contentWidth
    }
  );

  pdf.cursorY += 31;

  pdf.drawText('Nella review definiamo:', PAGE.marginX, pdf.cursorY, {
    fontSize: 9,
    style: 'bold',
    color: IMPULSE_COLORS.gold,
    charSpace: 0.5
  });

  pdf.cursorY += 10;

  pdf.drawText(
    '1. come rimuovere il primo vincolo\n2. in quale ordine intervenire\n3. cosa non scalare ancora',
    PAGE.marginX,
    pdf.cursorY,
    {
      fontSize: 10.5,
      color: IMPULSE_COLORS.white,
      lineHeightFactor: 1.55,
      maxWidth: PAGE.contentWidth
    }
  );

  pdf.cursorY += 48;

  pdf.fillRect(PAGE.marginX, pdf.cursorY, 95, 15, IMPULSE_COLORS.gold);

  pdf.drawText('CANDIDATI ALLA REVIEW', PAGE.marginX + 47.5, pdf.cursorY + 9.8, {
    fontSize: 8.5,
    style: 'bold',
    align: 'center',
    color: IMPULSE_COLORS.dark
  });

  pdf.cursorY += 42;

  pdf.drawText('davidedileo.it', PAGE.marginX, pdf.cursorY, {
    fontSize: 20,
    style: 'bold',
    color: IMPULSE_COLORS.white
  });
}

export async function generateIMPULSEReport(state: any, label?: string) {
  const pdf = new PDFBuilder(state);
  const userProfile = getProfileData(state.profile, state.overall);

  drawExecutiveResultPage(pdf, state, userProfile);
  drawRoadmapStagePage(pdf, state);
  drawFunctionConstraintsPage(pdf, state);
  drawTopPrioritiesPage(pdf, state);
  drawGraduationChecklistPage(pdf, state);
  drawScoreMapPage(pdf, state);
  drawDimensionCardsPage(pdf, state);
  drawProfilePage(pdf, state, userProfile);
  drawStrategicReviewPage(pdf, state, userProfile);

  const filename = label
    ? `IMPULSE_Report_${getFilenameSafe(label)}.pdf`
    : `IMPULSE_Report_${getFilenameSafe(getDisplayName(state))}.pdf`;

  pdf.save(filename);
}
