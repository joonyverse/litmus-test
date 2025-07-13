// 메인 애플리케이션 로직
import { randChoice, perturbColor, resizeCanvasToWindow, CanvasUtils, LayerManager } from './utils/index.js';
import { options, palettes, setupGUI, saveColorSettings, getRowOffset, updateRowOffsetControls } from './config.js';
import { WatercolorBar, WatercolorLine } from './classes/index.js';
import { drawNoiseOverlay } from './effects.js';

// options 객체를 전역으로 노출 (camera-controller에서 접근할 수 있도록)
window.options = options;

// 결정적 랜덤 함수 (시드 기반)
function seededRandom(seed) {
    const x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
}

// 블랭킹 결정 함수
function shouldBlank(col, row) {
    if (!options.blankingEnabled) return false;
    
    const seed = options.blankingSeed + col * 1000 + row * 10000;
    const randomValue = seededRandom(seed);
    
    return randomValue < (options.blankingPercentage / 100);
}

// 캔버스 초기화
const canvas = document.getElementById('art');
const ctx = canvas.getContext('2d');

// 레이어 매니저 초기화
const layerManager = new LayerManager(canvas);

// 레이어 생성
let barLayer, lineLayer, effectLayer;

// 그리기 클래스 인스턴스들 (레이어별로 분리)
let watercolorBar, watercolorLine;

// 막대와 선의 위치 추적을 위한 배열
let barElements = [];
let lineElements = [];

// 개별 막대 색상 저장 (키: "col_row", 값: 색상)
let individualBarColors = new Map();
let individualLineColors = new Map();

// 색상 선택 UI 상태
let colorPickerVisible = false;
let lastClickedElement = null;
let colorPickerElement = null;

// 레이어 초기화 함수
function initializeLayers() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    
    // 레이어 생성
    barLayer = layerManager.createLayer('bars', width, height);
    lineLayer = layerManager.createLayer('lines', width, height);
    effectLayer = layerManager.createLayer('effects', width, height);
    
    // 그리기 클래스 인스턴스 생성
    watercolorBar = new WatercolorBar(barLayer.ctx);
    watercolorLine = new WatercolorLine(lineLayer.ctx);
}

// 그리드 계산 헬퍼 함수
function calculateGrid() {
    const { barWidth, barHeight, barGapX, barGapY, marginLeft, marginRight, marginTop, marginBottom } = options;
    
    const cols = Math.floor((canvas.width - marginLeft - marginRight) / (barWidth + barGapX));
    const rows = Math.floor((canvas.height - marginTop - marginBottom) / (barHeight + barGapY));
    
    return { cols, rows, barWidth, barHeight, barGapX, barGapY, marginLeft, marginTop };
}

// 색상 그룹 관리 클래스
class ColorGroupManager {
    constructor() {
        this.currentPalette = null;
        this.currentColor = null;
        this.groupSize = 0;
        this.groupIndex = 0;
        this.updateBarColors();
    }
    
    updateBarColors() {
        this.barColors = [options.barColor1, options.barColor2, options.barColor3, options.barColor4, options.barColor5, options.barColor6];
    }
    
    getNextColor() {
        if (this.groupIndex === 0) {
            this.currentPalette = randChoice(palettes);
            this.currentColor = randChoice(this.currentPalette);
            this.groupSize = Math.floor(Math.random() * (options.maxNumBarPerGroup - 1 + 1)) + 1;
        }
        
        this.groupIndex++;
        if (this.groupIndex === this.groupSize) {
            this.groupIndex = 0;
        }
        
        return this.currentColor;
    }
    
