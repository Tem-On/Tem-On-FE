## 🎁 템온 (Tem-On)
> <img width="130" alt="템온 로고" src="https://github.com/M4rs0312/hello/blob/main/logo.png" />
> 
> **템온_TEM-ON**
> *대규모 트래픽 초과 대비 대기열 진입 및 실시간 선착순 상품 구매 서비스*

<br></br>

# 🎨 프로젝트 개요
<div align=center>
<img width="700" alt="프로젝트소개" src="" />
<br></br>	
</div>

온라인 핫딜이나 한정판 상품 판매 시 발생하는 일시적 트래픽 폭주는 서버 다운과 재고 오버셀링 등의 심각한 문제를 야기합니다. 사용자의 쇼핑 경험을 유지하면서 시스템을 보호하기 위해서는 정교한 트래픽 제어 시스템이 필요합니다.

본 프로젝트는 **선착순 구매 시 대규모 트래픽 분산을 위한 대기열 시스템**과 **실시간 재고 트래킹 기술**을 통해 사용자에게 공정하고 안정적인 구매 경험을 제공하는 플랫폼입니다.

**템온(Tem-On)**은 마이크로서비스 간의 유기적인 연동 상태 및 자원 사용률을 직관적으로 확인하는 실시간 모니터링 환경을 지원합니다. 단순히 티켓팅이나 구매에만 그치는 것이 아니라, 대기열 진입 시 개인 대기 순번 및 예상 대기 시간을 실시간 갱신하고, 재고 변동 현황을 동적으로 동기화하여 투명한 선착순 구매 환경을 구현합니다.

<br></br>

# 🛠️ 주요 기능
<div align=center>

### 1. 실시간 대기열 토큰 제어 및 진입 시스템 (Traffic Control)
동시 접속 세션이 급증할 시 사용자 요청 순서에 따라 대기 순번을 부여하고 대기 화면으로 안내합니다.
SockJS & StompJS 기반 웹소켓 연결을 통해 대기 인원 정보와 실시간 순번 변화를 지속적으로 갱신하며, 구매 가능 상태가 되면 자동으로 상품 상세/상세 구매 페이지로 즉각 전환합니다.

### 2. 실시간 재고 트래킹 및 차감 모니터링 (Live Stock Status)
핫딜 상품 상세 정보와 연동되어 서버의 잔여 재고 및 예약 재고를 실시간으로 가져옵니다.
사용자가 구매 프로세스를 진행하는 동안에도 웹소켓 핸들러가 재고 변동 이벤트를 즉각 캐치하여 차트 및 비주얼 바로 반영해주며, 완판(Sold Out) 시 구매 버튼을 비활성화하여 오버셀을 차단합니다.

### 3. 직관적인 어드민 모니터링 대시보드 & 실시간 로그 스트림 (Admin Dashboard & Monitoring)
관리자가 전체 서비스 판매 현황(누계 매출, 주문 수량)과 시스템 상태 정보(CPU, RAM, 네트워크, DB 부하)를 한눈에 관제하도록 대시보드를 제공합니다.
또한 개별 마이크로서비스(Gateway, Order, Queue, Stock, Payment)의 분산 로그 스트림을 실시간 웹소켓 토픽 구독으로 화면에 표출하여 장애 대응력을 높였습니다.

### 4. 카카오 간편 로그인 및 회원 프로필 설정 (Social Auth & Session)
카카오 간편 로그인 연동을 통해 토큰 기반 소설 인증 세션을 구축하였습니다.
로그인한 유저는 마이페이지 내에서 개인정보 및 활동 프로필(닉네임 개정) 정보 수정과 누적 구매 이력을 손쉽게 추적 관리할 수 있습니다.

</div>

<br></br>

# 📱 서비스 화면 (Service Screens)
<div align=center>

### 1. 로그인 페이지 (Login)
카카오 소셜 로그인을 제공하며, 안정적인 토큰 교환 콜백 처리를 보장합니다.

<img width="800" alt="로그인페이지" src="https://github.com/M4rs0312/hello/blob/main/image%20(8).png" />

