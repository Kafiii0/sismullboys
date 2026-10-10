import { NextResponse } from 'next/server';
import dns from 'dns/promises';

function isPrivateIp(ip) {
  if (!ip) return false;
  return (
    ip.startsWith('10.') || ip.startsWith('127.') || ip.startsWith('192.168.') ||
    ip.startsWith('169.254.') || /^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(ip) ||
    ip === '::1' || ip === '0.0.0.0'
  );
}

function sanitizeDomain(input) {
  if (!input || typeof input !== 'string') return null;
  let domain = input.trim().toLowerCase().replace(/^https?:\/\//i, '').replace(/\/.*$/, '').replace(/:\d+$/, '');
  const re = /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
  return (re.test(domain) && domain.length <= 253) ? domain : null;
}

async function fetchSafe(url, opts = {}, timeoutMs = 4000) {
  const ac = new AbortController();
  const tid = setTimeout(() => ac.abort(), timeoutMs);
  try {
    const res = await fetch(url, { ...opts, signal: ac.signal, redirect: opts.redirect || 'follow' });
    clearTimeout(tid);
    return res;
  } catch { clearTimeout(tid); return null; }
}

function extractVersion(str) {
  if (!str) return null;
  const m = str.match(/\/?(\d+\.\d+(?:\.\d+)?(?:\.\d+)?)/);
  return m ? m[1] : null;
}

function cmpVer(a, b) {
  const pa = a.split('.').map(Number), pb = b.split('.').map(Number);
  for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
    if ((pa[i]||0) > (pb[i]||0)) return 1;
    if ((pa[i]||0) < (pb[i]||0)) return -1;
  }
  return 0;
}

function inRange(ver, min, max) {
  return cmpVer(ver, min) >= 0 && cmpVer(ver, max) <= 0;
}

const CVE_DB = {
  nginx: [
    { cve:'CVE-2022-41741', title:'Nginx MP4 Module Memory Corruption', cvss:7.8, severity:'HIGH',
      range:{min:'1.1.3',max:'1.23.1'}, fixed:'1.23.2',
      impact:'Worker process memory corruption via crafted mp4 leading to DoS or potential RCE.',
      remediation:'Upgrade Nginx to 1.23.2+ or disable ngx_http_mp4_module.' },
    { cve:'CVE-2021-23017', title:'Nginx DNS Resolver 1-Byte Overwrite', cvss:7.7, severity:'HIGH',
      range:{min:'0.6.18',max:'1.20.0'}, fixed:'1.20.1',
      impact:'Off-by-one in DNS response processing causing heap corruption and potential RCE.',
      remediation:'Upgrade to Nginx 1.20.1+ or 1.21.0+.' },
    { cve:'CVE-2019-9511', title:'Nginx HTTP/2 Data Dribble DoS', cvss:7.5, severity:'HIGH',
      range:{min:'1.9.5',max:'1.17.2'}, fixed:'1.17.3',
      impact:'Manipulated HTTP/2 window size causes excessive CPU consumption leading to denial of service.',
      remediation:'Upgrade to Nginx 1.17.3+ and limit http2_max_concurrent_streams.' },
    { cve:'CVE-2024-7347', title:'Nginx MP4 Module Buffer Overread', cvss:4.7, severity:'MEDIUM',
      range:{min:'1.5.13',max:'1.27.0'}, fixed:'1.27.1',
      impact:'Specially crafted mp4 file causes worker process crash (DoS).',
      remediation:'Upgrade to Nginx 1.27.1+ or 1.26.2+.' },
  ],
  apache: [
    { cve:'CVE-2021-41773', title:'Apache Path Traversal & RCE', cvss:9.8, severity:'CRITICAL',
      range:{min:'2.4.49',max:'2.4.50'}, fixed:'2.4.51',
      impact:'Path normalization flaw allows arbitrary file read and CGI RCE on default configurations.',
      remediation:'Immediately upgrade to Apache 2.4.51+.' },
    { cve:'CVE-2022-22720', title:'Apache HTTP Request Smuggling', cvss:9.8, severity:'CRITICAL',
      range:{min:'2.4.0',max:'2.4.52'}, fixed:'2.4.53',
      impact:'Inconsistent request body interpretation enables request smuggling and security bypass.',
      remediation:'Update to Apache 2.4.53+ and configure LimitXMLRequestBody.' },
    { cve:'CVE-2023-25690', title:'Apache mod_proxy HTTP Request Splitting', cvss:9.8, severity:'CRITICAL',
      range:{min:'2.4.0',max:'2.4.55'}, fixed:'2.4.56',
      impact:'RewriteRule with mod_proxy enabled allows request splitting for access control bypass.',
      remediation:'Upgrade to Apache 2.4.56+ immediately.' },
    { cve:'CVE-2023-43622', title:'Apache HTTP/2 CONTINUATION DoS', cvss:7.5, severity:'HIGH',
      range:{min:'2.4.55',max:'2.4.57'}, fixed:'2.4.58',
      impact:'HTTP/2 CONTINUATION frames without END_HEADERS cause memory exhaustion.',
      remediation:'Upgrade to Apache 2.4.58+.' },
  ],
  php: [
    { cve:'CVE-2024-4577', title:'PHP CGI Argument Injection RCE', cvss:9.8, severity:'CRITICAL',
      range:{min:'8.1.0',max:'8.3.7'}, fixed:'8.3.8',
      impact:'Best-Fit encoding bypass on Windows CGI exposes unauthenticated RCE.',
      remediation:'Upgrade PHP to 8.1.29, 8.2.20, or 8.3.8+ and migrate to FastCGI.' },
    { cve:'CVE-2023-3824', title:'PHP PHAR Buffer Overflow', cvss:9.8, severity:'CRITICAL',
      range:{min:'8.0.0',max:'8.2.8'}, fixed:'8.2.9',
      impact:'Buffer overflow in phar_dir_read() enables memory corruption via crafted PHAR archives.',
      remediation:'Patch PHP to 8.0.30, 8.1.22, or 8.2.9+.' },
    { cve:'CVE-2022-31626', title:'PHP MySQL Password Buffer Overflow', cvss:8.8, severity:'HIGH',
      range:{min:'7.4.0',max:'8.1.7'}, fixed:'8.1.8',
      impact:'Overly long MySQL password triggers buffer overflow in mysqlnd extension.',
      remediation:'Upgrade PHP to 8.1.8+ or 8.0.21+.' },
  ],
  wordpress: [
    { cve:'CVE-2023-2732', title:'WordPress Core Unauthenticated Blind SSRF', cvss:7.2, severity:'HIGH',
      range:{min:'4.0',max:'6.2.1'}, fixed:'6.2.2',
      impact:'Pingback parsing allows attackers to probe internal network services.',
      remediation:'Ensure WordPress is on version 6.2.2+.' },
    { cve:'CVE-2023-22622', title:'WordPress Unauthenticated Stored XSS', cvss:6.1, severity:'MEDIUM',
      range:{min:'5.9',max:'6.1.0'}, fixed:'6.1.1',
      impact:'Insufficient sanitization of widget blocks allows persistent XSS injection.',
      remediation:'Update WordPress to 6.1.1+.' },
    { cve:'CVE-2024-31210', title:'WordPress Plugin Upload Privilege Escalation', cvss:8.8, severity:'HIGH',
      range:{min:'6.0',max:'6.4.3'}, fixed:'6.4.4',
      impact:'Admin users on multisites can install arbitrary plugins leading to RCE.',
      remediation:'Update WordPress to 6.4.4+.' },
  ],
  nextjs: [
    { cve:'CVE-2024-34351', title:'Next.js Server Actions SSRF', cvss:7.5, severity:'HIGH',
      range:{min:'13.4.0',max:'14.1.0'}, fixed:'14.1.1',
      impact:'Host header manipulation in Server Actions enables internal network resource disclosure.',
      remediation:'Upgrade Next.js to 14.1.1+.' },
    { cve:'CVE-2024-46982', title:'Next.js Cache Poisoning via Craft Headers', cvss:7.5, severity:'HIGH',
      range:{min:'13.5.1',max:'14.2.9'}, fixed:'14.2.10',
      impact:'Crafted request headers poison the ISR/Data Cache leading to denial of service.',
      remediation:'Upgrade Next.js to 14.2.10+.' },
  ],
  iis: [
    { cve:'CVE-2021-31166', title:'HTTP.sys Remote Code Execution', cvss:9.8, severity:'CRITICAL',
      range:{min:'10.0',max:'10.0'}, fixed:'Patch',
      impact:'Unauthenticated crafted packet to HTTP.sys yields kernel-level code execution.',
      remediation:'Apply Microsoft Security Update KB5003173 immediately.' },
    { cve:'CVE-2022-21907', title:'HTTP Protocol Stack RCE', cvss:9.8, severity:'CRITICAL',
      range:{min:'10.0',max:'10.0'}, fixed:'Patch',
      impact:'Wormable vulnerability in HTTP protocol stack allowing unauthenticated RCE.',
      remediation:'Apply January 2022 Cumulative Update for Windows Server.' },
  ],
  django: [
    { cve:'CVE-2024-38875', title:'Django urlize() ReDoS', cvss:7.5, severity:'HIGH',
      range:{min:'4.2.0',max:'5.0.6'}, fixed:'5.0.7',
      impact:'Catastrophic backtracking in urlize parser triggers CPU exhaustion DoS.',
      remediation:'Update Django to 4.2.14 or 5.0.7+.' },
    { cve:'CVE-2024-39329', title:'Django Password Hasher Enumeration', cvss:5.3, severity:'MEDIUM',
      range:{min:'4.2.0',max:'5.0.6'}, fixed:'5.0.7',
      impact:'Timing-based user enumeration through login response latency side-channel.',
      remediation:'Update Django to 5.0.7+.' },
  ],
  cloudflare: [
    { cve:'ADV-CF-ORIGIN', title:'Origin IP Bypass via DNS History', cvss:7.5, severity:'HIGH',
      range:null, fixed:null,
      impact:'Direct access to origin bypasses WAF, DDoS protection, and rate limiting.',
      remediation:'Enforce Cloudflare Authenticated Origin Pulls (mTLS) and whitelist CF IP ranges.' },
  ],
  laravel: [
    { cve:'CVE-2024-29291', title:'Laravel Deserialization RCE', cvss:9.8, severity:'CRITICAL',
      range:{min:'10.0',max:'11.1'}, fixed:'11.2',
      impact:'Unsafe deserialization in queue jobs allows unauthenticated remote code execution.',
      remediation:'Upgrade Laravel to 11.2+ and validate all serialized inputs.' },
  ],
  springboot: [
    { cve:'CVE-2022-22965', title:'Spring4Shell RCE (Spring Framework)', cvss:9.8, severity:'CRITICAL',
      range:{min:'5.3.0',max:'5.3.17'}, fixed:'5.3.18',
      impact:'ClassLoader data binding exploitation allows unauthenticated RCE via crafted request parameters.',
      remediation:'Upgrade Spring Framework to 5.3.18+ or 5.2.20+.' },
  ],
  express: [
    { cve:'CVE-2024-29041', title:'Express.js Open Redirect', cvss:6.1, severity:'MEDIUM',
      range:{min:'4.0.0',max:'4.19.1'}, fixed:'4.19.2',
      impact:'Crafted URL in res.redirect() causes open redirect enabling phishing attacks.',
      remediation:'Upgrade Express.js to 4.19.2+ or 5.0.0+.' },
  ],
  jquery: [
    { cve:'CVE-2020-11022', title:'jQuery XSS via HTML Injection', cvss:6.1, severity:'MEDIUM',
      range:{min:'1.2.0',max:'3.4.1'}, fixed:'3.5.0',
      impact:'Passing crafted HTML to jQuery DOM methods enables cross-site scripting.',
      remediation:'Upgrade jQuery to 3.5.0+ and avoid using .html() with untrusted input.' },
  ],
};

