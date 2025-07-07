// 수학 관련 유틸리티 함수들

// 랜덤 정수 생성
export function randInt(a, b) {
    return Math.floor(Math.random() * (b - a + 1)) + a;
}

// 배열에서 랜덤 선택
export function randChoice(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

// 두 점 사이의 거리 계산
export function distance(x1, y1, x2, y2) {
    return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
}

// 값을 범위로 제한
export function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}

// 선형 보간
export function lerp(start, end, t) {
    return start + (end - start) * t;
}

// 랜덤 범위
export function randomRange(min, max) {
    return Math.random() * (max - min) + min;
}

// 수학 관련 유틸리티 객체 (하위 호환성)
export const MathUtils = {
    randInt,
    randChoice,
    distance,
    clamp,
    lerp,
    randomRange
}; 