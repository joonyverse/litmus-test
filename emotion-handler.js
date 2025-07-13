// 감정 감지 및 색상 변경 관리자
class EmotionHandler {
    constructor() {
        this.isSmiling = false;
        this.isAngry = false;
        this.originalColors = null;
        
        // 감정별 색상 설정
        this.colors = {
            smileColor: '#0066ff',  // 웃음 시 파란색
            angryColor: '#ff0000'   // 화남 시 빨간색
        };
    }

    // 웃음 감지 처리
    onSmileDetected() {
        console.log('😊 웃음 감지됨!');
        this.isSmiling = true;
        this.updateColors();
    }

    onSmileStopped() {
        console.log('😐 웃음 멈춤');
        this.isSmiling = false;
        this.updateColors();
    }

    // 화남 감지 처리
    onAngryDetected() {
        console.log('😡 화남 감지됨!');
        this.isAngry = true;
        this.updateColors();
    }

    onAngryStopped() {
        console.log('😐 화남 멈춤');
        this.isAngry = false;
        this.updateColors();
    }

    // 우선순위에 따른 색상 업데이트
    updateColors() {
        // 우선순위: 화남 > 웃음 > 원래색상
        if (this.isAngry) {
            console.log('🔴 화남 우선 - 빨간색 적용');
            this.changeToRed();
        } else if (this.isSmiling) {
            console.log('🔵 웃음 - 파란색 적용');
            this.changeToBlue();
        } else {
            console.log('⚪ 중립 - 원래 색상 복원');
            this.restoreOriginalColors();
        }
    }

    // 파란색으로 변경 (웃음)
    changeToBlue() {
        // options 객체가 로드될 때까지 대기
        if (!window.options) {
            setTimeout(() => this.changeToBlue(), 100);
            return;
        }

        // 원래 색상 저장 (처음 한 번만)
        this.saveOriginalColors();

        this.applyColors(this.colors.smileColor);
        this.redrawCanvas();
    }

    // 빨간색으로 변경 (화남)
    changeToRed() {
        // options 객체가 로드될 때까지 대기
        if (!window.options) {
            setTimeout(() => this.changeToRed(), 100);
            return;
        }

        // 원래 색상 저장 (처음 한 번만)
        this.saveOriginalColors();

        this.applyColors(this.colors.angryColor);
        this.redrawCanvas();
    }

    // 원래 색상으로 복원
    restoreOriginalColors() {
        if (this.originalColors && window.options) {
            // 선 색상 복원
            window.options.lineColor1 = this.originalColors.lineColor1;
            window.options.lineColor2 = this.originalColors.lineColor2;
            window.options.lineColor3 = this.originalColors.lineColor3;
            window.options.lineColor4 = this.originalColors.lineColor4;
            window.options.lineColor5 = this.originalColors.lineColor5;
            window.options.lineColor6 = this.originalColors.lineColor6;
            
            // 막대 색상 복원
            window.options.barColor1 = this.originalColors.barColor1;
            window.options.barColor2 = this.originalColors.barColor2;
            window.options.barColor3 = this.originalColors.barColor3;
            window.options.barColor4 = this.originalColors.barColor4;
            window.options.barColor5 = this.originalColors.barColor5;
            window.options.barColor6 = this.originalColors.barColor6;

            this.redrawCanvas();
        }
    }

    // 원래 색상 저장
    saveOriginalColors() {
        if (!this.originalColors && window.options) {
            this.originalColors = {
                // Line 색상 (막대 위의 선들)
                lineColor1: window.options.lineColor1,
                lineColor2: window.options.lineColor2,
                lineColor3: window.options.lineColor3,
                lineColor4: window.options.lineColor4,
                lineColor5: window.options.lineColor5,
                lineColor6: window.options.lineColor6,
                // Bar 색상 (수채화 막대들)
                barColor1: window.options.barColor1,
                barColor2: window.options.barColor2,
                barColor3: window.options.barColor3,
                barColor4: window.options.barColor4,
                barColor5: window.options.barColor5,
                barColor6: window.options.barColor6
            };
        }
    }

    // 색상 적용
    applyColors(color) {
        // 선 색상 변경 (막대 위의 가로선들)
        window.options.lineColor1 = color;
        window.options.lineColor2 = color;
        window.options.lineColor3 = color;
        window.options.lineColor4 = color;
        window.options.lineColor5 = color;
        window.options.lineColor6 = color;
        
        // 막대 색상 변경 (수채화 세로막대들)
        window.options.barColor1 = color;
        window.options.barColor2 = color;
        window.options.barColor3 = color;
        window.options.barColor4 = color;
        window.options.barColor5 = color;
        window.options.barColor6 = color;
    }

    // 캔버스 다시 그리기
    redrawCanvas() {
        if (window.redrawLines) {
            window.redrawLines();
        }
        if (window.redrawBars) {
            window.redrawBars();
        }
        if (window.updateBarColors) {
            window.updateBarColors();
        }
    }

    // 현재 상태 반환
    getCurrentState() {
        return {
            isSmiling: this.isSmiling,
            isAngry: this.isAngry,
            currentEmotion: this.isAngry ? 'angry' : this.isSmiling ? 'smiling' : 'neutral'
        };
    }

    // 상태 리셋
    reset() {
        this.isSmiling = false;
        this.isAngry = false;
        this.restoreOriginalColors();
    }
}

// 전역 인스턴스 생성
window.emotionHandler = new EmotionHandler();