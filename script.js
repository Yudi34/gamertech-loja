// ==========================
// Configuração de Produtos
// ==========================
const products = [
  // Processadores
  { id: 'cpu-13900k', name: 'Intel Core i9-13900K', price: 3199.90, category: 'Processadores', desc: 'Desempenho topo de linha para jogos e criação.' },
  { id: 'cpu-7950x',  name: 'AMD Ryzen 9 7950X',     price: 2999.90, category: 'Processadores', desc: 'Múltiplos núcleos para tarefas intensas.' },
  { id: 'cpu-13700k', name: 'Intel Core i7-13700K',  price: 2199.90, category: 'Processadores', desc: 'Equilíbrio entre jogos e produtividade.' },

  // Placas de Vídeo
  { id: 'gpu-4090',   name: 'NVIDIA GeForce RTX 4090', price: 9999.90, category: 'Placas de Vídeo', desc: 'Performance extrema com DLSS 3.' },
  { id: 'gpu-7900xtx',name: 'AMD Radeon RX 7900 XTX',   price: 6999.90, category: 'Placas de Vídeo', desc: 'Alto desempenho e ótimo custo/benefício.' },
  { id: 'gpu-4070ti', name: 'NVIDIA GeForce RTX 4070 Ti', price: 4499.90, category: 'Placas de Vídeo', desc: 'Excelente para 1440p com ray tracing.' },

  // Memória RAM
  { id: 'ram-vengeance-32', name: 'Corsair Vengeance DDR5 32GB', price: 799.90, category: 'Memória RAM', desc: 'Alta frequência e estabilidade.' },
  { id: 'ram-trident-64',   name: 'G.Skill Trident Z5 RGB 64GB',  price: 1499.90, category: 'Memória RAM', desc: 'Performance + visual com RGB.' },
  { id: 'ram-kingston-16',  name: 'Kingston Fury Beast DDR5 16GB', price: 499.90, category: 'Memória RAM', desc: 'Ótimo para upgrades de entrada.' },
];

// ==========================
// Utilidades
// ==========================
const fmtBRL = (n) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(n);
const $ = (sel, root=document) => root.querySelector(sel);
const $$ = (sel, root=document) => Array.from(root.querySelectorAll(sel));

// ==========================
// Estado do Carrinho
// cart = { [id]: { product, qty } }
// ==========================
const CART_KEY = 'gamertech-cart-v1';
let cart = {};

function loadCart() {
  try {
    const raw = localStorage.getItem(CART_KEY);
    cart = raw ? JSON.parse(raw) : {};
  } catch {
    cart = {};
  }
}
function saveCart() {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}
function getCartCount() {
  return Object.values(cart).reduce((acc, item) => acc + item.qty, 0);
}
function getCartTotal() {
  return Object.values(cart).reduce((acc, item) => acc + item.qty * item.product.price, 0);
}
function addToCart(id, qty=1) {
  const p = products.find(x => x.id === id);
  if (!p) return;
  if (!cart[id]) cart[id] = { product: p, qty: 0 };
  cart[id].qty += qty;
  if (cart[id].qty < 1) delete cart[id]; // sanity
  saveCart();
  renderCart();
  pulseCartCount();
}
function removeFromCart(id) {
  delete cart[id];
  saveCart();
  renderCart();
}
function setQty(id, qty) {
  if (!cart[id]) return;
  cart[id].qty = Math.max(0, qty);
  if (cart[id].qty === 0) delete cart[id];
  saveCart();
  renderCart();
}

// ==========================
// Renderização de Produtos
// ==========================
const productsGrid = $('#productsGrid');

function cardTemplate(p) {
  return `
    <article class="card" data-id="${p.id}" data-category="${p.category}">
      <span class="badge-cat">${p.category}</span>
      <h3>${p.name}</h3>
      <p>${p.desc}</p>
      <div class="price">${fmtBRL(p.price)}</div>
      <button class="btn btn-primary" data-add="${p.id}">Adicionar ao carrinho</button>
    </article>
  `;
}

function renderProducts(list = products) {
  productsGrid.innerHTML = list.map(cardTemplate).join('');
}

// ==========================
// Busca e Filtro por Categoria
// ==========================
const searchInput = $('#searchInput');
const filterButtons = $$('.filter-btn');
let currentFilter = 'todos';

