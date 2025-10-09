require('dotenv').config();

const express = require('express');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const cors = require('cors');
const supabase = require('./supabase');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_DIR = __dirname;
const DATA_FILE = path.join(DATA_DIR, 'data.json');

// Vercel 환경에서는 /tmp 사용, 로컬에서는 ./uploads 사용
const UPLOADS_DIR = process.env.VERCEL 
    ? '/tmp/uploads' 
    : path.join(DATA_DIR, 'uploads');

// 환경변수 확인 및 로깅
console.log('🔍 환경변수 체크:');
console.log('- PORT:', PORT);
console.log('- UPLOADS_DIR:', UPLOADS_DIR);
console.log('- IS_VERCEL:', process.env.VERCEL ? 'Yes' : 'No');
console.log('- SUPABASE_URL:', process.env.SUPABASE_URL ? '✅ 설정됨' : '❌ 없음');
console.log('- SUPABASE_KEY:', process.env.SUPABASE_KEY ? '✅ 설정됨' : '❌ 없음');
console.log('- ANTHROPIC_API_KEY:', process.env.ANTHROPIC_API_KEY ? '✅ 설정됨' : '❌ 없음');

// API 키가 설정되어 있는지 확인
const hasAnthropicKey = !!(process.env.ANTHROPIC_API_KEY && process.env.ANTHROPIC_API_KEY.trim().length > 0);

// 미들웨어 설정
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.static(__dirname));
app.use('/uploads', express.static(UPLOADS_DIR));

// uploads 폴더가 없으면 생성 (Vercel 환경 대응)
try {
    if (!fs.existsSync(UPLOADS_DIR)) {
        fs.mkdirSync(UPLOADS_DIR, { recursive: true });
        console.log('✅ 업로드 디렉터리 생성됨:', UPLOADS_DIR);
    }
} catch (error) {
    console.warn('⚠️ 업로드 디렉터리 생성 실패 (무시됨):', error.message);
    // Vercel에서는 /tmp가 자동 생성되므로 에러 무시
}

// 파일 업로드 설정 - 메모리 저장 (Supabase Storage 업로드용)
const storage = multer.memoryStorage();
const upload = multer({ 
    storage: storage,
    limits: { fileSize: 50 * 1024 * 1024 } // 50MB 제한
});

// 루트 경로 라우트 - index.html 서빙
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// API 라우트

// 모든 챕터 데이터 가져오기
app.get('/api/chapters', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('chapters')
            .select('*')
            .order('updated_at', { ascending: false });
        
        if (error) throw error;
        
        // 데이터 형식을 기존 형식으로 변환 (id를 키로 사용)
        const chapters = {};
        data.forEach(chapter => {
            chapters[chapter.id] = {
                content: chapter.content,
                attachments: chapter.attachments,
                updatedAt: chapter.updated_at
            };
        });
        
        res.json(chapters);
    } catch (error) {
        console.error('챕터 조회 오류:', error);
        res.status(500).json({ error: '챕터 조회 실패' });
    }
});

// 특정 챕터 데이터 가져오기
app.get('/api/chapters/:id', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('chapters')
            .select('*')
            .eq('id', req.params.id)
            .single();
        
        if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
            throw error;
        }
        
        if (data) {
            res.json({
                content: data.content,
                attachments: data.attachments,
                updatedAt: data.updated_at
            });
        } else {
            res.json({ content: '', attachments: [] });
        }
    } catch (error) {
        console.error('챕터 조회 오류:', error);
        res.status(500).json({ error: '챕터 조회 실패' });
    }
});

// 챕터 데이터 저장
app.post('/api/chapters/:id', async (req, res) => {
    try {
        const chapterId = req.params.id;
        const { content, attachments } = req.body;
        
        // upsert: 존재하면 업데이트, 없으면 삽입
        const { data, error } = await supabase
            .from('chapters')
            .upsert({
                id: chapterId,
                content: content || '',
                attachments: attachments || []
            }, {
                onConflict: 'id'
            })
            .select();
        
        if (error) throw error;
        
        res.json({ success: true, message: '저장되었습니다.' });
    } catch (error) {
        console.error('챕터 저장 오류:', error);
        res.status(500).json({ success: false, message: '저장 실패', error: error.message });
    }
});

