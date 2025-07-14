// 단순 막대 그리기 클래스 (수채화 효과 없음)
export class SimpleBar {
    constructor(ctx) {
        this.ctx = ctx;
    }

    // 단순 사각형 막대 그리기
    drawBar(x, y, w, h, color) {
        this.ctx.save();
        this.ctx.fillStyle = color;
        this.ctx.fillRect(x, y, w, h);
        this.ctx.restore();
    }

    // 둥근 모서리 막대 그리기
    drawRoundedBar(x, y, w, h, color, radius = 5) {
        this.ctx.save();
        this.ctx.fillStyle = color;
        this.ctx.beginPath();
        this.ctx.roundRect(x, y, w, h, radius);
        this.ctx.fill();
        this.ctx.restore();
    }

    // 상단이 둥근 막대 그리기 (반원 형태)
    drawTopRoundedBar(x, y, w, h, color) {
        this.ctx.save();
        this.ctx.fillStyle = color;
        this.ctx.beginPath();
        
        // 사각형 몸체
        this.ctx.rect(x, y + w/2, w, h - w/2);
        
        // 상단 반원
        this.ctx.arc(x + w/2, y + w/2, w/2, 0, Math.PI, true);
        
        this.ctx.fill();
        this.ctx.restore();
    }
}