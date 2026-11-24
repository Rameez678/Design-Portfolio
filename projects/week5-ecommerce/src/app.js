// @ts-nocheck

const formatPrice = (n) => `£${Number(n).toFixed(2)}`;

// ---------- Elements
const btnTheme = document.getElementById('btnTheme');
const btnMobileNav = document.getElementById('btnMobileNav');
const mobileNav = document.getElementById('mobileNav');

const productsGrid = document.getElementById('productsGrid');
const emptyState = document.getElementById('emptyState');
const sortSelect = document.getElementById('sortSelect');
const minPrice = document.getElementById('minPrice');
const maxPrice = document.getElementById('maxPrice');
const searchInput = document.getElementById('searchInput');
const searchInputMobile = document.getElementById('searchInputMobile');

const btnCart = document.getElementById('btnCart');
const cartDrawer = document.getElementById('cartDrawer');
const cartBackdrop = document.getElementById('cartBackdrop');
const closeCart = document.getElementById('closeCart');
const cartItems = document.getElementById('cartItems');
const cartSubtotal = document.getElementById('cartSubtotal');
const cartCount = document.getElementById('cartCount');
const btnCheckout = document.getElementById('checkoutBtn');

const qvEl = document.getElementById('quickView');
const qvBackdrop = document.getElementById('qvBackdrop');
const qvImage = document.getElementById('qvImage');
const qvTitle = document.getElementById('qvTitle');
const qvPrice = document.getElementById('qvPrice');
const qvBadge = document.getElementById('qvBadge');
const qvDesc = document.getElementById('qvDesc');
const qvQty = document.getElementById('qvQty');
const qvAdd = document.getElementById('qvAdd');
const qvClose = document.getElementById('qvClose');

const btnLogin = document.getElementById('btnLogin');
const loginModal = document.getElementById('loginModal');
const loginBackdrop = document.getElementById('loginBackdrop');
const loginClose = document.getElementById('loginClose');
const loginForm = document.getElementById('loginForm');
const loginEmail = document.getElementById('loginEmail');
const loginRemember = document.getElementById('loginRemember');

// ---------- Theme + mobile nav
btnTheme?.addEventListener('click', () => {
  document.documentElement.classList.toggle('dark');
  document.body.classList.toggle('bg-neutral-950');
  document.body.classList.toggle('text-white');
});

btnMobileNav?.addEventListener('click', () => {
  mobileNav?.classList.toggle('hidden');
});

// ---------- Products
const products = [
  {
    id: 'p1',
    title: 'Van Blanc NFL Obsidian Jersey – Black',
    price: 65,
    rating: 4.9,
    category: 'apparel',
    badge: 'Bestseller',
    image: './assets/black-jersey.jpg',
    desc: 'Black mesh jersey with bold Van Blanc lettering and premium streetwear finish.'
  },
  {
    id: 'p2',
    title: 'Blackout Brazil OG Windbreaker',
    price: 85,
    rating: 4.8,
    category: 'apparel',
    badge: 'New',
    image: './assets/black-windbreaker.webp',
    desc: 'Lightweight black windbreaker with zip front, hood, and signature Van Blanc branding.'
  },
  {
    id: 'p3',
    title: 'Beautiful Lies Knit Baby Blue',
    price: 75,
    rating: 4.7,
    category: 'apparel',
    badge: 'Limited',
    image: './assets/blue-knit.webp',
    desc: 'Soft baby blue knit sweater with clean premium finish and subtle chest logo.'
  }
];

function findProduct(id) {
  return products.find((p) => p.id === id);
}

// ---------- State
const state = {
  filter: 'all',
  minPrice: null,
  maxPrice: null,
  sort: 'popular',
  query: ''
};

const CART_KEY = 'vanblanc.cart.v1';
const USER_KEY = 'vanblanc.user.v1';
let cart = JSON.parse(localStorage.getItem(CART_KEY) || '[]');
let currentQuickViewId = null;

