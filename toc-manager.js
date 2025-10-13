/**
 * TOC Manager - 목차 관리 시스템
 * 제목 편집, 목차 CRUD, 레벨 변경 등 목차 관련 모든 기능 관리
 */

// ========== 전역 변수 ==========
let originalTitle = ''; // 편집 전 원본 제목 저장

// ========== 유틸리티 함수 ==========

/**
 * HTML 이스케이프 (XSS 방지)
 */
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * HTML 언이스케이프
 */
function unescapeHtml(html) {
    const div = document.createElement('div');
    div.innerHTML = html;
    return div.textContent;
}

// ========== 제목 관리 함수 ==========

// 챕터 맵 생성 함수
function buildChapterMap() {
    if (!window.chapterMap) {
        window.chapterMap = {};
    }
    
    window.chapterMap = {};
    
    if (!window.tableOfContents) {
        console.warn('⚠️ tableOfContents가 정의되지 않음');
        return;
    }
    
    function traverse(obj, prefix = '') {
        Object.keys(obj).forEach(key => {
            const chapter = obj[key];
            const fullId = prefix ? `${prefix}-${key}` : key;
            
            // 맵에 추가
            window.chapterMap[fullId] = {
                title: chapter.title,
                isSpecial: chapter.isSpecial,
                children: chapter.children,
                ref: chapter  // 원본 객체 참조 (업데이트용)
            };
            
            // 자식이 있으면 재귀 탐색
            if (chapter.children) {
                traverse(chapter.children, fullId);
            }
        });
    }
    
    traverse(window.tableOfContents);
    console.log('📋 챕터 맵 생성 완료:', Object.keys(window.chapterMap).length, '개');
}


/**
 * 챕터 ID로 제목 가져오기 (맵 방식)
 * @param {string} chapterId - 챕터 ID (예: "prologue", "prologue-p1", "part1-1-1")
 * @returns {string} 챕터 제목
 */
function getChapterTitle(chapterId) {
    if (!chapterId || !window.tableOfContents) return '';
    
    // 맵이 비어있으면 빌드
    if (!window.chapterMap || Object.keys(window.chapterMap).length === 0) {
        buildChapterMap();
    }
    
    const chapter = window.chapterMap[chapterId];
    if (chapter) {
        return chapter.title || '';
    }
    
    console.warn(`⚠️ 챕터를 찾을 수 없음: ${chapterId}`);
    return '';
}

/**
 * 제목 업데이트 (tableOfContents 객체 수정) - 맵 방식
 * @param {string} chapterId - 챕터 ID (예: "prologue", "prologue-p1", "part1-1-1")
 * @param {string} newTitle - 새 제목
 * @returns {boolean} 성공 여부
 */
function updateChapterTitle(chapterId, newTitle) {
    console.log('🔧 updateChapterTitle 시작');
    console.log('  - chapterId:', chapterId);
    console.log('  - newTitle:', newTitle);

    if (!chapterId || !newTitle || !window.tableOfContents) {
        console.error('❌ 유효하지 않은 입력:', {chapterId, newTitle, hasTableOfContents: !!window.tableOfContents});
        return false;
    }

    // 맵이 비어있으면 빌드
    if (!window.chapterMap || Object.keys(window.chapterMap || {}).length === 0) {
        console.log('  - chapterMap이 비어있음. 빌드 중...');
        buildChapterMap();
    }

    // buildChapterMap 후에도 undefined일 수 있으므로 안전하게 처리
    if (!window.chapterMap) {
        console.error('❌ chapterMap 생성 실패!');
        window.chapterMap = {};
    }

    console.log('  - chapterMap 키 목록:', Object.keys(window.chapterMap));
    console.log('  - chapterMap에서 찾기:', chapterId);

    // 맵에서 챕터 찾기
    const chapterInfo = window.chapterMap[chapterId];
    if (!chapterInfo || !chapterInfo.ref) {
        console.error(`❌ 챕터를 찾을 수 없음: ${chapterId}`);
        console.error('  - 사용 가능한 키:', Object.keys(window.chapterMap));

        // 직접 tableOfContents에서 찾아보기 (fallback)
        console.log('  - 대체 방법: tableOfContents에서 직접 검색');
        const chapter = findChapterById(chapterId);
        if (chapter) {
            console.log('  - tableOfContents에서 찾음!');
            chapter.title = newTitle;
            console.log(`✅ 제목 업데이트 성공 (대체 방법): ${chapterId} → "${newTitle}"`);

            // 맵 재생성
            buildChapterMap();
            return true;
        }

        return false;
    }

    // 제목 업데이트
    console.log(`  - 제목 업데이트 위치 찾음!`);
    console.log(`  - 이전 제목: "${chapterInfo.ref.title}"`);
    chapterInfo.ref.title = newTitle;
    console.log(`  - 새 제목: "${chapterInfo.ref.title}"`);
    console.log(`✅ 제목 업데이트 성공: ${chapterId} → "${newTitle}"`);

    // 맵도 업데이트
    chapterInfo.title = newTitle;

    return true;
}

