// Builds "Generations_du_Futur_FR.pptx" — presentation by INTEGRA SARL to the Générations du Futur direction.
const path = require('path');
const pptxgen = require('pptxgenjs');
const React = require('react');
const RDS = require('react-dom/server');
const sharp = require('sharp');
const fa = require('react-icons/fa6');
const { applyTheme } = require(process.env.PPTX_SKILL + '/scripts/apply_theme.js');

const OUT = path.join(__dirname, '..', 'Generations_du_Futur_FR.pptx');
const LOGO = path.join(__dirname, '..', 'integra_logo.png');

const THEME = {
  name: 'INTEGRA Vert et Or',
  headFontFace: 'Arial',
  bodyFontFace: 'Calibri',
  colors: {
    dk1: '1E2421', lt1: 'FFFFFF', dk2: '0D3B2E', lt2: 'F2F6F3',
    accent1: '0D3B2E', accent2: 'E3B23C', accent3: '1F6B50', accent4: '5E6B65', accent5: 'B8862A', accent6: '2E8B63',
    hlink: '1F6B50', folHlink: '5E6B65',
  },
};
const HEX = THEME.colors;

async function icon(name, color) {
  const Comp = fa[name];
  if (!Comp) throw new Error('Unknown icon ' + name);
  const svg = RDS.renderToStaticMarkup(React.createElement(Comp, { color: '#' + color, size: 256 }));
  const buf = await sharp(Buffer.from(svg)).resize(256, 256).png().toBuffer();
  return 'image/png;base64,' + buf.toString('base64');
}

