Below is an example README that you should customize and polish before submission:
text

# Weather Forecast Application

## Overview

This project is a Weather Forecast Application built with HTML, JavaScript, and Tailwind CSS. It retrieves real-time weather information and a 5-day forecast for any city, using the WeatherAPI.com service.

## Features

- Search weather by city name or current location.
- Recently searched cities saved in dropdown (max 5).
- Displays temperature, humidity, wind speed, and weather icons.
- Toggle temperature units (°C/°F).
- Alerts for extreme temperatures.
- Dynamic rainy background for rainy weather.
- 5-day forecast with daily temperature, wind, and humidity.
- Responsive design for desktop, tablet, and mobile.

## Setup

1. Clone the repository:

git clone https://github.com/jks-sys/weather-api-at-0001.git
text

2. Add your [WeatherAPI.com](https://www.weatherapi.com/) API key in `script.js`:

const apiKey = "YOUR_API_KEY_HERE";
text

3. Open `index.html` in your browser.

## Usage

- Enter a city name and click 'Search' or press Enter.
- Click 📍 to use your current location (browser permission required).
- Select from the recent cities dropdown to recall previous searches.
- Toggle temperature units using the provided button.

## Notes

- Weather data powered by [WeatherAPI.com](https://www.weatherapi.com/).
- Tailwind CSS loaded via CDN—no npm install or node_modules required.

## File Structure

weather-app/
├── index.html
├── script.js
├── README.md
text

## Author

Your Name
