(function(){
  const cfg = window.STORE_CONFIG;
  const state = {
    products: [],
    filtered: [],
    cart: loadCart(),
  };

  const el = {
    grid: document.getElementById('products-grid'),
    category: document.getElementById('category-filter'),
    sort: document.getElementById('sort-select'),
    search: document.getElementById('search-input'),
    cartBtn: document.getElementById('cart-button'),
    cartDrawer: document.getElementById('cart-drawer'),
    cartClose: document.getElementById('cart-close'),
    cartItems: document.getElementById('cart-items'),
    cartSubtotal: document.getElementById('cart-subtotal'),
    cartShipping: document.getElementById('cart-shipping'),
    cartTax: document.getElementById('cart-tax'),
    cartTotal: document.getElementById('cart-total'),
    cartCount: document.getElementById('cart-count'),
    checkoutBtn: document.getElementById('checkout-btn'),
    backdrop: document.getElementById('drawer-backdrop'),
  };

  document.getElementById('year').textContent = new Date().getFullYear();

  // Fetch products
  fetch('data/products.json')
    .then(r=>r.json())
    .then(products=>{
      state.products = products;
      populateCategories(products);
      applyFilters();
    })
    .catch(err=>{
      console.error('Failed to load products', err);
      el.grid.innerHTML = '<p style="color:#fca5a5">Failed to load products.json. Make sure the file exists.</p>';
    });

  // Event listeners
  el.category.addEventListener('change', applyFilters);
  el.sort.addEventListener('change', applyFilters);
  el.search.addEventListener('input', debounce(applyFilters, 200));
  el.cartBtn.addEventListener('click', openCart);
  el.cartClose.addEventListener('click', closeCart);
  el.backdrop.addEventListener('click', closeCart);
  el.checkoutBtn.addEventListener('click', checkout);

  function populateCategories(products){
    const cats = Array.from(new Set(products.map(p=>p.category))).sort();
    for(const c of cats){
      const opt = document.createElement('option');
      opt.value = c; opt.textContent = capitalize(c);
      el.category.appendChild(opt);
    }
  }

  function applyFilters(){
    const query = (el.search.value || '').toLowerCase();
    const cat = el.category.value;
    const sort = el.sort.value;

    let list = state.products.filter(p =>
      (cat==='all' || p.category===cat) &&
      (p.name.toLowerCase().includes(query) || (p.description||'').toLowerCase().includes(query))
    );

    if(sort==='featured') list.sort((a,b)=> (b.featured|0) - (a.featured|0));
    if(sort==='price-asc') list.sort((a,b)=> a.price - b.price);
    if(sort==='price-desc') list.sort((a,b)=> b.price - a.price);
    if(sort==='name-asc') list.sort((a,b)=> a.name.localeCompare(b.name));

    state.filtered = list;
    renderProducts();
  }

  function renderProducts(){
    el.grid.innerHTML = '';
    if(!state.filtered.length){
      el.grid.innerHTML = '<p class="muted">No products found.</p>';
      return;
    }

    for(const p of state.filtered){
      const card = document.createElement('article');
      card.className = 'card';
      card.innerHTML = `
        <div class="media">
          <img src="${p.image}" alt="${escapeHtml(p.name)}" loading="lazy" />
        </div>
        <div class="body">
          <h3>${escapeHtml(p.name)}</h3>
          <p class="muted small">${escapeHtml(p.category)}</p>
          <p class="muted">${escapeHtml(p.description || '')}</p>
          <p class="price">${fmt(p.price)}</p>
        </div>
        <div class="actions">
          <button class="btn" data-id="${p.id}" data-qty="1">Add to cart</button>
          <a class="btn" href="#products" onclick="return false;" data-buy-id="${p.id}">Buy now</a>
        </div>
      `;
      card.querySelector('button[data-id]').addEventListener('click', ()=> addToCart(p.id, 1));
      card.querySelector('[data-buy-id]').addEventListener('click', ()=> { addToCart(p.id, 1); openCart(); });
      el.grid.appendChild(card);
    }
  }

  function openCart(){
    el.cartDrawer.classList.add('open');
    el.backdrop.classList.add('show');
    renderCart();
  }
  function closeCart(){
    el.cartDrawer.classList.remove('open');
    el.backdrop.classList.remove('show');
  }

  function addToCart(id, qty){
    const prod = state.products.find(p=>p.id===id);
    if(!prod) return;
    const item = state.cart.items.find(i=>i.id===id);
    if(item) item.qty += qty; else state.cart.items.push({id, qty});
    persistCart();
    bumpCartCount();
  }
  function removeFromCart(id){
    state.cart.items = state.cart.items.filter(i=>i.id!==id);
    persistCart();
    renderCart();
  }
  function updateQty(id, qty){
    const it = state.cart.items.find(i=>i.id===id);
    if(!it) return;
    it.qty = Math.max(1, qty|0);
    persistCart();
    renderCart();
  }

  function renderCart(){
    const items = state.cart.items.map(i=>{
      const p = state.products.find(x=>x.id===i.id);
      return { ...i, product: p };
    }).filter(x=>!!x.product);

    el.cartItems.innerHTML = '';
    if(!items.length){
      el.cartItems.innerHTML = '<p class="muted">Your cart is empty.</p>';
    }

    let subtotal = 0;
    for(const {product:p, qty} of items){
      subtotal += p.price * qty;
      const row = document.createElement('div');
      row.className = 'cart-item';
      row.innerHTML = `
        <img src="${p.image}" alt="${escapeHtml(p.name)}" />
        <div>
          <div style="display:flex;justify-content:space-between;align-items:center;gap:8px">
            <strong>${escapeHtml(p.name)}</strong>
            <button class="icon-btn" aria-label="Remove" title="Remove">✕</button>
          </div>
          <div class="muted small">${fmt(p.price)} each</div>
          <div class="qty" style="margin-top:6px">
            <button class="icon-btn" aria-label="Decrease">−</button>
            <span>${qty}</span>
            <button class="icon-btn" aria-label="Increase">+</button>
          </div>
        </div>
        <div style="font-weight:700">${fmt(p.price*qty)}</div>
      `;
      const [decBtn, incBtn] = row.querySelectorAll('.qty button');
      row.querySelector('button[title="Remove"]').addEventListener('click', ()=> removeFromCart(p.id));
      decBtn.addEventListener('click', ()=> updateQty(p.id, qty-1));
      incBtn.addEventListener('click', ()=> updateQty(p.id, qty+1));
      el.cartItems.appendChild(row);
    }

    const shipping = cfg.SHIPPING_FLAT;
    const tax = +(subtotal * cfg.TAX_RATE).toFixed(2);
    const total = subtotal + shipping + tax;

    el.cartSubtotal.textContent = fmt(subtotal);
    el.cartShipping.textContent = fmt(shipping);
    el.cartTax.textContent = fmt(tax);
    el.cartTotal.textContent = fmt(total);

    bumpCartCount();
  }

  function bumpCartCount(){
    const count = state.cart.items.reduce((a,b)=>a+b.qty,0);
    el.cartCount.textContent = count;
  }

  function checkout(){
    const items = state.cart.items.map(i=>{
      const p = state.products.find(x=>x.id===i.id);
      return { name: p?.name || i.id, qty: i.qty, price: p?.price || 0 };
    });
    if(!items.length){ alert('Your cart is empty.'); return; }

    if(cfg.PAYMENT.MODE==='mailto'){
      const subject = encodeURIComponent(`Order from ${cfg.STORE_NAME} Store`);
      const lines = items.map(it=>`- ${it.name} x${it.qty} = ${fmt(it.qty*it.price)}`);
      const total = items.reduce((s,it)=>s+it.qty*it.price,0);
      const body = encodeURIComponent(
        `Hello,

I would like to place the following order:

${lines.join('
')}

Total: ${fmt(total)}

Name: 
Address: 
Phone: 

Thank you!`
      );
      window.location.href = `mailto:${cfg.CONTACT_EMAIL}?subject=${subject}&body=${body}`;
      return;
    }

    if(cfg.PAYMENT.MODE==='stripe_link' && cfg.PAYMENT.STRIPE_LINK_URL){
      window.open(cfg.PAYMENT.STRIPE_LINK_URL, '_blank');
      return;
    }

    if(cfg.PAYMENT.MODE==='paypal' && cfg.PAYMENT.PAYPAL_CHECKOUT_URL){
      window.open(cfg.PAYMENT.PAYPAL_CHECKOUT_URL, '_blank');
      return;
    }

    alert('Payment is not configured. Edit assets/js/config.js');
  }

  // Utils
  function loadCart(){
    try{
      return JSON.parse(localStorage.getItem('hc_cart')) || { items: [] };
    }catch(e){return { items: [] }}
  }
  function persistCart(){
    localStorage.setItem('hc_cart', JSON.stringify(state.cart));
  }
  function fmt(value){
    const s = cfg.CURRENCY_SYMBOL || '';
    return `${s} ${(value||0).toFixed(2)}`;
  }
  function capitalize(s){ return (s||'').charAt(0).toUpperCase()+s.slice(1); }
  function debounce(fn, t){ let id; return (...a)=>{ clearTimeout(id); id=setTimeout(()=>fn(...a), t); } }
  function escapeHtml(s){ return (s||'').replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',''':'&#39;'}[c])); }
})();
