let products = [];

async function loadProducts() {
  const productsSection = document.getElementById('products');
  if (!productsSection) return;

  try {
    const request = new XMLHttpRequest();
    request.open("GET", "/products", true);
    request.onreadystatechange = function () {
      if (request.readyState === 4 && request.status === 200) {
        products = JSON.parse(request.responseText);
        productsSection.innerHTML = products
          .map(
            (product) => `
          <div class="product">
            <img src="${product.image}" alt="${product.name}">
            <h2>${product.name}</h2>
            <p>${product.description}</p>
            <p class="price">${product.price} Ft</p>
            <button onclick="addToCart(${product.id})">Kosárba</button>
          </div>
        `
          )
          .join('');
      }
    };
    request.send();
  } catch (error) {
    console.error('Hiba történt a termékek betöltésekor:', error);
  }
}


function addToCart(productId) {
  const request = new XMLHttpRequest();
  request.open('GET', `/products/${productId}`);
  request.onload = function() {
    if (request.status === 200) {
      const product = JSON.parse(request.responseText);
      if (product) {
        alert(`${product.name} hozzáadva a kosárhoz!`);
      } else {
        alert('A termék nem található!');
      }
    } else {
      console.error('Hiba történt a kosárba helyezés során:', request.statusText);
      alert('Hiba történt a kosárba helyezés során.');
    }
  };
  request.onerror = function() {
    console.error('Hiba történt a kosárba helyezés során:', request.statusText);
    alert('Hiba történt a kosárba helyezés során.');
  };
  request.send();
}


const loginForm = document.getElementById('loginForm');
if (loginForm) {
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    try {
      const request = new XMLHttpRequest();
      request.open("POST", "/login");
      request.setRequestHeader('Content-Type', 'application/json');
      request.onreadystatechange = function () {
        if (request.readyState === 4) {
          const data = JSON.parse(request.responseText);
          if (data.token) {
            localStorage.setItem('token', data.token);
            window.location.href = '/';
          } else {
            alert('Hibás felhasználónév vagy jelszó!');
          }
        }
      };
      request.send(JSON.stringify({ username, password }));
    } catch (error) {
      alert('Hiba történt a bejelentkezés során.');
    }
  });
}


const registerForm = document.getElementById('registerForm');
if (registerForm) {
  registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    try {
      const request = new XMLHttpRequest();
      request.open("POST", "/register", true);
      request.setRequestHeader('Content-Type', 'application/json');
      request.onreadystatechange = function () {
        if (request.readyState === 4) {
          if (request.status === 200) {
            alert('Sikeres regisztráció!');
            window.location.href = '/login.html';
          } else {
            alert('Sikertelen regisztráció!');
          }
        }
      };
      request.send(JSON.stringify({ username, password, role: 'user' }));
    } catch (error) {
      alert('Hiba történt a regisztráció során.');
    }
  });
}


async function loadAdminProducts() {
  const productList = document.getElementById('productList');
  if (!productList) return;

  try {
    const request = new XMLHttpRequest();
    request.open("GET", "/products", true);
    request.onreadystatechange = function () {
      if (request.readyState === 4 && request.status === 200) {
        const products = JSON.parse(request.responseText);
        productList.innerHTML = products
          .map(
            (product) => `
          <div class="product-item">
            <img src="${product.image}" alt="${product.name}">
            <h3>${product.name}</h3>
            <p>${product.description}</p>
            <p class="price">${product.price} Ft</p>
            <div class="actions">
              <button onclick="editProduct(${product.id})">Szerkesztés</button>
              <button class="delete" onclick="deleteProduct(${product.id})">Törlés</button>
            </div>
          </div>
        `
          )
          .join('');
      }
    };
    request.send();
  } catch (error) {
    console.error('Hiba történt a termékek betöltésekor:', error);
  }
}


