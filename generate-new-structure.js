/**
 * Phase 9 Step 1-3: 새로운 tableOfContents 구조 생성
 * 
 * 기존 tableOfContents를 새 ID 체계로 변환
 */

const fs = require('fs');
const path = require('path');

// 기존 tableOfContents 로드
const htmlPath = path.join(__dirname, 'index.html');
const htmlContent = fs.readFileSync(htmlPath, 'utf8');

const tocRegex = /const tableOfContents = ({[\s\S]*?});[\s\S]*?window\.tableOfContents/;
const match = htmlContent.match(tocRegex);

if (!match) {
    console.error('❌ tableOfContents를 찾을 수 없습니다!');
    process.exit(1);
}

const tableOfContentsStr = match[1];
const oldTableOfContents = eval(`(${tableOfContentsStr})`);

console.log('✅ 기존 tableOfContents 로드 완료\n');

// ID 매핑 로드
const { ID_MAPPING, REVERSE_MAPPING } = require('./PHASE9-ID-MAPPING.js');

console.log(`✅ ID 매핑 로드 완료: ${Object.keys(ID_MAPPING).length}개\n`);

// 새로운 tableOfContents
const newTableOfContents = {};

/**
 * 재귀적으로 새 구조 생성
 */
function transformStructure(oldObj, oldPrefix = '') {
    const newObj = {};
    
    Object.keys(oldObj).forEach((oldKey) => {
        const chapter = oldObj[oldKey];
        
        // 현재 챕터의 전체 old ID
        const fullOldId = oldPrefix ? `${oldPrefix}-${oldKey}` : oldKey;
        
        // 새 ID 찾기
        const newId = ID_MAPPING[fullOldId];
        
        if (!newId) {
            console.error(`❌ 매핑을 찾을 수 없음: ${fullOldId}`);
            return;
        }
        
        // 새 ID에서 마지막 부분만 추출 (키로 사용)
        const newKey = newId.split('-').slice(-1)[0];
        
        // 새 챕터 객체 생성
        newObj[newKey] = {
            title: chapter.title
        };
        
        // isSpecial 속성 복사
        if (chapter.isSpecial) {
            newObj[newKey].isSpecial = chapter.isSpecial;
        }
        
        // 자식이 있으면 재귀 변환
        if (chapter.children) {
            newObj[newKey].children = transformStructure(chapter.children, fullOldId);
        }
    });
    
    return newObj;
}

console.log('🔧 새로운 구조 생성 중...\n');

const transformedStructure = transformStructure(oldTableOfContents);

// 최상위 레벨은 "index-X" 형식이므로 "X"를 키로 사용
Object.keys(transformedStructure).forEach(key => {
    newTableOfContents[key] = transformedStructure[key];
});

console.log(`✅ 새로운 구조 생성 완료: ${Object.keys(newTableOfContents).length}개 최상위 챕터\n`);

// JavaScript 파일로 저장
const jsContent = `/**
 * Phase 9: 새로운 tableOfContents (index-X 체계)
 * 
 * 생성 시간: ${new Date().toLocaleString('ko-KR')}
 * 
 * ID 체계:
 * - index-0: 책 기본 정보
 * - index-1: 프롤로그
 * - index-2: 제1부
 * - index-3: 제2부
 * - index-4: 제3부
 * - index-5: 제4부
 * - index-6: 제5부
 * - index-7: 에필로그
 * 
 * 하위 챕터: index-X-Y-Z 형식
 */

const tableOfContents = ${JSON.stringify(newTableOfContents, null, 4)};

// Node.js 환경
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { tableOfContents };
}

// 브라우저 환경
if (typeof window !== 'undefined') {
    window.tableOfContents = tableOfContents;
}

console.log('✅ 새로운 tableOfContents 로드 완료:', Object.keys(tableOfContents).length, '개');
`;

const jsPath = path.join(__dirname, 'tableOfContents-new.js');
fs.writeFileSync(jsPath, jsContent, 'utf8');

console.log(`✅ 새로운 구조 파일 저장: ${jsPath}`);

// 검증: 챕터 수 비교
function countChapters(obj) {
    let count = Object.keys(obj).length;
    Object.keys(obj).forEach(key => {
        if (obj[key].children) {
            count += countChapters(obj[key].children);
        }
    });
    return count;
}

const oldCount = countChapters(oldTableOfContents);
const newCount = countChapters(newTableOfContents);

console.log(`\n🔍 검증:`);
console.log(`   기존 챕터 수: ${oldCount}개`);
console.log(`   새 챕터 수: ${newCount}개`);

if (oldCount === newCount) {
    console.log('   ✅ 챕터 수 일치!');
} else {
    console.error(`   ❌ 챕터 수 불일치!`);
}

// 샘플 출력
console.log(`\n📝 새 구조 샘플:`);
console.log(JSON.stringify({
    "0": newTableOfContents["0"],
    "1": {
        ...newTableOfContents["1"],
        children: {
            "1": newTableOfContents["1"]?.children?.["1"],
            "2": newTableOfContents["1"]?.children?.["2"],
            "...": "..."
        }
    },
    "2": {
        ...newTableOfContents["2"],
        children: {
            "1": {
                ...newTableOfContents["2"]?.children?.["1"],
                children: "..."
            }
        }
    }
}, null, 2));

console.log('\n' + '='.repeat(50));
console.log('✅ Step 1-3 완료!');
console.log('='.repeat(50));
