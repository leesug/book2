/**
 * Phase 9 Step 1-1: 현재 목차 구조 완전 분석 (개선 버전)
 * HTML 파일에서 직접 tableOfContents를 추출하여 분석
 */

const fs = require('fs');
const path = require('path');

// HTML 파일 읽기
const htmlPath = path.join(__dirname, 'index.html');
const htmlContent = fs.readFileSync(htmlPath, 'utf8');

// tableOfContents 추출 (정규식 사용)
const tocRegex = /const tableOfContents = ({[\s\S]*?});[\s\S]*?window\.tableOfContents/;
const match = htmlContent.match(tocRegex);

if (!match) {
    console.error('❌ tableOfContents를 찾을 수 없습니다!');
    process.exit(1);
}

// JavaScript 객체로 변환
const tableOfContentsStr = match[1];
const tableOfContents = eval(`(${tableOfContentsStr})`);

console.log('✅ tableOfContents 추출 완료!\n');

// 결과 저장 객체
const analysisResult = {
    totalChapters: 0,
    maxDepth: 0,
    chapterList: [],      // 모든 챕터 ID 목록
    hierarchyMap: {},     // 계층 구조 맵
    statisticsByLevel: {}, // 레벨별 통계
    idPatterns: {}        // ID 패턴 분석
};

/**
 * 재귀적으로 목차 구조 분석
 */
function analyzeStructure(obj, prefix = '', level = 0) {
    analysisResult.maxDepth = Math.max(analysisResult.maxDepth, level);
    
    if (!analysisResult.statisticsByLevel[level]) {
        analysisResult.statisticsByLevel[level] = {
            count: 0,
            ids: []
        };
    }
    
    Object.keys(obj).forEach((key, index) => {
        const chapter = obj[key];
        const fullId = prefix ? `${prefix}-${key}` : key;
        
        analysisResult.totalChapters++;
        analysisResult.statisticsByLevel[level].count++;
        analysisResult.statisticsByLevel[level].ids.push(fullId);
        
        // ID 패턴 분석
        const pattern = key.match(/^[a-z]+/) ? 'alpha' : 
                       key.match(/^\d+-\d+/) ? 'numeric-nested' :
                       key.match(/^\d+/) ? 'numeric' :
                       key.match(/^[a-z]\d+/) ? 'alpha-numeric' : 'other';
        
        if (!analysisResult.idPatterns[pattern]) {
            analysisResult.idPatterns[pattern] = [];
        }
        analysisResult.idPatterns[pattern].push(fullId);
        
        // 챕터 정보 저장
        const chapterInfo = {
            id: fullId,
            key: key,
            title: chapter.title,
            level: level,
            order: index + 1,
            hasChildren: !!chapter.children,
            childCount: chapter.children ? Object.keys(chapter.children).length : 0,
            isSpecial: chapter.isSpecial || false,
            pattern: pattern
        };
        
        analysisResult.chapterList.push(chapterInfo);
        analysisResult.hierarchyMap[fullId] = chapterInfo;
        
        // 자식이 있으면 재귀 탐색
        if (chapter.children) {
            analyzeStructure(chapter.children, fullId, level + 1);
        }
    });
}

/**
 * 분석 결과를 마크다운 형식으로 출력
 */
