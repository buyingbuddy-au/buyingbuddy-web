# Live Drift Check Runbook

**Status:** ACTIVE  
**Owner:** Jordan Lansbury  

Use this after deploy and whenever the live site feels wrong.

## Route Status Check

Run:

```powershell
$routes = @("/", "/check", "/ppsr", "/pricing", "/deal", "/buddy", "/ppi", "/car-buyers-agent-pullenvale", "/sitemap.xml", "/robots.txt")
foreach ($route in $routes) {
  $url = "https://buyingbuddy.com.au$route"
  $status = curl.exe -I -L $url 2>$null | Select-String -Pattern "HTTP/"
  Write-Output "$route"
  Write-Output $status
}
```

Expected:

- Primary routes return 200 after redirects.
- `/buddy` ends at `/check`.
- `/ppi` ends at `/inspect`.
- `/car-buyers-agent-pullenvale` ends at `/`.

## Copy Drift Scan

Run:

```powershell
$routes = @("/", "/pricing", "/ppsr", "/check", "/deal", "/sitemap.xml")
$terms = @("997", "Pullenvale", "concierge", "we find", "we negotiate", "full-service buyer", "/buddy", "/ppi", "car-buyers-agent-pullenvale")
foreach ($route in $routes) {
  $body = curl.exe -L "https://buyingbuddy.com.au$route"
  foreach ($term in $terms) {
    $count = ([regex]::Matches(($body -join "`n"), [regex]::Escape($term), "IgnoreCase")).Count
    if ($count -gt 0) {
      Write-Output "$route`t$term`t$count"
    }
  }
}
```

Expected:

- No stale public sales copy for $997, concierge, sourcing, or full-service buyer-agent work.
- Sitemap does not list redirected off-scope routes.
- Mentions of buyer-agent language are generic comparison language only.

## Manual Page Checks

Open and inspect:

- `https://buyingbuddy.com.au/`
- `https://buyingbuddy.com.au/pricing`
- `https://buyingbuddy.com.au/ppsr`
- `https://buyingbuddy.com.au/check`

Required:

- Homepage promise is self-serve buyer-side help.
- Primary CTA is Free Listing Check or equivalent.
- PPSR price is $4.95.
- Deal Pack price is $9.99.
- No public $997 or concierge pitch.