// AI 가이드 생성 API
app.post('/api/generate-guide', async (req, res) => {
    // API 키가 없으면 즉시 에러 반환
    if (!hasAnthropicKey) {
        console.error('❌ ANTHROPIC_API_KEY 환경변수가 설정되지 않았습니다.');
        return res.status(400).json({ 
            success: false, 
            message: 'API 키가 설정되지 않았습니다. 환경변수 ANTHROPIC_API_KEY를 확인해주세요.',
            needsApiKey: true
        });
    }

    const { title, existingContent, bookContext, tableOfContents, currentChapterId } = req.body;

    let prompt = '';
    
    // 전체 목차 정보를 텍스트로 변환
    const tocText = tableOfContents ? `\n전체 도서 목차 구조:\n${tableOfContents}\n` : '';
    
    if (existingContent && existingContent.trim().length > 0) {
        // 내용이 있는 경우: 내용 분석 및 보충/수정 제안
        prompt = `당신은 전문 작가의 집필 코치입니다. 비문학 도서의 한 챕터 내용을 검토하고 개선 방향을 제시해주세요.

${bookContext}
${tocText}

현재 작성 중인 챕터: "${title}"

이미 작성된 내용:
${existingContent}

위 내용을 분석하여 다음을 제시해주세요:

<h4>✅ 현재 내용의 강점</h4>
<ul>
<li>잘 작성된 부분과 그 이유를 구체적으로 설명</li>
</ul>

<h4>📝 보충이 필요한 내용</h4>
<ul>
<li>추가하면 좋을 구체적인 내용이나 예시</li>
<li>독자 이해를 돕기 위한 설명</li>
</ul>

<h4>🔧 수정이 필요한 부분</h4>
<ul>
<li>개선이 필요한 문장이나 구조</li>
<li>논리적 흐름의 문제점</li>
</ul>

<h4>🔗 전후 맥락 연결</h4>
<ul>
<li>이전 챕터와의 자연스러운 연결 방법</li>
<li>다음 챕터로의 매끄러운 전환 제안</li>
</ul>

<h4>💡 독자 공감 포인트</h4>
<ul>
<li>독자가 더 공감할 수 있도록 추가할 요소</li>
</ul>

HTML 형식으로 위와 같은 구조로 답변해주세요.`;
    } else {
        // 내용이 없는 경우: 목차와 제목 기반 가이드
        prompt = `당신은 전문 작가의 집필 코치입니다. 비문학 도서의 특정 챕터를 작성하기 위한 가이드를 제공해주세요.

${bookContext}
${tocText}

현재 작성할 챕터: "${title}"

이 챕터는 아직 작성되지 않았습니다. 전체 목차의 맥락을 고려하여 다음 구조로 글쓰기 가이드를 제시해주세요:

<h4>📌 이 챕터의 목적과 배경</h4>
<ul>
<li>이 챕터가 전체 도서에서 담당하는 역할</li>
<li>독자가 이 챕터를 통해 얻어야 할 핵심 정보</li>
</ul>

<h4>💡 다루어야 할 핵심 개념</h4>
<ul>
<li>반드시 설명해야 할 주요 개념과 이론</li>
<li>각 개념의 중요도와 설명 순서</li>
</ul>

<h4>📝 구체적인 작성 방향</h4>
<ul>
<li>독자가 이해하기 쉬운 구체적인 예시나 비유</li>
<li>실제 사례나 적용 방법</li>
<li>도표, 그림 등이 필요한 부분</li>
</ul>

<h4>🔗 전후 챕터와의 연결</h4>
<ul>
<li>이전 챕터에서 이어지는 내용</li>
<li>다음 챕터로 자연스럽게 이어지는 방법</li>
</ul>

<h4>❤️ 독자 공감 전략</h4>
<ul>
<li>타겟 독자(45-60세, 25-30세)가 공감할 수 있는 포인트</li>
<li>실생활과 연결할 수 있는 부분</li>
</ul>

<h4>✍️ 추천 작성 분량</h4>
<ul>
<li>이 챕터의 적정 분량과 구성 제안</li>
</ul>

HTML 형식으로 위와 같은 구조로 답변해주세요.`;
    }

    try {
        console.log('📤 Anthropic API 호출 시작...');
        const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': process.env.ANTHROPIC_API_KEY || '',
                'anthropic-version': '2023-06-01'
            },
            body: JSON.stringify({
                model: 'claude-3-5-sonnet-20241022',  // 최신 Claude 3.5 Sonnet 모델
                max_tokens: 2500,
                messages: [{
                    role: 'user',
                    content: prompt
                }]
            })
        });

        console.log('📥 API 응답 상태:', response.status, response.statusText);

        if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ Anthropic API Error:');
            console.error('Status:', response.status);
            console.error('Error:', errorText);
            return res.status(500).json({ 
                success: false, 
                message: `API 오류 (${response.status}): ${errorText}`,
                error: errorText,
                statusCode: response.status
            });
        }

        const data = await response.json();
        
        if (data.content && data.content[0] && data.content[0].text) {
            res.json({ success: true, guide: data.content[0].text });
        } else {
            res.status(500).json({ success: false, message: '가이드 생성 실패' });
        }
    } catch (error) {
        console.error('Guide generation error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'AI 가이드 생성 중 오류가 발생했습니다.',
            error: error.message
        });
    }
});

