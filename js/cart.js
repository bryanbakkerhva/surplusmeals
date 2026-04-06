/* ═══════════════════════════════════════════════════════
   CART.JS — Surplus Meals Website
   Cart Management · Page Initialization · UI Updates
═══════════════════════════════════════════════════════ */

/* ── MEAL DATA ── */
const meals = [
  {
    id: 1,
    name: 'Geroosterde groentebowl met feta',
    price: 7.5,
    category: 'vegetarisch',
    img: 'https://images.pexels.com/photos/8385550/pexels-photo-8385550.jpeg?auto=compress&cs=tinysrgb&w=600',
    desc: 'Paprika, courgette en ui uit de oven met romige feta en een frisse dressing.'
  },
  {
    id: 2,
    name: 'Linzensoep met zuurdesembrood',
    price: 7.0,
    category: 'vegan',
    img: 'https://images.pexels.com/photos/5175564/pexels-photo-5175564.jpeg?auto=compress&cs=tinysrgb&w=600',
    desc: 'Stevige soep van rode linzen, wortel en tomaat. Met een snee dag-oud zuurdesembrood.'
  },
  {
    id: 3,
    name: 'Kikkererwten-curry met rijst',
    price: 7.5,
    category: 'vegan',
    img: 'https://images.pexels.com/photos/1640769/pexels-photo-1640769.jpeg?auto=compress&cs=tinysrgb&w=600',
    desc: 'Romige curry van kikkererwten, kokosmelk en spinazie op een bed van rijst.'
  },
  {
    id: 4,
    name: 'Pasta primavera',
    price: 7.0,
    category: 'vegetarisch',
    img: 'https://images.pexels.com/photos/1373915/pexels-photo-1373915.jpeg?auto=compress&cs=tinysrgb&w=600',
    desc: 'Penne met broccoli, courgette en parmezaan. Simpel, snel, lekker.'
  },
  {
    id: 5,
    name: 'Aardappelstampot met kaas en ei',
    price: 7.0,
    category: 'vegetarisch',
    img: 'https://images.pexels.com/photos/4869356/pexels-photo-4869356.jpeg?auto=compress&cs=tinysrgb&w=600',
    desc: 'Klassieke stamppot met seizoensgroenten, geraspte kaas en een gebakken ei.'
  },
  {
    id: 6,
    name: 'Tomaat-paprikasaus met pasta',
    price: 7.0,
    category: 'vegetarisch',
    img: 'https://images.pexels.com/photos/769969/pexels-photo-769969.jpeg?auto=compress&cs=tinysrgb&w=600',
    desc: 'Rijke tomatensaus met geroosterde paprika, penne en een zacht gekookt ei.'
  },
  {
    id: 7,
    name: 'Buddha bowl met hummus',
    price: 8.0,
    category: 'vegan',
    img: 'https://images.pexels.com/photos/6823336/pexels-photo-6823336.jpeg?auto=compress&cs=tinysrgb&w=600',
    desc: 'Koude bowl vol kleur: hummus, geroosterde groenten, noten en tahini dressing.'
  },
  {
    id: 8,
    name: 'Zoete aardappelsoep met kokos',
    price: 7.0,
    category: 'vegan',
    img: 'https://images.pexels.com/photos/1731535/pexels-photo-1731535.jpeg?auto=compress&cs=tinysrgb&w=600',
    desc: 'Fluweelzachte soep van zoete aardappel, kokosmelk en een vleugje gember.'
  },
  {
    id: 9,
    name: 'Couscous met geroosterde groenten',
    price: 7.5,
    category: 'vegan',
    img: 'https://images.pexels.com/photos/434258/pexels-photo-434258.jpeg?auto=compress&cs=tinysrgb&w=600',
    desc: 'Luchtige couscous met aubergine, kikkererwten, munt en een citroen-tahini saus.'
  },
  {
    id: 10,
    name: 'Surprise van de week',
    price: 7.5,
    category: 'wisselend',
    img: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=600',
    desc: 'Elke week anders, altijd verrassend. Gemaakt van wat er deze week gered is.'
  }
];

/* ── CART STATE ── */
let cart = [];

/* ═══════════════════════════════════════════════════════
   CART MANAGEMENT FUNCTIONS
═══════════════════════════════════════════════════════ */

