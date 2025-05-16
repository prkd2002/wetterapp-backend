const weatherService = require('../services/weatherService');
const pocketbaseService = require('../services/pocketbaseService');
const logger = require('../utils/logger');


// Get weather data with optional filters
exports.getWeatherData = async (req, res) => {
    try {
        const filters = req.query;
        const weatherData = await pocketbaseService.getWeatherData(filters);
        res.status(200).json(weatherData);
    } catch (error) {
        logger.error(`Error getting weather data: ${error.message} `);
        res.status(500).json({ error: 'Failed to get weather data' });
    }
};


// Get latest weather data for a specific location
exports.getLatestWeatherByLocation = async (req, res) => {
    try {
        const { location } = req.params;

        // Geth the latest data from PocketBase
        const filters = { location };
        const weatherData = await pocketbaseService.getWeatherData(filters);

        if (!weatherData || weatherData.length === 0) {
            return res.status(204).json({ error: 'No weather data found for this location' });
        }

        // Return the latest data (first in the sorted array)
        res.status(200).json(weatherData[0]);
    } catch (error) {
        logger.error(`Error getting latest weather for location ${req.params.location}: ${error.message}`);
        res.status(500).json({ error: 'Failed to get latest weather data' });
    }
};



// Get weather data for a specific collector
exports.getWeatherByCollectorId = async (req, res) => {
    try {
        const { id } = req.params;

        // We would need a special method un PocketBase service for this query
        // For now, let's implement a simple filter after fetching all data
        const allData = await pocketbaseService.getWeatherData();
        const collectorData = allData.filter(data => data.collector_id === id);

        res.status(200).json(collectorData);
    } catch (error) {
        logger.error(`Error getting weather for collector ${req.params.id}: ${error.message}`);
        res.status(500).json({ error: ' Failed to get collector weather data' });
    }
};


// Fetch latest weather data from external API without saving
exports.fetchCurrentWeather = async (req, res) => {
    try {
        const { location } = req.params;
        let weatherData;

        // Check if we need to use coordinates or city name
        if (req.query.lat && req.query.lon) {
            weatherData = await weatherService.getWeatherByCoordinates(
                parseFloat(req.query.lat),
                parseFloat(req.query.lon)
            );
        } else {
            weatherData = await weatherService.getWeatherByCity(location);
        }

        res.status(200).json(weatherData);
    } catch (error) {
        logger.error(`Error fetchung current ewther for ${req.params.location}: ${error.message}`);
        res.status(500).json({ error: 'Failed to fetch currentr weather data' });
    }
};

