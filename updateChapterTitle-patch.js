/**
 * toc-manager.js updateChapterTitle 함수 수정 패치
 * 
 * 사용법:
 * 1. toc-manager.js 파일을 열기
 * 2. 108-138번 라인 (// '-'로 분리하여 경로 탐색 부분)을 삭제
 * 3. 아래 코드로 교체
 */

// 교체할 코드 (108-138번 라인):
/*
    // 맵이 비어있으면 빌드
    if (!window.chapterMap || Object.keys(window.chapterMap).length === 0) {
        buildChapterMap();
    }
    
    // 맵에서 챕터 찾기
    const chapterInfo = window.chapterMap[chapterId];
    if (!chapterInfo || !chapterInfo.ref) {
        console.error(`❌ 챕터를 찾을 수 없음: ${chapterId}`);
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
*/
