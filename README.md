# 웃음 감지 아트 제너레이터

스마트폰 카메라로 웃음을 감지하여 실시간으로 수채화 아트의 색상을 변경하는 인터랙티브 웹 애플리케이션입니다.

## 기능

- 🎨 **수채화 스타일 아트 생성**: 프로시저럴 막대와 선으로 구성된 예술적 패턴
- 📱 **스마트폰 카메라 연동**: QR 코드로 간편한 연결
- 😊 **웃음 감지**: MediaPipe를 사용한 실시간 얼굴/감정 인식
- 🎨 **색상 변화**: 웃을 때 모든 요소가 파란색으로 변경
- ⚙️ **실시간 설정**: dat.GUI를 통한 다양한 매개변수 조정

## 사용 방법

1. **컴퓨터에서 웹사이트 접속**
2. **"카메라 연결하기"** 버튼 클릭
3. **스마트폰으로 QR 코드 스캔** 또는 연결 코드 입력
4. **카메라 권한 허용** 후 "카메라 시작"
5. **웃으면 색상 변화** 감상! 😊 → 💙

## 기술 스택

- **Frontend**: HTML5 Canvas, ES6 Modules, CSS3
- **얼굴 감지**: MediaPipe Face Detection
- **UI**: dat.GUI
- **QR 코드**: 외부 API 서비스
- **배포**: Netlify

## 로컬 실행

```bash
# HTTP 서버 실행 (Python)
python -m http.server 8000

# 또는 Node.js
npx http-server -p 8000
```

## 라이브 데모

🔗 [여기서 체험하기](https://your-netlify-url.netlify.app)

---

🤖 Generated with Claude Code