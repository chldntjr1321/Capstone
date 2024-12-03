import requests
import json
from requests.adapters import HTTPAdapter
from requests.packages.urllib3.util.retry import Retry # type: ignore

# API 요청 URL (수위 데이터 요청 URL로 변경)
url = 'http://apis.data.go.kr/B500001/rwis/waterLevel/list'

# 요청 파라미터 설정
params = {
    'stDt': '2024-11-28',    # 시작 날짜
    'stTm': '00',          # 시작 시간
    'edDt': '2024-11-28',    # 종료 날짜
    'edTm': '23',          # 종료 시간
    '_type': 'json',       # 응답 형식
    'serviceKey': 'IXPiDICNoweAadzYxfFl5DSMrgRYBqWZ1n3r+5+R0ZUixnveIHWUYbKrgQKBnw2ARc4JQ+Y2cMKZ8Ah3xld0UA==',
    'sujCode': '333',      # 수자원 코드 (예시)
    'numOfRows': '23',    # 한 페이지에 출력할 데이터 수
    'pageNo': '1',         # 페이지 번호
}

# 세션 설정 및 재시도 정책 적용
session = requests.Session()
retries = Retry(total=5, backoff_factor=1, status_forcelist=[500, 502, 503, 504])
session.mount('http://', HTTPAdapter(max_retries=retries))

# API 요청 및 예외 처리
try:
    # HTTP 프로토콜과 타임아웃 설정으로 요청
    response = session.get(url, params=params, timeout=10)
    response.raise_for_status()  # 상태 코드가 200이 아니면 예외 발생

    # JSON 형식으로 응답 내용 파싱
    data = response.json()

    # 데이터 추출 및 필터링
    items = data.get('response', {}).get('body', {}).get('items', {}).get('item', [])
    
    # 필요한 항목들을 필터링 및 출력 준비
    output_data = []
    for item in items:
        output_data.append({
            '시설명': item.get('fcltyMngNo', '없음'),
            '시설명': item.get('fcltyNm', '없음'),
            '수위': item.get('dataVal', '없음'),
            '측정단위': item.get('itemUnit', '없음'),
            '측정 일시': item.get('occrrncDt', '없음')
        })

    # JSON 파일로 저장
    with open('water_level_data.json', 'w', encoding='utf-8') as json_file:
        json.dump(output_data, json_file, ensure_ascii=False, indent=4)

    print("JSON 파일 저장 완료!")

except requests.exceptions.RequestException as e:
    print(f"API 요청 오류: {e}")
except json.JSONDecodeError as e:
    print(f"JSON 파싱 오류: {e}")
    print(f"응답 내용 일부: {response.text[:200]}")
except Exception as e:
    print(f"예기치 못한 오류 발생: {e}")
