// 설정 및 옵션

// 로컬 스토리지 키
const STORAGE_KEY = 'watercolor_art_settings';
const GUI_STATE_KEY = 'watercolor_gui_state';

// 로컬 스토리지에서 설정 불러오기
function loadSettingsFromStorage() {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            const parsed = JSON.parse(saved);
            return parsed;
        }
    } catch (error) {
        console.warn('Failed to load settings from storage:', error);
    }
    return null;
}

// 로컬 스토리지에 설정 저장하기
function saveSettingsToStorage(settings) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch (error) {
        console.warn('Failed to save settings to storage:', error);
    }
}

// GUI 상태 로드하기
function loadGuiStateFromStorage() {
    try {
        const saved = localStorage.getItem(GUI_STATE_KEY);
        if (saved) {
            const state = JSON.parse(saved);
            console.log('✅ GUI 폴더 상태 로드됨:', state);
            return state;
        } else {
            console.log('📁 저장된 GUI 폴더 상태 없음 - 모든 폴더 접어둠');
        }
    } catch (error) {
        console.warn('❌ GUI 상태 로드 실패:', error);
    }
    return null;
}

// GUI 상태 저장하기
function saveGuiStateToStorage(state) {
    try {
        localStorage.setItem(GUI_STATE_KEY, JSON.stringify(state));
        console.log('💾 GUI 폴더 상태 저장됨:', state);
    } catch (error) {
        console.warn('❌ GUI 상태 저장 실패:', error);
    }
}

// 수채화 색상 팔레트
export const palettes = [
    ['#d1cbe9', '#b7d2e8', '#cbe7d1', '#e9d1d1', '#e9e1d1', '#d1e9e1', '#e1d1e9', '#e9d1e1', '#d1e9e9'],
    ['#f7b267', '#70a37f', '#e76f51', '#6d6875', '#b5838d', '#457b9d', '#a8dadc', '#f4a261'],
    ['#e63946', '#457b9d', '#2a9d8f', '#f4a261', '#264653', '#e9c46a', '#a8dadc', '#b5838d'],
];

// 기본 설정값
const DEFAULT_OPTIONS = {
    // 배경 설정
    backgroundColor: '#ffffff',

    // 행별 오프셋 설정 (동적으로 생성됨)
    rowOffsets: [],

    // 선 색상 설정 (막대 위에 그려지는 선들)
    lineColor1: '#e63946',  // 막대 높이의 15% 지점 - 빨간색
    lineColor2: '#457b9d',  // 막대 높이의 30% 지점 - 파란색
    lineColor3: '#2a9d8f',  // 막대 높이의 45% 지점 - 청록색
    lineColor4: '#f4a261',  // 막대 높이의 60% 지점 - 주황색
    lineColor5: '#e76f51',  // 막대 높이의 75% 지점 - 주황빨강
    lineColor6: '#222222',  // 막대 높이의 90% 지점 - 검은색

    // 막대 색상 설정 (WatercolorBar의 색상)
    barColor1: '#e63946',  // 첫 번째 막대 색상
    barColor2: '#457b9d',  // 두 번째 막대 색상
    barColor3: '#2a9d8f',  // 세 번째 막대 색상
    barColor4: '#f4a261',  // 네 번째 막대 색상
    barColor5: '#e76f51',  // 다섯 번째 막대 색상
    barColor6: '#a8dadc',  // 여섯 번째 막대 색상

    // 레이아웃 설정
    barWidth: 18,
    barHeight: 100,
    barGapX: 12,
    barGapY: 20,
    marginLeft: 64,
    marginRight: 300,
    marginTop: 64,
    marginBottom: 48,
    maxNumBarPerGroup: 12,

    // 그룹 설정
    minBarGroupSize: 3,  // 최소 그룹 크기
    maxBarGroupSize: 12, // 최대 그룹 크기
    barColorSeed: Math.random(), // 막대 색상 결정적 시드

    // 선 효과 설정
    lineBlurAmount: 0.0,
    lineBlurCount: 2,

    // 막대 수채화 효과 설정
    barLayers: 5,
    barAlpha: 0.6,
    barBlurAmount: 0.3,
    barBlurCount: 3,
    barFlatEnds: true, // 상단과 하단 끝을 평평하게 그리기
    barTopSemicircle: true, // 상단에 반원 추가하여 막대 끝을 둥글게 만들기

    // 자연스러움 효과 설정
    barWobble: 8,
    barRotation: 15,
    barHeightVariation: 20,

    // 랜덤 블랭킹 설정
    blankingEnabled: false,
    blankingPercentage: 30, // 숨길 막대의 비율 (0-100)
    blankingSeed: Math.random(), // 랜덤 시드
};

