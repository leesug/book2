/**
 * Phase 9 Step 1-2: ID 매핑 테이블 생성 (재귀 방식)
 * 
 * 기존 ID → 새 ID (index-X 형식) 매핑 테이블 자동 생성
 */

const fs = require('fs');
const path = require('path');

// index.html에서 tableOfContents 직접 로드
const { tableOfContents } = require('./analyze-current-structure-v2.js');

console.log('✅ tableOfContents 로드 완료\n');

// 매핑 결과 저장
const idMapping = {};
const reverseMapping = {}; // 새 ID → 기존 ID
let totalMapped = 0;

// Level 0 챕터 순서 정의 (최상위)
const level0Order = [
    'bookInfo',    // index-0
    'prologue',    // index-1
    'part1',       // index-2
    'part2',       // index-3
    'part3',       // index-4
    'part4',       // index-5
    'part5',       // index-6
    'epilogue'     // index-7
];

/**
 * 재귀적으로 ID 매핑 생성
 */
function buildMappingRecursive(obj, parentNewId = null, level = 0) {
    Object.keys(obj).forEach((key, index) => {
        const chapter = obj[key];
        let fullOldId, newId;
        
        if (level === 0) {
            // Level 0: bookInfo, prologue, part1, etc.
            fullOldId = key;
            const orderIndex = level0Order.indexOf(key);
            newId = `index-${orderIndex}`;
        } else {
            // Level 1+: 부모 ID + '-' + 키
            fullOldId = `${parentNewId ? idMapping[Object.keys(obj)[0].split('-')[0]] ? Object.keys(obj)[0].split('-')[0] : parentNewId.replace(/^index-/, '').split('-').join('-') : ''}-${key}`.replace(/^-/, '');
            
            // 더 간단한 방법: 순서대로 번호 부여
            newId = parentNewId ? `${parentNewId}-${index + 1}` : `index-${index}`;
        }
        
        // 실제 full ID 재구성 (재귀 경로 추적)
        if (level > 0 && parentNewId) {
            // 부모의 old ID 찾기
            const parentOldId = reverseMapping[parentNewId];
            fullOldId = parentOldId ? `${parentOldId}-${key}` : key;
        }
        
        idMapping[fullOldId] = newId;
        reverseMapping[newId] = fullOldId;
        totalMapped++;
        
        console.log(`   ${fullOldId} → ${newId}`);
        
        // 자식이 있으면 재귀 처리
        if (chapter.children) {
            buildMappingRecursive(chapter.children, newId, level + 1);
        }
    });
}

console.log('🔧 ID 매핑 생성 중...\n');

buildMappingRecursive(tableOfContents);

console.log(`\n✅ 매핑 완료! ${totalMapped}개 ID 변환\n`);

// JavaScript 파일로 저장
const jsContent = `/**
 * Phase 9: ID 매핑 테이블
 * 
 * 기존 ID → 새 ID (index-X 형식) 매핑
 * 
 * 생성 시간: ${new Date().toLocaleString('ko-KR')}
 * 총 챕터 수: ${totalMapped}개
 */

const ID_MAPPING = ${JSON.stringify(idMapping, null, 2)};

const REVERSE_MAPPING = ${JSON.stringify(reverseMapping, null, 2)};

// Node.js 환경
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ID_MAPPING, REVERSE_MAPPING };
}

// 브라우저 환경
if (typeof window !== 'undefined') {
    window.ID_MAPPING = ID_MAPPING;
    window.REVERSE_MAPPING = REVERSE_MAPPING;
}

console.log('✅ ID_MAPPING 로드 완료:', Object.keys(ID_MAPPING).length, '개');
`;

const jsPath = path.join(__dirname, 'PHASE9-ID-MAPPING.js');
fs.writeFileSync(jsPath, jsContent, 'utf8');

console.log(`✅ 매핑 파일 저장: ${jsPath}`);

// 마크다운 문서 생성
let markdown = `# Phase 9 Step 1-2: ID 매핑 테이블

**생성 시간**: ${new Date().toLocaleString('ko-KR')}

---

## 📊 매핑 통계

- **총 챕터 수**: ${totalMapped}개
- **변환 규칙**: \`기존 ID\` → \`index-X-Y-Z\` 형식

### 매핑 예시

\`\`\`javascript
// Level 0
bookInfo → index-0
prologue → index-1
part1 → index-2

// Level 1
prologue-p1 → index-1-1
part1-1-1 → index-2-1

// Level 2
part1-1-1-1 → index-2-1-1
\`\`\`

---

## 📋 전체 매핑 테이블

| 기존 ID | → | 새 ID |
|---------|---|-------|
`;

// 정렬하여 출력
Object.keys(idMapping).sort().forEach(oldId => {
    const newId = idMapping[oldId];
    markdown += `| \`${oldId}\` | → | \`${newId}\` |\n`;
});

const mdPath = path.join(__dirname, 'PHASE9-STEP1-2-ID매핑테이블.md');
fs.writeFileSync(mdPath, markdown, 'utf8');

console.log(`✅ 문서 저장: ${mdPath}\n`);

// 검증: 중복 검사
const newIds = Object.values(idMapping);
const uniqueNewIds = new Set(newIds);

if (newIds.length !== uniqueNewIds.size) {
    console.error('❌ 새 ID에 중복이 있습니다!');
    
    // 중복 찾기
    const seen = {};
    newIds.forEach((newId) => {
        if (seen[newId]) {
            const oldIds = Object.keys(idMapping).filter(k => idMapping[k] === newId);
            console.error(`   중복 ID: ${newId} <- ${oldIds.join(', ')}`);
        }
        seen[newId] = (seen[newId] || 0) + 1;
    });
} else {
    console.log('✅ 새 ID 중복 없음');
}

console.log('\n' + '='.repeat(50));
console.log('✅ Step 1-2 완료!');
console.log('='.repeat(50));
