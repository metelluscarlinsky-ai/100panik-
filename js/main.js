// ========== Constantes & Helpers ==========
const CART_KEY = 'panik_cart';
const PUBS_KEY = 'panik_pubs';
const PRODUCTS_KEY = 'panik_products';
const ORDERS_KEY = 'panik_orders';
const USERS_KEY = 'panik_users';
const CURRENT_USER_KEY = 'panik_current_user';
const ADMIN_LOGGED_KEY = 'panik_admin_logged';
const ADMIN_PASSWORD = '100panik';
const LAST_SPLASH_INDEX_KEY = 'panik_last_splash_index';

// Fonction safe pour localStorage
function getLocalStorage(key) {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  } catch (e) {
    console.error(`Erreur lecture localStorage (${key})`, e);
    return null;
  }
}

function setLocalStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (e) {
    console.error(`Erreur écriture localStorage (${key})`, e);
    return false;
  }
}

// ========== Gestion des utilisateurs ==========
function getUsers() {
  return getLocalStorage(USERS_KEY) || [];
}

function saveUsers(users) {
  setLocalStorage(USERS_KEY, users);
}

function registerUser(name, email, password, phone) {
  const users = getUsers();
  if (users.some(u => u.email === email)) {
    return { success: false, message: 'Cet email est déjà utilisé.' };
  }
  const newUser = {
    id: Date.now(),
    name,
    email,
    password, // En production, hasher le mot de passe
    phone,
    createdAt: new Date().toISOString()
  };
  users.push(newUser);
  saveUsers(users);
  return { success: true, user: newUser };
}

function loginUser(email, password) {
  const users = getUsers();
  const user = users.find(u => u.email === email && u.password === password);
  if (user) {
    setLocalStorage(CURRENT_USER_KEY, user);
    return { success: true, user };
  }
  return { success: false, message: 'Email ou mot de passe incorrect.' };
}

function logoutUser() {
  setLocalStorage(CURRENT_USER_KEY, null);
  window.location.href = 'konekte.html';
}

function getCurrentUser() {
  return getLocalStorage(CURRENT_USER_KEY);
}

// ========== Splash avec rotation anti-répétition ==========
function showSplash() {
  const splash = document.getElementById('splash');
  if (!splash) return;
  
  let splashImage = 'https://i.postimg.cc/QNzv9wsb/1003204538.jpg';
  try {
    const pubs = getPubsFromStorage();
    if (pubs && pubs.length > 0) {
      let lastIndex = getLocalStorage(LAST_SPLASH_INDEX_KEY);
      lastIndex = lastIndex !== null && lastIndex !== undefined ? lastIndex : -1;
      // Choisir un index aléatoire différent du dernier
      let newIndex;
      if (pubs.length === 1) {
        newIndex = 0;
      } else {
        do {
          newIndex = Math.floor(Math.random() * pubs.length);
        } while (newIndex === lastIndex);
      }
      splashImage = pubs[newIndex].image;
      setLocalStorage(LAST_SPLASH_INDEX_KEY, newIndex);
    }
  } catch (e) {
    console.warn('Erreur chargement pub splash, image par défaut utilisée.');
  }
  
  const img = document.getElementById('splash-image');
  if (img) img.src = splashImage;
  
  splash.style.display = 'flex';
  // Auto-fermeture après 6 secondes si l'utilisateur ne clique pas
  setTimeout(() => {
    closeSplash();
  }, 6000);
}

function closeSplash() {
  const splash = document.getElementById('splash');
  if (splash) {
    splash.style.display = 'none';
  }
}

