/**
 * HTTP Yaşam Döngüsü Animasyonu - Çekirdek Mantık
 * 5 Metod (GET, POST, PUT, PATCH, DELETE) ve 50 Aşama Desteği
 */

let currentMethod = 'GET';
let currentStages = allStages[currentMethod];
let currentStage = -1;
let currentLanguage = 'go';

// DOM Elemanları
const progressBar = document.getElementById('progressBar');
const vizTitle = document.getElementById('vizTitle');
const vizContent = document.getElementById('vizContent');
const technicalDetails = document.getElementById('technicalDetails');
const activeComponent = document.getElementById('activeComponent');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const resetBtn = document.getElementById('resetBtn');

function sanitize(html) {
    const temp = document.createElement('div');
    temp.innerHTML = html;
    return temp.innerHTML;
}

function updateStage(stageIndex) {
    if (stageIndex < 0 || stageIndex >= currentStages.length) return;

    currentStage = stageIndex;
    const stage = currentStages[stageIndex];

    // İlerleme Çubuğu
    progressBar.style.width = stage.progress + '%';

    // Aşama Göstergeleri
    document.querySelectorAll('.stage-dot').forEach((dot, index) => {
        dot.classList.remove('active', 'completed');
        if (index < stageIndex) {
            dot.classList.add('completed');
        } else if (index === stageIndex) {
            dot.classList.add('active');
        }
    });

    // İçerik Güncelleme
    vizContent.style.opacity = '0';
    setTimeout(() => {
        vizTitle.textContent = stage.title;
        vizContent.innerHTML = sanitize(stage.content);
        technicalDetails.innerHTML = sanitize(stage.technical);
        activeComponent.innerHTML = sanitize(stage.component);

        // Kod Parçacığı
        const customCode = getCodeForStage(currentMethod, stageIndex, currentLanguage);
        if (customCode) {
            const codeBlock = vizContent.querySelector('.code-block');
            if (codeBlock) {
                codeBlock.innerHTML = `<code>${customCode.replace(/\n/g, '<br>')}</code>`;
            }
        }
        vizContent.style.opacity = '1';
    }, 150);

    prevBtn.disabled = stageIndex === 0;
    nextBtn.innerHTML = stageIndex === currentStages.length - 1 ? "Süreci Tamamla" : "Sonraki Adım";
}

document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentLanguage = btn.dataset.lang;
        if (currentStage >= 0) updateStage(currentStage);
    });
});

document.querySelectorAll('.method-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.method-btn').forEach(b => {
            b.classList.remove('active');
            b.style.background = 'transparent';
        });
        btn.classList.add('active');

        const method = btn.dataset.method;
        const colors = {
            GET: '#22c55e',
            POST: '#f59e0b',
            PUT: '#00add8',
            PATCH: '#a855f7',
            DELETE: '#ef4444'
        };
        const color = colors[method] || '#00add8';
        btn.style.background = `rgba(${parseInt(color.slice(1, 3), 16)}, ${parseInt(color.slice(3, 5), 16)}, ${parseInt(color.slice(5, 7), 16)}, 0.15)`;

        currentMethod = method;
        currentStages = allStages[method];
        currentStage = -1;
        resetVisualization();
    });
});

function resetVisualization() {
    progressBar.style.width = '0%';
    document.querySelectorAll('.stage-dot').forEach(dot => dot.classList.remove('active', 'completed'));
    vizTitle.textContent = `${currentMethod} İşlem Akış Analizi`;
    vizContent.innerHTML = `
        <div style="text-align: center; margin-top: 100px;">
            <div style="font-size: 1.2rem; color: var(--primary); font-weight: bold; margin-bottom: 20px;">[ SİSTEM ANALİZE HAZIR ]</div>
            <p style="color: rgba(255,255,255,0.6);">${currentMethod} isteği için 10 aşamalı teknik analiz hazır.</p>
            <p style="font-size: 0.9rem; color: rgba(255,255,255,0.4); margin-top: 10px;">Başlamak için "Animasyonu Başlat" butonuna tıklayın.</p>
        </div>
    `;
    technicalDetails.innerHTML = '<div style="opacity: 0.5;">Analiz detayları burada görünecek...</div>';
    activeComponent.innerHTML = '<div style="opacity: 0.5;">Beklemede...</div>';
    nextBtn.innerHTML = "Animasyonu Başlat";
    prevBtn.disabled = true;
}

nextBtn.addEventListener('click', () => {
    if (currentStage === currentStages.length - 1) {
        currentStage = -1;
        resetVisualization();
    } else {
        updateStage(currentStage + 1);
    }
});

prevBtn.addEventListener('click', () => {
    if (currentStage > 0) updateStage(currentStage - 1);
});

resetBtn.addEventListener('click', resetVisualization);

function getCodeForStage(method, stageIndex, lang) {
    if (window.codeSnippets && window.codeSnippets[method] && window.codeSnippets[method][stageIndex]) {
        return window.codeSnippets[method][stageIndex][lang];
    }
    return null;
}
