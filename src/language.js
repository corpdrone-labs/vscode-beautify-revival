const path = require('node:path');
const { normalizeFormatter } = require('./formatting');

const SUPPORTED_FORMATTERS = ['js', 'css', 'html'];

function asArray(value) {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

function cloneWithScheme(selector, scheme) {
  return { ...selector, scheme };
}

function selectorsForEntry(entry) {
  if (!entry) return [];

  const selectors = [];
  if (Array.isArray(entry)) {
    selectors.push(...entry.filter(Boolean).map(language => ({ language, scheme: 'file' })));
  } else if (typeof entry === 'object') {
    selectors.push(...asArray(entry.type).filter(Boolean).map(language => ({ language, scheme: 'file' })));
    const extensions = asArray(entry.ext).filter(Boolean);
    if (extensions.length) selectors.push({ pattern: `**/*.{${extensions.join(',')}}`, scheme: 'file' });
    const filenames = asArray(entry.filename).filter(Boolean);
    if (filenames.length) selectors.push({ pattern: `**/{${filenames.join(',')}}`, scheme: 'file' });
  }

  return selectors.concat(selectors.map(selector => cloneWithScheme(selector, 'untitled')));
}

function buildLanguageSelectors(languageConfig) {
  const result = {};
  const config = languageConfig || {};
  for (const formatter of SUPPORTED_FORMATTERS) {
    const selectors = selectorsForEntry(config[formatter]);
    if (selectors.length) result[formatter] = selectors;
  }
  return result;
}

function entryMatchesDocument(entry, document) {
  if (!entry) return false;
  const languageId = document.languageId;
  const fileName = document.fileName || '';
  const basename = path.basename(fileName);
  const extension = path.extname(fileName).replace(/^\./, '');

  if (Array.isArray(entry)) return entry.includes(languageId);
  if (typeof entry !== 'object') return false;

  return asArray(entry.type).includes(languageId) ||
    asArray(entry.ext).includes(extension) ||
    asArray(entry.filename).includes(basename);
}

function formatterForDocument(document, languageConfig) {
  const direct = normalizeFormatter(document && document.languageId);
  const config = languageConfig || {};

  for (const formatter of SUPPORTED_FORMATTERS) {
    if (entryMatchesDocument(config[formatter], document)) return formatter;
  }

  return direct;
}

module.exports = {
  SUPPORTED_FORMATTERS,
  buildLanguageSelectors,
  formatterForDocument
};
