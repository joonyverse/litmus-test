// Firebase Realtime Database를 사용한 실시간 통신
class FirebaseRealtime {
    constructor() {
        this.db = null;
        this.connectionId = null;
        this.messageCallback = null;
        this.isInitialized = false;
        
        // 데모용 Firebase 설정 (실제로는 본인 프로젝트 설정 필요)
        this.firebaseConfig = {
            apiKey: "AIzaSyDemoKey123456789",
            authDomain: "litmus-test-demo.firebaseapp.com",
            databaseURL: "https://litmus-test-demo-default-rtdb.firebaseio.com",
            projectId: "litmus-test-demo",
            storageBucket: "litmus-test-demo.appspot.com",
            messagingSenderId: "123456789",
            appId: "1:123456789:web:abc123def456"
        };
        
        this.init();
    }

    async init() {
        try {
            // Firebase 초기화 시도
            if (typeof firebase !== 'undefined') {
                if (!firebase.apps.length) {
                    firebase.initializeApp(this.firebaseConfig);
                }
                this.db = firebase.database();
                this.isInitialized = true;
                console.log('Firebase 연결 성공');
            } else {
                console.warn('Firebase SDK 로드 실패, localStorage 폴백 사용');
                this.useFallback();
            }
        } catch (error) {
            console.warn('Firebase 초기화 실패:', error.message);
            this.useFallback();
        }
    }

    useFallback() {
        console.log('localStorage + BroadcastChannel 폴백 사용');
        this.isInitialized = true;
        
        // BroadcastChannel로 같은 브라우저 내 탭 간 통신
        if ('BroadcastChannel' in window) {
            this.setupBroadcastChannel();
        } else {
            this.setupLocalStoragePolling();
        }
    }

    setupBroadcastChannel() {
        // 전역 채널 사용 (모든 연결 ID 공유)
        this.broadcastChannel = new BroadcastChannel('litmus_global');
        this.broadcastChannel.onmessage = (event) => {
            const data = event.data;
            if (data.connectionId === this.connectionId && this.messageCallback) {
                console.log('BroadcastChannel 메시지 수신:', data);
                this.messageCallback(data);
            }
        };
    }

    setupLocalStoragePolling() {
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
                        console.warn('localStorage 메시지 파싱 실패:', error);
                    }
                }
            }
        }, 100);
    }

    setConnectionId(connectionId) {
        this.connectionId = connectionId;
        console.log('연결 ID 설정:', connectionId);
        
        if (this.db) {
            // Firebase 리스너 설정
            this.setupFirebaseListener();
        }
    }

    setupFirebaseListener() {
        if (!this.db || !this.connectionId) return;

        const messagesRef = this.db.ref(`connections/${this.connectionId}/messages`);
        
        // 새 메시지 리스너
        messagesRef.on('child_added', (snapshot) => {
            const data = snapshot.val();
            if (data && this.messageCallback) {
                console.log('Firebase 메시지 수신:', data);
                this.messageCallback(data);
                
                // 메시지 처리 후 삭제 (정리)
                snapshot.ref.remove();
            }
        });
    }

    sendMessage(data, from = 'unknown') {
        if (!this.isInitialized) {
            console.warn('Firebase 초기화 대기 중...');
            setTimeout(() => this.sendMessage(data, from), 500);
            return;
        }

        const message = {
            ...data,
            from: from,
            connectionId: this.connectionId,
            timestamp: Date.now()
        };

        console.log('메시지 전송:', message);

        if (this.db && this.connectionId) {
            // Firebase로 전송
            try {
                this.db.ref(`connections/${this.connectionId}/messages`).push(message);
                console.log('Firebase로 메시지 전송 성공');
            } catch (error) {
                console.warn('Firebase 전송 실패, 폴백 사용:', error);
                this.sendViaFallback(message);
            }
        } else {
            // 폴백 방법 사용
            this.sendViaFallback(message);
        }
    }

    sendViaFallback(message) {
        // BroadcastChannel 사용
        if (this.broadcastChannel) {
            this.broadcastChannel.postMessage(message);
        }
        
        // localStorage 백업
        try {
            localStorage.setItem(`camera_${this.connectionId}`, JSON.stringify(message));
        } catch (error) {
            console.warn('localStorage 저장 실패:', error);
        }
    }

    onMessage(callback) {
        this.messageCallback = callback;
    }

    cleanup() {
        if (this.db && this.connectionId) {
            this.db.ref(`connections/${this.connectionId}`).off();
        }
        if (this.broadcastChannel) {
            this.broadcastChannel.close();
        }
        if (this.pollInterval) {
            clearInterval(this.pollInterval);
        }
    }
}

// 전역 Firebase 클라이언트
window.firebaseRealtime = new FirebaseRealtime();