---

### 2. 메인 화면 및 핫딜 쇼케이스 (Main Showcase)
오픈 예정을 알리는 타이머 카운터 및 현재 진행 중인 한정 쇼케이스 핫딜 이벤트를 실시간으로 탐색할 수 있습니다.

<img width="800" alt="메인페이지" src="https://github.com/M4rs0312/hello/blob/main/image%20(9).png" />

---

### 3. 실시간 대기열 대기 화면 (Live Waiting Queue)
구매 요청 폭주 시 대기 원형 진행도 링(Circular Progress Ring) UI로 실시간 순번 및 총대기인원, 예상 시간을 모니터링합니다.

<img width="800" alt="대기열페이지" src="" />

---

### 4. 이벤트 상품 상세 및 재고 트래킹 (Product Detail & Inventory)
실시간 재고 상태 바(StockBar) 및 실시간 재고 갱신 인디케이터를 확인하고, 1인당 구매 제한 규칙에 따라 즉시 바로구매를 진행할 수 있습니다.

<img width="800" alt="상세페이지" src="" />

---

### 5. 주문 및 결제 진행 (Checkout & Payment)
대기열 검증을 완료한 트래픽에 대해 신속하게 최종 결제 승인 프로세스를 수행하는 체크아웃 폼을 지원합니다.

<img width="800" alt="결제프로세스페이지" src="" />

---

### 6. 어드민 모니터링 대시보드 - 실시간 로그 피드 (Service Logs & Status)
다양한 마이크로서비스에서 배출하는 분산 실시간 시스템 로그 피드 스트림을 감지하여 오류 수준별 시스템 로깅 상태를 가시화합니다.

<img width="800" alt="어드민실시간로그페이지" src="" />

---

### 7. 어드민 대시보드 - 자원 모니터링 및 실시간 지표 (Service Metrics & Charts)
서비스 서버 인프라 상태를 나타내어 시스템 부하 임계치가 초과될 때 경고 및 치명 상태 알림 표시가 가능합니다.

<img width="800" alt="어드민통계차트페이지" src="" />

---

### 8. 마이페이지 및 설정 조회 (My Page / Profile Settings)
로그인 세션 기반으로 프로필을 업데이트하고 닉네임을 설정하며, 그동안 주문 및 구매 완료한 핫딜을 관리합니다.
<img width="800" alt="마이페이지" src="https://github.com/M4rs0312/hello/blob/main/image%20(12).png" />


</div>

<br></br>

# 💻 Tech Stack

| 구분 | 기술 / 도구 |
| ------------- | --------------------------------- |
| **Frontend** | **Next.js (App Router)**, Tailwind CSS, Lucide React, Shadcn/ui |
| **Realtime / State** | **SockJS**, **@stomp/stompjs**, **SWR**, React Hooks (useState, useEffect, **useMemo**, **useRef**) |
| **Data Fetching** | Axios, Native apiFetch Wrapper |
| **Visualization** | Recharts (Admin Monitoring Metric Charts) |
| **DevOps / Collaboration** | Git, GitHub |

<br></br>

# 👥 Convention

### Branch Strategy
- `main`: 최종 배포 브랜치
- `develop`: 개발 통합 브랜치
- `feat/feature-name`: 기능별 구현 브랜치
- `fix/bug-name`: 오류 수정 브랜치

### Commit Message Convention
- `feat`: 새로운 기능 추가
- `fix`: 버그 수정
- `docs`: 문서 수정 (README 등)
- `refactor`: 코드 구조 개선
- `style`: 코드 포맷팅 (로직 변경 없음)
- `chore`: 빌드 업무, 패키지 매니저 설정 등

<br></br>

<div align=center>
	<h1>👨💻 FE Developers </h1>
	
| <img src="https://github.com/M4rs0312.png" width="80"> | <img src="https://github.com/rudals2334.png" width="80"> |
| :---: | :---: |
| [정회성](https://github.com/M4rs0312) | [이경민](https://github.com/rudals2334) |
| **FrontEnd** | **FrontEnd** |

</div>
