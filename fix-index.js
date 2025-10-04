const fs = require('fs');
const path = require('path');

// 파일 경로
const indexPath = path.join(__dirname, 'index.html');

console.log('📝 index.html 수정 시작...');

// 파일 읽기
let content = fs.readFileSync(indexPath, 'utf8');

// 수정 1: 일반 모드 renderChapterTree의 최상위 레벨 링크에 data-id 추가 (라인 1503-1506)
content = content.replace(
    /const link = document\.createElement\('a'\);\s*link\.className = 'chapter-link' \+ \(chapterData\[key\]\?\.content \? ' has-content' : ''\);\s*link\.textContent = chapter\.title;\s*link\.onclick = \(\) => selectChapter\(key\);/g,
    `const link = document.createElement('a');
                link.className = 'chapter-link' + (chapterData[key]?.content ? ' has-content' : '');
                link.textContent = chapter.title;
                link.setAttribute('data-id', key);
                link.onclick = () => selectChapter(key);`
);

// 수정 2: 하위 챕터 renderSubChapters의 링크에도 data-id 추가 (라인 1552-1555)
content = content.replace(
    /const link = document\.createElement\('a'\);\s*link\.className = 'chapter-link' \+ \(chapterData\[fullKey\]\?\.content \? ' has-content' : ''\);\s*link\.textContent = child\.title;\s*link\.onclick = \(\) => selectChapter\(fullKey\);/g,
    `const link = document.createElement('a');
                link.className = 'chapter-link' + (chapterData[fullKey]?.content ? ' has-content' : '');
                link.textContent = child.title;
                link.setAttribute('data-id', fullKey);
                link.onclick = () => selectChapter(fullKey);`
);

// 파일 저장
fs.writeFileSync(indexPath, content, 'utf8');

console.log('✅ index.html 수정 완료!');
console.log('\n수정 내용:');
console.log('1. 일반 모드 목차 링크에 data-id 속성 추가');
console.log('2. 하위 챕터 링크에 data-id 속성 추가');
