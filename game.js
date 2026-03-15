const monsterList = [
    { id: 1, name: "해일 거북이", emoji: "🌊🐢", hp: 20, goldDrop: 10, desc: "단단한 수분 껍질로 방어하며 해일을 타고 돌진하는 돌연변이 거북." },
    { id: 2, name: "돌풍 독수리", emoji: "🌪️🦅", hp: 30, goldDrop: 15, desc: "거대한 날갯짓으로 소용돌이를 일으키는 돌풍의 지배자." },
    { id: 3, name: "번개 코브라", emoji: "⚡🐍", hp: 40, goldDrop: 20, desc: "정전기를 모아 눈에 보이지 않는 속도로 벼락같은 기습을 가한다." },
    { id: 4, name: "수호 부엉이", emoji: "🌲🦉", hp: 60, goldDrop: 30, desc: "밤의 숲을 지배하며 적의 약점을 꿰뚫어 보는 지혜로운 맹금." },
    { id: 5, name: "서리 블리자드 울프", emoji: "❄️🐺", hp: 80, goldDrop: 40, desc: "움직이는 곳마다 거센 질풍과 얼어붙은 눈보라를 몰고 다니는 정령 울프." },
    { id: 6, name: "타이탄 고릴라", emoji: "🪨🦍", hp: 120, goldDrop: 60, desc: "단단한 바위 지형마저 가루로 으스러뜨리는 파괴적인 피지컬." },
    { id: 7, name: "사막 폭군 전갈", emoji: "🏜️🦂", hp: 150, goldDrop: 80, desc: "시야를 가리는 모래폭풍 속에서 거대한 독침으로 치명타를 입힌다." },
    { id: 8, name: "심해 포식 상어", emoji: "🌊🦈", hp: 200, goldDrop: 100, desc: "빛조차 닿지 않는 심연의 왕. 모든 것을 집어삼키는 어마어마한 턱 파워." },
    { id: 9, name: "마그마 티렉스", emoji: "🌋🦖", hp: 300, goldDrop: 200, desc: "비늘 사이로 끓어오르는 용암 브레스를 뿜어내는 쥬라기 시대 절대 패왕." },
    { id: 10, name: "흑염 메테오 드래곤", emoji: "🌑🐉", hp: 500, goldDrop: 500, desc: "우주의 흑염과 함께 행성을 멸망시키려 강림한 궁극의 드래곤 보스." }
];

const gachaItems = [
    { name: "나무검", emoji: "🗡️", type: "무기" },
    { name: "방패", emoji: "🛡️", type: "방어구" },
    { name: "빨간포션", emoji: "🥤", type: "포션" },
    { name: "마법모자", emoji: "🧙", type: "장비" },
    { name: "반지", emoji: "💍", type: "장비" },
    { name: "요정 펫", emoji: "🧚", type: "펫" },
    { name: "강아지 펫", emoji: "🐕", type: "펫" },
    { name: "불의 검", emoji: "🔥", type: "무기" },
    { name: "얼음 지팡이", emoji: "❄️", type: "무기" },
    { name: "황금 왕관", emoji: "👑", type: "장비" }
];

// 게임 모드 상태
let gameMode = 'mix'; // 'mix' = 전체 랜덤, 'single' = 특정 단 선택
let selectedDan = 2;  // 특정 단 선택 모드일 때 사용할 단수
let questionType = 'multiple'; // 'multiple' = 객관식, 'subjective' = 주관식, 'mixed' = 혼합
let currentQuestionMode = 'multiple'; // 현재 문제의 유형

// 게임 상태
let player = {
    hp: 100,
    maxHp: 100,
    gold: 0,
    combo: 0,
    currentMonsterIndex: 0,
    unlockedMonsters: [],
    inventory: []
};

let currentMonster = null;
let currentCorrectAnswer = 0;

