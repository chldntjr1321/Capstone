const waterQualityJsonPath = 'water_quality_data.json'; // 수질 데이터
const pressureJsonPath = 'water_pressure_data.json'; // 압력 데이터
const waterLevelJsonPath = 'water_level_data.json'; // 수위 데이터
const waterFluxJsonPath = 'water_flux_data.json'; // 유량 데이터

let waterLevelChartData = [];
let turbidityChartData = [];
let chlorineChartData = [];
let phValueChartData = [];
let waterPressureChartData = []; // 압력 데이터를 저장할 배열
let waterFluxChartData = []; // 유량 데이터를 저장할 배열

// 현재 날짜와 시각을 업데이트하는 함수
function updateCurrentDateTime() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const date = String(now.getDate()).padStart(2, '0');
    const formattedDate = `${year}년 ${month}월 ${date}일`;
    document.getElementById('current-date').textContent = `${formattedDate}`;
}

//id = clock 부분
const clock = document.querySelector("#clock");

function getClock() {
    const date = new Date();
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const seconds = String(date.getSeconds()).padStart(2, "0");
    clock.innerText = `${hours}:${minutes}:${seconds}`;
}

getClock();
setInterval(getClock, 1000);


// 페이지 로드 시 즉시 시각 업데이트 및 1초마다 갱신
document.addEventListener('DOMContentLoaded', () => {
    updateCurrentDateTime(); // 페이지 로드 시 초기 시각 표시
    setInterval(updateCurrentDateTime, 1000); // 1초마다 시각 갱신
});


