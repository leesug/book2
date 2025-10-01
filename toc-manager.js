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

/**
 * 챕터 ID로 제목 가져오기
 * @param {string} chapterId - 챕터 ID
 * @returns {string} 챕터 제목
 */
function getChapterTitle(chapterId) {
    if (!chapterId || !window.tableOfContents) return '';
    
    // 1단계: 최상위 레벨
    if (window.tableOfContents[chapterId]) {
        return window.tableOfContents[chapterId].title;
    }
    
    // 2단계: children 탐색
    for (const parentKey of Object.keys(window.tableOfContents)) {
        const parent = window.tableOfContents[parentKey];
        if (parent.children && parent.children[chapterId]) {
            return parent.children[chapterId].title;
        }
        
        // 3단계: children의 children 탐색
        if (parent.children) {
            for (const childKey of Object.keys(parent.children)) {
                const child = parent.children[childKey];
                if (child.children && child.children[chapterId]) {
                    return child.children[chapterId].title;
                }
            }
        }
    }
    
    return '';
}

/**
 * 제목 업데이트 (tableOfContents 객체 수정)
 * @param {string} chapterId - 챕터 ID
 * @param {string} newTitle - 새 제목
 * @returns {boolean} 성공 여부
 */
function updateChapterTitle(chapterId, newTitle) {
    if (!chapterId || !newTitle || !window.tableOfContents) return false;
    
    // 1단계: 최상위 레벨
    if (window.tableOfContents[chapterId]) {
        window.tableOfContents[chapterId].title = newTitle;
        return true;
    }
    
    // 2단계: children 탐색
    for (const parentKey of Object.keys(window.tableOfContents)) {
        const parent = window.tableOfContents[parentKey];
        if (parent.children && parent.children[chapterId]) {
            parent.children[chapterId].title = newTitle;
            return true;
        }
        
        // 3단계: children의 children 탐색
        if (parent.children) {
            for (const childKey of Object.keys(parent.children)) {
                const child = parent.children[childKey];
                if (child.children && child.children[chapterId]) {
                    child.children[chapterId].title = newTitle;
                    return true;
                }
            }
        }
    }
    
    return false;
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
 * @returns {boolean} 성공 여부
 */
function saveChapterTitle() {
    const titleInput = document.getElementById('chapterTitleInput');
    if (!titleInput) return false;
    
    const newTitle = titleInput.value.trim();
    
    // 제목이 변경되었는지 확인
    if (newTitle && newTitle !== originalTitle) {
        if (updateChapterTitle(window.currentChapterId, newTitle)) {
            saveTOCToLocalStorage(); // localStorage에 저장
            console.log(`✅ 제목 업데이트: "${originalTitle}" → "${newTitle}"`);
            
            // 목차 트리 새로고침
            if (typeof window.renderChapterTree === 'function') {
                window.renderChapterTree();
            }
            
            return true;
        }
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
