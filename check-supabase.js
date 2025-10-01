// Supabase 설정 확인 스크립트
const supabase = require('./supabase');

async function checkSupabaseSetup() {
    console.log('========================================');
    console.log('Supabase 설정 확인 시작');
    console.log('========================================\n');

    // 1. Supabase 연결 확인
    console.log('1️⃣ Supabase 연결 확인...');
    try {
        const { data, error } = await supabase
            .from('chapters')
            .select('count')
            .limit(1);
        
        if (error) {
            console.log('❌ 테이블 접근 오류:', error.message);
            console.log('\n🔧 해결 방법:');
            console.log('1. Supabase 대시보드 접속: https://supabase.com/dashboard');
            console.log('2. 프로젝트 선택: cuwozwldhlzqdbaeperm');
            console.log('3. SQL Editor에서 supabase-setup.sql 파일 내용 실행');
            return;
        }
        
        console.log('✅ Supabase 연결 성공!\n');
    } catch (err) {
        console.log('❌ 연결 실패:', err.message);
        console.log('환경 변수를 확인해주세요 (.env 파일)\n');
        return;
    }

    // 2. chapters 테이블 확인
    console.log('2️⃣ chapters 테이블 확인...');
    try {
        const { data, error } = await supabase
            .from('chapters')
            .select('*')
            .limit(5);
        
        if (error) {
            console.log('❌ 테이블 조회 오류:', error.message);
        } else {
            console.log(`✅ chapters 테이블 존재! (현재 ${data.length}개 레코드)`);
            if (data.length > 0) {
                console.log('   첫 번째 레코드:', data[0].id);
            }
        }
    } catch (err) {
        console.log('❌ 테이블 확인 실패:', err.message);
    }
    console.log('');

    // 3. Storage 버킷 확인
    console.log('3️⃣ Storage 버킷 확인...');
    try {
        const { data, error } = await supabase
            .storage
            .listBuckets();
        
        if (error) {
            console.log('❌ Storage 조회 오류:', error.message);
        } else {
            const bookBucket = data.find(b => b.name === 'book-attachments');
            if (bookBucket) {
                console.log('✅ book-attachments 버킷 존재!');
                console.log(`   Public: ${bookBucket.public}`);
            } else {
                console.log('❌ book-attachments 버킷이 없습니다.');
                console.log('\n🔧 해결 방법:');
                console.log('1. Supabase 대시보드 > Storage 메뉴');
                console.log('2. New bucket 클릭');
                console.log('3. Name: book-attachments');
                console.log('4. Public bucket 체크');
                console.log('5. File size limit: 52428800');
            }
        }
    } catch (err) {
        console.log('❌ Storage 확인 실패:', err.message);
    }
    console.log('');

    // 4. 테스트 데이터 삽입 시도
    console.log('4️⃣ 테스트 데이터 삽입 시도...');
    try {
        const testId = 'test-setup-' + Date.now();
        const { data, error } = await supabase
            .from('chapters')
            .insert({
                id: testId,
                content: 'Setup test',
                attachments: []
            })
            .select();
        
        if (error) {
            console.log('❌ 데이터 삽입 오류:', error.message);
            console.log('\n🔧 해결 방법:');
            console.log('RLS 정책이 올바르게 설정되지 않았을 수 있습니다.');
            console.log('supabase-setup.sql 파일의 정책 부분을 다시 실행해주세요.');
        } else {
            console.log('✅ 데이터 삽입 성공!');
            
            // 삽입한 테스트 데이터 삭제
            await supabase
                .from('chapters')
                .delete()
                .eq('id', testId);
            console.log('✅ 테스트 데이터 삭제 완료');
        }
    } catch (err) {
        console.log('❌ 테스트 실패:', err.message);
    }
    console.log('');

    console.log('========================================');
    console.log('Supabase 설정 확인 완료!');
    console.log('========================================\n');
}

checkSupabaseSetup()
    .then(() => {
        console.log('✅ 모든 확인 작업이 완료되었습니다.');
        process.exit(0);
    })
    .catch(err => {
        console.error('❌ 오류 발생:', err);
        process.exit(1);
    });
