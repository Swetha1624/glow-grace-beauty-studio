/* =========================================================
   Glow & Grace Beauty Studio — front-end behaviour
   ========================================================= */

// ---- CONFIG: replace with the real studio WhatsApp number ----
// Format: country code + number, no plus sign, no spaces (e.g. "919876543210")
const WHATSAPP_NUMBER = "919876543210";

document.addEventListener("DOMContentLoaded", () => {
  setYear();
  initMobileNav();
  initSmoothScroll();
  initServiceBooking();
  initBookingForm();
  initGalleryLightbox();
  initTestimonialScroller();
  initWhatsappLinks();
  initScrollReveal();
});

/* ---------- Footer year ---------- */
function setYear() {
  const el = document.getElementById("year");
  if (el) el.textContent = new Date().getFullYear();
}

/* ---------- Mobile navigation ---------- */
function initMobileNav() {
  const toggle = document.getElementById("navToggle");
  const links = document.getElementById("navLinks");
  if (!toggle || !links) return;

  toggle.addEventListener("click", () => {
    const isOpen = links.classList.toggle("open");
    toggle.setAttribute("aria-expanded", String(isOpen));
  });

  // Close menu when a link is tapped
  links.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      links.classList.remove("open");
      toggle.setAttribute("aria-expanded", "false");
    });
  });
}

/* ---------- Smooth scroll with header offset ---------- */
function initSmoothScroll() {
  const header = document.getElementById("nav");
  const headerHeight = () => (header ? header.offsetHeight : 0);

  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", (e) => {
      const targetId = link.getAttribute("href");
      if (!targetId || targetId === "#") return;
      const target = document.querySelector(targetId);
      if (!target) return;

      e.preventDefault();
      const top = target.getBoundingClientRect().top + window.pageYOffset - headerHeight() - 12;
      window.scrollTo({ top, behavior: "smooth" });
    });
  });
}

/* ---------- Clicking "Book now" on a service pre-fills the form ---------- */
function initServiceBooking() {
  const serviceSelect = document.getElementById("service");
  if (!serviceSelect) return;

  document.querySelectorAll(".service-row").forEach((row) => {
    const bookBtn = row.querySelector(".btn-small");
    const serviceName = row.dataset.service;
    if (!bookBtn || !serviceName) return;

    bookBtn.addEventListener("click", () => {
      // Select the matching option if it exists
      [...serviceSelect.options].forEach((opt) => {
        if (opt.value === serviceName || opt.textContent.trim() === serviceName) {
          serviceSelect.value = opt.value || opt.textContent.trim();
        }
      });
    });
  });
}

