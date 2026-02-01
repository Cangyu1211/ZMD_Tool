//  按鈕設定：在這裡修改按鈕清單
const BASE_ATTRS = ["敏捷提升", "力量提升", "意志提升", "智識提升", "主能力提升"];
const ADDITIONAL_ATTRS = [
    "生命提升", "攻擊提升", "物理傷害提升", "灼熱傷害提升", "寒冷傷害提升", 
    "自然傷害提升", "電磁傷害提升", "法術傷害提升", "暴擊率提升", "源石技藝提升", 
    "治療效率提升", "終結技效率提升"
];
const SKILL_ATTRS = [
    "壓制", "追襲", "巧技", "昂揚", "附術", "流轉", "夜幕", 
    "殘暴", "粉碎", "迸發", "醫療", "效益", "切骨"
];

let weaponsData = [];
let selectedAttrs = new Set();
const starWeight = { "六星": 6, "五星": 5, "四星": 4 };

async function init() {
    renderTags('base-attributes', BASE_ATTRS);
    renderTags('additional-attributes', ADDITIONAL_ATTRS);
    renderTags('skill-attributes', SKILL_ATTRS);

    document.querySelectorAll('.tag').forEach(tag => tag.addEventListener('click', toggleAttribute));
    document.getElementById('btn-clear').addEventListener('click', clearSelection);
    document.getElementById('btn-see-all').addEventListener('click', filterWeaponsLoose);

    try {
        const response = await fetch('weapons.json');
        weaponsData = await response.json();
    } catch (error) {
        console.error("無法讀取 weapons.json，請確認檔案位置或是否在 GitHub Pages 上執行。", error);
        document.getElementById('results').innerHTML = `<div class="no-results">數據載入失敗<br>請在 GitHub Pages 上執行</div>`;
    }
}

function renderTags(containerId, attributes) {
    const container = document.getElementById(containerId);
    attributes.forEach(attr => {
        const tag = document.createElement('span');
        tag.className = 'tag';
        tag.textContent = attr;
        tag.setAttribute('data-attr', attr);
        container.appendChild(tag);
    });
}

function toggleAttribute(e) {
    const attr = e.currentTarget.getAttribute('data-attr');
    if("vibrate" in navigator) navigator.vibrate(10);

    selectedAttrs.has(attr) ? selectedAttrs.delete(attr) : selectedAttrs.add(attr);
    e.currentTarget.classList.toggle('selected');
    updateStatus();
    filterWeapons();
}

function updateStatus() {
    const statusEl = document.getElementById('status');
    const seeAllBtn = document.getElementById('btn-see-all');
    const count = selectedAttrs.size;

    statusEl.classList.remove('ready');

    if (count === 0) {
        statusEl.textContent = '請點擊 3 個屬性';
        seeAllBtn.style.display = 'none';
    } else if (count === 3) {
        statusEl.textContent = '已鎖定 3 個屬性';
        statusEl.classList.add('ready');
        seeAllBtn.style.display = 'none';
    } else {
        statusEl.textContent = `已選 ${count} 個 (需 3 個)`;
        seeAllBtn.style.display = 'block';
    }
}

function clearSelection() {
    selectedAttrs.clear();
    document.querySelectorAll('.tag').forEach(tag => tag.classList.remove('selected'));
    document.getElementById('results').innerHTML = '';
    updateStatus();
    window.scrollTo({top: 0, behavior: 'smooth'});
}

function filterWeapons() {
    if (selectedAttrs.size !== 3) {
        document.getElementById('results').innerHTML = '';
        return;
    }
    const target = [...selectedAttrs];
    const filtered = weaponsData.filter(w => {
        const weaponSet = new Set([w.effect_1, w.effect_2, w.effect_3]);
        return target.every(val => weaponSet.has(val));
    });
    renderResults(filtered);
    scrollToResults();
}

function filterWeaponsLoose() {
    if (selectedAttrs.size === 0) return;
    const target = [...selectedAttrs];
    const filtered = weaponsData.filter(w => {
        const weaponSet = new Set([w.effect_1, w.effect_2, w.effect_3]);
        return target.every(attr => weaponSet.has(attr));
    });
    renderResults(filtered);
    scrollToResults();
}

function scrollToResults() {
     setTimeout(() => {
        const resultsEl = document.getElementById('results-anchor');
        resultsEl.scrollIntoView({behavior: 'smooth', block: 'start'});
    }, 100);
}

function renderResults(filtered) {
    const resultsEl = document.getElementById('results');
    
    // 排序：星級大到小
    filtered.sort((a, b) => {
        const weightA = starWeight[a.star_level] || 0;
        const weightB = starWeight[b.star_level] || 0;
        return weightB - weightA;
    });

    if (filtered.length === 0) {
        resultsEl.innerHTML = `<div class="no-results">無符合結果<br>請嘗試其他組合</div>`;
        return;
    }

    resultsEl.innerHTML = filtered.map(w => `
        <div class="weapon-card">
            <div class="weapon-header">
                <div class="weapon-name">${w.name}</div>
                <div class="weapon-tags">
                    <span class="star-tag" data-star="${w.star_level}">${w.star_level}</span>
                    <span class="type-tag">${w.type}</span>
                </div>
            </div>
            <div class="weapon-detail">
                <div class="attr-pill">🔸 ${w.effect_1}</div>
                <div class="attr-pill">🔹 ${w.effect_2}</div>
                <div class="attr-pill">💠 ${w.effect_3}</div>
            </div>
        </div>
    `).join('');
}
init();