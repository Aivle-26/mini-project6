# 🚀 Mini Project 6 — AWS CI/CD & Deployment

> 기존 웹 애플리케이션을 AWS 환경에 배포하며  
> **CI/CD 파이프라인 구축과 H2 → RDS MySQL 전환을 실습한 프로젝트**

6차 미니프로젝트는 새로운 서비스를 개발하는 프로젝트가 아니라,  
5차 미니프로젝트에서 개발된 **책담(Chaekdam)** 애플리케이션을 배포 대상으로 활용하여  
**AWS 기반 빌드 · 배포 자동화 · 서버 구성 · 데이터베이스 전환**을 실습하는 프로젝트였습니다.

서비스 기능 자체를 확장하는 것보다  
**로컬에서 실행되던 애플리케이션을 실제 AWS 환경에서 빌드하고 배포하는 전체 흐름을 경험하는 것**에 초점을 맞췄습니다.

---

## 🎯 Project Goal

6차 미니프로젝트에서 중점적으로 실습한 내용입니다.

- AWS EC2 기반 웹 애플리케이션 배포
- AWS CodeBuild를 활용한 Frontend / Backend 자동 빌드
- AWS CodeDeploy를 활용한 배포 자동화
- Nginx를 통한 Frontend 정적 파일 서비스
- Spring Boot Backend 실행 자동화
- **H2 Database → AWS RDS MySQL** 전환
- 환경변수를 활용한 Local / Deployment 환경 분리
- AWS 기반 CI/CD 흐름 이해 및 실제 배포 경험

---

## 🔄 CI/CD Flow

```text
Source Code
    │
    ▼
AWS CI/CD
    │
    ▼
CodeBuild
 ├─ React Frontend Build
 └─ Spring Boot Backend Build
    │
    ▼
Deployment Artifact
    │
    ▼
CodeDeploy
    │
    ▼
EC2
 ├─ Nginx
 │   └─ Frontend
 │
 └─ Spring Boot
     └─ Backend
          │
          ▼
      AWS RDS
        MySQL
```

애플리케이션 코드를 빌드한 뒤 배포 Artifact를 생성하고,  
CodeDeploy를 통해 EC2 서버에 배포하는 흐름으로 구성했습니다.

---

## ☁️ AWS Deployment

### 1. Build

`buildspec.yml`을 통해 Frontend와 Backend를 순차적으로 빌드합니다.

#### Frontend

```text
React / Vite
    │
    ▼
npm install
    │
    ▼
npm run build
    │
    ▼
frontend/dist
```

#### Backend

```text
Spring Boot / Gradle
    │
    ▼
./gradlew clean bootJar
    │
    ▼
bookapp-0.0.1-SNAPSHOT.jar
```

Frontend의 정적 빌드 결과와 Backend 실행 JAR을  
하나의 배포 Artifact에 포함하도록 구성했습니다.

---

### 2. Deploy

배포 단계에서는 `appspec.yml`과 Shell Script를 사용합니다.

```text
CodeDeploy
    │
    ├─ BeforeInstall
    │    └─ 배포 전 환경 정리
    │
    ├─ AfterInstall
    │    └─ Nginx 설정
    │
    └─ ApplicationStart
         └─ Spring Boot Backend 실행
```

배포 이후에는 역할을 다음과 같이 분리했습니다.

```text
EC2
│
├─ Nginx
│   └─ Frontend 정적 파일 서비스
│
└─ Spring Boot
    └─ Backend API
```

Frontend 빌드 결과는 Nginx가 서비스하고,  
Backend는 EC2에서 Spring Boot 애플리케이션으로 실행됩니다.

---

## 🗄 Database Migration

6차 미니프로젝트에서 중요하게 다룬 부분 중 하나는  
기존 로컬 데이터베이스를 실제 배포용 데이터베이스로 전환하는 과정이었습니다.

### Before — Local

```text
Spring Boot
    │
    ▼
H2 Database
```

기존 애플리케이션은 로컬 실행을 기준으로  
**H2 Database**를 사용하고 있었습니다.

### After — AWS

```text
Spring Boot on EC2
    │
    ▼
AWS RDS
    │
    ▼
MySQL
```

AWS 배포 환경에서는 데이터베이스를  
**AWS RDS MySQL**로 전환했습니다.

이를 통해 애플리케이션 서버와 데이터베이스를 분리하고,  
로컬 환경과 배포 환경에서 서로 다른 DB 설정을 사용할 수 있도록 구성했습니다.

---

## ⚙️ Environment Configuration

애플리케이션 코드에 DB 접속 정보를 직접 작성하지 않고  
환경변수를 통해 배포 환경을 설정할 수 있도록 구성했습니다.

