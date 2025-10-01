// 로컬 데이터를 Supabase로 마이그레이션하는 스크립트
const supabase = require('./supabase');
const fs = require('fs');
const path = require('path');

async function migrateData() {
    console.log('========================================');
    console.log('데이터 마이그레이션 시작');
    console.log('========================================\n');

    // 1. data.json 파일 백업
    console.log('1️⃣ data.json 백업 중...');
    const dataFile = path.join(__dirname, 'data.json');
    const backupFile = path.join(__dirname, 'data.json.backup');
    
    if (fs.existsSync(dataFile)) {
        fs.copyFileSync(dataFile, backupFile);
        console.log('✅ data.json.backup 생성 완료\n');
    } else {
        console.log('⚠️ data.json 파일이 없습니다.\n');
    }

    // 2. data.json 데이터 읽기
    console.log('2️⃣ data.json 데이터 읽기...');
    let localData = { chapters: {} };
    
    if (fs.existsSync(dataFile)) {
        try {
            const fileContent = fs.readFileSync(dataFile, 'utf8');
            localData = JSON.parse(fileContent);
            const chapterCount = Object.keys(localData.chapters || {}).length;
            console.log(`✅ ${chapterCount}개의 챕터 발견`);
            
            // 챕터 목록 출력
            for (const [id, chapter] of Object.entries(localData.chapters || {})) {
                const contentLength = (chapter.content || '').length;
                const attachmentsCount = (chapter.attachments || []).length;
                console.log(`   - ${id}: 내용 ${contentLength}자, 첨부파일 ${attachmentsCount}개`);
            }
            console.log('');
        } catch (err) {
            console.log('❌ data.json 파싱 오류:', err.message);
            return;
        }
    }

    // 3. Supabase로 챕터 데이터 마이그레이션
    console.log('3️⃣ Supabase로 챕터 데이터 마이그레이션...');
    let successCount = 0;
    let errorCount = 0;

    for (const [id, chapter] of Object.entries(localData.chapters || {})) {
        try {
            const { data, error } = await supabase
                .from('chapters')
                .upsert({
                    id: id,
                    content: chapter.content || '',
                    attachments: chapter.attachments || []
                })
                .select();
            
            if (error) {
                console.log(`❌ ${id} 마이그레이션 실패:`, error.message);
                errorCount++;
            } else {
                console.log(`✅ ${id} 마이그레이션 성공`);
                successCount++;
            }
        } catch (err) {
            console.log(`❌ ${id} 마이그레이션 오류:`, err.message);
            errorCount++;
        }
    }
    
    console.log(`\n✅ 성공: ${successCount}개, ❌ 실패: ${errorCount}개\n`);

    // 4. uploads 폴더 파일 확인
    console.log('4️⃣ uploads 폴더 파일 확인...');
    const uploadsDir = path.join(__dirname, 'uploads');
    
    if (!fs.existsSync(uploadsDir)) {
        console.log('⚠️ uploads 폴더가 없습니다.\n');
    } else {
        const files = fs.readdirSync(uploadsDir);
        console.log(`✅ ${files.length}개의 파일 발견`);
        
        if (files.length > 0) {
            console.log('\n파일 목록:');
            files.forEach(file => {
                const filePath = path.join(uploadsDir, file);
                const stats = fs.statSync(filePath);
                const sizeKB = (stats.size / 1024).toFixed(2);
                console.log(`   - ${file} (${sizeKB} KB)`);
            });
        }
        console.log('');
    }

    // 5. Supabase Storage로 파일 업로드
    console.log('5️⃣ Supabase Storage로 파일 업로드...');
    
    if (fs.existsSync(uploadsDir)) {
        const files = fs.readdirSync(uploadsDir);
        let uploadSuccess = 0;
        let uploadError = 0;

        for (const file of files) {
            try {
                const filePath = path.join(uploadsDir, file);
                const fileBuffer = fs.readFileSync(filePath);
                
                // 파일명에서 한글 제거하고 안전한 파일명 생성
                // 예: 1759300120267-394021274-천칭.png -> 1759300120267-394021274.png
                const ext = path.extname(file); // .png
                const nameWithoutExt = path.basename(file, ext); // 1759300120267-394021274-천칭
                
                // 영문, 숫자, 하이픈, 언더스코어만 남기기
                const safeNameWithoutExt = nameWithoutExt.replace(/[^a-zA-Z0-9\-_]/g, '-');
                const safeFileName = safeNameWithoutExt + ext;
                
                console.log(`   변환: ${file} -> ${safeFileName}`);
                
                // 파일 확장자로 MIME 타입 추정
                let contentType = 'application/octet-stream';
                if (ext === '.png') contentType = 'image/png';
                else if (ext === '.jpg' || ext === '.jpeg') contentType = 'image/jpeg';
                else if (ext === '.gif') contentType = 'image/gif';
                else if (ext === '.pdf') contentType = 'application/pdf';
                
                // 원본 파일명을 메타데이터로 저장
                const { data, error } = await supabase.storage
                    .from('book-attachments')
                    .upload(safeFileName, fileBuffer, {
                        contentType: contentType,
                        upsert: true, // 이미 있으면 덮어쓰기
                        cacheControl: '3600'
                    });
                
                if (error) {
                    console.log(`❌ ${file} 업로드 실패:`, error.message);
                    uploadError++;
                } else {
                    console.log(`✅ ${file} 업로드 성공`);
                    uploadSuccess++;
                    
                    // 공개 URL 확인
                    const { data: publicUrlData } = supabase.storage
                        .from('book-attachments')
                        .getPublicUrl(safeFileName);
                    console.log(`   URL: ${publicUrlData.publicUrl}`);
                }
            } catch (err) {
                console.log(`❌ ${file} 업로드 오류:`, err.message);
                uploadError++;
            }
        }
        
        console.log(`\n✅ 업로드 성공: ${uploadSuccess}개, ❌ 실패: ${uploadError}개\n`);
    }

    console.log('========================================');
    console.log('데이터 마이그레이션 완료!');
    console.log('========================================\n');
}

migrateData()
    .then(() => {
        console.log('✅ 모든 마이그레이션 작업이 완료되었습니다.');
        process.exit(0);
    })
    .catch(err => {
        console.error('❌ 마이그레이션 오류:', err);
        process.exit(1);
    });
