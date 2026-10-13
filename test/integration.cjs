const vscode = require('vscode');
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '..');
const out = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
if (!out) throw new Error('Run through npm run test:integration');
exports.run = async () => {
  const results = [];
  const test = async (name, fn) => { try { results.push({name, status:'PASS', detail: await fn()}); } catch(e) { results.push({name, status:'FAIL', error:e.stack}); } };
  await test('Extension activation', async () => {
    const ext = vscode.extensions.getExtension('corpdrone-labs.vscode-beautify-revival');
    assert.ok(ext); await ext.activate(); assert.ok(ext.isActive);
    return {vscode:vscode.version,node:process.version};
  });
  await vscode.workspace.getConfiguration('javascript').update('format.enable',false,vscode.ConfigurationTarget.Global);
  await vscode.workspace.getConfiguration('editor').update('defaultFormatter','corpdrone-labs.vscode-beautify-revival',vscode.ConfigurationTarget.Global);
  await new Promise(resolve => setTimeout(resolve, 700));
  const cfg = vscode.workspace.getConfiguration('beautify');
  await cfg.update('config', {indent_size:2,end_with_newline:true}, vscode.ConfigurationTarget.Global);
  const open = async (content) => {
    const doc=await vscode.workspace.openTextDocument({language:'javascript',content});
    return vscode.window.showTextDocument(doc);
  };
  await test('Full-file command', async () => {
    const ed=await open('function x(){return 1}');
    await vscode.commands.executeCommand('beautify-revival.beautifyFile');
    assert.equal(ed.document.getText(),'function x() {\n  return 1\n}\n');
  });
  await test('Document formatting provider', async () => {
    const ed=await open('let a=1;');
    const edits=await vscode.commands.executeCommand('vscode.executeFormatDocumentProvider',ed.document.uri,{tabSize:2,insertSpaces:true});
    assert.ok(edits.length);
    const we=new vscode.WorkspaceEdit(); we.set(ed.document.uri,edits);
    assert.ok(await vscode.workspace.applyEdit(we));
    assert.equal(ed.document.getText(),'let a = 1;\n');
  });
  await test('Selection command with no selection honors final newline', async () => {
    const ed=await open('let a=1;');
    ed.selection=new vscode.Selection(0,0,0,0);
    await vscode.commands.executeCommand('beautify-revival.beautifySelection');
    assert.equal(ed.document.getText(),'let a = 1;\n');
  });
  await test('Multiple disjoint selections on same line', async () => {
    const ed=await open('let a=1;let b=2;');
    ed.selections=[new vscode.Selection(0,0,0,3),new vscode.Selection(0,8,0,11)];
    await vscode.commands.executeCommand('beautify-revival.beautifySelection');
    assert.equal(ed.document.getText(),'let a = 1;\nlet b = 2;');
  });
  await test('Single-extension selector really matches VS Code', async () => {
    const {buildLanguageSelectors}=require(path.join(root,'src/language'));
    const uri=vscode.Uri.file(path.join(out,'fixture.mjs'));
    await vscode.workspace.fs.writeFile(uri,Buffer.from('let a=1;'));
    const doc=await vscode.workspace.openTextDocument(uri);
    const sel=buildLanguageSelectors({js:{ext:['mjs']}}).js;
    assert.ok(vscode.languages.match(sel,doc)>0,JSON.stringify(sel));
  });
  await test('Range provider honors ignore', async () => {
    const uri=vscode.Uri.file(path.join(out,'ignored.js'));
    await vscode.workspace.fs.writeFile(uri,Buffer.from('let a=1;'));
    const doc=await vscode.workspace.openTextDocument(uri);
    await cfg.update('ignore','**/ignored.js',vscode.ConfigurationTarget.Global);
    const edits=await vscode.commands.executeCommand('vscode.executeFormatRangeProvider',doc.uri,new vscode.Range(0,0,0,8),{tabSize:2,insertSpaces:true});
    assert.deepEqual(edits || [],[]);
  });
  await test('JSX command preserves closing tag', async () => {
    const doc=await vscode.workspace.openTextDocument({language:'javascriptreact',content:'const C = () => <div className="a">Hello</div>;'});
    await vscode.window.showTextDocument(doc);
    await vscode.commands.executeCommand('beautify-revival.beautifyFile');
    assert.ok(doc.getText().includes('</div>'),doc.getText());
  });
  await test('Document provider ignores explicitly excluded file', async () => {
    const doc=await vscode.workspace.openTextDocument(vscode.Uri.file(path.join(out,'ignored.js')));
    const edits=await vscode.commands.executeCommand('vscode.executeFormatDocumentProvider',doc.uri,{tabSize:2,insertSpaces:true});
    assert.deepEqual(edits || [],[]);
  });
  for (const language of ['javascriptreact', 'typescriptreact']) {
    for (const markup of [
      '<div className="a">Hello</div>',
      '<><div>{items.map(x => <b>{x}</b>)}</div></>',
      '<Box {...props} value={<Child />} />',
      '<div title={a > b ? "a" : "b"}>{/* hi */x}</div>',
      '<div>{"</div>"}<span>ok</span></div>',
      '<div>{/* </div> */}<span>ok</span></div>'
    ]) {
      await test(`${language} preserves ${markup}`, async () => {
        const doc=await vscode.workspace.openTextDocument({language, content:`const C=()=> ${markup};`});
        const edits=await vscode.commands.executeCommand('vscode.executeFormatDocumentProvider',doc.uri,{tabSize:2,insertSpaces:true});
        const we=new vscode.WorkspaceEdit(); we.set(doc.uri,edits);
        assert.ok(await vscode.workspace.applyEdit(we));
        assert.equal(doc.getText(),`const C = () => ${markup};\n`);
      });
    }
  }
  await test('Non-overlapping selections preserve unselected text', async () => {
    const ed=await open('let a=1;\nlet untouched= 2;\nlet b=3;');
    ed.selections=[new vscode.Selection(2,0,2,3),new vscode.Selection(0,0,0,3)];
    await vscode.commands.executeCommand('beautify-revival.beautifySelection');
    assert.equal(ed.document.getText(),'let a = 1;\nlet untouched= 2;\nlet b = 3;');
  });
  await test('Expanded multiline selections merge in reverse order', async () => {
    const ed=await open('let a=1;\nlet b=2;let c=3;\nlet d=4;\nlet untouched= 5;');
    ed.selections=[new vscode.Selection(1,8,2,4),new vscode.Selection(0,0,1,4)];
    await vscode.commands.executeCommand('beautify-revival.beautifySelection');
    assert.equal(ed.document.getText(),'let a = 1;\nlet b = 2;\nlet c = 3;\nlet d = 4;\nlet untouched= 5;');
  });
  fs.writeFileSync(path.join(out,'host-results.json'),JSON.stringify(results,null,2));
  console.log(JSON.stringify(results,null,2));
  if (results.some(result => result.status === 'FAIL')) throw new Error('Integration tests failed');
};