// ========== Produits & Pubs (LocalStorage + Supabase fallback) ==========
function getProductsFromStorage() {
  let products = getLocalStorage(PRODUCTS_KEY);
  if (products && Array.isArray(products) && products.length > 0) {
    return products;
  }
  
  // Si Supabase configuré, tente de charger depuis la table 'products'
  if (supabase) {
    try {
      supabase.from('products').select('*').then(({ data, error }) => {
        if (!error && data && data.length > 0) {
          setLocalStorage(PRODUCTS_KEY, data);
          return data;
        }
      }).catch(() => {});
    } catch (e) {}
  }
  
  // Données par défaut
  const defaultProducts = [
    { id: 1, name: 'T-shirt Logo 100PANIK', price: 45, category: 'T-shirt', image: 'https://i.postimg.cc/QNzv9wsb/1003204538.jpg' },
    { id: 2, name: 'Hoodie Oversize', price: 85, category: 'Hoodie', image: 'https://i.postimg.cc/QNzv9wsb/1003204538.jpg' },
    { id: 3, name: 'Veste Workwear', price: 120, category: 'Veste', image: 'https://i.postimg.cc/QNzv9wsb/1003204538.jpg' },
    { id: 4, name: 'Pantalon Cargo', price: 75, category: 'Pantalon', image: 'https://i.postimg.cc/QNzv9wsb/1003204538.jpg' }
  ];
  setLocalStorage(PRODUCTS_KEY, defaultProducts);
  return defaultProducts;
}

function saveProductsToStorage(products) {
  setLocalStorage(PRODUCTS_KEY, products);
  if (supabase) {
    try {
      supabase.from('products').upsert(products).then(({ error }) => {
        if (error) console.warn('Supabase sync error', error);
      });
    } catch (e) {}
  }
}

function getPubsFromStorage() {
  let pubs = getLocalStorage(PUBS_KEY);
  if (pubs && Array.isArray(pubs)) return pubs;
  
  const defaultPubs = [
    { id: 1, title: 'Nouvelle Collection', image: 'https://i.postimg.cc/QNzv9wsb/1003204538.jpg', link: 'boutik.html' },
    { id: 2, title: 'Promo Exclusive', image: 'https://i.postimg.cc/QNzv9wsb/1003204538.jpg', link: 'boutik.html' }
  ];
  setLocalStorage(PUBS_KEY, defaultPubs);
  return defaultPubs;
}

function savePubsToStorage(pubs) {
  setLocalStorage(PUBS_KEY, pubs);
  if (supabase) {
    try {
      supabase.from('pubs').upsert(pubs).then(({ error }) => {
        if (error) console.warn('Supabase sync error', error);
      });
    } catch (e) {}
  }
}

// ========== Affichage sur la page d'accueil ==========
function loadFeaturedPubs() {
  const container = document.getElementById('featured-pubs');
  if (!container) return;
  
  const pubs = getPubsFromStorage();
  container.innerHTML = pubs.map(pub => `
    <div class="card">
      <div class="card-image">
        <img src="${pub.image}" alt="${pub.title}">
      </div>
      <div class="card-body">
        <h3 class="card-title">${pub.title}</h3>
        ${pub.link ? `<a href="${pub.link}" class="btn btn-gold">Voir</a>` : ''}
      </div>
    </div>
  `).join('');
}

function loadFeaturedProducts() {
  const container = document.getElementById('featured-products');
  if (!container) return;
  
  const products = getProductsFromStorage().slice(0, 4);
  container.innerHTML = products.map(prod => `
    <div class="card">
      <div class="card-image">
        <img src="${prod.image}" alt="${prod.name}">
      </div>
      <div class="card-body">
        <span class="card-category">${prod.category}</span>
        <h3 class="card-title">${prod.name}</h3>
        <p class="card-price">$${prod.price}</p>
        <button class="btn btn-gold" onclick="addToCart(${prod.id}, '${prod.name}', ${prod.price}, '${prod.image}')">Ajouter au panier</button>
      </div>
    </div>
  `).join('');
}

