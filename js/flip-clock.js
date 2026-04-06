/* ═══════════════════════════════════════════════════════
   FLIP-CLOCK.JS — Surplus Meals
   Split-flap style countdown with rotateX perspective flip
═══════════════════════════════════════════════════════ */

const FLIP_MS = 120; // half-duration of each phase

class FlipDigit {
  constructor(el) {
    this.el = el;
    this.el.className = 'fc-tile';
    this.el.innerHTML = '<span class="fc-tile-num">0</span>';
    this.numEl = this.el.querySelector('.fc-tile-num');
    this.current = null;
    this._busy = false;
    this._queued = null;
  }

  set(value, animate) {
    const str = String(value);
    if (str === this.current) return;

    if (!animate) {
      this.current = str;
      this.numEl.textContent = str;
      return;
    }

    // Queue if already animating
    if (this._busy) {
      this._queued = str;
      return;
    }

    this._flip(str);
  }

  _flip(str) {
    this._busy = true;
    this.current = str;

    // Phase 1 — fold top down (0 → -90deg)
    this.el.style.transition = `transform ${FLIP_MS}ms ease-in`;
    this.el.style.transform  = 'perspective(180px) rotateX(-90deg)';

    setTimeout(() => {
      // Swap number while the card faces away
      this.numEl.textContent = str;

      // Jump to 90deg (card still facing away, from below)
      this.el.style.transition = 'none';
      this.el.style.transform  = 'perspective(180px) rotateX(90deg)';

      // Force reflow so the browser registers the jump
      void this.el.offsetWidth;

      // Phase 2 — fold bottom up (90 → 0deg)
      this.el.style.transition = `transform ${FLIP_MS}ms ease-out`;
      this.el.style.transform  = 'perspective(180px) rotateX(0deg)';

      setTimeout(() => {
        // Clean up inline styles
        this.el.style.transition = '';
        this.el.style.transform  = '';
        this._busy = false;

        // Flush queued update
        if (this._queued !== null) {
          const next = this._queued;
          this._queued = null;
          this._flip(next);
        }
      }, FLIP_MS);
    }, FLIP_MS);
  }
}


class FlipUnit {
  constructor(container, label) {
    this.container  = container;
    this.prevValue  = null;
    this._build(label);
  }

  _build(label) {
    const digitWrap = document.createElement('div');
    digitWrap.className = 'flip-digits';

    const tensEl = document.createElement('div');
    const onesEl = document.createElement('div');
    digitWrap.appendChild(tensEl);
    digitWrap.appendChild(onesEl);

    const labelEl = document.createElement('span');
    labelEl.className  = 'flip-unit-label';
    labelEl.textContent = label;

    this.container.appendChild(digitWrap);
    this.container.appendChild(labelEl);

    this.tens = new FlipDigit(tensEl);
    this.ones = new FlipDigit(onesEl);
  }

  update(value) {
    const padded   = String(value).padStart(2, '0');
    const animate  = this.prevValue !== null && this.prevValue !== value;
    const prevPad  = this.prevValue !== null ? String(this.prevValue).padStart(2, '0') : '00';

    this.tens.set(padded[0], animate && padded[0] !== prevPad[0]);
    this.ones.set(padded[1], animate);

    this.prevValue = value;
  }
}


class FlipClock {
  constructor(containerId, targetDate) {
    this.container  = document.getElementById(containerId);
    if (!this.container) return;

    this.targetDate = targetDate;
    this.units      = {};
    this._build();
    this._tick();
    this.interval = setInterval(() => this._tick(), 1000);
  }

  _build() {
    const defs = [
      { key: 'days',    label: 'Dagen'           },
      { key: 'hours',   label: 'Uur',   sep: true },
      { key: 'minutes', label: 'Min',   sep: true },
      { key: 'seconds', label: 'Sec',   sep: true },
    ];

    defs.forEach(({ key, label, sep }) => {
      if (sep) {
        const s = document.createElement('span');
        s.className   = 'flip-sep';
        s.textContent = ':';
        this.container.appendChild(s);
      }
      const unitEl = document.createElement('div');
      unitEl.className = 'flip-unit';
      this.container.appendChild(unitEl);
      this.units[key] = new FlipUnit(unitEl, label);
    });
  }

  _tick() {
    const now  = new Date();
    const diff = this.targetDate - now;

    if (diff <= 0) {
      this._showLaunched();
      clearInterval(this.interval);
      return;
    }

    const d = Math.floor(diff / 86400000);
    const h = Math.floor((diff % 86400000) / 3600000);
    const m = Math.floor((diff % 3600000)  / 60000);
    const s = Math.floor((diff % 60000)    / 1000);

    this.units.days.update(d);
    this.units.hours.update(h);
    this.units.minutes.update(m);
    this.units.seconds.update(s);

    this._syncMobileBar(d, h, m, s);
  }

  _syncMobileBar(d, h, m, s) {
    const el = document.getElementById('mobileBarTime');
    if (!el) return;
    el.textContent = d > 0
      ? `${d}d ${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`
      : `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
  }

  _showLaunched() {
    const wrap = this.container.closest('.flip-clock-wrap');
    if (wrap) {
      wrap.innerHTML = `
        <p style="color:var(--c-orange);font-size:28px;font-family:var(--f-serif);text-align:center">
          We zijn live!
        </p>`;
    }
  }
}

window.FlipClock = FlipClock;
