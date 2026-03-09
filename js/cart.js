/* ═══════════════════════════════════════════════════════════════════════════
   MilestoneMe — Cart (js/cart.js)
   Panier persistant via localStorage — mockup statique (LemonSqueezy IDs null)
   Charge dans index.html ET boutique.html
   ═══════════════════════════════════════════════════════════════════════════ */

const PRODUCTS = [
  {
    id: 'mug',
    lemonsqueezy_id: null, // TODO: remplir apres creation compte LemonSqueezy
    name: 'Mug personnalisé',
    price: 19.90,
    emoji: '☕',
    description: 'Ton milestone imprimé sur un mug premium',
    badge: 'Bestseller',
    badgeColor: 'amber'
  },
  {
    id: 'poster',
    lemonsqueezy_id: null,
    name: 'Poster A3',
    price: 34.90,
    emoji: '🖼',
    description: 'Affiche A3 haute qualité personnalisée',
    badge: 'Populaire',
    badgeColor: 'indigo'
  },
  {
    id: 'premium',
    lemonsqueezy_id: null,
    name: 'Premium annuel',
    price: 9.00,
    emoji: '⭐',
    description: 'Accès premium 1 an',
    badge: 'Abonnement',
    badgeColor: 'violet',
    isSubscription: true
  }
];

/* ── State ──────────────────────────────────────────────────────────────── */
let cart = [];
try { cart = JSON.parse(localStorage.getItem('ms_cart') || '[]'); } catch(e) { cart = []; }

/* ── Persistence ────────────────────────────────────────────────────────── */
function saveCart() {
  try { localStorage.setItem('ms_cart', JSON.stringify(cart)); } catch(e) {}
  updateCartUI();
}

/* ── Add / Remove / Adjust ──────────────────────────────────────────────── */
function addToCart(productId) {
  const product = PRODUCTS.find(p => p.id === productId);
  if (!product) return;

  const existing = cart.find(i => i.id === productId);
  if (existing) {
    // Subscriptions ne peuvent pas avoir qty > 1
    if (!product.isSubscription) existing.qty++;
  } else {
    cart.push({ id: productId, qty: 1 });
  }

  saveCart();
  openCart();
  showAddedFeedback(productId);
}

function removeFromCart(productId) {
  cart = cart.filter(i => i.id !== productId);
  saveCart();
}

function adjustQty(productId, delta) {
  const item = cart.find(i => i.id === productId);
  if (!item) return;
  item.qty = Math.max(0, item.qty + delta);
  if (item.qty === 0) cart = cart.filter(i => i.id !== productId);
  saveCart();
}

/* ── UI sync ────────────────────────────────────────────────────────────── */
function updateCartUI() {
  const count = cart.reduce((sum, i) => sum + i.qty, 0);

  // Tous les badges (index + boutique peuvent etre ouverts dans la meme session)
  document.querySelectorAll('#cart-count').forEach(badge => {
    badge.textContent = count;
    badge.style.display = count > 0 ? 'flex' : 'none';
  });

  renderCartDrawer();
}

function renderCartDrawer() {
  const body   = document.getElementById('cart-body');
  const footer = document.getElementById('cart-footer');
  if (!body) return;

  if (cart.length === 0) {
    body.innerHTML = `
      <div class="cart-empty">
        <div class="cart-empty__icon" aria-hidden="true">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" opacity="0.4">
            <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
            <line x1="3" y1="6" x2="21" y2="6"/>
            <path d="M16 10a4 4 0 01-8 0"/>
          </svg>
        </div>
        <p class="cart-empty__title">Ton panier est vide</p>
        <p class="cart-empty__sub">Découvre nos souvenirs de vie</p>
        <a href="/boutique" class="cart-empty__link" onclick="closeCart()">Voir la boutique</a>
      </div>
    `;
    if (footer) footer.hidden = true;
  } else {
    body.innerHTML = cart.map(item => {
      const p = PRODUCTS.find(p => p.id === item.id);
      if (!p) return '';
      const priceStr = p.price.toFixed(2).replace('.', ',') + '€' + (p.isSubscription ? '/an' : '');
      return `
        <div class="cart-item" data-item-id="${p.id}">
          <span class="cart-item__emoji" aria-hidden="true">${p.emoji}</span>
          <div class="cart-item__info">
            <strong class="cart-item__name">${p.name}</strong>
            <span class="cart-item__price">${priceStr}</span>
          </div>
          ${!p.isSubscription ? `
          <div class="cart-item__qty" role="group" aria-label="Quantité de ${p.name}">
            <button class="cart-qty-btn" onclick="adjustQty('${p.id}', -1)" aria-label="Diminuer la quantité">−</button>
            <span class="cart-qty-val" aria-live="polite">${item.qty}</span>
            <button class="cart-qty-btn" onclick="adjustQty('${p.id}', 1)" aria-label="Augmenter la quantité">+</button>
          </div>` : '<div class="cart-item__qty"></div>'}
          <button class="cart-item__remove" onclick="removeFromCart('${p.id}')" aria-label="Supprimer ${p.name} du panier">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
      `;
    }).join('');

    const total = cart.reduce((sum, item) => {
      const p = PRODUCTS.find(p => p.id === item.id);
      return sum + (p ? p.price * item.qty : 0);
    }, 0);

    if (footer) {
      footer.hidden = false;
      const totalEl = document.getElementById('cart-total');
      if (totalEl) totalEl.textContent = total.toFixed(2).replace('.', ',') + '€';
    }
  }
}

