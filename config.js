// 설정 및 옵션 - 메인 파일

import { loadSettingsFromStorage, saveSettingsToStorage } from './storage.js';
import { setupCameraGUI } from './gui-camera.js';
import { setupArtGUI } from './gui-art.js';
import { setupRowsGUI } from './gui-rows.js';

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

// 초기 설정 생성
const initialOptions = mergeSettingsWithDefaults();
export const options = validateOptions(initialOptions);

// 색상 설정 저장 함수
export function saveColorSettings() {
    const settingsToSave = {
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
        barColorSeed: options.barColorSeed
    };
    saveSettingsToStorage(settingsToSave);
}

// 리셋 함수
export function resetOptions() {
    const resetValues = { ...DEFAULT_OPTIONS };
    Object.keys(resetValues).forEach(key => {
        if (key !== 'rowOffsets') { // rowOffsets는 따로 관리
            options[key] = resetValues[key];
        }
    });
    saveColorSettings();
    console.log('옵션이 기본값으로 리셋되었습니다.');
}

// 행별 오프셋 초기화 함수
export function initializeRowOffsets(rowCount) {
    if (!options.rowOffsets) {
        options.rowOffsets = [];
    }
    
    // 부족한 행만큼 추가
    while (options.rowOffsets.length < rowCount) {
        options.rowOffsets.push({ x: 0, y: 0 });
    }
    
    // 초과한 행은 제거 (필요에 따라)
    if (options.rowOffsets.length > rowCount) {
        options.rowOffsets.splice(rowCount);
    }
}

// 특정 행의 오프셋 설정 함수
export function setRowOffset(rowIndex, offsetX, offsetY) {
    if (!options.rowOffsets[rowIndex]) {
        options.rowOffsets[rowIndex] = { x: 0, y: 0 };
    }
    options.rowOffsets[rowIndex].x = offsetX;
    options.rowOffsets[rowIndex].y = offsetY;
}

// 특정 행의 오프셋 가져오기 함수
export function getRowOffset(rowIndex) {
    if (rowIndex < 0 || rowIndex >= options.rowOffsets.length) {
        return { x: 0, y: 0 };
    }
    return options.rowOffsets[rowIndex];
}

// 배경색 업데이트 함수
function updateBackgroundColor(color) {
    options.backgroundColor = color;
    saveColorSettings();
    
    // 페이지 배경색 즉시 변경
    document.body.style.backgroundColor = color;
    
    // main.js의 리드로우 함수 호출 (존재하는 경우)
    if (window.redrawBars) {
        window.redrawBars();
    }
    if (window.redrawLines) {
        window.redrawLines();
    }
}

// dat.GUI 설정 함수
export function setupGUI(onChangeCallback) {
    if (typeof dat === 'undefined') return;

    const gui = new dat.GUI();

    // 카메라 관련 GUI 설정
    setupCameraGUI(gui);

    // 아트 관련 GUI 설정
    setupArtGUI(gui, options, onChangeCallback, saveColorSettings, updateBackgroundColor);

    // 행 오프셋 관련 GUI 설정
    setupRowsGUI(gui, options, onChangeCallback, initializeRowOffsets, setRowOffset, resetOptions);
}

// 행별 오프셋 컨트롤 업데이트 함수를 외부에서 호출할 수 있도록 export
export function updateRowOffsetControls() {
    if (window.updateRowOffsetControls) {
        window.updateRowOffsetControls();
    }
}