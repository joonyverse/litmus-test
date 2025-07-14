// 아트 설정 GUI 모듈

import { setupFolderStateManagement } from './gui-state.js';

export function setupArtGUI(gui, options, onChangeCallback, saveColorSettingsFunc, updateBackgroundColor) {
    // 배경 컨트롤
    const backgroundFolder = gui.addFolder('Color');
    setupFolderStateManagement(backgroundFolder, 'color');
    const backgroundControls = {
        backgroundColor: options.backgroundColor,
        setBackgroundColor: (color) => {
            updateBackgroundColor(color);
        }
    };

    backgroundFolder.addColor(backgroundControls, 'backgroundColor').name('Background').onChange((color) => {
        backgroundControls.setBackgroundColor(color);
    });

    // 막대 색상 컨트롤 (라인 색상) - 주석 처리되어 있음
    const lineColorControls = {
        lineColor1: options.lineColor1,
        lineColor2: options.lineColor2,
        lineColor3: options.lineColor3,
        lineColor4: options.lineColor4,
        lineColor5: options.lineColor5,
        lineColor6: options.lineColor6,
        setBarColor1: (color) => {
            options.lineColor1 = color;
            saveColorSettingsFunc();
            if (window.redrawLines) window.redrawLines();
        },
        setBarColor2: (color) => {
            options.lineColor2 = color;
            saveColorSettingsFunc();
            if (window.redrawLines) window.redrawLines();
        },
        setBarColor3: (color) => {
            options.lineColor3 = color;
            saveColorSettingsFunc();
            if (window.redrawLines) window.redrawLines();
        },
        setBarColor4: (color) => {
            options.lineColor4 = color;
            saveColorSettingsFunc();
            if (window.redrawLines) window.redrawLines();
        },
        setBarColor5: (color) => {
            options.lineColor5 = color;
            saveColorSettingsFunc();
            if (window.redrawLines) window.redrawLines();
        },
        setBarColor6: (color) => {
            options.lineColor6 = color;
            saveColorSettingsFunc();
            if (window.redrawLines) window.redrawLines();
        }
    };

    // 막대 색상 컨트롤 (WatercolorBar 색상)
    const barColorControls = {
        barColor1: options.barColor1,
        barColor2: options.barColor2,
        barColor3: options.barColor3,
        barColor4: options.barColor4,
        barColor5: options.barColor5,
        barColor6: options.barColor6,
        setBarColor1: (color) => {
            options.barColor1 = color;
            saveColorSettingsFunc();
            if (window.updateBarColors) window.updateBarColors();
            if (window.redrawBars) window.redrawBars();
        },
        setBarColor2: (color) => {
            options.barColor2 = color;
            saveColorSettingsFunc();
            if (window.updateBarColors) window.updateBarColors();
            if (window.redrawBars) window.redrawBars();
        },
        setBarColor3: (color) => {
            options.barColor3 = color;
            saveColorSettingsFunc();
            if (window.updateBarColors) window.updateBarColors();
            if (window.redrawBars) window.redrawBars();
        },
        setBarColor4: (color) => {
            options.barColor4 = color;
            saveColorSettingsFunc();
            if (window.updateBarColors) window.updateBarColors();
            if (window.redrawBars) window.redrawBars();
        },
        setBarColor5: (color) => {
            options.barColor5 = color;
            saveColorSettingsFunc();
            if (window.updateBarColors) window.updateBarColors();
            if (window.redrawBars) window.redrawBars();
        },
        setBarColor6: (color) => {
            options.barColor6 = color;
            saveColorSettingsFunc();
            if (window.updateBarColors) window.updateBarColors();
            if (window.redrawBars) window.redrawBars();
        }
    };

    backgroundFolder.addColor(barColorControls, 'barColor1').name('Bar Color 1').onChange((color) => {
        barColorControls.setBarColor1(color);
    });
    backgroundFolder.addColor(barColorControls, 'barColor2').name('Bar Color 2').onChange((color) => {
        barColorControls.setBarColor2(color);
    });
    backgroundFolder.addColor(barColorControls, 'barColor3').name('Bar Color 3').onChange((color) => {
        barColorControls.setBarColor3(color);
    });
    backgroundFolder.addColor(barColorControls, 'barColor4').name('Bar Color 4').onChange((color) => {
        barColorControls.setBarColor4(color);
    });
    backgroundFolder.addColor(barColorControls, 'barColor5').name('Bar Color 5').onChange((color) => {
        barColorControls.setBarColor5(color);
    });
    backgroundFolder.addColor(barColorControls, 'barColor6').name('Bar Color 6').onChange((color) => {
        barColorControls.setBarColor6(color);
    });

    // 그룹 설정 컨트롤
    const groupFolder = gui.addFolder('Bar Group Settings');
    setupFolderStateManagement(groupFolder, 'barGroupSettings');
    const groupControls = {
        minBarGroupSize: options.minBarGroupSize,
        maxBarGroupSize: options.maxBarGroupSize,
        randomizeBarSeed: () => {
            options.barColorSeed = Math.random();
            saveColorSettingsFunc();
            if (window.redrawBars) window.redrawBars();
        }
    };

    groupFolder.add(groupControls, 'minBarGroupSize', 1, 20, 1).name('Min Group Size').onChange((value) => {
        options.minBarGroupSize = value;
        saveColorSettingsFunc();
        if (window.redrawBars) window.redrawBars();
    });
    groupFolder.add(groupControls, 'maxBarGroupSize', 1, 30, 1).name('Max Group Size').onChange((value) => {
        options.maxBarGroupSize = value;
        saveColorSettingsFunc();
        if (window.redrawBars) window.redrawBars();
    });
    groupFolder.add(groupControls, 'randomizeBarSeed').name('Randomize Bar Pattern');

    // 레이어 컨트롤
    const layerFolder = gui.addFolder('Layer Controls');
    setupFolderStateManagement(layerFolder, 'layerControls');
    const layerControls = {
        toggleBars: () => {
            if (window.toggleBars) {
                window.toggleBars();
            }
        },
        toggleLines: () => {
            if (window.toggleLines) {
                window.toggleLines();
            }
        },
        redrawBars: () => {
            if (window.redrawBars) {
                window.redrawBars();
            }
        },
        redrawLines: () => {
            if (window.redrawLines) {
                window.redrawLines();
            }
        },
        redrawEffects: () => {
            if (window.redrawEffects) {
                window.redrawEffects();
            }
        },
        toggleBlanking: () => {
            if (window.toggleBlanking) {
                window.toggleBlanking();
            }
        }
    };

    layerFolder.add(layerControls, 'toggleBars').name('Toggle Bars');
    layerFolder.add(layerControls, 'toggleLines').name('Toggle Lines');
    layerFolder.add(layerControls, 'redrawBars').name('Redraw Bars');
    layerFolder.add(layerControls, 'redrawLines').name('Redraw Lines');
    layerFolder.add(layerControls, 'redrawEffects').name('Redraw Effects');
    layerFolder.add(layerControls, 'toggleBlanking').name('Toggle Blanking');

    // 레이아웃 컨트롤
    const layoutFolder = gui.addFolder('Layout');
    setupFolderStateManagement(layoutFolder, 'layout');
    
    // updateRowOffsetControls 함수 참조 (gui-rows.js에서 정의될 예정)
    const updateRowOffsetControls = window.updateRowOffsetControls || (() => {});
    
    layoutFolder.add(options, 'barWidth', 1, 2048, 1).name('Bar Width 2048').onChange((value) => {
        onChangeCallback();
        updateRowOffsetControls(); // 행 수가 변경될 수 있으므로 업데이트
    });
    layoutFolder.add(options, 'barHeight', 1, 2048, 1).name('Bar Height 2048').onChange((value) => {
        onChangeCallback();
        updateRowOffsetControls(); // 행 수가 변경될 수 있으므로 업데이트
    });
    layoutFolder.add(options, 'barWidth', 1, 128, 1).name('Bar Width').onChange((value) => {
        onChangeCallback();
        updateRowOffsetControls(); // 행 수가 변경될 수 있으므로 업데이트
    });
    layoutFolder.add(options, 'barHeight', 1, 128, 1).name('Bar Height').onChange((value) => {
        onChangeCallback();
        updateRowOffsetControls(); // 행 수가 변경될 수 있으므로 업데이트
    });
    layoutFolder.add(options, 'barGapX', -2048, 2048, 1).name('Bar Gap X').onChange(onChangeCallback);
    layoutFolder.add(options, 'barGapY', -2048, 2048, 1).name('Bar Gap Y').onChange((value) => {
        onChangeCallback();
        updateRowOffsetControls(); // 행 수가 변경될 수 있으므로 업데이트
    });
    layoutFolder.add(options, 'maxNumBarPerGroup', 1, 30, 1).name('Group Count').onChange(onChangeCallback);

    // 마진 컨트롤
    const marginFolder = gui.addFolder('Margins');
    setupFolderStateManagement(marginFolder, 'margins');
    marginFolder.add(options, 'marginLeft', 0, 500, 1).name('Left Margin').onChange(onChangeCallback);
    marginFolder.add(options, 'marginRight', 0, 500, 1).name('Right Margin').onChange(onChangeCallback);
    marginFolder.add(options, 'marginTop', 0, 500, 1).name('Top Margin').onChange((value) => {
        onChangeCallback();
        updateRowOffsetControls(); // 행 수가 변경될 수 있으므로 업데이트
    });
    marginFolder.add(options, 'marginBottom', 0, 500, 1).name('Bottom Margin').onChange((value) => {
        onChangeCallback();
        updateRowOffsetControls(); // 행 수가 변경될 수 있으므로 업데이트
    });

    // 선 효과 컨트롤
    const lineFolder = gui.addFolder('Line Effects');
    setupFolderStateManagement(lineFolder, 'lineEffects');
    lineFolder.add(options, 'lineBlurAmount', 0, 2, 0.1).name('Line Blur Amount').onChange(onChangeCallback);
    lineFolder.add(options, 'lineBlurCount', 0, 10, 1).name('Line Blur Count').onChange(onChangeCallback);

    // 막대 수채화 효과 컨트롤
    const barFolder = gui.addFolder('Bar Watercolor Effects');
    setupFolderStateManagement(barFolder, 'barWatercolorEffects');
    barFolder.add(options, 'barLayers', 1, 10, 1).name('Bar Layers').onChange(onChangeCallback);
    barFolder.add(options, 'barAlpha', 0.1, 1.0, 0.05).name('Bar Alpha').onChange(onChangeCallback);
    barFolder.add(options, 'barBlurAmount', 0, 2, 0.1).name('Bar Blur Amount').onChange(onChangeCallback);
    barFolder.add(options, 'barBlurCount', 0, 15, 1).name('Bar Blur Count').onChange(onChangeCallback);
    barFolder.add(options, 'barFlatEnds').name('Flat Ends').onChange(onChangeCallback);
    barFolder.add(options, 'barTopSemicircle').name('Top Semicircle').onChange(onChangeCallback);

    // 막대 자연스러움 효과 컨트롤
    const naturalFolder = gui.addFolder('Natural Hand-Drawn Effects');
    setupFolderStateManagement(naturalFolder, 'naturalHandDrawnEffects');
    naturalFolder.add(options, 'barWobble', 0, 20, 1).name('Bar Wobble').onChange(onChangeCallback);
    naturalFolder.add(options, 'barRotation', 0, 45, 1).name('Bar Rotation').onChange(onChangeCallback);
    naturalFolder.add(options, 'barHeightVariation', 0, 50, 1).name('Height Variation').onChange(onChangeCallback);

    // 랜덤 블랭킹 컨트롤
    const blankingFolder = gui.addFolder('Random Blanking');
    setupFolderStateManagement(blankingFolder, 'randomBlanking');
    blankingFolder.add(options, 'blankingEnabled').name('Enable Blanking').onChange(onChangeCallback);
    blankingFolder.add(options, 'blankingPercentage', 0, 100, 5).name('Blanking %').onChange(onChangeCallback);
    const blankingControls = {
        randomizeBlanking: () => {
            options.blankingSeed = Math.random();
            onChangeCallback();
        }
    };
    blankingFolder.add(blankingControls, 'randomizeBlanking').name('Randomize Pattern');

    // 노이즈 효과 컨트롤
    const noiseFolder = gui.addFolder('Noise Effects');
    setupFolderStateManagement(noiseFolder, 'noiseEffects');
    noiseFolder.add(options, 'noiseEnabled').name('Enable Background Noise').onChange(() => {
        if (window.redrawEffects) {
            window.redrawEffects();
        }
        onChangeCallback();
    });

    return {
        backgroundFolder,
        groupFolder,
        layerFolder,
        layoutFolder,
        marginFolder,
        lineFolder,
        barFolder,
        naturalFolder,
        blankingFolder,
        noiseFolder
    };
}