/* ── Drawer open/close ──────────────────────────────────────────────────── */
function openCart() {
  const drawer  = document.getElementById('cart-drawer');
  const overlay = document.getElementById('cart-overlay');
  if (drawer)  { drawer.classList.add('open');  drawer.setAttribute('aria-hidden', 'false'); }
  if (overlay) overlay.classList.add('open');
  document.body.style.overflow = 'hidden';

  // Focus le premier élément focusable du drawer pour accessibilité
  requestAnimationFrame(() => {
    const firstFocusable = drawer?.querySelector('button, a, [tabindex="0"]');
    firstFocusable?.focus();
  });
}

function closeCart() {
  const drawer  = document.getElementById('cart-drawer');
  const overlay = document.getElementById('cart-overlay');
  if (drawer)  { drawer.classList.remove('open'); drawer.setAttribute('aria-hidden', 'true'); }
  if (overlay) overlay.classList.remove('open');
  document.body.style.overflow = '';

  // Remettre le focus sur le bouton FAB
  document.getElementById('cart-btn')?.focus();
}

/* ── Add feedback on product CTA button ────────────────────────────────── */
function showAddedFeedback(productId) {
  const btns = document.querySelectorAll(`[data-product="${productId}"]`);
  btns.forEach(btn => {
    const original = btn.innerHTML;
    btn.innerHTML = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><polyline points="20 6 9 17 4 12"/></svg> Ajouté !';
    btn.classList.add('btn-added');
    setTimeout(() => {
      btn.innerHTML = original;
      btn.classList.remove('btn-added');
    }, 1600);
  });
}

/* ── Checkout (mockup) ──────────────────────────────────────────────────── */
function checkout() {
  // TODO: integrer LemonSqueezy checkout overlay quand les IDs seront disponibles
  const modal = document.createElement('div');
  modal.className = 'checkout-mockup-modal';
  modal.setAttribute('role', 'alertdialog');
  modal.setAttribute('aria-modal', 'true');
  modal.setAttribute('aria-label', 'Checkout en cours de développement');
  modal.innerHTML = `
    <div class="checkout-mockup-panel">
      <div class="checkout-mockup-icon" aria-hidden="true">🚧</div>
      <h3 class="checkout-mockup-title">Bientôt disponible</h3>
      <p class="checkout-mockup-msg">L'intégration LemonSqueezy est en cours. La boutique ouvre très bientôt — laisse ton email pour être averti·e en premier.</p>
      <button class="checkout-mockup-close btn-go" onclick="this.closest('.checkout-mockup-modal').remove()">Compris !</button>
    </div>
  `;
  document.body.appendChild(modal);
  // Auto-close on overlay click
  modal.addEventListener('click', e => { if (e.target === modal) modal.remove(); });
  // Focus the close button
  requestAnimationFrame(() => modal.querySelector('button')?.focus());
}

/* ── Keyboard trap in cart drawer (Escape to close) ────────────────────── */
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    const drawer = document.getElementById('cart-drawer');
    if (drawer?.classList.contains('open')) closeCart();
  }
});

/* ── Init ────────────────────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  updateCartUI();

  document.getElementById('cart-overlay')?.addEventListener('click', closeCart);
  document.getElementById('cart-btn')?.addEventListener('click', openCart);
});