// ========== Boutique ==========
function loadProductsWithFilters() {
  const container = document.getElementById('products-grid');
  if (!container) return;
  
  const search = document.getElementById('search-input')?.value?.toLowerCase() || '';
  const category = document.getElementById('category-filter')?.value || '';
  const priceRange = document.getElementById('price-filter')?.value || '';
  const sort = document.getElementById('sort-select')?.value || 'newest';
  
  let products = getProductsFromStorage();
  
  if (search) {
    products = products.filter(p => p.name.toLowerCase().includes(search) || (p.category && p.category.toLowerCase().includes(search)));
  }
  if (category) {
    products = products.filter(p => p.category === category);
  }
  if (priceRange) {
    const [min, max] = priceRange.split('-').map(Number);
    if (max) {
      products = products.filter(p => p.price >= min && p.price <= max);
    } else {
      products = products.filter(p => p.price >= min);
    }
  }
  
  switch(sort) {
    case 'price-asc': products.sort((a,b) => a.price - b.price); break;
    case 'price-desc': products.sort((a,b) => b.price - a.price); break;
    case 'name': products.sort((a,b) => a.name.localeCompare(b.name)); break;
    default: products.sort((a,b) => b.id - a.id);
  }
  
  container.innerHTML = products.map(prod => `
    <div class="card">
      <div class="card-image">
        <img src="${prod.image}" alt="${prod.name}">
      </div>
      <div class="card-body">
        <span class="card-category">${prod.category}</span>
        <h3 class="card-title">${prod.name}</h3>
        <p class="card-price">$${prod.price}</p>
        <button class="btn btn-gold" onclick="addToCart(${prod.id}, '${prod.name}', ${prod.price}, '${prod.image}')">Ajouter au panier</button>
      </div>
    </div>
  `).join('');
}

function filterProducts() {
  loadProductsWithFilters();
}

// ========== Panier ==========
function getCart() {
  return getLocalStorage(CART_KEY) || [];
}

function saveCart(cart) {
  setLocalStorage(CART_KEY, cart);
  updateCartCount();
  if (typeof displayCart === 'function') displayCart();
}

function addToCart(id, name, price, image, size = 'M') {
  const cart = getCart();
  const existing = cart.find(item => item.id === id && item.size === size);
  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({ id, name, price, image, size, quantity: 1 });
  }
  saveCart(cart);
  // Notification moderne
  showToast('Produit ajouté au panier !');
}

function updateCartCount() {
  const countElements = document.querySelectorAll('#cart-count');
  const cart = getCart();
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  countElements.forEach(el => {
    if (el) el.textContent = totalItems;
  });
}

function displayCart() {
  const container = document.getElementById('cart-items');
  const totalContainer = document.getElementById('cart-total');
  if (!container || !totalContainer) return;
  
  const cart = getCart();
  if (cart.length === 0) {
    container.innerHTML = '<p>Votre panier est vide.</p>';
    totalContainer.innerHTML = '';
    return;
  }
  
  container.innerHTML = cart.map(item => `
    <div class="cart-item">
      <img src="${item.image}" alt="${item.name}">
      <div class="cart-item-details">
        <h3>${item.name}</h3>
        <p>Taille: ${item.size}</p>
        <p>Prix: $${item.price}</p>
      </div>
      <div class="cart-item-actions">
        <button class="quantity-btn" onclick="changeQuantity(${item.id}, '${item.size}', -1)">-</button>
        <span>${item.quantity}</span>
        <button class="quantity-btn" onclick="changeQuantity(${item.id}, '${item.size}', 1)">+</button>
        <button class="remove-btn" onclick="removeFromCart(${item.id}, '${item.size}')">🗑️</button>
      </div>
    </div>
  `).join('');
  
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  totalContainer.innerHTML = `Total : $${total.toFixed(2)}`;
}

function changeQuantity(id, size, delta) {
  const cart = getCart();
  const item = cart.find(i => i.id === id && i.size === size);
  if (item) {
    item.quantity += delta;
    if (item.quantity <= 0) {
      removeFromCart(id, size);
      return;
    }
    saveCart(cart);
  }
}

