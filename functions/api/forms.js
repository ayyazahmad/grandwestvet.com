const JSON_HEADERS = {
  "Content-Type": "application/json; charset=utf-8",
  "Cache-Control": "no-store",
};

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

function renderHtml({ formName, pagePath, pageTitle, fields }) {
  const rows = Object.entries(fields)
    .map(([key, value]) => {
      return `<tr><td style="padding:8px 12px;border:1px solid #d0d7de;font-weight:600;background:#f6f8fa;">${escapeHtml(
        key
      )}</td><td style="padding:8px 12px;border:1px solid #d0d7de;">${escapeHtml(value)}</td></tr>`;
    })
    .join("");

  return `
    <div style="font-family:Arial,sans-serif;color:#111827;">
      <h2 style="margin-bottom:8px;">${escapeHtml(formName)}</h2>
      <p style="margin:0 0 6px;"><strong>Page:</strong> ${escapeHtml(pageTitle)}</p>
      <p style="margin:0 0 18px;"><strong>Path:</strong> ${escapeHtml(pagePath)}</p>
      <table style="border-collapse:collapse;width:100%;max-width:720px;">
        <tbody>${rows}</tbody>
      </table>
    </div>
  `;
}

function renderText({ formName, pagePath, pageTitle, fields }) {
  const lines = Object.entries(fields).map(([key, value]) => `${key}: ${value}`);
  return `${formName}\nPage: ${pageTitle}\nPath: ${pagePath}\n\n${lines.join("\n")}`;
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
  const pagePath = String(payload?.pagePath || "/").trim().slice(0, 200);
  const pageTitle = String(payload?.pageTitle || "Unknown Page").trim().slice(0, 200);
  const fields = sanitizeFields(payload?.fields);

  if (!Object.keys(fields).length) {
    return json({ error: "No form fields were submitted." }, 400);
  }

  const replyTo = findEmail(fields);
  const personName = findName(fields);

  const subjectSuffix = personName ? ` - ${personName}` : "";
  const subject = `[grandwestvet.com] ${formName}${subjectSuffix}`.slice(0, 200);

  const resendResponse = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: fromAddress,
      to: recipients,
      subject,
      html: renderHtml({ formName, pagePath, pageTitle, fields }),
      text: renderText({ formName, pagePath, pageTitle, fields }),
      replyTo: replyTo || undefined,
      tags: [
        { name: "site", value: "grandwestvet" },
        { name: "form", value: formName.toLowerCase().replace(/[^a-z0-9_-]+/g, "-").slice(0, 256) || "website-form" },
      ],
    }),
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

  return json({
    ok: true,
    message: "Thanks. Your message has been sent.",
  });
}
