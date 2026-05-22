const app = document.querySelector("#app");
const shellTpl = document.querySelector("#screen-shell");
const state = {
  screen: "home",
  category: null,
  productId: null,
  chatId: null,
  filter: "todos",
  favorites: new Set(["p1","p3","p5"]),
  dark: localStorage.getItem("um-dark") === "1"
};

if (state.dark) document.body.classList.add("dark");

const money = n => `S/ ${Number(n).toFixed(2)}`;
const sellerById = id => UM_DATA.sellers.find(s => s.id === id);
const productById = id => UM_DATA.products.find(p => p.id === id);
const categoryById = id => UM_DATA.categories.find(c => c.id === id);

function cloneShell(){
  const node = shellTpl.content.cloneNode(true);
  app.innerHTML = "";
  app.appendChild(node);
  bindNav();
  return {
    topbar: app.querySelector(".topbar"),
    content: app.querySelector(".content")
  };
}

function setActiveNav(name){
  app.querySelectorAll(".nav-item").forEach(btn => {
    btn.classList.toggle("active", btn.dataset.nav === name);
  });
}

function bindNav(){
  app.querySelectorAll("[data-nav]").forEach(btn => {
    btn.addEventListener("click", () => {
      const nav = btn.dataset.nav;
      if (nav === "home") renderHome();
      if (nav === "categories") renderCategories();
      if (nav === "publish") renderPublish();
      if (nav === "messages") renderMessages();
      if (nav === "profile") renderProfile();
    });
  });
}

function toast(message){
  let t = app.querySelector(".toast");
  if (!t){
    t = document.createElement("div");
    t.className = "toast";
    app.appendChild(t);
  }
  t.textContent = message;
  t.classList.add("show");
  setTimeout(() => t.classList.remove("show"), 1600);
}

function topLogo(actions = ""){
  return `
    <div class="logo-mini">
      <img src="assets/logo-bag.svg" alt="UniMarket">
      <strong>UNIMARKET</strong>
    </div>
    <div class="top-actions">${actions}</div>
  `;
}

function renderHome(){
  state.screen = "home";
  const {topbar, content} = cloneShell();
  setActiveNav("home");
  topbar.innerHTML = topLogo(`
    <button class="icon-btn" id="themeBtn" title="Modo oscuro">◐</button>
    <button class="icon-btn" title="Notificaciones">⌁</button>
  `);

  content.innerHTML = `
    <section class="hero">
      <h2>Hola, Valeria! 👋</h2>
      <p>¿Qué vas a encontrar hoy en la comunidad sanmarquina?</p>
      <label class="searchbar">
        <span>⌕</span>
        <input id="homeSearch" type="search" placeholder="Buscar productos...">
      </label>
    </section>

    <section class="quick-cats">
      ${UM_DATA.categories.slice(0, 12).map(c => `
        <button class="quick-cat" data-category="${c.id}">
          <span class="bubble">${c.icon}</span>
          <span>${c.name}</span>
        </button>
      `).join("")}
    </section>

    <div class="section-head">
      <h3>Emprendimientos destacados</h3>
      <button data-go="products">Ver todo</button>
    </div>
    <section class="product-row">
      ${UM_DATA.products.slice(0, 3).map(productMiniCard).join("")}
    </section>

    <div class="section-head">
      <h3>Ofertas especiales</h3>
      <button data-go="offers">Ver más</button>
    </div>
    <button class="offer" data-open-product="p6">
      <div>
        <h4>Envíos gratis dentro del campus</h4>
        <p>Coordina entrega en Biblioteca, comedor o facultad.</p>
      </div>
      <span class="truck">🚚</span>
    </button>

    <section class="benefits">
      <div class="benefit"><span>🏪</span><b>Emprendimientos<br>universitarios</b></div>
      <div class="benefit"><span>🛡️</span><b>Productos únicos<br>y confiables</b></div>
      <div class="benefit"><span>💳</span><b>Pagos con<br>Yape / Plin</b></div>
    </section>
  `;

  content.querySelectorAll("[data-category]").forEach(btn => {
    btn.addEventListener("click", () => renderProducts(btn.dataset.category));
  });
  content.querySelectorAll("[data-open-product]").forEach(btn => {
    btn.addEventListener("click", () => renderDetail(btn.dataset.openProduct));
  });
  content.querySelector("[data-go='products']").addEventListener("click", () => renderProducts());
  content.querySelector("#homeSearch").addEventListener("input", e => renderProducts(null, e.target.value));
  app.querySelector("#themeBtn").addEventListener("click", toggleTheme);
}

