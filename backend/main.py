import os
from fastapi import FastAPI
from openai import OpenAI
from dotenv import load_dotenv
import requests
from urllib.parse import urlparse
from pydantic import BaseModel


load_dotenv()   # 추가
app = FastAPI()
BRAVE_API_KEY = os.getenv("BRAVE_API_KEY")
BRAVE_ENDPOINT = "https://api.search.brave.com/res/v1/web/search"

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

def imporve_query(input_text: str):
    response = client.responses.create(
        model="gpt-5.5",
        reasoning={"effort": "medium"},
        instructions=prompt,
        input=input_text,
    )
    return response.output_text.strip()

def search(query: str):
    headers = {
        "Accept": "application/json",
        "X-Subscription-Token": BRAVE_API_KEY
    }

    parmas = {
        "q": query,
        "country": "kr",
        "count": 10,
        "safesearch": "strict"
    }

    response = requests.get(BRAVE_ENDPOINT, headers=headers, params=parmas)
    if response.status_code != 200:
        print(f"Error: {response.status_code}, {response.text}")
        return []
    raw_result = response.json()
    results = []
    if "web" in raw_result and "results" in raw_result["web"]:
        for item in raw_result["web"]["results"]:
            parsed_url = urlparse(item["url"])
            results.append({
                "title": item.get("title","제목없음"),
                "snippet" : item.get("description","내용없음"),
                "url": item.get("url",""),
                "source": parsed_url.netloc
            })
    return results

class SearchRequest(BaseModel):
    query: str
    filter: list[str] = []

@app.post("/search")
async def search_endpoint(request: SearchRequest):
    orginal_query = request.query
    improved_query = imporve_query(orginal_query)
    search_results = search(improved_query)
    return {
        "original_query": orginal_query,
        "improved_query": improved_query,
        "results": search_results
    }

@app.get("/")
def read_root():
    return {"Hello": "World"}
