const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const editorconfig = require('editorconfig');

function dropJsonComments(text) {
  let result = '';
  let inString = false;
  let quote = '';
  let escaped = false;
  let inLineComment = false;
  let inBlockComment = false;

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    const next = text[i + 1];

    if (inLineComment) {
      if (char === '\n' || char === '\r') {
        inLineComment = false;
        result += char;
      }
      continue;
    }

    if (inBlockComment) {
      if (char === '*' && next === '/') {
        inBlockComment = false;
        i += 1;
      } else if (char === '\n' || char === '\r') {
        result += char;
      }
      continue;
    }

    if (inString) {
      result += char;
      if (escaped) {
        escaped = false;
      } else if (char === '\\') {
        escaped = true;
      } else if (char === quote) {
        inString = false;
      }
      continue;
    }

    if (char === '"' || char === "'") {
      inString = true;
      quote = char;
      result += char;
      continue;
    }

    if (char === '/' && next === '/') {
      inLineComment = true;
      i += 1;
      continue;
    }

    if (char === '/' && next === '*') {
      inBlockComment = true;
      i += 1;
      continue;
    }

    result += char;
  }

  return result;
}

function mergeBeautifyOptions(options, formatter) {
  const source = options || {};
  const merged = {};
  for (const [key, value] of Object.entries(source)) {
    if (key !== 'js' && key !== 'html' && key !== 'css') merged[key] = value;
  }

  if (source[formatter] && typeof source[formatter] === 'object') {
    for (const [key, value] of Object.entries(source[formatter])) {
      if (key !== 'allowed_file_extensions') merged[key] = value;
    }
  }

  return merged;
}

function findUp(startDir, fileName, stopDir) {
  if (!startDir) return null;
  const resolvedStop = stopDir ? path.resolve(stopDir) : undefined;
  let current = path.resolve(startDir);

  while (true) {
    const candidate = path.join(current, fileName);
    if (fs.existsSync(candidate)) return candidate;
    if (resolvedStop && current === resolvedStop) return null;
    const parent = path.dirname(current);
    if (parent === current) return null;
    current = parent;
  }
}

function applyEditorConfig(config, editorConfig) {
  const eConfig = editorConfig || {};
  if (eConfig.indent_style === 'tab') {
    config.indent_with_tabs = true;
    config.indent_char = '\t';
  } else if (eConfig.indent_style === 'space') {
    config.indent_with_tabs = false;
    config.indent_char = ' ';
  }

  if (eConfig.indent_size && eConfig.indent_size !== 'tab') {
    config.indent_size = Number(eConfig.indent_size);
  }

  if (eConfig.max_line_length) {
    config.wrap_line_length = eConfig.max_line_length === 'off' ? 0 : Number(eConfig.max_line_length);
  }

  if (eConfig.insert_final_newline === true) config.end_with_newline = true;
  if (eConfig.insert_final_newline === false) config.end_with_newline = false;

  if (eConfig.end_of_line === 'cr') config.eol = '\r';
  if (eConfig.end_of_line === 'lf') config.eol = '\n';
  if (eConfig.end_of_line === 'crlf') config.eol = '\r\n';

  return config;
}

function optionsFromVSCodeConfig(vscodeConfig, editorOptions, formatter) {
  const config = vscodeConfig || {};
  const files = config.files || {};
  const javascript = config.javascript || { format: {} };
  const html = config.html || { format: {} };
  const htmlFormat = html.format || {};
  const jsFormat = javascript.format || {};
  const formatOptions = editorOptions || {};

  const options = {
    indent_with_tabs: formatOptions.insertSpaces === undefined ? true : !formatOptions.insertSpaces,
    indent_size: formatOptions.tabSize,
    indent_char: ' ',
    end_with_newline: files.insertFinalNewLine,
    eol: files.eol,
    space_after_anon_function: jsFormat.insertSpaceAfterFunctionKeywordForAnonymousFunctions,
    space_in_paren: jsFormat.insertSpaceAfterOpeningAndBeforeClosingNonemptyParenthesis
  };

  if (formatter === 'html') {
    options.end_with_newline = htmlFormat.endWithNewline;
    if (typeof htmlFormat.extraLiners === 'string') {
      options.extra_liners = htmlFormat.extraLiners.split(',').map(s => s.trim()).filter(Boolean);
    }
    options.indent_handlebars = htmlFormat.indentHandlebars;
    options.indent_inner_html = htmlFormat.indentInnerHtml;
    options.max_preserve_newlines = htmlFormat.maxPreserveNewLines;
    options.preserve_newlines = htmlFormat.preserveNewLines;
    options.wrap_attributes = htmlFormat.wrapAttributes;
    if (typeof htmlFormat.unformatted === 'string') {
      options.unformatted = htmlFormat.unformatted.split(',').map(s => s.trim()).filter(Boolean);
    }
    options.wrap_line_length = htmlFormat.wrapLineLength;
  }

  return Object.fromEntries(Object.entries(options).filter(([, value]) => value !== undefined));
}

function readBeautifyConfig(fileName, formatter) {
  const raw = fs.readFileSync(fileName, 'utf8');
  if (!raw.trim()) return null;
  return mergeBeautifyOptions(JSON.parse(dropJsonComments(raw)), formatter);
}

async function resolveBeautifyOptions(input) {
  const fileName = input.fileName;
  const workspaceRoot = input.workspaceRoot;
  const formatter = input.formatter;
  const vscodeConfig = input.vscodeConfig || {};
  const beautifyConfig = vscodeConfig.beautify || {};
  const editorOptions = input.editorOptions || {};
  let options = optionsFromVSCodeConfig(vscodeConfig, editorOptions, formatter);

  if (fileName) {
    try {
      applyEditorConfig(options, await editorconfig.parse(fileName));
    } catch (_) {
      // Invalid or unreadable editorconfig files should not block formatting.
    }
  }

  const startDir = input.isUntitled ? workspaceRoot : path.dirname(fileName || workspaceRoot || process.cwd());
  let configFile = findUp(startDir, '.jsbeautifyrc', workspaceRoot);

  if (!configFile && beautifyConfig.config) {
    if (typeof beautifyConfig.config === 'object') return mergeBeautifyOptions(beautifyConfig.config, formatter);
    if (typeof beautifyConfig.config === 'string') {
      const configuredPath = path.isAbsolute(beautifyConfig.config) ?
        beautifyConfig.config :
        path.resolve(workspaceRoot || process.cwd(), beautifyConfig.config);
      if (fs.existsSync(configuredPath)) configFile = configuredPath;
    }
  }

  if (!configFile && workspaceRoot) {
    configFile = findUp(path.dirname(workspaceRoot), '.jsbeautifyrc');
  }

  if (!configFile) {
    const homeConfig = path.join(os.homedir(), '.jsbeautifyrc');
    if (fs.existsSync(homeConfig)) configFile = homeConfig;
  }

  if (!configFile) return options;
  return readBeautifyConfig(configFile, formatter) || options;
}

module.exports = {
  applyEditorConfig,
  dropJsonComments,
  findUp,
  mergeBeautifyOptions,
  optionsFromVSCodeConfig,
  readBeautifyConfig,
  resolveBeautifyOptions
};
