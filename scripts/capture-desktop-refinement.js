const puppeteer = require('puppeteer-core');
const path = require('path');

async function capture() {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const cartDemoData = {
    state: {
      items: [
        {
          cartItemId: 'brasa-classico-1',
          product: {
            slug: 'brasa-classico',
            name: 'Brasa Clássico',
            category: 'hamburgueres',
            priceCents: 3490,
            image: '/images/products/brasa-classico.webp',
            description: 'Blend 180g, queijo cheddar, bacon crocante, alface e molho especial.',
            badge: 'Mais pedido'
          },
          quantity: 1,
          selectedAddOns: [],
          selectedOptions: [],
          removedIngredients: [],
          observation: '',
          unitPriceCents: 3490,
          totalItemCents: 3490
        },
        {
          cartItemId: 'batata-rustica-1',
          product: {
            slug: 'brasa-bacon',
            name: 'Batata Rústica',
            category: 'acompanhamentos',
            priceCents: 1590,
            image: '/images/products/brasa-bacon.webp',
            description: 'Batatas rústicas douradas com alecrim e páprica defumada.',
            badge: ''
          },
          quantity: 1,
          selectedAddOns: [],
          selectedOptions: [],
          removedIngredients: [],
          observation: '',
          unitPriceCents: 1590,
          totalItemCents: 1590
        },
        {
          cartItemId: 'coca-cola-1',
          product: {
            slug: 'combo-classico',
            name: 'Coca-Cola Lata',
            category: 'bebidas',
            priceCents: 690,
            image: '/images/combos/combo-classico.webp',
            description: 'Refrigerante Coca-Cola 350ml gelada.',
            badge: ''
          },
          quantity: 1,
          selectedAddOns: [],
          selectedOptions: [],
          removedIngredients: [],
          observation: '',
          unitPriceCents: 690,
          totalItemCents: 690
        }
      ]
    },
    version: 0
  };

  const viewports = [
    { name: '1024px', width: 1024, height: 800 },
    { name: '1280px', width: 1280, height: 900 },
    { name: '1440px', width: 1440, height: 1080 },
    { name: '1600px', width: 1600, height: 1000 },
    { name: '390px-mobile', width: 390, height: 844 },
  ];

  console.log('--- AUDITORIA DE REFINAMENTO DESKTOP (PROMPT REFINEMENT) ---');

  for (const vp of viewports) {
    const page = await browser.newPage();
    await page.setViewport({ width: vp.width, height: vp.height });
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });

    // Injeta dados de demonstração no carrinho via localStorage
    await page.evaluate((data) => {
      localStorage.setItem('brasa-burgers-cart-v1', JSON.stringify(data));
    }, cartDemoData);

    await page.reload({ waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 1000));

    const overflow = await page.evaluate(() => {
      const doc = document.documentElement;
      return {
        scrollWidth: doc.scrollWidth,
        clientWidth: doc.clientWidth,
        innerWidth: window.innerWidth,
        hasOverflow: doc.scrollWidth > window.innerWidth + 1
      };
    });

    console.log(`[${vp.name}] Inner: ${vp.width}px, Scroll: ${overflow.scrollWidth}px, Overflow: ${overflow.hasOverflow ? 'FAIL' : 'PASS'}`);

    if (vp.name === '1440px') {
      const outPath = path.join(__dirname, '..', 'public', 'images', 'references', 'home-desktop-refinement-1440px.png');
      await page.screenshot({ path: outPath, fullPage: false });
      console.log(`Captured 1440px screenshot: ${outPath}`);
    }

    if (vp.name === '390px-mobile') {
      const outMobile = path.join(__dirname, '..', 'public', 'images', 'references', 'mobile-regression-refinement-390px.png');
      await page.screenshot({ path: outMobile, fullPage: false });
      console.log(`Captured 390px regression screenshot: ${outMobile}`);
    }

    await page.close();
  }

  await browser.close();
  console.log('--- FIM DA AUDITORIA ---');
}

capture().catch(err => {
  console.error(err);
  process.exit(1);
});