// 파일 업로드 (Supabase Storage)
app.post('/api/upload', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: '파일이 없습니다.' });
        }
        
        const originalname = Buffer.from(req.file.originalname, 'latin1').toString('utf8');
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const filename = uniqueSuffix + '-' + originalname;
        
        // Supabase Storage에 업로드
        const { data, error } = await supabase.storage
            .from('book-attachments')
            .upload(filename, req.file.buffer, {
                contentType: req.file.mimetype,
                upsert: false
            });
        
        if (error) {
            console.error('Supabase Storage 업로드 오류:', error);
            throw error;
        }
        
        // 공개 URL 생성
        const { data: publicUrlData } = supabase.storage
            .from('book-attachments')
            .getPublicUrl(filename);
        
        // 로컬 백업 (선택사항)
        const localPath = path.join(UPLOADS_DIR, filename);
        fs.writeFileSync(localPath, req.file.buffer);
        
        res.json({
            success: true,
            filename: filename,
            originalname: originalname,
            path: publicUrlData.publicUrl, // Supabase 공개 URL
            localPath: `/uploads/${filename}` // 로컬 백업 경로
        });
    } catch (error) {
        console.error('파일 업로드 오류:', error);
        res.status(500).json({ 
            success: false, 
            message: '파일 업로드 실패',
            error: error.message 
        });
    }
});

// =================================================================
// Phase 6: 음성 → 텍스트 변환 API (OpenAI Whisper)
// =================================================================

/**
 * 음성 파일을 텍스트로 변환
 * POST /api/transcribe
 * Content-Type: multipart/form-data
 * Body: { audio: File (WAV, MP3, M4A 등) }
 */
