// Builds "Generations_du_Futur_AR.pptx" — Arabic (right-to-left) version of the INTEGRA SARL deck.
const path = require('path');
const pptxgen = require('pptxgenjs');
const React = require('react');
const RDS = require('react-dom/server');
const sharp = require('sharp');
const fa = require('react-icons/fa6');
const { applyTheme } = require(process.env.PPTX_SKILL + '/scripts/apply_theme.js');

const OUT = path.join(__dirname, '..', 'Generations_du_Futur_AR.pptx');
const LOGO = path.join(__dirname, '..', 'integra_logo.png');
const W = 13.333;

const THEME = {
  name: 'INTEGRA Vert et Or AR',
  headFontFace: 'Arial',
  bodyFontFace: 'Arial',
  colors: {
    dk1: '1E2421', lt1: 'FFFFFF', dk2: '0D3B2E', lt2: 'F2F6F3',
    accent1: '0D3B2E', accent2: 'E3B23C', accent3: '1F6B50', accent4: '5E6B65', accent5: 'B8862A', accent6: '2E8B63',
    hlink: '1F6B50', folHlink: '5E6B65',
  },
};
const HEX = THEME.colors;

async function icon(name, color) {
  const svg = RDS.renderToStaticMarkup(React.createElement(fa[name], { color: '#' + color, size: 256 }));
  const buf = await sharp(Buffer.from(svg)).resize(256, 256).png().toBuffer();
  return 'image/png;base64,' + buf.toString('base64');
}

/** Same coordinates as the French deck, mirrored horizontally; text right-aligned and RTL. */
const mirror = (slide) => ({
  addShape: (t, o) => slide.addShape(t, { ...o, x: W - o.x - o.w }),
  addImage: (o) => slide.addImage({ ...o, x: W - o.x - o.w }),
  addText: (v, o) =>
    o.placeholder
      ? slide.addText(v, { ...o, rtlMode: true })
      : slide.addText(v, { ...o, x: W - o.x - o.w, align: o.align || 'right', rtlMode: true }),
  addTable: (rows, o) =>
    slide.addTable(
      rows.map((r) => [...r].reverse()),
      { ...o, x: W - o.x - o.w, colW: o.colW ? [...o.colW].reverse() : undefined }
    ),
  addNotes: (n) => slide.addNotes(n),
});

