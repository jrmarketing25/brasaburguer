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

  const viewports = [
    { width: 360, height: 740, label: '360px (Pequeno)' },
    { width: 375, height: 812, label: '375px (Médio)' },
    { width: 390, height: 844, label: '390px (Padrão Pro)' },
    { width: 430, height: 932, label: '430px (Max/Plus)' },
  ];

  console.log('=== INICIANDO AUDITORIA RESPONSIVA DO CHECKOUT MOBILE ===');

  for (const vp of viewports) {
    const page = await browser.newPage();
    await page.setViewport({ width: vp.width, height: vp.height, deviceScaleFactor: 2 });

    // Injeta dados no localStorage
    await page.goto('http://localhost:3000/carrinho', { waitUntil: 'networkidle0' });
    await page.evaluate((data) => {
      localStorage.setItem('brasa-burgers-cart-v1', JSON.stringify(data));
    }, cartDemoData);

    await page.reload({ waitUntil: 'networkidle0' });
    await page.waitForFunction(() => document.body.innerText.toUpperCase().includes('ITENS'), { timeout: 10000 });
    await new Promise((r) => setTimeout(r, 400));

    // Preenchimento inteligente com máscaras
    const nameInput = await page.$('input[name="name"]');
    if (nameInput) await nameInput.type('João Silva');

    const phoneInput = await page.$('input[name="phone"]');
    if (phoneInput) await phoneInput.type('11987654321');

    const cepInput = await page.$('input[name="postal-code"]');
    if (cepInput) await cepInput.type('01310100');

    const selectBairro = await page.$('select');
    if (selectBairro) {
      await selectBairro.select('Centro');
    }

    const streetInput = await page.$('input[name="street"]');
    if (streetInput) await streetInput.type('Av. Paulista');

    const numberInput = await page.$('input[name="number"]');
    if (numberInput) await numberInput.type('1000');

    // Seleciona pagamento em Dinheiro e solicita troco
    const dinheiroBtn = await page.evaluateHandle(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      return buttons.find(b => b.innerText.includes('Dinheiro'));
    });
    if (dinheiroBtn && dinheiroBtn.click) {
      await dinheiroBtn.click();
      await new Promise((r) => setTimeout(r, 200));

      const simBtn = await page.evaluateHandle(() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        return buttons.find(b => b.innerText.trim() === 'Sim');
      });
      if (simBtn && simBtn.click) {
        await simBtn.click();
        await new Promise((r) => setTimeout(r, 200));

        const trocoInput = await page.$('input[placeholder*="150,00"]');
        if (trocoInput) {
          await trocoInput.type('15000');
        }
      }
    }

    // Verifica overflow horizontal
    const hasHorizontalOverflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth > window.innerWidth;
    });

    // Lê os valores formatados exibidos nos inputs
    const values = await page.evaluate(() => {
      const p = document.querySelector('input[name="phone"]')?.value;
      const c = document.querySelector('input[name="postal-code"]')?.value;
      const t = document.querySelector('input[placeholder*="150,00"]')?.value;
      return { phone: p, cep: c, troco: t };
    });

    console.log(`[Viewport ${vp.label}] Overflow horizontal: ${hasHorizontalOverflow ? 'DETECTADO (ERRO)' : 'NENHUM (PERFEITO)'}`);
    console.log(`  - Telefone formatado: "${values.phone}"`);
    console.log(`  - CEP formatado: "${values.cep}"`);
    console.log(`  - Troco formatado: "${values.troco}"`);

    // Captura screenshots específicos na viewport de referência (390px)
    if (vp.width === 390) {
      // 1. Formulário de Entrega e Dados do Cliente com máscaras
      await page.evaluate(() => {
        const input = document.querySelector('input[name="name"]');
        if (input) input.scrollIntoView({ block: 'start', behavior: 'instant' });
        window.scrollBy(0, -60); // compensa sticky header
      });
      await new Promise((r) => setTimeout(r, 400));
      await page.screenshot({
        path: 'public/images/references/checkout-form-masked-390px.png',
        fullPage: false,
      });
      console.log('  -> Screenshot salvo: public/images/references/checkout-form-masked-390px.png');

      // 2. Seção de Pagamento e Troco Dinâmico
      await page.evaluate(() => {
        const h3 = Array.from(document.querySelectorAll('h3')).find(el => el.innerText.includes('2. Forma de pagamento'));
        if (h3) h3.scrollIntoView({ block: 'start', behavior: 'instant' });
        window.scrollBy(0, -60);
      });
      await new Promise((r) => setTimeout(r, 400));
      await page.screenshot({
        path: 'public/images/references/checkout-inputs-390px.png',
        fullPage: false,
      });
      console.log('  -> Screenshot salvo: public/images/references/checkout-inputs-390px.png');

      // 3. Resumo Financeiro e CTA WhatsApp
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await new Promise((r) => setTimeout(r, 500));
      await page.screenshot({
        path: 'public/images/references/checkout-audit-390px.png',
        fullPage: false,
      });
      console.log('  -> Screenshot salvo: public/images/references/checkout-audit-390px.png');
    }

    await page.close();
  }

  await browser.close();
  console.log('=== AUDITORIA RESPONSIVA CONCLUÍDA COM SUCESSO! ===');
})();

