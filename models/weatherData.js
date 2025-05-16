/**
 * Weather Data Model
 * This class represents the weather data structure stored in PocketBase
 */
class WeatherData {
    constructor(data) {
        this.id = data.id || null;
        this.collector_id = data.collector_id || null;
        this.location = data.location || '';
        this.timestamp = data.timestamp || new Date().toISOString();
        this.coordinates = data.coordinates || null;
        this.temperature = data.temperature !== undefined ? data.temperature : null;
        this.humidity = data.humidity !== undefined ? data.humidity : null;
        this.pressure = data.pressure !== undefined ? data.pressure : null;
        this.wind_speed = data.wind_speed !== undefined ? data.wind_speed : null;
        this.wind_direction = data.wind_direction !== undefined ? data.wind_direction : null;
        this.weather_condition = data.weather_condition || null;
        this.weather_description = data.weather_description || null;
        this.icon = data.icon || null;
    }
    /**
     * Validate tzhe weather data object
     * @returns{boolean} True if valid, false otherwise
     */
    isValid() {
        return (
            this.location &&
            this.timestamp &&
            (
                this.temperature !== null ||
                this.humidity !== null ||
                this.pressure !== null ||
                this.wind_speed !== null ||
                this.weather_condition !== null
            )
        );

    }


    /**
     * Convert to a format suitable for PocketBase storage
     * @returns {object} Object ready for PocketBase storage
     */
    toPocketBaseFormat() {
        const data = {
            location: this.location,
            timestamp: this.timestamp
        };

        if (this.collector_id) data.collector_id = this.collector_id;
        if (this.coordinates) data.coordinates = this.coordinates;
        if (this.temperature !== null) data.temperature = this.temperature;
        if (this.humidity !== null) data.humidity = this.humidity;
        if (this.pressure !== null) data.pressure = this.pressure;
        if (this.wind_speed !== null) data.wind_speed = this.wind_speed;
        if (this.wind_direction !== null) data.wind_direction = this.wind_direction;
        if (this.weather_condition) data.weather_condition = this.weather_condition;
        if (this.weather_description) data.weather_description = this.weather_description;
        if (this.icon) data.icon = this.icon;

        return data;
    }


    /**
     * Create a WeatherData object from PocketBase record
     * @param {Object} record PocketBase record
     * @returns  {WeatherData} WeatherData instance
     */
    static fromPocketBase(record){
        return new WeatherData(record);
    }

}

module.exports = WeatherData;
