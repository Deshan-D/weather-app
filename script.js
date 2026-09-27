
let currentCity = "London";

const unitsBtn = document.getElementById('units-btn');
const unitsMenu = document.getElementById('units-menu');

unitsBtn.addEventListener('click', () => {
  if (unitsMenu.style.display === 'none' || unitsMenu.style.display === '') {
    unitsMenu.style.display = 'block';
  } else {
    unitsMenu.style.display = 'none';
  }
});

document.addEventListener('click', (event) => {
  if (!unitsBtn.contains(event.target) && !unitsMenu.contains(event.target)) {
    unitsMenu.style.display = 'none';
  }
});

function getWeatherIcon(code) {
  if (code === 0) return '☀️'; 
  if (code >= 1 && code <= 3) return '⛅'; 
  if (code >= 45 && code <= 48) return '🌫️'; 
  if (code >= 51 && code <= 67) return '🌧️'; 
  if (code >= 71 && code <= 77) return '❄️'; 
  if (code >= 80 && code <= 82) return '🌦️'; 
  if (code >= 95) return '⛈️'; 
  return '☁️';
}

const searchBtn = document.getElementById('search-btn');
const searchInput = document.getElementById('search-input');

async function getWeatherData(city) {
  try {
    currentCity = city;

    const geoResponse = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${city}&count=1&language=en&format=json`);
    const geoData = await geoResponse.json();

    if (!geoData.results || geoData.results.length === 0) {
      alert("නගරය සොයාගැනීමට නොහැකි විය. කරුණාකර නිවැරදි නගරයක් ඇතුළත් කරන්න.");
      return;
    }

    const location = geoData.results[0];
    const lat = location.latitude;
    const lon = location.longitude;
    
    document.getElementById('city-name').innerText = `${location.name}, ${location.country}`;
    const options = { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' };
    document.getElementById('current-date').innerText = new Date().toLocaleDateString('en-US', options);

    const tempUnit = document.querySelector('input[name="temp"]:checked').value;
    const windUnit = document.querySelector('input[name="wind"]:checked').value;
    const precipUnit = document.querySelector('input[name="precip"]:checked').value;

    let apiUnitParams = '';
    let tempSymbol = '°';
    let windSymbol = 'km/h';
    let precipSymbol = 'mm';

    if (tempUnit === 'fahrenheit') {
      apiUnitParams += '&temperature_unit=fahrenheit';
    }
    if (windUnit === 'mph') {
      apiUnitParams += '&wind_speed_unit=mph';
      windSymbol = 'mph';
    }
    if (precipUnit === 'in') {
      apiUnitParams += '&precipitation_unit=inch';
      precipSymbol = 'in';
    }

    const weatherResponse = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,wind_speed_10m,weather_code&hourly=temperature_2m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto${apiUnitParams}`);
    const weatherData = await weatherResponse.json();

    // --- Current Weather ---
    const current = weatherData.current;
    document.getElementById('current-temp').innerText = `${Math.round(current.temperature_2m)}${tempSymbol}`;
    document.getElementById('feels-like').innerText = `${Math.round(current.apparent_temperature)}${tempSymbol}`;
    document.getElementById('humidity').innerText = `${current.relative_humidity_2m}%`;
    document.getElementById('wind-speed').innerText = `${current.wind_speed_10m} ${windSymbol}`;
    document.getElementById('precipitation').innerText = `${current.precipitation} ${precipSymbol}`;
    document.querySelector('.main-icon').innerText = getWeatherIcon(current.weather_code);

    // --- Daily Forecast ---
    const dailyContainer = document.getElementById('daily-container');
    dailyContainer.innerHTML = ''; 
    for(let i = 0; i < 7; i++) {
      const date = new Date(weatherData.daily.time[i]);
      const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
      const maxTemp = Math.round(weatherData.daily.temperature_2m_max[i]);
      const minTemp = Math.round(weatherData.daily.temperature_2m_min[i]);
      dailyContainer.innerHTML += `
        <div class="daily-card">
          <span class="day">${dayName}</span>
          <span class="icon">${getWeatherIcon(weatherData.daily.weather_code[i])}</span>
          <div class="high-low">
            <span class="high">${maxTemp}${tempSymbol}</span>
            <span class="low">${minTemp}${tempSymbol}</span>
          </div>
        </div>
      `;
    }

    // --- Hourly Forecast ---
    const hourlyContainer = document.getElementById('hourly-container');
    hourlyContainer.innerHTML = ''; 
    const currentHourIndex = new Date().getHours(); 
    for(let i = 0; i < 8; i++) {
      const index = currentHourIndex + i;
      const timeString = weatherData.hourly.time[index];
      const date = new Date(timeString);
      const timeFormatted = date.toLocaleTimeString('en-US', { hour: 'numeric', hour12: true });
      const temp = Math.round(weatherData.hourly.temperature_2m[index]);
      hourlyContainer.innerHTML += `
        <div class="hourly-item">
          <span class="time">${getWeatherIcon(weatherData.hourly.weather_code[index])} ${timeFormatted}</span>
          <span class="temp">${temp}${tempSymbol}</span>
        </div>
      `;
    }

  } catch (error) {
    console.error("Error fetching data:", error);
    alert("අන්තර්ජාල සම්බන්ධතාවයේ හෝ සර්වර් එකේ ගැටලුවක් ඇත.");
  }
}

// Search Functions
searchBtn.addEventListener('click', () => {
  const city = searchInput.value.trim();
  if (city) getWeatherData(city);
});

searchInput.addEventListener('keypress', (event) => {
  if (event.key === 'Enter') {
    const city = searchInput.value.trim();
    if (city) getWeatherData(city);
  }
});

const radioButtons = document.querySelectorAll('.units-dropdown-menu input[type="radio"]');
radioButtons.forEach(radio => {
  radio.addEventListener('change', () => {
    getWeatherData(currentCity);
  });
});

window.onload = () => {
  getWeatherData("Colombo");
};