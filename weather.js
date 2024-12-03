const API_KEY = "0225ed20feb2a7c2acc697b307cd12ad";

function onGeoOk(position) {
    const lat = position.coords.latitude;
    const lon = position.coords.longitude;
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`;
    fetch(url).then(response => response.json()).then(data =>{
    const city = document.querySelector("#current-weather span:first-child");
    const weather = document.querySelector("#current-weather span:last-child");
    city.innerText = `"${data.name}"의`;
    weather.innerText = `현재 날씨 : ${data.weather[0].main}, 기온 : ${data.main.temp}℃`;
    });
}
function onGeoError() {
    alert("Can't find you. No weather for you.");
}

navigator.geolocation.getCurrentPosition(onGeoOk, onGeoError);