const ENDPOINT_PROBES = [
  
  { path:'/robots.txt', cat:'recon', name:'Robots.txt' },
  { path:'/.well-known/security.txt', cat:'recon', name:'Security.txt' },
  { path:'/security.txt', cat:'recon', name:'Security.txt (root)' },
  { path:'/sitemap.xml', cat:'recon', name:'Sitemap XML' },
  { path:'/humans.txt', cat:'recon', name:'Humans.txt' },

  { path:'/.env', cat:'critical', name:'Environment Variables (.env)' },
  { path:'/.git/HEAD', cat:'critical', name:'Git Repository Exposed' },
  { path:'/.git/config', cat:'critical', name:'Git Config Exposed' },
  { path:'/phpinfo.php', cat:'critical', name:'PHP Info Disclosure' },
  { path:'/info.php', cat:'critical', name:'PHP Info Page' },
  { path:'/server-status', cat:'critical', name:'Apache Server Status' },
  { path:'/server-info', cat:'critical', name:'Apache Server Info' },
  { path:'/actuator', cat:'critical', name:'Spring Boot Actuator' },
  { path:'/actuator/env', cat:'critical', name:'Spring Boot Env Vars' },
  { path:'/actuator/health', cat:'high', name:'Spring Boot Health' },
  { path:'/debug', cat:'critical', name:'Debug Endpoint' },
  { path:'/console', cat:'critical', name:'Debug Console' },
  { path:'/elmah.axd', cat:'critical', name:'ASP.NET Error Log (ELMAH)' },
  { path:'/trace', cat:'critical', name:'HTTP Trace Endpoint' },

  { path:'/swagger.json', cat:'high', name:'Swagger/OpenAPI Spec' },
  { path:'/swagger-ui.html', cat:'high', name:'Swagger UI' },
  { path:'/api-docs', cat:'high', name:'API Documentation' },
  { path:'/graphql', cat:'high', name:'GraphQL Endpoint' },
  { path:'/composer.json', cat:'high', name:'PHP Composer Manifest' },
  { path:'/package.json', cat:'high', name:'Node.js Package Manifest' },
  { path:'/.htaccess', cat:'high', name:'Apache .htaccess Config' },
  { path:'/web.config', cat:'high', name:'IIS web.config' },
  { path:'/backup', cat:'high', name:'Backup Directory' },
  { path:'/dump.sql', cat:'critical', name:'SQL Database Dump' },
  { path:'/database.sql', cat:'critical', name:'SQL Database File' },
  { path:'/db.sql', cat:'critical', name:'Database SQL Export' },

  { path:'/wp-login.php', cat:'high', name:'WordPress Login Page' },
  { path:'/wp-json/wp/v2/', cat:'medium', name:'WordPress REST API' },
  { path:'/wp-json/wp/v2/users', cat:'high', name:'WordPress User Enum API' },
  { path:'/xmlrpc.php', cat:'high', name:'WordPress XML-RPC' },
  { path:'/wp-cron.php', cat:'medium', name:'WordPress Cron Handler' },
  { path:'/wp-config.php.bak', cat:'critical', name:'WordPress Config Backup' },
  { path:'/wp-content/debug.log', cat:'critical', name:'WordPress Debug Log' },

  { path:'/admin', cat:'high', name:'Admin Panel' },
  { path:'/administrator', cat:'high', name:'Administrator Panel' },
  { path:'/phpmyadmin/', cat:'critical', name:'phpMyAdmin' },
  { path:'/adminer.php', cat:'critical', name:'Adminer DB Manager' },

  { path:'/.DS_Store', cat:'medium', name:'macOS DS_Store Metadata' },
  { path:'/crossdomain.xml', cat:'medium', name:'Flash Cross-Domain Policy' },
  { path:'/.dockerenv', cat:'high', name:'Docker Environment File' },
  { path:'/Dockerfile', cat:'high', name:'Dockerfile Exposed' },
  { path:'/docker-compose.yml', cat:'high', name:'Docker Compose Config' },
];

