const assert = require('node:assert/strict');
const { beautifyText, normalizeFormatter } = require('../src/formatting');

describe('formatting', () => {
  it('formats JavaScript with js-beautify 2.x', () => {
    assert.equal(
      beautifyText('js', 'function x(){return 1}', { indent_size: 2 }),
      'function x() {\n  return 1\n}'
    );
  });

  it('formats CSS with js-beautify 2.x', () => {
    assert.equal(
      beautifyText('css', '.a{color:red}', { indent_size: 2 }),
      '.a {\n  color: red\n}'
    );
  });

  it('formats HTML with js-beautify 2.x', () => {
    assert.equal(
      beautifyText('html', '<div><span>x</span></div>', { indent_size: 2 }),
      '<div><span>x</span></div>'
    );
  });

  for (const languageId of ['javascriptreact', 'typescriptreact']) {
    describe(languageId, () => {
      it('preserves JSX through the extension document-formatting entry point', async () => {
        const Module = require('node:module');
        const originalLoad = Module._load;
        const extensionPath = require.resolve('../src/extension');
        let extension;
        try {
          Module._load = function(request, parent, isMain) {
            if (request === 'vscode') return {
              workspace: { getConfiguration: () => ({ get: () => undefined }) },
              TextEdit: { replace: (range, newText) => ({ range, newText }) }
            };
            if (request === './options' && parent.filename === extensionPath) return {
              resolveBeautifyOptions: async () => ({ indent_size: 2 })
            };
            return originalLoad.call(this, request, parent, isMain);
          };
          delete require.cache[extensionPath];
          extension = require(extensionPath);
        } finally {
          Module._load = originalLoad;
          delete require.cache[extensionPath];
        }
        const input = 'const C=()=> <div>{"</div>"}{/* </div> */}<span>ok</span></div>;';
        const document = { languageId, isUntitled: true, getText: () => input };
        const [edit] = await extension._private.beautifyDocumentRanges(document, [{}], 'js', { tabSize: 2 }, false);
        assert.equal(edit.newText, 'const C = () => <div>{"</div>"}{/* </div> */}<span>ok</span></div>;');
      });

      it('leaves input unchanged when formatting changes automatic semicolon insertion', () => {
        const input = 'const C=()=> <X/>;\nfunction f(){return\n{x:1}}';
        assert.equal(beautifyText('js', input, {}, languageId), input);
      });

      it('preserves fragments and nested JSX expressions exactly', () => {
        const jsx = '<> hello  {items.map(x=><span title={"</span>"}>{x}</span>)}\n{ok ? <A/> : <B/>}</>';
        assert.equal(
          beautifyText('js', `const C=()=> ${jsx};`, { indent_size: 2 }, languageId),
          `const C = () => ${jsx};`
        );
      });

      it('restores multiple outer JSX expressions without placeholder collisions', () => {
        const input = 'const __BEAUTIFY_JSX_0__=1;const C=[<A value="___BEAUTIFY_JSX_0__"/>,<B>{"$& $` $\\\'"}</B>];';
        const output = beautifyText('js', input, {}, languageId);
        assert.ok(output.includes('const __BEAUTIFY_JSX_0__ = 1;'));
        assert.ok(output.includes('<A value="___BEAUTIFY_JSX_0__"/>'));
        assert.ok(output.includes('<B>{"$& $` $\\\'"}</B>'));
        assert.equal(output.includes('____BEAUTIFY_JSX_'), false);
      });

      for (const input of [
        'const C=()=> <div>{value}</span>;',
        'const C=()=> <div>{value}',
        '  </div>;',
        'return <div/>;',
        'const = <div/>;'
      ]) {
        it(`leaves invalid or partial input unchanged: ${JSON.stringify(input)}`, () => {
          assert.equal(beautifyText('js', input, {}, languageId), input);
        });
      }

      for (const [name, jsx] of [
        ['strings containing closing tags', '<div>{"</div>"}<span>ok</span></div>'],
        ['comments containing closing tags', '<div>{/* </div> */}<span>ok</span></div>']
      ]) {
        it(`preserves ${name} while formatting surrounding JavaScript`, () => {
          assert.equal(
            beautifyText('js', `const C=()=> ${jsx};`, { indent_size: 2, e4x: true }, languageId),
            `const C = () => ${jsx};`
          );
        });
      }
    });
  }

  it('normalizes formatter aliases', () => {
    assert.equal(normalizeFormatter('javascript'), 'js');
    assert.equal(normalizeFormatter('jsonc'), 'js');
    assert.equal(normalizeFormatter('scss'), 'css');
    assert.equal(normalizeFormatter('htm'), 'html');
  });
});
