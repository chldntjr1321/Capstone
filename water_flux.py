import requests
import xml.etree.ElementTree as ET
import json

# API URL 및 파라미터
url = 'http://apis.data.go.kr/B500001/rwis/waterFlux/waterFlux'
params = {
    'serviceKey': 'IXPiDICNoweAadzYxfFl5DSMrgRYBqWZ1n3r+5+R0ZUixnveIHWUYbKrgQKBnw2ARc4JQ+Y2cMKZ8Ah3xld0UA==',
    'sujCode': '333',
    'stDt': '2024-11-28',
    'stTm': '00',
    'edDt': '2024-11-28',
    'edTm': '23',
    'pageNo': '1',
    'numOfRows': '200',
}

# API 호출
response = requests.get(url, params=params)

# 응답 상태 확인
if response.status_code == 200:
    # XML 데이터 파싱
    root = ET.fromstring(response.content)
    
    # 데이터 추출 및 조건 필터링
    data_list = []
    items = root.findall('.//item')
    if items:
        for item in items:
            # 필요한 데이터 추출
            facility_name = item.findtext('dataItemDesc')  # 시설명
            data_val = item.findtext('dataVal')      # 데이터 값
            unit = item.findtext('itemUnit')        # 단위
            data_item_tagsn = item.findtext('dataItemTagsn')  # dataItemTagsn 값
            
            # 조건 필터링: dataItemTagsn 값이 6654인 항목만 추가
            if data_item_tagsn == '6654':
                data_list.append({
                    "시설명": facility_name,
                    "데이터 값": data_val,
                    "단위": unit
                })
        
        # JSON 파일 저장
        if data_list:
            output_file = "water_flux_data.json"
            with open(output_file, "w", encoding="utf-8") as json_file:
                json.dump(data_list, json_file, ensure_ascii=False, indent=4)
            
            print(f"조건에 맞는 데이터가 '{output_file}' 파일로 저장되었습니다.")
        else:
            print("조건에 맞는 데이터가 없습니다.")
    else:
        print("데이터 항목을 찾을 수 없습니다.")
else:
    print(f"오류 발생: HTTP {response.status_code}")
