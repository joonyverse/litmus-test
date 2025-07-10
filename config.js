// 설정 및 옵션

// 로컬 스토리지 키
const STORAGE_KEY = 'watercolor_art_settings';

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

// dat.GUI 설정 함수
export function setupGUI(onChangeCallback) {
    if (typeof dat === 'undefined') return;
    
    const gui = new dat.GUI();
    
    // 배경 컨트롤
    const backgroundFolder = gui.addFolder('Color');
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
    
    backgroundFolder.open();
    
    // 그룹 설정 컨트롤
    const groupFolder = gui.addFolder('Bar Group Settings');
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
    groupFolder.open();
    
    // 레이어 컨트롤
    const layerFolder = gui.addFolder('Layer Controls');
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
    layerFolder.open();
    
    // 레이아웃 컨트롤
    const layoutFolder = gui.addFolder('Layout');
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
    layoutFolder.open();
    
    // 마진 컨트롤
    const marginFolder = gui.addFolder('Margins');
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
    marginFolder.open();
    
    // 선 효과 컨트롤
    const lineFolder = gui.addFolder('Line Effects');
    lineFolder.add(options, 'lineBlurAmount', 0, 2, 0.1).name('Line Blur Amount').onChange(onChangeCallback);
    lineFolder.add(options, 'lineBlurCount', 0, 10, 1).name('Line Blur Count').onChange(onChangeCallback);
    lineFolder.open();
    
    // 막대 수채화 효과 컨트롤
    const barFolder = gui.addFolder('Bar Watercolor Effects');
    barFolder.add(options, 'barLayers', 1, 10, 1).name('Bar Layers').onChange(onChangeCallback);
    barFolder.add(options, 'barAlpha', 0.1, 1.0, 0.05).name('Bar Alpha').onChange(onChangeCallback);
    barFolder.add(options, 'barBlurAmount', 0, 2, 0.1).name('Bar Blur Amount').onChange(onChangeCallback);
    barFolder.add(options, 'barBlurCount', 0, 15, 1).name('Bar Blur Count').onChange(onChangeCallback);
    barFolder.add(options, 'barFlatEnds').name('Flat Ends').onChange(onChangeCallback);
    barFolder.add(options, 'barTopSemicircle').name('Top Semicircle').onChange(onChangeCallback);
    barFolder.open();
    
    // 막대 자연스러움 효과 컨트롤
    const naturalFolder = gui.addFolder('Natural Hand-Drawn Effects');
    naturalFolder.add(options, 'barWobble', 0, 20, 1).name('Bar Wobble').onChange(onChangeCallback);
    naturalFolder.add(options, 'barRotation', 0, 45, 1).name('Bar Rotation').onChange(onChangeCallback);
    naturalFolder.add(options, 'barHeightVariation', 0, 50, 1).name('Height Variation').onChange(onChangeCallback);
    naturalFolder.open();
    
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
    blankingFolder.open();
    
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
            rowOffsetFolder.open();
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
    gui.add(resetButton, 'updateRowOffsets').name('Update Row Controls');
}

// 행별 오프셋 컨트롤 업데이트 함수를 외부에서 호출할 수 있도록 export
export function updateRowOffsetControls() {
    if (updateRowOffsetControlsFunction) {
        updateRowOffsetControlsFunction();
    }
} 
