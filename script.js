const apiKey = "3ea6c680a43a4b76829155912250808"; // Replace with your WeatherAPI.com key

// DOM
const cityInput = document.getElementById("city-input");
const searchBtn = document.getElementById("search-btn");
const currentLocationBtn = document.getElementById("current-location-btn");
const locationElem = document.getElementById("location");
const tempElem = document.getElementById("temp");
const humidityElem = document.getElementById("humidity");
const windElem = document.getElementById("wind");
const weatherIconElem = document.getElementById("weather-icon");
const tempToggleBtn = document.getElementById("temp-toggle");
const alertElem = document.getElementById("alert");
const forecastElem = document.getElementById("forecast");
const errorMessageElem = document.getElementById("error-message");
const recentContainer = document.getElementById("recent-container");
const recentCitiesSelect = document.getElementById("recent-cities");
const bodyElem = document.getElementById("body");
const suggestionsElem = document.getElementById("suggestions");

// Modal DOM refs
const modal = document.getElementById("weather-modal");
const closeModal = document.getElementById("close-modal");
const modalTitle = document.getElementById("modal-title");
const modalIcon = document.getElementById("modal-icon");
const modalCondition = document.getElementById("modal-condition");
const modalExtra = document.getElementById("modal-extra");

// Show Modal Function
function showModal(title, icon, condition, extras = []) {
  modalTitle.textContent = title;
  modalIcon.src = icon;
  modalCondition.textContent = condition;
  modalExtra.innerHTML = extras.map((e) => `<div>${e}</div>`).join("");
  modal.classList.remove("hidden");
}

// Close Modal
closeModal.onclick = () => modal.classList.add("hidden");
modal.onclick = (e) => {
  if (e.target === modal) modal.classList.add("hidden");
};

// Click on Current Weather for popup
document.getElementById("current-weather").addEventListener("click", () => {
  if (!currentTempCelsius) return; // no data yet
  showModal(
    locationElem.textContent,
    weatherIconElem.src,
    `Temp: ${tempElem.textContent}`,
    [
      `Humidity: ${humidityElem.textContent}%`,
      `Wind: ${windElem.textContent} kph`,
    ]
  );
});

let currentTempCelsius = null;
let isCelsius = true;
let recentCities = [];

// Load recent cities
(function loadRecentCities() {
  const stored = localStorage.getItem("recentCities");
  if (stored) {
    recentCities = JSON.parse(stored);
    if (recentCities.length > 0) {
      updateRecentDropdown();
      recentContainer.classList.remove("hidden");
    }
  }
})();

function updateRecentDropdown() {
  recentCitiesSelect.innerHTML = "";
  const placeholder = document.createElement("option");
  placeholder.value = "";
  placeholder.textContent = "Select a recent city";
  placeholder.disabled = true;
  placeholder.selected = true;
  recentCitiesSelect.appendChild(placeholder);

  recentCities.forEach((city) => {
    const opt = document.createElement("option");
    opt.value = city;
    opt.textContent = city;
    recentCitiesSelect.appendChild(opt);
  });
}

function addRecentCity(city) {
  city = city.trim();
  if (!city) return;
  recentCities = recentCities.filter(
    (c) => c.toLowerCase() !== city.toLowerCase()
  );
  recentCities.unshift(city);
  if (recentCities.length > 5) recentCities.pop();
  localStorage.setItem("recentCities", JSON.stringify(recentCities));
  updateRecentDropdown();
  recentContainer.classList.remove("hidden");
}

async function fetchWeather(city) {
  clearUI();
  try {
    const url = `https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${encodeURIComponent(
      city
    )}&days=7&aqi=no&alerts=no`;
    const res = await fetch(url);
    const data = await res.json();
    if (res.status !== 200)
      throw new Error(data.error?.message || "City not found");
    displayCurrentWeather(data.location, data.current);
    displayForecast(data.forecast.forecastday);
    addRecentCity(data.location.name);
  } catch (err) {
    showError(err.message);
  }
}

async function fetchWeatherByCoords(lat, lon) {
  clearUI();
  try {
    const url = `https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${lat},${lon}&days=7&aqi=no&alerts=no`;
    const res = await fetch(url);
    const data = await res.json();
    if (res.status !== 200)
      throw new Error(data.error?.message || "Location not found");
    displayCurrentWeather(data.location, data.current);
    displayForecast(data.forecast.forecastday);
    addRecentCity(data.location.name);
  } catch (err) {
    showError(err.message);
  }
}

function displayCurrentWeather(loc, cur) {
  locationElem.textContent = `${loc.name}, ${loc.region}, ${loc.country}`;
  currentTempCelsius = cur.temp_c;
  isCelsius = true;
  updateTempDisplay();
  humidityElem.textContent = cur.humidity;
  windElem.textContent = cur.wind_kph;
  weatherIconElem.src = `https:${cur.condition.icon}?t=${Date.now()}`;
  weatherIconElem.alt = cur.condition.text;
  setBackground(cur.condition.code);
  alertElem.textContent =
    currentTempCelsius >= 40 ? "⚠️ Extreme Temperature Alert!" : "";
}

function updateTempDisplay() {
  if (isCelsius) {
    tempElem.textContent = `${currentTempCelsius.toFixed(1)} °C`;
    tempToggleBtn.textContent = "Toggle to °F";
  } else {
    const tempF = currentTempCelsius * 1.8 + 32;
    tempElem.textContent = `${tempF.toFixed(1)} °F`;
    tempToggleBtn.textContent = "Toggle to °C";
  }
}

