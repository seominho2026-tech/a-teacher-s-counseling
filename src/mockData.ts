import { Reservation } from './types';

export const MOCK_RESERVATIONS: Reservation[] = [
  {
    rowNum: 2,
    expert: '김동현 전문가',
    reserver: '이서윤',
    date: '2026-07-06',
    startTime: '09:00',
    endTime: '11:00',
    subject: '인공지능 기초',
    purpose: '교육과정 매핑 및 맞춤형 로드맵 설계 워크숍'
  },
  {
    rowNum: 3,
    expert: '박지민 전문가',
    reserver: '최재영',
    date: '2026-07-06',
    startTime: '13:00',
    endTime: '14:30',
    subject: '소프트웨어 공학',
    purpose: '학부생 대상 캡스톤 디자인 프로젝트 멘토링'
  },
  {
    rowNum: 4,
    expert: '이민서 전문가',
    reserver: '한지우',
    date: '2026-07-07',
    startTime: '10:00',
    endTime: '12:00',
    subject: '데이터베이스 시스템',
    purpose: '상용 관계형 DB 스키마 정규화 및 성능 최적화 자문'
  },
  {
    rowNum: 5,
    expert: '김동현 전문가',
    reserver: '박선아',
    date: '2026-07-07',
    startTime: '15:00',
    endTime: '17:00',
    subject: '파이썬 핵심 실무',
    purpose: '웹 크롤링 및 업무 자동화 스크립트 코드 리뷰'
  },
  {
    rowNum: 6,
    expert: '정수빈 전문가',
    reserver: '이서윤',
    date: '2026-07-08',
    startTime: '14:00',
    endTime: '16:00',
    subject: '클라우드 컴퓨팅',
    purpose: 'AWS 인프라 아키텍처 및 무중단 서버 이관 검토'
  },
  {
    rowNum: 7,
    expert: '최지우 전문가',
    reserver: '윤도현',
    date: '2026-07-09',
    startTime: '11:00',
    endTime: '12:30',
    subject: 'UI/UX 서비스 디자인',
    purpose: '핀테크 앱 메인 화면 사용성 개선 및 피드백'
  },
  {
    rowNum: 8,
    expert: '박지민 전문가',
    reserver: '김태우',
    date: '2026-07-09',
    startTime: '16:00',
    endTime: '18:00',
    subject: '알고리즘 및 자료구조',
    purpose: '코딩테스트 대비 주요 문제해결 전략 세미나'
  },
  {
    rowNum: 9,
    expert: '이민서 전문가',
    reserver: '송민재',
    date: '2026-07-10',
    startTime: '09:30',
    endTime: '11:30',
    subject: '빅데이터 및 통계',
    purpose: 'R 언어 기반 가설 검정 및 기초 분석 모델링 자문'
  }
];
