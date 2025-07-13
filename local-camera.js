// 로컬 카메라를 사용한 웃음 감지 모듈
class LocalSmileDetector {
    constructor() {
        this.video = null;
        this.canvas = null;
        this.ctx = null;
        this.faceMesh = null;
        this.camera = null;
        this.isSmiling = false;
        this.isAngry = false;
        this.isActive = false;
        this.onSmileCallback = null;
        this.onStopSmileCallback = null;
        this.onAngryCallback = null;
        this.onStopAngryCallback = null;

        // 웃음 및 화남 감지 파라미터들 (조절 가능)
        this.smileParams = {
            // 웃음 감지 파라미터
            smileRatioThreshold: 1.8,    // 웃음 비율 임계값 (가로/세로 비율)
            wideSmileThreshold: 0.08,    // 넓은 웃음 임계값 (입 가로 길이)
            cornerRaiseStrength: 1.0,    // 입꼴리 올라감 감도 (0.5-2.0)
            detectionSensitivity: 1.0,   // 전체 감지 감도 (0.1-3.0)
            stabilityFrames: 2,          // 안정성을 위한 연속 프레임 수 (3→2로 줄여서 더 빠른 반응)
            debug: false,                // 디버그 정보 표시

            // 감정 감지 활성화/비활성화
            smileEnabled: true,              // 웃음 감지 활성화/비활성화
            angryEnabled: true,              // 화남 감지 활성화/비활성화

            // 화남 감지 파라미터 (민감도 낮춤)
            angryBrowEyeThreshold: 0.015,    // 눈썹-눈 거리 임계값 (0.025→0.015로 더 엄격하게)
            angryMouthThreshold: 0.015,      // 입꼬리 내림 임계값 (0.002→0.005로 더 엄격하게)
            angryMouthCompressThreshold: 0.005, // 입 압축 임계값 (0.008→0.005로 더 엄격하게)
            angryEyeSquintThreshold: 0.005,   // 눈 찡그림 임계값 (0.008→0.005로 더 엄격하게)
            angryCheekThreshold: 0.03,       // 볼 긴장 임계값 (0.04→0.03으로 더 엄격하게)
            angryRequiredConditions: 2       // 필요한 조건 개수 (OR→AND 방식으로 변경)
        };

        // 웃음 상태 안정성을 위한 프레임 카운터
        this.smileFrameCount = 0;
        this.noSmileFrameCount = 0;

        // 화남 상태 안정성을 위한 프레임 카운터
        this.angryFrameCount = 0;
        this.noAngryFrameCount = 0;

        this.init();
    }

    async init() {
        console.log('🎥 로컬 카메라 웃음 감지 초기화');
        await this.createVideoElement();
        await this.setupFaceMesh();
        this.setupCamera();
    }

    async createVideoElement() {
        // 비디오 엘리먼트 생성 (숨김)
        this.video = document.createElement('video');
        this.video.style.display = 'none';
        this.video.autoplay = true;
        this.video.muted = true;
        this.video.playsInline = true;
        document.body.appendChild(this.video);

        // PIP 스타일 캔버스 생성
        this.canvas = document.createElement('canvas');
        this.canvas.style.position = 'fixed';
        this.canvas.style.bottom = '20px';
        this.canvas.style.left = '20px';
        this.canvas.style.width = '240px';
        this.canvas.style.height = '180px';
        this.canvas.style.borderRadius = '30px';
        // this.canvas.style.border = '3px solid #ffffff';
        this.canvas.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.3)';
        this.canvas.style.zIndex = '9999';
        this.canvas.style.display = 'none';
        this.canvas.style.cursor = 'move';
        this.canvas.style.backgroundColor = '#000';
        this.canvas.style.transition = 'all 0.2s ease';

        // 호버 효과
        this.canvas.addEventListener('mouseenter', () => {
            this.canvas.style.transform = 'scale(1.02)';
            this.canvas.style.boxShadow = '0 12px 40px rgba(0, 0, 0, 0.4)';
        });

