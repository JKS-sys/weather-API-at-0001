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

let currentTempCelsius = null;
let isCelsius = true;
let recentCities = [];

// Load recent cities from localStorage on page load
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
  // Avoid duplicates, keep max 5 cities
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
  errorMessageElem.textContent = "";
  alertElem.textContent = "";
  try {
    const url = `https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${encodeURIComponent(
      city
    )}&days=5&aqi=no&alerts=no`;

    const res = await fetch(url);
    const data = await res.json();

    if (res.status !== 200) {
      throw new Error(data.error ? data.error.message : "City not found");
    }

    displayCurrentWeather(data.location, data.current);
    displayForecast(data.forecast.forecastday);
    addRecentCity(data.location.name);
  } catch (error) {
    showError(error.message);
  }
}

async function fetchWeatherByCoords(lat, lon) {
  clearUI();
  errorMessageElem.textContent = "";
  alertElem.textContent = "";
  try {
    const q = `${lat},${lon}`;
    const url = `https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${encodeURIComponent(
      q
    )}&days=5&aqi=no&alerts=no`;

    const res = await fetch(url);
    const data = await res.json();

    if (res.status !== 200) {
      throw new Error(data.error ? data.error.message : "Location not found");
    }

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

  weatherIconElem.src = `https:${currentData.condition.icon}`;
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
  // Rain/thunderstorm codes (from WeatherAPI)
  const rainCodes = [
    1063, 1150, 1153, 1180, 1183, 1186, 1189, 1192, 1195, 1204, 1207, 1240,
    1243, 1246, 1273, 1276, 1279, 1282,
  ];
  if (rainCodes.includes(conditionCode)) {
    bodyElem.classList.remove("bg-blue-100");
    bodyElem.classList.add("bg-blue-700");
  } else {
    bodyElem.classList.remove("bg-blue-700");
    bodyElem.classList.add("bg-blue-100");
  }
}

function displayForecast(forecastDays) {
  forecastElem.innerHTML = "";

  forecastDays.forEach((day) => {
    const date = new Date(day.date);
    const dayName = date.toLocaleDateString(undefined, { weekday: "short" });
    const monthDay = date.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    });

    const card = document.createElement("div");
    card.classList.add(
      "bg-white",
      "rounded",
      "shadow",
      "p-2",
      "flex",
      "flex-col",
      "items-center",
      "text-center"
    );

    card.innerHTML = `
      <div class="font-semibold">${dayName}</div>
      <div class="text-xs text-gray-500">${monthDay}</div>
      <img src="https:${day.day.condition.icon}" alt="${
      day.day.condition.text
    }" class="w-12 h-12 my-1" />
      <div class="mt-1">
        <div>🌡️ ${day.day.avgtemp_c.toFixed(1)} °C</div>
        <div>💨 ${day.day.maxwind_kph} kph</div>
        <div>💧 ${day.day.avghumidity}%</div>
      </div>
    `;
    forecastElem.appendChild(card);
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
  weatherIconElem.alt = "";
  forecastElem.innerHTML = "";
  alertElem.textContent = "";
  currentTempCelsius = null;
}

// Event Listeners

searchBtn.addEventListener("click", () => {
  const city = cityInput.value;
  if (!city.trim()) {
    showError("Please enter a city name.");
    return;
  }
  fetchWeather(city);
});

cityInput.addEventListener("keyup", (e) => {
  if (e.key === "Enter") {
    searchBtn.click();
  }
});

currentLocationBtn.addEventListener("click", () => {
  if (!navigator.geolocation) {
    showError("Geolocation is not supported by your browser.");
    return;
  }
  navigator.geolocation.getCurrentPosition(
    (position) => {
      fetchWeatherByCoords(position.coords.latitude, position.coords.longitude);
    },
    (error) => {
      switch (error.code) {
        case error.PERMISSION_DENIED:
          showError("Permission denied for location access.");
          break;
        case error.POSITION_UNAVAILABLE:
          showError("Location information is unavailable.");
          break;
        case error.TIMEOUT:
          showError("Location request timed out.");
          break;
        default:
          showError("Unable to retrieve your location.");
      }
    }
  );
});

tempToggleBtn.addEventListener("click", () => {
  if (currentTempCelsius === null) return;
  isCelsius = !isCelsius;
  updateTempDisplay();
});

recentCitiesSelect.addEventListener("change", () => {
  const city = recentCitiesSelect.value;
  if (city) {
    fetchWeather(city);
  }
});
