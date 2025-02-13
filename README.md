# 🌍 지금 여행 (NowTrip)

**지금 여행**은 실시간 환율 데이터를 기반으로 최적의 여행지를 추천해주는 모바일 애플리케이션입니다. 사용자의 예산과 여행 스타일에 따라 경제적으로 여행할 수 있는 나라를 추천합니다. 또한, 여행 관련 게시판을 통해 여행 정보를 공유할 수 있습니다.

---

## 💡 프로젝트 목표

> **"환율 데이터를 활용하여, 누구나 경제적으로 여행할 수 있도록 돕는 서비스"**
> 
## 📌 주요 기능

### 📊 환율 조회 및 시각화
- 외부 API를 통해 **실시간 환율 데이터** 불러와 저장 및 관리
- **환율 변동 그래프**로 최근 하루, 1주, 3개월, 1년, 전체 환율 변동 확인 가능

### 📝 여행 정보 공유 (게시판 기능)
- **여행 후기 및 정보 게시글 작성 가능**
- **나라별 게시글 조회 기능**
- **단일 이미지 업로드 지원 (S3 Presigned URL 활용)**
- **좋아요 및 댓글 기능 지원**

### 환율 계산기
- 실시간 환율을 이용하여 통화간 계산

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

### 🔧 Backend (Spring Boot)
- **Spring Boot 3**: API 서버 개발
- **Spring Data JPA**: 데이터베이스 ORM
- **Spring Security + JWT**: 인증 및 보안
- **MySQL**: 데이터 저장 및 관리
- **Redis**: 캐싱 및 세션 관리

### 🚀 DevOps & Infra
- **AWS S3 + CloudFront**: 이미지 저장 및 캐싱, CDN 사용

---

## 🏗 프로젝트 구조

### 폴더 구조
```
nowtrip/
├── frontend/    # React Native 기반 모바일 앱
├── backend/     # Spring Boot 기반 API 서버
└── README.md    # 프로젝트 설명 파일
```

