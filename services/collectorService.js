const { v4: uuidv4 } = require('uuid');
const cron = require('node-cron');
const logger = require('../utils/logger');
const weatherService = require('./weatherService');
const pocketbaseService = require('./pocketbaseService');
const config = require('config');
const { timeStamp } = require('console');


class CollectorService {

    constructor() {
        this.collectors = new Map();
        this.defaultInterval = config.get('weather.defaultIntervall');
        this.loadCollectors();
    }


    async loadCollectors() {
        try {
            const configs = await pocketbaseService.getCollectorConfigs();

            for (const cfg of configs) {
                if (cfg.active) {
                    this.startCollector(cfg);
                }
            }

            logger.info(`Loaded ${configs.length} collector configurations`);
        } catch (error) {
            logger.error(`Failed to laod collectors: ${error.message}`);
        }
    }

    async startCollector(collectorConfig) {
        // If already running, stop it first
        if (this.collectors.has(collectorConfig.id)) {
            this.stopCollector(collectorConfig.id);
        }

        // Define the task to be executed
        const task = async () => {
            try {
                let weatherData;
                if (collectorConfig.locationType == 'city') {
                    weatherData = await weatherService.getWeatherByCity(collectorConfig.location);
                    logger.info(`"CollectorService: "${JSON.stringify(weatherData)}`)
                } else if (collectorConfig.locationType === 'coordinates') {
                    const { lat, lon } = collectorConfig.coordinates;
                    weatherData = await weatherService.getWeatherByCoordinates(lat, lon);
                }

                // Store only the attributes specified in the config, if any
                if (collectorConfig.attributes && collectorConfig.attributes.length > 0) {
                    const filteredData = {
                        location: weatherData.location,
                        timestamp: weatherData.timestamp
                    };

                    for (const attr of collectorConfig.attributes) {
                        if (weatherData[attr] !== undefined) {
                            filteredData[attr] = weatherData[attr];
                        }
                    }

                    weatherData = filteredData;
                    logger.info(`"CollectorService2: "${JSON.stringify(weatherData)}`)

                }

                // Add collector ID to link the data
                weatherData.collector_id = collectorConfig.id;

                // Store in PocketBase
                await pocketbaseService.createWeatherData(weatherData);

                logger.info(`Collected weather data for ${collectorConfig.location}`);
            } catch (error) {
                logger.error(`Error collecting weather data for ${collectorConfig.location}: ${error.message}`);
            }
        };

        // Set up cron job or interval
        let job;
        const interval = collectorConfig.interval || this.defaultInterval;

        if (collectorConfig.cronExpression) {
            //Use cron expression if provided
            job = cron.schedule(collectorConfig.cronExpression, task);
            logger.info(`Started collector for ${collectorConfig.location} with cron: ${collectorConfig.cronExpression}`);

        } else {
            // Use interval in milliseconds
            const intervalId = setInterval(task, interval);
            job = { intervalId, stop: () => clearInterval(intervalId) };
            logger.info(`Started collector for ${collectorConfig.location} with interval: ${interval}ms`);
        }

        // Run the task immedaitely for the first time
        task();

        // Store the job reference
        this.collectors.set(collectorConfig.id, {
            job,
            config: collectorConfig
        });

        return {
            id: collectorConfig.id,
            location: collectorConfig.location,
            status: 'running'
        };

    }


    stopCollector(collectorId) {
        const collector = this.collectors.get(collectorId);

        if (!collector) {
            logger.warn(`No collector found with ID: ${collectorId}`);
            return false;
        }

        // STop the job
        if (collector.job) {
            if (collector.job.stop) {
                collector.job.stop();
            } else if (collector.job.intervalId) {
                clearInterval(collector.job.intervalId);
            }
        }

        // Remove from the map
        this.collectors.delete(collectorId);

        logger.info(`Stopped collector for ${collector.config.location} (ID: ${collectorId})`);
        return true;
    }


    async createCollector(collectorConfig) {
        try {
            // Add default values if not provided
            const config = {
                "active": true,
                "created": new Date().toISOString(),
                "interval": this.defaultInterval,
                ...collectorConfig
            };
         
            //logger.info(`Config: ${JSON.stringify(config,null,2)}`);
            // Save to PocketBase
            const savedConfig = await pocketbaseService.createCollectorConfig(config);
    

            // Start the collector if active
            if (savedConfig.active) {
                await this.startCollector(savedConfig);
            }

            logger.info(`Created new collector for ${savedConfig.location} (ID: ${savedConfig.id})`);

            return savedConfig;
        } catch (error) {
            logger.error(`Service: Failed to create collector: ${error.message}`);
            throw error;
        }
    }


    async updateCollector(id, updates) {
        try {
            // Get the current Config
            const currentConfig = await pocketbaseService.getCollectorConfigById(id);

            // Update in PocketBase
            const updateConfig = await pocketbaseService.updateCollectorConfig(id, updates);

            // If active status or other important paramters changed, restatrt the collector
            if (updates.active !== undefined || updates.location !== undefined || updates.locationType !== undefined
                || updates.interval !== undefined || updates.cronExpression !== undefined
            ) {
                if (this.collectors.has(id)) {
                    this.stopCollector(id);
                }

                if (updateConfig.active) {
                    await this.startCollector(updateConfig);
                }
            }

            logger.info(`Updated collector with ID: ${id}`);
            return updateConfig;
        } catch (error) {
            logger.error(`Failed to update collector: ${error.message}`);
            throw error;
        }
    }


    async deleteCollector(id) {
        try {
            // Stop if running
            if (this.collectors.has(id)) {
                this.stopCollector(id);
            }

            // Delete from PocketBase
            await pocketbaseService.deleteCollectorConfig(id);

            logger.info(`Deleted collector with ID: ${id}`);
            return true;
        } catch (error) {
            logger.error(`Failed to delete collector: ${error.message}`);
            throw error;
        }
    }


    getCollectorStatus(id) {
        const collector = this.collectors.get(id);

        if (!collector) {
            return null;
        }

        return {
            id: collector.config.id,
            location: collector.config.location,
            locationType: collector.config.locationType,
            active: true,
            started: collector.startTime || new Date().toISOString(),
            interval: collector.config.interval || this.defaultInterval,
            cronExpression: collector.config.cronExpression
        };
    }

    getAllCollectors() {
        const collectors = [];

        for (const [id, collector] of this.collectors.entries) {
            collectors.push({
                id,
                localtion: collector.config.location,
                locationtype: collector.config.locationType,
                active: true,
                attributes: collector.config.attributes || [],
                interval: collector.config.interval || this.defaultInterval,
                cronExpression: collector.config.cronExpression
            });

            return collectors;
        }
    }

}

const collectorService = new CollectorService();
module.exports = collectorService;