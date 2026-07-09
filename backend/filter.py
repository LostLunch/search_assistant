SITE_FILTERS = {
    # 1. 뉴스 언론사 (10개)
    "news": [
        "news.naver.com",
        "yna.co.kr",
        "khan.co.kr",
        "hani.co.kr",
        "news.daum.net",
        "chosun.com",
        "donga.com",
        "joongang.co.kr",
        "mk.co.kr",
        "hankyung.com",
    ],

    # 2. 학술 논문 및 연구 자료 (5개)
    "paper": [
        "dbpia.co.kr",
        "riss.kr",
        "kiss.kstudy.com",
        "kci.go.kr",
        "scienceon.kisti.re.kr",
    ],

    # 3. 데이터 및 국책 연구원 중심 공공 사이트 (10개)
    "official": [
        "kosis.kr",              # 국가통계포털
        "data.go.kr",            # 공공데이터포털
        "korea.kr",              # 대한민국 정책브리핑
        "nypi.re.kr",            # 한국청소년정책연구원
        "kihasa.re.kr",          # 한국보건사회연구원
        "nier.go.kr",            # 국립환경과학원
        "spri.kr",               # 소프트웨어정책연구소
        "law.go.kr",             # 국가법령정보센터
        "bok.or.kr",             # 한국은행
        "nims.re.kr",        # 에어코리아 (대기환경정보)
    ],
}


def apply_site_filters(query: str, filters: list[str]) -> str:
    sites = []

    for f in filters:
        sites.extend(SITE_FILTERS.get(f, []))

    if not sites:
        return query

    site_query = " OR ".join(f"site:{site}" for site in sites)

    return f"{query} ({site_query})"