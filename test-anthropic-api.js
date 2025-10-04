require('dotenv').config();

async function testAnthropicAPI() {
    console.log('🔍 Anthropic API 테스트 시작...\n');
    
    // API 키 확인
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey || apiKey.trim() === '') {
        console.error('❌ ANTHROPIC_API_KEY가 설정되지 않았습니다.');
        return;
    }
    
    console.log('✅ API 키 확인됨:', apiKey.substring(0, 20) + '...');
    console.log('');
    
    try {
        // 간단한 테스트 요청
        const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': apiKey,
                'anthropic-version': '2023-06-01'
            },
            body: JSON.stringify({
                model: 'claude-3-5-sonnet-20241022',  // 최신 Claude 3.5 Sonnet
                max_tokens: 100,
                messages: [{
                    role: 'user',
                    content: '안녕하세요! API 테스트입니다.'
                }]
            })
        });
        
        console.log('📥 응답 상태:', response.status, response.statusText);
        console.log('');
        
        if (!response.ok) {
            const errorText = await response.text();
            console.log('❌ API 에러 발생:');
            console.log('Status:', response.status);
            console.log('Error Response:');
            console.log(errorText);
            console.log('');
            
            // 일반적인 에러 원인
            if (response.status === 401) {
                console.log('💡 해결 방법:');
                console.log('   1. API 키가 올바른지 확인하세요');
                console.log('   2. https://console.anthropic.com/settings/keys 에서 새 키를 발급받으세요');
            } else if (response.status === 429) {
                console.log('💡 해결 방법:');
                console.log('   1. API 사용량 한도를 초과했습니다');
                console.log('   2. 크레딧을 충전하세요: https://console.anthropic.com/settings/billing');
            } else if (response.status === 400) {
                console.log('💡 해결 방법:');
                console.log('   1. 모델명이 잘못되었을 수 있습니다');
                console.log('   2. 최신 모델명을 확인하세요');
            }
            
            return;
        }
        
        const data = await response.json();
        
        console.log('✅ API 호출 성공!');
        console.log('');
        console.log('📝 응답 내용:');
        if (data.content && data.content[0]) {
            console.log(data.content[0].text);
        } else {
            console.log(JSON.stringify(data, null, 2));
        }
        
    } catch (error) {
        console.error('❌ 테스트 실패:', error.message);
    }
}

testAnthropicAPI();
