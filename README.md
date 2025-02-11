# 🌍 지금 여행 (NowTrip)

**지금 여행**은 실시간 환율 데이터를 기반으로 최적의 여행지를 추천해주는 모바일 애플리케이션입니다. 사용자의 예산과 여행 스타일에 따라 경제적으로 여행할 수 있는 나라를 추천합니다. 또한, 여행 관련 게시판을 통해 여행 정보를 공유할 수 있습니다.

---

## 💡 프로젝트 목표

> **"환율 데이터를 활용하여, 누구나 경제적으로 여행할 수 있도록 돕는 서비스"**
> 
## 📌 주요 기능

### 🏝 여행지 추천
- **실시간 환율 반영**하여 예산 대비 가장 경제적인 여행지 추천
- **각 나라의 물가 데이터를 반영**하여 체류 가능한 일수 계산
- **여행 스타일(쇼핑, 자연, 문화 등) 선택 가능**

### 📊 환율 조회 및 시각화
- API를 통해 **실시간 환율 데이터** 불러오기
- **환율 변동 그래프 제공**으로 최근 하루, 1주, 3개월, 1년, 전체 환율 변동 확인 가능
- **환율 변동률 시각화** 및 안정적인 환율 국가 추천

### 📝 여행 정보 공유 (게시판 기능)
- **여행 후기 및 정보 게시글 작성 가능**
- **단일 이미지 업로드 지원 (S3 Presigned URL 활용)**
- **좋아요 및 댓글 기능 지원**

### 📍 국가 및 통화 데이터 관리
- **국가 및 통화 데이터를 정적 파일 + DB로 관리**
- API 요청 최소화를 위해 **프론트에서 캐싱(React Context/AsyncStorage) 적용**

---

## 🛠 기술 스택

### 📱 Frontend (React Native + Expo)
- **React Native / Expo**: 모바일 앱 개발 (ios)
- **Expo Router**: 네비게이션 및 라우팅 관리
- **Axios**: API 요청 관리
- **React Context / AsyncStorage**: 글로벌 상태 및 캐싱
- **React Native Image Picker**: 이미지 업로드

### 🔧 Backend (Spring Boot)
- **Spring Boot 3**: API 서버 개발
- **Spring Data JPA**: 데이터베이스 ORM
- **Spring Security**: 인증 및 보안
- **JWT (JSON Web Token)**: 인증 및 보안
- **MySQL**: 데이터 저장 및 관리
- **Redis**: 캐싱 및 세션 관리

### 🚀 DevOps & Infra
- **AWS EC2**: 서버 호스팅
- **AWS RDS (MySQL)**: 데이터베이스 관리
- **AWS S3 + CloudFront**: 이미지 저장 및 캐싱, CDN 사용
- **GitHub Actions**: CI/CD 자동화

---

## 🏗 프로젝트 구조

```
nowtrip/
├── frontend/    # React Native 기반 모바일 앱
├── backend/     # Spring Boot 기반 API 서버
└── README.md    # 프로젝트 설명 파일
```

---

## 🚀 실행 방법

### 🔹 환경 변수 설정
- `frontend/.env`
```env
# FRONTEND
EXPO_PUBLIC_API_URL=https://api.nowtrip.com
```

- `resource/application.yml`
```yaml
# BACKEND
spring:
  application:
    name: nowtrip
    # MySql 설정
  datasource:
    url: jdbc:mysql://localhost:3306/nowtrip
    username: your-username
    password: your-password
    driver-class-name: com.mysql.cj.jdbc.Driver

  jpa:
    hibernate:
      ddl-auto: create
    show-sql: true
    properties:
      hibernate.dialect: org.hibernate.dialect.MySQL8Dialect
    defer-datasource-initialization: true # JPA가 테이블 생성 후 data.sql 실행

  sql:
    init:
      mode: always # data.sql 실행

# redis 설정
  data:
    redis:
      host: localhost
      port: 6379

cloud:
  aws:
    s3:
      bucket: your-bucket
    credentials:
      access-key: your-access-key
      secret-key: your-secret-key
    region:
      static: ap-northeast-2
    stack:
      auto: false

cloudfront:
  domain: https://<your-domain>.cloudfront.net

jwt:
  secret:
    key: your-secret-key

# https://www.exchangerate-api.com 에서 발급
exchange:
  apikey: your-apikey
```

### 🔹 데이터베이스
```bash
# 데이터베이스 서버 활성화
brew services start redis
brew services start mysql
```
```bash
# mysql 서버 접속 후 'nowtrip' database 생성
mysql -u root -p
CREATE DATABASE nowtrip;
```

### 🔹 Frontend (Expo)
- React Native Expo 설치
```bash
cd frontend
npm install
npx expo start
```

### 🔹 Backend (Spring Boot)
```bash
cd backend
./gradlew bootRun
```

---

## 📌 API 주요 기능

### 🔹 국가 및 통화 데이터 API
- `/api/countries` : 모든 국가 데이터 반환
- `/api/currencies` : 모든 통화 데이터 반환

### 🔹 환율 데이터 API
- `GET: /api/exchange/list` : 최신 환율 데이터 조회
- `GET: /api/exchange/history` : 특정 통화의 과거 환율 변동 조회

### 🔹 여행지 추천 API
- `/api/travel/recommend?budget=1000000` : 예산을 입력하면 추천 여행지 반환

### 🔹 게시판 API
- `GET: /api/posts` : 게시글 목록 조회
- `GET: /api/posts/{postId}` : 특정 게시글 상세 조회
- `POST: /api/posts/{postId}/like-toggle` : 게시글 좋아요 토글 기능

---

## 📌 향후 개선 사항

✅ **추천 알고리즘 개선** (머신러닝 기반 추천 적용 가능)  
✅ **유저별 관심 여행지 저장 및 맞춤 추천**  
✅ **환율 변동 분석 및 예측 기능 추가**  
✅ **다국어 지원 (한국어, 영어, 일본어 등)**

---

## 문의

이 프로젝트에 문의 사항이 있다면 **이슈(issue) 등록** 또는 **PR(Pull Request) 제출**해주세요.

**📧 Contact:** chosh0206@naver.com

---


