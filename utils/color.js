// 색상 관련 유틸리티 함수들

// 색상에 랜덤성 추가
export function perturbColor(hex, amount = 24) {
    let c = hex.replace('#', '');
    let r = parseInt(c.substring(0, 2), 16);
    let g = parseInt(c.substring(2, 4), 16);
    let b = parseInt(c.substring(4, 6), 16);
    r = Math.min(255, Math.max(0, r + Math.floor((Math.random() - 0.5) * amount)));
    g = Math.min(255, Math.max(0, g + Math.floor((Math.random() - 0.5) * amount)));
    b = Math.min(255, Math.max(0, b + Math.floor((Math.random() - 0.5) * amount)));
    return `rgb(${r},${g},${b})`;
}

// RGB 색상을 RGBA로 변환
export function addAlphaToColor(color, alpha) {
    return color.replace('rgb', 'rgba').replace(')', `, ${alpha})`);
}

// 색상 밝기 조정
export function adjustBrightness(color, factor) {
    const rgb = color.match(/\d+/g);
    if (!rgb) return color;
    
    const r = Math.min(255, Math.max(0, parseInt(rgb[0]) * factor));
    const g = Math.min(255, Math.max(0, parseInt(rgb[1]) * factor));
    const b = Math.min(255, Math.max(0, parseInt(rgb[2]) * factor));
    
    return `rgb(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)})`;
}

// 색상 관련 유틸리티 객체 (하위 호환성)
export const ColorUtils = {
    perturbColor,
    addAlphaToColor,
    adjustBrightness
}; 