    getNextBarColor(col, row) {
        // 그룹 기반 색상 결정
        const groupSeed = col * 1000 + row * 100;
        
        // 그룹 시작 위치 계산 (결정적) - 고정된 그룹 단위 사용
        const groupUnit = 4; // 고정된 그룹 단위 (4x4 그룹)
        const groupStartCol = Math.floor(col / groupUnit) * groupUnit;
        const groupStartRow = Math.floor(row / groupUnit) * groupUnit;
        const groupId = groupStartCol * 1000 + groupStartRow * 100;
        
        // 그룹 내에서의 위치
        const groupCol = col - groupStartCol;
        const groupRow = row - groupStartRow;
        const groupPosition = groupRow * groupUnit + groupCol;
        
        // 그룹 크기 결정 (결정적 랜덤)
        const sizeSeed = groupId + 1000 + options.barColorSeed * 10000;
        const range = options.maxBarGroupSize - options.minBarGroupSize + 1;
        const groupSize = Math.floor(seededRandom(sizeSeed) * range) + options.minBarGroupSize;
        
        // 그룹 내에서 색상 결정
        if (groupPosition < groupSize) {
            // 같은 그룹 내에서는 같은 색상 사용
            const colorSeed = groupId + 500 + options.barColorSeed * 10000;
            const randomIndex = Math.floor(seededRandom(colorSeed) * this.barColors.length);
            const selectedColor = this.barColors[randomIndex];
            console.log(`Group color for bar at (${col}, ${row}): ${selectedColor} (group ${groupId}, size ${groupSize}, position ${groupPosition})`);
            return selectedColor;
        } else {
            // 그룹 밖에서는 다른 색상 사용
            const colorSeed = groupId + 1500 + options.barColorSeed * 10000;
            const randomIndex = Math.floor(seededRandom(colorSeed) * this.barColors.length);
            const selectedColor = this.barColors[randomIndex];
            console.log(`Non-group color for bar at (${col}, ${row}): ${selectedColor} (group ${groupId}, size ${groupSize}, position ${groupPosition})`);
            return selectedColor;
        }
    }
}

// 막대 위치 계산 헬퍼 함수
function calculateBarPosition(col, row, grid) {
    const { barWidth, barHeight, barGapX, barGapY, marginLeft, marginTop } = grid;
    
    // 결정적 랜덤을 위한 시드
    const positionSeed = col * 1000 + row * 10000;
    
    // 기본 위치 계산
    let x = marginLeft + col * (barWidth + barGapX) + (seededRandom(positionSeed) - 0.5) * 4;
    let y = marginTop + row * (barHeight + barGapY) + (seededRandom(positionSeed + 100) - 0.5) * 4;
    
    // 행별 오프셋 적용
    const rowOffset = getRowOffset(row);
    x += rowOffset.x;
    y += rowOffset.y;
    
    return { x, y };
}

// 막대 속성 계산 헬퍼 함수
function calculateBarProperties(col, row) {
    // 결정적 랜덤을 위한 시드
    const propertySeed = col * 2000 + row * 20000;
    
    const heightVariation = (seededRandom(propertySeed) - 0.5) * options.barHeightVariation;
    const actualHeight = options.barHeight + heightVariation;
    const rotation = (seededRandom(propertySeed + 100) - 0.5) * options.barRotation;
    const wobble = options.barWobble;
    
    return { actualHeight, rotation, wobble };
}