// DOM 요소 
const UI = {
    homeScreen: document.getElementById('home-screen'),
    mainUi: document.getElementById('main-ui'),
    app: document.getElementById('app'),
    hp: document.getElementById('player-hp'),
    gold: document.getElementById('player-gold'),
    monsterName: document.getElementById('monster-name'),
    monsterEmoji: document.getElementById('monster-emoji'),
    monsterHpFill: document.getElementById('monster-hp-fill'),
    monsterHpText: document.getElementById('monster-hp-text'),
    comboText: document.getElementById('combo-text'),
    damageText: document.getElementById('damage-text'),
    quizQuestion: document.getElementById('quiz-question'),
    quizOptions: document.getElementById('quiz-options'),
    
    // Quiz Input
    quizInputArea: document.getElementById('quiz-input-area'),
    quizInput: document.getElementById('quiz-input'),
    btnSubmitAnswer: document.getElementById('btn-submit-answer'),
    
    // Side Tabs
    tabShop: document.getElementById('tab-shop'),
    tabEncyclopedia: document.getElementById('tab-encyclopedia'),
    contentShop: document.getElementById('shop-content'),
    contentEncyclopedia: document.getElementById('encyclopedia-content'),
    
    // Shop & Gacha
    inventoryList: document.getElementById('inventory-list'),
    gachaResult: document.getElementById('gacha-result'),
    btnGacha: document.getElementById('btn-gacha'),
    
    // Encyclopedia
    encyclopediaGrid: document.getElementById('encyclopedia-grid'),
    collectionRate: document.getElementById('collection-rate'),
    
    // Settings Modal
    settingsModal: document.getElementById('settings-modal'),
    btnOpenSettings: document.getElementById('btn-open-settings'),
    btnCloseSettings: document.getElementById('btn-close-settings')
};

// 오디오 재생 헬퍼
function playSound(id) {
    const audio = document.getElementById(id);
    if(audio) {
        audio.currentTime = 0;
        audio.play().catch(e => console.log('Audio play blocked:', e));
    }
}

// Twemoji 적용 헬퍼
function applyTwemoji(element = document.body) {
    if (typeof twemoji !== 'undefined') {
        twemoji.parse(element);
    }
}

// 커스텀 토스트 알림 헬퍼 (alert 대체)
function showToast(message, emoji = '🔔') {
    const container = document.getElementById('toast-container');
    if (!container) return;
    
    // 토스트 요소 생성
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `<span class="toast-emoji">${emoji}</span> <span>${message}</span>`;
    
    container.appendChild(toast);
    applyTwemoji(toast);
    
    // 일정 시간 후 사라짐
    setTimeout(() => {
        toast.classList.add('toast-hide');
        toast.addEventListener('animationend', () => toast.remove());
    }, 2500); // 2.5초 노출
}

// 탭 전환 로직
function switchTab(tabId) {
    // 버튼 상태 초기화
    UI.tabShop.classList.remove('active');
    UI.tabEncyclopedia.classList.remove('active');
    // 컨텐츠 상태 초기화
    UI.contentShop.classList.remove('active');
    UI.contentEncyclopedia.classList.remove('active');
    
    if (tabId === 'shop') {
        UI.tabShop.classList.add('active');
        UI.contentShop.classList.add('active');
    } else {
        UI.tabEncyclopedia.classList.add('active');
        UI.contentEncyclopedia.classList.add('active');
        renderEncyclopedia();
    }
}

// 초기화
function init() {
    document.getElementById('btn-start').addEventListener('click', startGame);
    
    // 탭 이벤트 리스너
    UI.tabShop.addEventListener('click', () => switchTab('shop'));
    UI.tabEncyclopedia.addEventListener('click', () => switchTab('encyclopedia'));
    
    // 뽑기 버튼
    UI.btnGacha.addEventListener('click', pullGacha);
    
    // 모드 선택 이벤트 리스너
    setupModeSelection();
    
    // 주관식 입력 제출 이벤트
    UI.btnSubmitAnswer.addEventListener('click', handleSubjectiveSubmit);
    UI.quizInput.addEventListener('keypress', (e) => {
        if(e.key === 'Enter') handleSubjectiveSubmit();
    });
    
    // 인게임 설정 모달 이벤트
    if(UI.btnOpenSettings) {
        UI.btnOpenSettings.addEventListener('click', () => {
            UI.settingsModal.classList.remove('hidden');
        });
    }
    if(UI.btnCloseSettings) {
        UI.btnCloseSettings.addEventListener('click', () => {
            UI.settingsModal.classList.add('hidden');
            generateQuiz(); // 변경된 설정 즉시 반영
        });
    }
    
    // 시작 시 홈 스크린 표시, 메인 UI 숨김
    UI.homeScreen.classList.add('active');
    UI.mainUi.classList.add('hidden');
    
    // 처음 로드 시 모든 텍스트 이모지를 Twemoji로 변환
    applyTwemoji(document.body);
}

function handleSubjectiveSubmit() {
    const val = parseInt(UI.quizInput.value);
    if (!isNaN(val)) {
        handleAnswer(val === currentCorrectAnswer);
        UI.quizInput.value = '';
    } else {
        showToast("숫자를 입력해주세요!", "⚠️");
    }
}

