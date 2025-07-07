// 특수 효과 함수들
import { MathUtils } from './utils/index.js';

// 노이즈 생성 유틸리티
export const NoiseUtils = {
    // 단순 랜덤 노이즈
    createRandomNoise(width, height) {
        const imageData = new ImageData(width, height);
        const data = imageData.data;
        
        for (let i = 0; i < data.length; i += 4) {
            const shade = Math.floor(Math.random() * 256);
            data[i] = shade;     // R
            data[i + 1] = shade; // G
            data[i + 2] = shade; // B
            data[i + 3] = 255;   // A
        }
        
        return imageData;
    },

    // 펄린 노이즈 (간단한 구현)
    createPerlinNoise(width, height, scale = 0.01) {
        const imageData = new ImageData(width, height);
        const data = imageData.data;
        
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const noise = this._simplePerlin(x * scale, y * scale);
                const shade = Math.floor((noise + 1) * 128);
                const index = (y * width + x) * 4;
                
                data[index] = shade;     // R
                data[index + 1] = shade; // G
                data[index + 2] = shade; // B
                data[index + 3] = 255;   // A
            }
        }
        
        return imageData;
    },

    // 간단한 펄린 노이즈 구현
    _simplePerlin(x, y) {
        const X = Math.floor(x) & 255;
        const Y = Math.floor(y) & 255;
        x -= Math.floor(x);
        y -= Math.floor(y);
        
        const n00 = this._dotProduct(this._gradient(X, Y), x, y);
        const n01 = this._dotProduct(this._gradient(X, Y + 1), x, y - 1);
        const n10 = this._dotProduct(this._gradient(X + 1, Y), x - 1, y);
        const n11 = this._dotProduct(this._gradient(X + 1, Y + 1), x - 1, y - 1);
        
        const u = this._fade(x);
        const v = this._fade(y);
        
        return this._lerp(
            this._lerp(n00, n10, u),
            this._lerp(n01, n11, u),
            v
        );
    },

    _gradient(hash, x, y) {
        const h = hash & 15;
        const grad = 1 + (h & 7);
        return ((h & 1) === 0 ? grad : -grad) * x + ((h & 2) === 0 ? grad : -grad) * y;
    },

    _dotProduct(grad, x, y) {
        return grad * x + grad * y;
    },

    _fade(t) {
        return t * t * t * (t * (t * 6 - 15) + 10);
    },

    _lerp(a, b, t) {
        return a + t * (b - a);
    }
};

// 노이즈 텍스처 오버레이 함수들
export const NoiseEffects = {
    // 기본 랜덤 노이즈 오버레이
    drawRandomNoiseOverlay(ctx, width, height, alpha = 0.08) {
        const imageData = NoiseUtils.createRandomNoise(width, height);
        this._applyNoiseOverlay(ctx, imageData, width, height, alpha);
    },

    // 펄린 노이즈 오버레이
    drawPerlinNoiseOverlay(ctx, width, height, alpha = 0.08, scale = 0.01) {
        const imageData = NoiseUtils.createPerlinNoise(width, height, scale);
        this._applyNoiseOverlay(ctx, imageData, width, height, alpha);
    },

    // 색상 노이즈 오버레이
    drawColorNoiseOverlay(ctx, width, height, alpha = 0.08) {
        const imageData = new ImageData(width, height);
        const data = imageData.data;
        
        for (let i = 0; i < data.length; i += 4) {
            data[i] = Math.floor(Math.random() * 256);     // R
            data[i + 1] = Math.floor(Math.random() * 256); // G
            data[i + 2] = Math.floor(Math.random() * 256); // B
            data[i + 3] = 255;                             // A
        }
        
        this._applyNoiseOverlay(ctx, imageData, width, height, alpha);
    },

    // 노이즈 오버레이 적용 헬퍼
    _applyNoiseOverlay(ctx, imageData, width, height, alpha) {
        // 임시 캔버스 생성
        const noiseCanvas = document.createElement('canvas');
        noiseCanvas.width = width;
        noiseCanvas.height = height;
        const noiseCtx = noiseCanvas.getContext('2d');
        
        // 이미지 데이터를 캔버스에 적용
        noiseCtx.putImageData(imageData, 0, 0);

        // 메인 캔버스에 알파값을 주고 오버레이
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.drawImage(noiseCanvas, 0, 0);
        ctx.restore();
    }
};

// 기존 함수 (하위 호환성 유지)
export function drawNoiseOverlay(ctx, width, height, alpha = 0.08) {
    NoiseEffects.drawRandomNoiseOverlay(ctx, width, height, alpha);
}

// 추가 효과들
export const AdditionalEffects = {
    // 그라데이션 배경
    drawGradientBackground(ctx, width, height, startColor, endColor) {
        const gradient = ctx.createLinearGradient(0, 0, 0, height);
        gradient.addColorStop(0, startColor);
        gradient.addColorStop(1, endColor);
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);
    },

    // 블러 효과
    drawBlurEffect(ctx, x, y, width, height, blurRadius) {
        ctx.save();
        ctx.filter = `blur(${blurRadius}px)`;
        ctx.globalAlpha = 0.3;
        ctx.fillRect(x, y, width, height);
        ctx.restore();
    },

    // 그림자 효과
    drawShadow(ctx, x, y, width, height, shadowColor = 'rgba(0,0,0,0.3)', offsetX = 2, offsetY = 2) {
        ctx.save();
        ctx.shadowColor = shadowColor;
        ctx.shadowBlur = 4;
        ctx.shadowOffsetX = offsetX;
        ctx.shadowOffsetY = offsetY;
        ctx.fillRect(x, y, width, height);
        ctx.restore();
    }
}; 