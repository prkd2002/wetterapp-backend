const collectorService = require('../services/collectorService');
const logger = require('../utils/logger');

// Get all active collectors
exports.getAllCollectors = async (req, res) => {
    try {
        const collectors = collectorService.getAllCollectors();
        res.status(200).json(collectors);
    } catch (error) {
        logger.error(`Error getting all collectors: ${error.message}`);
        res.status(500).json({ error: 'Failed to get collectors' });
    }
};


// Get a specific collector status
exports.getCollectorStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const collector = collectorService.getCollectorStatus(id);

        if (!collector) {
            return res.status(404).json({ error: 'Collector not found' });
        }
        res.status(200).json(collector);
    } catch (error) {
        logger.error(`Error getting collector status: ${error.message}`);
        res.status(500).json({ error: ' Failed to get collector status' });
    }
};



// Create a new collector
exports.createCollector = async (req, res) => {
    try {
        const collectorConfig = req.body;

        // Validate required fields
        if (!collectorConfig.location) {
            return res.status(400).json({ error: 'Location is required' });
        }

        if (!collectorConfig.locationType) {
            collectorConfig.locationType = 'city';
        }


        if (collectorConfig.locationType === 'coordinates' && (!collectorConfig.coordinates || collectorConfig.coordinates.lat === undefined || collectorConfig.coordinates.lon === undefined)) {
            return res.status(400).json({ error: 'Coordinates (lat, lon) are required for location ytpe "coordinates' });
        }

        const collector = await collectorService.createCollector(collectorConfig);
        res.status(201).json(collector);
    } catch (error) {
        logger.error(`Error creating colector: ${error.message}`);
        res.status(500).json({ error: 'Failed to create collector' });
    }

};



// Update a collector
exports.updateCollector = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        const updatedCollector = await collectorService.updateCollector(id, updates);
        res.status(200).json(updatedCollector);

    } catch (error) {
        logger.error(`Error updating collector: ${error.message}`);
        res.status(500).json({ error: 'Failed to update collector' });
    }
};



// Delete a collector
exports.deleteCollector = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await collectorService.deleteCollector(id);

        if (!result) {
            return res.status(404).json({ error: 'Collector not found' });
        }

        res.status(204).send();
    } catch (error) {
        logger.info(`Error deleting collector: ${error.message}`);
        res.status(500).json({ error: 'Failed to delete collector' });
    }
};


// Start a collector 
exports.startCollector = async (read, res) => {
    try {
        const { id } = req.params;

        // Get the collector config from PocketBase
        const collectorConfig = await require('../services/pocketbaseService').getCollectorConfigById(id);

        if (!collectorConfig) {
            return res.status(404).json({ error: 'collector configuration not found' });
        }

        // Update active status if needed
        if (!collectorConfig.active) {
            await collectorService.updateCollector(id, { active: true });
        }

        // Start the collector
        const collector = await collectorService.startCollector(collectorConfig);

        res.status(200).json(collector);
    } catch (error) {
        logger.info(`Error starting collector: ${error.message}`);
        res.status(500).json({ error: `Failed to start collector` });
    }
};



exports.stopCollector = async (req, res) => {
    try {
        const { id } = req.params;

        // Stop the collector
        const result = collectorService.stopCollector(id);

        if (!result) {
            return res.status(404).json({ error: 'Collector not found or not running' });
        }


        // Update active status in PocketBase
        await collectorService.updateCollector(id, { active: false });

        res.status(200).json({ id, status: 'stopped' });

    } catch (error) {
        logger.error(`Error stopping collector: ${error.message}`);
        res.status(500).json({ error: `Failed tpo stop collector` });
    }
}