function removeFromCart(id, size) {
  let cart = getCart();
  cart = cart.filter(i => !(i.id === id && i.size === size));
  saveCart(cart);
  displayCart();
}

// ========== Checkout ==========
function displayOrderSummary() {
  const container = document.getElementById('order-summary');
  if (!container) return;
  
  const cart = getCart();
  if (cart.length === 0) {
    container.innerHTML = '<p>Votre panier est vide.</p>';
    return;
  }
  
  let html = '<h3>Récapitulatif</h3><ul>';
  cart.forEach(item => {
    html += `<li>${item.name} x ${item.quantity} = $${(item.price * item.quantity).toFixed(2)}</li>`;
  });
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  html += `</ul><p><strong>Total : $${total.toFixed(2)}</strong></p>`;
  container.innerHTML = html;
}

document.addEventListener('DOMContentLoaded', function() {
  const form = document.getElementById('checkout-form');
  if (form) {
    form.addEventListener('submit', function(e) {
      e.preventDefault();
      const cart = getCart();
      if (cart.length === 0) {
        alert('Votre panier est vide.');
        return;
      }
      
      const name = document.getElementById('name').value.trim();
      const phone = document.getElementById('phone').value.trim();
      const address = document.getElementById('address').value.trim();
      
      if (!name || !phone || !address) {
        alert('Veuillez remplir tous les champs.');
        return;
      }
      
      const order = {
        id: Date.now(),
        customer: { name, phone, address },
        items: cart,
        total: cart.reduce((sum, item) => sum + item.price * item.quantity, 0),
        date: new Date().toISOString()
      };
      
      const orders = getLocalStorage(ORDERS_KEY) || [];
      orders.push(order);
      setLocalStorage(ORDERS_KEY, orders);
      
      if (supabase) {
        try {
          supabase.from('orders').insert(order).then(({ error }) => {
            if (error) console.warn('Supabase order insert error', error);
          });
        } catch (e) {}
      }
      
      let message = `Nouvelle commande 100PANIK%0A%0A`;
      message += `Client: ${encodeURIComponent(name)}%0A`;
      message += `Téléphone: ${encodeURIComponent(phone)}%0A`;
      message += `Adresse: ${encodeURIComponent(address)}%0A%0A`;
      message += `Articles:%0A`;
      cart.forEach(item => {
        message += `- ${encodeURIComponent(item.name)} x${item.quantity} = $${(item.price * item.quantity).toFixed(2)}%0A`;
      });
      message += `%0ATotal: $${order.total.toFixed(2)}`;
      
      const waLink = `https://wa.me/32924776?text=${message}`;
      
      const waContainer = document.getElementById('whatsapp-link');
      if (waContainer) {
        waContainer.style.display = 'block';
        waContainer.innerHTML = `<a href="${waLink}" target="_blank">Confirmer via WhatsApp</a>`;
      }
      
      setLocalStorage(CART_KEY, []);
      updateCartCount();
      showToast('Commande enregistrée !');
    });
  }
});

// ========== Admin ==========
function adminLogin() {
  const password = document.getElementById('admin-password').value;
  if (password === ADMIN_PASSWORD) {
    setLocalStorage(ADMIN_LOGGED_KEY, 'true');
    document.getElementById('login-section').style.display = 'none';
    document.getElementById('admin-panel').style.display = 'block';
    loadAdminData();
  } else {
    const error = document.getElementById('login-error');
    if (error) error.style.display = 'block';
  }
}

function adminLogout() {
  setLocalStorage(ADMIN_LOGGED_KEY, 'false');
  document.getElementById('login-section').style.display = 'flex';
  document.getElementById('admin-panel').style.display = 'none';
  document.getElementById('admin-password').value = '';
}

