package com.barbecubewetterscoutai.wear

import android.annotation.SuppressLint
import android.app.Application
import android.location.Location
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.google.android.gms.location.LocationServices
import com.google.android.gms.location.Priority
import com.google.android.gms.tasks.CancellationTokenSource
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch
import kotlinx.coroutines.tasks.await
import kotlinx.coroutines.withTimeoutOrNull

class WeatherViewModel(application: Application) : AndroidViewModel(application) {

    private val _uiState = MutableStateFlow<WeatherUiState>(WeatherUiState.Loading)
    val uiState: StateFlow<WeatherUiState> = _uiState

    companion object {
        private const val BALANCED_ACCURACY_TIMEOUT_MS = 15_000L
        private const val HIGH_ACCURACY_TIMEOUT_MS = 20_000L
    }

    private val fusedLocationClient =
        LocationServices.getFusedLocationProviderClient(application)

    /** Called once location permission has been granted. */
    @SuppressLint("MissingPermission")
    fun loadWeather() {
        _uiState.value = WeatherUiState.Loading
        viewModelScope.launch {
            try {
                val location: Location? = resolveLocation()

                if (location == null) {
                    _uiState.value = WeatherUiState.Error(
                        "Standort nicht verfügbar.\nBitte GPS aktivieren und erneut versuchen."
                    )
                    return@launch
                }

                val lat = location.latitude
                val lon = location.longitude

                // Fetch weather data and location name in parallel would need async/await;
                // sequentially is fine for a watch where simplicity matters.
                val weatherData = WeatherRepository.fetchWeather(lat, lon)
                val locationName = WeatherRepository.fetchLocationName(lat, lon)

                _uiState.value = WeatherUiState.Success(weatherData.copy(locationName = locationName))
            } catch (e: Exception) {
                _uiState.value = WeatherUiState.Error(e.message ?: "Fehler beim Laden")
            }
        }
    }

    /**
     * Resolves the current location using a three-step fallback strategy:
     * 1. Last known location (instant, no battery cost).
     * 2. getCurrentLocation with BALANCED_POWER_ACCURACY (uses network/Wi-Fi).
     * 3. getCurrentLocation with HIGH_ACCURACY (activates GPS – needed on many Wear OS devices).
     *
     * Each getCurrentLocation call is wrapped in a timeout so the app never hangs.
     */
    @SuppressLint("MissingPermission")
    private suspend fun resolveLocation(): Location? {
        // 1. Last known location – fast and free.
        fusedLocationClient.lastLocation.await()?.let { return it }

        // 2. Balanced accuracy (network / Wi-Fi).
        val balancedAccuracyCts = CancellationTokenSource()
        val balanced = withTimeoutOrNull(BALANCED_ACCURACY_TIMEOUT_MS) {
            try {
                fusedLocationClient
                    .getCurrentLocation(Priority.PRIORITY_BALANCED_POWER_ACCURACY, balancedAccuracyCts.token)
                    .await()
            } finally {
                balancedAccuracyCts.cancel()
            }
        }
        if (balanced != null) return balanced

        // 3. High accuracy (GPS) – fallback for Wear OS devices without a cached location.
        val highAccuracyCts = CancellationTokenSource()
        return withTimeoutOrNull(HIGH_ACCURACY_TIMEOUT_MS) {
            try {
                fusedLocationClient
                    .getCurrentLocation(Priority.PRIORITY_HIGH_ACCURACY, highAccuracyCts.token)
                    .await()
            } finally {
                highAccuracyCts.cancel()
            }
        }
    }

    /** Called when the user explicitly requests a refresh. */
    fun refresh() = loadWeather()

    /** Called when location permission has been permanently denied. */
    fun setNoPermission() {
        _uiState.value = WeatherUiState.NoPermission
    }
}
