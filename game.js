// Game script: orders, timer, scoring, improved drag/drop

// 1. Elements and state
const levelSelection = document.getElementById('level-selection');
const gameArea = document.getElementById('game-area');
const modeCustomerBtn = document.getElementById('mode-customer');
const modeCreationBtn = document.getElementById('mode-creation');
const backToMenuBtn = document.getElementById('back-to-menu');
const finishCraftingBtn = document.getElementById('finish-crafting');
const baseBread = document.getElementById('base-bread');
const ingredientsArea = document.getElementById('ingredients-area');

let currentMode = null; // 'customer' or 'creation'
let score = 0;
let lives = 3;
let orderTimer = null;
let orderTimeLeft = 0;
let droppedIdCounter = 0;
let currentOrder = [];
const ORDER_TIME = 25; // seconds per order

// 2. Initialize bread base
function initializeBreadBase() {
    baseBread.innerHTML = '';
    const breadImage = document.createElement('img');
    breadImage.src = 'garden_bread.png';
    breadImage.alt = '麵包基底';
    breadImage.id = 'bread-image';
    baseBread.appendChild(breadImage);
    baseBread.style.backgroundColor = 'transparent';
    baseBread.style.border = 'none';
}

// 3. Game / order logic
function startGame(mode) {
    currentMode = mode;
    levelSelection.classList.add('hidden');
    gameArea.classList.remove('hidden');
    setupDragAndDrop();
    if (mode === 'customer') {
        score = 0;
        lives = 3;
        generateOrder();
    } else {
        showCreationMode();
    }
}

function goToMenu() {
    currentMode = null;
    levelSelection.classList.remove('hidden'); // 顯示主選單
    
    // 隱藏所有可能的遊戲畫面
    gameArea.classList.add('hidden');
    galleryArea.classList.add('hidden'); 
    // **[移除]** leaderboardArea.classList.add('hidden'); 
    
    clearCraftingArea(); 
}

// --- [結束替換] ---

function clearCraftingArea() {
    const dropped = baseBread.querySelectorAll('.dropped-ingredient');
    dropped.forEach(d => d.remove());
}

function showCreationMode() {
    const orderDisplay = document.getElementById('order-display');
    orderDisplay.innerHTML = `<h2>✨ 自由創作時間！</h2><p>隨心所欲地搭配食材吧！完成後可以展示您的作品。</p>`;
    finishCraftingBtn.textContent = '🖼️ 展示作品';
    initializeBreadBase();
}

// 4. Orders and timer
function generateOrder() {
    const ingredientEls = Array.from(document.querySelectorAll('.ingredient'));
    const names = ingredientEls.map(el => el.getAttribute('data-name'));
    const count = Math.floor(Math.random() * 3) + 1;
    const order = [];
    const pool = [...names];
    while (order.length < count && pool.length > 0) {
        const idx = Math.floor(Math.random() * pool.length);
        order.push(pool.splice(idx, 1)[0]);
    }
    currentOrder = order;
    renderOrderDisplay();
    clearCraftingArea();
    initializeBreadBase();
    startOrderTimer();
}

function renderOrderDisplay() {
    const orderDisplay = document.getElementById('order-display');
    orderDisplay.innerHTML = '';
    const hud = document.createElement('div');
    hud.className = 'hud';
    const scoreEl = document.createElement('div');
    scoreEl.className = 'item';
    scoreEl.textContent = `分數: ${score}`;
    const livesEl = document.createElement('div');
    livesEl.className = 'item';
    livesEl.textContent = `生命: ${lives}`;
    const timerEl = document.createElement('div');
    timerEl.className = 'item';
    timerEl.id = 'order-timer';
    timerEl.textContent = `時間: ${orderTimeLeft}s`;
    hud.appendChild(scoreEl);
    hud.appendChild(livesEl);
    hud.appendChild(timerEl);
    orderDisplay.appendChild(hud);

    const title = document.createElement('h2');
    title.textContent = '🎯 顧客點單挑戰！';
    orderDisplay.appendChild(title);
    const hint = document.createElement('p');
    hint.textContent = '請在時間內完成顧客想要的食材組合：';
    orderDisplay.appendChild(hint);

    const list = document.createElement('div');
    list.className = 'order-list';
    currentOrder.forEach(name => {
        const origin = document.querySelector(`.ingredient[data-name="${name}"]`);
        const el = document.createElement('div');
        el.className = 'order-ingredient';
        el.textContent = origin ? origin.textContent : name;
        list.appendChild(el);
    });
    orderDisplay.appendChild(list);
    finishCraftingBtn.textContent = '✅ 完成出餐';
}

function startOrderTimer() {
    stopOrderTimer();
    orderTimeLeft = ORDER_TIME;
    const timerEl = document.getElementById('order-timer');
    if (timerEl) timerEl.textContent = `時間: ${orderTimeLeft}s`;
    orderTimer = setInterval(() => {
        orderTimeLeft -= 1;
        const t = document.getElementById('order-timer');
        if (t) t.textContent = `時間: ${orderTimeLeft}s`;
        if (orderTimeLeft <= 0) {
            stopOrderTimer();
            onOrderTimeout();
        }
    }, 1000);
}

