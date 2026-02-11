/**
 * Tests for the Layman Cook static site (HTML structure, content, links).
 * Run from repo root: npm test
 *
 * Uses Node's built-in test runner and cheerio for HTML parsing.
 * No browser required.
 */

const fs = require('fs');
const path = require('path');
const { test, describe } = require('node:test');
const assert = require('node:assert');

// Load cheerio only when running tests (optional dependency)
let $;
try {
  const cheerio = require('cheerio');
  $ = (html) => cheerio.load(html);
} catch (e) {
  console.error('Run "npm install" first. cheerio is required for tests.');
  process.exit(1);
}

const SITE_ROOT = path.join(__dirname, '..');

function loadHtml(relativePath) {
  const fullPath = path.join(SITE_ROOT, relativePath);
  const html = fs.readFileSync(fullPath, 'utf-8');
  return { $: $(html), path: relativePath, fullPath };
}

describe('Index page (index.html)', () => {
  test('has required header and title', () => {
    const { $: doc } = loadHtml('index.html');
    assert.strictEqual(doc('h1').first().text().trim(), 'Layman Cook');
    assert.ok(doc('title').text().includes('Layman Cook'));
  });

  test('has nav with expected links', () => {
    const { $: doc } = loadHtml('index.html');
    const links = doc('nav a').map((_, el) => doc(el).attr('href')).get();
    assert.ok(links.some(h => h === '#home'), 'nav should have Home');
    assert.ok(links.some(h => h === '#recipes'), 'nav should have Recipes');
    assert.ok(links.some(h => h === '#about'), 'nav should have About');
    assert.ok(links.some(h => h === '#contact'), 'nav should have Contact');
  });

  test('has sections with expected ids', () => {
    const { $: doc } = loadHtml('index.html');
    const ids = doc('section[id]').map((_, el) => doc(el).attr('id')).get();
    assert.ok(ids.includes('home'), 'section #home');
    assert.ok(ids.includes('recipes'), 'section #recipes');
    assert.ok(ids.includes('about'), 'section #about');
    assert.ok(ids.includes('contact'), 'section #contact');
  });

  test('featured recipes section has at least one recipe link', () => {
    const { $: doc } = loadHtml('index.html');
    const recipeLinks = doc('#recipes .recipe h3 a[href]');
    assert.ok(recipeLinks.length >= 1, 'at least one recipe link in #recipes');
  });

  test('stylesheet link is present and file exists', () => {
    const { $: doc } = loadHtml('index.html');
    const href = doc('link[rel="stylesheet"]').attr('href');
    assert.ok(href, 'stylesheet link should exist');
    const cssPath = path.join(SITE_ROOT, href);
    assert.ok(fs.existsSync(cssPath), `CSS file should exist: ${href}`);
  });
});

describe('Recipe pages', () => {
  const recipeFiles = fs.readdirSync(path.join(SITE_ROOT, 'recipes'))
    .filter(f => f.endsWith('.html'))
    .map(f => path.join('recipes', f));

  if (recipeFiles.length === 0) {
    test('recipes directory has at least one HTML file', () => {
      assert.fail('No recipe HTML files found in recipes/');
    });
  }

  for (const file of recipeFiles) {
    describe(file, () => {
      test('has main heading and recipe structure', () => {
        const { $: doc } = loadHtml(file);
        assert.ok(doc('h1').length >= 1, 'recipe should have h1');
        assert.ok(doc('article.recipe, .recipe').length >= 1, 'recipe should have recipe container');
      });

      test('has Ingredients section', () => {
        const { $: doc } = loadHtml(file);
        const headings = doc('h2').map((_, el) => doc(el).text().toLowerCase()).get();
        assert.ok(headings.some(h => h.includes('ingredient')), `should have Ingredients heading: ${file}`);
      });

      test('has Instructions section', () => {
        const { $: doc } = loadHtml(file);
        const headings = doc('h2').map((_, el) => doc(el).text().toLowerCase()).get();
        assert.ok(headings.some(h => h.includes('instruction')), `should have Instructions heading: ${file}`);
      });

      test('internal links point to existing files or anchors', () => {
        const { $: doc } = loadHtml(file);
        const dir = path.dirname(file);
        doc('a[href]').each((_, el) => {
          const href = doc(el).attr('href');
          if (!href || href.startsWith('#') || href.startsWith('http') || href.startsWith('mailto:')) return;
          const resolved = path.normalize(path.join(dir, href)).replace(/\\/g, '/');
          const filePath = path.join(SITE_ROOT, resolved.split('#')[0]);
          assert.ok(fs.existsSync(filePath), `Link should exist: ${href} (resolved: ${filePath})`);
        });
      });
    });
  }
});

describe('Internal link integrity (index)', () => {
  test('recipe links from index point to existing files', () => {
    const { $: doc } = loadHtml('index.html');
    doc('a[href*=".html"]').each((_, el) => {
      const href = doc(el).attr('href');
      const filePath = path.join(SITE_ROOT, href.split('#')[0]);
      assert.ok(fs.existsSync(filePath), `Recipe link should exist: ${href}`);
    });
  });
});
