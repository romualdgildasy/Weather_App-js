const API_KEY = "7323146f1b783ca4b54b9d886810e027"; // ta clé

// Éléments DOM
const cityInput = document.getElementById("cityInput");
const searchBtn = document.getElementById("searchBtn");
const geoBtn = document.getElementById("geoBtn");
const loader = document.getElementById("loader");
const errorBox = document.getElementById("error");
const errorText = document.getElementById("errorText");
const weatherContent = document.getElementById("weatherContent");
const historyContainer = document.getElementById("history");

const weatherIcon = document.getElementById("weatherIcon");
const temperature = document.getElementById("temperature");
const description = document.getElementById("description");
const cityName = document.getElementById("cityName");
const feelsLike = document.getElementById("feelsLike");
const humidity = document.getElementById("humidity");
const wind = document.getElementById("wind");
const sun = document.getElementById("sun");
const forecastContainer = document.getElementById("forecast");

// ========== HISTORIQUE (LocalStorage) ==========
function getHistory() {
  return JSON.parse(localStorage.getItem("weatherHistory") || "[]");
}

function saveToHistory(city) {
  let history = getHistory().filter(c => c.toLowerCase() !== city.toLowerCase());
  history.unshift(city);
  history = history.slice(0, 5); // max 5
  localStorage.setItem("weatherHistory", JSON.stringify(history));
  renderHistory();
}

function removeFromHistory(city) {
  let history = getHistory().filter(c => c.toLowerCase() !== city.toLowerCase());
  localStorage.setItem("weatherHistory", JSON.stringify(history));
  renderHistory();
}

function renderHistory() {
  const history = getHistory();
  historyContainer.innerHTML = history.map(city => 
    `<div class="history-chip flex items-center gap-1.5 text-xs bg-white/70 text-slate-600 px-3 py-1.5 rounded-full border border-slate-200">
      <span class="city-name cursor-pointer hover:text-sky-600">${city}</span>
      <button class="remove-city text-slate-400 hover:text-red-500 transition text-sm leading-none" data-city="${city}" title="Supprimer">
        ×
      </button>
    </div>`
  ).join("");

  // Clic sur le nom de la ville → relancer la recherche
  historyContainer.querySelectorAll(".city-name").forEach(span => {
    span.addEventListener("click", () => {
      const city = span.textContent.trim();
      cityInput.value = city;
      getWeatherByCity(city);
    });
  });

  // Clic sur la croix → supprimer la ville
  historyContainer.querySelectorAll(".remove-city").forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation(); // pour ne pas déclencher la recherche
      const cityToRemove = btn.dataset.city;
      removeFromHistory(cityToRemove);
    });
  });
}

// ========== ICÔNES (utilise ton dossier images) ==========
function getIcon(id) {
  if (id === 800) return "images/day-1.svg";
  if (id >= 200 && id < 300) return "images/th.svg";      // orage
  if (id >= 300 && id < 500) return "images/drizzle.svg"; // bruine
  if (id >= 500 && id < 600) return "images/rain.svg";    // pluie
  if (id >= 600 && id < 700) return "images/snow.svg";    // neige
  if (id >= 700 && id < 800) return "images/mist.svg";    // brouillard
  if (id > 800) return "images/clouds.svg";               // nuageux
  return "images/day-1.svg";
}

// ========== AFFICHAGE ==========
function showLoader(show) {
  loader.classList.toggle("hidden", !show);
  weatherContent.classList.add("hidden");
  errorBox.classList.add("hidden");
}

function showError(msg) {
  loader.classList.add("hidden");
  weatherContent.classList.add("hidden");
  errorBox.classList.remove("hidden");
  errorText.textContent = msg;
}

function formatTime(unix, timezone) {
  return new Date((unix + timezone) * 1000).toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "UTC"
  });
}

