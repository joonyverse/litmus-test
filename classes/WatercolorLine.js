// 수채화 선 그리기 클래스
import { randInt, addAlphaToColor, CanvasUtils } from '../utils/index.js';
import { options } from '../config.js';

// 공통 수채화 효과 상수
const WATERCOLOR_CONSTANTS = {
    LINE_LAYERS: 4,
    LINE_ALPHA_BASE: 0.45,
    LINE_ALPHA_DECREASE: 0.08,
    LINE_WIDTH_INCREASE: 1.5,
    LINE_OFFSET_FACTOR: 0.6,
    CURVE_SEGMENTS_MIN: 5,
    CURVE_SEGMENTS_DIVISOR: 6,
    BEZIER_CONTROL_OFFSET: 8,
    BEZIER_Y_OFFSET: 4
};

export class WatercolorLine {
    constructor(ctx) {
        this.ctx = ctx;
    }

    // 색상에 알파값 추가하는 헬퍼 메서드
    _addAlphaToColor(color, alpha) {
        return addAlphaToColor(color, alpha);
    }

    // 수채화 번짐 효과 그리기
    _drawBlurEffect(x1, y1, x2, y2, color, width, layerAlpha) {
        this.ctx.globalAlpha = layerAlpha * options.lineBlurAmount;
        for (let i = 0; i < options.lineBlurCount; i++) {
            const t = Math.random();
            const x = x1 + (x2 - x1) * t;
            const y = y1 + (y2 - y1) * t;
            
            const blurX = x + (Math.random() - 0.5) * width * WATERCOLOR_CONSTANTS.LINE_OFFSET_FACTOR;
            const blurY = y + (Math.random() - 0.5) * width * WATERCOLOR_CONSTANTS.LINE_OFFSET_FACTOR;
            const blurW = Math.random() * width * 0.4;
            const blurH = Math.random() * width * 0.4;
            
            this.ctx.fillStyle = this._addAlphaToColor(color, layerAlpha * 0.5);
            this.ctx.fillRect(blurX, blurY, blurW, blurH);
        }
    }

    // 곡선 경로 생성
    _createCurvedPath(x1, y1, x2, y2, width, segments) {
        const path = [];
        path.push({ x: x1, y: y1 });
        
        for (let i = 1; i < segments; i++) {
            const t = i / (segments - 1);
            const x = x1 + (x2 - x1) * t;
            const y = y1 + (y2 - y1) * t;
            
            // 수채화 느낌의 랜덤 오프셋
            const offsetX = (Math.random() - 0.5) * width * WATERCOLOR_CONSTANTS.LINE_OFFSET_FACTOR * 0;
            const offsetY = Math.random() * width * WATERCOLOR_CONSTANTS.LINE_OFFSET_FACTOR * 0.5;
            
            path.push({ x: x + offsetX, y: y + offsetY });
        }
        
        path.push({ x: x2, y: y2 });
        return path;
    }

    draw(x1, y1, x2, y2, color, width) {
        const length = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
        const segments = Math.max(WATERCOLOR_CONSTANTS.CURVE_SEGMENTS_MIN, 
                                Math.floor(length / WATERCOLOR_CONSTANTS.CURVE_SEGMENTS_DIVISOR));
        
        CanvasUtils.withContextState(this.ctx, () => {
            // 수채화 효과를 위한 여러 레이어
            for (let layer = 0; layer < WATERCOLOR_CONSTANTS.LINE_LAYERS; layer++) {
                const layerAlpha = WATERCOLOR_CONSTANTS.LINE_ALPHA_BASE - (layer * WATERCOLOR_CONSTANTS.LINE_ALPHA_DECREASE);
                const layerWidth = width + layer * WATERCOLOR_CONSTANTS.LINE_WIDTH_INCREASE;
                
                this.ctx.strokeStyle = this._addAlphaToColor(color, layerAlpha);
                this.ctx.lineWidth = layerWidth;
                this.ctx.lineCap = 'round';
                
                // 곡선 경로 생성 및 그리기
                const path = this._createCurvedPath(x1, y1, x2, y2, width, segments);
                
                this.ctx.beginPath();
                this.ctx.moveTo(path[0].x, path[0].y);
                
                for (let i = 1; i < path.length; i++) {
                    this.ctx.lineTo(path[i].x, path[i].y);
                }
                
                this.ctx.stroke();
                
                // 수채화 번짐 효과
                this._drawBlurEffect(x1, y1, x2, y2, color, width, layerAlpha);
            }
        });
    }
} 