// 저장된 설정과 기본 설정을 병합
function mergeSettingsWithDefaults() {
    const savedSettings = loadSettingsFromStorage();
    if (savedSettings) {
        // 색상 관련 설정만 병합 (다른 설정은 기본값 유지)
        const merged = { ...DEFAULT_OPTIONS };
        if (savedSettings.backgroundColor) merged.backgroundColor = savedSettings.backgroundColor;
        if (savedSettings.lineColor1) merged.lineColor1 = savedSettings.lineColor1;
        if (savedSettings.lineColor2) merged.lineColor2 = savedSettings.lineColor2;
        if (savedSettings.lineColor3) merged.lineColor3 = savedSettings.lineColor3;
        if (savedSettings.lineColor4) merged.lineColor4 = savedSettings.lineColor4;
        if (savedSettings.lineColor5) merged.lineColor5 = savedSettings.lineColor5;
        if (savedSettings.lineColor6) merged.lineColor6 = savedSettings.lineColor6;
        if (savedSettings.barColor1) merged.barColor1 = savedSettings.barColor1;
        if (savedSettings.barColor2) merged.barColor2 = savedSettings.barColor2;
        if (savedSettings.barColor3) merged.barColor3 = savedSettings.barColor3;
        if (savedSettings.barColor4) merged.barColor4 = savedSettings.barColor4;
        if (savedSettings.barColor5) merged.barColor5 = savedSettings.barColor5;
        if (savedSettings.barColor6) merged.barColor6 = savedSettings.barColor6;
        if (savedSettings.minBarGroupSize) merged.minBarGroupSize = savedSettings.minBarGroupSize;
        if (savedSettings.maxBarGroupSize) merged.maxBarGroupSize = savedSettings.maxBarGroupSize;
        if (savedSettings.barColorSeed) merged.barColorSeed = savedSettings.barColorSeed;
        return merged;
    }
    return DEFAULT_OPTIONS;
}

