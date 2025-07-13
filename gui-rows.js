// 행 오프셋 관련 GUI 모듈

import { setupFolderStateManagement } from './gui-state.js';

// 외부에서 접근할 수 있도록 함수 저장할 변수
let updateRowOffsetControlsFunction = null;

export function setupRowsGUI(gui, options, onChangeCallback, initializeRowOffsets, setRowOffset, resetOptions) {
    // 행별 오프셋 컨트롤을 동적으로 생성하는 함수
    let rowOffsetFolder;
    let rowOffsetControllers = [];
    
    function updateRowOffsetControls() {
        // 기존 컨트롤러들을 제거
        rowOffsetControllers.forEach(controller => {
            if (rowOffsetFolder && controller) {
                try {
                    rowOffsetFolder.remove(controller);
                } catch (e) {
                    // 제거 실패 시 무시
                }
            }
        });
        rowOffsetControllers = [];

        // 기존 폴더가 없으면 생성
        if (!rowOffsetFolder) {
            rowOffsetFolder = gui.addFolder('Row Offsets');
            setupFolderStateManagement(rowOffsetFolder, 'rowOffsets');
            
            // Update Row Controls 버튼을 폴더에 추가
            const rowOffsetControls = {
                updateRowControls: () => {
                    updateRowOffsetControls();
                }
            };
            rowOffsetFolder.add(rowOffsetControls, 'updateRowControls').name('Update Row Controls');
        }

        // 현재 행 수 계산 (main.js의 calculateGrid 로직과 동일)
        const canvas = document.getElementById('art');
        if (!canvas) return;

        const { barHeight, barGapY, marginTop, marginBottom } = options;
        const rows = Math.floor((canvas.height - marginTop - marginBottom) / (barHeight + barGapY));

        // 행별 오프셋 초기화
        initializeRowOffsets(rows);

        // 각 행별로 X, Y 오프셋 컨트롤 생성
        for (let i = 0; i < rows; i++) {
            const rowControls = {
                [`row${i}X`]: options.rowOffsets[i].x,
                [`row${i}Y`]: options.rowOffsets[i].y
            };

            const xController = rowOffsetFolder.add(rowControls, `row${i}X`, -200, 200, 1).name(`Row ${i} X`).onChange((value) => {
                setRowOffset(i, value, options.rowOffsets[i].y);
                onChangeCallback();
            });

            const yController = rowOffsetFolder.add(rowControls, `row${i}Y`, -200, 200, 1).name(`Row ${i} Y`).onChange((value) => {
                setRowOffset(i, options.rowOffsets[i].x, value);
                onChangeCallback();
            });

            rowOffsetControllers.push(xController, yController);
        }
    }

    // 초기 행별 오프셋 컨트롤 생성
    updateRowOffsetControls();

    // 외부에서 접근할 수 있도록 함수 저장
    updateRowOffsetControlsFunction = updateRowOffsetControls;
    window.updateRowOffsetControls = updateRowOffsetControls;

    // 리셋 버튼 설정
    const resetButton = {
        reset: () => {
            resetOptions();
            updateRowOffsetControls(); // 행별 오프셋 컨트롤도 재생성
            onChangeCallback();
            // GUI 컨트롤 업데이트 (여러 방법으로 시도)
            try {
                if (gui.controllers && Array.isArray(gui.controllers)) {
                    gui.controllers.forEach(controller => {
                        if (controller.updateDisplay) {
                            controller.updateDisplay();
                        }
                    });
                } else if (gui.__controllers && Array.isArray(gui.__controllers)) {
                    gui.__controllers.forEach(controller => {
                        if (controller.updateDisplay) {
                            controller.updateDisplay();
                        }
                    });
                } else {
                    console.log('GUI reset 완료 (컨트롤러 업데이트 스킵)');
                }
            } catch (error) {
                console.warn('GUI 컨트롤러 업데이트 중 오류:', error);
            }
        }
    };
    gui.add(resetButton, 'reset').name('Reset to Defaults');
    
    // 로드 완료 후 Row Controls 업데이트 (지연 실행으로 캔버스 초기화 대기)
    setTimeout(() => {
        updateRowOffsetControls();
    }, 1000);

    return {
        updateRowOffsetControls,
        rowOffsetFolder
    };
}

// 행별 오프셋 컨트롤 업데이트 함수를 외부에서 호출할 수 있도록 export
export function updateRowOffsetControls() {
    if (updateRowOffsetControlsFunction) {
        updateRowOffsetControlsFunction();
    }
}