function generateMarkdownReport() {
    let markdown = `# Phase 9 Step 1-1: 현재 목차 구조 완전 분석

**생성 시간**: ${new Date().toLocaleString('ko-KR')}

---

## 📊 전체 통계

- **총 챕터 수**: ${analysisResult.totalChapters}개
- **최대 깊이**: ${analysisResult.maxDepth + 1}단계 (Level 0 ~ Level ${analysisResult.maxDepth})

### 레벨별 챕터 수

`;

    // 레벨별 통계
    Object.keys(analysisResult.statisticsByLevel).sort((a, b) => Number(a) - Number(b)).forEach(level => {
        const stats = analysisResult.statisticsByLevel[level];
        markdown += `- **Level ${level}**: ${stats.count}개\n`;
    });

    markdown += `\n### ID 패턴 분석\n\n`;
    
    Object.keys(analysisResult.idPatterns).forEach(pattern => {
        const ids = analysisResult.idPatterns[pattern];
        markdown += `- **${pattern}**: ${ids.length}개\n`;
        markdown += `  - 예시: ${ids.slice(0, 5).map(id => `\`${id}\``).join(', ')}\n`;
    });

    markdown += `\n---\n\n## 📋 전체 챕터 목록 (계층 구조)\n\n`;

    // 계층 구조로 출력
    function printHierarchy(obj, prefix = '', indent = '') {
        Object.keys(obj).forEach((key, index) => {
            const chapter = obj[key];
            const fullId = prefix ? `${prefix}-${key}` : key;
            const isLast = index === Object.keys(obj).length - 1;
            const connector = isLast ? '└─' : '├─';
            
            markdown += `${indent}${connector} **${fullId}**: ${chapter.title}\n`;
            
            if (chapter.children) {
                const nextIndent = indent + (isLast ? '   ' : '│  ');
                printHierarchy(chapter.children, fullId, nextIndent);
            }
        });
    }

    printHierarchy(tableOfContents);

    markdown += `\n---\n\n## 📝 챕터 ID 상세 목록 (평면 구조)\n\n`;
    markdown += `| # | ID | 제목 | Level | Pattern | 자식 수 |\n`;
    markdown += `|---|----|----|-------|---------|--------|\n`;
    
    analysisResult.chapterList.forEach((chapter, index) => {
        markdown += `| ${index + 1} | \`${chapter.id}\` | ${chapter.title} | ${chapter.level} | ${chapter.pattern} | ${chapter.childCount} |\n`;
    });

    markdown += `\n---\n\n## 🔍 레벨별 상세 분석\n\n`;
    
    Object.keys(analysisResult.statisticsByLevel).sort((a, b) => Number(a) - Number(b)).forEach(level => {
        const stats = analysisResult.statisticsByLevel[level];
        markdown += `### Level ${level} (${stats.count}개)\n\n`;
        stats.ids.forEach(id => {
            const info = analysisResult.hierarchyMap[id];
            markdown += `- \`${id}\`: ${info.title}${info.hasChildren ? ` → ${info.childCount}개 하위` : ''}\n`;
        });
        markdown += `\n`;
    });

    markdown += `\n---\n\n## 🚨 문제점 분석\n\n`;
    markdown += `### 1. 불규칙한 ID 명명 규칙\n\n`;
    markdown += `현재 시스템은 여러 가지 ID 패턴을 혼용하고 있어 일관성이 없습니다:\n\n`;
    
    Object.keys(analysisResult.idPatterns).forEach(pattern => {
        markdown += `- **${pattern} 패턴**: ${analysisResult.idPatterns[pattern].length}개\n`;
    });
    
    markdown += `\n### 2. 파싱 어려움\n\n`;
    markdown += `\`part1-1-1\`과 같은 ID를 \`split('-')\`로 분리하면 \`["part1", "1", "1"]\`이 되어\n`;
    markdown += `실제 데이터 구조인 \`tableOfContents["part1"].children["1-1"]\`에 접근할 수 없습니다.\n\n`;
    
    markdown += `### 3. 확장성 제한\n\n`;
    markdown += `새로운 챕터를 추가할 때 ID를 어떻게 생성해야 할지 명확한 규칙이 없어\n`;
    markdown += `혼란을 야기하고 오류가 발생하기 쉽습니다.\n\n`;

    return markdown;
}

/**
 * 메인 실행
 */
console.log('🔍 현재 목차 구조 분석 시작...\n');

analyzeStructure(tableOfContents);

console.log('📊 분석 완료!');
console.log(`   총 챕터 수: ${analysisResult.totalChapters}개`);
console.log(`   최대 깊이: ${analysisResult.maxDepth + 1}단계\n`);

// 통계 출력
console.log('📈 레벨별 챕터 수:');
Object.keys(analysisResult.statisticsByLevel).sort((a, b) => Number(a) - Number(b)).forEach(level => {
    const stats = analysisResult.statisticsByLevel[level];
    console.log(`   Level ${level}: ${stats.count}개`);
});

console.log('\n🔍 ID 패턴 분석:');
Object.keys(analysisResult.idPatterns).forEach(pattern => {
    console.log(`   ${pattern}: ${analysisResult.idPatterns[pattern].length}개`);
});

const markdown = generateMarkdownReport();
const outputPath = path.join(__dirname, 'PHASE9-STEP1-1-현재구조분석.md');

fs.writeFileSync(outputPath, markdown, 'utf8');

console.log(`\n✅ 분석 결과 저장 완료: ${outputPath}`);

// JSON 형식으로도 저장
const jsonPath = path.join(__dirname, 'PHASE9-STEP1-1-현재구조분석.json');
fs.writeFileSync(jsonPath, JSON.stringify(analysisResult, null, 2), 'utf8');

console.log(`✅ JSON 데이터 저장 완료: ${jsonPath}\n`);

module.exports = { analysisResult, tableOfContents };