const WAF_SIGS = {
  cloudflare: { headers:['cf-ray','cf-cache-status'], serverMatch:'cloudflare', name:'Cloudflare WAF/CDN' },
  akamai: { headers:['x-akamai-transformed','akamai-grn'], serverMatch:'akamai', name:'Akamai CDN/WAF' },
  awscloudfront: { headers:['x-amz-cf-id','x-amz-cf-pop'], serverMatch:'cloudfront', name:'AWS CloudFront' },
  awswaf: { headers:['x-amzn-waf-action'], serverMatch:null, name:'AWS WAF' },
  sucuri: { headers:['x-sucuri-id','x-sucuri-cache'], serverMatch:'sucuri', name:'Sucuri WAF' },
  incapsula: { headers:['x-iinfo','x-cdn'], serverMatch:'incapsula', name:'Imperva Incapsula' },
  fastly: { headers:['x-fastly-request-id','fastly-restarts'], serverMatch:'fastly', name:'Fastly CDN' },
  varnish: { headers:['x-varnish','via'], serverMatch:'varnish', name:'Varnish Cache' },
  ddosguard: { headers:['x-ddos-protection'], serverMatch:'ddos-guard', name:'DDoS-Guard' },
};

export async function POST(request) {
  const startTime = Date.now();

  let body;
  try { body = await request.json(); } catch {
    try { body = JSON.parse(await request.text()); } catch { body = {}; }
  }

  const target = sanitizeDomain(body?.domain);
  if (!target) {
    return NextResponse.json({ error: 'Provide a valid domain (e.g., example.com).' }, { status: 400 });
  }
  if (target.endsWith('.local') || target.endsWith('.internal') || target.endsWith('.localhost') || target === 'localhost') {
    return NextResponse.json({ error: 'Internal/localhost domains are not eligible.' }, { status: 400 });
  }

  try {
    
    let rootIps = [];
    try {
      const records = await dns.lookup(target, { all: true });
      rootIps = records.map(r => r.address);
      if (rootIps.some(isPrivateIp)) {
        return NextResponse.json({ error: 'Target resolves to private/internal IP.' }, { status: 400 });
      }
    } catch {}

    let spfRecord = null, dmarcRecord = null, dkimFound = false, mxRecords = [];

    try {
      const txt = await dns.resolveTxt(target).catch(() => []);
      const flat = txt.map(i => Array.isArray(i) ? i.join('') : i);
      spfRecord = flat.find(r => r.toLowerCase().startsWith('v=spf1')) || null;
    } catch {}

    try {
      const dt = await dns.resolveTxt(`_dmarc.${target}`).catch(() => []);
      const flat = dt.map(i => Array.isArray(i) ? i.join('') : i);
      dmarcRecord = flat.find(r => r.toLowerCase().startsWith('v=dmarc1')) || null;
    } catch {}

    for (const sel of ['default', 'google', 'selector1', 'selector2', 'k1', 'dkim']) {
      try {
        const dk = await dns.resolveTxt(`${sel}._domainkey.${target}`).catch(() => []);
        if (dk.length > 0) { dkimFound = true; break; }
      } catch {}
    }

    try {
      const mx = await dns.resolveMx(target).catch(() => []);
      mxRecords = mx.sort((a,b) => a.priority - b.priority).map(m => m.exchange).slice(0, 5);
    } catch {}

    let subdomains = new Set([target]);
    try {
      const crtRes = await fetchSafe(
        `https://crt.sh/?q=%.${encodeURIComponent(target)}&output=json`,
        { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } },
        8000
      );
      if (crtRes?.ok) {
        const text = await crtRes.text();
        try {
          const entries = JSON.parse(text);
          if (Array.isArray(entries)) {
            for (const item of entries) {
              if (item.name_value) {
                for (let n of item.name_value.split('\n')) {
                  n = n.trim().toLowerCase();
                  if (n.startsWith('*.')) n = n.slice(2);
                  if ((n.endsWith(`.${target}`) || n === target) && /^[a-z0-9.-]+$/.test(n)) {
                    subdomains.add(n);
                  }
                }
              }
            }
          }
        } catch {}
      }
    } catch {}

    const stdHosts = ['www','api','mail','vpn','portal','app','auth','dev','admin','staging','cdn','static','ftp','git','ci','beta','test','uat','docs'];
    for (const h of stdHosts) subdomains.add(`${h}.${target}`);

    const subdomainList = Array.from(subdomains).slice(0, 50);

    const resolvedHosts = await Promise.all(
      subdomainList.map(async (host) => {
        try {
          const records = await dns.lookup(host, { all: true });
          const ipv4s = records.filter(r => r.family === 4).map(r => r.address);
          return {
            subdomain: host, status: 'Live (Resolved)', isLive: true,
            ip: ipv4s[0] || records[0]?.address || 'Resolved',
            allIps: records.map(r => r.address),
            type: host === target ? 'Apex Root' : host.split('.')[0],
          };
        } catch {
          return {
            subdomain: host, status: 'Unresolved / Stale', isLive: false,
            ip: '-', allIps: [], type: host === target ? 'Apex Root' : host.split('.')[0],
          };
        }
      })
    );

    let headersFound = {};
    let serverSoftware = 'Hidden / Undisclosed';
    let httpsActive = false;
    let httpRedirectsToHttps = false;
    let cookieHygiene = { hasCookies: false, secure: true, httpOnly: true, sameSite: true, details: [] };
    let rawHtml = '';
    let responseStatusCode = 0;
    let responseUrl = '';

    try {
      const res = await fetchSafe(`https://${target}`, {
        method: 'GET', redirect: 'follow',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        },
      }, 8000);
      if (res) {
        httpsActive = true;
        responseStatusCode = res.status;
        responseUrl = res.url;
        for (const [k, v] of res.headers.entries()) headersFound[k.toLowerCase()] = v;
        if (headersFound['server']) serverSoftware = headersFound['server'];
        
        const sc = res.headers.get('set-cookie');
        if (sc) {
          cookieHygiene.hasCookies = true;
          const cl = sc.toLowerCase();
          cookieHygiene.secure = cl.includes('secure');
          cookieHygiene.httpOnly = cl.includes('httponly');
          cookieHygiene.sameSite = cl.includes('samesite');
          if (!cookieHygiene.secure) cookieHygiene.details.push('Missing Secure flag');
          if (!cookieHygiene.httpOnly) cookieHygiene.details.push('Missing HttpOnly flag');
          if (!cookieHygiene.sameSite) cookieHygiene.details.push('Missing SameSite attribute');
        }

        rawHtml = (await res.text().catch(() => '')).slice(0, 25000).toLowerCase();
      }
    } catch {}

    if (!httpsActive) {
      try {
        const res = await fetchSafe(`http://${target}`, {
          method: 'GET', redirect: 'follow',
          headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
        }, 6000);
        if (res) {
          for (const [k, v] of res.headers.entries()) headersFound[k.toLowerCase()] = v;
          if (headersFound['server']) serverSoftware = headersFound['server'];
          rawHtml = (await res.text().catch(() => '')).slice(0, 25000).toLowerCase();
          if (res.url.startsWith('https://')) httpRedirectsToHttps = true;
        }
      } catch {}
    } else {
      
      try {
        const httpRes = await fetchSafe(`http://${target}`, { method: 'HEAD', redirect: 'manual' }, 3000);
        if (httpRes) {
          const loc = httpRes.headers.get('location') || '';
          httpRedirectsToHttps = loc.startsWith('https://') || httpRes.status === 301 || httpRes.status === 302;
        }
      } catch {}
    }

    const scheme = httpsActive ? 'https' : 'http';
    const probeResults = [];
    let robotsTxtContent = '';
    let securityTxtContent = '';

    const batchSize = 10;
    for (let i = 0; i < ENDPOINT_PROBES.length; i += batchSize) {
      const batch = ENDPOINT_PROBES.slice(i, i + batchSize);
      const results = await Promise.allSettled(
        batch.map(async (probe) => {
          const res = await fetchSafe(`${scheme}://${target}${probe.path}`, {
            method: 'GET', redirect: 'follow',
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
          }, 3000);
          if (!res) return { ...probe, accessible: false, status: 0 };
          
          const status = res.status;
          let snippet = '';
          
          if (status === 200 || status === 403) {
            const txt = await res.text().catch(() => '');
            snippet = txt.slice(0, 500);
            
            if (probe.path.includes('robots.txt') && status === 200) robotsTxtContent = txt;
            if (probe.path.includes('security.txt') && status === 200) securityTxtContent = txt;
          }

          const isReal = status === 200 && !snippet.toLowerCase().includes('404') && !snippet.toLowerCase().includes('not found');
          const is403 = status === 403; 
          
          return { ...probe, accessible: isReal, forbidden: is403, status, snippet: snippet.slice(0, 200) };
        })
      );

      for (const r of results) {
        if (r.status === 'fulfilled') probeResults.push(r.value);
      }
    }

    const robotsSensitivePaths = [];
    if (robotsTxtContent) {
      const lines = robotsTxtContent.split('\n');
      for (const line of lines) {
        const match = line.match(/^disallow:\s*(.+)/i);
        if (match) {
          const path = match[1].trim();
          const sensitiveKw = ['admin','backup','private','secret','internal','config','database','dump','log','debug','test','staging','dev','api','wp-','cgi','phpmyadmin'];
          if (sensitiveKw.some(kw => path.toLowerCase().includes(kw))) {
            robotsSensitivePaths.push(path);
          }
        }
      }
    }

    const exposedEndpoints = probeResults.filter(p => p.accessible || p.forbidden);
    const criticalExposures = exposedEndpoints.filter(p => p.accessible && (p.cat === 'critical' || p.cat === 'high'));

    const detectedTech = [];
    const versions = {}; 

    const srvLower = (headersFound['server'] || '').toLowerCase();
    const xPowered = (headersFound['x-powered-by'] || '').toLowerCase();
    const via = (headersFound['via'] || '').toLowerCase();

    if (srvLower.includes('cloudflare') || headersFound['cf-ray']) {
      detectedTech.push({ name:'Cloudflare CDN/WAF', category:'Reverse Proxy & CDN', key:'cloudflare' });
    }
    if (srvLower.includes('nginx')) {
      detectedTech.push({ name:'Nginx', category:'Web Server', key:'nginx' });
      const v = extractVersion(headersFound['server']);
      if (v) versions.nginx = v;
    }
    if (srvLower.includes('apache')) {
      detectedTech.push({ name:'Apache HTTP Server', category:'Web Server', key:'apache' });
      const v = extractVersion(headersFound['server']);
      if (v) versions.apache = v;
    }
    if (srvLower.includes('iis') || srvLower.includes('microsoft')) {
      detectedTech.push({ name:'Microsoft IIS', category:'Web Server', key:'iis' });
      const v = extractVersion(headersFound['server']);
      if (v) versions.iis = v;
    }
    if (srvLower.includes('litespeed')) {
      detectedTech.push({ name:'LiteSpeed', category:'Web Server', key:'litespeed' });
    }
    if (srvLower.includes('openresty')) {
      detectedTech.push({ name:'OpenResty (Nginx+Lua)', category:'Web Server', key:'nginx' });
      const v = extractVersion(headersFound['server']);
      if (v) versions.nginx = v;
    }

    if (xPowered.includes('php') || rawHtml.includes('phpsessid')) {
      detectedTech.push({ name:'PHP Runtime', category:'Backend Language', key:'php' });
      const v = extractVersion(headersFound['x-powered-by']);
      if (v) versions.php = v;
    }
    if (xPowered.includes('express') || rawHtml.includes('connect.sid')) {
      detectedTech.push({ name:'Express.js (Node.js)', category:'Application Framework', key:'express' });
    }
    if (xPowered.includes('asp.net') || headersFound['x-aspnet-version']) {
      detectedTech.push({ name:'ASP.NET', category:'Backend Framework', key:'iis' });
      const v = extractVersion(headersFound['x-aspnet-version']);
      if (v) versions.aspnet = v;
    }
    if (xPowered.includes('next.js')) {
      detectedTech.push({ name:'Next.js', category:'Full-Stack Framework', key:'nextjs' });
      const v = extractVersion(headersFound['x-powered-by']);
      if (v) versions.nextjs = v;
    }

    if (rawHtml.includes('wp-content') || rawHtml.includes('wp-includes') || rawHtml.includes('wordpress')) {
      detectedTech.push({ name:'WordPress CMS', category:'Content Management', key:'wordpress' });
      
      const wpVerMatch = rawHtml.match(/content="wordpress\s+([\d.]+)"/);
      if (wpVerMatch) versions.wordpress = wpVerMatch[1];
    }
    if (rawHtml.includes('/_next/') || rawHtml.includes('__next') || rawHtml.includes('__next_data__')) {
      if (!detectedTech.some(t => t.key === 'nextjs')) {
        detectedTech.push({ name:'Next.js (React)', category:'Frontend Framework', key:'nextjs' });
      }
    }
    if (rawHtml.includes('csrftoken') && (rawHtml.includes('django') || headersFound['x-frame-options'])) {
      detectedTech.push({ name:'Django', category:'Python Web Framework', key:'django' });
    }
    if (rawHtml.includes('laravel_session') || rawHtml.includes('xsrf-token') && rawHtml.includes('laravel')) {
      detectedTech.push({ name:'Laravel', category:'PHP Framework', key:'laravel' });
    }
    if (rawHtml.includes('__nuxt') || rawHtml.includes('nuxt.js') || rawHtml.includes('/_nuxt/')) {
      detectedTech.push({ name:'Nuxt.js (Vue)', category:'Frontend Framework', key:'nuxtjs' });
    }
    if (rawHtml.includes('ng-version') || rawHtml.includes('angular')) {
      detectedTech.push({ name:'Angular', category:'Frontend Framework', key:'angular' });
      const ngMatch = rawHtml.match(/ng-version="([\d.]+)"/);
      if (ngMatch) versions.angular = ngMatch[1];
    }
    if (rawHtml.includes('__svelte') || rawHtml.includes('svelte')) {
      detectedTech.push({ name:'Svelte/SvelteKit', category:'Frontend Framework', key:'svelte' });
    }
    if (rawHtml.includes('jquery') || rawHtml.includes('jquery.min.js')) {
      detectedTech.push({ name:'jQuery', category:'JavaScript Library', key:'jquery' });
      const jqMatch = rawHtml.match(/jquery[.-]?([\d.]+)/);
      if (jqMatch) versions.jquery = jqMatch[1];
    }
    if (rawHtml.includes('bootstrap') || rawHtml.includes('bootstrap.min.css')) {
      detectedTech.push({ name:'Bootstrap CSS', category:'UI Framework', key:'bootstrap' });
    }
    if (rawHtml.includes('react') && rawHtml.includes('reactdom')) {
      detectedTech.push({ name:'React', category:'Frontend Library', key:'react' });
    }
    if (rawHtml.includes('vue.js') || rawHtml.includes('vue.min.js') || rawHtml.includes('vue@')) {
      detectedTech.push({ name:'Vue.js', category:'Frontend Framework', key:'vuejs' });
    }

    const genMatch = rawHtml.match(/<meta\s+name=["']generator["']\s+content=["']([^"']+)["']/);
    if (genMatch) {
      const generator = genMatch[1];
      if (generator.toLowerCase().includes('drupal')) {
        detectedTech.push({ name:'Drupal CMS', category:'Content Management', key:'drupal' });
      }
      if (generator.toLowerCase().includes('joomla')) {
        detectedTech.push({ name:'Joomla CMS', category:'Content Management', key:'joomla' });
      }
    }

    if (probeResults.some(p => p.path.includes('actuator') && p.accessible)) {
      detectedTech.push({ name:'Spring Boot', category:'Java Framework', key:'springboot' });
    }

    const wpApiProbe = probeResults.find(p => p.path === '/wp-json/wp/v2/' && p.accessible);
    if (wpApiProbe && wpApiProbe.snippet) {
      try {
        
        const wpData = JSON.parse(wpApiProbe.snippet);
        
      } catch {}
    }

    const mappedCves = [];
    const seenCves = new Set();

    for (const tech of detectedTech) {
      const cves = CVE_DB[tech.key];
      if (!cves) continue;

      const detectedVersion = versions[tech.key] || null;

      for (const cve of cves) {
        if (seenCves.has(cve.cve)) continue;
        seenCves.add(cve.cve);

        let verification = { status: 'POSSIBLE', confidence: 25, evidence: `Technology ${tech.name} detected but version could not be determined.`, method: 'Technology fingerprint only' };

        if (detectedVersion && cve.range) {
          if (inRange(detectedVersion, cve.range.min, cve.range.max)) {
            verification = {
              status: 'LIKELY',
              confidence: 75,
              evidence: `Detected version ${detectedVersion} is within the vulnerable range ${cve.range.min}–${cve.range.max}.`,
              method: 'Version comparison against known affected range',
            };
            
            if (tech.key === 'wordpress' && probeResults.some(p => p.path === '/xmlrpc.php' && p.accessible)) {
              verification.status = 'VERIFIED';
              verification.confidence = 90;
              verification.evidence += ' XML-RPC interface confirmed accessible.';
            }
            if (tech.key === 'apache' && probeResults.some(p => p.path === '/server-status' && p.accessible)) {
              verification.status = 'VERIFIED';
              verification.confidence = 92;
              verification.evidence += ' Apache /server-status is publicly accessible, confirming default configuration.';
            }
            if (tech.key === 'springboot' && probeResults.some(p => p.path.includes('actuator') && p.accessible)) {
              verification.status = 'VERIFIED';
              verification.confidence = 95;
              verification.evidence += ' Spring Boot Actuator endpoints are publicly exposed.';
            }
          } else if (cve.fixed && cmpVer(detectedVersion, cve.fixed) >= 0) {
            verification = {
              status: 'PATCHED',
              confidence: 80,
              evidence: `Detected version ${detectedVersion} is at or above the fixed version ${cve.fixed}.`,
              method: 'Version comparison against patched release',
            };
          } else {
            verification = {
              status: 'POSSIBLE',
              confidence: 40,
              evidence: `Detected version ${detectedVersion} could not be confirmed within the vulnerable range.`,
              method: 'Version detected but outside known affected range',
            };
          }
        } else if (!cve.range) {
          
          verification = {
            status: 'POSSIBLE',
            confidence: 35,
            evidence: `${tech.name} detected. This advisory relates to configuration rather than specific versions.`,
            method: 'Configuration-based advisory',
          };
        }

        mappedCves.push({
          ...cve,
          relatedComponent: tech.name,
          detectedVersion: detectedVersion || 'Unknown',
          verification,
        });
      }
    }

    const statusOrder = { VERIFIED: 0, LIKELY: 1, POSSIBLE: 2, PATCHED: 3 };
    mappedCves.sort((a, b) => (statusOrder[a.verification.status] || 9) - (statusOrder[b.verification.status] || 9));

    let corsResult = { tested: false, vulnerable: false };
    try {
      const corsRes = await fetchSafe(`${scheme}://${target}`, {
        method: 'GET',
        headers: {
          'Origin': 'https://malicious-attacker-origin.com',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        },
      }, 4000);
      if (corsRes) {
        const acao = corsRes.headers.get('access-control-allow-origin');
        const acac = corsRes.headers.get('access-control-allow-credentials');
        corsResult = {
          tested: true,
          allowOrigin: acao || 'Not set',
          allowCredentials: acac || 'Not set',
          wildcard: acao === '*',
          reflected: acao === 'https://malicious-attacker-origin.com',
          vulnerable: acao === '*' || acao === 'https://malicious-attacker-origin.com',
          credentialsWithWildcard: acao === '*' && acac === 'true',
        };
      }
    } catch {}

    let wafDetected = { detected: false, name: 'None Detected', confidence: 0 };
    for (const [key, sig] of Object.entries(WAF_SIGS)) {
      const hasHeader = sig.headers.some(h => headersFound[h]);
      const hasServer = sig.serverMatch && srvLower.includes(sig.serverMatch);
      if (hasHeader || hasServer) {
        wafDetected = {
          detected: true, name: sig.name, key,
          confidence: hasHeader && hasServer ? 95 : hasHeader ? 85 : 70,
          evidence: hasHeader ? `Detected via response header: ${sig.headers.filter(h => headersFound[h]).join(', ')}` : `Server banner contains: ${sig.serverMatch}`,
        };
        break;
      }
    }

    const findings = [];
    let deductionScore = 0;

    if (!headersFound['strict-transport-security']) {
      findings.push({
        id:'SEC-HSTS-01', title:'Missing HSTS (HTTP Strict Transport Security)', severity:'MEDIUM', cvss:5.9,
        cvssVector:'CVSS:3.1/AV:N/AC:H/PR:N/UI:N/S:U/C:H/I:N/A:N',
        cwe:'CWE-319', mitre:'T1557: Adversary-in-the-Middle',
        impact:'Vulnerable to SSL stripping and downgrade attacks.', recommendation:'Set Strict-Transport-Security: max-age=31536000; includeSubDomains; preload.',
        tested: true, evidence: 'Strict-Transport-Security header not present in server response.',
      }); deductionScore += 10;
    } else {
      const hstsVal = headersFound['strict-transport-security'];
      const maxAgeMatch = hstsVal.match(/max-age=(\d+)/);
      if (maxAgeMatch && parseInt(maxAgeMatch[1]) < 15768000) {
        findings.push({
          id:'SEC-HSTS-01B', title:'Weak HSTS max-age (< 6 months)', severity:'LOW', cvss:3.5,
          cvssVector:'CVSS:3.1/AV:N/AC:H/PR:N/UI:N/S:U/C:L/I:N/A:N',
          cwe:'CWE-319', mitre:'T1557',
          impact:'Short HSTS max-age reduces protection window.', recommendation:'Increase max-age to at least 31536000 (1 year).',
          tested: true, evidence: `HSTS max-age is ${maxAgeMatch[1]}s (less than recommended 6 months).`,
        }); deductionScore += 3;
      }
    }

    if (!headersFound['content-security-policy']) {
      findings.push({
        id:'SEC-CSP-02', title:'Missing Content-Security-Policy (CSP)', severity:'MEDIUM', cvss:6.1,
        cvssVector:'CVSS:3.1/AV:N/AC:L/PR:N/UI:R/S:C/C:L/I:L/A:N',
        cwe:'CWE-79', mitre:'T1059.007: JavaScript Execution',
        impact:'No content restriction enables XSS, inline script injection, and data exfiltration.', recommendation:'Deploy strict CSP with nonce or hash-based script-src directives.',
        tested: true, evidence: 'Content-Security-Policy header not present.',
      }); deductionScore += 12;
    } else {
      const csp = headersFound['content-security-policy'].toLowerCase();
      if (csp.includes("'unsafe-inline'") || csp.includes("'unsafe-eval'")) {
        findings.push({
          id:'SEC-CSP-02B', title:'Weak CSP: unsafe-inline or unsafe-eval Detected', severity:'MEDIUM', cvss:5.4,
          cvssVector:'CVSS:3.1/AV:N/AC:L/PR:N/UI:R/S:C/C:L/I:L/A:N',
          cwe:'CWE-79', mitre:'T1059.007',
          impact:'unsafe-inline/eval significantly weakens CSP protection against XSS.', recommendation:'Remove unsafe-inline/eval and use nonce-based CSP.',
          tested: true, evidence: `CSP contains: ${csp.includes("'unsafe-inline'") ? "'unsafe-inline'" : ''} ${csp.includes("'unsafe-eval'") ? "'unsafe-eval'" : ''}`,
        }); deductionScore += 6;
      }
    }

    const csp = headersFound['content-security-policy'] || '';
    if (!headersFound['x-frame-options'] && !csp.includes('frame-ancestors')) {
      findings.push({
        id:'SEC-XFO-03', title:'Missing Clickjacking Protection', severity:'LOW', cvss:4.3,
        cvssVector:'CVSS:3.1/AV:N/AC:L/PR:N/UI:R/S:U/C:N/I:L/A:N',
        cwe:'CWE-1021', mitre:'T1204: User Execution',
        impact:'Page can be embedded in malicious iframes for clickjacking.', recommendation:'Set X-Frame-Options: DENY or CSP frame-ancestors none.',
        tested: true, evidence: 'Neither X-Frame-Options nor CSP frame-ancestors directive found.',
      }); deductionScore += 5;
    }

    if (!headersFound['x-content-type-options']) {
      findings.push({
        id:'SEC-XCTO-04', title:'Missing MIME Sniffing Protection', severity:'LOW', cvss:3.7,
        cvssVector:'CVSS:3.1/AV:N/AC:H/PR:N/UI:N/S:U/C:L/I:N/A:N',
        cwe:'CWE-16', mitre:'T1189: Drive-by Compromise',
        impact:'Browser may misinterpret uploaded files as executable content.', recommendation:'Add X-Content-Type-Options: nosniff.',
        tested: true, evidence: 'X-Content-Type-Options header not present.',
      }); deductionScore += 4;
    }

    if (!headersFound['permissions-policy'] && !headersFound['feature-policy']) {
      findings.push({
        id:'SEC-PP-05', title:'Missing Permissions-Policy Header', severity:'LOW', cvss:3.1,
        cvssVector:'CVSS:3.1/AV:N/AC:H/PR:N/UI:R/S:U/C:L/I:N/A:N',
        cwe:'CWE-16', mitre:'T1120: Peripheral Device Discovery',
        impact:'No restrictions on browser features (camera, microphone, geolocation) accessible to embedded content.', recommendation:'Set Permissions-Policy to restrict sensitive APIs.',
        tested: true, evidence: 'Permissions-Policy / Feature-Policy header not found.',
      }); deductionScore += 3;
    }

    if (!headersFound['referrer-policy']) {
      findings.push({
        id:'SEC-RP-06', title:'Missing Referrer-Policy Header', severity:'LOW', cvss:3.1,
        cvssVector:'CVSS:3.1/AV:N/AC:H/PR:N/UI:R/S:U/C:L/I:N/A:N',
        cwe:'CWE-200', mitre:'T1082: System Information Discovery',
        impact:'Full URL with query parameters may leak to third-party sites via Referer header.', recommendation:'Set Referrer-Policy: strict-origin-when-cross-origin or no-referrer.',
        tested: true, evidence: 'Referrer-Policy header not present.',
      }); deductionScore += 2;
    }

    if (!headersFound['cross-origin-opener-policy']) {
      findings.push({
        id:'SEC-COOP-07', title:'Missing Cross-Origin-Opener-Policy (COOP)', severity:'INFO', cvss:2.6,
        cvssVector:'CVSS:3.1/AV:N/AC:H/PR:N/UI:R/S:U/C:L/I:N/A:N',
        cwe:'CWE-346', mitre:'T1185: Browser Session Hijacking',
        impact:'Window references can be accessed cross-origin, enabling Spectre-class side-channel attacks.', recommendation:'Set Cross-Origin-Opener-Policy: same-origin.',
        tested: true, evidence: 'Cross-Origin-Opener-Policy header not present.',
      }); deductionScore += 1;
    }

    if (headersFound['server'] && headersFound['server'].length > 0) {
      const versionInBanner = extractVersion(headersFound['server']);
      findings.push({
        id:'SEC-INFO-08', title:`Server Software Fingerprint Disclosed: ${serverSoftware}`, severity:'LOW', cvss:3.1,
        cvssVector:'CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:L/I:N/A:N',
        cwe:'CWE-200', mitre:'T1592.002: Software Discovery',
        impact:`Reveals ${versionInBanner ? `exact version (${versionInBanner})` : 'server engine'} enabling targeted vulnerability exploitation.`,
        recommendation:'Mask or remove Server and X-Powered-By headers.',
        tested: true, evidence: `Server header value: "${headersFound['server']}"`,
      }); deductionScore += 4;
    }
    if (headersFound['x-powered-by']) {
      findings.push({
        id:'SEC-INFO-08B', title:`X-Powered-By Header Disclosed: ${headersFound['x-powered-by']}`, severity:'LOW', cvss:3.1,
        cvssVector:'CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:L/I:N/A:N',
        cwe:'CWE-200', mitre:'T1592.002',
        impact:'Reveals backend runtime/framework facilitating targeted attacks.',
        recommendation:'Remove X-Powered-By header in server configuration.',
        tested: true, evidence: `X-Powered-By: "${headersFound['x-powered-by']}"`,
      }); deductionScore += 3;
    }

    if (!httpsActive && !httpRedirectsToHttps) {
      findings.push({
        id:'SEC-TLS-09', title:'HTTPS Not Available or Not Enforced', severity:'HIGH', cvss:7.4,
        cvssVector:'CVSS:3.1/AV:N/AC:H/PR:N/UI:N/S:U/C:H/I:H/A:N',
        cwe:'CWE-319', mitre:'T1040: Network Sniffing',
        impact:'All traffic transmitted in plaintext — credentials, cookies, and PII are interceptable.',
        recommendation:'Obtain TLS certificate and enforce HTTPS with 301 redirect from HTTP.',
        tested: true, evidence: 'HTTPS connection failed and HTTP does not redirect to HTTPS.',
      }); deductionScore += 15;
    }

    if (!dmarcRecord) {
      findings.push({
        id:'SEC-MAIL-10', title:'Missing DMARC Record (Domain Spoofing Exposure)', severity:'HIGH', cvss:7.5,
        cvssVector:'CVSS:3.1/AV:N/AC:L/PR:N/UI:R/S:U/C:N/I:H/A:N',
        cwe:'CWE-290', mitre:'T1566: Phishing',
        impact:'Adversaries can send spoofed emails from @' + target + ' for phishing and BEC attacks.',
        recommendation:'Publish _dmarc.' + target + ' TXT record with p=reject policy.',
        tested: true, evidence: 'No DMARC TXT record found at _dmarc.' + target,
      }); deductionScore += 15;
    } else if (dmarcRecord.toLowerCase().includes('p=none')) {
      findings.push({
        id:'SEC-MAIL-10B', title:'Weak DMARC Policy (p=none, monitoring only)', severity:'MEDIUM', cvss:5.3,
        cvssVector:'CVSS:3.1/AV:N/AC:L/PR:N/UI:R/S:U/C:N/I:L/A:N',
        cwe:'CWE-290', mitre:'T1566.002',
        impact:'DMARC in monitoring mode; spoofed emails are still delivered.',
        recommendation:'Upgrade DMARC policy from p=none to p=quarantine then p=reject.',
        tested: true, evidence: `DMARC record: "${dmarcRecord}" — policy is p=none.`,
      }); deductionScore += 6;
    }

    if (!spfRecord) {
      findings.push({
        id:'SEC-MAIL-11', title:'Missing SPF Record', severity:'MEDIUM', cvss:6.5,
        cvssVector:'CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:N/I:L/A:N',
        cwe:'CWE-290', mitre:'T1566',
        impact:'Mail servers cannot verify authorized senders for this domain.',
        recommendation:'Add TXT record: v=spf1 mx -all',
        tested: true, evidence: 'No SPF TXT record found at apex domain.',
      }); deductionScore += 8;
    }

    if (cookieHygiene.hasCookies && (!cookieHygiene.secure || !cookieHygiene.httpOnly)) {
      findings.push({
        id:'SEC-COOKIE-12', title:'Insecure Cookie Configuration', severity:'MEDIUM', cvss:5.4,
        cvssVector:'CVSS:3.1/AV:N/AC:L/PR:N/UI:R/S:U/C:L/I:L/A:N',
        cwe:'CWE-1004', mitre:'T1539: Steal Web Session Cookie',
        impact:'Session cookies may be intercepted (no Secure) or stolen via XSS (no HttpOnly).',
        recommendation:'Set cookies with Secure; HttpOnly; SameSite=Lax flags.',
        tested: true, evidence: `Issues: ${cookieHygiene.details.join(', ')}`,
      }); deductionScore += 7;
    }

    if (corsResult.vulnerable) {
      findings.push({
        id:'SEC-CORS-13', title:'CORS Misconfiguration — Overly Permissive Access', severity: corsResult.credentialsWithWildcard ? 'HIGH' : 'MEDIUM',
        cvss: corsResult.credentialsWithWildcard ? 8.1 : 5.7,
        cvssVector: corsResult.credentialsWithWildcard ? 'CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:N' : 'CVSS:3.1/AV:N/AC:L/PR:N/UI:R/S:U/C:L/I:L/A:N',
        cwe:'CWE-942', mitre:'T1189: Drive-by Compromise',
        impact: corsResult.reflected ? 'Origin header is reflected, allowing any attacker domain to make credentialed cross-origin requests.' : 'Wildcard (*) CORS allows any origin to read responses.',
        recommendation:'Restrict Access-Control-Allow-Origin to specific trusted origins. Never use wildcard with credentials.',
        tested: true, evidence: `Access-Control-Allow-Origin: ${corsResult.allowOrigin}${corsResult.allowCredentials === 'true' ? ', Allow-Credentials: true' : ''}`,
      }); deductionScore += corsResult.credentialsWithWildcard ? 15 : 8;
    }

    for (const ep of criticalExposures) {
      let epCvss = 7.5, epSev = 'HIGH';
      if (ep.cat === 'critical') { epCvss = 9.1; epSev = 'CRITICAL'; }

      findings.push({
        id: `SEC-EXPO-${ep.path.replace(/[^a-zA-Z]/g, '').toUpperCase().slice(0, 8)}`,
        title: `Exposed Sensitive Endpoint: ${ep.name}`,
        severity: epSev, cvss: epCvss,
        cvssVector: 'CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:L/A:N',
        cwe: 'CWE-538: Insertion of Sensitive Information into Externally-Accessible File',
        mitre: 'T1083: File and Directory Discovery',
        impact: `${ep.name} at ${ep.path} is publicly accessible, potentially exposing sensitive configuration, credentials, or internal data.`,
        recommendation: `Block access to ${ep.path} via web server configuration or WAF rules. Return HTTP 403/404.`,
        tested: true, evidence: `HTTP ${ep.status} returned for ${scheme}://${target}${ep.path}`,
      }); deductionScore += ep.cat === 'critical' ? 15 : 10;
    }

    if (robotsSensitivePaths.length > 0) {
      findings.push({
        id: 'SEC-ROBOTS-14', title: `robots.txt Reveals ${robotsSensitivePaths.length} Sensitive Path(s)`, severity: 'LOW', cvss: 3.7,
        cvssVector: 'CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:L/I:N/A:N',
        cwe: 'CWE-200', mitre: 'T1592: Gather Victim Host Information',
        impact: `robots.txt discloses sensitive paths: ${robotsSensitivePaths.slice(0, 5).join(', ')}${robotsSensitivePaths.length > 5 ? '...' : ''}`,
        recommendation: 'Do not rely on robots.txt to hide sensitive paths. Use proper access control.',
        tested: true, evidence: `Sensitive disallow entries found: ${robotsSensitivePaths.join(', ')}`,
      }); deductionScore += 2;
    }

    const xmlrpcProbe = probeResults.find(p => p.path === '/xmlrpc.php' && p.accessible);
    if (xmlrpcProbe && detectedTech.some(t => t.key === 'wordpress')) {
      findings.push({
        id: 'SEC-XMLRPC-15', title: 'WordPress XML-RPC Interface Enabled', severity: 'HIGH', cvss: 7.3,
        cvssVector: 'CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:L/I:L/A:H',
        cwe: 'CWE-307: Improper Restriction of Excessive Authentication Attempts',
        mitre: 'T1110: Brute Force',
        impact: 'XML-RPC enables wp.getUsersBlogs brute-force attacks (multi-call amplification) and DDoS pingback abuse.',
        recommendation: 'Disable XML-RPC via plugin or block xmlrpc.php in web server config.',
        tested: true, evidence: `xmlrpc.php returned HTTP ${xmlrpcProbe.status} and is accessible.`,
      }); deductionScore += 10;
    }

    const sensitiveKw = ['admin','vpn','dev','staging','git','cpanel','test','corp','internal','backup','ftp','debug','uat','beta'];
    const exposedSensitiveSubs = resolvedHosts.filter(h => h.isLive && sensitiveKw.some(kw => h.subdomain.split('.')[0].includes(kw)));
    if (exposedSensitiveSubs.length > 0) {
      findings.push({
        id:'SEC-SURF-16', title:`${exposedSensitiveSubs.length} High-Risk Subdomain(s) Publicly Accessible`, severity:'HIGH', cvss:7.4,
        cvssVector:'CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:N/A:N',
        cwe:'CWE-284', mitre:'T1133: External Remote Services',
        impact:`Admin/dev/staging hosts (${exposedSensitiveSubs.map(s=>s.subdomain).slice(0,3).join(', ')}) expose attack surface for credential stuffing and lateral access.`,
        recommendation:'Place behind VPN/ZTNA with MFA.',
        tested: true, evidence: `Live sensitive subdomains: ${exposedSensitiveSubs.map(s=>s.subdomain).join(', ')}`,
      }); deductionScore += 12;
    }

    findings.sort((a, b) => b.cvss - a.cvss);

    const finalScore = Math.max(5, 100 - deductionScore);
    let grade = 'A+';
    if (finalScore < 50) grade = 'F';
    else if (finalScore < 60) grade = 'D';
    else if (finalScore < 70) grade = 'C';
    else if (finalScore < 80) grade = 'B';
    else if (finalScore < 90) grade = 'A';

    const maxCvss = findings.length > 0 ? Math.max(...findings.map(f => f.cvss)) : 0;
    const scanDuration = Date.now() - startTime;

    return NextResponse.json({
      target,
      scanTimestamp: new Date().toISOString(),
      scanDuration,
      summary: {
        totalSubdomainsFound: resolvedHosts.length,
        liveHostsCount: resolvedHosts.filter(h => h.isLive).length,
        unresolvedCount: resolvedHosts.filter(h => !h.isLive).length,
        findingsCount: findings.length,
        criticalCount: findings.filter(f => f.severity === 'CRITICAL').length,
        highSeverityCount: findings.filter(f => f.severity === 'HIGH').length,
        mediumSeverityCount: findings.filter(f => f.severity === 'MEDIUM').length,
        lowSeverityCount: findings.filter(f => f.severity === 'LOW').length,
        infoCount: findings.filter(f => f.severity === 'INFO').length,
        maxCvssScore: maxCvss,
        securityScore: finalScore,
        grade,
        httpsActive,
        httpRedirectsToHttps,
        serverSoftware,
        detectedTechCount: detectedTech.length,
        cveAdvisoriesCount: mappedCves.length,
        verifiedCveCount: mappedCves.filter(c => c.verification.status === 'VERIFIED').length,
        likelyCveCount: mappedCves.filter(c => c.verification.status === 'LIKELY').length,
        patchedCveCount: mappedCves.filter(c => c.verification.status === 'PATCHED').length,
        endpointsProbed: probeResults.length,
        exposedEndpointsCount: exposedEndpoints.length,
        criticalExposuresCount: criticalExposures.length,
      },
      emailSecurity: {
        spfRecord: spfRecord || 'Missing',
        dmarcRecord: dmarcRecord || 'Missing',
        hasSpf: !!spfRecord,
        hasDmarc: !!dmarcRecord,
        hasDkim: dkimFound,
        mxExchanges: mxRecords,
      },
      detectedTech: detectedTech.map(t => ({ ...t, version: versions[t.key] || null })),
      versions,
      mappedCves,
      findings,
      resolvedHosts,
      deepRecon: {
        waf: wafDetected,
        cors: corsResult,
        exposedEndpoints,
        criticalExposures,
        robotsTxtFound: !!robotsTxtContent,
        robotsSensitivePaths,
        securityTxtFound: !!securityTxtContent,
        securityTxtContent: securityTxtContent.slice(0, 500),
        endpointsProbed: probeResults.length,
        cookieHygiene,
      },
    });
  } catch (err) {
    return NextResponse.json({ error: `Pipeline failure: ${err?.message || 'Unknown'}` }, { status: 500 });
  }
}
