const canvas = document.getElementById('art');
const ctx = canvas.getContext('2d');

// 색상 팔레트
const palettes = [
    ['#d1cbe9', '#b7d2e8', '#cbe7d1', '#e9d1d1', '#e9e1d1', '#d1e9e1', '#e1d1e9', '#e9d1e1', '#d1e9e9'],
    ['#f7b267', '#70a37f', '#e76f51', '#6d6875', '#b5838d', '#457b9d', '#a8dadc', '#f4a261'],
    ['#e63946', '#457b9d', '#2a9d8f', '#f4a261', '#264653', '#e9c46a', '#a8dadc', '#b5838d'],
];

// 캔버스 크기를 창 크기에 맞게 조정
function resizeCanvasToWindow(canvas) {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

// dat.GUI 라이브러리 사용 (script 태그로 포함 필요)
// barWidth, barHeight를 options 객체로 관리
const options = {
    barWidth: 24,
    barHeight: 100,
    barGapX: 10,
    barGapY: 10,
    marginX: 12,
    marginY: 16,
    maxNumBarPerGroup: 12,
};

// dat.GUI 설정
if (typeof dat !== 'undefined') {
    const gui = new dat.GUI();
    gui.add(options, 'barWidth', 8, 80, 1).name('Bar Width').onChange(drawPattern);
    gui.add(options, 'barHeight', 20, 200, 1).name('Bar Height').onChange(drawPattern);
    gui.add(options, 'barGapX', 0, 20, 1).name('Bar Gap X').onChange(drawPattern);
    gui.add(options, 'barGapY', 0, 20, 1).name('Bar Gap Y').onChange(drawPattern);
    gui.add(options, 'maxNumBarPerGroup', 1, 30, 1).name('Group Count').onChange(drawPattern);
}

// 랜덤 유틸
function randInt(a, b) {
    return Math.floor(Math.random() * (b - a + 1)) + a;
}
function randChoice(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

// 막대 색상에 약간의 랜덤성 추가 함수
function perturbColor(hex, amount = 24) {
    let c = hex.replace('#', '');
    let r = parseInt(c.substring(0, 2), 16);
    let g = parseInt(c.substring(2, 4), 16);
    let b = parseInt(c.substring(4, 6), 16);
    r = Math.min(255, Math.max(0, r + Math.floor((Math.random() - 0.5) * amount)));
    g = Math.min(255, Math.max(0, g + Math.floor((Math.random() - 0.5) * amount)));
    b = Math.min(255, Math.max(0, b + Math.floor((Math.random() - 0.5) * amount)));
    return `rgb(${r},${g},${b})`;
}

// 곡선 막대(형광펜 느낌) 그리기 함수
function drawCurvedBar(ctx, x, y, w, h, color) {
    const steps = 2; // 곡선의 세분화 정도
    const topPoints = [];
    const bottomPoints = [];
    for (let i = 0; i <= steps; i++) {
        const px = x + (w / steps) * i;
        const pyTop = y + randInt(-3, 3);
        const pyBottom = y + h + randInt(-3, 3);
        topPoints.push({ x: px, y: pyTop });
        bottomPoints.push({ x: px, y: pyBottom });
    }

    ctx.beginPath();
    ctx.moveTo(topPoints[0].x, topPoints[0].y);
    for (let i = 1; i < topPoints.length; i++) {
        ctx.lineTo(topPoints[i].x, topPoints[i].y);
    }
    for (let i = bottomPoints.length - 1; i >= 0; i--) {
        ctx.lineTo(bottomPoints[i].x, bottomPoints[i].y);
    }
    ctx.closePath();

        // 텍스처 오버레이 (색연필/형광펜 질감)
        ctx.globalAlpha = 0.3;
        for (let i = 0; i < 24; i++) {
            const textureX = x + Math.random() * w;
            const textureY = y + Math.random() * h;
            const textureW = Math.random() * w * 0.2;
            const textureH = Math.random() * h * 0.3;
            
            ctx.fillStyle = color.replace('rgb', 'rgba').replace(')', ', 0.3)');
            ctx.fillRect(textureX, textureY, textureW, textureH);
        }
        
    ctx.fillStyle = color;
    ctx.globalAlpha = 0.6;
    ctx.fill();
    ctx.globalAlpha = 1.0;
}

// 텍스처가 있는 선 그리기 함수 (색연필/형광펜 느낌)
function drawTexturedLine(ctx, x1, y1, x2, y2, color, width) {
    const length = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
    const segments = Math.max(3, Math.floor(length / 8)); // 선을 여러 세그먼트로 나누기
    
    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.lineCap = 'round';
    
    // 메인 선 그리기
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
    
    // 텍스처 오버레이 (색연필/형광펜 느낌)
    ctx.globalAlpha = 0.3;
    for (let i = 0; i < segments; i++) {
        const t = i / (segments - 1);
        const x = x1 + (x2 - x1) * t;
        const y = y1 + (y2 - y1) * t;
        
        // 약간의 랜덤 오프셋으로 텍스처 효과
        const offsetX = (Math.random() - 0.5) * width * 0.8;
        const offsetY = (Math.random() - 0.5) * width * 0.8;
        
        ctx.beginPath();
        ctx.moveTo(x + offsetX, y + offsetY);
        ctx.lineTo(x + offsetX + (Math.random() - 0.5) * 4, y + offsetY + (Math.random() - 0.5) * 4);
        ctx.stroke();
    }
    
    // 하이라이트 효과 (형광펜 느낌)
    ctx.globalAlpha = 0.4;
    ctx.lineWidth = width * 0.3;
    ctx.strokeStyle = '#ffffff';
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
    
    ctx.restore();
}

// 노이즈 텍스처 오버레이 함수
function drawNoiseOverlay(ctx, width, height, alpha = 0.08) {
    // 임시 캔버스 생성
    const noiseCanvas = document.createElement('canvas');
    noiseCanvas.width = width;
    noiseCanvas.height = height;
    const noiseCtx = noiseCanvas.getContext('2d');
    const imageData = noiseCtx.createImageData(width, height);
    for (let i = 0; i < imageData.data.length; i += 4) {
        const shade = Math.floor(Math.random() * 256);
        imageData.data[i] = shade;
        imageData.data[i + 1] = shade;
        imageData.data[i + 2] = shade;
        imageData.data[i + 3] = 255; // 완전 불투명(알파는 drawImage에서 조절)
    }
    noiseCtx.putImageData(imageData, 0, 0);

    // 메인 캔버스에 알파값을 주고 오버레이
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.drawImage(noiseCanvas, 0, 0);
    ctx.restore();
}

function drawPattern() {
    // 캔버스 크기 조정
    resizeCanvasToWindow(canvas);
    const barWidth = options.barWidth;
    const barHeight = options.barHeight;
    const barGapX = options.barGapX;
    const barGapY = options.barGapY;
    const marginX = options.marginX;
    const marginY = options.marginY;
    const maxNumBarPerGroup = options.maxNumBarPerGroup;

    // 막대 개수 계산
    const cols = Math.floor((canvas.width - marginX * 2) / (barWidth + barGapX)) + 1;
    const rows = Math.floor((canvas.height - marginY * 2) / (barHeight + barGapY)) + 1;

    // 배경 지우기
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    let palette = randChoice(palettes);
    let color = randChoice(palette);
    let group = randInt(1, options.maxNumBarPerGroup);
    let groupIdx = 0;
    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            // 막대 색상 선택
            if (groupIdx == 0) {
                palette = randChoice(palettes);
                color = randChoice(palette);
                group = randInt(1, options.maxNumBarPerGroup);
            }
            groupIdx++;
            if (groupIdx == group) {
                groupIdx = 0;
            }

            // 막대 위치
            const x = marginX + col * (barWidth + barGapX);
            const y = marginY + row * (barHeight + barGapY);

            // 막대 그리기 (곡선 형태, 색상에 랜덤성 부여)
            drawCurvedBar(ctx, x, y, barWidth, barHeight, perturbColor(color, 24));

            // 막대 위에 짧은 선 그리기 (텍스처 적용)
            const lineCount = randInt(1, 2);
            const minGap = 12;
            let usedYs = [];
            for (let i = 0; i < lineCount; i++) {
                // ly 후보를 여러 번 시도해서 충분히 떨어진 값을 찾음
                let ly;
                let attempts = 0;
                do {
                    ly = y + randInt(8, barHeight - 8);
                    attempts++;
                } while (
                    usedYs.some(prevLy => Math.abs(prevLy - ly) < minGap) &&
                    attempts < 10
                );
                usedYs.push(ly);

                const lx = x - randInt(0, barWidth * 0.1);
                const lineColor = randChoice(['#222', '#e63946', '#457b9d', '#2a9d8f', '#f4a261']);
                const lineWidth = randInt(2, 4);
                const lineEndX = lx + barWidth + randInt(0, barWidth * 0.1);
                
                // 텍스처가 있는 선 그리기
                drawTexturedLine(ctx, lx, ly, lineEndX, ly, lineColor, lineWidth);
            }
        }
    }

    // 노이즈 오버레이
    drawNoiseOverlay(ctx, canvas.width, canvas.height, 0.08);
}

window.addEventListener('resize', drawPattern);
drawPattern(); 