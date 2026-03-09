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

class WeatherViewModel(application: Application) : AndroidViewModel(application) {

    private val _uiState = MutableStateFlow<WeatherUiState>(WeatherUiState.Loading)
    val uiState: StateFlow<WeatherUiState> = _uiState

    private val fusedLocationClient =
        LocationServices.getFusedLocationProviderClient(application)

    /** Called once location permission has been granted. */
    @SuppressLint("MissingPermission")
    fun loadWeather() {
        _uiState.value = WeatherUiState.Loading
        viewModelScope.launch {
            try {
                // Try last known location first; fall back to a fresh current-location request.
                val location: Location? = fusedLocationClient.lastLocation.await()
                    ?: run {
                        val cts = CancellationTokenSource()
                        try {
                            fusedLocationClient
                                .getCurrentLocation(Priority.PRIORITY_BALANCED_POWER_ACCURACY, cts.token)
                                .await()
                        } finally {
                            cts.cancel()
                        }
                    }

                if (location == null) {
                    _uiState.value = WeatherUiState.Error("Standort nicht verfügbar")
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

    /** Called when the user explicitly requests a refresh. */
    fun refresh() = loadWeather()

    /** Called when location permission has been permanently denied. */
    fun setNoPermission() {
        _uiState.value = WeatherUiState.NoPermission
    }
}
