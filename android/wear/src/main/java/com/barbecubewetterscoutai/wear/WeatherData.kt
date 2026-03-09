package com.barbecubewetterscoutai.wear

data class WeatherData(
    val temperature: Double,
    val apparentTemperature: Double,
    val weatherCode: Int,
    val humidity: Int,
    val windSpeed: Double,
    val tempMax: Double,
    val tempMin: Double,
    val locationName: String = "",
    val precipitation: Double = 0.0,
    val precipitationProbability: Int = 0,
    val dailyForecast: List<DayForecast> = emptyList()
)

data class DayForecast(
    val date: String,
    val weatherCode: Int,
    val tempMax: Double,
    val tempMin: Double,
    val precipitationSum: Double,
    val precipitationProbabilityMax: Int
)

sealed class WeatherUiState {
    object Loading : WeatherUiState()
    data class Success(val data: WeatherData) : WeatherUiState()
    data class Error(val message: String) : WeatherUiState()
    object NoPermission : WeatherUiState()
}
