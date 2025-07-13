// 카메라 관련 GUI 모듈

import { setupFolderStateManagement } from './gui-state.js';

export function setupCameraGUI(gui) {
    // 로컬 카메라 컨트롤 추가
    const cameraFolder = gui.addFolder('Local Camera');
    setupFolderStateManagement(cameraFolder, 'localCamera');
    const cameraControls = {
        isRunning: false,
        viewVisible: false,
        startCamera: function () {
            if (window.localSmileDetector) {
                window.localSmileDetector.start().then(success => {
                    if (success) {
                        this.isRunning = true;
                        this.viewVisible = true;
                        // 카메라 시작 시 자동으로 뷰 표시 (애니메이션 포함)
                        window.localSmileDetector.showCameraWithAnimation();
                        console.log('✅ 로컬 카메라 시작됨');
                    }
                });
            }
        },
        stopCamera: function () {
            if (window.localSmileDetector) {
                window.localSmileDetector.stop();
                this.isRunning = false;
                console.log('⏹️ 로컬 카메라 중지됨');
            }
        },
        showCameraView: function () {
            if (window.localSmileDetector) {
                window.localSmileDetector.toggleDebugCanvas();
                this.viewVisible = !this.viewVisible;
            }
        },
        resetPosition: function () {
            if (window.localSmileDetector && window.localSmileDetector.canvas) {
                const canvas = window.localSmileDetector.canvas;
                canvas.style.right = 'auto';
                canvas.style.top = 'auto';
                canvas.style.left = '20px';
                canvas.style.bottom = '20px';
                // 위치 리셋 후 버튼 위치도 업데이트 (함수 존재 시에만)
                if (typeof window.localSmileDetector.updateControlButtonsPosition === 'function') {
                    window.localSmileDetector.updateControlButtonsPosition();
                } else {
                    console.log('카메라 위치 리셋 완료');
                }
            }
        }
    };

    cameraFolder.add(cameraControls, 'startCamera').name('Start Camera');
    cameraFolder.add(cameraControls, 'stopCamera').name('Stop Camera');
    cameraFolder.add(cameraControls, 'showCameraView').name('Show Camera View');
    cameraFolder.add(cameraControls, 'resetPosition').name('Reset Position');

    // 표정 감지 파라미터 컨트롤 추가
    const emotionFolder = cameraFolder.addFolder('Emotion Detection');
    setupFolderStateManagement(emotionFolder, 'emotionDetection');

    // 공통 디버그 컨트롤
    const debugControls = {
        debug: false
    };
    emotionFolder.add(debugControls, 'debug')
        .name('Show Debug Info')
        .onChange((value) => {
            if (window.localSmileDetector) {
                window.localSmileDetector.smileParams.debug = value;
            }
        });

    // 웃음 감지 하위 폴더
    const smileFolder = emotionFolder.addFolder('Smile Detection');
    setupFolderStateManagement(smileFolder, 'smileDetection');
    const smileControls = {
        smileEnabled: true,
        smileRatioThreshold: 1.8,
        wideSmileThreshold: 0.16,
        cornerRaiseStrength: 1.0,
        detectionSensitivity: 1.0,
        stabilityFrames: 3,
        smileColor: '#0066ff',
        resetToDefaults: function () {
            if (window.localSmileDetector) {
                window.localSmileDetector.smileParams.smileEnabled = true;
                window.localSmileDetector.smileParams.smileRatioThreshold = 1.8;
                window.localSmileDetector.smileParams.wideSmileThreshold = 0.08;
                window.localSmileDetector.smileParams.cornerRaiseStrength = 1.0;
                window.localSmileDetector.smileParams.detectionSensitivity = 1.0;
                window.localSmileDetector.smileParams.stabilityFrames = 3;

                // GUI 업데이트
                smileControls.smileEnabled = true;
                smileControls.smileRatioThreshold = 1.8;
                smileControls.wideSmileThreshold = 0.08;
                smileControls.cornerRaiseStrength = 1.0;
                smileControls.detectionSensitivity = 1.0;
                smileControls.stabilityFrames = 3;

                // GUI 컨트롤러들 업데이트 (controllers가 존재하는 경우에만)
                if (smileFolder && smileFolder.controllers) {
                    smileFolder.controllers.forEach(controller => {
                        controller.updateDisplay();
                    });
                }

                console.log('😊 웃음 감지 파라미터 초기화됨');
            }
        }
    };

    smileFolder.add(smileControls, 'smileEnabled')
        .name('Enable Smile Detection')
        .onChange((value) => {
            if (window.localSmileDetector) {
                window.localSmileDetector.smileParams.smileEnabled = value;
            }
        });

    smileFolder.add(smileControls, 'smileRatioThreshold', 0.5, 5.0, 0.1)
        .name('Smile Ratio (가로/세로)')
        .onChange((value) => {
            if (window.localSmileDetector) {
                window.localSmileDetector.smileParams.smileRatioThreshold = value;
            }
        });

    smileFolder.add(smileControls, 'wideSmileThreshold', 0.01, 0.40, 0.01)
        .name('Wide Smile (입 넓이)')
        .onChange((value) => {
            if (window.localSmileDetector) {
                window.localSmileDetector.smileParams.wideSmileThreshold = value;
            }
        });

    smileFolder.add(smileControls, 'cornerRaiseStrength', 0.1, 3.0, 0.1)
        .name('Corner Raise (입꼬리)')
        .onChange((value) => {
            if (window.localSmileDetector) {
                window.localSmileDetector.smileParams.cornerRaiseStrength = value;
            }
        });

    smileFolder.add(smileControls, 'detectionSensitivity', 0.1, 3.0, 0.1)
        .name('Sensitivity (전체 감도)')
        .onChange((value) => {
            if (window.localSmileDetector) {
                window.localSmileDetector.smileParams.detectionSensitivity = value;
            }
        });

    smileFolder.add(smileControls, 'stabilityFrames', 1, 10, 1)
        .name('Stability (안정성)')
        .onChange((value) => {
            if (window.localSmileDetector) {
                window.localSmileDetector.smileParams.stabilityFrames = value;
            }
        });

    smileFolder.addColor(smileControls, 'smileColor')
        .name('Smile Color')
        .onChange((value) => {
            if (window.emotionHandler) {
                window.emotionHandler.colors.smileColor = value;
            }
        });

    smileFolder.add(smileControls, 'resetToDefaults').name('Reset Defaults');

    // 화남 감지 하위 폴더
    const angryFolder = emotionFolder.addFolder('Angry Detection');
    setupFolderStateManagement(angryFolder, 'angryDetection');
    const angryControls = {
        angryBrowEyeThreshold: 0.015,
        angryMouthThreshold: 0.005,
        angryMouthCompressThreshold: 0.005,
        angryEyeSquintThreshold: 0.005,
        angryCheekThreshold: 0.03,
        angryRequiredConditions: 2,
        angryEnabled: true,
        angryColor: '#ff0000',
        resetToDefaults: function () {
            if (window.localSmileDetector) {
                window.localSmileDetector.smileParams.angryBrowEyeThreshold = 0.015;
                window.localSmileDetector.smileParams.angryMouthThreshold = 0.005;
                window.localSmileDetector.smileParams.angryMouthCompressThreshold = 0.005;
                window.localSmileDetector.smileParams.angryEyeSquintThreshold = 0.005;
                window.localSmileDetector.smileParams.angryCheekThreshold = 0.03;
                window.localSmileDetector.smileParams.angryRequiredConditions = 2;
                window.localSmileDetector.smileParams.angryEnabled = true;

                // GUI 업데이트
                angryControls.angryBrowEyeThreshold = 0.015;
                angryControls.angryMouthThreshold = 0.005;
                angryControls.angryMouthCompressThreshold = 0.005;
                angryControls.angryEyeSquintThreshold = 0.005;
                angryControls.angryCheekThreshold = 0.03;
                angryControls.angryRequiredConditions = 2;
                angryControls.angryEnabled = true;

                // GUI 컨트롤러들 업데이트
                if (angryFolder && angryFolder.controllers) {
                    angryFolder.controllers.forEach(controller => {
                        controller.updateDisplay();
                    });
                }

                console.log('😡 화남 감지 파라미터 초기화됨');
            }
        }
    };

    angryFolder.add(angryControls, 'angryEnabled')
        .name('Enable Angry Detection')
        .onChange((value) => {
            if (window.localSmileDetector) {
                window.localSmileDetector.smileParams.angryEnabled = value;
            }
        });

    angryFolder.add(angryControls, 'angryBrowEyeThreshold', 0.005, 0.05, 0.001)
        .name('Eyebrow-Eye Distance')
        .onChange((value) => {
            if (window.localSmileDetector) {
                window.localSmileDetector.smileParams.angryBrowEyeThreshold = value;
            }
        });

    angryFolder.add(angryControls, 'angryMouthThreshold', 0.001, 0.02, 0.001)
        .name('Mouth Corner Down')
        .onChange((value) => {
            if (window.localSmileDetector) {
                window.localSmileDetector.smileParams.angryMouthThreshold = value;
            }
        });

    angryFolder.add(angryControls, 'angryMouthCompressThreshold', 0.001, 0.02, 0.001)
        .name('Mouth Compression')
        .onChange((value) => {
            if (window.localSmileDetector) {
                window.localSmileDetector.smileParams.angryMouthCompressThreshold = value;
            }
        });

    angryFolder.add(angryControls, 'angryEyeSquintThreshold', 0.001, 0.02, 0.001)
        .name('Eye Squinting')
        .onChange((value) => {
            if (window.localSmileDetector) {
                window.localSmileDetector.smileParams.angryEyeSquintThreshold = value;
            }
        });

    angryFolder.add(angryControls, 'angryCheekThreshold', 0.01, 0.1, 0.001)
        .name('Cheek Tension')
        .onChange((value) => {
            if (window.localSmileDetector) {
                window.localSmileDetector.smileParams.angryCheekThreshold = value;
            }
        });

    angryFolder.add(angryControls, 'angryRequiredConditions', 1, 5, 1)
        .name('Required Conditions')
        .onChange((value) => {
            if (window.localSmileDetector) {
                window.localSmileDetector.smileParams.angryRequiredConditions = value;
            }
        });

    angryFolder.addColor(angryControls, 'angryColor')
        .name('Angry Color')
        .onChange((value) => {
            if (window.emotionHandler) {
                window.emotionHandler.colors.angryColor = value;
            }
        });

    angryFolder.add(angryControls, 'resetToDefaults').name('Reset Defaults');

    // 로컬 카메라 초기화 시 파라미터 동기화
    const syncEmotionParams = () => {
        if (window.localSmileDetector && window.localSmileDetector.smileParams) {
            const params = window.localSmileDetector.smileParams;

            // 웃음 감지 파라미터 동기화
            smileControls.smileEnabled = params.smileEnabled;
            smileControls.smileRatioThreshold = params.smileRatioThreshold;
            smileControls.wideSmileThreshold = params.wideSmileThreshold;
            smileControls.cornerRaiseStrength = params.cornerRaiseStrength;
            smileControls.detectionSensitivity = params.detectionSensitivity;
            smileControls.stabilityFrames = params.stabilityFrames;

            // 화남 감지 파라미터 동기화
            angryControls.angryBrowEyeThreshold = params.angryBrowEyeThreshold;
            angryControls.angryMouthThreshold = params.angryMouthThreshold;
            angryControls.angryMouthCompressThreshold = params.angryMouthCompressThreshold;
            angryControls.angryEyeSquintThreshold = params.angryEyeSquintThreshold;
            angryControls.angryCheekThreshold = params.angryCheekThreshold;
            angryControls.angryRequiredConditions = params.angryRequiredConditions;
            angryControls.angryEnabled = params.angryEnabled;

            // 디버그 제어 동기화
            debugControls.debug = params.debug;

            // GUI 업데이트 (controllers가 존재하는 경우에만)
            if (smileFolder && smileFolder.controllers) {
                smileFolder.controllers.forEach(controller => {
                    controller.updateDisplay();
                });
            }
            if (angryFolder && angryFolder.controllers) {
                angryFolder.controllers.forEach(controller => {
                    controller.updateDisplay();
                });
            }
        } else {
            // 아직 초기화되지 않았으면 다시 시도
            setTimeout(syncEmotionParams, 1000);
        }
    };

    // 초기 동기화 시도
    setTimeout(syncEmotionParams, 2000);

    // 전역에서 접근할 수 있도록 저장
    window.cameraGUIControls = cameraControls;

    return cameraFolder;
}