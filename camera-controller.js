// 카메라 연결 관리자
class CameraController {
    constructor() {
        this.connectionId = null;
        this.socket = null;
        this.isConnected = false;
        this.setupUI();
        this.setupWebSocket();
    }

    setupUI() {
        const connectBtn = document.getElementById('connect-camera-btn');
        if (connectBtn) {
            connectBtn.addEventListener('click', () => this.showQRCode());
        } else {
            console.log('🔍 원격 카메라 UI가 비활성화됨 (주석 처리됨)');
        }
    }

    generateConnectionId() {
        return Math.random().toString(36).substring(2, 8).toUpperCase();
    }

    showQRCode() {
        // UI 요소 존재 확인
        const qrContainer = document.getElementById('qr-code');
        const connectBtn = document.getElementById('connect-camera-btn');
        const qrCodeContainer = document.getElementById('qr-code-container');
        
        if (!qrContainer || !connectBtn || !qrCodeContainer) {
            console.log('⚠️ 원격 카메라 UI 요소들이 비활성화되어 있음');
            return;
        }
        
        this.connectionId = this.generateConnectionId();
        console.log('🔗 생성된 연결 ID:', this.connectionId);
        
        // Firebase에 연결 ID 설정 (Firebase 준비될 때까지 대기)
        this.setupFirebaseConnection();
        
        // QR 코드 생성
        const baseUrl = window.location.origin + window.location.pathname;
        const cameraUrl = `${baseUrl.replace('index.html', '')}camera.html?id=${this.connectionId}`;
        
        // QR 코드 표시
        qrContainer.innerHTML = '';
        
        console.log('📱 카메라 URL:', cameraUrl);
        // 다중 QR 서비스 사용
        this.createQRCode(qrContainer, cameraUrl);

        // UI 업데이트
        connectBtn.style.display = 'none';
        qrCodeContainer.style.display = 'block';
        
        // 연결 대기 시작
        this.waitForConnection();
    }
    
    setupFirebaseConnection() {
        const setConnectionId = () => {
            if (window.firebaseRealtime && window.firebaseRealtime.isInitialized) {
                console.log('🔥 컴퓨터에서 Firebase 연결 ID 설정:', this.connectionId);
                window.firebaseRealtime.setConnectionId(this.connectionId);
            } else {
                console.log('⏳ Firebase 대기 중... 연결 ID 설정 재시도');
                setTimeout(setConnectionId, 500);
            }
        };
        setConnectionId();
    }

    createQRCode(container, url) {
        // 대안 1: QR Server API 사용
        const encodedUrl = encodeURIComponent(url);
        const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodedUrl}`;
        
        const img = document.createElement('img');
        img.src = qrImageUrl;
        img.style.width = '150px';
        img.style.height = '150px';
        img.style.border = '1px solid #ddd';
        img.style.borderRadius = '4px';
        img.alt = 'QR Code';
        
        // 이미지 로드 에러 처리 - 다른 서비스 시도
        img.onerror = () => {
            console.warn('첫 번째 QR 서비스 실패, 두 번째 시도');
            this.tryAlternativeQR(container, url, img);
        };
        
        container.appendChild(img);
        
        // URL도 텍스트로 표시 (QR 코드 백업)
        const urlText = document.createElement('p');
        urlText.style.fontSize = '10px';
        urlText.style.wordBreak = 'break-all';
        urlText.style.margin = '10px 0 5px 0';
        urlText.style.padding = '5px';
        urlText.style.background = '#f5f5f5';
        urlText.style.borderRadius = '3px';
        urlText.innerHTML = `<strong>스마트폰으로 직접 접속:</strong><br>${url}`;
        container.appendChild(urlText);
        
        // 연결 ID도 표시 (수동 입력용)
        const codeText = document.createElement('p');
        codeText.style.fontSize = '12px';
        codeText.style.margin = '10px 0';
        codeText.style.padding = '8px';
        codeText.style.background = '#e3f2fd';
        codeText.style.borderRadius = '4px';
        codeText.style.textAlign = 'center';
        codeText.style.fontWeight = 'bold';
        codeText.innerHTML = `연결 코드: <span style="color: #1976d2; font-size: 16px;">${this.connectionId}</span>`;
        container.appendChild(codeText);
        
        console.log('QR Server API 사용');
    }

    tryAlternativeQR(container, url, failedImg) {
        // 대안 2: QuickChart API 사용
        const encodedUrl = encodeURIComponent(url);
        const altQrUrl = `https://quickchart.io/qr?text=${encodedUrl}&size=150`;
        
