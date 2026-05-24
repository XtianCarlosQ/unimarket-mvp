const app = document.querySelector("#app");
const shellTpl = document.querySelector("#screen-shell");
const state = {
  screen: "home",
  category: null,
  productId: null,
  chatId: null,
  filter: "todos",
  favorites: new Set(["p1","p3","p5"]),
  dark: localStorage.getItem("um-dark") === "1",
  loggedIn: localStorage.getItem("um-logged") !== "0",
  backTarget: null
};

if (state.dark) document.body.classList.add("dark");

let isPopStateNav = false;

// Inicializar interceptador de botón de retroceso para Android / PWA
if (window.history && window.history.replaceState) {
  window.history.replaceState({ screen: "exit_intercept" }, "");
}

function pushStateForScreen(screen, data = {}) {
  if (isPopStateNav) return;
  if (window.history && window.history.pushState) {
    window.history.pushState({
      screen,
      productId: state.productId,
      category: state.category,
      chatId: state.chatId,
      backTarget: state.backTarget,
      ...data
    }, "");
  }
}

window.addEventListener("popstate", (event) => {
  if (!event.state) return;
  
  if (event.state.screen === "exit_intercept") {
    showExitModal();
    return;
  }
  
  isPopStateNav = true;
  
  // Restaurar estado interno
  state.screen = event.state.screen;
  state.productId = event.state.productId;
  state.category = event.state.category;
  state.chatId = event.state.chatId;
  state.backTarget = event.state.backTarget;
  
  // Renderizar la pantalla correspondiente
  switch(state.screen) {
    case "home":
      renderHome();
      break;
    case "categories":
      renderCategories();
      break;
    case "products":
      renderProducts(state.category, "", state.backTarget);
      break;
    case "detail":
      renderDetail(state.productId, state.backTarget);
      break;
    case "messages":
      renderMessages(state.backTarget);
      break;
    case "thread":
      renderThread(state.chatId, state.backTarget);
      break;
    case "profile":
      renderProfile();
      break;
    case "publish":
      renderPublish();
      break;
  }
  
  isPopStateNav = false;
});

function showExitModal() {
  const modal = document.createElement("div");
  modal.className = "modal-backdrop";
  modal.innerHTML = `
    <div class="modal-card">
      <h3>¿Desea salir de la app?</h3>
      <p>Estás a punto de salir del marketplace UniMarket. ¿Confirmas que deseas salir?</p>
      <div class="modal-buttons">
        <button class="btn btn-outline" id="cancelExit">No, quedarme</button>
        <button class="btn btn-primary" id="confirmExit">Sí, salir</button>
      </div>
    </div>
  `;
  modal.addEventListener("click", e => {
    if (e.target === modal) {
      modal.remove();
      history.pushState({ screen: "home" }, "");
    }
  });
  app.appendChild(modal);
  modal.querySelector("#cancelExit").addEventListener("click", () => {
    modal.remove();
    history.pushState({ screen: "home" }, "");
  });
  modal.querySelector("#confirmExit").addEventListener("click", () => {
    modal.remove();
    const {topbar, content} = cloneShell();
    topbar.innerHTML = topLogo();
    content.innerHTML = `
      <div class="empty">
        <span class="icon">👋</span>
        <b>¡Gracias por visitarnos!</b>
        <p>Tu sesión demo ha finalizado de forma segura. Ya puedes cerrar esta pestaña del navegador.</p>
        <button class="btn btn-primary btn-full" id="reopenApp">Volver a ingresar</button>
      </div>
    `;
    app.querySelector("#reopenApp").addEventListener("click", () => {
      window.location.reload();
    });
    window.close();
  });
}

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

function resetBackTarget(){
  state.backTarget = null;
}

function goBack(){
  const target = state.backTarget;
  state.backTarget = null;
  if (!target) return renderHome();
  switch(target.screen){
    case "home": return renderHome();
    case "categories": return renderCategories(target.backTarget);
    case "products": return renderProducts(target.category, target.search, target.backTarget);
    case "detail": return renderDetail(target.productId, target.backTarget);
    case "messages": return renderMessages(target.backTarget);
    case "thread": return renderThread(target.chatId, target.backTarget);
    case "profile": return renderProfile(target.backTarget);
    default: return renderHome();
  }
}

function showConfirmModal(message, onConfirm){
  const modal = document.createElement("div");
  modal.className = "modal-backdrop";
  modal.innerHTML = `
    <div class="modal-card">
      <h3>¿Desea cerrar sesión?</h3>
      <p>${message}</p>
      <div class="modal-buttons">
        <button class="btn btn-outline" id="cancelLogout">No</button>
        <button class="btn btn-primary" id="confirmLogout">Sí</button>
      </div>
    </div>
  `;
  modal.addEventListener("click", e => {
    if (e.target === modal) modal.remove();
  });
  app.appendChild(modal);
  modal.querySelector("#cancelLogout").addEventListener("click", () => modal.remove());
  modal.querySelector("#confirmLogout").addEventListener("click", () => {
    modal.remove();
    onConfirm();
  });
}