(async () => {
  const pres = new pptxgen();
  pres.layout = 'LAYOUT_WIDE'; // 13.33 x 7.5
  pres.title = 'Générations du Futur — Présentation';
  pres.author = 'INTEGRA SARL';
  pres.company = 'INTEGRA SARL';
  pres.theme = { headFontFace: THEME.headFontFace, bodyFontFace: THEME.bodyFontFace };
  const C = pres.SchemeColor;
  const W = 13.333;

  // ---------- Layouts ----------
  pres.defineSlideMaster({
    title: 'Titre',
    background: { color: HEX.dk2 },
    objects: [
      { rect: { x: 0.6, y: 0.55, w: 3.2, h: 1.0, fill: { color: C.background1 }, rectRadius: 0.12 } },
      { image: { path: LOGO, x: 0.75, y: 0.62, w: 2.9, h: 0.89 } },
      { text: { text: 'INTEGRA SARL · Projets intégrés, de l\'idée à l\'exploitation', options: { x: 0.6, y: 6.75, w: 8, h: 0.35, fontSize: 11, color: C.accent2, margin: 0 } } },
    ],
    slideNumber: undefined,
  });
  pres.defineSlideMaster({
    title: 'Contenu',
    background: { color: C.background1 },
    margin: [0.5, 0.6, 0.6, 0.6],
    objects: [
      { image: { path: LOGO, x: W - 2.55, y: 0.42, w: 1.95, h: 0.6 } },
      { text: { text: 'Générations du Futur · INTEGRA SARL', options: { x: 0.6, y: 7.0, w: 6, h: 0.3, fontSize: 10, color: C.accent4, margin: 0 } } },
      {
        placeholder: {
          options: { name: 'title', type: 'title', x: 0.6, y: 0.4, w: 9.6, h: 0.75, fontSize: 30, bold: true, color: C.text2, valign: 'middle', margin: 0 },
          text: 'Titre',
        },
      },
    ],
    slideNumber: { x: W - 1.1, y: 6.98, w: 0.5, h: 0.3, fontSize: 10, color: C.accent4, align: 'right' },
  });
  pres.defineSlideMaster({
    title: 'Conclusion',
    background: { color: HEX.dk2 },
    objects: [
      {
        placeholder: {
          options: { name: 'title', type: 'title', x: 0.6, y: 0.55, w: 8.5, h: 0.9, fontSize: 34, bold: true, color: C.background1, margin: 0 },
          text: 'Titre',
        },
      },
      { rect: { x: W - 3.8, y: 0.55, w: 3.2, h: 1.0, fill: { color: C.background1 }, rectRadius: 0.12 } },
      { image: { path: LOGO, x: W - 3.65, y: 0.62, w: 2.9, h: 0.89 } },
    ],
  });

  // ---------- Helpers ----------
  const shadow = () => ({ type: 'outer', color: '000000', opacity: 0.12, blur: 8, offset: 2, angle: 90 });
  const card = (slide, name, x, y, w, h, fillColor) =>
    slide.addShape(pres.shapes.ROUNDED_RECTANGLE, {
      x, y, w, h, rectRadius: 0.12, fill: { color: fillColor || C.background1 }, line: { color: HEX.lt2, width: 0.75 }, shadow: shadow(), objectName: name,
    });
  const iconCircle = async (slide, name, iconName, x, y, d, circleColor, iconColor) => {
    slide.addShape(pres.shapes.OVAL, { x, y, w: d, h: d, fill: { color: circleColor || C.accent2 }, line: { type: 'none' }, objectName: name + ' cercle' });
    const pad = d * 0.25;
    slide.addImage({ data: await icon(iconName, iconColor || 'FFFFFF'), x: x + pad, y: y + pad, w: d - 2 * pad, h: d - 2 * pad, objectName: name + ' icône' });
  };
  const text = (slide, value, opts) => slide.addText(value, { isTextBox: true, margin: 0, fontFace: undefined, ...opts });

  const SHOTS = path.join(__dirname, '..', 'shots');
  // Real app screenshot inside a dark phone frame. Returns the frame width.
  const phone = (slide, shotName, x, y, h, name) => {
    const iw = h * (1170 / 2532);
    const pad = 0.1;
    slide.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w: iw + 2 * pad, h: h + 2 * pad, rectRadius: 0.3, fill: { color: '15191A' }, line: { color: '2B3230', width: 1 }, shadow: shadow(), objectName: name + ' cadre' });
    slide.addImage({ path: path.join(SHOTS, shotName + '.png'), x: x + pad, y: y + pad, w: iw, h, objectName: name, altText: name });
    return iw + 2 * pad;
  };

  // ===== 1. Title =====
  pres.addSection({ title: 'Ouverture' });
  let s = pres.addSlide({ masterName: 'Titre', sectionTitle: 'Ouverture' });
  text(s, 'PRÉSENTATION À LA DIRECTION GÉNÉRALE', { x: 0.6, y: 2.15, w: 9, h: 0.4, fontSize: 14, bold: true, color: C.accent2, charSpacing: 2, objectName: 'Sur-titre' });
  text(s, 'Générations du Futur', { x: 0.6, y: 2.6, w: 9.2, h: 1.2, fontSize: 54, bold: true, color: C.background1, fontFace: THEME.headFontFace, objectName: 'Titre principal' });
  text(s, 'Les cours de vos professeurs, du primaire au Baccalauréat, sur le téléphone de chaque élève', {
    x: 0.6, y: 3.85, w: 9.2, h: 0.95, fontSize: 22, color: 'D7E6DE', objectName: 'Sous-titre',
  });
  text(s, 'Nouakchott · Novembre 2026', { x: 0.6, y: 5.25, w: 6, h: 0.4, fontSize: 14, color: 'B9CFC4', objectName: 'Date' });
  phone(s, '01_onboarding', 10.05, 0.75, 5.6, 'Capture accueil application');
  s.addNotes('Ouverture : INTEGRA SARL présente l\'application conçue pour l\'école Générations du Futur.');

  // ===== 2. Idea =====
  pres.addSection({ title: 'Le projet' });
  s = pres.addSlide({ masterName: 'Contenu', sectionTitle: 'Le projet' });
  s.addText('L\'idée en une phrase', { placeholder: 'title' });
  text(s, '« Les meilleurs professeurs, dans la poche de chaque élève. »', {
    x: 0.6, y: 1.35, w: 12.1, h: 1.0, fontSize: 26, italic: true, bold: true, color: C.accent3, objectName: 'Citation',
  });
  text(s, 'Une application mobile (iPhone et Android) et un espace de gestion qui réunissent élèves, professeurs et direction autour des cours de l\'école.', {
    x: 0.6, y: 2.45, w: 11.5, h: 0.7, fontSize: 16, color: C.text1, objectName: 'Résumé',
  });
  const trio = [
    ['L\'élève', 'FaGraduationCap', 'Choisit sa classe et son professeur, paie depuis son téléphone et suit ses cours trimestre par trimestre'],
    ['Le professeur', 'FaChalkboardUser', 'Publie ses cours, suit ses abonnés et la part qui lui revient, en temps réel'],
    ['La direction', 'FaBuildingColumns', 'Garde la main sur tout : paiements, classes, trimestres, tarifs et pourcentages'],
  ];
  for (let i = 0; i < 3; i++) {
    const x = 0.6 + i * 4.1;
    card(s, 'Carte ' + trio[i][0], x, 3.4, 3.8, 3.1);
    await iconCircle(s, trio[i][0], trio[i][1], x + 0.35, 3.7, 0.85);
    text(s, trio[i][0], { x: x + 0.35, y: 4.7, w: 3.1, h: 0.45, fontSize: 20, bold: true, color: C.text2, objectName: 'Titre ' + trio[i][0] });
    text(s, trio[i][2], { x: x + 0.35, y: 5.2, w: 3.1, h: 1.15, fontSize: 14, color: C.text1, valign: 'top', objectName: 'Texte ' + trio[i][0] });
  }


  s = pres.addSlide({ masterName: 'Contenu', sectionTitle: 'Le projet' });
  s.addText("L'application en images", { placeholder: 'title' });
  {
    const items = [["03_accueil","Les professeurs en grand"],["05_professeur","La page d'un professeur"],["04_offres","Sa classe et les offres"],["08_mes_cours","Mes cours, bien classés"]];
    const h = 4.75;
    const fw = h * (1170 / 2532) + 0.2;
    const gap = (12.1 - items.length * fw) / (items.length - 1);
    for (let i = 0; i < items.length; i++) {
      const x = 0.6 + i * (fw + gap);
      phone(s, items[i][0], x, 1.3, h, 'Capture ' + i);
      text(s, items[i][1], { x: x - 0.25, y: 6.3, w: fw + 0.5, h: 0.5, fontSize: 14, bold: true, color: C.text2, align: 'center', objectName: 'Légende ' + i });
    }
  }

  // ===== 3. Challenge table =====
  s = pres.addSlide({ masterName: 'Contenu', sectionTitle: 'Le projet' });
  s.addText('Le défi pour chacun', { placeholder: 'title' });
  const head = (t) => ({ text: t, options: { bold: true, color: C.background1, fill: { color: C.accent1 }, fontSize: 15 } });
  const key = (t) => ({ text: t, options: { bold: true, color: C.text2, fill: { color: C.background2 }, fontSize: 14 } });
  const cell = (t) => ({ text: t, options: { color: C.text1, fontSize: 14 } });
  s.addTable(
    [
      [head(''), head('L\'élève et sa famille'), head('Le professeur'), head('La direction')],
      [key('Aujourd\'hui'), cell('Cours particuliers coûteux, déplacements, supports dispersés'), cell('Cours enregistrés qui circulent sans contrôle'), cell('Peu de visibilité sur l\'offre en ligne et les paiements')],
      [key('Le risque'), cell('Payer pour un contenu qui ne correspond pas à sa classe'), cell('Vidéos copiées, partagées ou revendues'), cell('Désaccords sur les revenus, contenus non maîtrisés')],
      [key('Ce que l\'application apporte'), cell('Les cours de sa classe, au bon trimestre, au meilleur prix'), cell('Contenus protégés, abonnés et part visibles en temps réel'), cell('Validation des paiements, réglages, fermeture d\'un pack si nécessaire')],
    ],
    { x: 0.6, y: 1.45, w: 12.1, colW: [2.5, 3.2, 3.2, 3.2], rowH: [0.55, 1.05, 1.05, 1.05], border: { type: 'solid', pt: 0.75, color: 'D5DDD8' }, valign: 'middle', margin: 0.1, objectName: 'Tableau défi' }
  );
  text(s, [
    { text: 'Ce qui réunit les trois : ', options: { bold: true, color: C.text2 } },
    { text: 'une seule plateforme, des règles claires fixées par la direction et une trace de chaque paiement.', options: { color: C.text1 } },
  ], { x: 0.6, y: 5.95, w: 12.1, h: 0.5, fontSize: 16, objectName: 'Synthèse' });

  // ===== 4. Components for the student =====
  pres.addSection({ title: 'L\'application' });
  const grid = async (slide, items, cols, top, cardH) => {
    const gap = 0.35;
    const cw = (12.1 - gap * (cols - 1)) / cols;
    for (let i = 0; i < items.length; i++) {
      const [title, ic, body] = items[i];
      const x = 0.6 + (i % cols) * (cw + gap);
      const y = top + Math.floor(i / cols) * (cardH + gap);
      card(slide, 'Carte ' + title, x, y, cw, cardH);
      await iconCircle(slide, title, ic, x + 0.3, y + 0.3, 0.75);
      text(slide, title, { x: x + 1.25, y: y + 0.3, w: cw - 1.5, h: 0.75, fontSize: 18, bold: true, color: C.text2, valign: 'middle', objectName: 'Titre ' + title });
      text(slide, body, { x: x + 0.3, y: y + 1.2, w: cw - 0.6, h: cardH - 1.4, fontSize: 14, color: C.text1, valign: 'top', objectName: 'Texte ' + title });
    }
  };
  s = pres.addSlide({ masterName: 'Contenu', sectionTitle: 'L\'application' });
  s.addText('Ce que vit l\'élève', { placeholder: 'title' });
  await grid(s, [
    ['Toutes les classes', 'FaLayerGroup', 'Primaire (1AF–6AF), collège (1AS–4AS, Brevet), lycée (5AS, 6AS, 7C, 7D, 7LM, 7LO) et concours. L\'élève choisit sa classe une fois.'],
    ['La fenêtre des professeurs', 'FaUsers', 'Les professeurs en grand dès l\'accueil : photo, note, élèves et packs. L\'élève garde ses préférés en favoris.'],
    ['Quatre formules', 'FaTags', 'Pack complet, matières principales, matières secondaires ou un seul professeur, avec remise et sans jamais payer deux fois.'],
    ['Au rythme des trimestres', 'FaCalendarDays', 'Chaque cours se débloque automatiquement à la date de début de son trimestre, fixée par la direction.'],
  ], 2, 1.4, 2.5);

  // ===== 5. Components for school & teachers =====
  s = pres.addSlide({ masterName: 'Contenu', sectionTitle: 'L\'application' });
  s.addText('Ce que gèrent l\'école et les professeurs', { placeholder: 'title' });
  await grid(s, [
    ['Contenus protégés', 'FaShieldHalved', 'Captures et enregistrements d\'écran bloqués ; nombre de visionnages limité par leçon.'],
    ['Promotions', 'FaGift', 'Un cours, ou tous les cours d\'un professeur, offerts pour une durée choisie.'],
    ['Espace professeur', 'FaChalkboardUser', 'Abonnés par cours, pourcentage convenu, part du professeur ; correction et ré-import des vidéos et PDF.'],
    ['Administration', 'FaUserCheck', 'Validation des paiements, gestion des promotions, fermeture des packs d\'un professeur en cas de désaccord.'],
    ['Direction générale', 'FaBuildingColumns', 'Accès à tout : comptes, classes, trimestres, pourcentages, numéros de paiement et limites.'],
    ['Séances en direct', 'FaVideo', 'Interface prête ; la diffusion vidéo nécessitera un prestataire spécialisé, au coût lié au nombre d\'élèves.'],
  ], 3, 1.4, 2.5);

  // ===== 6. Offers — stat callouts =====
  s = pres.addSlide({ masterName: 'Contenu', sectionTitle: 'L\'application' });
  s.addText('Quatre façons de s\'abonner', { placeholder: 'title' });
  const offers = [
    ['-20 %', 'Pack complet', 'Toutes les matières de la classe'],
    ['-10 %', 'Matières principales', 'Les matières à fort coefficient'],
    ['-10 %', 'Matières secondaires', 'Pour compléter la moyenne'],
    ['-10 %', 'Un professeur', 'Tous les cours du professeur choisi'],
  ];
  for (let i = 0; i < 4; i++) {
    const x = 0.6 + i * 3.1;
    card(s, 'Offre ' + offers[i][1], x, 1.6, 2.85, 3.6, i === 0 ? C.accent1 : C.background1);
    const dark = i === 0;
    text(s, offers[i][0], { x: x + 0.3, y: 1.95, w: 2.3, h: 1.1, fontSize: 54, bold: true, color: dark ? C.accent2 : C.accent3, objectName: 'Remise ' + offers[i][1] });
    text(s, offers[i][1], { x: x + 0.3, y: 3.2, w: 2.3, h: 0.8, fontSize: 19, bold: true, color: dark ? C.background1 : C.text2, valign: 'top', objectName: 'Nom ' + offers[i][1] });
    text(s, offers[i][2], { x: x + 0.3, y: 4.05, w: 2.3, h: 0.9, fontSize: 14, color: dark ? 'D7E6DE' : C.text1, valign: 'top', objectName: 'Détail ' + offers[i][1] });
  }
  text(s, 'Taux proposés, ajustables par la direction. Les cours déjà achetés sont automatiquement exclus du prix.', {
    x: 0.6, y: 5.65, w: 12.1, h: 0.5, fontSize: 14, italic: true, color: C.accent4, objectName: 'Note tarifs',
  });

  // ===== 7. Protection stats =====
  s = pres.addSlide({ masterName: 'Contenu', sectionTitle: 'L\'application' });
  s.addText('Des cours protégés', { placeholder: 'title' });
  const stats = [
    ['FaBan', '0', 'capture ou enregistrement d\'écran pendant la lecture'],
    ['FaEye', '4', 'visionnages par leçon avec un pack'],
    ['FaEye', '2', 'visionnages par leçon avec la formule « un professeur »'],
  ];
  for (let i = 0; i < 3; i++) {
    const x = 0.6 + i * 2.95;
    card(s, 'Stat ' + i, x, 1.6, 2.7, 3.7);
    await iconCircle(s, 'Stat ' + i, stats[i][0], x + 0.3, 1.9, 0.75);
    text(s, stats[i][1], { x: x + 0.3, y: 2.8, w: 2.1, h: 1.2, fontSize: 60, bold: true, color: C.accent3, objectName: 'Chiffre ' + i });
    text(s, stats[i][2], { x: x + 0.3, y: 4.0, w: 2.1, h: 1.15, fontSize: 15, color: C.text1, valign: 'top', objectName: 'Libellé ' + i });
  }
  phone(s, '09_lecteur', 9.95, 1.3, 5.1, 'Capture lecteur protégé');
  text(s, 'Les limites de visionnage sont réglables à tout moment par la direction générale.', {
    x: 0.6, y: 5.6, w: 8.6, h: 0.6, fontSize: 14, italic: true, color: C.accent4, objectName: 'Note limites',
  });

  // ===== 8. Payment today — process =====
  pres.addSection({ title: 'Le paiement' });
  s = pres.addSlide({ masterName: 'Contenu', sectionTitle: 'Le paiement' });
  s.addText('Le paiement aujourd\'hui', { placeholder: 'title' });
  text(s, 'Avec les applications que les familles utilisent déjà : Bankily, Masrvi, Sedad et Click.', {
    x: 0.6, y: 1.3, w: 12.1, h: 0.5, fontSize: 16, color: C.text1, objectName: 'Intro paiement',
  });
  const steps = [
    ['FaMobileScreen', 'La commande', 'L\'élève choisit sa formule ; l\'application crée une référence unique (ex. GF-7K2M9Q).'],
    ['FaMoneyBillTransfer', 'Le virement', 'Il envoie le montant exact au numéro marchand de l\'école.'],
    ['FaWhatsapp', 'La capture', 'Il envoie la capture du reçu sur WhatsApp ; le message avec la référence est déjà prêt.'],
    ['FaCircleCheck', 'L\'activation', 'Un administrateur compare la capture à la référence et valide : les cours s\'activent aussitôt.'],
  ];
  for (let i = 0; i < 4; i++) {
    const x = 0.6 + i * 3.1;
    card(s, 'Étape ' + (i + 1), x, 2.1, 2.75, 3.5);
    await iconCircle(s, 'Étape ' + (i + 1), steps[i][0], x + 0.3, 2.4, 0.75);
    text(s, String(i + 1), { x: x + 1.85, y: 2.35, w: 0.6, h: 0.8, fontSize: 36, bold: true, color: 'D9E2DD', align: 'right', objectName: 'Numéro ' + (i + 1) });
    text(s, steps[i][1], { x: x + 0.3, y: 3.35, w: 2.2, h: 0.5, fontSize: 18, bold: true, color: C.text2, objectName: 'Titre étape ' + (i + 1) });
    text(s, steps[i][2], { x: x + 0.3, y: 3.9, w: 2.2, h: 1.55, fontSize: 14, color: C.text1, valign: 'top', objectName: 'Texte étape ' + (i + 1) });
    if (i < 3) s.addShape(pres.shapes.RIGHT_ARROW, { x: x + 2.8, y: 3.7, w: 0.25, h: 0.3, fill: { color: C.accent2 }, line: { type: 'none' }, objectName: 'Flèche ' + (i + 1) });
  }
  text(s, 'Chaque paiement est rattaché à une référence, à un élève et à des cours précis ; la direction suit le chiffre d\'affaires validé en temps réel.', {
    x: 0.6, y: 5.95, w: 12.1, h: 0.6, fontSize: 14, color: C.accent4, objectName: 'Traçabilité',
  });


  s = pres.addSlide({ masterName: 'Contenu', sectionTitle: 'Le paiement' });
  s.addText("Le paiement dans l'application", { placeholder: 'title' });
  phone(s, '06_cours', 0.6, 1.3, 5.0, 'Capture fiche cours');
  phone(s, '07_paiement', 3.4, 1.3, 5.0, 'Capture paiement Bankily');
  {
    const rows = [["Un bouton « Acheter »","Sur chaque cours, ou un pack entier depuis les offres."],["Le choix de l'appli","Bankily, Masrvi, Sedad ou Click, avec leurs logos."],["Montant et numéro","Copiés en un geste, pour éviter toute erreur de saisie."],["WhatsApp prêt à envoyer","Le message contient déjà la référence ; il suffit de joindre la capture."]];
    for (let i = 0; i < rows.length; i++) {
      const y = 1.5 + i * 1.25;
      s.addText(String(i + 1), { shape: pres.shapes.OVAL, x: 6.3, y, w: 0.6, h: 0.6, fill: { color: C.accent2 }, color: C.background1, fontSize: 18, bold: true, align: 'center', valign: 'middle', margin: 0, objectName: 'Numéro paiement ' + (i + 1) });
      text(s, rows[i][0], { x: 7.15, y: y - 0.05, w: 5.55, h: 0.45, fontSize: 18, bold: true, color: C.text2, objectName: 'Titre paiement ' + (i + 1) });
      text(s, rows[i][1], { x: 7.15, y: y + 0.42, w: 5.55, h: 0.6, fontSize: 14, color: C.text1, valign: 'top', objectName: 'Texte paiement ' + (i + 1) });
    }
  }

  // ===== 9. Payment tomorrow — comparison =====
  s = pres.addSlide({ masterName: 'Contenu', sectionTitle: 'Le paiement' });
  s.addText('Demain : l\'école parmi les facturiers', { placeholder: 'title' });
  text(s, 'Bankily propose déjà une rubrique « Facturiers disponibles » où figurent plusieurs établissements scolaires de Nouakchott : le payeur choisit l\'établissement, saisit une « Référence de facture » et paie.', {
    x: 0.6, y: 1.3, w: 12.1, h: 0.85, fontSize: 15, color: C.text1, objectName: 'Contexte facturiers',
  });
  const cols = [
    { name: 'Aujourd\'hui', ic: 'FaWhatsapp', dark: false, lines: ['Virement au numéro marchand', 'Capture envoyée sur WhatsApp', 'Validation manuelle par un administrateur', 'Activation après vérification'] },
    { name: 'Demain', ic: 'FaBuildingColumns', dark: true, lines: ['« Générations du Futur » dans la liste des facturiers', 'La référence de l\'application devient la référence de facture', 'Paiement confirmé automatiquement', 'Cours activés à la seconde'] },
  ];
  for (let i = 0; i < 2; i++) {
    const x = 0.6 + i * 6.2;
    const c = cols[i];
    card(s, 'Colonne ' + c.name, x, 2.35, 5.9, 3.55, c.dark ? C.accent1 : C.background2);
    await iconCircle(s, c.name, c.ic, x + 0.35, 2.65, 0.75, C.accent2);
    text(s, c.name, { x: x + 1.3, y: 2.65, w: 4, h: 0.75, fontSize: 22, bold: true, color: c.dark ? C.background1 : C.text2, valign: 'middle', objectName: 'Titre ' + c.name });
    text(s, c.lines.map((l, j) => ({ text: l, options: { bullet: true, breakLine: j < c.lines.length - 1 } })), {
      x: x + 0.35, y: 3.6, w: 5.2, h: 2.1, fontSize: 15, color: c.dark ? 'E3EEE8' : C.text1, paraSpaceAfter: 6, valign: 'top', margin: 0, objectName: 'Liste ' + c.name,
    });
  }
  text(s, 'Nous proposons d\'engager, avec votre appui, des discussions avec Bankily, puis avec Masrvi, Sedad et Click.', {
    x: 0.6, y: 6.1, w: 12.1, h: 0.5, fontSize: 15, bold: true, color: C.accent3, objectName: 'Proposition banques',
  });

  // ===== 10. Benefits =====
  pres.addSection({ title: 'Valeur' });
  s = pres.addSlide({ masterName: 'Contenu', sectionTitle: 'Valeur' });
  s.addText('Ce que chacun y gagne', { placeholder: 'title' });
  await grid(s, [
    ['L\'élève', 'FaGraduationCap', 'Les cours de sa classe et les professeurs de son choix, à toute heure.'],
    ['Les parents', 'FaPeopleRoof', 'Un prix connu à l\'avance, des remises et un paiement depuis le téléphone.'],
    ['Le professeur', 'FaChalkboardUser', 'Des contenus protégés, des abonnés et une part visibles, plus d\'élèves.'],
    ['L\'administration', 'FaReceipt', 'Des paiements tracés par référence, à valider en un geste.'],
    ['La direction', 'FaChartPie', 'Une vue complète sur les cours, les professeurs et les revenus.'],
    ['L\'école', 'FaSchool', 'Une nouvelle source de revenus et un rayonnement au-delà de ses murs.'],
  ], 3, 1.4, 2.5);

  // ===== 11. Principles =====
  s = pres.addSlide({ masterName: 'Contenu', sectionTitle: 'Valeur' });
  s.addText('Nos principes', { placeholder: 'title' });
  const principles = [
    ['FaDatabase', 'Les données des élèves et des professeurs restent la propriété de l\'école ; leur confidentialité est garantie.'],
    ['FaLock', 'Les cours restent la propriété de l\'école et de ses professeurs ; l\'application est conçue pour les protéger.'],
    ['FaHandshake', 'La décision revient à l\'humain : aucun paiement validé ni pack fermé sans un responsable de l\'école.'],
    ['FaScaleBalanced', 'Transparence envers les professeurs : chacun voit ses abonnés et la part convenue.'],
    ['FaMobileScreen', 'Une application simple, pensée d\'abord pour le téléphone de l\'élève.'],
  ];
  for (let i = 0; i < principles.length; i++) {
    const y = 1.45 + i * 1.02;
    await iconCircle(s, 'Principe ' + (i + 1), principles[i][0], 0.6, y, 0.7);
    text(s, principles[i][1], { x: 1.6, y, w: 11.1, h: 0.7, fontSize: 17, color: C.text1, valign: 'middle', objectName: 'Principe ' + (i + 1) });
  }

  // ===== 12. Next steps =====
  pres.addSection({ title: 'Suite' });
  s = pres.addSlide({ masterName: 'Conclusion', sectionTitle: 'Suite' });
  s.addText('Prochaines étapes', { placeholder: 'title' });
  const next = [
    ['FaMobileScreen', 'Démonstration', 'Une version fonctionne déjà sur téléphone : nous vous la présentons à la date de votre choix.'],
    ['FaTags', 'Formules et tarifs', 'Valider ensemble les remises, les limites de visionnage et le pourcentage des professeurs.'],
    ['FaBuildingColumns', 'Banques', 'Engager les discussions avec Bankily, puis Masrvi, Sedad et Click, pour devenir facturier.'],
    ['FaVideo', 'Séances en direct', 'Choisir le prestataire de diffusion vidéo adapté au nombre d\'élèves.'],
  ];
  for (let i = 0; i < 4; i++) {
    const x = 0.6 + (i % 2) * 6.2;
    const y = 2.0 + Math.floor(i / 2) * 2.15;
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w: 5.9, h: 1.85, rectRadius: 0.12, fill: { color: '145A45' }, line: { type: 'none' }, objectName: 'Étape suivante ' + (i + 1) });
    await iconCircle(s, 'Étape suivante ' + (i + 1), next[i][0], x + 0.3, y + 0.3, 0.75, C.accent2);
    text(s, next[i][1], { x: x + 1.3, y: y + 0.3, w: 4.3, h: 0.5, fontSize: 19, bold: true, color: C.background1, objectName: 'Titre suite ' + (i + 1) });
    text(s, next[i][2], { x: x + 1.3, y: y + 0.82, w: 4.35, h: 0.9, fontSize: 14, color: 'D7E6DE', valign: 'top', objectName: 'Texte suite ' + (i + 1) });
  }
  text(s, 'INTEGRA SARL · ZRE, N° 160, Appt 4 — Nouakchott · +222 42 01 62 07 · contact@integra-sarl.com', {
    x: 0.6, y: 6.7, w: 12.1, h: 0.4, fontSize: 12, color: C.accent2, objectName: 'Contact',
  });

  await pres.writeFile({ fileName: OUT });
  await applyTheme(OUT, THEME);
  console.log('written', OUT);
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