// ---------- Helpers
function saveCart() {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

function getCartCount() {
  return cart.reduce((sum, item) => sum + item.qty, 0);
}

function getCartTotal() {
  return cart.reduce((sum, item) => sum + item.qty * item.price, 0);
}

// ---------- Product rendering
function renderProducts(list) {
  if (!productsGrid) return;

  productsGrid.innerHTML = '';

  if (!list.length) {
    emptyState?.classList.remove('hidden');
    return;
  }

  emptyState?.classList.add('hidden');

  list.forEach((p) => {
    const card = document.createElement('article');
    card.className = 'group overflow-hidden rounded-2xl border bg-white transition hover:shadow-md';

    card.innerHTML = `
      <div class="relative aspect-square overflow-hidden bg-white">
        <img src="${p.image}" alt="${p.title}" class="h-full w-full object-contain p-4" />
        ${p.badge ? `<span class="absolute left-2 top-2 rounded-full border bg-white/90 px-2 py-1 text-xs backdrop-blur">${p.badge}</span>` : ''}
        <button type="button" class="absolute right-2 top-2 rounded-xl border bg-white/90 p-2 backdrop-blur hover:bg-white" aria-label="Quick view" data-qv="${p.id}">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7Zm10 3a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"/>
          </svg>
        </button>
      </div>

      <div class="p-3">
        <div class="flex items-start justify-between gap-3">
          <h3 class="font-medium leading-snug">${p.title}</h3>
          <span class="shrink-0">${formatPrice(p.price)}</span>
        </div>

        <div class="mt-1 flex items-center gap-1 text-amber-500">
          ${'★'.repeat(Math.round(p.rating))}<span class="text-neutral-300">${'★'.repeat(5 - Math.round(p.rating))}</span>
          <span class="ml-1 text-xs text-neutral-500">${p.rating.toFixed(1)}</span>
        </div>

        <div class="mt-3 grid grid-cols-2 gap-2">
          <button type="button" class="rounded-xl border py-2 hover:bg-neutral-50" data-add="${p.id}">Add</button>
          <button type="button" class="rounded-xl bg-neutral-900 py-2 text-white hover:bg-neutral-800" data-buy="${p.id}">Buy now</button>
        </div>
      </div>
    `;

    productsGrid.appendChild(card);
  });
}

function applyFilters() {
  let list = [...products];

  if (state.filter !== 'all') {
    list = list.filter((p) => p.category === state.filter);
  }

  if (state.minPrice !== null) {
    list = list.filter((p) => p.price >= state.minPrice);
  }

  if (state.maxPrice !== null) {
    list = list.filter((p) => p.price <= state.maxPrice);
  }

  if (state.query) {
    list = list.filter((p) =>
      `${p.title} ${p.desc}`.toLowerCase().includes(state.query)
    );
  }

  switch (state.sort) {
    case 'priceAsc':
      list.sort((a, b) => a.price - b.price);
      break;
    case 'priceDesc':
      list.sort((a, b) => b.price - a.price);
      break;
    case 'rating':
      list.sort((a, b) => b.rating - a.rating);
      break;
    case 'newest':
      list.sort((a, b) => b.id.localeCompare(a.id));
      break;
    default:
      break;
  }

  renderProducts(list);
}

// ---------- Filters + search
document.querySelectorAll('.filter-chip').forEach((btn) => {
  btn.classList.add('rounded-full', 'px-3', 'py-1.5', 'border', 'text-sm', 'hover:bg-neutral-50');

  btn.addEventListener('click', (e) => {
    document.querySelectorAll('.filter-chip').forEach((b) => {
      b.classList.remove('active', 'bg-neutral-900', 'text-white');
    });

    e.currentTarget.classList.add('active', 'bg-neutral-900', 'text-white');
    state.filter = e.currentTarget.dataset.filter || 'all';
    applyFilters();
  });
});

sortSelect?.addEventListener('change', () => {
  state.sort = sortSelect.value;
  applyFilters();
});

minPrice?.addEventListener('input', () => {
  const val = parseFloat(minPrice.value);
  state.minPrice = Number.isNaN(val) ? null : val;
  applyFilters();
});

maxPrice?.addEventListener('input', () => {
  const val = parseFloat(maxPrice.value);
  state.maxPrice = Number.isNaN(val) ? null : val;
  applyFilters();
});

function updateQuery(value) {
  state.query = (value || '').toLowerCase().trim();
  applyFilters();
}

searchInput?.addEventListener('input', (e) => updateQuery(e.target.value));
searchInputMobile?.addEventListener('input', (e) => updateQuery(e.target.value));

window.addEventListener('keydown', (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
    e.preventDefault();
    (searchInput || searchInputMobile)?.focus();
  }
});