function loadAdminData() {
  const pubsContainer = document.getElementById('pubs-list');
  if (pubsContainer) {
    const pubs = getPubsFromStorage();
    pubsContainer.innerHTML = pubs.map(pub => `
      <div class="admin-item">
        <img src="${pub.image}" alt="${pub.title}">
        <div class="info">
          <strong>${pub.title}</strong>
        </div>
        <button class="btn btn-outline" onclick="deletePub(${pub.id})">Supprimer</button>
      </div>
    `).join('');
  }
  
  const productsContainer = document.getElementById('products-list');
  if (productsContainer) {
    const products = getProductsFromStorage();
    productsContainer.innerHTML = products.map(prod => `
      <div class="admin-item">
        <img src="${prod.image}" alt="${prod.name}">
        <div class="info">
          <strong>${prod.name}</strong> - $${prod.price} - ${prod.category}
        </div>
        <button class="btn btn-outline" onclick="deleteProduct(${prod.id})">Supprimer</button>
      </div>
    `).join('');
  }
}

function addPub() {
  const title = document.getElementById('pub-title').value.trim();
  const fileInput = document.getElementById('pub-image');
  if (!title || !fileInput.files[0]) {
    alert('Veuillez remplir le titre et choisir une image.');
    return;
  }
  
  const reader = new FileReader();
  reader.onload = function(e) {
    const pubs = getPubsFromStorage();
    const newPub = {
      id: Date.now(),
      title: title,
      image: e.target.result,
      link: 'boutik.html'
    };
    pubs.push(newPub);
    savePubsToStorage(pubs);
    loadAdminData();
    document.getElementById('pub-title').value = '';
    fileInput.value = '';
  };
  reader.readAsDataURL(fileInput.files[0]);
}

function deletePub(id) {
  let pubs = getPubsFromStorage();
  pubs = pubs.filter(p => p.id !== id);
  savePubsToStorage(pubs);
  loadAdminData();
}

function addProduct() {
  const name = document.getElementById('product-name').value.trim();
  const price = parseFloat(document.getElementById('product-price').value);
  const category = document.getElementById('product-category').value.trim();
  const fileInput = document.getElementById('product-image');
  
  if (!name || isNaN(price) || !category || !fileInput.files[0]) {
    alert('Veuillez remplir tous les champs et choisir une image.');
    return;
  }
  
  const reader = new FileReader();
  reader.onload = function(e) {
    const products = getProductsFromStorage();
    const newProduct = {
      id: Date.now(),
      name: name,
      price: price,
      category: category,
      image: e.target.result
    };
    products.push(newProduct);
    saveProductsToStorage(products);
    loadAdminData();
    document.getElementById('product-name').value = '';
    document.getElementById('product-price').value = '';
    document.getElementById('product-category').value = '';
    fileInput.value = '';
  };
  reader.readAsDataURL(fileInput.files[0]);
}

function deleteProduct(id) {
  let products = getProductsFromStorage();
  products = products.filter(p => p.id !== id);
  saveProductsToStorage(products);
  loadAdminData();
}

// ========== Authentification ==========
function switchAuthTab(tab) {
  const loginForm = document.getElementById('login-form');
  const registerForm = document.getElementById('register-form');
  const loginTab = document.getElementById('tab-login');
  const registerTab = document.getElementById('tab-register');
  
  if (tab === 'login') {
    loginForm.style.display = 'flex';
    registerForm.style.display = 'none';
    loginTab.classList.add('active');
    registerTab.classList.remove('active');
  } else {
    loginForm.style.display = 'none';
    registerForm.style.display = 'flex';
    loginTab.classList.remove('active');
    registerTab.classList.add('active');
  }
}