        failedImg.src = altQrUrl;
        failedImg.onerror = () => {
            console.warn('모든 QR 서비스 실패, URL과 코드만 표시');
            failedImg.style.display = 'none';
            
            // 대체 안내 메시지
            const fallbackMsg = document.createElement('div');
            fallbackMsg.style.width = '150px';
            fallbackMsg.style.height = '150px';
            fallbackMsg.style.border = '2px dashed #ccc';
            fallbackMsg.style.borderRadius = '4px';
            fallbackMsg.style.display = 'flex';
            fallbackMsg.style.alignItems = 'center';
            fallbackMsg.style.justifyContent = 'center';
            fallbackMsg.style.fontSize = '12px';
            fallbackMsg.style.color = '#666';
            fallbackMsg.style.textAlign = 'center';
            fallbackMsg.innerHTML = '📱<br>아래 URL을<br>스마트폰으로<br>접속하세요';
            
            container.insertBefore(fallbackMsg, failedImg.nextSibling);
        };
    }

    setupWebSocket() {
        // Firebase Realtime Database 사용
        console.log('🔥 Firebase 실시간 통신 설정 시작');
        
        // Firebase가 준비될 때까지 대기
        this.waitForFirebaseAndSetupListener();
    }
    
    waitForFirebaseAndSetupListener() {
        console.log('⏳ Firebase 준비 대기 중...');
        const checkFirebase = () => {
            if (window.firebaseRealtime && window.firebaseRealtime.isInitialized) {
                console.log('✅ Firebase 준비됨, 리스너 설정');
                window.firebaseRealtime.onMessage((data) => {
                    console.log('📨 컴퓨터에서 메시지 수신:', data);
                    this.handleMessage(data);
                });
            } else {
                console.log('⏳ Firebase 대기 중...', {
                    hasFirebaseRealtime: !!window.firebaseRealtime,
                    isInitialized: window.firebaseRealtime?.isInitialized
                });
                setTimeout(checkFirebase, 500);
            }
        };
        checkFirebase();
    }

    startPolling() {
        // localStorage 폴백 (같은 브라우저 내에서만 작동)
        this.pollInterval = setInterval(() => {
            if (this.connectionId) {
                const message = localStorage.getItem(`camera_${this.connectionId}`);
                if (message) {
                    const data = JSON.parse(message);
                    this.handleMessage(data);
                    localStorage.removeItem(`camera_${this.connectionId}`);
                }
            }
        }, 100);
    }

    waitForConnection() {
        // 연결 타임아웃 (30초)
        setTimeout(() => {
            if (!this.isConnected) {
                this.resetUI();
                alert('연결 시간이 초과되었습니다. 다시 시도해주세요.');
            }
        }, 30000);
    }

    handleMessage(data) {
        console.log('📨 메시지 처리:', data);
        switch (data.type) {
            case 'camera_connected':
                console.log('📱 카메라 연결됨!');
                this.onCameraConnected();
                break;
            case 'smile_detected':
                console.log('😊 웃음 감지됨!');
                this.onSmileDetected();
                break;
            case 'smile_stopped':
                console.log('😐 웃음 멈춤!');
                this.onSmileStopped();
                break;
            case 'angry_detected':
                console.log('😡 화남 감지됨!');
                this.onAngryDetected();
                break;
            case 'angry_stopped':
                console.log('😐 화남 멈춤!');
                this.onAngryStopped();
                break;
            case 'test_message':
                console.log('🧪 테스트 메시지 수신:', data.message);
                break;
            default:
                console.log('❓ 알 수 없는 메시지 타입:', data.type);
        }
    }

    onCameraConnected() {
        this.isConnected = true;
        
        // UI 요소 존재 확인
        const qrCodeContainer = document.getElementById('qr-code-container');
        const cameraConnected = document.getElementById('camera-connected');
        
        if (qrCodeContainer) {
            qrCodeContainer.style.display = 'none';
        }
        if (cameraConnected) {
            cameraConnected.style.display = 'block';
        }
        
        console.log('카메라 연결됨!');
    }

    onSmileDetected() {
        // EmotionHandler에게 위임
        if (window.emotionHandler) {
            window.emotionHandler.onSmileDetected();
        }
    }

    onSmileStopped() {
        // EmotionHandler에게 위임
        if (window.emotionHandler) {
            window.emotionHandler.onSmileStopped();
        }
    }

    onAngryDetected() {
        // EmotionHandler에게 위임
        if (window.emotionHandler) {
            window.emotionHandler.onAngryDetected();
        }
    }

    onAngryStopped() {
        // EmotionHandler에게 위임
        if (window.emotionHandler) {
            window.emotionHandler.onAngryStopped();
        }
    }


    resetUI() {
        // UI 요소 존재 확인
        const connectBtn = document.getElementById('connect-camera-btn');
        const qrCodeContainer = document.getElementById('qr-code-container');
        const cameraConnected = document.getElementById('camera-connected');
        
        if (connectBtn) {
            connectBtn.style.display = 'block';
        }
        if (qrCodeContainer) {
            qrCodeContainer.style.display = 'none';
        }
        if (cameraConnected) {
            cameraConnected.style.display = 'none';
        }
        
        this.isConnected = false;
        this.connectionId = null;
    }

    // 외부에서 메시지 전송 (스마트폰에서 호출)
    sendMessage(data) {
        if (this.connectionId) {
            localStorage.setItem(`camera_${this.connectionId}`, JSON.stringify(data));
        }
    }
}

// 전역 인스턴스 생성
window.cameraController = new CameraController();