// ---------- Cart
function renderCart() {
  if (!cartItems || !cartSubtotal || !cartCount) return;

  cartItems.innerHTML = '';

  if (!cart.length) {
    cartItems.innerHTML = `<p class="text-neutral-600">Your cart is empty.</p>`;
  } else {
    cart.forEach((item) => {
      const row = document.createElement('div');
      row.innerHTML = `
        <div class="grid grid-cols-[64px,1fr,auto] gap-3">
          <img src="${item.image}" alt="${item.title}" class="h-16 w-16 rounded-lg border bg-white object-contain p-1">
          <div>
            <p class="font-medium">${item.title}</p>
            <p class="text-sm text-neutral-600">${formatPrice(item.price)}</p>
            <div class="mt-2 inline-flex items-center gap-2 rounded-xl border px-2">
              <button type="button" class="px-2 py-1" data-dec="${item.id}">−</button>
              <input type="number" min="1" value="${item.qty}" class="w-12 text-center outline-none" data-qty="${item.id}">
              <button type="button" class="px-2 py-1" data-inc="${item.id}">+</button>
            </div>
          </div>
          <div class="text-right">
            <button type="button" class="rounded-lg p-2 hover:bg-neutral-100" data-remove="${item.id}" aria-label="Remove">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M6 7h12M9 7V5a2 2 0 1 1 4 0v2m-5 0v12a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2V7"/>
              </svg>
            </button>
          </div>
        </div>
      `;
      cartItems.appendChild(row);
    });
  }

  cartSubtotal.textContent = formatPrice(getCartTotal());
  cartCount.textContent = getCartCount();
  saveCart();
}

function addToCart(id, qty = 1) {
  const product = findProduct(id);
  if (!product) return;

  const existing = cart.find((item) => item.id === id);

  if (existing) {
    existing.qty += qty;
  } else {
    cart.push({
      id: product.id,
      title: product.title,
      price: product.price,
      image: product.image,
      qty
    });
  }

  renderCart();
}

function openCart() {
  cartDrawer?.classList.remove('hidden');
}

function hideCart() {
  cartDrawer?.classList.add('hidden');
}

btnCart?.addEventListener('click', () => {
  renderCart();
  openCart();
});

closeCart?.addEventListener('click', hideCart);
cartBackdrop?.addEventListener('click', hideCart);

cartItems?.addEventListener('click', (e) => {
  const dec = e.target.closest('[data-dec]');
  const inc = e.target.closest('[data-inc]');
  const removeBtn = e.target.closest('[data-remove]');

  if (dec) {
    const item = cart.find((i) => i.id === dec.dataset.dec);
    if (item && item.qty > 1) item.qty -= 1;
    renderCart();
  }

  if (inc) {
    const item = cart.find((i) => i.id === inc.dataset.inc);
    if (item) item.qty += 1;
    renderCart();
  }

  if (removeBtn) {
    cart = cart.filter((i) => i.id !== removeBtn.dataset.remove);
    renderCart();
  }
});

cartItems?.addEventListener('input', (e) => {
  const qtyInput = e.target.closest('[data-qty]');
  if (!qtyInput) return;

  const item = cart.find((i) => i.id === qtyInput.dataset.qty);
  if (!item) return;

  const value = parseInt(qtyInput.value, 10) || 1;
  item.qty = Math.max(1, value);
  renderCart();
});

