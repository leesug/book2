const fs = require('fs');
const path = require('path');

// 파일 경로
const indexPath = path.join(__dirname, 'index.html');

console.log('📝 툴바 스타일 수정 시작...');

// 파일 읽기
let content = fs.readFileSync(indexPath, 'utf8');

// 수정: .toolbar의 flex-wrap을 wrap으로 변경
content = content.replace(
    /\.toolbar \{\s*background: #f5f5f5;\s*padding: 8px 10px;\s*border-radius: 5px;\s*margin-bottom: 15px;\s*display: flex;\s*gap: 5px;\s*flex-wrap: nowrap;/g,
    `.toolbar {
            background: #f5f5f5;
            padding: 8px 10px;
            border-radius: 5px;
            margin-bottom: 15px;
            display: flex;
            gap: 5px;
            flex-wrap: wrap;`
);

// 파일 저장
fs.writeFileSync(indexPath, content, 'utf8');

console.log('✅ 툴바 스타일 수정 완료!');
console.log('\n수정 내용:');
console.log('- .toolbar의 flex-wrap을 nowrap → wrap으로 변경');
console.log('- 이제 툴바 버튼들이 여러 줄로 자동 줄바꿈됩니다');
