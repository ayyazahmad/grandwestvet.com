(() => {
  const STYLE_ID = "static-gallery-fallback-style";
  const MODAL_ID = "static-gallery-lightbox";

  function ensureStyle() {
    if (document.getElementById(STYLE_ID)) {
      return;
    }

    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = `
      .elementor-widget-gallery.static-gallery-ready .elementor-gallery__container {
        display: grid !important;
        gap: var(--static-gallery-gap, 21px) !important;
        grid-template-columns: repeat(var(--static-gallery-columns, 4), minmax(0, 1fr)) !important;
      }

      .elementor-widget-gallery.static-gallery-ready .elementor-gallery-item {
        display: block;
        width: 100% !important;
      }

      .elementor-widget-gallery.static-gallery-ready .elementor-gallery-item__overlay,
      .elementor-widget-gallery.static-gallery-ready .elementor-gallery-item__content {
        opacity: 0;
        transition: opacity 0.24s ease, transform 0.24s ease;
      }

      .elementor-widget-gallery.static-gallery-ready .elementor-gallery-item__content {
        transform: translateY(10px);
      }

      .elementor-widget-gallery.static-gallery-ready .elementor-gallery-item:hover .elementor-gallery-item__overlay,
      .elementor-widget-gallery.static-gallery-ready .elementor-gallery-item:focus .elementor-gallery-item__overlay,
      .elementor-widget-gallery.static-gallery-ready .elementor-gallery-item:hover .elementor-gallery-item__content,
      .elementor-widget-gallery.static-gallery-ready .elementor-gallery-item:focus .elementor-gallery-item__content,
      .elementor-widget-gallery.static-gallery-ready .elementor-gallery-item:focus-within .elementor-gallery-item__overlay,
      .elementor-widget-gallery.static-gallery-ready .elementor-gallery-item:focus-within .elementor-gallery-item__content {
        opacity: 1;
      }

      .elementor-widget-gallery.static-gallery-ready .elementor-gallery-item:hover .elementor-gallery-item__content,
      .elementor-widget-gallery.static-gallery-ready .elementor-gallery-item:focus .elementor-gallery-item__content,
      .elementor-widget-gallery.static-gallery-ready .elementor-gallery-item:focus-within .elementor-gallery-item__content {
        transform: translateY(0);
      }

      .elementor-widget-gallery.static-gallery-ready .elementor-gallery-item__image {
        aspect-ratio: var(--static-gallery-aspect-ratio, 1 / 1);
        background-position: center;
        background-repeat: no-repeat;
        background-size: cover;
        display: block;
        filter: none !important;
        opacity: 1 !important;
        transform: none !important;
        width: 100%;
      }

      .elementor-widget-gallery.static-gallery-ready .elementor-gallery-item__image.e-gallery-image {
        padding-bottom: 0 !important;
      }

      .static-gallery-lightbox {
        align-items: center;
        background: rgba(10, 16, 24, 0.82);
        backdrop-filter: blur(6px);
        display: flex;
        inset: 0;
        justify-content: center;
        padding: 24px;
        position: fixed;
        z-index: 100000;
      }

      .static-gallery-lightbox[hidden] {
        display: none;
      }

      .static-gallery-lightbox__dialog {
        background: #ffffff;
        border-radius: 20px;
        box-shadow: 0 24px 70px rgba(15, 23, 42, 0.28);
        max-height: calc(100vh - 48px);
        max-width: min(1000px, calc(100vw - 48px));
        overflow: hidden;
        position: relative;
        width: auto;
      }

      .static-gallery-lightbox__close {
        appearance: none;
        background: rgba(255, 255, 255, 0.94);
        border: 0;
        border-radius: 999px;
        color: #111827;
        cursor: pointer;
        font-size: 28px;
        height: 42px;
        line-height: 1;
        position: absolute;
        right: 14px;
        top: 14px;
        width: 42px;
        z-index: 2;
      }

      .static-gallery-lightbox__image {
        display: block;
        height: auto;
        max-height: calc(100vh - 140px);
        max-width: min(1000px, calc(100vw - 48px));
        width: auto;
      }

      .static-gallery-lightbox__caption {
        color: #212528;
        font-family: var(--e-global-typography-520c191-font-family, inherit), sans-serif;
        font-size: 16px;
        font-weight: 700;
        line-height: 1.4;
        padding: 16px 20px 20px;
      }

      @media (max-width: 1024px) {
        .elementor-widget-gallery.static-gallery-ready .elementor-gallery__container {
          gap: var(--static-gallery-gap-tablet, var(--static-gallery-gap, 21px)) !important;
          grid-template-columns: repeat(var(--static-gallery-columns-tablet, 3), minmax(0, 1fr)) !important;
        }
      }

      @media (max-width: 767px) {
        .elementor-widget-gallery.static-gallery-ready .elementor-gallery__container {
          gap: var(--static-gallery-gap-mobile, var(--static-gallery-gap, 14px)) !important;
          grid-template-columns: repeat(var(--static-gallery-columns-mobile, 2), minmax(0, 1fr)) !important;
        }
      }
    `;

    document.head.appendChild(style);
  }

  function ensureModal() {
    let modal = document.getElementById(MODAL_ID);
    if (modal) {
      return modal;
    }

    modal = document.createElement("div");
    modal.id = MODAL_ID;
    modal.className = "static-gallery-lightbox";
    modal.hidden = true;
    modal.innerHTML = `
      <div class="static-gallery-lightbox__dialog" role="dialog" aria-modal="true" aria-label="Image preview">
        <button type="button" class="static-gallery-lightbox__close" aria-label="Close image preview">×</button>
        <img class="static-gallery-lightbox__image" alt="">
        <div class="static-gallery-lightbox__caption" hidden></div>
      </div>
    `;

    document.body.appendChild(modal);

    modal.addEventListener("click", (event) => {
      if (event.target === modal || event.target.closest(".static-gallery-lightbox__close")) {
        closeModal();
      }
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && !modal.hidden) {
        closeModal();
      }
    });

    return modal;
  }

  function openModal(src, captionText) {
    const modal = ensureModal();
    const image = modal.querySelector(".static-gallery-lightbox__image");
    const caption = modal.querySelector(".static-gallery-lightbox__caption");

    image.src = src;
    image.alt = captionText || "";

    if (captionText) {
      caption.hidden = false;
      caption.textContent = captionText;
    } else {
      caption.hidden = true;
      caption.textContent = "";
    }

    modal.hidden = false;
    document.body.style.overflow = "hidden";
  }

  function closeModal() {
    const modal = document.getElementById(MODAL_ID);
    if (!modal) {
      return;
    }

    const image = modal.querySelector(".static-gallery-lightbox__image");
    const caption = modal.querySelector(".static-gallery-lightbox__caption");

    modal.hidden = true;
    image.removeAttribute("src");
    image.alt = "";
    caption.hidden = true;
    caption.textContent = "";
    document.body.style.overflow = "";
  }

  function parseSettings(widget) {
    const raw = widget.getAttribute("data-settings");
    if (!raw) {
      return {};
    }

    try {
      return JSON.parse(raw);
    } catch {
      return {};
    }
  }

  function getSizeValue(setting, fallback) {
    if (setting && typeof setting === "object" && setting.size !== undefined && setting.size !== null && setting.size !== "") {
      return `${setting.size}px`;
    }

    return fallback;
  }

  function prepareWidget(widget) {
    const container = widget.querySelector(".elementor-gallery__container");
    if (!container) {
      return;
    }

    const settings = parseSettings(widget);
    widget.classList.add("static-gallery-ready");

    widget.style.setProperty("--static-gallery-columns", String(settings.columns || 4));
    widget.style.setProperty("--static-gallery-columns-tablet", String(settings.columns_tablet || Math.min(settings.columns || 4, 3)));
    widget.style.setProperty("--static-gallery-columns-mobile", String(settings.columns_mobile || 2));
    widget.style.setProperty("--static-gallery-gap", getSizeValue(settings.gap, "21px"));
    widget.style.setProperty("--static-gallery-gap-tablet", getSizeValue(settings.gap_tablet, getSizeValue(settings.gap, "21px")));
    widget.style.setProperty("--static-gallery-gap-mobile", getSizeValue(settings.gap_mobile, "14px"));

    const aspectRatio = String(settings.aspect_ratio || "1:1").replace(":", " / ");
    widget.style.setProperty("--static-gallery-aspect-ratio", aspectRatio);

    container.querySelectorAll(".elementor-gallery-item__image").forEach((image) => {
      const thumbnail = image.getAttribute("data-thumbnail");
      if (thumbnail) {
        image.style.backgroundImage = `url('${thumbnail}')`;
      }
      image.classList.add("e-gallery-image-loaded");
    });

    if (window.location.protocol === "file:") {
      container.querySelectorAll(".elementor-gallery-item").forEach((item) => {
        item.addEventListener("click", (event) => {
          event.preventDefault();

          const src = item.getAttribute("href");
          const captionText =
            item.getAttribute("data-elementor-lightbox-title") ||
            item.querySelector(".elementor-gallery-item__title")?.textContent?.trim() ||
            "";

          if (src) {
            openModal(src, captionText);
          }
        });
      });
    }
  }

  function init() {
    const widgets = document.querySelectorAll(".elementor-widget-gallery");
    if (!widgets.length) {
      return;
    }

    ensureStyle();
    widgets.forEach(prepareWidget);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