// ---------- Checkout
// This is a portfolio/showcase build, not a live store — there's no
// payment backend, so "Checkout" shows a friendly note rather than
// either doing nothing or pretending to take payment.
function handleCheckout() {
  if (!cart.length) {
    alert('Your cart is empty.');
    return;
  }

  alert("This is a basic e-commerce so cannot go further.");
}

btnCheckout?.addEventListener('click', handleCheckout);

// ---------- Product card button actions
productsGrid?.addEventListener('click', (e) => {
  const addBtn = e.target.closest('[data-add]');
  const buyBtn = e.target.closest('[data-buy]');
  const qvBtn = e.target.closest('[data-qv]');

  if (addBtn) {
    addToCart(addBtn.dataset.add, 1);
    renderCart();
  }

  if (buyBtn) {
    addToCart(buyBtn.dataset.buy, 1);
    renderCart();
    openCart();
  }

  if (qvBtn) {
    openQuickView(qvBtn.dataset.qv);
  }
});

// ---------- Quick view
function openQuickView(id) {
  const product = findProduct(id);
  if (!product || !qvEl) return;

  currentQuickViewId = id;
  qvImage.src = product.image;
  qvTitle.textContent = product.title;
  qvPrice.textContent = formatPrice(product.price);
  qvBadge.textContent = product.badge || '';
  qvBadge.classList.toggle('hidden', !product.badge);
  qvDesc.textContent = product.desc;
  qvQty.value = 1;
  qvEl.classList.remove('hidden');
}

function closeQuickView() {
  qvEl?.classList.add('hidden');
}

qvBackdrop?.addEventListener('click', closeQuickView);
qvClose?.addEventListener('click', closeQuickView);
qvAdd?.addEventListener('click', () => {
  const qty = Math.max(1, parseInt(qvQty.value, 10) || 1);
  addToCart(currentQuickViewId, qty);
  closeQuickView();
  renderCart();
  openCart();
});

// ---------- Login modal
// NOTE: this is a client-only mock for showcase purposes. It accepts
// any email/password and stores a fake "user" in localStorage — there
// is no real authentication happening, which is fine for a portfolio
// demo but shouldn't be presented as a working login system.
function openLogin() {
  loginModal?.classList.remove('hidden');
}

function closeLogin() {
  loginModal?.classList.add('hidden');
}

btnLogin?.addEventListener('click', openLogin);
loginBackdrop?.addEventListener('click', closeLogin);
loginClose?.addEventListener('click', closeLogin);

function setUser(user) {
  if (user) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    if (btnLogin) btnLogin.classList.add('hidden');

    let avatar = document.getElementById('userAvatar');
    if (!avatar && btnCart?.parentElement) {
      avatar = document.createElement('button');
      avatar.id = 'userAvatar';
      avatar.className = 'h-9 w-9 rounded-full border flex items-center justify-center text-sm font-medium hover:bg-neutral-50';
      avatar.title = 'Click to sign out';
      btnCart.parentElement.insertBefore(avatar, btnCart);
      avatar.addEventListener('click', () => {
        localStorage.removeItem(USER_KEY);
        location.reload();
      });
    }

    if (avatar) {
      avatar.textContent = (user.name?.[0] || user.email?.[0] || 'U').toUpperCase();
    }
  }
}

const savedUser = JSON.parse(localStorage.getItem(USER_KEY) || 'null');
if (savedUser) setUser(savedUser);

loginForm?.addEventListener('submit', (e) => {
  e.preventDefault();
  const email = (loginEmail.value || '').trim();
  if (!email) return;

  const name = email.split('@')[0];
  setUser({ email, name, remember: !!loginRemember?.checked });
  closeLogin();
});

// ---------- Init
document.getElementById('year').textContent = new Date().getFullYear();
applyFilters();
renderCart();