function stopOrderTimer() {
    if (orderTimer) {
        clearInterval(orderTimer);
        orderTimer = null;
    }
}

function onOrderTimeout() {
    lives -= 1;
    alert('時間到！顧客等不及了（-1 生命）');
    if (lives <= 0) {
        gameOver();
    } else {
        generateOrder();
    }
}

function gameOver() {
    stopOrderTimer();
    alert(`遊戲結束！最終分數：${score}`);
    goToMenu();
}

// 5. Drag & Drop
function setupDragAndDrop() {
    const ingredients = document.querySelectorAll('.ingredient');
    ingredients.forEach(ingredient => {
        ingredient.setAttribute('draggable', true);
        ingredient.addEventListener('dragstart', originalIngredientDragStart);
    });

    baseBread.addEventListener('dragover', (e) => e.preventDefault());
    baseBread.addEventListener('drop', baseBreadDrop);

    ingredientsArea.addEventListener('dragover', (e) => e.preventDefault());
    ingredientsArea.addEventListener('drop', ingredientsAreaDrop);
}

function originalIngredientDragStart(e) {
    const name = e.target.getAttribute('data-name');
    e.dataTransfer.setData('text/plain', name);
    e.dataTransfer.effectAllowed = 'copy';
}

function baseBreadDrop(e) {
    e.preventDefault();
    const elementId = e.dataTransfer.getData('text/elementId');
    if (elementId) {
        const moving = document.getElementById(elementId);
        if (moving) {
            const breadRect = baseBread.getBoundingClientRect();
            const dropX = e.clientX - breadRect.left;
            const dropY = e.clientY - breadRect.top;
            moving.style.left = `${Math.min(Math.max(0, dropX), breadRect.width - 20)}px`;
            moving.style.top = `${Math.min(Math.max(0, dropY), breadRect.height - 20)}px`;
        }
        return;
    }

    const ingredientName = e.dataTransfer.getData('text/plain');
    if (!ingredientName) return;

    const originalIngredient = document.querySelector(`.ingredient[data-name="${ingredientName}"]`);
    const newIngredient = document.createElement('div');
    newIngredient.className = 'dropped-ingredient';
    newIngredient.setAttribute('data-name', ingredientName);
    newIngredient.id = `dropped-${++droppedIdCounter}`;
    newIngredient.textContent = originalIngredient ? originalIngredient.textContent : ingredientName;

    const breadRect = baseBread.getBoundingClientRect();
    const dropX = e.clientX - breadRect.left;
    const dropY = e.clientY - breadRect.top;
    newIngredient.style.left = `${Math.min(Math.max(0, dropX), breadRect.width - 20)}px`;
    newIngredient.style.top = `${Math.min(Math.max(0, dropY), breadRect.height - 20)}px`;

    newIngredient.setAttribute('draggable', true);
    newIngredient.addEventListener('dragstart', (ev) => {
        ev.dataTransfer.setData('text/elementId', newIngredient.id);
        ev.dataTransfer.effectAllowed = 'move';
    });

    baseBread.appendChild(newIngredient);
}

function ingredientsAreaDrop(e) {
    e.preventDefault();
    const elementId = e.dataTransfer.getData('text/elementId');
    if (elementId) {
        const el = document.getElementById(elementId);
        if (el && el.classList.contains('dropped-ingredient')) el.remove();
    }
}

// 6. Evaluate and scoring
function evaluateCurrentCrafting() {
    const dropped = Array.from(baseBread.querySelectorAll('.dropped-ingredient'));
    const placedNames = dropped.map(d => d.getAttribute('data-name'));
    const placedSet = new Set(placedNames);
    const orderSet = new Set(currentOrder);
    if (placedSet.size !== orderSet.size) return false;
    for (const item of orderSet) if (!placedSet.has(item)) return false;
    return true;
}

function finishAction() {
    if (currentMode === 'customer') {
        stopOrderTimer();
        const ok = evaluateCurrentCrafting();
        if (ok) {
            score += 10 * (currentOrder.length);
            alert('成功出餐！顧客很滿意！');
            generateOrder();
        } else {
            lives -= 1;
            alert('出餐不合顧客要求（-1 生命）');
            if (lives <= 0) gameOver();
            else generateOrder();
        }
    } else {
        alert('作品已展示！謝謝您的創作 🎨');
    }
}

// 7. Boot
document.addEventListener('DOMContentLoaded', () => {
    modeCustomerBtn.addEventListener('click', () => startGame('customer'));
    modeCreationBtn.addEventListener('click', () => startGame('creation'));
    backToMenuBtn.addEventListener('click', goToMenu);
    finishCraftingBtn.addEventListener('click', finishAction);
    initializeBreadBase();
    setupDragAndDrop();
});
