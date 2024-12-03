import requests
import json
import xml.etree.ElementTree as ET

api_key = "IXPiDICNoweAadzYxfFl5DSMrgRYBqWZ1n3r+5+R0ZUixnveIHWUYbKrgQKBnw2ARc4JQ+Y2cMKZ8Ah3xld0UA=="
url = "http://apis.data.go.kr/B500001/rwis/waterQuality/list"

params = {
    "serviceKey": api_key,
    "sujCode": "333",  # 사업장 코드
    "stDt": "2024-11-28",
    "stTm": "00",
    "edDt": "2024-11-28",
    "edTm": "23",
    "numOfRows": "24",
    "pageNo": "1"
}

response = requests.get(url, params=params)

if response.status_code == 200:
    try:
        root = ET.fromstring(response.text)
        items = root.find(".//items")

        # 데이터 구조를 위한 딕셔너리 초기화
        structured_data = {}

        for item in items:
            fclty_mng_nm = item.find("fcltyMngNm").text
            cl_val = item.find("clVal").text
            ph_val = item.find("phVal").text
            tb_val = item.find("tbVal").text
            
            # 시설명이 이미 존재하는 경우 데이터 추가
            if fclty_mng_nm not in structured_data:
                structured_data[fclty_mng_nm] = []

            structured_data[fclty_mng_nm].append({
                "잔류 염소": cl_val,
                "pH 값": ph_val,
                "탁도": tb_val
            })

        # JSON 파일로 저장
        with open('water_quality_data.json', 'w', encoding='utf-8') as json_file:
            json.dump(structured_data, json_file, ensure_ascii=False, indent=4)
        
    except ET.ParseError:
        print("XML 파싱 오류: 응답을 파싱할 수 없습니다.")
else:
    print("API 요청 실패:", response.status_code)
