const base = process.env.BASE_URL || 'http://localhost:3000';
const regos = process.argv.slice(2);
const inputs = regos.length ? regos : ['091FC5','301JQ4','960AQ6','BAD!!','ZZZZZZ'];

for (const rego of inputs) {
  const started = Date.now();
  const res = await fetch(`${base}/api/rego/check`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ rego, state: 'QLD' }),
  });
  const json = await res.json();
  console.log(JSON.stringify({
    rego,
    httpStatus: res.status,
    ms: Date.now() - started,
    ok: json.ok,
    status: json.status,
    classification: json.classification,
    purpose: json.data?.purpose,
    regoOut: json.data?.rego,
    message: json.userMessage,
    cached: json.cached,
  }));
  await new Promise((resolve) => setTimeout(resolve, 1200));
}
