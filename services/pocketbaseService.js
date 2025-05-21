const PocketBase = require('pocketbase/cjs');
const config = require('config');
const logger = require('../utils/logger');

class PocketbaseService {
    constructor() {
        this.client = new PocketBase(config.get('pocketbase.url'));
        this.isAuthenticated = false;
        this.init();
    }

    async init() {

        try {



             await this.client.collection('users').authWithPassword(
                config.get('pocketbase.adminEmail'),
                config.get('pocketbase.adminPassword')
            );
            this.isAuthenticated = true;
            logger.info('Successfully authenticated with PocketBase');

        } catch (error) {
            logger.error(`Failed to authenticate with Pocketbase: ${error.message}`);

            // Retry authentication after 5 seconds
            setTimeout(() => this.init(), 5000);
        }


    }

    async createWeatherData(data) {
        try {
            if (!this.isAuthenticated) {
                await this.init();
            }

            const record = await this.client.collection('weather_data').create(data);
            logger.info(`Created weather data recored with ID: ${record.id}`);
            return record;
        } catch (error) {
            logger.error(`Failed to create weather data: ${error.message}`);
            throw error;
        }


    }


    async getWeatherData(filters = {}) {
        try {
            if (!this.isAuthenticated) {
                await this.init();
            }

            let query = '';
            if (filters.location) {
                query = `location = "{filters.location}`;
            }

            if (filters.startDate && filters.endDate) {
                const startTimestamp = new Date(filters.startDate).toISOString();
                const endTimestamp = new Date(filters.endDate).toISOString();

                if (query) {
                    query += `&& timestamp >= "${startTimestamp}" && timestamp <= "${endTimestamp}" `;
                } else {
                    query = `timestamp >= "${startTimestamp}" && timestamp <= "${endTimestamp}"`
                }
            }

            const records = await this.client.collection('weather_data').getList(1, 100, {
                filter: query,
                sort: '-timestamp',
            });
            logger.info(`Retrieved ${records.items.length} weather data records`);
            return records.items;
        } catch (error) {
            logger.error(`Failed to get weather data: ${error.message}`);
            throw error;
        }
    }

    async findWeatherDataByCollectorId(collectorId) {
        try {

            const records = await this.client.collection('weather_data').getFirstListItem(`collector_id="${collectorId}"`)
            logger.info(`Records: ${JSON.stringify(records)}`)
            

            logger.debug(`FOund ${records.totalItems} weather records for collector ID ${collectorId}`);
            if(records){
                return records;
            }else{
                return null;

            }
            
            

        } catch (error) {
            logger.error(`Failed to find weather data for collector ID ${collectorId}: ${error.message}`);
            return null;
        }
    }


    async updateWeatherData(id, update) {
        if (!id) {
            throw new Error('Cannot update weather data: ID is required');
        }
        try {
            // Add updated timestamp
            update.updated = new Date().toISOString();

            const record = await this.client.collection('weather_data').update(id, update);
            logger.info(`Updated weather data with ID ${id}`);
            return record;

        } catch (error) {
            logger.error(`Failed to update weather data with ID ${id}: ${error.message}`);
            throw error;
        }
    }


    async createCollectorConfig(config) {
        try {
            if (!this.isAuthenticated) {
                await this.init();
            }


            const record = await this.client.collection('collector_configs').create(config);
            logger.info(`Created collector config with ID: ${record.id}`);
            return record;
        } catch (error) {
            logger.error(`Failed to create collector config: ${error.message}`);
            throw error;
        }
    }

    async updateCollectorConfig(id, updates) {
        try {
            if (!this.isAuthenticated) {
                await this.init();
            }

            const records = await this.client.collection('collector_configs').update(id, updates);
            logger.info(`Updated collector configs with ID: ${id}`);
            return records;
        } catch (error) {
            logger.error(`Failed to get collector configs: ${error.message}`);
            throw error;
        }
    }


    async getCollectorConfigs() {
        try {
            if (!this.isAuthenticated) {
                await this.init();
            }

            const records = await this.client.collection('collector_configs').getList(1, 100);
            logger.info(`Retrievd ${records.items.length} collector configs`);
            return records.items;
        } catch (error) {
            logger.info(`Failed to get collector configs: ${error.message}`);
            throw error; 
        }
    }

    async getCollectorConfigById(id) {
        try {
            if (!this.isAuthenticated) {
                await this.init();
            }

            const record = await this.client.collection('collector_configs').getOne(id);
            logger.info(`Retrieved colletor config with ID: ${id}`);
            return record;
        } catch (error) {
            logger.info(`Failed to get collector config: ${error.message}`);
            throw error;

        }
    }

    async deleteCollectorConfig(id) {
        try {
            if (!this.isAuthenticated) {
                await this.init();
            }

            await this.client.collection('collector_configs').delete(id);
            logger.info(`Deleted collector config with ID: ${id}`);
            return true;
        } catch (error) {
            logger.error(`Failed to delete collector config: ${error.message}`);
            throw error;
        }
    }


}

const pocketbaseService = new PocketbaseService();
module.exports = pocketbaseService;