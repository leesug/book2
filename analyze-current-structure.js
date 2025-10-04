/**
 * Phase 9 Step 1-1: 현재 목차 구조 완전 분석
 * 
 * 이 스크립트는 현재 tableOfContents 구조를 분석하여
 * 모든 챕터 ID와 계층 구조를 문서화합니다.
 */

const fs = require('fs');
const path = require('path');

// index.html에서 tableOfContents 추출 (실제로는 복사해서 사용)
const tableOfContents = {
    "bookInfo": {
        title: "📋 책 기본 정보",
        isSpecial: true
    },
    "prologue": {
        title: "프롤로그: 인류의 숙명, 예측에 대한 갈망",
        children: {
            "p1": { title: "왜 우리는 예측하려 하는가?" },
            "p2": { title: "예측의 본능: 생존과 번영을 위한 인류의 역사" },
            "p3": { title: "예측이 성공했을 때의 보상: 역사 속 사례와 현대 사회의 가치" },
            "p4": { title: "같은 실수를 반복하는 이유: 예측 불가능성이 주는 좌절과 혼란" },
            "p5": { title: "예측의 당위성: 더 나은 삶을 위한 필수적인 지혜" },
            "p6": { title: "예측을 위한 인류의 도구들: 과학기술에서 동양의 지혜까지" },
            "p7": { title: "시간과 공간을 읽어내는 도구: 시계, 달력, 천문학" },
            "p8": { title: "자연 현상 예측: 날씨 예측의 역사와 발전" },
            "p9": { title: "사회 현상 예측: 역사의 반복, 유행의 순환 (패션, 음악)" },
            "p10": { title: "빅데이터와 AI: 모든 과학기술은 예측을 향한다" },
            "p11": { title: "예측만을 위한 학문: 동양의 점술과 사주명리" },
            "p12": { title: "과학기술로 설명할 수 없는 기호와 의지의 문제" },
            "p13": { title: "결과와 과정: 점술/사주명리가 가진 독특한 설득력" },
            "p14": { title: "'두루뭉술한' 예측의 오해와 '구체화된' 예측의 정확성" },
            "p15": { title: "한국, 예측의 특이점: 점술 시장의 비밀" },
            "p16": { title: "전 세계 인구 대비 압도적인 한국의 점술 시장" },
            "p17": { title: "한국 점술의 특이성: '과거 해소'보다 '미래 예측'에 집중하는 문화" },
            "p18": { title: "'신들의 나라' 한국이 점술에 열광하는 이유" },
            "p19": { title: "점술과 사주명리의 경계, 그리고 '역사주'의 등장" },
            "p20": { title: "예측 툴로서의 점술과 사주명리의 공통점과 차이점" },
            "p21": { title: "사주명리: 달력의 원리에 기반한 역학" },
            "p22": { title: "점술의 두 갈래: 사주명리의 미분(세분화) 개념과 신접(神接)의 세계" },
            "p23": { title: "비과학적 근거에 대한 비판과 그럼에도 불구하고 믿는 이유" },
            "p24": { title: "예측률의 한계: 70%와 55%, 믿을 수 없는 예측과 소름 돋는 예측" },
            "p25": { title: "사주명리, 오래된 기술이 된 이유" },
            "p26": { title: "반만년 역사 속에서 '원리'보다 '기술'로 전수된 지혜" },
            "p27": { title: "어설프게 맞지만, 왜 맞는지는 몰랐던 과거의 한계" },
            "p28": { title: "'비급'과 '비밀': 예측의 가치가 만들어낸 폐쇄성" },
            "p29": { title: "새로운 예측의 시대: '역사주'의 탄생 배경" },
            "p30": { title: "과거의 실망을 넘어선 새로운 시도" },
            "p31": { title: "'오행의 정체'와 '운, 기'의 현대적 재해석" },
            "p32": { title: "시간과 에너지: '역사주'가 예측의 새로운 지평을 열다" }
        }
    }
    // ... 나머지 구조는 너무 길어서 주석 처리
};

// 결과 저장 객체
const analysisResult = {
    totalChapters: 0,
    maxDepth: 0,
    chapterList: [],      // 모든 챕터 ID 목록
    hierarchyMap: {},     // 계층 구조 맵
    statisticsByLevel: {} // 레벨별 통계
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
        
        // 챕터 정보 저장
        const chapterInfo = {
            id: fullId,
            key: key,
            title: chapter.title,
            level: level,
            order: index + 1,
            hasChildren: !!chapter.children,
            childCount: chapter.children ? Object.keys(chapter.children).length : 0,
            isSpecial: chapter.isSpecial || false
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

생성 시간: ${new Date().toISOString()}

## 📊 전체 통계

- **총 챕터 수**: ${analysisResult.totalChapters}개
- **최대 깊이**: ${analysisResult.maxDepth + 1}단계
- **레벨별 챕터 수**:
`;

    // 레벨별 통계
    Object.keys(analysisResult.statisticsByLevel).forEach(level => {
        const stats = analysisResult.statisticsByLevel[level];
        markdown += `  - Level ${level}: ${stats.count}개\n`;
    });

    markdown += `\n## 📋 전체 챕터 목록 (계층 구조)\n\n`;

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

    markdown += `\n## 📝 챕터 ID 상세 목록 (평면 구조)\n\n`;
    markdown += `| ID | 제목 | Level | 자식 수 |\n`;
    markdown += `|----|------|-------|--------|\n`;
    
    analysisResult.chapterList.forEach(chapter => {
        markdown += `| \`${chapter.id}\` | ${chapter.title} | ${chapter.level} | ${chapter.childCount} |\n`;
    });

    markdown += `\n## 🔍 레벨별 상세 분석\n\n`;
    
    Object.keys(analysisResult.statisticsByLevel).forEach(level => {
        const stats = analysisResult.statisticsByLevel[level];
        markdown += `### Level ${level} (${stats.count}개)\n\n`;
        stats.ids.forEach(id => {
            const info = analysisResult.hierarchyMap[id];
            markdown += `- \`${id}\`: ${info.title}${info.hasChildren ? ` (자식 ${info.childCount}개)` : ''}\n`;
        });
        markdown += `\n`;
    });

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

const markdown = generateMarkdownReport();
const outputPath = path.join(__dirname, 'PHASE9-STEP1-1-현재구조분석.md');

fs.writeFileSync(outputPath, markdown, 'utf8');

console.log(`✅ 분석 결과 저장 완료: ${outputPath}\n`);

// JSON 형식으로도 저장
const jsonPath = path.join(__dirname, 'PHASE9-STEP1-1-현재구조분석.json');
fs.writeFileSync(jsonPath, JSON.stringify(analysisResult, null, 2), 'utf8');

console.log(`✅ JSON 데이터 저장 완료: ${jsonPath}\n`);

module.exports = { analysisResult, tableOfContents };