function getCart() {
  const params = new URLSearchParams(window.location.search);
  const cartParam = params.get('cart');
  cart = [];
  if (cartParam) {
    const pairs = cartParam.split(',');
    pairs.forEach(pair => {
      const [id, qty] = pair.split(':');
      if (id && qty) {
        cart.push({ mealId: parseInt(id), quantity: parseInt(qty) });
      }
    });
  }
  return cart;
}

function saveCart() {
  if (cart.length === 0) {
    window.history.replaceState({}, '', window.location.pathname);
    return;
  }
  const cartPairs = cart.map(item => `${item.mealId}:${item.quantity}`).join(',');
  const newUrl = `${window.location.pathname}?cart=${cartPairs}`;
  window.history.replaceState({}, '', newUrl);
}

function addToCart(mealId) {
  const existing = cart.find(item => item.mealId === mealId);
  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({ mealId: mealId, quantity: 1 });
  }
  saveCart();
  renderCartBadge();
  renderFloatingCart();
  renderMenuMeals(currentFilter);
}

function removeFromCart(mealId) {
  cart = cart.filter(item => item.mealId !== mealId);
  saveCart();
  renderCartBadge();
  renderFloatingCart();
  renderCheckout();
  renderMenuMeals(currentFilter);
}

function updateQty(mealId, delta) {
  const item = cart.find(item => item.mealId === mealId);
  if (item) {
    item.quantity += delta;
    if (item.quantity <= 0) {
      removeFromCart(mealId);
    } else {
      saveCart();
      renderCartBadge();
      renderFloatingCart();
      renderCheckout();
      renderMenuMeals(currentFilter);
    }
  }
}

function getCartTotal() {
  let items = 0;
  let subtotal = 0;
  cart.forEach(item => {
    const meal = meals.find(m => m.id === item.mealId);
    if (meal) {
      items += item.quantity;
      subtotal += meal.price * item.quantity;
    }
  });
  return { items, subtotal };
}

function formatPrice(price) {
  return '€' + price.toFixed(2).replace('.', ',');
}

function navigateWithCart(url) {
  const cartParam = new URLSearchParams(window.location.search).get('cart');
  const separator = url.includes('?') ? '&' : '?';
  const newUrl = cartParam ? `${url}${separator}cart=${cartParam}` : url;
  window.location.href = newUrl;
}

/* ═══════════════════════════════════════════════════════
   UI RENDERING FUNCTIONS
═══════════════════════════════════════════════════════ */

let currentFilter = 'all';

function renderCartBadge() {
  const total = getCartTotal();
  const badge = document.getElementById('cartCount');
  if (badge) {
    if (total.items > 0) {
      badge.textContent = total.items;
      badge.style.display = 'flex';
    } else {
      badge.style.display = 'none';
    }
  }
}

function renderFloatingCart() {
  const floatingCart = document.getElementById('floatingCart');
  if (!floatingCart) return;

  const total = getCartTotal();
  const countEl = document.getElementById('floatingCartCount');
  const totalEl = document.getElementById('floatingCartTotal');

  if (total.items > 0) {
    floatingCart.classList.add('active');
    if (countEl) countEl.textContent = `${total.items} ${total.items === 1 ? 'maaltijd' : 'maaltijden'}`;
    if (totalEl) totalEl.textContent = formatPrice(total.subtotal);
  } else {
    floatingCart.classList.remove('active');
  }
}

function getCategoryLabel(category) {
  const labels = {
    vegetarisch: 'Vegetarisch',
    vegan: 'Vegan',
    vlees: 'Vlees',
    vis: 'Vis',
    wisselend: 'Wisselend'
  };
  return labels[category] || category;
}

function renderMenuMeals(filter) {
  if (typeof filter === 'string') currentFilter = filter;
  const mealsGrid = document.getElementById('mealsGrid');
  if (!mealsGrid) return;

  mealsGrid.innerHTML = '';

  const filtered = currentFilter === 'all'
    ? meals
    : meals.filter(meal => meal.category === currentFilter);

  filtered.forEach(meal => {
    const cartItem = cart.find(item => item.mealId === meal.id);
    const qty = cartItem ? cartItem.quantity : 0;

    const card = document.createElement('div');
    card.className = 'meal-card reveal is-visible';
    card.innerHTML = `
      <img src="${meal.img}" alt="${meal.name}" class="meal-img" onerror="this.src='https://via.placeholder.com/600x400?text=Maaltijd'">
      <div class="meal-body">
        <span class="meal-tag ${meal.category}">${getCategoryLabel(meal.category)}</span>
        <h3 class="meal-name">${meal.name}</h3>
        <p class="meal-desc">${meal.desc}</p>
        <div class="meal-footer">
          <span class="meal-price">${formatPrice(meal.price)}</span>
          <div class="qty-control">
            ${qty > 0 ? `
              <button class="qty-btn" onclick="updateQty(${meal.id}, -1)">−</button>
              <span class="qty-display">${qty}</span>
              <button class="qty-btn" onclick="updateQty(${meal.id}, 1)">+</button>
            ` : `
              <button class="add-btn" onclick="addToCart(${meal.id})">Toevoegen</button>
            `}
          </div>
        </div>
      </div>
    `;
    mealsGrid.appendChild(card);
  });
}

