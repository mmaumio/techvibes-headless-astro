// Cloudflare Pages Function: handles the contact form at POST /api/contact.
// Sends the enquiry by email through Resend (https://resend.com).
//
// Set these in Cloudflare Pages > Settings > Variables and Secrets:
//   RESEND_API_KEY  (secret)   your Resend API key
//   CONTACT_TO                 where enquiries go, e.g. hello@techvibesit.com
//   CONTACT_FROM               a sender on a domain verified in Resend,
//                              e.g. "TechVibes Website <website@techvibesit.com>"

const esc = (s = '') =>
  String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

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

  const data = {
    firstName: (form.get('firstName') || '').toString().trim(),
    lastName: (form.get('lastName') || '').toString().trim(),
    email: (form.get('email') || '').toString().trim(),
    phone: (form.get('phone') || '').toString().trim(),
    service: (form.get('service') || '').toString().trim(),
    budget: (form.get('budget') || '').toString().trim(),
    requirements: (form.get('requirements') || '').toString().trim(),
  };

  if (!data.firstName || !data.lastName || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    return reply(request, 422, { error: 'Please fill in your name and a valid email address.' });
  }
  if (Object.values(data).some((v) => v.length > 5000)) {
    return reply(request, 422, { error: 'Message too long.' });
  }

  if (!env.RESEND_API_KEY || !env.CONTACT_FROM) {
    return reply(request, 503, { error: 'Contact form is not configured yet.' });
  }

  const rows = [
    ['Name', `${data.firstName} ${data.lastName}`],
    ['Email', data.email],
    ['Phone', data.phone],
    ['Service', data.service],
    ['Budget', data.budget],
  ]
    .filter(([, v]) => v)
    .map(([k, v]) => `<tr><td style="padding:6px 16px 6px 0;color:#4A5B66">${k}</td><td style="padding:6px 0">${esc(v)}</td></tr>`)
    .join('');

  const html = `
    <h2 style="font-family:sans-serif;color:#0F1E2A">New enquiry from techvibesit.com</h2>
    <table style="font-family:sans-serif;font-size:15px;border-collapse:collapse">${rows}</table>
    ${data.requirements ? `<h3 style="font-family:sans-serif;color:#0F1E2A">Requirements</h3><p style="font-family:sans-serif;font-size:15px;white-space:pre-wrap">${esc(data.requirements)}</p>` : ''}`;

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: env.CONTACT_FROM,
      to: [env.CONTACT_TO || 'hello@techvibesit.com'],
      reply_to: data.email,
      subject: `New enquiry: ${data.firstName} ${data.lastName}${data.service ? ` (${data.service})` : ''}`,
      html,
    }),
  });

  if (!res.ok) return reply(request, 502, { error: 'Email could not be sent.' });
  return reply(request, 200, { ok: true });
}
