const fs = require('fs');
const path = require('path');

// 파일 경로
const mobileUIPath = path.join(__dirname, 'mobile-ui.js');

console.log('📝 mobile-ui.js 개선 시작...');

// 파일 읽기
let content = fs.readFileSync(mobileUIPath, 'utf8');

// 수정 1: 목차 관리 버튼 클릭 시 업데이트 시간 증가 및 로깅 추가
content = content.replace(
    /clonedManageBtn\.addEventListener\('click', \(e\) => \{\s*e\.preventDefault\(\);\s*e\.stopPropagation\(\);\s*tocManageBtn\.click\(\);\s*setTimeout\(\(\) => this\.copyTocContent\(\), 100\);/g,
    `clonedManageBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('[MobileUI] 목차 관리 버튼 클릭');
                tocManageBtn.click();
                setTimeout(() => {
                    console.log('[MobileUI] 목차 관리 모드 전환 후 패널 업데이트');
                    this.copyTocContent();
                }, 200);`
);

// 파일 저장
fs.writeFileSync(mobileUIPath, content, 'utf8');

console.log('✅ mobile-ui.js 개선 완료!');
console.log('\n수정 내용:');
console.log('1. 목차 관리 버튼 클릭 후 업데이트 시간: 100ms → 200ms');
console.log('2. 디버깅 로그 추가');
console.log('3. 목차 관리 모드 전환이 더 확실하게 반영됩니다');
