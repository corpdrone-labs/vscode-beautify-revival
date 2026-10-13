const assert = require('node:assert/strict');
const { buildLanguageSelectors, formatterForDocument } = require('../src/language');

describe('language mapping', () => {
  it('builds selectors from language ids, extensions, and filenames', () => {
    const selectors = buildLanguageSelectors({
      js: { type: ['javascript'], ext: ['mjs'], filename: ['.jsbeautifyrc'] },
      css: ['css'],
      html: null
    });

    assert.deepEqual(selectors.js, [
      { language: 'javascript', scheme: 'file' },
      { pattern: '**/*.{mjs}', scheme: 'file' },
      { pattern: '**/{.jsbeautifyrc}', scheme: 'file' },
      { language: 'javascript', scheme: 'untitled' },
      { pattern: '**/*.{mjs}', scheme: 'untitled' },
      { pattern: '**/{.jsbeautifyrc}', scheme: 'untitled' }
    ]);
    assert.deepEqual(selectors.css, [
      { language: 'css', scheme: 'file' },
      { language: 'css', scheme: 'untitled' }
    ]);
    assert.equal(selectors.html, undefined);
  });

  it('finds the formatter for a document from language id, extension, or filename', () => {
    const mapping = {
      js: { type: ['javascript'], ext: ['cjs'], filename: ['.jshintrc'] },
      css: ['css'],
      html: ['html']
    };

    assert.equal(formatterForDocument({ languageId: 'javascript', fileName: '/p/a.js' }, mapping), 'js');
    assert.equal(formatterForDocument({ languageId: 'plaintext', fileName: '/p/a.cjs' }, mapping), 'js');
    assert.equal(formatterForDocument({ languageId: 'plaintext', fileName: '/p/.jshintrc' }, mapping), 'js');
    assert.equal(formatterForDocument({ languageId: 'css', fileName: '/p/a.unknown' }, mapping), 'css');
  });
});
