// --- [script.js: 最終功能整合版本 - 已修正創作模式清空問題] ---

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
const exportCreationsBtn = document.getElementById('export-creations-btn'); // 匯出按鈕
// --- [script.js: 1. DOM 元素選取與狀態變數] ---

// 新增 HUD 元素
const scoreDisplay = document.getElementById('score-display');
const livesDisplay = document.getElementById('lives-display');
const timerDisplay = document.getElementById('timer-display');

// 遊戲狀態變數 (保留不變)
let currentMode = null; 
let droppedIdCounter = 0;
const STORAGE_KEY = 'breadCreations'; // 畫廊儲存鍵

// 顧客模式變數 (新增計時器變數)
let score = 0;
let lives = 3;
let orderTimer = null; // 計時器 ID
let orderTimeLeft = 0; // 剩餘時間
let currentOrder = null;
const ORDER_TIME = 25; // 每筆訂單的時間 (秒) 
// ...
// 所有可用食材 (與您的 HTML 列表匹配)
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

// 顧客訂單範例
const SAMPLE_ORDERS = [
    { name: '經典火腿起司', required: ['Ham', 'Cheese'], optional: ['Lettuce'] },
    { name: '水果甜心', required: ['strawberry', 'Blueberry'], optional: ['whipped_cream'] },
    { name: '巧克力香蕉堡', required: ['Chocolate', 'banana'], optional: ['honey'] },
];


// --- [script.js: initializeBreadBase 最終修正版] ---

/**
 * 初始化麵包基底圖案
 */
// --- [script.js: initializeBreadBase 最終測試版] ---
function initializeBreadBase() {
    const existingImage = document.getElementById('bread-image');
    if (existingImage) {
        existingImage.remove();
    }

    baseBread.style.position = 'relative'; 
    baseBread.style.backgroundColor = 'transparent';
    baseBread.style.border = 'none';

    // 確保容器有明確的尺寸
    baseBread.style.width = '250px'; 
    baseBread.style.height = '250px';

    // !!! 測試點：使用一個確定的公共圖片 URL !!!
    // 這個圖片應該是能載入的。
    const TEST_IMAGE_URL = 'https://i.imgur.com/GzB04oU.png'; // 一個圓形麵包圖片

    baseBread.style.backgroundImage = `url("${TEST_IMAGE_URL}")`; 
    baseBread.style.backgroundSize = 'contain';
    baseBread.style.backgroundRepeat = 'no-repeat';
    baseBread.style.backgroundPosition = 'center';
}
// --- [結束測試版] ---



function clearCraftingArea() {
    const dropped = baseBread.querySelectorAll('.dropped-ingredient');
    dropped.forEach(d => d.remove());
}

/**
 * 處理生命值歸零後的遊戲結束流程
 */
function gameOver() {
    // 這裡可以停止計時器 (如果有的話)
    // if (orderTimer) stopOrderTimer(); 

    alert(`遊戲結束！您的生命歸零了。\n最終分數：${score} 分。`);
    
    // 返回主選單
    goToMenu();
}


/**
 * 返回選單：隱藏所有遊戲區塊，只顯示主選單
 */
function goToMenu() {
    currentMode = null;
    
    // 隱藏所有可能的遊戲畫面
    gameArea.classList.add('hidden');
    galleryArea.classList.add('hidden'); 
    
    // 只有在返回選單時才清空工作檯
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
        // 顧客模式：重新初始化並清空，準備新訂單
        score = 0;
        lives = 3;
        // HUD 初始化
        scoreDisplay.textContent = score; 
        livesDisplay.textContent = lives; 

        initializeBreadBase(); 
        clearCraftingArea(); 
        generateNewOrder();
        finishCraftingBtn.textContent = '✅ 完成出餐';
        finishCraftingBtn.onclick = finishAction; 
        finishCraftingBtn.disabled = false;
    } else { // 'creation' mode
        // 創作模式：不強制清空，讓使用者繼續修改
        orderDisplay.innerHTML = '<h2>✨ 自由創作時間！</h2><p>隨心所欲地搭配食材吧！完成後可以展示您的作品。</p>';
        finishCraftingBtn.textContent = '🖼️ 展示作品';
        finishCraftingBtn.onclick = finishAction; 
        finishCraftingBtn.disabled = false;
        
        // 確保基底存在
        if (!baseBread.querySelector('#bread-image')) {
            initializeBreadBase();
        }
    }
}

/**
 * 顯示畫廊並加載所有已保存的作品
 */
