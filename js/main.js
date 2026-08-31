// ========== Constantes & Helpers ==========
const CART_KEY = 'panik_cart';
const PUBS_KEY = 'panik_pubs';
const PRODUCTS_KEY = 'panik_products';
const ORDERS_KEY = 'panik_orders';
const ADMIN_LOGGED_KEY = 'panik_admin_logged';
const ADMIN_PASSWORD = '100panik';

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

// ========== Splash ==========
function showSplash() {
  const splash = document.getElementById('splash');
  if (!splash) return;
  
  // Tente de récupérer une pub aléatoire pour le splash
  let splashImage = 'https://i.postimg.cc/QNzv9wsb/1003204538.jpg';
  try {
    const pubs = getLocalStorage(PUBS_KEY);
    if (pubs && pubs.length > 0) {
      const randomPub = pubs[Math.floor(Math.random() * pubs.length)];
      if (randomPub && randomPub.image) splashImage = randomPub.image;
    }
  } catch (e) {
    console.warn('Erreur chargement pub splash, image par défaut utilisée.');
  }
  
  const img = document.getElementById('splash-image');
  if (img) img.src = splashImage;
  
  splash.style.display = 'flex';
}

function closeSplash() {
  const splash = document.getElementById('splash');
  if (splash) {
    splash.style.display = 'none';
  }
}

// ========== Produits & Pubs (LocalStorage + Supabase fallback) ==========
function getProductsFromStorage() {
  // Essaie d'abord localStorage
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
    {
      id: 1,
      name: 'T-shirt Logo 100PANIK',
      price: 45,
      category: 'T-shirt',
      image: 'https://i.postimg.cc/QNzv9wsb/1003204538.jpg'
    },
    {
      id: 2,
      name: 'Hoodie Oversize',
      price: 85,
      category: 'Hoodie',
      image: 'https://i.postimg.cc/QNzv9wsb/1003204538.jpg'
    },
    {
      id: 3,
      name: 'Veste Workwear',
      price: 120,
      category: 'Veste',
      image: 'https://i.postimg.cc/QNzv9wsb/1003204538.jpg'
    },
    {
      id: 4,
      name: 'Pantalon Cargo',
      price: 75,
      category: 'Pantalon',
      image: 'https://i.postimg.cc/QNzv9wsb/1003204538.jpg'
    }
  ];
  setLocalStorage(PRODUCTS_KEY, defaultProducts);
  return defaultProducts;
}

function saveProductsToStorage(products) {
  setLocalStorage(PRODUCTS_KEY, products);
  // Optionnel : synchroniser avec Supabase si configuré
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
  
  // Données par défaut (une seule pub avec l'image par défaut)
  const defaultPubs = [
    {
      id: 1,
      title: 'Nouvelle Collection',
      image: 'https://i.postimg.cc/QNzv9wsb/1003204538.jpg',
      link: 'boutik.html'
    }
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
  
  // Filtres
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
  
  // Tri
  switch(sort) {
    case 'price-asc':
      products.sort((a,b) => a.price - b.price);
      break;
    case 'price-desc':
      products.sort((a,b) => b.price - a.price);
      break;
    case 'name':
      products.sort((a,b) => a.name.localeCompare(b.name));
      break;
    default: // newest
      products.sort((a,b) => b.id - a.id);
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
  // Feedback visuel
  alert('Produit ajouté au panier !');
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
      
      // Création de la commande
      const order = {
        id: Date.now(),
        customer: { name, phone, address },
        items: cart,
        total: cart.reduce((sum, item) => sum + item.price * item.quantity, 0),
        date: new Date().toISOString()
      };
      
      // Enregistrer dans localStorage
      const orders = getLocalStorage(ORDERS_KEY) || [];
      orders.push(order);
      setLocalStorage(ORDERS_KEY, orders);
      
      // Optionnel : Supabase
      if (supabase) {
        try {
          supabase.from('orders').insert(order).then(({ error }) => {
            if (error) console.warn('Supabase order insert error', error);
          });
        } catch (e) {}
      }
      
      // Construire le message WhatsApp
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
      
      // Afficher le lien
      const waContainer = document.getElementById('whatsapp-link');
      if (waContainer) {
        waContainer.style.display = 'block';
        waContainer.innerHTML = `<a href="${waLink}" target="_blank">Confirmer via WhatsApp</a>`;
      }
      
      // Vider le panier
      setLocalStorage(CART_KEY, []);
      updateCartCount();
      alert('Commande enregistrée ! Cliquez sur le bouton WhatsApp pour finaliser.');
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
  // Pubs
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
  
  // Produits
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

// Initialisation au chargement
document.addEventListener('DOMContentLoaded', function() {
  updateCartCount();
  
  // Si on est sur la page admin et déjà connecté
  if (document.getElementById('admin-panel') && getLocalStorage(ADMIN_LOGGED_KEY) === 'true') {
    document.getElementById('login-section').style.display = 'none';
    document.getElementById('admin-panel').style.display = 'block';
    loadAdminData();
  }
});

