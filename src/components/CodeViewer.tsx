import { useState } from 'react';
import { Copy, Check, FileCode, ExternalLink, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function CodeViewer() {
  const [activeSubTab, setActiveSubTab] = useState<'gs' | 'html'>('gs');
  const [copied, setCopied] = useState(false);

  const codeGs = `// Code.gs

function doGet() {
  return HtmlService.createTemplateFromFile('Index')
    .evaluate()
    .setTitle('구글 시트 예약 조회 시스템')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

/**
 * 구글 시트에서 예약자 이름 또는 교육과정전문가 이름으로 검색합니다.
 * @param {string} query 검색어 (예약자 또는 교육과정전문가 이름)
 * @return {Array<Object>} 검색 결과 리스트
 */
function searchReservations(query) {
  const SPREADSHEET_ID = '14hj-AkF2fbPQ3rB90j1YbYGl7zoDShw_YSDiZ3xM1WY';
  const SHEET_NAME = '예약자 현황';
  
  try {
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_NAME);
    if (!sheet) {
      throw new Error("'" + SHEET_NAME + "' 시트를 찾을 수 없습니다.");
    }
    
    const lastRow = sheet.getLastRow();
    if (lastRow < 2) {
      return []; // 데이터가 없거나 헤더만 있는 경우
    }
    
    // 전체 데이터 가져오기 (헤더 제외)
    const dataRange = sheet.getRange(2, 1, lastRow - 1, 7);
    const values = dataRange.getValues();
    
    const results = [];
    const normalizedQuery = query ? query.trim().toLowerCase() : '';
    
    for (let i = 0; i < values.length; i++) {
      const row = values[i];
      const expert = String(row[0] || '').trim();
      const reserver = String(row[1] || '').trim();
      
      // 검색어가 없으면 전체 출력, 검색어가 있으면 예약자나 전문가 이름에 포함되는지 확인
      const matches = !normalizedQuery || 
                      expert.toLowerCase().includes(normalizedQuery) || 
                      reserver.toLowerCase().includes(normalizedQuery);
                      
      if (matches) {
        // 날짜 형식 예쁘게 변환 (YYYY-MM-DD)
        let rawDate = row[2];
        let formattedDate = '';
        if (rawDate instanceof Date) {
          const year = rawDate.getFullYear();
          const month = String(rawDate.getMonth() + 1).padStart(2, '0');
          const date = String(rawDate.getDate()).padStart(2, '0');
          formattedDate = \`\${year}-\${month}-\${date}\`;
        } else if (rawDate) {
          formattedDate = String(rawDate);
        }
        
        // 시간 형식 변환
        let startTime = formatTime(row[3]);
        let endTime = formatTime(row[4]);
        
        results.push({
          rowNum: i + 2, // 실제 시트 행 번호
          expert: expert,
          reserver: reserver,
          date: formattedDate,
          startTime: startTime,
          endTime: endTime,
          subject: String(row[5] || '').trim(),
          purpose: String(row[6] || '').trim()
        });
      }
    }
    
    return results;
  } catch (error) {
    Logger.log(error.toString());
    throw new Error('데이터 조회 중 오류가 발생했습니다: ' + error.message);
  }
}

/**
 * 시간 데이터(Date 객체 또는 문자열)를 HH:MM 형식으로 변환합니다.
 */
function formatTime(timeVal) {
  if (timeVal instanceof Date) {
    const hours = String(timeVal.getHours()).padStart(2, '0');
    const minutes = String(timeVal.getMinutes()).padStart(2, '0');
    return \`\${hours}:\${minutes}\`;
  }
  if (typeof timeVal === 'string' && timeVal) {
    // 문자열에서 시간 추출 시도
    const match = timeVal.match(/(\\d{1,2}):(\\d{2})/);
    if (match) {
      return \`\${match[1].padStart(2, '0')}:\${match[2]}\`;
    }
    return timeVal;
  }
  return String(timeVal || '');
}`;

  const codeHtml = `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>예약 조회 시스템</title>
  <!-- Bootstrap 5 CSS -->
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
  <!-- Bootstrap Icons -->
  <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.5/font/bootstrap-icons.css" rel="stylesheet">
  <style>
    body {
      background-color: #f8f9fa;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    }
    .main-card {
      border: none;
      border-radius: 16px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
      background-color: #ffffff;
    }
    .table-container {
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(0,0,0,0.02);
    }
    .table th {
      background-color: #f1f3f5;
      font-weight: 600;
      color: #495057;
    }
    .badge-time {
      font-family: monospace;
      font-size: 0.9rem;
    }
    .spinner-border {
      width: 1.5rem;
      height: 1.5rem;
    }
  </style>
</head>
<body>

<div class="container py-5">
  <div class="row justify-content-center">
    <div class="col-lg-10">
      
      <!-- 헤더 -->
      <div class="text-center mb-5">
        <h2 class="fw-bold text-dark mb-2">
          <i class="bi bi-calendar-check text-success me-2"></i>예약 조회 시스템
        </h2>
        <p class="text-muted">교육과정전문가 또는 예약자 이름으로 예약 정보를 실시간으로 조회하세요.</p>
      </div>

      <!-- 검색 인터페이스 -->
      <div class="card main-card p-4 mb-4">
        <form id="searchForm" onsubmit="handleSearch(event)">
          <div class="row g-3">
            <div class="col-md-9 col-sm-8">
              <div class="input-group">
                <span class="input-group-text bg-white border-end-0">
                  <i class="bi bi-search text-muted"></i>
                </span>
                <input type="text" id="searchInput" class="form-control border-start-0 py-2.5" placeholder="예약자 또는 교육과정전문가 이름을 입력하세요...">
              </div>
            </div>
            <div class="col-md-3 col-sm-4 d-grid">
              <button type="submit" class="btn btn-success py-2.5 fw-semibold">
                <span id="btnText">검색하기</span>
                <span id="btnSpinner" class="spinner-border spinner-border-sm ms-2 d-none" role="status" aria-hidden="true"></span>
              </button>
            </div>
          </div>
        </form>
      </div>

      <!-- 결과 목록 -->
      <div class="card main-card p-4">
        <div class="d-flex justify-content-between align-items-center mb-3">
          <h5 class="fw-bold mb-0 text-dark">
            조회 결과 <span id="resultCount" class="badge bg-secondary ms-1">0</span>
          </h5>
          <button onclick="fetchAllData()" class="btn btn-sm btn-outline-secondary">
            <i class="bi bi-arrow-clockwise me-1"></i>전체 보기
          </button>
        </div>

        <div id="loadingState" class="text-center py-5 d-none">
          <div class="spinner-border text-success mb-3" role="status"></div>
          <p class="text-muted mb-0">구글 시트에서 데이터를 안전하게 불러오는 중입니다...</p>
        </div>

        <div id="emptyState" class="text-center py-5">
          <i class="bi bi-search-heart text-muted display-4 d-block mb-3"></i>
          <h5 class="fw-semibold text-muted">검색결과가 없습니다</h5>
          <p class="text-muted mb-0 small">검색어를 입력하고 검색 버튼을 눌러주세요.</p>
        </div>

        <div id="errorState" class="alert alert-danger d-none" role="alert">
          <i class="bi bi-exclamation-triangle-fill me-2"></i>
          <span id="errorMessage">오류가 발생했습니다.</span>
        </div>

        <!-- 결과 테이블 -->
        <div id="tableWrapper" class="table-container table-responsive d-none">
          <table class="table table-hover align-middle mb-0">
            <thead>
              <tr>
                <th>CODE</th>
                <th>예약자</th>
                <th>예약 날짜</th>
                <th>예약 시간</th>
                <th>상담 구분</th>
                <th>상담 내용</th>
              </tr>
            </thead>
            <tbody id="resultsTableBody">
              <!-- JS로 동적 삽입 -->
            </tbody>
          </table>
        </div>

      </div>

      <!-- 푸터 정보 -->
      <div class="text-center mt-4 text-muted small">
        <p>© 2026 예약 조회 시스템. Google Apps Script 기반</p>
      </div>

    </div>
  </div>
</div>

<!-- Bootstrap Bundle with Popper -->
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>

<script>
  // 초기 로드 시 전체 데이터를 로드합니다.
  window.addEventListener('DOMContentLoaded', () => {
    fetchAllData();
  });

  function handleSearch(event) {
    if (event) event.preventDefault();
    const query = document.getElementById('searchInput').value.trim();
    performSearch(query);
  }

  function fetchAllData() {
    document.getElementById('searchInput').value = '';
    performSearch('');
  }

  function performSearch(query) {
    showLoading(true);
    hideError();
    
    google.script.run
      .withSuccessHandler(function(results) {
        showLoading(false);
        renderResults(results);
      })
      .withFailureHandler(function(error) {
        showLoading(false);
        showError(error.message || '데이터를 불러오는 데 실패했습니다.');
      })
      .searchReservations(query);
  }

  function renderResults(results) {
    const tbody = document.getElementById('resultsTableBody');
    const countBadge = document.getElementById('resultCount');
    const tableWrapper = document.getElementById('tableWrapper');
    const emptyState = document.getElementById('emptyState');
    
    tbody.innerHTML = '';
    countBadge.textContent = results.length;
    
    if (!results || results.length === 0) {
      tableWrapper.classList.add('d-none');
      emptyState.classList.remove('d-none');
      return;
    }
    
    emptyState.classList.add('d-none');
    tableWrapper.classList.remove('d-none');
    
    results.forEach(row => {
      const tr = document.createElement('tr');
      tr.innerHTML = \`
        <td><strong class="text-dark">\${escapeHtml(row.expert)}</strong></td>
        <td>\${escapeHtml(row.reserver)}</td>
        <td><span class="text-secondary">\${escapeHtml(row.date)}</span></td>
        <td>
          <span class="badge bg-light text-dark border badge-time">
            \${escapeHtml(row.startTime)} ~ \${escapeHtml(row.endTime)}
          </span>
        </td>
        <td><span class="badge bg-success-subtle text-success border border-success-subtle">\${escapeHtml(row.subject)}</span></td>
        <td class="text-muted small">\${escapeHtml(row.purpose)}</td>
      \`;
      tbody.appendChild(tr);
    });
  }

  function showLoading(isLoading) {
    const loadingState = document.getElementById('loadingState');
    const btnSpinner = document.getElementById('btnSpinner');
    const btnText = document.getElementById('btnText');
    const submitBtn = document.querySelector('button[type="submit"]');
    
    if (isLoading) {
      loadingState.classList.remove('d-none');
      btnSpinner.classList.remove('d-none');
      btnText.textContent = '검색 중...';
      if (submitBtn) submitBtn.disabled = true;
    } else {
      loadingState.classList.add('d-none');
      btnSpinner.classList.add('d-none');
      btnText.textContent = '검색하기';
      if (submitBtn) submitBtn.disabled = false;
    }
  }

  function showError(msg) {
    const errorState = document.getElementById('errorState');
    const errorMessage = document.getElementById('errorMessage');
    errorMessage.textContent = msg;
    errorState.classList.remove('d-none');
  }

  function hideError() {
    document.getElementById('errorState').classList.add('d-none');
  }

  function escapeHtml(str) {
    if (!str) return '';
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }
</script>
</body>
</html>`;

  const handleCopy = () => {
    const targetText = activeSubTab === 'gs' ? codeGs : codeHtml;
    navigator.clipboard.writeText(targetText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Introduction Card */}
      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-xs">
        <h3 className="text-lg font-bold text-slate-800 mb-2">Google Apps Script 배포 코드</h3>
        <p className="text-sm text-slate-500 leading-relaxed">
          요청하신 <span className="font-semibold text-blue-600">Code.gs</span> 와{' '}
          <span className="font-semibold text-blue-600">Index.html</span> 파일 소스 코드입니다. 
          아래 단계를 따라 Google Sheets와 연동된 웹앱을 단 3분 만에 무료로 배포할 수 있습니다.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Source Code Panel (7 cols) */}
        <div className="lg:col-span-7 flex flex-col h-[600px] bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-md">
          {/* Code Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-slate-950 border-b border-slate-800">
            <div className="flex gap-2">
              <button
                onClick={() => setActiveSubTab('gs')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeSubTab === 'gs'
                    ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                <FileCode className="w-3.5 h-3.5" />
                Code.gs
              </button>
              <button
                onClick={() => setActiveSubTab('html')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeSubTab === 'html'
                    ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                <FileCode className="w-3.5 h-3.5" />
                Index.html
              </button>
            </div>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-200 rounded-lg text-xs font-medium transition-all"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-blue-400" />
                  <span className="text-blue-400">복사 완료!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>코드 복사</span>
                </>
              )}
            </button>
          </div>

          {/* Code Workspace */}
          <div className="flex-1 p-4 overflow-y-auto font-mono text-xs text-slate-300 leading-relaxed select-text select-all whitespace-pre">
            {activeSubTab === 'gs' ? codeGs : codeHtml}
          </div>
        </div>

        {/* Deploy Guide Panel (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs h-full flex flex-col justify-between">
            <div>
              <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                웹앱 초간단 배포 가이드
              </h4>

              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="flex-none w-6 h-6 rounded-full bg-blue-50 flex items-center justify-center text-xs font-bold text-blue-600 border border-blue-100">
                    1
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-slate-800 mb-1">구글 스프레드시트 설정</h5>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      구글 스프레드시트(<span className="font-mono bg-slate-50 px-1 py-0.5 rounded text-[11px]">14hj-AkF2f...</span>)를 열고 상단 메뉴에서{' '}
                      <strong>[확장 프로그램] &gt; [Apps Script]</strong>를 클릭합니다.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="flex-none w-6 h-6 rounded-full bg-blue-50 flex items-center justify-center text-xs font-bold text-blue-600 border border-blue-100">
                    2
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-slate-800 mb-1">Code.gs 코드 붙여넣기</h5>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      기존 편집 창의 내용을 모두 지운 후, 좌측에서 복사한{' '}
                      <strong>Code.gs</strong> 내용을 붙여넣습니다. (스프레드시트 ID 확인)
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="flex-none w-6 h-6 rounded-full bg-blue-50 flex items-center justify-center text-xs font-bold text-blue-600 border border-blue-100">
                    3
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-slate-800 mb-1">Index.html 파일 추가</h5>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      좌측의 <strong>[+]</strong> 아이콘을 클릭한 뒤 <strong>[HTML]</strong>을 선택하고, 
                      파일 이름을 <strong className="font-mono">Index</strong>로 입력합니다. 생성된 파일에 복사한{' '}
                      <strong>Index.html</strong> 소스코드를 덮어씌웁니다.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="flex-none w-6 h-6 rounded-full bg-blue-50 flex items-center justify-center text-xs font-bold text-blue-600 border border-blue-100">
                    4
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-slate-800 mb-1">웹앱 배포하기</h5>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      우측 상단의 <strong>[배포] &gt; [새 배포]</strong> 버튼을 누르고 톱니바퀴에서{' '}
                      <strong>[웹 앱]</strong>을 선택합니다.
                      <br />
                      • 다음 사용자 권한으로 실행: <strong>나 (My Email)</strong>
                      <br />• 액세스 권한이 있는 사용자: <strong>모든 사용자 (Anyone)</strong>
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="flex-none w-6 h-6 rounded-full bg-blue-50 flex items-center justify-center text-xs font-bold text-blue-600 border border-blue-100">
                    5
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-slate-800 mb-1">배포 승인 및 완료!</h5>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      <strong>[배포]</strong> 버튼을 누른 후, [권한 부여 승인] 단계에서 구글 계정 로그인을 한 뒤 
                      생성된 <strong>웹앱 URL</strong>을 통해 모바일과 데스크톱 브라우저에서 바로 접속합니다.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between bg-blue-50/50 p-3 rounded-lg border border-blue-100/40">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-blue-600" />
                <span className="text-xs font-bold text-blue-800">모바일 자동 최적화 완료</span>
              </div>
              <a
                href="https://script.google.com"
                target="_blank"
                rel="noreferrer"
                className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-0.5"
              >
                Apps Script 바로가기
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
