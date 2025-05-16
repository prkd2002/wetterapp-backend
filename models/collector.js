/**
 * Collector Configuration Model
 * This Class represents a collector configuration stored in PocketBase
 */
class Collector {
    constructor(data) {
        this.id = data.id || null;
        this.name = data.name || '';
        this.location = data.location || '';
        this.locationType = data.locationType || 'city'; // 'city' or 'coordinates'
        this.coordinates = data.coordinates || null; // { lat: number, lon: number }
        this.attributes = data.attributes || []; // array of attributes to collect
        this.interval = data.interval || null; // interval in ms
        this.cronExpression = data.cronExpression || null; // cron expression for scheduling
        this.active = data.active !== undefined ? data.active : true;
        this.created = data.created || new Date().toISOString();
        this.updated = data.updated || new Date().toISOString();
    }

    /**
     * Validate the collectornconfiguration
     * @returns {boolean} True if valid, false otherwise
     */
    isValid() {
        if (!this.location) return false;

        if (this.locationType === 'coordinates') {
            if (!this.coordinates || this.coordinates.lat === undefined || this.coordinates.lon == undefined) {
                return false;
            }
        }

        // Either interval or cronExpression must be presnet
        if (!this.interval && !this.cronExpression) {
            return false;
        }
    }

    /**
     * Convert to a fromat suitable for PocketBase storage
     * @returns {Object} Object ready for PocketBase storage
     * 
     */
    toPocketBaseFormat() {
        const data = {
            location: this.location,
            locationType: this.locationType,
            active: this.active,
            created: this.created,
            updated: new Date().toISOString()
        };

        if (this.name) data.name = this.name;
        if (this.coordinates) data.coordinates = this.coordinates;
        if (this.attributes && this.attributes.length > 0) data.attributes = this.attributes;
        if (this.interval) data.interval = this.interval;
        if (this.cronExpression) data.cronExpression = this.cronExpression;

        return data;
    }

    /**
    * Create a Collector object from PocketBase record
    * @param {Object} record PocketBase record
    * @returns {Collector} Collector instance
    */
    static fromPocketBase(record) {
        return new Collector(record);
    }

}


module.exports = Collector;