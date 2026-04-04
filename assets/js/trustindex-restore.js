function initTrustindexRestore() {
  var template = document.getElementById("trustindex-google-widget-html");
  if (!template || template.dataset.restored === "1") {
    return;
  }
  template.dataset.restored = "1";

  var shortcodeHost = template.closest(".elementor-shortcode");
  if (!shortcodeHost) {
    return;
  }

  var source = document.createElement("div");
  source.innerHTML = template.innerHTML.trim();
  var widget = source.firstElementChild;
  if (!widget) {
    return;
  }

  var footer = widget.querySelector(".ti-footer");
  var reviewNodes = Array.from(widget.querySelectorAll(".ti-review-item"));
  if (!footer || !reviewNodes.length) {
    return;
  }

  function getText(node, selector) {
    var match = node.querySelector(selector);
    return match ? match.textContent.trim() : "";
  }

  function getImage(node, selector) {
    var match = node.querySelector(selector);
    if (!match) {
      return "";
    }
    return match.getAttribute("data-imgurl") || match.getAttribute("src") || "";
  }

  function buildStars(rating) {
    var rounded = Math.max(0, Math.min(5, Math.round(rating)));
    var stars = "";
    for (var i = 0; i < 5; i += 1) {
      stars += '<span class="gwv-review-star' + (i < rounded ? " is-filled" : "") + '">★</span>';
    }
    return stars;
  }

  function pluralize(value, unit) {
    return value === 1 ? unit : unit + "s";
  }

  function formatRelativeDate(timestamp) {
    if (!timestamp) {
      return "";
    }
    var diffSeconds = Math.max(0, Math.floor((Date.now() - timestamp * 1000) / 1000));
    var day = 86400;
    var week = day * 7;
    var month = day * 30;
    var year = day * 365;
    if (diffSeconds < day) return "today";
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

  var summary = {
    name: getText(footer, ".ti-name"),
    ratingText: getText(footer, ".ti-rating-text"),
    writeReviewHref: footer.querySelector(".ti-header-write-btn") ? footer.querySelector(".ti-header-write-btn").getAttribute("href") : "#",
    image: getImage(footer, ".ti-profile-img trustindex-image")
  };

  var reviews = reviewNodes.map(function (node) {
    return {
      name: getText(node, ".ti-name"),
      date: formatRelativeDate(Number(node.getAttribute("data-time"))),
      text: getText(node, ".ti-review-content"),
      image: getImage(node, ".ti-profile-img trustindex-image"),
      rating: 5
    };
  });

  reviews = [
    {
      name: "Madison Perry",
      date: "a month ago",
      text: "This was the best experience I've ever had at the vet. My dog didn't love it due to his bad ear infection, but Dr. Raza was amazing with my extremely anxious dog. He was so gentle and kind to him. I also appreciate that the fees were not as high as many of the vets in surrounding areas. My dog had a bowel movement in reception and urine in the exam room, I felt terrible but I know it's a common thing for dogs to do, and the staff was so good about it. Can't wait to go back again",
      image: "",
      rating: 5
    },
    {
      name: "graham caruana",
      date: "a month ago",
      text: "I can't say enough about Dr Raza and his wonderful team. They really care, and have been thorough, professional, accommodating, understanding and kind. They have also been excellent with providing updates and followup.",
      image: "",
      rating: 5
    },
    {
      name: "Linda Turner",
      date: "4 months ago",
      text: "Huge rave to Grand Avenue Pet Hospital. I anticipated a very difficult appoint but it went smooth as silk. They were friendly, very caring, and so gentle. All my anxiety was for nothing. Thank you so much. I highly recommend them for your loving pets.",
      image: "",
      rating: 5
    },
    {
      name: "Nona Hayes",
      date: "4 months ago",
      text: "Staff are great with our cats and dog. They have been amazing when it came to our animals passing.",
      image: "",
      rating: 5
    },
    {
      name: "Stephanie Cruickshank",
      date: "4 months ago",
      text: "Amazing service, they were so kind and caring for my Walter. Able to get us in and looked at. Thanks so much for the kindness in both your customer service but also your service to my boy.",
      image: "https://lh3.googleusercontent.com/a-/ALV-UjWZHCW1Z5Y0iLX-X-eWNKuNmHkv1uso_HOHVHNsmSNRDYkQYaW3XQ=w45-h45-p-rp-mo-br100",
      rating: 5
    },
    {
      name: "Stephanie Laforet",
      date: "6 months ago",
      text: "Dr. Raza and his team are amazing! I've taken my dogs there for the past 8 years and I have nothing but the best care. Dr. Raza is a kind, calm and relaxed man whose energy relaxes my pets. Dr. Raza takes his time with my rescue dog that has special needs and always makes us feel cared for.",
      image: "https://lh3.googleusercontent.com/a-/ALV-UjWXyY8_Vd5-FGdcxdu7scPLzR_61lzzG-I2X7Q0LU6sn3OPEpz-=w45-h45-p-rp-mo-ba2-br100",
      rating: 5
    }
  ].concat(reviews);

  var section = document.createElement("div");
  section.className = "gwv-reviews";
  section.innerHTML =
    '<div class="gwv-reviews__summary">' +
      '<div class="gwv-reviews__summary-row">' +
        '<img class="gwv-reviews__brand-image" alt="' + summary.name.replace(/"/g, "&quot;") + '" src="' + summary.image + '">' +
        '<div class="gwv-reviews__summary-copy">' +
          '<div class="gwv-reviews__brand-name">' + summary.name + '</div>' +
          '<div class="gwv-reviews__stars" aria-hidden="true">' + buildStars(5) + '</div>' +
          '<div class="gwv-reviews__count">' + summary.ratingText + '</div>' +
        '</div>' +
      '</div>' +
      '<a class="gwv-reviews__button" href="' + summary.writeReviewHref + '" target="_blank" rel="noopener">Write a review</a>' +
    '</div>' +
    '<div class="gwv-reviews__carousel">' +
      '<button class="gwv-reviews__arrow is-prev" type="button" aria-label="Previous review">‹</button>' +
      '<div class="gwv-reviews__viewport"><div class="gwv-reviews__track"></div></div>' +
      '<button class="gwv-reviews__arrow is-next" type="button" aria-label="Next review">›</button>' +
    '</div>';

  shortcodeHost.innerHTML = "";
  shortcodeHost.appendChild(section);

  if (!document.querySelector('style[data-gwv-reviews="1"]')) {
    var style = document.createElement("style");
    style.setAttribute("data-gwv-reviews", "1");
    style.textContent =
      ".gwv-reviews{--gwv-font-body:'Inter','Segoe UI',system-ui,-apple-system,BlinkMacSystemFont,'Helvetica Neue',sans-serif;--gwv-font-accent:'Nunito','Inter','Segoe UI',system-ui,-apple-system,BlinkMacSystemFont,'Helvetica Neue',sans-serif;display:flex;gap:28px;align-items:stretch}" +
      ".gwv-reviews,.gwv-reviews *{box-sizing:border-box}" +
      ".gwv-reviews__summary{flex:0 0 25%;max-width:25%;display:flex;flex-direction:column;justify-content:center;padding:16px 8px 16px 0;min-width:220px}" +
      ".gwv-reviews__summary-row{display:flex;gap:18px;align-items:center}" +
      ".gwv-reviews__brand-image{width:82px;height:82px;object-fit:contain;border-radius:12px;background:#fff}" +
      ".gwv-reviews__brand-name{font-family:var(--gwv-font-accent);font-size:16px;font-weight:700;line-height:1.28;color:#20252d}" +
      ".gwv-reviews__stars{margin:8px 0 6px;font-size:20px;line-height:1;color:#d0d0d0}" +
      ".gwv-review-star{display:inline-block;margin-right:1px}" +
      ".gwv-review-star.is-filled{color:#f4b400}" +
      ".gwv-reviews__count{font-family:var(--gwv-font-body);font-size:14px;line-height:1.45;color:#20252d}" +
      ".gwv-reviews__button{display:inline-flex;align-items:center;justify-content:center;margin-top:18px;min-height:48px;padding:0 28px;border:1px solid #0b7db7;border-radius:999px;color:#fff !important;text-decoration:none;font-family:var(--gwv-font-accent);font-weight:700;background:linear-gradient(135deg,#0b7db7 0%,#0a6ca0 100%);max-width:208px;font-size:15px;box-shadow:0 12px 26px rgba(11,125,183,.22);transition:transform .22s ease,box-shadow .22s ease,background .22s ease}" +
      ".gwv-reviews__button:hover,.gwv-reviews__button:focus{color:#fff !important;background:linear-gradient(135deg,#0a6ca0 0%,#095b86 100%);transform:translateY(-1px);box-shadow:0 14px 30px rgba(11,125,183,.28)}" +
      ".gwv-reviews__carousel{position:relative;flex:1 1 auto;min-width:0}" +
      ".gwv-reviews__viewport{overflow:hidden}" +
      ".gwv-reviews__track{display:flex;align-items:stretch;will-change:transform}" +
      ".gwv-reviews__card{padding:0 9px;display:flex;align-items:stretch}" +
      ".gwv-reviews__card-inner{height:100%;width:100%;min-height:292px;background:#f7f7f7;border-radius:20px;padding:20px 22px 24px;display:flex;flex-direction:column;justify-content:flex-start}" +
      ".gwv-reviews__card-header{display:flex;align-items:flex-start;gap:14px;margin-bottom:12px}" +
      ".gwv-reviews__avatar-shell,.gwv-reviews__avatar,.gwv-reviews__avatar-fallback{width:52px;height:52px;min-width:52px;min-height:52px;border-radius:50% !important;flex:0 0 auto;overflow:hidden}" +
      ".gwv-reviews__avatar-shell{position:relative;display:block;background:#edf3f8}" +
      ".gwv-reviews__avatar{display:block;position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:center;background:transparent;padding:0;border:none;box-shadow:none}" +
      ".gwv-reviews__avatar-fallback{display:flex;align-items:center;justify-content:center;background:#0d6b57;color:#fff;font-family:var(--gwv-font-accent);font-size:24px;font-weight:700;line-height:1;text-transform:uppercase}" +
      ".gwv-reviews__avatar-shell.has-image .gwv-reviews__avatar-fallback{display:none}" +
      ".gwv-reviews__avatar-shell.is-image-broken .gwv-reviews__avatar{display:none}" +
      ".gwv-reviews__avatar-shell.is-image-broken .gwv-reviews__avatar-fallback{display:flex}" +
      ".gwv-reviews__meta{flex:1 1 auto;min-width:0}" +
      ".gwv-reviews__name{font-family:var(--gwv-font-accent);font-size:15px;font-weight:700;line-height:1.24;color:#20252d}" +
      ".gwv-reviews__date{font-family:var(--gwv-font-body);font-size:13px;line-height:1.35;color:#6b7280;margin-top:3px}" +
      ".gwv-reviews__google{width:22px;height:22px;object-fit:contain;flex:0 0 auto;margin-left:8px}" +
      ".gwv-reviews__card-stars{margin-bottom:12px;font-size:17px;line-height:1;color:#d0d0d0}" +
      ".gwv-reviews__text{font-family:var(--gwv-font-body);font-size:14px;line-height:1.55;color:#20252d;display:-webkit-box;-webkit-line-clamp:5;-webkit-box-orient:vertical;overflow:hidden}" +
      ".gwv-reviews__arrow{position:absolute;top:50%;transform:translateY(-50%);width:38px;height:38px;border:none;border-radius:999px;background:#fff;color:#6b7280;font-size:34px;line-height:1;display:flex;align-items:center;justify-content:center;box-shadow:0 8px 22px rgba(15,23,42,.08);cursor:pointer;z-index:3}" +
      ".gwv-reviews__arrow.is-prev{left:-10px}" +
      ".gwv-reviews__arrow.is-next{right:-10px}" +
      "@media (max-width:1199px){.gwv-reviews__summary{flex-basis:28%;max-width:28%}.gwv-reviews__card-inner{min-height:276px;padding:18px 20px 22px}}" +
      "@media (max-width:1024px){.gwv-reviews{flex-direction:column;gap:24px}.gwv-reviews__summary{max-width:none;min-width:0;padding-right:0}.gwv-reviews__arrow.is-prev{left:0}.gwv-reviews__arrow.is-next{right:0}.gwv-reviews__card-inner{min-height:250px}}" +
      "@media (max-width:767px){.gwv-reviews__summary-row{gap:14px}.gwv-reviews__brand-image{width:70px;height:70px}.gwv-reviews__brand-name{font-size:15px}.gwv-reviews__card{padding:0 6px}.gwv-reviews__card-inner{min-height:0;padding:18px 18px 20px}.gwv-reviews__avatar-shell,.gwv-reviews__avatar,.gwv-reviews__avatar-fallback{width:48px;height:48px;min-width:48px;min-height:48px}.gwv-reviews__avatar-fallback{font-size:22px}.gwv-reviews__name{font-size:14px}.gwv-reviews__date,.gwv-reviews__text,.gwv-reviews__count{font-size:13px}.gwv-reviews__text{-webkit-line-clamp:6}.gwv-reviews__arrow{width:34px;height:34px;font-size:28px}}";
    document.head.appendChild(style);
  }

  var track = section.querySelector(".gwv-reviews__track");
  var viewport = section.querySelector(".gwv-reviews__viewport");
  var prevButton = section.querySelector(".gwv-reviews__arrow.is-prev");
  var nextButton = section.querySelector(".gwv-reviews__arrow.is-next");
  var googleIcon = "https://cdn.trustindex.io/assets/platform/Google/icon.svg";
  var autoplayDelay = 9000;
  var transitionDuration = 650;
  var autoplayTimer = null;
  var transitionTimer = null;
  var currentIndex = 0;
  var visibleCount = 3;
  var cardWidth = 0;
  var isTransitioning = false;

  function createCard(review) {
    var initials = review.name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map(function (part) { return part.charAt(0); })
      .join("") || "G";
    var avatarMarkup =
      '<span class="gwv-reviews__avatar-shell' + (review.image ? " has-image" : " is-image-broken") + '">' +
        (review.image ? '<img class="gwv-reviews__avatar" alt="' + review.name.replace(/"/g, "&quot;") + '" src="' + review.image + '" loading="lazy" referrerpolicy="no-referrer">' : "") +
        '<span class="gwv-reviews__avatar-fallback" aria-hidden="true">' + initials + "</span>" +
      "</span>";
    var card = document.createElement("article");
    card.className = "gwv-reviews__card";
    card.innerHTML =
      '<div class="gwv-reviews__card-inner">' +
        '<div class="gwv-reviews__card-header">' +
          avatarMarkup +
          '<div class="gwv-reviews__meta">' +
            '<div class="gwv-reviews__name">' + review.name + '</div>' +
            '<div class="gwv-reviews__date">' + review.date + '</div>' +
          '</div>' +
          '<img class="gwv-reviews__google" alt="Google" src="' + googleIcon + '">' +
        '</div>' +
        '<div class="gwv-reviews__card-stars" aria-hidden="true">' + buildStars(review.rating) + '</div>' +
        '<div class="gwv-reviews__text">' + review.text + '</div>' +
      '</div>';
    var avatar = card.querySelector(".gwv-reviews__avatar");
    var avatarShell = card.querySelector(".gwv-reviews__avatar-shell");
    if (avatar && avatarShell) {
      avatar.addEventListener("error", function () {
        avatarShell.classList.add("is-image-broken");
      }, { once: true });
    }
    return card;
  }

  function getVisibleCount() {
    if (window.innerWidth >= 1200) return 3;
    if (window.innerWidth >= 768) return 2;
    return 1;
  }

  function stopAutoplay() {
    if (autoplayTimer) {
      window.clearTimeout(autoplayTimer);
      autoplayTimer = null;
    }
  }

  function clearTransitionTimer() {
    if (transitionTimer) {
      window.clearTimeout(transitionTimer);
      transitionTimer = null;
    }
  }

  function applyTransform(animate) {
    track.style.transition = animate ? "transform " + transitionDuration + "ms ease" : "none";
    track.style.transform = "translateX(" + (-currentIndex * cardWidth) + "px)";
  }

  function updateLayout() {
    visibleCount = getVisibleCount();
    cardWidth = viewport.clientWidth / visibleCount;
    Array.from(track.children).forEach(function (card) {
      card.style.width = cardWidth + "px";
      card.style.minWidth = cardWidth + "px";
      card.style.maxWidth = cardWidth + "px";
    });
    track.style.width = (track.children.length * cardWidth) + "px";
    applyTransform(false);
  }

  function rebuildTrack() {
    track.innerHTML = "";
    var prepend = reviews.slice(-visibleCount);
    var append = reviews.slice(0, visibleCount);
    prepend.concat(reviews, append).forEach(function (review) {
      track.appendChild(createCard(review));
    });
    currentIndex = visibleCount;
    updateLayout();
  }

  function normalizePosition() {
    if (currentIndex >= reviews.length + visibleCount) {
      currentIndex = visibleCount;
      applyTransform(false);
    } else if (currentIndex < visibleCount) {
      currentIndex = reviews.length + visibleCount - 1;
      applyTransform(false);
    }
  }

  function moveTo(index) {
    if (isTransitioning || reviews.length <= visibleCount) {
      return;
    }
    isTransitioning = true;
    currentIndex = index;
    applyTransform(true);
    clearTransitionTimer();
    transitionTimer = window.setTimeout(function () {
      normalizePosition();
      isTransitioning = false;
    }, transitionDuration + 20);
  }

  function next() {
    moveTo(currentIndex + 1);
  }

  function prev() {
    moveTo(currentIndex - 1);
  }

  function startAutoplay() {
    stopAutoplay();
    if (reviews.length <= visibleCount) {
      return;
    }
    autoplayTimer = window.setTimeout(function advance() {
      next();
      autoplayTimer = window.setTimeout(advance, autoplayDelay);
    }, autoplayDelay);
  }

  prevButton.addEventListener("click", function () {
    prev();
    startAutoplay();
  });

  nextButton.addEventListener("click", function () {
    next();
    startAutoplay();
  });

  document.addEventListener("visibilitychange", function () {
    if (document.hidden) {
      stopAutoplay();
    } else {
      startAutoplay();
    }
  });

  window.addEventListener("resize", function () {
    updateLayout();
    startAutoplay();
  }, { passive: true });

  rebuildTrack();
  startAutoplay();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initTrustindexRestore, { once: true });
} else {
  initTrustindexRestore();
}
