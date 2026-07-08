import { useState, useEffect, useCallback } from 'react';
import { Reservation, SheetConfig, ConnectionStatus } from './types';
import { MOCK_RESERVATIONS } from './mockData';
import ReservationTable from './components/ReservationTable';
import { CalendarRange } from 'lucide-react';

const DEFAULT_CONFIG: SheetConfig = {
  spreadsheetId: '14hj-AkF2fbPQ3rB90j1YbYGl7zoDShw_YSDiZ3xM1WY',
  sheetName: '예약자 현황'
};

export default function App() {
  const [status, setStatus] = useState<ConnectionStatus>('CONNECTING');
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fetchSheetData = useCallback(async () => {
    setStatus('CONNECTING');
    setErrorMessage(null);
    try {
      const { spreadsheetId, sheetName } = DEFAULT_CONFIG;
      const url = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/gviz/tq?tqx=out:json&sheet=${encodeURIComponent(sheetName)}`;
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP 에러가 발생했습니다: status ${response.status}`);
      }
      
      const text = await response.text();
      
      // Parse GViz response which is wrapped in a javascript callback: google.visualization.Query.setResponse(...)
      const startIdx = text.indexOf('{');
      const endIdx = text.lastIndexOf('}');
      if (startIdx === -1 || endIdx === -1) {
        throw new Error("스프레드시트를 읽을 수 없습니다. 구글 시트의 일반 액세스 설정을 [링크가 있는 모든 사용자 - 뷰어]로 설정해 주세요.");
      }
      
      const jsonStr = text.substring(startIdx, endIdx + 1);
      const data = JSON.parse(jsonStr);
      
      if (data.status === 'error') {
        const errorDetail = data.errors?.[0]?.detailed_message || "구글 시트 시트 이름이나 컬럼 형식을 찾을 수 없습니다.";
        throw new Error(errorDetail);
      }
      
      const table = data.table;
      if (!table || !table.rows || table.rows.length === 0) {
        setReservations([]);
        setStatus('CONNECTED');
        return;
      }
      
      const formatTimeVal = (cell: any) => {
        if (!cell) return '';
        const v = cell.v;
        if (typeof v === 'string' && v.startsWith('Date(')) {
          const matches = v.match(/Date\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*,\s*(\d+)\s*,\s*(\d+)(?:\s*,\s*\d+)*\s*\)/);
          if (matches) {
            const h = String(matches[1]).padStart(2, '0');
            const m = String(matches[2]).padStart(2, '0');
            return `${h}:${m}`;
          }
        }
        return cell.f || String(v || '');
      };
      
      const parsed: Reservation[] = table.rows.map((row: any, idx: number) => {
        const c = row.c;
        if (!c) return null;
        
        // Parse date
        let dateVal = '';
        const rawDate = c[2]?.v;
        if (typeof rawDate === 'string' && rawDate.startsWith('Date(')) {
          const matches = rawDate.match(/Date\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)(?:\s*,\s*\d+)*\s*\)/);
          if (matches) {
            const y = matches[1];
            const m = String(Number(matches[2]) + 1).padStart(2, '0');
            const d = String(matches[3]).padStart(2, '0');
            dateVal = `${y}-${m}-${d}`;
          } else if (c[2]?.f) {
            dateVal = c[2].f;
          } else {
            dateVal = String(c[2]?.v || '');
          }
        } else if (c[2]?.f) {
          dateVal = c[2].f;
        } else {
          dateVal = String(c[2]?.v || '');
        }
        
        return {
          rowNum: idx + 2,
          expert: String(c[0]?.v || '').trim(),
          reserver: String(c[1]?.v || '').trim(),
          date: dateVal.trim(),
          startTime: formatTimeVal(c[3]).trim(),
          endTime: formatTimeVal(c[4]).trim(),
          subject: String(c[5]?.v || '').trim(),
          purpose: String(c[6]?.v || '').trim()
        };
      }).filter((item: any) => {
        if (!item) return false;
        const isHeader = 
          item.expert === 'CODE' || 
          item.expert === '교육과정전문가' || 
          item.reserver === '예약자' || 
          item.reserver === '예약자 성명';
        const isEmpty = !item.expert && !item.reserver;
        return !isHeader && !isEmpty;
      }) as Reservation[];
      
      setReservations(parsed);
      setStatus('CONNECTED');
    } catch (err: any) {
      console.warn("Real-time spreadsheet fetch failed. Falling back to sandbox data:", err.message);
      setErrorMessage(err.message || "알 수 없는 통신 네트워크 에러가 발생했습니다.");
      setReservations(MOCK_RESERVATIONS);
      setStatus('FALLBACK');
    }
  }, []);

  // Fetch on mount
  useEffect(() => {
    fetchSheetData();
  }, [fetchSheetData]);

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 antialiased">
      {/* Premium Top Navigation */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-xs">
              <CalendarRange className="w-5.5 h-5.5" />
            </div>
            <div>
              <span className="text-base font-bold tracking-tight text-slate-900">EduReserve <span className="font-normal text-slate-400">| 예약 조회 시스템</span></span>
              <span className="text-[10px] text-slate-400 font-medium block">Google Sheets Live Connected</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Container Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ReservationTable
          data={reservations}
          onRefresh={fetchSheetData}
          isLoading={status === 'CONNECTING'}
          isMock={status === 'FALLBACK'}
          errorMessage={errorMessage}
        />
      </main>

      {/* Humble Elegant Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-600"></span>
            <span>Google Sheets Reservation Finder v1.0</span>
          </div>
          <div className="font-medium text-slate-400">
            © 2026 예약 조회 시스템 • Responsive Business Intelligence Portals
          </div>
        </div>
      </footer>
    </div>
  );
}