function productMiniCard(p){
  return `
    <button class="featured-card" data-open-product="${p.id}">
      <img src="${p.image}" alt="${p.name}">
      <div>
        <b>${p.name}</b>
        <small>${money(p.price)}</small>
        <span class="mini-meta"><span>★ ${p.popularity}</span><span>♡</span></span>
      </div>
    </button>
  `;
}

function renderCategories(){
  state.screen = "categories";
  const {topbar, content} = cloneShell();
  setActiveNav("categories");
  topbar.innerHTML = `
    <button class="back-btn" id="backHome">‹</button>
    <div class="top-title">Categorías</div>
    <button class="icon-btn">⌕</button>
  `;
  content.innerHTML = `
    <section class="category-list">
      ${UM_DATA.categories.map(c => `
        <button class="category-item" data-category="${c.id}">
          <span class="category-icon">${c.icon}</span>
          <span><b>${c.name}</b><span>${c.count} productos</span></span>
          <span class="arrow">›</span>
        </button>
      `).join("")}
    </section>
  `;
  app.querySelector("#backHome").addEventListener("click", renderHome);
  content.querySelectorAll("[data-category]").forEach(btn => {
    btn.addEventListener("click", () => renderProducts(btn.dataset.category));
  });
}

function renderProducts(categoryId = null, search = ""){
  state.screen = "products";
  state.category = categoryId;
  const {topbar, content} = cloneShell();
  setActiveNav("categories");
  const cat = categoryId ? categoryById(categoryId) : null;
  const title = cat ? cat.name : "Explorar productos";
  topbar.innerHTML = `
    <button class="back-btn" id="backCats">‹</button>
    <div class="top-title">${title}</div>
    <button class="icon-btn" id="filterBtn">☰</button>
  `;
  const filters = ["todos", "más recientes", "menor precio", "mayor precio"];
  let products = [...UM_DATA.products];

  if (categoryId) products = products.filter(p => p.category === categoryId);
  if (search) products = products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || p.description.toLowerCase().includes(search.toLowerCase()));
  if (state.filter === "menor precio") products.sort((a,b) => a.price - b.price);
  if (state.filter === "mayor precio") products.sort((a,b) => b.price - a.price);

  content.innerHTML = `
    <section class="filters">
      ${filters.map(f => `<button class="filter-chip ${state.filter===f?'active':''}" data-filter="${f}">${f[0].toUpperCase()+f.slice(1)}</button>`).join("")}
    </section>
    <section class="grid-products">
      ${products.map(productCard).join("") || emptyState("🔎","Sin resultados","Prueba otra categoría o búsqueda.")}
    </section>
  `;

  app.querySelector("#backCats").addEventListener("click", renderCategories);
  app.querySelector("#filterBtn").addEventListener("click", () => toast("Filtros avanzados estarán disponibles en la siguiente versión."));
  content.querySelectorAll("[data-filter]").forEach(btn => {
    btn.addEventListener("click", () => { state.filter = btn.dataset.filter; renderProducts(categoryId, search); });
  });
  content.querySelectorAll("[data-open-product]").forEach(btn => {
    btn.addEventListener("click", e => {
      if (e.target.closest(".heart")) return;
      renderDetail(btn.dataset.openProduct);
    });
  });
  content.querySelectorAll("[data-fav]").forEach(btn => {
    btn.addEventListener("click", () => toggleFav(btn.dataset.fav, btn));
  });
}

function productCard(p){
  const seller = sellerById(p.sellerId);
  const active = state.favorites.has(p.id);
  return `
    <button class="product-card" data-open-product="${p.id}">
      <img src="${p.image}" alt="${p.name}">
      <div class="p-body">
        <b>${p.name}</b>
        <span class="price">${money(p.price)}</span>
        <small>${seller.name} · ${p.place}</small>
      </div>
      <button class="heart ${active?'active':''}" data-fav="${p.id}" title="Favorito">${active?'♥':'♡'}</button>
    </button>
  `;
}

function toggleFav(id, btn){
  if (state.favorites.has(id)) {
    state.favorites.delete(id);
    btn.classList.remove("active");
    btn.textContent = "♡";
    toast("Producto retirado de favoritos.");
  } else {
    state.favorites.add(id);
    btn.classList.add("active");
    btn.textContent = "♥";
    toast("Producto guardado en favoritos.");
  }
}

