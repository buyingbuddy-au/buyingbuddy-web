const base = process.env.AUDIT_BASE || 'http://localhost:3000';
const routes = [
  '/', '/check', '/ppsr', '/pricing', '/deal', '/inspect', '/contract-pack', '/free-kit',
  '/blog', '/contact', '/buddy', '/car-buyers-agent-pullenvale', '/ppi', '/admin', '/admin/login',
  '/privacy', '/terms', '/robots.txt', '/sitemap.xml'
];

function strip(html) { return html.replace(/<script[\s\S]*?<\/script>/gi, '').replace(/<style[\s\S]*?<\/style>/gi, ''); }
function text(html) { return strip(html).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim(); }
function matchOne(re, s) { const m = s.match(re); return m ? m[1].replace(/\s+/g, ' ').trim() : ''; }
function links(html) { return [...html.matchAll(/<a\b[^>]*href=["']([^"']+)["'][^>]*>/gi)].map(m => m[1]); }

async function fetchRoute(path, redirect = 'manual') {
  const res = await fetch(new URL(path, base), { redirect });
  const body = await res.text();
  return { path, status: res.status, redirected: res.redirected, location: res.headers.get('location'), finalUrl: res.url, contentType: res.headers.get('content-type') || '', body };
}

const pageResults = [];
const internalLinks = new Set();
for (const route of routes) {
  const manual = await fetchRoute(route, 'manual').catch(e => ({ path: route, error: String(e) }));
  const followed = await fetchRoute(route, 'follow').catch(e => ({ path: route, error: String(e) }));
  const html = followed.body || '';
  if (html.includes('<a')) {
    for (const href of links(html)) {
      if (href.startsWith('/')) internalLinks.add(href.split('#')[0].split('?')[0] || '/');
    }
  }
  pageResults.push({
    route,
    manualStatus: manual.status,
    manualLocation: manual.location,
    finalStatus: followed.status,
    finalUrl: followed.finalUrl,
    title: matchOne(/<title[^>]*>([\s\S]*?)<\/title>/i, html),
    h1: matchOne(/<h1[^>]*>([\s\S]*?)<\/h1>/i, html).replace(/<[^>]+>/g, ' '),
    forms: (html.match(/<form\b/gi) || []).length,
    links: links(html).length,
  });
}

const linkChecks = [];
for (const href of [...internalLinks].sort()) {
  if (href.startsWith('/api/')) continue;
  const res = await fetch(new URL(href, base), { redirect: 'manual' }).catch(e => null);
  linkChecks.push({ href, status: res?.status ?? 'ERR', location: res?.headers?.get('location') ?? '' });
}

const apiTests = [];
async function post(path, payload) {
  const res = await fetch(new URL(path, base), { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(payload) });
  const contentType = res.headers.get('content-type') || '';
  let body;
  if (contentType.includes('application/json')) body = await res.json(); else body = (await res.text()).slice(0, 200);
  apiTests.push({ path, status: res.status, body });
}
await post('/api/check', {});
await post('/api/check', { make: 'Toyota', model: 'Yaris', year: 2019, rego: '123ABC', asking_price: 24500 });
await post('/api/check', { make: 'Toyota', model: 'Corolla', year: 2018, rego: '123XYZ', asking_price: 18000 });
await post('/api/stripe/checkout', { product: 'ppsr', email: 'bad', vehicle_identifier: '123ABC' });
await post('/api/stripe/checkout', { product: 'ppsr', email: 'audit@example.com' });
await post('/api/stripe/checkout', { product: 'deal_room', email: 'audit@example.com', listing_url: '' });
await post('/api/deal/create', {});
await post('/api/docs/download', { email: 'bad' });

console.log(JSON.stringify({ base, pageResults, linkChecks, apiTests }, null, 2));
