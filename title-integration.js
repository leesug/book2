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
            currentChapterId: window.currentChapterId,
            hasCreateFunction: !!(window.TOCManager && window.TOCManager.createTitleViewHTML)
        });
        
        const titleHTML = window.TOCManager && window.currentChapterId 
            ? window.TOCManager.createTitleViewHTML(window.currentChapterId) 
            : '';
        
        console.log('📝 제목 HTML 길이:', titleHTML.length);
        if (titleHTML.length === 0) {
            console.warn('⚠️ 제목 표시가 생성되지 않았습니다!');
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
            currentChapterId: window.currentChapterId,
            hasCreateFunction: !!(window.TOCManager && window.TOCManager.createTitleEditorHTML)
        });
        
        const titleEditorHTML = window.TOCManager && window.currentChapterId
            ? window.TOCManager.createTitleEditorHTML(window.currentChapterId)
            : '';
        
        console.log('📝 제목 HTML 길이:', titleEditorHTML.length);
        if (titleEditorHTML.length === 0) {
            console.warn('⚠️ 제목 입력 필드가 생성되지 않았습니다!');
        }

        editorArea.innerHTML = `
            ${titleEditorHTML}
            <div class="toolbar">
                <button onclick="insertFormat('h1')">제목 1</button>
                <button onclick="insertFormat('h2')">제목 2</button>
                <button onclick="insertFormat('h3')">제목 3</button>
                <button onclick="insertFormat('hr')">구분선</button>
                <button onclick="insertFormat('table')">표 삽입</button>
                <button onclick="insertFormat('bold')">굵게</button>
                <button onclick="insertFormat('italic')">기울임</button>
                <button onclick="document.getElementById('imageInput').click()" style="background: #FF9800; color: white;">🖼️ 이미지</button>
                <input type="file" id="imageInput" accept="image/*" style="display: none;" onchange="insertImage(this)">
            </div>
            <div id="editorWrapper" style="position: relative;">
                <div id="contentEditor" contenteditable="true" class="content-editor-editable">${data.content || '<p>내용을 입력하세요...</p>'}</div>
                <div id="dropOverlay" style="display: none; position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: rgba(76, 175, 80, 0.1); border: 3px dashed #4CAF50; border-radius: 5px; display: flex; align-items: center; justify-content: center; pointer-events: none;">
                    <div style="background: white; padding: 30px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                        <h3 style="color: #4CAF50; margin: 0;">🖼️ 이미지를 여기에 드롭하세요</h3>
                    </div>
                </div>
            </div>
            ${window.renderAttachments ? window.renderAttachments(data.attachments || [], true) : ''}
        `;

        // 드래그 앤 드롭 설정
        if (typeof window.setupDragAndDrop === 'function') {
            window.setupDragAndDrop();
        }
        
        console.log('✅ 편집 모드 진입 완료 (제목 입력 필드 포함)');
    };

    /**
     * 🔄 saveContent 오버라이드 - 저장 시 제목도 함께 저장
     */
    window.saveContent = async function() {
        console.log('🎯 saveContent 호출 (제목 통합 버전)');
        
        // 1️⃣ 제목 저장 (TOC Manager 사용)
        if (window.TOCManager && typeof window.TOCManager.saveChapterTitle === 'function') {
            const titleSaved = window.TOCManager.saveChapterTitle();
            if (titleSaved) {
                console.log('✅ 챕터 제목 저장 완료');
            }
        }

        // 2️⃣ 내용 저장 (기존 로직)
        const editor = document.getElementById('contentEditor');
        const content = editor.contentEditable === 'true' ? editor.innerHTML : editor.value;
        
        const response = await fetch(`/api/chapters/${window.currentChapterId}`);
        const currentData = await response.json();

        try {
            const saveResponse = await fetch(`/api/chapters/${window.currentChapterId}`, {
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
                    await window.loadChapterContent(window.currentChapterId);
                }
                
                console.log('✅ 내용 저장 완료');
            } else {
                if (typeof window.showMessage === 'function') {
                    window.showMessage('저장에 실패했습니다.', true);
                }
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
});