function renderDetail(id){
  state.productId = id;
  const p = productById(id);
  const seller = sellerById(p.sellerId);
  const {topbar, content} = cloneShell();
  setActiveNav("categories");
  topbar.innerHTML = `
    <button class="back-btn" id="backProducts">‹</button>
    <div class="top-title">Detalle de producto</div>
    <button class="icon-btn" id="detailFav">${state.favorites.has(id) ? '♥' : '♡'}</button>
  `;
  content.innerHTML = `
    <section class="detail-image"><img src="${p.image}" alt="${p.name}"></section>
    <section class="detail-title">
      <div>
        <h2>${p.name}</h2>
        <span class="badge">✓ Usuario verificado</span>
      </div>
      <span class="price">${money(p.price)}</span>
    </section>

    <button class="seller-card" id="openSellerChat">
      <img src="${seller.avatar}" alt="${seller.name}">
      <span>
        <b>${seller.name}</b>
        <span>${seller.faculty} · ★ ${seller.rating}</span>
      </span>
      <span class="badge">Activo</span>
    </button>

    <section class="detail-block">
      <h3>Descripción</h3>
      <p>${p.description}</p>
    </section>

    <section class="detail-block">
      <h3>Coordinación dentro del campus</h3>
      <ul class="info-list">
        <li>📍 Punto sugerido: ${p.place}</li>
        <li>🕒 Horario disponible: ${p.schedule}</li>
        <li>💳 Métodos: Yape, Plin o pago contra entrega</li>
      </ul>
    </section>

    <div class="action-row">
      <button class="btn btn-outline" id="cartBtn">Agregar al carrito</button>
      <button class="btn btn-primary" id="buyBtn">Comprar ahora</button>
    </div>
  `;
  app.querySelector("#backProducts").addEventListener("click", () => renderProducts(state.category));
  app.querySelector("#detailFav").addEventListener("click", () => {
    state.favorites.has(id) ? state.favorites.delete(id) : state.favorites.add(id);
    renderDetail(id);
  });
  content.querySelector("#cartBtn").addEventListener("click", () => toast("Agregado al carrito demo."));
  content.querySelector("#buyBtn").addEventListener("click", () => toast("Compra simulada: coordina entrega por chat."));
  content.querySelector("#openSellerChat").addEventListener("click", () => {
    const chat = UM_DATA.chats.find(c => c.sellerId === seller.id) || UM_DATA.chats[0];
    renderThread(chat.id);
  });
}

function renderMessages(){
  const {topbar, content} = cloneShell();
  setActiveNav("messages");
  topbar.innerHTML = `
    <button class="back-btn" id="backHome">‹</button>
    <div class="top-title">Mensajes</div>
    <button class="icon-btn">＋</button>
  `;
  content.innerHTML = `
    <label class="searchbar messages-search">
      <span>⌕</span>
      <input type="search" placeholder="Buscar conversaciones...">
    </label>
    <section class="chat-list">
      ${UM_DATA.chats.map(chatItem).join("")}
    </section>
  `;
  app.querySelector("#backHome").addEventListener("click", renderHome);
  content.querySelectorAll("[data-chat]").forEach(btn => {
    btn.addEventListener("click", () => renderThread(btn.dataset.chat));
  });
}

function chatItem(c){
  const seller = sellerById(c.sellerId);
  const product = productById(c.productId);
  return `
    <button class="chat-item" data-chat="${c.id}">
      <img src="${seller.avatar}" alt="${seller.name}">
      <span>
        <b>${seller.name}</b>
        <p>${c.last} · ${product.name}</p>
      </span>
      <span>
        <span class="chat-time">${c.time}</span>
        ${c.unread ? '<span class="chat-dot"></span>' : ''}
      </span>
    </button>
  `;
}

