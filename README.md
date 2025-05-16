# Weather App Backend
Ein Cloud-Native Microservice für eine WetterApp, der aktuelle Wetterdaten von verschiedenen Standorten abrufen und bereitstellen kann.
# Architektur
Das Backend besteht aus zwei Hauptkomponenten:

- Verwaltungskomponente: Express-Server mit REST-API, der für die Verwaltung und Ausführung der                 Collector-Dienste zuständig ist.
- Collector-Services: Dienste, die in regelmäßigen Abständen Wetterdaten von externen APIs abrufen und in PocketBase speichern.

# Voraussetzungen
- Node.js (v14 oder höher)
- PocketBase (läuft auf http://localhost:8090)
- OpenWeatherMap API-Schlüssel

# Installation

- Klone das Repository:
```bash
git clone https://github.com/yourusername/weather-app-backend.git
```
```bash
cd weather-app-backend
```

- Installiere die Abhängigkeiten:
```bash
npm install
```

- Konfigurationsdatei anpassen:

1-   Kopiere config/default.json.example zu config/default.json
2- Trage deinen OpenWeatherMap API-Schlüssel ein
3- Passe die PocketBase-Konfiguration an


# PocketBase einrichten:

- Lade PocketBase herunter und starte es
- Erstelle einen Admin-Account
- Erstelle die benötigten Sammlungen (siehe unten)


# Starte den Server:
- npm start


# PocketBase-Konfiguration
Sammlungen erstellen

- weather_data:

location (Text): Standort
timestamp (DateTime): Zeitstempel
collector_id (Text): ID des Collectors
temperature (Number): Temperatur in °C
humidity (Number): Luftfeuchtigkeit in %
pressure (Number): Luftdruck in hPa
wind_speed (Number): Windgeschwindigkeit in m/s
wind_direction (Number): Windrichtung in Grad
weather_condition (Text): Wetterzustand
weather_description (Text): Wetterbeschreibung
icon (Text): Icon-Code


- collector_configs:

name (Text): Name des Collectors
location (Text): Name des Standorts
locationType (Text): 'city' oder 'coordinates'
coordinates (JSON): { "lat": number, "lon": number }
attributes (JSON): Array von zu sammelnden Attributen
interval (Number): Intervall in Millisekunden
cronExpression (Text): Cron-Ausdruck für die Planung
active (Boolean): Aktiv/Inaktiv
created (DateTime): Erstellungsdatum
updated (DateTime): Aktualisierungsdatum



API-Endpunkte
Collector-Verwaltung

GET /api/collectors - Alle aktiven Collectors anzeigen
GET /api/collectors/:id - Status eines bestimmten Collectors abrufen
POST /api/collectors - Neuen Collector erstellen
PUT /api/collectors/:id - Collector aktualisieren
DELETE /api/collectors/:id - Collector löschen
POST /api/collectors/:id/start - Collector starten
POST /api/collectors/:id/stop - Collector stoppen

Wetterdaten

GET /api/weather - Wetterdaten mit optionalen Filtern abrufen
GET /api/weather/location/:location - Neueste Wetterdaten für einen bestimmten Standort abrufen
GET /api/weather/collector/:id - Wetterdaten für einen bestimmten Collector abrufen
GET /api/weather/current/:location - Aktuelle Wetterdaten von der externen API abrufen (ohne Speicherung)

Beispiele
Collector erstellen
bashcurl -X POST http://localhost:3000/api/collectors \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Berlin Weather",
    "location": "Berlin",
    "locationType": "city",
    "attributes": ["temperature", "humidity", "pressure"],
    "interval": 900000
  }'
Standort mit Koordinaten erstellen
bashcurl -X POST http://localhost:3000/api/collectors \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Custom Location",
    "location": "My Location",
    "locationType": "coordinates",
    "coordinates": {
      "lat": 52.52,
      "lon": 13.41
    },
    "interval": 3600000
  }'
Aktuelle Wetterdaten abrufen
bashcurl http://localhost:3000/api/weather/current/Berlin
Collector starten/stoppen
bash# Starten
curl -X POST http://localhost:3000/api/collectors/123456/start

# Stoppen
curl -X POST http://localhost:3000/api/collectors/123456/stop
Lizenz
MIT