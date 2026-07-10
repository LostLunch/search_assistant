import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from openai import OpenAI
from dotenv import load_dotenv
import requests
from urllib.parse import urlparse
from pydantic import BaseModel
import re

load_dotenv()   # 추가
app = FastAPI(title = "검색 보조 서비스")
BRAVE_API_KEY = os.getenv("BRAVE_API_KEY")
BRAVE_ENDPOINT = "https://api.search.brave.com/res/v1/web/search"

origins = [
    "http://localhost:3000",
    "http://localhost:5173",  # Vite를 쓰신다면 5173
    "https://search-assistant-pi.vercel.app"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],  # GET, POST 등 모든 HTTP 메서드 허용
    allow_headers=["*"],  # 모든 헤더 허용
)

client = OpenAI()
prompt = """너는 Brave Search API에 전달할 최적의 한국어 쿼리를 생성하는 검색 보조 AI이다.
사용자의 입력을 분석하여, 한국어 웹 문서(블로그, 뉴스, 커뮤니티 등)에서 원하는 정보를 가장 잘 찾을 수 있도록 핵심 키워드 조합으로 재작성한다.

[규칙]
1. 한국어 중심 유지: 결과물은 반드시 '한국어 키워드'를 중심으로 구성한다. 사용자가 입력하지 않은 단어를 임의로 영어로 번역하여 출력하지 않는다. (단, python, API, SQL 같은 고유 기술 명사는 예외로 둔다.)
2. 명사 중심 압축: 구어체, 질문형, 서술형 표현(~하는 법, ~ 추천, ~ 좋은 거, ~ 살만한 거 등)은 문맥을 파악하여 검색어에 적합한 단일 명사(예: '방법', '추천', '비교')로 압축하거나 과감히 제거한다.
3. 인터넷 속어/불용어 필터링: '꿀템', '개꿀', '영끌', '내돈내산' 같은 인터넷 유행어나 속어는 검색 엔진이 잘 인식하는 표준 명사(예: '제품', '후기', '추천')로 치환하거나 제거한다.
4. 임의 확장 금지: 이미 키워드 형태로 완성도가 높은 입력은 절대 단어를 임의로 덧붙이거나 수정하지 않고 그대로 출력한다.
5. 출력 형식 독점 (CRITICAL): 오직 검색창에 바로 들어갈 순수 텍스트(String) 한 줄만 출력한다. 마크다운, 따옴표, 줄바꿈, 설명을 절대 포함하지 않는다. 앞뒤 공백도 제거한다.

[예시]
입력: 파이썬에서 list를 문자열로 합치는 가장 빠른 방법이 뭐야?
출력: 파이썬 list 문자열 합치기 속도

입력: 아이폰 스펙 가성비 좋은 거 추천 영끌해서 살만한 거
출력: 아이폰 가성비 모델 스펙 비교 추천

입력: 시험 기간에 벼락치기 할 때 잠 깨는 꿀템 내돈내산 후기
출력: 시험기간 벼락치기 졸음방지 용품 후기

입력: 양자 컴퓨터
출력: 양자 컴퓨터"""

SITE_FILTERS = {
    # 1. 신뢰도 높은 뉴스 언론사
    "news": [
        "news.naver.com", "yna.co.kr", "khan.co.kr", "hani.co.kr", 
        "chosun.com", "donga.com", "joongang.co.kr"
    ],
    # 2. 학술 논문 및 연구 자료
    "paper": [
        "dbpia.co.kr", "riss.kr", "kiss.kstudy.com", "kci.go.kr", "scienceon.kisti.re.kr"
    ],
    # 3. [추천] 통계 및 원천 데이터 (수행평가 근거용)
    "stat_data": [
        "kosis.kr", "data.go.kr", "index.go.kr", "ecos.bok.or.kr"
    ],
    # 4. [추천] 국책 연구원 전문 보고서 (심화 탐구용)
    "policy_report": [
        "kdi.re.kr", "kipf.re.kr", "krei.re.kr", "kli.re.kr", "stepi.re.kr"
    ],
    # 5. [추천] 교육 및 법령 공공기관 (교차 검증용)
    "edu_institution": [
        "moe.go.kr", "kice.re.kr", "keris.or.kr", "law.go.kr"
    ]
}

def set_goggle(filters: list[str],user_filters:list[str]=[]) -> str:
    filters_list = []
    for f in filters:
        filters_list.extend(SITE_FILTERS.get(f, []))
    if user_filters:
        filters_list.extend(user_filters)
    if not filters_list:
        return ""
    
    filter_list = list(set(filters_list))  # 중복 제거
    goggle_rules = ["$discard"] + [f"$site={site}" for site in filter_list]
    return "\n".join(goggle_rules)

def remove_html_tags(text: str) -> str:
    if not text:
        return ""
    clean = re.compile(r'<[^>]*>')
    return re.sub(clean, '', text)

def imporve_query(input_text: str):
    response = client.responses.create(
        model="gpt-5.5",
        reasoning={"effort": "medium"},
        instructions=prompt,
        input=input_text,
    )
    return response.output_text.strip()

def brave_search(query: str, filter:list[str] = [],user_filters:list[str] = []) -> list[dict]:
    headers = {
        "Accept": "application/json",
        "X-Subscription-Token": BRAVE_API_KEY
    }

    parmas = {
        "q": query,
        "country": "kr",
        "count": 20,
        "safesearch": "strict",
    }
    print(f"Filters: {filter}, User Filters: {user_filters}")
    goggle = set_goggle(filter, user_filters)
    if goggle:
        parmas["goggles"] = goggle
        print(parmas["goggles"])

    response = requests.get(BRAVE_ENDPOINT, headers=headers, params=parmas)
    if response.status_code != 200:
        print(f"Error: {response.status_code}, {response.text}")
        return []
    raw_result = response.json()
    results = []
    if "web" in raw_result and "results" in raw_result["web"]:
        for item in raw_result["web"]["results"]:
            parsed_url = urlparse(item["url"])
            title = remove_html_tags(item.get("title", "제목없음"))
            snippet = remove_html_tags(item.get("description", "내용없음"))
            results.append({
                "title": title,
                "snippet": snippet,
                "url": item.get("url",""),
                "source": parsed_url.netloc
            })
    return results

class SearchRequest(BaseModel):
    query: str
    filter: list[str] = []
    custom_filter: list[str] = []
    

@app.post("/search")
async def search_endpoint(request: SearchRequest):
    orginal_query = request.query
    filters = request.filter
    custom_filters = request.custom_filter
    improved_query = imporve_query(orginal_query)
    if not filters:
        search_results = brave_search(improved_query,user_filters=custom_filters)
    else:
        search_results = brave_search(improved_query, filters, custom_filters)
    return {
        "original_query": orginal_query,
        "improved_query": improved_query,
        "results": search_results
    }

@app.get("/")
def read_root():
    return {"Hello": "World"}

@app.get("/search")
def search():
    return {"message": "CORS 해결 완료!"}