// 선 그리기 헬퍼 함수
function drawBarLines(x, y, barWidth, actualHeight, rotation, col, row) {
    // 결정적 랜덤을 위한 시드 (위치 기반)
    const positionSeed = Math.floor(x * 1000 + y * 10000);
    
    // 선 개수도 결정적으로 계산
    const lineCount = Math.floor(seededRandom(positionSeed + 500) * 2) + 1; // 1-2개
    const minGap = 12;
    const usedYs = [];
    
    // 6개의 고정된 위치 후보와 각각의 고정 색상 (막대 높이의 비율로 정의)
    const positionCandidates = [
        { ratio: 0.15, color: options.lineColor1 },  // 막대 높이의 15% 지점
        { ratio: 0.3, color: options.lineColor2 },   // 막대 높이의 30% 지점
        { ratio: 0.45, color: options.lineColor3 },  // 막대 높이의 45% 지점
        { ratio: 0.6, color: options.lineColor4 },   // 막대 높이의 60% 지점
        { ratio: 0.75, color: options.lineColor5 },  // 막대 높이의 75% 지점
        { ratio: 0.9, color: options.lineColor6 }    // 막대 높이의 90% 지점
    ];
    
    for (let i = 0; i < lineCount; i++) {
        // 결정적 랜덤으로 후보 선택
        const candidateIndex = Math.floor(seededRandom(positionSeed + i * 100) * positionCandidates.length);
        const selectedCandidate = positionCandidates[candidateIndex];
        let ly = y + actualHeight * selectedCandidate.ratio;
        
        // 충분히 떨어진 Y 위치인지 확인
        let attempts = 0;
        while (
            usedYs.some(prevLy => Math.abs(prevLy - ly) < minGap) &&
            attempts < 10
        ) {
            // 다른 후보 중에서 결정적으로 선택
            const remainingCandidates = positionCandidates.filter(candidate => 
                !usedYs.some(prevLy => Math.abs(prevLy - (y + actualHeight * candidate.ratio)) < minGap)
            );
            
            if (remainingCandidates.length === 0) break;
            
            const newIndex = Math.floor(seededRandom(positionSeed + i * 100 + attempts * 10) * remainingCandidates.length);
            const newCandidate = remainingCandidates[newIndex];
            ly = y + actualHeight * newCandidate.ratio;
            selectedCandidate.ratio = newCandidate.ratio;
            selectedCandidate.color = newCandidate.color;
            attempts++;
        }
        
        usedYs.push(ly);

        // 결정적 랜덤으로 선 위치와 너비 계산
        const lx = x - Math.floor(seededRandom(positionSeed + i * 200) * (barWidth * 0.1));
        const lineColor = selectedCandidate.color;
        const lineWidth = Math.floor(seededRandom(positionSeed + i * 300) * 3) + 2;
        const lineEndX = lx + barWidth + Math.floor(seededRandom(positionSeed + i * 400) * (barWidth * 0.1));
        
        // 회전 적용
        CanvasUtils.withRotation(lineLayer.ctx, x + barWidth / 2, y + actualHeight / 2, rotation, () => {
            // 텍스처가 있는 선 그리기
            watercolorLine.draw(lx, ly, lineEndX, ly, lineColor, lineWidth);
        });

        // 선 위치 정보 저장 (클릭 감지용)
        const lineColors = [options.lineColor1, options.lineColor2, options.lineColor3, options.lineColor4, options.lineColor5, options.lineColor6];
        const colorIndex = lineColors.indexOf(lineColor);

        lineElements.push({
            type: 'line',
            x: lx,
            y: ly,
            width: lineEndX - lx,
            height: lineWidth,
            colorIndex: colorIndex,
            col: col,
            row: row
        });
    }
}

// 단일 막대 그리기 함수
function drawBar(col, row, colorGroupManager) {
    // 블랭킹 체크
    if (shouldBlank(col, row)) return;
    
    const grid = calculateGrid();
    const { x, y } = calculateBarPosition(col, row, grid);
    const { actualHeight, rotation, wobble } = calculateBarProperties(col, row);
    
    // 개별 색상이 있으면 오버라이드, 없으면 그룹 기반 색상 사용
    let color = getIndividualBarColor(col, row);
    if (!color) {
        color = colorGroupManager.getNextBarColor(col, row);
    } else {
        console.log(`Using individual color for bar at (${col}, ${row}): ${color} (overriding group color)`);
    }
    
    // 막대 그리기 (barLayer에)
    watercolorBar.draw(x, y, grid.barWidth, actualHeight, perturbColor(color, 24), rotation, wobble);
    
    // 막대 위치 정보 저장 (클릭 감지용)
    const barColors = [options.barColor1, options.barColor2, options.barColor3, options.barColor4, options.barColor5, options.barColor6];
    const colorIndex = barColors.indexOf(color);
    
    barElements.push({
        type: 'bar',
        x: x,
        y: y,
        width: grid.barWidth,
        height: actualHeight,
        colorIndex: colorIndex,
        col: col,
        row: row,
        individualColor: color // 개별 색상 저장
    });
    
    // 막대 위에 선 그리기 (lineLayer에)
    drawBarLines(x, y, grid.barWidth, actualHeight, rotation, col, row);
}

