const apiKey = "3ea6c680a43a4b76829155912250808"; // Your WeatherAPI.com key

// DOM elements
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

let currentTempCelsius = null;
let isCelsius = true;
let recentCities = [];

loadRecentCities();

function loadRecentCities() {
  const stored = localStorage.getItem("recentCities");
  if (stored) {
    recentCities = JSON.parse(stored);
    if (recentCities.length > 0) {
      updateRecentDropdown();
      recentContainer.classList.remove("hidden");
    }
  }
}

function updateRecentDropdown() {
  recentCitiesSelect.innerHTML = "";
  recentCities.forEach((city) => {
    const option = document.createElement("option");
    option.value = city;
    option.textContent = city;
    recentCitiesSelect.appendChild(option);
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
    )}&days=5&aqi=no&alerts=no`;
    const res = await fetch(url);
    const data = await res.json();

    if (res.status !== 200)
      throw new Error(data.error?.message || "City not found");

    displayCurrentWeather(data.location, data.current);
    displayForecast(data.forecast.forecastday);
    addRecentCity(data.location.name);
  } catch (error) {
    showError(error.message);
  }
}

async function fetchWeatherByCoords(lat, lon) {
  clearUI();
  try {
    const q = `${lat},${lon}`;
    const url = `https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${encodeURIComponent(
      q
    )}&days=5&aqi=no&alerts=no`;
    const res = await fetch(url);
    const data = await res.json();

    if (res.status !== 200)
      throw new Error(data.error?.message || "Location not found");

    displayCurrentWeather(data.location, data.current);
    displayForecast(data.forecast.forecastday);
    addRecentCity(data.location.name);
  } catch (error) {
    showError(error.message);
  }
}

function displayCurrentWeather(locationData, currentData) {
  locationElem.textContent = `${locationData.name}, ${locationData.region}, ${locationData.country}`;
  currentTempCelsius = currentData.temp_c;
  isCelsius = true;
  updateTempDisplay();
  humidityElem.textContent = currentData.humidity;
  windElem.textContent = currentData.wind_kph;

  weatherIconElem.src = `https:${currentData.condition.icon}?t=${Date.now()}`;
  weatherIconElem.alt = currentData.condition.text;
  setBackground(currentData.condition.code);

  alertElem.textContent = "";
  if (currentTempCelsius >= 40) {
    alertElem.textContent =
      "⚠️ Extreme Temperature Alert! Stay hydrated and avoid heat exposure.";
  }
}

function updateTempDisplay() {
  if (currentTempCelsius === null) return;
  if (isCelsius) {
    tempElem.textContent = `${currentTempCelsius.toFixed(1)} °C`;
    tempToggleBtn.textContent = "Toggle to °F";
  } else {
    const tempF = currentTempCelsius * 1.8 + 32;
    tempElem.textContent = `${tempF.toFixed(1)} °F`;
    tempToggleBtn.textContent = "Toggle to °C";
  }
}

function setBackground(conditionCode) {
  const rainCodes = [
    1063, 1150, 1153, 1180, 1183, 1186, 1189, 1192, 1195, 1204, 1207, 1240,
    1243, 1246, 1273, 1276, 1279, 1282,
  ];
  if (rainCodes.includes(conditionCode)) {
    bodyElem.classList.replace("bg-gray-900", "bg-blue-900");
  } else {
    bodyElem.classList.replace("bg-blue-900", "bg-gray-900");
  }
}

function displayForecast(forecastDays) {
  forecastElem.innerHTML = "";
  forecastDays.forEach((day, i) => {
    const date = new Date(day.date);
    const dayName = date.toLocaleDateString(undefined, { weekday: "short" });
    const monthDay = date.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    });

    const card = document.createElement("div");
    card.className =
      "forecast-card bg-gray-800 text-white rounded shadow p-3 flex flex-col items-center text-center";
    card.innerHTML = `
      <div class="font-semibold">${dayName}</div>
      <div class="text-xs text-gray-300">${monthDay}</div>
      <img src="https:${day.day.condition.icon}?t=${Date.now()}" alt="${
      day.day.condition.text
    }" class="w-12 h-12 my-2" />
      <div class="mt-1 text-sm">
        <div>🌡️ ${day.day.avgtemp_c.toFixed(1)} °C</div>
        <div>💨 ${day.day.maxwind_kph} kph</div>
        <div>💧 ${day.day.avghumidity}%</div>
      </div>
    `;
    forecastElem.appendChild(card);
    setTimeout(() => card.classList.add("show"), 50 * (i + 1));
  });
}

function showError(message) {
  errorMessageElem.textContent = message;
  clearUI();
}

function clearUI() {
  locationElem.textContent = "";
  tempElem.textContent = "";
  humidityElem.textContent = "";
  windElem.textContent = "";
  weatherIconElem.src = "";
  forecastElem.innerHTML = "";
  alertElem.textContent = "";
  currentTempCelsius = null;
}

// Event Listeners
searchBtn.addEventListener("click", () => {
  const city = cityInput.value;
  if (!city.trim()) return showError("Please enter a city name.");
  fetchWeather(city);
});
cityInput.addEventListener("keyup", (e) => {
  if (e.key === "Enter") searchBtn.click();
});
currentLocationBtn.addEventListener("click", () => {
  if (!navigator.geolocation) return showError("Geolocation not supported.");
  navigator.geolocation.getCurrentPosition(
    (pos) => fetchWeatherByCoords(pos.coords.latitude, pos.coords.longitude),
    (err) => showError("Unable to retrieve location.")
  );
});
tempToggleBtn.addEventListener("click", () => {
  if (currentTempCelsius === null) return;
  isCelsius = !isCelsius;
  updateTempDisplay();
});
recentCitiesSelect.addEventListener("change", () => {
  if (recentCitiesSelect.value) fetchWeather(recentCitiesSelect.value);
});

// Autocomplete
cityInput.addEventListener("input", async () => {
  const query = cityInput.value.trim();
  if (query.length < 2) {
    suggestionsElem.innerHTML = "";
    suggestionsElem.classList.add("hidden");
    return;
  }
  try {
    const url = `https://api.weatherapi.com/v1/search.json?key=${apiKey}&q=${encodeURIComponent(
      query
    )}`;
    const res = await fetch(url);
    const cities = await res.json();
    if (!Array.isArray(cities) || cities.length === 0) {
      suggestionsElem.innerHTML =
        "<li class='p-2 text-gray-500'>No results</li>";
      suggestionsElem.classList.remove("hidden");
      return;
    }
    suggestionsElem.innerHTML = "";
    cities.forEach((city) => {
      const li = document.createElement("li");
      li.textContent = `${city.name}, ${city.region}, ${city.country}`;
      li.className = "p-2 hover:bg-gray-100 cursor-pointer";
      li.addEventListener("click", () => {
        cityInput.value = city.name;
        suggestionsElem.classList.add("hidden");
        fetchWeather(city.name);
      });
      suggestionsElem.appendChild(li);
    });
    suggestionsElem.classList.remove("hidden");
  } catch (err) {
    console.error(err);
  }
});
document.addEventListener("click", (e) => {
  if (!suggestionsElem.contains(e.target) && e.target !== cityInput) {
    suggestionsElem.classList.add("hidden");
  }
});