### 데이터베이스 구조
![Image](https://github.com/user-attachments/assets/12b86806-70bc-4eca-8f44-3f89e2f0e9c7)

---

## 🚀 실행 방법

### 🔹 환경 변수 설정
- `frontend/.env`
- Expo를 사용한다면 `EXPO_PUBLIC_[NAME]=VALUE` 형식을 갖춰야 함
```env
EXPO_PUBLIC_API_URL = http://localhost:8080/api
EXPO_PUBLIC_CDN_FLAG_URL = https://<your-domain>.cloudfront.net/flags
```

- `resources/application.yml`
```yaml
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

# AWS 설정
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

# JWT secret-key
jwt:
  secret:
    key: your-secret-key

# https://www.exchangerate-api.com 에서 발급
exchange:
  apikey: your-apikey
```

### 🔹 데이터베이스
- brew를 통해 redis와 mysql 설치 후
- 데이터베이스 서버 활성화
```bash
brew services start redis
brew services start mysql
```
- mysql 서버 접속 후 `nowtrip` database 생성
```bash
mysql -u root -p
CREATE DATABASE nowtrip;
```

### 🔹 Frontend (Expo)
- React Native Expo 설치 후 VSC에서 실행
```bash
cd frontend
npm ci
npx expo start
```

### 🔹 Backend (Spring Boot)
- Intellij IDE를 사용하거나 직접 실행
```bash
cd backend
./gradlew bootRun
```

---

## 📌 주요 API

### 🔹 국가 및 통화 데이터 API
- `/api/countries` : 모든 국가 데이터 반환
- `/api/currencies` : 모든 통화 데이터 반환

### 🔹 환율 데이터 API
- `GET: /api/exchange/list` : 최신 환율 데이터 조회
- `GET: /api/exchange/history` : 특정 통화의 과거 환율 변동 조회

### 🔹 게시판 API
- `GET: /api/posts` : 게시글 목록 조회
- `GET: /api/posts/{postId}` : 특정 게시글 상세 조회
- `POST: /api/posts` : 게시글
- `POST: /api/posts/{postId}/like-toggle` : 게시글 좋아요 토글 기능

---

## 📌 성능 향상점

### 🔹 국가 및 통화 데이터 API
메인 페이지의 API는 아래의 리스트를 반환:  
{ 통화 코드, 국기 코드, 통화 한국 이름, 통화 기호, 현재 환율, 어제 대비 현재 증감률 }

<메인 페이지>  
<img src="https://github.com/user-attachments/assets/5f26d868-6822-4c7f-a55e-79ace9f64083" width="200"  />

#### 🔹 **기존 방식 (JPA 활용)**
기존에는 JPA를 활용하여 여러 개의 쿼리를 실행해야 했음:
```java
public List<ExchangeListResponse> getExchangeRateList() {
    LocalDate latestDate = exchangeRateRepository.findMaxLastUpdated();
    LocalDate previousDate = exchangeRateRepository.findPreviousLastUpdated(latestDate);
    
    List<ExchangeRate> todayRates = exchangeRateRepository.findByLastUpdated(latestDate);
    List<ExchangeRate> yesterdayRates = exchangeRateRepository.findByLastUpdated(previousDate);
    ...
    ...
}
```
❌ 이렇게 하면 쿼리가 최소 4개 이상이 되면서 평균 응답 시간 **약 500ms 소요**

#### 🔹 **개선 후 (네이티브 SQL 적용)**
하나의 SQL로 최신 환율과 이전 환율을 한 번에 가져오는 방식을 적용:
```java
@Query(value = """
    WITH today AS (
        SELECT e.target_currency, e.exchange_rate AS today_rate, e.last_updated
        FROM exchange_rate e
        WHERE e.last_updated = (SELECT MAX(last_updated) FROM exchange_rate)
    ),
    yesterday AS (
        SELECT e.target_currency, e.exchange_rate AS yesterday_rate, e.last_updated
        FROM exchange_rate e
        WHERE e.last_updated = (SELECT MAX(last_updated) FROM exchange_rate WHERE last_updated < (SELECT MAX(last_updated) FROM exchange_rate))
    )
    SELECT 
        t.target_currency AS currency,
        c.currency_flag_code AS flagCode,
        c.korean_name AS koreanName,
        c.symbol AS symbol,
        t.today_rate AS todayRate,
        y.yesterday_rate AS yesterdayRate,
        CASE 
            WHEN y.yesterday_rate = 0 THEN 0 
            ELSE ((t.today_rate - y.yesterday_rate) / y.yesterday_rate) * 100 
        END AS changeRate
    FROM today t
    JOIN yesterday y ON t.target_currency = y.target_currency
    JOIN currency c ON t.target_currency = c.code
    ORDER BY changeRate DESC
    """,
        nativeQuery = true)
List<Object[]> findTopChangedRates();
```

✅ 그 결과, 쿼리 수를 4개 -> 1개로 줄였고, 평균 응답 시간이 **약 200ms로 성능 60% 향상**  
✅ 이처럼 복잡한 작업이 있는 경우엔 JPA만이 아닌 다른 방법을 찾는게 생산적 (JPQL, 네이티브 SQL 등등)

---

### 🔹 이미지 업로드

#### 🔹 기존 방식: (데이터베이스에 이미지 저장)
❌ 기존에는 이미지를 Base64(`MultiartFile`로 변환하여 DB에 저장하는 방식을 고려하였으나,  
❌ 파일의 크기때문에 업, 다운로드의 속도가 저하가 일어나 서버 리소스 사용량이 대폭 증가했음

#### 🔹 개선 후 (AWS S3 + Cloudfront 활용)
- 이미지 업로드 -> S3에 업로드  
- 이미지 제공 -> Cloudfront의 CDN 캐싱

✅ 클라이언트 -> API 서버가 Presigned Url 반환 -> 클라이언트가 S3에 PUT요청(업로드) -> 데이터베이스에 CloudFront 도메인 저장  
✅ 이미지는 Cloudfront 도메인을 통해 제공  
✅ 이 방식은 API서버와 데이터베이스의 부하를 대폭 감소 시킴 (Presigned Url만 반환)  
✅ 그 결과, 이미지 크기에 따라 다르지만 평균 업로드, 다운로드의 성능이 80% 향상 

---

## 📌 향후 개선 사항

- **추천 알고리즘 개선** (머신러닝 기반 추천 적용 가능)
- **유저별 관심 여행지 저장 및 맞춤 추천**  
- **환율 변동 분석 및 예측 기능 추가**  
- **다국어 지원 (한국어, 영어, 일본어 등)**

---

## 문의

이 프로젝트에 문의 사항이 있다면 **이슈(issue) 등록** 또는 **PR(Pull Request) 제출**해주세요.

**📧 Contact:** chosh0206@naver.com

---


