// --- [script.js: 最終功能整合版本] ---

// -----------------------------------
// 1. DOM 元素選取與狀態變數
// -----------------------------------

const levelSelection = document.getElementById('level-selection');
const gameArea = document.getElementById('game-area');
const modeCustomerBtn = document.getElementById('mode-customer');
const modeCreationBtn = document.getElementById('mode-creation');
const backToMenuBtn = document.getElementById('back-to-menu');
const finishCraftingBtn = document.getElementById('finish-crafting');
const baseBread = document.getElementById('base-bread');
const ingredientsArea = document.getElementById('ingredients-area');

// 畫廊相關
const galleryArea = document.getElementById('gallery-area'); 
const creationList = document.getElementById('creation-list');
const backFromGalleryBtn = document.getElementById('back-from-gallery');
const orderDisplay = document.getElementById('order-display'); 

// 遊戲狀態變數
let currentMode = null; 
let droppedIdCounter = 0;
const STORAGE_KEY = 'breadCreations'; // 畫廊儲存鍵

// 顧客模式變數
let score = 0;
let lives = 3;
let orderTimer = null;
let orderTimeLeft = 0;
let currentOrder = [];
const ORDER_TIME = 25; // seconds per order

// 所有可用食材 (這裡需要與您的 HTML 食材列表保持一致)
const ALL_INGREDIENTS = [
    { name: 'Cheese', icon: '🧀', label: '起司' },
    { name: 'Tomato', icon: '🍅', label: '番茄' },
    { name: 'Ham', icon: '🍖', label: '火腿' },
    { name: 'Lettuce', icon: '🥬', label: '生菜' },
    { name: 'Chocolate', icon: '🍫', label: '巧克力' },
    { name: 'Mushroom', icon: '🍄', label: '蘑菇' },
    { name: 'lemon', icon: '🍋', label: '檸檬' },
    { name: 'strawberry', icon: '🍓', label: '草莓' },
    { name: 'Blueberry', icon: '🫐', label: '藍莓' },
    { name: 'grapes', icon: '🍇', label: '葡萄' },
    { name: 'peach', icon: '🍑', label: '桃子' },
    { name: 'kiwi', icon: '🥝', label: '奇異果' },
    { name: 'banana', icon: '🍌', label: '香蕉' },
    { name: 'pineapple', icon: '🍍', label: '鳳梨' },
    { name: 'sugar', icon: '🍬', label: '糖果' },
    { name: 'honey', icon: '🍯', label: '蜂蜜' },
    { name: 'whipped_cream', icon: '🍦', label: '鮮奶油' },
    { name: 'egg', icon: '🥚', label: '雞蛋' },
    { name: 'butter', icon: '🧈', label: '奶油' },
    { name: 'peanut_butter', icon: '🥜', label: '花生醬' }
];

// 顧客訂單範例 (需要與您的 ALL_INGREDIENTS 匹配)
const SAMPLE_ORDERS = [
    { name: '經典火腿起司', required: ['Ham', 'Cheese'], optional: [] },
    { name: '水果甜心', required: ['strawberry', 'Blueberry'], optional: ['whipped_cream'] },
    { name: '巧克力香蕉堡', required: ['Chocolate', 'banana'], optional: ['honey'] },
];


// -----------------------------------
// 2. 核心功能：初始化與切換
// -----------------------------------

/**
 * 初始化麵包基底圖案
 */
function initializeBreadBase() {
    baseBread.innerHTML = '';
    const breadImage = document.createElement('img');
    breadImage.src = 'garden_bread.png';
    breadImage.alt = '麵包基底';
    breadImage.id = 'bread-image';
    breadImage.style.width = '100%'; 
    breadImage.style.height = 'auto';
    breadImage.style.objectFit = 'contain';
    baseBread.appendChild(breadImage);
    baseBread.style.backgroundColor = 'transparent';
    baseBread.style.border = 'none';
}

/**
 * 清空工作檯上的食材
 */
function clearCraftingArea() {
    const dropped = baseBread.querySelectorAll('.dropped-ingredient');
    dropped.forEach(d => d.remove());
}

/**
 * 返回選單：隱藏所有遊戲區塊，只顯示主選單
 */
function goToMenu() {
    currentMode = null;
    
    // 隱藏所有可能的遊戲畫面
    gameArea.classList.add('hidden');
    galleryArea.classList.add('hidden'); 
    
    clearCraftingArea(); 
    
    // 最後顯示主選單
    levelSelection.classList.remove('hidden'); 
}

/**
 * 啟動遊戲 (顧客模式或創作模式)
 */
function startGame(mode) {
    currentMode = mode;
    
    levelSelection.classList.add('hidden');
    gameArea.classList.remove('hidden');
    setupDragAndDrop();

    if (mode === 'customer') {
        score = 0;
        lives = 3;
        // 使用更簡單的 generateNewOrder 函數 (因為您的原始 generateOrder 較複雜)
        generateNewOrder(); 
        finishCraftingBtn.textContent = '✅ 完成出餐';
        finishCraftingBtn.onclick = checkCustomerOrder; 
        finishCraftingBtn.disabled = false;
    } else { // 'creation' mode
        orderDisplay.innerHTML = '<h2>✨ 自由創作時間！</h2><p>隨心所欲地搭配食材吧！完成後可以展示您的作品。</p>';
        finishCraftingBtn.textContent = '🖼️ 展示作品';
        finishCraftingBtn.onclick = handleCreationFinish; 
        finishCraftingBtn.disabled = false;
    }
    initializeBreadBase();
    clearCraftingArea();
}

