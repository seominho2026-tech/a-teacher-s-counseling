import { useState } from 'react';
import { Reservation } from '../types';
import { Search, User, Calendar, Clock, BookOpen, HelpCircle, Eye, Filter, ArrowUpDown } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const TEACHERS = [
  '강지수 선생님', '안혜림 선생님', '조동우 선생님', '서해정 선생님', '최신호 선생님', '신현정 선생님',
  '윤희정 선생님', '김은정 선생님', '김미화 선생님', '곽휘호 선생님', '조휘빈 선생님', '배영경 선생님',
  '김명희 선생님', '이미라 선생님', '하진성 선생님', '이동규 선생님', '조한정 선생님', '유현수 선생님'
];

interface Props {
  data: Reservation[];
  onRefresh: () => void;
  isLoading: boolean;
  isMock: boolean;
  errorMessage?: string | null;
}

export default function ReservationTable({ data, onRefresh, isLoading, isMock, errorMessage }: Props) {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchFilter, setSearchFilter] = useState<'all' | 'expert' | 'reserver' | 'subject'>('all');
  const [selectedItem, setSelectedItem] = useState<Reservation | null>(null);
  const [sortField, setSortField] = useState<'date' | 'expert' | 'reserver'>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [activeTeacher, setActiveTeacher] = useState<string | null>(null);

  // Filtering function
  const filteredData = data.filter((item) => {
    if (activeTeacher) {
      const cleanTeacherName = activeTeacher.replace(' 선생님', '').trim();
      if (!item.expert.includes(cleanTeacherName)) {
        return false;
      }
    }

    const term = searchTerm.toLowerCase().trim();
    if (!term) return true;

    const expertMatch = item.expert.toLowerCase().includes(term);
    const reserverMatch = item.reserver.toLowerCase().includes(term);
    const subjectMatch = item.subject.toLowerCase().includes(term);
    const purposeMatch = item.purpose.toLowerCase().includes(term);

    if (searchFilter === 'expert') return expertMatch;
    if (searchFilter === 'reserver') return reserverMatch;
    if (searchFilter === 'subject') return subjectMatch;
    return expertMatch || reserverMatch || subjectMatch || purposeMatch;
  });

  // Sorting function
  const sortedData = [...filteredData].sort((a, b) => {
    let comparison = 0;
    if (sortField === 'date') {
      comparison = a.date.localeCompare(b.date);
    } else if (sortField === 'expert') {
      comparison = a.expert.localeCompare(b.expert);
    } else if (sortField === 'reserver') {
      comparison = a.reserver.localeCompare(b.reserver);
    }

    return sortDirection === 'asc' ? comparison : -comparison;
  });

  const toggleSort = (field: 'date' | 'expert' | 'reserver') => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleDownloadCSV = () => {
    if (sortedData.length === 0) return;
    
    // Add UTF-8 BOM so Excel opens Korean text correctly
    const BOM = '\uFEFF';
    const headers = ['CODE', '예약자', '예약날짜', '예약시작시간', '예약종료시간', '상담 구분', '상담 내용'];
    
    const csvContent = BOM + [
      headers.join(','),
      ...sortedData.map(r => [
        `"${r.expert.replace(/"/g, '""')}"`,
        `"${r.reserver.replace(/"/g, '""')}"`,
        `"${r.date}"`,
        `"${r.startTime}"`,
        `"${r.endTime}"`,
        `"${r.subject.replace(/"/g, '""')}"`,
        `"${r.purpose.replace(/"/g, '""')}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `예약_조회_결과_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Search Header and Inputs */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <h3 className="text-base font-bold text-slate-800">예약 데이터 실시간 필터</h3>
            <span className="bg-slate-100 text-slate-600 font-mono text-xs font-bold px-2.5 py-1 rounded-full">
              총 {sortedData.length}건
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={onRefresh}
              disabled={isLoading}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-100/40 rounded-lg text-xs font-semibold transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              새로고침
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          {/* Dropdown Filter Selector */}
          <div className="sm:col-span-4 lg:col-span-3 flex items-center gap-2 border border-slate-200 rounded-xl px-3 py-2.5 bg-slate-50">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={searchFilter}
              onChange={(e: any) => setSearchFilter(e.target.value)}
              className="w-full text-xs sm:text-sm font-semibold text-slate-700 bg-transparent border-none focus:outline-hidden"
            >
              <option value="all">전체 컬럼 검색</option>
              <option value="expert">CODE</option>
              <option value="reserver">예약자</option>
              <option value="subject">상담 구분</option>
            </select>
          </div>

          {/* Search Input */}
          <div className="sm:col-span-8 lg:col-span-9 relative flex items-center">
            <Search className="w-4 h-4 text-slate-400 absolute left-4" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="예약자 성명, CODE 또는 상담 구분을 입력하여 즉시 필터링 하세요..."
              className="w-full pl-11 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm placeholder-slate-400 focus:outline-hidden focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-medium text-slate-800"
            />
          </div>
        </div>

        {/* Teacher Quick Filters */}
        <div className="border-t border-slate-100 pt-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-blue-600" />
              선생님별 빠른 필터 (클릭 시 데이터 새로고침 및 필터링)
            </span>
            {activeTeacher && (
              <button
                onClick={() => {
                  setActiveTeacher(null);
                  onRefresh();
                }}
                className="text-xs text-blue-600 hover:text-blue-800 font-bold cursor-pointer hover:underline"
              >
                필터 초기화
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {TEACHERS.map((teacher) => {
              const isActive = activeTeacher === teacher;
              const isTeacherLoading = isLoading && activeTeacher === teacher;
              return (
                <button
                  key={teacher}
                  onClick={() => {
                    if (isActive) {
                      setActiveTeacher(null);
                    } else {
                      setActiveTeacher(teacher);
                    }
                    onRefresh();
                  }}
                  disabled={isLoading}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer border ${
                    isActive
                      ? 'bg-blue-600 border-blue-600 text-white shadow-xs'
                      : 'bg-slate-50 border-slate-200/60 text-slate-600 hover:bg-slate-100/80 hover:text-slate-900'
                  } disabled:opacity-75 disabled:cursor-wait`}
                >
                  {isTeacherLoading ? (
                    <span className="w-3 h-3 rounded-full border-2 border-current border-t-transparent animate-spin mr-0.5"></span>
                  ) : (
                    <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-white' : 'bg-blue-500'}`}></span>
                  )}
                  {teacher}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Error Alert Panel if fetch failed */}
      {isMock && errorMessage && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-800 text-xs space-y-2">
          <div className="font-semibold flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse"></span>
            구글 스프레드시트 연동 오류 발생
          </div>
          <p className="text-slate-600 leading-relaxed font-medium">
            스프레드시트에서 실시간 데이터를 가져오지 못했습니다. 아래 에러 상세를 확인하고 구글 시트 설정을 점검해 보세요:
          </p>
          <div className="bg-white/80 p-2.5 rounded-lg border border-red-100 font-mono text-[11px] text-red-600 break-all leading-normal">
            {errorMessage}
          </div>
          <p className="text-[11px] text-slate-500 pt-1 leading-normal">
            💡 <strong>해결 방법:</strong> 스프레드시트의 우측 상단 <strong>[공유]</strong> 버튼을 누르고, 일반 액세스 권한을 <strong>"링크가 있는 모든 사용자"</strong> 및 <strong>"뷰어"</strong>로 올바르게 설정했는지 반드시 확인해 주세요.
          </p>
        </div>
      )}

      {/* Connection Mode Ribbon */}
      {isMock && (
        <div className="bg-blue-50/50 border border-blue-100 rounded-xl px-4 py-3 text-blue-800 text-xs flex items-center justify-between">
          <span className="font-semibold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
            체험용 샌드박스 데이터가 활성화되어 있습니다.
          </span>
          <span className="text-slate-500">실시간 검색 및 필터링 기능 테스트 가능</span>
        </div>
      )}

      {/* Main Grid/Table Listing */}
      {isLoading ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center flex flex-col items-center justify-center space-y-4">
          <div className="w-8 h-8 rounded-full border-2 border-blue-500 border-t-transparent animate-spin"></div>
          <p className="text-xs text-slate-400 font-semibold">구글 스프레드시트 데이터 안전하게 통신 중...</p>
        </div>
      ) : sortedData.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-16 text-center">
          <Search className="w-10 h-10 text-slate-300 mx-auto mb-4" />
          <h4 className="text-sm font-bold text-slate-700 mb-1">일치하는 예약 내역이 없습니다</h4>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            검색어 또는 필터 카테고리를 조정하시거나, 다른 예약자 이름으로 검색해 보세요.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Desktop Table Layout (Visible on Laptops & Desktops) */}
          <div className="hidden lg:block bg-white rounded-2xl border border-slate-200 overflow-x-auto shadow-xs">
            <table className="w-full text-left border-collapse min-w-[900px]">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th 
                    onClick={() => toggleSort('expert')}
                    className="py-4 px-5 text-xs font-bold text-slate-600 cursor-pointer hover:bg-slate-100 transition-colors"
                  >
                    <div className="flex items-center gap-1">
                      CODE
                      <ArrowUpDown className="w-3 h-3 text-slate-400" />
                    </div>
                  </th>
                  <th 
                    onClick={() => toggleSort('reserver')}
                    className="py-4 px-5 text-xs font-bold text-slate-600 cursor-pointer hover:bg-slate-100 transition-colors"
                  >
                    <div className="flex items-center gap-1">
                      예약자
                      <ArrowUpDown className="w-3 h-3 text-slate-400" />
                    </div>
                  </th>
                  <th 
                    onClick={() => toggleSort('date')}
                    className="py-4 px-5 text-xs font-bold text-slate-600 cursor-pointer hover:bg-slate-100 transition-colors"
                  >
                    <div className="flex items-center gap-1">
                      예약날짜
                      <ArrowUpDown className="w-3 h-3 text-slate-400" />
                    </div>
                  </th>
                  <th className="py-4 px-5 text-xs font-bold text-slate-600">예약시간</th>
                  <th className="py-4 px-5 text-xs font-bold text-slate-600">상담 구분</th>
                  <th className="py-4 px-5 text-xs font-bold text-slate-600">상담 내용</th>
                  <th className="py-4 px-5 text-xs font-bold text-slate-600 text-center w-24">상세</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sortedData.map((item, index) => (
                  <tr 
                    key={index} 
                    className="hover:bg-blue-50/10 transition-colors group"
                  >
                    <td className="py-4.5 px-5 text-xs font-bold text-slate-900">
                      {item.expert}
                    </td>
                    <td className="py-4.5 px-5 text-xs font-medium text-slate-700">
                      {item.reserver}
                    </td>
                    <td className="py-4.5 px-5 text-xs text-slate-500 font-mono">
                      {item.date}
                    </td>
                    <td className="py-4.5 px-5">
                      <span className="bg-slate-100 text-slate-700 font-mono text-[11px] font-semibold px-2 py-0.5 rounded-sm border border-slate-200">
                        {item.startTime} ~ {item.endTime}
                      </span>
                    </td>
                    <td className="py-4.5 px-5 text-xs text-blue-700 font-bold">
                      <span className="bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-100/40">
                        {item.subject}
                      </span>
                    </td>
                    <td className="py-4.5 px-5 text-xs text-slate-500 max-w-[200px] truncate">
                      {item.purpose}
                    </td>
                    <td className="py-4.5 px-5 text-center">
                      <button 
                        onClick={() => setSelectedItem(item)}
                        className="p-2 rounded-lg border border-slate-200 hover:border-blue-200 hover:bg-blue-50 text-slate-400 hover:text-blue-600 transition-all active:scale-95"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Tablet & Mobile Grid/Stacked Card Layout */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:hidden gap-4">
            {sortedData.map((item, index) => (
              <div 
                key={index}
                onClick={() => setSelectedItem(item)}
                className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs active:bg-slate-50 hover:border-blue-200 transition-all space-y-3.5 cursor-pointer flex flex-col justify-between h-full"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="text-xs sm:text-sm font-bold text-slate-900 truncate">{item.expert}</span>
                      <span className="text-slate-300 flex-shrink-0">|</span>
                      <span className="text-xs sm:text-sm text-slate-500 font-medium truncate">예약자: {item.reserver}</span>
                    </div>
                    <span className="text-[10px] sm:text-xs text-slate-400 font-mono bg-slate-50 px-2 py-0.5 rounded border border-slate-100 flex-shrink-0">
                      {item.date}
                    </span>
                  </div>

                  <div className="text-xs sm:text-sm font-bold text-blue-700">
                    <span className="bg-blue-50 px-2.5 py-0.5 rounded-md border border-blue-100/30">
                      {item.subject}
                    </span>
                  </div>

                  <div className="text-xs sm:text-sm text-slate-600 line-clamp-2 leading-relaxed bg-slate-50/50 p-3 rounded-xl border border-slate-100">
                    {item.purpose}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3.5 border-t border-slate-100 text-slate-500 text-xs font-mono">
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    {item.startTime} ~ {item.endTime}
                  </span>
                  <span className="text-blue-600 font-bold flex items-center gap-1 hover:text-blue-700 transition-colors">
                    상세보기 <Eye className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Detail Modal Component */}
      <AnimatePresence>
        {selectedItem && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white w-full max-w-md rounded-2xl border border-slate-200 shadow-xl overflow-hidden"
            >
              <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <span className="w-1.5 h-4 bg-blue-600 rounded-sm"></span>
                  예약 세부 정보 확인
                </h4>
                <button 
                  onClick={() => setSelectedItem(null)}
                  className="w-7 h-7 rounded-full bg-slate-200/50 hover:bg-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-700 font-bold text-sm transition-colors"
                >
                  ✕
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div className="grid grid-cols-3 py-1.5 border-b border-slate-100">
                  <span className="text-xs font-bold text-slate-400">CODE</span>
                  <span className="text-xs font-bold text-slate-900 col-span-2 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-blue-600" />
                    {selectedItem.expert}
                  </span>
                </div>

                <div className="grid grid-cols-3 py-1.5 border-b border-slate-100">
                  <span className="text-xs font-bold text-slate-400">예약자 성명</span>
                  <span className="text-xs font-bold text-slate-900 col-span-2 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-blue-600" />
                    {selectedItem.reserver}
                  </span>
                </div>

                <div className="grid grid-cols-3 py-1.5 border-b border-slate-100">
                  <span className="text-xs font-bold text-slate-400">예약 날짜</span>
                  <span className="text-xs font-medium text-slate-700 col-span-2 font-mono flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    {selectedItem.date}
                  </span>
                </div>

                <div className="grid grid-cols-3 py-1.5 border-b border-slate-100">
                  <span className="text-xs font-bold text-slate-400">예약 시간</span>
                  <span className="text-xs font-bold text-slate-900 col-span-2 font-mono flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    {selectedItem.startTime} ~ {selectedItem.endTime}
                  </span>
                </div>

                <div className="grid grid-cols-3 py-1.5 border-b border-slate-100">
                  <span className="text-xs font-bold text-slate-400">상담 구분</span>
                  <span className="text-xs font-bold text-blue-700 col-span-2 flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-blue-600" />
                    {selectedItem.subject}
                  </span>
                </div>

                <div className="space-y-1.5 pt-2">
                  <span className="text-xs font-bold text-slate-400 block">상담 내용</span>
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-600 leading-relaxed font-medium">
                    {selectedItem.purpose}
                  </div>
                </div>
              </div>

              <div className="p-4 bg-slate-50 border-t border-slate-200 text-center">
                <button
                  onClick={() => setSelectedItem(null)}
                  className="w-full py-2 bg-blue-600 hover:bg-blue-700 active:scale-99 text-white font-semibold text-xs rounded-xl transition-all"
                >
                  확인 완료
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