        this.canvas.addEventListener('mouseleave', () => {
            this.canvas.style.transform = 'scale(1)';
            this.canvas.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.3)';
        });

        document.body.appendChild(this.canvas);


        // 드래그 기능 추가
        this.setupDragFunctionality();

        // 간단한 리사이즈 기능 추가
        this.setupSimpleResize();

        this.ctx = this.canvas.getContext('2d');
    }





    setupDragFunctionality() {
        let isDragging = false;
        let startX, startY, initialX, initialY;

        this.canvas.addEventListener('mousedown', (e) => {
            isDragging = true;

            // 현재 위치 저장
            const rect = this.canvas.getBoundingClientRect();
            startX = e.clientX;
            startY = e.clientY;

            // 실제 화면 위치를 기반으로 left, bottom 값 계산
            initialX = rect.left; // left 값
            initialY = window.innerHeight - rect.bottom; // bottom 값 계산

            // right, top 속성 제거하고 left, bottom으로 통일
            this.canvas.style.right = 'auto';
            this.canvas.style.top = 'auto';
            this.canvas.style.left = initialX + 'px';
            this.canvas.style.bottom = initialY + 'px';

            this.canvas.style.cursor = 'grabbing';
            this.canvas.style.transition = 'none'; // 드래그 중에는 애니메이션 끄기

            e.preventDefault();
        });

        document.addEventListener('mousemove', (e) => {
            if (!isDragging) return;

            const deltaX = e.clientX - startX;
            const deltaY = startY - e.clientY; // Y축은 반대 (bottom 기준)

            // 새로운 위치 계산
            let newLeft = initialX + deltaX;
            let newBottom = initialY + deltaY;

            // 화면 경계 체크
            const maxLeft = window.innerWidth - this.canvas.offsetWidth;
            const maxBottom = window.innerHeight - this.canvas.offsetHeight;

            newLeft = Math.max(0, Math.min(newLeft, maxLeft));
            newBottom = Math.max(0, Math.min(newBottom, maxBottom));

            this.canvas.style.left = newLeft + 'px';
            this.canvas.style.bottom = newBottom + 'px';
            this.canvas.style.right = 'auto';
            this.canvas.style.top = 'auto';

        });

        document.addEventListener('mouseup', () => {
            if (isDragging) {
                isDragging = false;
                this.canvas.style.cursor = 'move';
                this.canvas.style.transition = 'all 0.2s ease'; // 애니메이션 다시 켜기

                // 스냅 기능 - 화면 가장자리에 가까우면 스냅
                this.snapToEdges();
            }
        });
    }

    snapToEdges() {
        const rect = this.canvas.getBoundingClientRect();
        const threshold = 50; // 스냅 활성화 거리

        let snapLeft = null;
        let snapBottom = null;

        // 왼쪽 가장자리에 스냅
        if (rect.left < threshold) {
            snapLeft = 20;
        }
        // 오른쪽 가장자리에 스냅  
        else if (rect.right > window.innerWidth - threshold) {
            snapLeft = window.innerWidth - this.canvas.offsetWidth - 20;
        }

        // 아래쪽 가장자리에 스냅
        if (rect.bottom > window.innerHeight - threshold) {
            snapBottom = 20;
        }
        // 위쪽 가장자리에 스냅
        else if (rect.top < threshold) {
            snapBottom = window.innerHeight - this.canvas.offsetHeight - 20;
        }

        // 스냅 적용
        if (snapLeft !== null) {
            this.canvas.style.left = snapLeft + 'px';
            this.canvas.style.right = 'auto';
        }
        if (snapBottom !== null) {
            this.canvas.style.bottom = snapBottom + 'px';
            this.canvas.style.top = 'auto';
        }

    }

    setupSimpleResize() {
        let isResizing = false;
        let resizeDirection = '';
        let startX, startY, startWidth, startHeight, startLeft, startBottom;

        // 마우스 움직임으로 커서 변경
        this.canvas.addEventListener('mousemove', (e) => {
            if (isResizing) return;

            const rect = this.canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const edge = 25; // 가장자리 감지 범위

            let cursor = 'move';
            let direction = '';

            // 모서리와 가장자리 감지
            if (x < edge && y < edge) {
                cursor = 'nw-resize';
                direction = 'nw';
            } else if (x > rect.width - edge && y < edge) {
                cursor = 'ne-resize';
                direction = 'ne';
            } else if (x < edge && y > rect.height - edge) {
                cursor = 'sw-resize';
                direction = 'sw';
            } else if (x > rect.width - edge && y > rect.height - edge) {
                cursor = 'se-resize';
                direction = 'se';
            } else if (x < edge) {
                cursor = 'w-resize';
                direction = 'w';
            } else if (x > rect.width - edge) {
                cursor = 'e-resize';
                direction = 'e';
            } else if (y < edge) {
                cursor = 'n-resize';
                direction = 'n';
            } else if (y > rect.height - edge) {
                cursor = 's-resize';
                direction = 's';
            }

            this.canvas.style.cursor = cursor;
            this.canvas.setAttribute('data-resize-direction', direction);
        });

        // 리사이즈 시작
        this.canvas.addEventListener('mousedown', (e) => {
            const direction = this.canvas.getAttribute('data-resize-direction');
            if (!direction) return;

            isResizing = true;
            resizeDirection = direction;

            const rect = this.canvas.getBoundingClientRect();
            startX = e.clientX;
            startY = e.clientY;
            startWidth = rect.width;
            startHeight = rect.height;
            startLeft = rect.left;
            startBottom = window.innerHeight - rect.bottom;

            this.canvas.style.transition = 'none';
            e.stopPropagation(); // 드래그 방지
            e.preventDefault();
        });

        // 리사이즈 진행
        document.addEventListener('mousemove', (e) => {
            if (!isResizing) return;

            const deltaX = e.clientX - startX;
            const deltaY = e.clientY - startY;

            let newWidth = startWidth;
            let newHeight = startHeight;
            let newLeft = startLeft;
            let newBottom = startBottom;

            // 간단한 방향별 계산
            const aspectRatio = 4. / 3.;
            if (resizeDirection == 'e') {
                newWidth = startWidth + deltaX;
            }
            else if (resizeDirection == 'ne') {
                newWidth = startWidth + deltaX;
                newHeight = startHeight - deltaY;
            }
            else if (resizeDirection == 'se') {
                newHeight = startHeight + deltaY;
                newBottom = startBottom + (startHeight - newHeight);
                newWidth = startWidth + deltaX;
            }
            else if (resizeDirection == 'w') {
                newWidth = startWidth - deltaX;
                newLeft = startLeft + (startWidth - newWidth);
            }
            else if (resizeDirection == 'nw') {
                newHeight = startHeight - deltaY;
                newWidth = startWidth - deltaX;
                newLeft = startLeft + (startWidth - newWidth);
            }
            else if (resizeDirection == 'sw') {
                newHeight = startHeight + deltaY;
                newBottom = startBottom + (startHeight - newHeight);
                newWidth = startWidth - deltaX;
                newLeft = startLeft + (startWidth - newWidth);
            }
            else if (resizeDirection.includes('s')) {
                newHeight = startHeight + deltaY;
                newBottom = startBottom + (startHeight - newHeight);
            }
            else if (resizeDirection.includes('n')) {
                newHeight = startHeight - deltaY;
            }

            // 화면 경계 제한
            newWidth = Math.min(newWidth, window.innerWidth * 0.8);
            newHeight = Math.min(newHeight, window.innerHeight * 0.8);

            // 적용
            this.canvas.style.width = newWidth + 'px';
            this.canvas.style.height = newHeight + 'px';
            this.canvas.style.left = newLeft + 'px';
            this.canvas.style.bottom = newBottom + 'px';
        });

        // 리사이즈 종료
        document.addEventListener('mouseup', () => {
            if (isResizing) {
                isResizing = false;
                resizeDirection = '';
                this.canvas.style.transition = 'all 0.2s ease';
                this.canvas.style.cursor = 'move';
            }
        });
    }

    async setupFaceMesh() {
        try {
            this.faceMesh = new FaceMesh({
                locateFile: (file) => {
                    return `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`;
                }
            });

            this.faceMesh.setOptions({
                maxNumFaces: 1,
                refineLandmarks: true,
                minDetectionConfidence: 0.7,
                minTrackingConfidence: 0.7
            });

            this.faceMesh.onResults((results) => this.onResults(results));
            console.log('✅ MediaPipe FaceMesh 설정 완료');
        } catch (error) {
            console.error('❌ MediaPipe FaceMesh 설정 실패:', error);
        }
    }

    setupCamera() {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            console.error('❌ 카메라를 지원하지 않는 브라우저입니다');
            return;
        }

        this.camera = new Camera(this.video, {
            onFrame: async () => {
                if (this.faceMesh && this.isActive) {
                    await this.faceMesh.send({ image: this.video });
                }
            },
            width: 640,
            height: 480
        });
    }

    async start() {
        if (!this.camera) {
            console.error('❌ 카메라가 초기화되지 않음');
            return false;
        }

        try {
            await this.camera.start();
            this.isActive = true;
            console.log('✅ 로컬 카메라 시작됨');
            return true;
        } catch (error) {
            console.error('❌ 카메라 시작 실패:', error);
            return false;
        }
    }

    stop() {
        if (this.camera) {
            this.camera.stop();
        }
        this.isActive = false;
        console.log('⏹️ 로컬 카메라 중지됨');
    }

    onResults(results) {
        if (!this.isActive) return;

        // 랜드마크 시각화 (디버깅용)
        this.drawLandmarks(results);

        // 웃음 감지
        const currentlySmiling = this.detectSmile(results);

        // 화남 감지
        const currentlyAngry = this.detectAngry(results);

        if (currentlySmiling !== this.isSmiling) {
            this.isSmiling = currentlySmiling;

            if (this.isSmiling) {
                console.log('😊 웃음 감지됨 (로컬)');
                // EmotionHandler에게 직접 전달
                if (window.emotionHandler) {
                    window.emotionHandler.onSmileDetected();
                }
                // 기존 콜백도 유지 (호환성)
                if (this.onSmileCallback) {
                    this.onSmileCallback();
                }
            } else {
                console.log('😐 웃음 멈춤 (로컬)');
                // EmotionHandler에게 직접 전달
                if (window.emotionHandler) {
                    window.emotionHandler.onSmileStopped();
                }
                // 기존 콜백도 유지 (호환성)
                if (this.onStopSmileCallback) {
                    this.onStopSmileCallback();
                }
            }
        }

        if (currentlyAngry !== this.isAngry) {
            this.isAngry = currentlyAngry;

            if (this.isAngry) {
                console.log('😡 화남 감지됨 (로컬)');
                // EmotionHandler에게 직접 전달
                if (window.emotionHandler) {
                    window.emotionHandler.onAngryDetected();
                }
                // 기존 콜백도 유지 (호환성)
                if (this.onAngryCallback) {
                    this.onAngryCallback();
                }
            } else {
                console.log('😐 화남 멈춤 (로컬)');
                // EmotionHandler에게 직접 전달
                if (window.emotionHandler) {
                    window.emotionHandler.onAngryStopped();
                }
                // 기존 콜백도 유지 (호환성)
                if (this.onStopAngryCallback) {
                    this.onStopAngryCallback();
                }
            }
        }
    }

    drawLandmarks(results) {
        if (!this.canvas || !this.ctx) return;

        // 캔버스 크기 조정
        this.canvas.width = this.video.videoWidth || 640;
        this.canvas.height = this.video.videoHeight || 480;

        // 캔버스 지우기
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // 비디오 영상을 캔버스에 먼저 그리기
        if (this.video.videoWidth > 0 && this.video.videoHeight > 0) {
            this.ctx.drawImage(this.video, 0, 0, this.canvas.width, this.canvas.height);
        }

        if (results.multiFaceLandmarks) {
            for (const landmarks of results.multiFaceLandmarks) {
                this.drawFaceLandmarks(landmarks);
            }
        }
    }

    drawFaceLandmarks(landmarks) {
        if (window.drawConnectors) {
            window.drawConnectors(this.ctx, landmarks, window.FACEMESH_TESSELATION, { color: '#C0C0C0', lineWidth: 1 });
            window.drawConnectors(this.ctx, landmarks, window.FACEMESH_RIGHT_EYEBROW, { color: '#FF3030' });
            window.drawConnectors(this.ctx, landmarks, window.FACEMESH_LEFT_EYEBROW, { color: '#FF3030' });
            window.drawConnectors(this.ctx, landmarks, window.FACEMESH_LEFT_EYE, { color: '#30FF30' });
            window.drawConnectors(this.ctx, landmarks, window.FACEMESH_RIGHT_EYE, { color: '#30FF30' });
            window.drawConnectors(this.ctx, landmarks, window.FACEMESH_LEFT_IRIS, { color: '#FF3030' });
            window.drawConnectors(this.ctx, landmarks, window.FACEMESH_RIGHT_IRIS, { color: '#FF3030' });
            window.drawConnectors(this.ctx, landmarks, window.FACEMESH_LIPS, { color: '#E0E0E0' });
            window.drawConnectors(this.ctx, landmarks, window.FACEMESH_FACE_OVAL, { color: '#E0E0E0' });
        } else {
            this.drawFallbackLandmarks(landmarks);
        }
        // 입 관련 랜드마크 특별 강조
        const mouthIndices = [61, 291, 12, 15];
        for (const index of mouthIndices) {
            const landmark = landmarks[index];
            if (landmark && typeof landmark.x === 'number' && typeof landmark.y === 'number') {
                const x = landmark.x * this.canvas.width;
                const y = landmark.y * this.canvas.height;
                this.ctx.fillStyle = '#FF0000';
                this.ctx.beginPath();
                this.ctx.arc(x, y, 6, 0, 2 * Math.PI);
                this.ctx.fill();
                this.ctx.fillStyle = '#FFFFFF';
                this.ctx.font = '12px Arial';
                this.ctx.fillText(`${index}:(${landmark.x.toFixed(2)},${landmark.y.toFixed(2)})`, x + 8, y - 8);
            }
        }
    }

    drawFallbackLandmarks(landmarks) {
        // DrawingUtils가 없을 때 사용하는 기본 그리기 방식
        this.ctx.fillStyle = '#00FF00';
        for (let i = 0; i < landmarks.length; i++) {
            const landmark = landmarks[i];
            if (landmark && typeof landmark.x === 'number' && typeof landmark.y === 'number') {
                const x = landmark.x * this.canvas.width;
                const y = landmark.y * this.canvas.height;

                if (landmark.x >= 0 && landmark.x <= 1 && landmark.y >= 0 && landmark.y <= 1) {
                    this.ctx.beginPath();
                    this.ctx.arc(x, y, 1, 0, 2 * Math.PI);
                    this.ctx.fill();
                }
            }
        }
    }


    detectSmile(results) {
        // 웃음 감지가 비활성화된 경우 항상 false 반환
        if (!this.smileParams.smileEnabled) {
            this.noSmileFrameCount++;
            this.smileFrameCount = 0;
            return this.stabilizeSmileDetection(false);
        }

        if (!results.multiFaceLandmarks || results.multiFaceLandmarks.length === 0) {
            this.noSmileFrameCount++;
            this.smileFrameCount = 0;
            return this.stabilizeSmileDetection(false);
        }

        const landmarks = results.multiFaceLandmarks[0];

        // 입 관련 랜드마크 (MediaPipe 468 포인트 기준)
        const leftMouth = landmarks[61];   // 입 왼쪽 끝
        const rightMouth = landmarks[291]; // 입 오른쪽 끝
        const upperMouth = landmarks[13];  // 윗입술 중앙
        const lowerMouth = landmarks[14];  // 아랫입술 중앙

        if (!leftMouth || !rightMouth || !upperMouth || !lowerMouth) {
            this.noSmileFrameCount++;
            this.smileFrameCount = 0;
            return this.stabilizeSmileDetection(false);
        }

        // 입 가로 길이
        const mouthWidth = Math.abs(rightMouth.x - leftMouth.x);

        // 입 높이
        const mouthHeight = Math.abs(lowerMouth.y - upperMouth.y);

        if (mouthHeight === 0) {
            this.noSmileFrameCount++;
            this.smileFrameCount = 0;
            return this.stabilizeSmileDetection(false);
        }

        // 웃음 비율 계산
        const smileRatio = mouthWidth / mouthHeight;

        // 입꼬리가 올라갔는지 확인 (감도 조절 가능)
        const mouthCenterY = (upperMouth.y + lowerMouth.y) / 2;
        const leftCornerRaise = (mouthCenterY - leftMouth.y) * this.smileParams.cornerRaiseStrength;
        const rightCornerRaise = (mouthCenterY - rightMouth.y) * this.smileParams.cornerRaiseStrength;
        const cornersRaised = (leftCornerRaise > 0.001) && (rightCornerRaise > 0.001);

        // 웃음 감지 조건 (감도 조절 적용)
        const adjustedSmileRatio = this.smileParams.smileRatioThreshold / this.smileParams.detectionSensitivity;
        const adjustedWideThreshold = this.smileParams.wideSmileThreshold / this.smileParams.detectionSensitivity;

        const isSmiling = smileRatio > adjustedSmileRatio && cornersRaised;
        const isWideSmile = mouthWidth > adjustedWideThreshold;

        const currentSmile = isSmiling || isWideSmile;

        // 디버그 정보 표시 (카메라 화면에)
        if (this.smileParams.debug) {
            this.drawDebugInfo(smileRatio, mouthWidth, cornersRaised, currentSmile);
        }

        // 프레임 카운터 업데이트
        if (currentSmile) {
            this.smileFrameCount++;
            this.noSmileFrameCount = 0;
        } else {
            this.noSmileFrameCount++;
            this.smileFrameCount = 0;
        }

        return this.stabilizeSmileDetection(currentSmile);
    }

    stabilizeSmileDetection(currentSmile) {
        // 안정성을 위한 연속 프레임 확인
        if (currentSmile && this.smileFrameCount >= this.smileParams.stabilityFrames) {
            return true;
        } else if (!currentSmile && this.noSmileFrameCount >= this.smileParams.stabilityFrames) {
            return false;
        }

        // 현재 상태 유지
        return this.isSmiling;
    }

    drawDebugInfo(smileRatio, mouthWidth, cornersRaised, currentSmile) {
        if (!this.ctx) return;

        // Ratio saturation (100 이상 시 제한)
        const displayRatio = Math.min(smileRatio, 100);
        const ratioText = smileRatio > 100 ? `${displayRatio.toFixed(2)} (SAT)` : displayRatio.toFixed(2);

        // 디버그 정보를 카메라 화면 왼쪽 상단에 표시
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(10, 10, 200, 80);

        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.font = '12px Arial';
        this.ctx.fillText(`Ratio: ${ratioText}`, 15, 30);
        this.ctx.fillText(`Width: ${mouthWidth.toFixed(3)}`, 15, 45);
        this.ctx.fillText(`Corners: ${cornersRaised}`, 15, 60);
        this.ctx.fillText(`Smile: ${currentSmile ? '😊' : '😐'}`, 15, 75);
    }

    detectAngry(results) {
        if (!results.multiFaceLandmarks || results.multiFaceLandmarks.length === 0) {
            this.noAngryFrameCount++;
            this.angryFrameCount = 0;
            return this.stabilizeAngryDetection(false);
        }

        const landmarks = results.multiFaceLandmarks[0];

        // 눈썹 관련 랜드마크 (화남 표정에서 눈썹이 아래로 내려감)
        const leftEyebrowInner = landmarks[55];  // 왼쪽 눈썹 안쪽
        const rightEyebrowInner = landmarks[285]; // 오른쪽 눈썹 안쪽
        const leftEye = landmarks[33];           // 왼쪽 눈
        const rightEye = landmarks[263];         // 오른쪽 눈

        // 입 관련 랜드마크 (화남 표정에서 입꼬리가 아래로)
        const leftMouth = landmarks[61];   // 입 왼쪽 끝
        const rightMouth = landmarks[291]; // 입 오른쪽 끝
        const upperMouth = landmarks[13];  // 윗입술 중앙
        const lowerMouth = landmarks[14];  // 아랫입술 중앙

        if (!leftEyebrowInner || !rightEyebrowInner || !leftEye || !rightEye ||
            !leftMouth || !rightMouth || !upperMouth || !lowerMouth) {
            this.noAngryFrameCount++;
            this.angryFrameCount = 0;
            return this.stabilizeAngryDetection(false);
        }

        // 눈썹과 눈 사이의 거리 (화남 표정에서 가까워짐)
        const leftBrowEyeDistance = Math.abs(leftEyebrowInner.y - leftEye.y);
        const rightBrowEyeDistance = Math.abs(rightEyebrowInner.y - rightEye.y);
        const avgBrowEyeDistance = (leftBrowEyeDistance + rightBrowEyeDistance) / 2;

        // 화남 감지가 비활성화된 경우 항상 false 반환
        if (!this.smileParams.angryEnabled) {
            this.noAngryFrameCount++;
            this.angryFrameCount = 0;
            return this.stabilizeAngryDetection(false);
        }

        // 입꼬리가 아래로 내려갔는지 확인 (화남 표정)
        const mouthCenterY = (upperMouth.y + lowerMouth.y) / 2;
        const leftCornerDown = (leftMouth.y - mouthCenterY) > this.smileParams.angryMouthThreshold;
        const rightCornerDown = (rightMouth.y - mouthCenterY) > this.smileParams.angryMouthThreshold;

        // 화남 감지 조건들 (파라미터 기반)

        // 1. 눈썹-눈 거리 (더 엄격하게)
        const eyebrowsClose = avgBrowEyeDistance < this.smileParams.angryBrowEyeThreshold;

        // 2. 입꼬리 내림 (양쪽 모두 내려가야 함으로 변경)
        const mouthCornersDown = leftCornerDown && rightCornerDown;

        // 3. 입술 압축 감지
        const mouthHeight = Math.abs(upperMouth.y - lowerMouth.y);
        const mouthCompressed = mouthHeight < this.smileParams.angryMouthCompressThreshold;

        // 4. 눈 찡그림 감지
        const leftEyeHeight = Math.abs(landmarks[159].y - landmarks[145].y);
        const rightEyeHeight = Math.abs(landmarks[386].y - landmarks[374].y);
        const avgEyeHeight = (leftEyeHeight + rightEyeHeight) / 2;
        const eyesSquinting = avgEyeHeight < this.smileParams.angryEyeSquintThreshold;

        // 5. 얼굴 근육 긴장 (광대뼈 부분)
        const leftCheek = landmarks[116];
        const rightCheek = landmarks[345];
        const noseTip = landmarks[1];
        const cheekTension = Math.abs(leftCheek.y - noseTip.y) < this.smileParams.angryCheekThreshold ||
            Math.abs(rightCheek.y - noseTip.y) < this.smileParams.angryCheekThreshold;

        // 조건들 카운트
        const conditions = [eyebrowsClose, mouthCornersDown, mouthCompressed, eyesSquinting, cheekTension];
        const satisfiedConditions = conditions.filter(Boolean).length;

        // 지정된 개수 이상의 조건을 만족해야 화남으로 감지
        const isAngry = satisfiedConditions >= this.smileParams.angryRequiredConditions;

        // 디버그 정보 표시
        if (this.smileParams.debug) {
            this.drawAngryDebugInfo({
                browEyeDistance: avgBrowEyeDistance,
                eyebrowsClose: eyebrowsClose,
                mouthDown: mouthCornersDown,
                mouthCompressed: mouthCompressed,
                eyesSquinting: eyesSquinting,
                cheekTension: cheekTension,
                satisfiedConditions: satisfiedConditions,
                requiredConditions: this.smileParams.angryRequiredConditions,
                currentAngry: isAngry
            });
        }

        // 프레임 카운터 업데이트
        if (isAngry) {
            this.angryFrameCount++;
            this.noAngryFrameCount = 0;
        } else {
            this.noAngryFrameCount++;
            this.angryFrameCount = 0;
        }

        return this.stabilizeAngryDetection(isAngry);
    }

    stabilizeAngryDetection(currentAngry) {
        // 안정성을 위한 연속 프레임 확인
        if (currentAngry && this.angryFrameCount >= this.smileParams.stabilityFrames) {
            return true;
        } else if (!currentAngry && this.noAngryFrameCount >= this.smileParams.stabilityFrames) {
            return false;
        }

        // 현재 상태 유지
        return this.isAngry;
    }

    drawAngryDebugInfo(debugData) {
        if (!this.ctx) return;

        // 디버그 정보를 카메라 화면 오른쪽 상단에 표시 (더 큰 박스)
        this.ctx.fillStyle = 'rgba(255, 0, 0, 0.8)';
        this.ctx.fillRect(this.canvas.width - 280, 10, 270, 160);

        this.ctx.font = '10px Arial';

        let y = 25;

        // 조건 만족 상태 표시
        this.ctx.fillStyle = '#FFFF00';
        this.ctx.fillText(`조건: ${debugData.satisfiedConditions}/${debugData.requiredConditions} 만족`, this.canvas.width - 275, y);
        y += 15;

        // 각 조건별로 OK/FAIL 표시
        // 1. 눈썹-눈 거리
        this.ctx.fillStyle = debugData.eyebrowsClose ? '#00FF00' : '#FFFFFF';
        const browStatus = debugData.eyebrowsClose ? '✓' : '✗';
        this.ctx.fillText(`눈썹: ${debugData.browEyeDistance.toFixed(3)} ${browStatus}`, this.canvas.width - 275, y);
        y += 13;

        // 2. 입꼬리 내림
        this.ctx.fillStyle = debugData.mouthDown ? '#00FF00' : '#FFFFFF';
        const mouthStatus = debugData.mouthDown ? '✓' : '✗';
        this.ctx.fillText(`입꼬리: ${mouthStatus}`, this.canvas.width - 275, y);
        y += 13;

        // 3. 입 압축
        this.ctx.fillStyle = debugData.mouthCompressed ? '#00FF00' : '#FFFFFF';
        const compressStatus = debugData.mouthCompressed ? '✓' : '✗';
        this.ctx.fillText(`입압축: ${compressStatus}`, this.canvas.width - 275, y);
        y += 13;

        // 4. 눈 찡그림
        this.ctx.fillStyle = debugData.eyesSquinting ? '#00FF00' : '#FFFFFF';
        const squintStatus = debugData.eyesSquinting ? '✓' : '✗';
        this.ctx.fillText(`눈찡그림: ${squintStatus}`, this.canvas.width - 275, y);
        y += 13;

        // 5. 볼 긴장
        this.ctx.fillStyle = debugData.cheekTension ? '#00FF00' : '#FFFFFF';
        const cheekStatus = debugData.cheekTension ? '✓' : '✗';
        this.ctx.fillText(`볼긴장: ${cheekStatus}`, this.canvas.width - 275, y);
        y += 13;

        // 최종 결과
        this.ctx.fillStyle = debugData.currentAngry ? '#FF0000' : '#FFFFFF';
        this.ctx.font = 'bold 12px Arial';
        this.ctx.fillText(`화남: ${debugData.currentAngry ? '😡 감지됨!' : '😐 미감지'}`, this.canvas.width - 275, y);
        y += 15;

        // 간단한 가이드 추가
        y += 20;
        this.ctx.font = '10px Arial';
        this.ctx.fillStyle = '#FFFF00';
        this.ctx.fillText(`화남 표정 팁:`, this.canvas.width - 255, y);
        y += 12;
        this.ctx.fillText(`• 입꼬리 내리기 (한쪽만도 OK)`, this.canvas.width - 255, y);
        y += 12;
        this.ctx.fillText(`• 입 꽉 다물기`, this.canvas.width - 255, y);
        y += 12;
        this.ctx.fillText(`• 눈 찡그리기`, this.canvas.width - 255, y);
    }

    // 콜백 설정
    setSmileCallback(callback) {
        this.onSmileCallback = callback;
    }

    setStopSmileCallback(callback) {
        this.onStopSmileCallback = callback;
    }

    setAngryCallback(callback) {
        this.onAngryCallback = callback;
    }

    setStopAngryCallback(callback) {
        this.onStopAngryCallback = callback;
    }

    // PIP 카메라 토글
    toggleDebugCanvas() {
        if (this.canvas) {
            if (this.canvas.style.display === 'none') {
                this.canvas.style.display = 'block';
                console.log('🎥 PIP 카메라 표시됨');
            } else {
                this.canvas.style.display = 'none';
                this.controlContainer.style.display = 'none';
                console.log('🎥 PIP 카메라 숨김');
            }
        }
    }

    // 카메라 보이기 (애니메이션 포함)
    showCameraWithAnimation() {
        if (this.canvas) {
            // 초기 상태: 작고 투명하게
            this.canvas.style.display = 'block';
            this.canvas.style.transform = 'scale(0.3)';
            this.canvas.style.opacity = '0';

            // 애니메이션 적용
            setTimeout(() => {
                this.canvas.style.transition = 'all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
                this.canvas.style.transform = 'scale(1)';
                this.canvas.style.opacity = '1';
            }, 50);
        }
    }

    // 카메라 보이기 (기본)
    showCamera() {
        if (this.canvas) {
            this.canvas.style.display = 'block';
            this.canvas.style.transform = 'scale(1)';
            this.canvas.style.opacity = '1';
        }
    }
}

// 전역으로 내보내기
window.LocalSmileDetector = LocalSmileDetector;