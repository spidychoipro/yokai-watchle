import requests
from bs4 import BeautifulSoup
import json
import time

# 요괴워치 시리즈별 URL
URLS = {
    'ykw1': 'https://yokaiwatch.fandom.com/wiki/List_of_Yo-kai_by_Medallium_Number_(Yo-kai_Watch)',
    'ykw2': 'https://yokaiwatch.fandom.com/wiki/List_of_Yo-kai_by_Medallium_Number_(Yo-kai_Watch_2)',
    'ykw3': 'https://yokaiwatch.fandom.com/wiki/List_of_Yo-kai_by_Medallium_Number_(Yo-kai_Watch_3)',
    'blasters': 'https://yokaiwatch.fandom.com/wiki/List_of_Yo-kai_by_Medallium_Number_(Yo-kai_Watch_Blasters)'
}

# User-Agent 설정 (접근 거부 피하기)
HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
}

def scrape_yokai_list(url, series_name):
    """
    위키 페이지에서 요괴 데이터 스크래핑
    """
    print(f"[{series_name}] 데이터 수집 중... {url}")
    
    try:
        response = requests.get(url, headers=HEADERS, timeout=10)
        response.encoding = 'utf-8'
        soup = BeautifulSoup(response.content, 'html.parser')
        
        yokai_list = []
        
        # 모든 테이블 찾기
        tables = soup.find_all('table', {'class': 'wikitable'})
        print(f"  → {len(tables)}개의 테이블 발견")
        
        for table_idx, table in enumerate(tables):
            rows = table.find_all('tr')
            print(f"  → 테이블 {table_idx + 1}: {len(rows)}개 행")
            
            for row_idx, row in enumerate(rows):
                # 헤더 스킵
                if row_idx == 0:
                    continue
                
                cells = row.find_all(['td', 'th'])
                if len(cells) < 3:
                    continue
                
                try:
                    # 첫 번째 셀: 번호
                    num_text = cells[0].get_text(strip=True)
                    # '#' 문자 제거
                    num = int(num_text.replace('#', '').strip())
                    
                    # 두 번째 셀: 이름 (한글/영문)
                    name_cell = cells[1].get_text(strip=True)
                    
                    # 이름 분리 (보통 "한글 / English" 형식)
                    names = name_cell.split('/')
                    ko_name = names[0].strip() if len(names) > 0 else ''
                    en_name = names[1].strip() if len(names) > 1 else names[0].strip()
                    
                    # 세 번째 셀 이후: 랭크, 부족, 속성 등
                    rank = cells[2].get_text(strip=True) if len(cells) > 2 else ''
                    tribe = cells[3].get_text(strip=True) if len(cells) > 3 else ''
                    attr = cells[4].get_text(strip=True) if len(cells) > 4 else ''
                    
                    # 데이터 정제
                    rank = rank.upper() if rank else None
                    tribe = tribe if tribe else None
                    attr = attr if attr else None
                    
                    yokai = {
                        'n': num,
                        'ko': ko_name if ko_name and ko_name != en_name else None,
                        'en': en_name,
                        'rank': rank,
                        'tribe': tribe,
                        'attr': attr
                    }
                    
                    yokai_list.append(yokai)
                    
                    if len(yokai_list) % 50 == 0:
                        print(f"    {len(yokai_list)}개 수집...")
                
                except (ValueError, IndexError) as e:
                    continue
        
        print(f"✓ [{series_name}] 총 {len(yokai_list)}개 요괴 수집 완료\n")
        return sorted(yokai_list, key=lambda x: x['n'])
    
    except Exception as e:
        print(f"✗ [{series_name}] 오류: {e}\n")
        return []

def main():
    """
    모든 시리즈 데이터 수집 및 data.js 생성
    """
    all_data = {}
    
    for series_key, url in URLS.items():
        series_data = scrape_yokai_list(url, series_key)
        all_data[series_key] = series_data
        time.sleep(2)  # 서버 부담 줄이기
    
    # data.js 형식으로 변환
    data_js_content = generate_data_js(all_data)
    
    # 파일 저장
    with open('src/data.js', 'w', encoding='utf-8') as f:
        f.write(data_js_content)
    
    print("✓ src/data.js 파일 생성 완료!")
    
    # 요약
    for series_key, yokai_list in all_data.items():
        print(f"  {series_key}: {len(yokai_list)}개 요괴")

def generate_data_js(all_data):
    """
    data.js 파일 내용 생성
    """
    js_code = """window.YKW_DATA = {
  "meta": {
    "tribes": [
      {"en": "Brave", "ko": "용맹"},
      {"en": "Mysterious", "ko": "불가사의"},
      {"en": "Tough", "ko": "호걸"},
      {"en": "Charming", "ko": "프리티"},
      {"en": "Heartful", "ko": "따뜻함"},
      {"en": "Boss", "ko": "보스"},
      {"en": "Legendary", "ko": "전설"},
      {"en": "Enma", "ko": "염마"}
    ],
    "attrs": [
      "Fire", "Water", "Earth", "Metal", "Wood", "Wind", "Light", "Dark",
      "불", "물", "흙", "금속", "나무", "바람", "빛", "어둠"
    ],
    "attrKo": {
      "Fire": "불",
      "Water": "물",
      "Earth": "흙",
      "Metal": "금속",
      "Wood": "나무",
      "Wind": "바람",
      "Light": "빛",
      "Dark": "어둠"
    },
    "rankOrder": {"S": 6, "A": 5, "B": 4, "C": 3, "D": 2, "E": 1}
  },
  "games": [
    {
      "id": "ykw1",
      "name": {"ko": "요괴워치 1", "en": "Yo-kai Watch 1"},
      "versions": [
        {
          "id": "main",
          "label": {"ko": "기본", "en": "Standard"},
          "list": """ + json.dumps(all_data.get('ykw1', []), ensure_ascii=False, indent=2) + """
        }
      ]
    },
    {
      "id": "ykw2",
      "name": {"ko": "요괴워치 2", "en": "Yo-kai Watch 2"},
      "versions": [
        {
          "id": "main",
          "label": {"ko": "기본", "en": "Standard"},
          "list": """ + json.dumps(all_data.get('ykw2', []), ensure_ascii=False, indent=2) + """
        }
      ]
    },
    {
      "id": "ykw3",
      "name": {"ko": "요괴워치 3", "en": "Yo-kai Watch 3"},
      "versions": [
        {
          "id": "main",
          "label": {"ko": "기본", "en": "Standard"},
          "list": """ + json.dumps(all_data.get('ykw3', []), ensure_ascii=False, indent=2) + """
        }
      ]
    },
    {
      "id": "blasters",
      "name": {"ko": "요괴워치 버스터즈", "en": "Yo-kai Watch Blasters"},
      "versions": [
        {
          "id": "main",
          "label": {"ko": "기본", "en": "Standard"},
          "list": """ + json.dumps(all_data.get('blasters', []), ensure_ascii=False, indent=2) + """
        }
      ]
    }
  ]
};
"""
    return js_code

if __name__ == '__main__':
    main()
