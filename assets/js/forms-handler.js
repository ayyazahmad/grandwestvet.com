(function () {
  const FORM_SELECTOR = "form.elementor-form";
  const ENDPOINT = "/api/forms";
  const STATUS_CLASS = "cf-form-status";
  const HONEYPOT_NAME = "company_website";
  const IGNORED_FIELDS = new Set([
    "post_id",
    "form_id",
    "queried_id",
    "referer_title",
    "altcha_token",
  ]);

  function normalizeFieldName(name) {
    const match = /^form_fields\[(.+)\]$/.exec(name);
    return match ? match[1] : name;
  }

  function humanize(name) {
    return name
      .replace(/^field_/, "")
      .replace(/[_-]+/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .replace(/\b\w/g, (letter) => letter.toUpperCase());
  }

  function getFormLabel(form) {
    return (
      form.getAttribute("aria-label") ||
      form.getAttribute("name") ||
      form.getAttribute("id") ||
      "Website Form"
    );
  }

  function ensureStatusElement(form) {
    let status = form.querySelector("." + STATUS_CLASS);
    if (status) return status;

    status = document.createElement("div");
    status.className = STATUS_CLASS;
    status.setAttribute("aria-live", "polite");
    status.style.marginTop = "12px";
    status.style.fontSize = "14px";
    status.style.lineHeight = "1.5";

    const buttons = form.querySelector(".e-form__buttons");
    if (buttons && buttons.parentNode) {
      buttons.parentNode.insertBefore(status, buttons.nextSibling);
    } else {
      form.appendChild(status);
    }

    return status;
  }

  function setStatus(form, kind, message) {
    const status = ensureStatusElement(form);
    status.textContent = message;
    status.style.color = kind === "error" ? "#b42318" : "#0f766e";
  }

  function setSubmitting(form, isSubmitting) {
    const submit = form.querySelector('button[type="submit"], input[type="submit"]');
    if (!submit) return;

    if (!submit.dataset.originalLabel) {
      submit.dataset.originalLabel = submit.textContent.trim();
    }

    submit.disabled = isSubmitting;
    if (submit.tagName === "BUTTON") {
      const textNode = submit.querySelector(".elementor-button-text");
      if (textNode) {
        textNode.textContent = isSubmitting ? "Sending..." : submit.dataset.originalLabel;
      } else {
        submit.textContent = isSubmitting ? "Sending..." : submit.dataset.originalLabel;
      }
    } else {
      submit.value = isSubmitting ? "Sending..." : submit.dataset.originalLabel;
    }
  }

  function removeStaticOnlyNoise(form) {
    form.querySelectorAll(".elementor-field-type-recaptcha_v3").forEach((node) => {
      node.remove();
    });

    form
      .querySelectorAll(".elementor-g-recaptcha, .g-recaptcha")
      .forEach((node) => {
        const group = node.closest(".elementor-field-group");
        if (group) {
          group.remove();
        } else {
          node.remove();
        }
      });

    form
      .querySelectorAll(".lpsc-container, .lpsc-wrapper, .lpsc-error-msg")
      .forEach((node) => {
        const container = node.closest(".lpsc-container");
        if (container) {
          container.remove();
        } else {
          node.remove();
        }
      });
  }

  function addHoneypot(form) {
    if (form.querySelector('input[name="' + HONEYPOT_NAME + '"]')) return;

    const wrapper = document.createElement("div");
    wrapper.style.position = "absolute";
    wrapper.style.left = "-9999px";
    wrapper.style.opacity = "0";
    wrapper.setAttribute("aria-hidden", "true");

    const input = document.createElement("input");
    input.type = "text";
    input.name = HONEYPOT_NAME;
    input.tabIndex = -1;
    input.autocomplete = "off";

    wrapper.appendChild(input);
    form.appendChild(wrapper);
  }

  function buildPayload(form) {
    const formData = new FormData(form);
    const fields = {};

    for (const [rawName, rawValue] of formData.entries()) {
      if (IGNORED_FIELDS.has(rawName) || rawName === HONEYPOT_NAME) {
        continue;
      }

      if (typeof rawValue !== "string") {
        continue;
      }

      const key = normalizeFieldName(rawName);
      if (!key) continue;

      const value = rawValue.trim();
      if (!value) continue;

      if (Object.prototype.hasOwnProperty.call(fields, key)) {
        if (Array.isArray(fields[key])) {
          fields[key].push(value);
        } else {
          fields[key] = [fields[key], value];
        }
      } else {
        fields[key] = value;
      }
    }

    return {
      formName: getFormLabel(form),
      pagePath: window.location.pathname,
      pageTitle: document.title,
      fields,
      labels: Object.keys(fields).reduce((acc, key) => {
        acc[key] = humanize(key);
        return acc;
      }, {}),
      honeypot: (formData.get(HONEYPOT_NAME) || "").toString(),
    };
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const form = event.currentTarget;
    if (!form.reportValidity()) return;

    const payload = buildPayload(form);
    if (!Object.keys(payload.fields).length) {
      setStatus(form, "error", "This form is missing usable fields.");
      return;
    }

    setSubmitting(form, true);
    setStatus(form, "success", "Sending your message...");

    try {
      const response = await fetch(ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json().catch(function () {
        return {};
      });

      if (!response.ok) {
        throw new Error(result.error || "Unable to submit the form right now.");
      }

      form.reset();
      setStatus(form, "success", result.message || "Thanks. Your message has been sent.");
    } catch (error) {
      setStatus(
        form,
        "error",
        error instanceof Error ? error.message : "Unable to submit the form right now."
      );
    } finally {
      setSubmitting(form, false);
    }
  }

  function initForm(form) {
    if (form.dataset.cfStaticReady === "1") return;
    form.dataset.cfStaticReady = "1";
    removeStaticOnlyNoise(form);
    addHoneypot(form);
    ensureStatusElement(form);
    form.addEventListener("submit", handleSubmit);
  }

  document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll(FORM_SELECTOR).forEach(initForm);
  });
})();
