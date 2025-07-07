// 메인 애플리케이션 로직
import { randChoice, perturbColor, resizeCanvasToWindow, CanvasUtils, LayerManager } from './utils/index.js';
import { options, palettes, setupGUI } from './config.js';
import { WatercolorBar, WatercolorLine } from './classes/index.js';
import { drawNoiseOverlay } from './effects.js';

// 캔버스 초기화
const canvas = document.getElementById('art');
const ctx = canvas.getContext('2d');

// 레이어 매니저 초기화
const layerManager = new LayerManager(canvas);

// 레이어 생성
let barLayer, lineLayer, effectLayer;

// 그리기 클래스 인스턴스들 (레이어별로 분리)
let watercolorBar, watercolorLine;

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
}

// 막대 위치 계산 헬퍼 함수
function calculateBarPosition(col, row, grid) {
    const { barWidth, barHeight, barGapX, barGapY, marginLeft, marginTop } = grid;
    
    // 약간의 랜덤 오프셋 추가
    const x = marginLeft + col * (barWidth + barGapX) + (Math.random() - 0.5) * 4;
    const y = marginTop + row * (barHeight + barGapY) + (Math.random() - 0.5) * 4;
    
    return { x, y };
}

// 막대 속성 계산 헬퍼 함수
function calculateBarProperties() {
    const heightVariation = (Math.random() - 0.5) * options.barHeightVariation;
    const actualHeight = options.barHeight + heightVariation;
    const rotation = (Math.random() - 0.5) * options.barRotation;
    const wobble = options.barWobble;
    
    return { actualHeight, rotation, wobble };
}

// 선 그리기 헬퍼 함수
function drawBarLines(x, y, barWidth, actualHeight, rotation) {
    const lineCount = Math.floor(Math.random() * (2 - 1 + 1)) + 1;
    const minGap = 12;
    const usedYs = [];
    
    for (let i = 0; i < lineCount; i++) {
        // 충분히 떨어진 Y 위치 찾기
        let ly;
        let attempts = 0;
        do {
            ly = y + Math.floor(Math.random() * (actualHeight - 8 - 8 + 1)) + 8;
            attempts++;
        } while (
            usedYs.some(prevLy => Math.abs(prevLy - ly) < minGap) &&
            attempts < 10
        );
        usedYs.push(ly);

        const lx = x - Math.floor(Math.random() * (barWidth * 0.1 - 0 + 1)) + 0;
        const lineColor = randChoice(['#222', '#e63946', '#457b9d', '#2a9d8f', '#f4a261']);
        const lineWidth = Math.floor(Math.random() * (4 - 2 + 1)) + 2;
        const lineEndX = lx + barWidth + Math.floor(Math.random() * (barWidth * 0.1 - 0 + 1)) + 0;
        
        // 회전 적용
        CanvasUtils.withRotation(lineLayer.ctx, x + barWidth / 2, y + actualHeight / 2, rotation, () => {
            // 텍스처가 있는 선 그리기
            watercolorLine.draw(lx, ly, lineEndX, ly, lineColor, lineWidth);
        });
    }
}

// 단일 막대 그리기 함수
function drawBar(col, row, colorGroupManager) {
    const grid = calculateGrid();
    const { x, y } = calculateBarPosition(col, row, grid);
    const { actualHeight, rotation, wobble } = calculateBarProperties();
    
    // 막대 그리기 (barLayer에)
    const color = colorGroupManager.getNextColor();
    watercolorBar.draw(x, y, grid.barWidth, actualHeight, perturbColor(color, 24), rotation, wobble);
    
    // 막대 위에 선 그리기 (lineLayer에)
    drawBarLines(x, y, grid.barWidth, actualHeight, rotation);
}

// 막대만 그리기 함수
function drawBars() {
    layerManager.clearLayer('bars');
    
    const { cols, rows } = calculateGrid();
    const colorGroupManager = new ColorGroupManager();
    
    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            const grid = calculateGrid();
            const { x, y } = calculateBarPosition(col, row, grid);
            const { actualHeight, rotation, wobble } = calculateBarProperties();
            
            const color = colorGroupManager.getNextColor();
            watercolorBar.draw(x, y, grid.barWidth, actualHeight, perturbColor(color, 24), rotation, wobble);
        }
    }
}

// 선만 그리기 함수
function drawLines() {
    layerManager.clearLayer('lines');
    
    const { cols, rows } = calculateGrid();
    const colorGroupManager = new ColorGroupManager();
    
    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            const grid = calculateGrid();
            const { x, y } = calculateBarPosition(col, row, grid);
            const { actualHeight, rotation, wobble } = calculateBarProperties();
            
            drawBarLines(x, y, grid.barWidth, actualHeight, rotation);
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

// 이벤트 리스너 설정
window.addEventListener('resize', drawPattern);

// GUI 설정
setupGUI(drawPattern);

// 레이어 초기화 및 첫 그리기
initializeLayers();
drawPattern();

// 전역 함수로 토글 기능 노출
window.toggleLines = toggleLines;
window.toggleBars = toggleBars;
window.redrawBars = redrawBars;
window.redrawLines = redrawLines;
window.redrawEffects = redrawEffects; 