/**
 * tableOfContents에서 직접 챕터 찾기 (fallback)
 * @param {string} chapterId - 챕터 ID
 * @returns {Object|null} 챕터 객체 또는 null
 */
function findChapterById(chapterId) {
    if (!window.tableOfContents) return null;

    console.log('🔍 findChapterById 시작:', chapterId);
    const parts = chapterId.split('-');
    console.log('  - 분할된 parts:', parts);

    let current = window.tableOfContents;

    for (let i = 0; i < parts.length; i++) {
        const part = parts[i];
        console.log(`  - 현재 part [${i}]:`, part);

        if (i === 0) {
            // 최상위 레벨 (예: "prologue", "part1")
            if (current[part]) {
                current = current[part];
                console.log('    → 최상위 레벨에서 찾음');
            } else {
                console.log('    → 찾을 수 없음');
                return null;
            }
        } else {
            // 하위 레벨 (children 내부)
            if (current.children && current.children[part]) {
                current = current.children[part];
                console.log('    → children에서 찾음');
            } else {
                console.log('    → children에서 찾을 수 없음');
                console.log('    → current.children:', current.children);
                return null;
            }
        }
    }

    console.log('✅ 챕터 찾기 성공:', current);
    return current;
}

/**
 * 제목 실시간 미리보기 (목차 업데이트)
 * @param {string} newTitle - 새 제목
 */
function previewTitleChange(newTitle) {
    if (!window.currentChapterId || !newTitle) return;
    
    // 목차 트리에서 해당 챕터 링크 찾기
    const linkElement = document.querySelector(`a[onclick*="${window.currentChapterId}"]`);
    if (!linkElement) return;
    
    // 텍스트 노드 업데이트 (아이콘 제외)
    const textNode = linkElement.childNodes[linkElement.childNodes.length - 1];
    if (textNode && textNode.nodeType === Node.TEXT_NODE) {
        textNode.textContent = ' ' + newTitle;
    }
}

// ========== localStorage 저장/로드 ==========

/**
 * 목차 데이터를 localStorage에 저장
 */
function saveTOCToLocalStorage() {
    try {
        if (!window.tableOfContents) {
            console.warn('⚠️ tableOfContents가 정의되지 않음');
            return;
        }
        localStorage.setItem('tableOfContents', JSON.stringify(window.tableOfContents));
        console.log('✅ 목차 데이터 저장 완료');
    } catch (error) {
        console.error('❌ 목차 저장 실패:', error);
    }
}

/**
 * localStorage에서 목차 데이터 로드
 * @returns {boolean} 로드 성공 여부
 */
function loadTOCFromLocalStorage() {
    try {
        const saved = localStorage.getItem('tableOfContents');
        if (saved) {
            const parsed = JSON.parse(saved);
            if (window.tableOfContents) {
                Object.assign(window.tableOfContents, parsed);
                console.log('✅ 목차 데이터 로드 완료');
                return true;
            }
        }
    } catch (error) {
        console.error('❌ 목차 로드 실패:', error);
    }
    return false;
}

// ========== 제목 입력 필드 생성 ==========

/**
 * 편집 모드용 제목 입력 필드 HTML 생성
 * @param {string} chapterId - 챕터 ID
 * @returns {string} HTML 문자열
 */