function renderThread(chatId){
  const chat = UM_DATA.chats.find(c => c.id === chatId);
  const seller = sellerById(chat.sellerId);
  const product = productById(chat.productId);
  const {topbar, content} = cloneShell();
  setActiveNav("messages");
  topbar.innerHTML = `
    <button class="back-btn" id="backMessages">‹</button>
    <div class="logo-mini">
      <img src="${seller.avatar}" alt="${seller.name}">
      <div><strong>${seller.name}</strong><br><span style="font-size:10px;color:var(--muted)">${product.name}</span></div>
    </div>
    <button class="icon-btn">⋯</button>
  `;
  content.innerHTML = `
    <section class="thread">
      ${chat.messages.map(m => `<div class="bubble-msg ${m.from === 'me' ? 'out' : 'in'}">${m.text}<br><small>${m.time}</small></div>`).join("")}
    </section>
    <div class="chat-input">
      <input id="messageBox" placeholder="Escribe un mensaje...">
      <button id="sendMessage">➤</button>
    </div>
  `;
  app.querySelector("#backMessages").addEventListener("click", renderMessages);
  content.querySelector("#sendMessage").addEventListener("click", () => {
    const input = content.querySelector("#messageBox");
    if (!input.value.trim()) return toast("Escribe un mensaje para simular el envío.");
    const thread = content.querySelector(".thread");
    thread.insertAdjacentHTML("beforeend", `<div class="bubble-msg out">${input.value.trim()}<br><small>Ahora</small></div>`);
    input.value = "";
    thread.scrollIntoView({block:"end"});
    toast("Mensaje enviado en modo demo.");
  });
}

function renderProfile(){
  const u = UM_DATA.currentUser;
  const {topbar, content} = cloneShell();
  setActiveNav("profile");
  topbar.innerHTML = topLogo(`<button class="icon-btn" id="settingsBtn">⚙</button>`);
  content.innerHTML = `
    <section class="profile-hero">
      <img src="${u.avatar}" alt="${u.name}">
      <h2>${u.name}</h2>
      <p>${u.faculty}</p>
      <span class="badge">✓ ${u.email}</span>
      <div class="profile-stats">
        <div><b>${u.sales}</b><span>En proceso</span></div>
        <div><b>${u.purchases}</b><span>Completadas</span></div>
        <div><b>${u.favorites}</b><span>Favoritos</span></div>
      </div>
    </section>

    <section class="switch-line">
      <span class="switch-text">
        <b>Modo oscuro</b>
        <span>Activa una interfaz cómoda para uso nocturno.</span>
      </span>
      <button id="darkToggle" class="toggle ${state.dark ? 'active' : ''}" aria-label="Cambiar modo oscuro"></button>
    </section>

    <section class="menu-list">
      ${[
        ["▦","Mis productos"],
        ["♡","Favoritos"],
        ["⌖","Puntos de entrega"],
        ["💳","Métodos de pago"],
        ["?","Ayuda y soporte"],
        ["⎋","Cerrar sesión"]
      ].map(m => `<button class="menu-item"><span>${m[0]}</span><b>${m[1]}</b><span class="arrow">›</span></button>`).join("")}
    </section>
  `;
  content.querySelector("#darkToggle").addEventListener("click", toggleTheme);
  app.querySelector("#settingsBtn").addEventListener("click", () => toast("Configuración demo: modo oscuro, perfil y métodos de pago."));
}

function renderPublish(){
  const {topbar, content} = cloneShell();
  setActiveNav("publish");
  topbar.innerHTML = `
    <button class="back-btn" id="backHome">‹</button>
    <div class="top-title">Publicar producto</div>
    <button class="icon-btn">?</button>
  `;
  content.innerHTML = `
    <section class="publish-card">
      <div class="big">🛍️</div>
      <h2>Publicación demo</h2>
      <p>En el MVP visual, esta pantalla muestra el flujo futuro para registrar productos, imágenes, precio, categoría, horario y punto de entrega dentro del campus.</p>
      <button class="btn btn-primary btn-full" id="simulatePublish">Simular nueva publicación</button>
    </section>
    <section class="detail-block">
      <h3>Campos previstos</h3>
      <ul class="info-list">
        <li>📷 Imagen del producto desde carpeta assets o galería.</li>
        <li>🏷️ Categoría, nombre, precio y descripción.</li>
        <li>📍 Facultad, pabellón o punto de encuentro.</li>
        <li>🕒 Horario disponible del vendedor.</li>
      </ul>
    </section>
  `;
  app.querySelector("#backHome").addEventListener("click", renderHome);
  content.querySelector("#simulatePublish").addEventListener("click", () => toast("Producto publicado en modo demo."));
}

function toggleTheme(){
  state.dark = !state.dark;
  localStorage.setItem("um-dark", state.dark ? "1" : "0");
  document.body.classList.toggle("dark", state.dark);
  const t = app.querySelector("#darkToggle");
  if (t) t.classList.toggle("active", state.dark);
  toast(state.dark ? "Modo oscuro activado." : "Modo claro activado.");
}

function emptyState(icon, title, text){
  return `<div class="empty"><span class="icon">${icon}</span><b>${title}</b><p>${text}</p></div>`;
}

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./service-worker.js").catch(() => {});
  });
}

renderHome();