/* ---------- Booking form: validation + success + WhatsApp handoff ---------- */
function initBookingForm() {
  const form = document.getElementById("bookingForm");
  const successMsg = document.getElementById("formSuccess");
  if (!form) return;

  const fields = {
    name: { el: document.getElementById("name"), validate: (v) => v.trim().length >= 2, msg: "Please enter your name." },
    phone: { el: document.getElementById("phone"), validate: (v) => /^[0-9+\-\s]{7,15}$/.test(v.trim()), msg: "Enter a valid phone number." },
    email: { el: document.getElementById("email"), validate: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()), msg: "Enter a valid email address." },
    service: { el: document.getElementById("service"), validate: (v) => v.trim().length > 0, msg: "Please select a service." },
    date: { el: document.getElementById("date"), validate: (v) => v.trim().length > 0, msg: "Please choose a date." },
    time: { el: document.getElementById("time"), validate: (v) => v.trim().length > 0, msg: "Please choose a time." },
  };

  // Clear individual field errors as the user fixes them
  Object.values(fields).forEach(({ el }) => {
    if (!el) return;
    el.addEventListener("input", () => clearFieldError(el));
    el.addEventListener("change", () => clearFieldError(el));
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    successMsg.textContent = "";

    let firstInvalid = null;
    let allValid = true;

    Object.entries(fields).forEach(([key, { el, validate, msg }]) => {
      if (!el) return;
      const valid = validate(el.value || "");
      const errorEl = document.getElementById(`err-${key}`);
      const fieldWrap = el.closest(".field");

      if (!valid) {
        allValid = false;
        if (errorEl) errorEl.textContent = msg;
        if (fieldWrap) fieldWrap.classList.add("has-error");
        if (!firstInvalid) firstInvalid = el;
      } else {
        clearFieldError(el);
      }
    });

    if (!allValid) {
      if (firstInvalid) firstInvalid.focus();
      return;
    }

    // All good — show success and open a pre-filled WhatsApp chat
    const data = {
      name: form.name.value.trim(),
      phone: form.phone.value.trim(),
      email: form.email.value.trim(),
      service: form.service.value.trim(),
      date: form.date.value,
      time: form.time.value,
      message: form.message.value.trim(),
    };

    successMsg.textContent = `Thank you, ${data.name}! Your ${data.service} request for ${formatDate(data.date)} at ${data.time} has been received. We'll confirm shortly.`;

    const waMessage =
      `Hello Glow & Grace Beauty Studio, I would like to book an appointment.\n` +
      `Name: ${data.name}\n` +
      `Service: ${data.service}\n` +
      `Date: ${formatDate(data.date)}\n` +
      `Time: ${data.time}\n` +
      (data.message ? `Notes: ${data.message}` : "");

    const waUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(waMessage)}`;

    // Give the person a moment to read the success message, then open WhatsApp
    window.setTimeout(() => {
      window.open(waUrl, "_blank", "noopener");
    }, 600);

    form.reset();
  });

  function clearFieldError(el) {
    const key = el.id;
    const errorEl = document.getElementById(`err-${key}`);
    if (errorEl) errorEl.textContent = "";
    const fieldWrap = el.closest(".field");
    if (fieldWrap) fieldWrap.classList.remove("has-error");
  }

  function formatDate(isoDate) {
    if (!isoDate) return "";
    const d = new Date(isoDate + "T00:00:00");
    if (isNaN(d)) return isoDate;
    return d.toLocaleDateString(undefined, { day: "numeric", month: "long", year: "numeric" });
  }
}

/* ---------- Gallery lightbox ---------- */
function initGalleryLightbox() {
  const lightbox = document.getElementById("lightbox");
  const caption = document.getElementById("lightboxCaption");
  const closeBtn = document.getElementById("lightboxClose");
  if (!lightbox || !caption || !closeBtn) return;

  document.querySelectorAll(".tile").forEach((tile) => {
    tile.addEventListener("click", () => {
      caption.textContent = tile.dataset.caption || "";
      lightbox.classList.add("open");
    });
  });

  const close = () => lightbox.classList.remove("open");
  closeBtn.addEventListener("click", close);
  lightbox.addEventListener("click", (e) => {
    if (e.target === lightbox) close();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") close();
  });
}

/* ---------- Testimonial horizontal scroller ---------- */
function initTestimonialScroller() {
  const track = document.getElementById("quoteTrack");
  const prev = document.getElementById("quotePrev");
  const next = document.getElementById("quoteNext");
  if (!track || !prev || !next) return;

  const scrollByCard = (direction) => {
    const card = track.querySelector(".quote-card");
    const distance = card ? card.getBoundingClientRect().width + 40 : 300;
    track.scrollBy({ left: direction * distance, behavior: "smooth" });
  };

  prev.addEventListener("click", () => scrollByCard(-1));
  next.addEventListener("click", () => scrollByCard(1));
}

/* ---------- WhatsApp links (floating button + booking aside) ---------- */
function initWhatsappLinks() {
  const defaultMessage = "Hello Glow & Grace Beauty Studio, I would like to book an appointment.";
  const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(defaultMessage)}`;

  ["whatsappFloat", "footerWhatsapp", "asideWhatsapp"].forEach((id) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.setAttribute("href", url);
    el.setAttribute("target", "_blank");
    el.setAttribute("rel", "noopener");
  });
}

/* ---------- One orchestrated reveal per section on first view ---------- */
function initScrollReveal() {
  const targets = document.querySelectorAll(
    ".about, .services, .why, .gallery, .testimonials, .book, .contact"
  );
  if (!("IntersectionObserver" in window) || !targets.length) return;

  targets.forEach((el) => {
    el.style.opacity = "0";
    el.style.transform = "translateY(16px)";
    el.style.transition = "opacity 0.7s ease, transform 0.7s ease";
  });

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = "1";
          entry.target.style.transform = "translateY(0)";
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );

  targets.forEach((el) => observer.observe(el));
}
