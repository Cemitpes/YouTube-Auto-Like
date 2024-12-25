
# YouTube Auto Like

## 개요
이 리포지토리는 Tampermonkey 스크립트를 포함하며, 사용자가 YouTube 채널을 구독한 상태인 경우 자동으로 해당 동영상에 "좋아요"를 누릅니다. 이 스크립트는 브라우저에서 실행되며, YouTube 페이지가 로드된 후 필요한 버튼을 감지하고 동작합니다.

---

## 주요 기능
1. **구독 상태 확인**:
   - YouTube 채널을 구독 중인지 확인합니다.
   - 구독 상태가 "취소합니다."로 표시되는 경우 스크립트가 실행됩니다.

2. **좋아요 버튼 클릭**:
   - 구독 상태가 확인되면 "좋아요" 버튼의 상태를 확인하여 자동으로 클릭합니다.
   - 이미 "좋아요"를 누른 경우 동작하지 않습니다.

3. **로딩 대기**:
   - 페이지 로딩이 완료되지 않은 경우, 버튼을 찾을 때까지 대기하며 안정적으로 동작합니다.

---

## 사용 방법
1. [Tampermonkey 확장 프로그램](https://www.tampermonkey.net/)을 설치합니다.
2. `youtube-auto-like.user.js` 파일을 Tampermonkey에 추가합니다.
3. YouTube에서 동영상을 시청할 때 스크립트가 자동으로 실행됩니다.

---

## 추후 업데이트 계획
1. **기능 확장**:
   - 일반 비디오 페이지 뿐만 아니라 쇼츠 페이지에서도 작동되도록 할 예정입니다.

---

## 주의 사항
- 이 스크립트는 개인 학습 및 연구 목적으로 제작되었습니다.
- YouTube의 정책이나 브라우저 환경 변화로 인해 스크립트가 더 이상 작동하지 않을 수 있습니다.
- 공개적으로 배포할 때는 YouTube 사용 약관을 준수해야 합니다.
