const puppeteer = require('puppeteer-core');

(async () => {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2 });

  page.on('console', (msg) => console.log('[BROWSER]', msg.text()));
  page.on('pageerror', (err) => console.error('[BROWSER ERROR]', err));

  // 1. Limpa localStorage e acessa carrinho vazio
  console.log('1. Acessando /carrinho vazio...');
  await page.goto('http://localhost:3000/carrinho', { waitUntil: 'networkidle0' });
  await page.evaluate(() => localStorage.clear());
  await page.reload({ waitUntil: 'networkidle0' });

  // Espera montar o componente vazio
  await page.waitForFunction(() => document.body.innerText.toUpperCase().includes('VAZIO'), { timeout: 10000 });
  await new Promise((r) => setTimeout(r, 400));

  await page.screenshot({
    path: 'public/images/references/carrinho-vazio-390px.png',
    fullPage: false,
  });
  console.log('carrinho-vazio-390px.png capturado com sucesso.');

  // 2. Popula o localStorage com 2 itens (Combo + Burger com adicionais)
  console.log('2. Populando localStorage com itens demo...');
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

  await page.evaluate((data) => {
    localStorage.setItem('brasa-burgers-cart-v1', JSON.stringify(data));
  }, cartDemoData);

  // 3. Recarrega /carrinho e espera os itens aparecerem
  console.log('3. Recarregando /carrinho com itens...');
  await page.reload({ waitUntil: 'networkidle0' });
  await page.waitForFunction(() => document.body.innerText.toUpperCase().includes('ITENS'), { timeout: 10000 });
  await new Promise((r) => setTimeout(r, 600));

  // Garante que está no topo antes de tirar a foto dos itens
  await page.evaluate(() => window.scrollTo(0, 0));
  await new Promise((r) => setTimeout(r, 300));

  // Screenshot do topo com itens
  await page.screenshot({
    path: 'public/images/references/carrinho-itens-390px.png',
    fullPage: false,
  });
  console.log('carrinho-itens-390px.png capturado com sucesso.');

  // Preenche dados do cliente para o checkout
  console.log('Preenchendo dados do cliente...');
  const nameInput = await page.$('input[placeholder*="João Silva"]');
  if (nameInput) await nameInput.type('João Silva');

  const phoneInput = await page.$('input[placeholder*="98888"]');
  if (phoneInput) await phoneInput.type('(11) 98765-4321');

  // Seleciona o bairro Centro se o select existir
  const selectBairro = await page.$('select');
  if (selectBairro) {
    await selectBairro.select('Centro');
  }

  const streetInput = await page.$('input[placeholder*="Flores"]');
  if (streetInput) await streetInput.type('Av. Paulista');

  const numberInput = await page.$('input[placeholder*="123"]');
  if (numberInput) await numberInput.type('1000');

  // Rola para ver a forma de pagamento e resumo final com botão WhatsApp
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await new Promise((r) => setTimeout(r, 600));

  await page.screenshot({
    path: 'public/images/references/carrinho-checkout-390px.png',
    fullPage: false,
  });
  console.log('carrinho-checkout-390px.png capturado com sucesso.');

  await browser.close();
  console.log('Todos os screenshots foram gerados com sucesso!');
})();