function displayWeather(data) {
  const { main, weather, wind: w, sys, name, timezone } = data;
  const id = weather[0].id;

  weatherIcon.src = getIcon(id);
  temperature.textContent = `${Math.round(main.temp)}°`;
  description.textContent = weather[0].description;
  cityName.textContent = `${name}, ${sys.country}`;
  feelsLike.textContent = `${Math.round(main.feels_like)}°`;
  humidity.textContent = `${main.humidity}%`;
  wind.textContent = `${Math.round(w.speed * 3.6)} km/h`;
  sun.textContent = `${formatTime(sys.sunrise, timezone)} / ${formatTime(sys.sunset, timezone)}`;

  // Changer le fond selon la météo
  const body = document.body;
  if (id === 800) {
    body.className = "min-h-screen bg-gradient-to-br from-sky-300 to-blue-500 flex items-center justify-center p-4";
  } else if (id >= 500 && id < 600) {
    body.className = "min-h-screen bg-gradient-to-br from-slate-500 to-slate-700 flex items-center justify-center p-4";
  } else if (id >= 600 && id < 700) {
    body.className = "min-h-screen bg-gradient-to-br from-slate-300 to-blue-200 flex items-center justify-center p-4";
  } else if (id >= 200 && id < 300) {
    body.className = "min-h-screen bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center p-4";
  } else {
    body.className = "min-h-screen bg-gradient-to-br from-sky-400 to-indigo-500 flex items-center justify-center p-4";
  }

  loader.classList.add("hidden");
  errorBox.classList.add("hidden");
  weatherContent.classList.remove("hidden");
  weatherContent.classList.add("fade-in");
}

// ========== PRÉVISIONS 5 JOURS ==========
async function getForecast(lat, lon) {
  const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric&lang=fr`;
  const res = await fetch(url);
  const data = await res.json();

  // On prend un point par jour (vers midi)
  const daily = {};
  data.list.forEach(item => {
    const date = item.dt_txt.split(" ")[0];
    if (!daily[date] && item.dt_txt.includes("12:00:00")) {
      daily[date] = item;
    }
  });

  // Si pas de 12h, on prend le premier de la journée
  data.list.forEach(item => {
    const date = item.dt_txt.split(" ")[0];
    if (!daily[date]) daily[date] = item;
  });

  const days = Object.values(daily).slice(0, 5);

  forecastContainer.innerHTML = days.map(day => {
    const date = new Date(day.dt * 1000);
    const dayName = date.toLocaleDateString("fr-FR", { weekday: "short" });
    const icon = getIcon(day.weather[0].id);

    return `
      <div class="flex-shrink-0 w-20 bg-white/60 rounded-2xl p-3 text-center">
        <p class="text-xs text-slate-500 font-medium mb-1">${dayName}</p>
        <img src="${icon}" alt="" class="w-10 h-10 mx-auto mb-1" />
        <p class="text-sm font-semibold text-slate-800">${Math.round(day.main.temp)}°</p>
      </div>
    `;
  }).join("");
}

// ========== APPELS API ==========
async function getWeatherByCity(city) {
  if (!city.trim()) return;

  showLoader(true);

  try {
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric&lang=fr`;
    const res = await fetch(url);
    const data = await res.json();

    if (data.cod === "404" || data.cod === 404) {
      showError("Ville introuvable. Vérifie l'orthographe.");
      return;
    }
    if (data.cod !== 200) {
      showError("Erreur lors de la récupération des données.");
      return;
    }

    displayWeather(data);
    saveToHistory(data.name);
    await getForecast(data.coord.lat, data.coord.lon);

  } catch (err) {
    showError("Problème de connexion. Réessaie plus tard.");
  }
}

async function getWeatherByCoords(lat, lon) {
  showLoader(true);

  try {
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric&lang=fr`;
    const res = await fetch(url);
    const data = await res.json();

    displayWeather(data);
    saveToHistory(data.name);
    await getForecast(lat, lon);

  } catch (err) {
    showError("Impossible de récupérer ta position.");
  }
}

// ========== ÉVÉNEMENTS ==========
searchBtn.addEventListener("click", () => getWeatherByCity(cityInput.value));
cityInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") getWeatherByCity(cityInput.value);
});

geoBtn.addEventListener("click", () => {
  if (!navigator.geolocation) {
    showError("La géolocalisation n'est pas supportée.");
    return;
  }
  navigator.geolocation.getCurrentPosition(
    (pos) => getWeatherByCoords(pos.coords.latitude, pos.coords.longitude),
    () => showError("Autorise la localisation dans ton navigateur.")
  );
});

// Au chargement
renderHistory();

// Optionnel : charger une ville par défaut
// getWeatherByCity("Paris");