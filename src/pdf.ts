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

      this.drawText(String(safeDimensions[i].label || '').toUpperCase(), lx, ly + 1.5, {
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

function getStageLabel(state: any) {
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

function getDimensionName(dim: any) {
  return String(dim?.label || dim?.key || 'Dimension');
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

function drawExecutiveResultPage(pdf: PDFBuilder, state: any, userProfile: any) {
  const roadmap = state.roadmapInfo || state.stageInfo || {};
  const name = getDisplayName(state);
  const stageLabel = getStageLabel(state);

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

  pdf.drawText('OVERALL SCORE', PAGE.marginX + 31, 131, {
    fontSize: 7,
    style: 'bold',
    align: 'center',
    color: IMPULSE_COLORS.grayLight,
    charSpace: 0.8
  });

  pdf.drawText(userProfile?.title || 'Diagnostic Profile', PAGE.marginX + 72, 88, {
    fontSize: 31,
    style: 'bold',
    color: IMPULSE_COLORS.white,
    lineHeightFactor: 1.05,
    maxWidth: 82
  });

  pdf.drawText(userProfile?.blocco || 'Il report identifica il vincolo principale che rallenta la prossima fase di crescita.', PAGE.marginX + 72, 126, {
    fontSize: 10.5,
    color: IMPULSE_COLORS.cream,
    lineHeightFactor: 1.55,
    maxWidth: 82
  });

  const boxY = 168;
  const boxW = 48;
  const boxGap = 5;

  const boxes = [
    { title: 'FASCIA', value: String(state.fascia || '-') },
    { title: 'PROFILO', value: `Profilo ${state.profile || '-'}` },
    { title: 'STAGE', value: stageLabel }
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

  pdf.drawText('MAIN CONSTRAINT', PAGE.marginX, pdf.cursorY, {
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

  pdf.drawText('Questa pagina mostra dove il business è già solido e dove crea più attrito prima del prossimo salto.', PAGE.marginX, pdf.cursorY, {
    fontSize: 10,
    color: IMPULSE_COLORS.gray,
    lineHeightFactor: 1.5,
    maxWidth: PAGE.contentWidth
  });

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

function drawRoadmapStagePage(pdf: PDFBuilder, state: any) {
  const roadmap = state.roadmapInfo || state.stageInfo || {};
  const stageLabel = getStageLabel(state);

  pdf.newPage(IMPULSE_COLORS.cream);

  pdf.cursorY = 42;

  pdf.drawText('WHEN YOU HIT', PAGE.marginX, pdf.cursorY, {
    fontSize: 24,
    style: 'bold',
    color: IMPULSE_COLORS.dark
  });

  pdf.cursorY += 18;

  pdf.drawText(stageLabel, PAGE.marginX, pdf.cursorY, {
    fontSize: 32,
    style: 'bold',
    color: IMPULSE_COLORS.teal,
    lineHeightFactor: 1.05,
    maxWidth: PAGE.contentWidth
  });

  pdf.cursorY += 25;

  if (roadmap.role) {
    pdf.drawText(String(roadmap.role).toUpperCase(), PAGE.marginX, pdf.cursorY, {
      fontSize: 8,
      style: 'bold',
      color: IMPULSE_COLORS.gray,
      charSpace: 0.7
    });

    pdf.cursorY += 13;
  }

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

  if (roadmap.bottomLineConstraint) {
    pdf.cursorY = pdf.drawLuxuryCard(
      '01. IL VINCOLO DI FONDO',
      roadmap.bottomLineConstraint,
      IMPULSE_COLORS.teal,
      pdf.cursorY,
      IMPULSE_COLORS.white
    );
  }

  if (roadmap.graduationCriteria && Array.isArray(roadmap.graduationCriteria)) {
    pdf.cursorY = pdf.drawBulletList(
      '02. TO GRADUATE',
      roadmap.graduationCriteria.slice(0, 5),
      IMPULSE_COLORS.gold,
      pdf.cursorY,
      IMPULSE_COLORS.white
    );
  }

  if (roadmap.strategicReviewFocus) {
    pdf.cursorY = pdf.drawLuxuryCard(
      '03. FOCUS DELLA STRATEGIC REVIEW',
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

function drawTopPrioritiesPage(pdf: PDFBuilder, state: any) {
  const priorities = state.priorita || state.priorities || [];
  const fallbackDims = state.processedDims || [];
  const topThree = priorities.length ? priorities.slice(0, 3) : fallbackDims.slice(0, 3);

  pdf.newPage(IMPULSE_COLORS.white);

  pdf.cursorY = 42;

  pdf.drawText('THE 3 THINGS TO FIX FIRST', PAGE.marginX, pdf.cursorY, {
    fontSize: 27,
    style: 'bold',
    color: IMPULSE_COLORS.dark,
    lineHeightFactor: 1.05
  });

  pdf.cursorY += 22;

  pdf.drawText('Queste sono le aree che creano più attrito operativo. Risolverle prima evita di scalare confusione, costi o dipendenza dal founder.', PAGE.marginX, pdf.cursorY, {
    fontSize: 10,
    color: IMPULSE_COLORS.gray,
    lineHeightFactor: 1.5,
    maxWidth: PAGE.contentWidth
  });

  pdf.cursorY += 24;

  topThree.forEach((dim: any, index: number) => {
    const y = pdf.cursorY;
    const score = Number(dim.score || 0);
    const title = `${index + 1}. ${getDimensionName(dim).toUpperCase()} · ${score.toFixed(1)} / 10`;
    const body =
      dim.vincolo ||
      dim.meaning ||
      dim.cosaIndica ||
      'Questa area richiede lavoro applicato prima di scalare.';

    pdf.fillRect(PAGE.marginX, y, PAGE.contentWidth, 48, index === 0 ? IMPULSE_COLORS.lightBlue : IMPULSE_COLORS.cream);
    pdf.fillRect(PAGE.marginX, y, 4, 48, index === 0 ? IMPULSE_COLORS.teal : IMPULSE_COLORS.gold);

    pdf.drawText(title, PAGE.marginX + 10, y + 11, {
      fontSize: 8,
      style: 'bold',
      color: index === 0 ? IMPULSE_COLORS.teal : IMPULSE_COLORS.dark,
      charSpace: 0.4
    });

    pdf.drawText(fitText(body, 180), PAGE.marginX + 10, y + 22, {
      fontSize: 9.2,
      color: IMPULSE_COLORS.darkSoft,
      lineHeightFactor: 1.35,
      maxWidth: PAGE.contentWidth - 18
    });

    pdf.cursorY += 58;
  });

  if (topThree[0]?.nonFare || topThree[0]?.lavoro) {
    const mainDim = topThree[0];

    pdf.cursorY += 2;

    if (mainDim.lavoro) {
      pdf.cursorY = pdf.drawLuxuryCard(
        'COSA FARE PRIMA',
        mainDim.lavoro,
        IMPULSE_COLORS.teal,
        pdf.cursorY,
        IMPULSE_COLORS.lightBlue
      );
    }

    if (mainDim.nonFare && pdf.cursorY < 255) {
      pdf.cursorY = pdf.drawLuxuryCard(
        'COSA NON FARE ADESSO',
        mainDim.nonFare,
        IMPULSE_COLORS.dark,
        pdf.cursorY,
        IMPULSE_COLORS.cream
      );
    }
  }
}

function drawDimensionCardsPage(pdf: PDFBuilder, state: any) {
  const dims = state.processedDims || [];

  pdf.newPage(IMPULSE_COLORS.cream);

  pdf.cursorY = 42;

  pdf.drawText('YOUR DIAGNOSTIC MAP', PAGE.marginX, pdf.cursorY, {
    fontSize: 29,
    style: 'bold',
    color: IMPULSE_COLORS.dark
  });

  pdf.cursorY += 18;

  pdf.drawText('Le 6 dimensioni mostrano dove il business è forte, dove è instabile e dove il valore resta bloccato.', PAGE.marginX, pdf.cursorY, {
    fontSize: 10,
    color: IMPULSE_COLORS.gray,
    lineHeightFactor: 1.5,
    maxWidth: PAGE.contentWidth
  });

  const cardW = 72;
  const cardH = 52;
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
    const accent = score >= 7 ? IMPULSE_COLORS.teal : score >= 5 ? IMPULSE_COLORS.gold : IMPULSE_COLORS.dark;

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

    pdf.drawText(fitText(dim.vincolo || dim.cosaIndica || 'Area diagnostica da monitorare.', 95), x + 8, y + 39, {
      fontSize: 6.8,
      color: IMPULSE_COLORS.darkSoft,
      lineHeightFactor: 1.25,
      maxWidth: cardW - 14
    });
  });

  pdf.cursorY = 248;

  pdf.drawText('Bottom line', PAGE.marginX, pdf.cursorY, {
    fontSize: 10,
    style: 'bold',
    color: IMPULSE_COLORS.teal
  });

  pdf.cursorY += 10;

  pdf.drawText('Il report non serve a descrivere ogni dettaglio del business. Serve a identificare il vincolo più costoso e a decidere cosa non scalare ancora.', PAGE.marginX, pdf.cursorY, {
    fontSize: 11,
    style: 'bold',
    color: IMPULSE_COLORS.dark,
    lineHeightFactor: 1.45,
    maxWidth: PAGE.contentWidth
  });
}

function drawProfilePage(pdf: PDFBuilder, state: any, userProfile: any) {
  pdf.newPage(IMPULSE_COLORS.dark, true);

  pdf.cursorY = 45;

  pdf.drawText(`PROFILO ${state.profile || ''}`, PAGE.marginX, pdf.cursorY, {
    fontSize: 9,
    style: 'bold',
    color: IMPULSE_COLORS.gold,
    charSpace: 1.2
  });

  pdf.cursorY += 18;

  pdf.drawText(userProfile?.title || 'Diagnostic Profile', PAGE.marginX, pdf.cursorY, {
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

  pdf.drawText('THE REPORT SHOWS WHERE THE CONSTRAINT IS.', PAGE.marginX, pdf.cursorY, {
    fontSize: 27,
    style: 'bold',
    color: IMPULSE_COLORS.white,
    lineHeightFactor: 1.08,
    maxWidth: PAGE.contentWidth
  });

  pdf.cursorY += 38;

  pdf.drawText('THE REVIEW DECIDES WHAT TO DO FIRST.', PAGE.marginX, pdf.cursorY, {
    fontSize: 27,
    style: 'bold',
    color: IMPULSE_COLORS.gold,
    lineHeightFactor: 1.08,
    maxWidth: PAGE.contentWidth
  });

  pdf.cursorY += 42;

  const profileTitle = userProfile?.title || 'il tuo profilo diagnostico';

  pdf.drawText(
    `La Strategic Review traduce ${profileTitle} in una sequenza operativa: cosa correggere, cosa ignorare, cosa rendere sistema e cosa non scalare ancora.`,
    PAGE.marginX,
    pdf.cursorY,
    {
      fontSize: 12,
      color: IMPULSE_COLORS.cream,
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
  drawScoreMapPage(pdf, state);
  drawRoadmapStagePage(pdf, state);
  drawTopPrioritiesPage(pdf, state);
  drawDimensionCardsPage(pdf, state);
  drawProfilePage(pdf, state, userProfile);
  drawStrategicReviewPage(pdf, state, userProfile);

  const filename = label
    ? `IMPULSE_Report_${getFilenameSafe(label)}.pdf`
    : `IMPULSE_Report_${getFilenameSafe(getDisplayName(state))}.pdf`;

  pdf.save(filename);
}