// 모드 선택 UI 로직
function setupModeSelection() {
    const btnModeMixList = document.querySelectorAll('[data-bind="mode-mix"]');
    const btnModeSingleList = document.querySelectorAll('[data-bind="mode-single"]');
    const danSelectContainers = document.querySelectorAll('.dan-select');
    const danBtns = document.querySelectorAll('.dan-btn');
    
    // 유형 선택
    const typeBtns = document.querySelectorAll('[data-bind-type]');
    typeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const type = btn.getAttribute('data-bind-type');
            questionType = type;
            typeBtns.forEach(b => {
                if(b.getAttribute('data-bind-type') === type) {
                    b.classList.add('active');
                } else {
                    b.classList.remove('active');
                }
            });
        });
    });
    
    function setGameMode(mode) {
        gameMode = mode;
        if (mode === 'mix') {
            btnModeMixList.forEach(btn => btn.classList.add('active'));
            btnModeSingleList.forEach(btn => btn.classList.remove('active'));
            danSelectContainers.forEach(c => c.classList.add('hidden'));
        } else {
            btnModeSingleList.forEach(btn => btn.classList.add('active'));
            btnModeMixList.forEach(btn => btn.classList.remove('active'));
            danSelectContainers.forEach(c => c.classList.remove('hidden'));
            if (!document.querySelector('.dan-btn.active')) {
                setDan(2);
            }
        }
    }

    // 전체 랜덤 모드 선택
    btnModeMixList.forEach(btn => btn.addEventListener('click', () => setGameMode('mix')));
    
    // 특정 단 선택 모드
    btnModeSingleList.forEach(btn => btn.addEventListener('click', () => setGameMode('single')));
    
    function setDan(dan) {
        selectedDan = dan;
        danBtns.forEach(btn => {
            if (parseInt(btn.dataset.dan) === dan) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
    }

    // 단수 버튼 클릭
    danBtns.forEach(btn => {
        btn.addEventListener('click', () => setDan(parseInt(btn.dataset.dan)));
    });
}

// 게임 시작
function startGame() {
    // 상태 초기화
    player = {
        hp: 100, maxHp: 100, gold: 0, combo: 0, currentMonsterIndex: 0,
        unlockedMonsters: player.unlockedMonsters || [],
        inventory: player.inventory || []
    };
    
    // UI 전환
    UI.homeScreen.classList.remove('active');
    UI.mainUi.classList.remove('hidden');
    UI.mainUi.classList.add('active');
    
    switchTab('shop'); // 기본 탭은 상점
    updatePlayerUI();
    spawnMonster();
    renderInventory();
    renderEncyclopedia(); // 미리 렌더해놓기
}

function updatePlayerUI() {
    UI.hp.textContent = player.hp;
    UI.gold.textContent = player.gold;
}

// 몬스터 생성
function spawnMonster() {
    if (player.currentMonsterIndex >= monsterList.length) {
        showToast("축하합니다! 모든 몬스터를 물리쳤습니다!", "🎉");
        player.currentMonsterIndex = 0; 
    }
    
    const template = monsterList[player.currentMonsterIndex];
    currentMonster = { ...template, currentHp: template.hp };
    
    UI.monsterName.textContent = currentMonster.name;
    UI.monsterEmoji.textContent = currentMonster.emoji;
    applyTwemoji(UI.monsterEmoji); // 이모지 변환
    
    updateMonsterHpUI();
    generateQuiz();
}

function updateMonsterHpUI() {
    const percent = Math.max(0, (currentMonster.currentHp / currentMonster.hp) * 100);
    UI.monsterHpFill.style.width = percent + '%';
    UI.monsterHpText.textContent = `HP: ${currentMonster.currentHp}/${currentMonster.hp}`;
}

// 퀴즈 생성 로직
function generateQuiz() {
    let num1, num2;
    
    if (gameMode === 'single') {
        // 특정 단 선택 모드: 선택한 단수만 출제
        num1 = selectedDan;
        num2 = Math.floor(Math.random() * 9) + 1; // 1 ~ 9
    } else {
        // 전체 랜덤 모드: 2~9단 무작위
        num1 = Math.floor(Math.random() * 8) + 2; // 2 ~ 9단
        num2 = Math.floor(Math.random() * 9) + 1; // 1 ~ 9
    }
    
    currentCorrectAnswer = num1 * num2;
    
    UI.quizQuestion.textContent = `${num1} × ${num2} = ?`;
    
    // 유형 확인 및 설정
    if (questionType === 'mixed') {
        currentQuestionMode = Math.random() > 0.5 ? 'multiple' : 'subjective';
    } else {
        currentQuestionMode = questionType;
    }

    if (currentQuestionMode === 'multiple') {
        UI.quizOptions.classList.remove('hidden');
        UI.quizInputArea.classList.add('hidden');

        // 오답 3개 생성
        let options = new Set();
        options.add(currentCorrectAnswer);
        
        while(options.size < 4) {
            let wrongNum1, wrongNum2;
            if (gameMode === 'single') {
                // 같은 단에서 오답 생성 (더 헷갈리게)
                wrongNum1 = selectedDan;
                wrongNum2 = Math.floor(Math.random() * 9) + 1;
            } else {
                wrongNum1 = Math.floor(Math.random() * 8) + 2;
                wrongNum2 = Math.floor(Math.random() * 9) + 1;
            }
            let wrongAnswer = wrongNum1 * wrongNum2;
            if (wrongAnswer !== currentCorrectAnswer) {
                options.add(wrongAnswer);
            }
        }
        
        // 배열로 변환 후 셔플
        let optionsArray = Array.from(options).sort(() => Math.random() - 0.5);
        
        // UI 렌더링
        UI.quizOptions.innerHTML = '';
        optionsArray.forEach(opt => {
            let btn = document.createElement('button');
            btn.classList.add('option-btn');
            btn.textContent = opt;
            btn.onclick = () => handleAnswer(opt === currentCorrectAnswer);
            UI.quizOptions.appendChild(btn);
        });
    } else {
        // 주관식
        UI.quizOptions.classList.add('hidden');
        UI.quizInputArea.classList.remove('hidden');
        UI.quizInput.value = '';
        setTimeout(() => UI.quizInput.focus(), 50);
    }
    
    // 현재 모드 배지 업데이트
    updateModeBadge();
}

// 현재 모드 표시 배지
function updateModeBadge() {
    let badge = document.getElementById('mode-badge');
    if (!badge) {
        badge = document.createElement('div');
        badge.id = 'mode-badge';
        badge.className = 'mode-badge';
        document.querySelector('.top-bar').appendChild(badge);
    }
    if (gameMode === 'single') {
        badge.textContent = `🎯 ${selectedDan}단`;
    } else {
        badge.textContent = '🔀 전체';
    }
    applyTwemoji(badge); // 이모지 변환
}

// 정답/오답 처리
function handleAnswer(isCorrect) {
    if(isCorrect) {
        // 정답
        playSound('sfx-correct');
        player.combo++;
        
        let damage = 10;
        let isCrit = false;
        
        // 콤보 보너스
        if (player.combo >= 3) {
            damage = 25;
            isCrit = true;
            UI.comboText.textContent = `${player.combo} Combo!`;
            UI.comboText.classList.remove('hidden');
        } else {
            UI.comboText.classList.add('hidden');
        }
        
        // 데미지 처리
        currentMonster.currentHp -= damage;
        showDamageText(damage, isCrit);
        
        // 몬스터 흔들림 애니메이션 리셋
        UI.monsterEmoji.classList.remove('anim-shake');
        void UI.monsterEmoji.offsetWidth; 
        UI.monsterEmoji.classList.add('anim-shake');
        
        updateMonsterHpUI();
        
        if(currentMonster.currentHp <= 0) {
            defeatMonster();
        } else {
            generateQuiz();
        }
    } else {
        // 오답
        playSound('sfx-wrong');
        player.combo = 0;
        UI.comboText.classList.add('hidden');
        
        player.hp -= 15;
        showDamageText("오답!", false, true);
        
        // 앱 배경 전체 빨갛게 피격효과
        UI.app.classList.add('anim-screen-red');
        setTimeout(() => UI.app.classList.remove('anim-screen-red'), 400);
        
        if (player.hp <= 0) {
            player.hp = 0;
            updatePlayerUI();
            showToast("체력이 다했습니다! 게임 오버!", "☠️");
            
            // 홈화면으로 복귀 (토스트 표시 후 약간 딜레이)
            setTimeout(() => {
                UI.mainUi.classList.add('hidden');
                UI.mainUi.classList.remove('active');
                UI.homeScreen.classList.add('active');
            }, 1000);
            return;
        }
        updatePlayerUI();
        generateQuiz(); 
    }
}

function showDamageText(text, isCrit = false, isPlayerHurt = false) {
    UI.damageText.textContent = isPlayerHurt ? text : (isCrit ? `CRITICAL -${text}!!` : `-${text}`);
    UI.damageText.className = 'damage-text anim-damage';
    if(isCrit) UI.damageText.classList.add('critical');
    
    setTimeout(() => {
        UI.damageText.classList.remove('anim-damage');
        UI.damageText.style.opacity = '0';
    }, 1000);
}

// 몬스터 처치
function defeatMonster() {
    player.gold += currentMonster.goldDrop;
    
    // 도감 등록
    if(!player.unlockedMonsters.includes(currentMonster.id)) {
        player.unlockedMonsters.push(currentMonster.id);
        renderEncyclopedia(); // 실시간 도감 업데이트
        
        // 커스텀 알림 배너
        showToast(`새로운 몬스터 [${currentMonster.name}]를 기록했습니다!`, "📖");
    }
    
    player.currentMonsterIndex++;
    updatePlayerUI();
    
    // 다음 몬스터 출현 (잠시 대기 후)
    setTimeout(() => {
        spawnMonster();
    }, 1000);
}

// 상점 - 가챠 뽑기 로직
function pullGacha() {
    const cost = 100;
    if(player.gold < cost) {
        showToast("골드가 부족합니다! (100골드 필요)", "🪙");
        return;
    }
    
    // 비용 차감
    player.gold -= cost;
    updatePlayerUI();
    playSound('sfx-gacha');
    
    // 뽑기 애니메이션
    UI.gachaResult.classList.remove('hidden');
    UI.gachaResult.innerHTML = '<div class="gacha-emoji">⏱️</div>';
    applyTwemoji(UI.gachaResult);
    
    UI.gachaResult.classList.remove('anim-shake');
    void UI.gachaResult.offsetWidth; 
    UI.gachaResult.classList.add('anim-shake');
    
    // 결과 도출 (1초 뒤)
    setTimeout(() => {
        const randomItem = gachaItems[Math.floor(Math.random() * gachaItems.length)];
        UI.gachaResult.innerHTML = `
            <div class="gacha-emoji">${randomItem.emoji}</div>
            <div class="gacha-text">${randomItem.name} 획득!</div>
        `;
        applyTwemoji(UI.gachaResult);
        
        player.inventory.push(randomItem.emoji);
        renderInventory();
    }, 1000);
}

function renderInventory() {
    UI.inventoryList.innerHTML = '';
    player.inventory.forEach((emoji, index) => {
        const div = document.createElement('div');
        div.className = 'item-slot';
        div.textContent = emoji;
        div.onclick = () => useItem(index);
        UI.inventoryList.appendChild(div);
    });
    applyTwemoji(UI.inventoryList);
}

function useItem(index) {
    const itemEmoji = player.inventory[index];
    const itemData = gachaItems.find(i => i.emoji === itemEmoji);

    if (itemData) {
        if (itemData.type === '포션') {
            const healAmount = 30;
            player.hp = Math.min(player.maxHp, player.hp + healAmount);
            updatePlayerUI();
            showToast(`${itemData.name} 사용! 체력을 ${healAmount} 회복했습니다.`, '💚');
            
            // 소모
            player.inventory.splice(index, 1);
            renderInventory();
        } else {
            showToast(`${itemData.name} 장착 완료!`, itemData.emoji);
        }
    }
}

// 도감 렌더링 로직
function renderEncyclopedia() {
    UI.encyclopediaGrid.innerHTML = '';
    
    const maxMonsters = monsterList.length;
    const unlockedCount = player.unlockedMonsters.length;
    const rate = Math.floor((unlockedCount / maxMonsters) * 100);
    UI.collectionRate.textContent = rate;
    
    monsterList.forEach(m => {
        const isUnlocked = player.unlockedMonsters.includes(m.id);
        const div = document.createElement('div');
        div.className = 'monster-entry';
        
        if (isUnlocked) {
            div.innerHTML = `
                <div class="emoji">${m.emoji}</div>
                <strong>${m.name}</strong>
                <span class="monster-desc">${m.desc}</span>
            `;
        } else {
            div.className += ' locked';
            div.innerHTML = `
                <div class="emoji">❓</div>
                <strong>???</strong>
                <span class="monster-desc">아직 조우하지 못했습니다.</span>
            `;
        }
        UI.encyclopediaGrid.appendChild(div);
    });
    applyTwemoji(UI.encyclopediaGrid);
}

// 앱 시작
init();
