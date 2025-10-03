/**
 * 음성 → 텍스트 변환 (Voice to Text)
 * OpenAI Whisper API를 사용하여 음성 파일을 텍스트로 변환
 */

class VoiceToText {
    constructor() {
        this.isProcessing = false;
        this.uploadBtn = null;
        this.fileInput = null;
    }

    /**
     * 초기화
     */
    init() {
        console.log('[VoiceToText] 초기화 시작...');
        
        // 버튼 생성 및 추가
        this.createUI();
        
        console.log('[VoiceToText] 초기화 완료!');
    }

    /**
     * UI 생성 (편집기 툴바에 버튼 추가)
     */
    createUI() {
        const toolbar = document.querySelector('.editor-toolbar');
        
        if (!toolbar) {
            console.error('[VoiceToText] 툴바를 찾을 수 없습니다.');
            return;
        }
        
        // 파일 입력 요소 생성 (숨김)
        this.fileInput = document.createElement('input');
        this.fileInput.type = 'file';
        this.fileInput.accept = 'audio/wav,audio/mp3,audio/mpeg,audio/m4a,audio/webm,audio/ogg,.wav,.mp3,.m4a,.webm,.ogg';
        this.fileInput.style.display = 'none';
        this.fileInput.id = 'voiceFileInput';
        document.body.appendChild(this.fileInput);
        
        // 이벤트 리스너
        this.fileInput.addEventListener('change', (e) => this.handleFileSelect(e));
        
        // 음성 입력 버튼 생성
        const voiceBtn = document.createElement('button');
        voiceBtn.className = 'toolbar-btn';
        voiceBtn.innerHTML = '🎤 음성 입력';
        voiceBtn.title = '음성 파일을 업로드하여 텍스트로 변환';
        voiceBtn.onclick = () => this.openFileDialog();
        
        // 삽입 그룹 찾기 (표, 이미지 버튼이 있는 곳)
        const insertGroup = Array.from(toolbar.querySelectorAll('.toolbar-group'))
            .find(group => group.querySelector('.toolbar-label')?.textContent.includes('📊 삽입'));
        
        if (insertGroup) {
            // 삽입 그룹에 추가
            insertGroup.appendChild(voiceBtn);
        } else {
            // 삽입 그룹이 없으면 툴바 끝에 추가
            toolbar.appendChild(voiceBtn);
        }
        
        this.uploadBtn = voiceBtn;
        
        console.log('[VoiceToText] UI 생성 완료');
    }

    /**
     * 파일 선택 다이얼로그 열기
     */
    openFileDialog() {
        if (this.isProcessing) {
            alert('음성 변환이 진행 중입니다. 잠시만 기다려주세요.');
            return;
        }
        
        this.fileInput.click();
    }

    /**
     * 파일 선택 처리
     */
    async handleFileSelect(event) {
        const file = event.target.files[0];
        
        if (!file) return;
        
        console.log('[VoiceToText] 선택된 파일:', file.name, file.type, file.size);
        
        // 파일 형식 검증
        const allowedExtensions = ['wav', 'mp3', 'm4a', 'webm', 'ogg'];
        const fileExtension = file.name.split('.').pop().toLowerCase();
        
        if (!allowedExtensions.includes(fileExtension)) {
            alert('지원하지 않는 파일 형식입니다.\n지원 형식: WAV, MP3, M4A, WebM, OGG');
            this.fileInput.value = '';
            return;
        }
        
        // 파일 크기 검증 (25MB)
        const maxSize = 25 * 1024 * 1024; // 25MB
        if (file.size > maxSize) {
            alert(`파일 크기가 너무 큽니다.\n최대 25MB까지 지원됩니다.\n(현재: ${(file.size / 1024 / 1024).toFixed(2)}MB)`);
            this.fileInput.value = '';
            return;
        }
        
        // 음성 변환 시작
        await this.transcribeAudio(file);
        
        // 입력 초기화
        this.fileInput.value = '';
    }

    /**
     * 음성 파일을 텍스트로 변환
     */
    async transcribeAudio(file) {
        if (this.isProcessing) return;
        
        this.isProcessing = true;
        this.showLoading(true);
        
        try {
            console.log('[VoiceToText] 음성 변환 시작...');
            
            // FormData 생성
            const formData = new FormData();
            formData.append('audio', file);
            
            // 서버에 전송
            const response = await fetch('/api/transcribe', {
                method: 'POST',
                body: formData
            });
            
            const result = await response.json();
            
            if (!response.ok || !result.success) {
                throw new Error(result.message || '음성 변환에 실패했습니다.');
            }
            
            console.log('[VoiceToText] 변환 성공!');
            console.log('[VoiceToText] 텍스트:', result.text);
            
            // 편집기에 텍스트 삽입
            this.insertTextToEditor(result.text);
            
            // 성공 메시지
            this.showSuccess('음성이 텍스트로 변환되었습니다!');
            
        } catch (error) {
            console.error('[VoiceToText] 오류:', error);
            alert(`음성 변환 실패: ${error.message}`);
        } finally {
            this.isProcessing = false;
            this.showLoading(false);
        }
    }

    /**
     * 변환된 텍스트를 편집기에 삽입
     */
    insertTextToEditor(text) {
        const editor = document.getElementById('editor');
        
        if (!editor) {
            console.error('[VoiceToText] 편집기를 찾을 수 없습니다.');
            return;
        }
        
        // 현재 커서 위치에 텍스트 삽입
        editor.focus();
        
        // 선택 영역 가져오기
        const selection = window.getSelection();
        const range = selection.getRangeAt(0);
        
        // 텍스트 노드 생성
        const textNode = document.createTextNode('\n' + text + '\n');
        
        // 삽입
        range.deleteContents();
        range.insertNode(textNode);
        
        // 커서를 삽입된 텍스트 끝으로 이동
        range.setStartAfter(textNode);
        range.setEndAfter(textNode);
        selection.removeAllRanges();
        selection.addRange(range);
        
        console.log('[VoiceToText] 텍스트 삽입 완료');
        
        // 편집기 내용 변경 이벤트 트리거
        editor.dispatchEvent(new Event('input', { bubbles: true }));
    }

    /**
     * 로딩 상태 표시
     */
    showLoading(show) {
        if (!this.uploadBtn) return;
        
        if (show) {
            this.uploadBtn.disabled = true;
            this.uploadBtn.innerHTML = '⏳ 변환 중...';
            this.uploadBtn.style.opacity = '0.6';
            this.uploadBtn.style.cursor = 'not-allowed';
        } else {
            this.uploadBtn.disabled = false;
            this.uploadBtn.innerHTML = '🎤 음성 입력';
            this.uploadBtn.style.opacity = '';
            this.uploadBtn.style.cursor = '';
        }
    }

    /**
     * 성공 메시지 표시
     */
    showSuccess(message) {
        // 간단한 알림 (나중에 toast 알림으로 개선 가능)
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 80px;
            right: 20px;
            background: #4CAF50;
            color: white;
            padding: 15px 25px;
            border-radius: 8px;
            box-shadow: 0 4px 10px rgba(0,0,0,0.2);
            z-index: 10000;
            font-size: 14px;
            animation: slideInRight 0.3s ease;
        `;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        // 3초 후 제거
        setTimeout(() => {
            notification.style.animation = 'fadeOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
}

// 전역 인스턴스 생성
const voiceToText = new VoiceToText();

// DOM 로드 완료 후 초기화
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        voiceToText.init();
    });
} else {
    voiceToText.init();
}

// 전역 접근을 위한 export
window.voiceToText = voiceToText;
