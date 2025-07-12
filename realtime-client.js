// Netlify용 실시간 통신 클라이언트 (Supabase 사용)
class RealtimeClient {
    constructor() {
        this.connectionId = null;
        this.messageCallback = null;
        this.pollInterval = null;
        this.useSupabase = false; // 실제로는 Supabase 설정 필요
        
        // 현재는 개선된 localStorage + BroadcastChannel 사용
        this.broadcastChannel = null;
        this.init();
    }

    init() {
        // BroadcastChannel API 지원 확인 (같은 origin 내 탭 간 통신)
        if ('BroadcastChannel' in window) {
            console.log('BroadcastChannel 지원됨');
        } else {
            console.log('BroadcastChannel 미지원, localStorage 폴링 사용');
        }
    }

    setConnectionId(connectionId) {
        this.connectionId = connectionId;
        
        if ('BroadcastChannel' in window) {
            // BroadcastChannel 설정 (같은 브라우저 내 탭 간 통신)
            this.broadcastChannel = new BroadcastChannel(`litmus_${connectionId}`);
            this.broadcastChannel.onmessage = (event) => {
                if (this.messageCallback) {
                    this.messageCallback(event.data);
                }
            };
        }
        
        // localStorage 폴링도 병행 (백업)
        this.startPolling();
    }

    sendMessage(data, from = 'unknown') {
        const message = {
            ...data,
            from: from,
            connectionId: this.connectionId,
            timestamp: Date.now()
        };

        console.log('메시지 전송:', message);

        // 방법 1: BroadcastChannel (같은 브라우저)
        if (this.broadcastChannel) {
            this.broadcastChannel.postMessage(message);
        }

        // 방법 2: localStorage (백업)
        try {
            localStorage.setItem(`camera_${this.connectionId}`, JSON.stringify(message));
        } catch (error) {
            console.warn('localStorage 저장 실패:', error);
        }

        // 방법 3: URL 파라미터 전달 (크로스 디바이스)
        this.sendViaURL(message);
    }

    // URL 파라미터를 통한 메시지 전달 (임시 해결책)
    sendViaURL(message) {
        const encodedMessage = encodeURIComponent(JSON.stringify(message));
        const targetUrl = `${window.location.origin}${window.location.pathname}?msg=${encodedMessage}`;
        
        // URL을 통한 메시지 전달 표시
        if (message.type === 'smile_detected') {
            console.log('URL로 메시지 전달 가능:', targetUrl);
            
            // 임시: 직접 처리 (같은 페이지에서)
            setTimeout(() => {
                if (this.messageCallback) {
                    this.messageCallback(message);
                }
            }, 100);
        }
    }

    onMessage(callback) {
        this.messageCallback = callback;
        
        // URL 파라미터에서 메시지 확인
        this.checkURLMessage();
    }

    // URL 파라미터에서 메시지 확인
    checkURLMessage() {
        const urlParams = new URLSearchParams(window.location.search);
        const msgParam = urlParams.get('msg');
        
        if (msgParam && this.messageCallback) {
            try {
                const message = JSON.parse(decodeURIComponent(msgParam));
                console.log('URL에서 메시지 수신:', message);
                this.messageCallback(message);
                
                // URL 파라미터 정리
                const cleanUrl = window.location.pathname;
                window.history.replaceState({}, document.title, cleanUrl);
            } catch (error) {
                console.warn('URL 메시지 파싱 실패:', error);
            }
        }
    }

    startPolling() {
        // 기존 localStorage 폴링
        this.pollInterval = setInterval(() => {
            if (this.connectionId) {
                const message = localStorage.getItem(`camera_${this.connectionId}`);
                if (message) {
                    try {
                        const data = JSON.parse(message);
                        if (this.messageCallback) {
                            this.messageCallback(data);
                        }
                        localStorage.removeItem(`camera_${this.connectionId}`);
                    } catch (error) {
                        console.warn('메시지 파싱 실패:', error);
                    }
                }
            }
        }, 100);
    }

    cleanup() {
        if (this.pollInterval) {
            clearInterval(this.pollInterval);
        }
        if (this.broadcastChannel) {
            this.broadcastChannel.close();
        }
    }
}

// 전역 실시간 클라이언트
window.realtimeClient = new RealtimeClient();