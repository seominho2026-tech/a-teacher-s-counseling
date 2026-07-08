import React, { useState } from 'react';
import { SheetConfig, ConnectionStatus } from '../types';
import { Settings, Info, Link2, AlertTriangle, CheckCircle2, HelpCircle, ArrowRight } from 'lucide-react';

interface Props {
  config: SheetConfig;
  status: ConnectionStatus;
  onSave: (newConfig: SheetConfig) => void;
  onReset: () => void;
  errorMsg: string | null;
}

export default function SpreadsheetSettings({ config, status, onSave, onReset, errorMsg }: Props) {
  const [tempId, setTempId] = useState(config.spreadsheetId);
  const [tempName, setTempName] = useState(config.sheetName);
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      spreadsheetId: tempId.trim(),
      sheetName: tempName.trim()
    });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const getStatusBadge = () => {
    switch (status) {
      case 'CONNECTED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 font-bold text-xs rounded-full border border-blue-200">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
            실시간 연동 성공
          </span>
        );
      case 'CONNECTING':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 font-bold text-xs rounded-full border border-blue-200">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-spin"></span>
            연결 요청 중...
          </span>
        );
      case 'FALLBACK':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-700 font-bold text-xs rounded-full border border-amber-200">
            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
            오프라인 체험 모드 (샘플 데이터)
          </span>
        );
      case 'ERROR':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-rose-50 text-rose-700 font-bold text-xs rounded-full border border-rose-200">
            <span className="w-2 h-2 rounded-full bg-rose-500"></span>
            오류 발생
          </span>
        );
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Settings Form (7 cols) */}
      <div className="lg:col-span-7 bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-slate-500" />
            <h3 className="text-base font-bold text-slate-800">연동 구글 시트 정보 설정</h3>
          </div>
          {getStatusBadge()}
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-600 block">
              스프레드시트 ID (Spreadsheet ID)
            </label>
            <input
              type="text"
              value={tempId}
              onChange={(e) => setTempId(e.target.value)}
              placeholder="예: 14hj-AkF2fbPQ3rB90j1YbYGl7zoDShw_YSDiZ3xM1WY"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs placeholder-slate-400 focus:outline-hidden focus:border-blue-500 focus:bg-white transition-all font-mono text-slate-700"
              required
            />
            <p className="text-[10px] text-slate-400 leading-relaxed">
              * 구글 시트 URL의 <span className="font-mono">/d/</span> 와 <span className="font-mono">/edit</span> 사이에 있는 긴 문자열입니다.
            </p>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-600 block">
              워크시트 이름 (Sheet Name)
            </label>
            <input
              type="text"
              value={tempName}
              onChange={(e) => setTempName(e.target.value)}
              placeholder="예: 예약자 현황"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs placeholder-slate-400 focus:outline-hidden focus:border-blue-500 focus:bg-white transition-all font-semibold text-slate-700"
              required
            />
            <p className="text-[10px] text-slate-400">
              * 시트 하단 탭에 표시된 정확한 이름을 입력해야 합니다. (공백 주의)
            </p>
          </div>

          {errorMsg && (
            <div className="bg-rose-50 border border-rose-100 rounded-xl p-3 text-rose-800 text-xs flex gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">연결 실패 원인:</span>
                <p className="text-[11px] text-rose-700 mt-1 leading-relaxed">{errorMsg}</p>
              </div>
            </div>
          )}

          <div className="pt-3 flex gap-2">
            <button
              type="submit"
              className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 active:scale-99 text-white font-semibold text-xs rounded-xl transition-all"
            >
              {isSaved ? '변경 사항 적용됨!' : '구글 시트 연동 정보 업데이트'}
            </button>
            <button
              type="button"
              onClick={() => {
                onReset();
                setTempId('14hj-AkF2fbPQ3rB90j1YbYGl7zoDShw_YSDiZ3xM1WY');
                setTempName('예약자 현황');
              }}
              className="px-4 py-2.5 border border-slate-200 text-slate-500 hover:bg-slate-50 font-semibold text-xs rounded-xl transition-all"
            >
              기본값 복원
            </button>
          </div>
        </form>
      </div>

      {/* Troubleshooting Checklist (5 cols) */}
      <div className="lg:col-span-5 space-y-4">
        <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
          <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
            <Info className="w-4 h-4 text-blue-600" />
            구글 시트 연동 조건 체크리스트
          </h4>

          <div className="space-y-3.5">
            <div className="flex gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <h5 className="text-xs font-bold text-slate-800 mb-0.5">1. 링크 공유 설정 확인 (필수)</h5>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  구글 스프레드시트 우측 상단의 <strong>[공유]</strong> 버튼을 누르고 일반 액세스를{' '}
                  <strong className="text-blue-700 bg-blue-50 px-1 py-0.2 rounded font-semibold">"링크가 있는 모든 사용자"</strong> 및 권한을{' '}
                  <strong>"뷰어"</strong>로 설정하셔야 실시간 조회가 가능합니다.
                </p>
              </div>
            </div>

            <div className="flex gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <h5 className="text-xs font-bold text-slate-800 mb-0.5">2. 지정된 컬럼 포맷 준수 (필수)</h5>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  스프레드시트의 <strong>첫 번째 행(헤더)</strong> 아래 2행부터 데이터가 조회되며, A열부터 G열까지 순서대로 아래 구조를 가져야 합니다:
                </p>
                <div className="bg-white border border-slate-200 rounded-lg p-2.5 mt-1.5 font-mono text-[10px] text-slate-600 space-y-0.5">
                  <div className="flex justify-between"><span>A열: CODE</span> <span className="text-slate-400">문자열</span></div>
                  <div className="flex justify-between"><span>B열: 예약자</span> <span className="text-slate-400">문자열</span></div>
                  <div className="flex justify-between"><span>C열: 예약날짜</span> <span className="text-slate-400">YYYY-MM-DD</span></div>
                  <div className="flex justify-between"><span>D열: 예약시작시간</span> <span className="text-slate-400">HH:MM</span></div>
                  <div className="flex justify-between"><span>E열: 예약종료시간</span> <span className="text-slate-400">HH:MM</span></div>
                  <div className="flex justify-between"><span>F열: 상담 구분</span> <span className="text-slate-400">문자열</span></div>
                  <div className="flex justify-between"><span>G열: 상담 내용</span> <span className="text-slate-400">문자열</span></div>
                </div>
              </div>
            </div>

            <div className="flex gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <h5 className="text-xs font-bold text-slate-800 mb-0.5">3. CORS 및 비공개 통신 한계</h5>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  만약 구글 시트가 사내 망 또는 비공개 보안 계정 하에 있는 경우, 실시간 연동 대신에 저희가 제공하는 
                  <strong> [Apps Script 소스코드]</strong> 탭의 코드를 복사하여 구글 시트 내부 도구를 통해 안전한 개별 서버 웹앱으로 배포하십시오.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
