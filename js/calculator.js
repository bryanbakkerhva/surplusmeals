/* ═══════════════════════════════════════════════════════
   CALCULATOR.JS — Surplus Meals
   Interactive impact calculator
═══════════════════════════════════════════════════════ */

class ImpactCalculator {
  constructor() {
    this.slider      = document.getElementById('mealSlider');
    this.sliderLabel = document.getElementById('mealsPerWeek');
    this.numFood     = document.getElementById('calcFood');
    this.numCO2      = document.getElementById('calcCO2');
    this.numMoney    = document.getElementById('calcMoney');

    if (!this.slider) return;

    // Constants
    this.WEEKS_PER_YEAR        = 52;
    this.KG_FOOD_PER_MEAL      = 0.40;  // avg food waste per meal (kg)
    this.CO2_PER_KG_FOOD       = 2.50;  // kg CO2e per kg food waste avoided
    this.PRICE_THUISBEZORGD    = 18.00; // avg Thuisbezorgd order price (2025)
    this.PRICE_SURPLUS         = 9.50;  // Surplus Meals price

    this._bindEvents();
    this._update(parseInt(this.slider.value, 10));

    // Update slider fill color
    this._updateSliderFill(parseInt(this.slider.value, 10));
  }

  _bindEvents() {
    this.slider.addEventListener('input', (e) => {
      const val = parseInt(e.target.value, 10);
      this._update(val);
      this._updateSliderFill(val);
    });
  }

  _calculate(mealsPerWeek) {
    const mealsPerYear = mealsPerWeek * this.WEEKS_PER_YEAR;
    const food  = Math.round(mealsPerYear * this.KG_FOOD_PER_MEAL);
    const co2   = Math.round(food * this.CO2_PER_KG_FOOD);
    const money = Math.round(mealsPerYear * (this.PRICE_THUISBEZORGD - this.PRICE_SURPLUS));
    return { food, co2, money };
  }

  _update(mealsPerWeek) {
    // Update label
    if (this.sliderLabel) {
      this.sliderLabel.textContent = mealsPerWeek;
    }

    const { food, co2, money } = this._calculate(mealsPerWeek);

    this._animateNumber(this.numFood,  food);
    this._animateNumber(this.numCO2,   co2);
    this._animateNumber(this.numMoney, money);
  }

  _animateNumber(el, target) {
    if (!el) return;

    const current = parseInt(el.textContent.replace(/[^0-9]/g, ''), 10) || 0;

    if (current === target) return;

    // Trigger CSS animation class
    el.classList.remove('is-updating');
    void el.offsetWidth; // force reflow
    el.classList.add('is-updating');

    // Smooth count from current to target
    const duration = 450;
    const startTime = performance.now();

    const tick = (now) => {
      const elapsed  = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased    = this._easeOut(progress);
      const value    = Math.round(current + (target - current) * eased);

      el.textContent = value.toLocaleString('nl-NL');

      if (progress < 1) {
        requestAnimationFrame(tick);
      } else {
        el.textContent = target.toLocaleString('nl-NL');
        el.classList.remove('is-updating');
      }
    };

    requestAnimationFrame(tick);
  }

  _easeOut(t) {
    return 1 - Math.pow(1 - t, 3);
  }

  _updateSliderFill(value) {
    const min = parseInt(this.slider.min, 10);
    const max = parseInt(this.slider.max, 10);
    const pct = ((value - min) / (max - min)) * 100;

    this.slider.style.background = `linear-gradient(
      90deg,
      var(--c-green-dark) 0%,
      var(--c-green-mid) ${pct}%,
      var(--c-green-pale) ${pct}%,
      var(--c-green-pale) 100%
    )`;
  }
}

// Export
window.ImpactCalculator = ImpactCalculator;