// 막대만 그리기 함수
function drawBars() {
    layerManager.clearLayer('bars');
    barElements = []; // 요소 배열 초기화
    
    const { cols, rows } = calculateGrid();
    globalColorGroupManager = new ColorGroupManager();
    
    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            // 블랭킹 체크
            if (shouldBlank(col, row)) continue;
            
            const grid = calculateGrid();
            const { x, y } = calculateBarPosition(col, row, grid);
            const { actualHeight, rotation, wobble } = calculateBarProperties(col, row);
            
            // 개별 색상이 있으면 오버라이드, 없으면 그룹 기반 색상 사용
            let color = getIndividualBarColor(col, row);
            if (!color) {
                color = globalColorGroupManager.getNextBarColor(col, row);
            } else {
                console.log(`Using individual color for bar at (${col}, ${row}): ${color} (overriding group color)`);
            }
            
            watercolorBar.draw(x, y, grid.barWidth, actualHeight, perturbColor(color, 24), rotation, wobble);
            
            // 막대 위치 정보 저장 (클릭 감지용)
            const barColors = [options.barColor1, options.barColor2, options.barColor3, options.barColor4, options.barColor5, options.barColor6];
            const colorIndex = barColors.indexOf(color);
            
            barElements.push({
                type: 'bar',
                x: x,
                y: y,
                width: grid.barWidth,
                height: actualHeight,
                colorIndex: colorIndex,
                col: col,
                row: row,
                individualColor: color // 개별 색상 저장
            });
        }
    }
}

// 선만 그리기 함수
function drawLines() {
    layerManager.clearLayer('lines');
    lineElements = []; // 요소 배열 초기화
    
    const { cols, rows } = calculateGrid();
    const colorGroupManager = new ColorGroupManager();
    
    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            // 블랭킹 체크
            if (shouldBlank(col, row)) continue;
            
            const grid = calculateGrid();
            const { x, y } = calculateBarPosition(col, row, grid);
            const { actualHeight, rotation, wobble } = calculateBarProperties(col, row);
            
            drawBarLines(x, y, grid.barWidth, actualHeight, rotation, col, row);
        }
    }
}

// 효과 그리기 함수
function drawEffects() {
    layerManager.clearLayer('effects');
    drawNoiseOverlay(effectLayer.ctx, canvas.width, canvas.height, 0.08);
}

// 메인 그리기 함수
function drawPattern() {
    // 캔버스 크기 조정
    resizeCanvasToWindow(canvas);
    layerManager.resizeLayers(canvas.width, canvas.height);
    
    // 모든 레이어 그리기
    drawBars();
    drawLines();
    drawEffects();
    
    // 레이어 합성
    layerManager.composite();
}

// 선 토글 함수
function toggleLines() {
    layerManager.toggleLayer('lines');
}

// 막대 토글 함수
function toggleBars() {
    layerManager.toggleLayer('bars');
}

// 블랭킹 토글 함수
function toggleBlanking() {
    options.blankingEnabled = !options.blankingEnabled;
    drawPattern();
}

// 레이어별 그리기 함수들
function redrawBars() {
    drawBars();
    layerManager.composite();
}

function redrawLines() {
    drawLines();
    layerManager.composite();
}

function redrawEffects() {
    drawEffects();
    layerManager.composite();
}

// 배경 색상 업데이트 함수
function updateBackgroundColor(color) {
    // CSS 배경 색상 업데이트
    document.body.style.backgroundColor = color;
    document.querySelector('canvas').style.backgroundColor = color;
    
    // 캔버스 배경 색상 업데이트
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // 레이어 합성 (기존 레이어 유지)
    layerManager.composite();
}

// 화남 감지 시 배경 색상 변경
let originalBackgroundColor = null;
let isAngryMode = false;

function onAngryDetected() {
    if (!isAngryMode) {
        // 원래 배경 색상 저장
        originalBackgroundColor = options.backgroundColor;
        isAngryMode = true;
        
        // 빨간색으로 변경
        updateBackgroundColor('#ff4444');
        console.log('😡 화남 감지 - 배경을 빨간색으로 변경');
    }
}

function onAngryStop() {
    if (isAngryMode && originalBackgroundColor) {
        isAngryMode = false;
        
        // 원래 색상으로 복구
        updateBackgroundColor(originalBackgroundColor);
        console.log('😐 화남 멈춤 - 배경을 원래 색상으로 복구');
    }
}

// 이벤트 리스너 설정
window.addEventListener('resize', () => {
    drawPattern();
    // 창 크기 변경 시 행 수가 변경될 수 있으므로 행별 오프셋 컨트롤 업데이트
    setTimeout(() => updateRowOffsetControls(), 100);
});

// GUI 설정
setupGUI(drawPattern);

// 전역 ColorGroupManager 인스턴스
let globalColorGroupManager;

