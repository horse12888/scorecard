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

// --- PDF BUILDER CLASS ---
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
    
    // Header Grid lines
    if (this.pageNumber > 1) {
      this.doc.setDrawColor(...(darkHeader ? IMPULSE_COLORS.gray : IMPULSE_COLORS.grayLight));
      this.doc.setLineWidth(0.2);
      this.doc.line(PAGE.marginX, 15, PAGE.width - PAGE.marginX, 15);
      this.drawText(`IMPULSE · REPORT NUM. ${String(this.pageNumber).padStart(2, '0')}`, PAGE.marginX, 12, { 
        fontSize: 7, color: darkHeader ? IMPULSE_COLORS.white : IMPULSE_COLORS.gray, charSpace: 0.5 
      });
      const userName = this.result?.name ? String(this.result.name).toUpperCase() : (this.result?.user?.name ? String(this.result.user.name).toUpperCase() : "");
      this.drawText(userName, PAGE.width - PAGE.marginX, 12, { 
        fontSize: 7, align: 'right', color: darkHeader ? IMPULSE_COLORS.white : IMPULSE_COLORS.gray, charSpace: 0.5 
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

    const lines = this.doc.splitTextToSize(String(text), maxWidth);
    const lineHeight = (fontSize * 0.3527) * lineHeightFactor;
    
    let currentY = y;
    lines.forEach((line: string) => {
      this.doc.text(line, x, currentY, { align });
      currentY += lineHeight;
    });

    return currentY;
  }

  drawDonut(x: number, y: number, radius: number, thickness: number, percent: number, color: number[], trackColor: number[] = IMPULSE_COLORS.darkSoft) {
    // Background ring
    const bgR = radius;
    this.doc.setLineWidth(thickness);
    this.doc.setDrawColor(trackColor[0], trackColor[1], trackColor[2]);
    this.doc.circle(x, y, bgR, 'S');

    if (percent > 0) {
      const p = percent / 100;
      const segments = Math.max(30, Math.floor(180 * p));
      const startA = -Math.PI / 2;
      const endA = startA + (Math.PI * 2 * p);
      
      const outerR = radius + thickness / 2;
      const innerR = radius - thickness / 2;
      
      const points: [number, number][] = [];
      // Outer arc
      for (let i = 0; i <= segments; i++) {
        const a = startA + (endA - startA) * (i / segments);
        points.push([x + outerR * Math.cos(a), y + outerR * Math.sin(a)]);
      }
      // Inner arc (reverse)
      for (let i = segments; i >= 0; i--) {
        const a = startA + (endA - startA) * (i / segments);
        points.push([x + innerR * Math.cos(a), y + innerR * Math.sin(a)]);
      }
      
      this.doc.setFillColor(color[0], color[1], color[2]);
      
      const relPoints: [number, number][] = [];
      for (let i = 1; i < points.length; i++) {
        relPoints.push([points[i][0] - points[i-1][0], points[i][1] - points[i-1][1]]);
      }
      relPoints.push([points[0][0] - points[points.length-1][0], points[0][1] - points[points.length-1][1]]);
      
      this.doc.lines(relPoints, points[0][0], points[0][1], [1,1], 'F', true);
    }
  }

  drawRadar(cx: number, cy: number, r: number, dimensions: any[]) {
    const n = dimensions.length;
    const angleStep = (Math.PI * 2) / n;
    const startAngle = -Math.PI / 2;
    
    // Values polygon points
    const scorePts: [number, number][] = [];
    for (let i = 0; i < n; i++) {
      const a = startAngle + i * angleStep;
      const sr = (Math.max(0, Math.min(10, dimensions[i].score)) / 10) * r;
      scorePts.push([cx + sr * Math.cos(a), cy + sr * Math.sin(a)]);
    }

    // Fill slightly teal
    this.doc.setFillColor( IMPULSE_COLORS.lightBlue[0], IMPULSE_COLORS.lightBlue[1], IMPULSE_COLORS.lightBlue[2] ); 
    this.drawPolygon(scorePts, true, false);

    // Grid (draw over fill)
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
    
    // Axes
    this.doc.setDrawColor(200, 205, 210);
    this.doc.setLineWidth(0.2);
    for (let i = 0; i < n; i++) {
      const a = startAngle + i * angleStep;
      this.doc.line(cx, cy, cx + r * Math.cos(a), cy + r * Math.sin(a));
    }
    
    // Border
    this.doc.setDrawColor( IMPULSE_COLORS.teal[0], IMPULSE_COLORS.teal[1], IMPULSE_COLORS.teal[2] );
    this.doc.setLineWidth(0.8);
    this.drawPolygon(scorePts, false);
    
    // Dots
    scorePts.forEach(p => {
      this.doc.setFillColor( IMPULSE_COLORS.teal[0], IMPULSE_COLORS.teal[1], IMPULSE_COLORS.teal[2] );
      this.doc.circle(p[0], p[1], 1.8, 'F');
      this.doc.setFillColor( 255, 255, 255 );
      this.doc.circle(p[0], p[1], 0.8, 'F');
    });
    
    // Labels
    for (let i = 0; i < n; i++) {
      const a = startAngle + i * angleStep;
      let lx = cx + (r + 7) * Math.cos(a);
      const ly = cy + (r + 7) * Math.sin(a);
      let align: 'left' | 'center' | 'right' = 'center';
      const dx = Math.cos(a);
      if (dx > 0.3) align = 'left';
      else if (dx < -0.3) align = 'right';
      
      this.drawText(dimensions[i].label.toUpperCase(), lx, ly + 1.5, { align, fontSize: 7, style: 'bold', color: IMPULSE_COLORS.darkSoft, charSpace: 0.5 });
    }
  }

  drawPolygon(points: [number, number][], filled = false, stroked = true) {
    if (!points || points.length < 3) return;
    const start = points[0];
    const rel: [number, number][] = [];
    for (let i = 1; i < points.length; i++) {
      rel.push([points[i][0] - points[i-1][0], points[i][1] - points[i-1][1]]);
    }
    rel.push([points[0][0] - points[points.length - 1][0], points[0][1] - points[points.length - 1][1]]);
    const style = filled ? (stroked ? 'DF' : 'F') : 'S';
    this.doc.lines(rel, start[0], start[1], [1, 1], style, true);
  }

  drawLuxuryCard(title: string, body: string, accentColor: number[], yPos: number, bg: number[] = IMPULSE_COLORS.cream) {
    const testLines = this.doc.splitTextToSize(body, PAGE.contentWidth - 14);
    const cardHeight = Math.max(30, 20 + (testLines.length * 5));
    
    this.fillRect(PAGE.marginX, yPos, PAGE.contentWidth, cardHeight, bg);
    this.fillRect(PAGE.marginX, yPos, 4, cardHeight, accentColor);
    
    this.drawText(title.toUpperCase(), PAGE.marginX + 10, yPos + 10, { fontSize: 8, style: 'bold', color: accentColor });
    this.drawText(body, PAGE.marginX + 10, yPos + 18, { fontSize: 10.5, color: IMPULSE_COLORS.darkSoft, lineHeightFactor: 1.6, maxWidth: PAGE.contentWidth - 14 });
    
    return yPos + cardHeight + 8; // return next Y
  }
}

// --- GENERATOR ORCHESTRATION ---
export async function generateIMPULSEReport(state: any, label?: string) {
  const pdf = new PDFBuilder(state);
  
  // 1. COVER
  pdf.newPage(IMPULSE_COLORS.dark, true);
  pdf.fillRect(PAGE.marginX, 80, 110, 110, IMPULSE_COLORS.teal);
  pdf.drawText("Report", PAGE.marginX + 15, 110, { color: IMPULSE_COLORS.cream, fontSize: 14 });
  pdf.drawText("Business\nReadiness\nReport.", PAGE.marginX + 15, 130, { color: IMPULSE_COLORS.white, fontSize: 34, style: 'bold', lineHeightFactor: 1.1 });
  pdf.drawText("IMPULSE", PAGE.width - PAGE.marginX, 200, { color: IMPULSE_COLORS.white, fontSize: 26, style: 'bold', align: 'right' });
  pdf.drawText(`Preparato per:\n${state.name || state.user?.name || ''}\n${new Date().toLocaleDateString('it-IT')}`, PAGE.width - PAGE.marginX, 260, { color: IMPULSE_COLORS.grayLight, fontSize: 10, align: 'right', lineHeightFactor: 1.5 });

  // 2. LETTER
  pdf.newPage(IMPULSE_COLORS.white);
  pdf.cursorY = 50;
  pdf.drawText("Perché questo report esiste.", PAGE.marginX, pdf.cursorY, { fontSize: 30, style: 'bold', color: IMPULSE_COLORS.dark });
  pdf.cursorY += 25;
  const p1 = "Questo report esiste per mostrarti dove il valore che hai costruito è bloccato, prima ancora di aggiungere marketing, intelligenza artificiale, nuovo capitale o nuove offerte.\n\nLo scorecard era l'input. Questo documento restituisce la lettura diagnostica.";
  const p2 = "I business che smettono di crescere raramente lo fanno per mancanza di opportunità. Lo fanno perché il valore diventa illeggibile, o perché i sistemi operano esclusivamente attorno alla dipendenza dalla tua presenza.\n\nUsalo come una lettura diagnostica: non per giudicare il business, ma per capire quale vincolo va affrontato prima.";
  pdf.cursorY = pdf.drawText(p1, PAGE.marginX, pdf.cursorY, { fontSize: 11, color: IMPULSE_COLORS.darkSoft, lineHeightFactor: 1.6 });
  pdf.cursorY += 10;
  pdf.drawText(p2, PAGE.marginX, pdf.cursorY, { fontSize: 11, color: IMPULSE_COLORS.darkSoft, lineHeightFactor: 1.6 });

  // 3. COME LEGGERE
  pdf.newPage(IMPULSE_COLORS.cream);
  pdf.cursorY = 50;
  pdf.drawText("Come leggere la diagnosi.", PAGE.marginX, pdf.cursorY, { fontSize: 30, style: 'bold', color: IMPULSE_COLORS.dark });
  pdf.cursorY += 30;
  pdf.cursorY = pdf.drawLuxuryCard("01. LEGGI IL PROFILO", "Il Profilo (A, B, C o D) descrive il vincolo principale emerso. Partire da qui ti dà l'ordine di priorità su cui operare.", IMPULSE_COLORS.teal, pdf.cursorY, IMPULSE_COLORS.white);
  pdf.cursorY = pdf.drawLuxuryCard("02. RIVEDI LE DIMENSIONI", "Le 6 dimensioni mostrano le ramificazioni del tuo profilo. Leggi con attenzione le dimensioni con il punteggio più basso, sono quelle che creano più attrito.", IMPULSE_COLORS.gold, pdf.cursorY, IMPULSE_COLORS.white);
  pdf.cursorY = pdf.drawLuxuryCard("03. COSA NON FARE ADESSO", "Ogni capitolo indica cosa evitare adesso. Spesso l'istinto è automatizzare il caos. La diagnosi serve per fermare proprio queste iniziative premature.", IMPULSE_COLORS.dark, pdf.cursorY, IMPULSE_COLORS.white);

  // 4. OVERALL SCORE
  pdf.newPage(IMPULSE_COLORS.dark, true);
  pdf.cursorY = 60;
  pdf.drawText("OVERALL IMPULSE SCORE", PAGE.width/2, pdf.cursorY, { fontSize: 10, align: 'center', style: 'bold', color: IMPULSE_COLORS.gold, charSpace: 1.5 });
  pdf.cursorY += 45;
  
  // Donut behind or around the score
  pdf.drawDonut(PAGE.width/2, pdf.cursorY - 9, 30, 4, state.overall, IMPULSE_COLORS.teal);
  
  pdf.drawText(`${state.overall}%`, PAGE.width/2, pdf.cursorY, { fontSize: 62, align: 'center', style: 'bold', color: IMPULSE_COLORS.white });
  pdf.cursorY += 40;
  
  // Grid 3 columns
  const w3 = PAGE.contentWidth/3;
  [
    { t: "FASCIA", v: String(state.fascia).toUpperCase() },
    { t: "PROFILO", v: `PROFILO ${state.profile}` },
    { t: "STAGE", v: state.stageLabel || state.stage || state.stageInfo?.label || state.stageInfo?.title || "STAGE NON DISPONIBILE" }
  ].forEach((b, i) => {
    const bx = PAGE.marginX + (w3 * i) + (w3/2);
    pdf.drawText(b.t, bx, pdf.cursorY, { align: 'center', fontSize: 8, color: IMPULSE_COLORS.grayLight, charSpace: 0.8 });
    pdf.drawText(b.v, bx, pdf.cursorY+10, { align: 'center', fontSize: 14, style: 'bold', color: IMPULSE_COLORS.cream });
  });

  pdf.cursorY += 40;
  pdf.doc.setDrawColor(IMPULSE_COLORS.teal[0], IMPULSE_COLORS.teal[1], IMPULSE_COLORS.teal[2]);
  pdf.doc.setLineWidth(0.5);
  pdf.doc.line(PAGE.width/2 - 20, pdf.cursorY, PAGE.width/2 + 20, pdf.cursorY);
  pdf.cursorY += 15;
  pdf.drawText("Il tuo punteggio aggregato sulle 6 dimensioni indica la tua operatività reale, non teorica. Questo numero definisce quanto del tuo lavoro è scalabile senza rompersi.", PAGE.width/2, pdf.cursorY, { align:'center', fontSize: 11, color: IMPULSE_COLORS.grayLight, lineHeightFactor: 1.6, maxWidth: 120 });

  // 5. STRENGTHS / PRIORITIES & RADAR
  pdf.newPage(IMPULSE_COLORS.white);
  pdf.cursorY = 50;
  pdf.drawText("Le tue coordinate.", PAGE.marginX, pdf.cursorY, { fontSize: 30, style: 'bold', color: IMPULSE_COLORS.dark });
  pdf.cursorY += 25;

  let leftY = pdf.cursorY;
  
  pdf.drawText("LE TUE FORZE (ASSET ATTUALI)", PAGE.marginX, leftY, { fontSize: 10, style: 'bold', color: IMPULSE_COLORS.teal, charSpace: 0.5 });
  leftY += 12;
  const forze = state.forze || state.strengths || [];
  forze.forEach((f: any) => {
    pdf.drawText(f.label, PAGE.marginX, leftY, { fontSize: 12, style: 'bold' });
    pdf.drawText(Number(f.score).toFixed(1), PAGE.marginX + 60, leftY, { fontSize: 14, style: 'bold', color: IMPULSE_COLORS.teal });
    leftY += 12;
  });

  leftY += 20;
  pdf.drawText(state.overall >= 75 ? "AREE DA RIFINIRE" : "LE TUE PRIORITÀ (VINCOLI)", PAGE.marginX, leftY, { fontSize: 10, style: 'bold', color: IMPULSE_COLORS.gold, charSpace: 0.5 });
  leftY += 12;
  const priorita = state.priorita || state.priorities || [];
  priorita.forEach((p: any) => {
    pdf.drawText(p.label, PAGE.marginX, leftY, { fontSize: 12, style: 'bold' });
    pdf.drawText(Number(p.score).toFixed(1), PAGE.marginX + 60, leftY, { fontSize: 14, style: 'bold', color: IMPULSE_COLORS.dark });
    leftY += 12;
  });

  // Radar Chart on the right
  pdf.drawRadar(PAGE.width - 65, pdf.cursorY + 40, 35, state.spiderDims);

  // 6. GROWTH STAGE
  pdf.newPage(IMPULSE_COLORS.cream);
  pdf.cursorY = 50;
  pdf.drawText("Il tuo Stadio Operativo.", PAGE.marginX, pdf.cursorY, { fontSize: 30, style: 'bold', color: IMPULSE_COLORS.dark });
  pdf.cursorY += 30;

  pdf.fillRect(PAGE.marginX, pdf.cursorY, PAGE.contentWidth, 30, IMPULSE_COLORS.dark);
  pdf.drawText("STAGE:", PAGE.marginX + 10, pdf.cursorY + 12, { fontSize: 9, color: IMPULSE_COLORS.gold, charSpace: 1.5 });
  const stageLabelText = state.stageLabel || state.stage || state.stageInfo?.label || state.stageInfo?.title || "STAGE NON DISPONIBILE";
  pdf.drawText(stageLabelText, PAGE.marginX + 10, pdf.cursorY + 22, { fontSize: 18, style: 'bold', color: IMPULSE_COLORS.white, charSpace: 0.5 });
  pdf.cursorY += 45;

  pdf.drawText(state.stageInfo.headline, PAGE.marginX, pdf.cursorY, { fontSize: 16, color: IMPULSE_COLORS.teal, style: 'bold', lineHeightFactor: 1.4 });
  pdf.cursorY += 25;

  pdf.cursorY = pdf.drawLuxuryCard("01. COSA ARRIVA TROPPO PRESTO", state.stageInfo.troppoPresto, IMPULSE_COLORS.darkSoft, pdf.cursorY, IMPULSE_COLORS.white);
  pdf.cursorY = pdf.drawLuxuryCard("02. COSA DEVE DIVENTARE SISTEMA PRIMA", state.stageInfo.diventareSistema, IMPULSE_COLORS.teal, pdf.cursorY, IMPULSE_COLORS.white);
  pdf.cursorY = pdf.drawLuxuryCard("03. COSA NON FARE ADESSO", state.stageInfo.nonFare, IMPULSE_COLORS.gold, pdf.cursorY, IMPULSE_COLORS.white);

  // 7. DIMENSION PAGES (6 dimensions x 2 pages = 12 pages)
  const processedDims = state.processedDims || [];
  for (const dim of processedDims) {
    const dimScore = dim.score;
    
    // Page A
    pdf.newPage(IMPULSE_COLORS.white);
    pdf.drawText(dim.label.toUpperCase(), PAGE.marginX, 50, { fontSize: 10, style: 'bold', color: IMPULSE_COLORS.gray, charSpace: 1 });
    pdf.drawText("Diagnosi.", PAGE.marginX, 65, { fontSize: 40, style: 'bold', color: IMPULSE_COLORS.teal });
    pdf.drawText(`SCORE: ${dimScore.toFixed(1)} / 10`, PAGE.marginX, 85, { fontSize: 16, style: 'bold', color: IMPULSE_COLORS.dark, charSpace: 0.5 });
    pdf.doc.setDrawColor(IMPULSE_COLORS.teal[0], IMPULSE_COLORS.teal[1], IMPULSE_COLORS.teal[2]);
    pdf.doc.setLineWidth(1);
    pdf.doc.line(PAGE.marginX, 95, PAGE.marginX + 40, 95);
    
    pdf.cursorY = 110;
    pdf.cursorY = pdf.drawLuxuryCard("COSA INDICA IL TUO SCORE", dim.cosaIndica, IMPULSE_COLORS.teal, pdf.cursorY, IMPULSE_COLORS.lightBlue);
    pdf.cursorY = pdf.drawLuxuryCard("IL VINCOLO EMERSO", dim.vincolo, IMPULSE_COLORS.gold, pdf.cursorY, IMPULSE_COLORS.cream);
    
    // Page B
    pdf.newPage(IMPULSE_COLORS.white);
    pdf.cursorY = 50;
    pdf.drawText(dim.label.toUpperCase() + " · PRIORITÀ", PAGE.marginX, pdf.cursorY, { fontSize: 10, style: 'bold', color: IMPULSE_COLORS.gray, charSpace: 1 });
    pdf.cursorY += 20;
    
    pdf.cursorY = pdf.drawLuxuryCard("COSA NON FARE ADESSO", dim.nonFare, IMPULSE_COLORS.dark, pdf.cursorY, IMPULSE_COLORS.cream);
    pdf.cursorY = pdf.drawLuxuryCard("COSA RICHIEDE LAVORO APPLICATO", dim.lavoro, IMPULSE_COLORS.teal, pdf.cursorY, IMPULSE_COLORS.lightBlue);
  }

  // 8. PROFILE PAGE
  pdf.newPage(IMPULSE_COLORS.dark, true);
  const userProfile = getProfileData(state.profile, state.overall);
  pdf.cursorY = 60;
  pdf.drawText(`PROFILO ${state.profile}`, PAGE.marginX, pdf.cursorY, { fontSize: 12, style: 'bold', color: IMPULSE_COLORS.gold, charSpace: 1.5 });
  pdf.cursorY += 20;
  pdf.drawText(`${userProfile.title}.`, PAGE.marginX, pdf.cursorY, { fontSize: 48, style: 'bold', color: IMPULSE_COLORS.white });
  pdf.cursorY += 25;
  pdf.drawText(userProfile.blocco, PAGE.marginX, pdf.cursorY, { fontSize: 14, style: 'italic', color: IMPULSE_COLORS.cream, lineHeightFactor: 1.5 });
  pdf.cursorY += 30;
  
  pdf.drawText("COME SI MANIFESTA:", PAGE.marginX, pdf.cursorY, { fontSize: 9, style: 'bold', color: IMPULSE_COLORS.teal, charSpace: 0.5 });
  pdf.cursorY += 8;
  pdf.cursorY = pdf.drawText(userProfile.manifesta, PAGE.marginX, pdf.cursorY, { fontSize: 11, color: IMPULSE_COLORS.white, lineHeightFactor: 1.6 });
  pdf.cursorY += 15;
  
  pdf.drawText("IL RISCHIO SE IGNORATO:", PAGE.marginX, pdf.cursorY, { fontSize: 9, style: 'bold', color: IMPULSE_COLORS.gold, charSpace: 0.5 });
  pdf.cursorY += 8;
  pdf.cursorY = pdf.drawText(userProfile.rischio, PAGE.marginX, pdf.cursorY, { fontSize: 11, color: IMPULSE_COLORS.white, lineHeightFactor: 1.6 });

  // 8b. STRATEGIC REVIEW CTA
  pdf.newPage(IMPULSE_COLORS.dark, true);
  pdf.cursorY = 80;
  // A box with dark background, gold accent line
  pdf.fillRect(PAGE.marginX, pdf.cursorY, PAGE.contentWidth, 120, IMPULSE_COLORS.darkSoft);
  pdf.fillRect(PAGE.marginX, pdf.cursorY, 4, 120, IMPULSE_COLORS.gold);
  
  let ctaY = pdf.cursorY + 16;
  pdf.drawText("DIAGNOSI APPROFONDITA", PAGE.marginX + 15, ctaY, { fontSize: 9, style: 'bold', color: IMPULSE_COLORS.gold, charSpace: 1.5 });
  ctaY += 15;
  pdf.drawText(`${userProfile.title}\nnella IMPULSE Strategic Review`, PAGE.marginX + 15, ctaY, { fontSize: 20, style: 'bold', color: IMPULSE_COLORS.white, lineHeightFactor: 1.3 });
  ctaY += 28;
  
  const ctaDesc = "La diagnosi estesa del tuo profilo — con priorità operative specifiche e anti-azioni da evitare applicate al tuo caso — è il cuore della Strategic Review.\n\nIl report ti mostra dove guardare. La Review serve a decidere cosa fare prima.";
  pdf.drawText(ctaDesc, PAGE.marginX + 15, ctaY, { fontSize: 10, color: IMPULSE_COLORS.grayLight, lineHeightFactor: 1.5, maxWidth: PAGE.contentWidth - 25 });
  ctaY += 28;
  
  // CTA Button
  pdf.fillRect(PAGE.marginX + 15, ctaY, 65, 12, IMPULSE_COLORS.gold);
  pdf.drawText("CANDIDATI ALLA REVIEW", PAGE.marginX + 15 + 32.5, ctaY + 8, { align:'center', fontSize: 9, style:'bold', color: IMPULSE_COLORS.dark });

  // 9. PROFILE DIRECTIVES
  pdf.newPage(IMPULSE_COLORS.dark, true);
  pdf.cursorY = 60;
  pdf.drawText("Le tue direttive.", PAGE.marginX, pdf.cursorY, { fontSize: 30, style: 'bold', color: IMPULSE_COLORS.white });
  pdf.cursorY += 20;
  
  pdf.doc.setDrawColor(IMPULSE_COLORS.gray[0], IMPULSE_COLORS.gray[1], IMPULSE_COLORS.gray[2]);
  pdf.doc.setLineWidth(0.5);
  pdf.fillRect(PAGE.marginX, pdf.cursorY, PAGE.contentWidth, 40, IMPULSE_COLORS.darkSoft);
  pdf.fillRect(PAGE.marginX, pdf.cursorY, 4, 40, IMPULSE_COLORS.gold);
  pdf.drawText("LA DECISIONE CHE VIENE PRIMA", PAGE.marginX + 10, pdf.cursorY + 12, { fontSize: 9, style: 'bold', color: IMPULSE_COLORS.gold, charSpace: 0.5 });
  pdf.drawText(userProfile.decisione, PAGE.marginX + 10, pdf.cursorY + 22, { fontSize: 12, color: IMPULSE_COLORS.white, lineHeightFactor: 1.5, maxWidth: PAGE.contentWidth - 20 });
  
  pdf.cursorY += 60;
  pdf.fillRect(PAGE.marginX, pdf.cursorY, PAGE.contentWidth, 40, IMPULSE_COLORS.darkSoft);
  pdf.fillRect(PAGE.marginX, pdf.cursorY, 4, 40, IMPULSE_COLORS.grayLight);
  pdf.drawText("ERRORE DA EVITARE", PAGE.marginX + 10, pdf.cursorY + 12, { fontSize: 9, style: 'bold', color: IMPULSE_COLORS.grayLight, charSpace: 0.5 });
  pdf.drawText(userProfile.nonFare, PAGE.marginX + 10, pdf.cursorY + 22, { fontSize: 12, color: IMPULSE_COLORS.white, lineHeightFactor: 1.5, maxWidth: PAGE.contentWidth - 20 });

  // 10. STRATEGIC REVIEW (Closing)
  pdf.newPage(IMPULSE_COLORS.teal, true);
  pdf.cursorY = 80;
  pdf.drawText("Strategic Review.", PAGE.width/2, pdf.cursorY, { align: 'center', fontSize: 36, style: 'bold', color: IMPULSE_COLORS.white });
  pdf.cursorY += 25;
  pdf.drawText("Il report ti mostra dove guardare. La Review serve a decidere cosa fare prima, in quale ordine, e cosa ignorare.", PAGE.width/2, pdf.cursorY, { align: 'center', fontSize: 14, style: 'italic', color: IMPULSE_COLORS.cream, maxWidth: 140, lineHeightFactor: 1.5 });
  
  pdf.cursorY += 40;
  pdf.drawText("La Review è il ponte tra questa diagnosi e la tua implementazione operativa. Se riconosci i tuoi vincoli operativi descritti nel Profilo, candidati alla Strategic Review per trasformare questa diagnosi in una sequenza operativa applicata al tuo caso.", PAGE.width/2, pdf.cursorY, { align: 'center', fontSize: 11, color: IMPULSE_COLORS.white, maxWidth: 120, lineHeightFactor: 1.5 });

  pdf.cursorY += 40;
  const ctaW = 60;
  pdf.fillRect(PAGE.width/2 - ctaW/2, pdf.cursorY, ctaW, 14, IMPULSE_COLORS.gold);
  pdf.drawText("davidedileo.it", PAGE.width/2, pdf.cursorY + 9, { align:'center', fontSize: 11, style:'bold', color: IMPULSE_COLORS.dark });

  const filename = label 
    ? `IMPULSE_Report_${label.replace(/\s+/g, '_')}.pdf`
    : `IMPULSE_Report_${String(state.name || state.user?.name || 'Report').replace(/\s+/g, '_')}.pdf`;
  pdf.save(filename);
}
