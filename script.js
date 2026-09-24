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

    const weatherResponse = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`);
    const weatherData = await weatherResponse.json();

    const currentTemp = weatherData.current_weather.temperature;

    document.getElementById('current-temp').innerText = `${Math.round(currentTemp)}°`;

  } catch (error) {
    console.error("Error fetching data:", error);
    alert("අන්තර්ජාල සම්බන්ධතාවයේ හෝ සර්වර් එකේ ගැටලුවක් ඇත.");
  }
}

searchBtn.addEventListener('click', () => {
  const city = searchInput.value.trim();
  if (city) {
    getWeatherData(city);
  } else {
    alert("කරුණාකර නගරයක නමක් ඇතුළත් කරන්න!");
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