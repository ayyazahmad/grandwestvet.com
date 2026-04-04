function initTrustindexRestore() {
  var template = document.getElementById("trustindex-google-widget-html");
  if (!template) {
    return;
  }

  if (template.dataset.restored === "1") {
    return;
  }
  template.dataset.restored = "1";

  var shortcodeHost = template.closest(".elementor-shortcode");
  if (!shortcodeHost) {
    return;
  }

  if (!document.querySelector('link[data-trustindex-static="1"]')) {
    var stylesheet = document.createElement("link");
    stylesheet.rel = "stylesheet";
    stylesheet.href = "wp-content/uploads/trustindex-google-widget.css?1773949659";
    stylesheet.setAttribute("data-trustindex-static", "1");
    document.head.appendChild(stylesheet);
  }

  var wrapper = document.createElement("div");
  wrapper.innerHTML = template.innerHTML.trim();

  var widget = wrapper.firstElementChild;
  if (!widget) {
    return;
  }

  widget.setAttribute("data-trustindex-restored", "true");

  widget.querySelectorAll(".ti-verified-by, .ti-verified-by-row").forEach(function (node) {
    node.remove();
  });

  widget.querySelectorAll("trustindex-image").forEach(function (node) {
    var img = document.createElement("img");
    var source = node.getAttribute("data-imgurl");
    if (source) {
      img.src = source;
    }

    Array.from(node.attributes).forEach(function (attr) {
      if (attr.name === "data-imgurl") {
        return;
      }
      img.setAttribute(attr.name, attr.value);
    });

    img.decoding = "async";
    node.replaceWith(img);
  });

  shortcodeHost.innerHTML = "";
  shortcodeHost.appendChild(widget);

  var reviewItems = Array.from(widget.querySelectorAll(".ti-review-item"));
  var nextButton = widget.querySelector(".ti-next");
  var prevButton = widget.querySelector(".ti-prev");
  var progressDot = widget.querySelector(".ti-controls-line .dot");
  var readMoreButtons = Array.from(widget.querySelectorAll(".ti-read-more"));
  var reviewsWrapper = widget.querySelector(".ti-reviews-container-wrapper");
  var currentIndex = 0;
  var autoplayTimer = null;
  var autoplayDelay = 9000;
  var transitionDuration = 650;
  var isAnimating = false;

  if (widget.hasAttribute("data-pager-autoplay-timeout")) {
    var rawDelay = Number(widget.getAttribute("data-pager-autoplay-timeout"));
    if (!Number.isNaN(rawDelay) && rawDelay > 0) {
      autoplayDelay = rawDelay * 1000;
    }
  }

  if (!document.querySelector('style[data-trustindex-motion="1"]')) {
    var motionStyle = document.createElement("style");
    motionStyle.setAttribute("data-trustindex-motion", "1");
    motionStyle.textContent = "" +
      '.ti-widget[data-trustindex-restored="true"] .ti-review-item{' +
      'display:block !important;' +
      'opacity:1 !important;' +
      'transform:none !important;' +
      'will-change:auto;' +
      '}' +
      '.ti-widget[data-trustindex-restored="true"] .ti-reviews-container{' +
      'overflow:hidden;' +
      '}' +
      '.ti-widget[data-trustindex-restored="true"] .ti-reviews-container-wrapper{' +
      'display:flex !important;' +
      'flex-wrap:nowrap !important;' +
      'transition:transform 650ms ease;' +
      'will-change:transform;' +
      'margin:0 !important;' +
      'padding:0 !important;' +
      'align-items:stretch;' +
      '}' +
      '.ti-widget[data-trustindex-restored="true"] .ti-review-item .ti-inner{' +
      'height:100%;' +
      '}' +
      '.ti-widget[data-trustindex-restored="true"] .ti-controls-line .dot{' +
      'transition:left 650ms ease, width 650ms ease;' +
      '}';
    document.head.appendChild(motionStyle);
  }

  function pluralize(value, unit) {
    return value === 1 ? unit : unit + "s";
  }

  function formatRelativeDate(timestamp) {
    if (!timestamp) {
      return "";
    }

    var now = Date.now();
    var diffSeconds = Math.max(0, Math.floor((now - timestamp * 1000) / 1000));
    var day = 86400;
    var week = day * 7;
    var month = day * 30;
    var year = day * 365;

    if (diffSeconds < day) {
      return "today";
    }
    if (diffSeconds < week) {
      var days = Math.max(1, Math.floor(diffSeconds / day));
      return days + " " + pluralize(days, "day") + " ago";
    }
    if (diffSeconds < month) {
      var weeks = Math.max(1, Math.floor(diffSeconds / week));
      return weeks + " " + pluralize(weeks, "week") + " ago";
    }
    if (diffSeconds < year) {
      var months = Math.max(1, Math.floor(diffSeconds / month));
      return months + " " + pluralize(months, "month") + " ago";
    }

    var years = Math.max(1, Math.floor(diffSeconds / year));
    return years + " " + pluralize(years, "year") + " ago";
  }

  reviewItems.forEach(function (item) {
    var dateNode = item.querySelector(".ti-date");
    if (dateNode) {
      dateNode.textContent = formatRelativeDate(Number(item.getAttribute("data-time")));
    }
  });

  readMoreButtons.forEach(function (button) {
    var selector = button.getAttribute("data-container");
    var content = selector ? button.parentElement.querySelector(selector) : null;
    if (!content) {
      button.remove();
      return;
    }

    var fullText = content.textContent.trim();
    if (fullText.length <= 135) {
      button.remove();
      return;
    }

    button.innerHTML = "<span>Read more</span>";
    button.setAttribute("role", "button");
    button.tabIndex = 0;
    button.setAttribute("aria-expanded", "false");

    button.addEventListener("click", function () {
      var expanded = button.getAttribute("aria-expanded") === "true";
      button.setAttribute("aria-expanded", expanded ? "false" : "true");
      button.innerHTML = expanded ? "<span>Read more</span>" : "<span>Hide</span>";
      content.style.height = expanded ? "" : "auto";
      content.style.webkitLineClamp = expanded ? "" : "unset";
    });
  });

  function getVisibleCount() {
    if (window.innerWidth >= 1200) {
      return 3;
    }
    if (window.innerWidth >= 768) {
      return 2;
    }
    return 1;
  }

  function getReviewItems() {
    return Array.from(reviewsWrapper.querySelectorAll(".ti-review-item"));
  }

  function applyLayout() {
    var visibleCount = getVisibleCount();
    var items = getReviewItems();
    var clones = reviewsWrapper.querySelectorAll(".ti-review-clone");
    clones.forEach(function (clone) {
      clone.remove();
    });
    items.forEach(function (item) {
      item.style.display = "";
      item.style.flex = "0 0 calc(100% / " + visibleCount + ")";
      item.style.width = "calc(100% / " + visibleCount + ")";
      item.style.minWidth = "calc(100% / " + visibleCount + ")";
      item.style.maxWidth = "calc(100% / " + visibleCount + ")";
      item.style.opacity = "1";
      item.style.transform = "none";
    });

    for (var i = 0; i < visibleCount && items[i]; i += 1) {
      var clone = items[i].cloneNode(true);
      clone.classList.add("ti-review-clone");
      clone.setAttribute("aria-hidden", "true");
      clone.style.flex = "0 0 calc(100% / " + visibleCount + ")";
      clone.style.width = "calc(100% / " + visibleCount + ")";
      clone.style.minWidth = "calc(100% / " + visibleCount + ")";
      clone.style.maxWidth = "calc(100% / " + visibleCount + ")";
      reviewsWrapper.appendChild(clone);
    }
    reviewsWrapper.style.width = "";

    reviewsWrapper.style.transform = "translateX(0)";
    reviewsWrapper.style.transition = "none";
    void reviewsWrapper.offsetWidth;
    reviewsWrapper.style.transition = "transform " + transitionDuration + "ms ease";

    if (progressDot) {
      var trackSegments = Math.max(1, items.length);
      progressDot.style.width = 100 / trackSegments + "%";
      progressDot.style.left = (currentIndex / trackSegments) * 100 + "%";
    }
  }

  function renderReviews(immediate) {
    if (immediate) {
      isAnimating = false;
      applyLayout();
      return;
    }
  }

  function syncProgress() {
    var items = getReviewItems();
    if (!progressDot || !items.length) {
      return;
    }
    progressDot.style.width = 100 / items.length + "%";
    progressDot.style.left = (currentIndex / items.length) * 100 + "%";
  }

  function slideNext() {
    if (isAnimating) {
      return;
    }
    isAnimating = true;
    var visibleCount = getVisibleCount();
    var step = 100 / visibleCount;
    reviewsWrapper.style.transition = "transform " + transitionDuration + "ms ease";
    reviewsWrapper.style.transform = "translateX(-" + step + "%)";

    window.setTimeout(function () {
      var items = getReviewItems();
      if (items.length) {
        reviewsWrapper.appendChild(items[0]);
        currentIndex = (currentIndex + 1) % items.length;
      }
      var clones = reviewsWrapper.querySelectorAll(".ti-review-clone");
      clones.forEach(function (clone) {
        clone.remove();
      });
      var refreshedItems = getReviewItems();
      for (var i = 0; i < visibleCount && refreshedItems[i]; i += 1) {
        var clone = refreshedItems[i].cloneNode(true);
        clone.classList.add("ti-review-clone");
        clone.setAttribute("aria-hidden", "true");
        clone.style.flex = "0 0 calc(100% / " + visibleCount + ")";
        clone.style.width = "calc(100% / " + visibleCount + ")";
        clone.style.minWidth = "calc(100% / " + visibleCount + ")";
        clone.style.maxWidth = "calc(100% / " + visibleCount + ")";
        reviewsWrapper.appendChild(clone);
      }
      reviewsWrapper.style.width = "";
      reviewsWrapper.style.transition = "none";
      reviewsWrapper.style.transform = "translateX(0)";
      void reviewsWrapper.offsetWidth;
      reviewsWrapper.style.transition = "transform " + transitionDuration + "ms ease";
      syncProgress();
      isAnimating = false;
    }, transitionDuration);
  }

  function slidePrev() {
    if (isAnimating) {
      return;
    }
    isAnimating = true;
    var visibleCount = getVisibleCount();
    var step = 100 / visibleCount;
    var clones = reviewsWrapper.querySelectorAll(".ti-review-clone");
    clones.forEach(function (clone) {
      clone.remove();
    });
    var items = getReviewItems();
    if (items.length) {
      reviewsWrapper.insertBefore(items[items.length - 1], items[0]);
      currentIndex = (currentIndex - 1 + items.length) % items.length;
    }
    var refreshedItems = getReviewItems();
    for (var i = 0; i < visibleCount && refreshedItems[i]; i += 1) {
      var clone = refreshedItems[i].cloneNode(true);
      clone.classList.add("ti-review-clone");
      clone.setAttribute("aria-hidden", "true");
      clone.style.flex = "0 0 calc(100% / " + visibleCount + ")";
      clone.style.width = "calc(100% / " + visibleCount + ")";
      clone.style.minWidth = "calc(100% / " + visibleCount + ")";
      clone.style.maxWidth = "calc(100% / " + visibleCount + ")";
      reviewsWrapper.appendChild(clone);
    }
    reviewsWrapper.style.width = "";
    reviewsWrapper.style.transition = "none";
    reviewsWrapper.style.transform = "translateX(-" + step + "%)";
    void reviewsWrapper.offsetWidth;
    reviewsWrapper.style.transition = "transform " + transitionDuration + "ms ease";
    reviewsWrapper.style.transform = "translateX(0)";

    window.setTimeout(function () {
      syncProgress();
      isAnimating = false;
    }, transitionDuration);
  }

  function stopAutoplay() {
    if (autoplayTimer) {
      window.clearTimeout(autoplayTimer);
      autoplayTimer = null;
    }
  }

  function startAutoplay() {
    stopAutoplay();
    if (reviewItems.length <= getVisibleCount()) {
      return;
    }

    autoplayTimer = window.setTimeout(function advanceReviews() {
      slideNext();
      autoplayTimer = window.setTimeout(advanceReviews, autoplayDelay);
    }, autoplayDelay);
  }

  if (prevButton) {
    prevButton.addEventListener("click", function () {
      slidePrev();
      startAutoplay();
    });
  }

  if (nextButton) {
    nextButton.addEventListener("click", function () {
      slideNext();
      startAutoplay();
    });
  }

  document.addEventListener("visibilitychange", function () {
    if (document.hidden) {
      stopAutoplay();
      return;
    }
    startAutoplay();
  });

  window.addEventListener("resize", function () {
    renderReviews(true);
    startAutoplay();
  }, { passive: true });
  renderReviews(true);
  startAutoplay();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initTrustindexRestore, { once: true });
} else {
  initTrustindexRestore();
}
