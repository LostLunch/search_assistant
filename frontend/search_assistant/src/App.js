import React, { useState } from 'react';

export default function SearchAssistant() {
  // 상태 관리 (필요에 따라 확장하세요)
  const [activePanels, setActivePanels] = useState({
    blog: true,
    cafe: false,
    news: false,
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [domainRestrict, setDomainRestrict] = useState('');

  // 패널 토글 함수
  const togglePanel = (panel) => {
    setActivePanels((prev) => ({ ...prev, [panel]: !prev[panel] }));
  };

  // 검색 제출 핸들러
  const handleSearch = (e) => {
    e.preventDefault();
    console.log({
      activePanels,
      searchQuery,
      domainRestrict,
    });
    alert(`검색 실행!\n검색어: ${searchQuery}\n제한 도메인: ${domainRestrict}`);
  };

  return (
    <div className="flex h-screen bg-gray-50 text-gray-800 font-sans">
      
      {/* 1. 왼쪽 사이드바 (사이트 종류 활성화 패널) */}
      <aside className="w-64 bg-white border-r border-gray-200 p-6 flex flex-col justify-between">
        <div>
          <h2 className="text-xl font-bold text-indigo-600 mb-6 flex items-center gap-2">
            🔍 검색 보조기
          </h2>
          
          <div className="space-y-4">
            <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
              대상 사이트 필터
            </p>
            
            {/* 패널 1: 블로그 */}
            <button
              onClick={() => togglePanel('blog')}
              className={`w-full p-4 rounded-xl border text-left transition-all duration-200 flex justify-between items-center ${
                activePanels.blog
                  ? 'border-indigo-600 bg-indigo-50 text-indigo-700 font-medium shadow-sm'
                  : 'border-gray-200 bg-white hover:bg-gray-50 text-gray-600'
              }`}
            >
              <span>📝 블로그 검색</span>
              <span className={`w-2.5 h-2.5 rounded-full ${activePanels.blog ? 'bg-indigo-600' : 'bg-gray-300'}`} />
            </button>

            {/* 패널 2: 카페 */}
            <button
              onClick={() => togglePanel('cafe')}
              className={`w-full p-4 rounded-xl border text-left transition-all duration-200 flex justify-between items-center ${
                activePanels.cafe
                  ? 'border-indigo-600 bg-indigo-50 text-indigo-700 font-medium shadow-sm'
                  : 'border-gray-200 bg-white hover:bg-gray-50 text-gray-600'
              }`}
            >
              <span>☕ 카페 커뮤니티</span>
              <span className={`w-2.5 h-2.5 rounded-full ${activePanels.cafe ? 'bg-indigo-600' : 'bg-gray-300'}`} />
            </button>

            {/* 패널 3: 뉴스 */}
            <button
              onClick={() => togglePanel('news')}
              className={`w-full p-4 rounded-xl border text-left transition-all duration-200 flex justify-between items-center ${
                activePanels.news
                  ? 'border-indigo-600 bg-indigo-50 text-indigo-700 font-medium shadow-sm'
                  : 'border-gray-200 bg-white hover:bg-gray-50 text-gray-600'
              }`}
            >
              <span>📰 뉴스 기사</span>
              <span className={`w-2.5 h-2.5 rounded-full ${activePanels.news ? 'bg-indigo-600' : 'bg-gray-300'}`} />
            </button>
          </div>
        </div>

        <div className="text-xs text-gray-400 text-center">
          © 2026 Search Assistant
        </div>
      </aside>

      {/* 2. 메인 콘텐츠 영역 */}
      <main className="flex-1 flex flex-col justify-center items-center p-8">
        <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
          
          <div className="mb-8 text-center">
            <h1 className="text-2xl font-extrabold text-gray-900 mb-2">어떤 정보를 찾으시나요?</h1>
            <p className="text-sm text-gray-500">사이드바의 필터와 아래 세부 조건을 입력해 정확하게 검색해보세요.</p>
          </div>

          <form onSubmit={handleSearch} className="space-y-6">
            
            {/* 메인 입력 칸 (검색어) */}
            <div>
              <label htmlFor="search" className="block text-sm font-semibold text-gray-700 mb-2">
                검색어 입력
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="검색하고 싶은 키워드를 입력하세요..."
                  className="w-full px-5 py-4 bg-gray-50 border border-gray-300 rounded-xl shadow-inner focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white text-lg transition-all"
                  required
                />
              </div>
            </div>

            {/* 아래 원하는 도메인 적는 곳 */}
            <div>
              <label htmlFor="domain" className="block text-sm font-semibold text-gray-700 mb-2">
                특정 도메인 제한 (선택)
              </label>
              <div className="flex rounded-xl shadow-sm">
                <span className="inline-flex items-center px-4 rounded-l-xl border border-r-0 border-gray-300 bg-gray-100 text-gray-500 text-sm">
                  site:
                </span>
                <input
                  type="text"
                  id="domain"
                  value={domainRestrict}
                  onChange={(e) => setDomainRestrict(e.target.value)}
                  placeholder="example.com (특정 사이트 내에서만 검색할 때)"
                  className="w-full px-4 py-3 border border-gray-300 rounded-r-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                />
              </div>
              <p className="mt-1.5 text-xs text-gray-400">구글의 `site:` 문법처럼 특정 도메인 결과만 필터링합니다.</p>
            </div>

            {/* 검색 버튼 */}
            <button
              type="submit"
              className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg transition-all transform hover:-translate-y-0.5"
            >
              스마트 검색 시작하기
            </button>
            
          </form>
        </div>
      </main>

    </div>
  );
}