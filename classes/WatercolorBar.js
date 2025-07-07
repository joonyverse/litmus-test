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
            const blurX = x ;
            const blurY = y ;
            const blurW = Math.random() * w;
            const blurH = Math.random() * h;
            
            this.ctx.fillStyle = this._addAlphaToColor(color, layerAlpha);
            this.ctx.fillRect(blurX, blurY, blurW, blurH);
        }
    }



    // 베지어 곡선 제어점 계산
    _calculateBezierControlPoints(prev, curr, wobble, flatEnds = false) {
        const BEZIER_CONTROL_OFFSET = 8;
        const BEZIER_Y_OFFSET = 4;
        
        // 평평한 끝 옵션이 활성화된 경우 제어점을 더 정확하게 계산
        let cp1x, cp1y, cp2x, cp2y;
        
        if (flatEnds) {
            // 평평한 끝을 위해 제어점을 더 정확하게 배치
            cp1x = prev.x + (curr.x - prev.x) * 0.5;
            cp1y = prev.y;
            cp2x = curr.x - (curr.x - prev.x) * 0.5;
            cp2y = curr.y;
        } else {
            // 기존 방식
            cp1x = prev.x + (curr.x - prev.x) * 0.5 + (Math.random() - 0.5) * BEZIER_CONTROL_OFFSET;
            cp1y = prev.y + (Math.random() - 0.5) * BEZIER_Y_OFFSET;
            cp2x = curr.x - (curr.x - prev.x) * 0.5 + (Math.random() - 0.5) * BEZIER_CONTROL_OFFSET;
            cp2y = curr.y + (Math.random() - 0.5) * BEZIER_Y_OFFSET;
        }
        
        return { cp1x, cp1y, cp2x, cp2y };
    }

    // 곡선 경로 생성
    _createCurvedPath(x, y, w, h, layerOffset, steps, wobble, flatEnds = false) {
        const topPoints = [];
        const bottomPoints = [];
        
        for (let i = 0; i <= steps; i++) {
            // 평평한 끝 옵션이 활성화된 경우 끝점들은 레이어 오프셋 없이 정확한 위치에
            const px = flatEnds && (i === 0 || i === steps) 
                ? x + (w / steps) * i 
                : x + (w / steps) * i + (Math.random() - 0.5) * layerOffset;
            
            // 평평한 끝 옵션이 활성화된 경우 끝점들을 평평하게 조정
            let pyTop, pyBottom;
            
            if (flatEnds && (i === 0 || i === steps)) {
                // 끝점들은 평평하게 (첫 번째와 마지막 점)
                pyTop = y;
                pyBottom = y + h;
            } else {
                // 중간점들은 기존처럼 자연스럽게
                pyTop = y + randInt(-5, 5) + (Math.random() - 0.5) * layerOffset;
                pyBottom = y + h + randInt(-5, 5) + (Math.random() - 0.5) * layerOffset;
            }
            
            // 흔들림 효과 추가 (평평한 끝 옵션이 비활성화된 경우에만)
            const wobbleX = flatEnds && (i === 0 || i === steps) ? 0 : (Math.random() - 0.5) * wobble;
            const wobbleY = flatEnds && (i === 0 || i === steps) ? 0 : (Math.random() - 0.5) * wobble;
            
            topPoints.push({ x: px + wobbleX, y: pyTop + wobbleY });
            bottomPoints.push({ x: px + wobbleX, y: pyBottom + wobbleY });
        }
        
        return { topPoints, bottomPoints };
    }

    draw(x, y, w, h, color, rotation = 0, wobble = 0) {
        // 평평한 끝 옵션이 활성화된 경우 직사각형으로 그리기
        if (options.barFlatEnds) {
            this._drawRectangularBar(x, y, w, h, color, rotation);
        } else {
            // 기존 수채화 효과를 위한 여러 레이어 그리기
            for (let layer = 0; layer < options.barLayers; layer++) {
                const layerAlpha = options.barAlpha - (layer * 0.05);
                const layerOffset = layer * 1.5;
                const steps = 3 + layer;
                
                // 곡선 경로 생성
                const { topPoints, bottomPoints } = this._createCurvedPath(x, y, w, h, layerOffset, steps, wobble, false);

                this.ctx.beginPath();
                this.ctx.moveTo(topPoints[0].x, topPoints[0].y);
                
                // 상단 곡선 그리기
                for (let i = 1; i < topPoints.length; i++) {
                    const prev = topPoints[i - 1];
                    const curr = topPoints[i];
                    const { cp1x, cp1y, cp2x, cp2y } = this._calculateBezierControlPoints(prev, curr, wobble, false);
                    
                    this.ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, curr.x, curr.y);
                }
                
                // 하단 곡선 그리기 (역순)
                for (let i = bottomPoints.length - 1; i >= 0; i--) {
                    const prev = bottomPoints[Math.min(i + 1, bottomPoints.length - 1)];
                    const curr = bottomPoints[i];
                    const { cp1x, cp1y, cp2x, cp2y } = this._calculateBezierControlPoints(prev, curr, wobble, false);
                    
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
        }
        
        this.ctx.globalAlpha = 1.0;
    }

    // 직사각형 막대 그리기 (평평한 끝 옵션용)
    _drawRectangularBar(x, y, w, h, color, rotation) {
        // 수채화 효과를 위한 여러 레이어 그리기
        for (let layer = 0; layer < options.barLayers; layer++) {
            const layerAlpha = options.barAlpha - (layer * 0.05);
            const layerOffset = layer * 1.5;
            
            // 직사각형 경로 생성 (약간의 오프셋으로 수채화 효과)
            const rectX = x + (Math.random() - 0.5) * layerOffset;
            const rectY = y + (Math.random() - 0.5) * layerOffset;
            const rectW = w + (Math.random() - 0.5) * layerOffset * 0.5;
            const rectH = h + (Math.random() - 0.5) * layerOffset * 0.5;
            
            this.ctx.beginPath();
            
            // 상단 반원이 활성화된 경우 통합된 경로 그리기
            if (options.barTopSemicircle) {
                const radius = w / 2;
                const centerX = rectX + rectW / 2;
                const topY = rectY;
                const bottomY = rectY + rectH;
                
                // 뭉툭한 끝을 위한 오프셋 (각 막대마다 조금씩 다르게)
                const topBluntness = (Math.random() - 0.5) * 0.3; // -0.15 ~ 0.15
                const bottomBluntness = (Math.random() - 0.5) * 0.3;
                const topRadius = radius * (0.8 + topBluntness); // 0.65 ~ 0.95 배율
                const bottomRadius = radius * (0.8 + bottomBluntness);
                
                // 베지어 곡선으로 뭉툭한 상단 끝 그리기
                const topLeftX = centerX - topRadius;
                const topRightX = centerX + topRadius;
                const topControlY = topY - topRadius * 0.3; // 제어점을 위로 올려서 뭉툭하게
                
                this.ctx.moveTo(topLeftX, topY);
                this.ctx.quadraticCurveTo(centerX, topControlY, topRightX, topY);
                
                // 오른쪽 세로선
                this.ctx.lineTo(centerX + radius, bottomY);
                
                // 베지어 곡선으로 뭉툭한 하단 끝 그리기
                const bottomLeftX = centerX - bottomRadius;
                const bottomRightX = centerX + bottomRadius;
                const bottomControlY = bottomY + bottomRadius * 0.3; // 제어점을 아래로 내려서 뭉툭하게
                
                this.ctx.quadraticCurveTo(centerX, bottomControlY, bottomLeftX, bottomY);
                
                // 왼쪽 세로선 (시작점으로 돌아가기)
                this.ctx.lineTo(topLeftX, topY);
            } else {
                // 기존 직사각형 그리기
                this.ctx.rect(rectX, rectY, rectW, rectH);
            }
            
            this.ctx.closePath();
            
            // 회전 적용
            CanvasUtils.withRotation(this.ctx, x + w / 2, y + h / 2, rotation, () => {
                // 수채화 그라데이션 효과
                this.ctx.fillStyle = this._createGradient(rectX, rectY, rectW, rectH, color, layerAlpha);
                this.ctx.fill();
            });
            
            // 수채화 번짐 효과
            this._drawBarBlurEffect(rectX, rectY, rectW, rectH, color, layerAlpha);
        }
    }
} 