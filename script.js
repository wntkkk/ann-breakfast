// Инициализация
let cart = [];
const TELEGRAM_USERNAME = 'wntkkk';

// Функция для отображения поцелуйчиков
function formatPrice(count) {
    return `${count}х💋`;
}

document.addEventListener('DOMContentLoaded', () => {
    loadMenu();
    loadCartFromStorage();
    updateCartDisplay();
});

// Загрузка меню
function loadMenu() {
    renderMenuSection('dishes', menuData.dishes);
    renderMenuSection('drinks', menuData.drinks);
}

function renderMenuSection(containerId, items) {
    const container = document.getElementById(containerId);
    container.innerHTML = items.map(item => `
        <div class="menu-item" data-id="${item.id}" data-name="${item.name}" data-price="${item.price}">
            <div class="item-header">
                <div class="item-name">${item.name}</div>
                <div class="item-price">${formatPrice(item.price)}</div>
            </div>
            <div class="item-description">${item.description}</div>
        </div>
    `).join('');

    // Добавляем слушатели на все позиции
    container.querySelectorAll('.menu-item').forEach(item => {
        item.addEventListener('click', (e) => {
            addToCart(item.dataset);
            createFallingHearts(e);
        });
    });
}

// Добавление в корзину
function addToCart(itemData) {
    const cartItem = {
        id: itemData.id,
        name: itemData.name,
        price: parseInt(itemData.price),
        timestamp: Date.now()
    };
    
    cart.push(cartItem);
    saveCartToStorage();
    updateCartDisplay();
}

// Удаление из корзины
function removeFromCart(timestamp) {
    cart = cart.filter(item => item.timestamp !== timestamp);
    saveCartToStorage();
    updateCartDisplay();
}

// Обновление отображения корзины
function updateCartDisplay() {
    const cartItemsContainer = document.getElementById('cartItems');
    const sendLink = document.getElementById('sendButton');

    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<p class="empty-cart">Пока пусто...</p>';
        sendLink.classList.add('disabled');
        sendLink.href = '#';
        return;
    }

    sendLink.classList.remove('disabled');

    const groupedCart = {};
    cart.forEach(item => {
        if (!groupedCart[item.name]) {
            groupedCart[item.name] = {
                name: item.name,
                price: item.price,
                count: 0,
                timestamps: []
            };
        }
        groupedCart[item.name].count++;
        groupedCart[item.name].timestamps.push(item.timestamp);
    });

    cartItemsContainer.innerHTML = Object.entries(groupedCart).map(([name, data]) => `
        <div class="cart-item">
            <div class="cart-item-name">
                <strong>${data.name}</strong> x${data.count}
            </div>
            <div class="cart-item-price">${formatPrice(data.price * data.count)}</div>
            <button class="cart-item-remove" onclick="removeAllOfType('${name}')">✕</button>
        </div>
    `).join('');
}

function removeAllOfType(itemName) {
    cart = cart.filter(item => item.name !== itemName);
    saveCartToStorage();
    updateCartDisplay();
}

// Сохранение корзины в localStorage
function saveCartToStorage() {
    localStorage.setItem('annBreakfastCart', JSON.stringify(cart));
}

function loadCartFromStorage() {
    const saved = localStorage.getItem('annBreakfastCart');
    if (saved) {
        cart = JSON.parse(saved);
    }
}

// Падающие сердечки
function createFallingHearts(event) {
    const container = document.getElementById('heartsContainer');
    const hearts = ['❤️', '💕', '💖', '💗', '💝'];
    
    for (let i = 0; i < 5; i++) {
        const heart = document.createElement('div');
        heart.className = 'heart';
        heart.textContent = hearts[Math.floor(Math.random() * hearts.length)];
        
        const startX = event.clientX + (Math.random() - 0.5) * 100;
        const startY = event.clientY + (Math.random() - 0.5) * 50;
        const randomOffset = (Math.random() - 0.5) * 200;
        
        heart.style.left = startX + 'px';
        heart.style.top = startY + 'px';
        heart.style.setProperty('--random-offset', randomOffset + 'px');
        
        container.appendChild(heart);
        
        setTimeout(() => heart.remove(), 3000);
    }
}

// Отправка заказа в Telegram
document.getElementById('sendButton').addEventListener('click', (e) => {
    if (cart.length === 0) {
        e.preventDefault();
        return;
    }

    e.preventDefault();

    const orderText = generateOrderText();
    
    // Копируем в буфер обмена
    navigator.clipboard.writeText(orderText).then(() => {
        // Показываем модальное окно с инструкцией
        const modal = document.getElementById('orderModal');
        modal.classList.add('active');
    }).catch(() => {
        alert('Не удалось скопировать. Попробуйте ещё раз.');
    });
});

// Закрытие модального окна
document.getElementById('closeModal').addEventListener('click', () => {
    const modal = document.getElementById('orderModal');
    modal.classList.remove('active');
    
    // Очищаем корзину
    cart = [];
    saveCartToStorage();
    updateCartDisplay();
});

function generateOrderText() {
    const groupedCart = {};
    cart.forEach(item => {
        if (!groupedCart[item.name]) {
            groupedCart[item.name] = {
                price: item.price,
                count: 0
            };
        }
        groupedCart[item.name].count++;
    });

    let text = '🍳 Мой заказ на Ann\'s breakfast:\n\n';
    
    let totalPrice = 0;
    Object.entries(groupedCart).forEach(([name, data]) => {
        const totalItemPrice = data.price * data.count;
        totalPrice += totalItemPrice;
        text += `• ${name} x${data.count} — ${formatPrice(totalItemPrice)}\n`;
    });

    text += `\n💕 Всего: ${formatPrice(totalPrice)}\n\n💕 Постоплата`;
    
    return text;
}
