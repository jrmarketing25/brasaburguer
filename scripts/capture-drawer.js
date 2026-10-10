const puppeteer = require('puppeteer-core');

(async () => {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2 });
  await page.goto('http://localhost:3005', { waitUntil: 'networkidle0' });

  // Clica no card do combo
  const cards = await page.$$('#cardapio [role="button"]');
  if (cards.length > 0) {
    await cards[0].click();
  }

  await page.waitForSelector('[role="dialog"]', { timeout: 5000 });
  await new Promise((r) => setTimeout(r, 600));

  // Screenshot do topo
  await page.screenshot({
    path: 'public/images/references/drawer-personalizacao-390px.png',
    fullPage: false,
  });

  // Rola o container interno do drawer para baixo
  await page.evaluate(() => {
    const scrollable = document.querySelector('[role="dialog"] .overflow-y-auto');
    if (scrollable) scrollable.scrollTop = 400;
  });

  await new Promise((r) => setTimeout(r, 600));

  // Screenshot da área inferior (adicionais, remoção e observações)
  await page.screenshot({
    path: 'public/images/references/drawer-personalizacao-scroll-390px.png',
    fullPage: false,
  });

  await browser.close();
  console.log('Both screenshots captured successfully!');
})();