function renderCheckout() {
  const orderSummary = document.getElementById('orderSummary');
  if (!orderSummary) return;

  const total = getCartTotal();
  const subtotal = total.subtotal;

  if (cart.length === 0) {
    orderSummary.innerHTML = `
      <h3>Je bestelling</h3>
      <div class="order-items">
        <p style="text-align:center;color:var(--c-gray);padding:var(--sp-md) 0;">Je winkelwagen is leeg. <a href="menu.html" style="color:var(--c-orange);font-weight:600;">Bekijk het menu</a></p>
      </div>
      <div class="order-totals">
        <div class="total-row"><span>Subtotaal</span><span class="total-row-value">${formatPrice(0)}</span></div>
        <div class="total-row total"><span>Totaal</span><span class="total-row-value">${formatPrice(0)}</span></div>
      </div>
    `;
    return;
  }

  let itemsHTML = '';
  cart.forEach(item => {
    const meal = meals.find(m => m.id === item.mealId);
    if (meal) {
      const itemPrice = meal.price * item.quantity;
      itemsHTML += `
        <div class="order-item">
          <span class="order-item-name">${meal.name}</span>
          <span class="order-item-qty">×${item.quantity}</span>
          <span class="order-item-price">${formatPrice(itemPrice)}</span>
          <button class="order-item-remove" onclick="removeFromCart(${meal.id})" title="Verwijderen">×</button>
        </div>
      `;
    }
  });

  orderSummary.innerHTML = `
    <h3>Je bestelling</h3>
    <div class="order-items">${itemsHTML}</div>
    <div class="order-totals">
      <div class="total-row"><span>Subtotaal</span><span class="total-row-value">${formatPrice(subtotal)}</span></div>
      <div class="total-row total"><span>Totaal</span><span class="total-row-value">${formatPrice(subtotal)}</span></div>
    </div>
  `;
}

function showOrderConfirmation() {
  const confirmation = document.getElementById('orderConfirmation');
  if (!confirmation) return;

  const orderNumber = 'SM-' + Math.random().toString(36).substr(2, 5).toUpperCase();
  const orderNumberEl = document.getElementById('orderNumber');
  if (orderNumberEl) orderNumberEl.textContent = orderNumber;

  confirmation.style.display = 'flex';

  // Clear cart after short delay
  setTimeout(() => {
    cart = [];
    saveCart();
    renderCartBadge();
  }, 2000);
}

/* ═══════════════════════════════════════════════════════
   PAGE-SPECIFIC INITIALIZATION
═══════════════════════════════════════════════════════ */

function setupHamburger() {
  const hamburger = document.getElementById('hamburger');
  const mobileNav = document.getElementById('mobileNav');
  if (!hamburger || !mobileNav) return;

  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('open');
    mobileNav.classList.toggle('open');
  });

  // Close when link clicked
  mobileNav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('open');
      mobileNav.classList.remove('open');
    });
  });
}

function setupActiveNav() {
  const currentPage = document.body.getAttribute('data-page');
  if (!currentPage) return;

  document.querySelectorAll('[data-page]').forEach(link => {
    if (link.tagName === 'BODY') return;
    if (link.getAttribute('data-page') === currentPage) {
      link.classList.add('active');
    }
  });
}

function setupScrollReveal() {
  const revealElements = document.querySelectorAll('.reveal');
  if (revealElements.length === 0) return;

  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1 }
  );

  revealElements.forEach(el => observer.observe(el));
}

function setupScrollToTop() {
  const btn = document.getElementById('scrollToTop');
  if (!btn) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 300) {
      btn.classList.add('visible');
    } else {
      btn.classList.remove('visible');
    }
  });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

