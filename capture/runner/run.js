const v=require('vscode'),fs=require('fs'),path=require('path'),cp=require('child_process');
exports.activate=()=>{setTimeout(()=>run().catch(e=>console.error(e)),100)};
async function run(){
const P=v.workspace.workspaceFolders?.[0]?.uri.fsPath;if(!P)return;
const L=path.dirname(P),n=L.slice(-2),T=path.resolve(__dirname,'..'),log=s=>fs.appendFileSync(T+'/log'+n,JSON.stringify(s)+'\n');
const pause=ms=>new Promise(r=>setTimeout(r,ms)),cmd=(c,...a)=>v.commands.executeCommand(c,...a),file=f=>path.join(P,f);
const open=async(f,line=0,col=0)=>{let d=await v.workspace.openTextDocument(v.Uri.file(file(f)));let e=await v.window.showTextDocument(d,{preview:false});const p=new v.Position(line,col);e.selection=new v.Selection(p,p);e.revealRange(new v.Range(p,p),v.TextEditorRevealType.InCenterIfOutsideViewport);return e};
const diag=f=>v.languages.getDiagnostics(v.Uri.file(file(f))).map(d=>[d.range.start.line+1,d.range.start.character+1,d.source,d.message]);
const mode=async(m)=>{await v.workspace.getConfiguration('python.analysis').update('typeCheckingMode',m,v.ConfigurationTarget.Workspace);await pause(2500)};
const write=async(f,t)=>{const uri=v.Uri.file(file(f)),doc=v.workspace.textDocuments.find(d=>d.uri.toString()===uri.toString());if(doc){const edit=new v.WorkspaceEdit();edit.replace(uri,new v.Range(doc.positionAt(0),doc.positionAt(doc.getText().length)),t);await v.workspace.applyEdit(edit);await doc.save()}else{await v.workspace.fs.writeFile(uri,Buffer.from(t))}await pause(600)};
const shot=async(name)=>{await pause(750);const dest=path.join(L,'img',name+'.png');cp.execFileSync(file('.venv/bin/python'),[path.join(T,'screenshot.py'),dest],{timeout:15000});log(name)};
const panel=async()=>{await cmd('workbench.action.closePanel');await pause(300)};
const sidebar=async()=>{await cmd('workbench.action.closeSidebar');await pause(200)};
let term;
const terminal=async(command,name,delay=3600)=>{if(!term)term=v.window.createTerminal({name:'Python',cwd:P});term.show();await pause(700);term.sendText('clear');term.sendText(command);await pause(delay);if(name)await shot(name)};
const extensions=async(name)=>{await cmd('workbench.extensions.search','@installed');await pause(1400);await shot(name);await sidebar()};
const hover=async(f,l,c,name)=>{await open(f,l,c);await cmd('editor.action.showHover');await pause(1100);await shot(name);await cmd('workbench.action.focusActiveEditorGroup');await cmd('hideSuggestWidget').catch(()=>{})};
const logDiags=async(f)=>{await pause(1800);log({[f]:diag(f)});return diag(f)};
const probe2='from app.utils.formatter import format_kopeks, format_title\n\ntitle = format_title(40)\namount = format_kopeks("1250")\n';
const probe3=probe2.replace('\n\n','\nfrom app.ui.console import print_report\n\n')+'print_report("Итог")\n';
try{if(n==='05'){
await v.workspace.getConfiguration('ruff').update('enable',false,v.ConfigurationTarget.Global);await cmd('notifications.clearAll');const py=await v.extensions.getExtension('ms-python.python').activate();await py.environments.updateActiveEnvironmentPath(file('.venv/bin/python'),v.workspace.workspaceFolders[0].uri);await pause(1000);
await extensions('py-01-extensions');await open('.vscode/settings.json');await shot('py-02-settings');
await write('proba.py',probe2);await open('proba.py');await pause(6500);await logDiags('proba.py');await shot('py-03-squiggle');await hover('proba.py',2,22,'py-04-hover');await open('proba.py');await cmd('workbench.actions.view.problems');await shot('py-05-problems');await panel();
await terminal('.venv/bin/python -m mypy proba.py','py-06-mypy-errors');await write('proba.py',probe2.replace('title(40)','title("Смена")').replace('kopeks("1250")','kopeks(1250)'));await terminal('.venv/bin/python -m mypy proba.py');await terminal('.venv/bin/python -m mypy app && .venv/bin/python -m pytest -q && .venv/bin/python main.py','py-07-final');await panel();

}
if(n==='06'){
await cmd('notifications.clearAll');
const py=await v.extensions.getExtension('ms-python.python').activate();
await py.environments.updateActiveEnvironmentPath(file('.venv/bin/python'),v.workspace.workspaceFolders[0].uri);
await sidebar();await panel();await mode('off');await write('proba.py',probe2);await open('proba.py');await pause(5000);await shot('06-01-off');
await mode('basic');await open('.vscode/settings.json');await shot('06-02-settings');await open('proba.py');await logDiags('proba.py');await shot('06-03-squiggle');await hover('proba.py',2,22,'06-04-hover');await write('proba.py',probe3);await open('proba.py');await logDiags('proba.py');await cmd('workbench.actions.view.problems');await shot('06-05-problems');
await panel();await cmd('workbench.action.closeAllEditors');await write('rezhimy.py',fs.readFileSync(path.join(L,'rezhimy.py'),'utf8'));await open('rezhimy.py');for(const m of ['off','basic','standard','strict']){await mode(m);log({mode:m,items:v.languages.getDiagnostics(v.Uri.file(file('rezhimy.py'))).filter(x=>x.severity!==3).map(x=>x.message)})}await cmd('workbench.actions.view.problems');await shot('06-06-strict');await mode('basic');await panel();await cmd('workbench.action.closeAllEditors');
await open('proba.py');await terminal('.venv/bin/python -m mypy --version && .venv/bin/python -m mypy proba.py','06-07-mypy-errors',5500);
await write('proba.py',probe3.replace('title(40)','title("Итог")').replace('kopeks("1250")','kopeks(1250)').replace('report("Итог")','report(["Итог"])'));await terminal('.venv/bin/python -m mypy proba.py && .venv/bin/python -m mypy app','06-08-mypy-success');
await terminal('.venv/bin/python -m mypy ../../materials/tema-04-annotacii-tipov/otchet-kafe-bez-tipov/app','06-09-bez-tipov');
await write('proba.py','from app.services.calculator import grade_bounds\n\nbounds = grade_bounds([5, 3, 4])\nreveal_type(bounds)\n');await terminal('.venv/bin/python -m mypy proba.py');await hover('proba.py',2,3,'06-10-tip');

}
if(n==='07'){
await cmd('notifications.clearAll');const py=await v.extensions.getExtension('ms-python.python').activate();await py.environments.updateActiveEnvironmentPath(file('.venv/bin/python'),v.workspace.workspaceFolders[0].uri);await pause(1000);
const orders='app/services/orders.py',imp='app/services/importer.py',docs=JSON.parse(fs.readFileSync(T+'/docs.json')),orig=fs.readFileSync(file(orders),'utf8'),origImp=fs.readFileSync(file(imp),'utf8');
const inject=(s,name,doc)=>s.replace(new RegExp('(^def '+name+'[^\\n]+\\n)','m'),m=>m+('"""'+doc+'\n"""').split('\n').map(l=>l?'    '+l:'').join('\n')+'\n');
await extensions('07-01-extensions');await open('.vscode/settings.json');await shot('07-02-settings');
let s=orig.replace(/(def revenue_by_waiter[^\n]+\n)/,'$1    \n');await write(orders,s);let line=s.split('\n').findIndex(l=>l.startsWith('def revenue_by_waiter'))+1;
await open(orders,line,4);cmd('autoDocstring.generateDocstring').catch(e=>log(e.message));await pause(2000);await shot('07-03-zagotovka');
cmd('leaveSnippet').catch(()=>{});await pause(300);await v.window.activeTextEditor.document.save();s=inject(orig,'revenue_by_waiter',docs.revenue);await write(orders,s);await open(orders,line+4);await shot('07-04-zapolneno');
let withDsg=s.replace(/(def load_orders[^\n]+\n)/,'$1    dsg\n');await write(orders,withDsg);line=withDsg.split('\n').findIndex(l=>l.includes('    dsg'));await open(orders,line,7);cmd('editor.action.triggerSuggest').catch(e=>log(e.message));await pause(1200);await shot('07-05-snippet');cmd('acceptSelectedSuggestion').catch(e=>log(e.message));await pause(600);cmd('leaveSnippet').catch(()=>{});await pause(300);await v.window.activeTextEditor.document.save();
s=inject(s,'load_orders',docs.load);await write(orders,s);await terminal('.venv/bin/python -m ruff check app --output-format=concise','07-06-ruff-app');await panel();await open(imp);await logDiags(imp);await cmd('workbench.actions.view.problems');await shot('07-07-problems');await panel();
s='"""Загрузка, сортировка заказов и расчёт выручки."""\n\n'+inject(s,'sort_orders_in_place',docs.sort);await write(orders,s);await open(orders);await terminal('.venv/bin/python -m ruff check app/services/orders.py','07-08-orders');
await write(orders,s.split('\n').filter(l=>!l.includes('top: Сколько')).join('\n'));await terminal('.venv/bin/python -m ruff check app/services/orders.py','07-09-d417');await write(orders,s);
await write(imp,'"""Построчное чтение данных смены из CSV."""\n\n'+inject(origImp,'read_rows',docs.read));await open(imp);await terminal('.venv/bin/python -m ruff check app/services/importer.py && .venv/bin/python -m ruff check app --output-format=concise','07-10-variant');await panel();

}
fs.writeFileSync(path.join(T,'finished'),'ok')}catch(e){log(e.stack);fs.writeFileSync(path.join(T,'failed'),e.stack)}
};
