// GUI 상태 관리 모듈

import { loadGuiStateFromStorage, saveGuiStateToStorage } from './storage.js';

// 폴더 상태 관리 함수들
export function setupFolderStateManagement(folder, folderName) {
    console.log(`🔧 폴더 "${folderName}" 상태 관리 설정 시작`);
    
    const savedState = loadGuiStateFromStorage();
    const shouldBeOpen = savedState && savedState[folderName] === true;
    
    // 저장된 상태가 없으면 기본적으로 모든 폴더를 접어둠
    if (!savedState || !shouldBeOpen) {
        folder.close();
        console.log(`📁 폴더 "${folderName}" 초기 상태: 닫힘`);
    } else {
        folder.open();
        console.log(`📂 폴더 "${folderName}" 초기 상태: 열림 (저장된 상태 복원)`);
    }
    
    // 폴더 상태 변경 감지 및 저장
    const originalOpen = folder.open.bind(folder);
    const originalClose = folder.close.bind(folder);
    
    folder.open = function() {
        console.log(`📂 폴더 "${folderName}" 열기 시도`);
        originalOpen();
        saveFolderState(folderName, true);
    };
    
    folder.close = function() {
        console.log(`📁 폴더 "${folderName}" 닫기 시도`);
        originalClose();
        saveFolderState(folderName, false);
    };
    
    // dat.GUI 폴더 클릭 이벤트 감지
    setTimeout(() => {
        // 방법 1: folder.__ul.previousSibling (제목 클릭)
        if (folder.__ul && folder.__ul.previousSibling) {
            const titleElement = folder.__ul.previousSibling;
            titleElement.addEventListener('click', () => {
                setTimeout(() => {
                    const isOpen = !folder.closed;
                    console.log(`👆 폴더 "${folderName}" 상태 변경: ${isOpen ? '열림' : '닫힘'}`);
                    saveFolderState(folderName, isOpen);
                }, 10);
            });
        }
        
        // 방법 2: folder.domElement 직접 클릭
        if (folder.domElement) {
            folder.domElement.addEventListener('click', (event) => {
                // 제목 부분 클릭인지 확인 (하위 컨트롤 클릭이 아닌)
                if (event.target === folder.domElement || event.target.classList.contains('title')) {
                    setTimeout(() => {
                        const isOpen = !folder.closed;
                        console.log(`👆 폴더 "${folderName}" 상태 변경: ${isOpen ? '열림' : '닫힘'}`);
                        saveFolderState(folderName, isOpen);
                    }, 10);
                }
            });
        }
        
        // 방법 3: 모든 .title 클래스 요소 검색
        const allTitles = document.querySelectorAll('.title');
        allTitles.forEach((title) => {
            if (title.textContent && title.textContent.includes(folderName)) {
                title.addEventListener('click', () => {
                    setTimeout(() => {
                        const isOpen = !folder.closed;
                        console.log(`👆 폴더 "${folderName}" 상태 변경: ${isOpen ? '열림' : '닫힘'}`);
                        saveFolderState(folderName, isOpen);
                    }, 10);
                });
            }
        });
    }, 200);
    
    console.log(`✅ 폴더 "${folderName}" 상태 관리 설정 완료`);
}

export function saveFolderState(folderName, isOpen) {
    const currentState = loadGuiStateFromStorage() || {};
    currentState[folderName] = isOpen;
    console.log(`🔄 폴더 "${folderName}" 상태 변경: ${isOpen ? '열림' : '닫힘'}`);
    saveGuiStateToStorage(currentState);
}