app.post('/api/transcribe', upload.single('audio'), async (req, res) => {
    console.log('\n🎤 [음성 변환] 요청 받음');
    
    try {
        // OpenAI API 키 확인
        if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'your-openai-api-key-here') {
            console.error('❌ OpenAI API 키가 설정되지 않음');
            return res.status(500).json({
                success: false,
                message: 'OpenAI API 키가 설정되지 않았습니다. .env 파일에 OPENAI_API_KEY를 추가해주세요.'
            });
        }
        
        // 업로드된 파일 확인
        if (!req.file) {
            console.error('❌ 파일이 업로드되지 않음');
            return res.status(400).json({
                success: false,
                message: '음성 파일이 업로드되지 않았습니다.'
            });
        }
        
        const { originalname, mimetype, buffer, size } = req.file;
        console.log('📁 파일 정보:');
        console.log('  - 파일명:', originalname);
        console.log('  - MIME 타입:', mimetype);
        console.log('  - 크기:', (size / 1024 / 1024).toFixed(2), 'MB');
        
        // 파일 형식 검증
        const allowedTypes = [
            'audio/wav', 'audio/x-wav',
            'audio/mpeg', 'audio/mp3',
            'audio/mp4', 'audio/m4a',
            'audio/webm', 'audio/ogg'
        ];
        
        if (!allowedTypes.includes(mimetype) && !originalname.match(/\.(wav|mp3|m4a|webm|ogg)$/i)) {
            console.error('❌ 지원하지 않는 파일 형식:', mimetype);
            return res.status(400).json({
                success: false,
                message: '지원하지 않는 파일 형식입니다. WAV, MP3, M4A 파일만 지원됩니다.'
            });
        }
        
        // 파일 크기 제한 (25MB - OpenAI Whisper 제한)
        const maxSize = 25 * 1024 * 1024; // 25MB
        if (size > maxSize) {
            console.error('❌ 파일 크기 초과:', (size / 1024 / 1024).toFixed(2), 'MB');
            return res.status(400).json({
                success: false,
                message: `파일 크기가 너무 큽니다. 최대 25MB까지 지원됩니다. (현재: ${(size / 1024 / 1024).toFixed(2)}MB)`
            });
        }
        
        // OpenAI Whisper API 호출
        console.log('🔄 OpenAI Whisper API 호출 중...');
        const OpenAI = require('openai');
        const openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY
        });
        
        // 임시 파일로 저장 (OpenAI API는 File 객체 필요)
        const tempFilePath = path.join(UPLOADS_DIR, `temp_${Date.now()}_${originalname}`);
        fs.writeFileSync(tempFilePath, buffer);
        
        try {
            // Whisper API 호출
            const transcription = await openai.audio.transcriptions.create({
                file: fs.createReadStream(tempFilePath),
                model: 'whisper-1',
                language: 'ko', // 한국어 지정
                response_format: 'json'
            });
            
            // 임시 파일 삭제
            fs.unlinkSync(tempFilePath);
            
            const transcribedText = transcription.text;
            console.log('✅ 음성 변환 완료!');
            console.log('📝 변환된 텍스트:', transcribedText.substring(0, 100) + (transcribedText.length > 100 ? '...' : ''));
            
            // 성공 응답
            return res.json({
                success: true,
                text: transcribedText,
                duration: transcription.duration || null,
                language: transcription.language || 'ko'
            });
            
        } catch (apiError) {
            // 임시 파일 삭제
            if (fs.existsSync(tempFilePath)) {
                fs.unlinkSync(tempFilePath);
            }
            throw apiError;
        }
        
    } catch (error) {
        console.error('❌ [음성 변환] 오류 발생:', error);
        return res.status(500).json({
            success: false,
            message: '음성 변환 중 오류가 발생했습니다.',
            error: error.message
        });
    }
});



// 서버 시작
app.listen(PORT, () => {
    console.log(`\n✅ 서버가 http://localhost:${PORT} 에서 실행 중입니다.`);
    console.log(`🌐 브라우저에서 http://localhost:${PORT}/index.html 을 열어주세요.`);
    console.log(`📦 Supabase 연결: ${process.env.SUPABASE_URL ? '✅ 성공' : '❌ 실패'}`);
    console.log(`🤖 AI 가이드 기능: ${hasAnthropicKey ? '✅ 활성화' : '❌ 비활성화 (API 키 필요)'}`);
    if (!hasAnthropicKey) {
        console.log(`⚠️  AI 가이드 기능을 사용하려면 ANTHROPIC_API_KEY 환경변수를 설정하세요.`);
        console.log(`   자세한 내용: API_KEY_SETUP.md 파일 참고`);
    }
    console.log('');
});
