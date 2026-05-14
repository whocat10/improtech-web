(function () {
  const STORAGE_KEY = "improtech-lang";
  const DEFAULT_LANG = "en";
  const dict = window.IMPROTECH_I18N || { en: {}, es: {} };

  function getLang() {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "en" || stored === "es") return stored;
    return DEFAULT_LANG;
  }

  function setLang(lang) {
    if (lang !== "en" && lang !== "es") return;
    localStorage.setItem(STORAGE_KEY, lang);
    document.documentElement.lang = lang === "es" ? "es" : "en";
    applyTranslations(lang);
    updateLangButtons(lang);
  }

  function t(lang, key) {
    const pack = dict[lang] || dict[DEFAULT_LANG];
    return pack[key] ?? dict[DEFAULT_LANG][key] ?? key;
  }

  function applyTranslations(lang) {
    document.querySelectorAll("[data-i18n]").forEach((el) => {
      const key = el.getAttribute("data-i18n");
      if (!key) return;
      const val = t(lang, key);
      if (el.tagName === "TITLE") {
        document.title = val;
        return;
      }
      el.textContent = val;
    });

    document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
      const key = el.getAttribute("data-i18n-placeholder");
      if (key) el.setAttribute("placeholder", t(lang, key));
    });

    document.querySelectorAll("[data-i18n-aria]").forEach((el) => {
      const key = el.getAttribute("data-i18n-aria");
      if (key) el.setAttribute("aria-label", t(lang, key));
    });

    document.querySelectorAll("[data-i18n-alt]").forEach((el) => {
      const key = el.getAttribute("data-i18n-alt");
      if (key && "alt" in el) el.alt = t(lang, key);
    });

    const select = document.getElementById("service-interest");
    if (select) {
      const current = select.value;
      const options = select.querySelectorAll("option[data-opt]");
      options.forEach((opt) => {
        const k = opt.getAttribute("data-opt");
        if (k) opt.textContent = t(lang, k);
      });
      const first = select.querySelector('option[value=""]');
      if (first && first.hasAttribute("data-i18n")) {
        first.textContent = t(lang, first.getAttribute("data-i18n"));
      }
      if ([...select.options].some((o) => o.value === current)) {
        select.value = current;
      } else {
        select.value = "";
      }
    }
  }

  function updateLangButtons(active) {
    document.querySelectorAll(".lang-switch button").forEach((btn) => {
      const isEn = btn.getAttribute("data-lang") === "en";
      const pressed = (isEn && active === "en") || (!isEn && active === "es");
      btn.setAttribute("aria-pressed", pressed ? "true" : "false");
    });
  }

  function initLangSwitch() {
    const lang = getLang();
    setLang(lang);

    document.querySelectorAll(".lang-switch button").forEach((btn) => {
      btn.addEventListener("click", () => {
        const next = btn.getAttribute("data-lang");
        if (next === "en" || next === "es") setLang(next);
      });
    });
  }

  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
      anchor.addEventListener("click", function (e) {
        const id = this.getAttribute("href");
        if (!id || id === "#") return;
        const target = document.querySelector(id);
        if (target) {
          e.preventDefault();
          const header = document.querySelector(".site-header");
          const offset = header ? header.offsetHeight : 0;
          const top =
            target.getBoundingClientRect().top + window.scrollY - offset - 8;
          window.scrollTo({ top, behavior: "smooth" });
        }
      });
    });
  }

  function initContactForm() {
    const form = document.getElementById("contact-form");
    if (!form) return;

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      if (!form.reportValidity()) return;
      const lang = getLang();
      const name = form.elements.namedItem("name")?.value?.trim() || "";
      const email = form.elements.namedItem("email")?.value?.trim() || "";
      const service =
        form.elements.namedItem("service")?.selectedOptions?.[0]
          ?.textContent || "";
      const message = form.elements.namedItem("message")?.value?.trim() || "";

      const subject =
        lang === "es"
          ? `Consulta web Improtech — ${service || "General"}`
          : `Improtech website inquiry — ${service || "General"}`;

      const body =
        lang === "es"
          ? `Nombre: ${name}\nCorreo: ${email}\nServicio: ${service}\n\nMensaje:\n${message}`
          : `Name: ${name}\nEmail: ${email}\nService: ${service}\n\nMessage:\n${message}`;

      const mailto = `mailto:improtech.ingenieria@gmail.com?subject=${encodeURIComponent(
        subject
      )}&body=${encodeURIComponent(body)}`;
      window.location.href = mailto;
    });
  }

  function initGalleryLightbox() {
    const grid = document.querySelector(".gallery-grid");
    if (!grid) return;

    const anchors = [...grid.querySelectorAll("a.gallery-item")];
    if (!anchors.length) return;

    const slides = anchors.map((a) => {
      const img = a.querySelector("img");
      return {
        src: a.getAttribute("href") || "",
        alt: (img && img.getAttribute("alt")) || "",
      };
    });

    const root = document.createElement("div");
    root.className = "lightbox";
    root.setAttribute("hidden", "");
    root.setAttribute("role", "dialog");
    root.setAttribute("aria-modal", "true");
    root.setAttribute("aria-label", "Gallery image");

    const backdrop = document.createElement("div");
    backdrop.className = "lightbox-backdrop";
    backdrop.setAttribute("aria-hidden", "true");

    const frame = document.createElement("div");
    frame.className = "lightbox-frame";

    const lbImg = document.createElement("img");
    lbImg.className = "lightbox-img";
    lbImg.setAttribute("decoding", "async");
    lbImg.setAttribute("fetchpriority", "high");
    lbImg.alt = "";

    const btnClose = document.createElement("button");
    btnClose.type = "button";
    btnClose.className = "lightbox-btn lightbox-close";
    btnClose.setAttribute("aria-label", "Close");
    btnClose.innerHTML =
      '<span aria-hidden="true">\u00d7</span>';

    const btnPrev = document.createElement("button");
    btnPrev.type = "button";
    btnPrev.className = "lightbox-btn lightbox-prev";
    btnPrev.setAttribute("aria-label", "Previous image");
    btnPrev.innerHTML = '<span aria-hidden="true">\u2039;</span>';

    const btnNext = document.createElement("button");
    btnNext.type = "button";
    btnNext.className = "lightbox-btn lightbox-next";
    btnNext.setAttribute("aria-label", "Next image");
    btnNext.innerHTML = '<span aria-hidden="true">\u203a;</span>';

    frame.appendChild(lbImg);
    root.appendChild(backdrop);
    root.appendChild(frame);
    root.appendChild(btnClose);
    root.appendChild(btnPrev);
    root.appendChild(btnNext);
    document.body.appendChild(root);

    const mainEl = document.querySelector("main");
    const headerEl = document.querySelector(".site-header");
    const footerEl = document.querySelector(".site-footer");

    const inertWhenOpen = [mainEl, headerEl, footerEl].filter(Boolean);

    function setPageInert(on) {
      inertWhenOpen.forEach((el) => {
        if (on) el.setAttribute("inert", "");
        else el.removeAttribute("inert");
      });
    }

    let index = 0;
    let lastFocus = null;
    let touchStartX = null;

    function showSlide(i) {
      const n = slides.length;
      index = ((i % n) + n) % n;
      const s = slides[index];
      lbImg.src = s.src;
      lbImg.alt = s.alt;
    }

    function open(at) {
      lastFocus = document.activeElement;
      showSlide(at);
      root.removeAttribute("hidden");
      document.body.style.overflow = "hidden";
      setPageInert(true);
      btnClose.focus();
    }

    function close() {
      root.setAttribute("hidden", "");
      document.body.style.overflow = "";
      setPageInert(false);
      lbImg.removeAttribute("src");
      if (lastFocus && typeof lastFocus.focus === "function") {
        lastFocus.focus();
      }
    }

    function goPrev() {
      showSlide(index - 1);
    }

    function goNext() {
      showSlide(index + 1);
    }

    anchors.forEach((a, i) => {
      a.addEventListener("click", (e) => {
        e.preventDefault();
        open(i);
      });
    });

    backdrop.addEventListener("click", close);
    btnClose.addEventListener("click", close);
    btnPrev.addEventListener("click", (e) => {
      e.stopPropagation();
      goPrev();
    });
    btnNext.addEventListener("click", (e) => {
      e.stopPropagation();
      goNext();
    });

    lbImg.addEventListener("click", (e) => e.stopPropagation());

    document.addEventListener("keydown", (e) => {
      if (root.hasAttribute("hidden")) return;
      if (e.key === "Escape") {
        e.preventDefault();
        close();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        goPrev();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        goNext();
      }
    });

    const SWIPE_MIN = 50;
    root.addEventListener(
      "touchstart",
      (e) => {
        if (root.hasAttribute("hidden")) return;
        const t = e.touches[0];
        touchStartX = t ? t.screenX : null;
      },
      { passive: true }
    );
    root.addEventListener(
      "touchend",
      (e) => {
        if (root.hasAttribute("hidden") || touchStartX == null) return;
        const dx = e.changedTouches[0].screenX - touchStartX;
        touchStartX = null;
        if (dx > SWIPE_MIN) goPrev();
        else if (dx < -SWIPE_MIN) goNext();
      },
      { passive: true }
    );
  }

  document.addEventListener("DOMContentLoaded", () => {
    initLangSwitch();
    initSmoothScroll();
    initContactForm();
    initGalleryLightbox();
  });
})();
