// Contact form handler for POST /api/contact (called from worker/index.js).
//
// Enquiries are passed to the "TechVibes Contact Endpoint" plugin on the
// WordPress site, which emails them with WordPress's mail setup (your
// Hostinger mailbox) and keeps a copy under Enquiries in wp-admin.
// (Workers can't talk to Hostinger's SMTP server directly: it sits on
// Cloudflare's own network, which Workers aren't allowed to connect to.)
//
// Cloudflare > Workers & Pages > techvibes-headless-astro > Settings >
// Variables and Secrets:
//   CONTACT_KEY     (secret)  the key shown in WordPress > Settings > TechVibes Contact
//   WP_CONTACT_URL  (text)    optional, default https://techvibesit.com/wp-json/techvibes/v1/contact
//                             (change it when WordPress moves to cms.techvibesit.com)

const DEFAULT_ENDPOINT = 'https://techvibesit.com/wp-json/techvibes/v1/contact';
const endpoint = (env) => env.WP_CONTACT_URL || DEFAULT_ENDPOINT;

// Strip line breaks so nothing can be injected into email headers.
const oneLine = (s = '') => String(s).replace(/[\r\n]+/g, ' ').trim();

function reply(request, status, body) {
  const wantsJson = (request.headers.get('Accept') || '').includes('application/json');
  if (wantsJson) {
    return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
  }
  // Browsers without JavaScript get sent back to the contact page.
  const url = new URL('/contact/', request.url);
  url.searchParams.set(status < 300 ? 'sent' : 'error', '1');
  return Response.redirect(url.toString(), 303);
}

/** Call the WordPress plugin. Returns { res, data } or throws on network errors. */
async function callWordPress(env, init) {
  const res = await fetch(endpoint(env), {
    ...init,
    headers: {
      Accept: 'application/json',
      'User-Agent': 'Mozilla/5.0 (compatible; TechVibesWebsite/1.0; +https://techvibesit.com)',
      'X-TechVibes-Key': env.CONTACT_KEY || '',
      ...(init.headers || {}),
    },
    signal: AbortSignal.timeout(20000),
  });
  const type = res.headers.get('content-type') || '';
  const text = await res.text();
  let data = null;
  if (type.includes('json')) {
    try { data = JSON.parse(text); } catch { /* not JSON after all */ }
  }
  return { res, data, text };
}

function describe({ res, data, text }) {
  if (data && data.code) return `${res.status} ${data.code}: ${data.message || ''}`.trim();
  return `HTTP ${res.status}, not a WordPress response: ${text.replace(/\s+/g, ' ').slice(0, 120)}`;
}

export async function onRequestPost({ request, env }) {
  let form;
  try {
    form = await request.formData();
  } catch {
    return reply(request, 400, { error: 'Invalid form data' });
  }

  // Honeypot filled in: pretend success, send nothing.
  if (form.get('website')) return reply(request, 200, { ok: true });

  const field = (name) => (form.get(name) || '').toString().trim();
  const data = {
    firstName: oneLine(field('firstName')),
    lastName: oneLine(field('lastName')),
    email: oneLine(field('email')),
    phone: oneLine(field('phone')),
    service: oneLine(field('service')),
    budget: oneLine(field('budget')),
    requirements: field('requirements'),
    page: request.headers.get('Referer') || '',
  };

  if (!data.firstName || !data.lastName || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    return reply(request, 422, { error: 'Please fill in your name and a valid email address.' });
  }
  if (Object.values(data).some((v) => v.length > 5000)) {
    return reply(request, 422, { error: 'Message too long.' });
  }

  if (!env.CONTACT_KEY) {
    console.error('[contact] CONTACT_KEY is not set');
    return reply(request, 503, { error: 'Contact form is not configured yet.', reason: 'not-configured', detail: 'missing CONTACT_KEY' });
  }

  let result;
  try {
    result = await callWordPress(env, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Visitor-IP': request.headers.get('CF-Connecting-IP') || '',
      },
      body: JSON.stringify(data),
    });
  } catch (err) {
    const message = String(err && err.message ? err.message : err);
    console.error('[contact] WordPress unreachable:', message);
    return reply(request, 502, { error: 'Email could not be sent.', reason: 'wordpress-unreachable', detail: message.slice(0, 160) });
  }

  const { res, data: body } = result;
  if (res.ok && body && body.ok) return reply(request, 200, { ok: true });

  const detail = describe(result);
  console.error('[contact] WordPress rejected the enquiry:', detail);
  const reason =
    res.status === 401 ? 'key-rejected'
    : res.status === 404 && body?.code === 'rest_no_route' ? 'plugin-not-active'
    : res.status === 422 ? 'invalid'
    : res.status === 429 ? 'rate-limited'
    : body?.code === 'tvce_mail_failed' ? 'wordpress-mail-failed'
    : 'wordpress-error';
  const status = res.status === 422 || res.status === 429 ? res.status : 502;
  return reply(request, status, {
    error: body?.message || 'Email could not be sent.',
    reason,
    detail: detail.slice(0, 200),
  });
}

// GET /api/contact?check=1 confirms the form handler is live and can reach
// the WordPress plugin with the right key. It never reveals the key.
export async function onRequestGet({ request, env }) {
  if (!new URL(request.url).searchParams.has('check')) {
    return new Response('Method Not Allowed', { status: 405, headers: { Allow: 'POST' } });
  }
  const report = {
    handler: 'deployed',
    CONTACT_KEY: env.CONTACT_KEY ? 'set' : 'MISSING',
    WP_CONTACT_URL: env.WP_CONTACT_URL || `${DEFAULT_ENDPOINT} (default)`,
    wordpress: 'not checked',
  };
  if (env.CONTACT_KEY) {
    try {
      const result = await callWordPress(env, { method: 'GET' });
      if (result.res.ok && result.data?.ok) {
        report.wordpress = `connected, plugin ${result.data.plugin}, enquiries go to ${result.data.recipient}`;
      } else if (result.res.status === 401) {
        report.wordpress = 'plugin found, but the key does not match. Copy it again from WordPress > Settings > TechVibes Contact.';
      } else if (result.data?.code === 'rest_no_route') {
        report.wordpress = 'plugin not installed or not active on WordPress';
      } else {
        report.wordpress = describe(result);
      }
    } catch (err) {
      report.wordpress = `unreachable: ${String(err && err.message ? err.message : err).slice(0, 160)}`;
    }
  }
  return new Response(JSON.stringify(report, null, 2), {
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  });
}
