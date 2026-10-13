const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const {
  dropJsonComments,
  mergeBeautifyOptions,
  applyEditorConfig,
  findUp,
  resolveBeautifyOptions
} = require('../src/options');

const makeTempProject = () => fs.mkdtempSync(path.join(os.tmpdir(), 'beautify-revival-'));

describe('options', () => {
  it('drops line and block comments without changing comment-like text inside strings', () => {
    const input = '{\n // comment\n "url": "https://example.test/a//b",\n /* block */\n "pattern": "/* not a comment */"\n}';
    assert.equal(JSON.parse(dropJsonComments(input)).url, 'https://example.test/a//b');
    assert.equal(JSON.parse(dropJsonComments(input)).pattern, '/* not a comment */');
  });

  it('merges base .jsbeautifyrc options with formatter-specific overrides', () => {
    const actual = mergeBeautifyOptions({
      indent_size: 4,
      indent_char: ' ',
      css: { indent_size: 2 },
      js: { space_in_empty_paren: true },
      html: { wrap_line_length: 120 }
    }, 'css');

    assert.deepEqual(actual, {
      indent_size: 2,
      indent_char: ' '
    });
  });

  it('applies supported editorconfig keys to js-beautify options', () => {
    const options = {};
    applyEditorConfig(options, {
      indent_style: 'tab',
      indent_size: 'tab',
      max_line_length: 'off',
      insert_final_newline: true,
      end_of_line: 'crlf'
    });

    assert.deepEqual(options, {
      indent_with_tabs: true,
      indent_char: '\t',
      wrap_line_length: 0,
      end_with_newline: true,
      eol: '\r\n'
    });
  });

  it('finds a .jsbeautifyrc up to but not past the workspace root', () => {
    const root = makeTempProject();
    const nested = path.join(root, 'src', 'deep');
    fs.mkdirSync(nested, { recursive: true });
    fs.writeFileSync(path.join(root, '.jsbeautifyrc'), '{"indent_size": 3}');

    assert.equal(findUp(nested, '.jsbeautifyrc', root), path.join(root, '.jsbeautifyrc'));
    assert.equal(findUp(path.dirname(root), '.jsbeautifyrc', root), null);
  });

  it('prefers nearest .jsbeautifyrc over inline VS Code beautify.config', async () => {
    const root = makeTempProject();
    const file = path.join(root, 'src', 'sample.js');
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, 'function x(){return 1}');
    fs.writeFileSync(path.join(root, '.jsbeautifyrc'), '{"indent_size": 3, "js": {"space_in_empty_paren": true}}');

    const actual = await resolveBeautifyOptions({
      fileName: file,
      workspaceRoot: root,
      formatter: 'js',
      editorOptions: { insertSpaces: true, tabSize: 8 },
      vscodeConfig: {
        files: { insertFinalNewLine: false, eol: '\n' },
        javascript: { format: {} },
        html: { format: {} },
        beautify: { config: { indent_size: 9 } }
      }
    });

    assert.equal(actual.indent_size, 3);
    assert.equal(actual.space_in_empty_paren, true);
  });
});