/**
 * 顯示畫廊並加載所有已保存的作品 (這是您點擊按鈕的目標函數)
 */
function showGallery() {
    // 步驟 1: 隱藏所有工作區，切換到畫廊
    goToMenu(); 
    levelSelection.classList.add('hidden'); // 確保選單被隱藏

    // 顯示畫廊區塊
    galleryArea.classList.remove('hidden'); 

    // 步驟 2: 加載作品列表
    const savedCreations = getSavedCreations();
    creationList.innerHTML = ''; 

    if (savedCreations.length === 0) {
        creationList.innerHTML = '<p>目前沒有已保存的作品。</p>';
        return;
    }
    
    // 渲染作品到畫廊中
    savedCreations.forEach((creation, index) => {
        const card = document.createElement('div');
        card.classList.add('saved-creation');
        
        card.innerHTML = `
            <h3>${creation.name}</h3>
            <div class="creation-canvas" id="canvas-${index}"></div>
            <button onclick="deleteCreation(${index})">🗑️ 刪除作品</button>
        `;
        creationList.appendChild(card);
        
        renderCreationCanvas(`canvas-${index}`, creation.ingredients);
    });
}


// -----------------------------------
// 3. 顧客模式邏輯 (簡化)
// -----------------------------------

function generateNewOrder() {
    const randomIndex = Math.floor(Math.random() * SAMPLE_ORDERS.length);
    currentOrder = SAMPLE_ORDERS[randomIndex];
    
    // 渲染訂單顯示
    let requiredHtml = currentOrder.required.map(reqName => {
        const item = ALL_INGREDIENTS.find(ing => ing.name === reqName);
        return `<span class="order-item required">${item ? item.icon : '❓'} ${item ? item.label : reqName} (必須)</span>`;
    }).join('');

    let optionalHtml = currentOrder.optional.map(optName => {
        const item = ALL_INGREDIENTS.find(ing => ing.name === optName);
        return `<span class="order-item optional">${item ? item.icon : '❓'} ${item ? item.label : optName} (可選)</span>`;
    }).join('');

    orderDisplay.innerHTML = `
        <h2>🎯 顧客點單：**${currentOrder.name}**</h2>
        <p>請為顧客製作這個美味的麵包：</p>
        <div class="order-list">
            ${requiredHtml}
            ${optionalHtml}
        </div>
    `;
    // 啟動計時器 (如果需要)
    // startOrderTimer(); 
}

function checkCustomerOrder() {
    if (!currentOrder) return alert("錯誤：沒有找到當前訂單！");

    // 1. 獲取玩家使用的所有食材名稱
    const droppedIngredients = baseBread.querySelectorAll('.dropped-ingredient');
    const playerIngredients = new Set(); 
    droppedIngredients.forEach(ing => {
        playerIngredients.add(ing.getAttribute('data-name'));
    });
    
    // 2. 檢查必須的食材是否都在麵包上
    let missingRequired = [];
    currentOrder.required.forEach(req => {
        if (!playerIngredients.has(req)) {
            missingRequired.push(req);
        }
    });

    // 3. 檢查是否有放錯的食材 (既非必須也非可選的)
    let extraIngredients = [];
    const allowedIngredients = new Set([...currentOrder.required, ...currentOrder.optional]);

    playerIngredients.forEach(playerIng => {
        if (!allowedIngredients.has(playerIng)) {
             extraIngredients.push(playerIng);
        }
    });
    
    // 4. 判斷結果，更新分數/生命
    let scoreChange = 0; // 這次訂單獲得或失去的分數
    let lifeChange = 0;  // 這次訂單生命值的變化
    let message = '';

    if (missingRequired.length === 0 && extraIngredients.length === 0) {
        // 完美達成
        scoreChange = 10; // 每個訂單給予固定分數
        message = '🎉 完美！顧客非常滿意！';
    } else if (missingRequired.length > 0) {
        // 缺少必須的食材 -> 嚴重錯誤，扣分扣生命
        lifeChange = -1;
        scoreChange = 0; 
        const missingLabels = missingRequired.map(name => ALL_INGREDIENTS.find(i => i.name === name).label).join('、');
        message = `⚠️ 嚴重錯誤！您缺少了必須的食材：**${missingLabels}**。(-1 生命)`;
    } else if (extraIngredients.length > 0) {
        // 多放了不該放的食材 -> 輕微錯誤，扣分或不給分
        lifeChange = -1; // 輕微錯誤，也扣生命
        scoreChange = 0;
        const extraLabels = extraIngredients.map(name => ALL_INGREDIENTS.find(i => i.name === name).label).join('、');
        message = `💡 錯誤！您多放了 **${extraLabels}**。顧客不喜歡這個！(-1 生命)`;
    } else {
        // 應付複雜情況，確保有一個默認行為
        scoreChange = 5; 
        message = '👍 達成基本要求，表現不錯！';
    }
    
    // 5. 更新遊戲狀態
    score += scoreChange;
    lives += lifeChange;
    
    alert(`【出餐結果】\n分數變化：${scoreChange} 分\n生命變化：${lifeChange} 點\n\n${message}\n\n當前生命：${lives} 點`);

    // 6. 檢查是否遊戲結束或準備下一回合
    if (lives <= 0) {
        gameOver();
    } else {
        clearCraftingArea();
        generateNewOrder(); // 準備下一個訂單
    }
    // --- [新增到 script.js 的任意空白處] ---

function gameOver() {
    // 這裡可以停止計時器 (如果有的話)
    // if (orderTimer) stopOrderTimer(); 

    alert(`遊戲結束！您的生命歸零了。\n最終分數：${score} 分。`);
    
    // 返回主選單
    goToMenu();
}

// --- [結束新增] ---
}

