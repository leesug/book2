/**
 * Phase 9 Step 1-2: ID 매핑 테이블 생성 (최종 버전)
 * 
 * 기존 tableOfContents 구조를 순회하며 새 ID 할당
 */

const fs = require('fs');
const path = require('path');

// HTML에서 tableOfContents 추출
const htmlPath = path.join(__dirname, 'index.html');
const htmlContent = fs.readFileSync(htmlPath, 'utf8');

const tocRegex = /const tableOfContents = ({[\s\S]*?});[\s\S]*?window\.tableOfContents/;
const match = htmlContent.match(tocRegex);

if (!match) {
    console.error('❌ tableOfContents를 찾을 수 없습니다!');
    process.exit(1);
}

const tableOfContentsStr = match[1];
const tableOfContents = eval(`(${tableOfContentsStr})`);

console.log('✅ tableOfContents 추출 완료\n');

// 매핑 결과
const idMapping = {};
const reverseMapping = {};
let counter = 0;

/**
 * 재귀적으로 목차 순회하며 ID 매핑
 */
function traverse(obj, parentPath = '', parentNewId = '') {
    const keys = Object.keys(obj);
    
    keys.forEach((key, index) => {
        const chapter = obj[key];
        
        // 현재 챕터의 전체 경로 (기존 ID)
        const fullPath = parentPath ? `${parentPath}-${key}` : key;
        
        // 새 ID 생성
        const newId = parentNewId ? `${parentNewId}-${index + 1}` : `index-${index}`;
        
        // 매핑 저장
        idMapping[fullPath] = newId;
        reverseMapping[newId] = fullPath;
        counter++;
        
        // 자식이 있으면 재귀
        if (chapter.children) {
            traverse(chapter.children, fullPath, newId);
        }
    });
}

console.log('🔧 ID 매핑 생성 중...\n');

traverse(tableOfContents);

console.log(`✅ 매핑 완료! ${counter}개 ID 변환\n`);

// 샘플 출력
console.log('📝 샘플 매핑:');
const samples = [
    'bookInfo',
    'prologue',
    'prologue-p1',
    'part1',
    'part1-1-1',
    'part1-1-1-1-1-1',
    'epilogue'
];

samples.forEach(old => {
    if (idMapping[old]) {
        console.log(`   ${old} → ${idMapping[old]}`);
    }
});

// JavaScript 파일로 저장
const jsContent = `/**
 * Phase 9: ID 매핑 테이블
 * 
 * 기존 ID → 새 ID (index-X 형식) 매핑
 * 
 * 생성 시간: ${new Date().toLocaleString('ko-KR')}
 * 총 챕터 수: ${counter}개
 */

const ID_MAPPING = ${JSON.stringify(idMapping, null, 2)};

const REVERSE_MAPPING = ${JSON.stringify(reverseMapping, null, 2)};

// 변환 헬퍼 함수
function getNewId(oldId) {
    return ID_MAPPING[oldId] || null;
}

function getOldId(newId) {
    return REVERSE_MAPPING[newId] || null;
}

// Node.js 환경
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { 
        ID_MAPPING, 
        REVERSE_MAPPING,
        getNewId,
        getOldId
    };
}

// 브라우저 환경
if (typeof window !== 'undefined') {
    window.ID_MAPPING = ID_MAPPING;
    window.REVERSE_MAPPING = REVERSE_MAPPING;
    window.getNewId = getNewId;
    window.getOldId = getOldId;
}

console.log('✅ ID_MAPPING 로드 완료:', Object.keys(ID_MAPPING).length, '개');
`;

const jsPath = path.join(__dirname, 'PHASE9-ID-MAPPING.js');
fs.writeFileSync(jsPath, jsContent, 'utf8');

console.log(`\n✅ 매핑 파일 저장: ${jsPath}`);

// 검증
console.log('\n🔍 매핑 검증:');
const newIds = Object.values(idMapping);
const uniqueNewIds = new Set(newIds);

if (newIds.length !== uniqueNewIds.size) {
    console.error('❌ 새 ID에 중복이 있습니다!');
    const seen = {};
    newIds.forEach((newId) => {
        seen[newId] = (seen[newId] || 0) + 1;
    });
    Object.keys(seen).forEach(id => {
        if (seen[id] > 1) {
            console.error(`   중복: ${id} (${seen[id]}회)`);
        }
    });
} else {
    console.log('   ✅ 새 ID 중복 없음');
}

// 마크다운 문서 생성
let markdown = `# Phase 9 Step 1-2: ID 매핑 테이블

**생성 시간**: ${new Date().toLocaleString('ko-KR')}  
**총 챕터 수**: ${counter}개

---

## 📊 매핑 통계 및 샘플

\`\`\`javascript
bookInfo → ${idMapping['bookInfo']}
prologue → ${idMapping['prologue']}
prologue-p1 → ${idMapping['prologue-p1']}
part1 → ${idMapping['part1']}
part1-1-1 → ${idMapping['part1-1-1']}
part1-1-1-1-1-1 → ${idMapping['part1-1-1-1-1-1']}
\`\`\`

---

## 📋 전체 매핑 테이블

| # | 기존 ID | → | 새 ID |
|---|---------|---|-------|
`;

Object.keys(idMapping).sort().forEach((oldId, index) => {
    const newId = idMapping[oldId];
    markdown += `| ${index + 1} | \`${oldId}\` | → | \`${newId}\` |\n`;
});

const mdPath = path.join(__dirname, 'PHASE9-STEP1-2-ID매핑테이블.md');
fs.writeFileSync(mdPath, markdown, 'utf8');

console.log(`   ✅ 문서 저장: ${mdPath}`);

console.log('\n' + '='.repeat(50));
console.log('✅ Step 1-2 완료!');
console.log('='.repeat(50));
