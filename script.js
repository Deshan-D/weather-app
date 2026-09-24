
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

searchBtn.addEventListener('click', () => {
  const city = searchInput.value.trim();
  
  if (city) {
    console.log("Searching weather for:", city);
    alert(city + " සඳහා කාලගුණය සෙවීම ආරම්භ වේ...");
    
  } else {
    alert("කරුණාකර නගරයක නමක් ඇතුළත් කරන්න!");
  }
});