// fetch를 사용하여 water_quality_data.json, output.json, water_level_output.json, water_flux_data.json 파일을 읽어옴
Promise.all([
    fetch(waterQualityJsonPath).then(response => {
        if (!response.ok) throw new Error('네트워크 응답이 좋지 않습니다.');
        return response.json();
    }),
    fetch(pressureJsonPath).then(response => {
        if (!response.ok) throw new Error('네트워크 응답이 좋지 않습니다.');
        return response.json();
    }),
    fetch(waterLevelJsonPath).then(response => {
        if (!response.ok) throw new Error('네트워크 응답이 좋지 않습니다.');
        return response.json();
    }),
    fetch(waterFluxJsonPath).then(response => {
        if (!response.ok) throw new Error('네트워크 응답이 좋지 않습니다.');
        return response.json();
    })
])
.then(([waterQualityData, pressureData, waterLevelData, waterFluxData]) => {
    console.log('불러온 수질 데이터:', waterQualityData);
    console.log('불러온 압력 데이터:', pressureData);
    console.log('불러온 수위 데이터:', waterLevelData);
    console.log('불러온 유량 데이터:', waterFluxData);

    const facilityData = waterQualityData['사천정수장'];

    if (!Array.isArray(facilityData)) {
        throw new Error('수질 데이터가 배열이 아닙니다.');
    }

    if (!Array.isArray(waterLevelData)) {
        throw new Error('수위 데이터가 배열이 아닙니다.');
    }

    if (!Array.isArray(waterFluxData)) {
        throw new Error('유량 데이터가 배열이 아닙니다.');
    }

    let index = 0;

    // 정수조 수위 차트 초기화
    const ctxWaterLevel = document.getElementById('waterLevelChart').getContext('2d');
    const waterLevelChart = new Chart(ctxWaterLevel, {
        type: 'line',
        data: {
            labels: [],
            datasets: [
                {
                    label: '정수조 수위',
                    data: waterLevelChartData,
                    borderColor: 'rgba(54, 162, 235, 1)',
                    borderWidth: 2,
                    fill: false
                }
            ]
        },
        options: {
            responsive: true,
            scales: {
                x: { display: true, title: { display: true, text: '시간' }},
                y: { display: true, title: { display: true, text: '수위 (m)' }, min: 0, max: 5.0, ticks: { stepSize: 1.0 }}
            }
        }
    });

    // 수질 데이터 차트 초기화
    const ctxWaterQuality = document.getElementById('waterQualityChart').getContext('2d');
    const waterQualityChart = new Chart(ctxWaterQuality, {
        type: 'bar',
        data: {
            labels: [],
            datasets: [
                { label: '탁도', data: turbidityChartData, backgroundColor: 'rgba(75, 192, 192, 0.5)', borderColor: 'rgba(75, 192, 192, 1)', borderWidth: 1 },
                { label: '잔류 염소', data: chlorineChartData, backgroundColor: 'rgba(153, 102, 255, 0.5)', borderColor: 'rgba(153, 102, 255, 1)', borderWidth: 1 },
                { label: 'pH 값', data: phValueChartData, backgroundColor: 'rgba(255, 159, 64, 0.5)', borderColor: 'rgba(255, 159, 64, 1)', borderWidth: 1 }
            ]
        },
        options: {
            responsive: true,
            scales: {
                x: { display: true, title: { display: true, text: '시간' }},
                y: { display: true, title: { display: true, text: '측정값' }, min: 0, max: 15.0, ticks: { stepSize: 1.0 }}
            }
        }
    });

    // 압력 및 유량 데이터 차트 초기화 (보조축 사용)
    const ctxPressureFlux = document.getElementById('waterPressureFluxChart').getContext('2d');
    const waterPressureFluxChart = new Chart(ctxPressureFlux, {
        type: 'line',
        data: {
            labels: [],
            datasets: [
                {
                    label: '압력 (kg/cm²)',
                    data: waterPressureChartData,
                    borderColor: 'rgba(0, 128, 0, 1)', // 기본 초록색
                    borderWidth: 2,
                    fill: false,
                    yAxisID: 'y1'
                },
                {
                    label: '유량 (m³/h)',
                    data: waterFluxChartData,
                    borderColor: 'rgba(255, 165, 0, 1)', // 오렌지색
                    borderWidth: 2,
                    fill: false,
                    yAxisID: 'y2'
                }
            ]
        },
        options: {
            responsive: true,
            scales: {
                x: { display: true, title: { display: true, text: '시간' }},
                y1: {
                    type: 'linear',
                    display: true,
                    position: 'left',
                    title: { display: true, text: '압력 (kg/cm²)' },
                    min: 0,
                    max: 10.0,
                    ticks: { stepSize: 1.0 }
                },
                y2: {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    title: { display: true, text: '유량 (m³/h)' },
                    min: 0,
                    max: 2000.0,
                    ticks: { stepSize: 100.0 }
                }
            }
        }
    });

    const MAX_DATA_POINTS = 5; // 그래프에 표시할 최대 데이터 개수

    const intervalId = setInterval(() => {
        if (index >= facilityData.length || index >= pressureData.length || index >= waterLevelData.length || index >= waterFluxData.length) {
            clearInterval(intervalId); // 모든 데이터가 추가되면 중지
            return;
        }
    
        const item = facilityData[index];
        let pressureValue = parseFloat(pressureData[index]['데이터 값']);
        let waterFluxValue = parseFloat(waterFluxData[index]['데이터 값'].replace(/,/g, ''));
        let waterLevelValue = parseFloat(waterLevelData[index]['수위']);
        const hour = String((index + 1) % 24).padStart(2, '0') + '시';
    
        // 조건에 따른 데이터 조정
        if (index >= 2 && index <= 5) {
            pressureValue -= 3;
            waterFluxValue += 600;
            waterLevelValue -= 1.5;
        
        // 색상 변경
        waterLevelChart.data.datasets[0].borderColor = 'rgba(255, 0, 0, 1)'; // 빨간색
        waterPressureFluxChart.data.datasets[0].borderColor = 'rgba(255, 0, 0, 1)'; // 압력 빨간색
        waterPressureFluxChart.data.datasets[1].borderColor = 'rgba(255, 0, 0, 1)'; // 유량 빨간색
        } else {
        // 기본 색상 복원
        waterLevelChart.data.datasets[0].borderColor = 'rgba(54, 162, 235, 1)'; // 기본 파란색
        waterPressureFluxChart.data.datasets[0].borderColor = 'rgba(0, 128, 0, 1)'; // 압력 초록색
        waterPressureFluxChart.data.datasets[1].borderColor = 'rgba(255, 165, 0, 1)'; // 유량 오렌지색
        }

    
        // 화면에 데이터 표시
        document.getElementById('water-level').textContent = `${waterLevelValue.toFixed(2)} ${waterLevelData[index]['측정단위']}`;
        document.getElementById('turbidity').textContent = `${(item['탁도'] * 100).toFixed(2)} Scaled NTU`;
        document.getElementById('chlorine').textContent = `${(item['잔류 염소'] * 10).toFixed(2)} Scaled mg/L`;
        document.getElementById('ph-value').textContent = `${item['pH 값']}`;
        document.getElementById('pressure').textContent = `${pressureValue.toFixed(2)} ${pressureData[index]['단위']}`;
        document.getElementById('water-flux').textContent = `${waterFluxValue.toFixed(2)} ${waterFluxData[index]['단위']}`;
    
        // 그래프 데이터 업데이트
        waterLevelChartData.push(waterLevelValue);
        waterLevelChart.data.labels.push(hour);
    
        turbidityChartData.push((item['탁도'] * 100).toFixed(2));
        chlorineChartData.push((item['잔류 염소'] * 10).toFixed(2));
        phValueChartData.push(item['pH 값']);
        waterQualityChart.data.labels.push(hour);
    
        waterPressureChartData.push(pressureValue);
        waterFluxChartData.push(waterFluxValue);
        waterPressureFluxChart.data.labels.push(hour);
    
        // 오래된 데이터 제거
        if (waterLevelChartData.length > MAX_DATA_POINTS) {
            waterLevelChartData.shift();
            waterLevelChart.data.labels.shift();
        }
    
        if (turbidityChartData.length > MAX_DATA_POINTS) {
            turbidityChartData.shift();
            chlorineChartData.shift();
            phValueChartData.shift();
            waterQualityChart.data.labels.shift();
        }
    
        if (waterPressureChartData.length > MAX_DATA_POINTS) {
            waterPressureChartData.shift();
            waterFluxChartData.shift();
            waterPressureFluxChart.data.labels.shift();
        }
    
        // 차트 업데이트 (부드러운 전환을 위한 애니메이션 추가)
        waterLevelChart.update({
            duration: 1500, // 애니메이션을 1.5초로 설정하여 부드럽게 이동
            easing: 'easeInOutQuad', // 부드러운 속도 변화
            lazy: true // 데이터를 추가하는 데 필요한 시간 지연
        });

        waterQualityChart.update({
            duration: 1500,
            easing: 'easeInOutQuad',
            lazy: true
        });

        waterPressureFluxChart.update({
            duration: 1500,
            easing: 'easeInOutQuad',
            lazy: true
        });    
        index++;
    }, 3000);
    

})
.catch(error => {
    console.error('데이터를 불러오는데 오류가 발생했습니다:', error);
    alert('데이터를 불러오는데 오류가 발생했습니다.');
});