import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import { join } from 'node:path';

async function files(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(
    entries.map((entry) =>
      entry.isDirectory() ? files(join(directory, entry.name)) : join(directory, entry.name),
    ),
  );
  return nested.flat();
}
const appFiles = await files('dist/open-f/browser');
for (const path of appFiles.filter((path) => /\.(?:js|css|html)$/.test(path))) {
  const content = await readFile(path, 'utf8');
  assert(
    !/openf-storybook|AuthFixture|book-route-preview|__STORYBOOK|0\.123em/.test(content),
    `Catalog leaked into ${path}`,
  );
}
const appSources = await files('src');
for (const path of appSources.filter((path) => /\.(?:ts|css|html)$/.test(path))) {
  const content = await readFile(path, 'utf8');
  assert(
    !/(?:from\s+|import\s*\(|@import\s*)['"][^'"]*(?:storybook|tests\/)/.test(content),
    `Catalog import in ${path}`,
  );
}
console.log('App build isolated: no catalog code, fixtures or catalog-only CSS.');