// 막대 색상 업데이트 함수
function updateBarColors() {
    if (globalColorGroupManager) {
        globalColorGroupManager.updateBarColors();
    }
}

// 개별 막대 색상 가져오기 함수
function getIndividualBarColor(col, row) {
    const key = `${col}_${row}`;
    const savedColor = individualBarColors.get(key);
    if (savedColor) {
        console.log(`Using saved color for bar at (${col}, ${row}): ${savedColor}`);
        return savedColor;
    }
    return null; // 개별 색상이 없으면 null 반환
}

// 개별 선 색상 가져오기 함수
function getIndividualLineColor(col, row, colorIndex) {
    const key = `${col}_${row}_${colorIndex}`;
    return individualLineColors.get(key);
}

// 개별 막대 색상 설정 함수
function setIndividualBarColor(col, row, color) {
    const key = `${col}_${row}`;
    individualBarColors.set(key, color);
}

// 개별 선 색상 설정 함수
function setIndividualLineColor(col, row, colorIndex, color) {
    const key = `${col}_${row}_${colorIndex}`;
    individualLineColors.set(key, color);
}

// 개별 색상 저장 함수
function saveIndividualColors() {
    const individualColors = {
        barColors: Object.fromEntries(individualBarColors),
        lineColors: Object.fromEntries(individualLineColors)
    };
    localStorage.setItem('individual_colors', JSON.stringify(individualColors));
    console.log('Saved individual colors:', {
        barColors: individualBarColors.size,
        lineColors: individualLineColors.size
    });
}

// 개별 색상 불러오기 함수
function loadIndividualColors() {
    try {
        const saved = localStorage.getItem('individual_colors');
        if (saved) {
            const individualColors = JSON.parse(saved);
            individualBarColors = new Map(Object.entries(individualColors.barColors || {}));
            individualLineColors = new Map(Object.entries(individualColors.lineColors || {}));
            console.log('Loaded individual colors:', {
                barColors: individualBarColors.size,
                lineColors: individualLineColors.size
            });
        }
    } catch (error) {
        console.warn('Failed to load individual colors:', error);
    }
}

// 개별 색상 초기화 함수
function clearIndividualColors() {
    individualBarColors.clear();
    individualLineColors.clear();
    localStorage.removeItem('individual_colors');
    drawPattern(); // 화면 다시 그리기
}

// 레이어 초기화 및 첫 그리기
initializeLayers();
updateBackgroundColor(options.backgroundColor);
loadIndividualColors(); // 개별 색상 불러오기
drawPattern();

// 클릭 이벤트 리스너 추가
canvas.addEventListener('click', handleCanvasClick);

// 전역 이벤트 리스너로 색상 선택기 정리 보장
document.addEventListener('click', (event) => {
    // 색상 선택기가 활성화되어 있고, 캔버스 외부를 클릭한 경우 정리
    if (colorPickerVisible && !canvas.contains(event.target)) {
        console.log('Clicked outside canvas, cleaning up color picker');
        cleanupColorPicker();
    }
});

// ESC 키로 색상 선택기 취소
document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && colorPickerVisible) {
        console.log('ESC pressed, cleaning up color picker');
        cleanupColorPicker();
    }
});

// 전역 함수로 토글 기능 노출
window.toggleLines = toggleLines;
window.toggleBars = toggleBars;
window.toggleBlanking = toggleBlanking;
window.redrawBars = redrawBars;
window.redrawLines = redrawLines;
window.redrawEffects = redrawEffects;
window.updateBackgroundColor = updateBackgroundColor;
window.updateBarColors = updateBarColors;
window.clearIndividualColors = clearIndividualColors; // 개별 색상 초기화 함수 노출
window.onAngryDetected = onAngryDetected; // 화남 감지 콜백 노출
window.onAngryStop = onAngryStop; // 화남 멈춤 콜백 노출

