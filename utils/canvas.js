// 캔버스 관련 유틸리티 함수들

// 캔버스 크기를 창 크기에 맞게 조정
export function resizeCanvasToWindow(canvas) {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

// 캔버스 컨텍스트 상태 저장/복원 헬퍼
export function withContextState(ctx, callback) {
    ctx.save();
    try {
        callback();
    } finally {
        ctx.restore();
    }
}

// 회전 변환 적용 헬퍼
export function withRotation(ctx, centerX, centerY, angle, callback) {
    if (angle === 0) {
        callback();
        return;
    }
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(angle * Math.PI / 180);
    ctx.translate(-centerX, -centerY);
    try {
        callback();
    } finally {
        ctx.restore();
    }
}

// 캔버스 관련 유틸리티 객체 (하위 호환성)
export const CanvasUtils = {
    resizeCanvasToWindow,
    withContextState,
    withRotation
}; 