const addProductForm = document.getElementById('addProductForm');
if (addProductForm) {
  addProductForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const name = document.getElementById('name').value;
    const description = document.getElementById('description').value;
    const price = document.getElementById('price').value;
    const image = document.getElementById('image').value;

    const request = new XMLHttpRequest();
    request.open('POST', '/products', true);
    request.setRequestHeader('Content-Type', 'application/json');
    request.onload = function() {
      if (request.status === 201) {
        alert('Termék sikeresen hozzáadva!');
        loadAdminProducts();
      } else {
        alert('Hiba történt a termék hozzáadása során.');
      }
    };
    request.onerror = function() {
      console.error('Hiba történt a termék hozzáadása során:', request.statusText);
    };
    request.send(JSON.stringify({ name, description, price, image }));
  });
}


function editProduct(id) {
  const name = prompt('Új név:');
  const description = prompt('Új leírás:');
  const price = prompt('Új ár:');
  const image = prompt('Új kép URL:');

  if (name && description && price && image) {
    const request = new XMLHttpRequest();
    request.open('PUT', `/products/${id}`, true);
    request.setRequestHeader('Content-Type', 'application/json');
    request.onload = function() {
      if (request.status === 200) {
        alert('Termék sikeresen frissítve!');
        loadAdminProducts();
      } else {
        alert('Hiba történt a termék frissítése során.');
      }
    };
    request.onerror = function() {
      console.error('Hiba történt a termék frissítése során:', request.statusText);
    };
    request.send(JSON.stringify({ name, description, price, image }));
  }
}


function deleteProduct(id) {
  if (confirm('Biztosan törölni szeretnéd ezt a terméket?')) {
    const request = new XMLHttpRequest();
    request.open('DELETE', `/products/${id}`, true);
    request.onload = function() {
      if (request.status === 200) {
        alert('Termék sikeresen törölve!');
        loadAdminProducts();
      } else {
        alert('Hiba történt a termék törlése során.');
      }
    };
    request.onerror = function() {
      console.error('Hiba történt a termék törlése során:', request.statusText);
    };
    request.send();
  }
}


document.addEventListener('DOMContentLoaded', () => {
  loadProducts();
  loadAdminProducts();

  const token = localStorage.getItem('token');
  const userMoneyLabel = document.getElementById('userMoney');

  if (token && userMoneyLabel) {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const userMoney = payload.money;
    userMoneyLabel.textContent = `Pénz: ${userMoney} Ft`;
  }


  const loginButton = document.getElementById('loginButton');
  if (!token && loginButton) {
    loginButton.style.display = 'block';
    loginButton.addEventListener('click', () => {
      window.location.href = '/login.html';
    });
  } else if (loginButton) {
    loginButton.style.display = 'none';
  }

  const adminButton = document.getElementById('adminButton');
  if (token && adminButton) {
    const payload = JSON.parse(atob(token.split('.')[1]));
    if (payload.role == 'admin') {
      adminButton.style.display = 'block';
      adminButton.addEventListener('click', () => {
        window.location.href = '/admin.html';
      });
    }
  }

  const logoutButton = document.getElementById('logoutButton');
  if (logoutButton) {
    if (token) {
      logoutButton.style.display = 'block';
      logoutButton.addEventListener('click', () => {
        localStorage.removeItem('token');
        localStorage.removeItem('cart');
        window.location.href = '/';
      });
    } else {
      logoutButton.style.display = 'none';
    }
  }
});


const logoutButton = document.getElementById('logoutButton');
if (logoutButton) {
  logoutButton.addEventListener('click', () => {
    localStorage.removeItem('token');
    localStorage.removeItem('cart');
    window.location.href = '/';
  });
}


const backButton = document.getElementById('backButton');
if (backButton) {
  backButton.addEventListener('click', () => {
    window.location.href = '/';
  });
}

let cart = JSON.parse(localStorage.getItem('cart')) || [];

