const JSON_HEADERS = {
  "Content-Type": "application/json; charset=utf-8",
  "Cache-Control": "no-store",
};
const SITE_NAME = "Grand Ave. Pet Hospital";
const SITE_URL = "https://grandwestvet.com";
const DEFAULT_LOGO_URL = `${SITE_URL}/wp-content/uploads/2025/02/Grand-Ave-Pet-Hospital-Logo.webp`;
const APPOINTMENT_FORM_IDS = new Set(["341358df"]);

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: JSON_HEADERS,
  });
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function normalizeValue(value) {
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean).join(", ");
  }

  return String(value || "").trim();
}

function sanitizeFields(fields) {
  const cleaned = {};

  for (const [key, value] of Object.entries(fields || {})) {
    const safeKey = String(key).trim().slice(0, 80);
    const safeValue = normalizeValue(value).slice(0, 4000);
    if (!safeKey || !safeValue) continue;
    cleaned[safeKey] = safeValue;
  }

  return cleaned;
}

function cleanLabelText(value) {
  return String(value || "")
    .replace(/[\u{1F300}-\u{1FAFF}]/gu, "")
    .replace(/[\u2600-\u27BF]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function fallbackLabelFromKey(key) {
  return String(key || "")
    .replace(/^field_/, "")
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function sanitizeLabels(labels, fields) {
  const cleaned = {};
  for (const key of Object.keys(fields)) {
    const raw = labels && typeof labels === "object" ? labels[key] : "";
    const safe = cleanLabelText(raw);
    cleaned[key] = safe || fallbackLabelFromKey(key);
  }
  return cleaned;
}

function buildDisplayFields(fields, labels) {
  return Object.entries(fields).map(([key, value]) => ({
    key,
    label: labels[key] || fallbackLabelFromKey(key),
    value,
  }));
}

function buildRecipients(rawRecipients) {
  return String(rawRecipients || "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
}

function buildFromAddress(env) {
  if (env.RESEND_FROM_EMAIL) {
    return String(env.RESEND_FROM_EMAIL).trim();
  }

  const fromEmail = String(env.CONTACT_FROM_EMAIL || "").trim();
  if (!fromEmail) {
    return "";
  }

  const fromName = String(env.CONTACT_FROM_NAME || "").trim();
  return fromName ? `${fromName} <${fromEmail}>` : fromEmail;
}

function buildNotificationRecipients(env) {
  return buildRecipients(env.FORM_TO_EMAIL || env.CONTACT_TO_EMAIL);
}

function findEmail(fields) {
  const emailKeys = ["email", "owner_email"];
  for (const key of emailKeys) {
    if (fields[key]) return fields[key];
  }
  return "";
}

function findName(fields) {
  const nameKeys = ["name", "owner_name", "pet_name"];
  for (const key of nameKeys) {
    if (fields[key]) return fields[key];
  }
  return "";
}

function findFirstField(fields, candidates) {
  for (const key of candidates) {
    if (fields[key]) return fields[key];
  }
  return "";
}

function getBrandLogo(env) {
  const custom = String(env.SITE_LOGO_URL || "").trim();
  return custom || DEFAULT_LOGO_URL;
}

function renderAdminHtml({ formName, pagePath, pageTitle, displayFields, env }) {
  const rows = displayFields
    .map(({ label, value }) => {
      return `<tr><td style="padding:12px 14px;border:1px solid #d6deea;background:#f7fbff;font-weight:700;color:#1f2937;width:34%;">${escapeHtml(
        label
      )}</td><td style="padding:12px 14px;border:1px solid #d6deea;color:#0f172a;">${escapeHtml(value)}</td></tr>`;
    })
    .join("");

  return `<!doctype html>
  <html>
    <body style="margin:0;background:#eef4fb;font-family:Inter,Segoe UI,Arial,sans-serif;color:#111827;">
      <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="padding:28px 12px;">
        <tr>
          <td align="center">
            <table role="presentation" cellpadding="0" cellspacing="0" width="760" style="max-width:760px;background:#ffffff;border:1px solid #dce6f2;border-radius:14px;overflow:hidden;">
              <tr>
                <td style="padding:18px 22px;background:linear-gradient(90deg,#0d6ea6,#178dc7);">
                  <img src="${escapeHtml(getBrandLogo(env))}" alt="${escapeHtml(
    SITE_NAME
  )}" style="display:block;max-width:230px;height:auto;">
                </td>
              </tr>
              <tr>
                <td style="padding:22px;">
                  <h2 style="margin:0 0 12px;font-size:28px;line-height:1.2;color:#0f172a;">${escapeHtml(formName)}</h2>
                  <p style="margin:0 0 6px;font-size:15px;color:#334155;"><strong>Page:</strong> ${escapeHtml(pageTitle)}</p>
                  <p style="margin:0 0 18px;font-size:15px;color:#334155;"><strong>Path:</strong> ${escapeHtml(pagePath)}</p>
                  <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="border-collapse:collapse;border-radius:10px;overflow:hidden;">
                    <tbody>${rows}</tbody>
                  </table>
                </td>
              </tr>
              <tr>
                <td style="padding:16px 22px;background:#f8fbff;border-top:1px solid #dce6f2;font-size:13px;color:#4b5563;">
                  <div style="font-weight:700;color:#0f172a;">${escapeHtml(SITE_NAME)}</div>
                  <div><a href="${SITE_URL}" style="color:#0b74ab;text-decoration:none;">${SITE_URL}</a></div>
                  <div style="margin-top:6px;">This notification was generated from your website form system.</div>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
  </html>`;
}

function renderAdminText({ formName, pagePath, pageTitle, displayFields }) {
  const lines = displayFields.map(({ label, value }) => `${label}: ${value}`);
  return `${formName}\nPage: ${pageTitle}\nPath: ${pagePath}\n\n${lines.join("\n")}`;
}

function isAppointmentForm({ formId, formName, pagePath }) {
  if (APPOINTMENT_FORM_IDS.has(String(formId || "").trim())) {
    return true;
  }

  const lowerName = String(formName || "").toLowerCase();
  const lowerPath = String(pagePath || "").toLowerCase();
  return lowerName.includes("appointment") || lowerPath.includes("get-an-appointment");
}

function renderAutoReplyHtml({ visitorName }) {
  const safeName = escapeHtml(visitorName || "there");
  return `<!doctype html>
  <html>
    <body style="margin:0;background:#eef4fb;font-family:Inter,Segoe UI,Arial,sans-serif;color:#111827;">
      <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="padding:28px 12px;">
        <tr>
          <td align="center">
            <table role="presentation" cellpadding="0" cellspacing="0" width="680" style="max-width:680px;background:#ffffff;border:1px solid #dce6f2;border-radius:14px;overflow:hidden;">
              <tr>
                <td style="padding:18px 22px;background:linear-gradient(90deg,#0d6ea6,#178dc7);">
                  <img src="${escapeHtml(DEFAULT_LOGO_URL)}" alt="${escapeHtml(
    SITE_NAME
  )}" style="display:block;max-width:230px;height:auto;">
                </td>
              </tr>
              <tr>
                <td style="padding:22px;">
                  <h2 style="margin:0 0 14px;font-size:26px;line-height:1.2;color:#0f172a;">Appointment Request Received</h2>
                  <p style="margin:0 0 12px;font-size:15px;line-height:1.65;color:#334155;">Hi ${safeName},</p>
                  <p style="margin:0 0 12px;font-size:15px;line-height:1.65;color:#334155;">Thank you for contacting ${escapeHtml(
    SITE_NAME
  )}. We have received your appointment request and our team will review it shortly.</p>
                  <p style="margin:0 0 12px;font-size:15px;line-height:1.65;color:#334155;">If needed, we may contact you for additional details to confirm date and time.</p>
                  <p style="margin:0;font-size:15px;line-height:1.65;color:#334155;">Warm regards,<br><strong>${escapeHtml(
    SITE_NAME
  )}</strong></p>
                </td>
              </tr>
              <tr>
                <td style="padding:16px 22px;background:#f8fbff;border-top:1px solid #dce6f2;font-size:13px;color:#4b5563;">
                  <div><a href="${SITE_URL}" style="color:#0b74ab;text-decoration:none;">${SITE_URL}</a></div>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
  </html>`;
}

function renderAutoReplyText({ visitorName }) {
  return `Hi ${visitorName || "there"},

Thank you for contacting ${SITE_NAME}. We have received your appointment request and our team will review it shortly.

Warm regards,
${SITE_NAME}
${SITE_URL}`;
}

async function sendResendEmail(env, payload) {
  return fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
}

export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: {
      Allow: "OPTIONS, POST",
    },
  });
}

export async function onRequestPost(context) {
  const { request, env } = context;
  const requestUrl = new URL(request.url);
  const origin = request.headers.get("Origin");
  const fromAddress = buildFromAddress(env);
  const recipients = buildNotificationRecipients(env);

  if (origin && origin !== requestUrl.origin) {
    return json({ error: "Cross-site form submissions are not allowed." }, 403);
  }

  if (!env.RESEND_API_KEY || !fromAddress || !recipients.length) {
    return json(
      {
        error:
          "Form delivery is not configured yet. Add RESEND_API_KEY plus either RESEND_FROM_EMAIL/FORM_TO_EMAIL or CONTACT_FROM_EMAIL/CONTACT_TO_EMAIL in Cloudflare Pages.",
      },
      503
    );
  }

  let payload;
  try {
    payload = await request.json();
  } catch {
    return json({ error: "Invalid JSON payload." }, 400);
  }

  if (payload?.honeypot) {
    return json({ ok: true, message: "Thanks. Your message has been sent." });
  }

  const formName = String(payload?.formName || "Website Form").trim().slice(0, 120);
  const formId = String(payload?.formId || "").trim().slice(0, 80);
  const pagePath = String(payload?.pagePath || "/").trim().slice(0, 200);
  const pageTitle = String(payload?.pageTitle || "Unknown Page").trim().slice(0, 200);
  const fields = sanitizeFields(payload?.fields);
  const labels = sanitizeLabels(payload?.labels, fields);
  const displayFields = buildDisplayFields(fields, labels);

  if (!Object.keys(fields).length) {
    return json({ error: "No form fields were submitted." }, 400);
  }

  const replyTo = findEmail(fields);
  const personName = findName(fields);

  const subjectSuffix = personName ? ` - ${personName}` : "";
  const subject = `[grandwestvet.com] ${formName}${subjectSuffix}`.slice(0, 200);

  const resendResponse = await sendResendEmail(env, {
    from: fromAddress,
    to: recipients,
    subject,
    html: renderAdminHtml({ formName, pagePath, pageTitle, displayFields, env }),
    text: renderAdminText({ formName, pagePath, pageTitle, displayFields }),
    replyTo: replyTo || undefined,
    tags: [
      { name: "site", value: "grandwestvet" },
      { name: "form", value: formName.toLowerCase().replace(/[^a-z0-9_-]+/g, "-").slice(0, 256) || "website-form" },
      { name: "form_id", value: formId || "none" },
    ],
  });

  if (!resendResponse.ok) {
    const errorBody = await resendResponse.text();
    return json(
      {
        error: "Resend rejected the submission.",
        details: errorBody.slice(0, 2000),
      },
      502
    );
  }

  if (replyTo && isAppointmentForm({ formId, formName, pagePath })) {
    const visitorName =
      findFirstField(fields, ["name", "owner_name", "pet_name"]) ||
      "there";
    await sendResendEmail(env, {
      from: fromAddress,
      to: [replyTo],
      subject: "We received your appointment request - Grand Ave. Pet Hospital",
      html: renderAutoReplyHtml({ visitorName }),
      text: renderAutoReplyText({ visitorName }),
      replyTo: recipients[0] || undefined,
      tags: [
        { name: "site", value: "grandwestvet" },
        { name: "type", value: "appointment-auto-reply" },
      ],
    });
  }

  return json({
    ok: true,
    message: "Thanks. Your message has been sent.",
  });
}
