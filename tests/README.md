# Testing Layman Cook

This folder contains tests for the static HTML/CSS site. There is no JavaScript in the app, so tests focus on **structure**, **content**, and **links**.

## How to run

From the **repo root** (`laymancook/`):

```bash
npm install   # once
npm test
```

Watch mode (re-run on file changes):

```bash
npm run test:watch
```

## What is tested

- **Index page**: Header, title, nav links (Home, Recipes, About, Contact), section IDs, recipe links, stylesheet existence.
- **Recipe pages**: Main heading, recipe container, “Ingredients” and “Instructions” sections, internal links resolve to existing files.
- **Link integrity**: Recipe links from the index point to real HTML files.

## How to add more test cases

1. Open `run-tests.js`.
2. Use `loadHtml('path/from/site/root.html')` to get a Cheerio instance and path info.
3. Use `describe` / `test` from `node:test` and `assert` from `node:assert`.
4. Query with Cheerio: `doc('selector')`, `.text()`, `.attr('href')`, etc.

Example — assert the footer exists on the index:

```js
test('has footer with copyright', () => {
  const { $: doc } = loadHtml('index.html');
  const footer = doc('footer p').text();
  assert.ok(footer.includes('Layman Cook') && footer.includes('©'));
});
```

## Other testing options

- **HTML validation**: Use [html-validate](https://www.npmjs.com/package/html-validate) or the W3C validator in CI.
- **E2E in a browser**: Use [Playwright](https://playwright.dev/) to open pages, click links, and check accessibility (e.g. axe-core).
- **Link checker**: Use [broken-link-checker](https://www.npmjs.com/package/broken-link-checker) or similar for full-site link checks.
