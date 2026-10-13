const beautify = require('js-beautify');
const { parse } = require('@babel/parser');

const ALIASES = new Map([
  ['js', 'js'],
  ['javascript', 'js'],
  ['javascriptreact', 'js'],
  ['typescript', 'js'],
  ['typescriptreact', 'js'],
  ['json', 'js'],
  ['jsonc', 'js'],
  ['css', 'css'],
  ['less', 'css'],
  ['scss', 'css'],
  ['html', 'html'],
  ['htm', 'html']
]);

function normalizeFormatter(formatter) {
  if (!formatter) return undefined;
  return ALIASES.get(String(formatter).toLowerCase());
}

// Stop at the outermost JSX node: nested expressions and markup must stay verbatim.
function collectJsxSpans(node, spans) {
  if (!node || typeof node !== 'object') return;
  if (node.type === 'JSXElement' || node.type === 'JSXFragment') {
    spans.push(node);
    return;
  }
  for (const value of Object.values(node)) {
    if (Array.isArray(value)) value.forEach(child => collectJsxSpans(child, spans));
    else if (value && typeof value.type === 'string') collectJsxSpans(value, spans);
  }
}

// Ignore parser bookkeeping, not syntax (including directives and literal values).
function syntaxTree(ast) {
  return JSON.stringify(ast, (key, value) =>
    ['start', 'end', 'loc', 'extra', 'leadingComments', 'trailingComments', 'innerComments'].includes(key) ? undefined : value);
}

function beautifyJsx(text, options, languageId) {
  const parserOptions = {
    sourceType: 'unambiguous',
    plugins: languageId === 'typescriptreact' ? ['jsx', 'typescript'] : ['jsx']
  };
  try {
    const ast = parse(text, parserOptions);
    const spans = [];
    collectJsxSpans(ast, spans);
    spans.sort((a, b) => a.start - b.start);

    let prefix = '__BEAUTIFY_JSX_';
    while (text.includes(prefix)) prefix = `_${prefix}`;
    let cursor = 0;
    let masked = '';
    const replacements = spans.map((span, index) => {
      const placeholder = `${prefix}${index}__`;
      masked += text.slice(cursor, span.start) + placeholder;
      cursor = span.end;
      return [placeholder, text.slice(span.start, span.end)];
    });
    masked += text.slice(cursor);

    let result = beautify.js(masked, { ...options, e4x: false });
    for (const [placeholder, original] of replacements) {
      if (result.split(placeholder).length !== 2) return text;
      result = result.replace(placeholder, () => original);
    }
    // js-beautify can also change ASI or unfamiliar TS syntax outside JSX.
    return syntaxTree(ast) === syntaxTree(parse(result, parserOptions)) ? result : text;
  } catch {
    // Invalid documents and incomplete selections are safer left untouched.
    return text;
  }
}

function beautifyText(formatter, text, options, languageId) {
  const normalized = normalizeFormatter(formatter);
  if (!normalized || typeof beautify[normalized] !== 'function') {
    throw new Error(`Unsupported beautifier type: ${formatter}`);
  }
  if (normalized === 'js' && ['javascriptreact', 'typescriptreact'].includes(languageId)) {
    return beautifyJsx(text, options || {}, languageId);
  }
  return beautify[normalized](text, options || {});
}

module.exports = {
  beautifyText,
  normalizeFormatter
};