document.addEventListener('DOMContentLoaded', function() {
  // Gestion login
  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', function(e) {
      e.preventDefault();
      const email = document.getElementById('login-email').value.trim();
      const password = document.getElementById('login-password').value;
      const result = loginUser(email, password);
      if (result.success) {
        window.location.href = 'kont-mwen.html';
      } else {
        const error = document.getElementById('login-error');
        if (error) {
          error.textContent = result.message;
          error.style.display = 'block';
        }
      }
    });
  }
  
  // Gestion register
  const registerForm = document.getElementById('register-form');
  if (registerForm) {
    registerForm.addEventListener('submit', function(e) {
      e.preventDefault();
      const name = document.getElementById('register-name').value.trim();
      const email = document.getElementById('register-email').value.trim();
      const password = document.getElementById('register-password').value;
      const phone = document.getElementById('register-phone').value.trim();
      const result = registerUser(name, email, password, phone);
      if (result.success) {
        // Auto-login après inscription
        setLocalStorage(CURRENT_USER_KEY, result.user);
        window.location.href = 'kont-mwen.html';
      } else {
        const error = document.getElementById('register-error');
        if (error) {
          error.textContent = result.message;
          error.style.display = 'block';
        }
      }
    });
  }
  
  // Dashboard
  if (document.getElementById('dashboard-content')) {
    loadDashboard();
  }
  
  // Splash sur la page d'accueil
  if (document.getElementById('splash')) {
    showSplash();
  }
  
  updateCartCount();
});

function loadDashboard() {
  const user = getCurrentUser();
  const content = document.getElementById('dashboard-content');
  const notLogged = document.getElementById('not-logged-in');
  
  if (!content || !notLogged) return;
  
  if (!user) {
    content.style.display = 'none';
    notLogged.style.display = 'block';
    return;
  }
  
  content.style.display = 'block';
  notLogged.style.display = 'none';
  
  // Infos utilisateur
  let userInfo = `
    <div class="dashboard-info">
      <div class="dashboard-card">
        <h3>Informations</h3>
        <p><strong>Nom :</strong> ${user.name}</p>
        <p><strong>Email :</strong> ${user.email}</p>
        ${user.phone ? `<p><strong>Téléphone :</strong> ${user.phone}</p>` : ''}
      </div>
      <div class="dashboard-card">
        <h3>Statistiques</h3>
        <p><strong>Commandes :</strong> ${getOrdersForUser(user.email).length}</p>
      </div>
    </div>
  `;
  
  // Historique commandes
  const orders = getOrdersForUser(user.email);
  let ordersHtml = '<div class="order-history"><h3>Historique des commandes</h3>';
  if (orders.length === 0) {
    ordersHtml += '<p>Aucune commande pour le moment.</p>';
  } else {
    orders.forEach(order => {
      ordersHtml += `
        <div class="order-item">
          <span>Commande #${order.id}</span>
          <span>${new Date(order.date).toLocaleDateString()}</span>
          <span>$${order.total.toFixed(2)}</span>
        </div>
      `;
    });
  }
  ordersHtml += '</div>';
  
  content.innerHTML = userInfo + ordersHtml;
}

function getOrdersForUser(email) {
  const orders = getLocalStorage(ORDERS_KEY) || [];
  return orders.filter(o => o.customer && o.customer.email === email);
}

// ========== Notification toast ==========
function showToast(message) {
  let toast = document.getElementById('toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast';
    toast.style.cssText = `
      position: fixed;
      bottom: 30px;
      right: 30px;
      background: var(--brown-dark);
      color: var(--gold);
      padding: 15px 25px;
      border-radius: 50px;
      box-shadow: 0 5px 20px rgba(0,0,0,0.3);
      z-index: 10000;
      opacity: 0;
      transition: opacity 0.3s ease;
      font-weight: 600;
    `;
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.style.opacity = '1';
  setTimeout(() => {
    toast.style.opacity = '0';
  }, 3000);
}

// ========== Initialisation ==========
document.addEventListener('DOMContentLoaded', function() {
  updateCartCount();
  
  if (document.getElementById('admin-panel') && getLocalStorage(ADMIN_LOGGED_KEY) === 'true') {
    document.getElementById('login-section').style.display = 'none';
    document.getElementById('admin-panel').style.display = 'block';
    loadAdminData();
  }
});

