// 설정 및 옵션

// 수채화 색상 팔레트
export const palettes = [
    ['#d1cbe9', '#b7d2e8', '#cbe7d1', '#e9d1d1', '#e9e1d1', '#d1e9e1', '#e1d1e9', '#e9d1e1', '#d1e9e9'],
    ['#f7b267', '#70a37f', '#e76f51', '#6d6875', '#b5838d', '#457b9d', '#a8dadc', '#f4a261'],
    ['#e63946', '#457b9d', '#2a9d8f', '#f4a261', '#264653', '#e9c46a', '#a8dadc', '#b5838d'],
];

// 기본 설정값
const DEFAULT_OPTIONS = {
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
    
    // 선 효과 설정
    lineBlurAmount: 0.3,
    lineBlurCount: 2,
    
    // 막대 수채화 효과 설정
    barLayers: 5,
    barAlpha: 0.6,
    barBlurAmount: 0.3,
    barBlurCount: 3,
    
    // 자연스러움 효과 설정
    barWobble: 8,
    barRotation: 15,
    barHeightVariation: 20,
};

// 설정 유효성 검사 함수
function validateOptions(options) {
    const validated = { ...options };
    
    // 양수 값들 검사
    const positiveProps = ['barWidth', 'barHeight', 'barGapX', 'barGapY', 'maxNumBarPerGroup'];
    positiveProps.forEach(prop => {
        if (validated[prop] <= 0) {
            validated[prop] = DEFAULT_OPTIONS[prop];
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

// 메인 옵션 객체
export const options = validateOptions(DEFAULT_OPTIONS);

// 설정 업데이트 함수
export function updateOptions(newOptions) {
    Object.assign(options, newOptions);
    return validateOptions(options);
}

// 설정 초기화 함수
export function resetOptions() {
    Object.assign(options, DEFAULT_OPTIONS);
}

// dat.GUI 설정 함수
export function setupGUI(onChangeCallback) {
    if (typeof dat === 'undefined') return;
    
    const gui = new dat.GUI();
    
    // 레이어 컨트롤
    const layerFolder = gui.addFolder('Layer Controls');
    const layerControls = {
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
        }
    };
    
    layerFolder.add(layerControls, 'toggleLines').name('Toggle Lines');
    layerFolder.add(layerControls, 'redrawBars').name('Redraw Bars');
    layerFolder.add(layerControls, 'redrawLines').name('Redraw Lines');
    layerFolder.add(layerControls, 'redrawEffects').name('Redraw Effects');
    layerFolder.open();
    
    // 레이아웃 컨트롤
    const layoutFolder = gui.addFolder('Layout');
    layoutFolder.add(options, 'barWidth', 8, 80, 1).name('Bar Width').onChange(onChangeCallback);
    layoutFolder.add(options, 'barHeight', 20, 200, 1).name('Bar Height').onChange(onChangeCallback);
    layoutFolder.add(options, 'barGapX', 0, 20, 1).name('Bar Gap X').onChange(onChangeCallback);
    layoutFolder.add(options, 'barGapY', 0, 20, 1).name('Bar Gap Y').onChange(onChangeCallback);
    layoutFolder.add(options, 'maxNumBarPerGroup', 1, 30, 1).name('Group Count').onChange(onChangeCallback);
    layoutFolder.open();
    
    // 마진 컨트롤
    const marginFolder = gui.addFolder('Margins');
    marginFolder.add(options, 'marginLeft', 0, 500, 1).name('Left Margin').onChange(onChangeCallback);
    marginFolder.add(options, 'marginRight', 0, 500, 1).name('Right Margin').onChange(onChangeCallback);
    marginFolder.add(options, 'marginTop', 0, 500, 1).name('Top Margin').onChange(onChangeCallback);
    marginFolder.add(options, 'marginBottom', 0, 500, 1).name('Bottom Margin').onChange(onChangeCallback);
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
    barFolder.open();
    
    // 막대 자연스러움 효과 컨트롤
    const naturalFolder = gui.addFolder('Natural Hand-Drawn Effects');
    naturalFolder.add(options, 'barWobble', 0, 20, 1).name('Bar Wobble').onChange(onChangeCallback);
    naturalFolder.add(options, 'barRotation', 0, 45, 1).name('Bar Rotation').onChange(onChangeCallback);
    naturalFolder.add(options, 'barHeightVariation', 0, 50, 1).name('Height Variation').onChange(onChangeCallback);
    naturalFolder.open();
    
    // 리셋 버튼 추가
    const resetButton = { reset: () => {
        resetOptions();
        onChangeCallback();
        // GUI 컨트롤 업데이트
        gui.controllers.forEach(controller => {
            controller.updateDisplay();
        });
    }};
    gui.add(resetButton, 'reset').name('Reset to Defaults');
} 