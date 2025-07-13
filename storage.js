// 로컬 스토리지 관리 모듈

// 로컬 스토리지 키
export const STORAGE_KEY = 'watercolor_art_settings';
export const GUI_STATE_KEY = 'watercolor_gui_state';

// 로컬 스토리지에서 설정 불러오기
export function loadSettingsFromStorage() {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            const parsed = JSON.parse(saved);
            return parsed;
        }
    } catch (error) {
        console.warn('Failed to load settings from storage:', error);
    }
    return null;
}

// 로컬 스토리지에 설정 저장하기
export function saveSettingsToStorage(settings) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch (error) {
        console.warn('Failed to save settings to storage:', error);
    }
}

// GUI 상태 로드하기
export function loadGuiStateFromStorage() {
    try {
        const saved = localStorage.getItem(GUI_STATE_KEY);
        if (saved) {
            const state = JSON.parse(saved);
            console.log('✅ GUI 폴더 상태 로드됨:', state);
            return state;
        } else {
            console.log('📁 저장된 GUI 폴더 상태 없음 - 모든 폴더 접어둠');
        }
    } catch (error) {
        console.warn('❌ GUI 상태 로드 실패:', error);
    }
    return null;
}

// GUI 상태 저장하기
export function saveGuiStateToStorage(state) {
    try {
        localStorage.setItem(GUI_STATE_KEY, JSON.stringify(state));
        console.log('💾 GUI 폴더 상태 저장됨:', state);
    } catch (error) {
        console.warn('❌ GUI 상태 저장 실패:', error);
    }
}