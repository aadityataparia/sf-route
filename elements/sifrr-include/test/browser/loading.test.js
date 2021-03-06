describe('include', function() {
  before(async () => {
    await page.goto(`${PATH}/include.html`);
    await page.evaluate(async () => await Sifrr.Dom.loading());
  });

  it('loads include', async function() {
    const name = await page.evaluate("Sifrr.Dom.elements['sifrr-include'].elementName");
    expect(name).to.equal('sifrr-include');
  });

  it('loads html', async function() {
    const html = await page.$eval('#html', el => el.innerHTML);
    expect(html).to.equal('<p>OK</p>');
  });

  it('loads html with selector', async function() {
    const html = await page.$eval('#htmlSelector', el => el.innerHTML);
    expect(html).to.equal('<div id="selector"><p>Selector</p></div>');
  });

  it('loads css', async function() {
    const css = await page.$eval('#css style', el => el.innerHTML);
    expect(css).to.equal(`a {
  color: green;
}`);
  });

  it('loads js', async function() {
    const js = await page.$eval('#js script', el => el.innerHTML);
    expect(js).to.equal("window.ok = 'ok';\n");
    expect(await page.evaluate(() => window.ok)).to.equal('ok');
  });
});
