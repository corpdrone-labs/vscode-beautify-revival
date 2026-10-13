const vscode = require('vscode');
const path = require('node:path');
const { minimatch } = require('minimatch');

const { beautifyText } = require('./formatting');
const { buildLanguageSelectors, formatterForDocument, SUPPORTED_FORMATTERS } = require('./language');
const { resolveBeautifyOptions } = require('./options');

const DEFAULT_LANGUAGE = {
  js: {
    type: ['javascript', 'javascriptreact', 'typescript', 'typescriptreact', 'json', 'jsonc'],
    filename: ['.jshintrc', '.jsbeautifyrc']
  },
  css: ['css', 'less', 'scss'],
  html: ['htm', 'html']
};

function getWorkspaceRoot(document) {
  if (!vscode.workspace.workspaceFolders || vscode.workspace.workspaceFolders.length === 0) return undefined;
  if (!document || document.isUntitled) return vscode.workspace.workspaceFolders[0].uri.fsPath;
  const folder = vscode.workspace.getWorkspaceFolder(document.uri);
  return folder && folder.uri.fsPath;
}

function fullRange(document) {
  return document.validateRange(new vscode.Range(0, 0, Number.MAX_VALUE, Number.MAX_VALUE));
}

function extendRange(document, range) {
  let end = range.end;
  if (end.character === 0 && end.line > 0) end = end.translate(-1, Number.MAX_VALUE);
  else end = end.translate(0, Number.MAX_VALUE);
  return document.validateRange(new vscode.Range(new vscode.Position(range.start.line, 0), end));
}

async function promptFormatter() {
  const choice = await vscode.window.showQuickPick([
    { label: 'JS', description: 'JavaScript, TypeScript, JSON, JSONC' },
    { label: 'CSS', description: 'CSS, SCSS, Less' },
    { label: 'HTML' }
  ], {
    matchOnDescription: true,
    placeHolder: 'Could not determine the js-beautify formatter. Choose one.'
  });

  if (!choice || !choice.label) return undefined;
  return choice.label.toLowerCase();
}

function getLanguageConfig(document) {
  return vscode.workspace.getConfiguration('beautify', document && document.uri).get('language') || DEFAULT_LANGUAGE;
}

function getVscodeConfig(document) {
  return {
    files: vscode.workspace.getConfiguration('files', document && document.uri),
    javascript: vscode.workspace.getConfiguration('javascript', document && document.uri),
    html: vscode.workspace.getConfiguration('html', document && document.uri),
    beautify: vscode.workspace.getConfiguration('beautify', document && document.uri)
  };
}

function getEditorOptions(document, formattingOptions) {
  if (formattingOptions) return formattingOptions;
  const editor = vscode.window.visibleTextEditors.find(item => item.document && item.document.uri.toString() === document.uri.toString());
  if (editor) return editor.options;
  const config = vscode.workspace.getConfiguration('editor', document && document.uri);
  return {
    insertSpaces: config.get('insertSpaces'),
    tabSize: config.get('tabSize')
  };
}

async function beautifyDocumentRanges(document, ranges, formatter, formattingOptions, isPartial) {
  const selectedFormatter = formatter || formatterForDocument(document, getLanguageConfig(document)) || await promptFormatter();
  if (!selectedFormatter) return [];

  const options = await resolveBeautifyOptions({
    fileName: document.fileName,
    isUntitled: document.isUntitled,
    workspaceRoot: getWorkspaceRoot(document),
    formatter: selectedFormatter,
    editorOptions: getEditorOptions(document, formattingOptions),
    vscodeConfig: getVscodeConfig(document)
  });

  if (isPartial) options.end_with_newline = false;

  return ranges.map(range => vscode.TextEdit.replace(range, beautifyText(selectedFormatter, document.getText(range), options, document.languageId)));
}

function shouldIgnore(document) {
  const workspaceRoot = getWorkspaceRoot(document) || vscode.workspace.rootPath || '';
  let ignore = vscode.workspace.getConfiguration('beautify', document.uri).get('ignore') || [];
  if (!Array.isArray(ignore)) ignore = [ignore];
  let name = document.fileName;
  if (workspaceRoot && name.startsWith(workspaceRoot)) name = path.relative(workspaceRoot, name);
  return ignore.some(glob => glob && minimatch(name, glob));
}

class BeautifyFormatters {
  constructor() {
    this.registrations = [];
  }

  configure() {
    this.dispose();
    const selectors = buildLanguageSelectors(vscode.workspace.getConfiguration('beautify').get('language') || DEFAULT_LANGUAGE);
    for (const formatter of SUPPORTED_FORMATTERS) {
      const selector = selectors[formatter];
      if (!selector) continue;
      this.registrations.push(vscode.languages.registerDocumentFormattingEditProvider(selector, {
        provideDocumentFormattingEdits: (document, formattingOptions) => {
          if (shouldIgnore(document)) return [];
          return beautifyDocumentRanges(document, [fullRange(document)], formatter, formattingOptions, false);
        }
      }));
      this.registrations.push(vscode.languages.registerDocumentRangeFormattingEditProvider(selector, {
        provideDocumentRangeFormattingEdits: (document, range, formattingOptions) => {
          if (shouldIgnore(document)) return [];
          return beautifyDocumentRanges(document, [extendRange(document, range)], formatter, formattingOptions, true);
        }
      }));
    }
  }

  dispose() {
    for (const registration of this.registrations) registration.dispose();
    this.registrations = [];
  }
}

const formatters = new BeautifyFormatters();

async function formatActiveDocument(rangeOnly) {
  const editor = vscode.window.activeTextEditor;
  if (!editor || !editor.document) return;

  const ranges = rangeOnly ?
    editor.selections.filter(selection => !selection.isEmpty).map(selection => extendRange(editor.document, selection)) :
    [];
  const mergedRanges = [];
  for (const range of ranges.sort((a, b) => a.start.compareTo(b.start))) {
    const previous = mergedRanges[mergedRanges.length - 1];
    if (previous && previous.end.isAfterOrEqual(range.start)) {
      mergedRanges[mergedRanges.length - 1] = previous.union(range);
    } else {
      mergedRanges.push(range);
    }
  }
  const finalRanges = mergedRanges.length ? mergedRanges : [fullRange(editor.document)];
  const formatter = formatterForDocument(editor.document, getLanguageConfig(editor.document));
  const edits = await beautifyDocumentRanges(editor.document, finalRanges, formatter, undefined, ranges.length > 0);
  if (!edits.length) return;

  await editor.edit(builder => {
    for (const edit of edits) builder.replace(edit.range, edit.newText);
  });
}

function activate(context) {
  formatters.configure();
  context.subscriptions.push(formatters);
  context.subscriptions.push(vscode.workspace.onDidChangeConfiguration(event => {
    if (event.affectsConfiguration('beautify.language')) formatters.configure();
  }));
  context.subscriptions.push(vscode.commands.registerCommand('beautify-revival.beautifySelection', () => formatActiveDocument(true)));
  context.subscriptions.push(vscode.commands.registerCommand('beautify-revival.beautifyFile', () => formatActiveDocument(false)));
}

function deactivate() {
  formatters.dispose();
}

module.exports = {
  activate,
  deactivate,
  _private: {
    beautifyDocumentRanges,
    extendRange,
    fullRange,
    getWorkspaceRoot,
    shouldIgnore
  }
};
