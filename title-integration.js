/**
 * Title Integration Script
 * index.html의 함수들을 오버라이드하여 제목 편집 기능 추가
 */

console.log('📝 Title Integration Script 로드 시작...');

// 페이지 로드 완료 후 실행
window.addEventListener('DOMContentLoaded', () => {
    console.log('✅ DOM 로드 완료, 함수 오버라이드 시작');
    
    // 원본 함수 백업
    const originalRenderViewMode = window.renderViewMode;
    const originalEnterEditMode = window.enterEditMode;
    const originalSaveContent = window.saveContent;

    /**
     * 🔄 renderViewMode 오버라이드 - 뷰 모드에 제목 표시
     */
    window.renderViewMode = function(data) {
        console.log('🎯 renderViewMode 호출 (제목 통합 버전)');
        
        window.isEditMode = false;
        document.getElementById('editBtn').style.display = 'inline-block';
        document.getElementById('saveBtn').style.display = 'none';
        document.getElementById('cancelBtn').style.display = 'none';

        const editorArea = document.getElementById('editorArea');
        
        // 제목 HTML 생성 (TOC Manager 사용)
        console.log('🔍 뷰모드 디버깅:', {
            hasTOCManager: !!window.TOCManager,
            currentChapterId: window.currentChapterId || currentChapterId,
            hasCreateFunction: !!(window.TOCManager && window.TOCManager.createTitleViewHTML)
        });
        
        // currentChapterId는 전역 변수로 존재 (window 없이 접근)
        const chapterId = window.currentChapterId || currentChapterId;
        const titleHTML = window.TOCManager && chapterId
            ? window.TOCManager.createTitleViewHTML(chapterId) 
            : '';
        
        console.log('📝 제목 HTML 길이:', titleHTML.length);
        if (titleHTML.length === 0) {
            console.warn('⚠️ 제목 표시가 생성되지 않았습니다!', {chapterId});
        }
        
        editorArea.innerHTML = `
            ${titleHTML}
            <div class="view-mode">
                ${data.content}
            </div>
            ${window.renderAttachments ? window.renderAttachments(data.attachments || [], false) : ''}
        `;
        
        console.log('✅ 뷰 모드 렌더링 완료 (제목 포함)');
    };

    /**
     * 🔄 enterEditMode 오버라이드 - 편집 모드에 제목 입력 필드 추가
     */
    window.enterEditMode = function(data) {
        console.log('🎯 enterEditMode 호출 (제목 통합 버전)');
        
        window.isEditMode = true;
        window.originalContent = data.content;
        
        document.getElementById('editBtn').style.display = 'none';
        document.getElementById('saveBtn').style.display = 'inline-block';
        document.getElementById('cancelBtn').style.display = 'inline-block';

        const editorArea = document.getElementById('editorArea');
        
        // 제목 편집 HTML 생성 (TOC Manager 사용)
        console.log('🔍 디버깅:', {
            hasTOCManager: !!window.TOCManager,
            currentChapterId: window.currentChapterId || currentChapterId,
            hasCreateFunction: !!(window.TOCManager && window.TOCManager.createTitleEditorHTML)
        });
        
        // currentChapterId는 전역 변수로 존재 (window 없이 접근)
        const chapterId = window.currentChapterId || currentChapterId;
        const titleEditorHTML = window.TOCManager && chapterId
            ? window.TOCManager.createTitleEditorHTML(chapterId)
            : '';
        
        console.log('📝 제목 HTML 길이:', titleEditorHTML.length);
        if (titleEditorHTML.length === 0) {
            console.warn('⚠️ 제목 입력 필드가 생성되지 않았습니다!', {chapterId});
        }

        editorArea.innerHTML = `
            ${titleEditorHTML}
            <div class="toolbar">
                <!-- 텍스트 스타일 그룹 -->
                <div class="toolbar-group">
                    <span class="toolbar-group-label">📝 텍스트</span>
                    <button onclick="insertFormat('p')" title="본문">본문</button>
                    <button onclick="insertFormat('h1')" title="제목 1">제목 1</button>
                    <button onclick="insertFormat('h2')" title="제목 2">제목 2</button>
                    <button onclick="insertFormat('h3')" title="제목 3">제목 3</button>
                </div>

                <!-- 서식 그룹 -->
                <div class="toolbar-group">
                    <span class="toolbar-group-label">✏️ 서식</span>
                    <button onclick="insertFormat('bold')" title="굵게"><strong>B</strong></button>
                    <button onclick="insertFormat('italic')" title="기울임"><em>I</em></button>
                    <button onclick="insertFormat('underline')" title="밑줄"><u>U</u></button>
                </div>

                <!-- 구분선 그룹 -->
                <div class="toolbar-group">
                    <span class="toolbar-group-label">➖ 구분선</span>
                    <button onclick="insertFormat('hr-solid')" title="실선">━━━</button>
                    <button onclick="insertFormat('hr-dashed')" title="점선">┈┈┈</button>
                </div>

                <!-- 삽입 그룹 -->
                <div class="toolbar-group">
                    <span class="toolbar-group-label">📊 삽입</span>
                    <button onclick="insertTableWithSize()" title="표 삽입">📊 표</button>
                    <button onclick="document.getElementById('imageInput').click()" class="btn-image" title="이미지 삽입">🖼️ 이미지</button>
                    <input type="file" id="imageInput" accept="image/*" style="display: none;" onchange="insertImage(this)">
                </div>
            </div>
            <div id="contentEditor" contenteditable="true" class="content-editor-editable">${data.content || '<p>내용을 입력하세요...</p>'}</div>
            ${window.renderAttachments ? window.renderAttachments(data.attachments || [], true) : ''}
        `;

        // 드래그 앤 드롭 설정 제거

        
        console.log('✅ 편집 모드 진입 완료 (제목 입력 필드 포함)');
    };

    /**
     * 🔄 saveContent 오버라이드 - 저장 시 제목도 함께 저장
     */
    window.saveContent = async function() {
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('🎯 saveContent 호출 (제목 통합 버전)');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        
        // 1️⃣ 제목 저장 (TOC Manager 사용)
        console.log('1️⃣ 제목 저장 단계 시작');
        console.log('  - TOCManager 존재:', !!window.TOCManager);
        console.log('  - saveChapterTitle 함수 존재:', !!(window.TOCManager && typeof window.TOCManager.saveChapterTitle === 'function'));
        
        // currentChapterId는 전역 변수로 존재 (window 없이 접근)
        const chapterId = window.currentChapterId || currentChapterId;
        console.log('  - chapterId:', chapterId);
        
        if (window.TOCManager && typeof window.TOCManager.saveChapterTitle === 'function') {
            console.log('  - TOCManager.saveChapterTitle() 호출 중...');
            const titleSaved = window.TOCManager.saveChapterTitle(chapterId);
            console.log('  - 제목 저장 결과:', titleSaved);
            
            if (titleSaved) {
                console.log('✅ 챕터 제목 저장 완료');
            } else {
                console.log('ℹ️ 제목이 변경되지 않았거나 저장 실패');
            }
        } else {
            console.error('❌ TOCManager.saveChapterTitle을 찾을 수 없습니다!');
        }

        // 2️⃣ 내용 저장 (기존 로직)
        console.log('2️⃣ 내용 저장 단계 시작');
        const editor = document.getElementById('contentEditor');
        const content = editor.contentEditable === 'true' ? editor.innerHTML : editor.value;
        
        console.log('  - chapterId:', chapterId);
        console.log('  - content 길이:', content.length);
        
        const response = await fetch(`/api/chapters/${chapterId}`);
        const currentData = await response.json();

        try {
            const saveResponse = await fetch(`/api/chapters/${chapterId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    content: content,
                    attachments: currentData.attachments || []
                })
            });

            const result = await saveResponse.json();
            
            if (result.success) {
                if (typeof window.showMessage === 'function') {
                    window.showMessage('저장되었습니다.');
                }
                
                // 데이터 새로고침
                if (typeof window.loadChapterData === 'function') {
                    await window.loadChapterData();
                }
                if (typeof window.renderChapterTree === 'function') {
                    window.renderChapterTree();
                }
                if (typeof window.loadChapterContent === 'function') {
                    await window.loadChapterContent(chapterId);
                }
                
                console.log('✅ 내용 저장 완료');
                console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            } else {
                if (typeof window.showMessage === 'function') {
                    window.showMessage('저장에 실패했습니다.', true);
                }
                console.error('❌ 저장 실패:', result);
            }
        } catch (error) {
            console.error('❌ 저장 실패:', error);
            if (typeof window.showMessage === 'function') {
                window.showMessage('저장에 실패했습니다.', true);
            }
        }
    };

    console.log('✅ 모든 함수 오버라이드 완료!');
    console.log('📊 오버라이드된 함수:', {
        renderViewMode: typeof window.renderViewMode,
        enterEditMode: typeof window.enterEditMode,
        saveContent: typeof window.saveContent
    });

    // 🔥 중요: 저장 버튼 이벤트 리스너 다시 연결
    // 기존 이벤트 리스너는 원본 함수를 참조하고 있으므로 새로 연결해야 함
    const saveBtn = document.getElementById('saveBtn');
    if (saveBtn) {
        // 기존 리스너 제거를 위해 새 버튼으로 교체
        const newSaveBtn = saveBtn.cloneNode(true);
        saveBtn.parentNode.replaceChild(newSaveBtn, saveBtn);
        
        // 새 리스너 연결 (오버라이드된 함수 사용)
        newSaveBtn.addEventListener('click', window.saveContent);
        console.log('✅ 저장 버튼 이벤트 리스너 재연결 완료');
    } else {
        console.warn('⚠️ saveBtn을 찾을 수 없습니다');
    }
});