주요 DB 환경변수는 다음과 같습니다.

```text
DB_ENGINE
DB_HOST
DB_PORT
DB_NAME
DB_USERNAME
DB_PASSWORD
```

환경에 따라 다음과 같이 DB를 선택할 수 있도록 구성했습니다.

```text
Local
 └─ H2

AWS
 └─ RDS MySQL
```

이를 통해 동일한 애플리케이션 코드에서  
로컬 개발 환경과 AWS 배포 환경을 분리할 수 있었습니다.

---

## 🛠 Tech Stack

### Application

| Category | Technology |
|---|---|
| Frontend | React, Vite |
| Backend | Java, Spring Boot |
| ORM | Spring Data JPA |
| Local Database | H2 |
| Deployment Database | MySQL |

### Infrastructure

| Category | Technology |
|---|---|
| Cloud | AWS |
| Compute | EC2 |
| Database | RDS MySQL |
| Build | AWS CodeBuild |
| Deploy | AWS CodeDeploy |
| Web Server | Nginx |
| Backend Build | Gradle |
| Frontend Build | npm |

---

## 📁 Deployment Structure

```text
mini-project6/
│
├── frontend/
│   └── React / Vite Frontend
│
├── bookapp/
│   └── Spring Boot Backend
│
├── buildspec.yml
│   └── CodeBuild Build Definition
│
├── unit-test-buildspec.yml
│   └── Test Build Definition
│
├── appspec.yml
│   └── CodeDeploy Deployment Definition
│
├── scripts/
│   ├── BeforeInstall
│   ├── Nginx Configuration
│   └── Backend Start
│
└── deploy-scripts/
    └── Deployment Scripts
```

---

## 📌 Key Files

### `buildspec.yml`

AWS CodeBuild에서 실행할 빌드 과정을 정의합니다.

- Frontend dependency 설치
- React / Vite build
- Spring Boot build
- 배포에 필요한 Artifact 구성

---

### `appspec.yml`

AWS CodeDeploy에서 EC2에 파일을 배포하고  
Lifecycle Hook을 실행하는 방법을 정의합니다.

주요 Lifecycle Hook:

```text
BeforeInstall
AfterInstall
ApplicationStart
```

---

### `scripts/start_backend.sh`

배포된 Spring Boot 애플리케이션을 실행합니다.

배포 환경에서 MySQL을 사용하는 경우 환경변수를 기반으로

- JDBC URL
- MySQL Driver
- Hibernate Dialect
- H2 Console 활성화 여부

등을 설정하도록 구성했습니다.

---

## 📚 Deployment Target — Chaekdam

이 저장소에 포함된 **책담(Chaekdam)**은  
6차 미니프로젝트에서 새롭게 개발한 서비스가 아니라  
**5차 미니프로젝트 결과물을 AWS 배포 실습 대상으로 활용한 것**입니다.

책담은 도서 관리 및 독서 활동을 다루는 웹 애플리케이션이며,  
6차 미니프로젝트에서는 해당 서비스의 기능 개발보다 **배포 환경 구성**에 집중했습니다.

따라서 이 저장소에서 중요하게 보는 부분은 다음과 같습니다.

```text
Application Feature Development
            ↓
        핵심 목적 아님

AWS Deployment
CI/CD
EC2
CodeBuild
CodeDeploy
Nginx
RDS MySQL
            ↓
        6차 핵심 실습
```

---

## 📝 Repository Note

본 저장소의 애플리케이션 소스 코드는  
**5차 미니프로젝트 결과물을 6차 미니프로젝트의 배포 대상으로 활용한 것**입니다.

따라서 `책담(Chaekdam)`의 서비스 기능 자체보다  
6차 미니프로젝트에서 수행한

**AWS 배포 · CI/CD 구성 · EC2 서버 환경 설정 · H2 → RDS MySQL 전환**

과정을 중심으로 기록합니다.

또한 6차 미니프로젝트는 각자의 로컬 환경에서 실습을 진행한 뒤  
최종 제출 버전을 저장하는 방식으로 진행되었습니다.

따라서 현재 저장소의 GitHub Commit History는  
팀원별 전체 실습 및 작업 과정을 모두 나타내지는 않습니다.

이 Repository는 **6차 미니프로젝트의 최종 제출 버전과 AWS 배포 실습 결과를 보존하기 위한 저장소**입니다.

---

### 🔗 AIVLE Team 26

팀 전체 소개와 Big Project **PMate**의 관련 Repository는  
[Aivle-26 Organization](https://github.com/Aivle-26)에서 확인할 수 있습니다.
