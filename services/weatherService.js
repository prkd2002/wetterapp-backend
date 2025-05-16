const axios = require('axios');
const config = require('config');
const logger = require('../utils/logger');


class WeatherService {

    constructor() {
        this.apiKey = config.get('weather.openWeatherMap.apiKey')
        this.baseUrl = config.get('weather.openWeatherMap.baseUrl');
    }


    async getWeatherByCity(city) {
        try {
            const response = await axios.get(this.baseUrl, {
                params: {
                    q: city,
                    appid: this.apiKey,
                    units: 'metric'
                }
            });

            logger.info(`Successfully fetched weather data for ${city}`);

            // Transform data to our format
            const weatherData = {
                location: city,
                timestamp: new Date().toISOString(),
                temperature: response.data.main.temp,
                humidity: response.data.main.humidity,
                pressure: response.data.main.pressure,
                wind_speed: response.data.wind.speed,
                wind_direction: response.data.wind.deg,
                weather_condition: response.data.weather[0].main,
                weather_description: response.data.weather[0].description,
                icon: response.data.weather[0].icon,
            };

            logger.info(`"Weather: "${JSON.stringify(weatherData)}`);
            logger.info(`"WeatherTemp"${response.data.main.temp}`);

            return weatherData;

        } catch (error) {
            logger.error(`Failed to fetch weather fo ${city}: ${error.message}`);
            throw error;
        }
    }

    async getWeatherByCoordinates(lat, lon) {
        try {
            const response = await axios.get(this.baseUrl, {
                params: {
                    lat,
                    lon,
                    appid: this.apiKey,
                    units: 'metric'
                }
            });

            logger.info(`Successfulyy fetched weather data for coordinated  [${lat}, ${lon}]`);

            // Transform data to our format
            const locationName = response.data.name || `Lat:${lat}, Lon:${lon}`;
            const weatherData = {
                location: locationName,
                timestamp: new Date().toISOString(),
                coordinates: {
                    lat,
                    lon
                },
                temperature: response.data.main.temp,
                humidity: response.data.main.humidity,
                pressure: response.data.main.pressure,
                wind_spped: response.data.wind.speed,
                wind_direction: response.data.wind.deg,
                weather_condition: response.data.weather[0].main,
                weather_description: response.data.weather[0].description,
                icon: response.data.weatehr[0].icon
            };
            return weatherData;
        } catch (error) {
            logger.error(`Failed to fetch weather for coordinates  [${lat}, ${lon}]: ${error.message}`);
            throw error;
        }
    }
}

const weatherService = new WeatherService();
module.exports = weatherService;