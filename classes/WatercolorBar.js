// 수채화 막대 그리기 클래스
import { randInt, addAlphaToColor, CanvasUtils } from '../utils/index.js';
import { options } from '../config.js';

export class WatercolorBar {
    constructor(ctx) {
        this.ctx = ctx;
    }

    // 색상에 알파값 추가하는 헬퍼 메서드
    _addAlphaToColor(color, alpha) {
        return addAlphaToColor(color, alpha);
    }

    // 수채화 그라데이션 생성
    _createGradient(x, y, w, h, color, alpha) {
        const gradient = this.ctx.createLinearGradient(x, y, x + w, y + h);
        const baseColor = this._addAlphaToColor(color, alpha);
        const lighterColor = this._addAlphaToColor(color, alpha * 0.5);
        
        gradient.addColorStop(0, baseColor);
        gradient.addColorStop(0.5, lighterColor);
        gradient.addColorStop(1, baseColor);
        
        return gradient;
    }

    // 막대 번짐 효과 그리기
    _drawBarBlurEffect(x, y, w, h, color, layerAlpha) {
        this.ctx.globalAlpha = layerAlpha * options.barBlurAmount;
        for (let i = 0; i < options.barBlurCount; i++) {
            const blurX = x + (Math.random() - 0.5) * w * 0.2;
            const blurY = y + (Math.random() - 0.5) * h * 0.2;
            const blurW = Math.random() * w * 0.3;
            const blurH = Math.random() * h * 0.3;
            
            this.ctx.fillStyle = this._addAlphaToColor(color, layerAlpha);
            this.ctx.fillRect(blurX, blurY, blurW, blurH);
        }
    }

    // 베지어 곡선 제어점 계산
    _calculateBezierControlPoints(prev, curr, wobble) {
        const BEZIER_CONTROL_OFFSET = 8;
        const BEZIER_Y_OFFSET = 4;
        
        const cp1x = prev.x + (curr.x - prev.x) * 0.5 + (Math.random() - 0.5) * BEZIER_CONTROL_OFFSET;
        const cp1y = prev.y + (Math.random() - 0.5) * BEZIER_Y_OFFSET;
        const cp2x = curr.x - (curr.x - prev.x) * 0.5 + (Math.random() - 0.5) * BEZIER_CONTROL_OFFSET;
        const cp2y = curr.y + (Math.random() - 0.5) * BEZIER_Y_OFFSET;
        
        return { cp1x, cp1y, cp2x, cp2y };
    }

    // 곡선 경로 생성
    _createCurvedPath(x, y, w, h, layerOffset, steps, wobble) {
        const topPoints = [];
        const bottomPoints = [];
        
        for (let i = 0; i <= steps; i++) {
            const px = x + (w / steps) * i + (Math.random() - 0.5) * layerOffset;
            const pyTop = y + randInt(-5, 5) + (Math.random() - 0.5) * layerOffset;
            const pyBottom = y + h + randInt(-5, 5) + (Math.random() - 0.5) * layerOffset;
            
            // 흔들림 효과 추가
            const wobbleX = (Math.random() - 0.5) * wobble;
            const wobbleY = (Math.random() - 0.5) * wobble;
            
            topPoints.push({ x: px + wobbleX, y: pyTop + wobbleY });
            bottomPoints.push({ x: px + wobbleX, y: pyBottom + wobbleY });
        }
        
        return { topPoints, bottomPoints };
    }

    draw(x, y, w, h, color, rotation = 0, wobble = 0) {
        // 수채화 효과를 위한 여러 레이어 그리기
        for (let layer = 0; layer < options.barLayers; layer++) {
            const layerAlpha = options.barAlpha - (layer * 0.05);
            const layerOffset = layer * 1.5;
            const steps = 3 + layer;
            
            // 곡선 경로 생성
            const { topPoints, bottomPoints } = this._createCurvedPath(x, y, w, h, layerOffset, steps, wobble);

            this.ctx.beginPath();
            this.ctx.moveTo(topPoints[0].x, topPoints[0].y);
            
            // 상단 곡선 그리기
            for (let i = 1; i < topPoints.length; i++) {
                const prev = topPoints[i - 1];
                const curr = topPoints[i];
                const { cp1x, cp1y, cp2x, cp2y } = this._calculateBezierControlPoints(prev, curr, wobble);
                
                this.ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, curr.x, curr.y);
            }
            
            // 하단 곡선 그리기 (역순)
            for (let i = bottomPoints.length - 1; i >= 0; i--) {
                const prev = bottomPoints[Math.min(i + 1, bottomPoints.length - 1)];
                const curr = bottomPoints[i];
                const { cp1x, cp1y, cp2x, cp2y } = this._calculateBezierControlPoints(prev, curr, wobble);
                
                this.ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, curr.x, curr.y);
            }
            
            this.ctx.closePath();
            
            // 회전 적용
            CanvasUtils.withRotation(this.ctx, x + w / 2, y + h / 2, rotation, () => {
                // 수채화 그라데이션 효과
                this.ctx.fillStyle = this._createGradient(x, y, w, h, color, layerAlpha);
                this.ctx.fill();
            });
            
            // 수채화 번짐 효과
            this._drawBarBlurEffect(x, y, w, h, color, layerAlpha);
        }
        
        this.ctx.globalAlpha = 1.0;
    }
} 