# 🚀 Mini Project 6 — AWS CI/CD & Deployment

> KT AIVLE School 9기 · AI Track · 10반 26조  
> **AWS 환경에서의 웹 애플리케이션 배포와 CI/CD 파이프라인 구축 실습**

6차 미니프로젝트는 새로운 서비스를 개발하는 프로젝트가 아니라,  
기존 웹 애플리케이션을 활용하여 **AWS 기반 배포 환경과 CI/CD 흐름을 직접 구성하는 인프라 실습 프로젝트**입니다.

배포 대상 애플리케이션으로 5차 미니프로젝트에서 개발된 **책담(Chaekdam)** 프로젝트를 활용했으며,  
6차에서는 애플리케이션 기능 개발보다 **빌드 · 배포 자동화 · 서버 구성 · 데이터베이스 전환**에 초점을 맞췄습니다.

---

## 🎯 Project Goal

6차 미니프로젝트에서 중점적으로 실습한 내용입니다.

- AWS EC2 기반 웹 애플리케이션 배포
- AWS CodeBuild를 활용한 Frontend / Backend 자동 빌드
- AWS CodeDeploy를 활용한 배포 자동화
- Nginx를 통한 Frontend 정적 파일 서비스
- Spring Boot Backend 실행 자동화
- 기존 **H2 Database → AWS RDS MySQL** 전환
- 환경변수를 활용한 개발 / 배포 환경 분리
- CI/CD 흐름 이해 및 실제 배포 경험

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

---

## ☁️ AWS Deployment

### Build

`buildspec.yml`을 통해 CI 환경에서 Frontend와 Backend를 함께 빌드합니다.

```text
Frontend
React / Vite
    ↓
npm install
npm run build
    ↓
frontend/dist
```

```text
Backend
Spring Boot / Gradle
    ↓
./gradlew clean bootJar
    ↓
bookapp-0.0.1-SNAPSHOT.jar
```

생성된 Frontend 빌드 결과와 Backend JAR 파일은 배포 Artifact로 구성됩니다.

---

### Deploy

`appspec.yml`과 배포 Shell Script를 이용하여 EC2에 자동 배포합니다.

```text
CodeDeploy
    │
    ├─ BeforeInstall
    │    └─ 기존 배포 파일 정리
    │
    ├─ AfterInstall
    │    └─ Nginx 설정
    │
    └─ ApplicationStart
         └─ Spring Boot Backend 실행
```

Frontend 빌드 파일은 Nginx가 서비스하고,  
Backend는 EC2에서 Spring Boot 애플리케이션으로 실행됩니다.

---

## 🗄 Database Migration

### Before

```text
Spring Boot
    │
    ▼
H2 Database
```

로컬 개발 환경에서는 H2 Database를 사용했습니다.

### After

```text
Spring Boot on EC2
    │
    ▼
AWS RDS
    │
    ▼
MySQL
```

6차 미니프로젝트에서는 실제 배포 환경을 구성하면서  
기존 H2 기반 Database를 **AWS RDS MySQL**로 전환했습니다.

배포 환경에서는 DB 접속 정보를 환경변수로 관리하여  
로컬 환경과 AWS 환경을 분리했습니다.

```text
DB_ENGINE
DB_HOST
DB_PORT
DB_NAME
DB_USERNAME
DB_PASSWORD
```

---

## 🛠 Tech Stack

### Application

| Category | Technology |
|---|---|
| Frontend | React, Vite |
| Backend | Java, Spring Boot |
| ORM | Spring Data JPA |
| Local DB | H2 |
| Production DB | MySQL |

### Infrastructure

| Category | Technology |
|---|---|
| Cloud | AWS |
| Compute | EC2 |
| Database | RDS MySQL |
| Build | AWS CodeBuild |
| Deploy | AWS CodeDeploy |
| Web Server | Nginx |
| Build Tool | Gradle, npm |

---

## 📁 Deployment Files

```text
mini-project6/
│
├── frontend/               # React Frontend
├── bookapp/                # Spring Boot Backend
│
├── buildspec.yml           # AWS CodeBuild 설정
├── unit-test-buildspec.yml
├── appspec.yml             # AWS CodeDeploy 설정
│
├── scripts/                # EC2 배포 Script
└── deploy-scripts/         # Deployment Script
```

---



## 📝 Repository Note

본 저장소의 애플리케이션 소스 코드는  
**5차 미니프로젝트 결과물을 6차 미니프로젝트의 배포 대상으로 활용한 것**입니다.

따라서 `책담(Chaekdam)`의 서비스 기능 자체보다는  
6차 미니프로젝트에서 수행한 **AWS 배포, CI/CD 구성, 서버 환경 설정 및 RDS MySQL 전환 과정**을 중심으로 기록합니다.

또한 6차 미니프로젝트는 로컬 환경 중심으로 실습한 뒤 최종 제출 버전을 저장하는 방식으로 진행되어,  
현재 GitHub Commit History가 팀원별 전체 개발 과정을 나타내지는 않습니다.

이 저장소는 **6차 미니프로젝트 최종 제출 및 AWS 배포 실습 결과를 보존하기 위한 Repository**입니다.