function checkout() {
  const token = localStorage.getItem('token');
  if (!token) {
    alert('Kérlek, jelentkezz be!');
    window.location.href = '/login.html';
    return;
  }

  if(cart.length == 0){
    alert('A kosarad üres! :)');
    return;
  }

  const totalPrice = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const request = new XMLHttpRequest();
  request.open('PUT', '/decreaseMoney', true);
  request.setRequestHeader('Content-Type', 'application/json');
  request.setRequestHeader('Authorization', `Bearer ${token}`);
  request.onload = function() {
    const data = JSON.parse(request.responseText);
    if (request.status === 200 && data.auth) {
      localStorage.setItem('token', data.token);
      alert('A vásárlás sikeres!');
      localStorage.removeItem('cart');
      cart = [];
      updateCartUI();
      window.location.href = '/';
    } else {
      alert(data.message);
    }
  };
  request.onerror = function() {
    console.error('Hiba történt a vásárlás során:', request.statusText);
    alert('Hiba történt a vásárlás során.');
  };
  request.send(JSON.stringify({ productPrice: totalPrice }));
}

async function addToCart(productId) {
  try {
    const request = new XMLHttpRequest();
    request.open("GET", `/products/${productId}`, true);
    request.onreadystatechange = function () {
      if (request.readyState === 4 && request.status === 200) {
        const product = JSON.parse(request.responseText);
        if (product) {
          const cart = JSON.parse(localStorage.getItem('cart')) || [];
          const existingProduct = cart.find((item) => item.id === product.id);
          if (existingProduct) {
            existingProduct.quantity += 1;
          } else {
            cart.push({ ...product, quantity: 1 });
          }
          localStorage.setItem('cart', JSON.stringify(cart));
          alert(`${product.name} hozzáadva a kosárhoz!`);
          updateCartUI();
        } else {
          alert('A termék nem található!');
        }
      }
    };
    request.send();
  } catch (error) {
    console.error('Hiba történt a kosárba helyezés során:', error);
    alert('Hiba történt a kosárba helyezés során: ' + error.message);
  }
}

function removeFromCart(productId) {
  cart = cart.filter((item) => item.id !== productId);
  localStorage.setItem('cart', JSON.stringify(cart));
  updateCartUI();
}

function increaseQuantity(productId) {
  const product = cart.find((item) => item.id === productId);
  if (product) {
    product.quantity += 1;
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartUI();
  }
}

function decreaseQuantity(productId) {
  const product = cart.find((item) => item.id === productId);
  if (product) {
    if (product.quantity > 1) {
      product.quantity -= 1;
    } else {
      removeFromCart(productId);
    }
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartUI();
  }
}

function updateCartUI() {
  const cartItems = document.getElementById('cartItems');
  const cartTotal = document.getElementById('cartTotal');
  if (!cartItems || !cartTotal) return;


  cartItems.innerHTML = cart
    .map(
      (item) => `
      <div class="cart-item">
        <img src="${item.image}" alt="${item.name}">
        <div class="cart-item-details">
          <h3>${item.name}</h3>
          <p>${item.description}</p>
          <p class="price">${item.price} Ft</p>
          <div class="quantity-controls">
            <button onclick="decreaseQuantity(${item.id})">-</button>
            <span>${item.quantity}</span>
            <button onclick="increaseQuantity(${item.id})">+</button>
          </div>
          <button onclick="removeFromCart(${item.id})">Eltávolítás</button>
        </div>
      </div>
    `
    )
    .join('');

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  cartTotal.textContent = `Összesen: ${total} Ft`;
}

if (window.location.pathname === '/cart.html') {
  document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Hozzáférés megtagadva: nincs bejelentkezve.');
      window.location.href = '/';
    } else {
      updateCartUI();
    }
  });
}

const cartButton = document.getElementById('cartButton');
if (cartButton) {
  const token = localStorage.getItem('token');
  if (token) {
    cartButton.style.display = 'block';
  } else {
    cartButton.style.display = 'none';
  }

  cartButton.addEventListener('click', () => {
    window.location.href = '/cart.html';
  });
}