(async () => {
  const pres = new pptxgen();
  pres.layout = 'LAYOUT_WIDE';
  pres.title = 'أجيال المستقبل — عرض';
  pres.author = 'INTEGRA SARL';
  pres.company = 'INTEGRA SARL';
  pres.rtlMode = true;
  pres.theme = { headFontFace: THEME.headFontFace, bodyFontFace: THEME.bodyFontFace };
  const C = pres.SchemeColor;

  pres.defineSlideMaster({
    title: 'Titre AR',
    background: { color: HEX.dk2 },
    objects: [
      { rect: { x: W - 3.8, y: 0.55, w: 3.2, h: 1.0, fill: { color: C.background1 }, rectRadius: 0.12 } },
      { image: { path: LOGO, x: W - 3.65, y: 0.62, w: 2.9, h: 0.89 } },
      { text: { text: 'إنتغرا ش.ذ.م.م · مشاريع متكاملة، من الفكرة إلى التشغيل', options: { x: W - 8.6, y: 6.75, w: 8, h: 0.35, fontSize: 12, color: C.accent2, margin: 0, align: 'right', rtlMode: true } } },
    ],
  });
  pres.defineSlideMaster({
    title: 'Contenu AR',
    background: { color: C.background1 },
    margin: [0.5, 0.6, 0.6, 0.6],
    objects: [
      { image: { path: LOGO, x: 0.6, y: 0.42, w: 1.95, h: 0.6 } },
      { text: { text: 'أجيال المستقبل · إنتغرا ش.ذ.م.م', options: { x: W - 6.6, y: 7.0, w: 6, h: 0.3, fontSize: 10, color: C.accent4, margin: 0, align: 'right', rtlMode: true } } },
      {
        placeholder: {
          options: { name: 'title', type: 'title', x: W - 0.6 - 9.6, y: 0.4, w: 9.6, h: 0.75, fontSize: 30, bold: true, color: C.text2, valign: 'middle', align: 'right', margin: 0 },
          text: 'العنوان',
        },
      },
    ],
    slideNumber: { x: 0.6, y: 6.98, w: 0.5, h: 0.3, fontSize: 10, color: C.accent4, align: 'left' },
  });
  pres.defineSlideMaster({
    title: 'Conclusion AR',
    background: { color: HEX.dk2 },
    objects: [
      {
        placeholder: {
          options: { name: 'title', type: 'title', x: W - 0.6 - 8.5, y: 0.55, w: 8.5, h: 0.9, fontSize: 34, bold: true, color: C.background1, align: 'right', margin: 0 },
          text: 'العنوان',
        },
      },
      { rect: { x: 0.6, y: 0.55, w: 3.2, h: 1.0, fill: { color: C.background1 }, rectRadius: 0.12 } },
      { image: { path: LOGO, x: 0.75, y: 0.62, w: 2.9, h: 0.89 } },
    ],
  });

  const shadow = () => ({ type: 'outer', color: '000000', opacity: 0.12, blur: 8, offset: 2, angle: 90 });
  const card = (s, name, x, y, w, h, fill) =>
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w, h, rectRadius: 0.12, fill: { color: fill || C.background1 }, line: { color: HEX.lt2, width: 0.75 }, shadow: shadow(), objectName: name });
  const iconCircle = async (s, name, ic, x, y, d, circle, iconColor) => {
    s.addShape(pres.shapes.OVAL, { x, y, w: d, h: d, fill: { color: circle || C.accent2 }, line: { type: 'none' }, objectName: name + ' cercle' });
    const pad = d * 0.25;
    s.addImage({ data: await icon(ic, iconColor || 'FFFFFF'), x: x + pad, y: y + pad, w: d - 2 * pad, h: d - 2 * pad, objectName: name + ' icône' });
  };
  const text = (s, v, o) => s.addText(v, { isTextBox: true, margin: 0, ...o });

  const SHOTS = path.join(__dirname, '..', 'shots');
  // Real app screenshot inside a dark phone frame. Returns the frame width.
  const phone = (slide, shotName, x, y, h, name) => {
    const iw = h * (1170 / 2532);
    const pad = 0.1;
    slide.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w: iw + 2 * pad, h: h + 2 * pad, rectRadius: 0.3, fill: { color: '15191A' }, line: { color: '2B3230', width: 1 }, shadow: shadow(), objectName: name + ' cadre' });
    slide.addImage({ path: path.join(SHOTS, shotName + '.png'), x: x + pad, y: y + pad, w: iw, h, objectName: name, altText: name });
    return iw + 2 * pad;
  };
  const add = (master, section) => mirror(pres.addSlide({ masterName: master, sectionTitle: section }));

  // 1. Title
  pres.addSection({ title: 'الافتتاح' });
  let s = add('Titre AR', 'الافتتاح');
  text(s, 'عرض مقدم إلى الإدارة العامة', { x: 0.6, y: 2.15, w: 9, h: 0.45, fontSize: 16, bold: true, color: C.accent2, objectName: 'Sur-titre' });
  text(s, 'أجيال المستقبل', { x: 0.6, y: 2.6, w: 9.2, h: 1.2, fontSize: 54, bold: true, color: C.background1, objectName: 'Titre principal' });
  text(s, 'دروس أساتذتكم، من الابتدائي إلى الباكالوريا، على هاتف كل تلميذ', { x: 0.6, y: 3.85, w: 9.2, h: 0.95, fontSize: 22, color: 'D7E6DE', objectName: 'Sous-titre' });
  text(s, 'نواكشوط · نوفمبر 2026', { x: 0.6, y: 5.25, w: 6, h: 0.4, fontSize: 14, color: 'B9CFC4', objectName: 'Date' });
  phone(s, '01_onboarding', 10.05, 0.75, 5.6, 'Capture accueil application');

  // 2. Idea
  pres.addSection({ title: 'المشروع' });
  s = add('Contenu AR', 'المشروع');
  s.addText('الفكرة في جملة واحدة', { placeholder: 'title' });
  text(s, '«أفضل الأساتذة، في جيب كل تلميذ.»', { x: 0.6, y: 1.35, w: 12.1, h: 1.0, fontSize: 30, bold: true, color: C.accent3, objectName: 'Citation' });
  text(s, 'تطبيق للهاتف (آيفون وأندرويد) مع فضاء للتسيير، يجمع التلاميذ والأساتذة والإدارة حول دروس المدرسة.', { x: 0.6, y: 2.45, w: 12.1, h: 0.7, fontSize: 17, color: C.text1, objectName: 'Résumé' });
  const trio = [
    ['التلميذ', 'FaGraduationCap', 'يختار قسمه وأستاذه، ويدفع من هاتفه، ويتابع دروسه فصلًا بعد فصل'],
    ['الأستاذ', 'FaChalkboardUser', 'ينشر دروسه، ويتابع مشتركيه والنصيب العائد إليه في الوقت الفعلي'],
    ['الإدارة', 'FaBuildingColumns', 'تمسك بزمام كل شيء: المدفوعات، الأقسام، الفصول، الأسعار والنسب'],
  ];
  for (let i = 0; i < 3; i++) {
    const x = 0.6 + i * 4.1;
    card(s, 'Carte ' + i, x, 3.4, 3.8, 3.1);
    await iconCircle(s, 'Trio ' + i, trio[i][1], x + 0.35, 3.7, 0.85);
    text(s, trio[i][0], { x: x + 0.35, y: 4.7, w: 3.1, h: 0.45, fontSize: 21, bold: true, color: C.text2, objectName: 'Titre ' + i });
    text(s, trio[i][2], { x: x + 0.35, y: 5.2, w: 3.1, h: 1.15, fontSize: 15, color: C.text1, valign: 'top', objectName: 'Texte ' + i });
  }


  s = add('Contenu AR', 'المشروع');
  s.addText("التطبيق بالصور", { placeholder: 'title' });
  {
    const items = [["03_accueil","الأساتذة بشكل بارز"],["05_professeur","صفحة الأستاذ"],["04_offres","القسم والعروض"],["08_mes_cours","دروسي مرتبة"]];
    const h = 4.75;
    const fw = h * (1170 / 2532) + 0.2;
    const gap = (12.1 - items.length * fw) / (items.length - 1);
    for (let i = 0; i < items.length; i++) {
      const x = 0.6 + i * (fw + gap);
      phone(s, items[i][0], x, 1.3, h, 'Capture ' + i);
      text(s, items[i][1], { x: x - 0.25, y: 6.3, w: fw + 0.5, h: 0.5, fontSize: 14, bold: true, color: C.text2, align: 'center', objectName: 'Légende ' + i });
    }
  }

  // 3. Challenge
  s = add('Contenu AR', 'المشروع');
  s.addText('التحدي بالنسبة لكل طرف', { placeholder: 'title' });
  const head = (t) => ({ text: t, options: { bold: true, color: C.background1, fill: { color: C.accent1 }, fontSize: 16, align: 'right', rtlMode: true } });
  const key = (t) => ({ text: t, options: { bold: true, color: C.text2, fill: { color: C.background2 }, fontSize: 15, align: 'right', rtlMode: true } });
  const cell = (t) => ({ text: t, options: { color: C.text1, fontSize: 15, align: 'right', rtlMode: true } });
  s.addTable(
    [
      [head(''), head('التلميذ وأسرته'), head('الأستاذ'), head('الإدارة')],
      [key('الوضع اليوم'), cell('دروس خصوصية مكلفة، وتنقلات، ووثائق متفرقة'), cell('دروس مسجلة تتداول دون رقابة'), cell('رؤية محدودة للعرض الرقمي وللمدفوعات')],
      [key('أين يكمن الخطر'), cell('دفع مقابل محتوى لا يناسب قسمه'), cell('نسخ الفيديوهات أو تداولها أو بيعها'), cell('خلافات حول المداخيل، ومحتوى خارج السيطرة')],
      [key('ما يضيفه التطبيق'), cell('دروس قسمه، في الفصل المناسب، وبأفضل سعر'), cell('محتوى محمي، ومشتركون ونصيب ظاهرون في الوقت الفعلي'), cell('المصادقة على المدفوعات، والإعدادات، وإغلاق باقة عند الحاجة')],
    ],
    { x: 0.6, y: 1.45, w: 12.1, colW: [2.5, 3.2, 3.2, 3.2], rowH: [0.55, 1.05, 1.05, 1.05], border: { type: 'solid', pt: 0.75, color: 'D5DDD8' }, valign: 'middle', margin: 0.1, objectName: 'Tableau défi' }
  );
  text(s, [
    { text: 'ما يجمع الأطراف الثلاثة: ', options: { bold: true, color: C.text2 } },
    { text: 'منصة واحدة، وقواعد واضحة تضعها الإدارة، وأثر موثق لكل عملية دفع.', options: { color: C.text1 } },
  ], { x: 0.6, y: 5.95, w: 12.1, h: 0.5, fontSize: 17, objectName: 'Synthèse' });

  // grid helper (icon on the right of each card)
  const grid = async (slide, items, cols, top, cardH) => {
    const gap = 0.35;
    const cw = (12.1 - gap * (cols - 1)) / cols;
    for (let i = 0; i < items.length; i++) {
      const [title, ic, body] = items[i];
      const x = 0.6 + (i % cols) * (cw + gap);
      const y = top + Math.floor(i / cols) * (cardH + gap);
      card(slide, 'Carte ' + title, x, y, cw, cardH);
      await iconCircle(slide, title, ic, x + 0.3, y + 0.3, 0.75);
      text(slide, title, { x: x + 1.25, y: y + 0.3, w: cw - 1.5, h: 0.75, fontSize: 19, bold: true, color: C.text2, valign: 'middle', objectName: 'Titre ' + title });
      text(slide, body, { x: x + 0.3, y: y + 1.2, w: cw - 0.6, h: cardH - 1.4, fontSize: 15, color: C.text1, valign: 'top', objectName: 'Texte ' + title });
    }
  };

  // 4. Student
  pres.addSection({ title: 'التطبيق' });
  s = add('Contenu AR', 'التطبيق');
  s.addText('ما يعيشه التلميذ', { placeholder: 'title' });
  await grid(s, [
    ['جميع الأقسام', 'FaLayerGroup', 'الأساسي (1AF–6AF)، الإعدادي (1AS–4AS، شهادة ختم الدروس الإعدادية)، الثانوي (5AS، 6AS، 7C، 7D، 7LM، 7LO) والمسابقات. يختار التلميذ قسمه مرة واحدة.'],
    ['نافذة الأساتذة', 'FaUsers', 'الأساتذة بشكل بارز منذ الصفحة الرئيسية: الصورة، التقييم، التلاميذ والباقات. ويحتفظ التلميذ بمفضليه.'],
    ['أربع صيغ', 'FaTags', 'الباقة الكاملة، المواد الأساسية، المواد الثانوية أو أستاذ واحد، مع تخفيض ودون دفع مرتين أبدًا.'],
    ['على إيقاع الفصول', 'FaCalendarDays', 'يُفتح كل درس تلقائيًا في تاريخ بداية فصله الدراسي الذي تحدده الإدارة.'],
  ], 2, 1.4, 2.5);

  // 5. School & teachers
  s = add('Contenu AR', 'التطبيق');
  s.addText('ما تديره المدرسة والأساتذة', { placeholder: 'title' });
  await grid(s, [
    ['محتوى محمي', 'FaShieldHalved', 'منع لقطات الشاشة وتسجيلها، وعدد محدود من المشاهدات لكل درس.'],
    ['العروض', 'FaGift', 'درس، أو جميع دروس أستاذ، مجانية لمدة تختارها الإدارة.'],
    ['فضاء الأستاذ', 'FaChalkboardUser', 'المشتركون في كل درس، والنسبة المتفق عليها، والنصيب؛ وتصحيح وإعادة رفع الفيديو و PDF.'],
    ['التسيير', 'FaUserCheck', 'المصادقة على المدفوعات، وإدارة العروض، وإغلاق باقات أستاذ عند الخلاف.'],
    ['الإدارة العامة', 'FaBuildingColumns', 'الوصول إلى كل شيء: الحسابات، الأقسام، الفصول، النسب، أرقام الدفع والحدود.'],
    ['الحصص المباشرة', 'FaVideo', 'الواجهة جاهزة؛ والبث المرئي يتطلب مزود خدمة متخصصًا تتوقف تكلفته على عدد التلاميذ.'],
  ], 3, 1.4, 2.5);

  // 6. Offers
  s = add('Contenu AR', 'التطبيق');
  s.addText('أربع صيغ للاشتراك', { placeholder: 'title' });
  const offers = [
    ['20%−', 'الباقة الكاملة', 'جميع مواد القسم'],
    ['10%−', 'المواد الأساسية', 'المواد ذات المعامل المرتفع'],
    ['10%−', 'المواد الثانوية', 'لاستكمال المعدل'],
    ['10%−', 'أستاذ واحد', 'جميع دروس الأستاذ المختار'],
  ];
  for (let i = 0; i < 4; i++) {
    const x = 0.6 + i * 3.1;
    const dark = i === 0;
    card(s, 'Offre ' + i, x, 1.6, 2.85, 3.6, dark ? C.accent1 : C.background1);
    text(s, offers[i][0], { x: x + 0.3, y: 1.95, w: 2.3, h: 1.1, fontSize: 50, bold: true, color: dark ? C.accent2 : C.accent3, objectName: 'Remise ' + i });
    text(s, offers[i][1], { x: x + 0.3, y: 3.2, w: 2.3, h: 0.8, fontSize: 20, bold: true, color: dark ? C.background1 : C.text2, valign: 'top', objectName: 'Nom ' + i });
    text(s, offers[i][2], { x: x + 0.3, y: 4.05, w: 2.3, h: 0.9, fontSize: 15, color: dark ? 'D7E6DE' : C.text1, valign: 'top', objectName: 'Détail ' + i });
  }
  text(s, 'نسب مقترحة قابلة للتعديل من طرف الإدارة. وتُستثنى تلقائيًا الدروس المشتراة سابقًا من السعر.', { x: 0.6, y: 5.65, w: 12.1, h: 0.5, fontSize: 15, color: C.accent4, objectName: 'Note tarifs' });

  // 7. Protection
  s = add('Contenu AR', 'التطبيق');
  s.addText('دروس محمية', { placeholder: 'title' });
  const stats = [
    ['FaBan', '0', 'لقطة أو تسجيل للشاشة أثناء المشاهدة'],
    ['FaEye', '4', 'مشاهدات لكل درس مع الباقات'],
    ['FaEye', '2', 'مشاهدتان لكل درس مع صيغة «أستاذ واحد»'],
  ];
  for (let i = 0; i < 3; i++) {
    const x = 0.6 + i * 2.95;
    card(s, 'Stat ' + i, x, 1.6, 2.7, 3.7);
    await iconCircle(s, 'Stat ' + i, stats[i][0], x + 0.3, 1.9, 0.75);
    text(s, stats[i][1], { x: x + 0.3, y: 2.8, w: 2.1, h: 1.2, fontSize: 60, bold: true, color: C.accent3, objectName: 'Chiffre ' + i });
    text(s, stats[i][2], { x: x + 0.3, y: 4.0, w: 2.1, h: 1.15, fontSize: 16, color: C.text1, valign: 'top', objectName: 'Libellé ' + i });
  }
  phone(s, '09_lecteur', 9.95, 1.3, 5.1, 'Capture lecteur protégé');
  text(s, 'حدود المشاهدة قابلة للتعديل في أي وقت من طرف الإدارة العامة.', { x: 0.6, y: 5.6, w: 8.6, h: 0.6, fontSize: 15, color: C.accent4, objectName: 'Note limites' });

  // 8. Payment today
  pres.addSection({ title: 'الدفع' });
  s = add('Contenu AR', 'الدفع');
  s.addText('الدفع اليوم', { placeholder: 'title' });
  text(s, 'بالتطبيقات التي تستعملها الأسر أصلًا: Bankily وMasrvi وSedad وClick.', { x: 0.6, y: 1.3, w: 12.1, h: 0.5, fontSize: 17, color: C.text1, objectName: 'Intro paiement' });
  const steps = [
    ['FaMobileScreen', 'الطلب', 'يختار التلميذ صيغته، فيُنشئ التطبيق مرجعًا فريدًا (مثلًا GF-7K2M9Q).'],
    ['FaMoneyBillTransfer', 'التحويل', 'يرسل المبلغ المحدد إلى الرقم التجاري للمدرسة.'],
    ['FaWhatsapp', 'لقطة الشاشة', 'يرسل صورة الإيصال عبر واتساب؛ والرسالة مع المرجع جاهزة مسبقًا.'],
    ['FaCircleCheck', 'التفعيل', 'يقارن المسيّر الصورة بالمرجع ويصادق، فتُفعَّل الدروس فورًا.'],
  ];
  for (let i = 0; i < 4; i++) {
    const x = 0.6 + i * 3.1;
    card(s, 'Étape ' + i, x, 2.1, 2.75, 3.5);
    await iconCircle(s, 'Étape ' + i, steps[i][0], x + 0.3, 2.4, 0.75);
    text(s, String(i + 1), { x: x + 1.85, y: 2.35, w: 0.6, h: 0.8, fontSize: 36, bold: true, color: 'D9E2DD', align: 'left', objectName: 'Numéro ' + i });
    text(s, steps[i][1], { x: x + 0.3, y: 3.35, w: 2.2, h: 0.5, fontSize: 19, bold: true, color: C.text2, objectName: 'Titre étape ' + i });
    text(s, steps[i][2], { x: x + 0.3, y: 3.9, w: 2.2, h: 1.55, fontSize: 15, color: C.text1, valign: 'top', objectName: 'Texte étape ' + i });
    if (i < 3) s.addShape(pres.shapes.LEFT_ARROW, { x: x + 2.8, y: 3.7, w: 0.25, h: 0.3, fill: { color: C.accent2 }, line: { type: 'none' }, objectName: 'Flèche ' + i });
  }
  text(s, 'ترتبط كل عملية دفع بمرجع وبتلميذ وبدروس محددة؛ وتتابع الإدارة العامة رقم المعاملات المصادق عليه في الوقت الفعلي.', { x: 0.6, y: 5.95, w: 12.1, h: 0.6, fontSize: 15, color: C.accent4, objectName: 'Traçabilité' });


  s = add('Contenu AR', 'الدفع');
  s.addText("الدفع داخل التطبيق", { placeholder: 'title' });
  phone(s, '06_cours', 0.6, 1.3, 5.0, 'Capture fiche cours');
  phone(s, '07_paiement', 3.4, 1.3, 5.0, 'Capture paiement Bankily');
  {
    const rows = [["زر «شراء»","على كل درس، أو باقة كاملة من صفحة العروض."],["اختيار التطبيق البنكي","Bankily أو Masrvi أو Sedad أو Click، بشعاراتها."],["المبلغ والرقم","يُنسخان بلمسة واحدة لتجنب أي خطأ في الإدخال."],["رسالة واتساب جاهزة","تتضمن المرجع مسبقًا؛ يكفي إرفاق لقطة الشاشة."]];
    for (let i = 0; i < rows.length; i++) {
      const y = 1.5 + i * 1.25;
      s.addText(String(i + 1), { shape: pres.shapes.OVAL, x: 6.3, y, w: 0.6, h: 0.6, fill: { color: C.accent2 }, color: C.background1, fontSize: 18, bold: true, align: 'center', valign: 'middle', margin: 0, objectName: 'Numéro paiement ' + (i + 1) });
      text(s, rows[i][0], { x: 7.15, y: y - 0.05, w: 5.55, h: 0.45, fontSize: 18, bold: true, color: C.text2, objectName: 'Titre paiement ' + (i + 1) });
      text(s, rows[i][1], { x: 7.15, y: y + 0.42, w: 5.55, h: 0.6, fontSize: 14, color: C.text1, valign: 'top', objectName: 'Texte paiement ' + (i + 1) });
    }
  }

  // 9. Payment tomorrow
  s = add('Contenu AR', 'الدفع');
  s.addText('غدًا: المدرسة ضمن جهات الفوترة', { placeholder: 'title' });
  text(s, 'يتيح تطبيق Bankily قسم «جهات الفوترة المتاحة» الذي تظهر فيه عدة مؤسسات تعليمية في نواكشوط: يختار الدافع المؤسسة، ويُدخل «مرجع الفاتورة»، ثم يدفع.', { x: 0.6, y: 1.3, w: 12.1, h: 0.85, fontSize: 16, color: C.text1, objectName: 'Contexte' });
  const cols = [
    { name: 'اليوم', ic: 'FaWhatsapp', dark: false, lines: ['تحويل إلى الرقم التجاري', 'إرسال لقطة الشاشة عبر واتساب', 'مصادقة يدوية من طرف مسيّر', 'تفعيل بعد التحقق'] },
    { name: 'غدًا', ic: 'FaBuildingColumns', dark: true, lines: ['«أجيال المستقبل» ضمن قائمة جهات الفوترة', 'مرجع التطبيق يصبح مرجع الفاتورة', 'تأكيد الدفع تلقائيًا', 'تفعيل الدروس في الحين'] },
  ];
  for (let i = 0; i < 2; i++) {
    const x = 0.6 + i * 6.2;
    const c = cols[i];
    card(s, 'Colonne ' + i, x, 2.35, 5.9, 3.55, c.dark ? C.accent1 : C.background2);
    await iconCircle(s, 'Colonne ' + i, c.ic, x + 0.35, 2.65, 0.75, C.accent2);
    text(s, c.name, { x: x + 1.3, y: 2.65, w: 4, h: 0.75, fontSize: 23, bold: true, color: c.dark ? C.background1 : C.text2, valign: 'middle', objectName: 'Titre col ' + i });
    text(s, c.lines.map((l, j) => ({ text: l, options: { bullet: true, breakLine: j < c.lines.length - 1 } })), {
      x: x + 0.35, y: 3.6, w: 5.2, h: 2.1, fontSize: 16, color: c.dark ? 'E3EEE8' : C.text1, paraSpaceAfter: 6, valign: 'top', objectName: 'Liste ' + i,
    });
  }
  text(s, 'نقترح أن نباشر، بدعم منكم، مباحثات مع Bankily، ثم مع Masrvi وSedad وClick.', { x: 0.6, y: 6.1, w: 12.1, h: 0.5, fontSize: 16, bold: true, color: C.accent3, objectName: 'Proposition' });

  // 10. Benefits
  pres.addSection({ title: 'القيمة' });
  s = add('Contenu AR', 'القيمة');
  s.addText('ما يكسبه كل طرف', { placeholder: 'title' });
  await grid(s, [
    ['التلميذ', 'FaGraduationCap', 'دروس قسمه وأساتذة من اختياره، في أي وقت.'],
    ['الأولياء', 'FaPeopleRoof', 'سعر معروف مسبقًا، وتخفيضات، ودفع من الهاتف.'],
    ['الأستاذ', 'FaChalkboardUser', 'محتوى محمي، ومشتركون ونصيب ظاهرون، وتلاميذ أكثر.'],
    ['المسيّرون', 'FaReceipt', 'مدفوعات موثقة بمرجع، تُصادق بلمسة واحدة.'],
    ['الإدارة', 'FaChartPie', 'رؤية شاملة للدروس والأساتذة والمداخيل.'],
    ['المدرسة', 'FaSchool', 'مصدر دخل جديد، وإشعاع يتجاوز جدرانها.'],
  ], 3, 1.4, 2.5);

  // 11. Principles
  s = add('Contenu AR', 'القيمة');
  s.addText('مبادئنا', { placeholder: 'title' });
  const principles = [
    ['FaDatabase', 'تبقى بيانات التلاميذ والأساتذة ملكًا للمدرسة، وسريتها مضمونة.'],
    ['FaLock', 'تبقى الدروس ملكًا للمدرسة وأساتذتها، والتطبيق مصمم لحمايتها.'],
    ['FaHandshake', 'القرار للإنسان: لا مصادقة على دفع ولا إغلاق لباقة دون مسؤول من المدرسة.'],
    ['FaScaleBalanced', 'الشفافية تجاه الأساتذة: يطّلع كل أستاذ على مشتركيه وعلى النصيب المتفق عليه.'],
    ['FaMobileScreen', 'تطبيق بسيط، مصمم أولًا لهاتف التلميذ.'],
  ];
  for (let i = 0; i < principles.length; i++) {
    const y = 1.45 + i * 1.02;
    await iconCircle(s, 'Principe ' + i, principles[i][0], 0.6, y, 0.7);
    text(s, principles[i][1], { x: 1.6, y, w: 11.1, h: 0.7, fontSize: 18, color: C.text1, valign: 'middle', objectName: 'Principe ' + i });
  }

  // 12. Next steps
  pres.addSection({ title: 'المرحلة القادمة' });
  s = add('Conclusion AR', 'المرحلة القادمة');
  s.addText('الخطوات القادمة', { placeholder: 'title' });
  const next = [
    ['FaMobileScreen', 'العرض التجريبي', 'نسخة تعمل الآن على الهاتف، نعرضها عليكم في الموعد الذي يناسبكم.'],
    ['FaTags', 'الصيغ والأسعار', 'المصادقة معًا على التخفيضات وحدود المشاهدة ونسب الأساتذة.'],
    ['FaBuildingColumns', 'البنوك', 'مباشرة المباحثات مع Bankily ثم Masrvi وSedad وClick لتصبح المدرسة جهة فوترة.'],
    ['FaVideo', 'الحصص المباشرة', 'اختيار مزود البث المرئي المناسب لعدد التلاميذ.'],
  ];
  for (let i = 0; i < 4; i++) {
    const x = 0.6 + (i % 2) * 6.2;
    const y = 2.0 + Math.floor(i / 2) * 2.15;
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w: 5.9, h: 1.85, rectRadius: 0.12, fill: { color: '145A45' }, line: { type: 'none' }, objectName: 'Suite ' + i });
    await iconCircle(s, 'Suite ' + i, next[i][0], x + 0.3, y + 0.3, 0.75, C.accent2);
    text(s, next[i][1], { x: x + 1.3, y: y + 0.3, w: 4.3, h: 0.5, fontSize: 20, bold: true, color: C.background1, objectName: 'Titre suite ' + i });
    text(s, next[i][2], { x: x + 1.3, y: y + 0.82, w: 4.35, h: 0.9, fontSize: 15, color: 'D7E6DE', valign: 'top', objectName: 'Texte suite ' + i });
  }
  text(s, 'إنتغرا ش.ذ.م.م · نواكشوط · ‎+222 42 01 62 07‎ · contact@integra-sarl.com', { x: 0.6, y: 6.7, w: 12.1, h: 0.4, fontSize: 13, color: C.accent2, objectName: 'Contact' });

  await pres.writeFile({ fileName: OUT });
  await applyTheme(OUT, THEME);
  console.log('written', OUT);
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
