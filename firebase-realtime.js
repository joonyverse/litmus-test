// Firebase Realtime Database를 사용한 실시간 통신
class FirebaseRealtime {
    constructor() {
        this.db = null;
        this.connectionId = null;
        this.messageCallback = null;
        this.isInitialized = false;
        
        // Firebase 설정
        this.firebaseConfig = {
            apiKey: "AIzaSyDcKY0kO8gqzj2t118Nv6EXA6RVc_p5sHA",
            authDomain: "litmus-test-5b231.firebaseapp.com",
            databaseURL: "https://litmus-test-5b231-default-rtdb.firebaseio.com",
            projectId: "litmus-test-5b231",
            storageBucket: "litmus-test-5b231.firebasestorage.app",
            messagingSenderId: "839883886547",
            appId: "1:839883886547:web:dcc363f296c7ca87c4a926"
        };
        
        this.init();
    }

    async init() {
        // Firebase SDK 로딩 대기
        let attempts = 0;
        const maxAttempts = 50; // 5초 대기
        
        const waitForFirebase = () => {
            return new Promise((resolve, reject) => {
                const checkFirebase = () => {
                    attempts++;
                    
                    if (typeof firebase !== 'undefined') {
                        console.log(`✅ Firebase SDK 로드됨 (${attempts}번째 시도)`);
                        resolve();
                    } else if (attempts >= maxAttempts) {
                        reject(new Error('Firebase SDK 로딩 타임아웃'));
                    } else {
                        console.log(`⏳ Firebase SDK 로딩 대기 중... (${attempts}/${maxAttempts})`);
                        setTimeout(checkFirebase, 100);
                    }
                };
                checkFirebase();
            });
        };

        try {
            await waitForFirebase();
            
            // Firebase 초기화
            if (!firebase.apps.length) {
                firebase.initializeApp(this.firebaseConfig);
                console.log('🔥 Firebase 앱 초기화 완료');
            }
            
            this.db = firebase.database();
            this.isInitialized = true;
            console.log('🔥 Firebase Realtime Database 연결 성공!');
            
            // 연결 테스트
            this.testConnection();
            
        } catch (error) {
            console.error('❌ Firebase 초기화 실패:', error.message);
            throw error;
        }
    }

    testConnection() {
        // Firebase 연결 테스트
        const testRef = this.db.ref('test');
        testRef.set({
            message: 'Firebase 연결 테스트',
            timestamp: Date.now()
        }).then(() => {
            console.log('✅ Firebase 쓰기 테스트 성공');
            testRef.remove(); // 테스트 데이터 삭제
        }).catch((error) => {
            console.error('❌ Firebase 쓰기 테스트 실패:', error);
            throw error;
        });
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
        if (!this.db || !this.connectionId) {
            console.warn('⚠️ Firebase DB 또는 연결 ID 없어서 리스너 설정 불가');
            return;
        }

        const messagesRef = this.db.ref(`connections/${this.connectionId}/messages`);
        console.log('📡 Firebase 리스너 설정:', `connections/${this.connectionId}/messages`);
        console.log('🔗 Firebase 콘솔 확인:', `https://console.firebase.google.com/project/litmus-test-5b231/database/litmus-test-5b231-default-rtdb/data/connections/${this.connectionId}`);
        
        // 새 메시지 리스너
        messagesRef.on('child_added', (snapshot) => {
            const data = snapshot.val();
            console.log('📨 Firebase에서 메시지 수신:', data);
            
            if (data && this.messageCallback) {
                console.log('📨 메시지 콜백 실행:', data);
                this.messageCallback(data);
                
                // 메시지 처리 후 삭제 (정리)
                snapshot.ref.remove().then(() => {
                    console.log('🗑️ 처리된 메시지 삭제 완료');
                });
            }
        });
        
        // 연결 상태 모니터링
        messagesRef.on('value', (snapshot) => {
            const data = snapshot.val();
            console.log('📊 현재 Firebase 데이터:', data);
        });
    }

    sendMessage(data, from = 'unknown') {
        console.log('📤 sendMessage 호출됨:', { data, from, isInitialized: this.isInitialized, hasDB: !!this.db, connectionId: this.connectionId });
        
        if (!this.isInitialized) {
            console.error('❌ Firebase가 초기화되지 않음');
            return;
        }

        if (!this.db || !this.connectionId) {
            console.error('❌ Firebase DB 또는 연결 ID 없음');
            return;
        }

        const message = {
            ...data,
            from: from,
            connectionId: this.connectionId,
            timestamp: Date.now()
        };

        console.log('📤 전송할 메시지:', message);

        const messagesRef = this.db.ref(`connections/${this.connectionId}/messages`);
        console.log('📤 Firebase 경로:', `connections/${this.connectionId}/messages`);
        
        messagesRef.push(message)
            .then(() => {
                console.log('✅ Firebase로 메시지 전송 성공');
            })
            .catch((error) => {
                console.error('❌ Firebase 전송 실패:', error);
            });
    }


    onMessage(callback) {
        this.messageCallback = callback;
    }

    cleanup() {
        if (this.db && this.connectionId) {
            this.db.ref(`connections/${this.connectionId}`).off();
        }
    }
}

// 전역 Firebase 클라이언트
window.firebaseRealtime = new FirebaseRealtime();