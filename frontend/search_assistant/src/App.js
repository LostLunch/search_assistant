import React, { useState } from 'react';

// UI 아이콘 컴포넌트들
const SearchIcon = () => <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>;
const PlaneIcon = () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>;

function App() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // 💡 상태 추가: 현재 화면 상단에 박아줄 '검색이 완료된 키워드'
  const [currentSearchTerm, setCurrentSearchTerm] = useState('');
  // 💡 상태 추가: AI가 개선한 쿼리 결과를 저장할 상태
  const [aiImprovedTerm, setAiImprovedTerm] = useState(''); 

  // 정적 UI 구성을 위한 고정된 카테고리 리스트
  const staticCategories = [
    { id: 'news', label: '뉴스 언론사' },
    { id: 'paper', label: '학술 논문' },
    { id: 'official', label: '공공사이트' }
  ];

  // 사용자가 체크박스로 선택한 카테고리 ID 배열
  const [selectedCategories, setSelectedCategories] = useState([]);

  // 카테고리 체크박스 선택/해제 핸들러
  const handleCategoryToggle = (catId) => {
    setSelectedCategories(prev => 
      prev.includes(catId) ? prev.filter(id => id !== catId) : [...prev, catId]
    );
  };

  // 검색 실행
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    setIsLoading(true);

    // 💡 검색을 시작하자마자 입력했던 글자를 상단 키워드로 박제하고, 입력창은 비웁니다.
    const termToSearch = query;
    setCurrentSearchTerm(termToSearch);
    setQuery('');
    setAiImprovedTerm(''); // AI 개선 쿼리 초기화

    // 선택된 카테고리들에 속한 모든 도메인들을 하나의 배열로 평탄화
    const domainsToSend = [];
    staticCategories.forEach(category => {
      if (selectedCategories.includes(category.id)) {
        // 실제 운영 시 도메인 하드코딩 매핑이 필요하다면 여기에 push, 
        // 키값 그대로 보낸다면 기존 설정을 따릅니다.
        domainsToSend.push(category.id); 
      }
    });

    try {
      const response = await fetch('https://search-assistant-qi8d.onrender.com/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: termToSearch, // 💡 비워지기 전의 기존 검색어로 요청 전송
          filter: selectedCategories
        }),
      });

      if (!response.ok) throw new Error('API 응답 실패');
      
      const data = await response.json();
      setResults(data.results || []);
      setAiImprovedTerm(data.improved_query || ''); // 💡 AI 개선 쿼리 상태 업데이트
    } catch (error) {
      console.error('검색 중 오류 발생:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 text-gray-900 overflow-hidden relative font-sans">
      
      {/* 1. 사이드바 */}
      <aside className="w-72 bg-white border-r border-gray-200 flex flex-col h-full z-10 select-none">
        <div className="p-6 border-b border-gray-100">
          <h1 className="text-xl font-bold text-gray-900 tracking-tight">검색 보조 프로그램</h1>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          <p className="text-xs font-bold text-gray-400 tracking-wider uppercase px-2 mb-2">출처 필터링</p>
          
          <div className="space-y-2">
            {staticCategories.map((category) => {
              const isChecked = selectedCategories.includes(category.id);
              
              return (
                <label 
                  key={category.id} 
                  className="flex items-center p-3.5 bg-white border border-gray-100 rounded-xl hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => handleCategoryToggle(category.id)}
                      className="w-5 h-5 rounded border-gray-300 border-2 appearance-none cursor-pointer transition-all relative after:content-[''] after:absolute after:hidden after:top-[2px] after:left-[6px] after:w-[5px] after:h-[10px] after:border-white after:border-r-2 after:border-b-2 after:rotate-45 checked:after:block checked:bg-blue-600 checked:border-blue-600"
                    />
                    <span className={`text-sm font-medium transition-colors ${isChecked ? 'text-gray-900 font-semibold' : 'text-gray-700'}`}>
                      {category.label}
                    </span>
                  </div>
                </label>
              );
            })}
          </div>
        </div>
      </aside>

      {/* 2. 메인 결과 레이아웃 영역 */}
      <main className="flex-1 flex flex-col p-8 overflow-y-auto pb-32 relative bg-slate-50/50">
        
        {/* 💡 최상단 검색어 표출 타이틀 영역 (검색된 단어가 있을 때만 표시) */}
        {currentSearchTerm && (
          <div className="max-w-4xl w-full mx-auto mb-6 pb-4 border-b border-gray-200/60">
            {/* 1. 사용자가 입력한 원래 질문 (크고 명확하게) */}
            <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">
              <span className="text-blue-600">"{currentSearchTerm}"</span> 검색 결과
            </h2>
            
            {/* 2. AI가 다듬은 쿼리 (아래에 작고 스마트하게 서브 플로팅) */}
            {results.length > 0 && (
              <p className="text-sm text-gray-400 mt-2 flex items-center gap-1.5 bg-slate-100 w-fit px-2.5 py-1 rounded-md">
                <span className="font-semibold text-emerald-600"> AI 쿼리 최적화:</span>
                <span className="text-gray-300">|</span>
                <span className="italic font-medium text-gray-700">
                  {/* 백엔드 응답 데이터 구조에 맞게 매핑 (예: data.improved_query) */}
                  {aiImprovedTerm || "필터링된 키워드로 검색되었습니다."}
                </span>
              </p>
            )}
          </div>
        )}

        {!isLoading && results.length > 0 && (
          <div className="max-w-4xl w-full mx-auto space-y-4">
            {results.map((item, index) => (
              <article key={index} className="p-6 bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-md transition">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded">
                    {item.source || new URL(item.url).hostname}
                  </span>
                </div>
                <h2 className="text-lg font-bold text-slate-900 hover:text-blue-600 transition mb-1">
                  <a href={item.url} target="_blank" rel="noopener noreferrer">{item.title}</a>
                </h2>
                <p className="text-xs text-emerald-700 mb-2 truncate">{item.url}</p>
                <p className="text-sm text-gray-600 leading-relaxed">{item.snippet}</p>
              </article>
            ))}
          </div>
        )}

        {/* 대기/빈 결과 상태 */}
        {!isLoading && results.length === 0 && (
          <div className="flex-1 flex flex-col items-center justify-center text-center opacity-60">
            <p className="text-gray-500 font-medium text-lg">결과가 여기에 표시됩니다.</p>
            <p className="text-sm text-gray-400 mt-1">하단 검색 창에서 검색을 시작해 보세요.</p>
          </div>
        )}

        {/* 로딩 바 */}
        {isLoading && (
          <div className="flex-1 flex flex-col justify-center items-center gap-4 animate-fade-in">
            {/* 점선으로 빙글빙글 도는 원 */}
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-500 border-dashed"></div>
            
            {/* 로딩 원 아래에 추가한 커스텀 문구 */}
            <div className="text-center space-y-1">
              <p className="text-base font-semibold text-slate-700">AI가 최적의 검색어를 조율하고 있습니다</p>
              <p className="text-xs text-gray-400">잠시만 기다려 주세요...</p>
            </div>
          </div>
        )}
      </main>

      {/* 3. 하단 고정 검색바 */}
      <footer className="absolute bottom-0 left-72 right-0 bg-gradient-to-t from-gray-50 via-gray-50/90 to-transparent p-6 z-20">
        <div className="max-w-4xl mx-auto">
          <form onSubmit={handleSearch} className="flex items-center bg-white border border-gray-200 rounded-2xl shadow-lg p-2 pl-4 focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 transition-all">
            <div className="p-1">
              <SearchIcon />
            </div>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="궁금한 내용을 탐구해 보세요..."
              className="flex-1 px-3 py-2.5 bg-transparent text-sm focus:outline-none text-gray-800 placeholder-gray-400"
            />
            <button type="submit" disabled={isLoading} className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm font-semibold rounded-xl shadow transition">
              <span>Search</span>
              <PlaneIcon />
            </button>
          </form>
        </div>
      </footer>

    </div>
  );
}

export default App;