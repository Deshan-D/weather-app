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

const searchBtn = document.getElementById('search-btn');
const searchInput = document.getElementById('search-input');

async function getWeatherData(city) {
  try {
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

    const weatherResponse = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,wind_speed_10m&timezone=auto`);
    const weatherData = await weatherResponse.json();

    const current = weatherData.current;

    document.getElementById('current-temp').innerText = `${Math.round(current.temperature_2m)}°`;
    document.getElementById('feels-like').innerText = `${Math.round(current.apparent_temperature)}°`;
    document.getElementById('humidity').innerText = `${current.relative_humidity_2m}%`;
    document.getElementById('wind-speed').innerText = `${current.wind_speed_10m} km/h`;
    document.getElementById('precipitation').innerText = `${current.precipitation} mm`;

  } catch (error) {
    console.error("Error fetching data:", error);
    alert("අන්තර්ජාල සම්බන්ධතාවයේ හෝ සර්වර් එකේ ගැටලුවක් ඇත.");
  }
}

searchBtn.addEventListener('click', () => {
  const city = searchInput.value.trim();
  if (city) {
    getWeatherData(city);
  }
});

searchInput.addEventListener('keypress', (event) => {
  if (event.key === 'Enter') {
    const city = searchInput.value.trim();
    if (city) {
      getWeatherData(city);
    }
  }
});