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
          cartItemId: 'combo-classico__opt[bebida:coca-cola:0]__rem[]__obs[]',
          product: {
            slug: 'combo-classico',
            name: 'Combo Brasa Clássico',
            category: 'combos',
            priceCents: 4990,
            image: '/images/combos/combo-classico.webp',
            description: 'Brasa Clássico, batata rústica e refrigerante gelado.',
            badge: 'Mais pedido'
          },
          quantity: 1,
          selectedAddOns: [{ name: 'Coca-Cola Original 350ml', priceCents: 0, quantity: 1 }],
          selectedOptions: [{ groupId: 'bebida', groupName: 'Escolha sua bebida', optionId: 'coca-cola', name: 'Coca-Cola Original 350ml', priceCents: 0 }],
          removedIngredients: [],
          observation: 'Gelo e limão, por favor',
          unitPriceCents: 4990,
          totalItemCents: 4990
        },
        {
          cartItemId: 'brasa-bacon__addons[bacon-extra:400:1]__rem[cebola]__obs[ponto]',
          product: {
            slug: 'brasa-bacon',
            name: 'Brasa Bacon',
            category: 'hamburgueres',
            priceCents: 4090,
            image: '/images/burgers/brasa-bacon.webp',
            description: 'Blend 180g, muito bacon crocante, cheddar duplo e molho especial.',
            badge: 'Mais pedido'
          },
          quantity: 2,
          selectedAddOns: [{ name: 'Bacon extra', priceCents: 400, quantity: 1 }],
          selectedOptions: [],
          removedIngredients: ['Cebola caramelizada'],
          observation: 'Ponto bem passado',
          unitPriceCents: 4490,
          totalItemCents: 8980
        }
      ],
      deliveryMode: 'delivery',
      customer: {
        name: 'João Silva',
        phone: '11987654321',
        cep: '01310-100',
        street: 'Avenida Paulista',
        number: '1000',
        complement: 'Apto 42',
        neighborhood: 'Bela Vista',
        city: 'São Paulo',
        reference: ''
      },
      paymentMethod: 'pix',
      changeFor: null
    },
    version: 0
  };

  const viewports = [
    { name: '1024px', width: 1024, height: 800 },
    { name: '1280px', width: 1280, height: 900 },
    { name: '1440px', width: 1440, height: 950 },
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
      localStorage.setItem('brasa_burgers_cart_v1', JSON.stringify(data));
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

