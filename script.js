let currentCity = "London";
let currentWeatherData = null;

// --- Units Dropdown ---
const unitsBtn = document.getElementById('units-btn');
const unitsMenu = document.getElementById('units-menu');

unitsBtn.addEventListener('click', () => {
  unitsMenu.style.display = (unitsMenu.style.display === 'none' || unitsMenu.style.display === '') ? 'block' : 'none';
});

document.addEventListener('click', (event) => {
  if (!unitsBtn.contains(event.target) && !unitsMenu.contains(event.target)) {
    unitsMenu.style.display = 'none';
  }
});

// --- Weather Icons ---
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

// --- DOM Elements ---
const searchBtn = document.getElementById('search-btn');
const searchInput = document.getElementById('search-input');
const daySelector = document.getElementById('day-selector');

// --- API Fetch ---
async function getWeatherData(city) {
  try {
    currentCity = city;

    const geoResponse = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${city}&count=1&language=en&format=json`);
    const geoData = await geoResponse.json();

    if (!geoData.results || geoData.results.length === 0) {
      alert("නගරය සොයාගැනීමට නොහැකි විය!");
      return;
    }

    const location = geoData.results[0];
    document.getElementById('city-name').innerText = `${location.name}, ${location.country}`;
    document.getElementById('current-date').innerText = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' });

    // Units
    const tempUnit = document.querySelector('input[name="temp"]:checked').value;
    const windUnit = document.querySelector('input[name="wind"]:checked').value;
    const precipUnit = document.querySelector('input[name="precip"]:checked').value;

    let apiUnitParams = '';
    if (tempUnit === 'fahrenheit') apiUnitParams += '&temperature_unit=fahrenheit';
    if (windUnit === 'mph') apiUnitParams += '&wind_speed_unit=mph';
    if (precipUnit === 'in') apiUnitParams += '&precipitation_unit=inch';

    const weatherResponse = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${location.latitude}&longitude=${location.longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,wind_speed_10m,weather_code&hourly=temperature_2m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto${apiUnitParams}`);
    const weatherData = await weatherResponse.json();
    
    currentWeatherData = weatherData;

    // Current Weather Update
    const current = weatherData.current;
    document.getElementById('current-temp').innerText = `${Math.round(current.temperature_2m)}°`;
    document.getElementById('feels-like').innerText = `${Math.round(current.apparent_temperature)}°`;
    document.getElementById('humidity').innerText = `${current.relative_humidity_2m}%`;
    document.getElementById('wind-speed').innerText = `${current.wind_speed_10m} ${windUnit === 'mph' ? 'mph' : 'km/h'}`;
    document.getElementById('precipitation').innerText = `${current.precipitation} ${precipUnit === 'in' ? 'in' : 'mm'}`;
    document.querySelector('.main-icon').innerText = getWeatherIcon(current.weather_code);

    const previousSelection = daySelector.value || "0";
    daySelector.innerHTML = ''; 
    for(let i = 0; i < 7; i++) {
      const date = new Date(weatherData.daily.time[i]);
      const dayName = i === 0 ? "Today" : date.toLocaleDateString('en-US', { weekday: 'long' });
      daySelector.innerHTML += `<option value="${i}">${dayName}</option>`;
    }
    daySelector.value = previousSelection;

    // Daily Forecast Update
    const dailyContainer = document.getElementById('daily-container');
    dailyContainer.innerHTML = ''; 
    for(let i = 0; i < 7; i++) {
      const date = new Date(weatherData.daily.time[i]);
      dailyContainer.innerHTML += `
        <div class="daily-card">
          <span class="day">${date.toLocaleDateString('en-US', { weekday: 'short' })}</span>
          <span class="icon">${getWeatherIcon(weatherData.daily.weather_code[i])}</span>
          <div class="high-low">
            <span class="high">${Math.round(weatherData.daily.temperature_2m_max[i])}°</span>
            <span class="low">${Math.round(weatherData.daily.temperature_2m_min[i])}°</span>
          </div>
        </div>
      `;
    }

    renderHourlyForecast(parseInt(daySelector.value));

  } catch (error) {
    console.error("Error:", error);
    alert("දත්ත ලබාගැනීමේ ගැටලුවක් ඇත.");
  }
}

function renderHourlyForecast(dayIndex) {
  if (!currentWeatherData) return;
  
  const hourlyContainer = document.getElementById('hourly-container');
  hourlyContainer.innerHTML = ''; 
  
  const startIndex = dayIndex * 24;
  const endIndex = startIndex + 24;
  
  for(let i = startIndex; i < endIndex; i++) {
    
    if (dayIndex === 0 && i < new Date().getHours()) continue;

    const date = new Date(currentWeatherData.hourly.time[i]);
    const timeFormatted = date.toLocaleTimeString('en-US', { hour: 'numeric', hour12: true });
    const temp = Math.round(currentWeatherData.hourly.temperature_2m[i]);

    hourlyContainer.innerHTML += `
      <div class="hourly-item">
        <span class="time">${getWeatherIcon(currentWeatherData.hourly.weather_code[i])} ${timeFormatted}</span>
        <span class="temp">${temp}°</span>
      </div>
    `;
  }
}

daySelector.addEventListener('change', (e) => {
  renderHourlyForecast(parseInt(e.target.value));
});

// Search Events
searchBtn.addEventListener('click', () => { if (searchInput.value.trim()) getWeatherData(searchInput.value.trim()); });
searchInput.addEventListener('keypress', (e) => { if (e.key === 'Enter' && searchInput.value.trim()) getWeatherData(searchInput.value.trim()); });

document.querySelectorAll('.units-dropdown-menu input[type="radio"]').forEach(radio => {
  radio.addEventListener('change', () => getWeatherData(currentCity));
});

window.onload = () => getWeatherData("Colombo");