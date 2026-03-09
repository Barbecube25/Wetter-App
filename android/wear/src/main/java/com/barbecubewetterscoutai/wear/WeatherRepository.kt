package com.barbecubewetterscoutai.wear

import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import org.json.JSONObject
import java.net.HttpURLConnection
import java.net.URL

object WeatherRepository {

    /**
     * Fetches today's weather summary from the Open-Meteo API for the given coordinates.
     * Runs on the IO dispatcher.
     */
    suspend fun fetchWeather(lat: Double, lon: Double): WeatherData = withContext(Dispatchers.IO) {
        val url = buildUrl(lat, lon)
        val json = getJson(url)
        parseWeather(json)
    }

    /**
     * Reverse-geocodes coordinates to a city name using the Open-Meteo geocoding API.
     * Returns an empty string on failure.
     */
    suspend fun fetchLocationName(lat: Double, lon: Double): String = withContext(Dispatchers.IO) {
        try {
            val url = "https://nominatim.openstreetmap.org/reverse?lat=$lat&lon=$lon&format=json&zoom=10"
            val json = getJson(url)
            // city > town > village > county as fallback chain
            val addr = json.optJSONObject("address")
            addr?.let {
                it.optString("city").takeIf { s -> s.isNotEmpty() }
                    ?: it.optString("town").takeIf { s -> s.isNotEmpty() }
                    ?: it.optString("village").takeIf { s -> s.isNotEmpty() }
                    ?: it.optString("county").takeIf { s -> s.isNotEmpty() }
                    ?: ""
            } ?: ""
        } catch (e: Exception) {
            ""
        }
    }

    // ------------------------------------------------------------------
    // Private helpers
    // ------------------------------------------------------------------

    private fun buildUrl(lat: Double, lon: Double): String {
        return "https://api.open-meteo.com/v1/forecast" +
            "?latitude=$lat&longitude=$lon" +
            "&current=temperature_2m,apparent_temperature,weathercode," +
            "relative_humidity_2m,wind_speed_10m" +
            "&daily=temperature_2m_max,temperature_2m_min" +
            "&models=icon_seamless" +
            "&timezone=auto" +
            "&forecast_days=1"
    }

    private fun getJson(urlString: String): JSONObject {
        val connection = (URL(urlString).openConnection() as HttpURLConnection).also {
            it.requestMethod = "GET"
            it.connectTimeout = 10_000
            it.readTimeout = 10_000
            it.setRequestProperty("User-Agent", "WetterScoutAI-WearOS/1.0 (https://github.com/Barbecube25/Wetter-App)")
        }
        val responseCode = connection.responseCode
        if (responseCode != HttpURLConnection.HTTP_OK) {
            throw Exception("HTTP $responseCode")
        }
        val body = connection.inputStream.bufferedReader().readText()
        return JSONObject(body)
    }

    private fun parseWeather(json: JSONObject): WeatherData {
        val current = json.getJSONObject("current")
        val daily = json.getJSONObject("daily")

        val temperature = current.getDouble("temperature_2m")
        val apparentTemperature = current.getDouble("apparent_temperature")
        val weatherCode = current.getInt("weathercode")
        val humidity = current.getInt("relative_humidity_2m")
        val windSpeed = current.getDouble("wind_speed_10m")

        // daily arrays contain one entry (forecast_days=1)
        val maxArray = daily.getJSONArray("temperature_2m_max")
        val minArray = daily.getJSONArray("temperature_2m_min")
        val tempMax = maxArray.getDouble(0)
        val tempMin = minArray.getDouble(0)

        return WeatherData(
            temperature = temperature,
            apparentTemperature = apparentTemperature,
            weatherCode = weatherCode,
            humidity = humidity,
            windSpeed = windSpeed,
            tempMax = tempMax,
            tempMin = tempMin
        )
    }
}
