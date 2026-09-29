// Contact form handler for POST /api/contact (called from worker/index.js).
// Sends each enquiry by email through Resend (https://resend.com).
//
// Cloudflare > Workers & Pages > techvibes-headless-astro > Settings >
// Variables and Secrets (runtime):
//   RESEND_API_KEY  (secret)  Resend API key with "Sending access"
//   CONTACT_TO      (text)    where enquiries arrive, default hello@techvibesit.com
//   CONTACT_FROM    (text)    optional sender, default "TechVibes Website <hello@techvibesit.com>".
//                             Must be on a domain verified in Resend.

const DEFAULT_TO = 'hello@techvibesit.com';
const DEFAULT_FROM = 'TechVibes Website <hello@techvibesit.com>';

const esc = (s = '') =>
  String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

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
  };

  if (!data.firstName || !data.lastName || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    return reply(request, 422, { error: 'Please fill in your name and a valid email address.' });
  }
  if (Object.values(data).some((v) => v.length > 5000)) {
    return reply(request, 422, { error: 'Message too long.' });
  }

  if (!env.RESEND_API_KEY) {
    console.error('[contact] RESEND_API_KEY is not set');
    return reply(request, 503, { error: 'Contact form is not configured yet.', reason: 'not-configured', detail: 'missing RESEND_API_KEY' });
  }

  const name = `${data.firstName} ${data.lastName}`;
  const rows = [
    ['Name', name],
    ['Email', data.email],
    ['Phone', data.phone],
    ['Service', data.service],
    ['Budget', data.budget],
  ].filter(([, v]) => v);

  const html = `
    <h2 style="font-family:sans-serif;color:#0F1E2A">New enquiry from techvibesit.com</h2>
    <table style="font-family:sans-serif;font-size:15px;border-collapse:collapse">
      ${rows.map(([k, v]) => `<tr><td style="padding:6px 16px 6px 0;color:#4A5B66">${k}</td><td style="padding:6px 0">${esc(v)}</td></tr>`).join('')}
    </table>
    ${data.requirements ? `<h3 style="font-family:sans-serif;color:#0F1E2A">Requirements</h3><p style="font-family:sans-serif;font-size:15px;white-space:pre-wrap">${esc(data.requirements)}</p>` : ''}`;

  const text = [
    'New enquiry from techvibesit.com',
    '',
    ...rows.map(([k, v]) => `${k}: ${v}`),
    ...(data.requirements ? ['', 'Requirements:', data.requirements] : []),
  ].join('\n');

  let res;
  let body = null;
  try {
    res = await fetch(env.RESEND_API_URL || 'https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: env.CONTACT_FROM || DEFAULT_FROM,
        to: [env.CONTACT_TO || DEFAULT_TO],
        reply_to: `${name.replace(/["<>]/g, '')} <${data.email}>`,
        subject: `New enquiry: ${name}${data.service ? ` (${data.service})` : ''}`,
        html,
        text,
      }),
      signal: AbortSignal.timeout(15000),
    });
    body = await res.json().catch(() => null);
  } catch (err) {
    const message = String(err && err.message ? err.message : err);
    console.error('[contact] Resend unreachable:', message);
    return reply(request, 502, { error: 'Email could not be sent.', reason: 'resend-unreachable', detail: message.slice(0, 160) });
  }

  if (res.ok) return reply(request, 200, { ok: true });

  // Resend explains the problem, e.g. "The techvibesit.com domain is not verified".
  const detail = `${res.status} ${body?.name || ''}: ${body?.message || ''}`.trim();
  console.error('[contact] Resend rejected the email:', detail);
  const reason =
    res.status === 401 || /api key/i.test(body?.message || '') ? 'resend-key-invalid'
    : /domain/i.test(body?.message || '') ? 'resend-domain-not-verified'
    : res.status === 429 ? 'resend-rate-limited'
    : 'resend-error';
  return reply(request, 502, { error: 'Email could not be sent.', reason, detail: detail.slice(0, 200) });
}

// GET /api/contact?check=1 shows whether the form handler is live and which
// settings it can see. It never reveals the API key.
export async function onRequestGet({ request, env }) {
  if (!new URL(request.url).searchParams.has('check')) {
    return new Response('Method Not Allowed', { status: 405, headers: { Allow: 'POST' } });
  }
  const report = {
    handler: 'deployed',
    RESEND_API_KEY: env.RESEND_API_KEY ? 'set' : 'MISSING',
    CONTACT_TO: env.CONTACT_TO || `${DEFAULT_TO} (default)`,
    CONTACT_FROM: env.CONTACT_FROM || `${DEFAULT_FROM} (default)`,
  };
  return new Response(JSON.stringify(report, null, 2), {
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  });
}
