/**
 * 📝 편집기 개선 패치 v2.0
 * - 세련된 툴바 UI
 * - 본문 스타일 추가
 * - 구분선 (실선/점선)
 * - 표 삽입 (가로X세로 입력)
 * - 드래그드롭 완전 제거
 */

// CSS 스타일 주입
const improvedCSS = `
<style id="improved-editor-css">
    /* 툴바 스타일 오버라이드 */
    .toolbar {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
        padding: 15px !important;
        border-radius: 8px !important;
        gap: 10px !important;
        align-items: center !important;
        box-shadow: 0 2px 8px rgba(0,0,0,0.1) !important;
    }

    .toolbar-group {
        display: flex;
        gap: 5px;
        padding: 5px;
        background: rgba(255, 255, 255, 0.1);
        border-radius: 5px;
        border-left: 3px solid rgba(255, 255, 255, 0.3);
    }

    .toolbar-group-label {
        color: white;
        font-size: 11px;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        padding: 0 8px;
        display: flex;
        align-items: center;
        opacity: 0.8;
    }

    .toolbar button {
        padding: 8px 12px !important;
        border: 1px solid rgba(255, 255, 255, 0.3) !important;
        background: rgba(255, 255, 255, 0.9) !important;
        border-radius: 4px !important;
        font-weight: 500 !important;
        color: #333 !important;
        white-space: nowrap !important;
    }

    .toolbar button:hover {
        background: white !important;
        transform: translateY(-1px);
        box-shadow: 0 2px 5px rgba(0,0,0,0.15) !important;
    }

    .toolbar button.btn-image {
        background: linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%) !important;
        color: white !important;
        border: none !important;
    }

    .toolbar button.btn-image:hover {
        background: linear-gradient(135deg, #FF8E53 0%, #FF6B6B 100%) !important;
    }
</style>
`;

// DOM이 로드되면 CSS 주입
if (document.head) {
    document.head.insertAdjacentHTML('beforeend', improvedCSS);
} else {
    document.addEventListener('DOMContentLoaded', () => {
        document.head.insertAdjacentHTML('beforeend', improvedCSS);
    });
}

// 기존 enterEditMode 함수 백업
window.originalEnterEditMode = window.enterEditMode;

// 개선된 enterEditMode 함수로 오버라이드
window.enterEditMode = function(data) {
    isEditMode = true;
    originalContent = data.content;
    
    document.getElementById('editBtn').style.display = 'none';
    document.getElementById('saveBtn').style.display = 'inline-block';
    document.getElementById('cancelBtn').style.display = 'inline-block';

    const editorArea = document.getElementById('editorArea');
    editorArea.innerHTML = `
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
        ${renderAttachments(data.attachments || [], true)}
    `;

    // 드래그드롭 설정 제거됨! (사용자 요청)
};

// 기존 insertFormat 함수 백업
window.originalInsertFormat = window.insertFormat;

// 개선된 insertFormat 함수로 오버라이드
window.insertFormat = function(type) {
    const editor = document.getElementById('contentEditor');
    
    if (editor.contentEditable === 'true') {
        editor.focus();
        
        switch(type) {
            case 'p':
                document.execCommand('formatBlock', false, '<p>');
                break;
            case 'h1':
                document.execCommand('formatBlock', false, '<h1>');
                break;
            case 'h2':
                document.execCommand('formatBlock', false, '<h2>');
                break;
            case 'h3':
                document.execCommand('formatBlock', false, '<h3>');
                break;
            case 'hr-solid':
                document.execCommand('insertHTML', false, '<hr style="border: none; border-top: 2px solid #999; margin: 20px 0;"><p></p>');
                break;
            case 'hr-dashed':
                document.execCommand('insertHTML', false, '<hr style="border: none; border-top: 2px dashed #999; margin: 20px 0;"><p></p>');
                break;
            case 'table':
                // 기존 방식 유지 (하위 호환)
                const tableHTML = `<table>
    <tr>
        <th>헤더1</th>
        <th>헤더2</th>
        <th>헤더3</th>
    </tr>
    <tr>
        <td>데이터1</td>
        <td>데이터2</td>
        <td>데이터3</td>
    </tr>
</table><br>`;
                document.execCommand('insertHTML', false, tableHTML);
                break;
            case 'bold':
                document.execCommand('bold', false, null);
                break;
            case 'italic':
                document.execCommand('italic', false, null);
                break;
            case 'underline':
                document.execCommand('underline', false, null);
                break;
        }
    }
};

// 표 크기 입력받아 삽입하는 새 함수
window.insertTableWithSize = function() {
    const rows = prompt('행(세로) 개수를 입력하세요:', '3');
    const cols = prompt('열(가로) 개수를 입력하세요:', '3');
    
    if (rows === null || cols === null) return; // 취소
    
    const numRows = parseInt(rows);
    const numCols = parseInt(cols);
    
    if (isNaN(numRows) || isNaN(numCols) || numRows < 1 || numCols < 1) {
        alert('올바른 숫자를 입력해주세요.');
        return;
    }
    
    if (numRows > 20 || numCols > 10) {
        alert('표가 너무 큽니다. 행은 최대 20개, 열은 최대 10개까지 가능합니다.');
        return;
    }
    
    let tableHTML = '<table>\n';
    
    // 헤더 행
    tableHTML += '  <tr>\n';
    for (let j = 1; j <= numCols; j++) {
        tableHTML += `    <th>헤더${j}</th>\n`;
    }
    tableHTML += '  </tr>\n';
    
    // 데이터 행들
    for (let i = 1; i < numRows; i++) {
        tableHTML += '  <tr>\n';
        for (let j = 1; j <= numCols; j++) {
            tableHTML += `    <td>데이터${i}-${j}</td>\n`;
        }
        tableHTML += '  </tr>\n';
    }
    
    tableHTML += '</table><br>';
    
    const editor = document.getElementById('contentEditor');
    if (editor) {
        editor.focus();
        document.execCommand('insertHTML', false, tableHTML);
    }
};

console.log('✅ 편집기 개선 패치 v2.0 로드 완료!');
console.log('   - 세련된 툴바 UI ✓');
console.log('   - 본문 스타일 추가 ✓');
console.log('   - 구분선 (실선/점선) ✓');
console.log('   - 표 삽입 (크기 입력) ✓');
console.log('   - 드래그드롭 제거 ✓');

