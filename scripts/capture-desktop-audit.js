const puppeteer = require('puppeteer-core');

(async () => {
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
          cartItemId: 'brasa-bacon__opt[adicionais:bacon-extra:400]__rem[sem-cebola]__obs[ponto bem passado]',
          product: {
            slug: 'brasa-bacon',
            name: 'Brasa Bacon',
            category: 'hamburgueres',
            priceCents: 3690,
            image: '/images/products/brasa-bacon.webp',
            description: 'Blend artesanal, cheddar, bacon crocante e cebola caramelizada.',
            badge: 'Mais pedido'
          },
          quantity: 2,
          selectedAddOns: [{ name: 'Bacon extra', priceCents: 400, quantity: 1 }],
          selectedOptions: [{ groupId: 'adicionais', groupName: 'Adicione mais sabor', optionId: 'bacon-extra', name: 'Bacon extra', priceCents: 400 }],
          removedIngredients: ['Sem cebola caramelizada'],
          observation: 'Ponto bem passado',
          unitPriceCents: 4090,
          totalItemCents: 8180
        }
      ]
    },
    version: 0
  };

  const breakpoints = [
    { width: 360, height: 740, label: '360px Mobile Compacto' },
    { width: 390, height: 844, label: '390px Mobile Referência' },
    { width: 430, height: 932, label: '430px Mobile Max' },
    { width: 768, height: 1024, label: '768px Tablet' },
    { width: 1024, height: 768, label: '1024px Laptop Pequeno' },
    { width: 1280, height: 800, label: '1280px Desktop Médio' },
    { width: 1440, height: 900, label: '1440px Desktop Padrão' },
    { width: 1920, height: 1080, label: '1920px Widescreen' },
  ];

  console.log('=== AUDITORIA DE BREAKPOINTS E COMPOSIÇÃO DESKTOP ===');

  const page = await browser.newPage();

  // Injeta dados no localStorage na Home
  await page.goto('http://localhost:3000/', { waitUntil: 'networkidle0' });
  await page.evaluate((data) => {
    localStorage.setItem('brasa-burgers-cart-v1', JSON.stringify(data));
  }, cartDemoData);
  await page.reload({ waitUntil: 'networkidle0' });

  // 1. Testa todos os breakpoints para checar overflow horizontal
  for (const bp of breakpoints) {
    await page.setViewport({ width: bp.width, height: bp.height });
    await new Promise((r) => setTimeout(r, 200));

    const overflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth > window.innerWidth;
    });

    console.log(`[Breakpoint ${bp.label}] Overflow: ${overflow ? 'DETECTADO (ERRO)' : 'NENHUM (PERFEITO)'}`);
  }

  // 2. Captura Home em 1440px Desktop
  console.log('Capturando Home em 1440px...');
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1.5 });
  await page.reload({ waitUntil: 'networkidle0' });
  await new Promise((r) => setTimeout(r, 600));

  await page.screenshot({
    path: 'public/images/references/home-desktop-1440px.png',
    fullPage: false,
  });
  console.log('  -> public/images/references/home-desktop-1440px.png salvo.');

  // 3. Captura Modal de Detalhes do Produto no Desktop (1440px)
  console.log('Testando abertura do Modal de Detalhes no Desktop...');
  const firstCard = await page.$('[role="button"]');
  if (firstCard) {
    await firstCard.click();
    await new Promise((r) => setTimeout(r, 500));
    await page.screenshot({
      path: 'public/images/references/produto-modal-desktop-1440px.png',
      fullPage: false,
    });
    console.log('  -> public/images/references/produto-modal-desktop-1440px.png salvo.');

    // Fecha o modal via botão X
    const closeBtn = await page.$('button[aria-label="Fechar detalhes"]');
    if (closeBtn) await closeBtn.click();
    await new Promise((r) => setTimeout(r, 300));
  }

  // 4. Captura Checkout / Carrinho em 1440px Desktop
  console.log('Capturando Checkout / Carrinho em 1440px...');
  await page.goto('http://localhost:3000/carrinho', { waitUntil: 'networkidle0' });
  await new Promise((r) => setTimeout(r, 500));
  await page.screenshot({
    path: 'public/images/references/carrinho-desktop-1440px.png',
    fullPage: false,
  });
  console.log('  -> public/images/references/carrinho-desktop-1440px.png salvo.');

  // 5. Captura Home em 390px Mobile (Verificação de Ausência de Regressões)
  console.log('Capturando Home em 390px (Mobile Regression Check)...');
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2 });
  await page.goto('http://localhost:3000/', { waitUntil: 'networkidle0' });
  await new Promise((r) => setTimeout(r, 500));
  await page.screenshot({
    path: 'public/images/references/home-mobile-regression-390px.png',
    fullPage: false,
  });
  console.log('  -> public/images/references/home-mobile-regression-390px.png salvo.');

  await browser.close();
  console.log('=== AUDITORIA E CAPTURAS FINALIZADAS COM SUCESSO! ===');
})();