function setupNavScroll() {
  const nav = document.querySelector('.site-nav');
  if (!nav) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      nav.classList.add('nav-scrolled');
    } else {
      nav.classList.remove('nav-scrolled');
    }
  });
}

function setupScrollProgressBar() {
  const progressBar = document.getElementById('scrollProgress');
  if (!progressBar) return;

  window.addEventListener('scroll', () => {
    const scrollPercentage =
      (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
    progressBar.style.width = scrollPercentage + '%';
  });
}

function setupNavLinkPreservation() {
  const cartParam = new URLSearchParams(window.location.search).get('cart');
  if (!cartParam) return;

  document.querySelectorAll('a[href]').forEach(link => {
    const href = link.getAttribute('href');
    if (href && !href.startsWith('#') && !href.startsWith('http') && !href.startsWith('mailto') && !href.startsWith('tel') && href.endsWith('.html')) {
      const separator = href.includes('?') ? '&' : '?';
      link.href = `${href}${separator}cart=${cartParam}`;
    }
  });
}

function setupMenuFilters() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  if (filterBtns.length === 0) return;

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const filter = btn.getAttribute('data-filter') || 'all';
      renderMenuMeals(filter);
    });
  });

  renderMenuMeals('all');
}

function setupCheckout() {
  // Delivery toggle
  const deliveryRadios = document.querySelectorAll('input[name="delivery"]');
  const pickupInfo = document.getElementById('pickupInfo');
  const deliveryForm = document.getElementById('deliveryForm');

  deliveryRadios.forEach(radio => {
    radio.addEventListener('change', () => {
      if (radio.value === 'afhalen') {
        if (pickupInfo) pickupInfo.style.display = 'block';
        if (deliveryForm) deliveryForm.style.display = 'none';
      } else {
        if (pickupInfo) pickupInfo.style.display = 'none';
        if (deliveryForm) deliveryForm.style.display = 'block';
      }
    });
  });

  // Submit order
  const submitBtn = document.getElementById('submitOrder');
  if (submitBtn) {
    submitBtn.addEventListener('click', e => {
      e.preventDefault();
      if (cart.length === 0) {
        alert('Je winkelwagen is leeg. Voeg eerst maaltijden toe via het menu.');
        return;
      }
      showOrderConfirmation();
    });
  }

  // Render order summary
  renderCheckout();
}

function setupImpactCounters() {
  const counters = document.querySelectorAll('.counter-value');
  if (counters.length === 0) return;

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        if (el.hasAttribute('data-animated')) return;

        const text = el.textContent.trim();
        const match = text.match(/([\d.]+)/);
        if (match) {
          const targetStr = match[1];
          const targetNumber = parseInt(targetStr.replace(/\./g, ''));
          const hasThousandSep = targetStr.includes('.');

          el.setAttribute('data-animated', 'true');
          animateCounter(el, 0, targetNumber, 2000, hasThousandSep);
        }
        observer.unobserve(el);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(c => observer.observe(c));
}

function animateCounter(element, start, end, duration, useThousandSep) {
  const startTime = performance.now();

  const formatNum = (n) => {
    if (useThousandSep) {
      return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    }
    return n.toString();
  };

  const animate = (now) => {
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / duration, 1);
    // Ease out cubic
    const eased = 1 - Math.pow(1 - progress, 3);
    const current = Math.floor(start + (end - start) * eased);

    element.textContent = formatNum(current);

    if (progress < 1) {
      requestAnimationFrame(animate);
    } else {
      element.textContent = formatNum(end);
    }
  };

  requestAnimationFrame(animate);
}

/* ═══════════════════════════════════════════════════════
   MAIN PAGE INITIALIZATION
═══════════════════════════════════════════════════════ */

function initPage() {
  // Load cart
  getCart();

  // Common setup
  setupHamburger();
  setupActiveNav();
  setupNavScroll();
  setupScrollReveal();
  setupScrollToTop();
  setupScrollProgressBar();
  setupNavLinkPreservation();
  renderCartBadge();

  // Page-specific
  const page = document.body.getAttribute('data-page');

  if (page === 'index') {
    setupImpactCounters();
  }

  if (page === 'menu') {
    setupMenuFilters();
    renderFloatingCart();
  }

  if (page === 'checkout') {
    setupCheckout();
  }

  if (page === 'contact') {
    // FAQ and contact form are handled by inline script in contact.html
  }

  if (page === 'over-ons') {
    setupImpactCounters();
  }
}

/* ── INITIALIZATION ── */
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initPage);
} else {
  initPage();
}
