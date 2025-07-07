// 레이어 관리 시스템
export class LayerManager {
    constructor(mainCanvas) {
        this.mainCanvas = mainCanvas;
        this.mainCtx = mainCanvas.getContext('2d');
        this.layers = new Map();
        this.layerOrder = [];
    }

    // 새 레이어 생성
    createLayer(name, width, height) {
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        
        const layer = {
            canvas,
            ctx,
            visible: true,
            opacity: 1.0,
            blendMode: 'source-over'
        };
        
        this.layers.set(name, layer);
        this.layerOrder.push(name);
        
        return layer;
    }

    // 레이어 토글
    toggleLayer(name) {
        const layer = this.layers.get(name);
        if (layer) {
            layer.visible = !layer.visible;
            this.composite();
        }
    }

    // 레이어 가시성 설정
    setLayerVisibility(name, visible) {
        const layer = this.layers.get(name);
        if (layer) {
            layer.visible = visible;
            this.composite();
        }
    }

    // 레이어 투명도 설정
    setLayerOpacity(name, opacity) {
        const layer = this.layers.get(name);
        if (layer) {
            layer.opacity = Math.max(0, Math.min(1, opacity));
            this.composite();
        }
    }

    // 레이어 순서 변경
    setLayerOrder(order) {
        this.layerOrder = order.filter(name => this.layers.has(name));
        this.composite();
    }

    // 모든 레이어 합성
    composite() {
        // 메인 캔버스 클리어
        this.mainCtx.clearRect(0, 0, this.mainCanvas.width, this.mainCanvas.height);
        
        // 레이어 순서대로 합성
        for (const layerName of this.layerOrder) {
            const layer = this.layers.get(layerName);
            if (layer && layer.visible && layer.opacity > 0) {
                this.mainCtx.globalAlpha = layer.opacity;
                this.mainCtx.globalCompositeOperation = layer.blendMode;
                this.mainCtx.drawImage(layer.canvas, 0, 0);
            }
        }
        
        // 기본값 복원
        this.mainCtx.globalAlpha = 1.0;
        this.mainCtx.globalCompositeOperation = 'source-over';
    }

    // 레이어 크기 조정
    resizeLayers(width, height) {
        for (const layer of this.layers.values()) {
            layer.canvas.width = width;
            layer.canvas.height = height;
        }
        this.composite();
    }

    // 레이어 클리어
    clearLayer(name) {
        const layer = this.layers.get(name);
        if (layer) {
            layer.ctx.clearRect(0, 0, layer.canvas.width, layer.canvas.height);
        }
    }

    // 모든 레이어 클리어
    clearAllLayers() {
        for (const layer of this.layers.values()) {
            layer.ctx.clearRect(0, 0, layer.canvas.width, layer.canvas.height);
        }
    }

    // 레이어 정보 가져오기
    getLayer(name) {
        return this.layers.get(name);
    }

    // 모든 레이어 이름 가져오기
    getLayerNames() {
        return Array.from(this.layers.keys());
    }
} 