// --- [結束替換] ---
// -----------------------------------
// 4. 創作畫廊邏輯
// -----------------------------------

function getSavedCreations() {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
}

/**
 * 處理自由創作模式下的「展示作品」按鈕點擊
 */
function handleCreationFinish() {
    const droppedIngredients = baseBread.querySelectorAll('.dropped-ingredient');
    
    if (droppedIngredients.length === 0) {
        alert("請至少放置一個食材再展示作品！");
        return;
    }

    const creationData = {
        name: prompt("請為您的麵包作品命名：") || `無名傑作 ${Date.now()}`,
        ingredients: []
    };

    droppedIngredients.forEach(ing => {
        creationData.ingredients.push({
            name: ing.getAttribute('data-name'),
            left: ing.style.left,
            top: ing.style.top
        });
    });

    const savedCreations = getSavedCreations();
    savedCreations.push(creationData);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(savedCreations));
    
    alert(`🎉 您的作品「${creationData.name}」已成功保存！`);
    
    // 切換到畫廊
    showGallery(); 
}

/**
 * 渲染單個創作 (縮小版)
 */
function renderCreationCanvas(canvasId, ingredients) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    
    canvas.style.width = '150px'; 
    canvas.style.height = '150px';
    canvas.style.margin = '10px auto';
    canvas.style.position = 'relative';
    canvas.style.backgroundImage = 'url("garden_bread.png")'; 
    canvas.style.backgroundSize = 'contain';

    ingredients.forEach(ingData => {
        const newIngredient = document.createElement('div');
        const item = ALL_INGREDIENTS.find(i => i.name === ingData.name);
        
        newIngredient.textContent = item ? item.icon : ingData.name;
        newIngredient.classList.add('dropped-ingredient');
        
        newIngredient.style.position = 'absolute';
        newIngredient.style.left = ingData.left;
        newIngredient.style.top = ingData.top;
        
        newIngredient.style.transform = 'scale(0.35)'; 
        newIngredient.style.padding = '0';
        newIngredient.style.backgroundColor = 'transparent';
        newIngredient.style.border = 'none';

        canvas.appendChild(newIngredient);
    });
}

/**
 * 刪除指定索引的作品
 */
function deleteCreation(index) {
    if (confirm("您確定要刪除這個作品嗎？")) {
        const savedCreations = getSavedCreations();
        savedCreations.splice(index, 1); 
        localStorage.setItem(STORAGE_KEY, JSON.stringify(savedCreations));
        showGallery(); // 重新加載畫廊
    }
}


// -----------------------------------
// 5. 拖曳功能 (簡化您的原始程式碼)
// -----------------------------------

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
    // 檢查是否為移動現有元素 (省略移動邏輯)
    const elementId = e.dataTransfer.getData('text/elementId');
    if (elementId) {
        // 處理移動現有元素
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

    // 建立新的食材
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

    // 使新元素可拖曳
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


// -----------------------------------
// 6. 最終事件監聽器 (修復切換邏輯)
// -----------------------------------

// --- [替換 script.js 底部 DOMContentLoaded 區塊] ---

document.addEventListener('DOMContentLoaded', () => {
    // 點擊「顧客需求出餐」，進入遊戲模式
    modeCustomerBtn.addEventListener('click', () => startGame('customer'));
    
    // **修正:** 點擊「自由創作展示」，進入創作模式 (startGame('creation'))
    modeCreationBtn.addEventListener('click', () => startGame('creation')); 
    
    // 返回選單按鈕
    backToMenuBtn.addEventListener('click', goToMenu);
    
    // 從畫廊返回選單按鈕
    backFromGalleryBtn.addEventListener('click', goToMenu); 
    
    // 遊戲中的完成按鈕 ( finishAction 會根據 currentMode 決定呼叫 checkCustomerOrder 還是 handleCreationFinish)
    finishCraftingBtn.addEventListener('click', finishAction);
    
    // 初始載入
    initializeBreadBase();
    setupDragAndDrop();
});

// --- [script.js: DOMContentLoaded 修正完成] ---