function createTitleEditorHTML(chapterId) {
    const currentTitle = getChapterTitle(chapterId);
    originalTitle = currentTitle; // 원본 제목 저장
    
    return `
        <div class="chapter-title-editor" style="margin-bottom: 20px; padding: 20px; background: #f8f9fa; border-radius: 8px; border-left: 4px solid #667eea;">
            <label style="display: block; font-weight: 600; color: #333; margin-bottom: 10px; font-size: 14px;">
                📝 챕터 제목
            </label>
            <input type="text" 
                   id="chapterTitleInput" 
                   value="${escapeHtml(currentTitle)}" 
                   placeholder="챕터 제목을 입력하세요"
                   style="width: 100%; padding: 12px 15px; font-size: 18px; font-weight: 600; border: 2px solid #e0e0e0; border-radius: 6px; transition: all 0.3s;"
                   oninput="previewTitleChange(this.value)"
                   onfocus="this.style.borderColor='#667eea'"
                   onblur="this.style.borderColor='#e0e0e0'">
            <small style="display: block; margin-top: 8px; color: #666;">
                💡 제목을 수정하면 왼쪽 목차도 함께 업데이트됩니다.
            </small>
        </div>
    `;
}

/**
 * 뷰 모드용 제목 표시 HTML 생성
 * @param {string} chapterId - 챕터 ID
 * @returns {string} HTML 문자열
 */
function createTitleViewHTML(chapterId) {
    const currentTitle = getChapterTitle(chapterId);
    
    return `
        <div class="chapter-title-view" style="margin-bottom: 30px; padding: 20px 0; border-bottom: 3px solid #667eea;">
            <h1 style="font-size: 28px; font-weight: 700; color: #333; margin: 0;">
                ${escapeHtml(currentTitle)}
            </h1>
        </div>
    `;
}

// ========== 저장 시 제목 처리 ==========

/**
 * 저장 시 제목 업데이트 및 저장
 * @param {string} chapterId - 챕터 ID
 * @returns {boolean} 성공 여부
 */
function saveChapterTitle(chapterId) {
    console.log('🔍 saveChapterTitle 시작');
    console.log('  - chapterId:', chapterId);
    console.log('  - originalTitle:', originalTitle);
    
    if (!chapterId) {
        console.error('❌ chapterId가 제공되지 않았습니다!');
        return false;
    }
    
    const titleInput = document.getElementById('chapterTitleInput');
    console.log('  - titleInput 존재:', !!titleInput);
    
    if (!titleInput) {
        console.warn('⚠️ titleInput을 찾을 수 없습니다!');
        return false;
    }
    
    const newTitle = titleInput.value.trim();
    console.log('  - newTitle:', newTitle);
    console.log('  - 제목 변경됨:', newTitle !== originalTitle);
    
    // 제목이 변경되었는지 확인
    if (newTitle && newTitle !== originalTitle) {
        console.log('✅ 제목이 변경되었습니다. 업데이트 시도...');
        
        if (updateChapterTitle(chapterId, newTitle)) {
            console.log('✅ updateChapterTitle 성공');
            
            saveTOCToLocalStorage(); // localStorage에 저장
            console.log(`✅ 제목 업데이트 완료: "${originalTitle}" → "${newTitle}"`);
            
            // 목차 트리 새로고침
            if (typeof window.renderChapterTree === 'function') {
                console.log('✅ 목차 트리 새로고침 중...');
                window.renderChapterTree();
            } else {
                console.warn('⚠️ renderChapterTree 함수를 찾을 수 없습니다!');
            }
            
            return true;
        } else {
            console.error('❌ updateChapterTitle 실패');
        }
    } else {
        console.log('ℹ️ 제목이 변경되지 않았거나 비어있습니다.');
    }
    
    return false;
}

// ========== 초기화 ==========

/**
 * 페이지 로드 시 초기화
 */
function initTOCManager() {
    console.log('🚀 TOC Manager 초기화');
    
    // localStorage에서 목차 로드
    loadTOCFromLocalStorage();
}

// DOM이 로드되면 초기화
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initTOCManager);
} else {
    initTOCManager();
}

// ========== 전역 스코프에 함수 노출 ==========
window.TOCManager = {
    getChapterTitle,
    updateChapterTitle,
    findChapterById,
    buildChapterMap,
    previewTitleChange,
    saveTOCToLocalStorage,
    loadTOCFromLocalStorage,
    createTitleEditorHTML,
    createTitleViewHTML,
    saveChapterTitle,
    escapeHtml,
    unescapeHtml
};

console.log('✅ TOC Manager 로드 완료');