// 설정 유효성 검사 함수
function validateOptions(options) {
    const validated = { ...options };

    // 색상 값 검사 (hex 또는 rgb 형식)
    const colorProps = ['backgroundColor', 'lineColor1', 'lineColor2', 'lineColor3', 'lineColor4', 'lineColor5', 'lineColor6', 'barColor1', 'barColor2', 'barColor3', 'barColor4', 'barColor5', 'barColor6'];
    colorProps.forEach(prop => {
        if (validated[prop] && !/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$|^rgb\(|^rgba\(/.test(validated[prop])) {
            console.warn(`Invalid color format for ${prop}:`, validated[prop]);
        }
    });

    // 알파값 범위 검사 (0-1)
    const alphaProps = ['barAlpha', 'lineBlurAmount', 'barBlurAmount'];
    alphaProps.forEach(prop => {
        validated[prop] = Math.max(0, Math.min(1, validated[prop]));
    });

    // 정수 값들 검사
    const integerProps = ['barLayers', 'lineBlurCount', 'barBlurCount'];
    integerProps.forEach(prop => {
        validated[prop] = Math.max(1, Math.floor(validated[prop]));
    });

    return validated;
}

// 메인 옵션 객체 (저장된 설정과 병합)
export const options = validateOptions(mergeSettingsWithDefaults());

// 설정 업데이트 함수
export function updateOptions(newOptions) {
    Object.assign(options, newOptions);
    return validateOptions(options);
}

// 설정 초기화 함수
export function resetOptions() {
    Object.assign(options, DEFAULT_OPTIONS);
    // 로컬 스토리지에서 색상 설정 제거
    const savedSettings = loadSettingsFromStorage();
    if (savedSettings) {
        delete savedSettings.backgroundColor;
        delete savedSettings.lineColor1;
        delete savedSettings.lineColor2;
        delete savedSettings.lineColor3;
        delete savedSettings.lineColor4;
        delete savedSettings.lineColor5;
        delete savedSettings.lineColor6;
        delete savedSettings.barColor1;
        delete savedSettings.barColor2;
        delete savedSettings.barColor3;
        delete savedSettings.barColor4;
        delete savedSettings.barColor5;
        delete savedSettings.barColor6;
        delete savedSettings.minBarGroupSize;
        delete savedSettings.maxBarGroupSize;
        delete savedSettings.barColorSeed;
        saveSettingsToStorage(savedSettings);
    }

    // 개별 색상 초기화
    if (typeof window.clearIndividualColors === 'function') {
        window.clearIndividualColors();
    }
}

// 행별 오프셋 관리 함수들
export function initializeRowOffsets(rowCount) {
    // 기존 오프셋보다 더 많은 행이 필요한 경우에만 확장
    while (options.rowOffsets.length < rowCount) {
        options.rowOffsets.push({ x: 0, y: 0 });
    }
    // 불필요한 오프셋 제거
    if (options.rowOffsets.length > rowCount) {
        options.rowOffsets = options.rowOffsets.slice(0, rowCount);
    }
}

export function getRowOffset(rowIndex) {
    if (rowIndex < 0 || rowIndex >= options.rowOffsets.length) {
        return { x: 0, y: 0 };
    }
    return options.rowOffsets[rowIndex];
}

export function setRowOffset(rowIndex, offsetX, offsetY) {
    if (rowIndex >= 0 && rowIndex < options.rowOffsets.length) {
        options.rowOffsets[rowIndex] = { x: offsetX, y: offsetY };
    }
}

// 색상 설정 저장 함수
export function saveColorSettings() {
    const colorSettings = {
        backgroundColor: options.backgroundColor,
        lineColor1: options.lineColor1,
        lineColor2: options.lineColor2,
        lineColor3: options.lineColor3,
        lineColor4: options.lineColor4,
        lineColor5: options.lineColor5,
        lineColor6: options.lineColor6,
        barColor1: options.barColor1,
        barColor2: options.barColor2,
        barColor3: options.barColor3,
        barColor4: options.barColor4,
        barColor5: options.barColor5,
        barColor6: options.barColor6,
        minBarGroupSize: options.minBarGroupSize,
        maxBarGroupSize: options.maxBarGroupSize,
        barColorSeed: options.barColorSeed,
    };
    saveSettingsToStorage(colorSettings);
}

// 배경 색상 업데이트 함수
export function updateBackgroundColor(color) {
    options.backgroundColor = color;
    saveColorSettings();
    if (typeof window.updateBackgroundColor === 'function') {
        window.updateBackgroundColor(color);
    }
}

// 행별 오프셋 업데이트 함수를 저장할 변수
let updateRowOffsetControlsFunction = null;

// 폴더 상태 관리 함수들
function setupFolderStateManagement(folder, folderName) {
    console.log(`🔧 폴더 "${folderName}" 상태 관리 설정 시작`);
    
    const savedState = loadGuiStateFromStorage();
    const shouldBeOpen = savedState && savedState[folderName] === true;
    
    // 저장된 상태가 없으면 기본적으로 모든 폴더를 접어둠
    if (!savedState || !shouldBeOpen) {
        folder.close();
        console.log(`📁 폴더 "${folderName}" 초기 상태: 닫힘`);
    } else {
        folder.open();
        console.log(`📂 폴더 "${folderName}" 초기 상태: 열림 (저장된 상태 복원)`);
    }
    
    // 폴더 상태 변경 감지 및 저장
    const originalOpen = folder.open.bind(folder);
    const originalClose = folder.close.bind(folder);
    
    folder.open = function() {
        console.log(`📂 폴더 "${folderName}" 열기 시도`);
        originalOpen();
        saveFolderState(folderName, true);
    };
    
    folder.close = function() {
        console.log(`📁 폴더 "${folderName}" 닫기 시도`);
        originalClose();
        saveFolderState(folderName, false);
    };
    
    console.log(`✅ 폴더 "${folderName}" 상태 관리 설정 완료`);
}

function saveFolderState(folderName, isOpen) {
    const currentState = loadGuiStateFromStorage() || {};
    currentState[folderName] = isOpen;
    console.log(`🔄 폴더 "${folderName}" 상태 변경: ${isOpen ? '열림' : '닫힘'}`);
    saveGuiStateToStorage(currentState);
}

// dat.GUI 설정 함수
export function setupGUI(onChangeCallback) {
    if (typeof dat === 'undefined') return;

    const gui = new dat.GUI();


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
                // 위치 리셋 후 버튼 위치도 업데이트
                window.localSmileDetector.updateControlButtonsPosition();
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

    // 배경 컨트롤
    const backgroundFolder = gui.addFolder('Color');
    setupFolderStateManagement(backgroundFolder, 'color');
    const backgroundControls = {
        backgroundColor: options.backgroundColor,
        setBackgroundColor: (color) => {
            updateBackgroundColor(color);
        }
    };

    backgroundFolder.addColor(backgroundControls, 'backgroundColor').name('Background').onChange((color) => {
        backgroundControls.setBackgroundColor(color);
    });

    // 막대 색상 컨트롤
    const lineColorControls = {
        lineColor1: options.lineColor1,
        lineColor2: options.lineColor2,
        lineColor3: options.lineColor3,
        lineColor4: options.lineColor4,
        lineColor5: options.lineColor5,
        lineColor6: options.lineColor6,
        setBarColor1: (color) => {
            options.lineColor1 = color;
            saveColorSettings();
            if (window.redrawLines) window.redrawLines();
        },
        setBarColor2: (color) => {
            options.lineColor2 = color;
            saveColorSettings();
            if (window.redrawLines) window.redrawLines();
        },
        setBarColor3: (color) => {
            options.lineColor3 = color;
            saveColorSettings();
            if (window.redrawLines) window.redrawLines();
        },
        setBarColor4: (color) => {
            options.lineColor4 = color;
            saveColorSettings();
            if (window.redrawLines) window.redrawLines();
        },
        setBarColor5: (color) => {
            options.lineColor5 = color;
            saveColorSettings();
            if (window.redrawLines) window.redrawLines();
        },
        setBarColor6: (color) => {
            options.lineColor6 = color;
            saveColorSettings();
            if (window.redrawLines) window.redrawLines();
        }
    };

    //backgroundFolder.addColor(lineColorControls, 'lineColor1').name('Line Color 1').onChange((color) => {
    //    lineColorControls.setBarColor1(color);
    //});
    //backgroundFolder.addColor(lineColorControls, 'lineColor2').name('Line Color 2').onChange((color) => {
    //   lineColorControls.setBarColor2(color);
    //});
    // backgroundFolder.addColor(lineColorControls, 'lineColor3').name('Line Color 3').onChange((color) => {
    //       lineColorControls.setBarColor3(color);
    // });
    //  backgroundFolder.addColor(lineColorControls, 'lineColor4').name('Line Color 4').onChange((color) => {
    //       lineColorControls.setBarColor4(color);
    //    });
    //   backgroundFolder.addColor(lineColorControls, 'lineColor5').name('Line Color 5').onChange((color) => {
    //       lineColorControls.setBarColor5(color);
    //    });
    //    backgroundFolder.addColor(lineColorControls, 'lineColor6').name('Line Color 6').onChange((color) => {
    //        lineColorControls.setBarColor6(color);
    //    });

    // 막대 색상 컨트롤 (WatercolorBar 색상)
    const barColorControls = {
        barColor1: options.barColor1,
        barColor2: options.barColor2,
        barColor3: options.barColor3,
        barColor4: options.barColor4,
        barColor5: options.barColor5,
        barColor6: options.barColor6,
        setBarColor1: (color) => {
            options.barColor1 = color;
            saveColorSettings();
            if (window.updateBarColors) window.updateBarColors();
            if (window.redrawBars) window.redrawBars();
        },
        setBarColor2: (color) => {
            options.barColor2 = color;
            saveColorSettings();
            if (window.updateBarColors) window.updateBarColors();
            if (window.redrawBars) window.redrawBars();
        },
        setBarColor3: (color) => {
            options.barColor3 = color;
            saveColorSettings();
            if (window.updateBarColors) window.updateBarColors();
            if (window.redrawBars) window.redrawBars();
        },
        setBarColor4: (color) => {
            options.barColor4 = color;
            saveColorSettings();
            if (window.updateBarColors) window.updateBarColors();
            if (window.redrawBars) window.redrawBars();
        },
        setBarColor5: (color) => {
            options.barColor5 = color;
            saveColorSettings();
            if (window.updateBarColors) window.updateBarColors();
            if (window.redrawBars) window.redrawBars();
        },
        setBarColor6: (color) => {
            options.barColor6 = color;
            saveColorSettings();
            if (window.updateBarColors) window.updateBarColors();
            if (window.redrawBars) window.redrawBars();
        }
    };

    backgroundFolder.addColor(barColorControls, 'barColor1').name('Bar Color 1').onChange((color) => {
        barColorControls.setBarColor1(color);
    });
    backgroundFolder.addColor(barColorControls, 'barColor2').name('Bar Color 2').onChange((color) => {
        barColorControls.setBarColor2(color);
    });
    backgroundFolder.addColor(barColorControls, 'barColor3').name('Bar Color 3').onChange((color) => {
        barColorControls.setBarColor3(color);
    });
    backgroundFolder.addColor(barColorControls, 'barColor4').name('Bar Color 4').onChange((color) => {
        barColorControls.setBarColor4(color);
    });
    backgroundFolder.addColor(barColorControls, 'barColor5').name('Bar Color 5').onChange((color) => {
        barColorControls.setBarColor5(color);
    });
    backgroundFolder.addColor(barColorControls, 'barColor6').name('Bar Color 6').onChange((color) => {
        barColorControls.setBarColor6(color);
    });

    // 그룹 설정 컨트롤
    const groupFolder = gui.addFolder('Bar Group Settings');
    setupFolderStateManagement(groupFolder, 'barGroupSettings');
    const groupControls = {
        minBarGroupSize: options.minBarGroupSize,
        maxBarGroupSize: options.maxBarGroupSize,
        randomizeBarSeed: () => {
            options.barColorSeed = Math.random();
            saveColorSettings();
            if (window.redrawBars) window.redrawBars();
        }
    };

    groupFolder.add(groupControls, 'minBarGroupSize', 1, 20, 1).name('Min Group Size').onChange((value) => {
        options.minBarGroupSize = value;
        saveColorSettings();
        if (window.redrawBars) window.redrawBars();
    });
    groupFolder.add(groupControls, 'maxBarGroupSize', 1, 30, 1).name('Max Group Size').onChange((value) => {
        options.maxBarGroupSize = value;
        saveColorSettings();
        if (window.redrawBars) window.redrawBars();
    });
    groupFolder.add(groupControls, 'randomizeBarSeed').name('Randomize Bar Pattern');

    // 레이어 컨트롤
    const layerFolder = gui.addFolder('Layer Controls');
    setupFolderStateManagement(layerFolder, 'layerControls');
    const layerControls = {
        toggleBars: () => {
            if (window.toggleBars) {
                window.toggleBars();
            }
        },
        toggleLines: () => {
            if (window.toggleLines) {
                window.toggleLines();
            }
        },
        redrawBars: () => {
            if (window.redrawBars) {
                window.redrawBars();
            }
        },
        redrawLines: () => {
            if (window.redrawLines) {
                window.redrawLines();
            }
        },
        redrawEffects: () => {
            if (window.redrawEffects) {
                window.redrawEffects();
            }
        },
        toggleBlanking: () => {
            if (window.toggleBlanking) {
                window.toggleBlanking();
            }
        }
    };

    layerFolder.add(layerControls, 'toggleBars').name('Toggle Bars');
    layerFolder.add(layerControls, 'toggleLines').name('Toggle Lines');
    layerFolder.add(layerControls, 'redrawBars').name('Redraw Bars');
    layerFolder.add(layerControls, 'redrawLines').name('Redraw Lines');
    layerFolder.add(layerControls, 'redrawEffects').name('Redraw Effects');
    layerFolder.add(layerControls, 'toggleBlanking').name('Toggle Blanking');

    // 레이아웃 컨트롤
    const layoutFolder = gui.addFolder('Layout');
    setupFolderStateManagement(layoutFolder, 'layout');
    layoutFolder.add(options, 'barWidth', 1, 2048, 1).name('Bar Width 2048').onChange((value) => {
        onChangeCallback();
        updateRowOffsetControls(); // 행 수가 변경될 수 있으므로 업데이트
    });
    layoutFolder.add(options, 'barHeight', 1, 2048, 1).name('Bar Height 2048').onChange((value) => {
        onChangeCallback();
        updateRowOffsetControls(); // 행 수가 변경될 수 있으므로 업데이트
    });
    layoutFolder.add(options, 'barWidth', 1, 128, 1).name('Bar Width').onChange((value) => {
        onChangeCallback();
        updateRowOffsetControls(); // 행 수가 변경될 수 있으므로 업데이트
    });
    layoutFolder.add(options, 'barHeight', 1, 128, 1).name('Bar Height').onChange((value) => {
        onChangeCallback();
        updateRowOffsetControls(); // 행 수가 변경될 수 있으므로 업데이트
    });
    layoutFolder.add(options, 'barGapX', -2048, 2048, 1).name('Bar Gap X').onChange(onChangeCallback);
    layoutFolder.add(options, 'barGapY', -2048, 2048, 1).name('Bar Gap Y').onChange((value) => {
        onChangeCallback();
        updateRowOffsetControls(); // 행 수가 변경될 수 있으므로 업데이트
    });
    layoutFolder.add(options, 'maxNumBarPerGroup', 1, 30, 1).name('Group Count').onChange(onChangeCallback);

    // 마진 컨트롤
    const marginFolder = gui.addFolder('Margins');
    setupFolderStateManagement(marginFolder, 'margins');
    marginFolder.add(options, 'marginLeft', 0, 500, 1).name('Left Margin').onChange(onChangeCallback);
    marginFolder.add(options, 'marginRight', 0, 500, 1).name('Right Margin').onChange(onChangeCallback);
    marginFolder.add(options, 'marginTop', 0, 500, 1).name('Top Margin').onChange((value) => {
        onChangeCallback();
        updateRowOffsetControls(); // 행 수가 변경될 수 있으므로 업데이트
    });
    marginFolder.add(options, 'marginBottom', 0, 500, 1).name('Bottom Margin').onChange((value) => {
        onChangeCallback();
        updateRowOffsetControls(); // 행 수가 변경될 수 있으므로 업데이트
    });

    // 선 효과 컨트롤
    const lineFolder = gui.addFolder('Line Effects');
    lineFolder.add(options, 'lineBlurAmount', 0, 2, 0.1).name('Line Blur Amount').onChange(onChangeCallback);
    lineFolder.add(options, 'lineBlurCount', 0, 10, 1).name('Line Blur Count').onChange(onChangeCallback);

    // 막대 수채화 효과 컨트롤
    const barFolder = gui.addFolder('Bar Watercolor Effects');
    barFolder.add(options, 'barLayers', 1, 10, 1).name('Bar Layers').onChange(onChangeCallback);
    barFolder.add(options, 'barAlpha', 0.1, 1.0, 0.05).name('Bar Alpha').onChange(onChangeCallback);
    barFolder.add(options, 'barBlurAmount', 0, 2, 0.1).name('Bar Blur Amount').onChange(onChangeCallback);
    barFolder.add(options, 'barBlurCount', 0, 15, 1).name('Bar Blur Count').onChange(onChangeCallback);
    barFolder.add(options, 'barFlatEnds').name('Flat Ends').onChange(onChangeCallback);
    barFolder.add(options, 'barTopSemicircle').name('Top Semicircle').onChange(onChangeCallback);

    // 막대 자연스러움 효과 컨트롤
    const naturalFolder = gui.addFolder('Natural Hand-Drawn Effects');
    naturalFolder.add(options, 'barWobble', 0, 20, 1).name('Bar Wobble').onChange(onChangeCallback);
    naturalFolder.add(options, 'barRotation', 0, 45, 1).name('Bar Rotation').onChange(onChangeCallback);
    naturalFolder.add(options, 'barHeightVariation', 0, 50, 1).name('Height Variation').onChange(onChangeCallback);

    // 랜덤 블랭킹 컨트롤
    const blankingFolder = gui.addFolder('Random Blanking');
    blankingFolder.add(options, 'blankingEnabled').name('Enable Blanking').onChange(onChangeCallback);
    blankingFolder.add(options, 'blankingPercentage', 0, 100, 5).name('Blanking %').onChange(onChangeCallback);
    const blankingControls = {
        randomizeBlanking: () => {
            options.blankingSeed = Math.random();
            onChangeCallback();
        }
    };
    blankingFolder.add(blankingControls, 'randomizeBlanking').name('Randomize Pattern');

    // 행별 오프셋 컨트롤을 동적으로 생성하는 함수
    let rowOffsetFolder;
    let rowOffsetControllers = [];
    function updateRowOffsetControls() {
        // 기존 컨트롤러들을 제거
        rowOffsetControllers.forEach(controller => {
            if (rowOffsetFolder && controller) {
                try {
                    rowOffsetFolder.remove(controller);
                } catch (e) {
                    // 제거 실패 시 무시
                }
            }
        });
        rowOffsetControllers = [];

        // 기존 폴더가 없으면 생성
        if (!rowOffsetFolder) {
            rowOffsetFolder = gui.addFolder('Row Offsets');
            setupFolderStateManagement(rowOffsetFolder, 'rowOffsets');
            
            // Update Row Controls 버튼을 폴더에 추가
            const rowOffsetControls = {
                updateRowControls: () => {
                    updateRowOffsetControls();
                }
            };
            rowOffsetFolder.add(rowOffsetControls, 'updateRowControls').name('Update Row Controls');
        }

        // 현재 행 수 계산 (main.js의 calculateGrid 로직과 동일)
        const canvas = document.getElementById('art');
        if (!canvas) return;

        const { barHeight, barGapY, marginTop, marginBottom } = options;
        const rows = Math.floor((canvas.height - marginTop - marginBottom) / (barHeight + barGapY));

        // 행별 오프셋 초기화
        initializeRowOffsets(rows);

        // 각 행별로 X, Y 오프셋 컨트롤 생성
        for (let i = 0; i < rows; i++) {
            const rowControls = {
                [`row${i}X`]: options.rowOffsets[i].x,
                [`row${i}Y`]: options.rowOffsets[i].y
            };

            const xController = rowOffsetFolder.add(rowControls, `row${i}X`, -200, 200, 1).name(`Row ${i} X`).onChange((value) => {
                setRowOffset(i, value, options.rowOffsets[i].y);
                onChangeCallback();
            });

            const yController = rowOffsetFolder.add(rowControls, `row${i}Y`, -200, 200, 1).name(`Row ${i} Y`).onChange((value) => {
                setRowOffset(i, options.rowOffsets[i].x, value);
                onChangeCallback();
            });

            rowOffsetControllers.push(xController, yController);
        }
    }

    // 초기 행별 오프셋 컨트롤 생성
    updateRowOffsetControls();

    // 외부에서 접근할 수 있도록 함수 저장
    updateRowOffsetControlsFunction = updateRowOffsetControls;

    // 리셋 버튼에 행별 오프셋 컨트롤 업데이트 기능 추가
    const resetButton = {
        reset: () => {
            resetOptions();
            updateRowOffsetControls(); // 행별 오프셋 컨트롤도 재생성
            onChangeCallback();
            // GUI 컨트롤 업데이트
            gui.controllers.forEach(controller => {
                controller.updateDisplay();
            });
        },
        updateRowOffsets: () => {
            updateRowOffsetControls();
        }
    };
    gui.add(resetButton, 'reset').name('Reset to Defaults');
    
    // 로드 완료 후 Row Controls 업데이트 (지연 실행으로 캔버스 초기화 대기)
    setTimeout(() => {
        updateRowOffsetControls();
    }, 1000);
}

// 행별 오프셋 컨트롤 업데이트 함수를 외부에서 호출할 수 있도록 export
export function updateRowOffsetControls() {
    if (updateRowOffsetControlsFunction) {
        updateRowOffsetControlsFunction();
    }
} 
