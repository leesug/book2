/**
 * 모바일 반응형 UI 제어 스크립트
 * - 슬라이드 패널 (목차, 가이드)
 * - 오버레이 관리
 * - 터치 제스처 지원
 */

class MobileUI {
    constructor() {
        this.tocPanel = null;
        this.guidePanel = null;
        this.overlay = null;
        this.isInitialized = false;
    }

    /**
     * 초기화
     */
    init() {
        if (this.isInitialized) return;
        
        console.log('[MobileUI] 초기화 시작...');
        
        // DOM 요소 참조
        this.tocPanel = document.getElementById('tocSlidePanel');
        this.guidePanel = document.getElementById('guideSlidePanel');
        this.overlay = document.getElementById('slideOverlay');
        
        if (!this.tocPanel || !this.guidePanel || !this.overlay) {
            console.error('[MobileUI] 필수 DOM 요소를 찾을 수 없습니다.');
            return;
        }
        
        // 목차와 가이드 내용 복사
        this.copyTocContent();
        this.copyGuideContent();
        
        // 이벤트 리스너 등록
        this.attachEventListeners();
        
        this.isInitialized = true;
        console.log('[MobileUI] 초기화 완료!');
    }

    /**
     * 목차 내용을 슬라이드 패널에 복사
     */
    copyTocContent() {
        const chapterTree = document.getElementById('chapterTree');
        const tocPanelContent = document.getElementById('tocPanelContent');
        const tocManageBtn = document.getElementById('tocManageBtn');
        const addChapterArea = document.getElementById('addChapterArea');
        const collapseAllBtn = document.getElementById('collapseAllBtn');
        
        if (!chapterTree || !tocPanelContent) {
            console.error('[MobileUI] 목차 영역을 찾을 수 없습니다.');
            return;
        }
        
        // 패널 초기화
        tocPanelContent.innerHTML = '';
        
        // 목차 관리 버튼 복사
        if (tocManageBtn) {
            const clonedManageBtn = tocManageBtn.cloneNode(true);
            clonedManageBtn.id = 'mobileTocManageBtn';
            clonedManageBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('[MobileUI] 목차 관리 버튼 클릭');
                tocManageBtn.click();
                setTimeout(() => {
                    console.log('[MobileUI] 목차 관리 모드 전환 후 패널 업데이트');
                    this.copyTocContent();
                }, 200);
            });
            tocPanelContent.appendChild(clonedManageBtn);
        }
        
        // 새 챕터 추가 영역 복사 (관리 모드일 때만 보임)
        if (addChapterArea) {
            const clonedAddArea = addChapterArea.cloneNode(true);
            clonedAddArea.id = 'mobileAddChapterArea';
            tocPanelContent.appendChild(clonedAddArea);
        }
        
        // 모두 접기 버튼 복사
        if (collapseAllBtn) {
            const btnContainer = document.createElement('div');
            btnContainer.style.cssText = 'margin-bottom: 15px; text-align: right;';
            const clonedCollapseBtn = collapseAllBtn.cloneNode(true);
            clonedCollapseBtn.id = 'mobileCollapseAllBtn';
            
            // 모두 접기/펼치기 기능 직접 구현
            clonedCollapseBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                const mobileTree = document.getElementById('mobileChapterTree');
                if (!mobileTree) return;
                
                const allToggleBtns = mobileTree.querySelectorAll('.toggle-btn');
                const allSubChapters = mobileTree.querySelectorAll('.sub-chapter');
                
                // 현재 상태 확인 (하나라도 expanded면 모두 접기)
                const hasExpanded = Array.from(allToggleBtns).some(btn => 
                    btn.classList.contains('expanded')
                );
                
                if (hasExpanded) {
                    // 모두 접기
                    allToggleBtns.forEach(btn => {
                        btn.classList.remove('expanded');
                        btn.classList.add('collapsed');
                    });
                    allSubChapters.forEach(sub => {
                        sub.style.maxHeight = '0';
                        sub.style.opacity = '0';
                    });
                    clonedCollapseBtn.textContent = '+ 모두 펼치기';
                } else {
                    // 모두 펼치기
                    allToggleBtns.forEach(btn => {
                        btn.classList.remove('collapsed');
                        btn.classList.add('expanded');
                    });
                    allSubChapters.forEach(sub => {
                        sub.style.maxHeight = '5000px';
                        sub.style.opacity = '1';
                    });
                    clonedCollapseBtn.textContent = '− 모두 접기';
                }
            });
            
            btnContainer.appendChild(clonedCollapseBtn);
            tocPanelContent.appendChild(btnContainer);
        }
        
        // chapter-tree의 내용을 복제
        const clonedTree = chapterTree.cloneNode(true);
        clonedTree.id = 'mobileChapterTree';
        
        // 패널에 삽입
        tocPanelContent.appendChild(clonedTree);
        
        // 복사된 목차에 이벤트 직접 연결
        this.attachMobileTocEvents(clonedTree);
        
        console.log('[MobileUI] 목차 내용 복사 완료:', clonedTree.children.length, '개 항목');
    }
    
    /**
     * 모바일 목차에 이벤트 연결
     */
    attachMobileTocEvents(treeElement) {
        // 1. 모든 토글 버튼에 이벤트 연결
        const toggleBtns = treeElement.querySelectorAll('.toggle-btn');
        toggleBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                const chapterItem = btn.closest('.chapter-item');
                if (!chapterItem) return;
                
                const subChapter = chapterItem.querySelector('.sub-chapter');
                if (!subChapter) return;
                
                const isExpanded = btn.classList.contains('expanded');
                
                if (isExpanded) {
                    // 접기
                    btn.classList.remove('expanded');
                    btn.classList.add('collapsed');
                    subChapter.style.maxHeight = '0';
                    subChapter.style.opacity = '0';
                } else {
                    // 펼치기
                    btn.classList.remove('collapsed');
                    btn.classList.add('expanded');
                    subChapter.style.maxHeight = '5000px';
                    subChapter.style.opacity = '1';
                }
            });
        });
        
        // 2. 모든 목차 링크에 이벤트 연결
        const chapterLinks = treeElement.querySelectorAll('.chapter-link');
        chapterLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                const chapterId = link.getAttribute('data-id');
                if (!chapterId) return;
                
                console.log('[MobileUI] 목차 클릭:', chapterId);
                
                // 원본 링크 찾아서 클릭
                const originalLink = document.querySelector(`.sidebar .chapter-link[data-id="${chapterId}"]`);
                if (originalLink) {
                    originalLink.click();
                }
                
                // 패널 닫기
                setTimeout(() => this.closeTocPanel(), 300);
            });
        });
        
        // 3. 모든 액션 버튼에 이벤트 연결 (목차 관리 모드)
        const actionBtns = treeElement.querySelectorAll('.chapter-action-btn');
        actionBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                const action = btn.getAttribute('data-action');
                const chapterId = btn.getAttribute('data-id');
                
                if (!action || !chapterId) return;
                
                console.log('[MobileUI] 액션 버튼 클릭:', action, chapterId);
                
                // 원본 버튼 찾아서 클릭
                const originalBtn = document.querySelector(
                    `.sidebar .chapter-action-btn[data-action="${action}"][data-id="${chapterId}"]`
                );
                
                if (originalBtn) {
                    originalBtn.click();
                    // 목차 업데이트
                    setTimeout(() => this.refreshTocContent(), 300);
                }
            });
        });
    }

    /**
     * 가이드 내용을 슬라이드 패널에 복사
     */
    copyGuideContent() {
        const guidePanel = document.getElementById('guidePanel');
        const guidePanelContent = document.getElementById('guidePanelContent');
        
        if (!guidePanel || !guidePanelContent) {
            console.error('[MobileUI] 가이드 영역을 찾을 수 없습니다.');
            return;
        }
        
        // 가이드 패널의 내용을 복제하여 슬라이드 패널에 삽입
        const clonedContent = guidePanel.cloneNode(true);
        
        // 클래스 제거 (스타일 충돌 방지)
        clonedContent.className = '';
        clonedContent.id = '';
        
        // 패널에 삽입
        guidePanelContent.innerHTML = '';
        guidePanelContent.appendChild(clonedContent);
        
        console.log('[MobileUI] 가이드 내용 복사 완료');
    }

    /**
     * 이벤트 리스너 등록
     */
    attachEventListeners() {
        // 목차 버튼
        const tocBtn = document.getElementById('mobileTocBtn');
        if (tocBtn) {
            tocBtn.addEventListener('click', () => this.openTocPanel());
        }

        // 가이드 버튼
        const guideBtn = document.getElementById('mobileGuideBtn');
        if (guideBtn) {
            guideBtn.addEventListener('click', () => this.openGuidePanel());
        }

        // 목차 패널 닫기 버튼
        const tocCloseBtn = document.getElementById('tocPanelClose');
        if (tocCloseBtn) {
            tocCloseBtn.addEventListener('click', () => this.closeTocPanel());
        }

        // 가이드 패널 닫기 버튼
        const guideCloseBtn = document.getElementById('guidePanelClose');
        if (guideCloseBtn) {
            guideCloseBtn.addEventListener('click', () => this.closeGuidePanel());
        }

        // 오버레이 클릭 시 패널 닫기
        if (this.overlay) {
            this.overlay.addEventListener('click', () => this.closeAllPanels());
        }

        // ESC 키로 패널 닫기
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeAllPanels();
            }
        });
    }

    /**
     * 목차 패널 열기
     */
    openTocPanel() {
        console.log('[MobileUI] 목차 패널 열기');
        
        if (this.tocPanel) {
            this.tocPanel.classList.add('active');
        }
        
        if (this.overlay) {
            this.overlay.classList.add('active');
        }
        
        // 가이드 패널이 열려있으면 닫기
        this.closeGuidePanel();
        
        // 스크롤 방지
        document.body.style.overflow = 'hidden';
    }

    /**
     * 목차 패널 닫기
     */
    closeTocPanel() {
        console.log('[MobileUI] 목차 패널 닫기');
        
        if (this.tocPanel) {
            this.tocPanel.classList.remove('active');
        }
        
        if (this.overlay) {
            this.overlay.classList.remove('active');
        }
        
        // 스크롤 허용
        document.body.style.overflow = '';
    }

    /**
     * 가이드 패널 열기
     */
    openGuidePanel() {
        console.log('[MobileUI] 가이드 패널 열기');
        
        if (this.guidePanel) {
            this.guidePanel.classList.add('active');
        }
        
        if (this.overlay) {
            this.overlay.classList.add('active');
        }
        
        // 목차 패널이 열려있으면 닫기
        this.closeTocPanel();
        
        // 스크롤 방지
        document.body.style.overflow = 'hidden';
    }

    /**
     * 가이드 패널 닫기
     */
    closeGuidePanel() {
        console.log('[MobileUI] 가이드 패널 닫기');
        
        if (this.guidePanel) {
            this.guidePanel.classList.remove('active');
        }
        
        if (this.overlay) {
            this.overlay.classList.remove('active');
        }
        
        // 스크롤 허용
        document.body.style.overflow = '';
    }

    /**
     * 모든 패널 닫기
     */
    closeAllPanels() {
        this.closeTocPanel();
        this.closeGuidePanel();
    }

    /**
     * 목차 항목 클릭 시 자동 닫기 설정 (Deprecated - attachMobileTocEvents에서 처리)
     */
    setupTocAutoClose() {
        // 이 함수는 더 이상 사용하지 않습니다.
        // 모든 이벤트는 attachMobileTocEvents에서 처리됩니다.
    }

    /**
     * 현재 화면 크기가 모바일인지 확인
     */
    isMobile() {
        return window.innerWidth <= 768;
    }

    /**
     * 리사이즈 시 자동 처리
     */
    handleResize() {
        // 데스크톱으로 전환 시 모든 패널 닫기
        if (!this.isMobile()) {
            this.closeAllPanels();
        }
    }
    
    /**
     * 목차 업데이트 (새 챕터 추가, 삭제, 수정 시 호출)
     */
    refreshTocContent() {
        if (this.isInitialized) {
            console.log('[MobileUI] 목차 업데이트 중...');
            this.copyTocContent();
        }
    }
}

// 전역 인스턴스 생성
const mobileUI = new MobileUI();

// DOM 로드 완료 후 초기화 (목차 생성 대기)
document.addEventListener('DOMContentLoaded', () => {
    // 목차가 생성될 때까지 대기 후 초기화
    const initMobileUI = () => {
        const chapterTree = document.getElementById('chapterTree');
        
        // 목차가 생성되었는지 확인
        if (chapterTree && chapterTree.children.length > 0) {
            console.log('[MobileUI] 목차 발견! 초기화 시작...');
            mobileUI.init();
        } else {
            console.log('[MobileUI] 목차 생성 대기 중... (재시도)');
            // 100ms 후 재시도
            setTimeout(initMobileUI, 100);
        }
    };
    
    // 초기화 시작
    initMobileUI();
    
    // 리사이즈 이벤트 처리
    window.addEventListener('resize', () => {
        mobileUI.handleResize();
    });
});

// 전역 접근을 위한 export
window.mobileUI = mobileUI;
