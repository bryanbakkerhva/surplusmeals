/* ═══════════════════════════════════════════════════════
   MAIN.JS — Surplus Meals
   Init · Nav · Scroll · Counters · Signup · Social proof
═══════════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {

  // ── 1. LAUNCH DATE ──────────────────────────────────
  const LAUNCH_DATE = new Date('2026-03-18T09:00:00');

  // ── 2. FLIP CLOCK ───────────────────────────────────
  new FlipClock('flipClock', LAUNCH_DATE);

  // ── 3. IMPACT CALCULATOR ────────────────────────────
  new ImpactCalculator();

  // ── 4. LUCIDE ICONS ─────────────────────────────────
  if (window.lucide) {
    lucide.createIcons();
  }

  // ── 5. NAV SCROLL BEHAVIOR ──────────────────────────
  const nav = document.getElementById('mainNav');
  const handleNavScroll = () => {
    if (window.scrollY > 60) {
      nav.classList.add('nav-solid');
    } else {
      nav.classList.remove('nav-solid');
    }
  };
  window.addEventListener('scroll', handleNavScroll, { passive: true });
  handleNavScroll();

  // ── 6. SCROLL PROGRESS BAR ──────────────────────────
  const progressBar = document.querySelector('.scroll-progress');
  if (progressBar) {
    window.addEventListener('scroll', () => {
      const scrollTop    = document.documentElement.scrollTop;
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      const pct          = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
      progressBar.style.width = pct + '%';
    }, { passive: true });
  }

  // ── 7. SCROLL REVEAL (IntersectionObserver) ─────────
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

  // ── 8. STAT COUNTERS ────────────────────────────────
  const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el      = entry.target;
        const target  = parseFloat(el.dataset.target);
        const format  = el.dataset.format || 'int';
        animateCounter(el, 0, target, 1800, format);
        statsObserver.unobserve(el);
      }
    });
  }, { threshold: 0.5 });

  document.querySelectorAll('.stat-number[data-target]').forEach(el => {
    statsObserver.observe(el);
  });

  function animateCounter(el, from, to, duration, format) {
    const startTime = performance.now();

    const tick = (now) => {
      const elapsed  = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased    = easeOutCubic(progress);
      const value    = from + (to - from) * eased;

      el.textContent = formatValue(value, format);

      if (progress < 1) {
        requestAnimationFrame(tick);
      } else {
        el.textContent = formatValue(to, format);
      }
    };

    requestAnimationFrame(tick);
  }

  function formatValue(val, format) {
    switch (format) {
      case 'decimal1': return val.toFixed(1).replace('.', ',');
      case 'int':      return Math.round(val).toLocaleString('nl-NL');
      default:         return Math.round(val);
    }
  }

  function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
  }

  // ── 9. SOCIAL PROOF COUNTER ─────────────────────────
  // Starts at a base and slowly increments for engagement effect
  const proofEl = document.getElementById('signupCount');
  if (proofEl) {
    // Animate from 31 to base count on load
    animateCounter(proofEl, 31, 47, 1200, 'int');
  }

  // ── 10. SIGNUP FORMS ────────────────────────────────
  function handleSignup(formId, successId, inputId) {
    const form    = document.getElementById(formId);
    const success = document.getElementById(successId);
    const input   = document.getElementById(inputId);

    if (!form) return;

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = input ? input.value.trim() : '';

      if (!email || !email.includes('@') || !email.includes('.')) {
        if (input) {
          input.style.borderColor = '#c05353';
          input.focus();
          setTimeout(() => (input.style.borderColor = ''), 2000);
        }
        return;
      }

      // Store in localStorage
      const signups = JSON.parse(localStorage.getItem('sm_signups') || '[]');
      if (!signups.includes(email)) {
        signups.push(email);
        localStorage.setItem('sm_signups', JSON.stringify(signups));
      }

      // Bump proof counter
      if (proofEl) {
        const current = parseInt(proofEl.textContent, 10) || 47;
        proofEl.textContent = current + 1;
      }

      // Show success
      if (success) {
        form.style.display  = 'none';
        success.style.display = 'block';
      }
    });
  }

  handleSignup('heroSignupForm',  'heroSignupSuccess',  'heroEmailInput');
  handleSignup('ctaSignupForm',   'ctaSignupSuccess',   'ctaEmailInput');

  // ── 11. MOBILE BAR ──────────────────────────────────
  const mobileBar = document.getElementById('mobileBar');

  // ── 12. SMOOTH ANCHOR LINKS ─────────────────────────
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      const target = document.querySelector(link.getAttribute('href'));
      if (target) {
        e.preventDefault();
        const offset = 80; // nav height
        const top    = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });

  // ── 13. CALCULATOR SECTION — TRIGGER INITIAL STATE ──
  const slider = document.getElementById('mealSlider');
  if (slider) {
    slider.dispatchEvent(new Event('input'));
  }

  // ── 14. SOLUTION SCROLL SHOWCASE ────────────────────
  initSolutionScroll();

  function initSolutionScroll() {
    const scrollEl = document.querySelector('.solution-scroll');
    if (!scrollEl) return;

    const steps = document.querySelectorAll('.solution-step');
    const imgs  = document.querySelectorAll('.solution-img');
    const dots  = document.querySelectorAll('.solution-dot');
    const TOTAL = steps.length;
    let   activeStep = -1;

    // On narrow screens (mobile fallback) show first image only
    if (window.innerWidth <= 900) {
      setStep(0);
      return;
    }

    function setStep(i) {
      if (i === activeStep) return;
      activeStep = i;
      steps.forEach((el, idx) => el.classList.toggle('is-active', idx === i));
      imgs .forEach((el, idx) => el.classList.toggle('is-active', idx === i));
      dots .forEach((el, idx) => el.classList.toggle('is-active', idx === i));
    }

    function onScroll() {
      const rect       = scrollEl.getBoundingClientRect();
      const scrollable = scrollEl.offsetHeight - window.innerHeight;
      if (scrollable <= 0) return;

      const progress = Math.max(0, Math.min(1, -rect.top / scrollable));
      const step     = Math.min(Math.floor(progress * TOTAL), TOTAL - 1);
      setStep(step);
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll(); // set initial state
  }

  // ── 15. MOBILE BAR VISIBILITY ───────────────────────
  // (replaces the old signup-card reference)
  const heroSignup = document.querySelector('.hero-signup');
  if (mobileBar && heroSignup) {
    const signupObs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        mobileBar.style.opacity      = entry.isIntersecting ? '0' : '1';
        mobileBar.style.pointerEvents = entry.isIntersecting ? 'none' : 'auto';
      });
    }, { threshold: 0.3 });
    signupObs.observe(heroSignup);
  }

});
