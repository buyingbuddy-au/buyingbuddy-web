import { spawn } from 'node:child_process';
import { setTimeout as wait } from 'node:timers/promises';

const chromePath = process.env.CHROME_PATH || 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const port = 9333;
const base = 'http://localhost:3000';
const userDataDir = 'C:\\Users\\jrl-j\\.openclaw\\workspace\\chrome-cdp-audit';

const chrome = spawn(chromePath, [
  '--headless=new', '--disable-gpu', `--remote-debugging-port=${port}`,
  `--user-data-dir=${userDataDir}`, '--window-size=1280,1400', 'about:blank'
], { stdio: 'ignore' });

async function getJson(url, tries = 40) {
  for (let i=0; i<tries; i++) {
    try { const r = await fetch(url); if (r.ok) return await r.json(); } catch {}
    await wait(250);
  }
  throw new Error(`Could not fetch ${url}`);
}

for (let i = 0; i < 20; i++) {
  try { await fetch(`http://127.0.0.1:${port}/json/new?about:blank`, { method: 'PUT' }); break; } catch { await wait(250); }
}
const targets = await getJson(`http://127.0.0.1:${port}/json/list`);
const pageTarget = targets.find(t => t.type === 'page') || targets[0];
const ws = new WebSocket(pageTarget.webSocketDebuggerUrl);
let seq = 0;
const pending = new Map();
const events = [];
ws.addEventListener('message', ev => {
  const msg = JSON.parse(ev.data);
  if (msg.id && pending.has(msg.id)) { pending.get(msg.id)(msg); pending.delete(msg.id); }
  else if (msg.method) events.push(msg);
});
await new Promise(resolve => ws.addEventListener('open', resolve, { once: true }));
function send(method, params = {}) {
  const id = ++seq;
  ws.send(JSON.stringify({ id, method, params }));
  return new Promise(resolve => pending.set(id, resolve));
}
async function evalJs(expression) {
  const wrapped = `JSON.stringify((${expression}))`;
  const res = await send('Runtime.evaluate', { expression: wrapped, awaitPromise: true, returnByValue: true });
  if (res.result?.exceptionDetails) return { exception: res.result.exceptionDetails.text };
  const value = res.result?.result?.value;
  try { return JSON.parse(value); } catch { return value; }
}
async function navigate(url) {
  await send('Page.navigate', { url });
  await wait(900);
  return await evalJs(`({url: location.href, title: document.title, h1: document.querySelector('h1')?.innerText || '', text: document.body.innerText.slice(0,1000)})`);
}
async function clickByText(text) {
  return await evalJs(`(() => {
    const els = [...document.querySelectorAll('a,button')];
    const el = els.find(e => e.innerText && e.innerText.trim().includes(${JSON.stringify(text)}));
    if (!el) return {ok:false, error:'not found', available: els.map(e=>e.innerText.trim()).filter(Boolean).slice(0,20)};
    el.click();
    return {ok:true, tag: el.tagName, text: el.innerText.trim(), href: el.href || ''};
  })()`);
}
async function fillInput(labelText, value) {
  return await evalJs(`(() => {
    const labels = [...document.querySelectorAll('label')];
    let input = null;
    for (const label of labels) {
      if (label.innerText.toLowerCase().includes(${JSON.stringify(labelText.toLowerCase())})) {
        input = label.querySelector('input,textarea'); break;
      }
    }
    if (!input) input = [...document.querySelectorAll('input,textarea')].find(i => (i.placeholder||'').toLowerCase().includes(${JSON.stringify(labelText.toLowerCase())}));
    if (!input) return {ok:false, error:'input not found'};
    input.focus(); input.value = ${JSON.stringify(value)};
    input.dispatchEvent(new Event('input', { bubbles:true }));
    input.dispatchEvent(new Event('change', { bubbles:true }));
    return {ok:true, name:input.name, placeholder:input.placeholder, value:input.value};
  })()`);
}

await send('Page.enable');
await send('Runtime.enable');
const checks = [];
checks.push({ step:'home', state: await navigate(`${base}/`) });
checks.push({ step:'click home Run a free check', click: await clickByText('Run a free check') });
await wait(800); checks.push({ step:'after free check click', state: await evalJs(`({url:location.href,h1:document.querySelector('h1')?.innerText||''})`) });
checks.push({ step:'pricing', state: await navigate(`${base}/pricing`) });
checks.push({ step:'click pricing Run PPSR Check', click: await clickByText('Run PPSR Check') });
await wait(800); checks.push({ step:'after ppsr click', state: await evalJs(`({url:location.href,h1:document.querySelector('h1')?.innerText||''})`) });
checks.push({ step:'contact direct', state: await navigate(`${base}/contact`) });
checks.push({ step:'ppsr form empty submit', state: await navigate(`${base}/ppsr`), click: await clickByText('Get PPSR Report') });
await wait(500); checks.push({ step:'ppsr after empty submit', state: await evalJs(`({url:location.href, text:document.body.innerText.slice(0,1600)})`) });
checks.push({ step:'deal page', state: await navigate(`${base}/deal`) });
checks.push({ step:'free kit page', state: await navigate(`${base}/free-kit`) });
checks.push({ step:'admin direct', state: await navigate(`${base}/admin`) });

console.log(JSON.stringify({ checks }, null, 2));
ws.close();
chrome.kill();