// 색상 선택 UI 생성 함수
function createColorPicker() {
    // 기존 색상 선택기가 있으면 제거
    cleanupColorPicker();
    
    colorPickerElement = document.createElement('div');
    colorPickerElement.style.cssText = `
        position: fixed;
        top: -9999px;
        left: -9999px;
        z-index: -1;
        pointer-events: none;
    `;
    
    // 숨겨진 색상 선택기
    const colorInput = document.createElement('input');
    colorInput.type = 'color';
    colorInput.value = '#e63946';
    colorInput.style.cssText = `
        width: 1px;
        height: 1px;
        opacity: 0;
        position: absolute;
        top: -9999px;
        left: -9999px;
        pointer-events: auto;
    `;
    
    // 색상 변경 시 자동 적용 및 정리
    colorInput.addEventListener('change', (event) => {
        event.stopPropagation();
        const selectedColor = colorInput.value;
        
        if (lastClickedElement) {
            changeElementColor(lastClickedElement, selectedColor);
        }
        
        // 즉시 정리
        setTimeout(() => {
            cleanupColorPicker();
        }, 50);
    });
    
    // 색상 선택 취소 시에도 정리
    colorInput.addEventListener('blur', (event) => {
        event.stopPropagation();
        setTimeout(() => {
            cleanupColorPicker();
        }, 50);
    });
    
    // ESC 키로 취소
    colorInput.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            event.stopPropagation();
            cleanupColorPicker();
        }
    });
    
    colorPickerElement.appendChild(colorInput);
    document.body.appendChild(colorPickerElement);
}

// 색상 선택기 정리 함수
function cleanupColorPicker() {
    if (colorPickerElement) {
        try {
            document.body.removeChild(colorPickerElement);
        } catch (error) {
            console.warn('Error removing color picker:', error);
        }
        colorPickerElement = null;
    }
    colorPickerVisible = false;
    console.log('Color picker cleaned up');
}

// 색상 선택 UI 표시 함수
function showColorPicker() {
    try {
        if (!colorPickerElement) {
            createColorPicker();
        }
        
        // 숨겨진 색상 입력 필드 클릭하여 브라우저 색상 선택기 열기
        const colorInput = colorPickerElement.querySelector('input[type="color"]');
        if (colorInput) {
            colorInput.click();
            colorPickerVisible = true;
            console.log('Color picker shown');
        } else {
            console.warn('Color input not found');
            cleanupColorPicker();
        }
    } catch (error) {
        console.error('Error showing color picker:', error);
        cleanupColorPicker();
    }
}

// 색상 선택 UI 숨기기 함수
function hideColorPicker() {
    cleanupColorPicker();
    // lastClickedElement를 null로 설정하지 않음 - 계속 클릭 가능하도록
}

// 요소 색상 변경 함수
function changeElementColor(element, newColor) {
    if (element.type === 'bar') {
        // 개별 막대 색상 변경
        setIndividualBarColor(element.col, element.row, newColor);
        console.log(`Set individual bar color at (${element.col}, ${element.row}) to ${newColor}`);
        
        // 설정 저장 및 다시 그리기
        saveIndividualColors();
        redrawBars();
        
    } else if (element.type === 'line') {
        // 개별 선 색상 변경
        setIndividualLineColor(element.col, element.row, element.colorIndex, newColor);
        console.log(`Set individual line color at (${element.col}, ${element.row}, ${element.colorIndex}) to ${newColor}`);
        
        // 설정 저장 및 다시 그리기
        saveIndividualColors();
        redrawLines();
    }
    
    console.log(`Changed ${element.type} color at (${element.col}, ${element.row}) to ${newColor}`);
}

// 클릭 이벤트 처리 함수
function handleCanvasClick(event) {
    // 색상 선택기가 활성화되어 있으면 클릭 무시
    if (colorPickerVisible) {
        console.log('Color picker is active, ignoring click');
        return;
    }
    
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    // 막대 클릭 확인
    for (let element of barElements) {
        if (x >= element.x && x <= element.x + element.width &&
            y >= element.y && y <= element.y + element.height) {
            lastClickedElement = element; // 마지막으로 클릭된 요소 업데이트
            showColorPicker();
            return;
        }
    }
    
    // 선 클릭 확인
    for (let element of lineElements) {
        const lineWidth = 10; // 클릭 감지용 여유 공간
        if (x >= element.x - lineWidth && x <= element.x + element.width + lineWidth &&
            y >= element.y - lineWidth && y <= element.y + lineWidth) {
            lastClickedElement = element; // 마지막으로 클릭된 요소 업데이트
            showColorPicker();
            return;
        }
    }
} 