function setBackground(code) {
  const rainCodes = [
    1063, 1150, 1153, 1180, 1183, 1186, 1189, 1192, 1195, 1204, 1207, 1240,
    1243, 1246, 1273, 1276, 1279, 1282,
  ];
  if (rainCodes.includes(code)) {
    bodyElem.classList.replace("bg-gray-900", "bg-blue-900");
  } else {
    bodyElem.classList.replace("bg-blue-900", "bg-gray-900");
  }
}

function displayForecast(days) {
  forecastElem.innerHTML = "";
  days.forEach((day, i) => {
    const date = new Date(day.date);
    const dayName = date.toLocaleDateString(undefined, { weekday: "short" });
    const monthDay = date.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    });
    const card = document.createElement("div");
    card.className =
      "forecast-card bg-gray-800 text-white rounded shadow p-3 flex flex-col items-center text-center hover:scale-105 hover:shadow-xl transition-transform duration-300";
    card.innerHTML = `
      <div class="font-semibold">${dayName}</div>
      <div class="text-xs text-gray-300">${monthDay}</div>
      <img src="https:${day.day.condition.icon}?t=${Date.now()}" alt="${
      day.day.condition.text
    }" class="w-12 h-12 my-2 animate-pulse" />
      <div class="mt-1 text-sm">
        <div>🌡️ ${day.day.avgtemp_c.toFixed(1)} °C</div>
        <div>💨 ${day.day.maxwind_kph} kph</div>
        <div>💧 ${day.day.avghumidity}%</div>
      </div>
    `;
    // Popup click for forecast
    card.addEventListener("click", () => {
      showModal(
        `${dayName}, ${monthDay}`,
        `https:${day.day.condition.icon}`,
        day.day.condition.text,
        [
          `Avg Temp: ${day.day.avgtemp_c.toFixed(1)} °C`,
          `Max Temp: ${day.day.maxtemp_c.toFixed(1)} °C`,
          `Min Temp: ${day.day.mintemp_c.toFixed(1)} °C`,
          `Wind: ${day.day.maxwind_kph} kph`,
          `Humidity: ${day.day.avghumidity}%`,
        ]
      );
    });

    forecastElem.appendChild(card);
    setTimeout(() => card.classList.add("show"), 50 * (i + 1));
  });
}

function showError(msg) {
  errorMessageElem.textContent = msg;
  clearUI();
}

function clearUI() {
  locationElem.textContent =
    tempElem.textContent =
    humidityElem.textContent =
    windElem.textContent =
      "";
  weatherIconElem.src = "";
  forecastElem.innerHTML = "";
  alertElem.textContent = "";
}

// Events
searchBtn.onclick = () => {
  if (cityInput.value.trim()) fetchWeather(cityInput.value);
  else showError("Please enter a city name.");
};
cityInput.addEventListener("keyup", (e) => {
  if (e.key === "Enter") searchBtn.click();
});
currentLocationBtn.onclick = () => {
  if (!navigator.geolocation) return showError("Geolocation not supported.");
  navigator.geolocation.getCurrentPosition(
    (pos) => fetchWeatherByCoords(pos.coords.latitude, pos.coords.longitude),
    () => showError("Unable to get location.")
  );
};
tempToggleBtn.onclick = () => {
  if (currentTempCelsius) {
    isCelsius = !isCelsius;
    updateTempDisplay();
  }
};

// Fix: Works even if only one recent city
recentCitiesSelect.onchange = () => {
  if (recentCitiesSelect.value) fetchWeather(recentCitiesSelect.value);
};
recentCitiesSelect.onclick = () => {
  if (recentCitiesSelect.value) fetchWeather(recentCitiesSelect.value);
};

// Autocomplete (prefix filter)
cityInput.addEventListener("input", async () => {
  const query = cityInput.value.trim().toLowerCase();
  if (query.length < 2) {
    suggestionsElem.innerHTML = "";
    suggestionsElem.classList.add("hidden");
    return;
  }
  try {
    const res = await fetch(
      `https://api.weatherapi.com/v1/search.json?key=${apiKey}&q=${encodeURIComponent(
        query
      )}`
    );
    const cities = await res.json();
    if (!Array.isArray(cities) || cities.length === 0) {
      suggestionsElem.innerHTML =
        "<li class='p-2 text-gray-500'>No results</li>";
      suggestionsElem.classList.remove("hidden");
      return;
    }
    const filtered = cities.filter((c) =>
      c.name.toLowerCase().startsWith(query)
    );
    const finalList = filtered.length ? filtered : cities;
    suggestionsElem.innerHTML = "";
    finalList.forEach((city) => {
      const li = document.createElement("li");
      li.textContent = `${city.name}, ${city.region}, ${city.country}`;
      li.className = "p-2 hover:bg-gray-100 cursor-pointer";
      li.onclick = () => {
        cityInput.value = city.name;
        suggestionsElem.classList.add("hidden");
        fetchWeather(city.name);
      };
      suggestionsElem.appendChild(li);
    });
    suggestionsElem.classList.remove("hidden");
  } catch (err) {
    console.error(err);
  }
});
document.addEventListener("click", (e) => {
  if (!suggestionsElem.contains(e.target) && e.target !== cityInput)
    suggestionsElem.classList.add("hidden");
});
