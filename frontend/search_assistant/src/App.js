import React, { useState } from 'react';

// UI 아이콘 컴포넌트들
const SearchIcon = () => <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>;
const PlaneIcon = () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>;
const CloseIcon = () => <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>;

function App() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const [currentSearchTerm, setCurrentSearchTerm] = useState('');
  const [aiImprovedTerm, setAiImprovedTerm] = useState(''); 

  const staticCategories = [
    { id: 'news', label: '뉴스 언론사' },
    { id: 'paper', label: '학술 논문' },
    { id: 'stat_data', label: '통계 (수행평가)' },
    { id: 'policy_report', label: '정책 보고서 (탐구)' },
    { id: 'edu_institution', label: '교육 및 법령' },
  ];

  const [selectedCategories, setSelectedCategories] = useState([]);
  const [customFilters, setCustomSites] = useState([]);
  const [customInput, setCustomInput] = useState('');

  const handleCategoryToggle = (catId) => {
    setSelectedCategories(prev => 
      prev.includes(catId) ? prev.filter(id => id !== catId) : [...prev, catId]
    );
  };

  const handleAddCustomSite = (e) => {
    e.preventDefault();
    const trimmed = customInput.trim().toLowerCase();
    if (!trimmed) return;
    
    let domain = trimmed.replace(/^(https?:\/\/)?(www\.)?/, '');
    domain = domain.split('/')[0];

    if (domain && !customFilters.includes(domain)) {
      setCustomSites(prev => [...prev, domain]);
    }
    setCustomInput('');
  };

  const handleRemoveCustomSite = (siteToRemove) => {
    setCustomSites(prev => prev.filter(site => site !== siteToRemove));
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    setIsLoading(true);

    const termToSearch = query;
    setCurrentSearchTerm(termToSearch);
    setQuery('');
    setAiImprovedTerm(''); 

    try {
      const response = await fetch('http://localhost:8000/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: termToSearch, 
          filter: selectedCategories,
          custom_filter: customFilters
        }),
      });

      if (!response.ok) throw new Error('API 응답 실패');
      
      const data = await response.json();
      setResults(data.results || []);
      setAiImprovedTerm(data.improved_query || ''); 
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

        {/* 상단 스크롤 영역: 기본 필터링 체크박스들 */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <p className="text-xs font-bold text-gray-400 tracking-wider uppercase px-2">출처 필터링</p>
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

        {/* 💡 변경된 하단 고정 영역: 입력창을 위로 올리고 리스트를 아래로 내림 */}
        <div className="p-4 border-t border-gray-100 bg-slate-50/50 flex flex-col max-h-[45%]">
          {/* [위] 커스텀 필터 입력창 */}
          <div className="mb-4">
            <p className="text-xs font-bold text-gray-400 tracking-wider uppercase px-2 mb-2">커스텀 필터 추가</p>
            <p className="text-[10px] font-bold text-gray-400 tracking-wider uppercase px-2 mb-2">올바르지 않은 형식은 제외</p>
            <form onSubmit={handleAddCustomSite} className="flex gap-2">
              <input
                type="text"
                value={customInput}
                onChange={(e) => setCustomInput(e.target.value)}
                placeholder="예: github.com 또는 tistory"
                className="flex-1 min-w-0 px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-gray-800"
              />
              <button 
                type="submit"
                className="px-3 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-xl shadow transition shrink-0"
              >
                추가
              </button>
            </form>
          </div>

          {/* [아래] 내가 추가한 사이트 리스트 (개수가 많아지면 내부 스크롤 제공) */}
          <div className="flex-1 overflow-y-auto min-h-[60px] max-h-[160px] border border-dashed border-gray-200 rounded-xl p-2.5 bg-white/50">
            <p className="text-[10px] font-bold text-gray-400 tracking-wider uppercase mb-2 px-1">지정된 커스텀 필터 ({customFilters.length})</p>
            
            {customFilters.length === 0 ? (
              <p className="text-xs text-gray-400 italic text-center py-4">추가된 사이트가 없습니다.</p>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {customFilters.map((site) => (
                  <span 
                    key={site} 
                    className="flex items-center gap-1 text-xs font-medium text-slate-700 bg-white pl-2.5 pr-1.5 py-1 rounded-full border border-slate-200 shadow-sm animate-fade-in"
                  >
                    {site}
                    <button 
                      onClick={() => handleRemoveCustomSite(site)}
                      className="p-0.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                      title="필터 삭제"
                    >
                      <CloseIcon />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* 2. 메인 결과 레이아웃 영역 */}
      <main className="flex-1 flex flex-col p-8 overflow-y-auto pb-32 relative bg-slate-50/50">
        
        {currentSearchTerm && (
          <div className="max-w-4xl w-full mx-auto mb-6 pb-4 border-b border-gray-200/60">
            <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">
              <span className="text-blue-600">"{currentSearchTerm}"</span> 검색 결과
            </h2>
            
            {results.length > 0 && (
              <p className="text-sm text-gray-400 mt-2 flex items-center gap-1.5 bg-slate-100 w-fit px-2.5 py-1 rounded-md">
                <span className="font-semibold text-emerald-600"> AI 쿼리 최적화:</span>
                <span className="text-gray-300">|</span>
                <span className="italic font-medium text-gray-700">
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

        {!isLoading && results.length === 0 && (
          <div className="flex-1 flex flex-col items-center justify-center text-center opacity-60">
            <p className="text-gray-500 font-medium text-lg">결과가 여기에 표시됩니다.</p>
            <p className="text-sm text-gray-400 mt-1">하단 검색 창에서 검색을 시작해 보세요.</p>
          </div>
        )}

        {isLoading && (
          <div className="flex-1 flex flex-col justify-center items-center gap-4 animate-fade-in">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-500 border-dashed"></div>
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