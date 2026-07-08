export interface Reservation {
  rowNum?: number;
  expert: string;     // 교육과정전문가 (A)
  reserver: string;   // 예약자 (B)
  date: string;       // 예약날짜 (C)
  startTime: string;  // 예약시작시간 (D)
  endTime: string;    // 예약종료시간 (E)
  subject: string;    // 상담 유형 (F)
  purpose: string;    // 상담 내용 (G)
}

export interface SheetConfig {
  spreadsheetId: string;
  sheetName: string;
}

export type ConnectionStatus = 'CONNECTED' | 'FALLBACK' | 'CONNECTING' | 'ERROR';
