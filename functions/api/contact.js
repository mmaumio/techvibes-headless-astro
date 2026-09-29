// Cloudflare Pages Function: handles the contact form at POST /api/contact.
// Sends each enquiry through your Hostinger mailbox over SMTP.
//
// Add these in Cloudflare Pages > Settings > Variables and Secrets:
//   SMTP_USER   (secret)  the Hostinger mailbox that sends, e.g. website@techvibesit.com
//   SMTP_PASS   (secret)  that mailbox's password
//   CONTACT_TO            where enquiries arrive, e.g. hello@techvibesit.com
// Optional (defaults shown):
//   SMTP_HOST = smtp.hostinger.com
//   SMTP_PORT = 465

import { WorkerMailer } from 'worker-mailer';

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

  if (!env.SMTP_USER || !env.SMTP_PASS) {
    console.error('[contact] SMTP_USER / SMTP_PASS are not set');
    return reply(request, 503, { error: 'Contact form is not configured yet.' });
  }

  const rows = [
    ['Name', `${data.firstName} ${data.lastName}`],
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

  let mailer;
  try {
    mailer = await WorkerMailer.connect({
      host: env.SMTP_HOST || 'smtp.hostinger.com',
      port: Number(env.SMTP_PORT || 465),
      secure: Number(env.SMTP_PORT || 465) === 465,
      credentials: { username: env.SMTP_USER, password: env.SMTP_PASS },
      authType: ['plain', 'login'],
      socketTimeoutMs: 15000,
      responseTimeoutMs: 15000,
    });

    await mailer.send({
      // Hostinger only accepts mail "from" the mailbox that logged in.
      from: { name: 'TechVibes Website', email: env.SMTP_USER },
      to: env.CONTACT_TO || 'hello@techvibesit.com',
      reply: { name: `${data.firstName} ${data.lastName}`, email: data.email },
      subject: `New enquiry: ${data.firstName} ${data.lastName}${data.service ? ` (${data.service})` : ''}`,
      text,
      html,
    });
  } catch (err) {
    console.error('[contact] SMTP send failed:', err && err.message ? err.message : err);
    return reply(request, 502, { error: 'Email could not be sent.' });
  } finally {
    try { await mailer?.close(); } catch { /* connection already closed */ }
  }

  return reply(request, 200, { ok: true });
}
