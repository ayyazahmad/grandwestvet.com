(() => {
  const DESKTOP_MIN_WIDTH = 1025;
  const STYLE_ID = "static-nav-menu-fallback-style";
  const MODAL_BODY_CLASS = "static-nav-modal-open";

  function ensureStyle() {
    if (document.getElementById(STYLE_ID)) {
      return;
    }

    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = `
      .elementor-widget-nav-menu.static-nav-ready {
        --static-nav-accent: var(--e-global-color-d49ac81, #0073aa);
        --static-nav-text: var(--e-global-color-secondary, #212528);
        --static-nav-muted: rgba(33, 37, 40, 0.62);
        --static-nav-highlight: rgba(0, 115, 170, 0.06);
        --static-nav-active-bg: rgba(0, 115, 170, 0.09);
        --static-nav-shadow: 0 24px 55px rgba(15, 23, 42, 0.14), 0 10px 24px rgba(15, 23, 42, 0.08);
      }

      .elementor-widget-nav-menu.static-nav-ready .elementor-nav-menu,
      .elementor-widget-nav-menu.static-nav-ready .elementor-nav-menu ul {
        list-style: none;
        margin: 0;
        padding: 0;
      }

      .elementor-widget-nav-menu.static-nav-ready .elementor-widget-container {
        padding-block: 12px;
      }

      .elementor-widget-nav-menu.static-nav-ready .elementor-nav-menu li,
      .elementor-widget-nav-menu.static-nav-ready .elementor-nav-menu a {
        position: relative;
      }

      .elementor-widget-nav-menu.static-nav-ready .menu-item-has-children {
        position: relative;
      }

      .elementor-widget-nav-menu.static-nav-ready .menu-item-has-children > a::after,
      .elementor-widget-nav-menu.static-nav-ready .menu-item-has-children > a .sub-arrow,
      .elementor-widget-nav-menu.static-nav-ready .menu-item-has-children > a .e-font-icon-svg,
      .elementor-widget-nav-menu.static-nav-ready .menu-item-has-children > a i {
        content: none !important;
        display: none !important;
      }

      .elementor-widget-nav-menu.static-nav-ready .submenu-toggle {
        all: unset;
        align-items: center;
        border-radius: 999px;
        color: var(--static-nav-muted);
        cursor: pointer;
        display: inline-flex;
        flex: 0 0 auto;
        font-family: var(--e-global-typography-520c191-font-family, inherit), sans-serif;
        font-size: 18px;
        font-weight: 800;
        justify-content: center;
        line-height: 1;
        padding: 8px 10px;
        transition: background-color 0.22s ease, color 0.22s ease, transform 0.22s ease;
      }

      .elementor-widget-nav-menu.static-nav-ready .submenu-toggle::before {
        content: "+";
      }

      .elementor-widget-nav-menu.static-nav-ready .menu-item-has-children.menu-open > .submenu-toggle::before,
      .elementor-widget-nav-menu.static-nav-ready .menu-item-has-children:hover > .submenu-toggle::before,
      .elementor-widget-nav-menu.static-nav-ready .menu-item-has-children:focus-within > .submenu-toggle::before {
        content: "−";
      }

      .elementor-widget-nav-menu.static-nav-ready .menu-item-has-children.menu-open > .submenu-toggle,
      .elementor-widget-nav-menu.static-nav-ready .menu-item-has-children:hover > .submenu-toggle,
      .elementor-widget-nav-menu.static-nav-ready .menu-item-has-children:focus-within > .submenu-toggle {
        background: transparent;
        color: var(--static-nav-accent);
        transform: none;
      }

      .elementor-widget-nav-menu.static-nav-ready .elementor-nav-menu--main > .elementor-nav-menu {
        align-items: center;
        display: flex;
        flex-wrap: nowrap;
        gap: clamp(14px, 1.8vw, 24px);
        padding-block: 2px;
      }

      .elementor-widget-nav-menu.static-nav-ready .elementor-nav-menu--main > .elementor-nav-menu > li {
        align-items: center;
        display: flex;
        flex: 0 0 auto;
        gap: 8px;
      }

      .elementor-widget-nav-menu.static-nav-ready .elementor-nav-menu--main > .elementor-nav-menu > li > a,
      .elementor-widget-nav-menu.static-nav-ready .elementor-nav-menu--main > .elementor-nav-menu > li > a.elementor-item {
        align-items: center;
        border-radius: 0;
        box-sizing: border-box;
        color: var(--static-nav-text);
        display: inline-flex;
        font-weight: 700;
        line-height: 1.1;
        margin-inline: 0;
        padding: 14px 0 !important;
        transition: color 0.22s ease, background-color 0.22s ease, transform 0.22s ease;
        white-space: nowrap;
      }

      .elementor-widget-nav-menu.static-nav-ready .elementor-nav-menu--main > .elementor-nav-menu > li.menu-open > a,
      .elementor-widget-nav-menu.static-nav-ready .elementor-nav-menu--main > .elementor-nav-menu > li:hover > a,
      .elementor-widget-nav-menu.static-nav-ready .elementor-nav-menu--main > .elementor-nav-menu > li:focus-within > a {
        background: transparent;
        color: var(--static-nav-accent);
        transform: none;
      }

      .elementor-widget-nav-menu.static-nav-ready .elementor-nav-menu--main > .elementor-nav-menu > li.current-menu-item > a,
      .elementor-widget-nav-menu.static-nav-ready .elementor-nav-menu--main > .elementor-nav-menu > li.current_page_item > a {
        background: transparent;
        color: var(--static-nav-accent);
        transform: none;
      }

      .elementor-widget-nav-menu.static-nav-ready .elementor-nav-menu--main > .elementor-nav-menu > li > .sub-menu {
        background: rgba(255, 255, 255, 0.98);
        border: 1px solid rgba(0, 115, 170, 0.08);
        border-radius: 22px;
        box-shadow: var(--static-nav-shadow);
        display: block !important;
        left: 0;
        min-width: 380px;
        opacity: 0 !important;
        padding: 10px 0;
        pointer-events: none !important;
        position: absolute;
        top: calc(100% + 12px);
        transform: translateY(12px) scale(0.98) !important;
        transform-origin: top left;
        transition: opacity 0.22s ease, transform 0.22s ease, visibility 0.22s ease;
        visibility: hidden !important;
        z-index: 9998;
      }

      .elementor-widget-nav-menu.static-nav-ready .elementor-nav-menu--main > .elementor-nav-menu > li.current-menu-ancestor > .sub-menu,
      .elementor-widget-nav-menu.static-nav-ready .elementor-nav-menu--main > .elementor-nav-menu > li.current-menu-parent > .sub-menu,
      .elementor-widget-nav-menu.static-nav-ready .elementor-nav-menu--main > .elementor-nav-menu > li.current_page_parent > .sub-menu,
      .elementor-widget-nav-menu.static-nav-ready .elementor-nav-menu--main > .elementor-nav-menu > li.current_page_ancestor > .sub-menu {
        opacity: 0 !important;
        pointer-events: none !important;
        transform: translateY(12px) scale(0.98) !important;
        visibility: hidden !important;
      }

      .elementor-widget-nav-menu.static-nav-ready .elementor-nav-menu--main > .elementor-nav-menu > li.menu-open > .sub-menu,
      .elementor-widget-nav-menu.static-nav-ready .elementor-nav-menu--main > .elementor-nav-menu > li:hover > .sub-menu,
      .elementor-widget-nav-menu.static-nav-ready .elementor-nav-menu--main > .elementor-nav-menu > li:focus-within > .sub-menu {
        opacity: 1 !important;
        pointer-events: auto !important;
        transform: translateY(0) scale(1) !important;
        visibility: visible !important;
      }

      .elementor-widget-nav-menu.static-nav-ready .elementor-nav-menu--main > .elementor-nav-menu > li > .sub-menu::before {
        background: rgba(255, 255, 255, 0.98);
        border-left: 1px solid rgba(0, 115, 170, 0.08);
        border-top: 1px solid rgba(0, 115, 170, 0.08);
        content: "";
        height: 16px;
        left: 26px;
        position: absolute;
        top: -8px;
        transform: rotate(45deg);
        width: 16px;
      }

      .elementor-widget-nav-menu.static-nav-ready .elementor-nav-menu--main > .elementor-nav-menu > li.submenu-mega > .sub-menu {
        display: block;
        gap: 0;
        grid-template-columns: none;
        min-width: 380px;
      }

      .elementor-widget-nav-menu.static-nav-ready .elementor-nav-menu--main > .elementor-nav-menu > li.submenu-mega > .sub-menu > li {
        display: block;
      }

      .elementor-widget-nav-menu.static-nav-ready .sub-menu > li > a {
        align-items: center;
        border-radius: 0;
        color: var(--static-nav-text);
        display: flex;
        font-size: 16px;
        font-weight: 700;
        line-height: 1.35;
        min-height: 0;
        padding: 12px 22px;
        transition: background-color 0.22s ease, color 0.22s ease;
        white-space: normal;
        width: 100%;
      }

      .elementor-widget-nav-menu.static-nav-ready .sub-menu > li > a:hover,
      .elementor-widget-nav-menu.static-nav-ready .sub-menu > li > a:focus {
        background: rgba(0, 115, 170, 0.08);
        color: var(--static-nav-accent);
        transform: none;
      }

      .elementor-widget-nav-menu.static-nav-ready .sub-menu > li.current-menu-item > a,
      .elementor-widget-nav-menu.static-nav-ready .sub-menu > li.current_page_item > a {
        background: var(--static-nav-accent);
        color: #fff;
        transform: none;
      }

      .elementor-widget-nav-menu.static-nav-ready .elementor-menu-toggle {
        transition: transform 0.2s ease;
      }

      .elementor-widget-nav-menu.static-nav-ready .elementor-menu-toggle:hover,
      .elementor-widget-nav-menu.static-nav-ready .elementor-menu-toggle:focus {
        transform: scale(1.04);
      }

      :root {
        --static-scroll-header-height: 0px;
      }

      .static-scroll-header-target {
        left: 0;
        position: fixed !important;
        right: 0;
        top: 0;
        transition: top 0.28s ease;
        will-change: top;
        z-index: 120500 !important;
      }

      .static-scroll-header-target.static-scroll-header-hidden {
        top: calc(-1 * var(--static-scroll-header-height) - 10px) !important;
      }

      .static-nav-mobile-overlay {
        display: none;
      }

      .static-header-search-btn {
        align-items: center;
        background: #ffffff;
        border: 1px solid rgba(0, 115, 170, 0.18);
        border-radius: 999px;
        color: var(--static-nav-accent);
        cursor: pointer;
        display: inline-flex;
        height: 44px;
        justify-content: center;
        margin-left: 12px;
        padding: 0;
        transition: background-color 0.2s ease, transform 0.2s ease;
        width: 44px;
      }

      .static-header-search-btn:hover,
      .static-header-search-btn:focus {
        background: rgba(0, 115, 170, 0.08);
        transform: translateY(-1px);
      }

      .static-header-search-btn svg {
        display: block;
        height: 20px;
        width: 20px;
      }

      .static-search-panel {
        background: rgba(255, 255, 255, 0.99);
        border: 1px solid rgba(0, 115, 170, 0.14);
        border-radius: 16px;
        box-shadow: 0 24px 50px rgba(15, 23, 42, 0.16);
        max-width: min(560px, calc(100vw - 24px));
        opacity: 0;
        padding: 16px;
        pointer-events: none;
        position: fixed;
        right: 12px;
        top: calc(var(--static-scroll-header-height) + 12px);
        transform: translateY(-8px);
        transition: opacity 0.2s ease, transform 0.2s ease, visibility 0.2s ease;
        visibility: hidden;
        width: 560px;
        z-index: 2147483601;
      }

      .static-search-panel.is-open {
        opacity: 1;
        pointer-events: auto;
        transform: translateY(0);
        visibility: visible;
      }

      .static-search-form {
        align-items: center;
        display: flex;
        gap: 10px;
      }

      .static-search-input {
        border: 1px solid rgba(0, 115, 170, 0.25);
        border-radius: 12px;
        color: #0f172a;
        flex: 1 1 auto;
        font-size: 16px;
        min-height: 46px;
        padding: 10px 14px;
      }

      .static-search-submit {
        background: var(--static-nav-accent);
        border: 0;
        border-radius: 12px;
        color: #fff;
        cursor: pointer;
        font-size: 15px;
        font-weight: 700;
        min-height: 46px;
        padding: 0 16px;
      }

      .static-search-suggestions {
        list-style: none;
        margin: 12px 0 0;
        max-height: 260px;
        overflow-y: auto;
        padding: 0;
      }

      .static-search-suggestions li {
        border-bottom: 1px solid rgba(0, 115, 170, 0.1);
        margin: 0;
      }

      .static-search-suggestions a {
        color: #0f172a;
        display: block;
        font-size: 14px;
        font-weight: 700;
        padding: 10px 6px;
        text-decoration: none;
      }

      .static-search-suggestions a small {
        color: #475569;
        display: block;
        font-size: 12px;
        font-weight: 500;
        margin-top: 2px;
      }

      @media (max-width: 1024px) {
        body.${MODAL_BODY_CLASS} {
          overflow: hidden;
        }

        .elementor-widget-nav-menu.static-nav-ready .elementor-menu-toggle .elementor-menu-toggle__icon--close {
          display: none !important;
        }

        .elementor-widget-nav-menu.static-nav-ready .elementor-menu-toggle.elementor-active .elementor-menu-toggle__icon--open {
          display: none !important;
        }

        .elementor-widget-nav-menu.static-nav-ready .elementor-menu-toggle.elementor-active .elementor-menu-toggle__icon--close {
          display: inline-block !important;
        }

        .static-nav-mobile-overlay {
          background: rgba(10, 10, 10, 0.46);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          bottom: 0;
          left: 0;
          opacity: 0;
          pointer-events: none;
          position: fixed;
          right: 0;
          top: 0;
          transition: opacity 0.25s ease, visibility 0.25s ease;
          visibility: hidden;
          z-index: 2147483000;
        }

        .static-nav-mobile-overlay.is-visible {
          opacity: 1;
          pointer-events: auto;
          visibility: visible;
        }

        .elementor-widget-nav-menu.static-nav-ready .elementor-menu-toggle {
          position: relative;
          z-index: 2147483700;
        }

        .elementor-widget-nav-menu.static-nav-ready .elementor-nav-menu--dropdown.elementor-nav-menu__container {
          bottom: 0.75rem !important;
          background: rgba(255, 255, 255, 0.985);
          border: 1px solid rgba(0, 115, 170, 0.1);
          border-radius: 1.75rem !important;
          box-shadow: var(--static-nav-shadow);
          display: grid;
          gap: 0.7rem;
          grid-template-rows: auto 1fr;
          left: 0.75rem !important;
          margin-top: 0;
          max-height: calc(100dvh - 1.5rem) !important;
          max-width: min(23.5rem, calc(100vw - 1.5rem)) !important;
          min-width: 0;
          opacity: 0;
          overflow-y: auto;
          padding: 1.1rem 1rem !important;
          pointer-events: none;
          position: fixed !important;
          right: auto !important;
          top: 0.75rem !important;
          transform: translateX(calc(-100% - 14px));
          transition: transform 0.3s ease, opacity 0.24s ease, visibility 0.24s ease;
          visibility: hidden;
          width: min(23.5rem, calc(100vw - 1.5rem)) !important;
          z-index: 2147483600;
        }

        .elementor-widget-nav-menu.static-nav-ready .elementor-nav-menu--dropdown .static-modal-head {
          align-items: center;
          border-bottom: 1px solid rgba(0, 115, 170, 0.12);
          display: flex;
          justify-content: space-between;
          margin: 0;
          padding: 0.1rem 0.1rem 0.85rem;
        }

        .elementor-widget-nav-menu.static-nav-ready .elementor-nav-menu--dropdown .static-modal-brand {
          display: inline-flex;
          max-width: calc(100% - 58px);
        }

        .elementor-widget-nav-menu.static-nav-ready .elementor-nav-menu--dropdown .static-modal-brand img {
          display: block;
          height: auto;
          max-width: min(13.5rem, 100%);
          width: 100%;
        }

        .elementor-widget-nav-menu.static-nav-ready .elementor-nav-menu--dropdown .static-modal-close {
          align-items: center;
          background: rgba(255, 255, 255, 0.98);
          border: 1px solid rgba(0, 115, 170, 0.14);
          border-radius: 999px;
          color: var(--static-nav-text);
          cursor: pointer;
          display: inline-flex;
          font-size: 22px;
          font-weight: 400;
          height: 52px;
          justify-content: center;
          line-height: 1;
          box-shadow: 0 10px 22px rgba(15, 23, 42, 0.08);
          transition: background-color 0.2s ease, color 0.2s ease;
          width: 52px;
        }

        .elementor-widget-nav-menu.static-nav-ready .elementor-nav-menu--dropdown .static-modal-close:hover,
        .elementor-widget-nav-menu.static-nav-ready .elementor-nav-menu--dropdown .static-modal-close:focus {
          background: rgba(245, 248, 251, 1);
          color: var(--static-nav-accent);
          outline: none;
        }

        .elementor-widget-nav-menu.static-nav-ready .elementor-nav-menu--dropdown.elementor-nav-menu__container.static-modal-open {
          opacity: 1;
          pointer-events: auto;
          transform: translateX(0);
          visibility: visible;
        }

        .elementor-widget-nav-menu.static-nav-ready .elementor-nav-menu--dropdown .elementor-nav-menu {
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
        }

        .elementor-widget-nav-menu.static-nav-ready .elementor-nav-menu--dropdown .menu-item-has-children,
        .elementor-widget-nav-menu.static-nav-ready .elementor-nav-menu--dropdown .menu-item {
          align-items: stretch;
          display: flex;
          flex-wrap: wrap;
          width: 100%;
        }

        .elementor-widget-nav-menu.static-nav-ready .elementor-nav-menu--dropdown .menu-item > a {
          align-items: center;
          border-radius: 1rem;
          color: var(--static-nav-text);
          display: flex;
          flex: 1 1 auto;
          font-size: 1.02rem;
          font-weight: 700;
          min-height: 54px;
          padding: 0.92rem 1rem;
        }

        .elementor-widget-nav-menu.static-nav-ready .elementor-nav-menu--dropdown .menu-item.current-menu-item > a,
        .elementor-widget-nav-menu.static-nav-ready .elementor-nav-menu--dropdown .menu-item.current_page_item > a,
        .elementor-widget-nav-menu.static-nav-ready .elementor-nav-menu--dropdown .menu-item.menu-open > a,
        .elementor-widget-nav-menu.static-nav-ready .elementor-nav-menu--dropdown .menu-item > a:hover,
        .elementor-widget-nav-menu.static-nav-ready .elementor-nav-menu--dropdown .menu-item > a:focus {
          background: var(--static-nav-highlight);
          color: var(--static-nav-accent);
        }

        .elementor-widget-nav-menu.static-nav-ready .elementor-nav-menu--dropdown .submenu-toggle {
          margin-left: auto;
          padding: 0.9rem 1rem;
        }

        .elementor-widget-nav-menu.static-nav-ready .elementor-nav-menu--dropdown .sub-menu {
          display: block;
          max-height: 0;
          opacity: 0;
          overflow: hidden;
          padding-left: 12px;
          transform: translateY(-6px);
          transition: max-height 0.26s ease, opacity 0.22s ease, transform 0.22s ease;
          width: 100%;
        }

        .elementor-widget-nav-menu.static-nav-ready .elementor-nav-menu--dropdown .menu-open > .sub-menu {
          max-height: 1200px;
          opacity: 1;
          transform: translateY(0);
        }

        .elementor-widget-nav-menu.static-nav-ready .elementor-nav-menu--dropdown .sub-menu > li > a {
          font-size: 15px;
          min-height: 44px;
          padding: 10px 14px;
        }

        .static-header-search-btn {
          height: 40px;
          margin-left: 8px;
          width: 40px;
        }

        .static-search-panel {
          max-width: calc(100vw - 16px);
          right: 8px;
          top: calc(var(--static-scroll-header-height) + 8px);
          width: calc(100vw - 16px);
        }
      }
    `;

    document.head.appendChild(style);
  }

  function isDesktop() {
    return window.innerWidth >= DESKTOP_MIN_WIDTH;
  }

  function setMenuOpen(item, open) {
    item.classList.toggle("menu-open", open);

    const button = item.querySelector(":scope > .submenu-toggle");
    const link = item.querySelector(":scope > a");
    if (button) {
      button.setAttribute("aria-expanded", open ? "true" : "false");
    }
    if (link) {
      link.setAttribute("aria-expanded", open ? "true" : "false");
    }
  }

  function closeChildMenus(item) {
    item.querySelectorAll(".menu-item-has-children.menu-open").forEach((child) => {
      setMenuOpen(child, false);
    });
  }

  function closeSiblingMenus(item) {
    const parent = item.parentElement;
    if (!parent) {
      return;
    }

    Array.from(parent.children).forEach((sibling) => {
      if (sibling !== item && sibling.classList.contains("menu-item-has-children")) {
        closeChildMenus(sibling);
        setMenuOpen(sibling, false);
      }
    });
  }

  function closeAllMenus(widget) {
    widget.querySelectorAll(".menu-item-has-children.menu-open").forEach((item) => {
      setMenuOpen(item, false);
    });
  }

  function prepareMenuItems(menuRoot, widgetId) {
    const items = menuRoot.querySelectorAll(".menu-item-has-children");

    items.forEach((item, index) => {
      const directLink = item.querySelector(":scope > a");
      const directSubmenu = item.querySelector(":scope > .sub-menu");
      if (!directLink || !directSubmenu) {
        return;
      }

      item.classList.add("static-menu-parent");

      if (!directSubmenu.id) {
        directSubmenu.id = `submenu-${widgetId}-${index}`;
      }

      let button = item.querySelector(":scope > .submenu-toggle");
      if (!button) {
        button = document.createElement("button");
        button.type = "button";
        button.className = "submenu-toggle";
        button.setAttribute("aria-label", `Toggle ${directLink.textContent.trim()} submenu`);
        item.insertBefore(button, directSubmenu);
      }

      directLink.setAttribute("aria-haspopup", "true");
      directLink.setAttribute("aria-expanded", "false");
      button.setAttribute("aria-controls", directSubmenu.id);
      button.setAttribute("aria-expanded", "false");
      setMenuOpen(item, false);

      if (menuRoot.closest(".elementor-nav-menu--main") && directSubmenu.children.length >= 8) {
        item.classList.add("submenu-mega");
      }

      button.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();

        const willOpen = !item.classList.contains("menu-open");
        closeSiblingMenus(item);
        setMenuOpen(item, willOpen);
      });

      directLink.addEventListener("click", (event) => {
        const href = directLink.getAttribute("href");
        const canNavigate = href && href !== "#";

        if (isDesktop()) {
          if (!canNavigate) {
            event.preventDefault();
            const willOpen = !item.classList.contains("menu-open");
            closeSiblingMenus(item);
            setMenuOpen(item, willOpen);
          }
          return;
        }

        if (!canNavigate || item.classList.contains("menu-open") === false) {
          event.preventDefault();
          const willOpen = !item.classList.contains("menu-open");
          closeSiblingMenus(item);
          setMenuOpen(item, willOpen);
        }
      });
    });
  }

  function bindDesktopMenu(widget) {
    const mainMenuRoot = widget.querySelector(".elementor-nav-menu--main .elementor-nav-menu");
    if (!mainMenuRoot) {
      return;
    }

    mainMenuRoot.querySelectorAll(":scope > .menu-item-has-children").forEach((item) => {
      item.addEventListener("mouseenter", () => {
        if (!isDesktop()) {
          return;
        }

        closeSiblingMenus(item);
        setMenuOpen(item, true);
      });

      item.addEventListener("mouseleave", () => {
        if (!isDesktop()) {
          return;
        }

        closeChildMenus(item);
        setMenuOpen(item, false);
      });

      item.addEventListener("focusin", () => {
        if (!isDesktop()) {
          return;
        }

        closeSiblingMenus(item);
        setMenuOpen(item, true);
      });

      item.addEventListener("focusout", () => {
        if (!isDesktop()) {
          return;
        }

        window.setTimeout(() => {
          if (!item.contains(document.activeElement)) {
            closeChildMenus(item);
            setMenuOpen(item, false);
          }
        }, 0);
      });
    });

    document.addEventListener("pointerdown", (event) => {
      if (!isDesktop()) {
        return;
      }

      if (!widget.contains(event.target)) {
        closeAllMenus(widget);
      }
    });
  }

  function ensureMobileOverlay(widgetId) {
    const overlayId = `static-nav-mobile-overlay-${widgetId}`;
    let overlay = document.getElementById(overlayId);
    if (!overlay) {
      overlay = document.createElement("div");
      overlay.id = overlayId;
      overlay.className = "static-nav-mobile-overlay";
      document.body.appendChild(overlay);
    }
    return overlay;
  }

  function initScrollHeaderBehavior() {
    if (window.__staticScrollHeaderInit) {
      return;
    }
    window.__staticScrollHeaderInit = true;

    const header = document.querySelector("header.elementor-location-header");
    if (!header) {
      return;
    }

    const headerTarget = header.querySelector(":scope > .elementor-element") || header;
    headerTarget.classList.add("static-scroll-header-target");
    header.classList.add("static-scroll-header-mounted");

    const updateHeaderMetrics = () => {
      const height = Math.ceil(headerTarget.getBoundingClientRect().height || 0);
      const finalHeight = height > 0 ? height : 88;
      document.documentElement.style.setProperty("--static-scroll-header-height", `${finalHeight}px`);
    };

    let lastY = window.scrollY || 0;
    let ticking = false;

    const showHeader = () => headerTarget.classList.remove("static-scroll-header-hidden");
    const hideHeader = () => headerTarget.classList.add("static-scroll-header-hidden");

    const run = () => {
      const currentY = Math.max(window.scrollY || 0, 0);
      const delta = currentY - lastY;

      if (document.body.classList.contains(MODAL_BODY_CLASS) || currentY < 36) {
        showHeader();
        lastY = currentY;
        ticking = false;
        return;
      }

      if (delta > 6 && currentY > 96) {
        hideHeader();
      } else if (delta < -2) {
        showHeader();
      }

      lastY = currentY;
      ticking = false;
    };

    window.addEventListener(
      "scroll",
      () => {
        if (ticking) {
          return;
        }
        ticking = true;
        window.requestAnimationFrame(run);
      },
      { passive: true }
    );

    window.addEventListener("resize", () => {
      updateHeaderMetrics();
      showHeader();
    });
    window.addEventListener("orientationchange", () => {
      updateHeaderMetrics();
      showHeader();
    });

    updateHeaderMetrics();
    showHeader();
  }

  function findHeaderLogo(widget) {
    const roots = [];
    const localHeader = widget.closest(".elementor-location-header, header");
    if (localHeader) {
      roots.push(localHeader);
    }
    roots.push(document);

    for (const root of roots) {
      const linkedLogos = root.querySelectorAll("a[href] img[src]");
      for (const image of linkedLogos) {
        const src = image.getAttribute("src");
        if (src) {
          return {
            src,
            srcset: image.getAttribute("srcset") || "",
            sizes: image.getAttribute("sizes") || "",
            alt: image.getAttribute("alt") || "Site logo",
          };
        }
      }
    }

    return null;
  }

  function ensureMobileModalHeader(widget, dropdown) {
    let header = dropdown.querySelector(":scope > .static-modal-head");
    if (!header) {
      header = document.createElement("div");
      header.className = "static-modal-head";
      dropdown.prepend(header);
    }

    let brand = header.querySelector(".static-modal-brand");
    if (!brand) {
      brand = document.createElement("div");
      brand.className = "static-modal-brand";
      header.appendChild(brand);
    }

    const logoData = findHeaderLogo(widget);
    if (logoData && logoData.src) {
      let logo = brand.querySelector("img");
      if (!logo) {
        logo = document.createElement("img");
        brand.replaceChildren(logo);
      }
      logo.setAttribute("src", logoData.src);
      logo.setAttribute("alt", logoData.alt);

      if (logoData.srcset) {
        logo.setAttribute("srcset", logoData.srcset);
      } else {
        logo.removeAttribute("srcset");
      }

      if (logoData.sizes) {
        logo.setAttribute("sizes", logoData.sizes);
      } else {
        logo.removeAttribute("sizes");
      }
    } else {
      brand.textContent = "Menu";
    }

    let closeButton = header.querySelector(".static-modal-close");
    if (!closeButton) {
      closeButton = document.createElement("button");
      closeButton.type = "button";
      closeButton.className = "static-modal-close";
      closeButton.setAttribute("aria-label", "Close menu");
      closeButton.textContent = "X";
      header.appendChild(closeButton);
    }

    return closeButton;
  }

  function bindMobileToggle(widget, widgetId) {
    const toggle = widget.querySelector(".elementor-menu-toggle");
    const dropdown = widget.querySelector("nav.elementor-nav-menu--dropdown.elementor-nav-menu__container");
    if (!toggle || !dropdown) {
      return;
    }

    const overlay = ensureMobileOverlay(widgetId);
    const closeButton = ensureMobileModalHeader(widget, dropdown);

    const applyMobileDrawerLayout = () => {
      if (isDesktop()) {
        return;
      }

      dropdown.style.setProperty("position", "fixed", "important");
      dropdown.style.setProperty("top", "0.75rem", "important");
      dropdown.style.setProperty("left", "0.75rem", "important");
      dropdown.style.setProperty("right", "auto", "important");
      dropdown.style.setProperty("bottom", "0.75rem", "important");
      dropdown.style.setProperty("width", "min(23.5rem, calc(100vw - 1.5rem))", "important");
      dropdown.style.setProperty("max-width", "min(23.5rem, calc(100vw - 1.5rem))", "important");
      dropdown.style.setProperty("max-height", "calc(100dvh - 1.5rem)", "important");
      dropdown.style.setProperty("margin-top", "0", "important");
      dropdown.style.setProperty("display", "grid", "important");
      dropdown.style.setProperty("grid-template-rows", "auto 1fr", "important");
      dropdown.style.setProperty("overflow-y", "auto", "important");
      dropdown.style.setProperty("z-index", "2147483600", "important");
    };

    const clearMobileDrawerLayout = () => {
      [
        "position",
        "top",
        "left",
        "right",
        "bottom",
        "width",
        "max-width",
        "max-height",
        "margin-top",
        "display",
        "grid-template-rows",
        "overflow-y",
        "z-index",
      ].forEach((property) => dropdown.style.removeProperty(property));
    };

    const setExpanded = (expanded) => {
      const isMobile = !isDesktop();
      const shouldExpand = expanded && isMobile;
      const openIcon = toggle.querySelector(".elementor-menu-toggle__icon--open");
      const closeIcon = toggle.querySelector(".elementor-menu-toggle__icon--close");

      if (isMobile) {
        applyMobileDrawerLayout();
      } else {
        clearMobileDrawerLayout();
      }

      toggle.classList.toggle("elementor-active", shouldExpand);
      toggle.setAttribute("aria-expanded", shouldExpand ? "true" : "false");
      toggle.setAttribute("aria-label", shouldExpand ? "Close menu" : "Open menu");
      dropdown.setAttribute("aria-hidden", shouldExpand ? "false" : "true");
      dropdown.classList.toggle("static-modal-open", shouldExpand);
      overlay.classList.toggle("is-visible", shouldExpand);
      document.body.classList.toggle(MODAL_BODY_CLASS, shouldExpand);

      if (openIcon && closeIcon) {
        openIcon.style.display = shouldExpand ? "none" : "inline-block";
        closeIcon.style.display = shouldExpand ? "inline-block" : "none";
      }

      dropdown.querySelectorAll("a, .submenu-toggle, .static-modal-close").forEach((element) => {
        if (shouldExpand) {
          element.removeAttribute("tabindex");
        } else {
          element.setAttribute("tabindex", "-1");
        }
      });

      if (shouldExpand) {
        const firstFocusable = dropdown.querySelector("a, .submenu-toggle");
        if (firstFocusable) {
          window.setTimeout(() => firstFocusable.focus(), 60);
        }
      } else {
        closeAllMenus(widget);
      }
    };

    const closeIfInMobile = () => {
      if (!isDesktop()) {
        setExpanded(false);
      }
    };

    toggle.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
      setExpanded(toggle.getAttribute("aria-expanded") !== "true");
    }, true);

    toggle.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
        setExpanded(toggle.getAttribute("aria-expanded") !== "true");
      }
    }, true);

    overlay.addEventListener("click", closeIfInMobile);
    closeButton.addEventListener("click", (event) => {
      event.preventDefault();
      closeIfInMobile();
    });

    dropdown.addEventListener("click", (event) => {
      const clickedLink = event.target.closest("a[href]");
      if (!clickedLink) {
        return;
      }

      const href = clickedLink.getAttribute("href");
      if (href && href !== "#") {
        closeIfInMobile();
      }
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        closeIfInMobile();
      }
    });

    document.addEventListener("pointerdown", (event) => {
      if (isDesktop()) {
        return;
      }

      if (!widget.contains(event.target) && event.target !== overlay) {
        setExpanded(false);
      }
    });

    const syncViewport = () => {
      if (isDesktop()) {
        setExpanded(false);
        clearMobileDrawerLayout();
        dropdown.querySelectorAll("a, .submenu-toggle, .static-modal-close").forEach((element) => {
          element.removeAttribute("tabindex");
        });
      } else if (toggle.getAttribute("aria-expanded") !== "true") {
        applyMobileDrawerLayout();
        setExpanded(false);
      }
    };

    window.addEventListener("resize", syncViewport);
    setExpanded(false);
  }

  function getRuntimeBasePrefix() {
    const marker = "assets/js/nav-menu-fallback.js";
    const script =
      document.currentScript ||
      Array.from(document.querySelectorAll("script[src]")).find((node) => {
        const src = node.getAttribute("src") || "";
        return src.includes(marker);
      });

    if (!script) return "/";
    const rawSrc = script.getAttribute("src") || "";
    const markerIndex = rawSrc.indexOf(marker);
    if (markerIndex === -1) return "/";
    const prefix = rawSrc.slice(0, markerIndex);
    return prefix || "/";
  }

  function joinPath(prefix, rel) {
    const a = String(prefix || "/").replace(/\/+$/, "");
    const b = String(rel || "").replace(/^\/+/, "");
    if (!a || a === ".") return `./${b}`;
    if (a === "/") return `/${b}`;
    return `${a}/${b}`;
  }

  function toAbsoluteUrl(path) {
    return new URL(path, window.location.href).toString();
  }

  async function loadSearchIndex(indexPath) {
    const response = await fetch(toAbsoluteUrl(indexPath), { cache: "force-cache" });
    if (!response.ok) return [];
    const json = await response.json().catch(() => []);
    if (!Array.isArray(json)) return [];
    return json
      .map((item) => ({
        title: String(item.title || "").trim(),
        heading: String(item.heading || "").trim(),
        snippet: String(item.snippet || "").trim(),
        url: String(item.url || "").trim(),
      }))
      .filter((item) => item.title && item.url);
  }

  function searchIndexItems(index, query, limit = 8) {
    const q = String(query || "").trim().toLowerCase();
    if (!q) return [];

    return index
      .map((item) => {
        const hay = `${item.title} ${item.heading} ${item.snippet}`.toLowerCase();
        const pos = hay.indexOf(q);
        return { item, score: pos === -1 ? 99999 : pos };
      })
      .filter((row) => row.score !== 99999)
      .sort((a, b) => a.score - b.score)
      .slice(0, limit)
      .map((row) => row.item);
  }

  function renderSuggestionList(container, matches, basePrefix) {
    if (!container) return;
    container.replaceChildren();
    if (!matches.length) return;

    matches.forEach((item) => {
      const li = document.createElement("li");
      const link = document.createElement("a");
      link.href = joinPath(basePrefix, item.url.replace(/^\//, ""));
      link.innerHTML = `${item.title}<small>${item.snippet || item.heading || item.url}</small>`;
      li.appendChild(link);
      container.appendChild(li);
    });
  }

  function wireExistingSearchForms(index, basePrefix, searchPagePath) {
    const forms = document.querySelectorAll("form.elementor-search-form");
    forms.forEach((form, idx) => {
      const input = form.querySelector('input[type="search"], input[name="s"], input[name="q"]');
      if (!input) return;

      const listId = `static-search-list-${idx}`;
      let datalist = document.getElementById(listId);
      if (!datalist) {
        datalist = document.createElement("datalist");
        datalist.id = listId;
        document.body.appendChild(datalist);
      }
      input.setAttribute("list", listId);

      const refreshList = () => {
        datalist.replaceChildren();
        const matches = searchIndexItems(index, input.value, 7);
        matches.forEach((item) => {
          const opt = document.createElement("option");
          opt.value = item.title;
          datalist.appendChild(opt);
        });
      };

      input.addEventListener("input", refreshList);
      input.addEventListener("focus", refreshList);

      form.addEventListener("submit", (event) => {
        event.preventDefault();
        const term = String(input.value || "").trim();
        if (!term) return;
        window.location.href = `${toAbsoluteUrl(searchPagePath)}?q=${encodeURIComponent(term)}`;
      });
    });
  }

  function ensureHeaderSearchUI() {
    const navMain = document.querySelector("header.elementor-location-header .elementor-nav-menu--main");
    if (!navMain) return null;

    let button = navMain.querySelector(".static-header-search-btn");
    if (!button) {
      button = document.createElement("button");
      button.type = "button";
      button.className = "static-header-search-btn";
      button.setAttribute("aria-label", "Search website");
      button.innerHTML =
        '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M10.5 3a7.5 7.5 0 1 1 0 15 7.5 7.5 0 0 1 0-15Zm0 2a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11Zm8.85 12.44 1.41 1.41-3.18 3.18-1.41-1.41 3.18-3.18Z"/></svg>';
      navMain.appendChild(button);
    }

    let panel = document.querySelector(".static-search-panel");
    if (!panel) {
      panel = document.createElement("div");
      panel.className = "static-search-panel";
      panel.innerHTML = `
        <form class="static-search-form">
          <input class="static-search-input" type="search" name="q" placeholder="Search services, articles, pages...">
          <button class="static-search-submit" type="submit">Search</button>
        </form>
        <ul class="static-search-suggestions"></ul>
      `;
      document.body.appendChild(panel);
    }

    return { button, panel };
  }

  async function initSiteSearch() {
    const basePrefix = getRuntimeBasePrefix();
    const indexPath = joinPath(basePrefix, "assets/search-index.json");
    const searchPagePath = joinPath(basePrefix, "search/index.html");
    const index = await loadSearchIndex(indexPath);

    wireExistingSearchForms(index, basePrefix, searchPagePath);

    const ui = ensureHeaderSearchUI();
    if (!ui) return;

    const { button, panel } = ui;
    const form = panel.querySelector(".static-search-form");
    const input = panel.querySelector(".static-search-input");
    const list = panel.querySelector(".static-search-suggestions");

    const open = () => {
      panel.classList.add("is-open");
      input.focus();
      renderSuggestionList(list, searchIndexItems(index, input.value, 8), basePrefix);
    };

    const close = () => {
      panel.classList.remove("is-open");
    };

    button.addEventListener("click", () => {
      if (panel.classList.contains("is-open")) close();
      else open();
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") close();
    });

    document.addEventListener("pointerdown", (event) => {
      if (!panel.classList.contains("is-open")) return;
      if (!panel.contains(event.target) && !button.contains(event.target)) close();
    });

    input.addEventListener("input", () => {
      renderSuggestionList(list, searchIndexItems(index, input.value, 8), basePrefix);
    });

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const term = String(input.value || "").trim();
      if (!term) return;
      window.location.href = `${toAbsoluteUrl(searchPagePath)}?q=${encodeURIComponent(term)}`;
    });
  }

  function init() {
    const widgets = document.querySelectorAll(".elementor-widget-nav-menu");
    if (!widgets.length) {
      return;
    }

    ensureStyle();

    widgets.forEach((widget, index) => {
      widget.classList.add("static-nav-ready");
      const widgetId = widget.dataset.id || `static-nav-${index}`;

      widget.querySelectorAll(".elementor-nav-menu").forEach((menuRoot) => {
        prepareMenuItems(menuRoot, widgetId);
      });

      closeAllMenus(widget);
      bindDesktopMenu(widget);
      bindMobileToggle(widget, widgetId);
    });

    initScrollHeaderBehavior();
    initSiteSearch().catch(() => {});
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
