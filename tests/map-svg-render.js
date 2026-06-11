// SVG를 Canvas에 렌더링해서 PNG로 저장
const { chromium } = require('@playwright/test');
const path = require('path');
const fs = require('fs');

const svgPath = path.join(__dirname, '../test-results/map-svg.svg');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 500, height: 500 } });

  const svgContent = fs.readFileSync(svgPath, 'utf-8');

  await page.setContent(`
    <!DOCTYPE html>
    <html><body style="margin:0;padding:0;background:#EEF2FF;">
    <div style="width:400px;height:400px;overflow:hidden;position:relative;">
      ${svgContent}
    </div>
    </body></html>
  `);

  await page.waitForTimeout(200);
  const screenshot = await page.screenshot({ type: 'png' });
  fs.writeFileSync(path.join(__dirname, '../test-results/map-svg-rendered.png'), screenshot);
  console.log('SVG 렌더링 스크린샷 저장');

  await browser.close();
})();
