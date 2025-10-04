/**
 * Phase 9 Step 1-2: ID 매핑 테이블 생성
 * 
 * 기존 ID → 새 ID (index-X 형식) 매핑 테이블 자동 생성
 */

const fs = require('fs');
const path = require('path');

// Step 1-1의 분석 결과 로드
const analysisJsonPath = path.join(__dirname, 'PHASE9-STEP1-1-현재구조분석.json');
const analysisData = JSON.parse(fs.readFileSync(analysisJsonPath, 'utf8'));

console.log('✅ 분석 데이터 로드 완료');
console.log(`   총 ${analysisData.totalChapters}개 챕터\n`);

// 매핑 결과 저장
const idMapping = {};
const reverseMapping = {}; // 새 ID → 기존 ID

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

// 챕터별 카운터 (하위 챕터 순서 추적)
const counters = {};

/**
 * 새로운 ID 생성
 */
function generateNewId(oldId, level, parentNewId = null) {
    if (level === 0) {
        // 최상위 레벨
        const index = level0Order.indexOf(oldId);
        if (index === -1) {
            console.error(`❌ 알 수 없는 Level 0 ID: ${oldId}`);
            return null;
        }
        return `index-${index}`;
    }
    
    if (!parentNewId) {
        console.error(`❌ Level ${level} 챕터 ${oldId}의 부모 ID가 없습니다`);
        return null;
    }
    
    // 부모 ID에 대한 카운터 초기화
    if (!counters[parentNewId]) {
        counters[parentNewId] = 1;
    } else {
        counters[parentNewId]++;
    }
    
    return `${parentNewId}-${counters[parentNewId]}`;
}

/**
 * 재귀적으로 ID 매핑 생성
 */
function buildMapping(chapterList) {
    // Level별로 그룹화
    const byLevel = {};
    chapterList.forEach(chapter => {
        if (!byLevel[chapter.level]) {
            byLevel[chapter.level] = [];
        }
        byLevel[chapter.level].push(chapter);
    });
    
    // Level 0부터 처리
    const levels = Object.keys(byLevel).map(Number).sort((a, b) => a - b);
    
    levels.forEach(level => {
        console.log(`📝 Level ${level} 처리 중... (${byLevel[level].length}개)`);
        
        byLevel[level].forEach(chapter => {
            let newId;
            
            if (level === 0) {
                // 최상위 레벨
                newId = generateNewId(chapter.id, level);
            } else {
                // 하위 레벨: 부모의 새 ID 찾기
                const parentOldId = getParentId(chapter.id);
                const parentNewId = idMapping[parentOldId];
                
                if (!parentNewId) {
                    console.error(`❌ 부모 ID를 찾을 수 없음: ${chapter.id} -> ${parentOldId}`);
                    return;
                }
                
                newId = generateNewId(chapter.id, level, parentNewId);
            }
            
            if (newId) {
                idMapping[chapter.id] = newId;
                reverseMapping[newId] = chapter.id;
            }
        });
    });
}

/**
 * 부모 ID 추출
 */
function getParentId(childId) {
    const lastDashIndex = childId.lastIndexOf('-');
    if (lastDashIndex === -1) {
        return null; // Level 0
    }
    return childId.substring(0, lastDashIndex);
}

console.log('🔧 ID 매핑 생성 중...\n');

buildMapping(analysisData.chapterList);

console.log(`\n✅ 매핑 완료! ${Object.keys(idMapping).length}개 ID 변환\n`);

// 통계
console.log('📊 변환 통계:');
Object.keys(analysisData.statisticsByLevel).sort((a, b) => Number(a) - Number(b)).forEach(level => {
    const levelChapters = analysisData.chapterList.filter(c => c.level == level);
    const mappedCount = levelChapters.filter(c => idMapping[c.id]).length;
    console.log(`   Level ${level}: ${mappedCount}/${levelChapters.length}개 변환`);
});

// JavaScript 파일로 저장
const jsContent = `/**
 * Phase 9: ID 매핑 테이블
 * 
 * 기존 ID → 새 ID (index-X 형식) 매핑
 * 
 * 생성 시간: ${new Date().toLocaleString('ko-KR')}
 * 총 챕터 수: ${Object.keys(idMapping).length}개
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
`;

const jsPath = path.join(__dirname, 'PHASE9-ID-MAPPING.js');
fs.writeFileSync(jsPath, jsContent, 'utf8');

console.log(`\n✅ 매핑 파일 저장: ${jsPath}`);

// 마크다운 문서 생성
let markdown = `# Phase 9 Step 1-2: ID 매핑 테이블

**생성 시간**: ${new Date().toLocaleString('ko-KR')}

---

## 📊 매핑 통계

- **총 챕터 수**: ${Object.keys(idMapping).length}개
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

| 기존 ID | → | 새 ID | 제목 |
|---------|---|-------|------|
`;

// 매핑 테이블 출력
analysisData.chapterList.forEach(chapter => {
    const newId = idMapping[chapter.id] || '❌ ERROR';
    markdown += `| \`${chapter.id}\` | → | \`${newId}\` | ${chapter.title} |\n`;
});

markdown += `\n---\n\n## 🔍 레벨별 매핑 분석\n\n`;

Object.keys(analysisData.statisticsByLevel).sort((a, b) => Number(a) - Number(b)).forEach(level => {
    const levelChapters = analysisData.chapterList.filter(c => c.level == level);
    markdown += `### Level ${level} (${levelChapters.length}개)\n\n`;
    
    levelChapters.forEach(chapter => {
        const newId = idMapping[chapter.id] || '❌ ERROR';
        markdown += `- \`${chapter.id}\` → \`${newId}\`: ${chapter.title}\n`;
    });
    
    markdown += `\n`;
});

const mdPath = path.join(__dirname, 'PHASE9-STEP1-2-ID매핑테이블.md');
fs.writeFileSync(mdPath, markdown, 'utf8');

console.log(`✅ 문서 저장: ${mdPath}\n`);

// 검증
console.log('🔍 매핑 검증 중...');
let errors = 0;

analysisData.chapterList.forEach(chapter => {
    if (!idMapping[chapter.id]) {
        console.error(`   ❌ 매핑 누락: ${chapter.id}`);
        errors++;
    }
});

if (errors === 0) {
    console.log('   ✅ 모든 챕터가 정상적으로 매핑되었습니다!\n');
} else {
    console.log(`   ⚠️ ${errors}개 오류 발견\n`);
}

// 새 ID 중복 검사
const newIds = Object.values(idMapping);
const uniqueNewIds = new Set(newIds);

if (newIds.length !== uniqueNewIds.size) {
    console.error('❌ 새 ID에 중복이 있습니다!');
    
    // 중복 찾기
    const seen = {};
    newIds.forEach((newId, index) => {
        if (seen[newId]) {
            console.error(`   중복: ${newId} <- ${analysisData.chapterList[index].id}`);
        }
        seen[newId] = true;
    });
} else {
    console.log('✅ 새 ID 중복 없음\n');
}

console.log('='.repeat(50));
console.log('✅ Step 1-2 완료!');
console.log('='.repeat(50));
