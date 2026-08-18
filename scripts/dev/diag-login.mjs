// Diagnostic v2: test cookie transmission
import https from 'https';

function req(method, path, headers, body) {
  return new Promise((resolve, reject) => {
    const opts = { hostname: 'easecity.hk', method, path, headers: headers || {} };
    const r = https.request(opts, (res) => {
      const setCookies = res.headers['set-cookie'] || [];
      const chunks = [];
      res.on('data', (c) => chunks.push(c));
      res.on('end', () => {
        resolve({ status: res.statusCode, location: res.headers.location || null, setCookies, body: Buffer.concat(chunks).toString() });
      });
    });
    r.on('error', reject);
    if (body) r.write(body);
    r.end();
  });
}

(async () => {
  let cookieJar = {};
  function saveCookies(sc) { for (const s of sc) { const [p] = s.split(';'); const [k,v] = p.split('='); cookieJar[k] = v; } }
  function cookieHeader() { return Object.entries(cookieJar).map(([k,v]) => `${k}=${v}`).join('; '); }

  // 1. CSRF
  const csrf = await req('GET', '/api/auth/csrf');
  saveCookies(csrf.setCookies);
  const csrfToken = JSON.parse(csrf.body).csrfToken;
  console.log('[1] csrf ok, cookies:', Object.keys(cookieJar).join(', '));

  // 2. Login
  const login = await req('POST', '/api/auth/callback/credentials', {
    'Content-Type': 'application/x-www-form-urlencoded',
    'Cookie': cookieHeader(),
  }, `csrfToken=${encodeURIComponent(csrfToken)}&email=user%40easecity.com&password=User1234%21&json=true`);
  saveCookies(login.setCookies);
  const sessionKey = Object.keys(cookieJar).find(k => k.includes('session-token'));
  console.log('[2] login:', login.status, 'session cookie:', sessionKey ? 'SET: ' + sessionKey : 'MISSING');

  // 3. Dashboard with explicit cookie
  const cookieStr = cookieHeader();
  console.log('[3] Cookie header:', cookieStr.slice(0, 200));
  const dash = await req('GET', '/dashboard', { 'Cookie': cookieStr });
  console.log('[3] dashboard:', dash.status, 'location:', dash.location || '(none)');

  // 4. Session API
  const sess = await req('GET', '/api/auth/session', { 'Cookie': cookieStr });
  console.log('[4] session:', sess.body.slice(0, 200));
})().catch(e => console.error('ERR:', e.message));