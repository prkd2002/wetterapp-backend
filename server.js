const express = require('express');
const cors = require('cors');
const config = require('config');
const logger = require('./utils/logger');
const collectorController = require('./controllers/collectorController');
const weatherController = require('./controllers/weatherController');

// Initialize Express app
const app = express();
const port = config.get('server.port') || 3000;
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');


//Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Logging middleware
app.use((req, res, next) => {
    logger.info(`${req.method} ${req.url}`);
    next();
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'ok' });
});

// Collector API Routes
app.get('/api/collectors', collectorController.getAllCollectors);
app.get('/api/collectors/:id', collectorController.getCollectorStatus);
app.post('/api/collectors', collectorController.createCollector);
app.put('/api/collectors/:id', collectorController.updateCollector);
app.delete('/api/collectors/:id', collectorController.deleteCollector);
app.post('/api/collectors/:id/start', collectorController.startCollector);
app.post('/api/collectors/:id/stop', collectorController.stopCollector);


// Weather Data API Routes
app.get('/api/weather', weatherController.getWeatherData);
app.get('/api/weather/location/:location', weatherController.getLatestWeatherByLocation);
app.get('/api/weather/collector/:id', weatherController.getWeatherByCollectorId);
app.get('/api/weather/current/:location', weatherController.fetchCurrentWeather);

// Error handling middleare
app.use((err, req, res, next) => {
    logger.error(`Error: ${err.message}`);
    res.status(500).json({ error: err.message });
});


// 404 handler
app.use((req, res) => {
    logger.warn(`404: ${req.method} ${req.url}`);
    res.status(404).json({ error: 'Not found' });
});


// Start the server
app.listen(port, () => {
    logger.info(`Server listening on port ${port}`);
});