function applyFilter() {
  const term = (searchInput.value || '').toLowerCase().trim();
  const filtered = products.filter(p => {
    const matchCat = currentFilter === 'todos' || p.category === currentFilter;
    const matchTerm = !term || [p.name, p.desc, p.category].join(' ').toLowerCase().includes(term);
    return matchCat && matchTerm;
  });
  renderProducts(filtered);
}

filterButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    filterButtons.forEach(b => b.classList.remove('is-active'));
    btn.classList.add('is-active');
    currentFilter = btn.dataset.filter;
    applyFilter();
  });
});
searchInput.addEventListener('input', applyFilter);

// ==========================
// Carrinho (UI)
// ==========================
const cartPanel = $('#cartPanel');
const openCartBtn = $('#openCartBtn');
const closeCartBtn = $('#closeCartBtn');
const backdrop = $('#backdrop');
const cartItemsEl = $('#cartItems');
const cartTotalEl = $('#cartTotal');
const cartCountEl = $('#cartCount');
const checkoutBtn = $('#checkoutBtn');
const clearCartBtn = $('#clearCartBtn');

function openCart() {
  cartPanel.classList.add('open');
  cartPanel.setAttribute('aria-hidden', 'false');
  backdrop.hidden = false;
}
function closeCart() {
  cartPanel.classList.remove('open');
  cartPanel.setAttribute('aria-hidden', 'true');
  backdrop.hidden = true;
}

openCartBtn.addEventListener('click', openCart);
closeCartBtn.addEventListener('click', closeCart);
backdrop.addEventListener('click', closeCart);
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeCart(); });

function pulseCartCount() {
  cartCountEl.classList.add('pulse');
  setTimeout(() => cartCountEl.classList.remove('pulse'), 300);
}

function renderCart() {
  // Atualiza contador
  cartCountEl.textContent = getCartCount();

  // Lista de itens
  if (Object.keys(cart).length === 0) {
    cartItemsEl.innerHTML = `<p class="muted">Seu carrinho está vazio.</p>`;
  } else {
    cartItemsEl.innerHTML = Object.values(cart).map(({product, qty}) => `
      <div class="cart-item" data-id="${product.id}">
        <h4>${product.name}</h4>
        <div class="muted">${product.category}</div>

        <div class="muted">Preço: ${fmtBRL(product.price)}</div>
        <div style="justify-self:end; display:flex; gap:.3rem; align-items:center;">
          <div class="qty-group">
            <button class="icon-btn" data-dec="${product.id}">−</button>
            <strong>${qty}</strong>
            <button class="icon-btn" data-inc="${product.id}">+</button>
          </div>
          <button class="icon-btn" data-remove="${product.id}" title="Remover">🗑️</button>
        </div>

        <div class="muted">Subtotal:</div>
        <div style="justify-self:end;"><strong>${fmtBRL(product.price * qty)}</strong></div>
      </div>
    `).join('');
  }

  // Total
  cartTotalEl.textContent = fmtBRL(getCartTotal());
}

// Delegação de eventos: botões do carrinho e "Adicionar"
document.addEventListener('click', (e) => {
  const addId = e.target.closest('[data-add]')?.dataset.add;
  const incId = e.target.closest('[data-inc]')?.dataset.inc;
  const decId = e.target.closest('[data-dec]')?.dataset.dec;
  const remId = e.target.closest('[data-remove]')?.dataset.remove;

  if (addId) {
    addToCart(addId, 1);
    openCart();
  }
  if (incId) addToCart(incId, 1);
  if (decId) setQty(decId, (cart[decId]?.qty || 1) - 1);
  if (remId) removeFromCart(remId);
});

clearCartBtn.addEventListener('click', () => {
  if (confirm('Tem certeza que deseja esvaziar o carrinho?')) {
    cart = {};
    saveCart();
    renderCart();
  }
});

checkoutBtn.addEventListener('click', () => {
  if (getCartCount() === 0) {
    alert('Seu carrinho está vazio.');
    return;
  }
  // Simulação de checkout
  const resumo = Object.values(cart)
    .map(({product, qty}) => `• ${product.name} x${qty} = ${fmtBRL(product.price * qty)}`)
    .join('\n');
  alert(
    'Obrigado pela compra!\n\nResumo do pedido:\n' +
    resumo + '\n\nTotal: ' + fmtBRL(getCartTotal()) +
    '\n\n(Checkout de exemplo — sem pagamento real.)'
  );
  cart = {};
  saveCart();
  renderCart();
  closeCart();
});

// ==========================
// Inicialização
// ==========================
loadCart();
renderProducts(products);
renderCart();
applyFilter();