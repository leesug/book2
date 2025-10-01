// test-supabase.js - Supabase 연결 및 설정 확인 스크립트
require('dotenv').config();
const supabase = require('./supabase');

async function testSupabase() {
    console.log('🔍 Supabase 연결 및 설정 확인 시작...\n');
    
    // 1. 환경 변수 확인
    console.log('📋 1. 환경 변수 확인:');
    console.log(`   SUPABASE_URL: ${process.env.SUPABASE_URL ? '✅ 설정됨' : '❌ 없음'}`);
    console.log(`   SUPABASE_KEY: ${process.env.SUPABASE_KEY ? '✅ 설정됨' : '❌ 없음'}`);
    console.log('');
    
    // 2. 테이블 존재 확인
    console.log('📋 2. chapters 테이블 확인:');
    try {
        const { data, error, count } = await supabase
            .from('chapters')
            .select('*', { count: 'exact', head: true });
        
        if (error) {
            console.log(`   ❌ 오류: ${error.message}`);
            if (error.message.includes('relation') && error.message.includes('does not exist')) {
                console.log('   ⚠️  테이블이 생성되지 않았습니다!');
                console.log('   📝 해결 방법: supabase-setup.sql을 Supabase SQL Editor에서 실행하세요.');
            }
        } else {
            console.log(`   ✅ 테이블 존재 확인 (현재 데이터 ${count || 0}개)`);
        }
    } catch (err) {
        console.log(`   ❌ 연결 오류: ${err.message}`);
    }
    console.log('');
    
    // 3. 테이블 데이터 조회
    console.log('📋 3. 저장된 챕터 데이터 조회:');
    try {
        const { data, error } = await supabase
            .from('chapters')
            .select('id, content, created_at, updated_at')
            .order('updated_at', { ascending: false })
            .limit(5);
        
        if (error) {
            console.log(`   ❌ 오류: ${error.message}`);
        } else if (data.length === 0) {
            console.log('   ℹ️  저장된 데이터가 없습니다.');
        } else {
            console.log(`   ✅ ${data.length}개의 챕터 발견:`);
            data.forEach((chapter, index) => {
                const preview = chapter.content.substring(0, 50).replace(/\n/g, ' ');
                console.log(`      ${index + 1}. ${chapter.id}`);
                console.log(`         내용 미리보기: ${preview}...`);
                console.log(`         업데이트: ${chapter.updated_at}`);
            });
        }
    } catch (err) {
        console.log(`   ❌ 조회 오류: ${err.message}`);
    }
    console.log('');
    
    // 4. Storage 버킷 확인
    console.log('📋 4. Storage 버킷 확인:');
    try {
        const { data, error } = await supabase.storage.listBuckets();
        
        if (error) {
            console.log(`   ❌ 오류: ${error.message}`);
        } else {
            const bookBucket = data.find(b => b.name === 'book-attachments');
            if (bookBucket) {
                console.log('   ✅ book-attachments 버킷 존재');
                console.log(`      - ID: ${bookBucket.id}`);
                console.log(`      - Public: ${bookBucket.public ? 'Yes' : 'No'}`);
                console.log(`      - 생성일: ${bookBucket.created_at}`);
            } else {
                console.log('   ❌ book-attachments 버킷이 없습니다!');
                console.log('   📝 해결 방법: Supabase 대시보드에서 버킷을 생성하세요.');
                console.log('      - 이름: book-attachments');
                console.log('      - Public: true');
                console.log('      - 크기 제한: 50MB');
            }
        }
    } catch (err) {
        console.log(`   ❌ 버킷 조회 오류: ${err.message}`);
    }
    console.log('');
    
    // 5. Storage 파일 목록 확인
    console.log('📋 5. Storage 파일 목록:');
    try {
        const { data, error } = await supabase.storage
            .from('book-attachments')
            .list('', {
                limit: 10,
                sortBy: { column: 'created_at', order: 'desc' }
            });
        
        if (error) {
            console.log(`   ❌ 오류: ${error.message}`);
            if (error.message.includes('not found')) {
                console.log('   ⚠️  버킷이 생성되지 않았습니다!');
            }
        } else if (data.length === 0) {
            console.log('   ℹ️  업로드된 파일이 없습니다.');
        } else {
            console.log(`   ✅ ${data.length}개의 파일 발견:`);
            data.forEach((file, index) => {
                const sizeKB = (file.metadata?.size / 1024).toFixed(2);
                console.log(`      ${index + 1}. ${file.name}`);
                console.log(`         크기: ${sizeKB} KB`);
                console.log(`         업로드: ${file.created_at}`);
            });
        }
    } catch (err) {
        console.log(`   ❌ 파일 목록 조회 오류: ${err.message}`);
    }
    console.log('');
    
    // 6. 테스트 데이터 삽입 시도
    console.log('📋 6. 쓰기 권한 테스트:');
    try {
        const testId = 'test-connection-' + Date.now();
        const { data, error } = await supabase
            .from('chapters')
            .insert({
                id: testId,
                content: '연결 테스트',
                attachments: []
            })
            .select();
        
        if (error) {
            console.log(`   ❌ 쓰기 오류: ${error.message}`);
            if (error.message.includes('permission') || error.message.includes('policy')) {
                console.log('   ⚠️  RLS 정책 문제! supabase-setup.sql의 정책 부분을 다시 실행하세요.');
            }
        } else {
            console.log('   ✅ 쓰기 권한 정상');
            
            // 테스트 데이터 삭제
            await supabase
                .from('chapters')
                .delete()
                .eq('id', testId);
            console.log('   ✅ 테스트 데이터 정리 완료');
        }
    } catch (err) {
        console.log(`   ❌ 테스트 오류: ${err.message}`);
    }
    console.log('');
    
    // 결과 요약
    console.log('=' .repeat(60));
    console.log('📊 결과 요약:');
    console.log('=' .repeat(60));
    console.log('');
    console.log('다음 단계:');
    console.log('1. 테이블이 없다면: Supabase SQL Editor에서 supabase-setup.sql 실행');
    console.log('2. 버킷이 없다면: Supabase Storage에서 book-attachments 버킷 생성');
    console.log('3. RLS 오류가 있다면: supabase-setup.sql의 정책 부분 다시 실행');
    console.log('4. 모두 정상이라면: 로컬 데이터 마이그레이션 시작 (Phase 2)');
    console.log('');
}

// 스크립트 실행
testSupabase().catch(console.error);