function logout(){
  localStorage.setItem("um-logged", "0");
  state.loggedIn = false;
  state.history = [];
  state.backTarget = null;
  toast("Sesión cerrada.");
  renderLoggedOut();
}

function renderLoggedOut(){
  state.screen = "home";
  const {topbar, content} = cloneShell();
  setActiveNav("home");
  topbar.innerHTML = topLogo(`<button class="icon-btn" id="themeBtn" title="Modo oscuro">◐</button>`);
  content.innerHTML = `
    <div class="empty">
      <span class="icon">🔒</span>
      <b>Has cerrado sesión</b>
      <p>El contenido está bloqueado para la sesión demo. Pulsa el botón para continuar como invitada.</p>
      <button class="btn btn-primary btn-full" id="continueGuest">Continuar como invitada</button>
    </div>
  `;
  app.querySelector("#themeBtn").addEventListener("click", toggleTheme);
  app.querySelector("#continueGuest").addEventListener("click", () => {
    state.loggedIn = true;
    localStorage.setItem("um-logged", "1");
    renderHome();
  });
  pushStateForScreen("home");
}

function bindNav(){
  app.querySelectorAll("[data-nav]").forEach(btn => {
    btn.addEventListener("click", () => {
      const nav = btn.dataset.nav;
      resetBackTarget();
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
  if (!state.loggedIn) return renderLoggedOut();
  const {topbar, content} = cloneShell();
  setActiveNav("home");
  topbar.innerHTML = `
    <button class="icon-btn" id="menuBtn" title="Menú">☰</button>
    <div class="logo-mini">
      <img src="assets/logo-bag.svg" alt="UniMarket">
      <strong>UNIMARKET</strong>
    </div>
    <div class="top-actions">
      <button class="icon-btn" id="notifBtn" title="Notificaciones">🔔</button>
      <button class="icon-btn" id="themeBtn" title="Modo oscuro">◐</button>
    </div>
  `;

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
      <button data-open-product="p6" class="offer-card">
        <div>
          <h4>Envíos gratis dentro del campus</h4>
          <p>Coordina entrega en Biblioteca, comedor o facultad.</p>
        </div>
        <span class="truck">🚚</span>
      </button>
    </div>

    <section class="benefits">
      <div class="benefit"><span>🏪</span><b>Emprendimientos<br>universitarios</b></div>
      <div class="benefit"><span>🛡️</span><b>Productos únicos<br>y confiables</b></div>
      <div class="benefit"><span>💳</span><b>Pagos con<br>Yape / Plin</b></div>
    </section>
  `;

  content.querySelectorAll("[data-category]").forEach(btn => {
    btn.addEventListener("click", () => renderProducts(btn.dataset.category, "", {screen: "home"}));
  });
  content.querySelectorAll("[data-open-product]").forEach(btn => {
    btn.addEventListener("click", () => renderDetail(btn.dataset.openProduct, {screen: "home"}));
  });
  content.querySelector("[data-go='products']").addEventListener("click", () => renderProducts(null, "", {screen: "home"}));
  content.querySelector("#homeSearch").addEventListener("input", e => renderProducts(null, e.target.value, {screen: "home"}));
  app.querySelector("#themeBtn").addEventListener("click", toggleTheme);
  app.querySelector("#menuBtn").addEventListener("click", showMenuDrawer);
  app.querySelector("#notifBtn").addEventListener("click", () => toast("No tienes notificaciones nuevas."));
  pushStateForScreen("home");
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
    <button class="icon-btn" id="searchBtn">⌕</button>
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
  app.querySelector("#backHome").addEventListener("click", goBack);
  app.querySelector("#searchBtn").addEventListener("click", () => toast("Búsqueda en categorías disponible en próxima versión."));
  content.querySelectorAll("[data-category]").forEach(btn => {
    btn.addEventListener("click", () => renderProducts(btn.dataset.category, "", {screen: "categories"}));
  });
  pushStateForScreen("categories");
}

function renderProducts(categoryId = null, search = "", backTarget = {screen: "categories"}){
  state.screen = "products";
  state.category = categoryId;
  state.backTarget = backTarget;
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

  app.querySelector("#backCats").addEventListener("click", goBack);
  app.querySelector("#filterBtn").addEventListener("click", () => toast("Filtros avanzados estarán disponibles en la siguiente versión."));
  content.querySelectorAll("[data-filter]").forEach(btn => {
    btn.addEventListener("click", () => { state.filter = btn.dataset.filter; renderProducts(categoryId, search, backTarget); });
  });
  content.querySelectorAll("[data-open-product]").forEach(btn => {
    btn.addEventListener("click", e => {
      if (e.target.closest(".heart")) return;
      renderDetail(btn.dataset.openProduct, {screen: "products", category: categoryId, search, backTarget});
    });
  });
  content.querySelectorAll("[data-fav]").forEach(btn => {
    btn.addEventListener("click", () => toggleFav(btn.dataset.fav, btn));
  });
  pushStateForScreen("products", { category: categoryId, search, backTarget });
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

function renderDetail(id, backTarget = {screen: "products", category: state.category}){
  state.productId = id;
  state.backTarget = backTarget;
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
  app.querySelector("#backProducts").addEventListener("click", goBack);
  app.querySelector("#detailFav").addEventListener("click", () => {
    state.favorites.has(id) ? state.favorites.delete(id) : state.favorites.add(id);
    renderDetail(id, backTarget);
  });
  content.querySelector("#cartBtn").addEventListener("click", () => toast("Agregado al carrito demo."));
  content.querySelector("#buyBtn").addEventListener("click", () => toast("Compra simulada: coordina entrega por chat."));
  content.querySelector("#openSellerChat").addEventListener("click", () => {
    const chat = UM_DATA.chats.find(c => c.sellerId === seller.id) || UM_DATA.chats[0];
    renderThread(chat.id, {screen: "detail", productId: id, category: state.category, backTarget});
  });
  pushStateForScreen("detail", { productId: id, backTarget });
}

function renderMessages(backTarget = {screen: "home"}){
  state.screen = "messages";
  state.backTarget = backTarget;
  const {topbar, content} = cloneShell();
  setActiveNav("messages");
  topbar.innerHTML = `
    <button class="back-btn" id="backHome">‹</button>
    <div class="top-title">Mensajes</div>
    <button class="icon-btn" id="addMsg">＋</button>
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
  app.querySelector("#backHome").addEventListener("click", goBack);
  app.querySelector("#addMsg").addEventListener("click", () => toast("Crear nuevo chat disponible en próxima versión."));
  content.querySelectorAll("[data-chat]").forEach(btn => {
    btn.addEventListener("click", () => renderThread(btn.dataset.chat, {screen: "messages"}));
  });
  pushStateForScreen("messages", { backTarget });
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

function renderThread(chatId, backTarget = {screen: "messages"}){
  state.screen = "thread";
  state.backTarget = backTarget;
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
  app.querySelector("#backMessages").addEventListener("click", goBack);
  content.querySelector("#sendMessage").addEventListener("click", () => {
    const input = content.querySelector("#messageBox");
    if (!input.value.trim()) return toast("Escribe un mensaje para simular el envío.");
    const thread = content.querySelector(".thread");
    thread.insertAdjacentHTML("beforeend", `<div class="bubble-msg out">${input.value.trim()}<br><small>Ahora</small></div>`);
    input.value = "";
    thread.scrollIntoView({block:"end"});
    toast("Mensaje enviado en modo demo.");
  });
  pushStateForScreen("thread", { chatId, backTarget });
}

function renderProfile(){
  const u = UM_DATA.currentUser;
  const {topbar, content} = cloneShell();
  setActiveNav("profile");
  topbar.innerHTML = `
    <div class="top-spacer"></div>
    <div class="logo-mini">
      <img src="assets/logo-bag.svg" alt="UniMarket">
      <strong>UNIMARKET</strong>
    </div>
    <div class="top-actions">
      <button class="icon-btn" id="settingsBtn" title="Configuración">⚙</button>
    </div>
  `;
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

    <section class="menu-list" style="margin-top: 15px;">
      ${[
        ["🏪","Mis productos"],
        ["♡","Favoritos"],
        ["📍","Direcciones"],
        ["💳","Métodos de pago"],
        ["❓","Ayuda y soporte"],
        ["🚪","Cerrar sesión"]
      ].map((m, index) => `<button class="menu-item" data-action="${index === 5 ? 'logout' : ''}"><span>${m[0]}</span><b>${m[1]}</b><span class="arrow">›</span></button>`).join("")}
    </section>
  `;
  app.querySelector("#settingsBtn").addEventListener("click", showSettingsModal);
  content.querySelectorAll("[data-action='logout']").forEach(btn => {
    btn.addEventListener("click", () => showConfirmModal("Tu sesión de demostración se cerrará y verás una pantalla vacía.", logout));
  });
  pushStateForScreen("profile");
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
  app.querySelector("#backHome").addEventListener("click", goBack);
  content.querySelector("#simulatePublish").addEventListener("click", () => toast("Producto publicado en modo demo."));
  pushStateForScreen("publish");
}

function showSettingsModal() {
  const modal = document.createElement("div");
  modal.className = "modal-backdrop";
  modal.innerHTML = `
    <div class="modal-card">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:18px;">
        <h3 style="margin:0;">Configuración</h3>
        <button id="closeSettings" style="font-size:22px;color:var(--muted);margin-left:auto;font-weight:bold;">×</button>
      </div>
      <div class="switch-line">
        <div class="switch-text">
          <b>Modo oscuro</b>
          <span>Activar interfaz oscura para ambientes con poca luz</span>
        </div>
        <div class="toggle ${state.dark ? 'active' : ''}" id="darkToggle"></div>
      </div>
      <div class="switch-line" style="opacity:0.6; pointer-events:none;">
        <div class="switch-text">
          <b>Notificaciones push</b>
          <span>Alertas de mensajes y nuevas ofertas (Pronto)</span>
        </div>
        <div class="toggle"></div>
      </div>
      <div class="switch-line" style="opacity:0.6; pointer-events:none;">
        <div class="switch-text">
          <b>Ubicación precisa</b>
          <span>Buscar productos más cercanos en el campus (Pronto)</span>
        </div>
        <div class="toggle"></div>
      </div>
    </div>
  `;
  app.appendChild(modal);
  
  modal.querySelector("#closeSettings").addEventListener("click", () => modal.remove());
  modal.querySelector("#darkToggle").addEventListener("click", () => {
    toggleTheme();
  });
  modal.addEventListener("click", e => {
    if (e.target === modal) modal.remove();
  });
}

function showMenuDrawer() {
  const backdrop = document.createElement("div");
  backdrop.className = "drawer-backdrop";
  backdrop.innerHTML = `
    <div class="drawer-card">
      <div class="drawer-header">
        <h3>UniMarket Menú</h3>
        <button class="drawer-close" id="closeDrawer">×</button>
      </div>
      <nav class="drawer-menu">
        <button class="drawer-item" data-target="home"><span>⌂</span> Inicio</button>
        <button class="drawer-item" data-target="categories"><span>⌕</span> Explorar Categorías</button>
        <button class="drawer-item" data-target="publish"><span>＋</span> Vender Producto</button>
        <button class="drawer-item" data-target="messages"><span>✉</span> Mensajes</button>
        <button class="drawer-item" data-target="profile"><span>♙</span> Mi Perfil</button>
        <div style="border-top: 1px solid var(--line); margin: 10px 0;"></div>
        <button class="drawer-item" id="drawerThemeBtn"><span>◐</span> Cambiar Tema</button>
        <button class="drawer-item" id="drawerHelpBtn"><span>❓</span> Ayuda y FAQ</button>
      </nav>
      <div class="drawer-footer">
        <b>UniMarket v1.0.0 (MVP)</b><br>
        Hecho con 💜 para la comunidad UNMSM
      </div>
    </div>
  `;
  app.appendChild(backdrop);
  
  // Animación del menú lateral
  setTimeout(() => backdrop.classList.add("show"), 10);
  
  const close = () => {
    backdrop.classList.remove("show");
    setTimeout(() => backdrop.remove(), 300);
  };
  
  backdrop.querySelector("#closeDrawer").addEventListener("click", close);
  backdrop.addEventListener("click", e => {
    if (e.target === backdrop) close();
  });
  
  backdrop.querySelectorAll(".drawer-item[data-target]").forEach(btn => {
    btn.addEventListener("click", () => {
      const target = btn.dataset.target;
      close();
      resetBackTarget();
      if (target === "home") renderHome();
      if (target === "categories") renderCategories();
      if (target === "publish") renderPublish();
      if (target === "messages") renderMessages();
      if (target === "profile") renderProfile();
    });
  });
  
  backdrop.querySelector("#drawerThemeBtn").addEventListener("click", () => {
    toggleTheme();
  });
  
  backdrop.querySelector("#drawerHelpBtn").addEventListener("click", () => {
    close();
    toast("Soporte de UniMarket disponible pronto.");
  });
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
    navigator.serviceWorker.register("./service-worker.js").then(registration => {
      registration.addEventListener("updatefound", () => {
        const newWorker = registration.installing;
        newWorker.addEventListener("statechange", () => {
          if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
            toast("✅ Nueva versión disponible");
            if ("serviceWorker" in navigator && navigator.serviceWorker.controller) {
              navigator.serviceWorker.controller.postMessage({ type: "SKIP_WAITING" });
              setTimeout(() => window.location.reload(), 500);
            }
          }
        });
      });
    }).catch(() => {});
  });
}

renderHome();