function showGallery() {
    // 隱藏選單和遊戲區
    levelSelection.classList.add('hidden'); 
    gameArea.classList.add('hidden');
    
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
            <p class="creation-concept">**理念：** ${creation.concept || '無'}</p>  <div class="creation-canvas" id="canvas-${index}"></div>
            <button onclick="deleteCreation(${index})">🗑️ 刪除作品</button>
        `;
        creationList.appendChild(card);
        
        renderCreationCanvas(`canvas-${index}`, creation.ingredients);
    });

}


// -----------------------------------
// 3. 顧客模式邏輯 (包含評分懲罰)
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
startOrderTimer(); // <-- 新增
}

/**
 * 檢查玩家製作的麵包是否符合當前顧客的需求，並更新分數/生命
 */
function checkCustomerOrder() {
    stopOrderTimer(); //
    if (!currentOrder) return alert("錯誤：沒有找到當前訂單！");

    const droppedIngredients = baseBread.querySelectorAll('.dropped-ingredient');
    const playerIngredients = new Set(); 
    droppedIngredients.forEach(ing => {
        playerIngredients.add(ing.getAttribute('data-name'));
    });
    
    // 1. 檢查缺少必須的食材
    let missingRequired = [];
    currentOrder.required.forEach(req => {
        if (!playerIngredients.has(req)) {
            missingRequired.push(req);
        }
    });

    // 2. 檢查多放了不該放的食材
    let extraIngredients = [];
    const allowedIngredients = new Set([...currentOrder.required, ...currentOrder.optional]);

    playerIngredients.forEach(playerIng => {
        if (!allowedIngredients.has(playerIng)) {
             extraIngredients.push(playerIng);
        }
    });
    
    // 3. 判斷結果，更新分數/生命
    let scoreChange = 0; 
    let lifeChange = 0;  
    let message = '';

    if (missingRequired.length === 0 && extraIngredients.length === 0) {
        scoreChange = 10; 
        message = '🎉 完美！顧客非常滿意！';
    } else if (missingRequired.length > 0) {
        lifeChange = -1;
        scoreChange = 0; 
        const missingLabels = missingRequired.map(name => ALL_INGREDIENTS.find(i => i.name === name).label).join('、');
        message = `⚠️ 嚴重錯誤！您缺少了必須的食材：**${missingLabels}**。(-1 生命)`;
    } else if (extraIngredients.length > 0) {
        lifeChange = -1; 
        scoreChange = 0;
        const extraLabels = extraIngredients.map(name => ALL_INGREVEDIENTS.find(i => i.name === name).label).join('、');
        message = `💡 錯誤！您多放了 **${extraLabels}**。顧客不喜歡這個！(-1 生命)`;
    } else {
        scoreChange = 5; 
        message = '👍 達成基本要求，表現不錯！';
    }
    
    // 4. 更新遊戲狀態
    score += scoreChange;
    lives += lifeChange;
    scoreDisplay.textContent = score; // <-- 更新分數顯示
    livesDisplay.textContent = lives; // <-- 更新生命顯示

    alert(`【出餐結果】\n分數變化：${scoreChange} 分\n生命變化：${lifeChange} 點\n\n${message}\n\n當前生命：${lives} 點`);

    // 5. 檢查是否遊戲結束或準備下一回合
  if (lives <= 0) {
        gameOver();
    } else {
        clearCraftingArea();
        generateNewOrder(); // 準備下一個訂單
    }
}

// --- [script.js: 新增 計時器核心函數] ---

/**
 * 停止計時器 (用於出餐或時間到)
 */
function stopOrderTimer() {
    if (orderTimer) {
        clearInterval(orderTimer);
        orderTimer = null;
    }
}

/**
 * 更新計時器顯示，並檢查時間是否用盡
 */
function updateTimer() {
    orderTimeLeft--;
    timerDisplay.textContent = orderTimeLeft;
    
    // 如果時間歸零
    if (orderTimeLeft <= 0) {
        stopOrderTimer();
        lives--; // 時間用盡扣除生命
        livesDisplay.textContent = lives;
        
        alert(`⏰ 時間到！顧客等太久不耐煩地走了。(-1 生命)`);
        
        if (lives <= 0) {
            gameOver();
        } else {
            clearCraftingArea();
            generateNewOrder(); // 進入下一張訂單
        }
    }
}

/**
 * 啟動新的訂單計時器
 */
function startOrderTimer() {
    stopOrderTimer(); // 確保先停止舊的計時器
    orderTimeLeft = ORDER_TIME;
    timerDisplay.textContent = orderTimeLeft;
    orderTimer = setInterval(updateTimer, 1000); // 每秒更新一次
}


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
// --- [script.js: 修正 handleCreationFinish 函數] ---

/**
 * 處理自由創作模式下的「展示作品」按鈕點擊
 */
function handleCreationFinish() {
    const droppedIngredients = baseBread.querySelectorAll('.dropped-ingredient');
    
    if (droppedIngredients.length === 0) {
        alert("請至少放置一個食材再展示作品！");
        return;
    }

    const name = prompt("請為您的麵包作品命名：") || `無名傑作 ${Date.now()}`;
    // 新增：收集作品理念
    const concept = prompt("請為您的作品填寫製作理念（例如：靈感來源、口味搭配）：") || '沒有特別的製作理念。';

    const creationData = {
        name: name,
        concept: concept, // <-- 新增：儲存理念
        ingredients: []
    };
    
    // 儲存食材數據
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
    
    alert(`🎉 您的作品「${creationData.name}」已成功保存！\n理念：${creationData.concept}`);
    
    // 1. 隱藏遊戲區 (創作頁面)
    gameArea.classList.add('hidden');
    
    // 2. 顯示畫廊 (畫廊/舞台)
    galleryArea.classList.remove('hidden');

    // 3. 重新載入畫廊列表
    showGallery(); 
}
// --- [結束修正] ---
function exportCreations() {
    const savedCreations = getSavedCreations();
    
    if (savedCreations.length === 0) {
        alert("目前沒有任何作品可以匯出！");
        return;
    }

    const jsonOutput = JSON.stringify(savedCreations, null, 2);

    const exportWindow = window.open("", "作品數據匯出", "width=600,height=400");
    exportWindow.document.write('<html><head><title>作品數據匯出</title></head><body>');
    exportWindow.document.write('<h2>請複製以下數據：</h2>');
    exportWindow.document.write('<p>將此文本保存為 .json 檔案即可匯入。</p>');
    exportWindow.document.write('<textarea rows="15" cols="70" style="resize: none;">' + jsonOutput + '</textarea>');
    exportWindow.document.write('</body></html>');
    exportWindow.document.close();
}


/**
 * 渲染單個創作 (縮小版)
 */
/**
 * 渲染單個創作 (縮小版)
 */
function renderCreationCanvas(canvasId, ingredients) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    
    // 原始工作檯尺寸 (來自 CSS #base-bread)
    const ORIGINAL_BREAD_SIZE = 250; 
    // 畫廊展示畫布尺寸 (來自下方的 style 設定)
    const GALLERY_CANVAS_SIZE = 150; 
    // 計算縮放比例：150 / 250 = 0.6
    const scaleFactor = GALLERY_CANVAS_SIZE / ORIGINAL_BREAD_SIZE;
    
    // 確保 canvas 尺寸設定與計算比例一致
    canvas.style.width = `${GALLERY_CANVAS_SIZE}px`; 
    canvas.style.height = `${GALLERY_CANVAS_SIZE}px`;
    canvas.style.margin = '10px auto';
    canvas.style.position = 'relative';
    canvas.style.backgroundImage = 'url("garden_bread.png")'; 
    canvas.style.backgroundSize = 'contain';

    ingredients.forEach(ingData => {
        const newIngredient = document.createElement('div');
        const item = ALL_INGREDIENTS.find(i => i.name === ingData.name);
        
        newIngredient.textContent = item ? item.icon : ingData.name;
        newIngredient.classList.add('dropped-ingredient');
        
        // 修正：將儲存的座標值 (e.g. '200px') 轉換為數字，並乘以縮放比例
        const originalLeft = parseFloat(ingData.left);
        const originalTop = parseFloat(ingData.top);
        
        const scaledLeft = originalLeft * scaleFactor;
        const scaledTop = originalTop * scaleFactor;

        newIngredient.style.position = 'absolute';
    // 使用縮放後的座標值
    newIngredient.style.left = `${scaledLeft}px`; 
    newIngredient.style.top = `${scaledTop}px`;
    
    // 關鍵修正點：將縮放比例從 0.35 增加到 0.6 (或您喜歡的任何值)
    newIngredient.style.transform = 'scale(0.8)'; // <-- 放大標誌
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
// 5. 拖曳功能
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
    // 移動現有元素邏輯
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

// 6. 完成動作 (分流顧客/創作模式)
function finishAction() {
    if (currentMode === 'customer') {
        checkCustomerOrder();
    } else if (currentMode === 'creation') {
        handleCreationFinish();
    }
}


// -----------------------------------
// 7. 最終事件監聽器
// -----------------------------------

document.addEventListener('DOMContentLoaded', () => {
    // 點擊「顧客需求出餐」，進入遊戲模式
    modeCustomerBtn.addEventListener('click', () => startGame('customer'));
    
    // 點擊「自由創作展示」，進入創作模式
    modeCreationBtn.addEventListener('click', () => startGame('creation')); 
    
    // 返回選單按鈕 (遊戲中)
    backToMenuBtn.addEventListener('click', goToMenu);
    
    // 從畫廊返回選單按鈕
    backFromGalleryBtn.addEventListener('click', goToMenu); 
    
    // 畫廊匯出按鈕
    exportCreationsBtn.addEventListener('click', exportCreations);
    
    // 遊戲中的完成按鈕
    finishCraftingBtn.addEventListener('click', finishAction);
    
    // 初始載入
    initializeBreadBase();
    setupDragAndDrop();
});
